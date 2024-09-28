const { MODULE_NAME, MIN_SEARCH_LEN, MAX_SEARCH_LEN } = require("not-filter/src/const");

module.exports = [
    {
        validator(val) {
            return (typeof val === 'string' && val === '') || ((typeof val === 'object') || Array.isArray(val));
        },
        message: `${MODULE_NAME}:value_is_not_search_filter`,
    }    
];