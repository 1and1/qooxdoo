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

import sys, os, optparse, string, types
import simplejson
from optparseext.ExtendAction import ExtendAction
from generator.Log import Log
from generator.Config import Config
from generator.Generator import Generator



def main():
    if len(sys.argv[1:]) == 0:
        basename = os.path.basename(sys.argv[0])
        print "usage: %s [options]" % basename
        print "Try '%s -h' or '%s --help' to show the help message." % (basename, basename)
        sys.exit(1)

    parser = optparse.OptionParser(option_class=ExtendAction)

    parser.add_option("-c", "--config", dest="config", metavar="FILENAME", help="Configuration file")
    parser.add_option("-j", "--jobs", action="extend", dest="jobs", metavar="DIRECTORY", type="string", default=[], help="Selected jobs")
    parser.add_option("-q", "--quiet", action="store_true", dest="quiet", default=False, help="Quiet output mode (Extra quiet).")
    parser.add_option("-v", "--verbose", action="store_true", dest="verbose", default=False, help="Verbose output mode (Extra verbose).")
    parser.add_option("-l", "--logfile", dest="logfile", metavar="FILENAME", default=None, type="string", help="Log file")

    # runtime addons
    parser.add_option("--setting", action="extend", dest="settings", metavar="KEY:VALUE", type="string", default=[], help="Used settings")
    parser.add_option("--variant", action="extend", dest="variants", metavar="KEY:VALUE", type="string", default=[], help="Selected variants")
    parser.add_option("--require", action="extend", dest="require", metavar="CLASS1:CLASS2", type="string", default=[], help="Special loadtime class dependencies")
    parser.add_option("--use", action="extend", dest="use", metavar="CLASS1:CLASS2", type="string", default=[], help="Special runtime class dependencies")
    parser.add_option("--featureset", action="extend", dest="featuresets", metavar="NAMESPACE:FILE", type="string", default=[], help="Featureset files to load")

    (options, args) = parser.parse_args(sys.argv[1:])

    # Initialize console
    if options.verbose:
        console = Log(options.logfile, "debug")
    elif options.quiet:
        console = Log(options.logfile, "warning")
    else:
        console = Log(options.logfile, "info")

    # Initial user feedback
    console.head("Initialization", True)
    console.info("Processing...")
    console.indent()
    console.debug("Configuration: %s" % options.config)
    console.debug("Jobs: %s" % ", ".join(options.jobs))
    console.outdent()

    # Load from json configuration
    obj = open(options.config)
    config = simplejson.loads(obj.read())
    jobsmap = config['jobs']
    obj.close()

    # Resolve "include"-Keys
    if config.has_key('include'):
        for cfgfile in config['include']:
            obj = open(cfgfile[1])
            econfig = simplejson.loads(obj.read())
            obj.close()
            #for ejob in econfig['jobs']:
            #    _resolveEntry(console, econfig['jobs'], ejob)
            jobsmap[cfgfile[0]] = econfig # external config becomes namespace'd entry in jobsmap

    # Resolve "run"-Key
    expandedjobs = []
    for job in options.jobs:
        if not job in expandedjobs:
            entry = jobsmap[job]
            if entry.has_key("run"):
                for subjob in entry["run"]:
                    # make new job map job::subjob as copy of job, but extend[subjob]
                    newjobname = job + '::' + subjob
                    newjob = entry.copy()
                    del newjob['run']       # remove 'run' key
                    if 'extend' in newjob:  # add subjob to 'extend'
                        newjob['extend'].append(subjob)
                    else:
                        newjob['extend'] = [subjob] # extend subjob
                    # add to config
                    jobsmap[newjobname] = newjob
                    # add to job list
                    expandedjobs.append(newjobname)
            else:
                expandedjobs.append(job)

    console.debug("Expanded to %s jobs" % len(expandedjobs))

    # Resolve "extend"-Keys
    _resolveExtends(console, jobsmap, expandedjobs)

    # Resolve "let"-Keys
    _resolveMacros(console, jobsmap, expandedjobs)
    # console.debug(simplejson.dumps(jobsmap, separators=(',',':')))

    # Convert into Config class instance
    config = Config(jobsmap)

    # Processing feature sets
    variants, settings, require, use = _executeFeatureSets(console, options)

    # Processing jobs...
    for job in expandedjobs:
        console.head("Executing: %s" % job, True)
        Generator(config.extract(job), console, variants, settings, require, use)



def _mapMerge(source, target):
    """merge source map into target, but don't overwrite existing
       keys in target (unlike .update())"""
    t = target.copy()
    for (k,v) in source.items():
        if not t.has_key(k):
            t[k] = v
    return t


def _confGet(conf, key, default=None):
    data = conf
    splits = key.split("/")

    for item in splits:
        if isinstance(data, types.DictType) and data.has_key(item):
            data = data[item]
        else:
            return default

    return data
        

def _resolveExtends(console, config, jobs):
    def _listPrepend(source, target):
        """returns new list with source prepended to target"""
        l = target[:]
        for i in range(len(source)-1,-1,-1):
            l.insert(0,source[i])
        return l

    def _mergeEntry(target, source):
        for key in source:
            # merge 'let' key rather than shadowing
            #if key == 'let'and target.has_key(key):
            #    target[key] = _listPrepend(source[key],target[key])
            
            # merge 'settings' and 'let' key rather than shadowing
            if (key in ['settings','let']) and target.has_key(key):
                target[key] = _mapMerge(source[key],target[key])
            if not target.has_key(key):
                target[key] = source[key]

    def _resolveEntry(console, config, job):
        # TODO: look up job in global list, to prevent circular references
        if not _confGet(config,job,False):
            console.warn("No such job: %s" % job)
            sys.exit(1)

        data = _confGet(config,job)

        if data.has_key("resolved"):
            return

        if data.has_key("extend"):
            includes = data["extend"]
            if job.rfind('/')>-1:
                jobcontext = _confGet(config, job[:job.rfind('/')]) # job context has the 'parent' key
            else:
                jobcontext = config  # we are top-level

            for entry in includes:
                _resolveEntry(console, jobcontext, entry)
                _mergeEntry(data, _confGet(jobcontext,entry))

        data["resolved"] = True

    console.info("Resolving jobs...")
    console.indent()

    for job in jobs:
        _resolveEntry(console, config, job)

    console.outdent()


def _resolveMacros(console, config, jobs):
    def _expandString(s, map):
        templ = string.Template(s)
        sub = templ.safe_substitute(map)
        return sub

    def _expandMacrosInValues(configElem, macroMap):
        """ apply macro expansion in strings recursively """
        # arrays
        if isinstance(configElem, types.ListType):
            for e in range(len(configElem)):
                if ((isinstance(configElem[e], types.StringTypes) and
                        configElem[e].find(r'${')>-1)):
                    old = configElem[e]
                    configElem[e] = _expandString(configElem[e], macroMap)
                    console.debug("expanding: %s ==> %s" % (old, configElem[e]))
                elif isinstance(configElem[e], (types.DictType, types.ListType)):
                    _expandMacrosInValues(configElem[e], macroMap)
        # dicts
        elif isinstance(configElem, types.DictType):
            for e in configElem:
                # expand in values
                if ((isinstance(configElem[e], types.StringTypes) and
                        configElem[e].find(r'${')>-1)):
                    configElem[e] = _expandString(configElem[e], macroMap)
                    console.debug("expanding: %s ==> %s" % (str(e), configElem[e]))
                elif isinstance(configElem[e], (types.DictType, types.ListType)):
                    _expandMacrosInValues(configElem[e], macroMap)

                # expand in keys
                if ((isinstance(e, types.StringTypes) and
                        e.find(r'${')>-1)):
                    enew = _expandString(e, macroMap)
                    configElem[enew] = configElem[e]
                    del configElem[e]
                    console.debug("expanding key: %s ==> %s" % (e, enew))

        # leave everything else alone
        else:
            pass


    def _expandMacrosInLet(letList):
        """ takes array of pairs and returns dict with pair[0]:pair[1] entries
            with macros expanded along the way"""

        dict = {}
        for pair in letList:
            v = pair[1]
            if (v.find(r'${')>-1):
                v = _expandString(pair[1], dict)  # apply what we have so far
            dict[pair[0]] = v
        return dict


    def _expandMacrosInLet1(letDict):
        """ takes dict with macro definitions and expands all of them within the dict"""

        keys = letDict.keys()
        for k in keys:
            kval = letDict[k]
            for k1 in keys:
                if k != k1 and letDict[k1].find(r'${')>-1:
                    letDict[k1] = _expandString(letDict[k1], {k:kval})
                    console.debug("expanding: %s ==> %s" % (k1, letDict[k1]))
        return letDict


    console.info("Resolving macros...")
    console.indent()

    for job in jobs:
        if not config.has_key(job):
            console.warn("No such job: %s" % job)
            sys.exit(1)
        else:
            if config[job].has_key('let'):
                # exand macros in the let
                config[job]['let'] = _expandMacrosInLet1(config[job]['let'])
                # apply dict to other values
                _expandMacrosInValues(config[job], config[job]['let'])

    console.outdent()


def _executeFeatureSets(console, options):
    def _variantToSet(data):
        for key in data:
            if data[key] == "on":
                data[key] = True
            elif data[key] == "off":
                data[key] = False

        return data

    def _variantFromSet(data):
        for key in data:
            if data[key] == True:
                data[key] = "on"
            elif data[key] == False:
                data[key] = "off"
            elif not isinstance(data[key], basestring):
                data[key] = "%s" % data[key]

        return data

    def _settingToSet(data):
        for key in data:
            if data[key] == "true":
                data[key] = True
            elif data[key] == "false":
                data[key] = False

        return data

    def _settingFromSet(data):
        for key in data:
            if data[key] == True:
                data[key] = "true"
            elif data[key] == False:
                data[key] = "false"
            elif not isinstance(data[key], basestring):
                data[key] = "%s" % data[key]

        return data

    def _splitSingle(data, divider=":"):
        result = {}
        for entry in data:
            splitted = entry.split(divider)
            result[splitted[0]] = splitted[1]

        return result

    def _splitMulti(data, divider=":"):
        result = {}
        for entry in data:
            splitted = entry.split(divider)
            key = splitted[0]
            value = splitted[1]

            if not result.has_key(key):
                result[key] = []

            result[key].append(value)

        return result

    sets = options.featuresets
    variants = _splitSingle(options.variants)
    settings = _splitSingle(options.settings)
    require = _splitMulti(options.require)
    use = _splitMulti(options.use)

    runtime = {
      "variant" : _variantToSet(variants),
      "setting" : _settingToSet(settings),
      "require" : require,
      "use" : use
    }

    for fileName in sets:
        console.debug("Executing feature set: %s" % fileName)
        execfile(fileName, {}, runtime)

    # Convert to useable variants and settings
    variants = _variantFromSet(runtime["variant"])
    settings = _settingFromSet(runtime["setting"])

    return variants, settings, require, use



if __name__ == '__main__':
    try:
        main()

    except KeyboardInterrupt:
        print
        print "Keyboard interrupt!"
        sys.exit(1)
