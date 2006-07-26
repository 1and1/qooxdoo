/* ************************************************************************

   qooxdoo - the new era of web development

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany
     http://www.1und1.de | http://www.1and1.com
     All rights reserved

   License:
     LGPL 2.1: http://creativecommons.org/licenses/LGPL/2.1/

   Internet:
     * http://qooxdoo.org

   Authors:
     * Sebastian Werner (wpbasti)
       <sebastian dot werner at 1und1 dot de>
     * Andreas Ecker (ecker)
       <andreas dot ecker at 1und1 dot de>

************************************************************************ */

/* ************************************************************************

#module(menu)
#use(qx.dom.DomDimension)
#use(qx.dom.DomLocation)

************************************************************************ */

qx.OO.defineClass("qx.ui.menu.Menu", qx.ui.popup.Popup, 
function()
{
  qx.ui.popup.Popup.call(this);


  // ************************************************************************
  //   LAYOUT
  // ************************************************************************

  var l = this._layout = new qx.ui.menu.MenuLayout;
  this.add(l);


  // ************************************************************************
  //   TIMER
  // ************************************************************************
  this._openTimer = new qx.client.Timer(this.getOpenInterval());
  this._openTimer.addEventListener(qx.constant.Event.INTERVAL, this._onopentimer, this);

  this._closeTimer = new qx.client.Timer(this.getCloseInterval());
  this._closeTimer.addEventListener(qx.constant.Event.INTERVAL, this._onclosetimer, this);


  // ************************************************************************
  //   EVENTS
  // ************************************************************************

  this.addEventListener(qx.constant.Event.MOUSEOVER, this._onmouseover);
  this.addEventListener(qx.constant.Event.MOUSEMOVE, this._onmouseover);
  this.addEventListener(qx.constant.Event.MOUSEOUT, this._onmouseout);

  this.addEventListener(qx.constant.Event.KEYDOWN, this._onkeydown);


  // ************************************************************************
  //   REMAPPING
  // ************************************************************************

  this.remapChildrenHandlingTo(this._layout);
});

qx.Proto._remappingChildTable = [ "add", "remove", "addAt", "addAtBegin", "addAtEnd", "removeAt", "addBefore", "addAfter", "removeAll", "getFirstChild", "getFirstActiveChild", "getLastChild", "getLastActiveChild" ];



/*
---------------------------------------------------------------------------
  PROPERTIES
---------------------------------------------------------------------------
*/

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "menu" });

qx.OO.addProperty({ name : "iconContentGap", type : qx.constant.Type.NUMBER, defaultValue : 4 });
qx.OO.addProperty({ name : "labelShortcutGap", type : qx.constant.Type.NUMBER, defaultValue : 10 });
qx.OO.addProperty({ name : "contentArrowGap", type : qx.constant.Type.NUMBER, defaultValue : 8 });
qx.OO.addProperty({ name : "contentNonIconPadding", type : qx.constant.Type.NUMBER, defaultValue : 20 });
qx.OO.addProperty({ name : "contentNonArrowPadding", type : qx.constant.Type.NUMBER, defaultValue : 8 });

qx.OO.addProperty({ name : "hoverItem", type : qx.constant.Type.OBJECT });
qx.OO.addProperty({ name : "openItem", type : qx.constant.Type.OBJECT });
qx.OO.addProperty({ name : "opener", type : qx.constant.Type.OBJECT });
qx.OO.addProperty({ name : "parentMenu", type : qx.constant.Type.OBJECT });

qx.OO.addProperty({ name : "fastReopen", type : qx.constant.Type.BOOLEAN, defaultValue : false });
qx.OO.addProperty({ name : "openInterval", type : qx.constant.Type.NUMBER, defaultValue : 250 });
qx.OO.addProperty({ name : "closeInterval", type : qx.constant.Type.NUMBER, defaultValue : 250 });

qx.OO.addProperty({ name : "subMenuHorizontalOffset", type : qx.constant.Type.NUMBER, defaultValue : -3 });
qx.OO.addProperty({ name : "subMenuVerticalOffset", type : qx.constant.Type.NUMBER, defaultValue : -2 });

qx.OO.addProperty({ name : "indentShortcuts", type : qx.constant.Type.BOOLEAN, defaultValue : true });






/*
---------------------------------------------------------------------------
  UTILITIES
---------------------------------------------------------------------------
*/

qx.Proto.getLayout = function() {
  return this._layout;
}







/*
---------------------------------------------------------------------------
  APPEAR/DISAPPEAR
---------------------------------------------------------------------------
*/

qx.Proto._beforeAppear = function()
{
  // Intentionally bypass superclass and call super.super._beforeAppear
  qx.ui.layout.CanvasLayout.prototype._beforeAppear.call(this);

  // register to menu manager as active widget
  qx.manager.object.MenuManager.add(this);

  // zIndex handling
  this.bringToFront();

  //setup as global active widget
  this._makeActive();
}

qx.Proto._beforeDisappear = function()
{
  // Intentionally bypass superclass and call super.super._beforeDisappear
  qx.ui.layout.CanvasLayout.prototype._beforeDisappear.call(this);

  // deregister as opened from qx.manager.object.MenuManager
  qx.manager.object.MenuManager.remove(this);

  // reset global active widget
  this._makeInactive();

  // reset properties on close
  this.setHoverItem(null);
  this.setOpenItem(null);

  // be sure that the opener button gets the correct state
  var vOpener = this.getOpener();
  if (vOpener) {
    vOpener.removeState(qx.ui.form.Button.STATE_PRESSED);
  }
}






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyHoverItem = function(propValue, propOldValue, propData)
{
  if (propOldValue) {
    propOldValue.removeState(qx.ui.core.Widget.STATE_OVER);
  }

  if (propValue) {
    propValue.addState(qx.ui.core.Widget.STATE_OVER);
  }

  return true;
}

qx.Proto._modifyOpenItem = function(propValue, propOldValue, propData)
{
  var vMakeActive = false;

  if (propOldValue)
  {
    var vOldSub = propOldValue.getMenu();

    if (vOldSub)
    {
      vOldSub.setParentMenu(null);
      vOldSub.setOpener(null);
      vOldSub.hide();
    }
  }

  if (propValue)
  {
    var vSub = propValue.getMenu();

    if (vSub)
    {
      vSub.setOpener(propValue);
      vSub.setParentMenu(this);

      var pl = propValue.getElement();
      var el = this.getElement();

      vSub.setTop(qx.dom.DomLocation.getPageBoxTop(pl) + this.getSubMenuVerticalOffset());
      vSub.setLeft(qx.dom.DomLocation.getPageBoxLeft(el) + qx.dom.DomDimension.getBoxWidth(el) + this.getSubMenuHorizontalOffset());

      vSub.show();

      qx.ui.core.Widget.flushGlobalQueues();
    }
  }

  return true;
}








/*
---------------------------------------------------------------------------
  LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
  CREATE VARIABLES
---------------------------------------------------------------------------
*/

qx.OO.addCachedProperty({ name : "maxIconWidth" });
qx.OO.addCachedProperty({ name : "maxLabelWidth" });
qx.OO.addCachedProperty({ name : "maxLabelWidthIncShortcut" });
qx.OO.addCachedProperty({ name : "maxShortcutWidth" });
qx.OO.addCachedProperty({ name : "maxArrowWidth" });
qx.OO.addCachedProperty({ name : "maxContentWidth" });

qx.OO.addCachedProperty({ name : "iconPosition", defaultValue : 0 });
qx.OO.addCachedProperty({ name : "labelPosition" });
qx.OO.addCachedProperty({ name : "shortcutPosition" });
qx.OO.addCachedProperty({ name : "arrowPosition" });

qx.OO.addCachedProperty({ name : "menuButtonNeededWidth" });






/*
---------------------------------------------------------------------------
  LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
  MAX WIDTH COMPUTERS
---------------------------------------------------------------------------
*/

qx.Proto._computeMaxIconWidth = function()
{
  var ch=this.getLayout().getChildren(), chl=ch.length, chc, m=0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc.hasIcon()) {
      m = Math.max(m, chc.getIconObject().getPreferredBoxWidth());
    }
  }

  return m;
}

qx.Proto._computeMaxLabelWidth = function()
{
  var ch=this.getLayout().getChildren(), chl=ch.length, chc, m=0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc.hasLabel()) {
      m = Math.max(m, chc.getLabelObject().getPreferredBoxWidth());
    }
  }

  return m;
}

qx.Proto._computeMaxLabelWidthIncShortcut = function()
{
  var ch=this.getLayout().getChildren(), chl=ch.length, chc, m=0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc.hasLabel() && chc.hasShortcut()) {
      m = Math.max(m, chc.getLabelObject().getPreferredBoxWidth());
    }
  }

  return m;
}

qx.Proto._computeMaxShortcutWidth = function()
{
  var ch=this.getLayout().getChildren(), chl=ch.length, chc, m=0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc.hasShortcut()) {
      m = Math.max(m, chc.getShortcutObject().getPreferredBoxWidth());
    }
  }

  return m;
}

qx.Proto._computeMaxArrowWidth = function()
{
  var ch=this.getLayout().getChildren(), chl=ch.length, chc, m=0;

  for (var i=0; i<chl; i++)
  {
    chc = ch[i];

    if (chc.hasMenu()) {
      m = Math.max(m, chc.getArrowObject().getPreferredBoxWidth());
    }
  }

  return m;
}

qx.Proto._computeMaxContentWidth = function()
{
  var vSum;

  var lw = this.getMaxLabelWidth();
  var sw = this.getMaxShortcutWidth();

  if (this.getIndentShortcuts())
  {
    var vTemp = sw+this.getMaxLabelWidthIncShortcut();

    if (sw > 0) {
      vTemp += this.getLabelShortcutGap();
    }

    vSum = Math.max(lw, vTemp);
  }
  else
  {
    vSum = lw + sw;

    if (lw > 0 && sw > 0) {
      vSum += this.getLabelShortcutGap();
    }
  }

  return vSum;
}







/*
---------------------------------------------------------------------------
  LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
  POSITION COMPUTERS
---------------------------------------------------------------------------
*/

qx.Proto._computeIconPosition = function() {
  return 0;
}

qx.Proto._computeLabelPosition = function()
{
  var v = this.getMaxIconWidth();
  return v > 0 ? v + this.getIconContentGap() : this.getContentNonIconPadding();
}

qx.Proto._computeShortcutPosition = function() {
  return this.getLabelPosition() + this.getMaxContentWidth() - this.getMaxShortcutWidth();
}

qx.Proto._computeArrowPosition = function()
{
  var v = this.getMaxContentWidth();
  return this.getLabelPosition() + (v > 0 ? v + this.getContentArrowGap() : v);
}







/*
---------------------------------------------------------------------------
  LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
  INVALIDATION OF CACHE
---------------------------------------------------------------------------
*/

qx.Proto._invalidateMaxIconWidth = function()
{
  this._cachedMaxIconWidth = null;

  this._invalidateLabelPosition();
  this._invalidateMenuButtonNeededWidth();
}

qx.Proto._invalidateMaxLabelWidth = function()
{
  this._cachedMaxLabelWidth = null;

  this._invalidateShortcutPosition();
  this._invalidateMaxLabelWidthIncShortcut();
  this._invalidateMaxContentWidth();
  this._invalidateMenuButtonNeededWidth();
}

qx.Proto._invalidateMaxShortcutWidth = function()
{
  this._cachedMaxShortcutWidth = null;

  this._invalidateArrowPosition();
  this._invalidateMaxContentWidth();
  this._invalidateMenuButtonNeededWidth();
}

qx.Proto._invalidateMaxLabelWidth = function()
{
  this._cachedMaxArrowWidth = null;
  this._invalidateMenuButtonNeededWidth();
}

qx.Proto._invalidateLabelPosition = function()
{
  this._cachedLabelPosition = null;
  this._invalidateShortcutPosition();
}

qx.Proto._invalidateShortcutPosition = function()
{
  this._cachedShortcutPosition = null;
  this._invalidateArrowPosition();
}






/*
---------------------------------------------------------------------------
  LOCATIONS AND DIMENSIONS OF CHILDRENS CHILDREN:
  NEEDED WIDTH COMPUTERS
---------------------------------------------------------------------------
*/

qx.Proto._computeMenuButtonNeededWidth = function()
{
  var vSum = 0;

  var vMaxIcon = this.getMaxIconWidth();
  var vMaxContent = this.getMaxContentWidth();
  var vMaxArrow = this.getMaxArrowWidth();

  if (vMaxIcon > 0)
  {
    vSum += vMaxIcon;
  }
  else
  {
    vSum += this.getContentNonIconPadding();
  }

  if (vMaxContent > 0)
  {
    if (vMaxIcon > 0) {
      vSum += this.getIconContentGap();
    }

    vSum += vMaxContent;
  }

  if (vMaxArrow > 0)
  {
    if (vMaxIcon > 0 || vMaxContent > 0) {
      vSum += this.getContentArrowGap();
    }

    vSum += vMaxArrow;
  }
  else
  {
    vSum += this.getContentNonArrowPadding();
  }

  return vSum;
}








/*
---------------------------------------------------------------------------
  EVENT-HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._onmouseover = function(e)
{
  /* ------------------------------
    HANDLE PARENT MENU
  ------------------------------ */

  // look if we have a parent menu
  // if so we need to stop the close event started there
  var vParent = this.getParentMenu();

  if (vParent)
  {
    // stop the close event
    vParent._closeTimer.stop();

    // look if we have a opener, too (normally this should be)
    var vOpener = this.getOpener();

    // then setup it to look hovered
    if (vOpener) {
      vParent.setHoverItem(vOpener);
    }
  }




  /* ------------------------------
    HANDLING FOR HOVERING MYSELF
  ------------------------------ */

  var t = e.getTarget();

  if (t == this)
  {
    this._openTimer.stop();
    this._closeTimer.start();

    this.setHoverItem(null);

    return;
  }




  /* ------------------------------
    HANDLING FOR HOVERING ITEMS
  ------------------------------ */

  var vOpen = this.getOpenItem();

  // if we have a open item
  if (vOpen)
  {
    this.setHoverItem(t);
    this._openTimer.stop();

    // if the new one has also a sub menu
    if (t.hasMenu())
    {
      // check if we should use fast reopen (this will open the menu instantly)
      if (this.getFastReopen())
      {
        this.setOpenItem(t);
        this._closeTimer.stop();
      }

      // otherwise we use the default timer interval
      else
      {
        this._openTimer.start();
      }
    }

    // otherwise start the close timer for the old menu
    else
    {
      this._closeTimer.start();
    }
  }

  // otherwise handle the mouseover and restart the timer
  else
  {
    this.setHoverItem(t);

    // stop timer for the last open request
    this._openTimer.stop();

    // and restart it if the new one has a menu, too
    if (t.hasMenu()) {
      this._openTimer.start();
    }
  }
}

qx.Proto._onmouseout = function(e)
{
  // stop the open timer (for any previous open requests)
  this._openTimer.stop();

  // start the close timer to hide a menu if needed
  var t = e.getTarget();
  if (t != this && t.hasMenu()) {
    this._closeTimer.start();
  }

  // reset the current hover item
  this.setHoverItem(null);
}

qx.Proto._onopentimer = function(e)
{
  // stop the open timer (we need only the first interval)
  this._openTimer.stop();

  // if we have a item which is currently hovered, open it
  var vHover = this.getHoverItem();
  if (vHover && vHover.hasMenu()) {
    this.setOpenItem(vHover);
  }
}

qx.Proto._onclosetimer = function(e)
{
  // stop the close timer (we need only the first interval)
  this._closeTimer.stop();

  // reset the current opened item
  this.setOpenItem(null);
}

/*!
  Wraps key events to target functions
*/
qx.Proto._onkeydown = function(e)
{
  switch(e.getKeyCode())
  {
    case qx.event.type.KeyEvent.keys.up:
      this._onkeydown_up(e);
      break;

    case qx.event.type.KeyEvent.keys.down:
      this._onkeydown_down(e);
      break;

    case qx.event.type.KeyEvent.keys.left:
      this._onkeydown_left(e);
      break;

    case qx.event.type.KeyEvent.keys.right:
      this._onkeydown_right(e);
      break;

    case qx.event.type.KeyEvent.keys.enter:
      this._onkeydown_enter(e);
      break;

    default:
      return;
  }

  // Stop all matching events
  e.preventDefault();
}

qx.Proto._onkeydown_up = function(e)
{
  var vHover = this.getHoverItem();
  var vPrev = vHover ? vHover.isFirstChild() ? this.getLastActiveChild() : vHover.getPreviousActiveSibling([qx.ui.menu.MenuSeparator]) : this.getLastActiveChild();

  this.setHoverItem(vPrev);
}

qx.Proto._onkeydown_down = function(e)
{
  var vHover = this.getHoverItem();
  var vNext = vHover ? vHover.isLastChild() ? this.getFirstActiveChild() : vHover.getNextActiveSibling([qx.ui.menu.MenuSeparator]) : this.getFirstActiveChild();

  this.setHoverItem(vNext);
}

qx.Proto._onkeydown_left = function(e)
{
  var vOpener = this.getOpener();

  // Jump to the "parent" qx.ui.menu.Menu
  if (vOpener instanceof qx.ui.menu.MenuButton)
  {
    var vOpenerParent = this.getOpener().getParentMenu();

    vOpenerParent.setOpenItem(null);
    vOpenerParent.setHoverItem(vOpener);

    vOpenerParent._makeActive();
  }

  // Jump to the previous ToolBarMenuButton
  else if (vOpener instanceof qx.ui.toolbar.ToolBarMenuButton)
  {
    var vToolBar = vOpener.getParentToolBar();

    // change active widget to new button
    this.getFocusRoot().setActiveChild(vToolBar);

    // execute toolbars keydown implementation
    vToolBar._onkeydown(e);
  }
}

qx.Proto._onkeydown_right = function(e)
{
  var vHover = this.getHoverItem();

  if (vHover)
  {
    var vMenu = vHover.getMenu();

    if (vMenu)
    {
      this.setOpenItem(vHover);

      // mark first item in new submenu
      vMenu.setHoverItem(vMenu.getFirstActiveChild());

      return;
    }
  }
  else if (!this.getOpenItem())
  {
    var vFirst = this.getLayout().getFirstActiveChild();

    if (vFirst) {
      vFirst.hasMenu() ? this.setOpenItem(vFirst) : this.setHoverItem(vFirst);
    }
  }

  // Jump to the next ToolBarMenuButton
  var vOpener = this.getOpener();

  if (vOpener instanceof qx.ui.toolbar.ToolBarMenuButton)
  {
    var vToolBar = vOpener.getParentToolBar();

    // change active widget to new button
    this.getFocusRoot().setActiveChild(vToolBar);

    // execute toolbars keydown implementation
    vToolBar._onkeydown(e);
  }
  else if (vOpener instanceof qx.ui.menu.MenuButton && vHover)
  {
    // search for menubar if existing
    // menu -> button -> menu -> button -> menu -> menubarbutton -> menubar

    var vOpenerParent = vOpener.getParentMenu();

    while (vOpenerParent && vOpenerParent instanceof qx.ui.menu.Menu)
    {
      vOpener = vOpenerParent.getOpener();

      if (vOpener instanceof qx.ui.menu.MenuButton)
      {
        vOpenerParent = vOpener.getParentMenu();
      }
      else
      {
        if (vOpener) {
          vOpenerParent = vOpener.getParent();
        }

        break;
      }
    }

    if (vOpenerParent instanceof qx.ui.toolbar.ToolBarPart) {
      vOpenerParent = vOpenerParent.getParent();
    }

    if (vOpenerParent instanceof qx.ui.toolbar.ToolBar)
    {
      // jump to next menubarbutton
      this.getFocusRoot().setActiveChild(vOpenerParent);
      vOpenerParent._onkeydown(e);
    }
  }
}

qx.Proto._onkeydown_enter = function(e)
{
  var vHover = this.getHoverItem();
  if (vHover) {
    vHover.execute();
  }

  qx.manager.object.MenuManager.update();
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

  if (this._layout)
  {
    this._layout.dispose();
    this._layout = null;
  }

  if (this._openTimer)
  {
    this._openTimer.dispose();
    this._openTimer = null;
  }

  if (this._closeTimer)
  {
    this._closeTimer.dispose();
    this._closeTimer = null;
  }

  // Remove event listeners
  this.removeEventListener(qx.constant.Event.MOUSEOVER, this._onmouseover);
  this.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onmouseover);
  this.removeEventListener(qx.constant.Event.MOUSEOUT, this._onmouseout);

  this.removeEventListener(qx.constant.Event.KEYDOWN, this._onkeydown);

  return qx.ui.popup.Popup.prototype.dispose.call(this);
}
