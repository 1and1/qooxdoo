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
     * Martin Wittemann (martinwittemann)
     * Fabian Jakobs (fjakobs)

************************************************************************ */
qx.Class.define("showcase.page.form.Content",
{
  extend : showcase.AbstractContent,
  
  
  construct : function(page) {
    this.base(arguments, page);
    
    this.setView(this.__createView());
  },
  
  
  members : {
    __createView : function() 
    {
      var view = new qx.ui.window.Desktop(new qx.ui.window.Manager());
      
      var win = new qx.ui.window.Window("depp");
      view.add(win);
      win.open();
      
      return view;
    }
  }
});