/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(apiviewer)

************************************************************************ */

/**
 * Shows the class details.
 */
qx.Class.define("apiviewer.ClassViewer",
{
  extend : qx.ui.embed.HtmlEmbed,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    qx.ui.embed.HtmlEmbed.call(this);

    this.setOverflow("auto");
    this.setPadding(20);
    this.setEdge(0);
    this.setHtmlProperty("id", "ClassViewer");
    this.setVisibility(false);

    apiviewer.ClassViewer.instance = this;
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {

    /** {Map} The primitive types. These types will not be shown with links. */
    PRIMITIVES :
    {
      "var"       : true,
      "void"      : true,
      "undefined" : true,
      "arguments" : true,
      "null"      : true,
      "Boolean"   : true,
      "String"    : true,
      "Float"     : true,
      "Double"    : true,
      "Number"    : true,
      "Integer"   : true,
      "Error"     : true,
      "RegExp"    : true,
      "Array"     : true,
      "Map"       : true,
      "Date"      : true,
      "Element"   : true,
      "Document"  : true,
      "Window"    : true,
      "Node"      : true,
      "Function"  : true,
      "Object"    : true,
      "Event"     : true,
      "Class"     : true,
      "Mixin"     : true,
      "Interface" : true
    },


    /**
     * {regexp} The regexp for parsing a item name
     * (e.g. "mypackage.MyClass#MY_CONSTANT alternative text").
     */
    ITEM_SPEC_REGEX : /^(([\w\.]+)?(#\w+(\([^\)]*\))?)?)(\s+(.*))?$/,

    /** {regexp} The regexp that finds the end of a sentence. */
    SENTENCE_END_REGEX : /[^\.].\.(\s|<)/,

    /** {int} The node type of a constructor. */
    NODE_TYPE_CONSTRUCTOR : 1,

    /** {int} The node type of an event. */
    NODE_TYPE_EVENT : 2,

    /** {int} The node type of a property. */
    NODE_TYPE_PROPERTY : 3,

    /** {int} The node type of a public method. */
    NODE_TYPE_METHOD : 4,

    /** {int} The node type of a static public method. */
    NODE_TYPE_METHOD_STATIC : 5,

    /** {int} The node type of a constant. */
    NODE_TYPE_CONSTANT : 6,

    /** {string} The start tag of a div. */
    DIV_START : '<div>',

    /** {string} The start tag of a div containing an item description. */
    DIV_START_DESC : '<div class="item-desc">',

    /** {string} The start tag of a div containing the headline of an item detail. */
    DIV_START_DETAIL_HEADLINE : '<div class="item-detail-headline">',

    /** {string} The start tag of a div containing the text of an item detail. */
    DIV_START_DETAIL_TEXT : '<div class="item-detail-text">',

    /** {string} The start tag of a div containing the headline of an item error. */
    DIV_START_ERROR_HEADLINE : '<div class="item-detail-error">',

    /** {string} The end tag of a div. */
    DIV_END : '</div>',

    /** {string} The start tag of a span containing an optional detail. */
    SPAN_START_OPTIONAL : '<span class="item-detail-optional">',

    /** {string} The start tag of a span containing a parameter name. */
    SPAN_START_PARAM_NAME : '<span class="item-detail-param-name">',

    /** {string} The end tag of a span. */
    SPAN_END : '</span>',


    /**
     * Creates the HTML showing an image.
     *
     * @type static
     * @param imgUrl {var} the URL of the image. May be a string or an array of
     *          strings (for overlay images).
     * @param tooltip {String} the tooltip to show.
     * @param styleAttributes {String} the style attributes to add to the image.
     * @return {var} TODOC
     */
    createImageHtml : function(imgUrl, tooltip, styleAttributes)
    {
      if (typeof imgUrl == "string") {
        return '<img src="' + qx.manager.object.AliasManager.getInstance().resolvePath(imgUrl) + '" class="img"' + (styleAttributes ? ' style="' + styleAttributes + '"' : "") + '/>';
      }
      else
      {
        if (styleAttributes) {
          styleAttributes += ";vertical-align:top";
        } else {
          styleAttributes = "vertical-align:top";
        }

        return apiviewer.ClassViewer.createOverlayImageHtml(18, 18, imgUrl, tooltip, styleAttributes);
      }
    },


    /**
     * Creates HTML that shows an overlay image (several images on top of each other).
     * The resulting HTML will behave inline.
     *
     * @type static
     * @param width {Integer} the width of the images.
     * @param height {Integer} the height of the images.
     * @param imgUrlArr {String[]} the URLs of the images. The last image will be
     *          painted on top.
     * @param toolTip {String,null} the tooltip of the icon.
     * @param styleAttributes {String,null} custom CSS style attributes.
     * @return {String} the HTML with the overlay image.
     */
    createOverlayImageHtml : function(width, height, imgUrlArr, toolTip, styleAttributes)
    {
      var html = '<div style="display:inline;padding-right:22px;position:relative;top:0;left:0;width:' + width + 'px;height:' + height + 'px' + ((styleAttributes == null) ? '' : (';' + styleAttributes)) + '">';

      for (var i=0; i<imgUrlArr.length; i++)
      {
        html += '<img';

        if (toolTip != null) {
          html += ' title="' + toolTip + '"';
        }

        html += ' style="position:absolute;top:0px;left:0px" src="' + qx.manager.object.AliasManager.getInstance().resolvePath(imgUrlArr[i]) + '"/>';
      }

      html += '</div>';

      /*
      // NOTE: See testOverlay.html
      var html = '<table cellpadding="0" cellspacing="0" '
        + 'style="display:inline;position:relative;border:1px solid blue'
        + ((styleAttributes == null) ? '' : (';' + styleAttributes)) + '"><tr>'
        + '<td style="width:' + width + 'px;height:' + height + 'px">';
      for (var i = 0; i < imgUrlArr.length; i++) {
        html += '<img';
        if (toolTip != null) {
          html += ' title="' + toolTip + '"';
        }
        html += ' style="position:absolute;top:0px;left:0px" src="' + imgUrlArr[i] + '"></img>';
      }
      html += '</td></tr></table>';
      */

      return html;
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param el {Element} TODOC
     * @return {void}
     */
    _fixLinks : function(el)
    {
      var a = el.getElementsByTagName("a");

      for (var i=0; i<a.length; i++)
      {
        if (typeof a[i].href == "string" && a[i].href.indexOf("http://") == 0) {
          a[i].target = "_blank";
        }
      }
    },


    /**
     * Initializes the content of the embedding DIV. Will be called by the
     * HtmlEmbed element initialization routine.
     *
     * @type member
     * @return {void}
     */
    _syncHtml : function()
    {
      var ClassViewer = apiviewer.ClassViewer;

      document._detailViewer = this;

      this._infoPanelHash = {};

      var html = "";

      // Add title
      html += '<h1></h1>';

      // Add description
      html += ClassViewer.DIV_START + ClassViewer.DIV_END;

      html += '<div id="ControlFrame">';
      html += '<input type="checkbox" id="showInherited" onclick="document._detailViewer._onInheritedCheckBoxClick()"/><label for="showInherited">Show Inherited</label>';
      html += '&#160;';
      html += '<input type="checkbox" id="showProtected" onclick="document._detailViewer._onProtectedCheckBoxClick()"/><label for="showProtected">Show Protected</label>';
      html += '</div>';

      // BASICS
      // Add constructor info
      html += this._createInfoPanel(ClassViewer.NODE_TYPE_CONSTRUCTOR, "constructor", "constructor", this._createMethodInfo, this._methodHasDetails, false, true);

      // Add event info
      html += this._createInfoPanel(ClassViewer.NODE_TYPE_EVENT, "events", "events", this._createEventInfo, this._eventHasDetails, true, true);

      // Add properties info
      html += this._createInfoPanel(ClassViewer.NODE_TYPE_PROPERTY, "properties", "properties", this._createPropertyInfo, qx.lang.Function.returnTrue, true, true);

      // PUBLIC
      // Add methods info
      html += this._createInfoPanel(ClassViewer.NODE_TYPE_METHOD, "methods", "methods", this._createMethodInfo, this._methodHasDetails, true, true);

      // Add static methods info
      html += this._createInfoPanel(ClassViewer.NODE_TYPE_METHOD_STATIC, "methods-static", "static methods", this._createMethodInfo, this._methodHasDetails, false, true);

      // Add constants info
      html += this._createInfoPanel(ClassViewer.NODE_TYPE_CONSTANT, "constants", "constants", this._createConstantInfo, this._constantHasDetails, false, true);

      // Set the html
      // doc.body.innerHTML = html;
      this.getElement().innerHTML = html;
      this._fixLinks(this.getElement());

      // Extract the main elements
      var divArr = this.getElement().childNodes;
      this._titleElem = divArr[0];
      this._classDescElem = divArr[1];
      this._controlFrame = divArr[2];

      this._infoPanelHash[ClassViewer.NODE_TYPE_CONSTRUCTOR].infoElem = divArr[3];
      this._infoPanelHash[ClassViewer.NODE_TYPE_EVENT].infoElem = divArr[4];
      this._infoPanelHash[ClassViewer.NODE_TYPE_PROPERTY].infoElem = divArr[5];
      this._infoPanelHash[ClassViewer.NODE_TYPE_METHOD].infoElem = divArr[6];
      this._infoPanelHash[ClassViewer.NODE_TYPE_METHOD_STATIC].infoElem = divArr[7];
      this._infoPanelHash[ClassViewer.NODE_TYPE_CONSTANT].infoElem = divArr[8];

      // Get the child elements
      for (var nodeType in this._infoPanelHash)
      {
        var typeInfo = this._infoPanelHash[nodeType];
        typeInfo.infoTitleElem = typeInfo.infoElem.firstChild;
        typeInfo.infoBodyElem = typeInfo.infoElem.lastChild;
      }

      // Update the view
      if (this._currentClassDocNode)
      {
        // NOTE: We have to set this._currentClassDocNode to null beore, because
        //       otherwise showClass thinks, there's nothing to do
        var classDocNode = this._currentClassDocNode;
        this._currentClassDocNode = null;
        this.showClass(classDocNode);
      }
    },


    /**
     * Creates an info panel. An info panel shows the information about one item
     * type (e.g. for public methods).
     *
     * @type member
     * @param nodeType {Integer} the node type to create the info panel for.
     * @param listName {String} the name of the node list in the class doc node where
     *          the items shown by this info panel are stored.
     * @param labelText {String} the label text describing the node type.
     * @param infoFactory {function} the factory method creating the HTML for one
     *          item.
     * @param hasDetailDecider {function} a function returning <code>true</code>
     *          when a item has details.
     * @param addInheritedCheckBox {Boolean} whether to add a "show inherited ..."
     *          checkbox.
     * @param isOpen {Boolean} whether the info panel is open by default.
     * @return {String} the HTML for the info panel.
     */
    _createInfoPanel : function(nodeType, listName, labelText, infoFactory, hasDetailDecider, addInheritedCheckBox, isOpen)
    {
      var uppercaseLabelText = labelText.charAt(0).toUpperCase() + labelText.substring(1);

      typeInfo =
      {
        listName             : listName,
        labelText            : labelText,
        infoFactory          : infoFactory,
        hasDetailDecider     : hasDetailDecider,
        isOpen               : isOpen,
        hasInheritedCheckBox : addInheritedCheckBox
      };

      this._infoPanelHash[nodeType] = typeInfo;

      var html = '<div class="infoPanel"><h2>';

      html +=
        '<img class="openclose" src="' +
        qx.manager.object.AliasManager.getInstance().resolvePath('api/image/' + (isOpen ? 'close.gif' : 'open.gif')) +
        '"' + " onclick=\"document._detailViewer._onShowInfoPanelBodyClicked(" + nodeType + ")\"/> " +
        '<span ' + " onclick=\"document._detailViewer._onShowInfoPanelBodyClicked(" + nodeType + ")\">" +
        uppercaseLabelText + '</span>';

      html += '</h2><div></div></div>';

      return html;
    },


    /**
     * Shows the information about a class.
     *
     * @type member
     * @param classNode {Map} the doc node of the class to show.
     * @return {void}
     */
    showClass : function(classNode)
    {
      if (this._currentClassDocNode == classNode)
      {
        // Nothing to do
        return ;
      }

      this._currentClassDocNode = classNode;

      if (!this._titleElem)
      {
        // _initContentDocument was not called yet
        // -> Do nothing, the class will be shown in _initContentDocument.
        return ;
      }

      var ClassViewer = apiviewer.ClassViewer;

      switch (classNode.attributes.type)
      {
        case "mixin" :
          var objectName = "Mixin";
          var subObjectsName = "sub mixins"
          break;

        case "interface" :
          var objectName = "Interface";
          var subObjectsName = "sub interfaces"
          break;

        default:
          var objectName = "Class";
          var subObjectsName = "sub classes"
          break;

      }

      var titleHtml = "";

      titleHtml += '<div class="packageName">' + classNode.attributes.packageName + '</div>';

      titleHtml += '<span class="typeInfo">';

      if (classNode.attributes.isAbstract) {
        titleHtml += "Abstract ";
      } else if (classNode.attributes.isStatic) {
        titleHtml += "Static ";
      } else if (classNode.attributes.isSingleton) {
        titleHtml += "Singleton ";
      }

      titleHtml += objectName;
      titleHtml += ' </span>';
      titleHtml += classNode.attributes.name;

      this._titleElem.innerHTML = titleHtml;

      var classHtml = "";

      // Add the class description
      var descNode = apiviewer.TreeUtil.getChild(classNode, "desc");

      if (descNode)
      {
        var desc = descNode.attributes.text;

        if (desc != "")
        {
          classHtml += '<div class="classDescription">' + this._createDescriptionHtml(desc, classNode) + '</div>';
          classHtml += "<br/>";
        }
      }

      // Add the class hierarchy
      switch (classNode.attributes.type)
      {
        case "mixin" :
        case "interface" :
          classHtml += this.__getHierarchyTreeHtml(classNode);
          break;

        default:
          classHtml += this.__getClassHierarchyHtml(classNode);
          break;
      }

      classHtml += '<br/>';

      // Add child classes
      // Add implemented interfaces
      // Add used mixins

      var dependentObjects = {
        childClasses : "Direct " + subObjectsName + ":",
        interfaces: "Implemented interfaces:",
        mixins : "Included mixins:",
        implementations: "Implementations of this interface",
        includer: "Classes including the mixin"
      }

      for (var obj in dependentObjects)
      {
        if (classNode.attributes[obj])
        {
          classHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + dependentObjects[obj] + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT;

          var classNameArr = classNode.attributes[obj].split(",");

          for (var i=0; i<classNameArr.length; i++)
          {
            if (i != 0) {
              classHtml += ", ";
            }

            classHtml += this._createItemLinkHtml(classNameArr[i], null, true, false);
          }

          classHtml += ClassViewer.DIV_END;
          classHtml += '<br/>';
        }
      }

      // Add @see attributes
      var ctorList = apiviewer.TreeUtil.getChild(classNode, "constructor");

      if (ctorList)
      {
        classHtml += this._createSeeAlsoHtml(ctorList.children[0], classNode);
        classHtml += '<br/>';
      }

      this._classDescElem.innerHTML = classHtml;
      this._fixLinks(this._classDescElem);

      // Refresh the info viewers
      this._updateInfoViewers();

      // Scroll to top
      this.getElement().scrollTop = 0;
    },


    /**
     * Generate HTML fragment to display the inheritance hierarchy of a class.
     *
     * @param classNode {map} class node
     * @return {String} HTML fragemnt
     */
    __getClassHierarchyHtml: function(classNode)
    {
      var ClassViewer = apiviewer.ClassViewer;

      // Create the class hierarchy
      var classHtml = ClassViewer.DIV_START_DETAIL_HEADLINE + "Inheritance hierarchy:" + ClassViewer.DIV_END;

      var classHierarchy = [];
      var currClass = classNode;

      while (currClass != null)
      {
        classHierarchy.push(currClass);
        currClass = this._getClassDocNode(currClass.attributes.superClass);
      }

      classHtml += ClassViewer.createImageHtml("api/image/class18.gif") + "Object<br/>";
      var indent = 0;

      for (var i=classHierarchy.length-1; i>=0; i--)
      {
        classHtml +=
          ClassViewer.createImageHtml("api/image/nextlevel.gif", null, "margin-left:" + indent + "px") +
          ClassViewer.createImageHtml(apiviewer.TreeUtil.getIconUrl(classHierarchy[i]));

        if (i != 0) {
          classHtml += this._createItemLinkHtml(classHierarchy[i].attributes.fullName, null, false);
        } else {
          classHtml += classHierarchy[i].attributes.fullName;
        }

        classHtml += "<br/>";
        indent += 18;
      }
      return classHtml;
    },


    /**
     * Generate HTML fragment to display the inheritance tree of an interface or mixin.
     *
     * @param classNode {map} class node
     * @return {String} HTML fragemnt
     */
    __getHierarchyTreeHtml: function(classNode)
    {
      switch (classNode.attributes.type)
      {
        case "mixin":
          superList = "superMixins";
          superObject = "mixin";
          break;

        case "interface":
          superList = "superInterfaces";
          superObject = "interface";
          break;

        default:
          return "";
      }

      var ClassViewer = apiviewer.ClassViewer;

      // Create the interface hierarchy
      var self = this;
      var EMPTY_CELL = ClassViewer.createImageHtml("api/image/blank.gif", null, "width:18px");

      var generateTree = function(nodes, first)
      {
        var lines = [];

        for (var nodeIndex=0; nodeIndex<nodes.length; nodeIndex++)
        {

          // render line
          var line = "";
          var classNode = nodes[nodeIndex];
          if (!first) {
            if (nodeIndex == nodes.length-1) {
              line += ClassViewer.createImageHtml("api/image/nextlevel.gif");
            } else {
              line += ClassViewer.createImageHtml("api/image/cross.gif");
            }
          } else {
            line += EMPTY_CELL;
          }

          line += ClassViewer.createImageHtml(apiviewer.TreeUtil.getIconUrl(classNode));
          if (!first) {
            line += self._createItemLinkHtml(nodes[nodeIndex].attributes.fullName, null, false);
          } else {
            line += nodes[nodeIndex].attributes.fullName;
          }
          lines.push(line);

          // get a list of super interfaces
          var superInterfaces = [];

          var superInterfacesNode = apiviewer.TreeUtil.getChild(classNode, superList);
          if (superInterfacesNode)
          {
            for (var j=0; j<superInterfacesNode.children.length; j++) {
              if (superInterfacesNode.children[j].type = superObject) {
                superInterfaces.push(self._getClassDocNode(superInterfacesNode.children[j].attributes.name));
              }
            }
          }

          // render lines of super interfaces
          if (superInterfaces.length > 0)
          {
            var subLines = generateTree(superInterfaces);
            for(var i=0; i<subLines.length; i++) {
              if (nodeIndex == nodes.length-1) {
                lines.push(EMPTY_CELL + subLines[i]);
              } else {
                lines.push(ClassViewer.createImageHtml("api/image/vline.gif") + subLines[i]);
              }
            }
          }
        }
        return lines;
      }

      var classHtml = "";
      if (apiviewer.TreeUtil.getChild(classNode, superList)) {
        classHtml = ClassViewer.DIV_START_DETAIL_HEADLINE + "Inheritance hierarchy:" + ClassViewer.DIV_END;
        classHtml += "<div style='line-height:15px'>";
        classHtml += generateTree([classNode], true).join("<br />\n");
        classHtml += "</div>";
      }
      return classHtml;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _updateInfoViewers : function()
    {
      for (var nodeType in this._infoPanelHash) {
        this._updateInfoPanel(parseInt(nodeType));
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param classNode {var} TODOC
     * @return {void}
     */
    showInfo : function(classNode)
    {
      if (this._currentClassDocNode == classNode)
      {
        // Nothing to do
        return ;
      }

      this._currentClassDocNode = classNode;

      if (!this._titleElem)
      {
        // _initContentDocument was not called yet
        // -> Do nothing, the class will be shown in _initContentDocument.
        return ;
      }

      var ClassViewer = apiviewer.ClassViewer;

      this._titleElem.innerHTML = "Info View";
      this._classDescElem.innerHTML = "";

      // Scroll to top
      this.getElement().scrollTop = 0;
    },


    /**
     * Highlights an item (property, method or constant) and scrolls it visible.
     *
     * @type member
     * @param itemName {String} the name of the item to highlight.
     * @return {void}
     */
    showItem : function(itemName)
    {
      var itemNode = apiviewer.TreeUtil.getItemDocNode(this._currentClassDocNode, itemName);

      if (!itemNode) {
        alert("Item '" + itemName + "' not found");
      }

      var nodeType = this._getTypeForItemNode(itemNode);
      var elem = this._getItemElement(nodeType, itemNode.attributes.name).parentNode.parentNode;

      // Handle mark
      if (this._markedElement) {
        this._markedElement.className = "";
      }

      elem.className = "marked";
      this._markedElement = elem;

      // Scroll the element visible
      var top = qx.html.Location.getPageBoxTop(elem);
      var height = elem.offsetHeight;

      var doc = this.getElement();
      var scrollTop = doc.scrollTop;
      var clientHeight = doc.offsetHeight;

      if (scrollTop > top) {
        doc.scrollTop = top;
      } else if (scrollTop < top + height - clientHeight) {
        doc.scrollTop = top + height - clientHeight;
      }
    },


    /**
     * Returns a list of all interfaces the class implements directly.
     */
    _getAllInterfaces : function(classNode)
    {
      if (!classNode.attributes.interfaces) {
        return [];
      }
      var interfaceNodes = [];

      var self = this;
      var ifaceRecurser = function(ifaceName) {
        ifaceNode = self._getClassDocNode(ifaceName);
        interfaceNodes.push(ifaceNode);

        var superIfaceNode = apiviewer.TreeUtil.getChild(ifaceNode, "superInterfaces");
        if (superIfaceNode) {
          for (var i=0; i<superIfaceNode.children.length; i++) {
            ifaceRecurser(superIfaceNode.children[i].attributes.name);
          }
        }
      }

      var interfaces = classNode.attributes.interfaces.split(",");
      for (var i=0; i<interfaces.length; i++) {
        ifaceRecurser(interfaces[i]);
      }

      return interfaceNodes;
    },


    /**
     * Checks whether the node of the given type and name is required by the interface.
     */
    _checkInterface : function(ifaceNode, nodeType, name) {
      var typeInfo = this._infoPanelHash[nodeType];
      var parentNode = apiviewer.TreeUtil.getChild(ifaceNode, typeInfo.listName);
      if (parentNode)
      {
        for (var i=0; i<parentNode.children.length; i++) {
          if (parentNode.children[i].attributes.name == name) {
            return true;
          }
        }
      }
      return false;
    },


    /**
     * Return a list of all nodes of a given type from all mixins of a class
     */
    _addNodesOfTypeFromMixins : function(classNode, nodeType, nodeArr, fromClassHash)
    {
      var typeInfo = this._infoPanelHash[nodeType];

      var mixins = classNode.attributes.mixins;
      if (mixins) {
        mixins = mixins.split(",");
        for (var mixinIndex=0; mixinIndex<mixins.length; mixinIndex++)
        {

          var self = this;
          var mixinRecurser = function(mixinNode)
          {
            var parentNode = apiviewer.TreeUtil.getChild(mixinNode, typeInfo.listName);
            if (parentNode) {
              for (var i=0; i<parentNode.children.length; i++) {
                var name = parentNode.children[i].attributes.name;
                if (fromClassHash[name] == null)
                {
                  fromClassHash[name] = mixinNode;
                  nodeArr.push(parentNode.children[i]);
                }
              }
            }
            // recursive decent
            var superClasses = apiviewer.TreeUtil.getChild(mixinNode, "superMixins");
            if (superClasses) {
              for (var i=0; i<superClasses.children.length; i++) {
                mixinRecurser(self._getClassDocNode(superClasses.children[i].attributes.name));
              }
            }
          }

          var mixinNode = this._getClassDocNode(mixins[mixinIndex]);
          mixinRecurser(mixinNode);

        }
      }
    },


    _showProtected : false,
    _showInherited : false,


    /**
     * Updates an info panel.
     *
     * @type member
     * @param nodeType {Integer} the node type of which to update the info panel.
     * @return {void}
     */
    _updateInfoPanel : function(nodeType)
    {
      var ClassViewer = apiviewer.ClassViewer;

      var typeInfo = this._infoPanelHash[nodeType];

      // Get the nodes to show
      var nodeArr = [];
      var fromClassHash = {};
      var interfaces = [];

      if (this._currentClassDocNode)
      {
        if (
          this._showInherited &&
          (
            nodeType == apiviewer.ClassViewer.NODE_TYPE_EVENT ||
            nodeType == apiviewer.ClassViewer.NODE_TYPE_PROPERTY ||
            nodeType == apiviewer.ClassViewer.NODE_TYPE_METHOD
          )
        )
        {
          var currClassNode = this._currentClassDocNode;

          while (currClassNode != null)
          {
            var currParentNode = apiviewer.TreeUtil.getChild(currClassNode, typeInfo.listName);
            var currNodeArr = currParentNode ? currParentNode.children : null;

            if (currNodeArr)
            {
              // Add the nodes from this class
              for (var i=0; i<currNodeArr.length; i++)
              {
                var name = currNodeArr[i].attributes.name;

                if (fromClassHash[name] == null)
                {
                  fromClassHash[name] = currClassNode;
                  nodeArr.push(currNodeArr[i]);
                }
              }
            }
            this._addNodesOfTypeFromMixins(currClassNode, nodeType, nodeArr, fromClassHash);
            qx.lang.Array.append(interfaces, this._getAllInterfaces(this._currentClassDocNode));

            var superClassName = currClassNode.attributes.superClass;
            currClassNode = superClassName ? this._getClassDocNode(superClassName) : null;
          }
        }
        else
        {
          var interfaces = this._getAllInterfaces(this._currentClassDocNode);
          var parentNode = apiviewer.TreeUtil.getChild(this._currentClassDocNode, typeInfo.listName);
          if (parentNode) {
            nodeArr = qx.lang.Array.copy(parentNode.children);
          } else {
            nodeArr = [];
          }
          this._addNodesOfTypeFromMixins(this._currentClassDocNode, nodeType, nodeArr, fromClassHash);

        }
      }


      if (nodeArr)
      {
        // Filter protected
        if (nodeType == apiviewer.ClassViewer.NODE_TYPE_METHOD || nodeType == apiviewer.ClassViewer.NODE_TYPE_METHOD_STATIC)
        {
          if (nodeArr.length != 0 && !this._showProtected)
          {
            copyArr = nodeArr.concat();

            for (var i=nodeArr.length-1; i>=0; i--)
            {
              var node = nodeArr[i];

              if (nodeArr[i].attributes.name.charAt(0) == "_") {
                qx.lang.Array.removeAt(copyArr, i);
              }
            }

            nodeArr = copyArr;
          }
        }

        // Sort the nodeArr by name
        // Move protected methods to the end
        nodeArr.sort(function(obj1, obj2)
        {
          var n1 = obj1.attributes.name;
          var n2 = obj2.attributes.name;
          var p1 = n1.charAt(0) == "_";
          var p2 = n2.charAt(0) == "_";
          var h1 = n1.charAt(0) == "__";
          var h2 = n2.charAt(0) == "__";

          if (p1 == p2 && h1 == h2) {
            return n1.toLowerCase() < n2.toLowerCase() ? -1 : 1;
          } else {
            return h1 ? 1 : p1 ? 1 : -1;
          }
        });
      }

      // Show the nodes
      if (nodeArr && nodeArr.length > 0)
      {
        var html = '<table cellspacing="0" cellpadding="0" class="info" width="100%">';

        for (var i=0; i<nodeArr.length; i++)
        {
          var node = nodeArr[i];

          // hasOwnProperty because "toString" may be a key of the fromClassHash map
          if (fromClassHash.hasOwnProperty(node.attributes.name)) {
            var fromClassNode = fromClassHash[node.attributes.name];
          } else {
            fromClassNode = this._currentClassDocNode;
          }

          if (!node.attributes.requiredBy) {
            var requiredBy = [];
            for (var j=0; j<interfaces.length; j++) {
              if (this._checkInterface(interfaces[j], nodeType, node.attributes.name)) {
                requiredBy.push(interfaces[j].attributes.fullName);
              }
            }
            node.attributes.requiredBy = requiredBy.join(",");
          }

          var info = typeInfo.infoFactory.call(this, node, nodeType, fromClassNode, false);
          var inherited =
            fromClassNode &&
            fromClassNode.attributes &&
            (fromClassNode != this._currentClassDocNode) &&
            fromClassNode.attributes.type == "class";
          var iconUrl = apiviewer.TreeUtil.getIconUrl(node, inherited, "_updateInfoPanel");

          // Create the title row
          html += '<tr>';

          html += '<td class="icon">' + ClassViewer.createImageHtml(iconUrl) + '</td>';
          html += '<td class="type">' + ((info.typeHtml.length != 0) ? (info.typeHtml + "&nbsp;") : "") + '</td>';

          html += '<td class="toggle">';

          if (typeInfo.hasDetailDecider.call(this, node, nodeType, fromClassNode))
          {
            // This node has details -> Show the detail button
            html +=
              '<img src="' + qx.manager.object.AliasManager.getInstance().resolvePath("api/image/open.gif") +
              '"' + " onclick=\"document._detailViewer._onShowItemDetailClicked(" + nodeType + ",'" +
              node.attributes.name + "'" + ((fromClassNode != this._currentClassDocNode) ? ",'" +
              fromClassNode.attributes.fullName + "'" : "") + ")\"/>";
          }
          else
          {
            html += "&#160;";
          }

          html += '</td>';

          html += '<td class="text">';

          // Create headline
          html += '<h3';

          if (typeInfo.hasDetailDecider.call(this, node, nodeType, fromClassNode)) {
            html +=
              " onclick=\"document._detailViewer._onShowItemDetailClicked(" +
              nodeType + ",'" + node.attributes.name + "'" +
              ((fromClassNode != this._currentClassDocNode) ? ",'" +
              fromClassNode.attributes.fullName + "'" : "") + ")\">";
          } else {
            html += '>';
          }

          html += info.titleHtml;
          html += '</h3>';

          // Create content area
          html += '<div _itemName="' + nodeArr[i].attributes.name + '">';
          html += info.textHtml;
          html += '</div>';

          html += '</td>';
          html += '</tr>';
        }

        html += '</table>';

        typeInfo.infoBodyElem.innerHTML = html;
        this._fixLinks(typeInfo.infoBodyElem);
        typeInfo.infoBodyElem.style.display = !typeInfo.isOpen ? "none" : "";
        typeInfo.infoElem.style.display = "";
      }
      else
      {
        typeInfo.infoElem.style.display = "none";
      }
    },


    /**
     * Event handler. Called when the user clicked a button for showing/hiding the
     * details of an item.
     *
     * @type member
     * @param nodeType {Integer} the node type of the item to show/hide the details.
     * @param name {String} the name of the item.
     * @param fromClassName {String} the name of the class the item the item was
     *          defined in.
     * @return {void}
     * @throws TODOC
     */
    _onShowItemDetailClicked : function(nodeType, name, fromClassName)
    {
      try
      {
        var typeInfo = this._infoPanelHash[nodeType];
        var textDiv = this._getItemElement(nodeType, name);

        if (!textDiv) {
          throw Error("Element for name '" + name + "' not found!");
        }

        var showDetails = textDiv._showDetails ? !textDiv._showDetails : true;
        textDiv._showDetails = showDetails;

        var fromClassNode = this._currentClassDocNode;

        if (fromClassName) {
          fromClassNode = this._getClassDocNode(fromClassName);
        }

        var listNode = apiviewer.TreeUtil.getChild(fromClassNode, typeInfo.listName);
        var node;

        if (nodeType == apiviewer.ClassViewer.NODE_TYPE_CONSTRUCTOR) {
          node = listNode.children[0];
        } else {
          node = apiviewer.TreeUtil.getChildByAttribute(listNode, "name", name);
        }

        // Update the close/open image
        var opencloseImgElem = textDiv.parentNode.previousSibling.firstChild;
        opencloseImgElem.src = qx.manager.object.AliasManager.getInstance().resolvePath(showDetails ? 'api/image/close.gif' : 'api/image/open.gif');

        // Update content
        var info = typeInfo.infoFactory.call(this, node, nodeType, fromClassNode, showDetails);
        textDiv.innerHTML = info.textHtml;
        this._fixLinks(textDiv);
      }
      catch(exc)
      {
        this.error("Toggling item details failed", exc);
      }
    },


    /**
     * Event handler. Called when the user clicked on the "show inherited ..." checkbox.
     *
     * @type member
     * @return {void}
     */
    _onInheritedCheckBoxClick : function()
    {
      this._showInherited = document.getElementById("showInherited").checked;
      this._updateInfoViewers();
    },


    /**
     * Event handler. Called when the user clicked on the "show protected ..." checkbox.
     *
     * @type member
     * @return {void}
     */
    _onProtectedCheckBoxClick : function()
    {
      this._showProtected = document.getElementById("showProtected").checked;
      this._updateInfoViewers();
    },


    /**
     * Event handler. Called when the user clicked a button for showing/hiding the
     * body of an info panel.
     *
     * @type member
     * @param nodeType {Integer} the node type of which the show/hide-body-button was
     *          clicked.
     * @return {void}
     */
    _onShowInfoPanelBodyClicked : function(nodeType)
    {
      try
      {
        var typeInfo = this._infoPanelHash[nodeType];
        typeInfo.isOpen = !typeInfo.isOpen;

        var imgElem = typeInfo.infoTitleElem.getElementsByTagName("img")[0];
        imgElem.src = qx.manager.object.AliasManager.getInstance().resolvePath(typeInfo.isOpen ? 'api/image/close.gif' : 'api/image/open.gif');

        this._updateInfoPanel(nodeType);
      }
      catch(exc)
      {
        this.error("Toggling info body failed", exc);
      }
    },


    /**
     * Gets the HTML element showing the details of an item.
     *
     * @type member
     * @param nodeType {Integer} the node type of the item.
     * @param name {String} the item's name.
     * @return {Element} the HTML element showing the details of the item.
     */
    _getItemElement : function(nodeType, name)
    {
      var typeInfo = this._infoPanelHash[nodeType];
      var elemArr = typeInfo.infoBodyElem.getElementsByTagName("TBODY")[0].childNodes;

      for (var i=0; i<elemArr.length; i++)
      {
        // ARRG, should be implemented in a more fault-tolerant way
        // iterate over tr's, look inside the third "td" and there the second element
        if (elemArr[i].childNodes[3].childNodes[1].getAttribute("_itemName") == name) {
          return elemArr[i].childNodes[3].childNodes[1];
        }
      }
    },


    /**
     * Selects an item.
     *
     * @type member
     * @param itemName {String} the name of the item.
     * @return {void}
     * @see ApiViewer#selectItem
     */
    _selectItem : function(itemName)
    {
      try
      {
        apiviewer.Viewer.instance.selectItem(itemName);
        qx.ui.core.Widget.flushGlobalQueues();
      }
      catch(exc)
      {
        this.error("Selecting item '" + itemName + "' failed", exc);
      }
    },


    /**
     * Gets the doc node of a class.
     *
     * @type member
     * @param className {String} the name of the class.
     * @return {Map} the doc node of the class.
     */
    _getClassDocNode : function(className)
    {
      if (className) {
        return apiviewer.TreeUtil.getClassDocNode(apiviewer.Viewer.instance.getDocTree(), className);
      } else {
        return null;
      }
    },


    /**
     * Creates the HTML showing the information about a property.
     *
     * @type member
     * @param node {Map} the doc node of the property.
     * @param nodeType {Integer} the node type of the property.
     * @param fromClassNode {Map} the doc node of the class the property was defined.
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the property.
     */
    _createPropertyInfo : function(node, nodeType, fromClassNode, showDetails)
    {
      var ClassViewer = apiviewer.ClassViewer;

      var info = {};

      var typeInfo = this._infoPanelHash[nodeType];

      // Get the property node that holds the documentation
      var docClassNode = fromClassNode;
      var docNode = node;

      if (node.attributes.docFrom)
      {
        docClassNode = this._getClassDocNode(node.attributes.docFrom);
        var listNode = apiviewer.TreeUtil.getChild(docClassNode, typeInfo.listName);
        docNode = apiviewer.TreeUtil.getChildByAttribute(listNode, "name", node.attributes.name);
      }

      // Add the title
      info.typeHtml = this._createTypeHtml(node, fromClassNode, "var");
      info.titleHtml = node.attributes.name;

      // Add the description
      info.textHtml = this._createDescHtml(docNode, fromClassNode, showDetails);

      if (showDetails)
      {
        // Add allowed values
        var allowedValue = null;

        if (node.attributes.possibleValues) {
          allowedValue = node.attributes.possibleValues;
        } else if (node.attributes.classname) {
          allowedValue = "instances of " + node.attributes.classname;
        } else if (node.attributes.instance) {
          allowedValue = "instances of " + node.attributes.instance + " or sub classes";
        } else if (node.attributes.unitDetection) {
          allowedValue = "units: " + node.attributes.unitDetection;
        } else if (node.attributes.type) {
          allowedValue = "any " + node.attributes.type;
        }

        if (allowedValue)
        {
          info.textHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + "Allowed values:" + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT;

          if (node.attributes.allowNull != "false") {
            info.textHtml += "null, ";
          }

          info.textHtml += allowedValue + ClassViewer.DIV_END;
        }

        // Add default value
        info.textHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + "Default value:" + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT + (node.attributes.defaultValue ? node.attributes.defaultValue : "null") + ClassViewer.DIV_END;

        // Add get alias
        if (node.attributes.getAlias) {
          info.textHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + "Get alias:" + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT + node.attributes.getAlias + ClassViewer.DIV_END;
        }

        // Add set alias
        if (node.attributes.setAlias) {
          info.textHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + "Set alias:" + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT + node.attributes.setAlias + ClassViewer.DIV_END;
        }

        // Add inherited from or overridden from
        if (fromClassNode && fromClassNode != this._currentClassDocNode) {
          if (fromClassNode.attributes.type == "mixin") {
            info.textHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + "Included from mixin:" + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT + this._createItemLinkHtml(fromClassNode.attributes.fullName) + ClassViewer.DIV_END;
          } else {
            info.textHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + "Inherited from:" + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT + this._createItemLinkHtml(fromClassNode.attributes.fullName) + ClassViewer.DIV_END;
          }
        } else if (node.attributes.overriddenFrom) {
          info.textHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + "Overridden from:" + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT + this._createItemLinkHtml(node.attributes.overriddenFrom) + ClassViewer.DIV_END;
        }

        // Add required by interface
        info.textHtml += this._createInfoRequiredByHtml(node);

        // Add @see attributes
        info.textHtml += this._createSeeAlsoHtml(docNode, docClassNode);

        // Add documentation errors
        info.textHtml += this._createErrorHtml(docNode, docClassNode);
      }

      return info;
    },


    /**
     * Checks whether an event has details.
     *
     * @type member
     * @param node {Map} the doc node of the event.
     * @param nodeType {Integer} the node type of the event.
     * @param fromClassNode {Map} the doc node of the class the event was defined.
     * @return {Boolean} whether the event has details.
     */
    _eventHasDetails : function(node, nodeType, fromClassNode) {
      return (fromClassNode != this._currentClassDocNode) // event is inherited
      || this._hasSeeAlsoHtml(node) || this._hasErrorHtml(node) || this._descHasDetails(node);
    },


    /**
     * Creates the HTML showing the information about an event.
     *
     * @type member
     * @param node {Map} the doc node of the event.
     * @param nodeType {Integer} the node type of the event.
     * @param fromClassNode {Map} the doc node of the class the event was defined.
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the event.
     */
    _createEventInfo : function(node, nodeType, fromClassNode, showDetails)
    {
      var ClassViewer = apiviewer.ClassViewer;

      var info = {};

      var typeInfo = this._infoPanelHash[nodeType];

      // Add the title
      info.typeHtml = this._createTypeHtml(node, fromClassNode, "var");
      info.titleHtml = node.attributes.name;

      // Add the description
      info.textHtml = this._createDescHtml(node, fromClassNode, showDetails);

      if (showDetails)
      {
        // Add inherited from or overridden from
        if (fromClassNode && fromClassNode != this._currentClassDocNode) {
          info.textHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + "Inherited from:" + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT + this._createItemLinkHtml(fromClassNode.attributes.fullName) + ClassViewer.DIV_END;
        }

        // Add @see attributes
        info.textHtml += this._createSeeAlsoHtml(node, fromClassNode);

        // Add documentation errors
        info.textHtml += this._createErrorHtml(node, fromClassNode);
      }

      return info;
    },


    /**
     * Checks whether a method has details.
     *
     * @type member
     * @param node {Map} the doc node of the method.
     * @param nodeType {Integer} the node type of the method.
     * @param fromClassNode {Map} the doc node of the class the method was defined.
     * @return {Boolean} whether the method has details.
     */
    _methodHasDetails : function(node, nodeType, fromClassNode)
    {
      var TreeUtil = apiviewer.TreeUtil;

      var typeInfo = this._infoPanelHash[nodeType];

      // Get the method node that holds the documentation
      var docClassNode = fromClassNode;
      var docNode = node;

      if (node.attributes.docFrom)
      {
        docClassNode = this._getClassDocNode(node.attributes.docFrom);
        var listNode = TreeUtil.getChild(docClassNode, typeInfo.listName);
        docNode = TreeUtil.getChildByAttribute(listNode, "name", node.attributes.name);
      }

      // Check whether there are details
      var hasParams = TreeUtil.getChild(docNode, "params") != null;
      var hasReturn = TreeUtil.getChild(docNode, "return") != null;
      var isOverridden = fromClassNode != this._currentClassDocNode;

      return (
           (fromClassNode != this._currentClassDocNode)       // method is inherited
        || (node.attributes.overriddenFrom != null)           // method is overridden
        || (node.attributes.requiredBy)                       // method is required by an interface
        || (TreeUtil.getChild(docNode, "params") != null)     // method has params
        || (TreeUtil.getChild(docNode, "return") != null)     // method has return value
        || this._hasSeeAlsoHtml(docNode)
        || this._hasErrorHtml(docNode)
        || this._descHasDetails(docNode)
      );
    },


    /**
     * Creates the HTML showing the information about a method.
     *
     * @type member
     * @param node {Map} the doc node of the method.
     * @param nodeType {Integer} the node type of the method.
     * @param fromClassNode {Map} the doc node of the class the method was defined.
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the method.
     */
    _createMethodInfo : function(node, nodeType, fromClassNode, showDetails)
    {
      var ClassViewer = apiviewer.ClassViewer;
      var TreeUtil = apiviewer.TreeUtil;

      var info = {};

      var typeInfo = this._infoPanelHash[nodeType];

      // Get the method node that holds the documentation
      var docClassNode = fromClassNode;
      var docNode = node;

      if (node.attributes.docFrom)
      {
        docClassNode = this._getClassDocNode(node.attributes.docFrom);
        var listNode = TreeUtil.getChild(docClassNode, typeInfo.listName);
        docNode = TreeUtil.getChildByAttribute(listNode, "name", node.attributes.name);
      }

      if (node.attributes.isAbstract) {
        info.typeHtml = "abstract ";
      } else {
        info.typeHtml = "";
      }

      // Get name, icon and return type
      var returnNode = TreeUtil.getChild(docNode, "return");

      if (node.attributes.isCtor) {
        info.titleHtml = fromClassNode.attributes.name;
      }
      else
      {
        info.titleHtml = node.attributes.name;
        info.typeHtml += this._createTypeHtml(returnNode, fromClassNode, "void");
      }

      // Add the title (the method signature)
      info.titleHtml += '<span class="methodSignature"> <span class="parenthesis">(</span>';
      var paramsNode = TreeUtil.getChild(docNode, "params");

      if (paramsNode)
      {
        for (var i=0; i<paramsNode.children.length; i++)
        {
          var param = paramsNode.children[i];

          if (i != 0) {
            info.titleHtml += '<span class="separator">,</span> ';
          }

          info.titleHtml += '<span class="parameterType">' + this._createTypeHtml(param, fromClassNode, "var") + '</span> <span class="parameterName">' + param.attributes.name + '</span>';

          if (param.attributes.defaultValue) {
            info.titleHtml += "?";
          }
        }
      }

      info.titleHtml += '<span class="parenthesis">)</span></span>';

      // Add the description
      var descNode = apiviewer.TreeUtil.getChild(docNode, "desc");
      var hasDescription = descNode && descNode.attributes.text;
      if (node.attributes.isCtor && !hasDescription) {
        info.textHtml = "Creates a new instance of " + fromClassNode.attributes.name + ".";
      } else {
        info.textHtml = this._createDescHtml(docNode, docClassNode, showDetails);
      }

      if (showDetails)
      {
        // Add Parameters
        var paramsNode = TreeUtil.getChild(docNode, "params");

        if (paramsNode)
        {
          info.textHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + "Parameters:" + ClassViewer.DIV_END;

          for (var i=0; i<paramsNode.children.length; i++)
          {
            var param = paramsNode.children[i];
            var paramType = param.attributes.type ? param.attributes.type : "var";
            var dims = param.attributes.arrayDimensions;

            if (dims)
            {
              for (var i=0; i<dims; i++) {
                paramType += "[]";
              }
            }

            var defaultValue = param.attributes.defaultValue;

            info.textHtml += ClassViewer.DIV_START_DETAIL_TEXT;

            if (defaultValue) {
              info.textHtml += ClassViewer.SPAN_START_OPTIONAL;
            }

            info.textHtml += ClassViewer.SPAN_START_PARAM_NAME + param.attributes.name + ClassViewer.SPAN_END;

            if (defaultValue) {
              info.textHtml += " (default: " + defaultValue + ") " + ClassViewer.SPAN_END;
            }

            var paramDescNode = TreeUtil.getChild(param, "desc");

            if (paramDescNode) {
              info.textHtml += " " + this._createDescriptionHtml(paramDescNode.attributes.text, docClassNode);
            }

            info.textHtml += ClassViewer.DIV_END;
          }
        }

        // Add return value
        if (returnNode)
        {
          var returnDescNode = TreeUtil.getChild(returnNode, "desc");

          if (returnDescNode) {
            info.textHtml += ClassViewer.DIV_START_DETAIL_HEADLINE + "Returns:" + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT + this._createDescriptionHtml(returnDescNode.attributes.text, docClassNode) + ClassViewer.DIV_END;
          }
        }

        // Add inherited from or overridden from
        if (fromClassNode && fromClassNode != this._currentClassDocNode) {
          if (fromClassNode.attributes.type == "mixin") {
            info.textHtml +=
              ClassViewer.DIV_START_DETAIL_HEADLINE + "Included from mixin:" +
              ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT +
              this._createItemLinkHtml(fromClassNode.attributes.fullName) + ClassViewer.DIV_END;

          } else {
            info.textHtml +=
              ClassViewer.DIV_START_DETAIL_HEADLINE + "Inherited from:" +
              ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT +
              this._createItemLinkHtml(fromClassNode.attributes.fullName) + ClassViewer.DIV_END;

          }
        } else if (node.attributes.overriddenFrom) {
          info.textHtml +=
            ClassViewer.DIV_START_DETAIL_HEADLINE + "Overridden from:" + ClassViewer.DIV_END +
            ClassViewer.DIV_START_DETAIL_TEXT + this._createItemLinkHtml(node.attributes.overriddenFrom) + ClassViewer.DIV_END;

        }

        // Add required by interface
        info.textHtml += this._createInfoRequiredByHtml(node);

        // Add @see attributes
        info.textHtml += this._createSeeAlsoHtml(docNode, docClassNode);

        // Add documentation errors
        info.textHtml += this._createErrorHtml(docNode, docClassNode);
      }

      return info;
    },


    /**
     * Checks whether a constant has details.
     *
     * @type member
     * @param node {Map} the doc node of the constant.
     * @param nodeType {Integer} the node type of the constant.
     * @param fromClassNode {Map} the doc node of the class the constant was defined.
     * @return {Boolean} whether the constant has details.
     */
    _constantHasDetails : function(node, nodeType, fromClassNode) {
      return (this._hasSeeAlsoHtml(node) || this._hasErrorHtml(node) || this._descHasDetails(node) || this._hasConstantValueHtml(node));
    },


    /**
     * Creates the HTML showing the information about a constant.
     *
     * @type member
     * @param node {Map} the doc node of the constant.
     * @param nodeType {Integer} the node type of the constant.
     * @param fromClassNode {Map} the doc node of the class the constant was defined.
     * @param showDetails {Boolean} whether to show the details.
     * @return {String} the HTML showing the information about the constant.
     */
    _createConstantInfo : function(node, nodeType, fromClassNode, showDetails)
    {
      var info = {};

      // Add the title
      info.typeHtml = this._createTypeHtml(node, fromClassNode, "var");
      info.titleHtml = node.attributes.name;

      // Add the description
      info.textHtml = this._createDescHtml(node, fromClassNode, showDetails);

      if (showDetails)
      {
        info.textHtml += this._createConstantValueHtml(node, fromClassNode);

        // Add @see attributes
        info.textHtml += this._createSeeAlsoHtml(node, fromClassNode);

        // Add documentation errors
        info.textHtml += this._createErrorHtml(node, fromClassNode);
      }

      return info;
    },


    /**
     * Returns whether the description of an item has details (has more than one
     * sentence).
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @return {Boolean} whether the description of an item has details.
     */
    _descHasDetails : function(node)
    {
      var descNode = apiviewer.TreeUtil.getChild(node, "desc");

      if (descNode)
      {
        var desc = descNode.attributes.text;
        return this._extractFirstSentence(desc) != desc;
      }
      else
      {
        return false;
      }
    },


    /**
     * Creates the HTML showing the description of an item.
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @param fromClassNode {Map} the doc node of the class the item was defined.
     * @param showDetails {Boolean} whether to show details. If <code>false</code>
     *          only the first sentence of the description will be shown.
     * @return {String} the HTML showing the description.
     */
    _createDescHtml : function(node, fromClassNode, showDetails)
    {
      var descNode = apiviewer.TreeUtil.getChild(node, "desc");

      if (descNode)
      {
        var desc = descNode.attributes.text;

        if (!showDetails) {
          desc = this._extractFirstSentence(desc);
        }

        return apiviewer.ClassViewer.DIV_START_DESC + this._createDescriptionHtml(desc, fromClassNode) + apiviewer.ClassViewer.DIV_END;
      }
      else
      {
        return "";
      }
    },


    /**
     * Extracts the first sentence from a text.
     *
     * @type member
     * @param text {String} the text.
     * @return {String} the first sentence from the text.
     */
    _extractFirstSentence : function(text)
    {
      var ret = text;

      // Extract first block
      var pos = ret.indexOf("</p>");

      if (pos != -1)
      {
        ret = ret.substr(0, pos + 4);

        var hit = apiviewer.ClassViewer.SENTENCE_END_REGEX.exec(ret);

        if (hit != null) {
          ret = text.substring(0, hit.index + hit[0].length - 1) + "</p>";
        }
      }

      return ret;
    },


    /**
     * Checks whether a constant value is provided
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @return {Boolean} whether the constant provides a value
     */
    _hasConstantValueHtml : function(node) {
      return node.attributes.value ? true : false;
    },


    /**
     * Creates the HTML showing the value of a constant
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @param fromClassNode {Map} the doc node of the class the item was defined.
     * @return {String} the HTML showing the value of the constant
     */
    _createConstantValueHtml : function(node, fromClassNode)
    {
      var ClassViewer = apiviewer.ClassViewer;
      this.debug(node.attributes.value);

      if (this._hasConstantValueHtml(node)) {
        return (ClassViewer.DIV_START_DETAIL_HEADLINE + "Value: " + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT + qx.html.String.escape(qx.io.Json.stringify(node.attributes.value)) + ClassViewer.DIV_END);
      } else {
        return "";
      }
    },


    /**
     * Creates the HTML showing interfaces requiring this node
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @return {String} the HTML.
     */
    _createInfoRequiredByHtml : function(node)
    {
      var ClassViewer = apiviewer.ClassViewer;
      var html = "";
      if (node.attributes.requiredBy) {
        var requiredBy = node.attributes.requiredBy.split(",");
        html += ClassViewer.DIV_START_DETAIL_HEADLINE + "Required by:" + ClassViewer.DIV_END;
        for (var i=0; i<requiredBy.length; i++) {
          html +=
            ClassViewer.DIV_START_DETAIL_TEXT +
            this._createItemLinkHtml(requiredBy[i]) +
            ClassViewer.DIV_END;
        }
      }
      return html;
    },


    /**
     * Checks whether a item has &#64;see attributes.
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @return {Boolean} whether the item has &#64;see attributes.
     */
    _hasSeeAlsoHtml : function(node) {
      return apiviewer.TreeUtil.getChild(node, "see") ? true : false;
    },


    /**
     * Creates the HTML showing the &#64;see attributes of an item.
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @param fromClassNode {Map} the doc node of the class the item was defined.
     * @return {String} the HTML showing the &#64;see attributes.
     */
    _createSeeAlsoHtml : function(node, fromClassNode)
    {
      var ClassViewer = apiviewer.ClassViewer;

      var descNode = apiviewer.TreeUtil.getChild(node, "see");

      if (node.children)
      {
        var seeAlsoHtml = "";

        for (var i=0; i<node.children.length; i++)
        {
          if (node.children[i].type == "see")
          {
            // This is a @see attribute
            if (seeAlsoHtml.length != 0) {
              seeAlsoHtml += ", ";
            }

            seeAlsoHtml += this._createItemLinkHtml(node.children[i].attributes.name, fromClassNode);
          }
        }

        if (seeAlsoHtml.length != 0)
        {
          // We had @see attributes
          return ClassViewer.DIV_START_DETAIL_HEADLINE + "See also:" + ClassViewer.DIV_END + ClassViewer.DIV_START_DETAIL_TEXT + seeAlsoHtml + ClassViewer.DIV_END;
        }
      }

      // Nothing found
      return "";
    },


    /**
     * Checks whether a item has documentation errors.
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @return {Boolean} whether the item has documentation errors.
     */
    _hasErrorHtml : function(node)
    {
      var errorNode = apiviewer.TreeUtil.getChild(node, "errors");
      return (errorNode != null);
    },


    /**
     * Creates the HTML showing the documentation errors of an item.
     *
     * @type member
     * @param node {Map} the doc node of the item.
     * @param fromClassNode {Map} the doc node of the class the item was defined.
     * @return {String} the HTML showing the documentation errors.
     */
    _createErrorHtml : function(node, fromClassNode)
    {
      var ClassViewer = apiviewer.ClassViewer;

      var errorNode = apiviewer.TreeUtil.getChild(node, "errors");

      if (errorNode)
      {
        var html = ClassViewer.DIV_START_ERROR_HEADLINE + "Documentation errors:" + ClassViewer.DIV_END;
        var errArr = errorNode.children;

        for (var i=0; i<errArr.length; i++)
        {
          html += ClassViewer.DIV_START_DETAIL_TEXT + errArr[i].attributes.msg + " <br/>";
          html += "(";

          if (fromClassNode && fromClassNode != this._currentClassDocNode) {
            html += fromClassNode.attributes.fullName + "; ";
          }

          html += "Line: " + errArr[i].attributes.line + ", Column:" + errArr[i].attributes.column + ")" + ClassViewer.DIV_END;
        }

        return html;
      }
      else
      {
        return "";
      }
    },


    /**
     * Creates the HTML showing the type of a doc node.
     *
     * @type member
     * @param typeNode {Map} the doc node to show the type for.
     * @param packageBaseClass {Map} the doc node of the class <code>typeNode</code>
     *          belongs to.
     * @param defaultType {String} the type name to use if <code>typeNode</code> is
     *          <code>null</code> or defines no type.
     * @param useShortName {Boolean,true} whether to use short class names
     *          (without package).
     * @return {String} the HTML showing the type.
     */
    _createTypeHtml : function(typeNode, packageBaseClass, defaultType, useShortName)
    {
      if (useShortName == null) {
        useShortName = true;
      }

      var types = [];
      var typeHtml, typeDimensions, typeName, linkText, dims;

      if (typeNode)
      {
        // read in children
        if (typeNode.children && apiviewer.TreeUtil.getChild(typeNode, "types"))
        {
          for (var i=0, a=apiviewer.TreeUtil.getChild(typeNode, "types").children, l=a.length; i<l; i++)
          {
            if (a[i].type == "entry") {
              types.push(a[i].attributes);
            }
          }
        }

        // read from attributes (alternative)
        if (types.length == 0 && typeNode.attributes)
        {
          typeName = typeNode.attributes.instance ? typeNode.attributes.instance : typeNode.attributes.type;

          if (typeName != undefined)
          {
            dims = typeNode.attributes.dimensions;

            if (typeof dims == "number" && dims > 0)
            {
              types.push(
              {
                "type"       : typeName,
                "dimensions" : dims
              });
            }
            else
            {
              types.push({ "type" : typeName });
            }
          }
        }
      }

      if (types.length == 0) {
        typeHtml = defaultType;
      }
      else
      {
        typeHtml = "";

        if (types.length > 1) {
          typeHtml += "(";
        }

        for (var j=0; j<types.length; j++)
        {
          if (j > 0) {
            typeHtml += " | ";
          }

          typeName = types[j].type;
          typeDimensions = types[j].dimensions;

          if (apiviewer.ClassViewer.PRIMITIVES[typeName]) {
            typeHtml += typeName;
          }
          else
          {
            linkText = typeName;

            if (useShortName)
            {
              var lastDot = typeName.lastIndexOf(".");

              if (lastDot != -1) {
                linkText += " " + typeName.substring(lastDot + 1);
              }
            }

            typeHtml += this._createItemLinkHtml(linkText, packageBaseClass, false, true);
          }

          if (typeDimensions)
          {
            for (var i=0; i<parseInt(typeDimensions); i++) {
              typeHtml += "[]";
            }
          }
        }

        if (types.length > 1) {
          typeHtml += ")";
        }
      }

      return typeHtml;
    },


    /**
     * Creates HTML that replaces all &#64;link-attributes with links.
     *
     * @type member
     * @param description {String} the description.
     * @param packageBaseClass {Map,null} the doc node of the class to use for
     *          auto-adding packages.
     * @return {var} TODOC
     */
    _createDescriptionHtml : function(description, packageBaseClass)
    {
      var linkRegex = /\{@link([^\}]*)\}/mg;

      var html = "";
      var hit;
      var lastPos = 0;

      while ((hit = linkRegex.exec(description)) != null)
      {
        // Add the text before the link
        html += description.substring(lastPos, hit.index) + this._createItemLinkHtml(hit[1], packageBaseClass);

        lastPos = hit.index + hit[0].length;
      }

      // Add the text after the last hit
      html += description.substring(lastPos, description.length);

      return html;
    },


    /**
     * Creates the HTML for a link to an item.
     *
     * @type member
     * @param linkText {String} the link text
     *          (e.g. "mypackage.MyClass#myMethod alt text")
     * @param packageBaseClass {Map,null} the doc node of the class to use when
     *          auto-adding the package to a class name having no package specified.
     *          If null, no automatic package addition is done.
     * @param useIcon {Boolean,true} whether to add an icon to the link.
     * @param useShortName {Boolean,false} whether to use the short name.
     * @return {var} TODOC
     */
    _createItemLinkHtml : function(linkText, packageBaseClass, useIcon, useShortName)
    {
      if (useIcon == null) {
        useIcon = true;
      }

      linkText = qx.lang.String.trim(linkText);

      if (linkText.charAt(0) == '"' || linkText.charAt(0) == '<')
      {
        // This is a String or a link to a URL -> Just use it as it is
        return linkText;
      }
      else
      {
        // This is a link to another class or method -> Create an item link
        // Separate item name from label
        var hit = apiviewer.ClassViewer.ITEM_SPEC_REGEX.exec(linkText);

        if (hit == null)
        {
          // Malformed item name
          return linkText;
        }
        else
        {
          var className = hit[2];
          var itemName = hit[3];
          var label = hit[6];

          // Make the item name absolute
          if (className == null || className.length == 0)
          {
            // This is a relative link to a method -> Add the current class
            className = packageBaseClass.attributes.fullName;
          }
          else if (packageBaseClass && className.indexOf(".") == -1)
          {
            // The class name has no package -> Use the same package as the current class
            var name = packageBaseClass.attributes.name;
            var fullName = packageBaseClass.attributes.fullName;
            var packageName = fullName.substring(0, fullName.length - name.length);
            className = packageName + className;
          }

          // Get the node info
          if (label == null || label.length == 0)
          {
            // We have no label -> Use the item name as label
            label = hit[1];
          }

          // Add the right icon
          if (useIcon)
          {
            var classNode = this._getClassDocNode(className);

            if (classNode)
            {
              var itemNode;

              if (itemName)
              {
                // The links points to a item of the class
                var cleanItemName = itemName.substring(1);
                var parenPos = cleanItemName.indexOf("(");

                if (parenPos != -1) {
                  cleanItemName = qx.lang.String.trim(cleanItemName.substring(0, parenPos));
                }

                itemNode = apiviewer.TreeUtil.getItemDocNode(classNode, cleanItemName);
              }
              else
              {
                // The links points to the class
                itemNode = classNode;
              }

              if (itemNode)
              {
                var iconUrl = apiviewer.TreeUtil.getIconUrl(itemNode);
                var iconCode = apiviewer.ClassViewer.createImageHtml(iconUrl);
              }
            }
          }

          // Create a real bookmarkable link
          // NOTE: The onclick-handler must be added by HTML code. If it
          //       is added using the DOM element then the href is followed.
          var fullItemName = className + (itemName ? itemName : "");

          return (
            '<span style="white-space: nowrap;">' +
            (typeof iconCode != "undefined" ?  iconCode : "") +
            '<a href="' + window.location.protocol + '//' +
            window.location.pathname + '#' + fullItemName +
            '" onclick="' + 'document._detailViewer._selectItem(\'' +
            fullItemName + '\'); return false;"' + ' title="' +
            fullItemName + '">' + label + '</a></span>'
          );
        }
      }
    },


    /**
     * Gets the node type for a doc node.
     *
     * @type member
     * @param itemNode {Map} the doc node of the item.
     * @return {Integer} the item's node type.
     */
    _getTypeForItemNode : function(itemNode)
    {
      var ClassViewer = apiviewer.ClassViewer;

      if (itemNode.type == "constant") {
        return ClassViewer.NODE_TYPE_CONSTANT;
      } else if (itemNode.type == "property") {
        return ClassViewer.NODE_TYPE_PROPERTY;
      } else if (itemNode.type == "event") {
        return ClassViewer.NODE_TYPE_EVENT;
      }
      else if (itemNode.type == "method")
      {
        var name = itemNode.attributes.name;

        if (name == null) {
          return ClassViewer.NODE_TYPE_CONSTRUCTOR;
        }
        else
        {
          if (itemNode.attributes.isStatic) {
            return ClassViewer.NODE_TYPE_METHOD_STATIC;
          } else {
            return ClassViewer.NODE_TYPE_METHOD;
          }
        }
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjectDeep("_infoPanelHash", 1);
    this._disposeFields("_titleElem", "_classDescElem", "_markedElement");
    document._detailViewer = null;
  }
});
