/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2007 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_tablevarrowheight)

************************************************************************ */

/**
 * Shows a whole meta column. This includes a {@link TablePaneHeader}, a
 * {@link TablePane} and the needed scroll bars. This class handles the
 * virtual scrolling and does all the mouse event handling.
 */
qx.Class.define("qx.ui.tablevarrowheight.TablePaneScroller",
{
  extend : qx.ui.table.TablePaneScroller,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  /**
   * @param table {Table}
   *   The table the scroller belongs to.
   */
  construct : function(table) {
    this.base(arguments, table);
  }
});
