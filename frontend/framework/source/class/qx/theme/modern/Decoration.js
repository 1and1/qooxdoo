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
   * Fabian Jakobs (fjakobs)
   * Sebastian Werner (wpbasti)
   * Andreas Ecker (ecker)

************************************************************************* */

/* ************************************************************************

#resource(qx.icontheme:qx/decoration/Modern)
#asset(qx/decoration/Modern/*)

************************************************************************ */

/**
 * The modern decoration theme.
 */
qx.Theme.define("qx.theme.modern.Decoration",
{
  title : "Modern",
  resource : qx.core.Setting.get("qx.resourceUri") + "/qx/decoration/Modern",

  decorations :
  {
    "black" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "black"
      }
    },

    "focus-line" :
    {
      decorator: qx.ui.decoration.Uniform,

      style :
      {
        width : 1,
        color : "focus"
      }
    },

    "pane" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/pane/pane.png"
      }
    },

    "slider-knob-vertical" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/slider-knob-bg-vertical.png",
        //backgroundRepeat : "repeat-y",
        outerColor : "#4d4d4d",
        innerColor : "#e1e1e1"
      }
    },

    "slider-knob-horizontal" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/slider-knob-bg-horizontal.png",
        //backgroundRepeat : "repeat-x",
        outerColor : "#4d4d4d",
        innerColor : "#e1e1e1"
      }
    },

    "slider-knob-pressed-vertical" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-bg-pressed-vertical.png",
        //backgroundRepeat : "repeat-y",
        outerColor : "#192433",
        innerColor : "#e9f5ff"
      }
    },

    "slider-knob-pressed-horizontal" :
    {
      decorator : qx.ui.decoration.Beveled,

      style : {
        backgroundImage : "decoration/scrollbar/scrollbar-bg-pressed-horizontal.png",
        //backgroundRepeat : "repeat-x",
        outerColor : "#192433",
        innerColor : "#e9f5ff"
      }
    },

    "button" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button.png"
      }
    },

    "button-focused" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-focused.png"
      }
    },

    "button-hovered" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-hovered.png"
      }
    },

    "button-pressed" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-pressed.png"
      }
    },

    "button-checked" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-checked.png"
      }
    },

    "button-ckecked-focused" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-checked-focused.png"
      }
    },

    "button-default" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-default.png"
      }
    },

    "button-default-focused" :
    {
      decorator : qx.ui.decoration.Grid,

      style : {
        baseImage : "decoration/form/button-default-focused.png"
      }
    },

    "textfield" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor: "border",
        innerColor: "white",
        backgroundImage : "decoration/form/input.png"
      }
    },

    "textfield-focused" :
    {
      decorator : qx.ui.decoration.Beveled,

      style :
      {
        outerColor: "border",
        innerColor: "focus"
      }
    },
    
    "line-right" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthRight : 1,
        colorRight : "border-dark-shadow"
      }
    },
    
    "line-top" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthTop : 1,
        colorTop : "border-dark-shadow"
      }
    },
    
    "line-bottom" :
    {
      decorator : qx.ui.decoration.Single,

      style :
      {
        widthBottom : 1,
        colorBottom : "border-dark-shadow"
      }
    },
    
    "toolbar" :
    {
      decorator : qx.ui.decoration.Double,
      
      style :
      {
        width : 1,
        innerWidthBottom : 1,
        
        color : "#c1c1c1",
        innerColorBottom : "#8a8a8a",
        
        style : "solid",
        backgroundImage : "decoration/toolbar/toolbar-gradient.png",
        backgroundRepeat : "scale"
      }
    },
    
    "toolbar-button-hovered" :
    {
      decorator : qx.ui.decoration.Beveled,
      
      style :
      {
        width : 2,
        
        outerColor : "#b6b6b6",
        innerColor : "#f8f8f8",
        
        backgroundImage : "decoration/form/button-c.png",
        backgroundRepeat : "scale"
      }
    },
    
    "toolbar-button-checked" :
    {
      decorator : qx.ui.decoration.Beveled,
      
      style :
      {
        width : 2,
        
        outerColor : "#b6b6b6",
        innerColor : "#f8f8f8",
        
        backgroundImage : "decoration/form/button-checked-c.png",
        backgroundRepeat : "scale"
      }
    },
    
    "toolbar-separator" :
    {
      decorator : qx.ui.decoration.Single,
      
      style :
      {
        widthLeft : 1,
        widthRight : 1,
        
        colorLeft : "#b8b8b8",
        colorRight : "#f4f4f4",
        
        style : "solid"
      }
    },
    
    "toolbar-part-handle" :
    {
      decorator : qx.ui.decoration.Uniform,
      
      style :
      {
        width : 0,
        
        backgroundImage : "decoration/toolbar/toolbar-handle.png",
        backgroundRepeat : "no-repeat"
      }
    }
  }
});
