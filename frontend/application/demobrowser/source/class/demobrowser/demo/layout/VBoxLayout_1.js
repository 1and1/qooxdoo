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

qx.Class.define("demobrowser.demo.layout.VBoxLayout_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // auto size
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      box1.setLayout(layout1);
      this.getRoot().add(box1, 10, 10);


      // container wider, horizontal alignment
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", minWidth: 60});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth: 40}), { align : "left" });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth: 40}), { align : "center" });
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green", maxWidth: 40}), { align : "right" });
      box1.setLayout(layout1);
      this.getRoot().add(box1, 130, 10);


      // container higher, vertical alignment = bottom
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", height: 300});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);
      layout1.setAlign("bottom");
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      box1.setLayout(layout1);
      this.getRoot().add(box1, 210, 10);


      // container higher, vertical alignment = middle
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", height: 300});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);
      layout1.setAlign("middle");
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      layout1.add((new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"}));
      box1.setLayout(layout1);
      this.getRoot().add(box1, 330, 10);


      // auto size + vertical margins
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})

      layout1.add(w1, { marginBottom : 10 });
      layout1.add(w2, { marginTop : 20, marginBottom : 10 });
      layout1.add(w3, { marginBottom : 10 });

      box1.setLayout(layout1);
      this.getRoot().add(box1, 450, 10);




      // manual height + vertical margins + alignment=bottom
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", height: 300});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);
      layout1.setAlign("bottom");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})

      layout1.add(w1, { marginBottom : 10 });
      layout1.add(w2, { marginTop : 20, marginBottom : 10 });
      layout1.add(w3, { marginBottom : 10 });

      box1.setLayout(layout1);
      this.getRoot().add(box1, 570, 10);



      // manual height + vertical margins + alignment=middle
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow", height: 300});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);
      layout1.setAlign("middle");

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"})

      layout1.add(w1, { marginBottom : 10 });
      layout1.add(w2, { marginTop : 20, marginBottom : 10 });
      layout1.add(w3, { marginBottom : 10 });

      box1.setLayout(layout1);
      this.getRoot().add(box1, 690, 10);
    }
  }
});
