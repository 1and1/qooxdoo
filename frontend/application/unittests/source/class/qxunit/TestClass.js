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

qx.Class.define("qxunit.TestClass", {

  extend : qxunit.TestSuite,

  construct : function(clazz)
  {
    this.base(arguments);

    if (!clazz) {
      this.addFail("exsitsCheck" + this.__testClassNames.length, "Unkown test class!");
      return;
    }
    if (!qx.Class.isSubClassOf(clazz, qxunit.TestCase)) {
      this.addFail("Sub class check.", "The test class '"+ clazz.classname +"'is not a sub class of 'qxunit.TestCase'");
      return;
    }

    var proto = clazz.prototype;
    var classname = clazz.classname;

    for (var test in proto) {
      if (proto.hasOwnProperty(test)) {
        if (typeof(proto[test]) == "function" && test.indexOf("test") == 0) {
          this.addTestMethod(clazz, test);
        }
      }
    }

    this.setName(clazz.classname);
  },

  properties :
  {
    name : { check : "String"}
  }

});