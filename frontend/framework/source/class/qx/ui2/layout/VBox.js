/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copybottom:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * A full featured vertical box layout. It lays out widgets in a
 * vertical column, from top to bottom.
 *
 * Other names (for comparable layouts in other systems):
 *
 * * QVBoxLayout (Qt)
 * * StackPanel (XAML)
 * * RowLayout (SWT) (with wrapping support like a FlowLayout)
 *
 * Supports:
 *
 * * Integer dimensions (using widget properties)
 * * Additional percent height (using layout property)
 * * Min and max dimensions (using widget properties)
 * * Priorized growing/shrinking (flex) (using layout properties)
 * * Top and bottom margins (even negative ones) with margin collapsing support (using layout properties)
 * * Auto sizing
 * * Vertical align
 * * Vertical spacing
 * * Reversed children ordering
 */
qx.Class.define("qx.ui2.layout.VBox",
{
  extend : qx.ui2.layout.Abstract,






  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Spacing between two children */
    spacing :
    {
      check : "Integer",
      init : 5,
      apply : "_applyLayoutProperty"
    },


    /** Vertical alignment of the whole children block */
    align :
    {
      check : [ "top", "middle", "bottom" ],
      init : "top",
      apply : "_applyLayoutProperty"
    },


    /** Whether the actual children data should be reversed for layout (bottom-to-top) */
    reversed :
    {
      check : "Boolean",
      init : false,
      apply : "_applyLayoutProperty"
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      CHILDREN MANAGMENT
    ---------------------------------------------------------------------------
    */

    /**
     * Adds a new widget to this layout.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to add
     * @param flex {Integer?null} Flex value to use
     * @param align {String?null} Horizontal alignment of widget
     * @return {qx.ui2.layout.VBox} This object (for chaining support)
     */
    add : function(widget, flex, align)
    {
      this.base(arguments, widget);
      this._importProperties(widget, arguments, "vbox.flex", "vbox.align");

      // Chaining support
      return this;
    },






    /*
    ---------------------------------------------------------------------------
      LAYOUT INTERFACE
    ---------------------------------------------------------------------------
    */

    // overridden
    invalidate : function()
    {
      if (this._sizeHint)
      {
        this.debug("Clear layout cache");
        this._sizeHint = null;
      }
    },


    // overridden
    layout : function(width, height)
    {
      // Initialize
      var children = this.getChildren();
      var align = this.getAlign();
      var child, childHint;
      var childWidth, childAlign, childLeft, childTop;
      var childLeft, childRight;
      var childGrow;


      // Support for reversed children
      if (this.getReversed()) {
        children = children.concat().reverse();
      }


      // Creating dimension working data
      var childHeights = [];
      var childWidths = [];
      var childHints = [];
      var usedGaps = this._getGaps();
      var usedHeight = usedGaps;
      var childHeightPercent;

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];
        childHint = child.getSizeHint();

        childHeightPercent = child.getLayoutProperty("vbox.height");

        childHints[i] = childHint;
        childHeights[i] = childHeightPercent ? Math.floor((height - usedGaps) * parseFloat(childHeightPercent) / 100) : childHint.height;
        childWidths[i] = Math.max(childHint.minWidth, Math.min(childHint.width, width));

        usedHeight += childHeights[i];
      }

      // this.debug("Initial heights: avail=" + height + ", used=" + usedHeight);


      // Process heights for flex stretching/shrinking
      if (usedHeight != height)
      {
        var flexCandidates = [];
        var childGrow = usedHeight < height;

        for (var i=0, l=children.length; i<l; i++)
        {
          child = children[i];

          if (child.canStretchX())
          {
            childFlex = child.getLayoutProperty("vbox.flex");

            if (childFlex == null || childFlex > 0)
            {
              childHint = childHints[i];

              flexCandidates.push({
                id : i,
                potential : childGrow ? childHint.maxHeight - childHint.height : childHint.height - childHint.minHeight,
                flex : childGrow ? (childFlex || 1) : 1 / (childFlex || 1)
              });
            }
          }
        }

        if (flexCandidates.length > 0)
        {
          var flexibleOffsets = qx.ui2.layout.Util.computeFlexOffsets(flexCandidates, height - usedHeight);

          for (var key in flexibleOffsets)
          {
            // this.debug(" - Correcting child[" + key + "] by: " + flexibleOffsets[key]);

            childHeights[key] += flexibleOffsets[key];
            usedHeight += flexibleOffsets[key];
          }
        }
      }

      // this.debug("Corrected heights: avail=" + height + ", used=" + usedHeight);


      // Calculate vertical alignment offset
      var childAlignOffset = 0;
      if (usedHeight < height && align != "top")
      {
        childAlignOffset = height - usedHeight;

        if (align === "middle") {
          childAlignOffset = Math.round(childAlignOffset / 2);
        }
      }

      // this.debug("Alignment offset: value=" + childAlignOffset);


      // Iterate over children
      var spacing = this.getSpacing();
      var childTop = childAlignOffset + (children[0].getLayoutProperty("vbox.marginTop") || 0);

      for (var i=0, l=children.length; i<l; i++)
      {
        child = children[i];

        if (childTop < height)
        {
          // Respect horizontal alignment
          childLeft = qx.ui2.layout.Util.computeHorizontalAlignOffset(child.getLayoutProperty("vbox.align"), childWidths[i], width);

          // Layout child
          child.layout(childLeft, childTop, childWidths[i], childHeights[i]);

          // Include again (if excluded before)
          child.include();
        }
        else
        {
          // Exclude (completely) hidden children
          child.exclude();
        }

        // If this is the last one => exit here
        if (i==(l-1)) {
          break;
        }

        // Compute top position of next child
        thisMargin = child.getLayoutProperty("vbox.marginBottom");
        nextMargin = children[i+1].getLayoutProperty("vbox.marginTop");
        childTop += childHeights[i] + spacing + this._collapseMargin(thisMargin, nextMargin);
      }
    },


    // overridden
    getSizeHint : function()
    {
      if (this._sizeHint) {
        return this._sizeHint;
      }

      // Initialize
      var children = this.getChildren();
      var gaps = this._getGaps();
      var minHeight=gaps, height=gaps, maxHeight=gaps;
      var minWidth=0, width=0, maxWidth=32000;

      // Support for reversed children
      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      // Iterate over children
      var maxPercentHeight = 0;
      for (var i=0, l=children.length; i<l; i++)
      {
        var child = children[i];
        var childHint = child.getSizeHint();

        // Respect percent height (up calculate height by using preferred height)
        var childPercentHeight = child.getLayoutProperty("vbox.height");
        if (childPercentHeight) {
          maxPercentHeight = Math.max(maxPercentHeight, childHint.height / parseFloat(childPercentHeight) * 100);
        } else {
          height += childHint.height;
        }

        // Sum up min/max height
        minHeight += childHint.minHeight;
        maxHeight += childHint.maxHeight;

        // Find maximium minWidth and width
        minWidth = Math.max(0, minWidth, childHint.minWidth);
        width = Math.max(0, width, childHint.width);

        // Find minimum maxWidth
        maxWidth = Math.min(32000, maxWidth, childHint.maxWidth);
      }

      // Apply max percent height
      height += Math.round(maxPercentHeight);

      // Limit height to integer range
      minHeight = Math.min(32000, Math.max(0, minHeight));
      height = Math.min(32000, Math.max(0, height));
      maxHeight = Math.min(32000, Math.max(0, maxHeight));

      // Build hint
      var hint = {
        minHeight : minHeight,
        height : height,
        maxHeight : maxHeight,
        minWidth : minWidth,
        width : width,
        maxWidth : maxWidth
      };

      this.debug("Compute size hint: ", hint);
      this._sizeHint = hint;

      return hint;
    },







    /*
    ---------------------------------------------------------------------------
      LAYOUT HELPERS
    ---------------------------------------------------------------------------
    */

    /**
     * Computes the spacing sum plus margin. Supports margin collapsing.
     *
     * @type member
     * @return {void}
     */
    _getGaps : function()
    {
      var children = this.getChildren();
      var length = children.length;
      var gaps = this.getSpacing() * (length - 1);

      // Support for reversed children
      if (this.getReversed()) {
        children = children.concat().reverse();
      }

      // Add margin top of first child (no collapsing here)
      gaps += children[0].getLayoutProperty("vbox.marginTop") || 0;

      // Add inner margins (with collapsing support)
      if (length > 0)
      {
        var thisMargin, nextMargin;
        for (var i=0; i<length-1; i++)
        {
          thisMargin = children[i].getLayoutProperty("vbox.marginBottom");
          nextMargin = children[i+1].getLayoutProperty("vbox.marginTop");

          gaps += this._collapseMargin(thisMargin, nextMargin);
        }
      }

      // Add margin bottom of last child (no collapsing here)
      gaps += children[length-1].getLayoutProperty("vbox.marginBottom") || 0;

      return gaps;
    },


    /**
     * Collapses a bottom and top margin of two widgets.
     *
     * @type member
     * @param bottom {Integer} Bottom margin
     * @param top {Integer} Top margin
     * @return {Integer} The collapsed margin
     */
    _collapseMargin : function(bottom, top)
    {
      // Math.max detects 'null' as more ('0') than '-1'
      // we need to work around this
      if (bottom && top) {
        return Math.max(bottom, top);
      } else if (top) {
        return top;
      } else if (bottom) {
        return bottom;
      }

      return 0;
    },





    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    _applyLayoutProperty : function(value, old)
    {
      this.invalidate();

      // Anything else TODO here?
    },





    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: MARGIN
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the bottom margin of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {Integer} The bottom margin to apply
     * @return {qx.ui2.layout.VBox} This layout (for chaining support)
     */
    setMarginBottom : function(widget, value)
    {
      widget.addLayoutProperty("vbox.marginBottom", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the bottom margin of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.VBox} This layout (for chaining support)
     */
    resetMarginBottom : function(widget)
    {
      widget.removeLayoutProperty("vbox.marginBottom");

      // Chaining support
      return this;
    },


    /**
     * Gets the bottom margin of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {Integer} The margin bottom value
     */
    getMarginBottom : function(widget) {
      return widget.getLayoutProperty("vbox.marginBottom");
    },


    /**
     * Sets the top margin of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {Integer} The top margin to apply
     * @return {qx.ui2.layout.VBox} This layout (for chaining support)
     */
    setMarginTop : function(widget, value)
    {
      widget.addLayoutProperty("vbox.marginTop", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the top margin of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.VBox} This layout (for chaining support)
     */
    resetMarginTop : function(widget)
    {
      widget.removeLayoutProperty("vbox.marginTop");

      // Chaining support
      return this;
    },


    /**
     * Gets the top margin of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {Integer} The margin top value
     */
    getMarginTop : function(widget) {
      return widget.getLayoutProperty("vbox.marginTop");
    },






    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: FLEX
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the flex value of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {Integer} The flex value to apply
     * @return {qx.ui2.layout.VBox} This layout (for chaining support)
     */
    setFlex : function(widget, value)
    {
      widget.addLayoutProperty("vbox.flex", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the flex value of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.VBox} This layout (for chaining support)
     */
    resetFlex : function(widget)
    {
      widget.removeLayoutProperty("vbox.flex");

      // Chaining support
      return this;
    },


    /**
     * Gets the flex value of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {Integer} The flex value
     */
    getFlex : function(widget) {
      return widget.getLayoutProperty("vbox.flex") || 1;
    },







    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: ALIGN
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the horizontal alignment of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {Integer} The top margin to apply
     * @return {qx.ui2.layout.VBox} This layout (for chaining support)
     */
    setHorizontalAlign : function(widget, value)
    {
      widget.addLayoutProperty("vbox.align", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the horizontal alignment of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.VBox} This layout (for chaining support)
     */
    resetHorizontalAlign : function(widget)
    {
      widget.removeLayoutProperty("vbox.align");

      // Chaining support
      return this;
    },


    /**
     * Gets the horizontal alignment of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {Integer} The horizontal alignment
     */
    getHorizontalAlign : function(widget) {
      return widget.getLayoutProperty("vbox.align") || "left";
    },




    /*
    ---------------------------------------------------------------------------
      LAYOUT PROPERTIES: DIMENSION
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the height value of the given widget. This property is used
     * to apply percent dimensions. For simple pixel dimensions
     * use the widget property <code>height</code> instead.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @param value {String} The (percent) height value to apply
     * @return {qx.ui2.layout.VBox} This layout (for chaining support)
     */
    setHeight : function(widget, value)
    {
      widget.addLayoutProperty("vbox.height", value);

      // Chaining support
      return this;
    },


    /**
     * Resets the (percent) height value of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to modify
     * @return {qx.ui2.layout.VBox} This layout (for chaining support)
     */
    resetHeight : function(widget)
    {
      widget.removeLayoutProperty("vbox.height");

      // Chaining support
      return this;
    },


    /**
     * Gets the (percent) height value of the given widget.
     *
     * @type member
     * @param widget {qx.ui2.core.Widget} Widget to query
     * @return {String} The height value
     */
    getHeight : function(widget) {
      return widget.getLayoutProperty("vbox.height") || 1;
    }
  }
});
