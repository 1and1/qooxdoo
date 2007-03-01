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

#module(theme_color)

************************************************************************ */

/**
 * System color theme
 */
qx.Class.define("qx.theme.color.System",
{
  type : "singleton",
  extend : qx.renderer.theme.ColorTheme,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    qx.renderer.theme.ColorTheme.call(this, "Operating System Default");
  },
  
  defer : function(clazz)
  {
    qx.manager.object.ColorManager.getInstance().registerColorTheme(clazz);    
  }
  
});





