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
     * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("demobrowser.demo.layout.ApplicationRoot_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      this.getRoot().setDecorator("black");

      var w1 = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        decorator: "black",
        padding: 10
      });

      var w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: "black"
      });

      var w3 = new qx.ui.core.Widget().set({
        backgroundColor: "green",
        decorator: "black"
      });

      var w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: "black"
      });

      var container = new qx.ui.core.Composite();
      container.setLayout(new qx.ui.layout.HBox());

      container.add(w1);
      container.add(w2);
      container.add(w3);
      container.add(w4);

      this.getRoot().add(container, 0, 0, 0, 0);
    }
  }
});
