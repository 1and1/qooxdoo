qx.OO.defineClass("qx.test.ToolBarButton", qx.test.Button,
function()
{
  qx.PropertyTestButton.call(this);


});

// ... �berschreibe Wert
qx.Property.sel("appearance");
qx.Property.tune("default", "toolbarbutton");
