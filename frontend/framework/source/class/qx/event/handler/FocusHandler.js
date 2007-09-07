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
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#module(event2)

************************************************************************ */

// Notes:
// Webkit/Opera<9.5 does not support tabIndex for all elements:
// http://bugs.webkit.org/show_bug.cgi?id=7138

/**
 * This handler is used to normalize all focus/activation requirements
 * and normalize all cross browser quirks in this area.
 */
qx.Class.define("qx.event.handler.FocusHandler",
{
  extend : qx.event.handler.AbstractEventHandler,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */
  
  construct : function(manager)
  {
    this.base(arguments, manager);

    // Define shorthands
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
     MEMBERS
  *****************************************************************************
  */
  
  members :
  {
    /*
    ---------------------------------------------------------------------------
      FOCUS/BLUR USER INTERFACE
    ---------------------------------------------------------------------------
    */
    
    /**
     * Focus the given DOM element
     *
     * @type member
     * @param element {Element} DOM element to focus
     * @return {void}
     */
    focus : function(element)
    {
      this.setActive(element);
      this.setFocus(element);
    },


    /**
     * Activate the given DOM element
     *
     * @type member
     * @param element {Element} DOM element to activate
     * @return {void}
     */
    activate : function(element) {
      this.setActive(element);
    },
    
    
    
    
    
        
        
    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER INTERFACE
    ---------------------------------------------------------------------------
    */
    
    /** {Map} Internal data structure with all supported event types */
    __focusTypes :
    {
      "focus" : 1,
      "blur" : 1,
      "focusin" : 1,
      "focusout" : 1,
      "beforedeactivate" : 1,
      "beforeactivate" : 1,
      "activate" : 1,
      "deactivate" : 1
    },

    
    // overridden
    canHandleEvent : function(target, type) {
      return this.__focusTypes[type];
    },
    
    
    /**
     * Shorthand to fire events from within this class.
     *
     * @type member
     * @param target {Element} DOM element which is the target
     * @param type {String} Name of the event to fire
     * @return {void}
     */
    _fireEvent : function(target, type) {
      this._manager.createAndDispatchEvent(target, qx.event.type.Event, [type]);
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
        this._fireEvent(this._window, "blur");
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
        this._fireEvent(this._window, "focus");
      }
    },






    /*
    ---------------------------------------------------------------------------
      ELEMENT FOCUS SUPPORT
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
      this.__onNativeMouseDown = qx.lang.Function.bind(this._onNativeMouseDown, this);
      qx.event.Manager.addNativeListener(this._document, "mousedown", this.__onNativeMouseDown);
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
        this.__onNativeFocus = qx.lang.Function.bind(this._onNativeFocus, this);
        this.__onNativeBlur = qx.lang.Function.bind(this._onNativeBlur, this);
  
        // Capturing is needed for gecko to correctly
        // handle focus of input and textarea fields
        this._window.addEventListener("focus", this.__onNativeFocus, true);
        this._window.addEventListener("blur", this.__onNativeBlur, true);        
      },
      
      "mshtml" : function()
      {
        // Bind methods
        this.__onNativeFocusIn = qx.lang.Function.bind(this._onNativeFocusIn, this);
        this.__onNativeFocusOut = qx.lang.Function.bind(this._onNativeFocusOut, this);
  
        // MSHTML supports their own focusin and focusout events
        // To detect which elements get focus the target is useful
        // The window blur can detected using focusout and look
        // for the relatedTarget which is empty in this case.
        qx.event.Manager.addNativeListener(this._document, "focusin", this.__onNativeFocusIn);
        qx.event.Manager.addNativeListener(this._document, "focusout", this.__onNativeFocusOut);        
      },
      
      "webkit|opera" : function()
      {
        // Bind methods
        this.__onNativeFocus = qx.lang.Function.bind(this._onNativeFocus, this);
        this.__onNativeBlur = qx.lang.Function.bind(this._onNativeBlur, this);
        this.__onNativeFocusIn = qx.lang.Function.bind(this._onNativeFocusIn, this);
  
        // Opera 9.2 ignores the event when capturing is enabled
        this._window.addEventListener("focus", this.__onNativeFocus, false);
        this._window.addEventListener("blur", this.__onNativeBlur, false);
  
        // Opera 9.x supports DOMFocusOut which is needed to detect the element focus
        qx.event.Manager.addNativeListener(this._document, "DOMFocusIn", this.__onNativeFocusIn);        
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
    _stopMouseObserver : function()
    {
      qx.event.Manager.removeNativeListener(this._document, "mousedown", this.__onNativeMouseDown);
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
        this._window.removeEventListener("focus", this.__onNativeFocus, true);
        this._window.removeEventListener("blur", this.__onNativeBlur, true);
      },

      "mshtml" : function()
      {
        qx.event.Manager.removeNativeListener(this._document, "focusin", this.__onNativeFocusIn);
        qx.event.Manager.removeNativeListener(this._document, "focusout", this.__onNativeFocusOut);
      },

      "webkit|opera" : function()
      {
        this._window.removeEventListener("focus", this.__onNativeFocus, false);
        this._window.removeEventListener("blur", this.__onNativeBlur, false);
        qx.event.Manager.removeNativeListener(this._document, "DOMFocusIn", this.__onNativeFocusIn);
      }
    }),







    /*
    ---------------------------------------------------------------------------
      NATIVE FOCUS EVENT SUPPORT
    ---------------------------------------------------------------------------
    */
    
    /**
     * Native event listener for <code>DOMFocusOut</code> or <code>focusout</code>
     * depending on the client's engine.
     *
     * @type member
     * @signature function(e)
     * @param e {Event} Native event
     * @return {void}
     */
    _onNativeFocusOut : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        if (!e) {
          e = window.event;
        }

        var related = e.relatedTarget || e.toElement;

        // this.debug("FocusOut: " + target + " :: " + related);

        if (!related) {
          this._doWindowBlur();
        }
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
    _onNativeFocusIn : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(e)
      {
        if (!e) {
          e = window.event;
        }

        var target = e.target || e.srcElement;
        var related = e.relatedTarget || e.toElement;

        // this.debug("FocusIn: " + target + " :: " + related);

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

        // this.debug("FocusIn: " + e.target);

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
    _onNativeBlur : qx.core.Variant.select("qx.client",
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
    _onNativeFocus : qx.core.Variant.select("qx.client",
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
    _onNativeMouseDown : function(e)
    {
      if (!e) {
        e = window.event;
      }

      var target = e.target || e.srcElement;

      // this.debug("MouseDown: " + target.tagName);

      this.setActive(target);
      this.setFocus(this.__findFocusNode(target));
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
      if (old) {
        this._fireEvent(old, "beforedeactivate");
      }

      if (value) {
        this._fireEvent(value, "beforeactivate");
      }

      if (old) {
        this._fireEvent(old, "deactivate");
      }

      if (value) {
        this._fireEvent(value, "activate");
      }
    },


    // apply routine
    _applyFocus : function(value, old)
    {
      if (old) {
        this._fireEvent(old, "focusout");
      }

      if (value) {
        this._fireEvent(value, "focusin");
      }

      if (old) {
        this._fireEvent(old, "blur");
      }

      if (value) {
        this._fireEvent(value, "focus");
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
    
    this._disposeFields("_window", "_document", "_root", "_body");
  },
  
  
    


  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics)
  {
    var manager = qx.event.Manager;
    manager.registerEventHandler(statics, manager.PRIORITY_FIRST);
  }
});
