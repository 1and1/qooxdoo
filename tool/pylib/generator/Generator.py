#!/usr/bin/env python

################################################################################
#
#  qooxdoo - the new era of web development
#
#  http://qooxdoo.org
#
#  Copyright:
#    2006-2008 1&1 Internet AG, Germany, http://www.1und1.de
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

import re, os, sys, zlib, optparse, types
import urllib

from misc import filetool, textutil, idlist, Path
from ecmascript import compiler
from ecmascript.frontend import treegenerator, tokenizer
from ecmascript.backend.optimizer import variableoptimizer
from ecmascript.backend.optimizer import privateoptimizer
#from ecmascript.backend.optimizer import protectedoptimizer
from generator.config.ExtMap import ExtMap
from generator.code.DependencyLoader import DependencyLoader
from generator.code.PartBuilder import PartBuilder
from generator.code.TreeLoader import TreeLoader
from generator.code.TreeCompiler import TreeCompiler
from generator.code.LibraryPath import LibraryPath
from generator.action.ImageInfo import ImageInfo, ImgInfoFmt
from generator.action.ImageClipping import ImageClipping
from generator.action.ApiLoader import ApiLoader
from generator.action.Locale import Locale
from generator.action.JobLib import JobLib
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



    def scanLibrary(self, library):
        self._console.info("Scanning libraries...")
        self._console.indent()

        _namespaces = []
        _classes = {}
        _docs = {}
        _translations = {}
        _libs = {}
        if not isinstance(library, types.ListType):
            return (_namespaces, _classes, _docs, _translations, _libs)

        for entry in library:
            key  = entry["path"]

            if memcache.has_key(key):
                self._console.debug("Use memory cache for %s" % key)
                path = memcache[key]
            else:
                path = LibraryPath(entry, self._console)
                path.scan()

            namespace = path.getNamespace()
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



    def listJobTriggers(self): return {

      "translate" :
      {
        "action" : Generator.runUpdateTranslation,
        "type"   : "JSimpleJob"
      },

      "copy-files" :
      {
        "action" :Generator.runCopyFiles,
        "type"   : "JSimpleJob"
      },

      "shell" :
      {
        "action" :Generator.runShellCommands,
        "type"   : "JSimpleJob"
      },

      "slice-images" :
      {
        "action" :Generator.runImageSlicing,
        "type"   : "JSimpleJob"
      },

      "combine-images" :
      {
        "action" :Generator.runImageCombining,
        "type"   : "JSimpleJob"
      },

      "clean-files" :
      {
        "action" :Generator.runClean,
        "type"   : "JSimpleJob"
      },

      "copy-resources" :
      {
        "action" :Generator.runResources,
        "type"   : "JClassDepJob"
      },

      "api" :
      {
        "action" :Generator.runApiData,
        "type"   : "JClassDepJob"
      },

      "compile-source" :
      {
        "action" :Generator.runSource,
        "type" : "JCompileJob",
      },

      "compile-dist" :
      {
        "action" :Generator.runCompiled,
        "type" : "JCompileJob",
      }

    }

    def run2(self):
        config = self._job
        job    = config.get(".")
        jobTriggers = self.listJobTriggers()

        #from sets import * - using 'set' instead of 'Set' since 2.4


        triggersSimpleSet   = set((x for x in jobTriggers if jobTriggers[x]['type']=="JSimpleJob"))
        triggersClassDepSet = set((x for x in jobTriggers if jobTriggers[x]['type']=="JClassDepJob"))
        triggersCompileSet  = set((x for x in jobTriggers if jobTriggers[x]['type']=="JCompileJob"))

        jobKeySet = set(job.keys())

        # let's check for presence of certain triggers
        simpleTriggerKeys         = jobKeySet.intersection(triggersSimpleSet) # we have simple job triggers
        classdependentTriggerKeys = jobKeySet.intersection(triggersClassDepSet)  # we have classdep. triggers
        compileTriggerKeys        = jobKeySet.intersection(triggersCompileSet)

        # process simple job triggers
        if simpleTriggerKeys:
            for trigger in simpleTriggerKeys:
                apply(jobTriggers[trigger]['action'],(self,))

        if not classdependentTriggerKeys and not compileTriggerKeys:
            return

        # process job triggers that require a class list
        (_,classes,_,_) = self.scanLibrary(config.extract("library"))

        if classdependentTriggerKeys:
            for trigger in classdependentTriggerKeys:
                if trigger is "copy-resources":
                    apply(jobTriggers[trigger]['action'], (self, classes))

                if trigger is "api":
                    apply(jobTriggers[trigger]['action'], (self, classes))



        if not compileTriggerKeys:
            return

        # the next part is transitional, until the new runCompiled1(), runSource1() methods are implemented
        partBuilder     = PartBuilder(self._console, self._depLoader, self._treeCompiler)
        parts, packages = partBuilder.getPackages(partIncludes, smartExclude, classList, collapseCfg, variants, sizeCfg)

        # process job triggers that compile
        if compileTriggerKeys:
            for trigger in compileTriggerKeys:
                if trigger is "compile-source":
                    self.runSource(parts, packages, boot, variants)

                if trigger is "compile-dist":
                    self.runCompiled(parts, packages, boot, variants)


        return


    def runCompiled1(self):

        # Dist Generation

        # Generate loader + compiled files

        if hasParts:
            # Insert new part which only contains the loader stuff
            injectLoader(parts)

            # Compute packages
            parts, packages = self._partBuilder.getPackages(partIncludes, smartExclude, classList, collapseCfg, variants, sizeCfg)

            # Build all individual packages
            for pkg in packages:
                fileName = "TODO"
                compiled = self.compileClasses(pkgClasses, variants)
                writeFile(fileName, compiled)

        else:
            # Generate one compiled file including all
            fileName = "TODO"
            compiled = self.compileClasses(classes)
            writeFile(fileName, compiled)



    def runSource1(self):

        # Source Generation

        # Insert new part which only contains the loader stuff
        injectLoader(parts)

        # Compute packages
        parts, packages = self._partBuilder.getPackages(partIncludes, smartExclude, classList, collapseCfg, variants, sizeCfg)

        # Compile first part
        compiled = self._generateSourcePackageCode(part, packages)
        for part in parts:
            for pkg in part:
                compiled += self.compileClasses(pkgClasses, variants)
                break
            break

        writeFile(fileName, boot + compiled)



    def run1(self):
        config = self._job
        job    = config.get(".")
        jobTriggers = self.listJobTriggers()

        # get the simple triggers from global struct
        triggersSimpleSet   = set((x for x in jobTriggers if jobTriggers[x]['type']=="JSimpleJob"))
        # get the job keys
        jobKeySet = set(job.keys())
        # let's check for presence of certain triggers
        simpleTriggerKeys         = jobKeySet.intersection(triggersSimpleSet) # we have simple job triggers

        # process simple job triggers
        if simpleTriggerKeys:
            for trigger in simpleTriggerKeys:
                apply(jobTriggers[trigger]['action'],(self,))
                del job[trigger]

        # dispatch rest to old run()
        self.run()



    def run(self):
        config = self._job
        job    = self._job

        require = config.get("require", {})
        use = config.get("use", {})

        self._jobLib         = JobLib(self._config, self._console)

        triggerNameSet = set(self.listJobTriggers().keys())  # list of trigger names
        jobKeySet      = set(job.getData().keys())
        if jobKeySet.intersection(triggerNameSet) == set(['clean-files']):
            self.runClean()
            return  # cleaning was the only job

        # Scanning given library paths
        (self._namespaces,
         self._classes,
         self._docs,
         self._translations,
         self._libs) = self.scanLibrary(config.get("library"))

        # Create tool chain instances
        self._treeLoader     = TreeLoader(self._classes, self._cache, self._console)
        self._depLoader      = DependencyLoader(self._classes, self._cache, self._console, self._treeLoader, require, use)
        self._treeCompiler   = TreeCompiler(self._classes, self._cache, self._console, self._treeLoader)
        self._locale         = Locale(self._classes, self._translations, self._cache, self._console, self._treeLoader)
        partBuilder          = PartBuilder(self._console, self._depLoader, self._treeCompiler)
        self._resourceHandler= _ResourceHandler(self)

        # Updating translation
        self.runUpdateTranslation()

        # Preprocess include/exclude lists
        # This is only the parsing of the config values
        # We only need to call this once on each job
        smartInclude, explicitInclude = self.getIncludes(self._job.get("include", []))
        smartExclude, explicitExclude = self.getExcludes(self._job.get("exclude", []))

        # Processing all combinations of variants
        variantData = self.getVariants()  # e.g. {'qx.debug':['on','off'], 'qx.aspects':['on','off']}
        variantSets = idlist.computeCombinations(variantData) # e.g. [{'qx.debug':'on','qx.aspects':'on'},...]

        # Iterate through variant sets
        for variantSetNum, variants in enumerate(variantSets):
            if len(variantSets) > 1:
                variantStr = simplejson.dumps(variants,ensure_ascii=False)
                self._console.head("Processing variant set %s/%s (%s)" % (variantSetNum+1, len(variantSets), variantStr))

                # Debug variant combination
                self._console.debug("Switched variants:")
                self._console.indent()
                for key in variants:
                    if len(variantData[key]) > 1:
                        self._console.debug("%s = %s" % (key, variants[key]))
                self._console.outdent()


            # Resolving dependencies
            self._console.info("Resolving dependencies...")
            self._console.indent()
            classList = self._depLoader.getClassList(smartInclude, smartExclude, explicitInclude, explicitExclude, variants)
            self._classList = classList
            self._console.outdent()


            # Check for package configuration
            if self._job.get("packages"):
                # Reading configuration
                partsCfg = self._job.get("packages/parts", {})
                collapseCfg = self._job.get("packages/collapse", [])
                sizeCfg = self._job.get("packages/size", 0)
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
                # partPackages[partId]=[0,1,3]
                # packageClasses[0]=['qx.Class','qx.bom.Stylesheet',...]
                partPackages, packageClasses = partBuilder.getPackages(partIncludes, smartExclude, classList, collapseCfg, variants, sizeCfg)

            else:
                # Emulate configuration
                boot = "boot"
                partPackages = { "boot" : [0] }
                packageClasses = [classList]



            # Execute real tasks
            self.runApiData(packageClasses)
            #self._translationMaps = self.getTranslationMaps(partPackages, packageClasses, variants)
            self.runSource(partPackages, packageClasses, boot, variants)
            self.runResources()  # run before runCompiled, to get image infos
            self.runCompiled(partPackages, packageClasses, boot, variants)
            self.runCopyFiles()
            self.runShellCommands()
            self.runImageSlicing()
            self.runImageCombining()
            self.runPrettyPrinting(classList)
            self.runClean()
            self.runLint(classList)
            self.runMigration(config.get("library"))
            self.runFix(classList)


            # Debug tasks
            self.runDependencyDebug(partPackages, packageClasses, variants)
            self.runPrivateDebug()
            self.runUnusedClasses(partPackages, packageClasses, variants)

        self._console.info("Done")


    def runPrivateDebug(self):
        if not self._job.get("debug/privates", False):
            return

        self._console.info("Privates debugging...")
        privateoptimizer.debug()



    def runApiData(self, packages):
        apiPath = self._job.get("api/path")
        if not apiPath:
            return

        apiPath = self._config.absPath(apiPath)

        self._apiLoader      = ApiLoader(self._classes, self._docs, self._cache, self._console, self._treeLoader)

        smartInclude, explicitInclude = self.getIncludes(self._job.get("include", []))
        smartExclude, explicitExclude = self.getExcludes(self._job.get("exclude", []))

        classList = self._depLoader.getClassList(smartInclude, smartExclude, explicitInclude, explicitExclude, {})
        packages = [classList]

        apiContent = []
        for classes in packages:
            apiContent.extend(classes)

        self._apiLoader.storeApi(apiContent, apiPath)


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



    ##
    # generate localisation JS data
    #
    def getTranslationMaps(self, parts, packages, variants, locales):
        if "C" not in locales:
            locales.append("C")

        self._console.info("Processing translation for %s locales..." % len(locales))
        self._console.indent()

        packageTranslation = []
        for pos, classes in enumerate(packages):
            self._console.debug("Package: %s" % pos)
            self._console.indent()

            # wpbasti: TODO: This code includes localization in every package. Bad idea.
            # This needs further work
            # Would also be better to let the translation code nothing know about parts

            # Another thing: Why not generate both structures in different js-objects
            # It's totally easy in JS to build a wrapper.
            # [thron7] means: generate different data structs for locales and translations
            pac_dat = self._locale.generatePackageData(classes, variants, locales) # .po data
            loc_dat = self._locale.getLocalizationData(locales)  # cldr data
            packageTranslation.extend((pac_dat,loc_dat))

            self._console.outdent()

        self._console.outdent()
        return packageTranslation



    def runResources(self):
        # only run for copy jobs
        if not self._job.get("copy-resources", False):
            return

        self._console.info("Copying resources...")
        resTargetRoot = self._job.get("copy-resources/target", "build")
        resTargetRoot = self._config.absPath(resTargetRoot)
        self.approot  = resTargetRoot  # this is a hack, because resource copying generates uri's
        libs          = self._job.get("library", [])
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
            resList  = self._resourceHandler.findAllResources([lib], self._resourceHandler.filterResourcesByClasslist(self._classList))

            # for each needed resource
            for res in resList:
                # Get source and target paths, and invoke copying

                # Get a source path
                resSource = os.path.normpath(res[0])

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
                self._copyResources(res[0], os.path.dirname(resTarget))

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


    def runCompiled(self, parts, packages, boot, variants):
        if not self._job.get("compile-dist/file"):
            return

        # Read in base file name
        filePath = self._job.get("compile-dist/file")
        if variants and False: # TODO: get variant names from config
            filePath = self._makeVariantsName(filePath, variants)
        filePath = self._config.absPath(filePath)

        # The place where the app HTML ("index.html") lives
        self.approot = self._job.get("compile-dist/root", None)
        if self.approot:
            self.approot = self._config.absPath(self.approot)

        # Read in relative file name
        fileUri = self._job.get("compile-dist/uri", filePath)

        # Read in compiler options
        optimize = self._job.get("compile-dist/optimize", [])

        # Whether the code should be formatted
        format = self._job.get("compile-dist/format", False)

        # Read in settings
        settings = self.getSettings()

        # Get resource list
        buildRoot= self._job.get('compile-dist/target', "build")
        buildRoot= self._config.absPath(buildRoot)
        buildUri = self._job.get('compile-dist/resourceUri', ".")

        libs = self._job.get("library", [])
        forceUri = Path.rel_from_to(self.approot, os.path.join(buildRoot, "resource"))
        forceUri = Path.posifyPath(forceUri)

        # Generating boot script
        self._console.info("Generating boot script...")

        # Get translation maps
        locales = self._job.get("compile-dist/locales", [])
        translationMaps = self.getTranslationMaps(parts, packages, variants, locales)

        # wpbasti: Most of this stuff is identical between source/compile. Put together somewhere else.
        bootBlocks = []
        bootBlocks.append(self.generateSettingsCode(settings, format))
        bootBlocks.append(self.generateVariantsCode(variants, format))
        bootBlocks.append(self.generateLibInfoCode(libs, format, forceUri))
        bootBlocks.append(self.generateResourceInfoCode(settings, libs, format))
        bootBlocks.append(self.generateLocalesCode(translationMaps, format))
        bootBlocks.append(self.generateCompiledPackageCode(fileUri, parts, packages, boot, variants, settings, format))

        if format:
            bootContent = "\n\n".join(bootBlocks)
        else:
            bootContent = "".join(bootBlocks)

        # Resolve file name variables
        resolvedFilePath = self._resolveFileName(filePath, variants, settings)

        # Save result file
        filetool.save(resolvedFilePath, bootContent)

        if self._job.get("compile-dist/gzip"):
            filetool.gzip(resolvedFilePath, bootContent)

        self._console.debug("Done: %s" % self._computeContentSize(bootContent))
        self._console.debug("")


        # Need to preprocess all classes first to correctly detect all
        # fields before starting renaming them
        # TODO: Needs for testing, better integration etc.
        #self._console.info("Detecting protected fields...")
        #for packageId, classes in enumerate(packages):
        #    protectedoptimizer.process(classes, self._treeLoader)


        # Generating packages
        # TODO: Parts should be unknown at this stage. Would make code somewhat cleaner.
        self._console.info("Generating packages...")
        self._console.indent()

        for packageId, classes in enumerate(packages):
            self._console.info("Compiling package #%s:" % packageId, False)
            self._console.indent()

            # Compile file content
            compiledContent = self._treeCompiler.compileClasses(classes, variants, optimize, format)

            # Construct file name
            resolvedFilePath = self._resolveFileName(filePath, variants, settings, packageId)

            # Save result file
            filetool.save(resolvedFilePath, compiledContent)

            if self._job.get("compile-dist/gzip"):
                filetool.gzip(resolvedFilePath, compiledContent)

            self._console.debug("Done: %s" % self._computeContentSize(compiledContent))
            self._console.outdent()

        self._console.outdent()


    def runSource(self, parts, packages, boot, variants):
        if not self._job.get("compile-source/file"):
            return

        self._console.info("Generate source version...")
        self._console.indent()

        # Read in base file name
        filePath = self._job.get("compile-source/file")
        #if variants:
        #    filePath = self._makeVariantsName(filePath, variants)
        filePath = self._config.absPath(filePath)

        # Whether the code should be formatted
        format = self._job.get("compile-source/format", False)

        # The place where the app HTML ("index.html") lives
        self.approot = self._config.absPath(self._job.get("compile-source/root", ""))

        # Read in settings
        settings = self.getSettings()

        # Get resource list
        libs = self._job.get("library", [])

        # Get translation maps
        locales = self._job.get("compile-source/locales", [])
        translationMaps = self.getTranslationMaps(parts, packages, variants, locales)

        # Add data from settings, variants and packages
        sourceBlocks = []
        sourceBlocks.append(self.generateSettingsCode(settings, format))
        sourceBlocks.append(self.generateVariantsCode(variants, format))
        sourceBlocks.append(self.generateLibInfoCode(self._job.get("library",[]),format))
        sourceBlocks.append(self.generateResourceInfoCode(settings, libs, format))
        sourceBlocks.append(self.generateLocalesCode(translationMaps, format))
        sourceBlocks.append(self.generateSourcePackageCode(parts, packages, boot, format))

        # TODO: Do we really need this optimization here. Could this be solved
        # with less resources just through directly generating "good" code?
        self._console.info("Generating boot loader...")
        if format:
            sourceContent = "\n\n".join(sourceBlocks)
        else:
            #sourceContent = self._optimizeJavaScript("".join(sourceBlocks))
            sourceContent = "".join(sourceBlocks)

        # Construct file name
        resolvedFilePath = self._resolveFileName(filePath, variants, settings)

        # Save result file
        filetool.save(resolvedFilePath, sourceContent)

        if self._job.get("compile-source/gzip"):
            filetool.gzip(resolvedFilePath, sourceContent)

        self._console.outdent()
        self._console.debug("Done: %s" % self._computeContentSize(sourceContent))
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


    # wpbasti: Contains too much low level code. Separate logic into extra class to keep this method a bit cleaner
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
                   sub['combined'], sub['left'], sub['top'], sub['width'], sub['height'], sub['type'])
                config[sub['file']] = x.meta_format()  # this could use 'flatten()' eventually!

            # store meta data for this combined image
            # wpbasti: Don't write to the image source folder. This is bad style. Let's find a better place.
            bname = os.path.basename(image)
            ri = bname.rfind('.')
            if ri > -1:
                bname = bname[:ri]
            bname += '.meta'
            meta_fname = os.path.join(os.path.dirname(image), bname)
            filetool.save(meta_fname, simplejson.dumps(config, ensure_ascii=False))
            # cache meta data
        return


    def runPrettyPrinting(self, classes):
        "Gather all relevant config settings and pass them to the compiler"

        if not isinstance(self._job.get("pretty-print", False), types.DictType):
            return

        self._console.info("Pretty-printing code...")
        self._console.indent()
        ppsettings = ExtMap(self._job.get("pretty-print"))  # get the pretty-print config settings

        # init options
        parser  = optparse.OptionParser()
        compiler.addCommandLineOptions(parser)
        (options, args) = parser.parse_args([])

        # modify according to config
        setattr(options, 'prettyPrint', True)  # turn on pretty-printing
        if ppsettings.get('general/indent-string',False):
            setattr(options, 'prettypIndentString', ppsettings.get('general/indent-string'))
        if ppsettings.get('comments/trailing/keep-column',False):
            setattr(options, 'prettypCommentsTrailingKeepColumn', ppsettings.get('comments/trailing/keep-column'))
        if ppsettings.get('comments/trailing/comment-cols',False):
            setattr(options, 'prettypCommentsTrailingCommentCols', ppsettings.get('comments/trailing/comment-cols'))
        if ppsettings.get('comments/trailing/padding',False):
            setattr(options, 'prettypCommentsInlinePadding', ppsettings.get('comments/trailing/padding'))
        if ppsettings.get('blocks/align-with-curlies',False):
            setattr(options, 'prettypAlignBlockWithCurlies', ppsettings.get('blocks/align-with-curlies'))
        if ppsettings.get('blocks/open-curly/newline-before',False):
            setattr(options, 'prettypOpenCurlyNewlineBefore', ppsettings.get('blocks/open-curly/newline-before'))
        if ppsettings.get('blocks/open-curly/indent-before',False):
            setattr(options, 'prettypOpenCurlyIndentBefore', ppsettings.get('blocks/open-curly/indent-before'))

        self._console.info("Pretty-printing files: ", False)
        numClasses = len(classes)
        for pos, classId in enumerate(classes):
            self._console.progress(pos, numClasses)
            tree = self._treeLoader.getTree(classId)
            compiled = compiler.compile(tree, options)
            filetool.save(self._classes[classId]['path'], compiled)

        self._console.outdent()


    def runClean(self):
        if not self._job.get('clean-files', False):
            return

        self._console.info("Cleaning up files...")
        self._console.indent()

        self._jobLib.clean(self._job.get('clean-files'))

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
        lintCommand = os.path.join(qxPath, os.pardir, 'tool', 'bin', "ecmalint.py")
        lintsettings = ExtMap(self._job.get('lint-check'))
        allowedGlobals = lintsettings.get('allowed-globals', [])

        #self._jobLib.lint(classes)
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
        migratorCmd = os.path.join(qxPath, os.pardir, 'tool', "bin", "migrator.py")

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



    ######################################################################
    #  SETTINGS/VARIANTS/PACKAGE DATA
    ######################################################################

    def getSettings(self):
        # TODO: Runtime settings support is currently missing
        settings = {}
        settingsConfig = self._job.get("settings", {})
        settingsRuntime = self._settings

        for key in settingsConfig:
            settings[key] = settingsConfig[key]

        for key in settingsRuntime:
            settings[key] = settingsRuntime[key]

        return settings


    def getVariants(self):
        # TODO: Runtime variants support is currently missing
        variants = {}
        variantsConfig = self._job.get("variants", {})
        variantsRuntime = self._variants

        for key in variantsConfig:
            variants[key] = variantsConfig[key]

        for key in variantsRuntime:
            variants[key] = [variantsRuntime[key]]

        return variants


    def _toJavaScript(self, value):
        number = re.compile("^([0-9\-]+)$")

        if not (value == "false" or value == "true" or value == "null" or number.match(value)):
            value = '"%s"' % value.replace("\"", "\\\"")

        return value


    def generateSettingsCode(self, settings, format=False):
        result = 'if(!window.qxsettings)qxsettings={};'

        for key in settings:
            if format:
                result += "\n"

            value = self._toJavaScript(settings[key])
            result += 'qxsettings["%s"]=%s;' % (key, value)

        return result


    def generateVariantsCode(self, variants, format=False):
        result = 'if(!window.qxvariants)qxvariants={};'

        for key in variants:
            if key == "__override__":
                continue
 
            if format:
                result += "\n"

            value = self._toJavaScript(variants[key])
            result += 'qxvariants["%s"]=%s;' % (key, value)
            if key == "qx.theme":  # this is a bad kludge!
                result += '\nqxsettings["%s"]=%s;' % (key, value)

        return result


    def generateLibInfoCode(self, libs, format, forceUri=None):
        result = 'if(!window.qxlibraries)qxlibraries={};'

        for lib in libs:
            result += 'qxlibraries["%s"]={' % lib['namespace']

            if forceUri:
                liburi = forceUri
            else:
                liburi = self._computeResourceUri(lib, "", rType="resource", appRoot=self.approot)
                
            result += '"resourceUri":"%s"' % urllib.quote(liburi)
            
            # TODO: Add version, svn revision, maybe even authors, but at least homepage link, ...

            result += '};'

        return result


    def generateResourceInfoCode(self, settings, libs, format=False):
        """Pre-calculate image information (e.g. sizes)"""
        data    = {}
        resdata = data
        result  = ""
        imgpatt  = re.compile(r'\.(png|jpeg|jpg|gif)$', re.I)
        skippatt = re.compile(r'\.(meta|py)$', re.I)

        self._console.info("Analysing assets...")
        self._console.indent()

        self._imageInfo      = ImageInfo(self._console, self._cache)

        # some helper functions

        def replaceWithNamespace(imguri, liburi, libns):
            pre,libsfx,imgsfx = Path.getCommonPrefix(liburi, imguri)
            if imgsfx[0] == os.sep: imgsfx = imgsfx[1:]  # strip leading '/'
            imgshorturi = os.path.join("${%s}" % libns, imgsfx)
            return imgshorturi

        def extractAssetPart(libresuri, imguri):
            pre,libsfx,imgsfx = Path.getCommonPrefix(libresuri, imguri) # split libresuri from imguri
            if imgsfx[0] == os.sep: imgsfx = imgsfx[1:]  # strip leading '/'
            return imgsfx                # use the bare img suffix as its asset Id

        def normalizeImgUri(uriFromMetafile, trueCombinedUri, combinedUriFromMetafile):
            # normalize paths (esp. "./x" -> "x")
            (uriFromMetafile, trueCombinedUri, combinedUriFromMetafile) = map(os.path.normpath,(uriFromMetafile, trueCombinedUri, combinedUriFromMetafile))
            # get the "wrong" prefix (in mappedUriPrefix)
            trueUriPrefix, mappedUriPrefix, sfx = Path.getCommonSuffix(trueCombinedUri, combinedUriFromMetafile)
            # ...and strip it from contained image uri, to get a correct suffix (in uriSuffix)
            pre, mappedUriSuffix, uriSuffix = Path.getCommonPrefix(mappedUriPrefix, uriFromMetafile)
            # ...then compose the correct prefix with the correct suffix
            normalUri = os.path.normpath(os.path.join(trueUriPrefix, uriSuffix))
            return normalUri

        def processCombinedImg(data, meta_fname, cimguri, cimgshorturi, cimgfmt):
            assert cimgfmt.lib, cimgfmt.type
            # read meta file
            mfile = open(meta_fname)
            imgDict = simplejson.loads(mfile.read())
            mfile.close()
            for mimg, mimgs in imgDict.iteritems():
                # sort of like this: mimg : [width, height, type, combinedUri, off-x, off-y]
                mimgspec = ImgInfoFmt(mimgs)
                # have to normalize the uri's from the meta file
                # cimguri is relevant, like: "../../framework/source/resource/qx/decoration/Modern/panel-combined.png"
                # mimg is an uri from when the meta file was generated, like: "./source/resource/qx/decoration/Modern/..."
                mimguri = normalizeImgUri(mimg, cimguri, mimgspec.mappedId)
                ## replace lib uri with lib namespace in mimguri
                ##mimgshorturi = replaceWithNamespace(mimguri, libresuri, cimgfmt.lib)
                mimgshorturi = extractAssetPart(libresuri, mimguri)
                mimgshorturi = Path.posifyPath(mimgshorturi)

                mimgspec.mappedId = cimgshorturi        # correct the mapped uri of the combined image
                mimgspec.lib      = cimgfmt.lib
                mimgspec.mtype    = cimgfmt.type
                mimgspec.mlib     = cimgfmt.lib
                data[mimgshorturi] = mimgspec.flatten()  # this information takes precedence over existing


        # main

        for lib in libs:
            libresuri = self._computeResourceUri(lib, "", rType='resource', appRoot=self.approot)
            resourceList = self._resourceHandler.findAllResources([lib],
                                self._resourceHandler.filterResourcesByClasslist(self._classList))
            # resourceList = [[file1,uri1],[file2,uri2],...]
            for resource in resourceList:
                ##assetId = replaceWithNamespace(imguri, libresuri, lib['namespace'])
                assetId = extractAssetPart(libresuri, resource[1])
                assetId = Path.posifyPath(assetId)

                if imgpatt.search(resource[0]): # handle images
                    imgpath= resource[0]
                    imguri = resource[1]
                    imageInfo = self._imageInfo.getImageInfo(imgpath)

                    # use an ImgInfoFmt object, to abstract from flat format
                    imgfmt = ImgInfoFmt()
                    imgfmt.lib = lib['namespace']
                    if not 'type' in imageInfo:
                        raise RuntimeError, "Unable to get image info from file: %s" % imgpath
                    imgfmt.type = imageInfo['type']

                    # check for a combined image and process the contained images
                    meta_fname = os.path.splitext(imgpath)[0]+'.meta'
                    if os.path.exists(meta_fname):  # add included imgs
                        processCombinedImg(data, meta_fname, imguri, assetId, imgfmt)

                    # add this image directly
                    # imageInfo = {width, height, filetype}
                    if not 'width' in imageInfo or not 'height' in imageInfo:
                        raise RuntimeError, "Unable to get image info from file: %s" % imgpath
                    imgfmt.width, imgfmt.height, imgfmt.type = (
                        imageInfo['width'], imageInfo['height'], imageInfo['type'])
                    # check if img is already registered as part of a combined image
                    if assetId in data:
                        x = ImgInfoFmt()
                        x.fromFlat(data[assetId])
                        if x.mappedId:
                            continue  # don't overwrite the combined entry
                    data[assetId] = imgfmt.flatten()

                elif skippatt.search(resource[0]):
                    continue

                else:  # handle other resources
                    resdata[assetId] = lib['namespace']


        # wpbasti: Image data is not part relevant yet.
        # Also: Simpejson does no allow unformatted output as far as I know. This result into additional spaces which is suboptimal.
        result += 'if(!window.qxresources)qxresources=' + simplejson.dumps(resdata,ensure_ascii=False) + ";"

        self._console.outdent()

        return result


    ##
    # generate the 'qxlocales',... JS bootstrap entries
    #
    def generateLocalesCode(self, translationMaps, format=False):
        if translationMaps == None:
            return ""

        self._console.info("Generate translation code...")

        result = ["", ""]
        jskeys = ["qxtranslations", "qxlocales"]

        for i in range(len(jskeys)):
            result[i] = 'if(!window.'+jskeys[i]+')'+jskeys[i]+'={};'
            locales = translationMaps[i]  # 0: .po data, 1: cldr data

            for key in locales:
                if format:
                    result += "\n"

                value = locales[key]
                result[i] += jskeys[i]+'["%s"]=' % (key)
                result[i] += simplejson.dumps(value)
                result[i] += ';'

        return "".join(result)


    # wpbasti: This needs a lot of work. What's about the generation of a small bootstrap script
    # from normal qooxdoo classes (include io2.ScriptLoader) and starting the variant selection etc.
    # from there. This would be somewhat comparable to the GWT way.
    # Finally "loader.js" should be completely removed.
    def generateSourcePackageCode(self, parts, packages, boot, format=False):
        if not parts:
            return ""

        # Translate part information to JavaScript
        partData = "{"
        for partId in parts:
            partData += '"%s":' % (partId)
            partData += ('%s,' % parts[partId]).replace(" ", "")

        partData=partData[:-1] + "}"

        # Translate URI data to JavaScript
        allUris = []
        for packageId, package in enumerate(packages):
            packageUris = []
            for fileId in package:
                #cUri = Path.rel_from_to(self.approot, self._classes[fileId]["relpath"])
                lib = self._libs[self._classes[fileId]["namespace"]]
                cUri = self._computeResourceUri(lib, self._classes[fileId]["relpath"], rType='class', appRoot=self.approot)
                packageUris.append('"%s"' % cUri)

            allUris.append("[" + ",".join(packageUris) + "]")

        uriData = "[" + ",\n".join(allUris) + "]"

        # Locate and load loader basic script
        loaderFile = os.path.join(filetool.root(), os.pardir, "data", "generator", "loader.js")
        result = filetool.read(loaderFile)

        # Replace template with computed data
        result = result.replace("%PARTS%", partData)
        result = result.replace("%URIS%", uriData)
        result = result.replace("%BOOT%", '"%s"' % boot)

        return result


    def generateCompiledPackageCode(self, fileName, parts, packages, boot, variants, settings, format=False):
        if not parts:
            return ""

        # Translate part information to JavaScript
        partData = "{"
        for partId in parts:
            partData += '"%s":' % (partId)
            partData += ('%s,' % parts[partId]).replace(" ", "")

        partData=partData[:-1] + "}"

        # Translate URI data to JavaScript
        allUris = []
        for packageId, packages in enumerate(packages):
            packageFileName = self._resolveFileName(fileName, variants, settings, packageId)
            allUris.append('["' + packageFileName + '"]')

        uriData = "[" + ",\n".join(allUris) + "]"

        # Locate and load loader basic script
        loaderFile = os.path.join(filetool.root(), os.pardir, "data", "generator", "loader.js")
        result = filetool.read(loaderFile)

        # Replace template with computed data
        result = result.replace("%PARTS%", partData)
        result = result.replace("%URIS%", uriData)
        result = result.replace("%BOOT%", '"%s"' % boot)

        return result







    ######################################################################
    #  DEPENDENCIES
    ######################################################################

    def getIncludes(self, includeCfg):
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



    def getExcludes(self, excludeCfg):
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



    def _resolveFileName(self, fileName, variants=None, settings=None, packageId=""):
        if variants:
            for key in variants:
                pattern = "{%s}" % key
                fileName = fileName.replace(pattern, variants[key])

        if settings:
            for key in settings:
                pattern = "{%s}" % key
                fileName = fileName.replace(pattern, settings[key])

        if packageId != "":
            fileName = fileName.replace(".js", "-%s.js" % packageId)

        return fileName


    def _computeContentSize(self, content):
        # Convert to utf-8 first
        content = unicode(content).encode("utf-8")

        # Calculate sizes
        origSize = len(content)
        compressedSize = len(zlib.compress(content, 9))

        return "%sKB / %sKB" % (origSize/1024, compressedSize/1024)


    def _computeResourceUri(self, lib, resourcePath, rType="class", appRoot=None):
        '''computes a complete resource URI for the given resource type rType, 
           from the information given in lib and, if lib doesn't provide a
           general uri prefix for it, use appRoot and lib path to construct
           one'''
        
        if 'uri' in lib:
            liburi = lib['uri']
        elif appRoot:
            liburi = Path.rel_from_to(self._config.absPath(appRoot), lib['path'])
        else:
            raise RuntimeError, "Need either lib['uri'] or appRoot, to calculate final URI"

        if rType in lib:
            libInternalPath = lib[rType]
        else:
            raise RuntimeError, "No such resource type: \"%s\"" % rType

        uri = os.path.join(liburi, libInternalPath, resourcePath)
        uri = Path.posifyPath(uri)
        return uri


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


# wpbasti: TODO: Put this into a separate file
class _ResourceHandler(object):
    def __init__(self, generatorobj):
        self._genobj  = generatorobj
        self._resList = None


    def findAllResources(self, libraries, filter=None):
        """Find relevant resources/assets, implementing shaddowing of resources.
           Returns a list of resources, each a pair of [file_path, uri]"""

        # - Helpers -----------------------------------------------------------

        def getCache(lib):
            cacheId = "resinlib-%s" % lib.getNamespace()
            liblist = self._genobj._cache.read(cacheId, dependsOn=None, memory=True)
            return liblist, cacheId

        def isSkipFile(f):
            if [x for x in map(lambda x: re.search(x, f), ignoredFiles) if x!=None]:
                return True
            else:
                return False

        def resourceValue(r):
            # create a pair res = [path, uri] for this resource...
            rsource = os.path.normpath(r)  # normalize "./..."
            relpath = (Path.getCommonPrefix(libObj._resourcePath, rsource))[2]
            if relpath[0] == os.sep:  # normalize "/..."
                relpath = relpath[1:]
            ruri = (self._genobj._computeResourceUri(lib, relpath, rType='resource', 
                                                        appRoot=self._genobj.approot))

            return (resource, ruri)

            
        # - Main --------------------------------------------------------------

        result       = []
        cacheList    = []  # to poss. populate cache
        cacheId      = ""  # will be filled in getCache()
        ignoredFiles = [r'\.meta$',]  # files not considered as resources
        libs         = libraries[:]
        #libs.reverse()     # this is to search the 'important' libs first

        # go through all libs (weighted) and collect necessary resources
        for lib in libs:
            # create wrapper object
            libObj = LibraryPath(lib, self._genobj._console)
            # retrieve list of library resources
            libList, cacheId = getCache(libObj)
            if libList:
                inCache = True
            else:
                libList = libObj.scanResourcePath()
                inCache = False

            # go through list of library resources and add suitable
            for resource in libList:
                if not inCache:
                    cacheList.append(resource)
                if isSkipFile(resource):
                    continue
                elif (filter and not filter(resource)):
                    continue
                else:
                    result.append(resourceValue(resource))

            if not inCache:
                # cache write
                self._genobj._cache.write(cacheId, cacheList, memory=True, writeToFile=False)

        return result

                        
        

    def filterResourcesByClasslist(self, classes):
        # returns a function that takes a resource path and return true if one
        # of the <classes> needs it

        if not self._resList:
            self._resList = self._getResourcelistFromClasslist(classes)  # get consolidated resource list
            self._resList = [re.compile(x) for x in self._resList]  # convert to regexp's

        def filter(respath):
            respath = Path.posifyPath(respath)
            for res in self._resList:
                mo = res.search(respath)  # this might need a better 'match' algorithm
                if mo:
                    return True
            return False

        return filter


    def filterResourcesByFilepath(self, filepatt=None, inversep=lambda x: x):
        """Returns a filter function that takes a resource path and returns
           True/False, depending on whether the resource should be included.
           <filepatt> pattern to match against a resource path, <inversep> if
           the match result should be reversed (for exclusions); example:
               filterResourcesByFilepath(re.compile(r'.*/qx/icon/.*'), lambda x: not x)
           returns only res paths that do *not* match '/qx/icon/'"""
        if not filepatt:
            #filepatt = re.compile(r'\.(?:png|jpeg|gif)$', re.I)
            filepatt = re.compile(r'.*/resource/.*')

        def filter(respath):
            if inversep(re.search(filepatt,respath)):
                return True
            else:
                return False

        return filter


    def _getResourcelistFromClasslist(self, classList):
        """Return a consolidated list of resource fileId's of all classes in classList;
           handles meta info."""
        result = []

        self._genobj._console.info("Compiling resource list...")
        self._genobj._console.indent()
        for clazz in classList:
            classRes = (self._genobj._depLoader.getMeta(clazz))['assetDeps'][:]
            iresult  = []
            for res in classRes:
                # here it might need some massaging of 'res' before lookup and append
                # expand file glob into regexp
                res = re.sub(r'\*', ".*", res)
                # expand macros
                if res.find('${')>-1:
                    expres = self._expandMacrosInMeta(res)
                else:
                    expres = [res]
                for r in expres:
                    if r not in result + iresult:
                        iresult.append(r)
            self._genobj._console.debug("%s: %s" % (clazz, repr(iresult)))
            result.extend(iresult)

        self._genobj._console.outdent()
        return result


    # wpbasti: Isn't this something for the config class?
    # Do we have THE final solution for these kind of variables yet?
    # The support for macros, themes, variants and all the types of variables make me somewhat crazy.
    # Makes it complicated for users as well.
    def _expandMacrosInMeta(self, res):
        themeinfo = self._genobj._job.get('themes',{})

        def expMacRec(rsc):
            if rsc.find('${')==-1:
                return [rsc]
            result = []
            nres = rsc[:]
            mo = re.search(r'\$\{(.*?)\}',rsc)
            if mo:
                themekey = mo.group(1)
                if themekey in themeinfo:
                    # create an array with all possibly variants for this replacement
                    iresult = []
                    for val in themeinfo[themekey]:
                        iresult.append(nres.replace('${'+themekey+'}', val))
                    # for each variant replace the remaining macros
                    for ientry in iresult:
                        result.extend(expMacRec(ientry))
                else:
                    nres = nres.replace('${'+themekey+'}','') # just remove '${...}'
                    #nres = os.path.normpath(nres)     # get rid of '...//...'
                    nres = nres.replace('//', '/')    # get rid of '...//...'
                    result.append(nres)
                    self._genobj._console.warn("Empty replacement of macro '%s' in asset spec." % themekey)
            else:
                raise SyntaxError, "Non-terminated macro in string: %s" % rsc
            return result

        result = expMacRec(res)
        return result


# scratch pad:

'''
'''
