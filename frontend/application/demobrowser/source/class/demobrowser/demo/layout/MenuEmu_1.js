/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Proof of concept that the grid can be used for menus.
 */
qx.Class.define("demobrowser.demo.layout.MenuEmu_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var MenuItem = demobrowser.demo.layout.MenuEmu_1_MenuItem;
      var Menu = demobrowser.demo.layout.MenuEmu_1_Menu;

      this.getRoot().setPadding(20);

      var docLayout = new qx.ui.layout.Grid();
      docLayout.setColumnFlex(0, 0);
      docLayout.setSpacing(20);

      var menu = new Menu();
      menu.add(new MenuItem("New", "Ctrl-N"));
      menu.add(new MenuItem("Close", "Ctrl-W"));
      menu.add(new MenuItem("Save", "Ctrl-S"));
      menu.add(new MenuItem("Save as"));
      menu.add(new MenuItem("Abracadabra"));
      docLayout.add(menu, 0, 0);

      var menu = new Menu();
      menu.add(new MenuItem("New", "Ctrl-N"));
      menu.add(new MenuItem("Abracadabra -  very long text"));
      menu.add(new MenuItem("Close", "Ctrl-W"));
      menu.add(new MenuItem("Save", "Ctrl-S"));
      menu.add(new MenuItem("Save as"));
      docLayout.add(menu, 0, 1);

      var menu = new Menu();
      menu.add(new MenuItem("New", "Ctrl-N"));
      menu.add(new MenuItem("Save", "Ctrl-S"));
      menu.add(new MenuItem("Save as"));
      menu.add(new MenuItem("Close ...", "Ctrl-W"));
      docLayout.add(menu, 1, 0);

      var container = new qx.ui.core.Widget();
      container.setLayout(docLayout);

      this.getRoot().add(container, 0, 0);
    }
  }
});
