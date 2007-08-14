/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(ui_table)

************************************************************************ */

/**
 * An abstract data cell renderer that does the basic coloring
 * (borders, selected look, ...).
 */
qx.Class.define("qx.ui.table2.cellrenderer.Abstract",
{
  type : "abstract",
  implement : qx.ui.table2.cellrenderer.ICellRenderer,
  extend : qx.core.Object,

  construct : function() {
    var clazz = this.self(arguments);
    if (!clazz.stylesheet)
    {
      clazz.stylesheet = qx.legacy.html.StyleSheet.createElement(
        ".qooxdoo-table-cell div {" +
        "  white-space: nowrap;" +
        "}" +
        ".qooxdoo-table-cell {" +
        "  overflow:hidden;" +
        "  text-overflow:ellipsis;" +
        "  -o-text-overflow: ellipsis;" +
        "  white-space:nowrap;" +
        "  border-right:1px solid #eeeeee;" +
        "  border-bottom:1px solid #eeeeee;" +
        "  padding : 0px 2px;" +
        "  cursor:default;" +
        (qx.core.Variant.isSet("qx.client", "mshtml") ? '' : ';-moz-user-select:none;') +
        "}" +
        ".qooxdoo-table-cell-right {" +
        "  text-align:right" +
        " }" +
        ".qooxdoo-table-cell-italic {" +
        "  font-style:italic" +
        " }" +
        ".qooxdoo-table-cell-bold {" +
        "  font-weight:bold" +
        " }"
      );
    }
  },



  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _getCellClass : function(cellInfo) {
      return "qooxdoo-table-cell";
    },


    /**
     * Returns the CSS styles that should be applied to the main div of this cell.
     *
     * @type member
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {var} the CSS styles of the main div.
     */
    _getCellStyle : function(cellInfo)
    {
      return cellInfo.style || "";
    },


    /**
     * Returns the HTML that should be used inside the main div of this cell.
     *
     * @type member
     * @param cellInfo {Map} The information about the cell.
     *          See {@link #createDataCellHtml}.
     * @return {String} the inner HTML of the main div.
     */
    _getContentHtml : function(cellInfo, htmlArr)
    {
      if (cellInfo.value) {
        htmlArr.push(cellInfo.value);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param cellInfo {var} TODOC
     * @param htmlArr {var} TODOC
     * @return {void}
     */
    createDataCellHtml : function(cellInfo, htmlArr)
    {
      htmlArr.push('<td class="');
      htmlArr.push(this._getCellClass(cellInfo));

      var cellStyle = this._getCellStyle(cellInfo);
      if (cellStyle) {
        htmlArr.push('" style="');
        htmlArr.push(cellStyle);
      }

      htmlArr.push('">');

      // IE cannot handle overflow of table cells correctly so we have to
      // wrap the contents in a div.
      if (qx.core.Variant.isSet("qx.client", "mshtml")) // && /[\s\f\n\r]/i.test(content))
      {
        htmlArr.push('<div>');
        this._getContentHtml(cellInfo, htmlArr);
        htmlArr.push('</div>');
      }
      else
      {
        this._getContentHtml(cellInfo, htmlArr);
      }

      htmlArr.push("</td>");
    }

  }
});
