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

qx.Clazz.define("qx.ui.toolbar.Part",
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
      _legacy      : true,
      type         : "string",
      defaultValue : "toolbar-part"
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
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      if (this._handle)
      {
        this._handle.dispose();
        this._handle = null;
      }

      return this.base(arguments);
    }
  }
});
