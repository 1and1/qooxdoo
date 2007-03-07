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
#optional(qx.Theme)
#optional(qx.Locale)
#require(qx.html.EventRegistration)

************************************************************************ */

/**
 * Initialize qooxdoo.
 *
 * Attaches qooxdoo callbacks to the load events (onload, onunload, onbeforeunload)
 * and initializes the qooxdoo application. The initializations starts automatically.
 *
 * Make sure you set the application to your application before the load event is fired:
 * <pre>qx.core.Init.getInstance().setApplication(YourApplication)</pre>
 */
qx.Class.define("qx.core.Init",
{
  type : "singleton",
  extend : qx.core.Target,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments, false);

    // Attach DOM events
    qx.html.EventRegistration.addEventListener(window, "load", qx.lang.Function.bind(this._onload, this));
    qx.html.EventRegistration.addEventListener(window, "beforeunload", qx.lang.Function.bind(this._onbeforeunload, this));
    qx.html.EventRegistration.addEventListener(window, "unload", qx.lang.Function.bind(this._onunload, this));
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Instance of the component initializer.
     */
    component :
    {
      type     : "object",
      instance : "qx.component.init.AbstractInit",
      _legacy  : true
    },


    /**
     * Reference to the constructor of the main application.
     *
     * Set this before the onload event is fired.
     */
    application :
    {
      type     : "object",
      instance : "qx.component.AbstractApplication",
      _legacy  : true
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
      COMPONENT BINDING
    ---------------------------------------------------------------------------
    */

    /**
     * define the initialisation function
     * Don't use this method directly. Use setApplication instead!
     *
     * @type member
     * @deprecated
     * @param vFunc {Function} callback function
     * @return {void}
     */
    defineInitialize : function(vFunc)
    {
      if (!this.getApplication()) {
        this.setApplication(new qx.component.DummyApplication);
      }

      this.getApplication().initialize = vFunc;
    },


    /**
     * define the main function
     * Don't use this method directly. Use setApplication instead!
     *
     * @type member
     * @deprecated
     * @param vFunc {Function} callback function
     * @return {void}
     */
    defineMain : function(vFunc)
    {
      if (!this.getApplication()) {
        this.setApplication(new qx.component.DummyApplication);
      }

      this.getApplication().main = vFunc;
    },


    /**
     * define the finalize function
     * Don't use this method directly. Use setApplication instead!
     *
     * @type member
     * @deprecated
     * @param vFunc {Function} callback function
     * @return {void}
     */
    defineFinalize : function(vFunc)
    {
      if (!this.getApplication()) {
        this.setApplication(new qx.component.DummyApplication);
      }

      this.getApplication().finalize = vFunc;
    },


    /**
     * define the close function
     * Don't use this method directly. Use setApplication instead!
     *
     * @type member
     * @deprecated
     * @param vFunc {Function} callback function
     * @return {void}
     */
    defineClose : function(vFunc)
    {
      if (!this.getApplication()) {
        this.setApplication(new qx.component.DummyApplication);
      }

      this.getApplication().close = vFunc;
    },


    /**
     * define the terminate function
     * Don't use this method directly. Use setApplication instead!
     *
     * @type member
     * @deprecated
     * @param vFunc {Function} callback function
     * @return {void}
     */
    defineTerminate : function(vFunc)
    {
      if (!this.getApplication()) {
        this.setApplication(new qx.component.DummyApplication);
      }

      this.getApplication().terminate = vFunc;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * load event handler
     *
     * @type member
     * @param e {Event} event
     * @return {var} TODOC
     */
    _onload : function(e)
    {
      this.debug("qooxdoo " + qx.core.Version.toString());

      // Print out class information
      if (qx.core.Variant.isSet("qx.compatibility", "on")) {
        this.debug("loaded " + qx.lang.Object.getLength(qx.OO.classes) + " old classes");
      }

      this.debug("loaded " + qx.Class.getNumber() + " classes");
      this.debug("loaded " + qx.Interface.getNumber() + " interfaces");
      this.debug("loaded " + qx.Mixin.getNumber() + " mixins");

      if (qx.Locale) {
        this.debug("loaded " + qx.Locale.getNumber() + " locales");
      }

      if (qx.Theme) {
        this.debug("loaded " + qx.Theme.getNumber() + " themes");
      }

      // Print browser information
      var cl = qx.core.Client.getInstance();
      this.debug("client: " + cl.getEngine() + "-" + cl.getMajor() + "." + cl.getMinor() + "/" + cl.getPlatform() + "/" + cl.getLocale());

      // Box model warning
      if (qx.core.Variant.isSet("qx.debug", "on"))
      {
        if (qx.core.Variant.isSet("qx.client", "mshtml"))
        {
          if (!cl.isInQuirksMode()) {
            this.warn("Wrong box sizing: Please modify the document's DOCTYPE!");
          }
        }
      }

      // Init application from settings
      if (!this.getApplication())
      {
        var clazz = qx.Class.getByName(qx.core.Setting.get("qx.initApplication"));
        this.setApplication(new clazz(this));
      }

      // Init component from settings
      if (!this.getComponent())
      {
        var clazz = qx.Class.getByName(qx.core.Setting.get("qx.initComponent"));
        this.setComponent(new clazz(this));
      }

      // More info
      this.debug("application: " + this.getApplication().classname);
      this.debug("init: " + this.getComponent().classname);

      // Send onload
      return this.getComponent()._onload(e);
    },


    /**
     * beforeunload event handler
     *
     * @type member
     * @param e {Event} event
     * @return {var} TODOC
     */
    _onbeforeunload : function(e)
    {
      // Send onbeforeunload event (can be cancelled)
      return this.getComponent()._onbeforeunload(e);
    },


    /**
     * unload event handler
     *
     * @type member
     * @param e {Event} event
     * @return {void}
     */
    _onunload : function(e)
    {
      // Send onunload event (last event)
      this.getComponent()._onunload(e);

      // Dispose all qooxdoo objects
      qx.core.Object.dispose();
    }
  },




  /*
  *****************************************************************************
     SETTINGS
  *****************************************************************************
  */

  settings :
  {
    "qx.initComponent" : "qx.component.init.Gui",
    "qx.initApplication" : "qx.component.DummyApplication"
  },





  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */

  defer : function(statics, proto, properties)
  {
    // Force direct creation
    statics.getInstance();
  }
});
