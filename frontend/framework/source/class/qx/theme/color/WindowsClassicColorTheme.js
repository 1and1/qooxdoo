/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(colorthemes)
#require(qx.manager.object.SingletonManager)

************************************************************************ */


qx.OO.defineClass("qx.theme.color.WindowsClassicColorTheme", qx.renderer.theme.ColorTheme,
function() {
  qx.renderer.theme.ColorTheme.call(this, "Windows Classic");
});





/*
---------------------------------------------------------------------------
  DEFINE COLORS
---------------------------------------------------------------------------
*/

qx.Proto._colors = qx.lang.Object.carefullyMergeWith({
  activeborder : [ 212,208,200 ],
  activecaption : [ 10,36,106 ],
  appworkspace : [ 128,128,128 ],
  background : [ 58,110,165 ],
  buttonface : [ 212,208,200 ],
  buttonhighlight : [ 255,255,255 ],
  buttonshadow : [ 128,128,128 ],
  buttontext : [ 0,0,0 ],
  captiontext : [ 255,255,255 ],
  graytext : [ 128,128,128 ],
  highlight : [ 10,36,106 ],
  highlighttext : [ 255,255,255 ],
  inactiveborder : [ 212,208,200 ],
  inactivecaption : [ 128,128,128 ],
  inactivecaptiontext : [ 212,208,200 ],
  infobackground : [ 255,255,225 ],
  infotext : [ 0,0,0 ],
  menu : [ 212,208,200 ],
  menutext : [ 0,0,0 ],
  scrollbar : [ 212,208,200 ],
  threeddarkshadow : [ 64,64,64 ],
  threedface : [ 212,208,200 ],
  threedhighlight : [ 255,255,255 ],
  threedlightshadow : [ 212,208,200 ],
  threedshadow : [ 128,128,128 ],
  window : [ 255,255,255 ],
  windowframe : [ 0,0,0 ],
  windowtext : [ 0,0,0 ]
}, qx.Super.prototype._colors);






/*
---------------------------------------------------------------------------
  DEFER SINGLETON INSTANCE
---------------------------------------------------------------------------
*/

qx.manager.object.SingletonManager.add(qx.theme.color.WindowsClassicColorTheme);
