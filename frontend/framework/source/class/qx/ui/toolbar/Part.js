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

#module(ui_toolbar)

************************************************************************ */

/**
 * @appearance toolbar-part
 */
qx.Class.define("qx.ui.toolbar.Part",
{
  extend : qx.ui.layout.HorizontalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._handle = new qx.ui.toolbar.PartHandle;
    this.add(this._handle);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      refine : true,
      init : "toolbar-part"
    },

    show :
    {
      init : "inherit",
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
      CLONE
    ---------------------------------------------------------------------------
    */

    // Omit recursive cloning of qx.ui.toolbar.PartHandle
    /**
     * TODOC
     *
     * @type member
     * @param cloneInstance {var} TODOC
     * @return {void}
     */
    _cloneRecursive : function(cloneInstance)
    {
      var vChildren = this.getChildren();
      var vLength = vChildren.length;

      for (var i=0; i<vLength; i++)
      {
        if (!(vChildren[i] instanceof qx.ui.toolbar.PartHandle)) {
          cloneInstance.add(vChildren[i].clone(true));
        }
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_handle");
  }
});
