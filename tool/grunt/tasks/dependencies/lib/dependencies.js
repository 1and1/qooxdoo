/* *****************************************************************************

   qooxdoo - the new era of web development

   http://qooxdoo.org

   Copyright:
     2006-2013 1&1 Internet AG, Germany, http://www.1und1.de

   License:
     LGPL: http://www.gnu.org/licenses/lgpl.html
     EPL: http://www.eclipse.org/org/documents/epl-v10.php
     See the LICENSE file in the project's top-level directory for details.

   Authors:
     * Thomas Herchenroeder (thron7)
     * Richard Sternagel (rsternagel)

***************************************************************************** */

/**
 * Calculate external dependencies of an Esprima AST.
 *
 */


//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

var fs = require('fs');
var path = require('path');
var escope = require('escope');
var esparent = require('./esparent');
var escodegen = require('escodegen');
var js_builtins = require('../node_modules/jshint/src/vars'); // TODO: this is darn ugly, as i have to poke into internal modules of jshint
var pipeline = require('./util').pipeline;
var filter = require('./util').filter;
var load_time = require('./load_time');
var qcenvironment = require('./qcenvironment');
var _ = require('underscore');

function is_var(node) {
  return ["Identifier", "MemberExpression"].indexOf(node.type) !== -1;
}

function findVarRoot (var_node) {
  if (!is_var(var_node)) {
    return undefined;
  } else {
    while (var_node.parent
      && var_node.parent.type === 'MemberExpression'
      && var_node.parent.computed === false) {
        var_node = var_node.parent;
      }
    return var_node;
  }
}

/**
 * Takes a variable AST node and returns the longest possible variable name.
 */
function assemble(var_node) {
  var var_root = findVarRoot(var_node);
  var assembled = escodegen.generate(var_root);
  return assembled;
}

function dependencies_from_ast(scope, optObj) {

  var dependencies = [];

  scope.through.forEach( function (ref) {
    if (!ref.resolved) {
      dependencies.push(ref);
    }
  });
  return dependencies;
}

function dependencies_from_envcalls(scope, optObj) {

}

function not_builtin(ref) {
  var ident = ref.identifier;
  if (ident.type !== "Identifier") {
    return true;
  }
  // check in various js_builtins maps
  if ([
      'reservedVars',
      'ecmaIdentifiers',
      'browser',
      'devel',
      'worker',
      'nonstandard'
    ].some(function(el){
        return ident.name in js_builtins[el];
      })
    ) {
      return false;
  }
  return true;
}

function not_jsignored(ref) {

}

function not_jsignore_envcall(ref) {

}

/**
 * See ecmascript/frontend/tree.py#hasParentContext
 */
/*
function hasParentContext(node, parent_expression) {
  var curr_node = node;
  parent_expression.split('/').reverse().forEach(function (path_elem) {
    if (curr_node.parent) {
      if (path_elem == '*' || curr_node.parent.type == path_elem) {
        curr_node = curr_node.parent;
      } else {
        return false;
      }
    } else {
      return false;
    }
    return true;
  }
}
*/

/**
 * Return [name, map_tree] for any class map found in etree.
 * Restricted to top-level class definitions.
 */
/*
function getClassMaps(etree, optObj) {
  var controller = new estraverse.Controller();
  controller.traverse(etree, {
    enter : function (node,parent) {
      if (is_factory_call(node) && hasParentContext(node, "Program/ExpressionStatement")){

      }
    }
  }
}
*/

/**
 * Gather the remain globals that are not referenced outside of class maps.
 *
 * Approach: Take the .through references from the global escope.Scope and
 * remove those references that point inside class maps. The remaining are
 * unresolved symbols referenced in code that is not part of a class map.
 */
function get_non_class_deps(etree, deps_map, optObj) {

}

/**
 * Better alternative to analyze_tree():
 * Get dependencies as a structured map that reflects qooxdoo's class map.
 * This allows for good caching (these deps are shallow), and is much better
 * for transitive load dependency exploration:
 * - the driver for the transitive dependencies just has to use this function
 *   and pick the deps of a specific feature *plus* the non-class deps.
 *
 * Sample return value:
 *
 *   {
 *     __non_class_code__ : []  // top-level, @require etc.
 *     "custom.Application" : {
 *       extend : [<escope.Reference>, ...],
 *       implement : [...],
 *       statics : {
 *         foo : [...],
 *         bar : [...]
 *       },
 *       members : {
 *         baz : [...],
 *         yep : [...]
 *       }
 *       destruct : [...],
 *       defer : [...],
 *       ...
 *     }
 *   }
 *
 * @returns {Object} map embedding dependencies { 'custom.ClassA' : { extend : [escope.References] } }
 */
var KeysWithSubMaps = {
  statics:true,
  members:true,
};


/**
 * Get deps by analysing this paricular (sub)tree.
 */
function analyze_tree(etree, optObj) {

}

function analyze_as_map(etree, optObj) {
  var result = {};

  // extract deps from class maps
  getClassMaps(etree, optObj).forEach(function (class_spec) { // class_spec = ["custom.ClassA" : <esprima.Node>]
    var class_name = class_spec[0];
    var class_map = class_spec[1];
    var deps_map = result[class_name] = {};
    var curr_map;

    // iterate class map
    class_spec.properties.forEach(function (prop) {
      var prop_name = prop.key.name;
      // iterate sub-maps
      if (prop_name in KeysWithSubMaps) {
        curr_map = deps_map[prop_name] = {};
        prop.value.properties.forEach(function (subprop) {
          var sprop_name = subprop.key.name;
          curr_map[sprop_name] = analyze_tree(subprop.value, optObj);
        });
      } else {
        deps_map[prop_name] = analyze_tree(prop.value, optObj);
      }
    });
  });

  // take the remaining symbols for the remaining code in the tree
  // this includes all code outside class maps, top-level code, @require hints, etc.
  result['__non_class_code__'] = get_non_class_deps(etree, deps_map, optObj);

  return result;
}

//------------------------------------------------------------------------------
// Public Interface
//------------------------------------------------------------------------------

/**
 * Interface function.
 * Analyze an Esprima tree for unresolved references.
 *
 * @param etree {Object} AST from esprima
 * @paramoptObj {Object} options
 * @returns {escope.Reference[]}
 */
function analyze(etree, optObj) {
  var result = [];
  var globalScope = escope.analyze(etree).scopes[0];

  esparent.annotate(etree);  // TODO: don't call here if called from analyze_as_map()!
  load_time.annotate(globalScope,  // add load/runtime annotations to scopes
    true);  // TODO: this should be a dynamic parameter to analyze()
  // Deps from Scope
  var scope_globals = dependencies_from_ast(globalScope, optObj);
  // -- alt: Deps from Tree


  result = pipeline(scope_globals,
    _.partial(filter, not_builtin) // filter built-ins
    // add jsdoc @require etc.
    // filter jsdoc @ignore
    // check library classes
    );

  // TBD: add transitive deps
    // go through 'load' deps
    // check if 'needs_recursion' (these can only be function calls)
    // get function implementation
    // add all its dependencies to originator's deps (load/runtime doesn't matter anymore)
    // recurse on those dependencies

  // TBD: turn Reference()s into strings?

  // add feature classes from q.c.Environment calls
  var qcEnvClassCode = fs.readFileSync(fs.realpathSync(
    path.join(__dirname, "../../../../../framework/source/class/qx/core/Environment.js")),
    {encoding: "utf-8"});
  result = result.concat(qcenvironment.extract(etree, qcEnvClassCode));

  return result;
}

//------------------------------------------------------------------------------
// Exports
//------------------------------------------------------------------------------

module.exports = {
  analyze : analyze,
  assemble : assemble
};
