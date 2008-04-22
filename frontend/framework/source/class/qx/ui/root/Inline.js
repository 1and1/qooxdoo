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

/**
 * This classes could be used to insert qooxdoo islands into existing
 * web pages. You can use the isles to place any qooxdoo powered widgets
 * inside a layout made using traditional HTML markup and CSS.
 *
 * This class uses a {@link qx.ui.layout.Basic} as fixed layout. The layout
 * cannot be changed.
 *
 * To position popups and tooltips please have a look at {@link qx.ui.layout.Page}.
 */
qx.Class.define("qx.ui.root.Inline",
{
  extend : qx.ui.root.Abstract,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param el {Element} DOM element to use as isle for qooxdoo content. Please
   *   note that existing content gets removed on the first layout flush.
   */
  construct : function(el)
  {
    // Temporary storage of element to use
    this._elem = el;

    // Base call
    this.base(arguments);

    // Use static layout
    this._setLayout(new qx.ui.layout.Canvas());

    // Directly schedule layout for root element
    qx.ui.core.queue.Layout.add(this);
  },





  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // adds major widget (left top edge)
    addMain : function(child) {
      this._add(child, {left:0, top: 0, right: 0, bottom: 0});
    },

    // overridden
    _createContainerElement : function()
    {
      var el = this._elem;
      var root = new qx.html.Root(el);

      // Make relative
      el.style.position = "relative";

      return root;
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_elem");
  }
});
