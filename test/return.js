const expect = require("chai").expect,
	returnFilter = require('../index.js').return,
	schema = require('./schema.js');


describe("return", function() {
	describe("init", function() {
		it("no options is passed", function() {
			returnFilter.init();
			expect(returnFilter.options.input).to.be.equal(':query.return');
			expect(returnFilter.options.output).to.be.equal(':return');
			expect(returnFilter.options.getter).to.be.null;
			expect(returnFilter.options.setter).to.be.null;
		});

		it("empty options is passed", function() {
			returnFilter.init({});
			expect(returnFilter.options.input).to.be.equal(':query.return');
			expect(returnFilter.options.output).to.be.equal(':return');
			expect(returnFilter.options.getter).to.be.null;
			expect(returnFilter.options.setter).to.be.null;
		});

		it("all options passed", function() {
			let opts = {
				input: ':input',
				output: ':output',
				getter: ()=>{ return 'getter';},
				setter: ()=>{ return 'setter';}
			};
			returnFilter.init(opts);
			expect(returnFilter.options.input).to.be.equal(opts.input);
			expect(returnFilter.options.output).to.be.equal(opts.output);
			expect(returnFilter.options.getter).to.be.equal(opts.getter);
			expect(returnFilter.options.setter).to.be.equal(opts.setter);
		});
	});

	describe("parse", function() {
		it("no schema", function() {
			let input = undefined,
				data = {
					name: 'alex',
					age: 30,
					active: true,
					roles: new Set()
				},
				returnData = returnFilter.parse(input, schema, data);
			expect(returnData).to.be.deep.equal({
				name: 'alex',
				age: 30,
				active: true,
				roles: new Set()
			});
		});
		it("empty schema", function() {
			let input = {},
				data = {
					name: 'alex',
					age: 30,
					active: true,
					roles: new Set()
				},
				returnData = returnFilter.parse(input, schema, data);
			expect(returnData).to.be.deep.equal({
				name: 'alex',
				age: 30,
				active: true,
				roles: new Set()
			});
		});
		it("plain schema", function() {
			let input = {
					name: 'name',
					age: 'age'
				},
				data = {
					name: 'alex',
					age: 30,
					active: true,
					roles: new Set()
				},
				returnData = returnFilter.parse(input, schema, data);
			expect(returnData).to.be.deep.equal({
				name: 'alex',
				age: 30
			});
		});

		it("plain schema with array data", function() {
			let input = {
					name: 'name',
					age: 'age'
				},
				data = [{
					name: 'alex',
					age: 30,
					active: true,
					roles: new Set()
				},{
					name: 'xerox',
					age: 90,
					active: false,
					roles: null
				}],
				returnData = returnFilter.parse(input, schema, data);
			expect(returnData).to.be.deep.equal([{
				name: 'alex',
				age: 30
			},{
				name: 'xerox',
				age: 90
			}]);
		});

		it("plain schema with faulty array data", function() {
			let input = {
					name: 'name',
					age: 'age'
				},
				data = [{
					name: 'alex',
					age: 30,
					active: true,
					roles: new Set()
				},
				null,
				{
					name: 'xerox',
					age: 90,
					active: false,
					roles: null
				}],
				returnData = returnFilter.parse(input, schema, data);
			expect(returnData).to.be.deep.equal([{
				name: 'alex',
				age: 30
			},
			null,
			{
				name: 'xerox',
				age: 90
			}]);
		});

		it("plain schema with faulty array data 2", function() {
			let input = {
					name: 'name',
					age: 'age'
				},
				data = [{
					name: 'alex',
					age: 30,
					active: true,
					roles: new Set()
				},
				undefined,
				{
					name: 'xerox',
					age: 90,
					active: false,
					roles: null
				}],
				returnData = returnFilter.parse(input, schema, data);
			expect(returnData).to.be.deep.equal([{
				name: 'alex',
				age: 30
			},
			undefined,
			{
				name: 'xerox',
				age: 90
			}]);
		});
	});

});
