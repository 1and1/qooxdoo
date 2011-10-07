/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2011 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Tino Butz (tbtz)

************************************************************************ */

/**
 * EXPERIMENTAL - NOT READY FOR PRODUCTION
 *
 */
qx.Class.define("qx.ui.mobile.container.SplitPane",
{
  extend : qx.ui.mobile.container.Composite,


  properties : {
    defaultCssClass : {
      refine : true,
      init : "splitPane"
    }
  },

  /*
  *****************************************************************************
     CONSTRUCTOR
  *****************************************************************************
  */


  construct : function(layout)
  {
    this.base(arguments, layout || new qx.ui.mobile.layout.HBox());
    this.__left = this._createLeftContainer();
    this.add(this.__left);
    
    if (qx.bom.Viewport.isPortrait()) {
      this.getPopup().add(this.__left);
      this.getPopup().show();
    }

    this.__right = this._createRightContainer();
    this.add(this.__right, {flex:1});
    qx.event.Registration.addListener(window, "orientationchange", this._onOrientationChange, this);
  },


  members : {
    __left : null,
    __right : null,
    __popup : null,
    

    getLeft : function() {
      return this.__left;
    },
    
    
    getRight : function() {
      return this.__right;
    },


    getPopup : function() {
      if(this.__popup == null) {
        this.__popup = new qx.ui.mobile.dialog.Popup();
      }
      return this.__popup;
    },
    
    
    _onOrientationChange : function(evt) {
      if (evt.isPortrait()) {
        this.getPopup().add(this.__left);
        this.getPopup().show();
      } else {
        this.addBefore(this.__left, this.__right);
        this.getPopup().hide();
      }
    },


    _createLeftContainer : function() {
      return this.__createContainer("splitPaneLeft")
    },


    _createRightContainer : function() {
      return this.__createContainer("splitPaneRight");
    },


    __createContainer : function(cssClass) {
      var container = new qx.ui.mobile.container.Composite(new qx.ui.mobile.layout.Card());
      container.setDefaultCssClass(cssClass);
      return container;
    }
  }
});
