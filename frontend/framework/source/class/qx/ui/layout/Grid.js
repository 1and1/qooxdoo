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
 * This layout manager lays out its children in a two dimensional grid.
 *
 * Other names (for comparable layouts in other systems):
 *
 * * QGridLayout (Qt)
 * * Grid (XAML)
 *
 * Supports:
 *
 * * flex values for rows and columns
 * * minimal and maximal column and row sizes
 * * horizontal and vertical alignment
 * * col/row spans
 * * auto-sizing
 */
qx.Class.define("qx.ui.layout.Grid",
{
  extend : qx.ui.layout.Abstract,






  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    this._grid = [];
    this._rowData = [];
    this._colData = [];

    this._colSpans = [];
    this._rowSpans = [];

    this._resetMaxIndices();
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * The horizontal spacing between grid cells.
     */
    horizontalSpacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    },


    /**
     * The vertical spacing between grid cells.
     */
    verticalSpacing :
    {
      check : "Integer",
      init : 0,
      apply : "_applyLayoutChange"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Adds a new widget to this layout.
     *
     * @type member
     * @param widget {qx.ui.core.LayoutItem} The widget or spacer to add
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @param options {Map?null} Optional layout data for the widget.
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    /*
    add : function(widget, row, column, options)
    {
      // validate arguments
      if (row == null || column == null) {
        throw new Error("The arguments 'row' and 'column' must be defined!");
      }

      var cell = this.getCellWidget(row, column);

      if (cell != null) {
        throw new Error("There is already a widget in this cell (" + row + ", " + column + ")");
      }

      options = options || {};
      options.row = row;
      options.column = column;
      options.rowSpan = options.rowSpan || 1;
      options.colSpan = options.colSpan || 1;

      for (var x=0; x<options.colSpan; x++)
      {
        for (var y=0; y<options.rowSpan; y++) {
          this._setCellWidget(row + y, column + x, widget);
        }
      }

      if (options.rowSpan > 1) {
        this._rowSpans.push(widget);
      }

      if (options.colSpan > 1) {
        this._colSpans.push(widget);
      }

      this._resetMaxIndices();

      return this.base(arguments, widget, options);
    },


    // overridden
    remove : function(child)
    {
      var childProps = child.getLayoutProperties();

      for (var x=0; x<childProps.colSpan; x++)
      {
        for (var y=0; y<childProps.rowSpan; y++) {
          this._clearCellWidget(childProps.row + y, childProps.column + x);
        }
      }

      if (childProps.rowSpan > 1) {
        qx.lang.Array.remove(this._rowSpans, child);
      }

      if (childProps.colSpan > 1) {
        qx.lang.Array.remove(this._colSpans, child);
      }

      this._resetMaxIndices();

      return this.base(arguments, child);
    },
    //*/


    // overridden
    invalidateChildrenCache : function() {
      this._resetMaxIndices();
    },


    /**
     * Resets the cached values for the max row and column indices used by
     * {@link #getMaxRowIndex} and {@link getMaxColIndex}.
     */
    _resetMaxIndices : function()
    {
      this._maxRowIndex = null;
      this._maxColIndex = null;
    },


    /**
     * Computes and returns the maximum row index.
     *
     * @return {Integer} the maximum row index
     */
    getMaxRowIndex : function()
    {
      if (this._maxRowIndex !== null) {
        return this._maxRowIndex;
      }

      this._maxRowIndex = 0;

      var children = this._getLayoutChildren();
      for (var i=0, l=children.length; i<l; i++)
      {
        var child = children[i];
        var childProps = child.getLayoutProperties();

        this._maxRowIndex = Math.max(this._maxRowIndex, childProps.row + childProps.rowSpan - 1);
      }

      return this._maxRowIndex;
    },


    /**
     * Computes and returns the maximum column index.
     *
     * @return {Integer} the maximum column index
     */
    getMaxColIndex : function()
    {
      if (this._maxColIndex !== null) {
        return this._maxColIndex;
      }

      this._maxColIndex = 0;

      var children = this._getLayoutChildren();
      for (var i=0, l=children.length; i<l; i++)
      {
        var child = children[i];
        var childProps = child.getLayoutProperties();

        this._maxColIndex = Math.max(this._maxColIndex, childProps.column + childProps.colSpan - 1);
      }

      return this._maxColIndex;
    },


    /**
     * Checks whether a string arguments matches one of the provided strings.
     * Throws an exception if the argument is invalid.
     *
     * @param arg {String} string argument to check
     * @param validValues {String[]} Array of valid argument values
     */
    _validateArgument : function(arg, validValues)
    {
      if (validValues.indexOf(arg) == -1)
      {
        throw new Error(
          "Invalid argument '" + arg +"'! Valid arguments are: '" +
          validValues.join(", ") + "'"
        );
      }
    },


    /**
     * Stores widget at the givencoordinate in the grid cell
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @param widget {qx.ui.core.LayoutItem} The widget to add.
     */
    _setCellWidget : function(row, column, widget)
    {
      var grid = this._grid;

      if (grid[row] == undefined) {
         grid[row] = [];
      }

      grid[row][column] = widget;
    },


    /**
     * Clears all data stored for a grid cell
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     */
    _clearCellWidget : function(row, column)
    {
      var grid = this._grid;

      if (grid[row] == undefined) {
         return;
      }

      var widget = grid[row][column];

      if (!widget) {
        return;
      } else {
        delete grid[row][column];
      }
    },


    /**
     * Stores data for a grid row
     *
     * @param row {Integer} The row index
     * @param key {String} The key under which the data should be stored
     * @param value {var} data to store
     */
    _setRowData : function(row, key, value)
    {
      var rowData = this._rowData[row];

      if (!rowData)
      {
        this._rowData[row] = {};
        this._rowData[row][key] = value;
      }
      else
      {
        rowData[key] = value;
      }
    },


    /**
     * Stores data for a grid column
     *
    * @param column {Integer} The column index
     * @param key {String} The key under which the data should be stored
     * @param value {var} data to store
     */
    _setColumnData : function(column, key, value)
    {
      var colData = this._colData[column];

      if (!colData)
      {
        this._colData[column] = {};
        this._colData[column][key] = value;
      }
      else
      {
        colData[key] = value;
      }
    },


    /**
     * Shortcut to set both horizonatal and vertical spacing between grid cells
     * to the same value.
     *
     * @param spacing {Integer} new horizontal and vertical spacing
     * @return {qx.ui.layout.Grid} This object (for chaining support).
     */
    setSpacing : function(spacing)
    {
      this.setVerticalSpacing(spacing);
      this.setHorizontalSpacing(spacing);
    },


    /**
     * Set the default cell alignment for a column. This alignmnet can be
     * overridden on a per cell basis by using the layout properties
     * <code>hAlign</code> and <code>vAlign</code>.
     *
     * If on a grid cell both row and a column alignmnet is set, the horizontal
     * alignmnet is taken from the column and the vertical alignment is taken
     * from the row.
     *
     * @param column {Integer} Column index
     * @param hAlign {String} The horizontal alignment. Valid values are
     *    "left", "center" and "right".
     * @param vAlign {String} The vertical alignment. Valid values are
     *    "top", "middle", "bottom"
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setColumnAlign : function(column, hAlign, vAlign)
    {
      this._validateArgument(hAlign, ["left", "center", "right"]);
      this._validateArgument(vAlign, ["top", "middle", "bottom"]);

      this._setColumnData(column, "hAlign", hAlign);
      this._setColumnData(column, "vAlign", vAlign);

      this._applyLayoutChange();

      return this;
    },


    /**
     * Get a map of the column's alignment.
     *
     * @param column {Integer} The column index
     * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
     *     containing the vertical and horizontal column alignment.
     */
    getColumnAlign : function(column)
    {
      var colData = this._colData[column] || {};

      return {
        vAlign : colData.vAlign || "top",
        hAlign : colData.hAlign || "left"
      };
    },


    /**
     * Set the default cell alignment for a row. This alignmnet can be
     * overridden on a per cell basis by using the layout properties
     * <code>hAlign</code> and <code>vAlign</code>.
     *
     * If on a grid cell both row and a column alignmnet is set, the horizontal
     * alignmnet is taken from the column and the vertical alignment is taken
     * from the row.
     *
     * @param row {Integer} Row index
     * @param hAlign {String} The horizontal alignment. Valid values are
     *    "left", "center" and "right".
     * @param vAlign {String} The vertical alignment. Valid values are
     *    "top", "middle", "bottom"
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setRowAlign : function(row, hAlign, vAlign)
    {
      this._validateArgument(hAlign, ["left", "center", "right"]);
      this._validateArgument(vAlign, ["top", "middle", "bottom"]);

      this._setRowData(row, "hAlign", hAlign);
      this._setRowData(row, "vAlign", vAlign);

      this._applyLayoutChange();

      return this;
    },


    /**
     * Get a map of the row's alignment.
     *
     * @param row {Integer} The Row index
     * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
     *     containing the vertical and horizontal row alignment.
     */
    getRowAlign : function(row)
    {
      var rowData = this._rowData[row] || {};

      return {
        vAlign : rowData.vAlign || "top",
        hAlign : rowData.hAlign || "left"
      };
    },


    /**
     * Get the widget located in the cell. If a the cell is empty or the widget
     * has a {@link qx.ui.core.Widget#visibility} value of <code>exclude</code>,
     * <code>null</code> is returned.
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @return {qx.ui.core.Widget|null}The cell's widget. The value may be null.
     */
    getCellWidget : function(row, column)
    {
      var widget = this._grid[row] ? this._grid[row][column]: null;

      if (widget && widget.getVisibility() !== "excluded") {
        return widget;
      } else {
        return null;
      }
    },


    /**
     * Get a map of the cell's alignment. For vertical alignment the row alignment
     * takes precedence over the column alignmnet. For horizontal alignment it is
     * the over way round. If an alignment is set on the cell widget using
     * {@link qx.ui.layout.Abstract#setLayoutProperty}, this alignment takes
     * always precedence over row or column alignment.
     *
     * @param row {Integer} The cell's row index
     * @param column {Integer} The cell's column index
     * @return {Map} A map with the keys <code>vAlign</code> and <code>hAlign</code>
     *     containing the vertical and horizontal cell alignment.
     */
    getCellAlign : function(row, column)
    {
      var vAlign = "top";
      var hAlign = "left";

      var rowData = this._rowData[row];
      var colData = this._colData[column];

      var widget = this.getCellWidget(row, column);
      var widgetProps = widget ? widget.getLayoutProperties() : {};

      // compute vAlign
      // precedence : widget -> row -> column
      if (widgetProps.vAlign) {
        vAlign = widgetProps.vAlign;
      } else if (rowData && rowData.vAlign) {
        vAlign = rowData.vAlign;
      } else if (colData && colData.vAlign) {
        vAlign = colData.vAlign;
      }

      // compute hAlign
      // precedence : widget -> column -> row
      if (widgetProps.hAlign) {
        hAlign = widgetProps.hAlign;
      } else if (colData && colData.hAlign) {
        hAlign = colData.hAlign;
      } else if (rowData && rowData.hAlign) {
        hAlign = rowData.hAlign;
      }

      return {
        vAlign : vAlign,
        hAlign : hAlign
      }
    },


    /**
     * Set the flex value for a grid column.
     * By default the column flex value is <code>1</code>.
     *
     * @param column {Integer} The column index
     * @param flex {Integer} The column's flex value
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setColumnFlex : function(column, flex)
    {
      this._setColumnData(column, "flex", flex);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the flex value of a grid column.
     *
     * @param column {Integer} The column index
     * @return {Integer} The column's flex value
     */
    getColumnFlex : function(column)
    {
      var colData = this._colData[column] || {};
      return colData.flex !== undefined ? colData.flex : 0;
    },


    /**
     * Set the flex value for a grid row.
     * By default the row flex value is <code>1</code>.
     *
     * @param row {Integer} The row index
     * @param flex {Integer} The row's flex value
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setRowFlex : function(row, flex)
    {
      this._setRowData(row, "flex", flex);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the flex value of a grid row.
     *
     * @param row {Integer} The row index
     * @return {Integer} The row's flex value
     */
    getRowFlex : function(row)
    {
      var rowData = this._rowData[row] || {};
      var rowFlex = rowData.flex !== undefined ? rowData.flex : 0
      return rowFlex;
    },


    /**
     * Set the maximum width of a grid column.
     * The default value is <code>Infinity</code>.
     *
     * @param column {Integer} The column index
     * @param maxWidth {Integer} The column's maximum width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setColumnMaxWidth : function(column, maxWidth)
    {
      this._setColumnData(column, "maxWidth", maxWidth);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the maximum width of a grid column.
     *
     * @param column {Integer} The column index
     * @return {Integer} The column's maximum width
     */
    getColumnMaxWidth : function(column)
    {
      var colData = this._colData[column] || {};
      return colData.maxWidth !== undefined ? colData.maxWidth : Infinity;
    },


    /**
     * Set the preferred width of a grid column.
     * The default value is <code>Infinity</code>.
     *
     * @param column {Integer} The column index
     * @param width {Integer} The column's width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setColumnWidth : function(column, width)
    {
      this._setColumnData(column, "width", width);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the preferred width of a grid column.
     *
     * @param column {Integer} The column index
     * @return {Integer} The column's width
     */
    getColumnWidth : function(column)
    {
      var colData = this._colData[column] || {};
      return colData.width !== undefined ? colData.width : null;
    },


    /**
     * Set the minimum width of a grid column.
     * The default value is <code>0</code>.
     *
     * @param column {Integer} The column index
     * @param minWidth {Integer} The column's minimum width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setColumnMinWidth : function(column, minWidth)
    {
      this._setColumnData(column, "minWidth", minWidth);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the minimum width of a grid column.
     *
     * @param column {Integer} The column index
     * @return {Integer} The column's minimum width
     */
    getColumnMinWidth : function(column)
    {
      var colData = this._colData[column] || {};
      return colData.minWidth || 0;
    },


    /**
     * Set the maximum height of a grid row.
     * The default value is <code>Infinity</code>.
     *
     * @param row {Integer} The row index
     * @param maxHeight {Integer} The row's maximum width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setRowMaxHeight : function(row, maxHeight)
    {
      this._setRowData(row, "maxHeight", maxHeight);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the maximum height of a grid row.
     *
     * @param row {Integer} The row index
     * @return {Integer} The row's maximum width
     */
    getRowMaxHeight : function(row)
    {
      var rowData = this._rowData[row] || {};
      return rowData.maxHeight || Infinity;
    },


    /**
     * Set the preferred height of a grid row.
     * The default value is <code>Infinity</code>.
     *
     * @param row {Integer} The row index
     * @param height {Integer} The row's width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setRowHeight : function(row, height)
    {
      this._setRowData(row, "height", height);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the preferred height of a grid row.
     *
     * @param row {Integer} The row index
     * @return {Integer} The row's width
     */
    getRowHeight : function(row)
    {
      var rowData = this._rowData[row] || {};
      return rowData.height !== undefined ? rowData.height : null;
    },


    /**
     * Set the minimum height of a grid row.
     * The default value is <code>0</code>.
     *
     * @param row {Integer} The row index
     * @param minHeight {Integer} The row's minimum width
     * @return {qx.ui.layout.Grid} This object (for chaining support)
     */
    setRowMinHeight : function(row, minHeight)
    {
      this._setRowData(row, "minHeight", minHeight);
      this._applyLayoutChange();
      return this;
    },


    /**
     * Get the minimum height of a grid row.
     *
     * @param row {Integer} The row index
     * @return {Integer} The row's minimum width
     */
    getRowMinHeight : function(row)
    {
      var rowData = this._rowData[row] || {};
      return rowData.minHeight || 0;
    },


    /**
     * Check whether all row spans fit with their preferred height into the
     * preferred row heights. If there is not enough space, the preferred
     * row sizes are increased. The distribution respects the flex and max
     * values of the rows.
     *
     *  The same is true for the min sizes.
     *
     *  The height array is modified in place.
     *
     * @param rowHeights {Map[]} The current row height array as computed by
     *     {@link #_getRowHeights}.
     */
    _fixHeightsRowSpan : function(rowHeights)
    {
      var vSpacing = this.getVerticalSpacing();

      for (var i=0, l=this._rowSpans.length; i<l; i++)
      {
        var widget = this._rowSpans[i];

        // ignore excluded widgets
        if (widget.getVisibility() == "excluded") {
          continue;
        }

        var hint = widget.getSizeHint();

        var widgetProps = widget.getLayoutProperties();
        var widgetRow = widgetProps.row;

        var prefSpanHeight = vSpacing * (widgetProps.rowSpan - 1);
        var minSpanHeight = prefSpanHeight;

        var prefRowFlex = [];
        var minRowFlex = [];

        for (var j=0; j<widgetProps.rowSpan; j++)
        {
          var row = widgetProps.row+j;
          var rowHeight = rowHeights[row];
          var rowFlex = this.getRowFlex(row);

          if (rowFlex > 0)
          {
            // compute flex array for the preferred height
            prefRowFlex.push({
              id: row,
              potential: rowHeight.maxHeight - rowHeight.height,
              flex: rowFlex
            });

            // compute flex array for the min height
            minRowFlex.push({
              id: row,
              potential: rowHeight.maxHeight - rowHeight.minHeight,
              flex: rowFlex
            });
          }

          prefSpanHeight += rowHeight.height;
          minSpanHeight += rowHeight.minHeight;
        }

        // If there is not enought space for the preferred size
        // increment the preferred row sizes.
        if (prefSpanHeight < hint.height)
        {
          var rowIncrements = qx.ui.layout.Util.computeFlexOffsets(
            prefRowFlex, hint.height - prefSpanHeight
          );

          for (var j=0; j<widgetProps.rowSpan; j++) {
            rowHeights[widgetRow+j].height += rowIncrements[widgetRow+j] || 0;
          }
        }

        // If there is not enought space for the min size
        // increment the min row sizes.
        if (minSpanHeight < hint.minHeight)
        {
          var rowIncrements = qx.ui.layout.Util.computeFlexOffsets(
            minRowFlex, hint.minHeight - minSpanHeight
          );

          for (var j=0; j<widgetProps.rowSpan; j++) {
            rowHeights[widgetRow+j].minHeight += rowIncrements[widgetRow+j] || 0;
          }
        }
      }
    },


    /**
     * Check whether all col spans fit with their prefferred width into the
     * preferred column widths. If there is not enough space the preferred
     * column sizes are increased. The distribution respects the flex and max
     * values of the columns.
     *
     *  The same is true for the min sizes.
     *
     *  The width array is modified in place.
     *
     * @param colWidths {Map[]} The current column width array as computed by
     *     {@link #_getColWidths}.
     */
    _fixWidthsColSpan : function(colWidths)
    {
      var hSpacing = this.getHorizontalSpacing();

      for (var i=0, l=this._colSpans.length; i<l; i++)
      {
        var widget = this._colSpans[i];

        // ignore excluded widgets
        if (widget.getVisibility() == "excluded") {
          continue;
        }

        var hint = widget.getSizeHint();

        var widgetProps = widget.getLayoutProperties();
        var widgetColumn = widgetProps.column;

        var prefSpanWidth = hSpacing * (widgetProps.colSpan - 1);
        var minSpanWidth = prefSpanWidth;

        var prefColFlex = [];
        var minColFlex = [];

        for (var j=0; j<widgetProps.colSpan; j++)
        {
          var col = widgetProps.column+j;
          var colWidth = colWidths[col];
          var colFlex = this.getColumnFlex(col);

          // compute flex array for the preferred width
          if (colFlex > 0)
          {
            prefColFlex.push({
              id: col,
              potential: colWidth.maxWidth - colWidth.width,
              flex: colFlex
            });

            // compute flex array for the min width
            minColFlex.push({
              id: col,
              potential: colWidth.maxWidth - colWidth.minWidth,
              flex: colFlex
            });
          }

          prefSpanWidth += colWidth.width;
          minSpanWidth += colWidth.minWidth;
        }

        // If there is not enought space for the preferred size
        // increment the preferred column sizes.
        if (prefSpanWidth < hint.width)
        {
          var colIncrements = qx.ui.layout.Util.computeFlexOffsets(
            prefColFlex, hint.width - prefSpanWidth
          );

          for (var j=0; j<widgetProps.colSpan; j++) {
            colWidths[widgetColumn+j].width += colIncrements[widgetColumn+j] || 0;
          }
        }

        // If there is not enought space for the min size
        // increment the min column sizes.
        if (minSpanWidth < hint.minWidth)
        {
          var colIncrements = qx.ui.layout.Util.computeFlexOffsets(
            minColFlex, hint.minWidth - minSpanWidth
          );

          for (var j=0; j<widgetProps.colSpan; j++) {
            colWidths[widgetColumn+j].minWidth += colIncrements[widgetColumn+j] || 0;
          }
        }
      }
    },


    /**
     * Compute the min/pref/max row heights.
     *
     * @return {Map[]} An array containg height information for each row. The
     *     entries have the keys <code>minHeight</code>, <code>maxHeight</code> and
     *     <code>height</code>.
     */
    _getRowHeights : function()
    {
      if (this._rowHeights != null) {
        return this._rowHeights;
      }

      var rowHeights = [];

      var maxRowIndex=this.getMaxRowIndex();
      var maxColIndex=this.getMaxColIndex();

      for (var row=0; row<=maxRowIndex; row++)
      {
        var minHeight = 0;
        var height = 0;
        var maxHeight = 0;

        for (var col=0; col<=maxColIndex; col++)
        {
          var widget = this.getCellWidget(row, col);
          if (!widget) {
            continue;
          }

          // ignore rows with row spans at this place
          // these rows will be taken into account later
          var widgetRowSpan = widget.getLayoutProperties().rowSpan || 0;
          if (widgetRowSpan > 1) {
            continue;
          }

          var cellSize = widget.getSizeHint();

          minHeight = Math.max(minHeight, cellSize.minHeight);
          height = Math.max(height, cellSize.height);
        }

        var minHeight = Math.max(minHeight, this.getRowMinHeight(row));
        var maxHeight = this.getRowMaxHeight(row);

        if (this.getRowHeight(row) !== null) {
          var height = this.getRowHeight(row);
        } else {
          var height = Math.max(minHeight, Math.min(height, maxHeight));
        }

        rowHeights[row] = {
          minHeight : minHeight,
          height : height,
          maxHeight : maxHeight
        };
      }

      if (this._rowSpans.length > 0) {
        this._fixHeightsRowSpan(rowHeights);
      }

      this._rowHeights = rowHeights;
      return rowHeights;
    },


    /**
     * Compute the min/pref/max column widths.
     *
     * @return {Map[]} An array containg width information for each column. The
     *     entries have the keys <code>minWidth</code>, <code>maxWidth</code> and
     *     <code>width</code>.
     */
    _getColWidths : function()
    {
      if (this._colWidths != null) {
        return this._colWidths;
      }

      var colWidths = [];

      var maxColIndex=this.getMaxColIndex();
      var maxRowIndex=this.getMaxRowIndex();

      for (var col=0; col<=maxColIndex; col++)
      {
        var width = 0;
        var minWidth = 0;
        var maxWidth = Infinity;

        for (var row=0; row<=maxRowIndex; row++)
        {
          var widget = this.getCellWidget(row, col);
          if (!widget) {
            continue;
          }

          // ignore columns with col spans at this place
          // these columns will be taken into account later
          var widgetColSpan = widget.getLayoutProperties().colSpan || 0;
          if (widgetColSpan > 1) {
            continue;
          }

          var cellSize = widget.getSizeHint();

          minWidth = Math.max(minWidth, cellSize.minWidth);
          width = Math.max(width, cellSize.width);
        }

        var minWidth = Math.max(minWidth, this.getColumnMinWidth(col));
        var maxWidth = this.getColumnMaxWidth(col);

        if (this.getColumnWidth(col) !== null) {
          var width = this.getColumnWidth(col);
        } else {
          var width = Math.max(minWidth, Math.min(width, maxWidth));
        }

        colWidths[col] = {
          minWidth: minWidth,
          width : width,
          maxWidth : maxWidth
        };
      }

      if (this._colSpans.length > 0) {
        this._fixWidthsColSpan(colWidths);
      }

      this._colWidths = colWidths;
      return colWidths;
    },


    /**
     * Computes for each column by how many pixels it must grow or shrink, taking
     * the column flex values and min/max widths into account.
     *
     * @param width {Integer} The grid width
     * @return {Integer[]} Sparse array of offsets to add to each column width. If
     *     an array entry is empty nothing should be added to the column.
     */
    _getColumnFlexOffsets : function(width)
    {
      var hint = this.getSizeHint();
      var diff = width - hint.width;

      if (diff == 0) {
        return {};
      }

      // collect all flexible children
      var colWidths = this._getColWidths();
      var flexibles = [];

      for (var i=0, l=colWidths.length; i<l; i++)
      {
        var col = colWidths[i];
        var colFlex = this.getColumnFlex(i);

        if (
          (colFlex <= 0) ||
          (col.width == col.maxWidth && diff > 0) ||
          (col.width == col.minWidth && diff < 0)
        ) {
          continue;
        }

        flexibles.push({
          id : i,
          potential : diff > 0 ? col.maxWidth - col.width : col.width - col.minWidth,
          flex : diff > 0 ? colFlex : (1 / colFlex)
        });
      }

      return qx.ui.layout.Util.computeFlexOffsets(flexibles, diff);
    },


    /**
     * Computes for each row by how many pixels it must grow or shrink, taking
     * the row flex values and min/max heights into account.
     *
     * @param height {Integer} The grid height
     * @return {Integer[]} Sparse array of offsets to add to each row heigth. If
     *     an array entry is empty nothing should be added to the row.
     */
    _getRowFlexOffsets : function(height)
    {
      var hint = this.getSizeHint();
      var diff = height - hint.height;

      if (diff == 0) {
        return {};
      }

      // collect all flexible children
      var rowHeights = this._getRowHeights();
      var flexibles = [];

      for (var i=0, l=rowHeights.length; i<l; i++)
      {
        var row = rowHeights[i];
        var rowFlex = this.getRowFlex(i);

        if (
          (rowFlex <= 0) ||
          (row.height == row.maxHeight && diff > 0) ||
          (row.height == row.minHeight && diff < 0)
        ) {
          continue;
        }

        flexibles.push({
          id : i,
          potential : diff > 0 ? row.maxHeight - row.height : row.height - row.minHeight,
          flex : diff > 0 ? rowFlex : (1 / rowFlex)
        });
      }

      return qx.ui.layout.Util.computeFlexOffsets(flexibles, diff);
    },


    // overridden
    renderLayout : function(availWidth, availHeight)
    {
      var Util = qx.ui.layout.Util;
      var hSpacing = this.getHorizontalSpacing();
      var vSpacing = this.getVerticalSpacing();

      // calculate column widths
      var prefWidths = this._getColWidths();
      var colStretchOffsets = this._getColumnFlexOffsets(availWidth);
      var colWidths = [];

      var maxColIndex=this.getMaxColIndex();
      var maxRowIndex=this.getMaxRowIndex();

      for (var col=0; col<=maxColIndex; col++) {
        colWidths[col] = prefWidths[col].width + (colStretchOffsets[col] || 0);
      }

      // calculate row heights
      var prefHeights = this._getRowHeights();
      var rowStretchOffsets = this._getRowFlexOffsets(availHeight);

      var rowHeights = [];

      for (var row=0; row<=maxRowIndex; row++) {
        rowHeights[row] = prefHeights[row].height + (rowStretchOffsets[row] || 0);
      }

      // do the layout
      var left = 0;
      for (var col=0; col<=maxColIndex; col++)
      {
        var top = 0;

        for (var row=0; row<=maxRowIndex; row++)
        {
          var widget = this.getCellWidget(row, col);

          // ignore empty cells
          if (!widget)
          {
            top += rowHeights[row] + vSpacing;
            continue;
          }

          var widgetProps = widget.getLayoutProperties();

          // ignore cells, which have cell spanning but are not the origin
          // of the widget
          if(widgetProps.row !== row || widgetProps.column !== col)
          {
            top += rowHeights[row] + vSpacing;
            continue;
          }

          // compute sizes width including cell spanning
          var spanWidth = hSpacing * (widgetProps.colSpan - 1);
          for (var i=0; i<widgetProps.colSpan; i++) {
            spanWidth += colWidths[col+i];
          }

          var spanHeight = vSpacing * (widgetProps.rowSpan - 1);
          for (var i=0; i<widgetProps.rowSpan; i++) {
            spanHeight += rowHeights[row+i];
          }

          var cellHint = widget.getSizeHint();

          var cellWidth = Math.max(cellHint.minWidth, Math.min(spanWidth, cellHint.maxWidth));
          var cellHeight = Math.max(cellHint.minHeight, Math.min(spanHeight, cellHint.maxHeight));

          var cellAlign = this.getCellAlign(row, col);
          var cellLeft = left + Util.computeHorizontalAlignOffset(cellAlign.hAlign, cellWidth, spanWidth);
          var cellTop = top + Util.computeVerticalAlignOffset(cellAlign.vAlign, cellHeight, spanHeight);

          widget.renderLayout(
            cellLeft,
            cellTop,
            cellWidth,
            cellHeight
          );

          top += rowHeights[row] + vSpacing;
        }

        left += colWidths[col] + hSpacing;
      }
    },


    // overridden
    invalidateLayoutCache : function()
    {
      this._sizeHint = null;
      this._rowHeights = null;
      this._colWidths = null;
    },


    // overridden
    _computeSizeHint : function()
    {
      // calculate col widths
      var colWidths = this._getColWidths();

      var minWidth=0, width=0;

      for (var i=0, l=colWidths.length; i<l; i++)
      {
        var col = colWidths[i];
        minWidth += col.minWidth;
        width += col.width;
      }

      // calculate row heights
      var rowHeights = this._getRowHeights();

      var minHeight=0, height=0;
      for (var i=0, l=rowHeights.length; i<l; i++)
      {
        var row = rowHeights[i];

        minHeight += row.minHeight;
        height += row.height;
      }

      var spacingX = this.getHorizontalSpacing() * (colWidths.length - 1);
      var spacingY = this.getVerticalSpacing() * (rowHeights.length - 1);

      var hint = {
        minWidth : minWidth + spacingX,
        width : width + spacingX,
        minHeight : minHeight + spacingY,
        height : height + spacingY
      };

      return hint;
    }
  },




  /*
  *****************************************************************************
     DESTRUCT
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeFields(
      "_grid", "_rowData", "_colData", "_colSpans", "_rowSpans"
    );
  }
});
