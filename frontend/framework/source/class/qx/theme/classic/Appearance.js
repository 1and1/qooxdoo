/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 1&1 Internet AG, Germany, http://www.1and1.org
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

#ignore(auto-use)
#embed(qx.static/image/dotted_white.gif)
#embed(qx.static/image/blank.gif)

************************************************************************* */

/**
 * The default qooxdoo appearance theme.
 */
qx.Theme.define("qx.theme.classic.Appearance",
{
  title : "Classic",

  appearances :
  {
    "empty" : {
    },

    "widget" : {
    },

    "image" : {
    },




    /*
    ---------------------------------------------------------------------------
      CORE
    ---------------------------------------------------------------------------
    */

    "client-document" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "threedface",
          textColor       : "windowtext"
        };
      }
    },

    "blocker" :
    {
      style : function(states)
      {
        // You could also use: "static/image/dotted_white.gif" for example as backgroundImage here
        // (Visible) background tiles could be dramatically slow down mshtml!
        // A background image or color is always needed for mshtml to block the events successfully.
        return {
          cursor          : "default",
          backgroundImage : "static/image/blank.gif"
        };
      }
    },

    "atom" :
    {
      style : function(states)
      {
        return {
          cursor                        : "default",
          spacing                       : 4,
          width                         : "auto",
          height                        : "auto",
          horizontalChildrenAlign       : "center",
          verticalChildrenAlign         : "middle"
        };
      }
    },

    "label" :
    {
      style : function(states)
      {
        return {
          font : "default",
          textColor : states.disabled ? "graytext" : "undefined"
        };
      }
    },

    "htmlcontainer" :
    {
      include : "label"
    },

    "popup" :
    {

    },

    "tool-tip" :
    {
      include : "popup",

      style : function(states)
      {
        return {
          backgroundColor : "infobackground",
          textColor       : "infotext",
          border          : "info",
          paddingTop      : 1,
          paddingRight    : 3,
          paddingBottom   : 2,
          paddingLeft     : 3
        };
      }
    },

    "iframe" :
    {
      style : function(states) {
        return { border : "inset" };
      }
    },




    /*
    ---------------------------------------------------------------------------
      BUTTON
    ---------------------------------------------------------------------------
    */

    "button" :
    {
      include : "atom",

      style : function(states)
      {
        var result = {
          backgroundColor : states.abandoned ? "#FFF0C9" : states.over ? "#87BCE5" : "buttonface"
        };

        if (states.pressed || states.checked || states.abandoned)
        {
          result.border = "inset";
        }
        else
        {
          result.border = "outset";
        }

        if (states.pressed || states.abandoned)
        {
          result.paddingTop = 4;
          result.paddingRight = 3;
          result.paddingBottom = 2;
          result.paddingLeft = 5;
        }
        else
        {
          result.paddingTop = result.paddingBottom = 3;
          result.paddingRight = result.paddingLeft = 4;
        }

        return result;
      }
    },




    /*
    ---------------------------------------------------------------------------
      TOOLBAR
    ---------------------------------------------------------------------------
    */

    "toolbar" :
    {
      style : function(states)
      {
        return {
          border          : "thinOutset",
          backgroundColor : "threedface",
          height          : "auto"
        };
      }
    },

    "toolbar-part" :
    {
      style : function(states) {
        return { width : "auto" };
      }
    },

    "toolbar-part-handle" :
    {
      style : function(states) {
        return { width : 10 };
      }
    },

    "toolbar-part-handle-line" :
    {
      style : function(states)
      {
        return {
          top    : 2,
          left   : 3,
          bottom : 2,
          width  : 4,
          border : "thinOutset"
        };
      }
    },

    "toolbar-separator" :
    {
      style : function(states) {
        return { width : 8 };
      }
    },

    "toolbar-separator-line" :
    {
      style : function(states)
      {
        return {
          top    : 2,
          left   : 3,
          width  : 2,
          bottom : 2,
          border : "horizontalDivider"
        };
      }
    },

    "toolbar-button" :
    {
      style : function(states)
      {
        var result =
        {
          cursor                : "default",
          spacing               : 4,
          width                 : "auto",
          verticalChildrenAlign : "middle",
          backgroundColor       : states.abandoned ? "#FFF0C9" : "buttonface",
          backgroundImage       : states.checked && !states.over ? "static/image/dotted_white.gif" : null
        };

        if (states.pressed || states.checked || states.abandoned)
        {
          result.border = "thinInset";

          result.paddingTop = 3;
          result.paddingRight = 2;
          result.paddingBottom = 1;
          result.paddingLeft = 4;
        }
        else if (states.over)
        {
          result.border = "thinOutset";

          result.paddingTop = result.paddingBottom = 2;
          result.paddingLeft = result.paddingRight = 3;
        }
        else
        {
          result.border = "undefined";

          result.paddingTop = result.paddingBottom = 3;
          result.paddingLeft = result.paddingRight = 4;
        }

        return result;
      }
    },




    /*
    ---------------------------------------------------------------------------
      BUTTON VIEW
    ---------------------------------------------------------------------------
    */

    "button-view" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "#FAFBFE",
          border          : "shadow"
        };
      }
    },

    "button-view-pane" :
    {

    },

    "button-view-page" :
    {

    },

    "button-view-bar" :
    {
      style : function(states)
      {
        if (states.barTop)
        {
          var result =
          {
            backgroundColor : "#E1EEFF",
            paddingTop    : 1,
            paddingRight  : 0,
            paddingBottom : 1,
            paddingLeft   : 0,
            border        : new qx.renderer.border.Border
          };

          result.border.setBottom(1, "solid", "threedshadow");

          return result;
        }
        else if (states.barBottom)
        {
          var result =
          {
            backgroundColor : "#E1EEFF",
            paddingTop    : 1,
            paddingRight  : 0,
            paddingBottom : 1,
            paddingLeft   : 0,
            border        : new qx.renderer.border.Border
          };

          result.border.setTop(1, "solid", "threedshadow");

          return result;
        }
        else if (states.barLeft)
        {
          var result =
          {
            backgroundColor : "#E1EEFF",
            paddingTop    : 0,
            paddingRight  : 1,
            paddingBottom : 0,
            paddingLeft   : 1,
            border        : new qx.renderer.border.Border
          };

          result.border.setRight(1, "solid", "threedshadow");

          return result;
        }
        else if (states.barRight)
        {
          var result =
          {
            backgroundColor : "#E1EEFF",
            paddingTop    : 0,
            paddingRight  : 1,
            paddingBottom : 0,
            paddingLeft   : 1,
            border        : new qx.renderer.border.Border
          };

          result.border.setLeft(1, "solid", "threedshadow");

          return result;
        }
      }
    },

    "button-view-button" :
    {
      include : "atom",

      style : function(states)
      {
        var result =
        {
          backgroundColor : states.checked ? "#FAFBFE" : "undefined",
          iconPosition : "top"
        };

        if (states.checked || states.over)
        {
          if (states.barTop)
          {
            result.border = new qx.renderer.border.Border(1, "solid", "threedshadow");
            result.border.setBottom(3, "solid", "#FEC83C");
            result.paddingTop = 3;
            result.paddingRight = 6;
            result.paddingBottom = 1;
            result.paddingLeft = 6;
          }
          else if (states.barBottom)
          {
            result.border = new qx.renderer.border.Border(1, "solid", "threedshadow");
            result.border.setTop(3, "solid", "#FEC83C");
            result.paddingTop = 1;
            result.paddingRight = 6;
            result.paddingBottom = 3;
            result.paddingLeft = 6;
          }
          else if (states.barLeft)
          {
            result.border = new qx.renderer.border.Border(1, "solid", "threedshadow");
            result.border.setRight(3, "solid", "#FEC83C");
            result.paddingTop = 3;
            result.paddingRight = 4;
            result.paddingBottom = 3;
            result.paddingLeft = 6;
          }
          else if (states.barRight)
          {
            result.border = new qx.renderer.border.Border(1, "solid", "threedshadow");
            result.border.setLeft(3, "solid", "#FEC83C");
            result.paddingTop = 3;
            result.paddingRight = 6;
            result.paddingBottom = 3;
            result.paddingLeft = 4;
          }
        }
        else
        {
          result.border = "undefined";
          result.paddingTop = result.paddingBottom = 4;
          result.paddingRight = result.paddingLeft = 7;
        }

        if (states.barTop || states.barBottom)
        {
          result.marginTop = result.marginBottom = 0;
          result.marginRight = result.marginLeft = 1;
          result.width = "auto";
          result.height = null;
        }
        else if (states.barLeft || states.barRight)
        {
          result.marginTop = result.marginBottom = 1;
          result.marginRight = result.marginLeft = 0;
          result.height = "auto";
          result.width = null;
        }

        return result;
      }
    },




    /*
    ---------------------------------------------------------------------------
      RADIO VIEW
    ---------------------------------------------------------------------------
    */

    "radio-view" : {
      include : "button-view"
    },

    "radio-view-pane" :
    {
    },

    "radio-view-page" :
    {
    },

    "radio-view-bar" :
    {
      style : function(states)
      {
        var result =
        {
          backgroundColor : "#E1EEFF",
          paddingTop    : 1,
          paddingRight  : 0,
          paddingBottom : 1,
          paddingLeft   : 0,
          border        : new qx.renderer.border.Border
        };

        result.border.setBottom(1, "solid", "threedshadow");

        return result;
      }
    },

    "radio-view-button" :
    {
      include : "atom",

      style : function(states)
      {
        var result =
        {
          backgroundColor : states.checked ? "#FAFBFE" : "undefined",
          iconPosition : "left"
        };

        if (states.checked || states.over)
        {
          result.border = new qx.renderer.border.Border(1, "solid", "threedshadow");
          result.border.setLeft(3, "solid", "#FEC83C");
          result.paddingTop = result.paddingBottom = 2;
          result.paddingRight = 6;
          result.paddingLeft = 4;
        }
        else
        {
          result.border = "undefined";
          result.paddingTop = result.paddingBottom = 3;
          result.paddingRight = result.paddingLeft = 7;
        }

        result.marginTop = result.marginBottom = 0;
        result.marginRight = result.marginLeft = 1;
        result.width = "auto";
        result.opacity = states.checked ? 1.0 : 0.3;

        return result;
      }
    },




    /*
    ---------------------------------------------------------------------------
      WINDOW
    ---------------------------------------------------------------------------
    */

    "window" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "threedface",
          textColor       : "windowtext",
          paddingTop      : 1,
          paddingRight    : 1,
          paddingBottom   : 1,
          paddingLeft     : 1,
          border : states.maximized ? "undefined" : "outset"
        };
      }
    },

    "window-captionbar" :
    {
      style : function(states)
      {
        return {
          paddingTop            : 1,
          paddingRight          : 2,
          paddingBottom         : 2,
          paddingLeft           : 2,
          verticalChildrenAlign : "middle",
          height                : "auto",
          overflow              : "hidden",
          backgroundColor       : states.active ? "activecaption" : "inactivecaption",
          textColor             : states.active ? "captiontext" : "inactivecaptiontext"
        };
      }
    },

    "window-resize-frame" :
    {
      style : function(states) {
        return { border : "shadow" };
      }
    },

    "window-captionbar-icon" :
    {
      style : function(states) {
        return { marginRight : 2 };
      }
    },

    "window-captionbar-title" :
    {
      style : function(states)
      {
        return {
          cursor      : "default",
          font        : "bold",
          marginRight : 2
        };
      }
    },

    "window-captionbar-button" :
    {
      include : "button",

      style : function(states)
      {
        var result = {};

        if (states.pressed || states.abandoned)
        {
          result.paddingTop = 2;
          result.paddingRight = 1;
          result.paddingBottom = 0;
          result.paddingLeft = 3;
        }
        else
        {
          result.paddingTop = result.paddingBottom = 1;
          result.paddingRight = result.paddingLeft = 2;
        }

        return result;
      }
    },

    "window-captionbar-minimize-button" :
    {
      include : "window-captionbar-button"
    },

    "window-captionbar-restore-button" :
    {
      include : "window-captionbar-button"
    },

    "window-captionbar-maximize-button" :
    {
      include : "window-captionbar-button"
    },

    "window-captionbar-close-button" :
    {
      include : "window-captionbar-button",

      style : function(states) {
        return { marginLeft : 2 };
      }
    },

    "window-statusbar" :
    {
      style : function(states)
      {
        return {
          border : "thinInset",
          height : "auto"
        };
      }
    },

    "window-statusbar-text" :
    {
      style : function(states)
      {
        return {
          paddingTop    : 1,
          paddingRight  : 4,
          paddingBottom : 1,
          paddingLeft   : 4,
          cursor        : "default"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      RESIZER
    ---------------------------------------------------------------------------
    */

    "resizer" :
    {
      style : function(states) {
        return { border : "outset" };
      }
    },

    "resizer-frame" :
    {
      style : function(states) {
        return { border : "shadow" };
      }
    },




    /*
    ---------------------------------------------------------------------------
      MENU
    ---------------------------------------------------------------------------
    */

    "menu" :
    {
      style : function(states)
      {
        return {
          width           : "auto",
          height          : "auto",
          backgroundColor : "menu",
          border          : "outset",
          paddingTop      : 1,
          paddingRight    : 1,
          paddingBottom   : 1,
          paddingLeft     : 1
        };
      }
    },

    "menu-layout" :
    {
      style : function(states)
      {
        return {
          top    : 0,
          right  : 0,
          bottom : 0,
          left   : 0
        };
      }
    },

    "menu-button" :
    {
      style : function(states)
      {
        return {
          minWidth              : "auto",
          height                : "auto",
          spacing               : 2,
          paddingTop            : 2,
          paddingRight          : 4,
          paddingBottom         : 2,
          paddingLeft           : 4,
          cursor                : "default",
          verticalChildrenAlign : "middle",
          backgroundColor       : states.over ? "highlight" : "undefined",
          textColor             : states.over ? "highlighttext" : "undefined"
        };
      }
    },

    "menu-check-box" :
    {
      include : "menu-button"
    },

    "menu-radio-button" :
    {
      include : "menu-button"
    },

    "menu-separator" :
    {
      style : function(states)
      {
        return {
          height       : "auto",
          marginTop    : 3,
          marginBottom : 2,
          paddingLeft  : 3,
          paddingRight : 3
        };
      }
    },

    "menu-separator-line" :
    {
      style : function(states)
      {
        return {
          right  : 0,
          left   : 0,
          height : 0,
          border : "verticalDivider"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      LIST
    ---------------------------------------------------------------------------
    */

    "list" :
    {
      style : function(states)
      {
        return {
          border          : "thinInset",
          backgroundColor : "white"
        };
      }
    },

    "list-item" :
    {
      style : function(states)
      {
        return {
          cursor                  : "default",
          height                  : "auto",
          horizontalChildrenAlign : "left",
          verticalChildrenAlign   : "middle",
          spacing                 : 4,
          paddingTop              : 3,
          paddingRight            : 5,
          paddingBottom           : 3,
          paddingLeft             : 5,
          minWidth                : "auto",
          backgroundColor         : states.selected ? "highlight" : "undefined",
          textColor               : states.selected ? "highlighttext" : "undefined"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      FIELDS
    ---------------------------------------------------------------------------
    */

    "text-field" :
    {
      style : function(states)
      {
        return {
          border          : "inset",
          paddingTop      : 1,
          paddingRight    : 3,
          paddingBottom   : 1,
          paddingLeft     : 3,
          font            : "default",
          width           : "auto",
          height          : "auto",
          textColor       : states.disabled ? "graytext" : "undefined",
          backgroundColor : "white"
        };
      }
    },

    "text-area" : {
      include : "text-field"
    },




    /*
    ---------------------------------------------------------------------------
      COMBOBOX
    ---------------------------------------------------------------------------
    */

    "combo-box" :
    {
      style : function(states)
      {
        return {
          width           : 120,
          border          : "inset",
          backgroundColor : "white"
        };
      }
    },

    "combo-box-ex" :
    {
      style : function(states)
      {
        return {
          width           : "auto",
          border          : "inset",
          backgroundColor : "white"
        };
      }
    },

    "combo-box-list" :
    {
      include : "list",

      style : function(states)
      {
        return {
          border   : "undefined",
          overflow : "scrollY"
        };
      }
    },

    "combo-box-ex-list" :
    {
      include : "list",

      style : function(states)
      {
        return {
          statusBarVisible              : false,
          columnVisibilityButtonVisible : false,
          height                        : 'auto',
          maxHeight                     : 150,
          top                           : 0,
          left                          : 0,
          border                        : "undefined"
        };
      }
    },

    "combo-box-popup" :
    {
      include : "list",

      style : function(states)
      {
        return {
          height    : "auto",
          maxHeight : 150,
          border    : "shadow"
        };
      }
    },

    "combo-box-ex-popup" :
    {
      include : "list",

      style : function(states)
      {
        return {
          width  : "auto",
          height : "auto",
          border : "shadow"
        };
      }
    },

    "combo-box-text-field" :
    {
      include : "text-field",

      style : function(states)
      {
        return {
          border          : "undefined",
          width           : "1*",
          backgroundColor : "transparent"
        };
      }
    },

    "combo-box-ex-text-field" :
    {
      include : "text-field",

      style : function(states)
      {
        return {
          border          : "undefined",
          minWidth        : 30,
          width           : 100,
          backgroundColor : "transparent"
        };
      }
    },

    // Used both for ComboBox and ComboBoxEx
    "combo-box-button" :
    {
      include : "button",

      style : function(states)
      {
        return {
          paddingTop    : 0,
          paddingRight  : 3,
          paddingBottom : 0,
          paddingLeft   : 2
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      TREEVIRTUAL
    ---------------------------------------------------------------------------
    */

    "treevirtual-focus-indicator" :
    {
      include : "empty"
    },




    /*
    ---------------------------------------------------------------------------
      TREE
    ---------------------------------------------------------------------------
    */

    "tree-element" :
    {
      style : function(states)
      {
        return {
          height                : 16,
          verticalChildrenAlign : "middle"
        };
      }
    },

    "tree-element-icon" :
    {
      style : function(states)
      {
        return {
          width  : 16,
          height : 16
        };
      }
    },

    "tree-element-label" :
    {
      include : "label",

      style : function(states)
      {
        return {
          cursor          : "default",
          marginLeft      : 3,
          height          : 15,
          paddingTop      : 2,
          paddingRight    : 2,
          paddingBottom   : 2,
          paddingLeft     : 2,
          backgroundColor : states.selected ? "highlight" : "undefined",
          textColor       : states.selected ? "highlighttext" : "undefined"
        };
      }
    },

    "tree-folder" :
    {
      include : "tree-element"
    },

    "tree-folder-icon" :
    {
      style : function(states)
      {
        return {
          width  : 16,
          height : 16
        };
      }
    },

    "tree-folder-label" :
    {
      include : "tree-element-label"
    },

    "tree" :
    {
      include : "tree-folder"
    },

    "tree-icon" :
    {
      include : "tree-folder-icon"
    },

    "tree-label" :
    {
      include : "tree-folder-label"
    },

    "tree-container" :
    {
      style : function(states) {
        return { verticalChildrenAlign : "top" };
      }
    },

    "tree-folder-container" :
    {
      style : function(states)
      {
        return {
          height                : "auto",
          verticalChildrenAlign : "top"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      LISTVIEW
    ---------------------------------------------------------------------------
    */

    "list-view" :
    {
      style : function(states)
      {
        return {
          cursor   : "default",
          overflow : "hidden"
        };
      }
    },

    "list-view-pane" :
    {
      style : function(states)
      {
        return {
          width             : "1*",
          horizontalSpacing : 1,
          overflow          : "hidden"
        };
      }
    },

    "list-view-header" :
    {
      style : function(states)
      {
        var result =
        {
          height          : "auto",
          overflow        : "hidden",
          border          : new qx.renderer.border.Border,
          backgroundColor : "#f2f2f2"
        };

        result.border.setBottom(1, "solid", "#e2e2e2");

        return result;
      }
    },

    "list-view-header-cell" :
    {
      style : function(states)
      {
        var border_hover = new qx.renderer.border.Border;
        border_hover.setBottom(2, "solid", "#F9B119");

        return {
          overflow      : "hidden",
          paddingTop    : 2,
          paddingRight  : 6,
          paddingBottom : 2,
          paddingLeft   : 6,
          spacing       : 4,
          backgroundColor : states.over ? "white" : "undefined",
          paddingBottom   : states.over ? 0 : 2,
          border          : states.over ? border_hover : "undefined"
        };
      }
    },

    "list-view-header-separator" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "#D6D5D9",
          width           : 1,
          marginTop       : 1,
          marginBottom    : 1
        };
      }
    },

    "list-view-content-cell" :
    {
      style : function(states)
      {
        return {
          backgroundColor : states.selected ? "highlight" : "undefined",
          textColor       : states.selected ? "highlighttext" : "undefined"
        };
      }
    },

    "list-view-content-cell-image" :
    {
      include : "list-view-content-cell",

      style : function(states)
      {
        return {
          paddingLeft  : 6,
          paddingRight : 6
        };
      }
    },

    "list-view-content-cell-text" :
    {
      include : "list-view-content-cell",

      style : function(states)
      {
        return {
          overflow     : "hidden",
          paddingLeft  : 6,
          paddingRight : 6,
          font         : "default"
        };
      }
    },

    "list-view-content-cell-html" :
    {
      include : "list-view-content-cell-text"
    },

    "list-view-content-cell-icon-html" :
    {
      include : "list-view-content-cell-text"
    },

    "list-view-content-cell-link" :
    {
      include : "list-view-content-cell-text"
    },




    /*
    ---------------------------------------------------------------------------
      TABVIEW
    ---------------------------------------------------------------------------
    */

    "tab-view" :
    {
      style : function(states) {
        return { spacing : -1 };
      }
    },

    "tab-view-bar" :
    {
      style : function(states) {
        return { height : "auto" };
      }
    },

    "tab-view-pane" :
    {
      style : function(states)
      {
        return {
          height          : "1*",
          backgroundColor : "#FAFBFE",
          border          : new qx.renderer.border.Border(1, "solid", "#91A5BD"),
          paddingTop      : 10,
          paddingRight    : 10,
          paddingBottom   : 10,
          paddingLeft     : 10
        };
      }
    },

    "tab-view-page" :
    {

    },

    "tab-view-button" :
    {
      include : "atom",

      style : function(states)
      {
        var border_top_normal = new qx.renderer.border.Border(1, "solid", "#91A5BD");
        border_top_normal.setWidthBottom(0);

        var border_top_checked = new qx.renderer.border.Border(1, "solid", "#91A5BD");
        border_top_checked.setWidthBottom(0);
        border_top_checked.setTop(3, "solid", "#FEC83C");

        var border_bottom_normal = new qx.renderer.border.Border(1, "solid", "#91A5BD");
        border_bottom_normal.setWidthTop(0);

        var border_bottom_checked = new qx.renderer.border.Border(1, "solid", "#91A5BD");
        border_bottom_checked.setWidthTop(0);
        border_bottom_checked.setBottom(3, "solid", "#FEC83C");

        var result;

        if (states.checked)
        {
          result =
          {
            backgroundColor : "#FAFBFE",
            zIndex          : 1,
            paddingTop      : 2,
            paddingBottom   : 4,
            paddingLeft     : 7,
            paddingRight    : 8,
            border          : states.barTop ? border_top_checked : border_bottom_checked,
            marginTop       : 0,
            marginBottom    : 0,
            marginRight     : -1,
            marginLeft      : -2
          };

          if (states.alignLeft)
          {
            if (states.firstChild)
            {
              result.paddingLeft = 6;
              result.paddingRight = 7;
              result.marginLeft = 0;
            }
          }
          else
          {
            if (states.lastChild)
            {
              result.paddingLeft = 8;
              result.paddingRight = 5;
              result.marginRight = 0;
            }
          }
        }
        else
        {
          result =
          {
            backgroundColor : states.over ? "#FAFBFE" : "#E1EEFF",
            zIndex          : 0,
            paddingTop      : 2,
            paddingBottom   : 2,
            paddingLeft     : 5,
            paddingRight    : 6,
            marginRight     : 1,
            marginLeft      : 0
          };

          if (states.alignLeft)
          {
            if (states.firstChild)
            {
              result.paddingLeft = 6;
              result.paddingRight = 5;
            }
          }
          else
          {
            if (states.lastChild)
            {
              result.paddingLeft = 6;
              result.paddingRight = 5;
              result.marginRight = 0;
            }
          }

          if (states.barTop)
          {
            result.border = border_top_normal;
            result.marginTop = 3;
            result.marginBottom = 1;
          }
          else
          {
            result.border = border_bottom_normal;
            result.marginTop = 1;
            result.marginBottom = 3;
          }
        }

        return result;
      }
    },




    /*
    ---------------------------------------------------------------------------
      FIELDSET
    ---------------------------------------------------------------------------
    */

    "field-set" :
    {
      style : function(states) {
        return { backgroundColor : "threedface" };
      }
    },

    "field-set-legend" :
    {
      include : "atom",

      style : function(states)
      {
        return {
          top             : 1,
          left            : 10,
          backgroundColor : "threedface",
          paddingRight    : 3,
          paddingLeft     : 4,
          marginRight     : 10
        };
      }
    },

    "field-set-frame" :
    {
      style : function(states)
      {
        return {
          top           : 8,
          left          : 2,
          right         : 2,
          bottom        : 2,
          paddingTop    : 12,
          paddingRight  : 9,
          paddingBottom : 12,
          paddingLeft   : 9,
          border        : "groove"
        };
      }
    },

    "check-box-field-set-legend" :
    {
      include : "atom",

      style : function(states)
      {
        return {
          top             : 1,
          left            : 10,
          backgroundColor : "threedface",
          paddingRight    : 3
        };
      }
    },

    "radio-button-field-set-legend" :
    {
      include : "check-box-field-set-legend"
    },




    /*
    ---------------------------------------------------------------------------
      SPINNER
    ---------------------------------------------------------------------------
    */

    "spinner" :
    {
      style : function(states)
      {
        return {
          width           : 60,
          height          : 22,
          border          : "inset",
          backgroundColor : "white"
        };
      }
    },

    "spinner-field" :
    {
      include : "text-field",

      style : function(states)
      {
        return {
          width  : "1*",
          border : "undefined"
        };
      }
    },

    "spinner-button-up" :
    {
      style : function(states)
      {
        return {
          height          : "1*",
          width           : 16,
          backgroundColor : "threedface",
          paddingTop      : 0,
          paddingRight    : 0,
          paddingBottom   : 0,
          paddingLeft     : 3,
          border          : states.pressed || states.checked || states.abandoned ? "inset" : "outset"
        };
      }
    },

    "spinner-button-down" :
    {
      style : function(states)
      {
        return {
          height          : "1*",
          width           : 16,
          backgroundColor : "threedface",
          paddingTop    : 1,
          paddingRight  : 0,
          paddingBottom : 0,
          paddingLeft   : 3,
          border : states.pressed || states.checked || states.abandoned ?
            "inset" :
            "outset"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      COLORSELECTOR
    ---------------------------------------------------------------------------
    */

    "colorselector" :
    {
      style : function(states)
      {
        return {
          border : "outset",
          width  : "auto",
          height : "auto"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      DATECHOOSER
    ---------------------------------------------------------------------------
    */

    "datechooser-toolbar-button" :
    {
      style : function(states)
      {
        var result =
        {
          backgroundColor : states.abandoned ? "#FFF0C9" : "buttonface",
          backgroundImage : (states.checked && !states.over) ? "static/image/dotted_white.gif" : null,
          cursor                : "default",
          spacing               : 4,
          width                 : "auto",
          verticalChildrenAlign : "middle"
        };

        if (states.pressed || states.checked || states.abandoned) {
          result.border = "thinInset";
        } else if (states.over) {
          result.border = "thinOutset";
        } else {
          result.border = "undefined";
        }

        if (states.pressed || states.checked || states.abandoned)
        {
          result.paddingTop = 2;
          result.paddingRight = 0;
          result.paddingBottom = 0;
          result.paddingLeft = 2;
        }
        else if (states.over)
        {
          result.paddingTop = result.paddingBottom = 1;
          result.paddingLeft = result.paddingRight = 1;
        }
        else
        {
          result.paddingTop = result.paddingBottom = 2;
          result.paddingLeft = result.paddingRight = 2;
        }

        return result;
      }
    },

    "datechooser-monthyear" :
    {
      style : function(states)
      {
        return {
          font          : "largeCenter",
          verticalAlign : "middle"
        };
      }
    },

    "datechooser-datepane" :
    {
      style : function(states)
      {
        return {
          border          : new qx.renderer.border.Border(1, "solid", "gray"),
          backgroundColor : "window"
        };
      }
    },

    "datechooser-weekday" :
    {
      style : function(states)
      {
        var border = new qx.renderer.border.Border;
        border.setBottom(1, "solid", "gray");

        return {
          border          : border,
          font            : "boldCenter",
          textColor       : states.weekend ? "#6285BA" : "window",
          backgroundColor : states.weekend ? "window" : "#6285BA"
        };
      }
    },

    "datechooser-day" :
    {
      style : function(states)
      {
        return {
          cursor          : "default",
          textColor       : "windowtext",
          font            : "center",
          verticalAlign   : "middle",
          border          : states.today ? new qx.renderer.border.Border(1, "solid", "black") : "undefined",
          textColor       : states.selected ? "highlighttext" : states.otherMonth ? "graytext" : "windowtext",
          backgroundColor : states.selected ? "highlight" : "undefined"
        };
      }
    },

    "datechooser-week" :
    {
      style : function(states)
      {
        var border = new qx.renderer.border.Border;
        border.setRight(1, "solid", "gray");

        var headerBorder = new qx.renderer.border.Border;
        headerBorder.setRight(1, "solid", "gray");
        headerBorder.setBottom(1, "solid", "gray");

        return {
          font        : "default",
          textColor   : "#6285BA",
          paddingLeft : 2,
          border : states.header ? headerBorder : border
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      TABLE
    ---------------------------------------------------------------------------
    */

    "table-focus-statusbar" :
    {
      style : function(states)
      {
        var border = new qx.renderer.border.Border;
        border.setTop(1, "solid", "threedshadow");

        return {
          font         : "default",
          border       : border,
          paddingLeft  : 2,
          paddingRight : 2
        };
      }
    },

    "table-focus-indicator" :
    {
      style : function(states)
      {
        var result = {};

        if (states.editing)
        {
          result.border = new qx.renderer.border.Border(2, "solid", "#b3d9ff");
        }
        else if (states.tableHasFocus)
        {
          result.border = new qx.renderer.border.Border(3, "solid", "#b3d9ff");
        }
        else
        {
          result.border = new qx.renderer.border.Border(3, "solid", "#c5c8ca");
        }

        return result;
      }
    },

    "table-editor-textfield" :
    {
      style : function(states)
      {
        return {
          font          : "default",
          border        : "undefined",
          paddingLeft   : 2,
          paddingRight  : 2,
          paddingTop    : 0,
          paddingBottom : 0
        };
      }
    },

    "table-header-cell" :
    {
      style : function(states)
      {
        if (states.mouseover)
        {
          var border = new qx.renderer.border.Border;
          border.set(
          {
            colorRight  : "#d6d2c2",
            styleRight  : "solid",
            widthRight  : 1,
            colorBottom : "#F9B119",
            styleBottom : "solid",
            widthBottom : 2
          });
        }
        else
        {
          var border = new qx.renderer.border.Border;
          border.set(
          {
            colorRight  : "#d6d2c2",
            styleRight  : "solid",
            widthRight  : 1,
            colorBottom : "#d6d2c2",
            styleBottom : "solid",
            widthBottom : 2
          });
        }

        return {
          cursor                : "default",
          paddingLeft           : 2,
          paddingRight          : 2,
          spacing               : 2,
          overflow              : "hidden",
          iconPosition          : "right",
          verticalChildrenAlign : "middle",
          border                : border,
          backgroundColor       : states.mouseover ? "white" : "#ebeadb"
        };
      }
    },




    /*
    ---------------------------------------------------------------------------
      SPLITPANE
    ---------------------------------------------------------------------------
    */

    "splitpane" :
    {
      style : function(states) {
        return { overflow : "hidden" };
      }
    },

    "splitpane-glasspane" :
    {
      style : function(states)
      {
        return {
          zIndex          : 1e7,
          backgroundColor : "threedshadow",
          opacity : states.visible ? 0.2 : 0
        };
      }
    },

    "splitpane-splitter" :
    {
      style : function(states)
      {
        return {
          backgroundColor : "threedface",
          cursor : states.horizontal ? "col-resize" : "row-resize"
        };
      }
    },

    "splitpane-slider" :
    {
      style : function(states)
      {
        return {
          opacity : 0.5,
          zIndex  : 1e8,
          backgroundColor : states.dragging ? "threeddarkshadow" : "threedface"
        };
      }
    },

    "splitpane-knob" :
    {
      style : function(states)
      {
        var result = { opacity : states.dragging ? 0.5 : 1.0 };

        if (states.horizontal)
        {
          result.top = "33%";
          result.left = null;
          result.marginLeft = -6;
          result.marginTop = 0;
          result.cursor = "col-resize";
        }
        else if (states.vertical)
        {
          result.top = null;
          result.left = "33%";
          result.marginTop = -6;
          result.marginLeft = 0;
          result.cursor = "row-resize";
        }

        return result;
      }
    }
  }
});
