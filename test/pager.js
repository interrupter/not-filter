const expect = require("chai").expect,
	pager = require('../index.js').pager,
	path = require('path'),
	config = require('not-config'),
	schema = require('./schema.js');


describe("pager", function() {
	describe("init", function() {
		it("no options is passed", function() {
			pager.init();
			expect(pager.options.input).to.be.equal(':query.pager');
			expect(pager.options.output).to.be.equal(':pager');
			expect(pager.options.getter).to.be.null;
			expect(pager.options.setter).to.be.null;
		});

		it("empty options is passed", function() {
			pager.init({});
			expect(pager.options.input).to.be.equal(':query.pager');
			expect(pager.options.output).to.be.equal(':pager');
			expect(pager.options.getter).to.be.null;
			expect(pager.options.setter).to.be.null;
		});

		it("all options passed", function() {
			let opts = {
				input: ':input',
				output: ':output',
				getter: ()=>{ return 'getter';},
				setter: ()=>{ return 'setter';}
			};
			pager.init(opts);
			expect(pager.options.input).to.be.equal(opts.input);
			expect(pager.options.output).to.be.equal(opts.output);
			expect(pager.options.getter).to.be.equal(opts.getter);
			expect(pager.options.setter).to.be.equal(opts.setter);
		});
	});

	describe("parse", function() {
		it("empty", function() {
			pager.reset();
			let result = pager.parse();
			expect(result).to.be.deep.equal({size: 100, skip: 0, page: 0});
		});

		it("pass simple without config", function() {
			pager.reset();
			let result = pager.parse({size: 10, page: 1});
			expect(result).to.be.deep.equal({size: 10, skip: 10, page: 1});
		});

		it("pass simple with config", function() {
			pager.reset();
			config.init(path.join(__dirname, 'config.json'));
			let reader = config.readerForModule('filter'),
				result = pager.parse({page: 1});
			expect(result).to.be.deep.equal({size: 15, skip: 15, page: 1});
		});
	});

	describe("process", function() {
		it("json input", function() {
			pager.reset();
			let input = {
				query: {pager: {size: 24, page:2}}
			};
			config.init(path.join(__dirname, 'config.json'));
			pager.process(input, schema);
			expect(input.pager).to.be.deep.equal({size: 24, skip: 48, page: 2});
		});

		it("stringified json input", function() {
			pager.reset();
			let line = JSON.stringify({size: 24, page:2}),
				input = {
					query: {pager: line}
				};
			config.init(path.join(__dirname, 'config.json'));
			pager.process(input, schema);
			expect(input.pager).to.be.deep.equal({size: 24, skip: 48, page:2});
		});
	});

	describe("getForPage", function() {
		it("page input", function() {
			pager.reset();
			config.init(path.join(__dirname, 'config.json'));
			let pagerFotThird = pager.getForPage(3);
			expect(pagerFotThird).to.be.deep.equal({size: 15, skip: 45, page: 3});
		});

		it("getForPage with custom page size", function() {
			pager.reset();
			config.init(path.join(__dirname, 'config.json'));
			let pagerFotThird = pager.getForPage(4, 20);
			expect(pagerFotThird).to.be.deep.equal({size: 20, skip: 80, page: 4});
		});
	});

});
