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
 * Widget which displayes the test results as a formatted list.
 */
qx.Class.define("qxunit.runner.TestResultView",
{
  extend : qx.ui.embed.HtmlEmbed,

  construct : function()
  {
    this.base(arguments);
    this._testResults = [];

    this.addEventListener("appear", function() {
      this.setHtml(this.__createHtml())
    }, this);
  },

  members :
  {

    /**
     * @return {String} complete HTML of the list
     */
    __createHtml : function()
    {
      var html = new qx.util.StringBuilder();
      for (var i=this._testResults.length-1; i>=0; i--)
      {
        var result = this._testResults[i];
        html.add(this.__createResultHtml(result));
      }
      return html.get();
    },


    /**
     * @return {String} HTML fragemnt of a single test
     */
    __createResultHtml : function(testResult)
    {
      var html = "<div class='testResult " + testResult.getState() + "' id='testResult" + testResult.toHashCode() + "'>";
      html += "<h3>" + testResult.getName() + "</h3>";

      if (testResult.getState() == "failure" || testResult.getState() == "error")
      {
        html +=
          "Error message is: <br />" +
          testResult.getMessage() +
          "<br/>Stack trace: <div class='trace'>" + testResult.getStackTrace() + "</div>";
      }

      html += "</div>";
      return html;
    },


    /**
     * @param {TestResultData} Test result data instance
     */
    addTestResult : function(testResult)
    {
      this._testResults.push(testResult);
      testResult.addEventListener("changeState", function() { this.__onStateChange(testResult); }, this);

      var element = this.getElement();
      if (element)
      {
        element.innerHTML = this.__createResultHtml(testResult) + element.innerHTML;
      }
    },


    /**
     * @param {TestResultData} Test result data instance
     */
    __onStateChange : function(testResult)
    {
      this.setHtml(this.__createHtml());
    },


    /**
     * Clear all entries of the list.
     */
    clear : function()
    {
      for (var i=0; i<this._testResults.length; i++)
      {
        this._testResults[i].dispose();
      }
      this._testResults = [];
      this.setHtml("");
    }

  }
});