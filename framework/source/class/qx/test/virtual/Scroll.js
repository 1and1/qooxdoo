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
   * Jonathan Weiß (jonathan_rass)

************************************************************************ */

qx.Class.define("qx.test.virtual.Scroll",
{
  extend : qx.test.ui.LayoutTestCase,

  members :
  {

    setUp : function()
    {
      
      qx.Class.define("qx.test.virtual.testLayer",
      {
        extend : qx.ui.virtual.layer.AbstractWidget,

        members :
        {

          _poolWidget: function(widget) {
            this.debug(arguments)
            this._pool.push(widget);
          },

          _getWidget : function(row, column)
          {
            this.debug(arguments)
            var widget = this._pool.pop() || new qx.ui.core.Widget;
            return widget;
          },

          _configureWidget : function(widget, row, column)
          {
            this.debug(arguments)
            widget.setUserData("row", row);
            widget.setUserData("column", column);
          }

        }
      });

      this.__scroller = new qx.ui.virtual.core.Scroller(50, 50, 10, 250);
      this.__testLayer = new qx.test.virtual.testLayer;
      this.__scroller.pane.setWidth(450);
      this.__scroller.pane.addLayer(this.__testLayer);

      this.getRoot().add(this.__scroller, {left : 20, top : 10});
    },
    
    testScrollDown : function()
    {
      this.__scroller.pane.setScrollY(500);
      this.__scroller.pane.fullUpdate();
    }




  }
});
