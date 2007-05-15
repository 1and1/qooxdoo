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

qx.Class.define("testrunner.runner.TestLoaderStub", {
  extend : qx.core.Object,

  type : "singleton",

  construct : function()
  {
    this.tests = [
      {
        classname : "testrunner.test.Xml",
        tests : [
          "serializeArray",
          "testParseSerializeXml",
          "testCreateDocument",
          "testXPath"
        ]
      },

      {
        classname : "testrunner.test.Lang",
        tests : [
          "testString",
          "testFormat",
          "testPad",
          "testAddRemovelistItem",
          "testAppend"
        ]
      }
    ];
  },

  members :
  {
    getTestDescriptions : function()
    {
      return this.tests;
    },

    runTests : function(testResult, className, methodName)
    {
      for (var i=0; i<this.tests.length; i++)
      {
        var testClass = this.tests[i];
        if (testClass.classname != className) {
          continue;
        }
        for (var j=0; j<testClass.tests.length; j++)
        {
          if (methodName && testClass.tests[j] != methodName) {
            continue;
          }
          var testFunction = function() {};
          var failTest = function() {
            throw new testrunner.AssertionError("Unknown error!", "Crazy error.");
          };
          var fcn = testClass.tests[j] == "testAddRemovelistItem" ? failTest : testFunction;
          var test = new testrunner.TestFunction(testClass, testClass.tests[j], fcn);
          test.run(testResult);
        }
      }
    }

  }

});