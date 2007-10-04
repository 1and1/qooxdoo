/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)

************************************************************************ */

/* ************************************************************************

#module(event)

************************************************************************ */

/**
 * Wrapper for browser DOM event handling for each browser window/frame.
 */
qx.Class.define("qx.event.Manager",
{
  extend : qx.core.Object,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * Creates a new instance of the event handler.
   *
   * @param win {Window} The DOM window this manager handles the events for
   */
  construct : function(win)
  {
    this.base(arguments);

    // Assign window object
    this.__window = win;

    // Register to the page unload event
    this.__disposeWrapper = qx.lang.Function.bind(this.dispose, this);
    qx.event.Registration.addNativeListener(this.__window, "unload", this.__disposeWrapper);

    // Registry for event listeners
    this.__listeners = {};

    // The handler and dispatcher instances
    this.__handlers = {};
    this.__dispatchers = {};
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Get the window instance the event manager is reponsible for
     *
     * @type member
     * @return {Window} DOM window instance
     */
    getWindow : function() {
      return this.__window;
    },


    /**
     * Returns an instance of the given handler class for this manager(window).
     *
     * @type member
     * @param clazz {Class} Any class which implements {@link qx.event.IEventHandler}
     * @return {Object} The instance used by this manager
     */
    getHandler : function(clazz)
    {
      var handler = this.__handlers[clazz.classname];

      if (handler) {
        return handler;
      }

      return this.__handlers[clazz.classname] = new clazz(this);
    },


    /**
     * Returns an instance of the given dispatcher class for this manager(window).
     *
     * @type member
     * @param clazz {Class} Any class which implements {@link qx.event.IEventHandler}
     * @return {Object} The instance used by this manager
     */
    getDispatcher : function(clazz)
    {
      var dispatcher = this.__dispatchers[clazz.classname];

      if (dispatcher) {
        return dispatcher;
      }

      return this.__dispatchers[clazz.classname] = new clazz(this);
    },


    /**
     * Generates a unique ID for a combination of target, type and capturing
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} Event name
     * @param capture {Boolean ? false} Event for capture phase?
     * @return {String} the unique ID
     */
    __generateUniqueId : function(target, type, capture) {
      return qx.core.Object.toHashCode(target) + "|" + type + (capture ? "|capture" : "|bubble");
    },








    /*
    ---------------------------------------------------------------------------
      EVENT LISTENER MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Get all event listeners for the given target, event type and phase.
     *
     * @type member
     * @param target {Object} any valid event target
     * @param type {String} DOM event type
     * @param capture {Boolean ? false} Whether the listener is for the
     *         capturing phase of the bubbling phase.
     * @return {Function[] | null} Array of registered event handlers for this event
     *       and type. Will return null if <code>setup</code> and no entry
     *       is found.
     */
    getListeners : function(target, type, capture)
    {
      var uniqueId = this.__generateUniqueId(target, type, capture);
      var res = this.__listeners[uniqueId];
      if (res && res.length > 0) {
        return res.concat();
      }

      return null;
    },


    /**
     * Check whether there are one or more listeners for an event type
     * registered at the target.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} The event type
     * @param capture {Boolean ? false} Whether to check for listeners of
     *         the bubbling or of the capturing phase.
     * @return {Boolean} Whether the target has event listeners of the given type.
     */
    hasListeners : function(target, type, capture)
    {
      var uniqueId = this.__generateUniqueId(target, type, capture);
      var listeners = this.__listeners[uniqueId];
      return listeners != null && listeners.length > 0;
    },


    /**
     * Add an event listener to any valid target. The event listener is passed an
     * instance of {@link Event} containing all relevant information
     * about the event as parameter.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event e.g. "click", "keydown", ...
     * @param listener {Function} Event listener function
     * @param self {Object ? window} Reference to the 'this' variable inside
     *         the event listener.
     * @param capture {Boolean ? false} Whether to attach the event to the
     *         capturing phase of the bubbling phase of the event. The default is
     *         to attach the event handler to the bubbling phase.
     * @return {void}
     * @throws an error if the parameters are wrong
     */
    addListener : function(target, type, listener, self, capture)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof target !== "object") {
          throw new Error("Could not add listeners to non-objects!");
        }

        if (typeof type !== "string") {
          throw new Error("Invalid event type '" + type + "'");
        }

        if (typeof listener !== "function") {
          throw new Error("Invalid listener for event handling: " + listener);
        }

        if (capture !== undefined && typeof capture !== "boolean") {
          throw new Error("Capture flags needs to be boolean!");
        }
      }

      // Preparations
      var uniqueId = this.__generateUniqueId(target, type, capture);
      var listeners = this.__listeners[uniqueId];

      // Create data hierarchy
      if (!listeners) {
        listeners = this.__listeners[uniqueId] = [];
      }

      // This is the first event listener for this type and target
      // Inform the event handler about the new event
      // they perform the event registration at DOM level if needed
      if (listeners.length === 0) {
        this.__registerAtHandler(target, type);
      }

      // Append listener to list
      listeners.push(
      {
        handler : listener,
        context : self
      });
    },


    /**
     * This method is called each time an event listener for one of the
     * supported events is added using {qx.event.Manager#addListener}.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} event type
     * @return {void}
     * @throws an error if there is no handler for the event
     */
    __registerAtHandler : function(target, type)
    {
      var classes = qx.event.Registration.getHandlers();
      var instance;

      for (var i=0, l=classes.length; i<l; i++)
      {
        instance = this.getHandler(classes[i]);

        if (instance.canHandleEvent(target, type))
        {
          instance.registerEvent(target, type);
          return;
        }
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // this.trace();
        // throw new Error("There is no event handler for the event '" + type + "' on target '" + target + "'!");
        this.warn("There is no event handler for the event '" + type + "' on target '" + target + "'!");
      }
    },


    /**
     * Remove an event listener from a DOM node.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} Name of the event
     * @param listener {Function} The pointer to the event listener
     * @param self {Object ? window} Reference to the 'this' variable inside
     *         the event listener.
     * @param capture {Boolean ? false} Whether to remove the event listener of
     *         the bubbling or of the capturing phase.
     * @return {void}
     * @throws an error if the parameters are wrong
     */
    removeListener : function(target, type, listener, self, capture)
    {
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (typeof target !== "object") {
          throw new Error("Could not remove listeners from non-objects!");
        }

        if (typeof type !== "string") {
          throw new Error("Invalid event type '" + type + "'");
        }

        if (typeof listener !== "function") {
          throw new Error("Invalid listener for event handling: " + listener);
        }

        if (capture !== undefined && typeof capture !== "boolean") {
          throw new Error("Capture flags needs to be boolean!");
        }
      }

      // Preparations
      var uniqueId = this.__generateUniqueId(target, type, capture);
      var listeners = this.__listeners[uniqueId];

      // Directly return if there are no listeners
      if (!listeners || listeners.length === 0) {
        return;
      }

      // Remove listener from list
      var entry;
      var found = false;

      for (var i=0, l=listeners.length; i<l; i++)
      {
        entry = listeners[i];

        if (entry.handler === listener && entry.context === self)
        {
          qx.lang.Array.removeAt(listeners, i);
          found = true;
          break;
        }
      }

      if (!found)
      {
        // this.warn("Cannot remove event listener: " + listener + " :: " + self);
        return;
      }

      // This was the last event listener for this type and target
      // Inform the event handler about the event removal so that
      // they perform the event deregistration at DOM level if needed
      if (listeners.length === 0) {
        this.__unregisterAtHandler(target, type);
      }
    },


    /**
     * This method is called each time the an event listener for one of the
     * supported events is removed by using {qx.event.Manager#removeListener}
     * and no other event listener is listening on this type.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param type {String} event type
     * @return {void}
     * @throws an error if there is no handler for the event
     */
    __unregisterAtHandler : function(target, type)
    {
      var classes = qx.event.Registration.getHandlers();
      var instance;

      for (var i=0, l=classes.length; i<l; i++)
      {
        instance = this.getHandler(classes[i]);

        if (instance.canHandleEvent(target, type))
        {
          instance.unregisterEvent(target, type);
          return;
        }
      }

      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        // this.trace();
        // throw new Error("There is no event handler for the event '" + type + "' on target '" + target + "'!");
        this.warn("There is no event handler for the event '" + type + "' on target '" + target + "'!");
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT DISPATCH
    ---------------------------------------------------------------------------
    */

    /**
     * Dispatches an event object using the qooxdoo event handler system. The
     * event will only be visible in event listeners attached using
     * {@link #addListener}. After dispatching the event object will be pooled
     * for later reuse or disposed.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param event {qx.event.type.Event} The event object to dispatch. The event
     *       object must be obtained using {@link qx.event.Registration#createEvent}
     *       and initialized using {@link qx.event.type.Event#init}.
     * @return {void}
     * @throws an error if there is no dispatcher for the event
     */
    dispatchEvent : function(target, event)
    {
      if (this.getDisposed()) {
        return;
      }

      // Preparations
      var type = event.getType();

      if (!event.getTarget()) {
        event.setTarget(target);
      }

      // Interation data
      var classes = qx.event.Registration.getDispatchers();
      var instance;

      // Loop through the dispatchers
      var dispatched = false;

      for (var i=0, l=classes.length; i<l; i++)
      {
        instance = this.getDispatcher(classes[i]);

        // Ask if the dispatcher can handle this event
        if (instance.canDispatchEvent(target, event, type))
        {
          instance.dispatchEvent(target, event, type);
          dispatched = true;
          break;
        }
      }

      if (!dispatched) {
        throw new Error("No dispatcher can handle event of type " + type + " on " + target);
      }

      // The event handler may have disposed the app.
      if (this.getDisposed()) {
        return;
      }

      // Release the event instance to the event pool
      qx.event.Pool.getInstance().poolEvent(event);
    },


    /**
     * Create an event object and dispatch it on the given target.
     *
     * @type member
     * @param target {Object} Any valid event target
     * @param clazz {qx.event.type.Event} The even class
     * @param args {Array} Array or arguments, which will be passed to
     *       the event's init method.
     * @return {void}
     */
    fireCustomEvent : function(target, clazz, args)
    {
      var event = qx.event.Registration.createEvent(clazz, args);
      this.dispatchEvent(target, event);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    // Remove own unload listener
    qx.event.Registration.removeNativeListener(this.__window, "unload", this.__disposeWrapper);

    // Remove from manager list
    qx.event.Registration.removeManager(this);

    // Dispose data fields
    this._disposeFields("__listeners", "__window", "__handlers", "__dispatchers");
  }
});
