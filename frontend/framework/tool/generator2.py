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
#
################################################################################

import sys, re, os, optparse, math, cPickle, copy, sets, zlib

# reconfigure path to import own modules from modules subfolder
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), "modules"))

import config, tokenizer, tree, treegenerator, treeutil, optparseext, filetool
import compiler, textutil, mapper
import variantoptimizer
import variableoptimizer, stringoptimizer, basecalloptimizer, privateoptimizer






######################################################################
#  MAIN CONTENT
######################################################################

def main():
    print "============================================================================"
    print "    INITIALIZATION"
    print "============================================================================"
        
    parser = optparse.OptionParser(option_class=optparseext.ExtendAction)
    
    parser.add_option("--config", dest="config", metavar="FILENAME", help="Configuration file")
    parser.add_option("--jobs", action="extend", dest="jobs", metavar="DIRECTORY", type="string", default=[], help="Selected jobs")
    parser.add_option("-q", "--quiet", action="store_true", dest="quiet", default=False, help="Quiet output mode (Extra quiet).")
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="Verbose output mode (Extra verbose).")
    
    if len(sys.argv[1:]) == 0:
        basename = os.path.basename(sys.argv[0])
        print "usage: %s [options]" % basename
        print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
        sys.exit(1)

    (options, args) = parser.parse_args(sys.argv[1:])
    
    process(options)
    
    
def process(options):
    global verbose
    global quiet
    
    verbose = options.verbose
    quiet = options.quiet
    
    if verbose:
        quiet = False

    print ">>> Processing..."
    if not quiet:
        print "  - Configuration: %s" % options.config
        print "  - Jobs: %s" % ", ".join(options.jobs)
    
    
    # TODO: File parser
    # - Translate dashed to camelcase
    # - Translate "true" to Python "True"
    
    # Include/Exclude hints
    #
    # class/module =>
    #   include items with their dependencies
    #   exclude items, also remove items not needed by other modules than the removed ones
    #
    # =class/module => 
    #   explicit include/exclude of given module or class
    #

    config = {
        "common" : 
        {
            "classPath" : 
            [ 
                "framework/source/class", 
                "application/apiviewer/source/class", 
                "application/feedreader/source/class",
                "application/webmail/source/class",
                "application/showcase/source/class"
            ],
            
            "require" :
            {
                "qx.log.Logger" : ["qx.log.appender.Native"]
            }
        },
      
        "source" : 
        {
            "extend" : ["common"],
            "sourceScript" : "source.js"
        },
      



        "build-common" :
        {
            "extend" : ["common"],
            "optimizeVariables" : True,
        },
      
        "build-core" : 
        {
            "extend" : ["build-common"],
            "buildScript" : "build-core",
            "include" : ["apiviewer.Application"],
            "exclude" : ["ui_tree","=qx.ui.core.Widget"]
        },

        "build-apiviewer" : 
        {
            "extend" : ["build-common"],
            "buildScript" : "build-apiviewer",
            "include" : ["apiviewer.*","qx.theme.ClassicRoyale"],
            "buildProcess" : 
            [
                "optimize-variables",
                "optimize-basecalls",
                "optimize-strings",
                "optimize-privates"
            ]
        },    
        
        "build-apiviewer-variants" : 
        {
            "extend" : ["build-common"],
            "buildScript" : "build-apiviewer-variants",
            "include" : ["apiviewer.*","qx.theme.ClassicRoyale"],
            "variants" : 
            {
                #"qx.debug" : ["on","off"],
                "qx.debug" : ["off"],
                "qx.aspects" : ["off"],
                #"qx.client" : ["gecko","mshtml","webkit","opera"],
                "qx.client" : ["gecko","mshtml"]
            },
            "buildProcess" : 
            [
                "optimize-variables",
                "optimize-basecalls",
                "optimize-strings"
            ]
        },             
        
        "build-feedreader" : 
        {
            "extend" : ["build-common"],
            "buildScript" : "build-feedreader",
            "include" : ["feedreader.Application"]
        },    
        
        
        
        "build-views-common" :
        {
            "extend" : ["build-common"],
            "optimizeLatency" : 5000
        },            
        
        "build-app-views" : 
        {
            "extend" : ["build-views-common"],
            "buildScript" : "build-app-views",
            #"collapseViews" : ["webmail","feedreader","showcase"],
            "views" : 
            {
                "apiviewer" : ["apiviewer.Application"],
                "feedreader" : ["feedreader.Application"],
                "webmail" : ["webmail.Application"],
                "showcase" : ["showcase.Application"]
            }
        },
        
        "build-comp-views" :
        {
            "extend" : ["build-views-common"],
            "buildScript" : "build-comp-views",
            "views" : 
            {
                "tree" : ["ui_tree"],
                "colorselector" : ["qx.ui.component.ColorSelector"],
                "window" : ["ui_window"],
                "toolbar" : ["ui_toolbar", "ui_menu"],
                "table" : ["ui_table"],
                "form" : ["ui_form"]
            }
        },
        
        "build-feedreader-views" : 
        {
            "extend" : ["build-views-common"],
            "buildScript" : "build-feedreader-views",
            "collapseViews" : ["core"],
            "views" : 
            {
                "core" : ["feedreader.Application","qx.theme.ClassicRoyale"],
                "table" : ["qx.ui.table.Table", "qx.ui.table.model.Simple", "qx.ui.table.columnmodel.Resize"],
                "article" : ["feedreader.ArticleView"],
                "preferences" : ["ui_window"]
            }  
        },
        
        "build-apiviewer-views" :
        {
            "extend" : ["build-views-common"],
            "buildScript" : "build-apiviewer-views",
            "variants" : 
            {
                "qx.debug" : ["off"],
                "qx.client" : ["gecko","mshtml"]
            },
            "collapseViews" : ["core"],
            "views" : 
            {
                "core" : ["apiviewer.Application","qx.theme.ClassicRoyale"],
                "viewer" : ["apiviewer.Viewer"],
                "content" : ["apiviewer.ui.ClassViewer","apiviewer.ui.PackageViewer"]
            }
        },
        
        "build-apiviewer-views-noqx" :
        {
            "extend" : ["build-views-common"],
            "buildScript" : "build-apiviewer-views-noqx",
            "variants" : 
            {
                "qx.debug" : ["off"],
                "qx.client" : ["gecko","mshtml"]
            },
            "collapseViews" : ["core"],
            "include" : ["apiviewer.Application"],
            "exclude" : ["=qx.*"],
            "views" : 
            {
                "core" : ["apiviewer.Application","qx.theme.ClassicRoyale"],
                "viewer" : ["apiviewer.Viewer"],
                "content" : ["apiviewer.ui.ClassViewer","apiviewer.ui.PackageViewer"]
            }
        }            
    }
    
    resolve(config, options.jobs)
    
    for job in options.jobs:
        execute(job, config[job])
        

def resolve(config, jobs):
    print ">>> Resolving jobs..."
    for job in jobs:
        resolveEntry(config, job)
    

def resolveEntry(config, job):
    global quiet
    
    if not config.has_key(job):
        print "  - No such job: %s" % job
        sys.exit(1)

    data = config[job]
    
    if data.has_key("resolved"):
        return
    
    #print "  - Processing: %s" % job

    if data.has_key("extend"):
        includes = data["extend"]
        
        for entry in includes:
            resolveEntry(config, entry)
            mergeEntry(config[job], config[entry])
    
    data["resolved"] = True
    

def mergeEntry(target, source):
    for key in source:
        if not target.has_key(key):
            target[key] = source[key] 
    
    
def execute(job, config):
    global jobconfig
    jobconfig = config
    
    print
    print "============================================================================"
    print "    EXECUTING: %s" % job
    print "============================================================================"

    generateScript()
    





######################################################################
#  CORE: GENERATORS
######################################################################

def getJobConfig(key, default=None):
    global jobconfig
    
    if jobconfig.has_key(key):
        return jobconfig[key]
    else:
        return default
        

def generateScript():
    global classes
    global modules
    global verbose
    global quiet
    
    
    #
    # INITIALIZATION PHASE
    #
    
    # Class paths
    classPaths = getJobConfig("classPath")

    # Script names
    buildScript = getJobConfig("buildScript")
    sourceScript = getJobConfig("sourceScript")

    # Dynamic dependencies
    dynLoadDeps = getJobConfig("require", {})
    dynRunDeps = getJobConfig("use", {})
    
    # Variants data
    # TODO: Variants for source -> Not possible
    userVariants = getJobConfig("variants", {})

    # View support (has priority)
    userViews = getJobConfig("views", {})
    
    # Build relevant post processing
    buildProcess = getJobConfig("buildProcess", [])
        
    userInclude = getJobConfig("include", [])
    userExclude = getJobConfig("exclude", [])
    
    collapseViews = getJobConfig("collapseViews", [])
    optimizeLatency = getJobConfig("optimizeLatency")
    
    
    
    
    #
    # SCAN PHASE
    #
    
    # Scan for classes and modules
    scanClassPaths(classPaths)
    scanModules()
    
    
    
    
    #
    # PREPROCESS PHASE: INCLUDE/EXCLUDE
    #
    
    print ">>> Preparing include/exclude configuration..."    
    smartInclude, explicitInclude = _splitIncludeExcludeList(userInclude)
    smartExclude, explicitExclude = _splitIncludeExcludeList(userExclude)
    

    # Configuration feedback
    if not quiet:
        print "  - Including %s items smart, %s items explicit" % (len(smartInclude), len(explicitInclude))
        print "  - Excluding %s items smart, %s items explicit" % (len(smartExclude), len(explicitExclude))

        if len(userExclude) > 0:
            print "    - Warning: Excludes may break code!"
    
        if len(explicitInclude) > 0:
            print "    - Warning: Explicit included classes may not work"


    # Resolve modules/regexps
    print "  - Resolving modules/regexps..."
    smartInclude = resolveComplexDefs(smartInclude)
    explicitInclude = resolveComplexDefs(explicitInclude)
    smartExclude = resolveComplexDefs(smartExclude)
    explicitExclude = resolveComplexDefs(explicitExclude)
        




    #
    # PREPROCESS PHASE: VIEWS
    #
           
    if len(userViews) > 0:
        print ">>> Preparing view configuration..."    
                
        # Build bitmask ids for views
        if not quiet:
            print    
            
        print "  - Assigning bits to views..."

        # References viewId -> bitId of that view
        viewBits = {}

        viewPos = 0
        for viewId in userViews:
            viewBit = 1<<viewPos
            
            if not quiet:
                print "    - View '%s' => %s" % (viewId, viewBit)
                
            viewBits[viewId] = viewBit
            viewPos += 1

        # Resolving modules/regexps
        print "  - Resolving view modules/regexps..."
        viewClasses = {}
        for viewId in userViews:
            viewClasses[viewId] = resolveComplexDefs(userViews[viewId])

        


    #
    # EXECUTION PHASE
    #
    
    sets = _computeVariantCombinations(userVariants)
    for pos, variants in enumerate(sets):
        print
        print "----------------------------------------------------------------------------"
        print "    PROCESSING VARIANT SET %s/%s" % (pos+1, len(sets))
        print "----------------------------------------------------------------------------"
        if not quiet and len(variants) > 0:
            for entry in variants:
                print "  - %s = %s" % (entry["id"], entry["value"])
            print "----------------------------------------------------------------------------"
        
        
        # Detect dependencies
        print ">>> Resolving dependencies..."
        includeDict = resolveDependencies(smartInclude, smartExclude, dynLoadDeps, dynRunDeps, variants)
        
    
        # Explicit include/exclude
        if len(explicitInclude) > 0 or len(explicitExclude) > 0:
            print ">>> Processing explicitely configured includes/excludes..."
            for entry in explicitInclude:
                includeDict[entry] = True
    
            for entry in explicitExclude:
                if includeDict.has_key(entry):
                    del includeDict[entry]
    
    
        # Detect optionals
        if verbose:
            optionals = getOptionals(includeDict)
            if len(optionals) > 0:
                print ">>> These optional classes may be useful:"
                for entry in optionals:
                    print "  - %s" % entry
                    
                    
                       
        
        if len(userViews) > 0:
            processViews(viewClasses, viewBits, includeDict, dynLoadDeps, dynRunDeps, variants, collapseViews, optimizeLatency, buildScript, buildProcess)
        else:
            processIncludeExclude(includeDict, dynLoadDeps, dynRunDeps, variants, buildScript, buildProcess)

    








######################################################################
#  CORE: CACHE SUPPORT
######################################################################

# Improved version of the one in filetool module
# TODO: Add memcache with controllable size

cachePath = os.path.join(os.path.dirname(os.path.abspath(sys.argv[0])), ".cache") + os.sep
filetool.directory(cachePath)

def readCache(id, segment, dep):
    fileModTime = os.stat(dep).st_mtime

    try:
        cacheModTime = os.stat(cachePath + id + "-" + segment).st_mtime
    except OSError:
        cacheModTime = 0
        
    # Out of date check
    if fileModTime > cacheModTime:
        return None
        
    try:
        return cPickle.load(open(cachePath + id + "-" + segment, 'rb'))

    except (IOError, EOFError, cPickle.PickleError, cPickle.UnpicklingError):
        print ">>> Could not read cache from %s" % cachePath
        return None
    
    
def writeCache(id, segment, content):
    try:
        cPickle.dump(content, open(cachePath + id + "-" + segment, 'wb'), 2)

    except (IOError, EOFError, cPickle.PickleError, cPickle.PicklingError):
        print ">>> Could not store cache to %s" % cachePath
        sys.exit(1)



        
        
        
        
   
######################################################################
#  ZLIB INTERFACE
######################################################################

# calculates a hash code (simple incrementer)
# cache all already calculates inputs for the next session using pickle
# to keep hash codes identical between different sessions
def toHashCode(id):
    global classes
    global hashes
    
    try:
        hashes = cPickle.load(open(cachePath + "hashes", 'rb'))
    except (IOError, EOFError, cPickle.PickleError, cPickle.UnpicklingError):
        hashes = {}
    
    if not hashes.has_key(id):
        hashes[id] = mapper.convert(len(hashes))
        
        try:
            cPickle.dump(hashes, open(cachePath + "hashes", 'wb'), 2)
        except (IOError, EOFError, cPickle.PickleError, cPickle.UnpicklingError):
            print ">>> Could not store hash cache: %s" % cachePath
            sys.exit(1)
    
    return hashes[id]
    


     
        
######################################################################
#  META DATA SUPPORT
######################################################################

def getMeta(id):
    global classes
    
    entry = classes[id]
    path = entry["path"]
    encoding = entry["encoding"]
    
    cache = readCache(id, "meta", path)
    if cache != None:
        return cache
        
    meta = {}
    category = entry["category"]

    if category == "qx.doc":
        pass
        
    elif category == "qx.locale":
        meta["loadtimeDeps"] = ["qx.locale.Locale", "qx.locale.Manager"]
        
    elif category == "qx.impl":
        content = filetool.read(path, encoding)
        
        meta["loadtimeDeps"] = _extractQxLoadtimeDeps(content, id)
        meta["runtimeDeps"] = _extractQxRuntimeDeps(content, id)
        meta["optionalDeps"] = _extractQxOptionalDeps(content)
        meta["ignoreDeps"] = _extractQxIgnoreDeps(content)

        meta["modules"] = _extractQxModules(content)
        meta["resources"] = _extractQxResources(content)
        meta["embeds"] = _extractQxEmbeds(content)    
        
    writeCache(id, "meta", meta)
    
    return meta


def _extractQxLoadtimeDeps(data, fileId=""):
    deps = []

    for item in config.QXHEAD["require"].findall(data):
        if item == fileId:
            print "    - Error: Self-referring load dependency: %s" % item
            sys.exit(1)
        else:
            deps.append(item)

    return deps


def _extractQxRuntimeDeps(data, fileId=""):
    deps = []

    for item in config.QXHEAD["use"].findall(data):
        if item == fileId:
            print "    - Self-referring runtime dependency: %s" % item
        else:
            deps.append(item)

    return deps


def _extractQxOptionalDeps(data):
    deps = []

    # Adding explicit requirements
    for item in config.QXHEAD["optional"].findall(data):
        if not item in deps:
            deps.append(item)

    return deps


def _extractQxIgnoreDeps(data):
    ignores = []

    # Adding explicit requirements
    for item in config.QXHEAD["ignore"].findall(data):
        if not item in ignores:
            ignores.append(item)

    return ignores


def _extractQxModules(data):
    mods = []

    for item in config.QXHEAD["module"].findall(data):
        if not item in mods:
            mods.append(item)

    return mods


def _extractQxResources(data):
    res = []

    for item in config.QXHEAD["resource"].findall(data):
        res.append({ "namespace" : item[0], "id" : item[1], "entry" : item[2] })

    return res


def _extractQxEmbeds(data):
    emb = []

    for item in config.QXHEAD["embed"].findall(data):
        emb.append({ "namespace" : item[0], "id" : item[1], "entry" : item[2] })

    return emb







######################################################################
#  TOKEN/TREE SUPPORT
######################################################################

def getTokens(id):
    global classes
    global verbose
    
    cache = readCache(id, "tokens", classes[id]["path"])
    if cache != None:
        return cache
    
    if verbose:
        print "  - Generating tokens: %s..." % id
    tokens = tokenizer.parseFile(classes[id]["path"], id, classes[id]["encoding"])
    
    writeCache(id, "tokens", tokens)
    return tokens
        
        

def getLength(id):
    return len(getTokens(id))



def getTree(id):
    global classes
    global verbose
    
    cache = readCache(id, "tree", classes[id]["path"])
    if cache != None:
        return cache
    
    tokens = getTokens(id)
    
    if verbose:
        print "  - Generating tree: %s..." % id
    tree = treegenerator.createSyntaxTree(tokens)
    
    writeCache(id, "tree", tree)
    return tree
    

    
def getVariantsTree(id, variants):
    global classes
    global verbose

    variantsId = generateVariantCombinationId(variants)
    
    cache = readCache(id, "tree-" + variantsId, classes[id]["path"])
    if cache != None:
        return cache
            
    # Generate map
    variantsMap = {}
    for entry in variants:
        variantsMap[entry["id"]] = entry["value"]
        
    # Copy tree to work with
    tree = copy.deepcopy(getTree(id))

    if verbose:
        print "  - Select variants: %s..." % id
    
    # Call variant optimizer
    variantoptimizer.search(tree, variantsMap, id)

    # Store result into cache
    writeCache(id, "tree-" + variantsId, tree)
    
    return tree
        


  
        
        



######################################################################
#  INCLUDE/EXCLUDE SUPPORT
######################################################################

def processIncludeExclude(includeDict, loadDeps, runDeps, variants, buildScript, buildProcess):
    global quiet
    

    # Compiling classes
    print ">>> Compiling %s classes" % len(includeList)
    sortedClasses = sortClasses(includeDict, loadDeps, runDeps, variants)
    compiledContent = compileClasses(sortedClasses, variants, buildProcess)


    # Pre storage calculations
    variantsId = generateVariantCombinationId(variants)
    processId = generateProcessCombinationId(buildProcess)
    compiledFileName = "%s_%s_%s.js" % (buildScript, variantsId, processId)
    compressedFileName = compiledFileName + ".gz"


    # Saving compiled content
    if not quiet:
        print "  - Storing script (%s)..." % getContentSize(compiledContent)
    filetool.save(compiledFileName, compiledContent)
    
   
    


def getContentSize(content):
    origSize = len(content) / 1024
    compressedSize = len(zlib.compress(content, 9)) / 1024
      
    return "%sKB => %sKB" % (origSize, compressedSize)




def _splitIncludeExcludeList(input):
    intelli = []
    explicit = []

    for entry in input:
        if entry[0] == "=":
            explicit.append(entry[1:])
        else:
            intelli.append(entry)
    
    return intelli, explicit



def _findCombinations(a):
    result = [[]]
    
    for x in a:
        t = []
        for y in x:
            for i in result:
                t.append(i+[y])
        result = t    

    return result
    
    

def _computeVariantCombinations(variants):
    variantPossibilities = []
    for variantId in variants:
        innerList = []
        for variantValue in variants[variantId]:
            innerList.append({"id" : variantId, "value" : variantValue})
        variantPossibilities.append(innerList)
    
    return _findCombinations(variantPossibilities)


def generateVariantCombinationId(selected):
    def _compare(x, y):
        if x["id"] > y["id"]:
            return 1

        if x["id"] < y["id"]:
            return -1
        
        return 0

    sortedList = []
    sortedList.extend(selected)
    sortedList.sort(_compare)
    
    sortedString = []
    for entry in sortedList:
        sortedString.append("(" + entry["id"].replace(".", "") + "_" + entry["value"] + ")")
        
    return "_".join(sortedString)
    
    
    
    
    
    

######################################################################
#  VIEW/PACKAGE SUPPORT
######################################################################

def processViews(viewClasses, viewBits, includeDict, loadDeps, runDeps, variants, collapseViews, optimizeLatency, outputFile, buildProcess):
    global classes
    global verbose
    global quiet

    
    # Caching dependencies of each view
    if not quiet:
        print
        
    print ">>> Resolving dependencies..."
    viewDeps = {}
    length = len(viewClasses.keys())
    for pos, viewId in enumerate(viewClasses.keys()):
        if not quiet:
            print "  - View '%s'..." % viewId
        
        # Exclude all features of other views
        # and handle dependencies the smart way =>
        # also exclude classes only needed by the
        # already excluded features
        viewExcludes = []
        for subViewId in viewClasses:
            if subViewId != viewId:
                viewExcludes.extend(viewClasses[subViewId])

        # Finally resolve the dependencies
        localDeps = resolveDependencies(viewClasses[viewId], viewExcludes, loadDeps, runDeps, variants)
        
         
        # Remove all dependencies which are not included in the full list       
        if len(includeDict) > 0:
          depKeys = localDeps.keys()
          for dep in depKeys:
              if not dep in includeDict:
                  del localDeps[dep]

        if not quiet:
            print "    - Needs %s classes" % len(localDeps)
        
        viewDeps[viewId] = localDeps


    
    # Assign classes to packages
    if not quiet:
        print
        
    print ">>> Assigning classes to packages..."

    # References packageId -> class list
    packageClasses = {}

    # References packageId -> bit number e.g. 4=1, 5=2, 6=2, 7=3
    packageBitCounts = {}

    for classId in classes:
        packageId = 0
        bitCount = 0
    
        # Iterate through the views use needs this class
        for viewId in viewClasses:
            if classId in viewDeps[viewId]:
                packageId += viewBits[viewId]
                bitCount += 1
    
        # Ignore unused classes
        if packageId == 0:
            continue
    
        # Create missing data structure
        if not packageClasses.has_key(packageId):
            packageClasses[packageId] = []
            packageBitCounts[packageId] = bitCount
        
        # Finally store the class to the package
        packageClasses[packageId].append(classId)
    



    # Assign packages to views
    print ">>> Assigning packages to views..."
    viewPackages = {}

    for viewId in viewClasses:
        viewBit = viewBits[viewId]
    
        for packageId in packageClasses:
            if packageId&viewBit:
                if not viewPackages.has_key(viewId):
                    viewPackages[viewId] = []
                
                viewPackages[viewId].append(packageId)
            
        # Be sure that the view package list is in order to the package priorit
        _sortPackageIdsByPriority(viewPackages[viewId], packageBitCounts)



            
    # User feedback
    _printViewStats(packageClasses, viewPackages)



    # Support for package collapsing
    # Could improve latency when initial loading an application
    # Merge all packages of a specific view into one (also supports multiple views)
    # Hint: View packages are sorted by priority, this way we can
    # easily merge all following packages with the first one, because
    # the first one is always the one with the highest priority
    if len(collapseViews) > 0:
        if not quiet:
            print
        
        collapsePos = 0
        print ">>> Collapsing views..."
        for viewId in collapseViews:
            if not quiet:
                print "  - Collapsing view '%s' (%s)..." % (viewId, collapsePos)
                
            collapsePackage = viewPackages[viewId][collapsePos]
            for packageId in viewPackages[viewId][collapsePos+1:]:
                if not quiet:
                    print "    - Merge package #%s into #%s" % (packageId, collapsePackage)
                    
                _mergePackage(packageId, collapsePackage, viewClasses, viewPackages, packageClasses)
            
            collapsePos += 1
    
        # User feedback
        _printViewStats(packageClasses, viewPackages)
  
  
    # Support for merging small packages
    # Hint1: Based on the token length which is a bit strange but a good
    # possibility to get the not really correct filesize in an ultrafast way
    # More complex code and classes generally also have more tokens in them
    # Hint2: The first common package before the selected package between two 
    # or more views is allowed to merge with. As the package which should be merged
    # may have requirements these must be solved. The easiest way to be sure regarding
    # this issue, is to look out for another common package. The package for which we
    # are looking must have requirements in all views so these must be solved by all views
    # so there must be another common package. Hardly to describe... hope this makes some sense
    if optimizeLatency != None and optimizeLatency != 0:
        smallPackages = []
    
        # Start at the end with the priority sorted list
        sortedPackageIds = _sortPackageIdsByPriority(_dictToHumanSortedList(packageClasses), packageBitCounts)
        sortedPackageIds.reverse()
    
        if not quiet:
            print
        print ">>> Analysing package sizes..."
        if not quiet:
            print "  - Optimize at %s tokens" % optimizeLatency
            
        for packageId in sortedPackageIds:
            packageLength = 0
    
            for classId in packageClasses[packageId]:
                packageLength += getLength(classId)
        
            if packageLength >= optimizeLatency:
                if not quiet:
                    print "    - Package #%s has %s tokens" % (packageId, packageLength)
                continue
            else:
                if not quiet:
                    print "    - Package #%s has %s tokens => trying to optimize" % (packageId, packageLength)
        
            collapsePackage = _getPreviousCommonPackage(packageId, viewPackages, packageBitCounts)
            if collapsePackage != None:
                if not quiet:
                    print "      - Merge package #%s into #%s" % (packageId, collapsePackage)
                _mergePackage(packageId, collapsePackage, viewClasses, viewPackages, packageClasses)                
        
        # User feedback
        _printViewStats(packageClasses, viewPackages)



    # Compile files...
    packageLoaderContent = ""
    sortedPackageIds = _sortPackageIdsByPriority(_dictToHumanSortedList(packageClasses), packageBitCounts)
    variantsId = generateVariantCombinationId(variants)
    processId = generateProcessCombinationId(buildProcess)
    
    if not quiet:
        print
        
    print ">>> Compiling classes..."
    for packageId in sortedPackageIds:
        packageFile = "%s_%s_%s_%s.js" % (outputFile, variantsId, processId, packageId)
    
        print "  - Package #%s (%s classes)..." % (packageId, len(packageClasses[packageId]))
        sortedClasses = sortClasses(packageClasses[packageId], loadDeps, runDeps, variants)
        compiledContent = compileClasses(sortedClasses, variants, buildProcess)
    
        # Store content
        if not quiet:
            print "    - Storing script (%s)" % getContentSize(compiledContent)
        filetool.save(packageFile, compiledContent)
        
        # TODO: Make prefix configurable
        prefix = "script/"
        packageLoaderContent += "document.write('<script type=\"text/javascript\" src=\"%s\"></script>');\n" % (prefix + packageFile)

    print ">>> Storing package loader script..."
    packageLoader = "%s_%s_%s.js" % (outputFile, variantsId, processId)
    filetool.save(packageLoader, packageLoaderContent)
 
 
 
def _sortPackageIdsByPriority(packageIds, packageBitCounts):
    def _cmpPackageIds(pkgId1, pkgId2):
        if packageBitCounts[pkgId2] > packageBitCounts[pkgId1]:
            return 1
        elif packageBitCounts[pkgId2] < packageBitCounts[pkgId1]:
            return -1
        
        return pkgId2 - pkgId1
        
    packageIds.sort(_cmpPackageIds)
    
    return packageIds
    
  
def _getPreviousCommonPackage(searchId, viewPackages, packageBitCounts):
    relevantViews = []
    relevantPackages = []
    
    for viewId in viewPackages:
        packages = viewPackages[viewId]
        if searchId in packages:
            relevantViews.append(viewId)
            relevantPackages.extend(packages[:packages.index(searchId)])

    # Sorted by priority, but start from end
    _sortPackageIdsByPriority(relevantPackages, packageBitCounts)
    relevantPackages.reverse()

    # Check if a package is available identical times to the number of views
    for packageId in relevantPackages:
        if relevantPackages.count(packageId) == len(relevantViews):
            return packageId
            
    return None

        
def _printViewStats(packageClasses, viewPackages):
    global verbose
    
    if not verbose:
        return
        
    packageIds = _dictToHumanSortedList(packageClasses)
    
    print
    print ">>> Current package contents:"
    for packageId in packageIds:
        print "  - Package #%s contains %s classes" % (packageId, len(packageClasses[packageId]))

    print
    print ">>> Current view contents:"
    for viewId in viewPackages:
        print "  - View '%s' uses these packages: %s" % (viewId, _intListToString(viewPackages[viewId]))
        

def _dictToHumanSortedList(input):
    output = []
    for key in input:
        output.append(key)
    output.sort()
    output.reverse()

    return output
    

def _mergePackage(replacePackage, collapsePackage, viewClasses, viewPackages, packageClasses):
    # Replace other package content
    for viewId in viewClasses:
        viewContent = viewPackages[viewId]
    
        if replacePackage in viewContent:
            # Store collapse package at the place of the old value
            viewContent[viewContent.index(replacePackage)] = collapsePackage
        
            # Remove duplicate (may be, but only one)
            if viewContent.count(collapsePackage) > 1:
                viewContent.reverse()
                viewContent.remove(collapsePackage)
                viewContent.reverse()

    # Merging collapsed packages
    packageClasses[collapsePackage].extend(packageClasses[replacePackage])
    del packageClasses[replacePackage]    


def _intListToString(input):
    result = ""
    for entry in input:
        result += "#%s, " % entry
        
    return result[:-2]






######################################################################
#  MODULE/REGEXP SUPPORT
######################################################################

def resolveComplexDefs(entries):
    global modules
    global classes
    
    content = []
    
    for entry in entries:
        if entry in modules:
            content.extend(modules[entry])
        else:        
            regexp = textutil.toRegExp(entry)

            for className in classes:
                if regexp.search(className):
                    if not className in content:
                        # print "Resolved: %s with %s" % (entry, className)
                        content.append(className)    
                        
    return content






######################################################################
#  SUPPORT FOR OPTIONAL CLASSES/FEATURES
######################################################################

def getOptionals(classes):
    opt = {}
    
    for id in classes:
        for sub in getMeta(id)["optionalDeps"]:
            if not sub in classes:
                opt[sub] = True

    return opt
        





######################################################################
#  COMPILER SUPPORT
######################################################################

def printProgress(pos, length, indent=4):
    global quiet
    
    if quiet:
        return
    
    # starts normally at null, but this is not useful here
    # also the length is normally +1 the real size
    pos += 1
    
    if pos == 1:
        sys.stdout.write("%s- Processing:" % (" " * indent))
        sys.stdout.flush()

    unit = 10
    thisstep = unit * pos / length
    prevstep = unit * (pos-1) / length
    
    if thisstep != prevstep:
        sys.stdout.write(" %s%%" % (thisstep * unit))
        sys.stdout.flush()
        
    if pos == length:
        sys.stdout.write("\n")
        sys.stdout.flush()


def compileClasses(todo, variants, process):
    content = ""
    length = len(todo)
    
    for pos, id in enumerate(todo):
        printProgress(pos, length)
        content += getCompiled(id, variants, process)
    
    return content
    

def _compileClassHelper(restree):
    # Emulate options
    parser = optparse.OptionParser()
    parser.add_option("--p1", action="store_true", dest="prettyPrint", default=False) 
    parser.add_option("--p2", action="store_true", dest="prettypIndentString", default="  ")     
    parser.add_option("--p3", action="store_true", dest="prettypCommentsInlinePadding", default="  ")     
    parser.add_option("--p4", action="store_true", dest="prettypCommentsTrailingCommentCols", default="")     
    
    (options, args) = parser.parse_args([])
    
    return compiler.compile(restree, options)    
    
    
def getCompiled(id, variants, process):
    global classes
    global verbose
    
    variantsId = generateVariantCombinationId(variants)
    processId = generateProcessCombinationId(process)
    
    cache = readCache(id, "compiled-" + variantsId + "-" + processId, classes[id]["path"])
    if cache != None:
        return cache
    
    tokens = getTokens(id)
    
    tree = copy.deepcopy(getVariantsTree(id, variants))

    if verbose:
        print "  - Postprocessing tree: %s..." % id
        
    tree = _postProcessHelper(tree, id, process, variants)    
        
    if verbose:
        print "  - Compiling tree: %s..." % id
    
    compiled = _compileClassHelper(tree)
    
    writeCache(id, "compiled-" + variantsId + "-" + processId, compiled)
    return compiled
    

def _postProcessHelper(tree, id, process, variants):
    global verbose
    global quiet
    
    if "optimize-basecalls" in process:
        if verbose:
            print "    - Optimize base calls..."
        baseCallOptimizeHelper(tree, id, variants)

    if "optimize-variables" in process:
        if verbose:
            print "    - Optimize local variables..."
        variableOptimizeHelper(tree, id, variants)
    
    if "optimize-privates" in process:
        if verbose:
            print "    - Optimize privates..."
        privateOptimizeHelper(tree, id, variants)

    if "optimize-strings" in process:
        if verbose:
            print "    - Optimize strings..."
        stringOptimizeHelper(tree, id, variants)
        
    return tree
     
     
def generateProcessCombinationId(process):
    process = copy.copy(process)
    process.sort()
    
    return "[%s]" % ("-".join(process))
       
     
def baseCallOptimizeHelper(tree, id, variants):
    basecalloptimizer.patch(tree)
    
    
def variableOptimizeHelper(tree, id, variants):
    variableoptimizer.search(tree, [], 0, 0, "$")
     

def privateOptimizeHelper(tree, id, variants):
    unique = toHashCode(id)
    privateoptimizer.patch(unique, tree, {})
    
    
def stringOptimizeHelper(tree, id, variants):
    global verbose
    global quiet
    
    # Do not optimize strings for non-mshtml clients
    clientValue = getVariantValue(variants, "qx.client")
    if clientValue != None and clientValue != "mshtml":
        return
    
    # TODO: Customize option for __SS__
    
    stringMap = stringoptimizer.search(tree)    
    stringList = stringoptimizer.sort(stringMap)
    
    stringoptimizer.replace(tree, stringList, "__SS__")

    # Build JS string fragments
    stringStart = "(function(){"
    stringReplacement = "var " + stringoptimizer.replacement(stringList, "__SS__")
    stringStop = "})();"

    # Compile wrapper node
    wrapperNode = treeutil.compileString(stringStart+stringReplacement+stringStop)
        
    # Reorganize structure
    funcBody = wrapperNode.getChild("operand").getChild("group").getChild("function").getChild("body").getChild("block")
    if tree.hasChildren():
        for child in copy.copy(tree.children):
            tree.removeChild(child)
            funcBody.addChild(child)
            
    # Add wrapper to tree
    tree.addChild(wrapperNode)
            
    
def getVariantValue(variants, key):
    for entry in variants:
        if entry["id"] == key:
            return entry["value"]
    
    return None
     
     
     
######################################################################
#  CLASS DEPENDENCY SUPPORT
######################################################################

def resolveDependencies(add, block, loadDeps, runDeps, variants):
    result = {}
    
    for entry in add:
        _resolveDependenciesRecurser(entry, result, block, loadDeps, runDeps, variants)
        
    return result


def _resolveDependenciesRecurser(add, result, block, loadDeps, runDeps, variants):
    global classes
    
    # check if already in
    if result.has_key(add):
        return
    
    # add self
    
    result[add] = True

    # reading dependencies
    deps = getCombinedDeps(add, loadDeps, runDeps, variants)
    
    # process lists
    for sub in deps["load"]:
        if not result.has_key(sub) and not sub in block:
            _resolveDependenciesRecurser(sub, result, block, loadDeps, runDeps, variants)            

    for sub in deps["run"]:
        if not result.has_key(sub) and not sub in block:
            _resolveDependenciesRecurser(sub, result, block, loadDeps, runDeps, variants)     


def getCombinedDeps(id, loadDeps, runDeps, variants):
    # init lists
    loadFinal = []
    runFinal = []
    
    # add static dependencies
    static = getDeps(id, variants)
    loadFinal.extend(static["load"])
    runFinal.extend(static["run"])
    
    # add dynamic dependencies
    if loadDeps.has_key(id):
        loadFinal.extend(loadDeps[id])

    if runDeps.has_key(id):
        runFinal.extend(runDeps[id])
    
    # return dict
    return {
        "load" : loadFinal,
        "run" : runFinal
    }
    

def getDeps(id, variants):
    global classes
    global verbose
    
    variantsId = generateVariantCombinationId(variants)
    
    cache = readCache(id, "deps" + variantsId, classes[id]["path"])
    if cache != None:
        return cache
    
    # Notes:
    # load time = before class = require
    # runtime = after class = use    

    if verbose:
        print "  - Gathering dependencies: %s" % id
        
    load = []
    run = []
    
    # Read meta data
    
    meta = getMeta(id)
    metaLoad = _readDictKey(meta, "loadtimeDeps", [])
    metaRun = _readDictKey(meta, "runtimeDeps", [])
    metaOptional = _readDictKey(meta, "optionalDeps", [])
    metaIgnore = _readDictKey(meta, "ignoreDeps", [])

    # Process meta data
    load.extend(metaLoad)
    run.extend(metaRun)    

    # Read content data
    (autoLoad, autoRun) = _analyzeClassDeps(id, variants)

    # Process content data
    if not "auto-require" in metaIgnore:
        for entry in autoLoad:
            if entry in metaOptional:
                pass
            elif entry in load:
                if verbose:
                    print "  - #require(%s) is auto-detected" % entry
            else:
                load.append(entry)

    if not "auto-use" in metaIgnore:
        for entry in autoRun:
            if entry in metaOptional:
                pass
            elif entry in load:
                pass
            elif entry in run:
                if verbose:
                    print "  - #use(%s) is auto-detected" % entry
            else:
                run.append(entry)
                    
    # Build data structure
    deps = {
        "load" : load,
        "run" : run
    }
    
    writeCache(id, "deps" + variantsId, deps)
    
    return deps
    
    
def _readDictKey(data, key, default=None):
    if data.has_key(key):
        return data[key]
    
    return default
    
    
def _analyzeClassDeps(id, variants):
    global classes
    
    tree = getVariantsTree(id, variants)
    loadtime = []
    runtime = []
    
    _analyzeClassDepsNode(id, tree, loadtime, runtime, False)
    
    return loadtime, runtime
    

def _analyzeClassDepsNode(id, node, loadtime, runtime, inFunction):
    global classes
        
    if node.type == "variable":
        if node.hasChildren:
            assembled = ""
            first = True

            for child in node.children:
                if child.type == "identifier":
                    if not first:
                        assembled += "."

                    assembled += child.get("name")
                    first = False

                    if assembled != id and classes.has_key(assembled):
                        if inFunction:
                            target = runtime
                        else:
                            target = loadtime

                        if assembled in target:
                            return

                        target.append(assembled)

                else:
                    assembled = ""
                    break
                    
                # treat dependencies in defer as requires
                if assembled == "qx.Class.define":
                    if node.parent.type == "operand" and node.parent.parent.type == "call":
                        deferNode = treeutil.selectNode(node, "../../params/2/keyvalue[@key='defer']/value/function/body/block")
                        if deferNode != None:
                            _analyzeClassDepsNode(id, deferNode, loadtime, runtime, False)                    

    elif node.type == "body" and node.parent.type == "function":
        inFunction = True

    if node.hasChildren():
        for child in node.children:
            _analyzeClassDepsNode(id, child, loadtime, runtime, inFunction)





            
            
            
######################################################################
#  CLASS SORT SUPPORT
######################################################################
            
def sortClasses(input, loadDeps, runDeps, variants):
    sorted = []
    
    for entry in input:
        _sortClassesRecurser(entry, input, sorted, loadDeps, runDeps, variants)
     
    return sorted
    
    
def _sortClassesRecurser(id, available, sorted, loadDeps, runDeps, variants):
    global classes
    
    if id in sorted:
        return
            
    # reading dependencies
    deps = getCombinedDeps(id, loadDeps, runDeps, variants)
    
    # process loadtime requirements
    for entry in deps["load"]:
        if entry in available and not entry in sorted:
            _sortClassesRecurser(entry, available, sorted, loadDeps, runDeps, variants)
            
    if id in sorted:
        return
        
    # print "  - Adding: %s" % id
    sorted.append(id)

    # process runtime requirements
    for entry in deps["run"]:
        if entry in available and not entry in sorted:
            _sortClassesRecurser(entry, available, sorted, loadDeps, runDeps, variants)

    
    


######################################################################
#  CLASS PATH SUPPORT
######################################################################

def scanModules():
    global classes
    global modules
    global quiet
    
    modules = {}

    print ">>> Searching for module definitions..."
    for id in classes:
        if classes[id]["category"] == "qx.impl":
            for mod in getMeta(id)["modules"]:
                if not modules.has_key(mod):
                    modules[mod] = []
                
                modules[mod].append(id)
    
    if not quiet:
        print "  - Found %s modules" % len(modules)
        print
                

def scanClassPaths(paths):
    global classes
    global quiet
    
    classes = {}
    
    print ">>> Scanning class paths..."
    for path in paths:
        _addClassPath(path)

    if not quiet:
        print
        
    return classes
    

def _addClassPath(classPath, encoding="utf-8"):
    global classes
    global quiet
        
    if not quiet:
        print "  - Scanning: %s" % classPath
    
    implCounter = 0
    docCounter = 0
    localeCounter = 0
    
    for root, dirs, files in os.walk(classPath):

        # Filter ignored directories
        for ignoredDir in config.DIRIGNORE:
            if ignoredDir in dirs:
                dirs.remove(ignoredDir)

        # Searching for files
        for fileName in files:
            if os.path.splitext(fileName)[1] == config.JSEXT and not fileName.startswith("."):
                filePath = os.path.join(root, fileName)
                filePathId = filePath.replace(classPath + os.sep, "").replace(config.JSEXT, "").replace(os.sep, ".")
                fileContent = filetool.read(filePath, encoding)
                fileCategory = "unknown"
                
                if fileName == "__init__.js":
                    fileContentId = filePathId
                    fileCategory = "qx.doc"
                    docCounter += 1
                    
                else:
                    fileContentId = _extractQxClassContentId(fileContent)
                    
                    if fileContentId == None:
                        fileContentId = _extractQxLocaleContentId(fileContent)
                        
                        if fileContentId != None:
                            fileCategory = "qx.locale"
                            localeCounter += 1
                    
                    else:
                        fileCategory = "qx.impl"
                        implCounter += 1
                    
                    if filePathId != fileContentId:
                        print "    - Mismatching IDs in file: %s" % filePath
                
                if fileCategory == "unknown":
                    print "    - Invalid file: %s" % filePath
                    sys.exit(1)
                
                fileId = filePathId
                    
                classes[fileId] = {
                    "path" : filePath,
                    "encoding" : encoding,
                    "classPath" : classPath,
                    "category" : fileCategory,
                    "id" : fileId,
                    "contentId" : fileContentId,
                    "pathId" : filePathId
                }
                
    if not quiet:
        print "    - Found: %s impl, %s doc, %s locale" % (implCounter, docCounter, localeCounter)


def _extractQxClassContentId(data):
    classDefine = re.compile('qx.(Class|Mixin|Interface|Theme).define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)

    for item in classDefine.findall(data):
        return item[1]

    return None


def _extractQxLocaleContentId(data):
    localeDefine = re.compile('qx.locale\.Locale.define\s*\(\s*["\']([\.a-zA-Z0-9_-]+)["\']?', re.M)
    
    for item in localeDefine.findall(data):
        return item

    return None



    
    
    
    
######################################################################
#  MAIN LOOP
######################################################################

if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "  * Keyboard Interrupt"
        sys.exit(1)

