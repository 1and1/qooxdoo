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
#module(theme_color)

************************************************************************ */

/**
 * Windows royale color theme
 */
qx.Class.define("qx.theme.color.WindowsRoyale",
{
  type : "singleton",
  extend : qx.renderer.theme.ColorTheme,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function() {
    qx.renderer.theme.ColorTheme.call(this, "Windows Royale");
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
      DEFINE COLORS
    ---------------------------------------------------------------------------
    */

    _colors : qx.lang.Object.carefullyMergeWith(
    {
      activeborder        : [ 212, 208, 200 ],
      activecaption       : [ 51, 94, 168 ],
      appworkspace        : [ 128, 128, 128 ],
      background          : [ 0, 0, 64 ],
      buttonface          : [ 235, 233, 237 ],
      buttonhighlight     : [ 255, 255, 255 ],
      buttonshadow        : [ 167, 166, 170 ],
      buttontext          : [ 0, 0, 0 ],
      captiontext         : [ 255, 255, 255 ],
      graytext            : [ 167, 166, 170 ],
      highlight           : [ 51, 94, 168 ],
      highlighttext       : [ 255, 255, 255 ],
      inactiveborder      : [ 212, 208, 200 ],
      inactivecaption     : [ 111, 161, 217 ],
      inactivecaptiontext : [ 255, 255, 255 ],
      infobackground      : [ 255, 255, 225 ],
      infotext            : [ 0, 0, 0 ],
      menu                : [ 255, 255, 255 ],
      menutext            : [ 0, 0, 0 ],
      scrollbar           : [ 212, 208, 200 ],
      threeddarkshadow    : [ 133, 135, 140 ],
      threedface          : [ 235, 233, 237 ],
      threedhighlight     : [ 255, 255, 255 ],
      threedlightshadow   : [ 220, 223, 228 ],
      threedshadow        : [ 167, 166, 170 ],
      window              : [ 255, 255, 255 ],
      windowframe         : [ 0, 0, 0 ],
      windowtext          : [ 0, 0, 0 ]
    },
    qx.renderer.theme.ColorTheme.prototype._colors)
  },

  defer : function(clazz)
  {
    qx.manager.object.ColorManager.getInstance().registerColorTheme(clazz);
  }

});
