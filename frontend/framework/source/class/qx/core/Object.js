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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(core)
#optional(qx.dev.StackTrace)
#require(qx.core.Property)
#use(qx.event.handler.Object)

************************************************************************ */

/**
 * The qooxdoo root class. All other classes are direct or indirect subclasses of this one.
 *
 * This class contains methods for:
 *
 * * object management (creation and destruction)
 * * interfaces for event system
 * * generic setter/getter support
 * * interfaces for logging console
 * * user friendly OO interfaces like {@link #self} or {@link #base}
 */
qx.Class.define("qx.core.Object",
{
  extend : Object,





  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Create a new instance
   *
   * @type constructor
   */
  construct : function()
  {

    this._hashCode = qx.core.Object.__availableHashCode++;

    if (this._autoDispose)
    {
      this.__dbKey = qx.core.Object.__db.length;
      qx.core.Object.__db.push(this);
    }
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** TODOC */
    __availableHashCode : 0,


    /** TODOC */
    __db : [],


    /** TODOC */
    __disposeAll : false,


    /** Internal type */
    $$type : "Object",


    /**
     * Returns an unique identifier for the given object. If such an identifier
     * does not yet exist, create it.
     *
     * @type static
     * @param obj {Object} the Object to get the hashcode for
     * @return {Integer} unique identifier for the given object
     */
    toHashCode : function(obj)
    {
      if (obj._hashCode != null) {
        return obj._hashCode;
      }

      return obj._hashCode = this.__availableHashCode++;
    },


    /**
     * Returns the database created, but not yet disposed elements.
     * Please be sure to not modify the given array!
     *
     * @type static
     * @internal
     * @return {Array} The database
     */
    getDb : function() {
      return this.__db;
    },


    /**
     * Destructor. This method is called by qooxdoo on object destruction.
     *
     * Any class that holds resources like links to DOM nodes must override
     * this method and free these resources.
     *
     * @type static
     * @param unload {Boolean?false} Whether the dispose is fired through the page unload event
     * @return {void}
     */
    dispose : function(unload)
    {
      if (this.__disposed) {
        return;
      }

      this.__disposed = true;
      this.__unload = unload || false;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!unload && qx.core.Setting.get("qx.disposerDebugLevel") >= 1)
        {
          var disposeStart = new Date;
          qx.core.Log.debug("Disposing qooxdoo application...");
        }
      }

      // var vStart = (new Date).valueOf();
      var vObject, vObjectDb = this.__db;

      for (var i=vObjectDb.length - 1; i>=0; i--)
      {
        vObject = vObjectDb[i];

        if (vObject && vObject.__disposed === false)
        {
          try
          {
            vObject.dispose();
          }
          catch(ex)
          {
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (window.console) {
                qx.core.Log.warn("Could not dispose: " + vObject + ": ", ex);
              } else {
                throw ex;
              }
            }
          }
        }
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!unload && qx.core.Setting.get("qx.disposerDebugLevel") >= 1)
        {
          // check dom
          var elems = document.all ? document.all : document.getElementsByTagName("*");

          qx.core.Log.debug("Checking " + elems.length + " elements for object references...");

          for (var i=0, l=elems.length; i<l; i++)
          {
            var elem = elems[i];

            for (var key in elem)
            {
              try
              {
                if (typeof elem[key] == "object")
                {
                  if (elem[key] instanceof qx.core.Object || elem[key] instanceof Array) {

                    var name = "unknown object";

                    if (elem[key] instanceof qx.core.Object) {
                      name = elem[key].classname + "[" + elem[key].toHashCode() + "]";
                    }

                    qx.core.Log.debug("Attribute '" + key + "' references " + name + " in DOM element: " + elem.tagName);
                  }
                }
              }
              catch(ex)
              {
                // ignore access errors
              }
            }
          }

          qx.core.Log.debug("Disposing done in " + (new Date() - disposeStart) + "ms");
        }
      }
    },


    /**
     * Returns whether a global dispose is currently taking place.
     *
     * @type static
     * @return {Boolean} whether a global dispose is taking place.
     */
    inGlobalDispose : function() {
      return this.__disposed || false;
    },


    /**
     * Returns whether a global unload (page unload) is currently taking place.
     *
     * @type static
     * @return {Boolean} whether a global unload is taking place.
     */
    isPageUnload : function() {
      return this.__unload || false;
    }
  },






  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /** If the object should automatically be disposed on application unload */
    _autoDispose : true,


    /*
    ---------------------------------------------------------------------------
      BASICS
    ---------------------------------------------------------------------------
    */

    /**
     * Return unique hash code of object
     *
     * @type member
     * @return {Integer} unique hash code of the object
     */
    toHashCode : function() {
      return this._hashCode;
    },


    /**
     * Returns a string represantation of the qooxdoo object.
     *
     * @type member
     * @return {String} string representation of the object
     */
    toString : function()
    {
      if (this.classname) {
        return "[object " + this.classname + "]";
      }

      return "[object Object]";
    },


    /**
     * Call the same method of the super class.
     *
     * @type member
     * @param args {arguments} the arguments variable of the calling method
     * @param varags {var} variable number of arguments passed to the overwritten function
     * @return {var} the return value of the method of the base class.
     */
    base : function(args, varags)
    {
      if (arguments.length === 1) {
        return args.callee.base.call(this);
      } else {
        return args.callee.base.apply(this, Array.prototype.slice.call(arguments, 1));
      }
    },


    /**
     * Returns the static class (to access static members of this class)
     *
     * @type member
     * @param args {arguments} the arguments variable of the calling method
     * @return {var} the return value of the method of the base class.
     */
    self : function(args) {
      return args.callee.self;
    },




    /*
    ---------------------------------------------------------------------------
      COMMON SETTER/GETTER/RESETTER SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets multiple properties at once by using a property list or
     * sets one property and its value by the first and second argument.
     *
     * @type member
     * @param data {Map | String} a map of property values. The key is the name of the property.
     * @param value {var?} the value, only used when <code>data</code> is a string.
     * @return {Object} this instance.
     * @throws an Exception if a property defined does not exist
     */
    set : function(data, value)
    {
      var setter = qx.core.Property.$$method.set;

      if (typeof data === "string")
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (!this[setter[data]])
          {
            this.warn("No such property: " + data);
            return;
          }
        }

        return this[setter[data]](value);
      }
      else
      {
        for (var prop in data)
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (!this[setter[prop]])
            {
              this.warn("No such property: " + prop);
              continue;
            }
          }

          this[setter[prop]](data[prop]);
        }

        return this;
      }
    },


    /**
     * Returns the value of the given property.
     *
     * @type member
     * @param prop {String} Name of the property.
     * @return {var} The value of the value
     * @throws an Exception if a property defined does not exist
     */
    get : function(prop)
    {
      var getter = qx.core.Property.$$method.get;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!this[getter[prop]])
        {
          this.warn("No such property: " + prop);
          return;
        }
      }

      return this[getter[prop]]();
    },


    /**
     * Resets the value of the given property.
     *
     * @type member
     * @param prop {String} Name of the property.
     * @throws an Exception if a property defined does not exist
     */
    reset : function(prop)
    {
      var resetter = qx.core.Property.$$method.reset;

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!this[resetter[prop]])
        {
          this.warn("No such property: " + prop);
          return;
        }
      }

      this[resetter[prop]]();
    },





    /*
    ---------------------------------------------------------------------------
      EVENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * Add event listener to this object.
     *
     * @type member
     * @param type {String} name of the event type
     * @param func {Function} event callback function
     * @param obj {Object ? window} reference to the 'this' variable inside the callback
     */
    addListener : function(type, func, obj)
    {
      if (!this.__disposed) {
        qx.event.Registration.addListener(this, type, func, obj, false);
      }
    },


    /**
     * Remove event listener from this object
     *
     * @type member
     * @param type {String} name of the event type
     * @param func {Function} event callback function
     * @param obj {Object ? window} reference to the 'this' variable inside the callback
     * @return {void}
     */
    removeListener : function(type, func, obj)
    {
      if (!this.__disposed) {
        qx.event.Registration.removeListener(this, type, func, obj, false);
      }
    },


    /**
     * Check if there are one or more listeners for an event type.
     *
     * @type member
     * @param type {String} name of the event type
     * @return {var} TODOC
     */
    hasListeners : function(type) {
      return qx.event.Registration.hasListeners(this, type);
    },


    /**
     * Dispatch an event on this object
     *
     * @type member
     * @param evt {qx.event.type.Event} event to dispatch
     * @return {Boolean} whether the event default was prevented or not. Returns true, when the event was NOT prevented.
     */
    dispatchEvent : function(evt)
    {
      if (!this.__disposed) {
        qx.event.Registration.dispatchEvent(this, evt);
      }
    },


    /**
     * Create an event object and dispatch it on this object.
     *
     * @type member
     * @param clazz {qx.event.type.Event} The even class
     * @param args {Array} Array or arguments, which will be passed to
     *       the event's init method.
     * @return {void}
     */
    fireCustomEvent : function(clazz, args)
    {
      if (!this.__disposed) {
        qx.event.Registration.fireCustomEvent(this, clazz, args);
      }
    },


    /**
     * Creates and dispatches an event on this object.
     *
     * @type member
     * @param type {String} name of the event type
     */
    fireEvent : function(type)
    {
      if (!this.__disposed) {
        qx.event.Registration.fireCustomEvent(this, qx.event.type.Event, [type, false]);
      }
    },


    /**
     * Creates and dispatches an data event on this object.
     *
     * @type member
     * @param type {String} name of the event type
     * @param data {var} user defined data attached to the event object
     */
    fireDataEvent : function(type, data)
    {
      if (!this.__disposed) {
        qx.event.Registration.fireCustomEvent(this, qx.event.type.Data, [type, data]);
      }
    },




    /*
    ---------------------------------------------------------------------------
      DEBUG
    ---------------------------------------------------------------------------
    */


    /**
     * Internal helper which returns the prefix of all debug
     * messages.
     *
     * @type member
     * @return {String}
     */
    __dbg : function() {
      return this.classname + "[" + this.toHashCode() + "]: ";
    },


    /**
     * Logs a debug message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *          object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    debug : function(msg, exc) {
      qx.core.Log.debug(this.__dbg(), msg, exc||"");
    },


    /**
     * Logs an info message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    info : function(msg, exc) {
      qx.core.Log.info(this.__dbg(), msg, exc||"");
    },


    /**
     * Logs a warning message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    warn : function(msg, exc) {
      qx.core.Log.warn(this.__dbg(), msg, exc||"");
    },


    /**
     * Logs an error message.
     *
     * @type member
     * @param msg {var} the message to log. If this is not a string, the
     *      object dump will be logged.
     * @param exc {var} the exception to log.
     * @return {void}
     */
    error : function(msg, exc) {
      qx.core.Log.error(this.__dbg(), msg, exc||"");
    },


    /**
     * Logs the current stack trace as a debug message.
     *
     * @type member
     * @return {void}
     */
    trace : function() {
      qx.core.Log.trace();
    },









    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /** TODOC */
    __disposed : false,


    /**
     * Returns true if the object is disposed.
     *
     * @type member
     * @return {Boolean} whether the object has been disposed
     */
    getDisposed : function() {
      return this.__disposed;
    },


    /**
     * Returns true if the object is disposed.
     *
     * @type member
     * @return {Boolean} whether the object has been disposed
     */
    isDisposed : function() {
      return this.__disposed;
    },


    /**
     * Dispose this object
     *
     * @type member
     * @return {void}
     */
    dispose : function()
    {
      // Check first
      if (this.__disposed) {
        return;
      }

      // Mark as disposed (directly, not at end, to omit recursions)
      this.__disposed = true;

      // Debug output
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
          qx.core.Log.debug("Disposing " + this.classname + "[" + this.toHashCode() + "]");
        }
      }

      // Deconstructor support for classes
      var clazz = this.constructor;
      var mixins;

      while (clazz.superclass)
      {
        // Processing this class...
        if (clazz.$$destructor) {
          clazz.$$destructor.call(this);
        }

        // Destructor support for mixins
        if (clazz.$$includes)
        {
          mixins = clazz.$$flatIncludes;

          for (var i=0, l=mixins.length; i<l; i++)
          {
            if (mixins[i].$$destructor) {
              mixins[i].$$destructor.call(this);
            }
          }
        }

        // Jump up to next super class
        clazz = clazz.superclass;
      }

      // Additional checks
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (!qx.core.Object.isPageUnload())
        {
          if (qx.core.Setting.get("qx.disposerDebugLevel") > 0)
          {
            var vValue;
            for (var vKey in this)
            {
              vValue = this[vKey];

              // Check for Objects but respect values attached to the prototype itself
              if (vValue !== null && typeof vValue === "object" && this.constructor.prototype[vKey] === undefined)
              {
                // Allow class, interface, mixin and theme aliases
                if (qx.Class.getByName(vValue.name) == vValue || qx.Interface.getByName(vValue.name) == vValue || qx.Mixin.getByName(vValue.name) == vValue || qx.Theme.getByName(vValue.name) == vValue) {
                  continue;
                }

                qx.core.Log.warn("Missing destruct definition for '" + vKey + "' in " + this.classname + "[" + this.toHashCode() + "]: " + vValue);
                delete this[vKey];
              }
            }
          }
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnects given fields from instance.
     *
     * @type member
     * @param varargs {arguments} fields to dispose
     */
    _disposeFields : function(varargs)
    {
      var name;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        var name = arguments[i]

        if (this[name] == null) {
          continue;
        }

        if (!this.hasOwnProperty(name))
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
              qx.core.Log.debug(this.classname + " has no own field " + name);
            }
          }

          continue;
        }

        this[name] = null;
      }
    },


    /**
     * Disconnects and disposes given objects from instance.
     * Only works with qx.core.Object based objects e.g. Widgets.
     *
     * @type member
     * @param varargs {arguments} fields to dispose
     */
    _disposeObjects : function(varargs)
    {
      var name;

      for (var i=0, l=arguments.length; i<l; i++)
      {
        var name = arguments[i]

        if (this[name] == null) {
          continue;
        }

        if (!this.hasOwnProperty(name))
        {
          if (qx.core.Variant.isSet("qx.debug", "on"))
          {
            if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
              qx.core.Log.debug(this.classname + " has no own field " + name);
            }
          }

          continue;
        }

        if (!this[name].dispose) {
          throw new Error(this.classname + " has no own object " + name);
        }

        this[name].dispose();
        this[name] = null;
      }
    },


    /**
     * Disconnects and disposes given objects (deeply) from instance.
     * Works with arrays, maps and qooxdoo objects.
     *
     * @type member
     * @param name {String} field name to dispose
     * @param deep {Number?0} how deep to following sub objects. Deep=0 means
     *   just the object and all its keys. Deep=1 also dispose deletes the
     *   objects object content.
     */
    _disposeObjectDeep : function(name, deep)
    {
      var name;

      if (this[name] == null) {
        return;
      }

      if (!this.hasOwnProperty(name))
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.disposerDebugLevel") > 1) {
            qx.core.Log.debug(this.classname + " has no own field " + name);
          }
        }

        return;
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Setting.get("qx.disposerDebugLevel") > 2) {
          qx.core.Log.debug("Dispose Deep: " + name);
        }
      }

      this.__disposeObjectsDeepRecurser(this[name], deep || 0);
      this[name] = null;
    },


    /**
     * Helper method for _disposeObjectDeep. Do the recursive work.
     *
     * @type member
     * @param obj {Object} object to dispose
     * @param deep {Number} how deep to following sub objects. Deep=0 means
     *   just the object and all its keys. Deep=1 also dispose deletes the
     *   objects object content.
     */
    __disposeObjectsDeepRecurser : function(obj, deep)
    {
      // qooxdoo
      if (obj instanceof qx.core.Object)
      {
        if (qx.core.Variant.isSet("qx.debug", "on"))
        {
          if (qx.core.Setting.get("qx.disposerDebugLevel") > 3) {
            qx.core.Log.debug("Sending dispose to " + obj.classname);
          }
        }

        obj.dispose();
      }

      // Array
      else if (obj instanceof Array)
      {
        for (var i=0, l=obj.length; i<l; i++)
        {
          var entry = obj[i];

          if (entry == null) {
            continue;
          }

          if (typeof entry == "object")
          {
            if (deep > 0)
            {
              if (qx.core.Variant.isSet("qx.debug", "on"))
              {
                if (qx.core.Setting.get("qx.disposerDebugLevel") > 3) {
                  qx.core.Log.debug("- Deep processing item '" + i + "'");
                }
              }

              this.__disposeObjectsDeepRecurser(entry, deep-1);
            }

            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.disposerDebugLevel") > 3) {
                qx.core.Log.debug("- Resetting key (object) '" + key + "'");
              }
            }

            obj[i] = null;
          }
          else if (typeof entry == "function")
          {
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.disposerDebugLevel") > 3) {
                qx.core.Log.debug("- Resetting key (function) '" + key + "'");
              }
            }

            obj[i] = null;
          }
        }
      }

      // Map
      else if (obj instanceof Object)
      {
        for (var key in obj)
        {
          if (obj[key] == null || !obj.hasOwnProperty(key)) {
            continue;
          }

          var entry = obj[key];

          if (typeof entry == "object")
          {
            if (deep > 0)
            {
              if (qx.core.Variant.isSet("qx.debug", "on"))
              {
                if (qx.core.Setting.get("qx.disposerDebugLevel") > 3) {
                  qx.core.Log.debug("- Deep processing key '" + key + "'");
                }
              }

              this.__disposeObjectsDeepRecurser(entry, deep-1);
            }

            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.disposerDebugLevel") > 3) {
                qx.core.Log.debug("- Resetting key (object) '" + key + "'");
              }
            }

            obj[key] = null;
          }
          else if (typeof entry == "function")
          {
            if (qx.core.Variant.isSet("qx.debug", "on"))
            {
              if (qx.core.Setting.get("qx.disposerDebugLevel") > 3) {
                qx.core.Log.debug("- Resetting key (function) '" + key + "'");
              }
            }

            obj[key] = null;
          }
        }
      }
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings : {
    "qx.disposerDebugLevel" : 0
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Cleanup properties
    var clazz = this.constructor;
    var properties;
    var store = qx.core.Property.$$store;
    var storeUser = store.user;
    var storeTheme = store.theme;
    var storeInherit = store.inherit;
    var storeUseinit = store.useinit;
    var storeInit = store.init;

    while(clazz)
    {
      properties = clazz.$$properties;
      if (properties)
      {
        for (var name in properties)
        {
          if (properties[name].dispose) {
            this[storeUser[name]] = this[storeTheme[name]] = this[storeInherit[name]] = this[storeUseinit[name]] = this[storeInit[name]] = undefined;
          }
        }
      }

      clazz = clazz.superclass;
    }

    // Delete Entry from Object DB
    if (this.__dbKey != null)
    {
      if (qx.core.Object.__disposeAll) {
        qx.core.Object.__db[this.__dbKey] = null;
      } else {
        delete qx.core.Object.__db[this.__dbKey];
      }
    }
  }
});
