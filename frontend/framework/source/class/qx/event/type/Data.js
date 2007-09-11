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

************************************************************************ */

/**
 * Generic event object for data transfers.
 */
qx.Class.define("qx.event.type.Data",
{
  extend : qx.event.type.Event,




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Initializes an event onject.
     *
     * @type member
     * @param type {String} Event type
     * @param data {var} Data to attach to the event
     * @return {qx.event.type.Data} the initialized instance.
     */
    init : function(type, data)
    {
      this.base(arguments, type, false);

      this._data = data;

      return this;
    },


    /**
     * Get a copy of this object
     *
     * @type member
     * @return {qx.event.type.Data} a copy of this object
     */
    clone : function()
    {
      var clone = this.base(arguments);

      clone._data = this._data;

      return clone;
    },


    /**
     * The data field attached to this object. The data type and format are
     * defined by the sender.
     *
     * @type member
     * @return {var} Attached data
     */
    getData : function() {
      return this._data;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_data");
  }
});
