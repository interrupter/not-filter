/**
 * @module not-filter/common
 */

const notPath = require('not-path'),
	lowerCase = require('lower-case');

/**
 * @const {string} OPT_OR
 */
const OPT_OR = 'or';

/**
 * @const {string} OPT_AND
 */
const OPT_AND = 'and';

class CommonQueryProcessor {
	constructor(defaults){
		this.defaults = {
			input: defaults.input,
			output: defaults.output,
			getter: defaults.getter,
			setter: defaults.setter
		};
		this.options = {
			input: defaults.input,
			output: defaults.output,
			getter: defaults.getter,
			setter: defaults.setter
		};
		this.OPT_OR = OPT_OR;
		this.OPT_AND = OPT_AND;
		return this;
	}

	/**
	* Returns JSON if string is valid strigified JSON
	*	@param 	{sting} str
	*	@return {object} or false if string is not parseable
	*/
	isJSON(str){
		try {
			return (JSON.parse(str) && !!str);
		} catch (e) {
			return false;
		}
	}

	/**
	 * Inits opts
	 * @param {object} options {inputPath:string, outputPath:string, getter:function, setter: function}
	 */

	init(options){
		if (options){
			if(options.input){
				//console.log();
				this.options.input = options.input;
			}
			if(options.output){
				this.options.output = options.output;
			}
			if(options.getter){
				this.options.getter = options.getter;
			}
			if(options.setter){
				this.options.setter = options.setter;
			}
		}
		/*console.log('after init');
		console.log(options);
		console.log(this.options);*/
	}

	/**
	 * Reset filter options to default
	 */

	reset(){
		this.options.input = this.defaults.input;
		this.options.output = this.defaults.output;
		this.options.getter = this.defaults.getter;
		this.options.setter = this.defaults.setter;
	}

	/**
	 * Reducer for any value to boolean true/false
	 * @param {string|number|boolean|any} val some value to be reduced to true/false
	 * @return {boolean|undefined} if can determine goes with boolean else return undefined
	 */
	getBoolean(val){
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
	}


	/**
	 *
	 * @param {ClientRequest} req request object
	 * @param {object} modelSchema model schema for parsing rules
	 */

	process(req, modelSchema){
		let input = null,
			jsonInput = null,
			output = null;
		if (typeof this.options.getter == 'function'){
			input = this.options.getter(req, modelSchema);
		}else{
			if (this.options.input){
				input = notPath.get(this.options.input, req, {});
			}
		}
		if (input && input!== 'undefined'){
			let additional = arguments.length>2?Array.prototype.slice.call(arguments, 2):[];
			jsonInput = this.isJSON(input);
			if (jsonInput){
				input = this.isJSON(input);
			}
			output = this.parse(input, modelSchema, ...additional);
		}else{
			output = this.getDefault();
		}
		if (output){
			if (typeof this.options.setter == 'function'){
				this.options.setter(req, output, modelSchema);
			}else{
				if(this.options.output){
					notPath.set(this.options.output, req, output);
				}
			}
		}
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

module.exports = CommonQueryProcessor;
