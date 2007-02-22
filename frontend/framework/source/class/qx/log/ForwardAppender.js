/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Til Schneider (til132)

************************************************************************ */

/* ************************************************************************

#module(log)

************************************************************************ */

/**
 * An appender that forwards all log events to a log event processor.
 *
 * @param targetProcessor {LogEventProcessor} The log event processor Where to
 *    pass the log events.
 */
qx.Clazz.define("qx.log.ForwardAppender",
{
  extend : qx.log.Appender,




  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */

  construct : function(targetProcessor)
  {
    qx.log.Appender.call(this);

    this._targetProcessor = targetProcessor;
  },




  /*
  *****************************************************************************
     MEMBERS
  *****************************************************************************
  */

  members :
  {
    // overridden
    /**
     * TODOC
     *
     * @type member
     * @param evt {Event} TODOC
     * @return {void} 
     */
    appendLogEvent : function(evt) {
      this._targetProcessor.handleLogEvent(evt);
    }
  }
});
