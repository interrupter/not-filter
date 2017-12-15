const expect = require("chai").expect,
	search = require('../index.js').search,
	schema = require('./schema.js'),
	escapeStringRegexp = require('escape-string-regexp');


describe("search", function() {
	describe("init", function() {
		it("no options is passed", function() {
			search.init();
			expect(search.options.input).to.be.equal(':query.search');
			expect(search.options.output).to.be.equal(':search');
			expect(search.options.getter).to.be.null;
			expect(search.options.setter).to.be.null;
		});

		it("empty options is passed", function() {
			search.init({});
			expect(search.options.input).to.be.equal(':query.search');
			expect(search.options.output).to.be.equal(':search');
			expect(search.options.getter).to.be.null;
			expect(search.options.setter).to.be.null;
		});

		it("all options passed", function() {
			let opts = {
				input: ':input',
				output: ':output',
				getter: ()=>{ return 'getter';},
				setter: ()=>{ return 'setter';}
			};
			search.init(opts);
			expect(search.options.input).to.be.equal(opts.input);
			expect(search.options.output).to.be.equal(opts.output);
			expect(search.options.getter).to.be.equal(opts.getter);
			expect(search.options.setter).to.be.equal(opts.setter);
		});
	});

	describe("parse", function() {
		it("usual string search", function() {
			search.reset();
			let input = 'my',
				result = search.parse(input, schema);
			expect(result).to.be.deep.equal(
				[{
					'name': new RegExp('.*' + escapeStringRegexp(input) + '.*', 'i')
				}]
			);
		});

		it("usual number search as Number", function() {
			search.reset();
			let input = 1,
				result = search.parse(input, schema);
			expect(result).to.be.deep.equal(
				[{
					'name': new RegExp('.*' + escapeStringRegexp(input+'') + '.*', 'i')
				},{
					'active': true
				},{
					'age': 1
				}]
			);
		});

		it("usual number search as string", function() {
			search.reset();
			let input = '1',
				result = search.parse(input, schema);
			expect(result).to.be.deep.equal(
				[{
					'name': new RegExp('.*' + escapeStringRegexp(input) + '.*', 'i')
				},{
					'active': true
				},{
					'age': 1
				}]
			);
		});

		it("usual boolean search as string", function() {
			search.reset();
			let input = 'true',
				result = search.parse(input, schema);
			expect(result).to.be.deep.equal(
				[{
					'name': new RegExp('.*' + escapeStringRegexp(input) + '.*', 'i')
				},{
					'active': true
				}]
			);
		});

		it("usual boolean search as boolean", function() {
			search.reset();
			let input = false,
				result = search.parse(input, schema);
			expect(result).to.be.deep.equal(
				[{
					'name': new RegExp('.*' + escapeStringRegexp(input+'') + '.*', 'i')
				},{
					'active': false
				}]
			);
		});

		it("empty", function() {
			search.reset();
			let input = '',
				result = search.parse(input, schema);
			expect(result).to.be.deep.equal([]);
		});
	});

	describe("process", function() {

	});
});
