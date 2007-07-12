
/**
 * Keyboard event object.
 *
 * the interface of this class is based on the DOM Level 3 keyboard event
 * interface: http://www.w3.org/TR/DOM-Level-3-Events/events.html#Events-KeyboardEvent
 */
qx.Class.define("qx.html2.event.KeyEvent",
{
  extend : qx.html2.event.Event,

  statics :
  {
    /**
     * TODOC
     *
     * @type static
     * @param domEvent {var} TODOC
     * @param eventType {var} TODOC
     * @param keyCode {var} TODOC
     * @param charCode {var} TODOC
     * @param keyIdentifier {var} TODOC
     * @return {var} TODOC
     */
    getInstance : function(domEvent, eventType, keyCode, charCode, keyIdentifier)
    {
      if (this.__instance == undefined) {
        this.__instance = new qx.html2.event.KeyEvent();
      }

      this.__instance.__initEvent(domEvent, eventType, keyCode, charCode, keyIdentifier);
      return this.__instance;
    }
  },

  members :
  {
    /**
     * TODOC
     *
     * @type member
     * @param domEvent {var} TODOC
     * @param eventType {var} TODOC
     * @param keyCode {var} TODOC
     * @param charCode {var} TODOC
     * @param keyIdentifier {var} TODOC
     * @return {void}
     */
    __initEvent : function(domEvent, eventType, keyCode, charCode, keyIdentifier)
    {
      this.base(arguments, domEvent);
      this._type = eventType;
      this._keyCode = keyCode;
      this._charCode = charCode;
      this._keyIdentifier = keyIdentifier;
    },

    // overridden
    /**
     * TODOC
     *
     * @type member
     * @return {var} TODOC
     */
    getType : function() {
      return this._type;
    },


    /**
     * Unicode number of the pressed character.
     * Only valid in "keyinput" events
     *
     * @type member
     * @return {var} TODOC
     */
    getCharCode : function() {
      return this._charCode;
    },


    /**
     * Identifier of the pressed key. This property is modeled after the <em>KeyboardEvent.keyIdentifier</em> property
     * of the W3C DOM 3 event specification (http://www.w3.org/TR/2003/NOTE-DOM-Level-3-Events-20031107/events.html#Events-KeyboardEvent-keyIdentifier).
     *
     * It is not valid in "keyinput" events"
     *
     * Printable keys are represented by a unicode string, non-printable keys have one of the following
     * values:
     *
     * <table>
     * <tr><th>Backspace</th><td>The Backspace (Back) key.</td></tr>
     * <tr><th>Tab</th><td>The Horizontal Tabulation (Tab) key.</td></tr>
     * <tr><th>Space</th><td>The Space (Spacebar) key.</td></tr>
     * <tr><th>Enter</th><td>The Enter key. Note: This key identifier is also used for the Return (Macintosh numpad) key.</td></tr>
     * <tr><th>Shift</th><td>The Shift key.</td></tr>
     * <tr><th>Control</th><td>The Control (Ctrl) key.</td></tr>
     * <tr><th>Alt</th><td>The Alt (Menu) key.</td></tr>
     * <tr><th>CapsLock</th><td>The CapsLock key</td></tr>
     * <tr><th>Meta</th><td>The Meta key. (Apple Meta and Windows key)</td></tr>
     * <tr><th>Escape</th><td>The Escape (Esc) key.</td></tr>
     * <tr><th>Left</th><td>The Left Arrow key.</td></tr>
     * <tr><th>Up</th><td>The Up Arrow key.</td></tr>
     * <tr><th>Right</th><td>The Right Arrow key.</td></tr>
     * <tr><th>Down</th><td>The Down Arrow key.</td></tr>
     * <tr><th>PageUp</th><td>The Page Up key.</td></tr>
     * <tr><th>PageDown</th><td>The Page Down (Next) key.</td></tr>
     * <tr><th>End</th><td>The End key.</td></tr>
     * <tr><th>Home</th><td>The Home key.</td></tr>
     * <tr><th>Insert</th><td>The Insert (Ins) key. (Does not fire in Opera/Win)</td></tr>
     * <tr><th>Delete</th><td>The Delete (Del) Key.</td></tr>
     * <tr><th>F1</th><td>The F1 key.</td></tr>
     * <tr><th>F2</th><td>The F2 key.</td></tr>
     * <tr><th>F3</th><td>The F3 key.</td></tr>
     * <tr><th>F4</th><td>The F4 key.</td></tr>
     * <tr><th>F5</th><td>The F5 key.</td></tr>
     * <tr><th>F6</th><td>The F6 key.</td></tr>
     * <tr><th>F7</th><td>The F7 key.</td></tr>
     * <tr><th>F8</th><td>The F8 key.</td></tr>
     * <tr><th>F9</th><td>The F9 key.</td></tr>
     * <tr><th>F10</th><td>The F10 key.</td></tr>
     * <tr><th>F11</th><td>The F11 key.</td></tr>
     * <tr><th>F12</th><td>The F12 key.</td></tr>
     * <tr><th>NumLock</th><td>The Num Lock key.</td></tr>
     * <tr><th>PrintScreen</th><td>The Print Screen (PrintScrn, SnapShot) key.</td></tr>
     * <tr><th>Scroll</th><td>The scroll lock key</td></tr>
     * <tr><th>Pause</th><td>The pause/break key</td></tr>
     * <tr><th>Win</th><td>The Windows Logo key</td></tr>
     * <tr><th>Apps</th><td>The Application key (Windows Context Menu)</td></tr>
     * </table>
     *
     * @type member
     * @return {var} TODOC
     */
    getKeyIdentifier : function() {
      return this._keyIdentifier;
    },


    /**
     * Returns whether the the ctrl key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the ctrl key is pressed.
     */
    isCtrlPressed : function() {
      return this._event.ctrlKey;
    },


    /**
     * Returns whether the the shift key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the shift key is pressed.
     */
    isShiftPressed : function() {
      return this._event.shiftKey;
    },


    /**
     * Returns whether the the alt key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the alt key is pressed.
     */
    isAltPressed : function() {
      return this._event.altKey;
    },


    /**
     * Returns whether the the meta key is pressed.
     *
     * @type member
     * @return {Boolean} whether the the meta key is pressed.
     */
    isMetaPressed : function() {
      return this._event.metaKey;
    },


    /**
     * Returns whether the ctrl key or (on the Mac) the command key is pressed.
     *
     * @type member
     * @return {Boolean} <code>true</code> if the command key is pressed on the Mac
     *             or the ctrl key is pressed on another system.
     */
    isCtrlOrCommandPressed : function()
    {
      if (qx.core.Client.getInstance().runsOnMacintosh()) {
        return this._event.metaKey;
      } else {
        return this._event.ctrlKey;
      }
    }
  }
});
