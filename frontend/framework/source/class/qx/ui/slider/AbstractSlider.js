/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's left-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/* ************************************************************************

#use(qx.event.handler.DragDrop)

************************************************************************ */

/**
 */
qx.Class.define("qx.ui.slider.AbstractSlider",
{
  extend : qx.ui.core.Widget,



  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(orientation)
  {
    this.base(arguments);

    this._setLayout(new qx.ui.layout.Canvas());

    this.addListener("mousedown", this._onMousedown, this);
    this.addListener("mouseup", this._onMouseup, this);
    this.addListener("losecapture", this._onMouseup, this);
    this.addListener("mousewheel", this._onMousewheel, this);
    this.addListener("resize", this._onResize, this);

    this._sliderPos = 0;
    this._scrollSize = 0;
    this._sliderSize = 0;
    this._slider = new qx.ui.core.Widget().set({
      appearance : "slider-knob"
    });
    this._add(this._slider);

    this._slider.getContainerElement().addListener("dragstart", this._onDragstartSlider, this);
    this._slider.getContainerElement().addListener("drag", this._onDragmoveSlider, this);
    this._slider.getContainerElement().addListener("dragend", this._onDragstopSlider, this);
    this._slider.addListener("resize", this._onResize, this);

    if (orientation != null) {
      this.setOrientation(orientation);
    } else {
      this.initOrientation();
    }

    this.__timer = new qx.event.Timer(100);
    this.__timer.addListener("interval", this._onInterval, this);
  },




  /*
  *****************************************************************************
     PROPERTIES
  *****************************************************************************
  */

  properties :
  {
    /** Whether the slider is horizontal or vertical. */
    orientation :
    {
      check : [ "horizontal", "vertical" ],
      init : "horizontal",
      apply : "_applyOrientation"
    },

    /** The current slider value */
    value :
    {
      check : "Integer",
      init : 0,
      apply : "_applyValue",
      event : "changeValue"
    },

    /**
     * The minimum slider value (may be nagative). This value must be smaller
     * than {@link #maximum}.
     */
    minimum :
    {
      check : "Integer",
      init : 0,
      apply : "_applyMinimum"
    },

    /**
     * The maximum slider value. This value must be larger than {@link #minimum}.
     */
    maximum :
    {
      check : "Integer",
      init : 100,
      apply : "_applyMaximum"
    },

    /** The amount to increment on each event (keypress or mousedown) */
    singleStep :
    {
      check : "Integer",
      init : 1
    },

    /** The amount to increment on each pageup/pagedown keypress */
    pageStep :
    {
      check : "Integer",
      init : 10
    },

    /** The amount to increment on a mouse wheel event */
    wheelStep:
    {
      check : "Number",
      init : 1
    }
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    _valueToPixel : function(value)
    {
      // avoid division by zero
      if (this.getMinimum() == this.getMaximum()) {
        return 0;
      }

      var sliderRange = this._scrollSize - this._sliderSize;
      var valueRange = (this.getMaximum() - this.getMinimum()) / this.getSingleStep();

      return Math.round(sliderRange * ((value - this.getMinimum()) / this.getSingleStep()) / valueRange);
    },


    _pixelToValue : function(pixelValue)
    {
      var sliderRange = this._scrollSize - this._sliderSize;
      // avoid division by zero
      if (sliderRange == 0) {
        return this.getMinimum();
      }

      var valueRange = (this.getMaximum() - this.getMinimum()) / this.getSingleStep();

      return Math.round(valueRange * pixelValue / sliderRange) * this.getSingleStep() + this.getMinimum();
    },


    // overridden
    _getContentHint : function()
    {
      var isHorizontal = this.getOrientation() === "horizontal";
      var sliderHint = this._slider.getSizeHint();
      if (isHorizontal)
      {
        return {
          minWidth: sliderHint.minWidth,
          width: 200,
          minHeight: sliderHint.minHeight,
          height: sliderHint.height
        }
      }
      else
      {
        return {
          minWidth: sliderHint.minWidth,
          width: sliderHint.width,
          minHeight: sliderHint.minHeight,
          height: 200
        }
      }
    },


    _onMousedown : function(e)
    {
      if (e.getTarget() !== this) {
        return;
      }

      this.addListener("mousemove", this._onMousemove, this);
      this.capture();

      this.__lastMouseTarget = e.getTarget();
      this.__lastMouseX = e.getDocumentLeft();
      this.__lastMouseY = e.getDocumentTop();

      this.__timer.start();

      // do the first action immediately!
      this._onInterval();
    },

    _onMouseup : function(e)
    {
      this.releaseCapture();
      this.removeListener("mousemove", this._onMousemove, this);
      this.__timer.stop();
    },


    _onMousemove : function(e)
    {
      this.__lastMouseTarget = e.getTarget();
      this.__lastMouseX = e.getDocumentLeft();
      this.__lastMouseY = e.getDocumentTop();
    },


    _onInterval : function(e)
    {
      if (!this.__lastMouseTarget || this.__lastMouseTarget !== this) {
        return;
      }

      var location = qx.bom.element.Location.get(this.getContainerElement().getDomElement());
      var isHorizontal = this.getOrientation() === "horizontal";

      var relativeClickPosition = isHorizontal
        ? this.__lastMouseX - location.left
        : this.__lastMouseY - location.top;

      var halfSliderSize = Math.round(this._sliderSize / 2);
      var difference = relativeClickPosition - this._sliderPos;
      var pixelPageStep = this._valueToPixel(this.getPageStep());

      if (
        Math.abs(difference) <= pixelPageStep ||
        Math.abs(difference) < halfSliderSize
      )
      {
        this._setSliderPosition(relativeClickPosition - halfSliderSize, true);
      }
      else
      {
        if (difference > 0) {
          this.scrollPageForward();
        } else {
          this.scrollPageBack();
        }
      }
    },


    _onMousewheel : function(e)
    {
      var wheelIncrement = Math.round(-e.getWheelDelta());
      if (wheelIncrement == 0) {
        wheelIncrement = wheelIncrement <= 0 ? -1 : 1;
      }
      this.scrollBy(wheelIncrement * this.getWheelStep());
      e.stopPropagation();
    },


    _onResize : function(e)
    {
      var isHorizontal = this.getOrientation() === "horizontal";

      var size = this.getComputedInnerSize();
      this._scrollSize = isHorizontal ? size.width : size.height;

      var sliderSize = this._slider.getBounds();
      this._sliderSize = isHorizontal ? sliderSize.width : sliderSize.height;

      this._updateSliderPosition();
    },


    _onDragstartSlider : function(e) {
      this._sliderStartPos = this._sliderPos;
    },


    _onDragstopSlider : function(e) {
    },


    _onDragmoveSlider : function(e)
    {
      var dragOffsetLeft = e.getDragOffsetLeft();
      var dragOffsetTop = e.getDragOffsetTop();

      var isHorizontal = this.getOrientation() === "horizontal";
      var sliderPos = isHorizontal
        ? this._sliderStartPos + dragOffsetLeft
        : this._sliderStartPos + dragOffsetTop;

      this._setSliderPosition(sliderPos, true);
    },


    _setSliderPosition : function(sliderPosition, updateValue)
    {
      var range = this._scrollSize - this._sliderSize;
      this._sliderPos = Math.min(range, Math.max(0, sliderPosition));

      var isHorizontal = this.getOrientation() === "horizontal";
      var layout = this._getLayout();

      if (isHorizontal) {
        var props = {top: 0, right: null, bottom: 0, left: this._sliderPos};
      } else {
        var props = {top:this._sliderPos, right: 0, bottom: null, left: 0};
      }

      this._slider.setLayoutProperties(props);

      if (updateValue) {
        this.scrollTo(this._pixelToValue(sliderPosition));
      }
    },


    _updateSliderPosition : function() {
      this._setSliderPosition(this._valueToPixel(this.getValue()), false);
    },


    _updateSliderOrientation : function(isHorizontal)
    {
      var slider = this._slider;

      if (isHorizontal)
      {
        this.addState("horizontal");
        slider.addState("horizontal");
      }
      else
      {
        this.removeState("horizontal");
        slider.removeState("horizontal");
      }

      if (isHorizontal)
      {
        slider.setLayoutProperties({top:0,left:null});
      }
      else
      {
        slider.setLayoutProperties({left:0,top:null});
      }
    },


    _applyOrientation : function(value, old)
    {
      var hori = value === "horizontal";

      this.setAllowStretchX(hori);
      this.setAllowStretchY(!hori);

      this._updateSliderOrientation(hori);
      this.scheduleLayoutUpdate();
    },


    scrollStepForward : function() {
      this.scrollBy(this.getSingleStep());
    },

    scrollStepBack : function() {
      this.scrollBy(-this.getSingleStep());
    },

    scrollPageForward : function() {
      this.scrollBy(this.getPageStep());
    },

    scrollPageBack : function() {
      this.scrollBy(-this.getPageStep());
    },

    scrollBy : function(value)
    {
      var old = this.getValue();
      this.scrollTo(old + value);
    },

    scrollTo : function(value)
    {
      var max = this.getMaximum();
      var min = this.getMinimum();

      if (value < min) {
        value = min;
      } else if (value > max) {
        value = max;
      }

      this.setValue(value);
    },

    _applyValue : function(value, old) {
      this._updateSliderPosition();
    },

    _applyMinimum : function(value, old) {
      this._updateSliderPosition();
    },

    _applyMaximum : function(value, old) {
      this._updateSliderPosition();
    }
  }
});
