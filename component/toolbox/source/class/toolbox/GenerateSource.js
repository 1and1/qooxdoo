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
     * Yuecel Beser (ybeser)

************************************************************************ */

/* ************************************************************************
#asset(toolbox/*)

************************************************************************ */

/**
 * This is the main application class of your custom application "HelloWorld"
 */
qx.Class.define("toolbox.GenerateSource",
{
  extend : qx.core.Object,




  /*
        *****************************************************************************
           CONSTRUCTOR
        *****************************************************************************
      s */

  construct : function(adminPath, fileName, filePath, generate, frame, logFrame)
  {
    this.base(arguments, adminPath, fileName, filePath, generate, frame, logFrame);
    this.__urlParms = new toolbox.UrlSearchParms();
    this.__generateSource(adminPath, fileName, filePath, generate, frame, logFrame);
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
     * @param adminPath {var} TODOC
     * @param fileName {var} TODOC
     * @param filePath {var} TODOC
     * @param generate {var} TODOC
     * @param frame {var} TODOC
     * @param logFrame {var} TODOC
     * @return {void} 
     */
    __generateSource : function(adminPath, fileName, filePath, generate, frame, logFrame)
    {
      if (fileName != "" & filePath != "")
      {
        var url = adminPath;
        var req = new qx.io.remote.Request(url, "POST", "application/json");
        var dat = "action=generate_Source";
        var openSource = "action=open_In_Browser&location=source";
        var createParams = [ fileName, filePath, generate ];
        req.setTimeout(100000);

        // check cygwin path
        if ('cygwin' in this.__urlParms.getParms())
        {
          var cygParm = 'cygwin' + "=" + this.__urlParms.getParms()['cygwin'];
          dat += "&" + cygParm;
        }

        var params = [ "myName", "myPath", "generate_Source" ];

        for (var i=0; i<createParams.length; i++)
        {
          if (createParams[i] != "")
          {
            dat += "&" + params[i] + "=" + createParams[i];
            openSource += "&" + params[i] + "=" + createParams[i];
          }
        }

        req.setProhibitCaching(true);
        req.setData(dat);

        var loader = new toolbox.ProgressLoader();

        req.addListener("completed", function(evt)
        {
          var result = evt.getContent();

          if (result.gen_state != undefined)
          {
            var receivedState = result.gen_state;

            if (receivedState == 1 || receivedState == 0)
            {
              if (receivedState == 0)
              {
                frame.setHtml(result.gen_output);
                logFrame.setHtml(logFrame.getHtml() + "<br/>" + result.gen_output);
                req.setData(openSource);
                req.send();
              }

              // var openLink = ("/component/toolbox/tool/bin/nph-qxadmin_cgi.py?action=open_In_Browser&location=source").replace(/\\/g, "/");
              // alert(openLink);
              // window.open(openLink);
              if (receivedState == 1)
              {
                frame.setHtml('<font color="red">' + result.gen_error + '</font>');
                logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result.gen_error + '</font>');
              }
            }
          }
          else
          {
            logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + result + '</font>');
          }

          loader.unblock();
          loader.hideLoader();
        },
        this);

        req.addListener("failed", function(evt)
        {
          this.error("Failed to post to URL: " + url);
          logFrame.setHtml(logFrame.getHtml() + "<br/>" + '<font color="red">' + "Failed to post to URL: " + url + '</font>');
        },
        this);

        req.send();
      }
      else
      {
        alert("You don't created an application");
      }

      return;
    }
  }
});