/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
     2006 Derrell Lipman

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Derrell Lipman (derrell)

************************************************************************ */

/* ************************************************************************

#module(ui_treefullcontrol)
#embed(qx.widgettheme/tree/*)
#embed(qx.icontheme/16/actions/document-new.png)

************************************************************************ */

qx.Class.define("qx.ui.treefullcontrol.AbstractTreeElement",
{
  type : "abstract",
  extend : qx.ui.layout.BoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(treeRowStructure)
  {
    if (this.classname == qx.ui.treefullcontrol.AbstractTreeElement.ABSTRACT_CLASS) {
      throw new Error("Please omit the usage of qx.ui.treefullcontrol.AbstractTreeElement directly. Choose between qx.ui.treefullcontrol.TreeFolder, qx.ui.treefullcontrol.TreeFolderSimple, qx.ui.treefullcontrol.TreeFile and qx.ui.treefullcontrol.TreeFileSimple instead!");
    }

    if (treeRowStructure !== qx.ui.treefullcontrol.TreeRowStructure.getInstance()) {
      throw new Error("A qx.ui.treefullcontrol.TreeRowStructure parameter is required.");
    }

    // Precreate subwidgets
    this._indentObject = treeRowStructure._indentObject;
    this._iconObject = treeRowStructure._iconObject;
    this._labelObject = treeRowStructure._labelObject;

    // Make anonymous
    this._indentObject.setAnonymous(true);
    this._iconObject.setAnonymous(true);
    this._labelObject.setAnonymous(true);

    // Behaviour and Hard Styling
    this._labelObject.setSelectable(false);
    this._labelObject.setStyleProperty("lineHeight", "100%");

    this.base(arguments, "horizontal");

    if (qx.util.Validation.isValid(treeRowStructure._label)) {
      this.setLabel(treeRowStructure._label);
    }

    // Prohibit selection
    this.setSelectable(false);

    // Base URL used for indent images
    this.BASE_URI = qx.manager.object.AliasManager.getInstance().resolvePath("widget/tree/");

    /*
     * Add all of the objects which are to be in the horizontal layout.
     */

    for (var i=0; i<treeRowStructure._fields.length; i++) {
      this.add(treeRowStructure._fields[i]);
    }

    // Set Icons
    if ((treeRowStructure._icons.unselected != null) && (qx.util.Validation.isValidString(treeRowStructure._icons.unselected)))
    {
      this.setIcon(treeRowStructure._icons.unselected);
      this.setIconSelected(treeRowStructure._icons.unselected);
    }

    if ((treeRowStructure._icons.selected != null) && (qx.util.Validation.isValidString(treeRowStructure._icons.selected))) {
      this.setIconSelected(treeRowStructure._icons.selected);
    }

    // Setup initial icon
    this._iconObject.setSource(this._evalCurrentIcon());

    // Set Appearance
    this._iconObject.setAppearance("tree-element-icon");
    this._labelObject.setAppearance("tree-element-label");

    // Register event listeners
    this.addEventListener("mousedown", this._onmousedown);
    this.addEventListener("mouseup", this._onmouseup);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics : { ABSTRACT_CLASS : "qx.ui.treefullcontrol.AbstractTreeElement" },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /*
    ---------------------------------------------------------------------------
      PROPERTIES
    ---------------------------------------------------------------------------
    */

    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "tree-element"
    },


    /** The icons */
    icon :
    {
      _legacy : true,
      type    : "string"
    },

    iconSelected :
    {
      _legacy : true,
      type    : "string"
    },


    /** The label/caption/text of the qx.ui.basic.Atom instance */
    label : { _legacy : true },


    /** Selected property */
    selected :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : false
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    /*
    ---------------------------------------------------------------------------
      MODIFIER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyLabel : function(propValue, propOldValue, propData)
    {
      if (this._labelObject) {
        this._labelObject.setHtml(propValue);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifySelected : function(propValue, propOldValue, propData)
    {
      if (propValue)
      {
        this.addState("selected");
        this._labelObject.addState("selected");
      }
      else
      {
        this.removeState("selected");
        this._labelObject.removeState("selected");
      }

      var vTree = this.getTree();

      if (!vTree._fastUpdate || (propOldValue && vTree._oldItem == this))
      {
        this._iconObject.setSource(this._evalCurrentIcon());

        if (propValue) {
          this._iconObject.addState("selected");
        } else {
          this._iconObject.removeState("selected");
        }
      }

      var vManager = this.getTree().getManager();

      if (propOldValue && vManager.getSelectedItem() == this) {
        vManager.deselectAll();
      } else if (propValue && vManager.getSelectedItem() != this) {
        vManager.setSelectedItem(this);
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    _evalCurrentIcon : function()
    {
      if (this.getSelected() && this.getIconSelected()) {
        return this.getIconSelected();
      } else {
        return this.getIcon() || "icon/16/actions/document-new.png";
      }
    },




    /*
    ---------------------------------------------------------------------------
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var | null} TODOC
     */
    getParentFolder : function()
    {
      try {
        return this.getParent().getParent();
      } catch(ex) {}

      return null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLevel : function()
    {
      var vParentFolder = this.getParentFolder();
      return vParentFolder ? vParentFolder.getLevel() + 1 : null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getTree : function()
    {
      var vParentFolder = this.getParentFolder();
      return vParentFolder ? vParentFolder.getTree() : null;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getIndentObject : function() {
      return this._indentObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getIconObject : function() {
      return this._iconObject;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getLabelObject : function() {
      return this._labelObject;
    },


    /**
     * Obtain the entire hierarchy of labels from the root down to the current
     * node.
     *
     * @type member
     * @param vArr {var} -
     *       When called by the user, arr should typically be an empty array.  Each
     *       level from the current node upwards will push its label onto the array.
     * @return {var} TODOC
     */
    getHierarchy : function(vArr)
    {
      // Add our label to the array
      if (this._labelObject) {
        vArr.unshift(this._labelObject.getHtml());
      }

      // Get the parent folder
      var parent = this.getParentFolder();

      // If it exists...
      if (parent)
      {
        // ... then add it and its ancestors' labels to the array.
        parent.getHierarchy(vArr);
      }

      // Give 'em what they came for
      return vArr;
    },




    /*
    ---------------------------------------------------------------------------
      QUEUE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    addToTreeQueue : function()
    {
      var vTree = this.getTree();

      if (vTree) {
        vTree.addChildToTreeQueue(this);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    removeFromTreeQueue : function()
    {
      var vTree = this.getTree();

      if (vTree) {
        vTree.removeChildFromTreeQueue(this);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param vHint {var} TODOC
     * @return {void}
     */
    addToCustomQueues : function(vHint)
    {
      this.addToTreeQueue();

      this.base(arguments, vHint);
    },


    /**
     * TODOC
     *
     * @type member
     * @param vHint {var} TODOC
     * @return {void}
     */
    removeFromCustomQueues : function(vHint)
    {
      this.removeFromTreeQueue();

      this.base(arguments, vHint);
    },




    /*
    ---------------------------------------------------------------------------
      DISPLAYBLE HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyParent : function(propValue, propOldValue, propData)
    {
      this.base(arguments, propValue, propOldValue, propData);

      // Be sure to update previous folder also if it is closed currently
      // (plus/minus symbol)
      if (propOldValue && !propOldValue.isDisplayable() && propOldValue.getParent() && propOldValue.getParent().isDisplayable()) {
        propOldValue.getParent().addToTreeQueue();
      }

      // Be sure to update new folder also if it is closed currently
      // (plus/minus symbol)
      if (propValue && !propValue.isDisplayable() && propValue.getParent() && propValue.getParent().isDisplayable()) {
        propValue.getParent().addToTreeQueue();
      }

      return true;
    },


    /**
     * TODOC
     *
     * @type member
     * @param vDisplayable {var} TODOC
     * @param vParent {var} TODOC
     * @param vHint {var} TODOC
     * @return {void}
     */
    _handleDisplayableCustom : function(vDisplayable, vParent, vHint)
    {
      this.base(arguments, vDisplayable, vParent, vHint);

      if (vHint)
      {
        var vParentFolder = this.getParentFolder();
        var vPreviousParentFolder = this._previousParentFolder;

        if (vPreviousParentFolder)
        {
          if (this._wasLastVisibleChild) {
            vPreviousParentFolder._updateIndent();
          } else if (!vPreviousParentFolder.hasContent()) {
            vPreviousParentFolder.addToTreeQueue();
          }
        }

        if (vParentFolder && vParentFolder.isDisplayable() && vParentFolder._initialLayoutDone) {
          vParentFolder.addToTreeQueue();
        }

        if (this.isLastVisibleChild())
        {
          var vPrev = this.getPreviousVisibleSibling();

          if (vPrev && vPrev instanceof qx.ui.treefullcontrol.AbstractTreeElement) {
            vPrev._updateIndent();
          }
        }

        if (vDisplayable) {
          this._updateIndent();
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      EVENT LISTENERS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousedown : function(e)
    {
      this.getTree().getManager().handleMouseDown(this, e);
      e.stopPropagation();
    },

    /**
     * @signature function()
     */
    _onmouseup : qx.lang.Function.returnTrue,




    /*
    ---------------------------------------------------------------------------
      TREE FLUSH
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    flushTree : function()
    {
      // store information for update process
      this._previousParentFolder = this.getParentFolder();
      this._wasLastVisibleChild = this.isLastVisibleChild();

      // generate html for indent area
      var vLevel = this.getLevel();
      var vTree = this.getTree();
      var vImage;
      var vHtml = [];
      var vCurrentObject = this;
      var vMinLevel = 0;
      var vMaxLevel = vLevel;

      // If we're displaying the open/close button for the root node (normal)...
      if (vTree.getRootOpenClose())
      {
        // ... then we need one more level
        vMaxLevel = vLevel + 1;
      }

      // If we're not displaying the root node (creating virtual roots)...
      if (vTree.hideNode())
      {
        // ... then start one level higher
        vMinLevel = 1;
      }

      for (var i=vMinLevel; i<vMaxLevel; i++)
      {
        vImage = vCurrentObject.getIndentSymbol(vTree.getUseTreeLines(), i, vMinLevel, vMaxLevel);

        if (vImage)
        {
          vHtml.push("<img style=\"position:absolute;top:0px;left:");

          // location of image; Root's image could be left of margin (invisible)
          vHtml.push((vMaxLevel - i - 1) * 19);

          vHtml.push("px\" src=\"");
          vHtml.push(this.BASE_URI);
          vHtml.push(vImage);
          vHtml.push(".");
          vHtml.push("gif");
          vHtml.push("\" />");
        }

        vCurrentObject = vCurrentObject.getParentFolder();
      }

      this._indentObject.setHtml(vHtml.join(""));
      this._indentObject.setWidth((vMaxLevel - vMinLevel) * 19);
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeObjects("_indentObject", "_iconObject", "_labelObject", "_previousParentFolder");
  }
});
