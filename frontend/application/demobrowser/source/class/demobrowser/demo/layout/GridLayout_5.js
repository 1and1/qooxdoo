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

qx.Class.define("demobrowser.demo.layout.GridLayout_5",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);

      doc.add(this.getGrid(), 0, 0, 0, 0);
    },


    getGrid : function()
    {
      //docLayout.add(new qx.ui.basic.Label("Autosize, all default values"))
      var box = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow"});
      var layout = new qx.ui.layout.Grid();

      layout.setSpacing(5);

      // first column has fixed width
      layout.setColumnWidth(0, 250);

      // second and third have flex widths
      layout.setColumnFlex(1, 1);
      layout.setColumnFlex(2, 2);

      // last row stretches to available height
      layout.setRowFlex(2, 1);

      // first widget of first row has height of 100
      layout.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", height: 100}), 0, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), 0, 1);
      layout.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), 0, 2);

      // first widget of second row has height of 150
      layout.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", height: 150}), 1, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), 1, 1);
      layout.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), 1, 2);

      layout.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), 2, 0);
      layout.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), 2, 1);
      layout.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}), 2, 2);

      box.setLayout(layout);

      return box;
    }
  }
});
