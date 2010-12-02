/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2010 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Christian Hagendorn (chris_schmidt)

************************************************************************ */

/* ************************************************************************

#asset(qx/icon/${qx.icontheme}/16/categories/system.png)
#asset(qx/icon/${qx.icontheme}/16/categories/office.png)
#asset(qx/icon/${qx.icontheme}/16/emotes/face-laugh.png)

************************************************************************ */

qx.Class.define("demobrowser.demo.virtual.GroupedList",
{
  extend : qx.application.Standalone,

  members :
  {
    __list : null,
    
    __listGroupedByName : null,
    
    __listGroupedByGroup : null,
  
    main: function()
    {
      this.base(arguments);

      var container = new qx.ui.container.Composite(new qx.ui.layout.HBox(20)); 
      this.getRoot().add(container, {top: 120, left: 20, right: 20, bottom: 20});
      
      var description = new qx.ui.basic.Label();
      description.setRich(true);
      description.setWidth(470);
      description.setValue(
        "<b>Grouped List</b><br/>"
        + "Loading the json file <a href='json/persons.json' target='_blank'>"
        + "persons.json</a> and binds the created model to all list widgets. "
        + "The first list shows only the row data and converter for the label "
        + "(concatenate the first and last name). "
        + "The second list sorts the list by first name and groups the items "
        + "by first name. The third list sorts the list by first name and "
        + " groupes it by the 'group' model property. The third list is configuerd "
        + " to use a own group item for rendering."
      );
      this.getRoot().add(description, {left: 20, top: 10});
      
      container.add(this.createFirstExample());
      container.add(this.createSecondExample());
      container.add(this.createThirdExample());
      
      this.loadData();
    },

    loadData : function()
    {
      var url = "json/persons.json";
      var store = new qx.data.store.Json(url);
      store.bind("model.persons", this.__list, "model");
      store.bind("model.persons", this.__listGroupedByName, "model");
      store.bind("model.persons", this.__listGroupedByGroup, "model");
    },
    
    createFirstExample : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var title = new qx.ui.basic.Label("Raw List:").set({
        font: "bold"
      });
      container.add(title);

      // Creates the list and configure it
      var list = this.__list = new qx.ui.list.List().set({
        height: 280,
        width: 150,
        labelPath: "firstname",
        labelOptions: {converter: function(data, model) {
          return model ? data + " " + model.getLastname() : "no model...";
        }}
      });
      container.add(list, {top: 20});
      
      return container;
    },
    
    createSecondExample : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var title = new qx.ui.basic.Label("Grouped by last name:").set({
        font: "bold"
      });
      container.add(title);

      // Creates the list and configure it
      var list = this.__listGroupedByName = new qx.ui.list.List().set({
        height: 280,
        width: 150,
        labelPath: "firstname",
        labelOptions: {converter: function(data, model) {
          return model ? model.getLastname() + ", " + data : "no model...";
        }}
      });
      container.add(list, {top: 20});
      
      // Creates the delegate for sorting and grouping
      var delegate = {
        // Sorts the model data by last name
        sorter : function(a, b)
        {
          a = a.getLastname();
          b = b.getLastname();
          
          return a > b ? 1 : a < b ? -1 : 0;
        },
        
        // Assign the group name for each item (fist char form last name)
        group : function(model) {
          return model.getLastname().charAt(0).toUpperCase();
        }
      };
      list.setDelegate(delegate);
      
      // Share the selection with the fist list
      list.setSelection(this.__list.getSelection());
      
      return container;
    },
    
    createThirdExample : function()
    {
      var container = new qx.ui.container.Composite(new qx.ui.layout.Canvas());

      var title = new qx.ui.basic.Label("Grouped by group:").set({
        font: "bold"
      });
      container.add(title);

      // Creates the list and configure it
      var list = this.__listGroupedByGroup = new qx.ui.list.List().set({
        height: 280,
        width: 150,
        labelPath: "firstname",
        labelOptions: {converter: function(data, model) {
          return model ? data + " " + model.getLastname() : "no model...";
        }}
      });
      container.add(list, {top: 20});
      
      // Creates the delegate for sorting and grouping
      var delegate = {
        // Sorts the model data by last name
        sorter : function(a, b)
        {
          a = a.getLastname();
          b = b.getLastname();
          
          return a > b ? 1 : a < b ? -1 : 0;
        },
          
        // Uses the defined group name form the model.
        // When the model doesn't define a group name,
        // The default group name from the list is used.
        group : function(model) {
          return model.getGroup ? model.getGroup() : null;
        },

        // Uses a own group item
        createGroupItem : function() {
          return new qx.ui.form.ListItem();
        },
        
        // Configures each item
        configureGroupItem : function(item) {
          item.setBackgroundColor("#005E00");
          item.setTextColor("white");
        },
        
        // Binds the group name to the label and
        // assign a icon dependent on the group name
        bindGroupItem : function(controller, item, id) {
          controller.bindProperty(null, "label", null, item, id);
          controller.bindProperty(null, "icon", {
            converter : function(data) {
              switch(data) {
                case "Friends":
                  return "icon/16/emotes/face-laugh.png";
                case "Colleagues":
                  return "icon/16/categories/office.png";
                default:
                  return "icon/16/categories/system.png";
              }
            }
          }, item, id);
        }
      };
      list.setDelegate(delegate);
      
      // Share the selection with the first list
      list.setSelection(this.__list.getSelection());
      
      return container;
    }
  },
  
  destruct : function()
  {
    this.__list.dispose();
    this.__listGroupedByName.dispose();
    this.__listGroupedByGroup.dispose();
    this.__list = this.__listGroupedByName = this.__listGroupedByGroup = null;
  }
});
