const expect = require("chai").expect,
	sorter = require('../index.js').sorter,
	schema = require('./schema.js');


describe("sorter", function() {
	describe("init", function() {
		it("no options is passed", function() {
			sorter.init();
			expect(sorter.options.input).to.be.equal(':query.sorter');
			expect(sorter.options.output).to.be.equal(':sorter');
			expect(sorter.options.getter).to.be.null;
			expect(sorter.options.setter).to.be.null;
		});

		it("empty options is passed", function() {
			sorter.init({});
			expect(sorter.options.input).to.be.equal(':query.sorter');
			expect(sorter.options.output).to.be.equal(':sorter');
			expect(sorter.options.getter).to.be.null;
			expect(sorter.options.setter).to.be.null;
		});

		it("all options passed", function() {
			let opts = {
				input: ':input',
				output: ':output',
				getter: ()=>{ return 'getter';},
				setter: ()=>{ return 'setter';}
			};
			sorter.init(opts);
			expect(sorter.options.input).to.be.equal(opts.input);
			expect(sorter.options.output).to.be.equal(opts.output);
			expect(sorter.options.getter).to.be.equal(opts.getter);
			expect(sorter.options.setter).to.be.equal(opts.setter);
		});
	});

	describe("parseBlock", function() {
		it("existing field, ascending direction", function() {
			sorter.reset();
			let result = sorter.parseBlock('name', 1, schema);
			expect(result).to.be.deep.equal({
				name: 1
			});
		});

		it("existing field, descending direction", function() {
			sorter.reset();
			let result = sorter.parseBlock('name', -1, schema);
			expect(result).to.be.deep.equal({
				name: -1
			});
		});

		it("existing field, not existing direction", function() {
			sorter.reset();
			let result = sorter.parseBlock('name', '12312', schema);
			expect(result).to.be.deep.equal({
				name: sorter.OPT_DIRECTION
			});
		});

		it("existing field, descending direction", function() {
			sorter.reset();
			let result = sorter.parseBlock(':name', -1, schema);
			expect(result).to.be.deep.equal({
				name: -1
			});
		});

		it("existing field, descending direction", function() {
			sorter.reset();
			let result = sorter.parseBlock(':name.first', -1, schema);
			expect(result).to.be.deep.equal({
				'name.first': -1
			});
		});
	});


	describe("parse", function() {
		it("passed forbidden field sort, custom defaults", function() {
			sorter.reset();
			let input = {shadow: -1},
				result = sorter.parse(input, schema, {'ID':1});
			expect(result).to.be.deep.equal({'ID':1});
		});

		it("passed forbidden field sort, custom defaults", function() {
			sorter.reset();
			let input = {shadow: -1},
				result = sorter.parse(input, schema, null);
			expect(result).to.be.deep.equal(sorter.OPT_SORTER);
		});

		it("passed forbidden field sort, custom defaults", function() {
			sorter.reset();
			let input = {name: -1},
				result = sorter.parse(input, schema, null);
			expect(result).to.be.deep.equal({name:-1});
		});
		it("passed not existed field sort, custom defaults", function() {
			sorter.reset();
			let input = {felix: -1},
				result = sorter.parse(input, schema, null);
			expect(result).to.be.deep.equal(sorter.OPT_SORTER);
		});
		it("passed empty sorter, custom defaults", function() {
			sorter.reset();
			let input = {},
				result = sorter.parse(input, schema, null);
			expect(result).to.be.deep.equal(sorter.OPT_SORTER);
		});
	});

	describe("process", function() {
		it("passed forbidden field sort, custom defaults", function() {
			sorter.reset();
			let input = {query:{sorter:{shadow: -1}}};
			sorter.process(input, schema, {'ID':1});
			expect(input).to.be.deep.equal({query:{sorter:{shadow: -1}},sorter:{'ID':1}});
		});

		it("passed forbidden field sort, custom defaults", function() {
			sorter.reset();
			let input = {query:{sorter:{shadow: -1}}};
			sorter.process(input, schema, null);
			expect(input).to.be.deep.equal({query:{sorter:{shadow: -1}},sorter:sorter.OPT_SORTER});
		});
	});
});
