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

/* ************************************************************************

#asset(qx/icon/Oxygen/48/apps/video-player.png)
#asset(qx/icon/Oxygen/48/apps/internet-mail.png)
#asset(qx/icon/Oxygen/48/apps/internet-web-browser.png)
#asset(qx/icon/Oxygen/48/apps/photo-album.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.TabView_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      var boxLayout = new qx.ui.layout.HBox();
      boxLayout.setSpacing(10);

      var container = new qx.ui.container.Composite(boxLayout);
      container.setPadding(20);
      container.setLayout(boxLayout);

      this.getRoot().addMain(container);

      tabView = new qx.ui.tabview.TabView();
      tabView.setWidth(500);
      container.add(tabView);

      ////////////////// TEST PAGE 1 ////////////////////
      var page1 = new qx.ui.tabview.Page("Layout", "icon/16/apps/utilities-terminal.png");
      page1.setLayout(new qx.ui.layout.VBox());
      page1.add(new qx.ui.basic.Label("Layout-Settings"));
      tabView.add(page1);

      // bar top stuff
      var barTopButton = new qx.ui.form.CheckBox("Bar on top");
      barTopButton.setChecked(true);
      barTopButton.addListener("changeChecked", function(event) {
        this.setPlaceBarOnTop(event.getValue());
      }, tabView);
      page1.add(barTopButton);

      // bar left stuff
      var barLeftButton = new qx.ui.form.CheckBox("Bar left");
      barLeftButton.setChecked(true);
      barLeftButton.addListener("changeChecked", function(event) {
        this.setAlignTabsToLeft(event.getValue());
      }, tabView);
      page1.add(barLeftButton);



      ////////////////// TEST PAGE 2 ////////////////////
      var page2 = new qx.ui.tabview.Page("Notes", "icon/16/apps/accessories-notes.png");
      page2.setLayout(new qx.ui.layout.VBox());
      page2.add(new qx.ui.basic.Label("Notes..."));
      tabView.add(page2);


      ////////////////// TEST PAGE 3 ////////////////////
      var page3 = new qx.ui.tabview.Page("Calculator", "icon/16/apps/accessories-calculator.png");
      page3.setLayout(new qx.ui.layout.VBox());
      page3.add(new qx.ui.basic.Label("Calculator..."));
      tabView.add(page3);
      page3.setEnabled(false);


      ////////////////// TEST PAGE 4 ////////////////////
      var page4 = new qx.ui.tabview.Page("Help", "icon/16/apps/help-browser.png");
      page4.setLayout(new qx.ui.layout.VBox());
      page4.add(new qx.ui.basic.Label("Help..."));
      tabView.add(page4);

      // show the first page
      tabView.showPage(page1);
    }
  }
});
