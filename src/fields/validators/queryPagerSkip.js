const { MODULE_NAME, MAX_PAGE_SIZE } = require("not-filter/src/const");

module.exports = [
    {
        validator(val) {
            return !isNaN(val);
        },
        message: `${MODULE_NAME}:value_is_not_number`,
    },   
    {
        validator(val) {
            return val >= 0;
        },
        message: `${MODULE_NAME}:pager_skip_should_be_zero_or_greater`,
    }
];