/**
 * @module not-filter/common
 */

const notPath = require("not-path"),
	escapeStringRegexp = require("escape-string-regexp");

/**
 * @const {string} OPT_OR
 */
const OPT_OR = "or";

/**
 * @const {string} OPT_AND
 */
const OPT_AND = "and";

/**
 * @typedef {(OPT_AND|OPT_OR)}  FilterType
 */

class CommonQueryProcessor {
	/**
     * @type {FilterType}
     * @memberof CommonQueryProcessor
     */
	#OPT_OR = OPT_OR;
	/**
     * @type {FilterType}
     * @memberof CommonQueryProcessor
     */
	#OPT_AND = OPT_AND;

	/**
     *
     * @return {FilterType}
     * @readonly
     * @memberof CommonQueryProcessor
     */
	get OPT_OR() {
		return this.#OPT_OR;
	}

	/**
     *
     * @return {FilterType}
     * @readonly
     * @memberof CommonQueryProcessor
     */
	get OPT_AND() {
		return this.#OPT_AND;
	}

	constructor(defaults) {
		this.defaults = {
			input: defaults.input,
			output: defaults.output,
			getter: defaults.getter,
			setter: defaults.setter,
		};
		this.options = {
			input: defaults.input,
			output: defaults.output,
			getter: defaults.getter,
			setter: defaults.setter,
		};
		return this;
	}

	/**
     * Returns JSON if string is valid strigified JSON
     *	@param 	{string} str
     *	@return {object} or false if string is not parseable
     */
	isJSON(str) {
		try {
			return JSON.parse(str) && !!str;
		} catch {
			return false;
		}
	}

	/**
     * Inits opts
     * @param {object} options {inputPath:string, outputPath:string, getter:function, setter: function}
     */

	init(options) {
		if (options) {
			if (options.input) {
				//console.log();
				this.options.input = options.input;
			}
			if (options.output) {
				this.options.output = options.output;
			}
			if (options.getter) {
				this.options.getter = options.getter;
			}
			if (options.setter) {
				this.options.setter = options.setter;
			}
		}
		/*console.log('after init');
		console.log(options);
		console.log(this.options);*/
	}

	/**
     * Any object returned as string, elementary contr NoSQL Injection defence
     * @param {*} val
     * @returns
     */
	sanitizeFilterFieldValue(val) {
		if (typeof val === "object") {
			return JSON.stringify(val);
		}
		return val;
	}

	/**
     *
     * @param {object} field
     * @returns {string}
     */
	determineFieldType(field) {
		return field.type.schemaName || field.type.name;
	}

	/**
     * Reset filter options to default
     */

	reset() {
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
	getBoolean(val) {
		let t = parseInt(val),
			s = (val ? val.toString() : "").toLowerCase();
		if (t === 0 || t === 1) {
			return !!t;
		} else {
			if (s === "true") {
				return true;
			} else if (s === "false") {
				return false;
			} else {
				return undefined;
			}
		}
	}

	/**
     *
     * @param {import('express').Request} req request object
     * @param {object} modelSchema model schema for parsing rules
     */

	process(req, modelSchema) {
		let input = null,
			jsonInput = null,
			output = null;
		if (typeof this.options.getter == "function") {
			input = this.options.getter(req, modelSchema);
		} else {
			if (this.options.input) {
				input = notPath.get(this.options.input, req, {});
			}
		}
		if (input && input !== "undefined") {
			let additional =
                arguments.length > 2
                	? Array.prototype.slice.call(arguments, 2)
                	: [];
			jsonInput = this.isJSON(input);
			if (jsonInput) {
				input = JSON.parse(input);
			}
			output = this.parse(input, modelSchema, ...additional);
		} else {
			output = this.getDefault();
		}
		if (output) {
			if (typeof this.options.setter == "function") {
				this.options.setter(req, output, modelSchema);
			} else {
				if (this.options.output) {
					notPath.set(this.options.output, req, output);
				}
			}
		}
		return output;
	}

	/**
     * Returns filter type `OR` or `AND`
     * @param {array|object} filter
     * @return {(FilterType|false)} type of filter
     **/
	getFilterType(filter) {
		if (filter && typeof filter !== "undefined" && filter !== null) {
			if (Array.isArray(filter)) {
				return OPT_OR;
			} else if (filter.constructor === Object) {
				return OPT_AND;
			} else {
				return false;
			}
		} else {
			return false;
		}
	}

	/**
     * Filter rules editor
     * Array for OR
     * Hash for AND
     * @param {FilterType} filterType deterimines which type of filter we building
     * @return {array|object} filter
     */
	createFilter(filterType = OPT_OR) {
		let result;
		switch (filterType) {
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
     * @param {function} [merger] in case if filter is OR and rule has property as in filter (filter, property, rule)=>{ // modify filter, no return //}
     * @return {array|object} filter
     */
	addRule(filter, rule, merger = undefined) {
		if (this.getFilterType(filter) === OPT_OR) {
			filter.push(rule);
		} else {
			Object.keys(rule).forEach((property) => {
				if (Object.hasOwn(filter, property)) {
					if (typeof merger == "function") {
						merger(filter, property, rule[property]);
						return;
					}
				}
				filter[property] = rule[property];
			});
		}
		return filter;
	}

	/**
     * Modifies existing rules
     * @param {array|object} 	filter 	filter object
     * @param {object} 			rule 	mixture rule
     * @return {array|object} 			filter
     */
	modifyRules(filter, rule) {
		if (this.getFilterType(filter) === OPT_OR) {
			for (let i = 0; i < filter.length; i++) {
				filter[i] = this.modifyRules(filter[i], rule);
			}
		} else {
			filter = this.addRule(filter, rule);
		}
		return filter;
	}

	/**
     *	Creates rules for Schema.Types.Mixed
     *	@param {array} filter filter object
     *	@param {string} input search string
     *	@param {object} fieldName name of schema field
     *	@param {object} fieldSchema search string
     *	@param {object} helpers helpers for properties path generation
     */
	addRulesForMixed(filter, input, fieldName, fieldSchema, helpers) {
		let filterSearch = input.toString(),
			filterSearchNumber = parseInt(filterSearch),
			searchRule = new RegExp(
				".*" + escapeStringRegexp(filterSearch) + ".*",
				"i"
			);
		if (fieldSchema && Object.hasOwn(fieldSchema, "properties")) {
			for (let type in fieldSchema.properties) {
				let t;
				switch (type) {
				case "Number":
					if (isNaN(filterSearchNumber)) {
						continue;
					} else {
						this.makePropertiesRules(
							filter,
							fieldName,
							fieldSchema.properties[type],
							helpers,
							filterSearchNumber
						);
					}
					break;
				case "Boolean":
					t = this.getBoolean(filterSearch);
					if (typeof t !== "undefined") {
						this.makePropertiesRules(
							filter,
							fieldName,
							fieldSchema.properties[type],
							helpers,
							t
						);
					}
					break;
				case "String":
					t = this.getBoolean(filterSearch);
					if (typeof t === "undefined") {
						this.makePropertiesRules(
							filter,
							fieldName,
							fieldSchema.properties[type],
							helpers,
							searchRule
						);
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
     *	@param {string|number|boolean|RegExp} rule rule for search
     */
	makePropertiesRules(filter, fieldName, properties, helpers, rule) {
		for (let i = 0; i < properties.length; i++) {
			let list = this.makePropertyRules(
				fieldName,
				properties[i],
				helpers,
				rule
			);
			if (list.length) {
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
     *	@param {string|number|boolean|RegExp} rule rule for search
     *	@return {array}	list of rules
     */
	makePropertyRules(fieldName, template, helpers, rule) {
		let list = [];
		if (template === "") {
			list.push({
				[fieldName]: rule,
			});
		} else if (template.indexOf("::") === -1) {
			list.push({
				[`${fieldName}.${template}`]: rule,
			});
		} else {
			for (let propName in helpers) {
				if (template.indexOf("::" + propName) > -1) {
					for (let prop of helpers[propName]) {
						let val = notPath.parseSubs(
							template,
							{},
							{
								[propName]: prop,
							}
						);
						if (val !== template) {
							list.push({
								[fieldName + "." + val]: rule,
							});
						}
					}
				}
			}
		}
		return list;
	}

	/**
     *	Creates OR set from two OR sets by unifing individual rules from each set
     *	[{i:1},{x:3}]*[{h:1},{z:3}] => [{i:1, h:1},{i:1, z:3},{x:3,h:1},{x:3,z:3}]
     *	Returns newly created array of rules
     *	@param	{array}	dim1	first set of OR rules
     *	@param	{array}	dim2	second set of OR rules
     *	@return	{array}			result of multiplication
     */
	createRulesMatrix(dim1, dim2) {
		let result = [];
		for (let x in dim1) {
			for (let y in dim2) {
				result.push({ ...dim1[x], ...dim2[y] });
			}
		}
		return result;
	}
}

module.exports = CommonQueryProcessor;
