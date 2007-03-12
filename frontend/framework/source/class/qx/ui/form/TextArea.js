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

#module(ui_form)

************************************************************************ */

/**
 * @appearance text-area
 */
qx.Class.define("qx.ui.form.TextArea",
{
  extend : qx.ui.form.TextField,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param vValue {String} this string is ddisplayed as the value of the TextArea.
   */
  construct : function(vValue)
  {
    this.base(arguments, vValue);

    this.setTagName("textarea");
    this.removeHtmlProperty("type");
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
      defaultValue : "text-area"
    },

    wrap :
    {
      _legacy : true,
      type    : "boolean"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {void}
     * @signature function(propValue, propOldValue, propData)
     */
    _modifyWrap : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(propValue, propOldValue, propData) {
        return this.setStyleProperty("whiteSpace", propValue ? "normal" : "nowrap");
      },

      "default" : function(propValue, propOldValue, propData) {
        return this.setHtmlProperty("wrap", propValue ? "soft" : "off");
      }
    }),


    /**
     * TODOC
     *
     * @type member
     * @return {int} TODOC
     */
    _computePreferredInnerHeight : function() {
      return 60;
    }
  }
});