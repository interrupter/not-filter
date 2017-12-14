
const lowerCase = require('lower-case'),
	notPath = require('not-path');

/**
 * @const {string} OPT_OR
 */
const OPT_OR = 'or';

/**
 * @const {string} OPT_AND
 */
const OPT_AND = 'and';

/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_INPUT_PATH = ':query.filter';
/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_OUTPUT_PATH = ':filter';
/**
 * @const {string} OPT_INPUT_GETTER
 */
const OPT_INPUT_GETTER = null;
/**
 * @const {string} OPT_OUTPUT_SETTER
 */
const OPT_OUTPUT_SETTER = null;

exports.OPT_OR = OPT_OR;
exports.OPT_AND = OPT_AND;

exports.pathToFilterInput = ':query.filter',
exports.pathToFilter = ':filter',
exports.getterOfFilterInput = null,
exports.setterOfFilter = null;

/**
 * Reducer for any value to boolean true/false
 * @param {string|number|boolean|any} val some value to be reduced to true/false
 * @return {boolean|undefined} if can determine goes with boolean else return undefined
 */
const getBoolean = (val) => {
	let t = parseInt(val),
		s = lowerCase(val);
	if (t === 0 || t === 1) {
		return !!t;
	} else {
		if (s === 'true') {
			return true;
		} else if (s === 'false') {
			return false;
		} else {
			return undefined;
		}
	}
};


/**
 * Parses passed in object according schema
 * returns rule
 * @param {object} block input rule block
 * @param {object} modelSchema notModelSchema
 * @return {object} filter rule
 */

exports.parseBlock = (block, modelSchema)=>{
	let emptyRule = {},
		t;
	for (let k in modelSchema) {
		if (modelSchema[k].searchable && block.hasOwnProperty(k) && typeof block[k] !== 'undefined' && block[k] !== null) {
			let searchString = block[k],
				searchNumber = parseFloat(searchString);
			switch (modelSchema[k].type) {
			case Number:
				if (isNaN(searchNumber)) {
					continue;
				} else {
					emptyRule[k] = searchNumber;
				}
				break;
			case Boolean:
				t = getBoolean(searchString);
				if (typeof t !== 'undefined') {
					emptyRule[k] = t;
				}
				break;
			case String:
				emptyRule[k] = searchString+'';
				break;
			default:
				continue;
			}
		}
	}
	return emptyRule;
};


/**
 * Parse filter input as object
 * @param {object} 	input 			filter object
 * @param {object} 	modelSchema 	not model schema
 * @return {object}	filter
 */
exports.parseAsAnd = function(input, modelSchema){
	let filter = exports.createFilter(OPT_AND),
		rule = exports.parseBlock(input, modelSchema);
	filter = exports.addRule(filter, rule);
	return filter;
};

/**
 * Parse filter input as array
 * @param {object} 	input 			filter object
 * @param {object} 	modelSchema 	not model schema
 * @return {object}	filter
 */
exports.parseAsOr = function(input, modelSchema){
	let filter = exports.createFilter(OPT_OR);
	for(let t = 0; t < input.length; t++){
		filter = exports.addRule(filter, exports.parseBlock(input[t], modelSchema));
	}
	return filter;
};

/**
* Express compatible middleware
* @param {ClientRequest} req request object
* @param {ServerResponse} res response object
* @param {function} next callback
*/
exports.parseFilter = function(input, modelSchema){
	let result;
	//array for ||
	//object for &&
	switch (exports.getFilterType(input)){
	case OPT_AND: result = exports.parseAsAnd(input, modelSchema);break;
	case OPT_OR: result = exports.parseAsOr(input, modelSchema);break;
	}
	return result;
};

/**
 * Inits opts
 * @param {object} options {inputPath:string, outputPath:string, getter:function, setter: function}
 */
exports.init = (options) => {
	if (options){
		if(options.inputPath){
			exports.pathToFilterInput = options.inputPath;
		}
		if(options.outputPath){
			exports.pathToFilter = options.outputPath;
		}
		if(options.getter){
			exports.getterOfFilterInput = options.getter;
		}
		if(options.setter){
			exports.setterOfFilter = options.setter;
		}
	}
};

/**
 * Reset filter options to default
 */

exports.reset = ()=>{
	exports.pathToFilterInput = OPT_INPUT_PATH;
	exports.pathToFilter = OPT_OUTPUT_PATH;
	exports.getterOfFilterInput = OPT_INPUT_GETTER;
	exports.setterOfFilter = OPT_OUTPUT_SETTER;
};

/**
 *
 * @param {ClientRequest} req request object
 * @param {ServerResponse} res response object
 * @param {object} modelSchema model schema for parsing rules
 */

exports.processFilter = (req, res, modelSchema) => {
	let filterInput = null,
		filterOutput = null;
	if (typeof exports.getterOfFilterInput == 'function'){
		filterInput = exports.getterOfFilterInput(req, modelSchema);
	}else{
		if (exports.pathToFilterInput){
			filterInput = notPath.get(exports.pathToFilterInput, req, {});
		}
	}
	if (filterInput){
		filterOutput =	exports.parseFilter(filterInput, modelSchema);
	}
	if (filterOutput){
		if (typeof exports.setterOfFilter == 'function'){
			exports.setterOfFilter(req, filterOutput, modelSchema);
		}else{
			if(exports.pathToFilter){
				notPath.set(exports.pathToFilter, req, filterOutput);
			}
		}
	}
};

/**
 * Returns filter type `OR` or `AND`
 * @param {array|object} filter
 * @return {OPT_OR|OPT_AND|false} type of filter
 **/

exports.getFilterType = function(filter){
	if (filter && (typeof filter !== undefined) && (filter !== null)){
		if (Array.isArray(filter)){
			return OPT_OR;
		}else if (filter.constructor === Object){
			return OPT_AND;
		}else{
			return false;
		}
	}else{
		return false;
	}
};

/**
 * Filter rules editor
 * Array for OR
 * Hash for AND
 * @param {OPT_OR|OPT_AND} filterType deterimines which type of filter we building
 * @return {array|object} filter
 */

exports.createFilter = function(filterType = OPT_OR){
	let result;
	switch(filterType){
	case OPT_AND:
		result = {};
		break;
	case OPT_OR:
	default:
		result = [];
	}
	return result;
};

/**
 * Adds rule to existing filter
 * @param {array|object} filter filter object
 * @param {object} rule additional rule
 * @return {array|object} filter
 */
exports.addRule = function(filter, rule){
	if (Array.isArray(filter)){
		filter.push(rule);
	}else{
		filter = Object.assign(filter, rule);
	}
	return filter;
};
