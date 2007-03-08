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
#
################################################################################

import re
import os
import sys
import shutil
import logging
import optparse

import config
import loader
import filetool
import compiler
import textutil
import tokenizer
import optparseext
import treegenerator



LOGGING_READY = False

def setupLogging(verbose=False):
    global LOGGING_READY
    if LOGGING_READY:
        return
    
    # define a Handler which writes INFO messages or higher to the sys.stdout
    console = logging.StreamHandler(sys.stdout)
    if verbose:
        console.setLevel(logging.NOTSET)
    else:
        console.setLevel(logging.INFO)
    # set a format which is simpler for console use
    formatter = logging.Formatter('%(message)s')
    console.setFormatter(formatter)
    logging.getLogger().addHandler(console)
    logging.getLogger().setLevel(logging.NOTSET)
    LOGGING_READY = True


LOGFILE = "migration.log"

MIGRATION_ORDER = [
    "0.5.2",
    "0.6",
    "0.6.1",
    "0.6.2",
    "0.6.3",
    "0.6.4",
    "0.6.5",
    "0.6.6",
    "0.7"
]
        

def entryCompiler(line):
    # protect escaped equal symbols
    line = line.replace("\=", "----EQUAL----")

    splitLine = line.split("=")

    if len(splitLine) < 2:
        logging.error("        - Malformed entry: %s" % line)
        return

    orig = "".join(splitLine[:-1]).strip()
    repl = splitLine[-1].strip()

    #print "%s :: %s" % (orig, value)

    # recover protected equal symbols
    orig = orig.replace("----EQUAL----", "=")
    repl = repl.replace("----EQUAL----", "=")

    return {"expr":re.compile(orig), "orig":orig, "repl":repl}




def regtool(content, regs, patch):
    for patchEntry in regs:
        matches = patchEntry["expr"].findall(content)
        itercontent = content
        line = 1

        for fragment in matches:

            # Replacing
            if patch:
                content = patchEntry["expr"].sub(patchEntry["repl"], content, 1)
                # Debug
                logging.debug("      - Replacing pattern '%s' to '%s'" % (patchEntry["orig"],
                                                                   patchEntry["repl"]))
            else:
                # Search for first match position
                pos = itercontent.find(fragment)
                pos = patchEntry["expr"].search(itercontent).start()
        
                # Update current line
                line += len((itercontent[:pos] + fragment).split("\n")) - 1
        
                # Removing leading part til matching part
                itercontent = itercontent[pos+len(fragment):]
        
                # Debug
                logging.debug("      - Matches %s in %s" % (patchEntry["orig"], line))
                logging.info("      - Line %s: %s" % (line, patchEntry["repl"]))

    return content 




def getHtmlList(migrationInput):
    """
    scans an array of directories for HTML files and returns the full 
    file names of the found HTML files as array
    """
    htmlList = []

    for htmlDir in migrationInput:
        for root, dirs, files in os.walk(htmlDir):

            # Filter ignored directories
            for ignoredDir in config.DIRIGNORE:
                if ignoredDir in dirs:
                    dirs.remove(ignoredDir)

            # Searching for files
            for fileName in files:
                if os.path.splitext(fileName)[1] in [".js", ".html", ".htm",
                                                     ".php", ".asp", ".jsp"]:
                    htmlList.append(os.path.join(root, fileName))

    return htmlList


def getPatchDirectory():
    """
    Returns the directory where the patches are located
    """
    basePath = os.path.dirname(os.path.abspath(sys.argv[0]))
    if os.path.basename(sys.argv[0]) == "migrator.py":
        (basePath, tail) = os.path.split(basePath)
        
    return os.path.join(basePath, "migration")


def getNeededUpdates(baseVersion):
    """
    Returns an array of needed uptated to upgrade to the current version
    """
    return MIGRATION_ORDER[MIGRATION_ORDER.index(getNormalizedVersion(baseVersion))+1:]


def getNormalizedVersion(version):
    return version.split("-")[0].strip()


def isValidVersion(version):
    try:
        MIGRATION_ORDER.index(getNormalizedVersion(version))
    except ValueError:
        return False
    return True


def getPatchModulePath(version):
    """
    Scans the patch directory for the existence of a patch.py file
    and returns the full filename.
    Returns None if no patch.py could be found.
    """
    versionPatchPath = os.path.join(getPatchDirectory(), version)
    for root, dirs, files in os.walk(versionPatchPath):

        # Filter ignored directories
        for ignoredDir in config.DIRIGNORE:
            if ignoredDir in dirs:
                dirs.remove(ignoredDir)

        # Searching for files
        for fileName in files:
            filePath = os.path.join(root, fileName)

            if os.path.splitext(fileName)[1] != config.PYEXT:
                continue

            if fileName == "patch.py":
                return os.path.join(root, fileName)
    return None
                
                  
def readPatchInfoFiles(baseDir):
    """
    Reads all patch/info files from a directory and compiles the containing
    regular expressions.
    Retuns a list comiled RE (the output of entryCompiler)
    """
    patchList = []
    emptyLine = re.compile("^\s*$")
    
    for root, dirs, files in os.walk(baseDir):

        # Filter ignored directories
        for ignoredDir in config.DIRIGNORE:
            if ignoredDir in dirs:
                dirs.remove(ignoredDir)

        # Searching for files
        for fileName in files:
            filePath = os.path.join(root, fileName)

            fileContent = textutil.any2Unix(filetool.read(filePath, "utf-8"))
            patchList.append({"path":filePath, "content":fileContent.split("\n")})

            logging.debug("    - %s" % filePath)

    logging.debug("    - Compiling expressions...")

    compiledPatches = []

    for patchFile in patchList:
        logging.debug("      - %s" % os.path.basename(patchFile["path"]))
        for line in patchFile["content"]:
            if emptyLine.match(line) or line.startswith("#") or line.startswith("//"):
                continue

            compiled = entryCompiler(line)
            if compiled != None:
                compiledPatches.append(compiled)

    return compiledPatches


def migrateFile(
                filePath, compiledPatches, compiledInfos,
                hasPatchModule=False, options=None, encoding="UTF-8"):
    
    logging.info("    - Processing file %s" % filePath)
    
    # Read in original content
    fileContent = filetool.read(filePath, encoding)
    
    # apply RE patches
    patchedContent = regtool(fileContent, compiledPatches, True)
    patchedContent = regtool(patchedContent, compiledInfos, False)
            
    # Apply patches
    if hasPatchModule:
        fileId = loader.extractFileContentId(fileContent);
        import patch
        tree = treegenerator.createSyntaxTree(tokenizer.parseStream(patchedContent))

        # If there were any changes, compile the result
        if patch.patch(fileId, tree):
            options.prettyPrint = True  # make sure it's set
            patchedContent = compiler.compile(tree, options)

    # Write file
    if patchedContent != fileContent:
        logging.info("      - Store modifications...")
        filetool.save(filePath, patchedContent, encoding)    
             

def handle(fileList, options, migrationTarget,
           encoding="UTF-8", migrationInput=None, verbose=False):
    
    if migrationInput is None:
        migrationInput = []
  
    setupLogging(verbose)   
  
    htmlList = getHtmlList(migrationInput)

    logging.info("  * Number of script input files: %s" % len(fileList))
    logging.info("  * Number of HTML input files: %s" % len(htmlList))
    logging.info("  * Update to version: %s" % migrationTarget)


    logging.info("  * Searching for patch module...")
    importedModule = False
    patchFile = getPatchModulePath(migrationTarget)
    if patchFile is not None:
        root = os.path.dirname(patchFile)
        if not root in sys.path:
            sys.path.insert(0, root)

        importedModule = True

    confPath = os.path.join(getPatchDirectory(), migrationTarget)

    logging.info("  * Searching for info expression data...")
    compiledInfos = readPatchInfoFiles(os.path.join(confPath, "info"))
    logging.info("    - Number of infos: %s" % len(compiledInfos))


    logging.info("  * Searching for patch expression data...")
    compiledPatches = readPatchInfoFiles(os.path.join(confPath, "patches"))
    logging.info("    - Number of patches: %s" % len(compiledPatches))



    logging.info("")
    logging.info("  FILE PROCESSING:")
    logging.info("----------------------------------------------------------------------------")

    if len(fileList) > 0:
        logging.info("  * Processing script files:")
        for filePath in fileList:
            migrateFile(filePath, compiledPatches, compiledInfos,
                        importedModule, options=options,
                        encoding=encoding)
            
        logging.info("  * Done")


    if len(htmlList) > 0:
        logging.info("  * Processing HTML files:")
        for filePath in htmlList:
            migrateFile(filePath, compiledPatches, compiledInfos)
        logging.info("  * Done")


def patchMakefile(makefilePath, newVersion, oldVersion):
    patchMakefileRe = re.compile("^(\s*QOOXDOO_VERSION\s*=\s*)%s" % oldVersion)
    patchProjectMk = re.compile("\bproject.mk\b")
    inFile = open(makefilePath)
    outFile = open(makefilePath + ".tmp", "w")
    for line in inFile:
        line = re.sub(patchMakefileRe, "\g<1>" + newVersion, line)
        line = line.replace(
             "frontend/framework/tool/make/project.mk",
             "frontend/framework/tool/make/application.mk"
         )
        outFile.write(line)
    outFile.close()
    inFile.close()
    shutil.move(makefilePath + ".tmp", makefilePath)
    

def migrateSingleFile(fileName, options, neededUpdates):
    
    if not os.path.isfile(fileName):
        print """
ERROR: The file '%s' could not be found.
""" % fileName
        sys.exit(1)
    
    #turn off logging
    setupLogging()
    #logging.getLogger().setLevel(logging.NOTSET)
    logging.disable(logging.ERROR)
    

    #backup file
    shutil.copyfile(fileName, fileName + ".migration.bak")
    
    try:
        for version in neededUpdates:
            handle([fileName], options, getNormalizedVersion(version))
    finally:
        # print migrated file
        for line in open(fileName):
            print line,
        #restore file
        shutil.copyfile(fileName + ".migration.bak", fileName)
    

def main():
    
    parser = optparse.OptionParser(
        "usage: %prog [options]",
        option_class=optparseext.ExtendAction
   )

    parser.add_option(
          "-m", "--from-makefile",
          dest="makefile", metavar="MAKEFILE",
          help="Makefile of the skeleton project to migrate (optional)"
    )
    parser.add_option(
          "--from-version", dest="from_version",
          metavar="VERSION", default="",
          help="qooxdoo version used for the project e.g. '0.6.3'"
    )
    parser.add_option(
          "-i", "--input",
          dest="file", metavar="FILE.js",
          help="Migrate just one JavaScript file. Writes the generated file to STDOUT."
    )
    
    # options from generator.py
    parser.add_option(
          "--class-path",
          action="extend", dest="classPath",
          metavar="DIRECTORY", type="string", default=[],
          help="Define a class path."
    )
    parser.add_option(
          "-v", "--verbose",
          action="store_true", dest="verbose", default=False,
          help="Verbose output mode."
    )    
    parser.add_option(
          "--class-encoding",
          action="extend", dest="classEncoding",
          metavar="ENCODING", type="string", default=[],
          help="Define the encoding for a class path."
    )    

    # Options for pretty printing
    compiler.addCommandLineOptions(parser)
    (options, args) = parser.parse_args()
    
    if options.from_version == "":
        if options.makefile:
            print """
WARNING: The qooxdoo version, this project uses is unknown.
            
Please set the variable QOOXDOO_VERSION in your Makefile to the qooxdoo
version this project currently uses.

Example:

QOOXDOO_VERSION = 0.6.4
"""
        else:
            print """
ERROR: Please specify the qooxdoo version you migrate from using '--from-version'!
"""
        
        sys.exit(1)

    if not isValidVersion(options.from_version):
        print "\nERROR: The version '%s' is not a valid version string!\n" % options.from_version
        sys.exit(1)
        
    
    if MIGRATION_ORDER[-1] == getNormalizedVersion(options.from_version):
        print "\n Nothing to do. Your application is up to date!\n"
        sys.exit()
        
    # to migrate a single file extract the class path
    if options.classPath == [] and options.file:
        options.classPath = [os.path.dirname(os.path.abspath(options.file))]
    
    if options.classPath == []:
        print """
ERROR: The class path is empty. Please specify the class pass using the
       --class-path option
"""
        sys.exit(0)

   
    neededUpdates = getNeededUpdates(options.from_version)

    # check whether tree bases modifications will be used
    hasPatchModule = False
    for version in neededUpdates:
        if getPatchModulePath(version) is not None:
            hasPatchModule = True
            break
           
    # set options for the loader and migrator
    options.classUri = []
    options.resourceInput = []
    options.resourceOutput = []
    options.cacheDirectory = None
    options.disableInternalCheck = False
    options.prettyPrint = True

    # migrate a single file
    if options.file:
        migrateSingleFile(options.file, options, neededUpdates)
        sys.exit(0)
        
    # build file database
    fileDb = {}
    listIndex = 0
    for path in options.classPath:
        loader.indexSingleScriptInput(path, listIndex, options, fileDb)
        listIndex += 1
        
            
    print"""
MIGRATION SUMMARY:

Current qooxdoo version:   %s
Upgrade path:              %s

Affected Classes:
    %s""" % (options.from_version, " -> ".join(neededUpdates), "\n    ".join(fileDb.keys()))
    
    if hasPatchModule:
        print """
WARNING: The JavaScript files will be pretty printed. You can customize the
         pretty printer using the PRETTY_PRINT_OPTIONS variable in your
         Makefile. You can find a complete list of pretty printing options
         at http://qooxdoo.org/documentation/articles/code_style."""
         
    choice = raw_input("""

WARNING: The migration process will update the files in place. Please make 
         sure, you have a backup of your project. The complete output of the
         migrations process will be logged to '%s'.
         
Do you want to start the migration now? [no] : """ % LOGFILE)
    
    if not choice.lower() in ["j", "y", "yes"]:
        sys.exit()

    # start migration
    setupLogging(options.verbose)
    fileLogger = logging.FileHandler(LOGFILE, "w")
    formatter = logging.Formatter('%(message)s')
    fileLogger.setFormatter(formatter)
    fileLogger.setLevel(logging.NOTSET)
    logging.getLogger().addHandler(fileLogger)    
    
    for version in neededUpdates:
        logging.info("")
        logging.info("UPGRADE TO %s" % (version))
        logging.info("----------------------------------------------------------------------------")
     
        fileList = map(lambda x: fileDb[x]["path"], fileDb.keys())
        handle(fileList, options, getNormalizedVersion(version), verbose=options.verbose)

    
    # patch makefile
    patchMakefile(options.makefile, MIGRATION_ORDER[-1], options.from_version)
    


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
