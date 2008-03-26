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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * The TextField is a single-line text input field.
 *
 * @appearance text-field
 */
qx.Class.define("qx.ui.form.TextField",
{
  extend : qx.ui.form.AbstractField,




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Maximum number of characters in the text field. */
    maxLength :
    {
      check : "Integer",
      apply : "_applyMaxLength",
      nullable : true
    },

    // overridden
    appearance :
    {
      refine : true,
      init : "text-field"
    },

    // overridden
    allowGrowY :
    {
      refine : true,
      init : false
    },

    // overridden
    allowShrinkY :
    {
      refine : true,
      init : false
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
      WIDGET API
    ---------------------------------------------------------------------------
    */

    /**
     * Creates the input element. Derived classes may override this
     * method, to create different input elements.
     *
     * @return {qx.html.Input} a new input element.
     */
    _createInputElement : function()
    {
      var input =  new qx.html.Input("text");
      input.setStyle("overflow", "hidden");

      return input;
    },




    /*
    ---------------------------------------------------------------------------
      TEXTFIELD API
    ---------------------------------------------------------------------------
    */

    // property apply
    _applyMaxLength : function(value, old) {
      this._contentElement.setAttribute("maxLength", value == null ? "" : value);
    }
  }
});
