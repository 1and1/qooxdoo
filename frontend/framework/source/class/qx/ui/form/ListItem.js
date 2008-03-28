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

************************************************************************ */

/**
 * @appearance list-item
 */
qx.Class.define("qx.ui.form.ListItem",
{
  extend : qx.ui.basic.Atom,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vText, vIcon, vValue)
  {
    this.base(arguments, vText, vIcon);

    this.setValue(vValue || null);
    this.addListener("dblclick", this._ondblclick);
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events:
  {
    /** (Fired by {@link qx.ui.form.List}) */
    "action" : "qx.event.type.Event"
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
      init : "list-item"
    },

    /** Fires a "changeValue" (qx.event.type.Change) event */
    value :
    {
      check : "String",
      nullable : true,
      event : "changeValue"
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
     * Execute by the "_findItem" method at {@link qx.ui.form.List} to perform
     * a string search
     *
     * @type member
     * @param vText {String} String which should be matched with the ListItem's label
     * @return {Boolean} Match found
     */
    matchesString : function(vText)
    {
      vText = String(vText);
      return vText != "" && this.getLabel().toString().toLowerCase().indexOf(vText.toLowerCase()) == 0;
    },


    /**
     * Execute by the "_findItem" method at {@link qx.ui.form.List} to perform
     * an exact string search
     *
     * @type member
     * @param vText {String} String which should be matched exactly with the ListItem's label
     * @return {Boolean} Match found
     */
    matchesStringExact : function(vText)
    {
      vText = String(vText);
      return vText != "" && this.getLabel().toString().toLowerCase() == String(vText).toLowerCase();
    },


    /**
     * Execute by the "_findItem" method at {@link qx.ui.form.List} to perform
     * a value search
     *
     * @type member
     * @param vText {String} String which should be matched with the ListItem's value
     * @return {Boolean} Match found
     */
    matchesValue : function(vText)
    {
      vText = String(vText);
      return vText != "" && this.getValue().toLowerCase().indexOf(vText.toLowerCase()) == 0;
    },


    /**
     * Execute by the "_findItem" method at {@link qx.ui.form.List} to perform
     * an exact value search
     *
     * @type member
     * @param vText {String} String which should be matched exactly with the ListItem's value
     * @return {Boolean} Match found
     */
    matchesValueExact : function(vText)
    {
      vText = String(vText);
      return vText != "" && this.getValue().toLowerCase() == String(vText).toLowerCase();
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Callback method for the double-click event of the ListItem.<br/>
     * Executes an registered command - if available.
     *
     * @type member
     * @param e {qx.event.type.Mouse} double-click event
     * @return {void}
     */
    _ondblclick : function(e)
    {
      // TODO08: Command support in Widget still missing
      /*
      var vCommand = this.getCommand();

      if (vCommand) {
        vCommand.execute();
      }
      */
    }
  }
});
