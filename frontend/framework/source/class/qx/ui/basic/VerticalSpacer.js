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

#module(uibasic)

************************************************************************ */

qx.OO.defineClass("qx.ui.basic.VerticalSpacer", qx.ui.basic.Terminator,
function()
{
  qx.ui.basic.Terminator.call(this);

  this.setHeight(qx.constant.Core.FLEX);
});
