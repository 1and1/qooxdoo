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

#module(io_remote)
#require(qx.io.remote.Exchange)
#require(qx.util.Mime)

************************************************************************ */

/**
 * @event created {qx.event.type.Event}
 * @event configured {qx.event.type.Event}
 * @event sending {qx.event.type.Event}
 * @event receiving {qx.event.type.Event}
 * @event completed {qx.event.type.Event}
 * @event failed {qx.event.type.Event}
 * @event aborted {qx.event.type.Event}
 * @event timeout {qx.event.type.Event}
 */
qx.OO.defineClass("qx.io.remote.XmlHttpTransport",
                  qx.io.remote.AbstractRemoteTransport,
function()
{
  qx.io.remote.AbstractRemoteTransport.call(this);

  this._req = qx.io.remote.XmlHttpTransport.createRequestObject();

  var o = this;
  this._req.onreadystatechange =
      function(e) { return o._onreadystatechange(e); }
});





/* ************************************************************************
   Class data, properties and methods
************************************************************************ */

// basic registration to qx.io.remote.Exchange
// the real availability check (activeX stuff and so on) follows at the first real request
qx.io.remote.Exchange.registerType(qx.io.remote.XmlHttpTransport,
                                         "qx.io.remote.XmlHttpTransport");

qx.io.remote.XmlHttpTransport.handles =
{
  synchronous : true,
  asynchronous : true,
  crossDomain : false,
  fileUpload: false,
  programaticFormFields: false,
  responseTypes : [
                    qx.util.Mime.TEXT,
                    qx.util.Mime.JAVASCRIPT,
                    qx.util.Mime.JSON,
                    qx.util.Mime.XML,
                    qx.util.Mime.HTML
                  ]
}

qx.io.remote.XmlHttpTransport.requestObjects = [];
qx.io.remote.XmlHttpTransport.requestObjectCount = 0;

qx.io.remote.XmlHttpTransport.isSupported = function()
{
  return qx.net.HttpRequest.create() != null ? true : false;
};

qx.io.remote.XmlHttpTransport.createRequestObject = function() {
  return qx.net.HttpRequest.create();
}






/* ************************************************************************
   Instance data, properties and methods
************************************************************************ */

/*
---------------------------------------------------------------------------
  CORE METHODS
---------------------------------------------------------------------------
*/

qx.Proto._localRequest = false;
qx.Proto._lastReadyState = 0;

qx.Proto.getRequest = function() {
  return this._req;
}






/*
---------------------------------------------------------------------------
  USER METHODS
---------------------------------------------------------------------------
*/

qx.Proto.send = function()
{
  this._lastReadyState = 0;

  var vRequest = this.getRequest();
  var vMethod = this.getMethod();
  var vAsynchronous = this.getAsynchronous();
  var vUrl = this.getUrl();



  // --------------------------------------
  //   Local handling
  // --------------------------------------

  var vLocalRequest = (qx.core.Client.getInstance().getRunsLocally() &&
                       !(/^http(s){0,1}\:/.test(vUrl)));
  this._localRequest = vLocalRequest;


  // --------------------------------------
  //   Adding parameters, if not POST
  // --------------------------------------

  if (vMethod != qx.net.Http.METHOD_POST) {
    var vParameters = this.getParameters();
    var vParametersList = [];
    for (var vId in vParameters) {
      var value = vParameters[vId];
      if (value instanceof Array) {
        for (var i = 0; i < value.length; i++) {
          vParametersList.push(encodeURIComponent(vId) + "=" +
                               encodeURIComponent(value[i]));
        }
      } else {
        vParametersList.push(encodeURIComponent(vId) + "=" +
                             encodeURIComponent(value));
      }
    }

    if (vParametersList.length > 0) {
      vUrl += (vUrl.indexOf("?") >= 0
               ? "&" : "?") + vParametersList.join("&");
    }
  }

  var encode64 = function (input) {
    var keyStr =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var output = "";
    var chr1, chr2, chr3;
    var enc1, enc2, enc3, enc4;
    var i = 0;

    do {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output +=
        keyStr.charAt(enc1) +
        keyStr.charAt(enc2) +
        keyStr.charAt(enc3) +
        keyStr.charAt(enc4);

    } while (i < input.length);

    return output;
  }

  // --------------------------------------
  //   Opening connection
  // --------------------------------------

  if (this.getUsername()) {
    if (this.getUseBasicHttpAuth()) {
      vRequest.open(vMethod, vUrl, vAsynchronous);
      vRequest.setRequestHeader('Authorization',
                                'Basic ' + encode64(this.getUsername() +
                                                    ':' +
                                                    this.getPassword()));
    } else {
      vRequest.open(vMethod, vUrl, vAsynchronous,
                    this.getUsername(), this.getPassword());
    }
  } else {
    vRequest.open(vMethod, vUrl, vAsynchronous);
  }



  // --------------------------------------
  //   Applying request header
  // --------------------------------------

  // Add a Referer header
  vRequest.setRequestHeader('Referer', window.location.href);

  var vRequestHeaders = this.getRequestHeaders();
  for (var vId in vRequestHeaders) {
    vRequest.setRequestHeader(vId, vRequestHeaders[vId]);
  }



  // -----------------------------------------------------
  //   Addinng requested form fields to user-provided data
  // -----------------------------------------------------
  var data = this.getData();
  



  // --------------------------------------
  //   Sending data
  // --------------------------------------

  try
  {
    vRequest.send(this.getData());
  }
  catch(ex)
  {
    if (vLocalRequest)
    {
      this.failedLocally();
    }
    else
    {
      this.error("Failed to send data: " + ex, "send");
      this.failed();
    }

    return;
  }



  // --------------------------------------
  //   Readystate for sync reqeusts
  // --------------------------------------

  if (!vAsynchronous) {
    this._onreadystatechange();
  }
}

/*!
  Force the transport into the failed state
  ("failed").

  This method should be used only if the requests URI was local
  access. I.e. it started with "file://".
*/
qx.Proto.failedLocally = function()
{
  if (this.getState() === "failed") {
    return;
  }

  // should only occur on "file://" access
  this.warn("Could not load from file: " + this.getUrl());

  this.failed();
}









/*
---------------------------------------------------------------------------
  EVENT HANDLER
---------------------------------------------------------------------------
*/

qx.Proto._onreadystatechange = function(e)
{
  // Ignoring already stopped requests
  switch(this.getState())
  {
    case "completed":
    case "aborted":
    case "failed":
    case "timeout":
      if (qx.Settings.getValueOfClass("qx.io.remote.Exchange", "enableDebug")) {
        this.warn("Ignore Ready State Change");
      }
      return;
  }

  // Checking status code
  var vReadyState = this.getReadyState();
  if (vReadyState == 4) {
    // The status code is only meaningful when we reach ready state 4.
    // (Important for Opera since it goes through other states before
    // reaching 4, and the status code is not valid before 4 is reached.)
    if (!qx.io.remote.Exchange.wasSuccessful(this.getStatusCode(), vReadyState, this._localRequest)) {
      return this.failed();
    }
  }

  // Updating internal state
  while (this._lastReadyState < vReadyState) {
    this.setState(qx.io.remote.Exchange._nativeMap[++this._lastReadyState]);
  }
}







/*
---------------------------------------------------------------------------
  READY STATE
---------------------------------------------------------------------------
*/
/*!
  Get the ready state of this transports request.

  For qx.io.remote.XmlHttpTransports, the ready state is a number between 1 to 4.
*/
qx.Proto.getReadyState = function()
{
  var vReadyState = null;

  try {
    vReadyState = this._req.readyState;
  } catch(ex) {}

  return vReadyState;
}







/*
---------------------------------------------------------------------------
  REQUEST HEADER SUPPORT
---------------------------------------------------------------------------
*/
/*!
  Add a request header to this transports request.
*/
qx.Proto.setRequestHeader = function(vLabel, vValue) {
  this._req.setRequestHeader(vLabel, vValue);
}







/*
---------------------------------------------------------------------------
  RESPONSE HEADER SUPPORT
---------------------------------------------------------------------------
*/

/*!
  Returns a specific header provided by the server upon sending a request,
  with header name determined by the argument headerName.

  Only available at readyState 3 and 4 universally and in readyState 2
  in Gecko.
*/
qx.Proto.getResponseHeader = function(vLabel)
{
  var vResponseHeader = null;

  try {
    this.getRequest().getResponseHeader(vLabel) || null;
  } catch(ex) {}

  return vResponseHeader;
}

qx.Proto.getStringResponseHeaders = function()
{
  var vSourceHeader = null;

  try
  {
    var vLoadHeader = this._req.getAllResponseHeaders();
    if (vLoadHeader) {
      vSourceHeader = vLoadHeader;
    }
  } catch(ex) {}

  return vSourceHeader;
}

/*!
  Provides a hash of all response headers.
*/
qx.Proto.getResponseHeaders = function()
{
  var vSourceHeader = this.getStringResponseHeaders();
  var vHeader = {};

  if (vSourceHeader)
  {
    var vValues = vSourceHeader.split(/[\r\n]+/g);

    for(var i=0, l=vValues.length; i<l; i++)
    {
      var vPair = vValues[i].match(/^([^:]+)\s*:\s*(.+)$/i);
      if(vPair) {
        vHeader[vPair[1]] = vPair[2];
      }
    }
  }

  return vHeader;
}








/*
---------------------------------------------------------------------------
  STATUS SUPPORT
---------------------------------------------------------------------------
*/

/*!
  Returns the current status code of the request if available or -1 if not.
*/
qx.Proto.getStatusCode = function()
{
  var vStatusCode = -1;

  try {
    vStatusCode = this.getRequest().status;
  } catch(ex) {}

  return vStatusCode;
}

/*!
  Provides the status text for the current request if available and null
  otherwise.
*/
qx.Proto.getStatusText = function()
{
  var vStatusText = "";

  try {
    vStatusText = this.getRequest().statusText;
  } catch(ex) {}

  return vStatusText;
}









/*
---------------------------------------------------------------------------
  RESPONSE DATA SUPPORT
---------------------------------------------------------------------------
*/

/*!
  Provides the response text from the request when available and null
  otherwise.  By passing true as the "partial" parameter of this method,
  incomplete data will be made available to the caller.
*/
qx.Proto.getResponseText = function()
{
  var vResponseText = null;

  var vStatus = this.getStatusCode();
  var vReadyState = this.getReadyState();
  if (qx.io.remote.Exchange.wasSuccessful(vStatus, vReadyState, this._localRequest))
  {
    try {
      vResponseText = this.getRequest().responseText;
    } catch(ex) {}
  }

  return vResponseText;
}

/*!
  Provides the XML provided by the response if any and null otherwise.  By
  passing true as the "partial" parameter of this method, incomplete data will
  be made available to the caller.
*/
qx.Proto.getResponseXml = function()
{
  var vResponseXML = null;

  var vStatus = this.getStatusCode();
  var vReadyState = this.getReadyState();
  if (qx.io.remote.Exchange.wasSuccessful(vStatus, vReadyState, this._localRequest))
  {
    try {
      vResponseXML = this.getRequest().responseXML;
    } catch(ex) {}
  }

  // Typical behaviour on file:// on mshtml
  // Could we check this with something like: /^file\:/.test(path); ?
  // No browser check here, because it doesn't seem to break other browsers
  //    * test for this.req.responseXML's objecthood added by *
  //    * FRM, 20050816                                       *
  if (typeof vResponseXML == "object" && vResponseXML != null)
  {
    if (!vResponseXML.documentElement)
    {
      // Clear xml file declaration, this breaks non unicode files (like ones with Umlauts)
      var s = String(this.getRequest().responseText).replace(/<\?xml[^\?]*\?>/, "");
      vResponseXML.loadXML(s);
    };
    // Re-check if fixed...
    if (!vResponseXML.documentElement) {
      throw new Error("Missing Document Element!");
    };

    if (vResponseXML.documentElement.tagName == "parseerror") {
      throw new Error("XML-File is not well-formed!");
    };
  }
  else
  {
    throw new Error("Response was not a valid xml document [" + this.getRequest().responseText + "]");
  };

  return vResponseXML;
}

/*!
  Returns the length of the content as fetched thus far
*/
qx.Proto.getFetchedLength = function()
{
  var vText = this.getResponseText();
  return typeof vText == "string" ? vText.length : 0;
}

qx.Proto.getResponseContent = function()
{
  if (this.getState() !== "completed")
  {
    if (qx.Settings.getValueOfClass("qx.io.remote.Exchange",
                                    "enableDebug")) {
      this.warn("Transfer not complete, ignoring content!");
    }

    return null;
  }

  if (qx.Settings.getValueOfClass("qx.io.remote.Exchange",
                                  "enableDebug")) {
    this.debug("Returning content for responseType: " + this.getResponseType());
  }

  var vText = this.getResponseText();

  switch(this.getResponseType())
  {
    case qx.util.Mime.TEXT:
    case qx.util.Mime.HTML:
      return vText;

    case qx.util.Mime.JSON:
      try {
        return vText && vText.length > 0 ? qx.io.Json.parseQx(vText) : null;
      } catch(ex) {
        this.error("Could not execute json: [" + vText + "]", ex);
        return "<pre>Could not execute json: \n" + vText + "\n</pre>"
      }

    case qx.util.Mime.JAVASCRIPT:
      try {
        return vText && vText.length > 0 ? window.eval(vText) : null;
      } catch(ex) {
        return this.error("Could not execute javascript: [" + vText + "]", ex);
      }

    case qx.util.Mime.XML:
      return this.getResponseXml();

    default:
      this.warn("No valid responseType specified (" + this.getResponseType() + ")!");
      return null;
  }
}






/*
---------------------------------------------------------------------------
  MODIFIER
---------------------------------------------------------------------------
*/

qx.Proto._modifyState = function(propValue, propOldValue, propData)
{
  if (qx.Settings.getValueOfClass("qx.io.remote.Exchange",
                                  "enableDebug")) {
    this.debug("State: " + propValue);
  }

  switch(propValue)
  {
    case "created":
      this.createDispatchEvent("created");
      break;

    case "configured":
      this.createDispatchEvent("configured");
      break;

    case "sending":
      this.createDispatchEvent("sending");
      break;

    case "receiving":
      this.createDispatchEvent("receiving");
      break;

    case "completed":
      this.createDispatchEvent("completed");
      break;

    case "failed":
      this.createDispatchEvent("failed");
      break;

    case "aborted":
      this.getRequest().abort();
      this.createDispatchEvent("aborted");
      break;

    case "timeout":
      this.getRequest().abort();
      this.createDispatchEvent("timeout");
      break;
  }

  return true;
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

  var vRequest = this.getRequest();

  if (vRequest)
  {
    // Should be right,
    // but is not compatible to mshtml (throws an exception)
    if (!qx.core.Client.getInstance().isMshtml()) {
      vRequest.onreadystatechange = null;
    }

    // Aborting
    switch(vRequest.readyState)
    {
      case 1:
      case 2:
      case 3:
        vRequest.abort();
    }

    // Cleanup objects
    this._req = null;
  }

  return qx.io.remote.AbstractRemoteTransport.prototype.dispose.call(this);
}
