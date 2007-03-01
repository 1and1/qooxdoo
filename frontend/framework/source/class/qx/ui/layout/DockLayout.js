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

#module(ui_layout)

************************************************************************ */

qx.Class.define("qx.ui.layout.DockLayout",
{
  extend : qx.ui.core.Parent,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    this.base(arguments);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** The layout mode (in which order the children should be layouted) */
    mode :
    {
      _legacy           : true,
      type              : "string",
      defaultValue      : "vertical",
      possibleValues    : [ "vertical", "horizontal", "ordered" ],
      addToQueueRuntime : true
    },

    /*
      Overwrite from qx.ui.core.Widget, we do not support 'auto' and 'flex'
    */

    width :
    {
      _legacy       : true,
      addToQueue    : true,
      unitDetection : "pixelPercent"
    },

    minWidth :
    {
      _legacy       : true,
      defaultValue  : -Infinity,
      addToQueue    : true,
      unitDetection : "pixelPercent"
    },

    minWidth :
    {
      _legacy       : true,
      defaultValue  : -Infinity,
      addToQueue    : true,
      unitDetection : "pixelPercent"
    },

    height :
    {
      _legacy       : true,
      addToQueue    : true,
      unitDetection : "pixelPercent"
    },

    minHeight :
    {
      _legacy       : true,
      defaultValue  : -Infinity,
      addToQueue    : true,
      unitDetection : "pixelPercent"
    },

    minHeight :
    {
      _legacy       : true,
      defaultValue  : -Infinity,
      addToQueue    : true,
      unitDetection : "pixelPercent"
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
      INIT LAYOUT IMPL
    ---------------------------------------------------------------------------
    */

    /**
     * This creates an new instance of the layout impl this widget uses
     *
     * @type member
     * @return {var} TODOC
     */
    _createLayoutImpl : function() {
      return new qx.renderer.layout.DockLayoutImpl(this);
    },




    /*
    ---------------------------------------------------------------------------
      ENHANCED CHILDREN FEATURES
    ---------------------------------------------------------------------------
    */

    /**
     * Add multiple childrens and make them left aligned
     *
     * @type member
     * @return {void}
     */
    addLeft : function() {
      this._addAlignedHorizontal("left", arguments);
    },


    /**
     * Add multiple childrens and make them right aligned
     *
     * @type member
     * @return {void}
     */
    addRight : function() {
      this._addAlignedHorizontal("right", arguments);
    },


    /**
     * Add multiple childrens and make them top aligned
     *
     * @type member
     * @return {void}
     */
    addTop : function() {
      this._addAlignedVertical("top", arguments);
    },


    /**
     * Add multiple childrens and make them bottom aligned
     *
     * @type member
     * @return {void}
     */
    addBottom : function() {
      this._addAlignedVertical("bottom", arguments);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vAlign {var} TODOC
     * @param vArgs {var} TODOC
     * @return {void}
     */
    _addAlignedVertical : function(vAlign, vArgs)
    {
      for (var i=0, l=vArgs.length; i<l; i++) {
        vArgs[i].setVerticalAlign(vAlign);
      }

      this.add.apply(this, vArgs);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vAlign {var} TODOC
     * @param vArgs {var} TODOC
     * @return {void}
     */
    _addAlignedHorizontal : function(vAlign, vArgs)
    {
      for (var i=0, l=vArgs.length; i<l; i++) {
        vArgs[i].setHorizontalAlign(vAlign);
      }

      this.add.apply(this, vArgs);
    }
  }
});
