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
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Common base class for all native events (DOM events, IO events, ...).
 */
qx.Class.define("qx.event.type.Native",
{
  extend : qx.event.type.Event,

  members :
  {
    /**
     * Initialize the fields of the event. The event must be initialized before
     * it can be dispatched.
     *
     * @type member
     * @param nativeEvent {Event} The DOM event to use
     * @param bubbles {Boolean} Whether the event should bubble up the element
     *     hierarchy.
     * @param target {Object} The event target
     * @param relatedTarget {Object} The related event target
     * @return {qx.event.type.Event} The initialized event instance
     */
    init : function(nativeEvent, bubbles, target, relatedTarget)
    {
      this.base(arguments);

      this._bubbles = !!bubbles;
      this._target = target || nativeEvent.target || nativeEvent.srcElement;
      this._relatedTarget = relatedTarget || nativeEvent.relatedTarget || nativeEvent.fromElement;

      if (nativeEvent.timeStamp) {
        this._timeStamp = nativeEvent.timeStamp;
      }

      this._native = nativeEvent;

      return this;
    },


    // overridden
    clone : function(embryo)
    {
      var clone = this.base(arguments, embryo);

      clone._native = this._native;

      return clone;
    },


    /**
     * Prevent browser default behaviour, e.g. opening the context menu, ...
     *
     * @type member
     * @return {void}
     */
    preventDefault : function() {
      qx.bom.Event.preventDefault(this._native);
    },


    /**
     * Stops event from all further processing. Execute this when the
     * current handler should have "exclusive rights" to the event
     * and no further reaction by anyone else should happen.
     *
     * @type member
     * @return {void}
     */
    stop : function()
    {
      this.stopPropagation();
      this.preventDefault();
    },


    /**
     * Get the native browser event object of this event.
     *
     * @return {Event} The native browser event
     * @internal
     */
    getNativeEvent : function() {
      return this._native;
    }
  },




  /*
  *****************************************************************************
     DESTRUCTOR
  *****************************************************************************
  */

  destruct : function() {
    this._disposeFields("_native");
  }
});
