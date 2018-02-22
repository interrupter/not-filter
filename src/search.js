/**
* @module not-filter/search
*/

const CommonQueryProcessor = require('./common.js'),
	escapeStringRegexp = require('escape-string-regexp'),
	notPath = require('not-path'),
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

	/**
	*	Creates rules for Schema.Types.Mixed
	*	@param {array} filter filter object
	*	@param {string} input search string
	*	@param {object} fieldName name of schema field
	*	@param {object} fieldSchema search string
	*	@param {object} helpers helpers for properties path generation
	*/
	addRulesForMixed(filter, input, fieldName, fieldSchema, helpers){
		let filterSearch = input.toString(),
			filterSearchNumber = parseInt(filterSearch),
			searchRule = new RegExp('.*' + escapeStringRegexp(filterSearch) + '.*', 'i');
		if(fieldSchema && fieldSchema.hasOwnProperty('properties')){
			for(let type in fieldSchema.properties){
				let t;
				switch(type){
				case 'Number':
					if (isNaN(filterSearchNumber)) {
						continue;
					} else {
						this.makePropertiesRules(filter, fieldName, fieldSchema.properties[type], helpers, filterSearchNumber);
					}
					break;
				case 'Boolean':
					t = this.getBoolean(filterSearch);
					if (typeof t !== 'undefined') {
						this.makePropertiesRules(filter, fieldName, fieldSchema.properties[type], helpers, t);
					}
					break;
				case 'String':
					t = this.getBoolean(filterSearch);
					if (typeof t === 'undefined'){
						this.makePropertiesRules(filter, fieldName, fieldSchema.properties[type], helpers, searchRule);
					}
					break;
				default:
					continue;
				}
			}
		}
	}

	/**
	*	Creates rules for Schema.Types.Mixed, generating properties path from
	*	templates and helpers
	*	@param {array} filter filter object
	*	@param {object} fieldName name of schema field
	*	@param {array} properties array of properties path templates
	*	@param {object} helpers helpers for properties path generation
	*	@param {string|number|boolean} rule rule for search
	*/
	makePropertiesRules(filter, fieldName, properties, helpers, rule){
		for(let i = 0; i < properties.length; i++){
			let list = this.makePropertyRules(fieldName, properties[i], helpers, rule);
			if (list.length){
				filter.push(...list);
			}
		}
	}

	/**
	*	Creates rules for Schema.Types.Mixed, generating properties path from
	*	templates and helpers
	*	@param {object} fieldName name of schema field
	*	@param {string} template property path template
	*	@param {object} helpers helpers for properties path generation
	*	@param {string|number|boolean} rule rule for search
	*	@return {array}	list of rules
	*/
	makePropertyRules(fieldName, template, helpers, rule){
		let list = [];
		for(let propName in helpers){
			if (template.indexOf('::'+propName) > -1){
				for(let prop of helpers[propName]){
					let val = notPath.parseSubs(template, {}, {[propName]: prop});
					if (val !== template){
						list.push({
							[fieldName + '.' + val]:rule
						});
					}
				}
			}
		}
		return list;
	}
}

module.exports = new Search();
