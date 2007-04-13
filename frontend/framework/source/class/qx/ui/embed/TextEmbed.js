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

#module(ui_basic)

************************************************************************ */

qx.Class.define("qx.ui.embed.TextEmbed",
{
  extend : qx.ui.basic.Terminator,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText)
  {
    this.base(arguments);

    if (vText != null) {
      this.setText(vText);
    }
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    /** Any text string which can contain TEXT, too */
    text :
    {
      _legacy : true,
      type    : "string"
    },


    /** Wrap the text? */
    wrap :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : true
    },

    /** The horizontal alignment of the text. */
    textAlign :
    {
      _legacy        : true,
      type           : "string",
      defaultValue   : "left",
      possibleValues : [ "left", "center", "right", "justify" ],
      allowNull      : false
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
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {Boolean} TODOC
     */
    _modifyText : function()
    {
      if (this._isCreated) {
        this._syncText();
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyFont : function(propValue, propOldValue, propData)
    {
      if (propValue) {
        propValue._applyWidget(this);
      } else if (propOldValue) {
        propOldValue._resetWidget(this);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyWrap : function(propValue, propOldValue, propData)
    {
      this.setStyleProperty("whiteSpace", propValue ? "normal" : "nowrap");
      return true;
    },

    // property modifier
    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyTextAlign : function(propValue, propOldValue, propData)
    {
      this.setStyleProperty("textAlign", propValue);
      return true;
    },




    /*
    ---------------------------------------------------------------------------
      ELEMENT HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _applyElementData : function() {
      this.getElement().appendChild(document.createTextNode(this.getText()));
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _syncText : function() {
      this.getElement().firstChild.nodeValue = this.getText();
    }
  }
});
