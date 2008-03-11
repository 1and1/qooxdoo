/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2008 1&1 Internet AG, Germany, http://www.1und1.de
     2006 STZ-IDA, Germany, http://www.stz-ida.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)
   * Til Schneider (til132)

************************************************************************* */

/* ************************************************************************

#resource(qx.icontheme:qx/decoration/Classic)

************************************************************************ */

/**
 * The classic qooxdoo decoration theme.
 */
qx.Theme.define("qx.theme.classic.Decoration",
{
  title : "Classic",

  decorations :
  {
    "black" :
    {
      decorator: qx.ui.decoration.UniformBorder,

      style :
      {
        width : 1,
        color : "black"
      }
    },

    "white" :
    {
      decorator: qx.ui.decoration.UniformBorder,

      style :
      {
        width : 1,
        color : "white"
      }
    },

    "dark-shadow" :
    {
      decorator: qx.ui.decoration.UniformBorder,

      style :
      {
        width : 1,
        color : "border-dark-shadow"
      }
    },

    "light-shadow" :
    {
      decorator: qx.ui.decoration.UniformBorder,

      style :
      {
        width : 1,
        color : "border-light-shadow"
      }
    },

    "light" :
    {
      decorator: qx.ui.decoration.UniformBorder,

      style :
      {
        width : 1,
        color : "border-light"
      }
    },

    "dark" :
    {
      decorator: qx.ui.decoration.UniformBorder,

      style :
      {
        width : 1,
        color : "border-dark"
      }
    },

    "inset" :
    {
      decorator : qx.ui.decoration.DoubleBorder,

      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
        innerColor : [ "border-dark", "border-light-shadow", "border-light-shadow", "border-dark" ]
      }
    },

    "outset" :
    {
      decorator : qx.ui.decoration.DoubleBorder,

      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-light-shadow", "border-dark", "border-dark", "border-light-shadow" ],
        innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]
      }
    },

    "groove" :
    {
      decorator : qx.ui.decoration.DoubleBorder,

      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ],
        innerColor : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]
      }
    },

    "ridge" :
    {
      decorator : qx.ui.decoration.DoubleBorder,

      style :
      {
        width : 1,
        innerWidth: 1,
        color : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ],
        innerColor : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ]
      }
    },

    "inset-thin" :
    {
      style :
      {
        width : 1,
        color : [ "border-dark-shadow", "border-light", "border-light", "border-dark-shadow" ]
      }
    },

    "outset-thin" :
    {
      style :
      {
        width : 1,
        color : [ "border-light", "border-dark-shadow", "border-dark-shadow", "border-light" ]
      }
    },

    "line-left" :
    {
      style :
      {
        widthLeft : 1,
        colorLeft : "border-dark-shadow"
      }
    },

    "line-right" :
    {
      style :
      {
        widthRight : 1,
        colorRight : "border-dark-shadow"
      }
    },

    "line-top" :
    {
      style :
      {
        widthTop : 1,
        colorTop : "border-dark-shadow"
      }
    },

    "line-bottom" :
    {
      style :
      {
        widthBottom : 1,
        colorBottom : "border-dark-shadow"
      }
    },

    "divider-vertical" :
    {
      style :
      {
        widthTop : 1,
        colorTop : "border-dark-shadow"
      }
    },

    "divider-horizontal" :
    {
      style :
      {
        widthLeft : 1,
        colorLeft : "border-dark-shadow"
      }
    }
  }
});
