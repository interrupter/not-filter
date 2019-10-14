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
				if (input.indexOf(t)===-1){
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
		if(typeof input === 'undefined'){
			return data;
		}else{
			let result = data,
				fields = [];
			if(Array.isArray(input)){
				fields = input;
			}else if (typeof input === 'object' && Object.keys(input).length > 0){
				fields = Object.keys(input);
			}else{
				return data;
			}

			if (Array.isArray(result)){
				result.forEach((item)=>{return this.parseItem(fields, modelSchema, item);});
			}else{
				this.parseItem(fields, modelSchema, result);
			}
			return result;
		}
	}

	/**
	* Returns default value
	* @return {object|array}
	*/
	getDefault(){
		return config.get('default:return');
	}
}

module.exports = new Return();
