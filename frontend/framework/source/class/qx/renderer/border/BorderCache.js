/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(ui_core)

************************************************************************ */

qx.Class.define("qx.renderer.border.BorderCache",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics : {
    __data : {},

    convert: function(propValue, propData)
    {
      if (qx.util.Validation.isValidArray(propValue) && propValue.length > 1)
      {
        propString = "";

        for (var i=0, l=propValue.length, p; i<l; i++)
        {
          p = propValue[i];

          propString += p;

          if (typeof p === "number") {
            propString += "px";
          }

          if (i < (l - 1)) {
            propString += " ";
          }
        }

        propValue = propString;
      }
      else if (qx.util.Validation.isInvalidString(propValue))
      {
        return propValue;
      }

      if (qx.renderer.border.BorderCache.__data[propValue]) {
        return qx.renderer.border.BorderCache.__data[propValue];
      }

      return qx.renderer.border.BorderCache.__data[propValue] = qx.renderer.border.Border.fromString(propValue);
    }
  }
});
