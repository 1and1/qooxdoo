/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_listview)
#embed(qx.widgettheme/arrows/up.gif)
#embed(qx.widgettheme/arrows/down.gif)

************************************************************************ */

qx.Clazz.define("qx.ui.listview.HeaderCell",
{
  extend : qx.ui.basic.Atom,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vConfig, vId)
  {
    this.base(arguments, vConfig.label, vConfig.icon, vConfig.iconWidth, vConfig.iconHeight, vConfig.flash);

    // Text Overflow
    this.setStyleProperty("textOverflow", "ellipsis");

    // ************************************************************************
    //   STORE REFERENCE TO CONFIG ENTRY
    // ************************************************************************
    this._config = vConfig;
    this._id = vId;

    // ************************************************************************
    //   ARGUMENTS
    // ************************************************************************
    this.setWidth(typeof vConfig.width === "undefined" ? "auto" : vConfig.width);

    if (vConfig.minWidth != null) {
      this.setMinWidth(vConfig.minWidth);
    }

    if (vConfig.maxWidth != null) {
      this.setMaxWidth(vConfig.maxWidth);
    }

    // ************************************************************************
    //   ADDITIONAL CHILDREN
    // ************************************************************************
    // Re-Enable flex support
    this.getLayoutImpl().setEnableFlexSupport(true);

    this._spacer = new qx.ui.basic.HorizontalSpacer;

    this._arrowup = new qx.ui.basic.Image("widget/arrows/up.gif");
    this._arrowup.setVerticalAlign("middle");
    this._arrowup.setDisplay(false);

    this._arrowdown = new qx.ui.basic.Image("widget/arrows/down.gif");
    this._arrowdown.setVerticalAlign("middle");
    this._arrowdown.setDisplay(false);

    this.add(this._spacer, this._arrowup, this._arrowdown);

    // ************************************************************************
    //   EVENTS
    // ************************************************************************
    this.addEventListener("mouseup", this._onmouseup);
    this.addEventListener("mouseover", this._onmouseover);
    this.addEventListener("mouseout", this._onmouseout);
  },




  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    C_SORT_ASCENDING  : "ascending",
    C_SORT_DESCENDING : "descending"
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    appearance :
    {
      _legacy      : true,
      type         : "string",
      defaultValue : "list-view-header-cell"
    },

    sortOrder :
    {
      _legacy        : true,
      type           : "string",
      allowNull      : true,
      possibleValues : [ "ascending", "descending" ]
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
      UTILITIES
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getView : function() {
      return this.getParent().getParent();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getNextSortOrder : function()
    {
      var vCurrentSortOrder = this.getSortOrder();

      switch(vCurrentSortOrder)
      {
        case qx.ui.listview.HeaderCell.C_SORT_ASCENDING:
          return qx.ui.listview.HeaderCell.C_SORT_DESCENDING;

        default:
          return qx.ui.listview.HeaderCell.C_SORT_ASCENDING;
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    updateSort : function()
    {
      var vListView = this.getView();
      var vData = vListView.getData();
      var vFieldId = this._id;
      var vSortProp = this._config.sortProp || "text";
      var vSortMethod = this._config.sortMethod || qx.util.Compare.byString;

      vData.sort(function(a, b) {
        return vSortMethod(a[vFieldId][vSortProp], b[vFieldId][vSortProp]);
      });

      if (this.getSortOrder() == qx.ui.listview.HeaderCell.C_SORT_DESCENDING) {
        vData.reverse();
      }
    },




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
    _modifySortOrder : function(propValue, propOldValue, propData)
    {
      var vListView = this.getView();

      switch(propValue)
      {
        case qx.ui.listview.HeaderCell.C_SORT_ASCENDING:
          this._arrowup.setDisplay(true);
          this._arrowdown.setDisplay(false);

          vListView.setSortBy(this._id);
          break;

        case qx.ui.listview.HeaderCell.C_SORT_DESCENDING:
          this._arrowup.setDisplay(false);
          this._arrowdown.setDisplay(true);

          vListView.setSortBy(this._id);
          break;

        default:
          this._arrowup.setDisplay(false);
          this._arrowdown.setDisplay(false);

          if (vListView.getSortBy() == this._id) {
            vListView.setSortBy(null);
          }
      }

      if (propValue)
      {
        this.updateSort();
        vListView.update();
      }

      return true;
    },




    /*
    ---------------------------------------------------------------------------
      EVENT HANDLER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseover : function(e) {
      this.addState("over");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseout : function(e) {
      this.removeState("over");
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmouseup : function(e)
    {
      if (!this._config.sortable || this.getParent()._resizeSeparator) {
        return;
      }

      this.setSortOrder(this.getNextSortOrder());
      e.stopPropagation();
    },




    /*
    ---------------------------------------------------------------------------
      DISPOSER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {void | var} TODOC
     */
    dispose : function()
    {
      if (this.getDisposed()) {
        return;
      }

      delete this._config;

      if (this._spacer)
      {
        this._spacer.dispose();
        this._spacer = null;
      }

      if (this._arrowup)
      {
        this._arrowup.dispose();
        this._arrowup = null;
      }

      if (this._arrowdown)
      {
        this._arrowdown.dispose();
        this._arrowdown = null;
      }

      this.removeEventListener("mouseup", this._onmouseup);
      this.removeEventListener("mouseover", this._onmouseover);
      this.removeEventListener("mouseout", this._onmouseout);

      return this.base(arguments);
    }
  }
});
