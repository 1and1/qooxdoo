/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)
#module(theme_icon)
#resource(icontheme:icon/VistaInspirate)

************************************************************************ */

/**
 * Vista-Inspirate
 * Author: Alexandre Moore (alexandre.moore@gmail.com)
 * License: GPL & LGPL/EPL
 * Home: http://www.kde-look.org/content/show.php?content=31585
 * Comment: Based on nuoveXT by the same author
 */
qx.Clazz.define("qx.theme.icon.VistaInspirate",
{
  type : "singleton",
  extend : qx.renderer.theme.IconTheme,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    qx.renderer.theme.IconTheme.call(this, "VistaInspirate");

    this.uri = qx.core.Setting.get("qx.resourceUri") + "/icon/VistaInspirate";
  },
  
  defer : function(clazz)
  {
    qx.manager.object.ImageManager.getInstance().registerIconTheme(clazz);    
  }
    
});
