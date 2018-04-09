/**
* @module not-filter/search
*/

const CommonQueryProcessor = require('./common.js'),
	escapeStringRegexp = require('escape-string-regexp'),	
	config = require('not-config').readerForModule('filter');

/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_INPUT_PATH = ':query.search';
/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_OUTPUT_PATH = ':search';
/**
 * @const {string} OPT_INPUT_GETTER
 */
const OPT_INPUT_GETTER = null;
/**
 * @const {string} OPT_OUTPUT_SETTER
 */
const OPT_OUTPUT_SETTER = null;

class Search extends CommonQueryProcessor{
	constructor(){
		super({
			input: 	OPT_INPUT_PATH,
			output: OPT_OUTPUT_PATH,
			getter: OPT_INPUT_GETTER,
			setter: OPT_OUTPUT_SETTER
		});
		return this;
	}

	/**
	* Parses
	* @param {object|array} input filter
	* @param {object} modelSchema not model schema
	* @return {object|array} parsed filter
	*/
	parse(input, modelSchema, helpers){
		let result = this.createFilter(this.OPT_OR);
		input = input+'';
		//есть ли фильтрация по полям
		if (input && input !== null && (input.length > 0)) {
			let filterSearch = input.toString(),
				filterSearchNumber = parseInt(filterSearch),
				searchRule = new RegExp('.*' + escapeStringRegexp(filterSearch) + '.*', 'i');
			for (let k in modelSchema) {
				if (modelSchema[k].searchable) {
					let emptyRule = {}, t;
					switch (modelSchema[k].type.name) {
					case 'Number':
						if (isNaN(filterSearchNumber)) {
							continue;
						} else {
							emptyRule[k] = filterSearchNumber;
						}
						break;
					case 'Boolean':
						t = this.getBoolean(filterSearch);
						if (typeof t !== 'undefined') {
							emptyRule[k] = t;
						}
						break;
					case 'String':
						emptyRule[k] = searchRule;
						break;
					case 'Mixed':
						this.addRulesForMixed(result, input, k, modelSchema[k], helpers);
						break;
					default:
						continue;
					}
					if (Object.getOwnPropertyNames(emptyRule).length > 0) {
						this.addRule(result, emptyRule);
					}
				}
			}
		}
		return result;
	}

	/**
	* Returns default value
	* @return {object|array}
	*/
	getDefault(){
		return config.get('default:search');
	}
}

module.exports = new Search();
