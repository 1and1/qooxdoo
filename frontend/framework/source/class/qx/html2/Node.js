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


************************************************************************ */

/* ************************************************************************

#module(html2)

************************************************************************ */

/**
 * Basic node creation and type detection
 */
qx.Class.define("qx.html2.Node",
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
      DOCUMENT ACCESS
    ---------------------------------------------------------------------------
    */

    /**
     * Returns the owner document of the given node
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Document | null} The document of the given DOM node
     */
    getDocument : function(node) 
    {
      if (this.isDocumentNode(node)) {
        return node;
      }
      
      return node.ownerDocument || node.document || null;
    },


    /**
     * Returns the DOM2 <code>defaultView</code> (window).
     *
     * @type static
     * @signature function(node)
     * @param node {Node} node to inspect
     * @return {Window} the <code>defaultView</code> of the given node
     */
    getWindow : qx.core.Variant.select("qx.client",
    {
      "mshtml" : function(node) {
        return this.getDocument(node).parentWindow;
      },

      "default" : function(node) {
        return this.getDocument(node).defaultView;
      }
    }),
    
    
    /**
     * Returns the document element. (Logical root node)
     *
     * This is a convenience attribute that allows direct access to the child
     * node that is the root element of the document. For HTML documents,
     * this is the element with the tagName "HTML".
     *
     * @type static
     * @param node {Node} node to inspect
     * @return {Element} document element of the given node
     */
    getDocumentElement : function(node) {
      return this.getDocument(node).documentElement;
    },
    

    /**
     * Returns the body element. (Visual root node)
     *
     * This normally only makes sense for HTML documents. It returns
     * the content area of the HTML document.
     *
     * @type static
     * @param node {Node} node to inspect
     * @return {Element} document body of the given node
     */
    getBodyElement : function(node) {
      return this.getDocument(node).body;
    },
    





    /*
    ---------------------------------------------------------------------------
      TYPE TESTS
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the given node is a DOM element node
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM element
     */
    isElement : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.ELEMENT);
    },


    /**
     * Whether the given node is a DOM document node
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true when the node is a document
     */
    isDocument : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.DOCUMENT);
    },


    /**
     * Whether the given node is a DOM text node
     *
     * @type static
     * @param node {Node} the node which should be tested
     * @return {Boolean} true if the node is a DOM element
     */
    isText : function(node) {
      return !!(node && node.nodeType === qx.dom.Node.TEXT);
    },


    /**
     * Check whether the given object is a browser window object.
     *
     * @param node {Object} the object which should be tested
     * @return {Boolean} true if the object is a window object.
     */
    isWindow : function(node) {
      return node.document && this.getDefaultView(node.document) == node;
    }
  }
});
