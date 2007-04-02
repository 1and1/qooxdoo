#!/usr/bin/env python
################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2007 1&1 Internet AG, Germany, http://www.1and1.org
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Andreas Ecker (ecker)
#    * Fabian Jakobs (fjakobs)
#
################################################################################

import sys, os, re, optparse
import tree, treegenerator, tokenizer, comment
from treeutil import *



########################################################################################
#
#  MAIN
#
########################################################################################

class DocException (Exception):
    def __init__ (self, msg, syntaxItem):
        Exception.__init__(self, msg)
        self.node = syntaxItem


def findQxDefine(rootNode):
    if rootNode.type == "variable":
        try:
            variableName = assembleVariable(rootNode)
        except tree.NodeAccessException:
            return None

        if variableName in ["qx.Class.define", "qx.Interface.define", "qx.Mixin.define"]:
            if rootNode.parent.parent.type == "call" and rootNode.parent.type == "operand":
                return rootNode.parent.parent

    if rootNode.hasChildren():
        for child in rootNode.children:
            foundNode = findQxDefine(child)
            if foundNode is not None:
                return foundNode
    else:
        return None


def createDoc(syntaxTree, docTree = None):
    try:
        if not docTree:
            docTree = tree.Node("doctree")

        defineNode = findQxDefine(syntaxTree)
        if defineNode != None:
            variant = selectNode(defineNode, "operand/variable/2/@name").lower()
            handleClassDefinition(docTree, defineNode, variant)

        else:
            # try old style class definition of no new style class could be found
            docTree = createDocOld(syntaxTree, docTree)

    except DocException:
        exc = sys.exc_info()[1]
        msg = ""

        if hasattr(exc, "node"):
            (line, column) = getLineAndColumnFromSyntaxItem(exc.node)
            file = getFileFromSyntaxItem(exc.node)
            if line != None or file != None:
                msg = (
                    str(exc) + "\n      " + str(file) +
                    ", Line: " + str(line) + ", Column: " + str(column)
                )

        if msg == "":
            raise exc

        else:
            print
            print "    - Failed: %s" % msg
            sys.exit(1)

    return docTree


########################################################################################
#
#  COMPATIBLE TO 0.7 STYLE ONLY!
#
########################################################################################

def handleClassDefinition(docTree, item, variant):
    params = item.getChild("params")
    className = params.children[0].get("value")

    if len(params.children) > 1:
        classMap = params.children[1]
    else:
        classMap = {}

    commentAttributes = comment.parseNode(item)

    classNode = getClassNode(docTree, className, commentAttributes)
    if variant in ["class", "clazz"]:
        classNode.set("type", "class")
        type = selectNode(params, "2/keyvalue[@key='type']/value/constant/@value")
        if type == "singleton":
            classNode.set("isSingleton", True)
        elif type == "abstract":
            classNode.set("isAbstract", True)

    else:
        classNode.set("type", variant)

    handleDeprecated(classNode, commentAttributes)
    handleInternal(classNode, commentAttributes)
    handleAppearance(item, classNode, className, commentAttributes)

    try:
        children = classMap.children
    except AttributeError:
        return

    for keyvalueItem in children:
        key = keyvalueItem.get("key")
        valueItem = keyvalueItem.getChild("value").getFirstChild()

        # print "KEY: %s = %s" % (key, valueItem.type)

        if key == "extend":
            if variant in ["class", "clazz"]:
                handleClassExtend(valueItem, classNode, docTree, className)

            elif variant == "interface":
                handleInterfaceExtend(valueItem, classNode, docTree, className)

        elif key == "include":
            handleMixins(valueItem, classNode, docTree, className)

        elif key == "implement":
            handleInterfaces(valueItem, classNode, docTree)

        elif key == "construct":
            handleConstructor(valueItem, classNode)

        elif key == "statics":
            handleStatics(valueItem, classNode)

        elif key == "properties":
        	handleProperties(valueItem, classNode)

        elif key == "members":
            handleMembers(valueItem, classNode)

        elif key == "events":
            handleEvents(valueItem, classNode)

    handleSingleton(classNode, docTree)


def handleClassExtend(valueItem, classNode, docTree, className):
    superClassName = assembleVariable(valueItem)
    if superClassName not in [
                              "Array", "Boolean", "Date", "Error",
                              "Function", "Math", "Number",
                              "Object", "RegExp", "String"
                             ]:
        superClassNode = getClassNode(docTree, superClassName)
        childClasses = superClassNode.get("childClasses", False)

        if childClasses:
            childClasses += "," + className
        else:
            childClasses = className

        superClassNode.set("childClasses", childClasses)
        classNode.set("superClass", superClassName)


def handleInterfaceExtend(valueItem, classNode, docTree, className):
    superInterfaceNames = variableOrArrayNodeToArray(valueItem)

    for superInterface in superInterfaceNames:
        superInterfaceNode = getClassNode(docTree, superInterface)
        childInterfaces = superInterfaceNode.get("interfaces", False)

        if childInterfaces:
            childInterfaces += "," + className
        else:
            childInterfaces = className

        superInterfaceNode.set("childClasses", childInterfaces)

        node = tree.Node("interface");
        node.set("name", superInterface)
        classNode.addListChild("superInterfaces", node)


def handleMixins(item, classNode, docTree, className):
    if classNode.get("type", False) == "mixin":
        superMixinNames = variableOrArrayNodeToArray(item)
        for superMixin in superMixinNames:
            superMixinNode = getClassNode(docTree, superMixin)
            childMixins = superMixinNode.get("mixins", False)

            if childMixins:
                childMixins += "," + className
            else:
                childMixins = className

            superMixinNode.set("childClasses", childMixins)

            node = tree.Node("interface");
            node.set("name", superMixin)
            classNode.addListChild("superMixins", node)

    else:
        mixins = variableOrArrayNodeToArray(item)
        for mixin in mixins:
            mixinNode = getClassNode(docTree, mixin)
            includer = mixinNode.get("includer", False)
            if includer:
                includer += "," + className
            else:
                includer = className
            mixinNode.set("includer", includer)

        classNode.set("mixins", ",".join(mixins))


def handleSingleton(classNode, docTree):
    if classNode.get("isSingleton", False) == True:
        className = classNode.get("fullName")
        functionCode = """/**
 * Returns a singleton instance of this class. On the first call the class
 * is instantiated by calling the constructor with no arguments. All following
 * calls will return this instance.
 *
 * This method has been added by setting the "type" key in the class definition
 * ({@link qx.Class#define}) to "singleton".
 *
 * @type static
 * @return {%s} The singleton instance of this class.
 */
function() {}""" % className

        node = compileString(functionCode)
        commentAttributes = comment.parseNode(node)
        docNode = handleFunction(node, commentAttributes, classNode)

        docNode.set("name", "getInstance")
        docNode.set("isStatic", True)
        classNode.addListChild("methods-static", docNode)


def handleInterfaces(item, classNode, docTree):
    className = classNode.get("fullName")
    interfaces = variableOrArrayNodeToArray(item)
    for interface in interfaces:
        interfaceNode = getClassNode(docTree, interface)
        impl = interfaceNode.get("implementations", False)
        if impl:
            impl += "," + className
        else:
            impl = className
        interfaceNode.set("implementations", impl)

    classNode.set("interfaces", ",".join(interfaces))


def handleConstructor(ctorItem, classNode):
    if ctorItem and ctorItem.type == "function":
        commentAttributes = comment.parseNode(ctorItem.parent.parent)
        ctor = handleFunction(ctorItem, commentAttributes, classNode)
        removeErrors(ctor)
        ctor.set("isCtor", True)
        classNode.addListChild("constructor", ctor)

        # Check for methods defined in the constructor
        # (for method definition style that supports real private methods)
        ctorBlock = ctorItem.getChild("body").getChild("block")

        if ctorBlock.hasChildren():
            for item in ctorBlock.children:
                if item.type == "assignment":
                    leftItem = item.getFirstListChild("left")
                    rightItem = item.getFirstListChild("right")

                    # It's a method definition
                    if (
                        leftItem.type == "variable" and
                        len(leftItem.children) == 2 and
                        (
                             leftItem.children[0].get("name") == "this" or
                             leftItem.children[0].get("name") == "self"
                        ) and
                        rightItem.type == "function"
                    ):
                        handleMethodDefinitionOld(item, False, classNode)


def handleStatics(item, classNode):
    if item.hasChildren():
        for keyvalue in item.children:
            key = keyvalue.get("key")

#            # ignore private statics
#            if key.startswith("__"):
#                continue

            value = keyvalue.getFirstChild(True, True).getFirstChild(True, True)
            commentAttributes = comment.parseNode(keyvalue)

            # handle @signature
            if value.type != "function":
                for docItem in commentAttributes:
                    if docItem["category"] == "signature":
                        value = compileString(docItem["text"][3:-4] + "{}")

            # Function
            if value.type == "function":
                node = handleFunction(value, commentAttributes, classNode)
                node.set("name", key)
                node.set("isStatic", True)
                if classNode.get("type", False) == "mixin":
                    node.set("isMixin", True)

                classNode.addListChild("methods-static", node)


            # Constant
            elif key.isupper():
                handleConstantDefinition(keyvalue, classNode)


def handleMembers(item, classNode):
    if item.hasChildren():
        for keyvalue in item.children:
            if keyvalue.type != "keyvalue":
                continue

            key = keyvalue.get("key")

#            # ignore private statics
#            if key.startswith("__"):
#                continue

            value = keyvalue.getFirstChild(True, True).getFirstChild(True, True)
            commentAttributes = comment.parseNode(keyvalue)

            # handle @signature
            if value.type != "function":
                for docItem in commentAttributes:
                    if docItem["category"] == "signature":
                        value = compileString(docItem["text"][3:-4] + "{}")

            if value.type == "function":
                node = handleFunction(value, commentAttributes, classNode)
                node.set("name", key)
                if classNode.get("type", False) == "mixin":
                    node.set("isMixin", True)

                classNode.addListChild("methods", node)


def generatePropertyMethods(propertyName, classNode, checkBasic, inheritable, nullable):

    if propertyName[:2] == "__":
        access = "__"
        name = propertyName[2:]
    elif propertyName[:1] == "_":
        access = "_"
        name = propertyName[1:]
    else:
        access = ""
        name = propertyName

    name = name[0].upper() + name[1:]

    propData = {
        access + "set" + name : """/**
 * Sets the user value of the property <code>%s</code>.
 *
 * For further details take a look at the property definition: {@link #%s}.
 *
 * @param value {var} New value for property <code>%s</code>.
 * @return {var} The unmodified incoming value.
 */
 function (value) {}; """ % (propertyName, propertyName, propertyName),

       access + "get" + name : """/**
 * Returns the (computed) value of the property <code>%s</code>.
 *
 * For further details take a look at the property definition: {@link #%s}.
 *
 * @return {var} (Computed) value of <code>%s</code>.
 */
 function () {}; """ % (propertyName, propertyName, propertyName),

       access + "reset" + name : """/**
 * Resets the user value of the property <code>%s</code>.
 *
 * The computed value falls back to the next available value e.g. appearance, init or
 * inheritance value depeneding on the property configuration and value availability.
 *
 * For further details take a look at the property definition: {@link #%s}.
 *
 * @return {void}
 */
 function () {}; """ % (propertyName, propertyName),

       access + "init" + name : """/**
 * Calls the apply method and dispatches the change event of the property <code>%s</code>
 * with the default value defined by the class developer. This function can
 * only be called from the constructor of a class.
 *
 * For further details take a look at the property definition: {@link #%s}.
 *
 * @param value {var} Initial value for property <code>%s</code>.
 * @return {var} the default value
 */
 function (value) {}; """ % (propertyName, propertyName, propertyName)
    }

    if checkBasic == "Boolean":
       propData[access + "toggle" + name] = """/**
 * Toggles the (computed) value of the boolean property <code>%s</code>.
 *
 * For further details take a look at the property definition: {@link #%s}.
 *
 * @return {Boolean} the new value
 */
 function () {}; """ % (propertyName, propertyName)

    for funcName in propData.keys():
        functionCode = propData[funcName]
        node = compileString(functionCode)
        commentAttributes = comment.parseNode(node)
        docNode = handleFunction(node, commentAttributes, classNode)
        docNode.set("name", funcName)
        docNode.set("fromProperty", propertyName)
        classNode.addListChild("methods", docNode)


def handleProperties(item, classNode):
    if item.hasChildren():
        for keyvalue in item.children:
            propName = keyvalue.get("key")
            value = keyvalue.getFirstChild(True, True).getFirstChild(True, True)
            # print "  - Found Property: %s" % key

            if value.type != "map":
                continue

            propDefinition = mapNodeToMap(value)
            #print propName, propDefinition

            # handle old style properties
            if propDefinition.has_key("_legacy") or propDefinition.has_key("_fast") or propDefinition.has_key("_cached"):
                handlePropertyDefinitionOldCommon(keyvalue, classNode, propName, value)
                continue

            node = tree.Node("property")
            node.set("name", propName)

            if propDefinition.has_key("init"):
                node.set("defaultValue", getValue(propDefinition["init"].getFirstChild()))

            if propDefinition.has_key("nullable"):
                node.set("allowNull", propDefinition["nullable"].getChild("constant").get("value"))

            if propDefinition.has_key("inheritable"):
                node.set("inheritable", propDefinition["inheritable"].getChild("constant").get("value"))

            if propDefinition.has_key("appearance"):
                node.set("appearance", propDefinition["appearance"].getChild("constant").get("value"))

            if propDefinition.has_key("apply"):
                node.set("apply", propDefinition["apply"].getChild("constant").get("value"))

            if propDefinition.has_key("event"):
                eventName = propDefinition["event"].getChild("constant").get("value")
                node.set("event", eventName)
                event = tree.Node("event")
                event.set("name", eventName)
                event.addChild(tree.Node("desc").set("text", "Fired on change of the property {@link #%s}." % propName))

                typesNode = tree.Node("types")
                event.addChild(typesNode)
                itemNode = tree.Node("entry")
                typesNode.addChild(itemNode)
                itemNode.set("type", "qx.event.type.ChangeEvent")
                classNode.addListChild("events", event)

            createToggle = False
            checkBasic = None
            if propDefinition.has_key("check"):
                check = propDefinition["check"].getFirstChild()
                if check.type == "array":
                    values = [getValue(arrayItem) for arrayItem in check.children]
                    node.set("possibleValues", ", ".join(values))
                elif check.type == "function":
                    node.set("check", "Custom check function.")
                elif check.type == "constant":
                    node.set("check", check.get("value"))
                    checkBasic = check.get("value")
                else:
                    raise DocException("Unknown check value", check)

            if classNode.get("type", False) == "mixin":
                node.set("isMixin", True)

            # If the description has a type specified then take this type
            # (and not the one extracted from the paramsMap)
            commentAttributes = comment.parseNode(keyvalue)
            addTypeInfo(node, comment.getAttrib(commentAttributes, "description"), item)
            handleDeprecated(node, commentAttributes)
            handleInternal(node, commentAttributes)

            classNode.addListChild("properties", node)

            generatePropertyMethods(propName, classNode, checkBasic,
              propDefinition.has_key("inheritable"), propDefinition.has_key("nullable"))


def handleEvents(item, classNode):
    if item.hasChildren():
        for keyvalue in item.children:
            if keyvalue.type != "keyvalue":
                continue

            node = tree.Node("event")

            key = keyvalue.get("key")
            value = keyvalue.getFirstChild(True, True).getFirstChild(True, True).get("value")
            commentAttributes = comment.parseNode(keyvalue)
            try:
                desc = commentAttributes[0]["text"]
            except (IndexError, KeyError):
                desc = None
                addError(node, "Documentation is missing.", item)

            if desc != None:
                node.addChild(tree.Node("desc").set("text", desc))

            node.set("name", key)

            typesNode = tree.Node("types")
            node.addChild(typesNode)
            itemNode = tree.Node("entry")
            typesNode.addChild(itemNode)
            itemNode.set("type", value)

            handleDeprecated(node, commentAttributes)
            handleInternal(node, commentAttributes)

            classNode.addListChild("events", node)


def handleAppearance(item, classNode, className, commentAttributes):
    """
    handles the declaration of appearances and widget states
    by evaluating the @state and @apprearance attributes
    """
    appearances = {}
    thisAppearance = []
    classAppearance = None

    # parse appearances
    for attrib in commentAttributes:
        if attrib["category"] == "appearance":
            appearanceName = attrib["name"]
            appearances[appearanceName] = attrib
            if not attrib.has_key("type"):
                attrib["type"] = className
            else:
                attrib["type"] = attrib["type"][0]["type"]
            if attrib["type"] == className:
                thisAppearance.append(appearanceName)
            attrib["states"] = []

    if len(thisAppearance) > 1:
        raise DocException("The class '%s' has more than one own appearance!" % className, item)

    # parse states
    for attrib in commentAttributes:
        if attrib["category"] == "state":
            if not attrib.has_key("type"):
                if thisAppearance == []:
                    raise DocException(
                       "The default state '%s' of the class '%s' is defined but no default appearance is defined"
                       % (attrib["name"], className), item
                    )
                type = thisAppearance[0]
            else:
                type = attrib["type"][0]["type"]

            appearances[type]["states"].append(attrib)

    #generate the doc tree nodes
    if len(appearances) > 0:
        for name, appearance in appearances.iteritems():
            appearanceNode = tree.Node("appearance")
            appearanceNode.set("name", name)
            appearanceNode.set("type", appearance["type"])

            if appearance.has_key("text"):
                appearanceNode.addChild(tree.Node("desc").set("text", appearance["text"]))

            for state in appearance["states"]:
                stateNode = tree.Node("state")
                stateNode.set("name", state["name"])
                if state.has_key("text"):
                    stateNode.addChild(tree.Node("desc").set("text", state["text"]))
                appearanceNode.addListChild("states", stateNode)

            classNode.addListChild("appearances", appearanceNode)


def handleDeprecated(docNode, commentAttributes):
    for docItem in commentAttributes:
        if docItem["category"] == "deprecated":
            deprecatedNode = tree.Node("deprecated")
            if docItem.has_key("text"):
                descNode = tree.Node("desc").set("text", docItem["text"])
                deprecatedNode.addChild(descNode)
            docNode.addChild(deprecatedNode)


def handleInternal(docNode, commentAttributes):
    for docItem in commentAttributes:
        if docItem["category"] == "internal":
            docNode.set("isInternal", True)

########################################################################################
#
#  COMPATIBLE TO 0.6 STYLE ONLY!
#
########################################################################################

def createDocOld(syntaxTree, docTree = None):

    try:
        currClassNode = None
        if not syntaxTree.hasChildren():
            return docTree

        for item in syntaxTree.children:
            if item.type == "assignment":
                leftItem = item.getFirstListChild("left")
                rightItem = item.getFirstListChild("right")
                if leftItem.type == "variable":
                    if (
                        currClassNode and len(leftItem.children) == 3 and
                        leftItem.children[0].get("name") == "qx"
                       ):

                        if (
                            leftItem.children[1].get("name") == "Proto" and
                            rightItem.type == "function"
                           ):
                            # It's a method definition
                            handleMethodDefinitionOld(item, False, currClassNode)

                        elif leftItem.children[1].get("name") == "Clazz":
                            if rightItem.type == "function":
                                handleMethodDefinitionOld(item, True, currClassNode)

                            elif leftItem.children[2].get("name").isupper():
                                handleConstantDefinition(item, currClassNode)

                    elif (
                          currClassNode and
                          assembleVariable(leftItem).startswith(currClassNode.get("fullName"))
                         ):
                        # This is definition of the type "mypackage.MyClass.bla = ..."
                        if rightItem.type == "function":
                            handleMethodDefinitionOld(item, True, currClassNode)

                        elif leftItem.children[len(leftItem.children) - 1].get("name").isupper():
                            handleConstantDefinition(item, currClassNode)

            elif item.type == "call":
                operand = item.getChild("operand", False)
                if operand:
                    var = operand.getChild("variable", False)

                    # qooxdoo < 0.7 (DEPRECATED)
                    if var and len(var.children) == 3 and var.children[0].get("name") == "qx" and var.children[1].get("name") == "OO":
                        methodName = var.children[2].get("name")

                        if methodName == "defineClass":
                            currClassNode = handleClassDefinitionOld(docTree, item)

                        elif methodName in ["addProperty", "addFastProperty"]:
                            # these are private and should be marked if listed, otherwise just hide them (wpbasti)
                            #or methodName == "addCachedProperty" or methodName == "changeProperty":
                            handlePropertyDefinitionOld(item, currClassNode)

    except DocException:
        exc = sys.exc_info()[1]
        msg = ""

        if hasattr(exc, "node"):
            (line, column) = getLineAndColumnFromSyntaxItem(exc.node)
            file = getFileFromSyntaxItem(exc.node)
            if line != None or file != None:
                msg = (
                    str(exc) + "\n      " + str(file) +
                    ", Line: " + str(line) + ", Column: " + str(column)
                )

        if msg == "":
            raise exc

        else:
            print
            print "    - Failed: %s" % msg
            sys.exit(1)

    return docTree


def handleClassDefinitionOld(docTree, item):
    params = item.getChild("params")

    paramsLen = len(params.children);
    if paramsLen == 1:
        superClassName = "Object"
        ctorItem = None
    elif paramsLen == 2:
        superClassName = "Object"
        ctorItem = params.children[1]
    elif paramsLen == 3:
        superClassName = assembleVariable(params.children[1])
        ctorItem = params.children[2]
    else:
        raise DocException("defineClass call has more than three parameters: " + str(len(params.children)), item)

    className = params.children[0].get("value")
    classNode = getClassNode(docTree, className)

    if superClassName != "Object":
        superClassNode = getClassNode(docTree, superClassName)
        childClasses = superClassNode.get("childClasses", False)
        if childClasses:
            childClasses += "," + className
        else:
            childClasses = className
        superClassNode.set("childClasses", childClasses)

        classNode.set("superClass", superClassName)

    commentAttributes = comment.parseNode(item)

    for attrib in commentAttributes:
        if attrib["category"] == "event":
            # Add the event
            if comment.attribHas(attrib, "name") and comment.attribHas(attrib, "type"):
                addEventNode(classNode, item, attrib);
            else:
                addError(classNode, "Documentation contains malformed event attribute.", item)
        elif attrib["category"] == "description":
            if attrib.has_key("text"):
                descNode = tree.Node("desc").set("text", attrib["text"])
                classNode.addChild(descNode)

    # Add the constructor
    if ctorItem and ctorItem.type == "function":
        ctor = handleFunction(ctorItem, commentAttributes, classNode)
        ctor.set("isCtor", True)
        classNode.addListChild("constructor", ctor)

        # Check for methods defined in the constructor
        # (for method definition style that supports real private methods)
        ctorBlock = ctorItem.getChild("body").getChild("block")

        if ctorBlock.hasChildren():
            for item in ctorBlock.children:
                if item.type == "assignment":
                    leftItem = item.getFirstListChild("left")
                    rightItem = item.getFirstListChild("right")

                    # It's a method definition
                    if (
                        leftItem.type == "variable" and
                        len(leftItem.children) == 2 and
                        (
                             leftItem.children[0].get("name") == "this" or
                             leftItem.children[0].get("name") == "self"
                        ) and
                        rightItem.type == "function"
                    ):
                        handleMethodDefinitionOld(item, False, classNode)

    elif ctorItem and ctorItem.type == "map":
        for keyvalueItem in ctorItem.children:
            if keyvalueItem.type == "keyvalue":
                valueItem = keyvalueItem.getChild("value").getFirstChild()
                if (valueItem.type == "function"):
                    handleMethodDefinitionOld(keyvalueItem, True, classNode)
                else:
                    handleConstantDefinition(keyvalueItem, classNode)

    return classNode


def handlePropertyDefinitionOld(item, classNode):
    paramsMap = item.getChild("params").getChild("map")
    propertyName = paramsMap.getChildByAttribute("key", "name").getChild("value").getChild("constant").get("value")

    handlePropertyDefinitionOldCommon(item, classNode, propertyName, paramsMap)


def handlePropertyDefinitionOldCommon(item, classNode, propertyName, paramsMap):
    node = tree.Node("property")
    node.set("name", propertyName)
    node.set("oldProperty", True)

    propType = paramsMap.getChildByAttribute("key", "type", False)
    if propType:
        node.set("type", getType(propType.getChild("value").getFirstChild()))

    allowNull = paramsMap.getChildByAttribute("key", "allowNull", False)
    if allowNull:
        node.set("allowNull", allowNull.getChild("value").getChild("constant").get("value"))

    defaultValue = paramsMap.getChildByAttribute("key", "defaultValue", False)
    if defaultValue:
        node.set("defaultValue", getValue(defaultValue.getFirstListChild("value")))

    getAlias = paramsMap.getChildByAttribute("key", "getAlias", False)
    if getAlias:
        node.set("getAlias", getAlias.getChild("value").getChild("constant").get("value"))

    setAlias = paramsMap.getChildByAttribute("key", "setAlias", False)
    if setAlias:
        node.set("setAlias", setAlias.getChild("value").getChild("constant").get("value"))

    unitDetection = paramsMap.getChildByAttribute("key", "unitDetection", False)
    if unitDetection:
        node.set("unitDetection", unitDetection.getChild("value").getChild("constant").get("value"))

    instance = paramsMap.getChildByAttribute("key", "instance", False)
    if instance:
        node.set("instance", instance.getChild("value").getChild("constant").get("value"))

    classname = paramsMap.getChildByAttribute("key", "classname", False)
    if classname:
        node.set("classname", classname.getChild("value").getChild("constant").get("value"))

    possibleValues = paramsMap.getChildByAttribute("key", "possibleValues", False)
    if possibleValues:
        array = possibleValues.getChild("value").getChild("array")
        values = ""
        for arrayItem in array.children:
            if len(values) != 0:
                values += ", "
            values += getValue(arrayItem)
        node.set("possibleValues", values)

    if classNode.get("type", False) == "mixin":
        node.set("isMixin", True)

    # If the description has a type specified then take this type
    # (and not the one extracted from the paramsMap)
    commentAttributes = comment.parseNode(item)
    addTypeInfo(node, comment.getAttrib(commentAttributes, "description"), item)
    handleDeprecated(node, commentAttributes)
    handleInternal(node, commentAttributes)

    classNode.addListChild("properties", node)


def handleMethodDefinitionOld(item, isStatic, classNode):
    if item.type == "assignment":
        # This is a "normal" method definition
        leftItem = item.getFirstListChild("left")
        name = leftItem.children[len(leftItem.children) - 1].get("name")
        functionItem = item.getFirstListChild("right")
    elif item.type == "keyvalue":
        # This is a method definition of a map-style class (like qx.Const)
        name = item.get("key")
        functionItem = item.getFirstListChild("value")

    commentAttributes = comment.parseNode(item)

    node = handleFunction(functionItem, commentAttributes, classNode)
    node.set("name", name)

    isPublic = name[0] != "_"
    listName = "methods"
    if isStatic:
        node.set("isStatic", True)
        listName += "-static"

    classNode.addListChild(listName, node)
    return node








########################################################################################
#
#  COMPATIBLE TO BOTH, 0.6 and 0.7 style
#
########################################################################################

def handleConstantDefinition(item, classNode):
    if (item.type == "assignment"):
        # This is a "normal" constant definition
        leftItem = item.getFirstListChild("left")
        name = leftItem.children[len(leftItem.children) - 1].get("name")
        valueNode = item.getChild("right")
    elif (item.type == "keyvalue"):
        # This is a constant definition of a map-style class (like qx.Const)
        name = item.get("key")
        valueNode = item.getChild("value")

    if not name.isupper():
        return

    node = tree.Node("constant")
    node.set("name", name)

    value = None
    if valueNode.hasChild("constant"):
            node.set("value", valueNode.getChild("constant").get("value"))
            node.set("type", valueNode.getChild("constant").get("constantType").capitalize())

    commentAttributes = comment.parseNode(item)
    description = comment.getAttrib(commentAttributes, "description")
    addTypeInfo(node, description, item)

    handleDeprecated(node, commentAttributes)
    handleInternal(node, commentAttributes)
    classNode.addListChild("constants", node)


def handleFunction(funcItem, commentAttributes, classNode):
    if funcItem.type != "function":
        raise DocException("'funcItem' is no function", funcItem)

    node = tree.Node("method")

    # Read the parameters
    params = funcItem.getChild("params", False)
    if params and params.hasChildren():
        for param in params.children:
            if param.type != "variable":
                continue

            paramNode = tree.Node("param")
            paramNode.set("name", param.getFirstChild().get("name"))
            node.addListChild("params", paramNode)

    # Check whether the function is abstract
    bodyBlockItem = funcItem.getChild("body").getFirstChild();
    if bodyBlockItem.type == "block" and bodyBlockItem.hasChildren():
        firstStatement = bodyBlockItem.children[0];
        if firstStatement.type == "throw":
            # The first statement of the function is a throw statement
            # -> The function is abstract
            node.set("isAbstract", True)

    if len(commentAttributes) == 0:
        addError(node, "Documentation is missing.", funcItem)
        return node

    handleDeprecated(node, commentAttributes)
    handleInternal(node, commentAttributes)

    # Read all description, param and return attributes
    for attrib in commentAttributes:
        # Add description
        if attrib["category"] == "description":
            if attrib.has_key("text"):
                if "TODOC" in attrib["text"]:
                    addError(node, "Documentation is missing.", funcItem)
                descNode = tree.Node("desc").set("text", attrib["text"])
                node.addChild(descNode)

        elif attrib["category"] == "see":
            if not attrib.has_key("name"):
                raise DocException("Missing target for see.", funcItem)

            seeNode = tree.Node("see").set("name", attrib["name"])
            node.addChild(seeNode)

        elif attrib["category"] == "param":
            if not attrib.has_key("name"):
                raise DocException("Missing name of parameter.", funcItem)

            # Find the matching param node
            paramName = attrib["name"]
            paramNode = node.getListChildByAttribute("params", "name", paramName, False)

            if not paramNode:
                addError(node, "Contains information for a non-existing parameter <code>%s</code>." % paramName, funcItem)
                continue

            addTypeInfo(paramNode, attrib, funcItem)

        elif attrib["category"] == "return":
            returnNode = tree.Node("return")
            node.addChild(returnNode)

            addTypeInfo(returnNode, attrib, funcItem)

    # Check for documentation errors
    # Check whether all parameters have been documented
    if node.hasChild("params"):
        paramsListNode = node.getChild("params");
        for paramNode in paramsListNode.children:
            if not paramNode.getChild("desc", False):
                addError(node, "Parameter <code>%s</code> is not documented." % paramNode.get("name"), funcItem)

    if not node.hasChild("desc"):
        addError(node, "Documentation is missing.", funcItem)

    return node










########################################################################################
#
#  COMMON STUFF
#
#######################################################################################


def variableIsClassName(varItem):
    length = len(varItem.children)
    for i in range(length):
        varChild = varItem.children[i]
        if not varChild.type == "identifier":
            return False
        if i < length - 1:
            # This is not the last identifier -> It must a package (= lowercase)
            if not varChild.get("name").islower():
                return False
        else:
            # This is the last identifier -> It must the class name (= first letter uppercase)
            if not varChild.get("name")[0].isupper():
                return False
    return True


def getValue(item):
    value = None
    if item.type == "constant":
        if item.get("constantType") == "string":
            value = '"' + item.get("value") + '"'
        else:
            value = item.get("value")
    elif item.type == "variable":
        value = assembleVariable(item)
    elif item.type == "operation" and item.get("operator") == "SUB":
        # E.g. "-1" or "-Infinity"
        value = "-" + getValue(item.getChild("first").getFirstChild())
    if value == None:
        value = "[Unsupported item type: " + item.type + "]"

    return value



def addTypeInfo(node, commentAttrib=None, item=None):
    if commentAttrib == None:
        if node.type == "constant" and node.get("value", False):
                pass

        elif node.type == "param":
            addError(node, "Parameter <code>%s</code> in not documented." % commentAttrib.get("name"), item)

        elif node.type == "return":
            addError(node, "Return value is not documented.", item)

        else:
            addError(node, "Documentation is missing.", item)

        return

    # add description
    if commentAttrib.has_key("text"):
        node.addChild(tree.Node("desc").set("text", commentAttrib["text"]))

    # add types
    if commentAttrib.has_key("type"):
        typesNode = tree.Node("types")
        node.addChild(typesNode)

        for item in commentAttrib["type"]:
            itemNode = tree.Node("entry")
            typesNode.addChild(itemNode)

            itemNode.set("type", item["type"])

            if item["dimensions"] != 0:
                itemNode.set("dimensions", item["dimensions"])

    # add default value
    if commentAttrib.has_key("default"):
        defaultValue = commentAttrib["default"]
        if defaultValue != None:
            # print "defaultValue: %s" % defaultValue
            node.set("defaultValue", defaultValue)



def addEventNode(classNode, classItem, commentAttrib):
    node = tree.Node("event")

    node.set("name", commentAttrib["name"])

    if commentAttrib.has_key("text"):
        node.addChild(tree.Node("desc").set("text", commentAttrib["text"]))

    # add types
    if commentAttrib.has_key("type"):
        typesNode = tree.Node("types")
        node.addChild(typesNode)

        for item in commentAttrib["type"]:
            itemNode = tree.Node("entry")
            typesNode.addChild(itemNode)
            itemNode.set("type", item["type"])

            if item["dimensions"] != 0:
                itemNode.set("dimensions", item["dimensions"])

    classNode.addListChild("events", node)



def addError(node, msg, syntaxItem):
    # print ">>> %s" % msg

    errorNode = tree.Node("error")
    errorNode.set("msg", msg)

    (line, column) = getLineAndColumnFromSyntaxItem(syntaxItem)
    if line:
        errorNode.set("line", line)

        if column:
            errorNode.set("column", column)

    node.addListChild("errors", errorNode)
    node.set("hasError", True)


def getType(item):
    if item.type == "constant" and item.get("constantType") == "string":
        val = item.get("value").capitalize()
        return val

    else:
        raise DocException("Can't gess type. type is neither string nor variable: " + item.type, item)


def getClassNode(docTree, className, commentAttributes = None):
    if commentAttributes == None:
        commentAttributes = {}

    splits = className.split(".")

    currPackage = docTree
    length = len(splits)
    for i in range(length):
        split = splits[i]

        if (i < length - 1):
            # This is a package name -> Get the right package
            childPackage = currPackage.getListChildByAttribute("packages", "name", split, False)
            if not childPackage:
                childPackageName = ".".join(splits[:-(length-i-1)])

                # The package does not exist -> Create it
                childPackage = tree.Node("package")
                childPackage.set("name", split)
                childPackage.set("fullName", childPackageName)
                childPackage.set("packageName", childPackageName.replace("." + split, ""))

                currPackage.addListChild("packages", childPackage)

            # Update current package
            currPackage = childPackage

        else:
            # This is a class name -> Get the right class
            classNode = currPackage.getListChildByAttribute("classes", "name", split, False)
            if not classNode:
                # The class does not exist -> Create it
                classNode = tree.Node("class")
                classNode.set("name", split)
                classNode.set("fullName", className)
                classNode.set("packageName", className.replace("." + split, ""))

                # Read all description, param and return attributes
                for attrib in commentAttributes:
                    # Add description
                    if attrib["category"] == "description":
                        if attrib.has_key("text"):
                            descNode = tree.Node("desc").set("text", attrib["text"])
                            classNode.addChild(descNode)

                    elif attrib["category"] == "see":
                        if not attrib.has_key("name"):
                            raise DocException("Missing target for see.", classNode)

                        seeNode = tree.Node("see").set("name", attrib["name"])
                        classNode.addChild(seeNode)

                currPackage.addListChild("classes", classNode)

            return classNode



def postWorkPackage(docTree, packageNode):
    childHasError = False

    packages = packageNode.getChild("packages", False)
    if packages:
        packages.children.sort(nameComparator)
        for node in packages.children:
            hasError = postWorkPackage(docTree, node)
            if hasError:
                childHasError = True

    classes = packageNode.getChild("classes", False)
    if classes:
        classes.children.sort(nameComparator)
        for node in classes.children:
            hasError = postWorkClass(docTree, node)
            if hasError:
                childHasError = True

    if childHasError:
        packageNode.set("hasWarning", True)

    return childHasError



def postWorkClass(docTree, classNode):
    # Sort child classes
    childClasses = classNode.get("childClasses", False)
    if childClasses:
        classArr = childClasses.split(",")
        classArr.sort()
        childClasses = ",".join(classArr)
        classNode.set("childClasses", childClasses)

    # Remove the property-modifier-methods
    removePropertyModifiers(classNode)

    # Mark overridden items
    postWorkItemList(docTree, classNode, "properties", True)
    postWorkItemList(docTree, classNode, "events", False)
    postWorkItemList(docTree, classNode, "methods", True)
    postWorkItemList(docTree, classNode, "methods-static", False)

    # Check whether the class is static
    superClassName = classNode.get("superClass", False)
    if (superClassName == None) \
        and classNode.getChild("properties", False) == None \
        and classNode.getChild("methods", False) == None:
        # This class is static
        classNode.set("isStatic", True)

    # Check whether the class is abstract
    if isClassAbstract(docTree, classNode, {}):
        classNode.set("isAbstract", True)

    # Check for errors
    childHasError = listHasError(classNode, "constructor") or listHasError(classNode, "properties") \
        or listHasError(classNode, "methods") or listHasError(classNode, "methods-static") \
        or listHasError(classNode, "constants")

    if childHasError:
        classNode.set("hasWarning", True)

    return childHasError



def isClassAbstract(docTree, classNode, visitedMethodNames):
    if containsAbstractMethods(classNode.getChild("methods", False), visitedMethodNames):
        # One of the methods is abstract
        return True

    # No abstract methods found -> Check whether the super class has abstract
    # methods that haven't been overridden
    superClassName = classNode.get("superClass", False)
    if superClassName:
        superClassNode = getClassNode(docTree, superClassName)
        return isClassAbstract(docTree, superClassNode, visitedMethodNames)



def containsAbstractMethods(methodListNode, visitedMethodNames):
    if methodListNode:
        for methodNode in methodListNode.children:
            name = methodNode.get("name")
            if not name in visitedMethodNames:
                visitedMethodNames[name] = True
                if methodNode.get("isAbstract", False):
                    return True

    return False



def removePropertyModifiers(classNode):
    propertiesList = classNode.getChild("properties", False)
    methodsList = classNode.getChild("methods", False)
    if propertiesList and methodsList:
        for propNode in propertiesList.children:

            # for new properties mark the apply method
            if propNode.get("oldProperty", False) != True:
                if propNode.get("apply", False) != None:
                    applyMethod = methodsList.getChildByAttribute("name", propNode.get("apply"), False)
                    if applyMethod != None:
                        applyMethod.set("apply", propNode.get("name"))
                continue

            name = propNode.get("name")
            upperName = name[0].upper() + name[1:]

            modifyNode = methodsList.getChildByAttribute("name", "_modify" + upperName, False)
            if modifyNode:
                methodsList.removeChild(modifyNode);

            changeNode = methodsList.getChildByAttribute("name", "_change" + upperName, False)
            if changeNode:
                methodsList.removeChild(changeNode);

            checkNode = methodsList.getChildByAttribute("name", "_check" + upperName, False)
            if checkNode:
                methodsList.removeChild(checkNode);

        if not methodsList.hasChildren():
            classNode.removeChild(methodsList)


def itemHasAnyDocs(node):
    if node.getChild("desc", False) != None:
        return True
    if node.hasChildren():
        for child in node.children:
            if child.type == "params":
                for param in child.children:
                    if param.getChild("desc", False) != None:
                        return True
            elif child.type != "errors":
                return True
    return False

def postWorkItemList(docTree, classNode, listName, overridable):
    """Does the post work for a list of properties or methods."""

    # Sort the list
    sortByName(classNode, listName)

    # Post work all items
    listNode = classNode.getChild(listName, False)
    if listNode:
        for itemNode in listNode.children:
            name = itemNode.get("name")

            # Check whether this item is overridden and try to inherit the
            # documentation from the next matching super class
            if overridable:
                superClassName = classNode.get("superClass", False)
                overriddenFound = False
                docFound = itemHasAnyDocs(itemNode)
                while superClassName and (not overriddenFound or not docFound):
                    superClassNode = getClassNode(docTree, superClassName)
                    superItemNode = superClassNode.getListChildByAttribute(listName, "name", name, False)

                    if superItemNode:
                        if not docFound:
                            # This super item has a description
                            # -> Check whether the parameters match
                            # NOTE: paramsMatch works for properties, too
                            #       (Because both compared properties always have no params)
                            if paramsMatch(itemNode, superItemNode):
                                # The parameters match -> We can use the documentation of the super class
                                itemNode.set("docFrom", superClassName)
                                docFound = itemHasAnyDocs(superItemNode)

                                # Remove previously recorded documentation errors from the item
                                # (Any documentation errors will be recorded in the super class)
                                removeErrors(itemNode)
                            else:
                                docFound = True;
                        if not overriddenFound:
                            # This super class has the item defined -> Add a overridden attribute
                            itemNode.set("overriddenFrom", superClassName)
                            overriddenFound = True

                    # Check the next superclass
                    superClassName = superClassNode.get("superClass", False)

                if not docFound and itemNode.get("overriddenFrom", False):
                    # This item is overridden, but we didn't find any documentation in the
                    # super classes -> Add a warning
                    itemNode.set("hasWarning", True)



def paramsMatch(methodNode1, methodNode2):
    params1 = methodNode1.getChild("params", False)
    params2 = methodNode2.getChild("params", False)

    if params1 == None or params2 == None:
        # One method has no parameters -> The params match if both are None
        return params1 == params2
    elif len(params1.children) != len(params2.children):
        # The param count is different -> The params don't match
        return False
    else:
        for i in range(len(params1.children)):
            par1 = params1.children[i]
            par2 = params2.children[i]
            if (par1.get("name") != par2.get("name")):
                # These parameters don't match
                return False

        # All tests passed
        return True



def removeErrors(node):
    errors = node.getChild("errors", False)
    if errors:
        node.removeChild(errors)
        node.remove("hasError")



def sortByName(node, listName):
    listNode = node.getChild(listName, False)
    if listNode:
        listNode.children.sort(nameComparator)



def nameComparator(node1, node2):
    name1 = node1.get("name").lower()
    name2 = node2.get("name").lower()
    return cmp(name1, name2)



def listHasError(node, listName):
    listNode = node.getChild(listName, False)
    if listNode:
        for childNode in listNode.children:
            if childNode.get("hasError", False):
                return True

    return False
