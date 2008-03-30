/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(qx.event.dispatch.DomBubbling)

************************************************************************ */

/**
 * This handler is used to normalize all focus/activation requirements
 * and normalize all cross browser quirks in this area.
 *
 * Notes:
 *
 * * Webkit/Opera<9.5 does not support tabIndex for all elements:
 * * http://bugs.webkit.org/show_bug.cgi?id=7138
 */
qx.Class.define("qx.event.handler.Focus",
{
  extend : qx.core.Object,
  implement : qx.event.IEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  /**
   * Create a new instance
   *
   * @type constructor
   * @param manager {qx.event.Manager} Event manager for the window to use
   */
  construct : function(manager)
  {
    this.base(arguments);

    // Define shorthands
    this._manager = manager;
    this._window = manager.getWindow();
    this._document = this._window.document;
    this._root = this._document.documentElement;
    this._body = this._document.body;

    // Initialize observers
    this._initMouseObserver();
    this._initFocusObserver();
  },






  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The active DOM element */
    active :
    {
      check : "Element",
      apply : "_applyActive",
      nullable : true
    },


    /** The focussed DOM element */
    focus :
    {
      check : "Element",
      apply : "_applyFocus",
      nullable : true
    }
  },





  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /** {Integer} Priority of this handler */
    PRIORITY : qx.event.Registration.PRIORITY_NORMAL
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
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */

    // interface implementation
    canHandleEvent : function(target, type) {
      return this._eventTypes[type];
    },


    // interface implementation
    registerEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },


    // interface implementation
    unregisterEvent : function(target, type, capture) {
      // Nothing needs to be done here
    },






    /*
    ---------------------------------------------------------------------------
      FOCUS/BLUR USER INTERFACE
    ---------------------------------------------------------------------------
    */

    /**
     * Focusses the given DOM element
     *
     * @type member
     * @param element {Element} DOM element to focus
     * @return {void}
     */
    focus : function(element) 
    {
      element.focus();
      this.setFocus(element);
    },


    /**
     * Activates the given DOM element
     *
     * @type member
     * @param element {Element} DOM element to activate
     * @return {void}
     */
    activate : function(element) {
      this.setActive(element);
    },


    /**
     * Blurs the given DOM element
     *
     * @type member
     * @param element {Element} DOM element to focus
     * @return {void}
     */
    blur : function(element)
    {
      if (this.getActive() === element) {
        this.resetActive();
      }

      if (this.getFocus() === element) {
        element.blur();
      }
    },


    /**
     * Deactivates the given DOM element
     *
     * @type member
     * @param element {Element} DOM element to activate
     * @return {void}
     */
    deactivate : function(element)
    {
      if (this.getActive() === element) {
        this.resetActive();
      }
    },








    /*
    ---------------------------------------------------------------------------
      HELPER
    ---------------------------------------------------------------------------
    */

    /** {Map} Internal data structure with all supported event types */
    _eventTypes :
    {
      focus : 1,
      blur : 1,
      focusin : 1,
      focusout : 1,
      beforedeactivate : 1,
      beforeactivate : 1,
      activate : 1,
      deactivate : 1
    },


    /**
     * Shorthand to fire events from within this class.
     *
     * @type member
     * @param target {Element} DOM element which is the target
     * @param type {String} Name of the event to fire
     * @return {void}
     */
    _fireDirectEvent : function(target, type) {
      qx.event.Registration.fireEvent(target, type);
    },


    /**
     * Shorthand to fire events from within this class.
     *
     * @type member
     * @param target {Element} DOM element which is the target
     * @param type {String} Name of the event to fire
     * @return {void}
     */
    _fireBubblingEvent : function(target, type)
    {
      var Registration = qx.event.Registration;
      var evt = Registration.createEvent(type);
      evt.setBubbles(true);
      Registration.dispatchEvent(target, evt);
    },






    /*
    ---------------------------------------------------------------------------
      WINDOW FOCUS/BLUR SUPPORT
    ---------------------------------------------------------------------------
    */

    /** {Boolean} Whether the window is focussed currently */
    _windowFocussed : true,


    /**
     * Helper for native event listeners to react on window blur
     *
     * @type member
     * @return {void}
     */
    _doWindowBlur : function()
    {
      // Omit doubled blur events
      // which is a common behavior at least for gecko based clients
      if (this._windowFocussed)
      {
        this._windowFocussed = false;

        this.resetActive();
        this.resetFocus();

        // this.debug("Window blurred");
        this._fireDirectEvent(this._window, "blur");
      }
    },


    /**
     * Helper for native event listeners to react on window focus
     *
     * @type member
     * @return {void}
     */
    _doWindowFocus : function()
    {
      // Omit doubled focus events
      // which is a common behavior at least for gecko based clients
      if (!this._windowFocussed)
      {
        this._windowFocussed = true;

        // this.debug("Window focussed");
        this._fireDirectEvent(this._window, "focus");
      }
    },






    /*
    ---------------------------------------------------------------------------
      ELEMENT FOCUS/BLUR SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Helper for native event listeners to react on element focus
     *
     * @type member
     * @param element {Element} DOM element which should be focussed
     * @return {void}
     */
    _doElementFocus : function(element)
    {
      if (element === this._document) {
        element = this._root;
      }

      // If focus is already correct, don't configure both
      // This is the case for all mousedown events normally
      if (element && this.getFocus() !== element)
      {
        this.setActive(element);
        this.setFocus(element);
      }
    },


    /**
     * Helper for native event listeners to react on element blur
     *
     * @type member
     * @param element {Element} DOM element which should be blurred
     * @return {void}
     */
    _doElementBlur : function(element)
    {
      if (element)
      {
        if (this.getFocus() === element) {
          this.resetFocus();
        }

        if (this.getActive() === element) {
          this.resetActive();
        }
      }
    },





    /*
    ---------------------------------------------------------------------------
      OBSERVER INIT
    ---------------------------------------------------------------------------
    */

    /**
     * Initializes the native mouse event listeners.
     *
     * @type member
     * @return {void}
     */
    _initMouseObserver : function()
    {
      this.__onNativeMouseDownWrapper = qx.lang.Function.listener(this.__onNativeMouseDown, this);
      qx.bom.Event.addNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper);
    },


    /**
     * Initializes the native focus event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _initFocusObserver : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        // Bind methods
        this.__onNativeFocusWrapper = qx.lang.Function.listener(this.__onNativeFocus, this);
        this.__onNativeBlurWrapper = qx.lang.Function.listener(this.__onNativeBlur, this);

        // Capturing is needed for gecko to correctly
        // handle focus of input and textarea fields
        this._window.addEventListener("focus", this.__onNativeFocusWrapper, true);
        this._window.addEventListener("blur", this.__onNativeBlurWrapper, true);
      },

      "mshtml" : function()
      {
        // Bind methods
        this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
        this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);

        this.__onNativeActivateWrapper = qx.lang.Function.listener(this.__onNativeActivate, this);
        this.__onNativeDeactivateWrapper = qx.lang.Function.listener(this.__onNativeDeactivate, this);

        // MSHTML supports their own focusin and focusout events
        // To detect which elements get focus the target is useful
        // The window blur can detected using focusout and look
        // for the relatedTarget which is empty in this case.
        this._document.attachEvent("onfocusin", this.__onNativeFocusInWrapper);
        this._document.attachEvent("onfocusout", this.__onNativeFocusOutWrapper);    
        
        // Additional activate/deactivate support
        this._document.attachEvent("onactivate", this.__onNativeActivateWrapper);
        this._document.attachEvent("ondeactivate", this.__onNativeActivateWrapper);        
      },

      "webkit|opera" : function()
      {
        // Bind methods
        this.__onNativeFocusWrapper = qx.lang.Function.listener(this.__onNativeFocus, this);
        this.__onNativeBlurWrapper = qx.lang.Function.listener(this.__onNativeBlur, this);
        
        this.__onNativeFocusInWrapper = qx.lang.Function.listener(this.__onNativeFocusIn, this);
        this.__onNativeFocusOutWrapper = qx.lang.Function.listener(this.__onNativeFocusOut, this);
        
        this.__onNativeActivateWrapper = qx.lang.Function.listener(this.__onNativeActivate, this);
        this.__onNativeDeactivateWrapper = qx.lang.Function.listener(this.__onNativeDeactivate, this);        

        // Opera 9.2 ignores the event when capturing is enabled
        this._window.addEventListener("focus", this.__onNativeFocusWrapper, false);
        this._window.addEventListener("blur", this.__onNativeBlurWrapper, false);

        // Opera 9.x supports DOMFocusOut which is needed to detect the element focus
        this._document.addEventListener("DOMFocusIn", this.__onNativeFocusInWrapper, false);
        this._document.addEventListener("DOMFocusOut", this.__onNativeFocusOutWrapper, false);
        
        // Additional activate/deactivate support
        this._document.addEventListener("DOMActivate", this.__onNativeActivateWrapper, false);
        this._document.addEventListener("DOMDeactivate", this.__onNativeActivateWrapper, false);        
      }
    }),






    /*
    ---------------------------------------------------------------------------
      OBSERVER STOP
    ---------------------------------------------------------------------------
    */

    /**
     * Disconnect the native mouse event listeners.
     *
     * @type member
     * @return {void}
     */
    _stopMouseObserver : function() {
      qx.bom.Event.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDownWrapper);
    },


    /**
     * Disconnect the native focus event listeners.
     *
     * @type member
     * @signature function()
     * @return {void}
     */
    _stopFocusObserver : qx.core.Variant.select("qx.client",
    {
      "gecko" : function()
      {
        this._window.removeEventListener("focus", this.__onNativeFocusWrapper, true);
        this._window.removeEventListener("blur", this.__onNativeBlurWrapper, true);
      },

      "mshtml" : function()
      {
        this._document.detachEvent("onfocusin", this.__onNativeFocusInWrapper);
        this._document.detachEvent("onfocusout", this.__onNativeFocusOutWrapper);   

        this._document.detachEvent("onactivate", this.__onNativeActivateWrapper);
        this._document.detachEvent("ondeactivate", this.__onNativeActivateWrapper);              
      },

      "webkit|opera" : function()
      {
        this._window.removeEventListener("focus", this.__onNativeFocusWrapper, false);
        this._window.removeEventListener("blur", this.__onNativeBlurWrapper, false);

        this._document.removeEventListener("DOMFocusIn", this.__onNativeFocusInWrapper, false);
        this._document.removeEventListener("DOMFocusOut", this.__onNativeFocusOutWrapper, false);
        
        this._document.removeEventListener("DOMActivate", this.__onNativeActivateWrapper, false);
        this._document.removeEventListener("DOMDeactivate", this.__onNativeActivateWrapper, false);         
      }
    }),







    /*
    ---------------------------------------------------------------------------
      NATIVE FOCUS EVENT SUPPORT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Native event listener for <code>DOMActivate</code> or <code>activate</code>
     * depending on the client's engine.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */    
    __onNativeActivate : function(e)
    {
      if (!e) {
        e = window.event;
      }
      
      var target = e.target || e.srcElement;
      
      // this.debug("DOM-Activate: " + target);
      
      this.setActive(target);
    },
    
    
    /**
     * Native event listener for <code>DOMDeactivate</code> or <code>deactivate</code>
     * depending on the client's engine.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */    
    __onNativeDeactivate : function(e)
    {
      if (!e) {
        e = window.event;
      }
      
      var target = e.target || e.srcElement;
      
      // this.debug("DOM-Deactivate: " + target);
      
      if (this.getActive() === target) {
        this.resetActive();
      }
    },    
    

    /**
     * Native event listener for <code>DOMFocusOut</code> or <code>focusout</code>
     * depending on the client's engine.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeFocusOut : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        if (!e) {
          e = window.event;
        }

        var related = e.relatedTarget || e.toElement;

        // var target = e.target || e.srcElement;
        // this.debug("DOM-FocusOut: " + target + " :: " + related);

        if (!related) {
          this._doWindowBlur();
        }
      },

      "webkit|opera" : function(e) {
        this._doElementBlur();
      },

      "default" : null
    }),


    /**
     * Native event listener for <code>DOMFocusIn</code> or <code>focusin</code>
     * depending on the client's engine.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeFocusIn : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        if (!e) {
          e = window.event;
        }

        var target = e.target || e.srcElement;
        var related = e.relatedTarget || e.toElement;

        // this.debug("DOM-FocusIn: " + target + " :: " + related);

        if (!related) {
          this._doWindowFocus();
        }

        this._doElementFocus(target);
      },

      "opera|webkit" : function(e)
      {
        if (!e) {
          e = window.event;
        }

        // this.debug("DOM-FocusIn: " + e.target);

        this._doElementFocus(e.target);
      },

      "default" : null
    }),


    /**
     * Native event listener for <code>blur</code>.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeBlur : qx.core.Variant.select("qx.client",
    {
      "gecko|opera|webkit" : function(e)
      {
        this._doElementBlur(e.target);

        switch(e.target)
        {
          case null:
          case undefined:
            return;

          case this._window:
          case this._document:
          case this._body:
          case this._root:
            this._doWindowBlur();
            break;
        }
      },

      "default" : null
    }),


    /**
     * Native event listener for <code>focus</code>.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeFocus : qx.core.Variant.select("qx.client",
    {
      "gecko|opera|webkit" : function(e)
      {
        switch(e.target)
        {
          case null:
          case undefined:
            return;

          case this._window:
          case this._document:
          case this._body:
          case this._root:
            this._doWindowFocus();
            break;

          default:
            this._doElementFocus(e.target);
        }
      },

      "default" : null
    }),






    /*
    ---------------------------------------------------------------------------
      NATIVE MOUSE EVENT SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Native event listener for <code>mousedown</code>.
     *
     * @type member
     * @param e {Event} Native event
     * @return {void}
     */
    __onNativeMouseDown : function(e)
    {
      if (!e) {
        e = window.event;
      }

      var active = e.target || e.srcElement;
      var focus = this.__findFocusNode(active);

      // this.debug("DOM-MouseDown: active=" + active + "; focus=" + focus);

      this.setFocus(focus);
      
      // Check first, maybe a focus listener has already moved the focus to somewhere else
      if (this.getFocus() === focus) {
        this.setActive(active);
      }
    },


    /**
     * Returns the next focusable parent node of a activated DOM element.
     *
     * @type member
     * @signature function(node)
     * @param node {Event} Native event
     * @return {void}
     */
    __findFocusNode : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node)
      {
        while (node)
        {
          // The last one is needed for MSHTML, where every node
          // in document normally returns tabIndex=0 even if not set up
          // this way. The unmodified value return 32768 for unconfigured nodes
          if (node.tabIndex !== undefined && node.tabIndex >= 0 && node.getAttribute("tabIndex", 2) !== 32768) {
            return node;
          }

          node = node.parentNode;
        }

        // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.
        return this._body;
      },

      "opera|webkit" : function(node)
      {
        var index;
        while (node && node.getAttribute)
        {
          // Manually added tabIndexes to elements which
          // do not support this are stored a way to allow
          // access to them only through getAttribute().
          //
          // Naturally behavior like default tabIndexes (like 0)
          // for input fields are only accessible using
          // the tabIndex property and are not available
          // using the getAttribute() call.
          index = node.getAttribute("tabIndex");

          if (index == null) {
            index = node.tabIndex;
          }

          if (index >= 0) {
            return node;
          }

          node = node.parentNode;
        }

        // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.
        return this._body;
      },

      "default" : function(node)
      {
        while (node)
        {
          if (node.tabIndex !== undefined && node.tabIndex >= 0) {
            return node;
          }

          node = node.parentNode;
        }

        // This should be identical to the one which is selected when
        // clicking into an empty page area. In mshtml this must be
        // the body of the document.
        return this._body;
      }
    }),






    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // apply routine
    _applyActive : function(value, old)
    {
      this.debug("Active: " + value);

      if (old) {
        this._fireBubblingEvent(old, "beforedeactivate");
      }

      if (value) {
        this._fireBubblingEvent(value, "beforeactivate");
      }

      if (old) {
        this._fireBubblingEvent(old, "deactivate");
      }

      if (value) {
        this._fireBubblingEvent(value, "activate");
      }
    },


    // apply routine
    _applyFocus : function(value, old)
    {
      this.debug("Focus: " + value);

      if (old) {
        this._fireBubblingEvent(old, "focusout");
      }

      if (value) {
        this._fireBubblingEvent(value, "focusin");
      }

      if (old) {
        this._fireDirectEvent(old, "blur");
      }

      if (value) {
        this._fireDirectEvent(value, "focus");
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
    this._stopMouseObserver();
    this._stopFocusObserver();

    this._disposeFields("_manager", "_window", "_document", "_root", "_body");
  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics) {
    qx.event.Registration.addHandler(statics);
  }
});
