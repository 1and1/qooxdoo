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

   ======================================================================

   This class contains code based on the following work:

   * Base2
     http://code.google.com/p/base2/
     Version 0.9

     Copyright:
       (c) 2006-2007, Dean Edwards

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Dean Edwards


   * Prototype JS
     http://www.prototypejs.org/
     Version 1.5

     Copyright:
       (c) 2006-2007, Prototype Core Team

     License:
       MIT: http://www.opensource.org/licenses/mit-license.php

     Authors:
       * Prototype Core Team


************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * High performance DOM element interaction.
 */
qx.Class.define("qx.html2.ElementUtil",
{
  /*
  *****************************************************************************
     STATICS
  *****************************************************************************
  */

  statics :
  {
    /*
    ---------------------------------------------------------------------------
      NODE CREATION & TYPES
    ---------------------------------------------------------------------------
    */

    /**
     * Creates an DOM element
     *
     * @type static
     * @param name {String} Tag name of the element
     * @param xhtml {Boolean?false} Enable XHTML
     * @return {Element} the created element node
     */
    createElement : function(name, xhtml)
    {
      if (xhtml) {
        return document.createElementNS("http://www.w3.org/1999/xhtml", name);
      } else {
        return document.createElement(name);
      }
    },


    /**
     * Whether the given node is a DOM element
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM element
     */
    isElement : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.ELEMENT);
    },


    /**
     * Whether the given node is a document
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true when the node is a document
     */
    isDocument : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.DOCUMENT);
    },










    /*
    ---------------------------------------------------------------------------
      NODE STRUCTURE
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the owner document of the given node
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Document|null} The document of the given DOM node
     */
    getDocument : function(node) {
      return node.ownerDocument || node.document || null;
    },


    /**
     * Returns the DOM2 "defaultView" which represents the window
     * of a DOM node
     *
     * @type static
     * @param node {Node} TODOC
     * @return {var} TODOC
     */
    getDefaultView : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node) {
        return this.getDocument(node).parentWindow;
      },

      "default" : function(node) {
        return this.getDocument(node).defaultView;
      }
    }),


    /**
     * Whether the first element contains the second one
     *
     * @type static
     * @param el {Element} Parent element
     * @param target {Node} Child node
     * @return {Boolean}
     */
    contains : function(el, target)
    {
      if (el.contains)
      {
        return this.isDocument(el) ?
          el === this.getOwnerDocument(target) :
          el !== target && el.contains(target);
      }
      else
      {
        while (target && (target = target.parentNode) && el != target) {
          continue;
        }

        return !!target;
      }
    },


    /**
     * Whether the given element is empty
     *
     * @type static
     * @param el {Element} The element to check
     * @return {Boolean} true when the element is empty
     */
    isEmpty : function(el)
    {
      el = el.firstChild;

      while (el)
      {
        if (el.nodeType === qx.dom.Node.ELEMENT || el.nodeType === qx.dom.Node.TEXT) {
          return false;
        }

        el = el.nextSibling;
      }

      return true;
    },


    /**
     * Returns the DOM index of the given node
     *
     * @type static
     * @param node {Node} Node to look for
     * @return {Integer} The DOM index
     */
    getNodeIndex : function(node)
    {
      var index = 0;

      while (node && (node = node.previousSibling)) {
        index++;
      }

      return index;
    },


    /**
     * Return the next element to the supplied element
     *
     * "nextSibling" is not good enough as it might return a text or comment el
     *
     * @type static
     * @param el {Element} Starting element node
     * @return {Element|null} Next element node
     */
    getNextElementSibling : function(el)
    {
      while (el && (el = el.nextSibling) && !this.isElement(el)) {
        continue;
      }

      return el || null;
    },


    /**
     * Return the previous element to the supplied element
     *
     * "previousSibling" is not good enough as it might return a text or comment el
     *
     * @type static
     * @param el {Element} Starting element node
     * @return {Element|null} Previous element node
     */
    getPreviousElementSibling : function(el)
    {
      while (el && (el = el.previousSibling) && !this.isElement(el)) {
        continue;
      }

      return el || null;
    },


    /**
     * Removes whitespace-only text node children
     *
     * @type static
     * @param el {Element} Element to cleanup
     * @return {void}
     */
    cleanWhitespace: function(el)
    {
      var node = el.firstChild;

      while (node)
      {
        var nextNode = node.nextSibling;

        if (node.nodeType == 3 && !/\S/.test(node.nodeValue)) {
          el.removeChild(node);
        }

        node = nextNode;
      }
    },





    /*
    ---------------------------------------------------------------------------
      SCROLL HANDLING
    ---------------------------------------------------------------------------
    */

    scrollToX : function(el, x) {
      el.scrollLeft = x;
    },

    scrollToY : function(el, y) {
      el.scrollTop = y;
    },










    /*
    ---------------------------------------------------------------------------
      ELEMENT VISIBILITY
    ---------------------------------------------------------------------------
    */

    /**
     * Shows the given element
     *
     * @type static
     * @param el {Element} DOM element to show
     * @return {void}
     */
    show : function(el) {
      el.style.visibility = "visible";
    },


    /**
     * Hides the given element
     *
     * @type static
     * @param el {Element} DOM element to show
     * @return {void}
     */
    hide : function(el) {
      el.style.visibility = "hidden";
    },


    /**
     * Toggle the visibility of the given element
     *
     * @type static
     * @param el {Element} DOM element to show
     * @return {void}
     */
    toggle : function(el) {
      el.style.visibility = this.isHidden(el) ? "visible" : "hidden";
    },


    /**
     * Whether the given element is visible
     *
     * @type static
     * @param el {Element} DOM element to query
     * @return {Boolean} true when the element is visible
     */
    isVisible : function(el) {
      return this.getStyle(el, "visibility") !== "hidden";
    },


    /**
     * Whether the given element is visible
     *
     * @type static
     * @param el {Element} DOM element to query
     * @return {Boolean} true when the element is visible
     */
    isHidden : function(el) {
      return this.getStyle(el, "visibility") === "hidden";
    }
  }
});
