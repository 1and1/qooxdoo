/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qxunit.AssertionError", {
  extend: Error,

  construct: function(comment, failMessage) {
    Error.call(this, failMessage);
    this.setComment(comment || "");
    this.setMessage(failMessage || "");

    this._trace = qx.dev.StackTrace.getStackTrace();
  },

  properties: {
    comment:
    {
      check: "String",
      init: ""
    },

    message: {
      check: "String",
      init: ""
    }

  },

  members: {

    toString: function() {
      return this.getComment() + ": " + this.getMessage();
    },

    getStackTrace : function()
    {
      return this._trace;
    }

  }
});