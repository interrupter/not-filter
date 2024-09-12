/**
 * @module not-filter/search
 */

const CommonQueryProcessor = require("./common.js"),
	escapeStringRegexp = require("escape-string-regexp"),
	config = require("not-config").readerForModule("filter");

/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_INPUT_PATH = ":query.search";
/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_OUTPUT_PATH = ":search";
/**
 * @const {string} OPT_INPUT_GETTER
 */
const OPT_INPUT_GETTER = null;
/**
 * @const {string} OPT_OUTPUT_SETTER
 */
const OPT_OUTPUT_SETTER = null;

class Search extends CommonQueryProcessor {
	constructor() {
		super({
			input: OPT_INPUT_PATH,
			output: OPT_OUTPUT_PATH,
			getter: OPT_INPUT_GETTER,
			setter: OPT_OUTPUT_SETTER,
		});
		return this;
	}

	extractSearchableFields(options) {
		return options &&
            options.searchableFields &&
            Array.isArray(options.searchableFields)
			? options.searchableFields
			: undefined;
	}

	/**
     * Parses
     * @param {object|array} input filter
     * @param {object} modelSchema not model schema
     * @param {object} [helpers={}] various helpers: libs, consts and etc
     * @param {object} [options={}] optional params
     * @return {object|array} parsed filter
     */
	parse(input, modelSchema, helpers = {}, options = {}) {
		let result = this.createFilter(this.OPT_OR);
		input = input + "";
		const searchableForAction = this.extractSearchableFields(options);
		//есть ли фильтрация по полям
		if (input && input !== null && input.length > 0) {
			let filterSearch = input.toString(),
				filterSearchNumber = parseInt(filterSearch),
				searchRule = new RegExp(
					".*" + escapeStringRegexp(filterSearch) + ".*",
					"i"
				);
			for (let fieldName in modelSchema) {
				if (modelSchema[fieldName].searchable) {
					if (
						searchableForAction &&
                        !searchableForAction.includes(fieldName)
					) {
						continue;
					}
					let emptyRule = {},
						t;
					switch (this.determineFieldType(modelSchema[fieldName])) {
					case "Number":
						if (isNaN(filterSearchNumber)) {
							continue;
						} else {
							emptyRule[fieldName] = filterSearchNumber;
						}
						break;
					case "Boolean":
						t = this.getBoolean(filterSearch);
						if (typeof t !== "undefined") {
							emptyRule[fieldName] = t;
						}
						break;
					case "String":
						emptyRule[fieldName] = searchRule;
						break;
					case "Mixed":
						this.addRulesForMixed(
							result,
							input,
							fieldName,
							modelSchema[fieldName],
							helpers
						);
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
	getDefault() {
		return config.get("default:search");
	}
}

module.exports = new Search();
