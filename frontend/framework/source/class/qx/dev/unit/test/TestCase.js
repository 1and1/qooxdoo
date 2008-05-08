/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.dev.unit.test.TestCase",
{
  extend  : qx.core.Object,

  defer : function(statics)
  {
    if (qx.core.Variant.isSet("qx.debug", "off")) {
      qx.Class.include(statics, qx.core.MAssert);
    }
  }
});
