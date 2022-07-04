module.exports = {
    name: require("./const.js").MODULE_NAME,
    paths: {
        controllers: __dirname + "/controllers",
        fields: __dirname + "/fields",
        forms: __dirname + "/forms",
        locales: __dirname + "/locales",
    },
    filter: require("./lib/filter.js"),
    search: require("./lib/search.js"),
    sorter: require("./lib/sorter.js"),
    return: require("./lib/return.js"),
    pager: require("./lib/pager.js"),
};
