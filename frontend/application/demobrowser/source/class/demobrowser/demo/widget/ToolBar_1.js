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
     * Martin Wittemann (martinwitttemann)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/Oxygen/22/actions/*)
#asset(qx/icon/Oxygen/32/actions/*)
#asset(qx/icon/Oxygen/48/actions/*)

************************************************************************ */

qx.Class.define("demobrowser.demo.widget.ToolBar_1",
{
  extend : qx.application.Standalone,

  members :
  {
    main: function()
    {
      this.base(arguments);

      // create the main layout
      var toolbarContentLayout = new qx.ui.layout.HBox();
      toolbarContentLayout.setSpacing(10);

      // create a container for the main layout and set the main layout
      var mainContainer = new qx.ui.core.Widget();
      mainContainer.setPadding(20);
      mainContainer.setLayout(toolbarContentLayout);
      // add the main container to the root
      this.getRoot().add(mainContainer, 0, 30, 0);

      ///////////////////////////////////////////////////////////////
      // Toolbar stuff
      ///////////////////////////////////////////////////////////////
      // create the toolbar
      toolbar = new qx.ui.toolbar.ToolBar();
      toolbarContentLayout.add(toolbar, {flex: 1});

      // create and add Part 1 to the toolbar
      var part1 = new qx.ui.toolbar.Part();
      var newButton = new qx.ui.toolbar.Button("New", "icon/22/actions/document-new.png");
      part1.add(newButton);
      part1.add(new qx.ui.toolbar.Separator());
      part1.add(new qx.ui.toolbar.Button("Copy", "icon/22/actions/edit-copy.png"));
      part1.add(new qx.ui.toolbar.Button("Cut", "icon/22/actions/edit-cut.png"));
      part1.add(new qx.ui.toolbar.Button("Paste", "icon/22/actions/edit-paste.png"));
      toolbar.add(part1);

      // create and add Part 2 to the toolbar
      var part2 = new qx.ui.toolbar.Part();
      part2.add(new qx.ui.toolbar.CheckBox("Toggle", "icon/22/actions/format-text-underline.png"));
      toolbar.add(part2);

      // create and add Part 3 to the toolbar
      var part3 = new qx.ui.toolbar.Part();
      var radioButton1 = new qx.ui.toolbar.RadioButton("Left", "icon/22/actions/format-justify-left.png");
      var radioButton2 = new qx.ui.toolbar.RadioButton("Center", "icon/22/actions/format-justify-center.png");
      var radioButton3 = new qx.ui.toolbar.RadioButton("Right", "icon/22/actions/format-justify-right.png");
      part3.add(radioButton1);
      part3.add(radioButton2);
      part3.add(radioButton3);
      toolbar.add(part3);
      // Manager for part 3 (Radio example)
      var manager = new qx.ui.core.RadioManager();
      radioButton1.setManager(manager);
      radioButton2.setManager(manager);
      radioButton3.setManager(manager);
      
      // create Help Button and add it to the toolbar
      toolbar.addSpacer();
      toolbar.add(new qx.ui.toolbar.Button("Help", "icon/22/actions/help-contents.png"));
      
      
      
      
      ///////////////////////////////////////////////////////////////
      // Controll stuff
      ///////////////////////////////////////////////////////////////
      // Create and add the grid
      var controlGrid = new qx.ui.layout.Grid();
      controlGrid.setSpacing(10);
      var controlContainer = new qx.ui.core.Widget();
      controlContainer.setLayout(controlGrid);
      controlContainer.setPadding(20);
      this.getRoot().add(controlContainer, 0, 100);
      
      //////////////////////// icon size stuff
      // create the buttons
      var size22Button = new qx.ui.form.RadioButton("22px");
      size22Button.setChecked(true);
      var size32Button = new qx.ui.form.RadioButton("32px");
      var size48Button = new qx.ui.form.RadioButton("48px");
      // create the radio manager and add the buttons
      var sizeManager = new qx.ui.core.RadioManager();
      sizeManager.add(size22Button, size32Button, size48Button);
      // add the buttons to the grid
      controlGrid.add(new qx.ui.basic.Label("Icon Size:"), 0, 0);
      controlGrid.add(size22Button,0 ,1);
      controlGrid.add(size32Button,0 ,2);
      controlGrid.add(size48Button,0 ,3);
      // register the handler
      sizeManager.addListener("changeSelected", function(e) {
        if (e.getValue() == size22Button) {
          newButton.setIcon("icon/22/actions/document-new.png");
        } else if (e.getValue() == size32Button) {
          newButton.setIcon("icon/32/actions/document-new.png");
        } else if (e.getValue() == size48Button) {
          newButton.setIcon("icon/48/actions/document-new.png");
        }
      }, this); 
      
      //////////////////////// Show stuff
      // create the buttons
      var showBothButton = new qx.ui.form.RadioButton("Label and Icon");
      showBothButton.setChecked(true);
      var showIconButton = new qx.ui.form.RadioButton("Icon only");
      var showLabelButton = new qx.ui.form.RadioButton("Label only");
      // create the radio manager and add the buttons
      var showManager = new qx.ui.core.RadioManager();
      showManager.add(showBothButton, showIconButton, showLabelButton);
      // add the buttons to the grid
      controlGrid.add(new qx.ui.basic.Label("Show:"),1 ,0);
      controlGrid.add(showBothButton,1 ,1);
      controlGrid.add(showIconButton,1 ,2);
      controlGrid.add(showLabelButton,1 ,3);  
      // register the handler   
      showManager.addListener("changeSelected", function(e) {
        if (e.getValue() == showBothButton) {
          toolbar.setShow("both");
        } else if (e.getValue() == showIconButton) {
          toolbar.setShow("icon");
        } else if (e.getValue() == showLabelButton) {
          toolbar.setShow("label");
        }
      }, this);
    
    }
  }
});
