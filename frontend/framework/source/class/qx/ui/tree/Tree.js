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
     * Fabian Jakobs (fjakobs)
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/**
 * The Tree class implements a tree widget, with collapsable and expandable
 * container nodes and terminal leaf nodes. You instantiate a Tree object and
 * then assign the tree a root folder using the {@link #root} property.
 *
 * If you don't want to show the root item, you can hide it with the
 * {@link #hideRoot} property.
 *
 * The handling of <b>selections</b> within a tree is somewhat distributed
 * between the root tree object and the attached {@link
 * qx.ui.tree.SelectionManager TreeSelectionManager}. To get the
 * currently selected element of a tree use the tree {@link #getSelectedItem
 * getSelectedItem} method and tree {@link #setSelectedItem
 * setSelectedItem} to set it. The TreeSelectionManager handles more
 * coars-grained issues like providing selectAll()/deselectAll() methods.
 *
 * @appearance tree
 * @appearance tree-icon {qx.ui.basic.Image}
 * @appearance tree-label {qx.ui.basic.Label}
 */
qx.Class.define("qx.ui.tree.Tree",
{
  extend : qx.ui.core.ScrollArea,
  implement : qx.ui.core.selection.IContainer,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    var content = new qx.ui.core.Widget().set({
      layout : new qx.ui.layout.VBox(),
      allowShrinkY: false,
      allowGrowY: false,
      allowShrinkY: false
    });

    this.setContent(content);

    this._manager = new qx.ui.core.selection.Widget(this);

    this.initOpenMode();
    this.initRootOpenClose();

    this.addListener("mousemove", this._onMousemove);
    this.addListener("mousedown", this._onMousedown);
    this.addListener("mouseup", this._onMouseup);

    this.addListener("keydown", this._onKeydown);
    this.addListener("keypress", this._onKeypress);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Control whether clicks or double clicks should open or close the clicked
     * folder.
     */
    openMode :
    {
      check : ["clickOpen", "clickOpenClose", "dblclickOpen", "dblclickOpenClose", "none"],
      init : "dblclickOpenClose",
      apply : "_applyOpenMode",
      event : "changeOpenMode"
    },


    /**
     * The root tree item of the tree to display
     */
    root :
    {
      check : "qx.ui.tree.AbstractTreeItem",
      init : null,
      nullable : true,
      event : "changeRoot",
      apply : "_applyRoot"
    },


    /**
     * Hide the root (Tree) node.  This differs from the visibility property in
     * that this property hides *only* the root node, not the node's children.
     */
    hideRoot :
    {
      check : "Boolean",
      init : false,
      apply :"_applyHideRoot"
    },


    /**
     * Whether the Root should have an open/close button.  This may also be
     *  used in conjunction with the hideNode property to provide for virtual root
     *  nodes.  In the latter case, be very sure that the virtual root nodes are
     *  expanded programatically, since there will be no open/close button for the
     *  user to open them.
     */
    rootOpenClose :
    {
      check : "Boolean",
      init : false,
      apply : "_applyRootOpenClose"
    },


    /**
     * The padding of the tree content pane. Don't use the
     * {@link qx.ui.core.Widget#padding} property because this would move the
     * scrollbars as well.
     */
    contentPadding :
    {
      check : "Array",
      nullable : true,
      init : null,
      apply : "_applyContentPadding",
      themeable : true
    },

    // overridden
    appearance :
    {
      refine: true,
      init: "tree"
    },

    // overridden
    focusable :
    {
      refine : true,
      init : true
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /**
     * Get the widget, which containes the root tree item. This widget must
     * have a vertical box layout.
     *
     * @return {qx.ui.core.Widget} the children container
     */
    getChildrenContainer : function() {
      return this.getContent();
    },


    // property apply
    _applyRoot : function(value, old)
    {
      var layout = this.getChildrenContainer().getLayout();

      if (old)
      {
        layut.remove(old);
        if (old.hasChildren()) {
          layout.remove(old.getChildrenContainer());
        }
      }

      if (value)
      {
        layout.add(value);
        if (value.hasChildren()) {
          layout.add(value.getChildrenContainer());
        }

        value.setVisibility(this.getHideRoot() ? "excluded" : "visible");
        value.recursiveAddToWidgetQueue();

        // as a heuristic use the height of the root item as line height
        var rootHeight = value.getSizeHint().height;
        this.setLineHeight(rootHeight);
      }
    },


    // property apply
    _applyHideRoot : function(value, old)
    {
      var root = this.getRoot();
      if (!root) {
        return;
      }

      root.setVisibility(value ? "excluded" : "visible");
      root.recursiveAddToWidgetQueue();
    },


    // property apply
    _applyRootOpenClose : function(value, old)
    {
      var root = this.getRoot();
      if (!root) {
        return;
      }
      root.recursiveAddToWidgetQueue();
    },


    // property apply
    _applyContentPadding : function(value, old)
    {
      if (value) {
        this.getContent().setPadding(value);
      }
    },


    /*
    ---------------------------------------------------------------------------
      MANAGER BINDING
    ---------------------------------------------------------------------------
    */

    /**
     * Accessor method for the selection manager
     *
     * @type member
     * @return {qx.ui.selection.SelectionManager} TODOC
     */
    getManager : function() {
      return this._manager;
    },


    /**
     * Sets the selected tree item.
     *
     * @type member
     * @param treeItem {AbstractTreeItem} the tree item to select
     */
    setSelectedElement : function(treeItem)
    {
      var manager = this.getManager();

      manager.setSelectedItem(treeItem);
      manager.setLeadItem(treeItem);
    },


    /**
     * Returns the first selected list item.
     *
     * @type member
     * @return {qx.ui.form.ListItem|null} Selected item or null
     */
    getSelectedItem : function() {
      return this.getSelectedItems()[0] || null;
    },


    /**
     * Returns all selected list items (uses the selection manager).
     *
     * @type member
     * @return {Array} Returns all selected list items.
     */
    getSelectedItems : function() {
      return this._manager.getSelectedItems();
    },


    /*
    ---------------------------------------------------------------------------
      SELECTION MANAGER API
    ---------------------------------------------------------------------------
    */

    /**
     * Get the tree item after the given item
     *
     * @param treeItem {AbstractTreeItem} The tree item to get the item after
     * @param invisible {Boolean?true} Whether invisible/closed tree items
     *     should be returned as well.
     * @return {AbstractTreeItem?null} The item after the given item. May be
     *     <code>null</code> if the item is the last item.
     */
    getNextSiblingOf : function(treeItem, invisible)
    {
      if ((invisible !== false || treeItem.isOpen()) && treeItem.hasChildren()) {
        return treeItem.getChildren()[0];
      }

      while (treeItem)
      {
        var parent = treeItem.getParent();
        if (!parent) {
          return null;
        }

        var parentChildren = parent.getChildren();
        var index = parentChildren.indexOf(treeItem);
        if (index > -1 && index < parentChildren.length-1) {
          return parentChildren[index+1];
        }

        treeItem = parent;
      }
      return null;
    },


    /**
     * Get the tree item before the given item
     *
     * @param treeItem {AbstractTreeItem} The tree item to get the item before
     * @param invisible {Boolean?true} Whether invisible/closed tree items
     *     should be returned as well.
     * @return {AbstractTreeItem?null} The item before the given item. May be
     *     <code>null</code> if the item is the first item.
     */
    getPreviousSiblingOf : function(treeItem, invisible)
    {
      var parent = treeItem.getParent();
      if (!parent) {
        return null;
      }

      if (this.getHideRoot())
      {
        if (parent == this.getRoot())
        {
          if (parent.getChildren()[0] == treeItem) {
            return null;
          }
        }
      }
      else
      {
        if (treeItem == this.getRoot()) {
          return null;
        }
      }

      var parentChildren = parent.getChildren();
      var index = parentChildren.indexOf(treeItem);
      if (index > 0)
      {
        var folder = parentChildren[index-1];
        while ((invisible !== false || folder.isOpen()) && folder.hasChildren())
        {
          var children = folder.getChildren();
          folder = children[children.length-1];
        }
        return folder;
      }
      else
      {
        return parent;
      }
    },


    // interface implementation
    getSelectables : function() {
      return this.getRoot().getItems(true, false, this.getHideRoot());
    },


    /**
     * Returns all children of the tree.
     *
     * @type member
     * @param recursive {Boolean ? false} whether children of subfolder should be
     *     included
     * @param invisible {Boolean ? true} whether invisible children should be
     *     included
     * @return {AbstractTreeItem[]} list of children
     */
    getItems : function(recursive, invisible) {
      return this.getRoot().getItems(recursive, invisible, this.getHideRoot());
    },


    // overridden
    scrollItemIntoView : function(item, hAlign, vAlign)
    {
      // if the last item is selected the content should be scrolled down to
      // the end including the content paddings
      if (!this.getNextSelectableItem(item)) {
        this.setScrollTop(1000000);
      } else {
        this.base(arguments, item, hAlign, vAlign);
      }
    },


    // interface implementation
    getInnerHeight : function() {
      return this.getVisibleContentSize().height;
    },


    // interface implementation
    getItemOffset : function(item)
    {
      var pos = item.getBounds();
      if (!pos) {
        return 0;
      }

      var top = 0;
      while (item)
      {
        top += item.getBounds().top;
        var item = item.getLayoutParent();
        if (item == this.getContent()) {
          return top;
        }
      }

      return 0;
    },


    // interface implementation
    getItemHeight : function(item)
    {
      var computed = item.getBounds();
      if (computed) {
        return computed.height;
      }

      return 0;
    },


    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT HANDLER
    ---------------------------------------------------------------------------
    */


    /**
     * Returns the tree item, which contains the given widget.
     *
     * @param widget {qx.ui.core.Widget} The widget to get the containing tree
     *   item for.
     * @return {AbstractTreeItem|null} The tree item containing the widget. If the
     *     widget is not inside of any tree item <code>null</code> is returned.
     */
    _getTreeItem : function(widget)
    {
      while (widget)
      {
        if (widget == this) {
          return null;
        }

        if (widget instanceof qx.ui.tree.AbstractTreeItem) {
          return widget;
        }

        widget = widget.getLayoutParent();
      }

      return null;
    },


    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseOver event
     * @return {void}
     */
    _onMousemove : function(e)
    {
      var target = this._getTreeItem(e.getTarget());
      if (target) {
        this._manager.handleMouseMove(e);
      }
    },


    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseDown event
     * @return {void}
     */
    _onMousedown : function(e)
    {
      var target = this._getTreeItem(e.getTarget());
      if (target) {
        this._manager.handleMouseDown(e);
      }
    },


    /**
     * Delegates the event to the selection manager if a list item could be
     * resolved out of the event target.
     *
     * @type member
     * @param e {qx.event.type.Mouse} mouseUp event
     * @return {void}
     */
    _onMouseup : function(e)
    {
      var target = this._getTreeItem(e.getTarget());
      if (target) {
        this._manager.handleMouseUp(e);
      }
    },


    // property apply
    _applyOpenMode : function(value, old)
    {
      if (old == "clickOpen" || old == "clickOpenClose") {
        this.removeListener("click", this._onOpen, this);
      } else if (old == "dblclickOpen" || old == "dblclickOpenClose") {
        this.removeListener("dblclick", this._onOpen, this);
      }

      if (value == "clickOpen" || value == "clickOpenClose") {
        this.addListener("click", this._onOpen, this);
      } else if (value == "dblclickOpen" || value == "dblclickOpenClose") {
        this.addListener("dblclick", this._onOpen, this);
      }
    },


    /**
     * Event hander for click events, which could change a tree item's open
     * state.
     *
     * @param e {qx.event.type.Mouse} The mouse click event object
     */
    _onOpen : function(e)
    {
      var treeItem = this._getTreeItem(e.getTarget());
      if (!treeItem ||!treeItem.isOpenable()) {
        return;
      }

      openMode = this.getOpenMode();

      if (!treeItem.isOpen())
      {
        treeItem.setOpen(true);
        e.stopPropagation();
      }
      else if (openMode == "clickOpenClose" || openMode == "dblclickOpenClose")
      {
        treeItem.setOpen(false);
        e.stopPropagation();
      }
    },


    /*
    ---------------------------------------------------------------------------
      KEY EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * Dispatches the "action" event on every selected list item
     * when the "Enter" key is pressed
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyDown event
     * @return {void}
     */
    _onKeydown : function(e)
    {
      // Execute action on press <ENTER>
      if (e.getKeyIdentifier() == "Enter" && !e.isAltPressed())
      {
        var items = this.getSelectedItems();
        for (var i=0; i<items.length; i++) {
          items[i].fireEvent("action");
        }
      }
    },


    /**
     * Delegates the control of the event to selection manager
     *
     * @type member
     * @param e {qx.event.type.KeyEvent} keyPress event
     * @return {void}
     */
    _onKeypress : function(e)
    {
      var key = e.getKeyIdentifier();

      if (key == "Left" || key == "Right")
      {
        var target = e.getTarget();
        if (target !== this)
        {
          var treeItem = this._getTreeItem(target);

          if (treeItem.isOpenable())
          {
            if (treeItem)
            {
              if (key == "Left")
              {
                if (treeItem.isOpen())
                {
                  treeItem.setOpen(false);
                  e.stopPropagation();
                }
              }
              else
              {
                if (!treeItem.isOpen())
                {
                  treeItem.setOpen(true);
                  e.stopPropagation();
                }
              }

              return;
            }
          }
        }
      }

      // Give control to selectionManager
      this._manager.handleKeyPress(e);
    }
  }
});
