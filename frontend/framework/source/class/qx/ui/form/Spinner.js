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

#module(ui_form)
#embed(qx.widgettheme/arrows/up_small.gif)
#embed(qx.widgettheme/arrows/down_small.gif)

************************************************************************ */

/**
 * @appearance spinner
 *
 * @appearance spinner-field {qx.ui.form.TextField}
 *
 * @appearance spinner-button-up {qx.ui.basic.Image}
 * @state pressed {spinner-button-up}
 *
 * @appearance spinner-button-down {qx.ui.basic.Image}
 * @state pressed {spinner-button-down}
 */
qx.Class.define("qx.ui.form.Spinner",
{
  extend : qx.ui.layout.HorizontalBoxLayout,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(vMin, vValue, vMax)
  {
    this.base(arguments);

    // ************************************************************************
    //   BEHAVIOR
    // ************************************************************************
    this.setTabIndex(-1);

    if (qx.core.Variant.isSet("qx.client", "mshtml")) {
      this.setStyleProperty("fontSize", "0px");
    }

    // ************************************************************************
    //   MANAGER
    // ************************************************************************
    this.setManager(new qx.type.Range());

    // ************************************************************************
    //   TEXTFIELD
    // ************************************************************************
    this._textfield = new qx.ui.form.TextField;
    this._textfield.setAppearance("spinner-field");
    // ALPHA: Testing override feature of initial appearance, see Class.js
    // this._textfield = qx.ui.core.Widget.create(qx.ui.form.TextField, "spinner-field");
    this._textfield.setValue(String(this.getManager().getValue()));
    this.add(this._textfield);

    // ************************************************************************
    //   BUTTON LAYOUT
    // ************************************************************************
    this._buttonlayout = new qx.ui.layout.VerticalBoxLayout;
    this._buttonlayout.setWidth("auto");
    this.add(this._buttonlayout);

    // ************************************************************************
    //   UP-BUTTON
    // ************************************************************************
    this._upbutton = new qx.ui.basic.Image("widget/arrows/up_small.gif");
    this._upbutton.setAppearance("spinner-button-up");
    this._buttonlayout.add(this._upbutton);

    // ************************************************************************
    //   DOWN-BUTTON
    // ************************************************************************
    this._downbutton = new qx.ui.basic.Image("widget/arrows/down_small.gif");
    this._downbutton.setAppearance("spinner-button-down");
    this._buttonlayout.add(this._downbutton);

    // ************************************************************************
    //   TIMER
    // ************************************************************************
    this._timer = new qx.client.Timer(this.getInterval());

    // ************************************************************************
    //   EVENTS
    // ************************************************************************
    this.addEventListener("keypress", this._onkeypress, this);
    this.addEventListener("keydown", this._onkeydown, this);
    this.addEventListener("keyup", this._onkeyup, this);
    this.addEventListener("mousewheel", this._onmousewheel, this);

    this._textfield.addEventListener("input", this._oninput, this);
    this._textfield.addEventListener("blur", this._onblur, this);
    this._upbutton.addEventListener("mousedown", this._onmousedown, this);
    this._downbutton.addEventListener("mousedown", this._onmousedown, this);
    this.getManager().addEventListener("change", this._onchange, this);
    this._timer.addEventListener("interval", this._oninterval, this);

    // ************************************************************************
    //   INITIALIZATION
    // ************************************************************************
    if (vMin != null) {
      this.setMin(vMin);
    }

    if (vMax != null) {
      this.setMax(vMax);
    }

    if (vValue != null) {
      this.setValue(vValue);
    }

    this._checkValue = this.__checkValue;
  },




  /*
  *****************************************************************************
     EVENTS
  *****************************************************************************
  */

  events: {
    "change" : "qx.event.type.Event"
  },




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
      defaultValue : "spinner"
    },


    /** The amount to increment on each event (keypress or mousedown). */
    incrementAmount :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 1
    },


    /** The amount to increment on each event (keypress or mousedown). */
    wheelIncrementAmount :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 1
    },


    /** The amount to increment on each pageup / pagedown keypress */
    pageIncrementAmount :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 10
    },


    /** The current value of the interval (this should be used internally only). */
    interval :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 100
    },


    /** The first interval on event based shrink/growth of the value. */
    firstInterval :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 500
    },


    /** This configures the minimum value for the timer interval. */
    minTimer :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 20
    },


    /** Decrease of the timer on each interval (for the next interval) until minTimer reached. */
    timerDecrease :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 2
    },


    /** If minTimer was reached, how much the amount of each interval should growth (in relation to the previous interval). */
    amountGrowth :
    {
      _legacy      : true,
      type         : "number",
      defaultValue : 1.01
    },

    editable :
    {
      _legacy      : true,
      type         : "boolean",
      defaultValue : true
    },

    manager :
    {
      _legacy      : true
    },

    checkValueFunction :
    {
      _legacy      : true
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
     * TODOC
     *
     * @type member
     * @param propValue {var} Current value
     * @param propOldValue {var} Previous value
     * @param propData {var} Property configuration map
     * @return {Boolean} TODOC
     */
    _modifyIncrementAmount : function(propValue, propOldValue, propData)
    {
      this._computedIncrementAmount = propValue;
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
    _modifyEditable : function(propValue, propOldValue, propData)
    {
      if (this._textfield)
      {
        this._textfield.setReadOnly(! propValue);
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
    _modifyManager : function(propValue, propOldValue, propData)
    {
      if (propOldValue)
      {
        propOldValue.removeEventListener("change", this._onchange, this);
      }

      if (propValue)
      {
        propValue.addEventListener("change", this._onchange, this);
      }

      if (this._textfield)
      {
        this._textfield.setValue(String(propValue.getValue()));
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
    _modifyCheckValueFunction : function(propValue, propOldValue, propData)
    {
      this._checkValue = propValue;
      return true;
    },


    /*
    ---------------------------------------------------------------------------
      PREFERRED DIMENSIONS
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @return {int} TODOC
     */
    _computePreferredInnerWidth : function() {
      return 50;
    },


    /**
     * TODOC
     *
     * @type member
     * @return {int} TODOC
     */
    _computePreferredInnerHeight : function() {
      return 14;
    },




    /*
    ---------------------------------------------------------------------------
      KEY EVENT-HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeypress : function(e)
    {
      var vIdentifier = e.getKeyIdentifier();

      if (vIdentifier == "Enter" && !e.isAltPressed())
      {
        this._checkValue(true, false, false);
        this._textfield.selectAll();
      }
      else
      {
        switch(vIdentifier)
        {
          case "Up":
          case "Down":
          case "Left":
          case "Right":
          case "Shift":
          case "Control":
          case "Alt":
          case "Escape":
          case "Delete":
          case "Backspace":
          case "Insert":
          case "Home":
          case "End":
          case "PageUp":
          case "PageDown":
          case "NumLock":
          case "Tab":
            break;

          default:
            if (vIdentifier >= "0" && vIdentifier <= "9") {
              return;
            }

            e.preventDefault();
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeydown : function(e)
    {
      var vIdentifier = e.getKeyIdentifier();

      if (this._intervalIncrease == null)
      {
        switch(vIdentifier)
        {
          case "Up":
          case "Down":
            this._intervalIncrease = vIdentifier == "Up";
            this._intervalMode = "single";

            this._resetIncrements();
            this._checkValue(true, false, false);

            this._increment();
            this._timer.startWith(this.getFirstInterval());

            break;

          case "PageUp":
          case "PageDown":
            this._intervalIncrease = vIdentifier == "PageUp";
            this._intervalMode = "page";

            this._resetIncrements();
            this._checkValue(true, false, false);

            this._pageIncrement();
            this._timer.startWith(this.getFirstInterval());

            break;
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onkeyup : function(e)
    {
      if (this._intervalIncrease != null)
      {
        switch(e.getKeyIdentifier())
        {
          case "Up":
          case "Down":
          case "PageUp":
          case "PageDown":
            this._timer.stop();

            this._intervalIncrease = null;
            this._intervalMode = null;
        }
      }
    },




    /*
    ---------------------------------------------------------------------------
      MOUSE EVENT-HANDLING
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
      if (!e.isLeftButtonPressed()) {
        return;
      }

      this._checkValue(true);

      var vButton = e.getCurrentTarget();

      vButton.addState("pressed");

      vButton.addEventListener("mouseup", this._onmouseup, this);
      vButton.addEventListener("mouseout", this._onmouseup, this);

      this._intervalIncrease = vButton == this._upbutton;
      this._resetIncrements();
      this._increment();

      this._textfield.selectAll();

      this._timer.setInterval(this.getFirstInterval());
      this._timer.start();
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
      var vButton = e.getCurrentTarget();

      vButton.removeState("pressed");

      vButton.removeEventListener("mouseup", this._onmouseup, this);
      vButton.removeEventListener("mouseout", this._onmouseup, this);

      this._textfield.selectAll();
      this._textfield.setFocused(true);

      this._timer.stop();
      this._intervalIncrease = null;
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onmousewheel : function(e)
    {
      if (this.getManager().incrementValue)
      {
        this.getManager().incrementValue(this.getWheelIncrementAmount() *
                                         e.getWheelDelta());
      }
      else
      {
        this.getManager().setValue(this.getManager().getValue() +
                                   (this.getWheelIncrementAmount() *
                                    e.getWheelDelta()));
      }
      this._textfield.selectAll();
    },




    /*
    ---------------------------------------------------------------------------
      OTHER EVENT-HANDLING
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _oninput : function(e) {
      this._checkValue(true, true);
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onchange : function(e)
    {
      var vValue = this.getManager().getValue();

      this._textfield.setValue(String(vValue));

      if (vValue == this.getMin())
      {
        this._downbutton.removeState("pressed");
        this._downbutton.setEnabled(false);
        this._timer.stop();
      }
      else
      {
        this._downbutton.setEnabled(true);
      }

      if (vValue == this.getMax())
      {
        this._upbutton.removeState("pressed");
        this._upbutton.setEnabled(false);
        this._timer.stop();
      }
      else
      {
        this._upbutton.setEnabled(true);
      }

      if (this.hasEventListeners("change")) {
        this.dispatchEvent(new qx.event.type.Event("change"), true);
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _onblur : function(e) {
      this._checkValue(false);
    },




    /*
    ---------------------------------------------------------------------------
      MAPPING TO RANGE MANAGER
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param nValue {Number} TODOC
     * @return {void}
     */
    setValue : function(nValue) {
      this.getManager().setValue(nValue);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getValue : function()
    {
      this._checkValue(true);
      return this.getManager().getValue();
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    resetValue : function() {
      return this.getManager().resetValue();
    },


    /**
     * TODOC
     *
     * @type member
     * @param vMax {var} TODOC
     * @return {var} TODOC
     */
    setMax : function(vMax) {
      return this.getManager().setMax(vMax);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getMax : function() {
      return this.getManager().getMax();
    },


    /**
     * TODOC
     *
     * @type member
     * @param vMin {var} TODOC
     * @return {var} TODOC
     */
    setMin : function(vMin) {
      return this.getManager().setMin(vMin);
    },


    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getMin : function() {
      return this.getManager().getMin();
    },




    /*
    ---------------------------------------------------------------------------
      INTERVAL HANDLING
    ---------------------------------------------------------------------------
    */

    _intervalIncrease : null,


    /**
     * TODOC
     *
     * @type member
     * @param e {Event} TODOC
     * @return {void}
     */
    _oninterval : function(e)
    {
      this._timer.stop();
      this.setInterval(Math.max(this.getMinTimer(), this.getInterval() - this.getTimerDecrease()));

      if (this._intervalMode == "page") {
        this._pageIncrement();
      }
      else
      {
        if (this.getInterval() == this.getMinTimer()) {
          this._computedIncrementAmount = this.getAmountGrowth() * this._computedIncrementAmount;
        }

        this._increment();
      }

      switch(this._intervalIncrease)
      {
        case true:
          if (this.getValue() == this.getMax()) {
            return;
          }

        case false:
          if (this.getValue() == this.getMin()) {
            return;
          }
      }

      this._timer.restartWith(this.getInterval());
    },




    /*
    ---------------------------------------------------------------------------
      UTILITY
    ---------------------------------------------------------------------------
    */

    /**
     * TODOC
     *
     * @type member
     * @param acceptEmpty {var} TODOC
     * @param acceptEdit {var} TODOC
     * @return {void}
     */
    __checkValue : function(acceptEmpty, acceptEdit)
    {
      var el = this._textfield.getElement();

      if (!el) {
        return;
      }

      if (el.value == "")
      {
        if (!acceptEmpty)
        {
          el.value = this.resetValue();
          this._textfield.selectAll();

          return;
        }
      }
      else
      {
        // cache working variable
        var val = el.value;

        // fix leading '0'
        if (val.length > 1)
        {
          while (val.charAt(0) == "0") {
            val = val.substr(1, val.length);
          }

          var f1 = parseInt(val) || 0;

          if (f1 != el.value)
          {
            el.value = f1;
            return;
          }
        }

        // fix for negative integer handling
        if (val == "-" && acceptEmpty && this.getMin() < 0)
        {
          if (el.value != val) {
            el.value = val;
          }

          return;
        }

        // parse the string
        val = parseInt(val);

        // main check routine
        var doFix = true;
        var fixedVal = this.getManager()._checkValue(val);

        if (isNaN(fixedVal)) {
          fixedVal = this.getManager().getValue();
        }

        // handle empty string
        if (acceptEmpty && val == "") {
          doFix = false;
        }
        else if (!isNaN(val))
        {
          // check for editmode in keypress events
          if (acceptEdit)
          {
            // fix min/max values
            if (val > fixedVal && !(val > 0 && fixedVal <= 0) && String(val).length < String(fixedVal).length) {
              doFix = false;
            } else if (val < fixedVal && !(val < 0 && fixedVal >= 0) && String(val).length < String(fixedVal).length) {
              doFix = false;
            }
          }
        }

        // apply value fix
        if (doFix && el.value != fixedVal) {
          el.value = fixedVal;
        }

        // inform manager
        if (!acceptEdit) {
          this.getManager().setValue(fixedVal);
        }
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _increment : function()
    {
      if (this.getManager().incrementValue)
      {
        this.getManager().incrementValue((this._intervalIncrease ? 1 : -1) *
                                         this._computedIncrementAmount);
      }
      else
      {
        this.getManager().setValue(this.getManager().getValue() +
                                   ((this._intervalIncrease ? 1 : -1) *
                                    this._computedIncrementAmount));
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _pageIncrement : function()
    {
      if (this.getManager().pageIncrementValue)
      {
        this.getManager().pageIncrementValue();
      }
      else
      {
        this.getManager().setValue(this.getManager().getValue() +
                                   ((this._intervalIncrease ? 1 : -1) *
                                    this.getPageIncrementAmount()));
      }
    },


    /**
     * TODOC
     *
     * @type member
     * @return {void}
     */
    _resetIncrements : function()
    {
      this._computedIncrementAmount = this.getIncrementAmount();
      this.resetInterval();
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function()
  {
    this._disposeObjects("_textfield", "_buttonlayout", "_upbutton", "_downbutton",
      "_timer");
  }
});
