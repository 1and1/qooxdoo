/* ************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2004-2007 by 1&1 Internet AG, Germany, http://www.1and1.org

   License:
     LGPL 2.1: http://www.gnu.org/licenses/lgpl.html
     EPL 1.0: http://www.eclipse.org/org/documents/epl-v10.php     

   Authors:
     * Sebastian Werner (wpbasti)
     * Andreas Ecker (ecker)
     * Fabian Jakobs (fjakobs)

************************************************************************ */

/**
 * Create a new instance of qx.locale.String
 */
qx.OO.defineClass("qx.locale.String");


/**
 * Get quotation start sign
 *
 * @param locale {String} optional locale to be used
 * @return {qx.locale.LocalizedString} quotation start sign
 */
qx.Class.getQuotationStart = function(locale) {
  return new qx.locale.LocalizedString("cldr_quotationStart", [], locale);
};


/**
 * Get quotation end sign
 *
 * @param locale {String} optional locale to be used
 * @return {qx.locale.LocalizedString} quotation end sign
 */
qx.Class.getQuotationEnd = function(locale) {
  return new qx.locale.LocalizedString("cldr_quotationEnd", [], locale);
};


/**
 * Get quotation alternative start sign
 *
 * @param locale {String} optional locale to be used
 * @return {qx.locale.LocalizedString} alternative quotation start sign
 */
qx.Class.getQuotationStart = function(locale) {
  return new qx.locale.LocalizedString("cldr_alternateQuotationStart", [], locale);
};


/**
 * Get quotation alternative end sign
 *
 * @param locale {String} optional locale to be used
 * @return {qx.locale.LocalizedString} alternative quotation end sign
 */
qx.Class.getQuotationEnd = function(locale) {
  return new qx.locale.LocalizedString("cldr_alternateQuotationEnd", [], locale);
};