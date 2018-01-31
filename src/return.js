/**
* @module not-filter/return
*/

const CommonQueryProcessor = require('./common.js'),
	config = require('not-config').readerForModule('filter');

/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_INPUT_PATH = ':query.return';
/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_OUTPUT_PATH = ':return';
/**
 * @const {string} OPT_INPUT_GETTER
 */
const OPT_INPUT_GETTER = null;
/**
 * @const {string} OPT_OUTPUT_SETTER
 */
const OPT_OUTPUT_SETTER = null;

class Return extends CommonQueryProcessor{
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
	 * Parse item, delete fields that not in input map
	 * @param {object} input return fields map
	 * @param {object} modelSchema not model schema
	 * @param {object} item one row
	 */
	parseItem(input, modelSchema, item){
		if (typeof item === 'object' ){
			for(let t in item){
				if (!input.hasOwnProperty(t)){
					delete item[t];
				}
			}
		}
	}

	/**
	* Parses
	* @param {object|array} input filter fields of output record
	* @param {object} modelSchema not model schema
	* @param {object} data data to be filtered
	* @return {object|array} parsed filter
	*/
	parse(input, modelSchema, data){
		let result = data;
		if (typeof input !== 'undefined' && typeof input === 'object' && Object.keys(input).length>0){
			if (Array.isArray(result)){
				result.forEach((item)=>{return this.parseItem(input, modelSchema, item);});
			}else{
				this.parseItem(input, modelSchema, result);
			}
		}
		return result;
	}

	/**
	* Returns default value
	* @return {object|array}
	*/
	getDefault(){
		return config.get('default.sort');
	}
}

module.exports = new Return();
