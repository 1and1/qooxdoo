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

qx.Class.define("testrunner.test.Element",
{
  extend : testrunner.TestCase,

  members :
  {
    testBasics : function()
    {
      var helper = document.createElement("div");
      document.body.appendChild(helper);

      var doc = new qx.html2.Element(helper);




      //
      // BASICS
      //

      var el1 = new qx.html2.Element;
      var el2a = new qx.html2.Element;
      var el2b = new qx.html2.Element;
      var el3a = new qx.html2.Element;
      var el3b = new qx.html2.Element;

      this.assertQxObject(el1);
      this.assertQxObject(el2a);
      // ...

      el1.setAttribute("id", "el1");
      el2a.setAttribute("id", "el2a");
      el2b.setAttribute("id", "el2b");
      el3a.setAttribute("id", "el3a");
      el3b.setAttribute("id", "el3b");

      this.assertIdentical(el1.getAttribute("id"), "el1");
      this.assertIdentical(el2a.getAttribute("id"), "el2a");
      // ...

      el1.addList(el2a, el2b);
      el2a.addList(el3a, el3b);
      doc.add(el1);

      el3a.setHtml("<b>hello</b>");

      this.assertIdentical(el3a.getHtml(), "<b>hello</b>");

      el1.setStyle("color", "blue");
      el1.setPixelStyle("width", 100).setPixelStyle("height", 100);

      this.assertIdentical(el1.getStyle("color"), "blue");
      this.assertIdentical(el1.getPixelStyle("width"), 100);
      this.assertIdentical(el1.getPixelStyle("height"), 100);

      qx.html2.Element.flushQueue();

      // DOM Structure Tests
      var pa = document.getElementById("el1");
      var ch1 = document.getElementById("el2a");
      var ch2 = document.getElementById("el2b");
      var ch3 = document.getElementById("el3a");
      var ch4 = document.getElementById("el3b");

      this.assertFalse(ch1===ch2);
      this.assertIdentical(ch1.parentNode, pa);
      this.assertIdentical(ch2.parentNode, pa);
      this.assertIdentical(ch3.parentNode, ch1);
      this.assertIdentical(ch4.parentNode, ch1);

      // Internal Structure Tests
      this.assertIdentical(el1.getChildren()[0], el2a);
      this.assertIdentical(el1.getChildren()[1], el2b);
      this.assertIdentical(el2a.getChildren()[0], el3a);
      this.assertIdentical(el2a.getChildren()[1], el3b);





      //
      // POSITIONED INSERT #1
      //

      this.assertIdentical(doc.getChildren()[0], el1);

      var before1 = new qx.html2.Element;
      before1.setAttribute("id", "before1");
      doc.insertBefore(before1, el1);

      var after1 = new qx.html2.Element;
      after1.setAttribute("id", "after1");
      doc.insertAfter(after1, el1);

      this.assertIdentical(doc.getChildren()[0], before1);
      this.assertIdentical(doc.getChildren()[1], el1);
      this.assertIdentical(doc.getChildren()[2], after1);

      qx.html2.Element.flushQueue();

      this.assertIdentical(doc.getElement().childNodes[0], before1.getElement());
      this.assertIdentical(doc.getElement().childNodes[1], el1.getElement());
      this.assertIdentical(doc.getElement().childNodes[2], after1.getElement());




      //
      // POSITIONED INSERT #2
      //

      var before2 = new qx.html2.Element;
      before2.setAttribute("id", "before2");
      doc.insertAt(before2, 0);

      var after2 = new qx.html2.Element;
      after2.setAttribute("id", "after2");
      doc.insertAt(after2, 10);

      this.assertIdentical(doc.getChildren()[0], before2);
      this.assertIdentical(doc.getChildren()[1], before1);
      this.assertIdentical(doc.getChildren()[2], el1);
      this.assertIdentical(doc.getChildren()[3], after1);
      this.assertIdentical(doc.getChildren()[4], after2);

      qx.html2.Element.flushQueue();

      this.assertIdentical(doc.getElement().childNodes[0], before2.getElement());
      this.assertIdentical(doc.getElement().childNodes[1], before1.getElement());
      this.assertIdentical(doc.getElement().childNodes[2], el1.getElement());
      this.assertIdentical(doc.getElement().childNodes[3], after1.getElement());
      this.assertIdentical(doc.getElement().childNodes[4], after2.getElement());




      //
      // MOVE
      //

      doc.moveAfter(before2, before1);
      doc.moveBefore(after2, after1);

      this.assertIdentical(doc.getChildren()[0], before1);
      this.assertIdentical(doc.getChildren()[1], before2);
      this.assertIdentical(doc.getChildren()[2], el1);
      this.assertIdentical(doc.getChildren()[3], after2);
      this.assertIdentical(doc.getChildren()[4], after1);

      qx.html2.Element.flushQueue();

      this.assertIdentical(doc.getElement().childNodes[0], before1.getElement());
      this.assertIdentical(doc.getElement().childNodes[1], before2.getElement());
      this.assertIdentical(doc.getElement().childNodes[2], el1.getElement());
      this.assertIdentical(doc.getElement().childNodes[3], after2.getElement());
      this.assertIdentical(doc.getElement().childNodes[4], after1.getElement());




      //
      // SWITCH
      //

      var in1 = doc.indexOf(before2);
      var in2 = doc.indexOf(after2);

      this.assertIdentical(in1, 1);
      this.assertIdentical(in2, 3);

      doc.moveTo(before2, in2);
      doc.moveTo(after2, in1);

      this.assertIdentical(doc.getChildren()[0], before1);
      this.assertIdentical(doc.getChildren()[1], after2);
      this.assertIdentical(doc.getChildren()[2], el1);
      this.assertIdentical(doc.getChildren()[3], before2);
      this.assertIdentical(doc.getChildren()[4], after1);

      qx.html2.Element.flushQueue();

      this.assertIdentical(doc.getElement().childNodes[0], before1.getElement());
      this.assertIdentical(doc.getElement().childNodes[1], after2.getElement());
      this.assertIdentical(doc.getElement().childNodes[2], el1.getElement());
      this.assertIdentical(doc.getElement().childNodes[3], before2.getElement());
      this.assertIdentical(doc.getElement().childNodes[4], after1.getElement());





      //
      // REMOVE
      //

      doc.remove(before2);
      doc.remove(after2);

      this.assertIdentical(doc.getChildren()[0], before1);
      this.assertIdentical(doc.getChildren()[1], el1);
      this.assertIdentical(doc.getChildren()[2], after1);

      qx.html2.Element.flushQueue();

      this.assertIdentical(doc.getElement().childNodes[0], before1.getElement());
      this.assertIdentical(doc.getElement().childNodes[1], el1.getElement());
      this.assertIdentical(doc.getElement().childNodes[2], after1.getElement());




      // RE-ADD

      doc.addList(before2, after2);

      this.assertIdentical(doc.getChildren()[0], before1);
      this.assertIdentical(doc.getChildren()[1], el1);
      this.assertIdentical(doc.getChildren()[2], after1);
      this.assertIdentical(doc.getChildren()[3], before2);
      this.assertIdentical(doc.getChildren()[4], after2);

      qx.html2.Element.flushQueue();

      this.assertIdentical(doc.getElement().childNodes[0], before1.getElement());
      this.assertIdentical(doc.getElement().childNodes[1], el1.getElement());
      this.assertIdentical(doc.getElement().childNodes[2], after1.getElement());
      this.assertIdentical(doc.getElement().childNodes[3], before2.getElement());
      this.assertIdentical(doc.getElement().childNodes[4], after2.getElement());




      // REMOVE, ADD, REMOVE, ADD
      // should be identical afterwards

      doc.removeList(before2, after2);
      doc.addList(before2, after2);
      doc.removeList(before2, after2);
      doc.addList(before2, after2);

      this.assertIdentical(doc.getChildren()[0], before1);
      this.assertIdentical(doc.getChildren()[1], el1);
      this.assertIdentical(doc.getChildren()[2], after1);
      this.assertIdentical(doc.getChildren()[3], before2);
      this.assertIdentical(doc.getChildren()[4], after2);

      qx.html2.Element.flushQueue();

      this.assertIdentical(doc.getElement().childNodes[0], before1.getElement());
      this.assertIdentical(doc.getElement().childNodes[1], el1.getElement());
      this.assertIdentical(doc.getElement().childNodes[2], after1.getElement());
      this.assertIdentical(doc.getElement().childNodes[3], before2.getElement());
      this.assertIdentical(doc.getElement().childNodes[4], after2.getElement());





      // REMOVER, MOVE AND INSERT IN ONE STEP

      doc.remove(before2);
      doc.moveAfter(before1, after1);
      doc.insertBefore(before2, before1);

      this.assertIdentical(doc.getChildren()[0], el1);
      this.assertIdentical(doc.getChildren()[1], after1);
      this.assertIdentical(doc.getChildren()[2], before2);
      this.assertIdentical(doc.getChildren()[3], before1);
      this.assertIdentical(doc.getChildren()[4], after2);

      qx.html2.Element.flushQueue();

      this.assertIdentical(doc.getElement().childNodes[0], el1.getElement());
      this.assertIdentical(doc.getElement().childNodes[1], after1.getElement());
      this.assertIdentical(doc.getElement().childNodes[2], before2.getElement());
      this.assertIdentical(doc.getElement().childNodes[3], before1.getElement());
      this.assertIdentical(doc.getElement().childNodes[4], after2.getElement());

      /*
      BEFORE:        AFTER1:        AFTER2:        AFTER3:

      before1        before1        el1            el1
      el1            el1            after1         after1
      after1         after1         before1        before2
      before2        after2         after2         before1
      after2                                       after2
      */






      // SORT

      var a = doc.getChildren();
      for (var i=1, l=a.length; i<l; i++) {
        doc.moveTo(a[i], 0);
      }

      this.assertIdentical(doc.getChildren()[0], after2);
      this.assertIdentical(doc.getChildren()[1], before1);
      this.assertIdentical(doc.getChildren()[2], before2);
      this.assertIdentical(doc.getChildren()[3], after1);
      this.assertIdentical(doc.getChildren()[4], el1);

      qx.html2.Element.flushQueue();

      this.assertIdentical(doc.getElement().childNodes[0], after2.getElement());
      this.assertIdentical(doc.getElement().childNodes[1], before1.getElement());
      this.assertIdentical(doc.getElement().childNodes[2], before2.getElement());
      this.assertIdentical(doc.getElement().childNodes[3], after1.getElement());
      this.assertIdentical(doc.getElement().childNodes[4], el1.getElement());







      // ROTATION

      doc.moveAfter(before1, before2);

      this.assertIdentical(doc.getChildren()[0], after2);
      this.assertIdentical(doc.getChildren()[1], before2);
      this.assertIdentical(doc.getChildren()[2], before1);
      this.assertIdentical(doc.getChildren()[3], after1);
      this.assertIdentical(doc.getChildren()[4], el1);

      qx.html2.Element.flushQueue();

      this.assertIdentical(doc.getElement().childNodes[0], after2.getElement());
      this.assertIdentical(doc.getElement().childNodes[1], before2.getElement());
      this.assertIdentical(doc.getElement().childNodes[2], before1.getElement());
      this.assertIdentical(doc.getElement().childNodes[3], after1.getElement());
      this.assertIdentical(doc.getElement().childNodes[4], el1.getElement());

    }
  }
});