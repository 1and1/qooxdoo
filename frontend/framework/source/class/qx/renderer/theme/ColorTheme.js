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

#module(color)

************************************************************************ */

qx.OO.defineClass("qx.renderer.theme.ColorTheme", qx.core.Object,
function(vTitle)
{
  qx.core.Object.call(this);

  this._compiledColors = {};
  this.setTitle(vTitle);
  this._register();
});





/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "title", type : qx.constant.Type.STRING, allowNull : false, defaultValue : qx.constant.Core.EMPTY });





/*
---------------------------------------------------------------------------
  DATA
---------------------------------------------------------------------------
*/

qx.Proto._needsCompilation = true;
qx.Proto._colors = {};




/*
---------------------------------------------------------------------------
  PUBLIC METHODS
---------------------------------------------------------------------------
*/

qx.Proto.getValueByName = function(vName) {
  return this._colors[vName] || qx.constant.Core.EMPTY;
}

qx.Proto.getStyleByName = function(vName) {
  return this._compiledColors[vName] || qx.constant.Core.EMPTY;
}






/*
---------------------------------------------------------------------------
  PRIVATE METHODS
---------------------------------------------------------------------------
*/

qx.Proto.compile = function()
{
  if (!this._needsCompilation) {
    return;
  }

  for (var vName in qx.renderer.color.Color.themedNames) {
    this._compileValue(vName);
  }

  this._needsCompilation = false;
}

qx.Proto._compileValue = function(vName)
{
  var v = this._colors[vName];
  this._compiledColors[vName] = v ? qx.renderer.color.Color.rgb2style.apply(this, this._colors[vName]) : vName;
}

qx.Proto._register = function() {
  return qx.manager.object.ColorManager.registerTheme(this);
}






/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  delete this._colors;
  delete this._compiledColors;

  qx.core.Object.prototype.dispose.call(this);
}
