/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2006 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)

************************************************************************ */

/* ************************************************************************

#module(core)

************************************************************************ */

/**
 * String helper functions
 */
qx.OO.defineClass("qx.lang.String");

/**
 * converts a string seperated by '-' to camel case.
 * Example:
 * <pre>qx.lang.String.toCamelCase("to-camel-case") == "toCamelCase"</pre>
 *
 * @param str {string} string seperated by '-'
 * @return {string} camel case string
 */
qx.Class.toCamelCase = function(str)
{
  var vArr = str.split("-"), vLength = vArr.length;

  if(vLength == 1) {
    return vArr[0];
  }

  var vNew = str.indexOf("-") == 0 ? vArr[0].charAt(0).toUpperCase() + vArr[0].substring(1) : vArr[0];

  for (var vPart, i=1; i<vLength; i++)
  {
    vPart = vArr[i];
    vNew += vPart.charAt(0).toUpperCase() + vPart.substring(1);
  }

  return vNew;
};


/**
 * removes white space from the left side of a string
 *
 * @param str {string}
 * @return {string}
 */
qx.Class.trimLeft = function(str) {
  return str.replace(/^\s+/, "");
};


/**
 * removes white space from the right side of a string
 *
 * @param str {string}
 * @return {string}
 */
qx.Class.trimRight = function(str) {
  return str.replace(/\s+$/, "");
};


/**
 * removes white space from the left and the right side of a string
 *
 * @param str {string}
 * @return {string}
 */
qx.Class.trim = function(str) {
  return str.replace(/^\s+|\s+$/g, "");
};


/**
 * Remove HTML/XML tags from a string
 * Example:
 * <pre>qx.lang.String.stripTags("<h1>Hello</h1>") == "Hello"</pre>
 *
 * @param str {string} string containing tags
 * @return {string} the string with stripped tags
 */
qx.Class.stripTags = function(str) {
  return str.replace(/<\/?[^>]+>/gi, "");
};

qx.Class.startsWith = function(fullstr, substr) {
  return !fullstr.indexOf(substr);
};

qx.Class.endsWith = function(fullstr, substr) {
  return fullstr.lastIndexOf(substr) === fullstr.length-substr.length;
};

qx.Class.pad = function(str, length, ch)
{
  if (typeof ch === "undefined") {
    ch = "0";
  }

  var temp = "";

  for (var i=length, l=str.length; l<i; l++) {
    temp += ch;
  }

  return temp + str;
};

qx.Class.toFirstUp = function(str) {
  return str.charAt(0).toUpperCase() + str.substr(1);
};

qx.Class.add = function(str, v, sep)
{
  if (str == v)
  {
    return str;
  }
  else if (str == "")
  {
    return v;
  }
  else
  {
    if (sep == null) {
      sep = ",";
    }

    var a = str.split(sep);

    if (a.indexOf(v) == -1)
    {
      a.push(v);
      return a.join(sep);
    }
    else
    {
      return str;
    }
  }
};

qx.Class.remove = function(str, v, sep)
{
  if (str == v || str == "")
  {
    return "";
  }
  else
  {
    if (sep == null) {
      sep = ",";
    }

    var a = str.split(sep);
    var p = a.indexOf(v);

    if (p === -1) {
      return str;
    }

    do { a.splice(p, 1); }
    while((p = a.indexOf(v)) != -1);

    return a.join(sep);
  }
};

qx.Class.contains = function(str, s) {
  return str.indexOf(s) != -1;
};


/**
 * Escapes all chars that have a special meaning in regular expressions
 *
 * @param str {string} the string where to escape the chars.
 * @return {string} the string with the escaped chars.
 */
qx.Class.escapeRegexpChars = function(str) {
  return str.replace(/([\\\.\(\)\[\]\{\}\^\$\?\+\*])/g, "\\$1");
};


/**
 * Print a list of arguments using a format string
 * In the format string occurences of %n are replaced by the n'th element of the args list.
 * Example:
 * <pre>qx.lang.String.format("Hello %1, my name is %2", ["Egon", "Franz"]) == "Hello Egon, my name is Franz"<pre>
 *
 * @param pattern {string} format string
 * @param args {Array}
 * @return {string}
 */
qx.Class.format = function(pattern, args)
{
  var str = pattern;

  for (var i=0; i<args.length; i++) {
    str = str.replace(new RegExp("%" + (i+1), "g"), args[i]);
  }

  return str;
};
