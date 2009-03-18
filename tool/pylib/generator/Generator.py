#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2009 1&1 Internet AG, Germany, http://www.1und1.de
#
#  License:
#    LGPL: http://www.gnu.org/licenses/lgpl.html
#    EPL: http://www.eclipse.org/org/documents/epl-v10.php
#    See the LICENSE file in the project's top-level directory for details.
#
#  Authors:
#    * Sebastian Werner (wpbasti)
#    * Thomas Herchenroeder (thron7)
#
################################################################################

import re, os, sys, zlib, optparse, types, string
import urllib

from misc import filetool, textutil, idlist, Path
from ecmascript import compiler
from ecmascript.frontend import treegenerator, tokenizer
from ecmascript.transform.optimizer import variableoptimizer
from ecmascript.transform.optimizer import privateoptimizer
#from ecmascript.transform.optimizer import protectedoptimizer
from generator.config.ExtMap import ExtMap
from generator.code.DependencyLoader import DependencyLoader
from generator.code.PartBuilder import PartBuilder
from generator.code.TreeLoader import TreeLoader
from generator.code.TreeCompiler import TreeCompiler
from generator.code.LibraryPath import LibraryPath
from generator.code.ResourceHandler import ResourceHandler
from generator.action.CodeGenerator import CodeGenerator
from generator.action.ImageInfo import ImgInfoFmt
from generator.action.ImageClipping import ImageClipping
from generator.action.ApiLoader import ApiLoader
from generator.action.Locale import Locale
from generator.action.ActionLib import ActionLib
from generator.runtime.Cache import Cache
from generator.runtime.ShellCmd import ShellCmd
import simplejson
from robocopy import robocopy


# Used for library data caching in memory
# Reduces execution time for multi-job calls
memcache = {}


class Generator:
    def __init__(self, config, job, console_):
        global console
        self._config    = config
        self._job       = config.getJob(job)
        self._console   = console_
        self._variants  = {}
        self._settings  = {}
        self.approot    = None

        cache_path      = self._job.get("cache/compile", "cache")
        cache_path      = self._config.absPath(cache_path)
        self._cache     = Cache(cache_path, self._console)

        console = console_



    # This is the main dispatch method to run a single job. It uses the top-
    # level keys of the job description to run all necessary methods. In order
    # to do so, it also sets up a lot of tool chain infrastructure.
    def run(self):

        def listJobTriggers(): return {
          
            "api" :
            {
              "type"   : "JClassDepJob"
            },

            "copy-files" :
            {
              "type"   : "JSimpleJob"
            },

            "combine-images" :
            {
              "type"   : "JSimpleJob"
            },

            "clean-files" :
            {
              "type"   : "JSimpleJob"
            },

            "copy-resources" :
            {
              "type"   : "JClassDepJob"
            },

            "compile-source" :
            {
              "type" : "JCompileJob",
            },

            "compile-dist" :
            {
              "type" : "JCompileJob",
            },

            "fix-files" :
            {
              "type" : "JClassDepJob",
            },

            "lint-check" :
            {
              "type" : "JClassDepJob",
            },

            "migrate-files" :
            {
              "type"   : "JSimpleJob",           # this might change once we stop to shell exit to an external script
            },

            "pretty-print" :
            {
              "type" : "JClassDepJob",
            },

            "shell" :
            {
              "type"   : "JSimpleJob"
            },

            "slice-images" :
            {
              "type"   : "JSimpleJob"
            },

            "translate" :
            {
              "type"   : "JClassDepJob"
            },
          }


        def _computeClassList(smartInclude, smartExclude, explicitInclude, explicitExclude, variants):
            self._console.info("Resolving dependencies...")
            self._console.indent()
            classList = self._depLoader.getClassList(smartInclude, smartExclude, explicitInclude, explicitExclude, variants)
            self._console.outdent()

            return classList


        def scanLibrary(library):
            self._console.info("Scanning libraries...")
            self._console.indent()

            _namespaces = []
            _classes = {}
            _docs = {}
            _translations = {}
            _libs = {}
            if not isinstance(library, types.ListType):
                return (_namespaces, _classes, _docs, _translations, _libs)

            def getJobsLib(path):
                lib = None
                #path = os.path.abspath(os.path.normpath(path))  # this shouldn't be necessary, and breaks in some scenarios (s. bug#1861)
                libMaps = self._job.getFeature("library")
                for l in libMaps:
                    if l['path'] == path:
                        lib = l
                        break
                if not lib:   # this must never happen
                    raise RuntimeError("Unable to look up library \"%s\" in Job definition" % path)
                return lib

            for entry in library:
                key  = entry["path"]

                if memcache.has_key(key):
                    self._console.debug("Use memory cache for %s" % key)
                    path = memcache[key]
                else:
                    path = LibraryPath(entry, self._console)
                    namespace = getJobsLib(key)['namespace']
                    path._namespace = namespace  # patch namespace
                    path.scan()

                namespace = path.getNamespace()
                #namespace = getJobsLib(key)['namespace']
                _namespaces.append(namespace)

                classes = path.getClasses()
                _classes.update(classes)

                _docs.update(path.getDocs())
                _translations[namespace] = path.getTranslations()
                _libs[namespace] = entry

                memcache[key] = path

            self._console.outdent()
            self._console.debug("Loaded %s libraries" % len(_namespaces))
            self._console.debug("")

            return (_namespaces, _classes, _docs, _translations, _libs)



        def _partsConfigFromClassList(classList, smartExclude, variants,):

            def evalPackagesConfig(smartExclude, classList, variants):
                
                # Reading configuration
                partsCfg = self._job.get("packages/parts", {})
                collapseCfg = self._job.get("packages/collapse", [])
                minPackageSize = self._job.get("packages/sizes/min-package", 0)
                minPackageSizeForUnshared = self._job.get("packages/sizes/min-package-unshared", None)
                boot = self._job.get("packages/init", "boot")

                # Automatically add boot part to collapse list
                if boot in partsCfg and not boot in collapseCfg:
                    collapseCfg.append(boot)

                # Expanding expressions
                self._console.debug("Expanding include expressions...")
                partIncludes = {}
                for partId in partsCfg:
                    partIncludes[partId] = self._expandRegExps(partsCfg[partId])

                # Computing packages
                partPackages, packageClasses = self._partBuilder.getPackages(partIncludes, smartExclude, classList, collapseCfg, variants, minPackageSize, minPackageSizeForUnshared)

                return boot, partPackages, packageClasses


            # -- main --------------------------------------------------------------

            # Check for package configuration
            if self._job.get("packages"):
                (boot,
                partPackages,           # partPackages[partId]=[0,1,3]
                packageClasses          # packageClasses[0]=['qx.Class','qx.bom.Stylesheet',...]
                )              = evalPackagesConfig(smartExclude, classList, variants)
            else:
                # Emulate configuration
                boot           = "boot"
                partPackages   = { "boot" : [0] }
                packageClasses = [classList]

            return boot, partPackages, packageClasses


        def getVariants():
            # TODO: Runtime variants support is currently missing
            variants = {}
            variantsConfig = self._job.get("variants", {})
            variantsRuntime = self._variants

            for key in variantsConfig:
                variants[key] = variantsConfig[key]

            for key in variantsRuntime:
                variants[key] = [variantsRuntime[key]]

            return variants


        def getExcludes(excludeCfg):
            #excludeCfg = self._job.get("exclude", [])

            # Splitting lists
            self._console.debug("Preparing exclude configuration...")
            smartExclude, explicitExclude = self._splitIncludeExcludeList(excludeCfg)

            # Configuration feedback
            self._console.indent()
            self._console.debug("Excluding %s items smart, %s items explicit" % (len(smartExclude), len(explicitExclude)))

            if len(excludeCfg) > 0:
                self._console.warn("Excludes may break code!")

            self._console.outdent()

            # Resolve regexps
            self._console.indent()
            self._console.debug("Expanding expressions...")
            smartExclude = self._expandRegExps(smartExclude)
            explicitExclude = self._expandRegExps(explicitExclude)
            self._console.outdent()

            return smartExclude, explicitExclude



        def getIncludes(includeCfg):
            #includeCfg = self._job.get("include", [])

            # Splitting lists
            self._console.debug("Preparing include configuration...")
            smartInclude, explicitInclude = self._splitIncludeExcludeList(includeCfg)
            self._console.indent()

            if len(smartInclude) > 0 or len(explicitInclude) > 0:
                # Configuration feedback
                self._console.debug("Including %s items smart, %s items explicit" % (len(smartInclude), len(explicitInclude)))

                if len(explicitInclude) > 0:
                    self._console.warn("Explicit included classes may not work")

                # Resolve regexps
                self._console.debug("Expanding expressions...")
                smartInclude = self._expandRegExps(smartInclude)
                explicitInclude = self._expandRegExps(explicitInclude)

            elif self._job.get("packages"):
                # Special part include handling
                self._console.info("Including part classes...")
                partsCfg = partsCfg = self._job.get("packages/parts", {})
                smartInclude = []
                for partId in partsCfg:
                    smartInclude.extend(partsCfg[partId])

                # Configuration feedback
                self._console.debug("Including %s items smart, %s items explicit" % (len(smartInclude), len(explicitInclude)))

                # Resolve regexps
                self._console.debug("Expanding expressions...")
                smartInclude = self._expandRegExps(smartInclude)

            self._console.outdent()

            return smartInclude, explicitInclude



        # -- Main --------------------------------------------------------------

        config = self._job
        job    = self._job
        require = config.get("require", {})
        use     = config.get("use", {})

        # We use some sets of Job keys, both well-known and actual, to determin
        # which actions have to be run, and in which order.

        # Known job trigger keys
        triggersSet         = listJobTriggers()

        # some interesting categories
        triggersSimpleSet   = set((x for x in triggersSet if triggersSet[x]['type']=="JSimpleJob"))
        triggersClassDepSet = set((x for x in triggersSet if triggersSet[x]['type']=="JClassDepJob"))
        triggersCompileSet  = set((x for x in triggersSet if triggersSet[x]['type']=="JCompileJob"))

        # This Job's Keys
        jobKeySet           = set(job.getData().keys())
        jobTriggers         = jobKeySet.intersection(triggersSet)

        # let's check for presence of certain triggers
        simpleTriggers   = jobTriggers.intersection(triggersSimpleSet) # we have simple job triggers
        classdepTriggers = jobTriggers.intersection(triggersClassDepSet) # we have classdep. triggers
        compileTriggers  = jobTriggers.intersection(triggersCompileSet)

        # Create tool chain instances
        self._actionLib     = ActionLib(self._config, self._console)

        # Process simple job triggers
        if simpleTriggers:
            for trigger in simpleTriggers:
                if trigger == "copy-files":
                    self.runCopyFiles()
                elif trigger == "combine-images":
                    self.runImageCombining()
                elif trigger == "clean-files":
                    self.runClean()
                elif trigger == "migrate-files":
                    self.runMigration(config.get("library"))
                elif trigger == "shell":
                    self.runShellCommands()
                elif trigger == "slice-images":
                    self.runImageSlicing()
                else:
                    pass # there cannot be exceptions, due to the way simpleTriggers is constructed

        # remove the keys we have processed
        jobTriggers = jobTriggers.difference(simpleTriggers)

        # use early returns to avoid setting up costly, but unnecessary infrastructure
        if not jobTriggers:
            return

        # Process job triggers that require a class list (and some)

        # scanning given library paths
        (self._namespaces,
         self._classes,
         self._docs,
         self._translations,
         self._libs)         = scanLibrary(config.get("library"))

        # create tool chain instances
        self._treeLoader     = TreeLoader(self._classes, self._cache, self._console)
        self._locale         = Locale(self._classes, self._translations, self._cache, self._console, self._treeLoader)
        self._depLoader      = DependencyLoader(self._classes, self._cache, self._console, self._treeLoader, require, use)
        self._resourceHandler= ResourceHandler(self)
        self._codeGenerator  = CodeGenerator(self._cache, self._console, self._config, self._job, self._settings, self._locale, self._resourceHandler, self._classes)

        # Preprocess include/exclude lists
        smartInclude, explicitInclude = getIncludes(self._job.get("include", []))
        smartExclude, explicitExclude = getExcludes(self._job.get("exclude", []))
        # get a class list without variants
        classList = _computeClassList(smartInclude, smartExclude, explicitInclude, explicitExclude, {})
        
        # Process class-dependend job triggers
        if classdepTriggers:
            for trigger in classdepTriggers:
                if trigger == "api":
                    self.runApiData(classList)
                elif trigger == "copy-resources":
                    self.runResources(classList)
                elif trigger == "fix-files":
                    self.runFix(classList)
                elif trigger == "lint-check":
                    self.runLint(classList)
                elif trigger == "translate":
                    self.runUpdateTranslation()
                elif trigger == "pretty-print":
                    self._codeGenerator.runPrettyPrinting(classList, self._treeLoader)
                else:
                    pass

        # remove the keys we have processed, and check return
        jobTriggers = jobTriggers.difference(classdepTriggers)
        if not jobTriggers:
            return

        # Process job triggers that require the full tool chain

        # Create tool chain instances
        self._treeCompiler   = TreeCompiler(self._classes, self._cache, self._console, self._treeLoader)
        self._partBuilder    = PartBuilder(self._console, self._depLoader, self._treeCompiler)

        # -- helpers for the variant loop  -------------------------------------

        def printVariantInfo(variantSetNum, variants, variantSets, variantData):
            variantStr = simplejson.dumps(variants,ensure_ascii=False)
            self._console.head("Processing variant set %s/%s (%s)" % (variantSetNum+1, len(variantSets), variantStr))

            # Debug variant combination
            self._console.debug("Switched variants:")
            self._console.indent()
            for key in variants:
                if len(variantData[key]) > 1:
                    self._console.debug("%s = %s" % (key, variants[key]))
            self._console.outdent()

            return

        # Processing all combinations of variants
        variantData = getVariants()  # e.g. {'qx.debug':['on','off'], 'qx.aspects':['on','off']}
        variantSets = idlist.computeCombinations(variantData) # e.g. [{'qx.debug':'on','qx.aspects':'on'},...]

        # Iterate through variant sets
        for variantSetNum, variants in enumerate(variantSets):

            # some console output
            if len(variantSets) > 1:
                printVariantInfo(variantSetNum, variants, variantSets, variantData)

            # get current class list
            self._classList = _computeClassList(smartInclude, smartExclude, explicitInclude, explicitExclude, variants)

            # get parts config
            (boot,
            partPackages,           # partPackages[partId]=[0,1,3]
            packageClasses          # packageClasses[0]=['qx.Class','qx.bom.Stylesheet',...]
            )              = _partsConfigFromClassList(self._classList, smartExclude, variants)

            # Execute real tasks
            self._codeGenerator.runSource(partPackages, packageClasses, boot, variants, self._classList, self._libs, self._classes)
            self._codeGenerator.runCompiled(partPackages, packageClasses, boot, variants, self._treeCompiler, self._classList)

            # Debug tasks
            self.runDependencyDebug(partPackages, packageClasses, variants)
            self.runPrivateDebug()
            self.runUnusedClasses(partPackages, packageClasses, variants)

        self._console.info("Done")

        return


    def runPrivateDebug(self):
        if not self._job.get("debug/privates", False):
            return

        self._console.info("Privates debugging...")
        privateoptimizer.debug()



    def runApiData(self, classList):
        apiPath = self._job.get("api/path")
        if not apiPath:
            return

        apiPath = self._config.absPath(apiPath)

        self._apiLoader      = ApiLoader(self._classes, self._docs, self._cache, self._console, self._treeLoader)

        self._apiLoader.storeApi(classList, apiPath)

        return


    def runUnusedClasses(self, parts, packages, variants):
        if not self._job.get("log/classes-unused", False):
            return

        namespaces = self._job.get("log/classes-unused", [])
        
        self._console.info("Find unused classes...");
        self._console.indent()

        usedClassesArr = {}
        allClassesArr = {}
        for namespace in namespaces:
            usedClassesArr[namespace] = []
            allClassesArr[namespace]  = []

        # used classes of interest
        for packageId, package in enumerate(packages):
            for namespace in namespaces:
                packageClasses = self._expandRegExps([namespace], package)
                usedClassesArr[namespace].extend(packageClasses)
        
        # available classes of interest
        for namespace in namespaces:
            allClassesArr[namespace] = self._expandRegExps([namespace])
        
        # check
        for namespace in namespaces:
            self._console.info("Checking namespace: %s" % namespace);
            self._console.indent()
            for cid in allClassesArr[namespace]:
                if cid not in usedClassesArr[namespace]:
                    self._console.info("Unused class: %s" % cid)
            self._console.outdent()
        self._console.outdent()



    def runDependencyDebug(self, parts, packages, variants):
         if not self._job.get("debug/dependencies", False):
            return

         self._console.info("Dependency debugging...")
         self._console.indent()

         for packageId, packages in enumerate(packages):
             self._console.info("Package %s" % packageId)
             self._console.indent()

             for partId in parts:
                 if packageId in parts[partId]:
                     self._console.info("Part %s" % partId)

             for classId in packages:
                 self._console.debug("Class: %s" % classId)
                 self._console.indent()

                 for otherClassId in packages:
                     otherClassDeps = self._depLoader.getDeps(otherClassId, variants)

                     if classId in otherClassDeps["load"]:
                         self._console.debug("Used by: %s (load)" % otherClassId)

                     if classId in otherClassDeps["run"]:
                         self._console.debug("Used by: %s (run)" % otherClassId)

                 self._console.outdent()
             self._console.outdent()

         self._console.outdent()


    ##
    # update .po files
    #
    def runUpdateTranslation(self):
        namespaces = self._job.get("translate/namespaces")
        if not namespaces:
            return

        locales = self._job.get("translate/locales", None)
        self._console.info("Updating translations...")
        self._console.indent()
        for namespace in namespaces:
            lib = self._libs[namespace]
            self._locale.updateTranslations(namespace, os.path.join(lib['path'],lib['translation']), 
                                            locales)

        self._console.outdent()



    def runResources(self, classList):
        # only run for copy jobs
        if not self._job.get("copy-resources", False):
            return

        self._console.info("Copying resources...")
        resTargetRoot = self._job.get("copy-resources/target", "build")
        resTargetRoot = self._config.absPath(resTargetRoot)
        self.approot  = resTargetRoot  # this is a hack, because resource copying generates uri's
        libs          = self._job.get("library", [])
        resourceFilter= self._resourceHandler.getResourceFilterByAssets(classList)

        self._console.indent()
        # Copy resources
        for lib in libs:
            #libp = LibraryPath(lib,self._console)
            #ns   = libp.getNamespace()

            # construct a path to the source root for the resources
            #  (to be used later as a stripp-off from the resource source path)
            libpath = os.path.join(lib['path'],lib['resource'])
            libpath = os.path.normpath(libpath)

            # get relevant resources for this lib
            resList  = self._resourceHandler.findAllResources([lib], resourceFilter)

            # for each needed resource
            for res in resList:
                # Get source and target paths, and invoke copying

                # Get a source path
                resSource = os.path.normpath(res)

                # Construct a target path
                # strip off a library prefix...
                #  relpath = respath - libprefix
                relpath = (Path.getCommonPrefix(libpath, resSource))[2]
                if relpath[0] == os.sep:
                    relpath = relpath[1:]
                # ...to construct a suitable target path
                #  target = targetRoot + relpath
                resTarget = os.path.join(resTargetRoot, 'resource', relpath)

                # Copy
                self._copyResources(res, os.path.dirname(resTarget))

        self._console.outdent()


    def runCopyFiles(self):
        # Copy application files
        if not self._job.get("copy-files/files", False):
            return

        appfiles = self._job.get("copy-files/files",[])
        if appfiles:
            buildRoot  = self._job.get("copy-files/target", "build")
            buildRoot  = self._config.absPath(buildRoot)
            sourceRoot = self._job.get("copy-files/source", "source")
            sourceRoot  = self._config.absPath(sourceRoot)
            self._console.info("Copying application files...")
            self._console.indent()
            for file in appfiles:
                srcfile = os.path.join(sourceRoot, file)
                self._console.debug("copying %s" % srcfile)
                if (os.path.isdir(srcfile)):
                    destfile = os.path.join(buildRoot,file)
                else:
                    destfile = os.path.join(buildRoot, os.path.dirname(file))
                self._copyResources(srcfile, destfile)

            self._console.outdent()


    def runShellCommands(self):
        # wpbasti:
        # rename trigger from "shell" to "execute-commands"?
        # Should contain a list of commands instead
        if not self._job.get("shell/command"):
            return

        shellcmd = self._job.get("shell/command", "")
        rc = 0
        self._shellCmd       = ShellCmd()

        # massage relative paths - tricky!
        #parts = shellcmd.split()
        #nparts= []
        #for p in parts:
        #    if p.find(os.sep) > -1:
        #        if not os.path.isabs(p):
        #            nparts.append(self._config.absPath(p))
        #            continue
        #    nparts.append(p)

        #shellcmd = " ".join(nparts)
        self._console.info("Executing shell command \"%s\"..." % shellcmd)
        self._console.indent()

        rc = self._shellCmd.execute(shellcmd, self._config.getConfigDir())
        if rc != 0:
            raise RuntimeError, "Shell command returned error code: %s" % repr(rc)
        self._console.outdent()


    def runImageSlicing(self):
        """Go through a list of images and slice each one into subimages"""
        if not self._job.get("slice-images", False):
            return

        self._imageClipper   = ImageClipping(self._console, self._cache)

        images = self._job.get("slice-images/images", {})
        for image, imgspec in images.iteritems():
            image = self._config.absPath(image)
            # wpbasti: Rename: Border => Inset as in qooxdoo JS code
            prefix       = imgspec['prefix']
            border_width = imgspec['border-width']
            self._imageClipper.slice(image, prefix, border_width)


    def runImageCombining(self):
        """Go through a list of images and create them as combination of other images"""
        if not self._job.get("combine-images", False):
            return

        self._imageClipper   = ImageClipping(self._console, self._cache)

        images = self._job.get("combine-images/images", {})
        for image, imgspec in images.iteritems():
            image  = self._config.absPath(image)  # abs output path
            config = {}
            # abs input paths
            inp    = imgspec['input']
            input  = []
            for f in inp:
                input.append(self._config.absPath(f))
            layout = imgspec['layout'] == "horizontal"
            # create the combined image
            subconfigs = self._imageClipper.combine(image, input, layout)
            for sub in subconfigs:
                x = ImgInfoFmt()
                x.mappedId, x.left, x.top, x.width, x.height, x.type = (
                   Path.posifyPath(sub['combined']), sub['left'], sub['top'], sub['width'], sub['height'], sub['type'])
                config[Path.posifyPath(sub['file'])] = x.meta_format()  # this could use 'flatten()' eventually!

            # store meta data for this combined image
            bname = os.path.basename(image)
            ri = bname.rfind('.')
            if ri > -1:
                bname = bname[:ri]
            bname += '.meta'
            meta_fname = os.path.join(os.path.dirname(image), bname)
            filetool.save(meta_fname, simplejson.dumps(config, ensure_ascii=False))
            
        return


    def runClean(self):
        if not self._job.get('clean-files', False):
            return

        self._console.info("Cleaning up files...")
        self._console.indent()

        self._actionLib.clean(self._job.get('clean-files'))

        self._console.outdent()


    def runLint(self, classes):
        if not self._job.get('lint-check', False):
            return

        self._console.info("Checking Javascript source code...")
        self._console.indent()
        self._shellCmd  = ShellCmd()

        qxPath = self._job.get('let',{})
        if 'QOOXDOO_PATH' in qxPath:
            qxPath = qxPath['QOOXDOO_PATH']
        else:
            raise RuntimeError, "Need QOOXDOO_PATH setting to run lint command"
        lintCommand = os.path.join(qxPath, 'tool', 'bin', "ecmalint.py")
        lintsettings = ExtMap(self._job.get('lint-check'))
        allowedGlobals = lintsettings.get('allowed-globals', [])

        #self._actionLib.lint(classes)
        lint_opts = "".join(map(lambda x: " -g"+x, allowedGlobals))
        numClasses = len(classes)
        for pos, classId in enumerate(classes):
            self._shellCmd.execute('python "%s" %s "%s"' % (lintCommand, lint_opts, self._classes[classId]['path']))

        self._console.outdent()


    def runMigration(self, libs):
        if not self._job.get('migrate-files', False):
            return

        self._console.info("Migrating Javascript source code to most recent qooxdoo version...")
        self._console.indent()

        migSettings     = self._job.get('migrate-files')
        self._shellCmd  = ShellCmd()

        qxPath      = self._job.get('let',{})['QOOXDOO_PATH']
        migratorCmd = os.path.join(qxPath, 'tool', "bin", "migrator.py")

        libPaths = []
        for lib in libs:
            libPaths.append(os.path.join(lib['path'], lib['class']))

        mig_opts = ""
        if migSettings.get('from-version', False):
            mig_opts += "--from-version %s" % migSettings.get('from-version')
        if migSettings.get('migrate-html'):
            mig_opts += " --migrate-html"
        mig_opts += " --class-path %s" % ",".join(libPaths)

        shcmd = "python %s %s" % (migratorCmd, mig_opts)
        self._console.debug("Invoking migrator as: \"%s\"" % shcmd)
        self._shellCmd.execute(shcmd)

        self._console.outdent()


    def runFix(self, classes):
        if not isinstance(self._job.get("fix-files", False), types.DictType):
            return

        self._console.info("Fixing whitespace in source files...")
        self._console.indent()
        fixsettings = ExtMap(self._job.get("fix-files"))

        self._console.info("Fixing files: ", False)
        numClasses = len(classes)
        for pos, classId in enumerate(classes):
            self._console.progress(pos, numClasses)
            classEntry = self._classes[classId]
            filePath   = classEntry['path']
            fileEncoding = classEntry['encoding']
            fileContent  = filetool.read(filePath, fileEncoding)
            fixedContent = textutil.removeTrailingSpaces(textutil.tab2Space(textutil.any2Unix(fileContent), 2))
            if fixedContent != fileContent:
                self._console.debug("modifying file: %s" % filePath)
            filetool.save(filePath, fixedContent, fileEncoding)

        self._console.outdent()


    def _toJavaScript(self, value):
        number = re.compile("^([0-9\-]+)$")

        if not (value == "false" or value == "true" or value == "null" or number.match(value)):
            value = '"%s"' % value.replace("\"", "\\\"")

        return value


    def _splitIncludeExcludeList(self, data):
        intelli = []
        explicit = []

        for entry in data:
            if entry[0] == "=":
                explicit.append(entry[1:])
            else:
                intelli.append(entry)

        return intelli, explicit



    def _expandRegExps(self, entries, container=None):
        result = []
        if not container:
            container = self._classes

        for entry in entries:
            # Fast path: Try if a matching class could directly be found
            if entry in container:
                result.append(entry)

            else:
                regexp = textutil.toRegExp(entry)
                expanded = []

                for classId in container:
                    if regexp.search(classId):
                        if not classId in expanded:
                            expanded.append(classId)

                if len(expanded) == 0:
                    raise RuntimeError, "Expression gives no results. Malformed entry: %s" % entry

                result.extend(expanded)

        return result



    # wpbasti: TODO: Clean up compiler. Maybe split-off pretty-printing. These hard-hacked options, the pure
    # need of them is bad. Maybe options could be stored easier in a json-like config map instead of command line
    # args. This needs a rework of the compiler which is not that easy.
    def _optimizeJavaScript(self, code):
        restree = treegenerator.createSyntaxTree(tokenizer.parseStream(code))
        variableoptimizer.search(restree)

        # Emulate options
        parser = optparse.OptionParser()
        parser.add_option("--p1", action="store_true", dest="prettyPrint", default=False)
        parser.add_option("--p2", action="store_true", dest="prettypIndentString", default="  ")
        parser.add_option("--p3", action="store_true", dest="prettypCommentsInlinePadding", default="  ")
        parser.add_option("--p4", action="store_true", dest="prettypCommentsTrailingCommentCols", default="")

        (options, args) = parser.parse_args([])

        return compiler.compile(restree, options)


    # wpbasti: Does robocopy really help us here? Is it modified largely. Does this only mean modifications
    # for qooxdoo or code improvements as well? Do we need to give them back to the community of robocopy?
    def _copyResources(self, srcPath, targPath):
        # targPath *has* to be directory  -- there is now way of telling a
        # non-existing target file from a non-existing target directory :-)
        generator = self
        generator._console.debug("_copyResource: %s => %s" % (srcPath, targPath))
        copier = robocopy.PyRobocopier(generator._console)
        copier.parse_args(['-c', '-s', '-x', '.svn', srcPath, targPath])
        copier.do_work()


    def _makeVariantsName(self, pathName, variants):
        (newname, ext) = os.path.splitext(pathName)
        for key in variants:
            newname += "_%s:%s" % (str(key), str(variants[key]))
        newname += ext
        return newname


