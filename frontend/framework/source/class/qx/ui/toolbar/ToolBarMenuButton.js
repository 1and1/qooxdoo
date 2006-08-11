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


************************************************************************ */

qx.OO.defineClass("qx.ui.toolbar.ToolBarMenuButton", qx.ui.toolbar.ToolBarButton,
function(vText, vMenu, vIcon, vIconWidth, vIconHeight, vFlash)
{
  qx.ui.toolbar.ToolBarButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);

  if (qx.util.Validation.isValidObject(vMenu)) {
    this.setMenu(vMenu);
  }

  /*
  this._menuButton = new qx.ui.basic.Image("widget/arrows/down_small.gif");
  this._menuButton.setAnonymous(true);
  this.addAtEnd(this._menuButton);
  */
});




/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.addProperty({ name : "menu", type : qx.constant.Type.OBJECT, instance : "qx.ui.menu.Menu" });
qx.OO.addProperty({ name : "direction", type : qx.constant.Type.STRING, allowNull : false, possibleValues : [ "up", "down" ], defaultValue : "down" });




/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getParentToolBar = function()
{
  var vParent = this.getParent();

  if (vParent instanceof qx.ui.toolbar.ToolBarPart) {
    vParent = vParent.getParent();
  }

  return vParent instanceof qx.ui.toolbar.ToolBar ? vParent : null;
}

qx.Proto._showMenu = function(vFromKeyEvent)
{
  var vMenu = this.getMenu();

  if (vMenu)
  {
    // Caching common stuff
    var vMenuParent = vMenu.getParent();
    var vMenuParentElement = vMenuParent.getElement();
    var vButtonElement = this.getElement();
    var vButtonHeight = qx.dom.DomDimension.getBoxHeight(vButtonElement);

    // Apply X-Location
    var vMenuParentLeft = qx.dom.DomLocation.getPageBoxLeft(vMenuParentElement);
    var vButtonLeft = qx.dom.DomLocation.getPageBoxLeft(vButtonElement);

    vMenu.setLeft(vButtonLeft - vMenuParentLeft);

    // Apply Y-Location
    switch(this.getDirection())
    {
      case "up":
        var vBodyHeight = qx.dom.DomDimension.getInnerHeight(document.body);
        var vMenuParentBottom = qx.dom.DomLocation.getPageBoxBottom(vMenuParentElement);
        var vButtonBottom = qx.dom.DomLocation.getPageBoxBottom(vButtonElement);

        vMenu.setBottom(vButtonHeight + (vBodyHeight - vButtonBottom) - (vBodyHeight - vMenuParentBottom));
        vMenu.setTop(null);
        break;

      case "down":
        var vButtonTop = qx.dom.DomLocation.getPageBoxTop(vButtonElement);

        vMenu.setTop(vButtonTop + vButtonHeight);
        vMenu.setBottom(null);
        break;
    }

    this.addState(qx.ui.form.Button.STATE_PRESSED);

    // If this show is called from a key event occured, we want to highlight
    // the first menubutton inside.
    if (vFromKeyEvent) {
      vMenu.setHoverItem(vMenu.getFirstActiveChild());
    }

    vMenu.show();
  }
}

qx.Proto._hideMenu = function()
{
  var vMenu = this.getMenu();

  if (vMenu) {
    vMenu.hide();
  }
}





/*
---------------------------------------------------------------------------
  MODIFIERS
---------------------------------------------------------------------------
*/

qx.Proto._modifyMenu = function(propValue, propOldValue, propData)
{
  if (propOldValue)
  {
    propOldValue.setOpener(null);

    propOldValue.removeEventListener(qx.constant.Event.APPEAR, this._onmenuappear, this);
    propOldValue.removeEventListener(qx.constant.Event.DISAPPEAR, this._onmenudisappear, this);
  }

  if (propValue)
  {
    propValue.setOpener(this);

    propValue.addEventListener(qx.constant.Event.APPEAR, this._onmenuappear, this);
    propValue.addEventListener(qx.constant.Event.DISAPPEAR, this._onmenudisappear, this);
  }

  return true;
}






/*
---------------------------------------------------------------------------
  EVENTS: MOUSE
---------------------------------------------------------------------------
*/

qx.Proto._onmousedown = function(e)
{
  if (e.getTarget() != this || !e.isLeftButtonPressed()) {
    return;
  }

  this.hasState(qx.ui.form.Button.STATE_PRESSED) ? this._hideMenu() : this._showMenu();
}

qx.Proto._onmouseup = function(e) {}

qx.Proto._onmouseout = function(e)
{
  if (e.getTarget() != this) {
    return;
  }

  this.removeState(qx.ui.core.Widget.STATE_OVER);
}

qx.Proto._onmouseover = function(e)
{
  var vToolBar = this.getParentToolBar();

  if (vToolBar)
  {
    var vMenu = this.getMenu();

    switch(vToolBar.getOpenMenu())
    {
      case null:
      case vMenu:
        break;

      default:
        // hide other menus
        qx.manager.object.MenuManager.update();

        // show this menu
        this._showMenu();
    }
  }

  return qx.ui.toolbar.ToolBarButton.prototype._onmouseover.call(this, e);
}






/*
---------------------------------------------------------------------------
  EVENTS: MENU
---------------------------------------------------------------------------
*/

qx.Proto._onmenuappear = function(e)
{
  var vToolBar = this.getParentToolBar();

  if (!vToolBar) {
    return;
  }

  var vMenu = this.getMenu();

  vToolBar.setOpenMenu(vMenu);
}

qx.Proto._onmenudisappear = function(e)
{
  var vToolBar = this.getParentToolBar();

  if (!vToolBar) {
    return;
  }

  var vMenu = this.getMenu();

  if (vToolBar.getOpenMenu() == vMenu) {
    vToolBar.setOpenMenu(null);
  }
}
