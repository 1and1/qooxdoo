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

#module(util)

************************************************************************ */

/**
 * A string builder class
 *
 * += operator is faster in Firefox and Opera.
 * Array push/join is faster in Internet Explorer
 *
 * Even with this wrapper, which costs some time, this is
 * faster in Firefox than the alternative Array concat in
 * all browsers (which is in relation to IE's performance issues
 * only marginal). The IE performance loss caused by this
 * wrapper is not relevant.
 *
 * So this class seems to be the best compromise to handle
 * string concatenation.
 */
qx.List.define("qx.util.StringBuilder",
{
  /*
  *****************************************************************************
    MEMBERS
  *****************************************************************************
  */
    
  members : 
  {
    /**
     * Removes all content
     *
     * @type member
     * @return {void}
     */
    clear : function() {
      this.length = 0;
    },
    

    /**
     * Returns the concatted strings.
     *
     * @type member
     * @return {String} Concatted strings
     */
    get : function() {
      return this.join("");
    },
    

    /**
     * Adds new strings.
     *
     * @type member
     * @signature function(strings)
     * @param strings {String...} The separate strings to add
     * @return {void}
     */
    add : null,
    

    /**
     * Whether the string builder is empty
     *
     * @type member
     * @return {Boolean} <code>true</code> when the builder is empty
     */
    isEmpty : function() {
      return this.length === 0;
    }    
  },
  
  
  

  /*
  *****************************************************************************
     DEFER
  *****************************************************************************
  */  
  
  defer : function(statics, members) {
    members.add = members.push;
  } 
});
