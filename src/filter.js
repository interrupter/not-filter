/**
* @module not-filter/filter
*/

const CommonQueryProcessor = require('./common.js');

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

class Filter extends CommonQueryProcessor{
	constructor(){
		super({
			input: OPT_INPUT_PATH,
			output:OPT_OUTPUT_PATH,
			getter: OPT_INPUT_GETTER,
			setter: OPT_OUTPUT_SETTER
		});
		this.OPT_OR = OPT_OR;
		this.OPT_AND = OPT_AND;
		return this;
	}

	/**
	 * Parses passed in object according schema
	 * returns rule
	 * @param {object} block input rule block
	 * @param {object} modelSchema notModelSchema
	 * @return {object} filter rule
	 */

	parseBlock(block, modelSchema){
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
					t = this.getBoolean(searchString);
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
	}


	/**
	 * Parse filter input as object
	 * @param {object} 	input 			filter object
	 * @param {object} 	modelSchema 	not model schema
	 * @return {object}	filter
	 */
	parseAsAnd(input, modelSchema){
		let filter = this.createFilter(OPT_AND),
			rule = this.parseBlock(input, modelSchema);
		filter = this.addRule(filter, rule);
		return filter;
	}

	/**
	 * Parse filter input as array
	 * @param {object} 	input 			filter object
	 * @param {object} 	modelSchema 	not model schema
	 * @return {object}	filter
	 */
	parseAsOr(input, modelSchema){
		let filter = this.createFilter(OPT_OR);
		for(let t = 0; t < input.length; t++){
			filter = this.addRule(filter, this.parseBlock(input[t], modelSchema));
		}
		return filter;
	}

	/**
	* Parses
	* @param {object|array} input filter
	* @param {object} modelSchema not model schema
	* @return {object|array} parsed filter
	*/
	parse(input, modelSchema){
		let result;
		//array for ||
		//object for &&
		switch (this.getFilterType(input)){
		case OPT_AND: result = this.parseAsAnd(input, modelSchema);break;
		case OPT_OR: result = this.parseAsOr(input, modelSchema);break;
		}
		return result;
	}

	/**
	 * Returns filter type `OR` or `AND`
	 * @param {array|object} filter
	 * @return {OPT_OR|OPT_AND|false} type of filter
	 **/

	getFilterType(filter){
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
	}

	/**
	 * Filter rules editor
	 * Array for OR
	 * Hash for AND
	 * @param {OPT_OR|OPT_AND} filterType deterimines which type of filter we building
	 * @return {array|object} filter
	 */

	createFilter(filterType = OPT_OR){
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
	}

	/**
	 * Adds rule to existing filter
	 * @param {array|object} filter filter object
	 * @param {object} rule additional rule
	 * @return {array|object} filter
	 */
	addRule(filter, rule){
		if (Array.isArray(filter)){
			filter.push(rule);
		}else{
			filter = Object.assign(filter, rule);
		}
		return filter;
	}
}

module.exports = new Filter();
