/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Martin Wittemann (martinwittemann)

************************************************************************ */

/**
 * @appearance toolbar
 */
qx.Class.define("qx.ui.toolbar.ToolBar",
{
  extend : qx.ui.core.Widget,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // add needed layout
    this._setLayout(new qx.ui.layout.HBox());

    // this.addEventListener("keypress", this._onkeypress);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Appearance of the widget */
    appearance :
    {
      refine : true,
      init : "toolbar"
    },

/*
    openMenu :
    {
      check : "qx.ui.menu.Menu",
      event : "changeOpenMenu",
      nullable : true
    },
*/


    /** Whether icons, labels, both or none should be shown. */
    show :
    {
      init : "both",
      check : [ "both", "label", "icon", "none"],
      nullable : true,
      inheritable : true,
      event : "changeShow"
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
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * Add a item at the end of the toolbar
     *
     * @type member
     * @param item {qx.ui.core.Widget} widget to add
     */
    add: function(item) {
      this._add(item);
    },


    /**
     * Add a spacer at the current position to the toolbar. The spacer has a flex
     * value of one and will stretch to the available space.
     *
     * @return {qx.ui.core.Spacer} The newly added spacer object. A reference
     *   to the spacer is needed to remove ths spacer from the layout.
     */
    addSpacer: function()
    {
      var spacer = new qx.ui.core.Spacer;
      this._add(spacer, {flex:1});
      return spacer;
    },



    /*
    ---------------------------------------------------------------------------
      EVENTS
    ---------------------------------------------------------------------------
    */

    /**
     * Wraps key events to target functions
     *
     * @type member
     * @param e {Event} TODOC
     * @return {var} TODOC
     */
    _onkeypress : function(e)
    {
      switch(e.getKeyIdentifier())
      {
        case "Left":
          return this._onkeypress_left();

        case "Right":
          return this._onkeypress_right();
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onkeypress_left : function()
    {
      var vMenu = this.getOpenMenu();

      if (!vMenu) {
        return;
      }

      var vOpener = vMenu.getOpener();

      if (!vOpener) {
        return;
      }

      var vChildren = this.getAllButtons();
      var vChildrenLength = vChildren.length;
      var vIndex = vChildren.indexOf(vOpener);
      var vCurrent;
      var vPrevButton = null;

      for (var i=vIndex-1; i>=0; i--)
      {
        vCurrent = vChildren[i];

        if (vCurrent instanceof qx.ui.toolbar.MenuButton && vCurrent.getEnabled())
        {
          vPrevButton = vCurrent;
          break;
        }
      }

      // If none found, try again from the begin (looping)
      if (!vPrevButton)
      {
        for (var i=vChildrenLength-1; i>vIndex; i--)
        {
          vCurrent = vChildren[i];

          if (vCurrent instanceof qx.ui.toolbar.MenuButton && vCurrent.getEnabled())
          {
            vPrevButton = vCurrent;
            break;
          }
        }
      }

      if (vPrevButton)
      {
        // hide other menus
        qx.ui.menu.Manager.getInstance().update();

        // show previous menu
        vPrevButton._showMenu(true);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _onkeypress_right : function()
    {
      var vMenu = this.getOpenMenu();

      if (!vMenu) {
        return;
      }

      var vOpener = vMenu.getOpener();

      if (!vOpener) {
        return;
      }

      var vChildren = this.getAllButtons();
      var vChildrenLength = vChildren.length;
      var vIndex = vChildren.indexOf(vOpener);
      var vCurrent;
      var vNextButton = null;

      for (var i=vIndex+1; i<vChildrenLength; i++)
      {
        vCurrent = vChildren[i];

        if (vCurrent instanceof qx.ui.toolbar.MenuButton && vCurrent.getEnabled())
        {
          vNextButton = vCurrent;
          break;
        }
      }

      // If none found, try again from the begin (looping)
      if (!vNextButton)
      {
        for (var i=0; i<vIndex; i++)
        {
          vCurrent = vChildren[i];

          if (vCurrent instanceof qx.ui.toolbar.MenuButton && vCurrent.getEnabled())
          {
            vNextButton = vCurrent;
            break;
          }
        }
      }

      if (vNextButton)
      {
        // hide other menus
        qx.ui.menu.Manager.getInstance().update();

        // show next menu
        vNextButton._showMenu(true);
      }
    }
  },


  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_layout");
  }
});
