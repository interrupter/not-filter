/**
 * @module not-filter/filter
 */

const CommonQueryProcessor = require("./common.js"),
	config = require("not-config").readerForModule("filter");

/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_INPUT_PATH = ":query.filter";
/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_OUTPUT_PATH = ":filter";
/**
 * @const {string} OPT_INPUT_GETTER
 */
const OPT_INPUT_GETTER = null;
/**
 * @const {string} OPT_OUTPUT_SETTER
 */
const OPT_OUTPUT_SETTER = null;

class Filter extends CommonQueryProcessor {
	constructor() {
		super({
			input: OPT_INPUT_PATH,
			output: OPT_OUTPUT_PATH,
			getter: OPT_INPUT_GETTER,
			setter: OPT_OUTPUT_SETTER,
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
	parseBlock(block, modelSchema) {
		let emptyRule = {},
			t;
		for (let fieldName in modelSchema) {
			if (
				modelSchema[fieldName].searchable &&
                Object.hasOwn(block, fieldName) &&
                typeof block[fieldName] !== "undefined" &&
                block[fieldName] !== null
			) {
				const fieldType = this.determineFieldType(
					modelSchema[fieldName]
				);
				const searchString = block[fieldName],
					searchRule =  new RegExp(`.*${block[fieldName]}.*`, 'ugi'),
					searchNumber = parseFloat(searchString);

				switch (fieldType) {
				case "Number":
					if (isNaN(searchNumber)) {
						continue;
					} else {
						emptyRule[fieldName] = searchNumber;
					}
					break;
				case "Boolean":
					t = this.getBoolean(searchString);
					if (typeof t !== "undefined") {
						emptyRule[fieldName] = t;
					}
					break;
				case "ObjectId":
					emptyRule[fieldName] = searchString + "";
					break;
				case "String":
					emptyRule[fieldName] = searchRule;
					break;
				default:
					continue;
				}
			} else {
				if (
					modelSchema[fieldName].type &&
                    modelSchema[fieldName].type.schemaName === "Mixed"
				) {
					for (let filterFieldName in block) {
						if (filterFieldName.indexOf(fieldName + ".") === 0) {
							const filterValue = this.sanitizeFilterFieldValue(
								block[filterFieldName]
							);
							if (modelSchema[fieldName].filterConverter) {
								emptyRule[filterFieldName] = modelSchema[
									fieldName
								].filterConverter(fieldName, filterValue);
							} else {
								emptyRule[filterFieldName] = filterValue;
							}
						}
					}
				}
			}
		}
		return emptyRule;
	}

	/**
     * Parse filter input as object
     * @param {object} 	input 			filter object
     * @param {object} 	modelSchema 	not model schema
     * @param {object} 	[helpers={}] 	helpers lib
     * @return {object}	filter
     */
	parseAsAnd(input, modelSchema, helpers = {}) {
		let filter = this.createFilter(this.OPT_AND),
			rule = this.parseBlock(input, modelSchema, helpers);
		filter = this.addRule(filter, rule);
		return filter;
	}

	/**
     * Parse filter input as array
     * @param {object} 	input 			filter object
     * @param {object} 	modelSchema 	not model schema
     * @param {object} 	[helpers={}] 	helpers lib
     * @return {object}	filter
     */
	parseAsOr(input, modelSchema, helpers = {}) {
		let filter = this.createFilter(this.OPT_OR);
		for (let t = 0; t < input.length; t++) {
			filter = this.addRule(
				filter,
				this.parseBlock(input[t], modelSchema, helpers)
			);
		}
		return filter;
	}

	/**
     * Parses
     * @param {object|array} input filter
     * @param {object} modelSchema not model schema
     * @param {object} 	[helpers={}] 	helpers lib
     * @return {object|array} parsed filter
     */
	parse(input, modelSchema, helpers = {}) {
		let result;
		//array for ||
		//object for &&
		switch (this.getFilterType(input)) {
		case this.OPT_AND:
			result = this.parseAsAnd(input, modelSchema, helpers);
			break;
		case this.OPT_OR:
			result = this.parseAsOr(input, modelSchema, helpers);
			break;
		}
		return result;
	}

	/**
     * Returns default value
     * @return {object|array}
     */
	getDefault() {
		return config.get("default:filter");
	}
}

module.exports = new Filter();
