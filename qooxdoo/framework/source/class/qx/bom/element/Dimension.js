/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2009 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Contains support for calculating dimensions of HTML elements.
 *
 * We differ between the box (or border) size which is available via
 * {@link #getWidth} and {@link #getHeight} and the content or scroll
 * sizes which are available via {@link #getContentWidth} and
 * {@link #getContentHeight}.
 */
qx.Class.define("qx.bom.element.Dimension",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /**
     * Returns the rendered width of the given element.
     *
     * This is the visible width of the object, which need not to be identical
     * to the width configured via CSS. This highly depends on the current
     * box-sizing for the document and maybe even for the element.
     *
     * @signature function(element)
     * @param element {Element} element to query
     * @return {Integer} width of the element
     */
    getWidth : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(element)
      {
        // offsetWidth in Firefox does not always return the rendered pixel size
        // of an element.
        // Starting with Firefox 3 the rendered size can be determined by using
        // getBoundingClientRect
        // https://bugzilla.mozilla.org/show_bug.cgi?id=450422
        if (element.getBoundingClientRect)
        {
          var rect = element.getBoundingClientRect();
          return Math.round(rect.right) - Math.round(rect.left);
        }
        else
        {
          return element.offsetWidth;
        }
      },

      "default" : function(element) {
        return element.offsetWidth;
      }
    }),


    /**
     * Returns the rendered height of the given element.
     *
     * This is the visible height of the object, which need not to be identical
     * to the height configured via CSS. This highly depends on the current
     * box-sizing for the document and maybe even for the element.
     *
     * @signature function(element)
     * @param element {Element} element to query
     * @return {Integer} height of the element
     */
    getHeight : qx.core.Environment.select("engine.name",
    {
      "gecko" : function(element)
      {
        if (element.getBoundingClientRect)
        {
          var rect = element.getBoundingClientRect();
          return Math.round(rect.bottom) - Math.round(rect.top);
        }
        else
        {
          return element.offsetHeight;
        }
      },

      "default" : function(element) {
        return element.offsetHeight;
      }
    }),


    /**
     * Returns the rendered size of the given element.
     *
     * @param element {Element} element to query
     * @return {Map} map containing the width and height of the element
     */
    getSize : function(element)
    {
      return {
        width: this.getWidth(element),
        height: this.getHeight(element)
      };
    },


    /** {Map} Contains all overflow values where scrollbars are invisible */
    __hiddenScrollbars :
    {
      visible : true,
      hidden : true
    },


    /**
     * Returns the content width.
     *
     * The content width is basically the maximum
     * width used or the maximum width which can be used by the content. This
     * excludes all kind of styles of the element like borders, paddings, margins,
     * and even scrollbars.
     *
     * Please note that with visible scrollbars the content width returned
     * may be larger than the box width returned via {@link #getWidth}.
     *
     * @param element {Element} element to query
     * @return {Integer} Computed content width
     */
    getContentWidth : function(element)
    {
      var Style = qx.bom.element.Style;

      var overflowX = qx.bom.element.Overflow.getX(element);
      var paddingLeft = parseInt(Style.get(element, "paddingLeft")||"0px", 10);
      var paddingRight = parseInt(Style.get(element, "paddingRight")||"0px", 10);

      if (this.__hiddenScrollbars[overflowX])
      {
        var contentWidth = element.clientWidth;

        if ((qx.core.Environment.get("engine.name") == "opera")) {
          contentWidth = contentWidth - paddingLeft - paddingRight;
        }
        else
        {
          if (qx.dom.Node.isBlockNode(element)) {
            contentWidth = contentWidth - paddingLeft - paddingRight;
          }
        }

        return contentWidth;
      }
      else
      {
        if (element.clientWidth >= element.scrollWidth)
        {
          // Scrollbars visible, but not needed? We need to substract both paddings
          return Math.max(element.clientWidth, element.scrollWidth) - paddingLeft - paddingRight;
        }
        else
        {
          // Scrollbars visible and needed. We just remove the left padding,
          // as the right padding is not respected in rendering.
          var width = element.scrollWidth - paddingLeft;

          // IE renders the paddingRight as well with scrollbars on
          if (
            qx.core.Environment.get("engine.name") == "mshtml" &&
            qx.core.Environment.get("engine.version") >= 6
          ) {
            width -= paddingRight;
          }

          return width;
        }
      }
    },


    /**
     * Returns the content height.
     *
     * The content height is basically the maximum
     * height used or the maximum height which can be used by the content. This
     * excludes all kind of styles of the element like borders, paddings, margins,
     * and even scrollbars.
     *
     * Please note that with visible scrollbars the content height returned
     * may be larger than the box height returned via {@link #getHeight}.
     *
     * @param element {Element} element to query
     * @return {Integer} Computed content height
     */
    getContentHeight : function(element)
    {
      var Style = qx.bom.element.Style;

      var overflowY = qx.bom.element.Overflow.getY(element);
      var paddingTop = parseInt(Style.get(element, "paddingTop")||"0px", 10);
      var paddingBottom = parseInt(Style.get(element, "paddingBottom")||"0px", 10);

      if (this.__hiddenScrollbars[overflowY])
      {
        return element.clientHeight - paddingTop - paddingBottom;
      }
      else
      {
        if (element.clientHeight >= element.scrollHeight)
        {
          // Scrollbars visible, but not needed? We need to substract both paddings
          return Math.max(element.clientHeight, element.scrollHeight) - paddingTop - paddingBottom;
        }
        else
        {
          // Scrollbars visible and needed. We just remove the top padding,
          // as the bottom padding is not respected in rendering.
          var height = element.scrollHeight - paddingTop;

          // IE renders the paddingBottom as well with scrollbars on
          if (qx.core.Environment.get("engine.name") == "mshtml" &&
             qx.core.Environment.get("engine.version") == 6)
          {
            height -= paddingBottom;
          }

          return height;
        }
      }
    },


    /**
     * Returns the rendered content size of the given element.
     *
     * @param element {Element} element to query
     * @return {Map} map containing the content width and height of the element
     */
    getContentSize : function(element)
    {
      return {
        width: this.getContentWidth(element),
        height: this.getContentHeight(element)
      };
    }
  }
});