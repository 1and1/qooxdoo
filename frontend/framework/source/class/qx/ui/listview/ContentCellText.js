/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_listview)

************************************************************************ */

qx.OO.defineClass("qx.ui.listview.ContentCellText", qx.ui.embed.TextEmbed,
function(vText)
{
  qx.ui.embed.TextEmbed.call(this, vText);

  this.setStyleProperty("whiteSpace", "nowrap");
  this.setStyleProperty("textOverflow", "ellipsis");

  this.setSelectable(false);
});

qx.OO.changeProperty({ name : "appearance", type : "string", defaultValue : "list-view-content-cell-text" });

qx.ui.listview.ContentCellText.empty = {
  text : ""
}
