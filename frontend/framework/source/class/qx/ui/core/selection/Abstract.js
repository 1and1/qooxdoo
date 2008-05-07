/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)

************************************************************************ */

/**
 * Generic selection manager to bring rich desktop like selection behavior
 * to widgets and low-level interactive controls.
 *
 * The selection handling supports both Shift and Ctrl/Meta modifies like
 * known from native applications.
 */
qx.Class.define("qx.ui.core.selection.Abstract",
{
  extend : qx.core.Object,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function()
  {
    this.base(arguments);

    // {Map} Interal selection storage
    this._selection = {};
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events :
  {
    /** Fires after the selection was modified */
    change : "qx.event.type.Event"
  },





  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /**
     * Selects the selection mode to use.
     *
     * * single: One element is selected
     * * multi: Multi items could be selected. Also allows empty selections.
     * * additive: Easy Web-2.0 selection mode. Allows multiple selections without modifier keys.
     */
    mode :
    {
      check : [ "single", "multi", "additive" ],
      init : "single",
      apply : "_applySelectionMode"
    },


    /**
     * Enable drag selection (multi selection of items through
     * dragging the mouse in pressed states)
     */
    drag :
    {
      check : "Boolean",
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
    /*
    ---------------------------------------------------------------------------
      USER APIS
    ---------------------------------------------------------------------------
    */

    /**
     * Selects all items of the managed object.
     *
     * @type member
     * @return {void}
     */
    selectAll : function()
    {
      this._selectAllItems();
      this._fireChange();
    },


    // TODO






    /*
    ---------------------------------------------------------------------------
      LEAD/ANCHOR SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Sets the lead item. Generally the item which was last modified
     * by the user (clicked on etc.)
     *
     * @type member
     * @param value {Object} Any valid item or <code>null</code>
     * @return {void}
     */
    _setLeadItem : function(value)
    {
      var old = this.__leadItem;

      if (old) {
        this._styleSelectable(old, "lead", false);
      }

      if (value) {
        this._styleSelectable(value, "lead", true);
      }

      this.__leadItem = value;
    },


    /**
     * Returns the current lead item. Generally the item which was last modified
     * by the user (clicked on etc.)
     *
     * @type member
     * @return {Object} The lead item or <code>null</code>
     */
    _getLeadItem : function() {
      return this.__leadItem || null;
    },


    /**
     * Sets the anchor item. This is the item which is the starting
     * point for all range selections. Normally this is the item which was
     * clicked on the last time without any modifier keys pressed.
     *
     * @type member
     * @param value {Object} Any valid item or <code>null</code>
     * @return {void}
     */
    _setAnchorItem : function(value)
    {
      var old = this.__anchorItem;

      if (old) {
        this._styleSelectable(old, "anchor", false);
      }

      if (value) {
        this._styleSelectable(value, "anchor", true);
      }

      this.__anchorItem = value;
    },


    /**
     * Returns the current anchor item. This is the item which is the starting
     * point for all range selections. Normally this is the item which was
     * clicked on the last time without any modifier keys pressed.
     *
     * @type member
     * @return {Object} The anchor item or <code>null</code>
     */
    _getAnchorItem : function() {
      return this.__anchorItem || null;
    },





    /*
    ---------------------------------------------------------------------------
      BASIC SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the given item is selectable.
     *
     * @type member
     * @param item {var} Any item
     * @return {Boolean} <code>true</code> when the item is selectable
     */
    _isSelectable : function(item) {
      throw new Error("Abstract method call: _isSelectable()");
    },


    /**
     * Finds the selectable instance from any given target inside
     * the connected widget.
     *
     * @type member
     * @param target {Object} The event target
     * @return {Object} The resulting selectable
     */
    _getSelectableFromTarget : function(target) {
      return this._isSelectable(target) ? target : null;
    },


    /**
     * Returns a unique hashcode for the given item.
     *
     * @type member
     * @param item {var} Any item
     * @return {String} A valid hashcode
     */
    _selectableToHashCode : function(item) {
      throw new Error("Abstract method call: _selectableToHashCode()");
    },


    /**
     * Updates the style (appearance) of the given item.
     *
     * @type member
     * @param item {var} Item to modify
     * @param type {String} Any of <code>selected</code>, <code>anchor</code> or <code>lead</code>
     * @param enabled {Boolean} Whether the given style should be added or removed.
     * @return {void}
     */
    _styleSelectable : function(item, type, enabled) {
      throw new Error("Abstract method call: _styleSelectable()");
    },


    /**
     * Enables capturing of the container.
     *
     * @type member
     * @return {void}
     */
    _capture : function() {
      throw new Error("Abstract method call: _capture()");
    },


    /**
     * Releases capturing of the container
     *
     * @type member
     * @return {void}
     */
    _releaseCapture : function() {
      throw new Error("Abstract method call: _releaseCapture()");
    },






    /*
    ---------------------------------------------------------------------------
      DIMENSION AND LOCATION
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the location of the container
     *
     * @type member
     * @return {Map} Map with the keys <code>top</code>, <code>right</code>,
     *    <code>bottom</code> and <code>left</code>.
     */
    _getLocation : function() {
      throw new Error("Abstract method call: _getLocation()");
    },


    /**
     * Returns the dimension of the container (available scrolling space).
     *
     * @type member
     * @return {Map} Map with the keys <code>width</code> and <code>height</code>.
     */
    _getDimension : function() {
      throw new Error("Abstract method call: _getDimension()");
    },


    /**
     * Returns the relative (to the container) horizontal location of the given item.
     *
     * @type member
     * @param item {var} Any item
     * @return {Map} A map with the keys <code>left</code> and <code>right</code>.
     */
    _getSelectableLocationX : function(item) {
      throw new Error("Abstract method call: _getSelectableLocationX()");
    },


    /**
     * Returns the relative (to the container) horizontal location of the given item.
     *
     * @type member
     * @param item {var} Any item
     * @return {Map} A map with the keys <code>top</code> and <code>bottom</code>.
     */
    _getSelectableLocationY : function(item) {
      throw new Error("Abstract method call: _getSelectableLocationY()");
    },






    /*
    ---------------------------------------------------------------------------
      SCROLL SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the scroll position of the container.
     *
     * @type member
     * @return {Map} Map with the keys <code>left</code> and <code>top</code>.
     */
    _getScroll : function() {
      throw new Error("Abstract method call: _getScroll()");
    },


    /**
     * Scrolls by the given offset
     *
     * @type member
     * @param xoff {Integer} Horizontal offset to scroll by
     * @param yoff {Integer} Vertical offset to scroll by
     * @return {void}
     */
    _scrollBy : function(xoff, yoff) {
      throw new Error("Abstract method call: _scrollBy()");
    },


    /**
     * Scrolls the given item into the view (make it visible)
     *
     * @type member
     * @param item {var} Any item
     * @return {void}
     */
    _scrollSelectableIntoView : function(item) {
      throw new Error("Abstract method call: _scrollSelectableIntoView()");
    },






    /*
    ---------------------------------------------------------------------------
      QUERY SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * Returns all selectable items of the container.
     *
     * @type member
     * @return {Array} A list of items
     */
    _getSelectables : function() {
      throw new Error("Abstract method call: _getSelectables()");
    },


    /**
     * Returns all selectable items between the two given items.
     *
     * The items could be given in any order.
     *
     * @type member
     * @param item1 {var} First item
     * @param item2 {var} Second item
     * @return {Boolean} <code>true</code> when the item is selectable
     */
    _getSelectableRange : function(item1, item2) {
      throw new Error("Abstract method call: _getSelectableRange()");
    },


    /**
     * Returns the first selectable item.
     *
     * @type member
     * @return {var} The first selectable item
     */
    _getFirstSelectable : function() {
      throw new Error("Abstract method call: _getFirstSelectable()");
    },


    /**
     * Returns the last selectable item.
     *
     * @type member
     * @return {var} The last selectable item
     */
    _getLastSelectable : function() {
      throw new Error("Abstract method call: _getLastSelectable()");
    },


    /**
     * Returns a selectable item which is related to the given
     * <code>item</code> through the value of <code>relation</code>.
     *
     * @type member
     * @param item {var} Any item
     * @param relation {String} A valid relation: <code>above</code>,
     *    <code>right</code>, <code>under</code> or <code>left</code>
     * @return {Boolean} The related item
     */
    _getRelatedSelectable : function(item, relation) {
      throw new Error("Abstract method call: _getRelatedSelectable()");
    },





    /*
    ---------------------------------------------------------------------------
      PROPERTY APPLY ROUTINES
    ---------------------------------------------------------------------------
    */

    // property apply
    _applySelectionMode : function(value, old)
    {
      this._setLeadItem(null);
      this._setAnchorItem(null);

      this._clearSelection();
    },






    /*
    ---------------------------------------------------------------------------
      MOUSE SUPPORT
    ---------------------------------------------------------------------------
    */

    /**
     * This method should be connected to the <code>mousedown</code> event
     * of the managed object.
     *
     * @type member
     * @param event {qx.event.type.Mouse} A valid mouse event
     * @return {void}
     */
    handleMouseDown : function(event)
    {
      var item = this._getSelectableFromTarget(event.getTarget());
      if (!item) {
        return;
      }

      // Be sure that item is in view
      this._scrollSelectableIntoView(item);


      // Read in keyboard modifiers
      var isCtrlPressed = event.isCtrlPressed() || (qx.bom.client.Platform.MAC && event.isMetaPressed());
      var isShiftPressed = event.isShiftPressed();

      // Action depends on selected mode
      switch(this.getMode())
      {
        case "single":
          this._setSelectedItem(item);
          break;

        case "additive":
          this._setLeadItem(item);
          this._setAnchorItem(item);
          this._toggleInSelection(item);
          break;

        case "multi":
          // Update lead item
          this._setLeadItem(item);

          // Create/Update range selection
          if (isShiftPressed)
          {
            var anchor = this._getAnchorItem();
            if (!anchor) {
              this._setAnchorItem(anchor = this.getFirstItem());
            }

            this._selectItemRange(anchor, item, isCtrlPressed);
          }

          // Toggle in selection
          else if (isCtrlPressed)
          {
            this._setAnchorItem(item);
            this._toggleInSelection(item);
          }

          // Replace current selection
          else
          {
            this._setAnchorItem(item);
            this._setSelectedItem(item);
          }

          break;
      }


      // Drag selection
      if (this.getDrag() && this.getMode() !== "single" && !isShiftPressed && !isCtrlPressed)
      {
        // Cache location/scroll data
        this._frameLocation = this._getLocation();
        this._frameScroll = this._getScroll();

        // Store position at start
        this._dragStartX = event.getDocumentLeft() + this._frameScroll.left;
        this._dragStartY = event.getDocumentTop() + this._frameScroll.top;

        // Switch to capture mode
        this._inCapture = true;
        this._capture();
      }


      // Fire change event as needed
      this._fireChange();
    },


    /**
     * This method should be connected to the <code>mouseup</code> event
     * of the managed object.
     *
     * @type member
     * @param event {qx.event.type.Mouse} A valid mouse event
     * @return {void}
     */
    handleMouseUp : function(event) {
      this._cleanup();
    },


    /**
     * This method should be connected to the <code>losecapture</code> event
     * of the managed object.
     *
     * @type member
     * @param event {qx.event.type.Mouse} A valid mouse event
     * @return {void}
     */
    handleLoseCapture : function(event) {
      this._cleanup();
    },


    /**
     * This method should be connected to the <code>mousemove</code> event
     * of the managed object.
     *
     * @type member
     * @param event {qx.event.type.Mouse} A valid mouse event
     * @return {void}
     */
    handleMouseMove : function(event)
    {
      // Only relevant when capturing is enabled
      if (!this._inCapture) {
        return;
      }


      // Update mouse position cache
      this._mouseX = event.getDocumentLeft();
      this._mouseY = event.getDocumentTop();


      // Detect move directions
      var dragX = this._mouseX + this._frameScroll.left;
      if (dragX > this._dragStartX) {
        this._moveDirectionX = 1;
      } else if (dragX < this._dragStartX) {
        this._moveDirectionX = -1;
      } else {
        this._moveDirectionX = 0;
      }

      var dragY = this._mouseY + this._frameScroll.top;
      if (dragY > this._dragStartY) {
        this._moveDirectionY = 1;
      } else if (dragY < this._dragStartY) {
        this._moveDirectionY = -1;
      } else {
        this._moveDirectionY = 0;
      }


      // Update scroll steps
      var location = this._frameLocation;

      if (this._mouseX < location.left) {
        this._scrollStepX = this._mouseX - location.left;
      } else if (this._mouseX > location.right) {
        this._scrollStepX = this._mouseX - location.right;
      } else {
        this._scrollStepX = 0;
      }

      if (this._mouseY < location.top) {
        this._scrollStepY = this._mouseY - location.top;
      } else if (this._mouseY > location.bottom) {
        this._scrollStepY = this._mouseY - location.bottom;
      } else {
        this._scrollStepY = 0;
      }


      // Dynamically create required timer instance
      if (!this._scrollTimer)
      {
        this._scrollTimer = new qx.event.Timer(100);
        this._scrollTimer.addListener("interval", this._onInterval, this);
      }


      // Start interval
      this._scrollTimer.start();


      // Auto select based on new cursor position
      this._autoSelect();
    },






    /*
    ---------------------------------------------------------------------------
      MOUSE SUPPORT INTERNALS
    ---------------------------------------------------------------------------
    */

    _cleanup : function()
    {
      if (!this.getDrag() && this._inCapture) {
        return;
      }

      // Remove flags
      delete this._inCapture;
      delete this._lastRelX;
      delete this._lastRelY;

      // Stop capturing
      this._releaseCapture();

      // Stop timer
      if (this._scrollTimer) {
        this._scrollTimer.stop();
      }
    },


    _onInterval : function(e)
    {
      // Scroll by defined block size
      this._scrollBy(this._scrollStepX, this._scrollStepY);

      // TODO: Optimization: Detect real scroll changes first?

      // Update scroll cache
      this._frameScroll = this._getScroll();

      // Auto select based on new scroll position and cursor
      this._autoSelect();
    },


    _autoSelect : function()
    {
      var inner = this._getDimension();

      // Get current relative Y position and compare it with previous one
      var relX = Math.max(0, Math.min(this._mouseX - this._frameLocation.left, inner.width)) + this._frameScroll.left;
      var relY = Math.max(0, Math.min(this._mouseY - this._frameLocation.top, inner.height)) + this._frameScroll.top;


      // Compare old and new relative coordinates (for performance reasons)
      if (this._lastRelX === relX && this._lastRelY === relY) {
        return;
      }

      this._lastRelX = relX;
      this._lastRelY = relY;


      // Cache anchor
      var anchor = this._getAnchorItem();


      // Process X-coordinate
      var moveX=this._moveDirectionX, leadX=anchor;
      var nextX, locationX, countX=0;

      while (moveX !== 0)
      {
        // Find next item to process depending on current scroll direction
        nextX = moveX > 0 ? this._getRelatedSelectable(leadX, "right") : this._getRelatedSelectable(leadX, "left");

        // May be null (e.g. first/last item)
        if (nextX)
        {
          locationX = this._getSelectableLocationX(nextX);

          // Continue when the item is in the visible area
          if ((moveX > 0 && locationX.left <= relX) || (moveX < 0 && locationX.right >= relX))
          {
            leadX = nextX;
            countX++;

            continue;
          }
        }

        // Otherwise break
        break;
      }


      // Process Y-coordinate
      var moveY=this._moveDirectionY, leadY=anchor;
      var nextY, locationY, countY=0;

      while (moveY !== 0)
      {
        // Find next item to process depending on current scroll direction
        nextY = moveY > 0 ? this._getRelatedSelectable(leadY, "under") : this._getRelatedSelectable(leadY, "above");

        // May be null (e.g. first/last item)
        if (nextY)
        {
          locationY = this._getSelectableLocationY(nextY);

          // Continue when the item is in the visible area
          if ((moveY > 0 && locationY.top <= relY) || (moveY < 0 && locationY.bottom >= relY))
          {
            leadY = nextY;
            countY++;

            continue;
          }
        }

        // Otherwise break
        break;
      }


      // Select highest lead
      var lead = countX > countY ? leadX : leadY;


      // Differenciate between the two supported modes
      var mode = this.getMode();
      if (mode === "multi")
      {
        // Replace current selection with new range
        this._selectItemRange(anchor, lead);
      }
      else if (mode === "additive")
      {
        // Behavior depends on the fact whether the
        // anchor item is selected or not
        if (this._isItemSelected(anchor)) {
          this._selectItemRange(anchor, lead, true);
        } else {
          this._deselectItemRange(anchor, lead);
        }

        // Improve performance. This mode does not rely
        // on full ranges as it always extend the old
        // selection/deselection.
        this._setAnchorItem(lead);
      }


      // Fire change event as needed
      this._fireChange();
    },






    /*
    ---------------------------------------------------------------------------
      KEYBOARD SUPPORT
    ---------------------------------------------------------------------------
    */

    /** {Map} All supported navigation keys */
    __navigationKeys :
    {
      Home : 1,
      Down : 1 ,
      Right : 1,
      PageDown : 1,
      End : 1,
      Up : 1,
      Left : 1,
      PageUp : 1
    },


    handleKeyPress : function(event)
    {
      var current, next;
      var key = event.getKeyIdentifier();
      var mode = this.getMode();

      // Support both control keys on Mac
      var isCtrlPressed = event.isCtrlPressed() || (qx.bom.client.Platform.MAC && event.isMetaPressed());
      var isShiftPressed = event.isShiftPressed();

      if (key === "A" && isCtrlPressed)
      {
        if (mode !== "single") {
          this._selectAllItems();
        }
      }
      else if (key === "Escape")
      {
        if (mode !== "single") {
          this._clearSelection();
        }
      }
      else if (key === "Space")
      {
        var lead = this._getLeadItem();
        if (lead && !isShiftPressed)
        {
          if (isCtrlPressed || mode === "additive") {
            this._toggleInSelection(lead);
          } else {
            this._setSelectedItem(lead);
          }
        }
      }
      else if (this.__navigationKeys[key])
      {
        if (mode === "single") {
          current = this._getSelectedItem();
        } else {
          current = this._getLeadItem();
        }

        var first = this._getFirstSelectable();
        var last = this._getLastSelectable();

        if (current)
        {
          switch(key)
          {
            case "Home":
              next = first;
              break;

            case "End":
              next = last;
              break;

            case "Up":
              next = this._getRelatedSelectable(current, "above");
              break;

            case "Down":
              next = this._getRelatedSelectable(current, "under");
              break;

            case "Left":
              next = this._getRelatedSelectable(current, "left");
              break;

            case "Right":
              next = this._getRelatedSelectable(current, "right");
              break;

            case "PageUp":
              //next =
              break;

            case "PageDown":
              //next =
              break;
          }
        }
        else
        {
          switch(key)
          {
            case "Home":
            case "Down":
            case "Right":
            case "PageDown":
              next = first;
              break;

            case "End":
            case "Up":
            case "Left":
            case "PageUp":
              next = last;
              break;
          }
        }

        // Process result
        if (next)
        {
          switch(mode)
          {
            case "single":
              this._setSelectedItem(next);
              break;

            case "additive":
              this._setLeadItem(next);
              break;

            case "multi":
              if (isShiftPressed)
              {
                var anchor = this._getAnchorItem();
                if (!anchor) {
                  this._setAnchorItem(anchor = this._getFirstSelectable());
                }

                this._setLeadItem(next);
                this._selectItemRange(anchor, next, isCtrlPressed);
              }
              else
              {
                this._setAnchorItem(next);
                this._setLeadItem(next);

                if (!isCtrlPressed) {
                  this._setSelectedItem(next);
                }
              }

              break;
          }

          this._scrollSelectableIntoView(next);
        }
      }
      else
      {
        // Do not stop this event
        return;
      }


      // Stop processed events
      event.stop();


      // Fire change event as needed
      this._fireChange();
    },






    /*
    ---------------------------------------------------------------------------
      SUPPORT FOR ITEM RANGES
    ---------------------------------------------------------------------------
    */

    _selectAllItems : function()
    {
      var range = this._getSelectables();
      for (var i=0, l=range.length; i<l; i++) {
        this._addToSelection(range[i]);
      }
    },


    _clearSelection : function()
    {
      var selection = this._selection;
      for (var hash in selection) {
        this._removeFromSelection(selection[hash]);
      }
    },


    _selectItemRange : function(item1, item2, extend)
    {
      var range = this._getSelectableRange(item1, item2);

      // Remove items which are not in the detected range
      if (!extend)
      {
        var selected = this._selection;
        var mapped = this.__rangeToMap(range);

        for (var hash in selected)
        {
          if (!mapped[hash]) {
            this._removeFromSelection(selected[hash]);
          }
        }
      }

      // Add new items to the selection
      for (var i=0, l=range.length; i<l; i++) {
        this._addToSelection(range[i]);
      }
    },


    _deselectItemRange : function(item1, item2)
    {
      var range = this._getSelectableRange(item1, item2);
      for (var i=0, l=range.length; i<l; i++) {
        this._removeFromSelection(range[i]);
      }
    },


    __rangeToMap : function(range)
    {
      var mapped = {};
      var item;

      for (var i=0, l=range.length; i<l; i++)
      {
        item = range[i];
        mapped[this._selectableToHashCode(item)] = item;
      }

      return mapped;
    },






    /*
    ---------------------------------------------------------------------------
      SINGLE ITEM QUERY AND MODIFICATION
    ---------------------------------------------------------------------------
    */

    /**
     * Detects whether the given item is currently selected.
     *
     * @type member
     * @param item {var} Any valid selectable item
     * @return {Boolean} Whether the item is selected
     */
    _isItemSelected : function(item)
    {
      var hash = this._selectableToHashCode(item);
      return !!this._selection[hash];
    },


    /**
     * Returns the first selected item. Only makes sense
     * when using manager in single selection mode.
     *
     * @type member
     * @return {var} The selected item (or <code>null</code>)
     */
    _getSelectedItem : function()
    {
      for (var hash in this._selection) {
        return this._selection[hash];
      }

      return null;
    },


    /**
     * Replace current selection with given item.
     *
     * @type member
     * @param item {var} Any valid selectable item
     * @return {void}
     */
    _setSelectedItem : function(item)
    {
      this._clearSelection();
      this._addToSelection(item);
    },


    _fireChange : function()
    {
      if (this.__selectionModified)
      {
        this.fireEvent("change");
        delete this.__selectionModified;
      }
    },






    /*
    ---------------------------------------------------------------------------
      MODIFY ITEM SELECTION
    ---------------------------------------------------------------------------
    */

    _addToSelection : function(item)
    {
      var hash = this._selectableToHashCode(item);

      if (!this._selection[hash])
      {
        this._selection[hash] = item;
        this._styleSelectable(item, "selected", true);

        this.__selectionModified = true;
      }
    },


    _toggleInSelection : function(item)
    {
      var hash = this._selectableToHashCode(item);

      if (!this._selection[hash])
      {
        this._selection[hash] = item;
        this._styleSelectable(item, "selected", true);
      }
      else
      {
        delete this._selection[hash];
        this._styleSelectable(item, "selected", false);
      }

      this.__selectionModified = true;
    },


    _removeFromSelection : function(item)
    {
      var hash = this._selectableToHashCode(item);

      if (this._selection[hash])
      {
        delete this._selection[hash];
        this._styleSelectable(item, "selected", false);

        this.__selectionModified = true;
      }
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_scrollTimer");
    this._disposeFields("_selection");
  }
});
