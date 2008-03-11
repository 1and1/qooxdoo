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

qx.Class.define("demobrowser.demo.layout.CanvasLayout_3",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var border = new qx.ui.decoration.Basic(3, "solid", "black");

      w1 = new qx.ui.core.Widget().set({
        backgroundColor: "red",
        decorator: border
      });

      w2 = new qx.ui.core.Widget().set({
        backgroundColor: "blue",
        decorator: border
      });

      w3 = new qx.ui.basic.Label("maxHeight=300").set({
        backgroundColor: "green",
        decorator: border,
        padding: 5,
        maxHeight: 300
      });

      w4 = new qx.ui.core.Widget().set({
        backgroundColor: "yellow",
        decorator: border
      });

      w5 = new qx.ui.core.Widget().set({
        backgroundColor: "orange",
        decorator: border
      });

      w6 = new qx.ui.basic.Label("minWidth=400").set({
        backgroundColor: "teal",
        decorator: border,
        padding: 5,
        minWidth: 400
      });


      layout = new qx.ui.layout.Canvas();

      layout.add(w1, "3%", "3%", "3%", "3%", { width : "20%", height : "20%" });
      layout.add(w2, "6%", "6%", "6%", null, { width : "20%", height : "20%" });
      layout.add(w3, "9%", "9%", null, "9%", { width : "20%", height : "20%" });
      layout.add(w4, "12%", "12%", null, null, { width : "20%", height : "20%" });
      layout.add(w5, null, "9%", "9%", null, { width : "20%", height : "20%" });
      layout.add(w6, null, null, "9%", "9%", { width : "20%", height : "20%" });

      var container = new qx.ui.core.Widget();
      container.setLayout(layout);

      this.getRoot().add(container, 0, 0, 0, 0);
    }
  }
});
