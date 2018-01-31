/**
* @module not-filter/filter
*/

const CommonQueryProcessor = require('./common.js'),
	config = require('not-config').readerForModule('filter');

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
			input: 	OPT_INPUT_PATH,
			output:	OPT_OUTPUT_PATH,
			getter:	OPT_INPUT_GETTER,
			setter:	OPT_OUTPUT_SETTER
		});
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
		let filter = this.createFilter(this.OPT_AND),
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
		let filter = this.createFilter(this.OPT_OR);
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
		case this.OPT_AND: result = this.parseAsAnd(input, modelSchema);break;
		case this.OPT_OR: result = this.parseAsOr(input, modelSchema);break;
		}
		return result;
	}

	/**
	* Returns default value
	* @return {object|array}
	*/
	getDefault(){
		return config.get('default.filter');
	}
}

module.exports = new Filter();
