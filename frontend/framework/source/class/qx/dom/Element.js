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
 * The intention of this class is to bring more convenience to the attribute
 * and style features implemented by the other classes. It wraps the features
 * of multiple classes in one unique interface.
 *
 * There is a automatic detection if the given name should be interpreted
 * as HTML property, attribute or style. It even supports complex
 * setter/getter pairs like opacity. All these features are usable through
 * the same interface by just using the name of the attribute/style etc. to
 * modify/query.
 *
 * This class is optimized for performance, but is not as optimal in performance
 * aspects than the more native implementations. For all highly performance
 * crititcal areas like animations it would be the best to directly use the
 * classes which contain the implementations.
 */
qx.Class.define("qx.dom.Element",
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
      STRUCTURE
    ---------------------------------------------------------------------------
    */

    /**
     * Whether the given <code>child</code> is a child of <code>parent</code>
     *
     * @type static
     * @param parent {Element} parent element
     * @param child {Node} child node
     * @return {Boolean} true when the given <code>child</code> is a child of <code>parent</code>
     */
    hasChild : function(parent, child) {
      return child.parentNode === parent;
    },


    /**
     * Whether the given <code>element</code> has children.
     *
     * @type static
     * @param element {Element} element to test
     * @return {Boolean} true when the given <code>element</code> has at least one child node
     */
    hasChildren : function(element) {
      return !!element.firstChild;
    },


    /**
     * Whether the given <code>element</code> has any child elements.
     *
     * @type static
     * @param element {Element} element to test
     * @return {Boolean} true when the given <code>element</code> has at least one child element
     */
    hasChildElements : function(element)
    {
      element = element.firstChild;

      while(element)
      {
        if (element.nodeType === 1) {
          return true;
        }

        element = element.nextSibling;
      }

      return false;
    },





    /*
    ---------------------------------------------------------------------------
      INSERTION
    ---------------------------------------------------------------------------
    */

    /**
     * Inserts <code>node</code> at the given <code>index</code>
     * inside <code>parent</code>.
     *
     * @type static
     * @param index {Integer} where to insert
     * @param node {Node} node to insert
     * @param parent {Element} parent element node
     * @return {Boolean} returns true (successful)
     */
    insertAt : function(index, node, parent)
    {
      var ref = parent.childNodes[i];

      if (ref) {
        parent.insertBefore(node, ref);
      } else {
        parent.appendChild(node);
      }

      return true;
    },


    /**
     * Insert <code>node</code> into <code>parent</code> as first child.
     * Indexes of other children will be incremented by one.
     *
     * @type static
     * @param node {Node} Node to insert
     * @param parent {Element} parent element node
     * @return {Boolean} returns true (successful)
     */
    insertBegin : function(node, parent)
    {
      if (parent.firstChild) {
        this.insertBefore(node, parent.firstChild);
      } else {
        parent.appendChild(node);
      }
    },


    /**
     * Insert <code>node</code> into <code>parent</code> as last child.
     *
     * @type static
     * @param node {Node} Node to insert
     * @param parent {Element} parent element node
     * @return {Boolean} returns true (successful)
     */
    insertEnd : function(node, parent) {
      parent.appendChild(node);
    },


    /**
     * Inserts <code>node</code> before <code>ref</code> in the same parent.
     *
     * @type static
     * @param node {Node} Node to insert
     * @param ref {Node} Node which will be used as reference for insertion
     * @return {Boolean} returns true (successful)
     */
    insertBefore : function(node, ref)
    {
      ref.parentNode.insertBefore(node, ref);
      return true;
    },


    /**
     * Inserts <code>node</code> after <code>ref</code> in the same parent.
     *
     * @type static
     * @param node {Node} Node to insert
     * @param ref {Node} Node which will be used as reference for insertion
     * @return {Boolean} returns true (successful)
     */
    insertAfter : function(node, ref)
    {
      var parent = ref.parentNode;

      if (ref == parent.lastChild) {
        parent.appendChild(node);
      } else {
        return this.insertBefore(node, ref.nextSibling);
      }

      return true;
    },





    /*
    ---------------------------------------------------------------------------
      REMOVAL
    ---------------------------------------------------------------------------
    */

    /**
     * Removes the given <code>node</code> from its parent element.
     *
     * @type static
     * @param node {Node} Node to remove
     * @return {Boolean} <code>true</code> when node was successfully removed,
     *   otherwise <code>false</code>
     */
    remove : function(node)
    {
      if (!node.parentNode) {
        return false;
      }

      node.parentNode.removeChild(node);
      return true;
    },


    /**
     * Removes the given <code>node</code> from the <code>parent</code>.
     *
     * @type static
     * @param node {Node} Node to remove
     * @param parent {Element} parent element which contains the <code>node</code>
     * @return {Boolean} <code>true</code> when node was successfully removed,
     *   otherwise <code>false</code>
     */
    removeChild : function(node, parent)
    {
      if (node.parentNode !== parent) {
        return false;
      }

      parent.removeChild(child);
      return true;
    },


    /**
     * Removes the node at the given <code>index</code>
     * from the <code>parent</code>.
     *
     * @type static
     * @param index {Integer} position of the node which should be removed
     * @param parent {Element} parent DOM element
     * @return {Boolean} <code>true</code> when node was successfully removed,
     *   otherwise <code>false</code>
     */
    removeChildAt : function(index, parent)
    {
      var child = parent.childNodes[index];

      if (!child) {
        return false;
      }

      parent.removeChild(child);
      return true;
    },





    /*
    ---------------------------------------------------------------------------
      REPLACE
    ---------------------------------------------------------------------------
    */

    /**
     * Replaces <code>oldNode</code> with <code>newNode</code> in the current
     * parent of <code>oldNode</code>.
     *
     * @type static
     * @param newNode {Node} DOM node to insert
     * @param oldNode {Node} DOM node to remove
     * @return {Boolean} <code>true</code> when node was successfully replaced
     */
    replaceChild : function(newNode, oldNode)
    {
      if (!oldNode.parentNode) {
        return false;
      }

      oldNode.parentNode.replaceChild(newNode, oldNode);
      return true;
    },


    /**
     * Replaces the node at <code>index</code> with <code>newNode</code> in
     * the given parent.
     *
     * @type static
     * @param newNode {Node} DOM node to insert
     * @param index {Integer} position of old DOM node
     * @param parent {Element} parent DOM element
     * @return {Boolean} <code>true</code> when node was successfully replaced
     */
    replaceAt : function(newNode, index, parent)
    {
      oldNode = parent.childNodes[index];

      if (!oldNode) {
        return false;
      }

      parent.replaceChild(newNode, oldNode);
      return true;
    }
  }
});
