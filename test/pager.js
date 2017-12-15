const expect = require("chai").expect,
	pager = require('../index.js').pager,
	path = require('path'),
	config = require('not-config');


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
			expect(result).to.be.deep.equal({size: 100, skip: 0});
		});

		it("pass simple without config", function() {
			pager.reset();
			let result = pager.parse({size: 10, page: 1});
			expect(result).to.be.deep.equal({size: 10, skip: 10});
		});

		it("pass simple with config", function() {
			pager.reset();
			config.init(path.join(__dirname, 'config.json'));
			let reader = config.readerForModule('filter'),
				result = pager.parse({page: 1});
			expect(result).to.be.deep.equal({size: 15, skip: 15});
		});
	});

});
