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
     * Thomas Herchenroeder (thron7)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************
************************************************************************ */

/**
 * Data class which hold all data of a test run.
 */
qx.Class.define("qxunit.runner.TestResultData",
{
  extend : qx.core.Target,

  construct : function(testName)
  {
    this.base(arguments);
    this.setName(testName);
  },

  properties :
  {
    name :
    {
      check : "String"
    },

    state :
    {
      check : ["start", "error", "failure", "success"],
      init : "start",
      event : "changeState"
    },

    exception :
    {
      nullable : true
    }

  },

  members :
  {
    getMessage : qx.core.Variant.select("qx.client",
    {
      "default" : function()
      {
        if (this.getException()) {
          return this.getException().toString();
        } else {
          return "";
        }
      },

      "opera" : function() {
        if (this.getException()) {
          var msg = this.getException().message;
          if (msg.indexOf("Backtrace:") < 0) {
            return this.getException().toString();
          } else {
            return qx.lang.String.trim(msg.split("Backtrace:")[0]);
          }
        } else {
          return "";
        }
      }
    }),


    getStackTrace : function()
    {
      var ex = this.getException();

      var trace = [];
      if (typeof(ex.getStackTrace) == "function") {
        trace = ex.getStackTrace();
      } else {
        trace = qx.dev.StackTrace.getStackTraceFromError(ex);
      }

      // filter Test Runner functions from the stack trace
      while (trace.length > 0)
      {
        var first = trace[0];
        if (
          first.indexOf("qxunit.AssertionError") == 0 ||
          first.indexOf("qx.Class") == 0 ||
          first.indexOf("qxunit.MAssert") == 0 ||
          first.indexOf("script") == 0
          )
        {
          trace.shift();
        }
        else
        {
          break;
        }
      }

      return trace.join("<br>");
    }

  }

});