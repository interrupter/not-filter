const expect = require("chai").expect,
    filter = require("../index.js").filter,
    schema = require("./schema.js");

describe("filter", function () {
    describe("init", function () {
        it("no options is passed", function () {
            filter.init();
            expect(filter.options.input).to.be.equal(":query.filter");
            expect(filter.options.output).to.be.equal(":filter");
            expect(filter.options.getter).to.be.null;
            expect(filter.options.setter).to.be.null;
        });

        it("empty options is passed", function () {
            filter.init({});
            expect(filter.options.input).to.be.equal(":query.filter");
            expect(filter.options.output).to.be.equal(":filter");
            expect(filter.options.getter).to.be.null;
            expect(filter.options.setter).to.be.null;
        });

        it("all options passed", function () {
            let opts = {
                input: ":input",
                output: ":output",
                getter: () => {
                    return "getter";
                },
                setter: () => {
                    return "setter";
                },
            };
            filter.init(opts);
            expect(filter.options.input).to.be.equal(opts.input);
            expect(filter.options.output).to.be.equal(opts.output);
            expect(filter.options.getter).to.be.equal(opts.getter);
            expect(filter.options.setter).to.be.equal(opts.setter);
        });
    });

    describe("getFilterType", function () {
        it("passed in array", function () {
            expect(filter.getFilterType([])).to.be.equal(filter.OPT_OR);
        });

        it("passed in object", function () {
            expect(filter.getFilterType({})).to.be.equal(filter.OPT_AND);
        });

        it("passed in undefined", function () {
            expect(filter.getFilterType(undefined)).to.be.false;
        });

        it("passed in null", function () {
            expect(filter.getFilterType(null)).to.be.false;
        });

        it("passed in Date", function () {
            expect(filter.getFilterType(new Date())).to.be.false;
        });
    });

    describe("createFilter", function () {
        it("passed in none", function () {
            expect(filter.createFilter()).to.be.an("array");
        });

        it("passed in OPT_AND", function () {
            expect(filter.createFilter(filter.OPT_AND)).to.be.an("object");
        });

        it("passed in OPT_OR", function () {
            expect(filter.createFilter(filter.OPT_OR)).to.be.an("array");
        });
    });

    describe("addRule", function () {
        it("passed in `AND` filter and object", function () {
            let f = {};
            expect(filter.addRule(f, { field: "rule" })).to.be.deep.equal({
                field: "rule",
            });
        });

        it("passed in `OR` filter and object", function () {
            let f = [];
            expect(filter.addRule(f, { field: "rule" })).to.be.deep.equal([
                {
                    field: "rule",
                },
            ]);
        });
    });

    describe("modifyRules", function () {
        it("passed in `AND` filter and object", function () {
            let f = {};
            expect(filter.modifyRules(f, { field: "rule" })).to.be.deep.equal({
                field: "rule",
            });
        });

        it("passed in `OR` filter and object", function () {
            let f = [
                { field0: "field0" },
                { field1: "field1" },
                { field3: "field3" },
                { field: "field" },
            ];
            expect(filter.modifyRules(f, { field: "rule" })).to.be.deep.equal([
                {
                    field0: "field0",
                    field: "rule",
                },
                {
                    field1: "field1",
                    field: "rule",
                },
                {
                    field3: "field3",
                    field: "rule",
                },
                {
                    field: "rule",
                },
            ]);
        });
    });

    describe("process", function () {
        it("passed in `OR` filter and object", function () {
            filter.reset();
            filter.init({
                input: ":input",
                output: ":output",
                getter: null,
                setter: null,
            });

            let f = [],
                input = {
                    input: [{ name: "my" }],
                },
                output = {
                    input: [{ name: "my" }],
                    output: [{ name: "my" }],
                };
            filter.process(input, schema);
            expect(input).to.be.deep.equal(output);
        });

        it("passed in `AND` filter and object", function () {
            filter.reset();
            filter.init({
                input: ":input",
                output: ":output",
                getter: (req) => {
                    return req.input;
                },
                setter: (req, filterOutput, schema) => {
                    req.output = filterOutput;
                },
            });

            let f = [],
                inputData = {
                    input: {
                        name: "my",
                    },
                },
                outputData = {
                    input: {
                        name: "my",
                    },
                    output: {
                        name: "my",
                    },
                };
            filter.process(inputData, schema);
            expect(inputData).to.be.deep.equal(outputData);
        });

        it("passed in `AND` filter and null", function () {
            filter.reset();
            filter.init({
                input: ":input",
                output: ":output",
                getter: (req) => {
                    return req.input;
                },
                setter: (req, filterOutput, schema) => {
                    req.output = filterOutput;
                },
            });
            let f = [],
                input = {},
                output = {};
            filter.process(input, schema);
            expect(input).to.be.deep.equal(output);
        });

        it("passed in `AND` filter and null", function () {
            filter.reset();
            filter.init({
                input: ":input",
                output: ":output",
                inputPath: null,
                outputPath: null,
            });
            let f = [],
                input = {},
                output = {};
            filter.process(input, schema);
            expect(input).to.be.deep.equal(output);
        });
    });

    describe("parse", function () {
        before(() => {
            filter.init({
                input: ":input",
                output: ":output",
                getter: null,
                setter: null,
            });
        });
        it("filter AND", function () {
            let f = {
                name: "my",
                active: "true",
                age: "15",
            };
            expect(filter.parse(f, schema)).to.be.deep.equal({
                name: "my",
                active: true,
                age: 15,
            });
        });

        it("filter OR", function () {
            let f = [
                {
                    name: "my",
                    active: "true",
                    age: "15",
                },
            ];
            expect(filter.parse(f, schema)).to.be.deep.equal([
                {
                    name: "my",
                    active: true,
                    age: 15,
                },
            ]);
        });
    });

    describe("parseAsOr", function () {
        before(() => {
            filter.init({
                input: ":input",
                output: ":output",
                getter: null,
                setter: null,
            });
        });
        it("filter OR", function () {
            let f = [
                {
                    name: "my",
                    active: "true",
                    age: "15",
                },
            ];
            expect(filter.parse(f, schema)).to.be.deep.equal([
                {
                    name: "my",
                    active: true,
                    age: 15,
                },
            ]);
        });
    });

    describe("parseAsAnd", function () {
        before(() => {
            filter.init({
                input: ":input",
                output: ":output",
                getter: null,
                setter: null,
            });
        });
        it("filter AND", function () {
            let f = {
                name: "my",
                active: "true",
                age: "15",
            };
            expect(filter.parseAsAnd(f, schema)).to.be.deep.equal({
                name: "my",
                active: true,
                age: 15,
            });
        });
    });

    describe("parseBlock", function () {
        it("block 1", function () {
            let f = {
                name: "my",
                active: "true",
                age: "15",
            };
            expect(filter.parseBlock(f, schema)).to.be.deep.equal({
                name: "my",
                active: true,
                age: 15,
            });
        });

        it("block 2", function () {
            let f = {
                name: 2,
                active: 0,
                age: "abracadabra",
            };
            expect(filter.parseBlock(f, schema)).to.be.deep.equal({
                name: "2",
                active: false,
            });
        });

        it("block 3", function () {
            let f = {
                name: null,
                active: 1,
                age: null,
            };
            expect(filter.parseBlock(f, schema)).to.be.deep.equal({
                active: true,
            });
        });

        it("block 4", function () {
            let f = {
                shadow: "tactics",
                active: "jingle-bells",
                age: null,
                roles: ["user"],
            };
            expect(filter.parseBlock(f, schema)).to.be.deep.equal({});
        });

        it("block 5", function () {
            let f = {
                shadow: "tactics",
                active: "false",
                age: null,
                roles: ["user"],
            };
            expect(filter.parseBlock(f, schema)).to.be.deep.equal({
                active: false,
            });
        });

        it("block 6", function () {
            let f = {
                shadow: "tactics",
                "details.googleIt": 1,
                age: null,
                roles: ["user"],
            };
            expect(filter.parseBlock(f, schema)).to.be.deep.equal({
                "details.googleIt": 2,
            });
        });

        it("block 7 - NoSQL injection", function () {
            const injection = { $ne: true };
            let f = {
                [`alias.code`]: injection,
            };
            expect(filter.parseBlock(f, schema)).to.be.deep.equal({
                [`alias.code`]: JSON.stringify(injection),
            });
        });
    });

    describe("createRulesMatrix", function () {
        it("simple 2 x 2 rules matrix", function () {
            let dim1 = [{ i: 1 }, { x: 3 }],
                dim2 = [{ h: 1 }, { z: 3 }],
                desired = [
                    { i: 1, h: 1 },
                    { i: 1, z: 3 },
                    { x: 3, h: 1 },
                    { x: 3, z: 3 },
                ],
                result = filter.createRulesMatrix(dim1, dim2);
            expect(result.length).to.be.equal(desired.length);
            expect(result).to.be.deep.equal(desired);
        });
    });
});
