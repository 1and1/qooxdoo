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

qx.Class.define("demobrowser.demo.layout.VBoxLayout_5",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      doc = new qx.ui.root.Application(document);

      // one percent child which is not flexible
      var box1 = new qx.ui.core.Widget().set({height: 300, decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      layout1.add(w1, { height : "50%" });
      layout1.add(w2, { flex : 1 });
      layout1.add(w3, { flex : 1 });

      box1.setLayout(layout1);
      doc.add(box1, 10, 10);




      // all percent child, using 90% in sum, rest filled via flex
      var box1 = (new qx.ui.core.Widget).set({height: 300, decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      layout1.add(w1, { height : "30%", flex : 1 });
      layout1.add(w2, { height : "30%", flex : 1 });
      layout1.add(w3, { height : "30%", flex : 1 });

      box1.setLayout(layout1);
      doc.add(box1, 130, 10);




      // all percent child, using 99.9% in sum, flex disabled (=> to small result)
      var box1 = (new qx.ui.core.Widget).set({height: 300, decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      layout1.add(w1, { height : "33.3%" });
      layout1.add(w2, { height : "33.3%" });
      layout1.add(w3, { height : "33.3%" });

      box1.setLayout(layout1);
      doc.add(box1, 250, 10);




      // all percent child, using 99.9% in sum, flex enabled for last child (=> perfect result, last one a bit bigger)
      var box1 = (new qx.ui.core.Widget).set({height: 300, decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      layout1.add(w1, { height : "33.3%", flex : 0 });
      layout1.add(w2, { height : "33.3%", flex : 0 });
      layout1.add(w3, { height : "33.3%" });

      box1.setLayout(layout1);
      doc.add(box1, 370, 10);






      // one percent child which is not flexible + auto sizing
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      layout1.add(w1, { height : "50%" });
      layout1.add(w2, { flex : 1 });
      layout1.add(w3, { flex : 1 });

      box1.setLayout(layout1);
      doc.add(box1, 490, 10);



      // all child in percents + auto sizing + no flex
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      layout1.add(w1, { height : "33%" });
      layout1.add(w2, { height : "33%" });
      layout1.add(w3, { height : "33%" });

      box1.setLayout(layout1);
      doc.add(box1, 610, 10);


      // all child in percents + auto sizing + flex enabled
      var box1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      layout1.add(w1, { height : "33%", flex : 1 });
      layout1.add(w2, { height : "33%", flex : 1 });
      layout1.add(w3, { height : "33%", flex : 1 });

      box1.setLayout(layout1);
      doc.add(box1, 730, 10);




      // all child in percents + flex enabled (shrinking)
      var box1 = (new qx.ui.core.Widget).set({height : 100, decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      layout1.add(w1, { height : "33%", flex : 1 });
      layout1.add(w2, { height : "33%", flex : 1 });
      layout1.add(w3, { height : "33%", flex : 1 });

      box1.setLayout(layout1);
      doc.add(box1, 850, 10);





      // all child in percents + flex enabled (growing)
      var box1 = (new qx.ui.core.Widget).set({height : 300, decorator: "black", backgroundColor: "yellow"});
      var layout1 = new qx.ui.layout.VBox();

      layout1.setSpacing(5);

      var w1 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w2 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});
      var w3 = (new qx.ui.core.Widget).set({decorator: "black", backgroundColor: "green"});

      layout1.add(w1, { height : "33%", flex : 1 });
      layout1.add(w2, { height : "33%", flex : 1 });
      layout1.add(w3, { height : "33%", flex : 1 });

      box1.setLayout(layout1);
      doc.add(box1, 970, 10);
    }
  }
});
