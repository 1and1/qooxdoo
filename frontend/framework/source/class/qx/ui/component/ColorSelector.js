/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************


************************************************************************ */

/**
 * A typical color selector as known from native applications.
 *
 * Includes support for RGB and HSB color areas.
 *
 * @event dialogok {qx.event.type.Event}
 * @event dialogcancel {qx.event.type.Event}
 */
qx.OO.defineClass("qx.ui.component.ColorSelector", qx.ui.layout.VerticalBoxLayout,
function(vPreviousRed, vPreviousGreen, vPreviousBlue)
{
  qx.ui.layout.VerticalBoxLayout.call(this);

  // ********************************************
  //   CREATE CHILDREN
  // ********************************************

  // 1. Base Structure (Vertical Split)
  this._createControlBar();
  this._createButtonBar();

  // 2. Panes (Horizontal Split)
  this._createControlPane();
  this._createHueSaturationPane();
  this._createBrightnessPane();

  // 3. Control Pane Content
  this._createPresetFieldSet();
  this._createInputFieldSet();
  this._createPreviewFieldSet();

  // 4. Input FieldSet Content
  this._createHexField();
  this._createRgbSpinner();
  this._createHsbSpinner();

  // 5. Preview FieldSet Content
  this._createPreviewContent();


  // ********************************************
  //   INIT COLORS
  // ********************************************

  if (arguments.length == 3) {
    this.setPreviousColor(vPreviousRed, vPreviousGreen, vPreviousBlue);
  }
});

qx.OO.changeProperty({ name : "appearance", type : qx.constant.Type.STRING, defaultValue : "colorselector" });

qx.OO.addProperty({ name : "red", type : qx.constant.Type.NUMBER, defaultValue : 255 });
qx.OO.addProperty({ name : "green", type : qx.constant.Type.NUMBER, defaultValue : 255 });
qx.OO.addProperty({ name : "blue", type : qx.constant.Type.NUMBER, defaultValue : 255 });

qx.OO.addProperty({ name : "hue", type : qx.constant.Type.NUMBER, defaultValue : 0 });
qx.OO.addProperty({ name : "saturation", type : qx.constant.Type.NUMBER, defaultValue : 0 });
qx.OO.addProperty({ name : "brightness", type : qx.constant.Type.NUMBER, defaultValue : 100 });

/*
---------------------------------------------------------------------------
  LOCALIZATION SUPPORT
---------------------------------------------------------------------------
*/

qx.Settings.setDefault("labelOK", "OK");
qx.Settings.setDefault("labelCancel", "Cancel");
qx.Settings.setDefault("labelPresets", "Presets");
qx.Settings.setDefault("labelDetails", "Details");
qx.Settings.setDefault("labelPreview", "Preview (Old/New)");
qx.Settings.setDefault("labelRGB", "RGB");
qx.Settings.setDefault("labelHSB", "HSB");
qx.Settings.setDefault("labelHex", "Hex");




/*
---------------------------------------------------------------------------
  CONTEXT HANDLING
---------------------------------------------------------------------------
*/

qx.Proto._updateContext = null;

// Constants for internal compares (optimize performance in mshtml)
qx.ui.component.ColorSelector.CONTEXT_RED_MODIFIER = "redModifier";
qx.ui.component.ColorSelector.CONTEXT_GREEN_MODIFIER = "greenModifier";
qx.ui.component.ColorSelector.CONTEXT_BLUE_MODIFIER = "blueModifier";

qx.ui.component.ColorSelector.CONTEXT_HUE_MODIFIER = "hueModifier";
qx.ui.component.ColorSelector.CONTEXT_SATURATION_MODIFIER = "saturationModifier";
qx.ui.component.ColorSelector.CONTEXT_BRIGHTNESS_MODIFIER = "brightnessModifier";

qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER = "hsbSpinner";
qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER = "rgbSpinner";

qx.ui.component.ColorSelector.CONTEXT_HEX_FIELD = "hexField";

qx.ui.component.ColorSelector.CONTEXT_HUE_SATURATION_FIELD = "hueSaturationField";
qx.ui.component.ColorSelector.CONTEXT_BRIGHTNESS_FIELD = "brightnessField";










/*
---------------------------------------------------------------------------
  CREATE #1: BASE STRUCTURE
---------------------------------------------------------------------------
*/

qx.Proto._createControlBar = function()
{
  this._controlBar = new qx.ui.layout.HorizontalBoxLayout;
  this._controlBar.setHeight(qx.constant.Core.AUTO);
  this._controlBar.setParent(this);
}

qx.Proto._createButtonBar = function()
{
  this._btnbar = new qx.ui.layout.HorizontalBoxLayout;
  this._btnbar.setHeight(qx.constant.Core.AUTO);
  this._btnbar.setSpacing(4);
  this._btnbar.setHorizontalChildrenAlign(qx.constant.Layout.ALIGN_RIGHT);
  this._btnbar.setPadding(2, 4);
  this.add(this._btnbar);

  this._btncancel = new qx.ui.form.Button(this.getSetting("labelCancel"), "icon/16/button-cancel.png");
  this._btnok = new qx.ui.form.Button(this.getSetting("labelOK"), "icon/16/button-ok.png");

  this._btncancel.addEventListener(qx.constant.Event.EXECUTE, this._onButtonCancelExecute, this);
  this._btnok.addEventListener(qx.constant.Event.EXECUTE, this._onButtonOkExecute, this);

  this._btnbar.add(this._btncancel, this._btnok);
}






/*
---------------------------------------------------------------------------
  CREATE #2: PANES
---------------------------------------------------------------------------
*/

qx.Proto._createControlPane = function()
{
  this._controlPane = new qx.ui.layout.VerticalBoxLayout;
  this._controlPane.setWidth("auto");
  this._controlPane.setPadding(4);
  this._controlPane.setPaddingBottom(7);
  this._controlPane.setParent(this._controlBar);
}

qx.Proto._createHueSaturationPane = function()
{
  this._hueSaturationPane = new qx.ui.layout.CanvasLayout;
  this._hueSaturationPane.setWidth(qx.constant.Core.AUTO);
  this._hueSaturationPane.setPadding(6, 4);
  this._hueSaturationPane.setParent(this._controlBar);

  this._hueSaturationPane.addEventListener(qx.constant.Event.MOUSEWHEEL, this._onHueSaturationPaneMouseWheel, this);

  this._hueSaturationField = new qx.ui.basic.Image("widget/colorselector/huesaturation-field.jpg");
  this._hueSaturationField.setBorder(qx.renderer.border.BorderPresets.getInstance().thinInset);
  this._hueSaturationField.setMargin(5);
  this._hueSaturationField.setParent(this._hueSaturationPane);

  this._hueSaturationField.addEventListener(qx.constant.Event.MOUSEDOWN, this._onHueSaturationFieldMouseDown, this);

  this._hueSaturationHandle = new qx.ui.basic.Image("widget/colorselector/huesaturation-handle.gif");
  this._hueSaturationHandle.setLocation(0, 256);
  this._hueSaturationHandle.setParent(this._hueSaturationPane);

  this._hueSaturationHandle.addEventListener(qx.constant.Event.MOUSEDOWN, this._onHueSaturationHandleMouseDown, this);
  this._hueSaturationHandle.addEventListener(qx.constant.Event.MOUSEUP, this._onHueSaturationHandleMouseUp, this);
  this._hueSaturationHandle.addEventListener(qx.constant.Event.MOUSEMOVE, this._onHueSaturationHandleMouseMove, this);
}

qx.Proto._createBrightnessPane = function()
{
  this._brightnessPane = new qx.ui.layout.CanvasLayout;
  this._brightnessPane.setWidth(qx.constant.Core.AUTO);
  this._brightnessPane.setPadding(6, 4);
  this._brightnessPane.setParent(this._controlBar);

  this._brightnessPane.addEventListener(qx.constant.Event.MOUSEWHEEL, this._onBrightnessPaneMouseWheel, this);

  this._brightnessField = new qx.ui.basic.Image("widget/colorselector/brightness-field.jpg");
  this._brightnessField.setBorder(qx.renderer.border.BorderPresets.getInstance().thinInset);
  this._brightnessField.setMargin(5, 7);
  this._brightnessField.setParent(this._brightnessPane);

  this._brightnessField.addEventListener(qx.constant.Event.MOUSEDOWN, this._onBrightnessFieldMouseDown, this);

  this._brightnessHandle = new qx.ui.basic.Image("widget/colorselector/brightness-handle.gif");
  this._brightnessHandle.setLocation(0, 0);
  this._brightnessHandle.setParent(this._brightnessPane);

  this._brightnessHandle.addEventListener(qx.constant.Event.MOUSEDOWN, this._onBrightnessHandleMouseDown, this);
  this._brightnessHandle.addEventListener(qx.constant.Event.MOUSEUP, this._onBrightnessHandleMouseUp, this);
  this._brightnessHandle.addEventListener(qx.constant.Event.MOUSEMOVE, this._onBrightnessHandleMouseMove, this);
}







/*
---------------------------------------------------------------------------
  CREATE #3: CONTROL PANE CONTENT
---------------------------------------------------------------------------
*/

qx.Proto._createPresetFieldSet = function()
{
  this._presetFieldSet = new qx.ui.groupbox.GroupBox("Presets");
  this._presetFieldSet.setHeight(qx.constant.Core.AUTO);
  this._presetFieldSet.setParent(this._controlPane);

  this._presetGrid = new qx.ui.layout.GridLayout;
  this._presetGrid.setHorizontalSpacing(2);
  this._presetGrid.setVerticalSpacing(2);
  this._presetGrid.setColumnCount(11);
  this._presetGrid.setRowCount(4);
  this._presetGrid.setColumnWidth(0, 18);
  this._presetGrid.setColumnWidth(1, 18);
  this._presetGrid.setColumnWidth(2, 18);
  this._presetGrid.setColumnWidth(3, 18);
  this._presetGrid.setColumnWidth(4, 18);
  this._presetGrid.setColumnWidth(5, 18);
  this._presetGrid.setColumnWidth(6, 18);
  this._presetGrid.setColumnWidth(7, 18);
  this._presetGrid.setColumnWidth(8, 18);
  this._presetGrid.setColumnWidth(9, 18);

  this._presetGrid.setRowHeight(0, 16);
  this._presetGrid.setRowHeight(1, 16);
  this._presetFieldSet.add(this._presetGrid);

  this._presetTable = [ "maroon", "red", "orange", "yellow", "olive", "purple", "fuchsia", "lime", "green", "navy", "blue", "aqua", "teal", "black", "#333", "#666", "#999", "#BBB", "#EEE", "white" ];

  var colorField;

  for (var i=0; i<2; i++)
  {
    for (var j=0; j<10; j++)
    {
      colorField = new qx.ui.basic.Terminator;
      colorField.setBorder(qx.renderer.border.BorderPresets.getInstance().thinInset);
      colorField.setBackgroundColor(this._presetTable[i*10+j]);
      colorField.addEventListener(qx.constant.Event.MOUSEDOWN, this._onColorFieldClick, this);

      this._presetGrid.add(colorField, j, i);
    }
  }
}

qx.Proto._createInputFieldSet = function()
{
  this._inputFieldSet = new qx.ui.groupbox.GroupBox(this.getSetting("labelDetails"));
  this._inputFieldSet.setHeight(qx.constant.Core.AUTO);
  this._inputFieldSet.setParent(this._controlPane);

  this._inputLayout = new qx.ui.layout.VerticalBoxLayout;
  this._inputLayout.setHeight(qx.constant.Core.AUTO);
  this._inputLayout.setSpacing(10);
  this._inputLayout.setParent(this._inputFieldSet.getFrameObject());
}

qx.Proto._createPreviewFieldSet = function()
{
  this._previewFieldSet = new qx.ui.groupbox.GroupBox(this.getSetting("labelPreview"));
  this._previewFieldSet.setHeight(qx.constant.Core.FLEX);
  this._previewFieldSet.setParent(this._controlPane);

  this._previewLayout = new qx.ui.layout.HorizontalBoxLayout;
  this._previewLayout.setHeight(qx.constant.Core.HUNDREDPERCENT);
  this._previewLayout.setLocation(0, 0);
  this._previewLayout.setRight(0);
  this._previewLayout.setSpacing(10);
  this._previewLayout.setParent(this._previewFieldSet.getFrameObject());
}








/*
---------------------------------------------------------------------------
  CREATE #4: INPUT FIELDSET CONTENT
---------------------------------------------------------------------------
*/

qx.Proto._createHexField = function()
{
  this._hexLayout = new qx.ui.layout.HorizontalBoxLayout;
  this._hexLayout.setHeight(qx.constant.Core.AUTO);
  this._hexLayout.setSpacing(4);
  this._hexLayout.setVerticalChildrenAlign(qx.constant.Layout.ALIGN_MIDDLE);
  this._hexLayout.setParent(this._inputLayout);

  this._hexLabel = new qx.ui.basic.Label(this.getSetting("labelHex"));
  this._hexLabel.setWidth(25);
  this._hexLabel.setParent(this._hexLayout);

  this._hexHelper = new qx.ui.basic.Label("#");
  this._hexHelper.setParent(this._hexLayout);

  this._hexField = new qx.ui.form.TextField("FFFFFF");
  this._hexField.setWidth(50);
  this._hexField.setFont('11px "Bitstream Vera Sans Mono", monospace');
  this._hexField.setParent(this._hexLayout);

  this._hexField.addEventListener("changeValue", this._onHexFieldChange, this);
}

qx.Proto._createRgbSpinner = function()
{
  this._rgbSpinLayout = new qx.ui.layout.HorizontalBoxLayout;
  this._rgbSpinLayout.setHeight(qx.constant.Core.AUTO);
  this._rgbSpinLayout.setSpacing(4);
  this._rgbSpinLayout.setVerticalChildrenAlign(qx.constant.Layout.ALIGN_MIDDLE);
  this._rgbSpinLayout.setParent(this._inputLayout);

  this._rgbSpinLabel = new qx.ui.basic.Label(this.getSetting("labelRGB"));
  this._rgbSpinLabel.setWidth(25);
  this._rgbSpinLabel.setParent(this._rgbSpinLayout);

  this._rgbSpinRed = new qx.ui.form.Spinner(0, 255, 255);
  this._rgbSpinRed.setWidth(50);

  this._rgbSpinGreen = new qx.ui.form.Spinner(0, 255, 255);
  this._rgbSpinGreen.setWidth(50);

  this._rgbSpinBlue = new qx.ui.form.Spinner(0, 255, 255);
  this._rgbSpinBlue.setWidth(50);

  this._rgbSpinLayout.add(this._rgbSpinRed, this._rgbSpinGreen, this._rgbSpinBlue);

  this._rgbSpinRed.addEventListener("change", this._setRedFromSpinner, this);
  this._rgbSpinGreen.addEventListener("change", this._setGreenFromSpinner, this);
  this._rgbSpinBlue.addEventListener("change", this._setBlueFromSpinner, this);
}

qx.Proto._createHsbSpinner = function()
{
  this._hsbSpinLayout = new qx.ui.layout.HorizontalBoxLayout;
  this._hsbSpinLayout.setHeight(qx.constant.Core.AUTO);
  this._hsbSpinLayout.setSpacing(4);
  this._hsbSpinLayout.setVerticalChildrenAlign(qx.constant.Layout.ALIGN_MIDDLE);
  this._hsbSpinLayout.setParent(this._inputLayout);

  this._hsbSpinLabel = new qx.ui.basic.Label(this.getSetting("labelHSB"));
  this._hsbSpinLabel.setWidth(25);
  this._hsbSpinLayout.add(this._hsbSpinLabel);

  this._hsbSpinHue = new qx.ui.form.Spinner(0, 0, 360);
  this._hsbSpinHue.setWidth(50);

  this._hsbSpinSaturation = new qx.ui.form.Spinner(0, 0, 100);
  this._hsbSpinSaturation.setWidth(50);

  this._hsbSpinBrightness = new qx.ui.form.Spinner(0, 100, 100);
  this._hsbSpinBrightness.setWidth(50);

  this._hsbSpinLayout.add(this._hsbSpinHue, this._hsbSpinSaturation, this._hsbSpinBrightness);

  this._hsbSpinHue.addEventListener("change", this._setHueFromSpinner, this);
  this._hsbSpinSaturation.addEventListener("change", this._setSaturationFromSpinner, this);
  this._hsbSpinBrightness.addEventListener("change", this._setBrightnessFromSpinner, this);
}







/*
---------------------------------------------------------------------------
  CREATE #5: PREVIEW CONTENT
---------------------------------------------------------------------------
*/

qx.Proto._createPreviewContent = function()
{
  this._oldColorPreview = new qx.ui.basic.Terminator;
  this._oldColorPreview.setBorder(qx.renderer.border.BorderPresets.getInstance().thinInset);
  this._oldColorPreview.setWidth(qx.constant.Core.FLEX);
  this._oldColorPreview.setBackgroundImage("static/image/dotted_white.gif");
  this._oldColorPreview.setParent(this._previewLayout);

  this._newColorPreview = new qx.ui.basic.Terminator;
  this._newColorPreview.setBorder(qx.renderer.border.BorderPresets.getInstance().thinInset);
  this._newColorPreview.setWidth(qx.constant.Core.FLEX);
  this._newColorPreview.setBackgroundColor("white");
  this._newColorPreview.setParent(this._previewLayout);
}








/*
---------------------------------------------------------------------------
  RGB MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyRed = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = qx.ui.component.ColorSelector.CONTEXT_RED_MODIFIER;
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER) {
    this._rgbSpinRed.setValue(propValue);
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_HEX_FIELD) {
    this._setHexFromRgb();
  }

  switch(this._updateContext)
  {
    case qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER:
    case qx.ui.component.ColorSelector.CONTEXT_HEX_FIELD:
    case qx.ui.component.ColorSelector.CONTEXT_RED_MODIFIER:
      this._setHueFromRgb();
  }

  this._setPreviewFromRgb();

  if (this._updateContext === qx.ui.component.ColorSelector.CONTEXT_RED_MODIFIER) {
    this._updateContext = null;
  }

  return true;
}

qx.Proto._modifyGreen = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = qx.ui.component.ColorSelector.CONTEXT_GREEN_MODIFIER;
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER) {
    this._rgbSpinGreen.setValue(propValue);
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_HEX_FIELD) {
    this._setHexFromRgb();
  }

  switch(this._updateContext)
  {
    case qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER:
    case qx.ui.component.ColorSelector.CONTEXT_HEX_FIELD:
    case qx.ui.component.ColorSelector.CONTEXT_GREEN_MODIFIER:
      this._setHueFromRgb();
  }

  this._setPreviewFromRgb();

  if (this._updateContext === qx.ui.component.ColorSelector.CONTEXT_GREEN_MODIFIER) {
    this._updateContext = null;
  }

  return true;
}

qx.Proto._modifyBlue = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = qx.ui.component.ColorSelector.CONTEXT_BLUE_MODIFIER;
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER) {
    this._rgbSpinBlue.setValue(propValue);
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_HEX_FIELD) {
    this._setHexFromRgb();
  }

  switch(this._updateContext)
  {
    case qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER:
    case qx.ui.component.ColorSelector.CONTEXT_HEX_FIELD:
    case qx.ui.component.ColorSelector.CONTEXT_BLUE_MODIFIER:
      this._setHueFromRgb();
  }

  this._setPreviewFromRgb();

  if (this._updateContext === qx.ui.component.ColorSelector.CONTEXT_BLUE_MODIFIER) {
    this._updateContext = null;
  }

  return true;
}







/*
---------------------------------------------------------------------------
  HSB MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyHue = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = qx.ui.component.ColorSelector.CONTEXT_HUE_MODIFIER;
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER) {
    this._hsbSpinHue.setValue(propValue);
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_HUE_SATURATION_FIELD)
  {
    if (this._hueSaturationHandle.isCreated())
    {
      this._hueSaturationHandle._applyRuntimeLeft(Math.round(propValue / 1.40625) + this._hueSaturationPane.getPaddingLeft());
    }
    else
    {
      this._hueSaturationHandle.setLeft(Math.round(propValue / 1.40625));
    }
  }

  switch(this._updateContext)
  {
    case qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER:
    case qx.ui.component.ColorSelector.CONTEXT_HUE_SATURATION_FIELD:
    case qx.ui.component.ColorSelector.CONTEXT_HUE_MODIFIER:
      this._setRgbFromHue();
  }

  if (this._updateContext === qx.ui.component.ColorSelector.CONTEXT_HUE_MODIFIER) {
    this._updateContext = null;
  }

  return true;
}

qx.Proto._modifySaturation = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = qx.ui.component.ColorSelector.CONTEXT_SATURATION_MODIFIER;
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER) {
    this._hsbSpinSaturation.setValue(propValue);
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_HUE_SATURATION_FIELD)
  {
    if (this._hueSaturationHandle.isCreated())
    {
      this._hueSaturationHandle._applyRuntimeTop(256 - Math.round(propValue * 2.56) + this._hueSaturationPane.getPaddingTop());
    }
    else
    {
      this._hueSaturationHandle.setTop(256 - Math.round(propValue * 2.56));
    }
  }

  switch(this._updateContext)
  {
    case qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER:
    case qx.ui.component.ColorSelector.CONTEXT_HUE_SATURATION_FIELD:
    case qx.ui.component.ColorSelector.CONTEXT_SATURATION_MODIFIER:
      this._setRgbFromHue();
  }

  if (this._updateContext === qx.ui.component.ColorSelector.CONTEXT_SATURATION_MODIFIER) {
    this._updateContext = null;
  }

  return true;
}

qx.Proto._modifyBrightness = function(propValue, propOldValue, propData)
{
  if (this._updateContext === null) {
    this._updateContext = qx.ui.component.ColorSelector.CONTEXT_BRIGHTNESS_MODIFIER;
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER) {
    this._hsbSpinBrightness.setValue(propValue);
  }

  if (this._updateContext !== qx.ui.component.ColorSelector.CONTEXT_BRIGHTNESS_FIELD)
  {
    var topValue = 256 - Math.round(propValue * 2.56);

    if (this._brightnessHandle.isCreated())
    {
      this._brightnessHandle._applyRuntimeTop(topValue + this._brightnessPane.getPaddingTop());
    }
    else
    {
      this._brightnessHandle.setTop(topValue);
    }
  }

  switch(this._updateContext)
  {
    case qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER:
    case qx.ui.component.ColorSelector.CONTEXT_BRIGHTNESS_FIELD:
    case qx.ui.component.ColorSelector.CONTEXT_BRIGHTNESS_MODIFIER:
      this._setRgbFromHue();
  }

  if (this._updateContext === qx.ui.component.ColorSelector.CONTEXT_BRIGHTNESS_MODIFIER) {
    this._updateContext = null;
  }

  return true;
}








/*
---------------------------------------------------------------------------
  BRIGHTNESS IMPLEMENTATION
---------------------------------------------------------------------------
*/

qx.Proto._onBrightnessHandleMouseDown = function(e)
{
  // Activate Capturing
  this._brightnessHandle.setCapture(true);

  // Calculate subtract: Position of Brightness Field - Current Mouse Offset
  this._brightnessSubtract = qx.dom.DomLocation.getPageOuterTop(this._brightnessField.getElement()) + (e.getPageY() - qx.dom.DomLocation.getPageBoxTop(this._brightnessHandle.getElement()));

  // Block field event handling
  e.setPropagationStopped(true);
}

qx.Proto._onBrightnessHandleMouseUp = function(e)
{
  // Disabling capturing
  this._brightnessHandle.setCapture(false);
}

qx.Proto._onBrightnessHandleMouseMove = function(e)
{
  // Update if captured currently (through previous mousedown)
  if (this._brightnessHandle.getCapture()) {
    this._setBrightnessOnFieldEvent(e);
  }
}

qx.Proto._onBrightnessFieldMouseDown = function(e)
{
  // Calculate substract: Half height of handler
  this._brightnessSubtract = qx.dom.DomLocation.getPageOuterTop(this._brightnessField.getElement()) + Math.round(qx.dom.DomDimension.getBoxHeight(this._brightnessHandle.getElement()) / 2);

  // Update
  this._setBrightnessOnFieldEvent(e);

  // Afterwards: Activate Capturing for handle
  this._brightnessHandle.setCapture(true);
}

qx.Proto._onBrightnessPaneMouseWheel = function(e) {
  this.setBrightness(qx.lang.Number.limit(this.getBrightness() + e.getWheelDelta(), 0, 100));
}

qx.Proto._setBrightnessOnFieldEvent = function(e)
{
  var vValue = qx.lang.Number.limit(e.getPageY() - this._brightnessSubtract, 0, 256);

  this._updateContext = qx.ui.component.ColorSelector.CONTEXT_BRIGHTNESS_FIELD;

  if (this._brightnessHandle.isCreated())
  {
    this._brightnessHandle._applyRuntimeTop(vValue + this._brightnessPane.getPaddingTop());
  }
  else
  {
    this._brightnessHandle.setTop(vValue);
  }

  this.setBrightness(100-Math.round(vValue / 2.56));

  this._updateContext = null;
}

qx.Proto._onButtonOkExecute = function(e) {
  this.createDispatchEvent(qx.constant.Event.DIALOGOK);
}

qx.Proto._onButtonCancelExecute = function(e) {
  this.createDispatchEvent(qx.constant.Event.DIALOGCANCEL);
}






/*
---------------------------------------------------------------------------
  HUE/SATURATION IMPLEMENTATION
---------------------------------------------------------------------------
*/

qx.Proto._onHueSaturationHandleMouseDown = function(e)
{
  // Activate Capturing
  this._hueSaturationHandle.setCapture(true);

  // Calculate subtract: Position of HueSaturation Field - Current Mouse Offset
  this._hueSaturationSubtractTop = qx.dom.DomLocation.getPageOuterTop(this._hueSaturationField.getElement()) + (e.getPageY() - qx.dom.DomLocation.getPageBoxTop(this._hueSaturationHandle.getElement()));
  this._hueSaturationSubtractLeft = qx.dom.DomLocation.getPageOuterLeft(this._hueSaturationField.getElement()) + (e.getPageX() - qx.dom.DomLocation.getPageBoxLeft(this._hueSaturationHandle.getElement()));

  // Block field event handling
  e.setPropagationStopped(true);
}

qx.Proto._onHueSaturationHandleMouseUp = function(e)
{
  // Disabling capturing
  this._hueSaturationHandle.setCapture(false);
}

qx.Proto._onHueSaturationHandleMouseMove = function(e)
{
  // Update if captured currently (through previous mousedown)
  if (this._hueSaturationHandle.getCapture()) {
    this._setHueSaturationOnFieldEvent(e);
  }
}

qx.Proto._onHueSaturationFieldMouseDown = function(e)
{
  // Calculate substract: Half width/height of handler
  this._hueSaturationSubtractTop = qx.dom.DomLocation.getPageOuterTop(this._hueSaturationField.getElement()) + Math.round(qx.dom.DomDimension.getBoxHeight(this._hueSaturationHandle.getElement()) / 2);
  this._hueSaturationSubtractLeft = qx.dom.DomLocation.getPageOuterLeft(this._hueSaturationField.getElement()) + Math.round(qx.dom.DomDimension.getBoxWidth(this._hueSaturationHandle.getElement()) / 2);

  // Update
  this._setHueSaturationOnFieldEvent(e);

  // Afterwards: Activate Capturing for handle
  this._hueSaturationHandle.setCapture(true);
}

qx.Proto._onHueSaturationPaneMouseWheel = function(e) {
  this.setSaturation(qx.lang.Number.limit(this.getSaturation() + e.getWheelDelta(), 0, 100));
}

qx.Proto._setHueSaturationOnFieldEvent = function(e)
{
  var vTop = qx.lang.Number.limit(e.getPageY() - this._hueSaturationSubtractTop, 0, 256);
  var vLeft = qx.lang.Number.limit(e.getPageX() - this._hueSaturationSubtractLeft, 0, 256);

  if (this._hueSaturationHandle.isCreated())
  {
    this._hueSaturationHandle._applyRuntimeTop(vTop + this._hueSaturationPane.getPaddingTop());
    this._hueSaturationHandle._applyRuntimeLeft(vLeft + this._hueSaturationPane.getPaddingLeft());
  }
  else
  {
    this._hueSaturationHandle.setTop(vTop);
    this._hueSaturationHandle.setLeft(vLeft);
  }

  this._updateContext = qx.ui.component.ColorSelector.CONTEXT_HUE_SATURATION_FIELD;

  this.setSaturation(100-Math.round(vTop / 2.56));
  this.setHue(Math.round(vLeft * 1.40625));

  this._updateContext = null;
}










/*
---------------------------------------------------------------------------
  RGB SPINNER
---------------------------------------------------------------------------
*/

qx.Proto._setRedFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  }

  this._updateContext = qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER;
  this.setRed(this._rgbSpinRed.getValue());
  this._updateContext = null;
}

qx.Proto._setGreenFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  }

  this._updateContext = qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER;
  this.setGreen(this._rgbSpinGreen.getValue());
  this._updateContext = null;
}

qx.Proto._setBlueFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  }

  this._updateContext = qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER;
  this.setBlue(this._rgbSpinBlue.getValue());
  this._updateContext = null;
}










/*
---------------------------------------------------------------------------
  HSB SPINNER
---------------------------------------------------------------------------
*/

qx.Proto._setHueFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  }

  this._updateContext = qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER;
  this.setHue(this._hsbSpinHue.getValue());
  this._updateContext = null;
}

qx.Proto._setSaturationFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  }

  this._updateContext = qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER;
  this.setSaturation(this._hsbSpinSaturation.getValue());
  this._updateContext = null;
}

qx.Proto._setBrightnessFromSpinner = function()
{
  if (this._updateContext !== null) {
    return;
  }

  this._updateContext = qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER;
  this.setBrightness(this._hsbSpinBrightness.getValue());
  this._updateContext = null;
}








/*
---------------------------------------------------------------------------
  HEX FIELD
---------------------------------------------------------------------------
*/

qx.Proto._onHexFieldChange = function(e)
{
  if (this._updateContext !== null) {
    return;
  }

  var vValue = this._hexField.getValue().toLowerCase();

  var vRed = 0;
  var vGreen = 0;
  var vBlue = 0;

  switch(vValue.length)
  {
    case 3:
      vRed = qx.renderer.color.Color.m_rgb[vValue.charAt(0)];
      vGreen = qx.renderer.color.Color.m_rgb[vValue.charAt(1)];
      vBlue = qx.renderer.color.Color.m_rgb[vValue.charAt(2)];

      vRed = (vRed * 16) + vRed;
      vGreen = (vGreen * 16) + vGreen;
      vBlue = (vBlue * 16) + vBlue;

      break;

    case 6:
      vRed = (qx.renderer.color.Color.m_rgb[vValue.charAt(0)] * 16) + qx.renderer.color.Color.m_rgb[vValue.charAt(1)];
      vGreen = (qx.renderer.color.Color.m_rgb[vValue.charAt(2)] * 16) + qx.renderer.color.Color.m_rgb[vValue.charAt(3)];
      vBlue = (qx.renderer.color.Color.m_rgb[vValue.charAt(4)] * 16) + qx.renderer.color.Color.m_rgb[vValue.charAt(5)];

      break;

    default:
      return false;
  }

  this._updateContext = qx.ui.component.ColorSelector.CONTEXT_HEX_FIELD;

  this.setRed(vRed);
  this.setGreen(vGreen);
  this.setBlue(vBlue);

  this._updateContext = null;
}

qx.Proto._setHexFromRgb = function() {
  this._hexField.setValue(qx.lang.String.pad(this.getRed().toString(16).toUpperCase(), 2) + qx.lang.String.pad(this.getGreen().toString(16).toUpperCase(), 2) + qx.lang.String.pad(this.getBlue().toString(16).toUpperCase(), 2));
}








/*
---------------------------------------------------------------------------
  COLOR FIELD
---------------------------------------------------------------------------
*/

qx.Proto._onColorFieldClick = function(e)
{
  var vColor = e.getTarget().getBackgroundColor();

  if (!vColor) {
    return this.error("Missing backgroundColor value for field: " + e.getTarget());
  }

  this.setRed(vColor.getRed());
  this.setGreen(vColor.getGreen());
  this.setBlue(vColor.getBlue());
}








/*
---------------------------------------------------------------------------
  RGB/HSB SYNC
---------------------------------------------------------------------------
*/

qx.Proto._setHueFromRgb = function()
{
  switch(this._updateContext)
  {
    case qx.ui.component.ColorSelector.CONTEXT_HSB_SPINNER:
    case qx.ui.component.ColorSelector.CONTEXT_HUE_SATURATION_FIELD:
    case qx.ui.component.ColorSelector.CONTEXT_BRIGHTNESS_FIELD:
      break;

    default:
      var vHsb = qx.util.ColorUtil.rgb2hsb(this.getRed(), this.getGreen(), this.getBlue());

      this.setHue(vHsb.hue);
      this.setSaturation(vHsb.saturation);
      this.setBrightness(vHsb.brightness);
  }
}

qx.Proto._setRgbFromHue = function()
{
  switch(this._updateContext)
  {
    case qx.ui.component.ColorSelector.CONTEXT_RGB_SPINNER:
    case qx.ui.component.ColorSelector.CONTEXT_HEX_FIELD:
      break;

    default:
      var vRgb = qx.util.ColorUtil.hsb2rgb(this.getHue(), this.getSaturation(), this.getBrightness());

      this.setRed(vRgb.red);
      this.setGreen(vRgb.green);
      this.setBlue(vRgb.blue);
  }
}






/*
---------------------------------------------------------------------------
  PREVIEW SYNC
---------------------------------------------------------------------------
*/

qx.Proto._setPreviewFromRgb = function()
{
  if (this._newColorPreview.isCreated())
  {
    // faster (omit qx.renderer.color.Color instances)
    this._newColorPreview._style.backgroundColor = qx.renderer.color.Color.rgb2style(this.getRed(), this.getGreen(), this.getBlue());
  }
  else
  {
    this._newColorPreview.setBackgroundColor([this.getRed(), this.getGreen(), this.getBlue()]);
  }
}

qx.Proto.setPreviousColor = function(vRed, vGreen, vBlue)
{
  this._oldColorPreview.setBackgroundImage(null);
  this._oldColorPreview.setBackgroundColor([vRed, vGreen, vBlue]);

  this.setRed(vRed);
  this.setGreen(vGreen);
  this.setBlue(vBlue);
}







/*
---------------------------------------------------------------------------
  DISPOSER
---------------------------------------------------------------------------
*/

qx.Proto.dispose = function()
{
  if (this.getDisposed()) {
    return;
  }

  if (this._controlBar)
  {
    this._controlBar.dispose();
    this._controlBar = null;
  }

  if (this._btnbar)
  {
    this._btnbar.dispose();
    this._btnbar = null;
  }

  if (this._btncancel)
  {
    this._btncancel.dispose();
    this._btncancel = null;
  }

  if (this._btnok)
  {
    this._btnok.dispose();
    this._btnok = null;
  }

  if (this._controlPane)
  {
    this._controlPane.dispose();
    this._controlPane = null;
  }

  if (this._hueSaturationPane)
  {
    this._hueSaturationPane.removeEventListener(qx.constant.Event.MOUSEWHEEL, this._onHueSaturationPaneMouseWheel, this);
    this._hueSaturationPane.dispose();
    this._hueSaturationPane = null;
  }

  if (this._hueSaturationField)
  {
    this._hueSaturationField.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onHueSaturationFieldMouseDown, this);
    this._hueSaturationField.dispose();
    this._hueSaturationField = null;
  }

  if (this._hueSaturationHandle)
  {
    this._hueSaturationHandle.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onHueSaturationHandleMouseDown, this);
    this._hueSaturationHandle.removeEventListener(qx.constant.Event.MOUSEUP, this._onHueSaturationHandleMouseUp, this);
    this._hueSaturationHandle.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onHueSaturationHandleMouseMove, this);
    this._hueSaturationHandle.dispose();
    this._hueSaturationHandle = null;
  }

  if (this._brightnessPane)
  {
    this._brightnessPane.removeEventListener(qx.constant.Event.MOUSEWHEEL, this._onBrightnessPaneMouseWheel, this);
    this._brightnessPane.dispose();
    this._brightnessPane = null;
  }

  if (this._brightnessField)
  {
    this._brightnessField.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onBrightnessFieldMouseDown, this);
    this._brightnessField.dispose();
    this._brightnessField = null;
  }

  if (this._brightnessHandle)
  {
    this._brightnessHandle.removeEventListener(qx.constant.Event.MOUSEDOWN, this._onBrightnessHandleMouseDown, this);
    this._brightnessHandle.removeEventListener(qx.constant.Event.MOUSEUP, this._onBrightnessHandleMouseUp, this);
    this._brightnessHandle.removeEventListener(qx.constant.Event.MOUSEMOVE, this._onBrightnessHandleMouseMove, this);
    this._brightnessHandle.dispose();
    this._brightnessHandle = null;
  }

  if (this._presetFieldSet)
  {
    this._presetFieldSet.dispose();
    this._presetFieldSet = null;
  }

  if (this._presetGrid)
  {
    this._presetGrid.dispose();
    this._presetGrid = null;
  }

  this._presetTable = null;

  if (this._inputFieldSet)
  {
    this._inputFieldSet.dispose();
    this._inputFieldSet = null;
  }

  if (this._inputLayout)
  {
    this._inputLayout.dispose();
    this._inputLayout = null;
  }

  if (this._previewFieldSet)
  {
    this._previewFieldSet.dispose();
    this._previewFieldSet = null;
  }

  if (this._previewLayout)
  {
    this._previewLayout.dispose();
    this._previewLayout = null;
  }

  if (this._hexLayout)
  {
    this._hexLayout.dispose();
    this._hexLayout = null;
  }

  if (this._hexLabel)
  {
    this._hexLabel.dispose();
    this._hexLabel = null;
  }

  if (this._hexHelper)
  {
    this._hexHelper.dispose();
    this._hexHelper = null;
  }

  if (this._hexField)
  {
    this._hexField.addEventListener("changeValue", this._onHexFieldChange, this);
    this._hexField.dispose();
    this._hexField = null;
  }

  if (this._rgbSpinLayout)
  {
    this._rgbSpinLayout.dispose();
    this._rgbSpinLayout = null;
  }

  if (this._rgbSpinLabel)
  {
    this._rgbSpinLabel.dispose();
    this._rgbSpinLabel = null;
  }

  if (this._rgbSpinRed)
  {
    this._rgbSpinRed.removeEventListener("change", this._setRedFromSpinner, this);
    this._rgbSpinRed.dispose();
    this._rgbSpinRed = null;
  }

  if (this._rgbSpinGreen)
  {
    this._rgbSpinGreen.removeEventListener("change", this._setGreenFromSpinner, this);
    this._rgbSpinGreen.dispose();
    this._rgbSpinGreen = null;
  }

  if (this._rgbSpinBlue)
  {
    this._rgbSpinBlue.removeEventListener("change", this._setBlueFromSpinner, this);
    this._rgbSpinBlue.dispose();
    this._rgbSpinBlue = null;
  }

  if (this._hsbSpinLayout)
  {
    this._hsbSpinLayout.dispose();
    this._hsbSpinLayout = null;
  }

  if (this._hsbSpinLabel)
  {
    this._hsbSpinLabel.dispose();
    this._hsbSpinLabel = null;
  }

  if (this._hsbSpinHue)
  {
    this._hsbSpinHue.removeEventListener("change", this._setHueFromSpinner, this);
    this._hsbSpinHue.dispose();
    this._hsbSpinHue = null;
  }

  if (this._hsbSpinSaturation)
  {
    this._hsbSpinSaturation.removeEventListener("change", this._setSaturationFromSpinner, this);
    this._hsbSpinSaturation.dispose();
    this._hsbSpinSaturation = null;
  }

  if (this._hsbSpinBrightness)
  {
    this._hsbSpinBrightness.removeEventListener("change", this._setBrightnessFromSpinner, this);
    this._hsbSpinBrightness.dispose();
    this._hsbSpinBrightness = null;
  }

  if (this._oldColorPreview)
  {
    this._oldColorPreview.dispose();
    this._oldColorPreview = null;
  }

  if (this._newColorPreview)
  {
    this._newColorPreview.dispose();
    this._newColorPreview = null;
  }

  return qx.ui.layout.VerticalBoxLayout.prototype.dispose.call(this);
}
