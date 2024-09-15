/**
 * @module not-filter/pager
 */

const CommonQueryProcessor = require("./common.js"),
	config = require("not-config").readerForModule("filter");

/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_INPUT_PATH = ":query.pager";
/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_OUTPUT_PATH = ":pager";
/**
 * @const {string} OPT_INPUT_GETTER
 */
const OPT_INPUT_GETTER = null;
/**
 * @const {string} OPT_OUTPUT_SETTER
 */
const OPT_OUTPUT_SETTER = null;

const OPT_DEFAULT_SIZE = 100;

class Pager extends CommonQueryProcessor {
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
     * Parses
     * @param {object|array} input pager
     */
	parse(input) {
		let defaultSize = isNaN(parseInt(config.get("size")))
				? OPT_DEFAULT_SIZE
				: parseInt(config.get("size")),
			size =
                !input || isNaN(parseInt(input.size))
                	? defaultSize
                	: parseInt(input.size),
			skip =
                !input || isNaN(parseInt(input.page))
                	? 0
                	: Math.max(0, input.page) * size,
			page = Math.floor(skip / size);
		return {
			size,
			skip,
			page,
		};
	}

	/**
     * Returns default value
     * @return {object|array}
     */
	getDefault() {
		return config.get("default:pager");
	}

	/**
     * Returns value fo specified page number
     *	@param	{number}	inputPage
     *	@param	{number}	inputSize
     * @return {object|array}
     */
	getForPage(inputPage = 0, inputSize = 0) {
		if (isNaN(inputPage)) {
			throw new Error("inputPage is not a number");
		}
		if (isNaN(inputSize)) {
			throw new Error("inputSize is not a number");
		}
		let defaultSize = isNaN(parseInt(config.get("size")))
				? OPT_DEFAULT_SIZE
				: parseInt(config.get("size")),
			size = !inputSize ? defaultSize : inputSize,
			skip = !inputPage ? 0 : Math.max(0, inputPage) * size,
			page = Math.floor(skip / size);
		return {
			size,
			skip,
			page,
		};
	}
}

module.exports = new Pager();
