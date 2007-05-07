
qx.Class.define("qxunit.runner.BasicRunner", {

  extend : qx.ui.layout.VerticalBoxLayout,

  construct : function()
  {
    this.base(arguments);

    this.set({
      height : "100%",
      width : "100%"
    });

    var iframe = new qx.ui.embed.Iframe("html/QooxdooTest.html?testclass=qxunit.test");
    iframe.set({
      height: 100,
      width: 300
    });


    iframe.addEventListener("load", function() {
      var testLoader = iframe.getContentWindow().qxunit.TestLoader.getInstance();

      // wait for the iframe to load
      if (!testLoader) {
        qx.client.Timer.once(arguments.callee, this, 50);
        return;
      }

    var testResult = new (iframe.getContentWindow().qxunit.TestResult)();
    testResult.addEventListener("startTest", function(e) {
    	var test = e.getData();
    	this.debug("Test '"+test.getFullName()+"' started.");
    });
    testResult.addEventListener("failure", function(e) {
    	var ex = e.getData().exception;
    	var test = e.getData().test;
    	this.error("Test '"+test.getFullName()+"' failed: " +  ex.getMessage() + " - " + ex.getComment());
    	//this.error(ex.getStackTrace());
    });
    testResult.addEventListener("error", function(e) {
    	var ex = e.getData().exception
    	this.error("The test '"+e.getData().test.getFullName()+"' had an error: " + ex, ex);
    });

      this.debug(testLoader.getTestDescriptions());
      gb.setEnabled(true);

      this.run.addEventListener("execute", function() {
        testLoader.runTestsFromNamespace(testResult, this.input.getValue());
      }, this);

    }, this);

    this.add(iframe);

    var gb = new qx.ui.groupbox.GroupBox();
    gb.set({
      height : "auto",
      width : "auto",
      enabled : false
    });

    var hb = new qx.ui.layout.HorizontalBoxLayout();
    hb.set({
      height : "auto",
      width : "auto",
      verticalChildrenAlign: "middle"
    });
    hb.add(new qx.ui.basic.Label("Test class: "));
    this.input = new qx.ui.form.TextField();
    this.run = new qx.ui.form.Button("run");
    hb.add(this.input, this.run);
    gb.add(hb);
    this.add(gb);
  }

});