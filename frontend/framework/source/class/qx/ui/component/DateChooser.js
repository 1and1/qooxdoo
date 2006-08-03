/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 by STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#require(qx.util.format.DateFormat)
#require(qx.constant.Type)
#use(qx.constant.Core)
#use(qx.constant.Layout)
#use(qx.constant.Event)
#use(qx.event.type.DomEvent)

************************************************************************ */

/**
 * Shows calendar and allows choosing a date.
 *
 * @param date {Date,null} The initial date to show. If <code>null</code>
 *        the current day (today) is shown.
 */
qx.OO.defineClass("qx.ui.component.DateChooser", qx.ui.layout.BoxLayout,
function(date) {
  qx.ui.layout.BoxLayout.call(this);

  this.setOrientation(qx.constant.Layout.ORIENTATION_VERTICAL);

  // Create the navigation bar
  var navBar = new qx.ui.layout.BoxLayout;
  navBar.set({ width:null, height:"auto", spacing:1 });

  var lastYearBt = new qx.ui.toolbar.ToolBarButton(null, "widget/datechooser/lastYear.png");
  var lastMonthBt = new qx.ui.toolbar.ToolBarButton(null, "widget/datechooser/lastMonth.png");
  var monthYearLabel = new qx.ui.basic.Label;
  var nextMonthBt = new qx.ui.toolbar.ToolBarButton(null, "widget/datechooser/nextMonth.png");
  var nextYearBt = new qx.ui.toolbar.ToolBarButton(null, "widget/datechooser/nextYear.png");

  lastYearBt.set({ show:'icon', toolTip:new qx.ui.popup.ToolTip("Last year"), spacing:0 });
  lastMonthBt.set({ show:'icon', toolTip:new qx.ui.popup.ToolTip("Last month") });
  nextMonthBt.set({ show:'icon', toolTip:new qx.ui.popup.ToolTip("Next month") });
  nextYearBt.set({ show:'icon', toolTip:new qx.ui.popup.ToolTip("Next year") });

  lastYearBt.setAppearance("datechooser-toolbar-button");
  lastMonthBt.setAppearance("datechooser-toolbar-button");
  nextMonthBt.setAppearance("datechooser-toolbar-button");
  nextYearBt.setAppearance("datechooser-toolbar-button");

  lastYearBt.addEventListener("click", this._onNavButtonClicked, this);
  lastMonthBt.addEventListener("click", this._onNavButtonClicked, this);
  nextMonthBt.addEventListener("click", this._onNavButtonClicked, this);
  nextYearBt.addEventListener("click", this._onNavButtonClicked, this);

  this._lastYearBt = lastYearBt;
  this._lastMonthBt = lastMonthBt;
  this._nextMonthBt = nextMonthBt;
  this._nextYearBt = nextYearBt;

  monthYearLabel.setAppearance("datechooser-monthyear");
  monthYearLabel.set({ width:qx.constant.Core.FLEX });

  navBar.add(lastYearBt, lastMonthBt, monthYearLabel, nextMonthBt, nextYearBt);
  this._monthYearLabel = monthYearLabel;
  navBar.setHtmlAttribute("id", "navBar");

  // Calculate the cell width and height
  var testLabel = new qx.ui.basic.Label;
  var testParent = new qx.ui.layout.CanvasLayout;
  testParent.add(testLabel);
  testLabel.setHtml("Xx");
  testLabel.set({ paddingLeft : 5, paddingRight : 5 });
  testLabel.setAppearance("datechooser-weekday");
  var cellWidth = testLabel.getBoxWidth();
  var cellHeight = testLabel.getBoxHeight();
  testLabel.dispose();
  testParent.dispose();

  // Create the date pane
  var datePane = new qx.ui.layout.GridLayout;
  datePane.setAppearance("datechooser-datepane");
  datePane.set({ width:"100%", height:"auto" });
  datePane.setColumnCount(8);
  datePane.setRowCount(7);
  for (var i = 0; i < datePane.getColumnCount(); i++) {
    datePane.setColumnWidth(i, cellWidth);
  }
  for (var i = 0; i < datePane.getRowCount(); i++) {
    datePane.setRowHeight(i, cellHeight);
  }

  // Create the weekdays
  // Add an empty label as spacer for the week numbers
  var label = new qx.ui.basic.Label;
  label.setAppearance("datechooser-week");
  label.set({ width:"100%", height:"100%" });
  label.addState(qx.ui.component.DateChooser.STATE_HEADER);
  datePane.add(label, 0, 0);

  this._weekdayLabelArr = [];
  for (var i = 0; i < 7; i++) {
    var label = new qx.ui.basic.Label;
    label.setAppearance("datechooser-weekday");
    label.set({ width:"100%", height:"100%" });
    datePane.add(label, i + 1, 0);
    this._weekdayLabelArr.push(label);
  }

  // Add the days
  this._dayLabelArr = [];
  this._weekLabelArr = [];
  for (var y = 0; y < 6; y++) {
    // Add the week label
    var label = new qx.ui.basic.Label;
    label.setAppearance("datechooser-week");
    label.set({ width:"100%", height:"100%" });
    datePane.add(label, 0, y + 1);
    this._weekLabelArr.push(label);

    // Add the day labels
    for (var x = 0; x < 7; x++) {
      var label = new qx.ui.basic.Label;
      label.setAppearance("datechooser-day");
      label.set({ width:"100%", height:"100%" });
      label.addEventListener(qx.constant.Event.MOUSEDOWN, this._onDayClicked, this);
      datePane.add(label, x + 1, y + 1);
      this._dayLabelArr.push(label);
    }
  }

  // Make focusable
  this.setTabIndex(1);
  this.addEventListener(qx.constant.Event.KEYDOWN, this._onkeydown);

  // Show the right date
  var shownDate = (date != null) ? date : new Date();
  this.showMonth(shownDate.getMonth(), shownDate.getFullYear());

  // Add the main widgets
  this.add(navBar);
  this.add(datePane);

});


// ***** Properties *****

/** The start of the week. 0 = sunday, 1 = monday, and so on. */
qx.OO.addProperty({ name:"startOfWeek", type:qx.constant.Type.NUMBER, defaultValue:1 });
/** The currently shown month. 0 = january, 1 = february, and so on. */
qx.OO.addProperty({ name:"shownMonth", type:qx.constant.Type.NUMBER, defaultValue:null });
/** The currently shown year. */
qx.OO.addProperty({ name:"shownYear", type:qx.constant.Type.NUMBER, defaultValue:null });
/** {Date} The currently selected date. */
qx.OO.addProperty({ name:"date", type:qx.constant.Type.OBJECT, defaultValue:null });


// property checker
qx.Proto._checkDate = function(propValue, propData) {
  // Use a clone of the date internally since date instances may be changed
  return (propValue == null) ? null : new Date(propValue.getTime());
}


// property modifier
qx.Proto._modifyDate = function(propValue, propOldValue, propData) {
  var DateChooser = qx.ui.component.DateChooser;

  if ((propValue != null) && (this.getShownMonth() != propValue.getMonth()
    || this.getShownYear() != propValue.getFullYear()))
  {
    // The new date is in another month -> Show that month
    this.showMonth(propValue.getMonth(), propValue.getFullYear());
  } else {
    // The new date is in the current month -> Just change the states
    var newDay = (propValue == null) ? -1 : propValue.getDate();
    for (var i = 0; i < 6 * 7; i++) {
      var dayLabel = this._dayLabelArr[i];

      if (! dayLabel.hasState(DateChooser.STATE_OTHER_MONTH)) {
        var day = parseInt(dayLabel.getHtml());
        if (day == newDay) {
          dayLabel.addState(DateChooser.STATE_SELECTED);
        } else if (dayLabel.hasState(DateChooser.STATE_SELECTED)) {
          dayLabel.removeState(DateChooser.STATE_SELECTED);
        }
      }
    }
  }

  return true;
}


/**
 * Event handler. Called when a navigation button has been clicked.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onNavButtonClicked = function(evt) {
  var year = this.getShownYear();
  var month = this.getShownMonth();

  switch(evt.getCurrentTarget()) {
    case this._lastYearBt:
      year--;
      break;
    case this._lastMonthBt:
      month--;
      if (month < 0) {
        month = 11;
        year--;
      }
      break;
    case this._nextMonthBt:
      month++;
      if (month >= 12) {
        month = 0;
        year++;
      }
      break;
    case this._nextYearBt:
      year++;
      break;
  }

  this.showMonth(month, year);
}


/**
 * Event handler. Called when a day has been clicked.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onDayClicked = function(evt) {
  var time = evt.getCurrentTarget().dateTime;
  this.setDate(new Date(time));
}


/**
 * Event handler. Called when a key was pressed.
 *
 * @param evt {Map} the event.
 */
qx.Proto._onkeydown = function(evt) {
  var dayIncrement = null;
  var monthIncrement = null;
  var yearIncrement = null;
  if (evt.getModifiers() == 0) {
    switch(evt.getKeyCode()) {
      case qx.event.type.KeyEvent.keys.left:
        dayIncrement = -1;
        break;
      case qx.event.type.KeyEvent.keys.right:
        dayIncrement = 1;
        break;
      case qx.event.type.KeyEvent.keys.up:
        dayIncrement = -7;
        break;
      case qx.event.type.KeyEvent.keys.down:
        dayIncrement = 7;
        break;
      case qx.event.type.KeyEvent.keys.pageup:
        monthIncrement = -1;
        break;
      case qx.event.type.KeyEvent.keys.pagedown:
        monthIncrement = 1;
        break;
      case qx.event.type.KeyEvent.keys.esc:
        if (this.getDate() != null) {
          this.setDate(null);
          return true;
        }
    }
  } else if (evt.getModifiers() == qx.event.type.DomEvent.SHIFT_MASK) {
    switch(evt.getKeyCode()) {
      case qx.event.type.KeyEvent.keys.pageup:
        yearIncrement = -1;
        break;
      case qx.event.type.KeyEvent.keys.pagedown:
        yearIncrement = 1;
        break;
    }
  }

  if (dayIncrement != null || monthIncrement != null || yearIncrement != null) {
    var date = new Date(this.getDate().getTime()); // TODO: Do cloning in getter
    if (date == null) {
      date = new Date();
    } else {
      if (dayIncrement != null)   date.setDate(date.getDate() + dayIncrement);
      if (monthIncrement != null) date.setMonth(date.getMonth() + monthIncrement);
      if (yearIncrement != null)  date.setFullYear(date.getFullYear() + yearIncrement);
    }
    this.setDate(date);
  }
}


// ***** Methods *****


/**
 * Returns whether a certain day of week belongs to the week end.
 *
 * @param dayOfWeek {int} the day to check. (0 = sunday, 1 = monday, ...,
 *    6 = saturday)
 * @return {boolean} whether the day belongs to the week end.
 */
qx.Proto._isWeekend = function(dayOfWeek) {
  return (dayOfWeek == 0) || (dayOfWeek == 6);
}


/**
 * Shows a certain month.
 *
 * @param month {int,null} the month to show (0 = january). If not set the month
 *    will remain the same.
 * @param year {int,null} the year to show. If not set the year will remain the
 *    same.
 */
qx.Proto.showMonth = function(month, year) {
  if ((month != null && month != this.getShownMonth())
    || (year != null && year != this.getShownYear()))
  {
    if (month != null) {
      this.setShownMonth(month);
    }
    if (year != null) {
      this.setShownYear(year);
    }

    this._updateDatePane();
  }
}


/**
 * Updates the date pane.
 */
qx.Proto._updateDatePane = function() {
  var DateChooser = qx.ui.component.DateChooser;

  var today = new Date();
  var todayYear     = today.getFullYear();
  var todayMonth    = today.getMonth();
  var todayDayOfMonth = today.getDate();

  var selDate = this.getDate();
  var selYear     = (selDate == null) ? -1 : selDate.getFullYear();
  var selMonth    = (selDate == null) ? -1 : selDate.getMonth();
  var selDayOfMonth = (selDate == null) ? -1 : selDate.getDate();

  var shownMonth = this.getShownMonth();
  var shownYear  = this.getShownYear();

  var startOfWeek = this.getStartOfWeek();

  // Create a help date that points to the first of the current month
  var helpDate = new Date(this.getShownYear(), this.getShownMonth(), 1);

  this._monthYearLabel.setHtml(DateChooser.MONTH_YEAR_FORMAT.format(helpDate));

  // Show the day names
  var firstDayOfWeek = helpDate.getDay();
  var firstSundayInMonth = (1 + 7 - firstDayOfWeek) % 7;
  for (var i = 0; i < 7; i++) {
    var day = (i + startOfWeek) % 7;

    var dayLabel = this._weekdayLabelArr[i];

    helpDate.setDate(firstSundayInMonth + day);
    dayLabel.setHtml(DateChooser.WEEKDAY_FORMAT.format(helpDate));

    if (this._isWeekend(day)) {
      dayLabel.addState(DateChooser.STATE_WEEKEND);
    } else {
      dayLabel.removeState(DateChooser.STATE_WEEKEND);
    }
  }

  // Show the days
  helpDate = new Date(shownYear, shownMonth, 1);
  var nrDaysOfLastMonth = (7 + firstDayOfWeek - startOfWeek) % 7;
  helpDate.setDate(helpDate.getDate() - nrDaysOfLastMonth);
  for (var week = 0; week < 6; week++) {
    this._weekLabelArr[week].setHtml(DateChooser.WEEK_FORMAT.format(helpDate));

    for (var i = 0; i < 7; i++) {
      var dayLabel = this._dayLabelArr[week * 7 + i];

      var year     = helpDate.getFullYear();
      var month    = helpDate.getMonth();
      var dayOfMonth = helpDate.getDate();

      var isSelectedDate = (selYear == year && selMonth == month && selDayOfMonth == dayOfMonth);
      if (isSelectedDate) {
        dayLabel.addState(DateChooser.STATE_SELECTED);
      } else {
        dayLabel.removeState(DateChooser.STATE_SELECTED);
      }

      if (month != shownMonth) {
        dayLabel.addState(DateChooser.STATE_OTHER_MONTH);
      } else {
        dayLabel.removeState(DateChooser.STATE_OTHER_MONTH);
      }

      var isToday = (year == todayYear && month == todayMonth && dayOfMonth == todayDayOfMonth);
      if (isToday) {
        dayLabel.addState(DateChooser.STATE_TODAY);
      } else {
        dayLabel.removeState(DateChooser.STATE_TODAY);
      }

      dayLabel.setHtml("" + dayOfMonth);
      dayLabel.dateTime = helpDate.getTime();

      // Go to the next day
      helpDate.setDate(helpDate.getDate() + 1);
    }
  }
}


/** {string} The state of a week label when it is the header label. */
qx.Class.STATE_HEADER = "header";

/** {string} The state of a week day label when it belongs to the weekend. */
qx.Class.STATE_WEEKEND = "weekend";

/** {string} The state of a day label when it doesn't belong to the currently shown month. */
qx.Class.STATE_OTHER_MONTH = "otherMonth";

/** {string} The state of a day label when it's currently selected. */
qx.Class.STATE_SELECTED = "selected";

/** {string} The state of a day label when it's today. */
qx.Class.STATE_TODAY = "today";


/**
 * {qx.util.format.DateFormat} The format for the date year
 * label at the top center.
 */
qx.Class.MONTH_YEAR_FORMAT = new qx.util.format.DateFormat("MMMM yyyy");

/**
 * {qx.util.format.DateFormat} The format for the weekday
 * labels (the headers of the date table).
 */
qx.Class.WEEKDAY_FORMAT = new qx.util.format.DateFormat("EE");

/**
 * {qx.util.format.DateFormat} The format for the week labels.
 */
qx.Class.WEEK_FORMAT = new qx.util.format.DateFormat("ww");


// overridden
qx.Proto.dispose = function() {
  if (this.getDisposed()) {
    return true;
  }

  this._lastYearBt.removeEventListener("click", this._onNavButtonClicked, this);
  this._lastMonthBt.removeEventListener("click", this._onNavButtonClicked, this);
  this._nextMonthBt.removeEventListener("click", this._onNavButtonClicked, this);
  this._nextYearBt.removeEventListener("click", this._onNavButtonClicked, this);

  this._lastYearBt.dispose();
  this._lastMonthBt.dispose();
  this._nextMonthBt.dispose();
  this._nextYearBt.dispose();

  this._lastYearBt = null;
  this._lastMonthBt = null;
  this._nextMonthBt = null;
  this._nextYearBt = null;

  this._monthYearLabel.dispose();
  this._monthYearLabel = null;

  for (var i = 0; i < this._weekdayLabelArr.length; i++) {
    this._weekdayLabelArr[i].dispose();
  }
  this._weekdayLabelArr = null;

  for (var i = 0; i < this._dayLabelArr.length; i++) {
    this._dayLabelArr[i].dispose();
    this._dayLabelArr[i].removeEventListener(qx.constant.Event.MOUSEDOWN, this._onDayClicked, this);
  }
  this._dayLabelArr = null;

  for (var i = 0; i < this._weekLabelArr.length; i++) {
    this._weekLabelArr[i].dispose();
  }
  this._weekLabelArr = null;

  this.removeEventListener(qx.constant.Event.KEYDOWN, this._onkeydown);

  return qx.ui.layout.BoxLayout.prototype.dispose.call(this);
}
