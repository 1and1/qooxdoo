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
   * Fabian Jakobs (fjakobs)

************************************************************************ */

qx.Class.define("qx.ui.virtual.layer.DomPoolTest",
{
  extend : qx.ui.core.Widget,
  
  implement : [qx.ui.virtual.core.ILayer],
  
  construct : function() 
  {
    this.base(arguments);
    this._nodePool = [];
  },
  
  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _nodePool: null,
  
    fullUpdate : function(visibleCells, rowSizes, columnSizes)
    {
      qx.ui.core.queue.Manager.flush();
      var start = new Date();
      var el = this.getContainerElement().getDomElement();
      if (!el) {
        return;
      }
      var childNodes = el.childNodes;
      var i=0;
      el.innerHTML = "";
      
      var Style = qx.bom.element.Style;
      var Attribute = qx.bom.element.Attribute;
        
      var left = 0;
      var top = 0;
      var row = visibleCells.firstRow;
      var col = visibleCells.firstColumn;
      for (var x=0; x<rowSizes.length; x++)
      {
        var left = 0;
        var col = visibleCells.firstColumn;
        for(var y=0; y<columnSizes.length; y++)
        {
          var color = (row+col) % 2 == 0 ? "blue" : "yellow";
          var content = col + "x" + row;
          
          var cell = childNodes[i++];
          if (!cell) {
            var cell = document.createElement("div");
            var doAppend = true;
          }          

          Style.setCss(cell, [
            "position:absolute;",
            "left:", left, "px;",
            "top:", top, "px;",
            "width:", columnSizes[y], "px;",
            "height:", rowSizes[x], "px;"
          ].join(""));

          Attribute.set(cell, "text", content);
          left += columnSizes[y];
          
          if (doAppend) {
            el.appendChild(cell);
          }
        }
        top += rowSizes[x];
        row++;
      }
      
      for (j=i; j<childNodes.length; i++) {
        el.removeChild(childNodes[i]);
      }
      
      this.debug("dom - update: " + (new Date() - start) + "ms");
      var start = new Date();
      qx.ui.core.queue.Manager.flush();
      this.debug("dom - flush: " + (new Date() - start) + "ms");
    },
    
    
    updateLayerWindow : function(visibleCells, lastVisibleCells, rowSizes, columnSizes) {
      this.fullUpdate(visibleCells, rowSizes, columnSizes);
    }
  }
});
