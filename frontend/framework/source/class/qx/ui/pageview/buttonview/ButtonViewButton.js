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

#module(ui_buttonview)

************************************************************************ */

qx.OO.defineClass("qx.ui.pageview.buttonview.ButtonViewButton", qx.ui.pageview.AbstractPageViewButton,
function(vText, vIcon, vIconWidth, vIconHeight, vFlash) {
  qx.ui.pageview.AbstractPageViewButton.call(this, vText, vIcon, vIconWidth, vIconHeight, vFlash);
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "bar-view-button" });






/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onkeypress = function(e)
{
  switch(this.getView().getBarPosition())
  {
    case qx.constant.Layout.ALIGN_TOP:
    case qx.constant.Layout.ALIGN_BOTTOM:
      switch(e.getKeyIdentifier())
      {
        case "Left":
          var vPrevious = true;
          break;

        case "Right":
          var vPrevious = false;
          break;

        default:
          return;
      }

      break;

    case qx.constant.Layout.ALIGN_LEFT:
    case qx.constant.Layout.ALIGN_RIGHT:
      switch(e.getKeyIdentifier())
      {
        case "Up":
          var vPrevious = true;
          break;

        case "Down":
          var vPrevious = false;
          break;

        default:
          return;
      }

      break;

    default:
      return;
  }

  var vChild = vPrevious ? this.isFirstChild() ? this.getParent().getLastChild() : this.getPreviousSibling() : this.isLastChild() ? this.getParent().getFirstChild() : this.getNextSibling();

  // focus next/previous button
  vChild.setFocused(true);

  // and naturally also check it
  vChild.setChecked(true);
}









/*
---------------------------------------------------------------------------
  APPEARANCE ADDITIONS
---------------------------------------------------------------------------
*/

qx.Proto._applyStateAppearance = function()
{
  var vPos = this.getView().getBarPosition();

  this._states.barLeft = vPos === qx.constant.Layout.ALIGN_LEFT;
  this._states.barRight = vPos === qx.constant.Layout.ALIGN_RIGHT;
  this._states.barTop = vPos === qx.constant.Layout.ALIGN_TOP;
  this._states.barBottom = vPos === qx.constant.Layout.ALIGN_BOTTOM;

  qx.ui.pageview.AbstractPageViewButton.prototype._applyStateAppearance.call(this);
}
