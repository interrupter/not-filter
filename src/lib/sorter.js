/**
 * @module not-filter/sort
 */

const CommonQueryProcessor = require("./common.js"),
    config = require("not-config").readerForModule("filter");

const OPT_SORTER = {
    _id: 1,
};

const OPT_DIRECTION_ASC = 1;
const OPT_DIRECTION_DESC = -1;

const OPT_DIRECTION = OPT_DIRECTION_ASC;

/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_INPUT_PATH = ":query.sorter";
/**
 * @const {string} OPT_INPUT_PATH
 */
const OPT_OUTPUT_PATH = ":sorter";
/**
 * @const {string} OPT_INPUT_GETTER
 */
const OPT_INPUT_GETTER = null;
/**
 * @const {string} OPT_OUTPUT_SETTER
 */
const OPT_OUTPUT_SETTER = null;

class Sorter extends CommonQueryProcessor {
    constructor() {
        super({
            input: OPT_INPUT_PATH,
            output: OPT_OUTPUT_PATH,
            getter: OPT_INPUT_GETTER,
            setter: OPT_OUTPUT_SETTER,
        });
        this.OPT_SORTER = OPT_SORTER;
        this.OPT_DIRECTION = OPT_DIRECTION;
        return this;
    }

    /**
     * Express compatible middleware
     * @param {ClientRequest} req request object
     * @param {ServerResponse} res response object
     * @param {function} next callback
     */
    parse(input, modelSchema, sorterDefaults) {
        let result = {};
        if (input && Object.keys(input) && Object.keys(input).length > 0) {
            for (let t in input) {
                let sortBlock = this.parseBlock(
                    t,
                    parseInt(input[t]),
                    modelSchema
                );
                if (sortBlock && Object.keys(sortBlock).length > 0) {
                    result = { ...result, ...sortBlock };
                }
            }
        }
        if (Object.keys(result).length === 0) {
            if (
                typeof sorterDefaults === "undefined" ||
                sorterDefaults === null
            ) {
                result = { ...this.OPT_SORTER };
            } else {
                result = { ...sorterDefaults };
            }
        }
        return result;
    }

    parseBlock(field, direction, schema) {
        let result = {},
            property;
        if (field.charAt(0) === ":") {
            field = field.substring(1);
        }
        if (field.indexOf(".") > -1) {
            property = field.split(".")[0];
        } else {
            property = field;
        }
        //санация данных
        if ([OPT_DIRECTION_DESC, OPT_DIRECTION_ASC].indexOf(direction) === -1) {
            direction = this.OPT_DIRECTION;
        }
        if (
            schema.hasOwnProperty(property) &&
            Object.keys(schema).indexOf(property) > -1
        ) {
            if (
                schema[property].hasOwnProperty("sortable") &&
                schema[property].sortable
            ) {
                result[field] = direction;
            }
        }
        return result;
    }

    /**
     * Returns default value
     * @return {object|array}
     */
    getDefault() {
        return config.get("default:sorter");
    }
}

module.exports = new Sorter();
