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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)
#resource(qx.static:static)
#use(qx.lang.Core)
#use(qx.lang.Generics)

************************************************************************ */

/**
 * Create namespace
 */
qx =
{
  /**
   * Bootstrap qx.Bootstrap to create myself later
   * This is needed for the API browser etc. to let them detect me
   */
  Bootstrap :
  {
    createNamespace : function(name, object)
    {
      var splits = name.split(".");
      var parent = window;
      var part = splits[0];

      for (var i=0, len=splits.length-1; i<len; i++, part=splits[i])
      {
        if (!parent[part]) {
          parent = parent[part] = {};
        } else {
          parent = parent[part];
        }
      }

      // store object
      parent[part] = object;

      // return last part name (e.g. classname)
      return part;
    },

    define : function(name, config)
    {
      if (!config) {
        var config = { statics : {} };
      }

      var clazz;
      var proto = null;

      if (config.members)
      {
        clazz = config.construct || new Function;
        var statics = config.statics;
        for (var key in statics) {
          clazz[key] = statics[key];
        }

        proto = clazz.prototype;
        var members = config.members;
        for (var key in members) {
          proto[key] = members[key];
        }
      }
      else
      {
        clazz = config.statics || {};
      }

      this.createNamespace(name, clazz);

      if (config.defer) {
        config.defer(clazz, proto);
      }

      // Store class reference in global class registry
      qx.Bootstrap.$$registry[name] = config.statics;
    }
  }
};


/**
 * Internal class that is responsible for bootstrapping the qooxdoo
 * framework at load time.
 *
 * Automatically loads JavaScript language fixes and enhancements to
 * bring all engines to at least JavaScript 1.6.
 *
 * Does support:
 * * Statics
 * * Members
 * * Defer
 *
 * Does not support:
 * * Custom extends
 * * Super class calls
 * * Mixins, Interfaces, Properties, ...
 */
qx.Bootstrap.define("qx.Bootstrap",
{
  statics :
  {
    /** Timestamp of qooxdoo based application startup */
    LOADSTART : new Date,


    /**
     * Creates a namespace and assigns the given object to it.
     * Lightweight version of {@link qx.Class#createNamespace} only used during bootstrap phase.
     *
     * @type static
     * @internal
     * @param name {String} The complete namespace to create. Typically, the last part is the class name itself
     * @param object {Object} The object to attach to the namespace
     * @return {Object} last part of the namespace (typically the class name)
     * @throws an exception when the given object already exists.
     */
    createNamespace : qx.Bootstrap.createNamespace,


    /**
     * Define a new class using the qooxdoo class system.
     * Lightweight version of {@link qx.Class#define} only used during bootstrap phase.
     *
     * @type map
     * @internal
     * @signature function(name, config)
     * @param name {String} Name of the class
     * @param config {Map ? null} Class definition structure.
     * @return {void}
     */
    define : qx.Bootstrap.define,


    /**
     * Find a class by its name
     *
     * @type static
     * @param name {String} class name to resolve
     * @return {Class} the class
     */
    getByName : function(name) {
      return this.$$registry[name];
    },


    /**
     * Returns the current timestamp
     *
     * @type static
     * @return {Integer} Current timestamp (milliseconds)
     */
    time : function() {
      return new Date().getTime();
    },


    /**
     * Returns the time since initialisation
     *
     * @type static
     * @return {Integer} milliseconds since load
     */
    since : function() {
      return this.time() - this.LOADSTART;
    },


    /** {Map} Stores all defined classes */
    $$registry : {}
  }
});
