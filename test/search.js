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
				},{
					'details': new RegExp('.*' + escapeStringRegexp(input) + '.*', 'i')
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

		it("rules for mixed, search for String", function() {
			search.reset();
			let input = 'legacy',
				inputAsRegEx = new RegExp('.*' + escapeStringRegexp(input+'') + '.*', 'i'),
				helpers = {
					lang: ['ru','en','de', 'fr'],
					prop: ['P180', 'P190', 'P11']
				},
				result = search.parse(input, schema, helpers);
			expect(result).to.be.deep.equal([
				{'name': inputAsRegEx},
				{'details.title.ru': inputAsRegEx},
				{'details.title.en': inputAsRegEx},
				{'details.title.de': inputAsRegEx},
				{'details.title.fr': inputAsRegEx},
				{'details.articles.ru.title': inputAsRegEx},
				{'details.articles.en.title': inputAsRegEx},
				{'details.articles.de.title': inputAsRegEx},
				{'details.articles.fr.title': inputAsRegEx},
				{'details.properties.P180.title': inputAsRegEx},
				{'details.properties.P190.title': inputAsRegEx},
				{'details.properties.P11.title': inputAsRegEx},
				{'details': inputAsRegEx},
			]);
		});

		it("rules for mixed, search for Number", function() {
			search.reset();
			let input = 10,
				inputAsRegEx = new RegExp('.*' + escapeStringRegexp(input+'') + '.*', 'i'),
				helpers = {
					lang: ['ru','en','de', 'fr'],
					prop: ['P180', 'P190', 'P11']
				},
				result = search.parse(input, schema, helpers);
			expect(result).to.be.deep.equal([
				{'name': inputAsRegEx},
				{'age': input},
				{'details.title.ru': inputAsRegEx},
				{'details.title.en': inputAsRegEx},
				{'details.title.de': inputAsRegEx},
				{'details.title.fr': inputAsRegEx},
				{'details.articles.ru.title': inputAsRegEx},
				{'details.articles.en.title': inputAsRegEx},
				{'details.articles.de.title': inputAsRegEx},
				{'details.articles.fr.title': inputAsRegEx},
				{'details.properties.P180.title': inputAsRegEx},
				{'details.properties.P190.title': inputAsRegEx},
				{'details.properties.P11.title': inputAsRegEx},
				{'details': inputAsRegEx},
				{'details.articles.ru.count': input},
				{'details.articles.en.count': input},
				{'details.articles.de.count': input},
				{'details.articles.fr.count': input},
			]);
		});


		it("rules for mixed, search for Boolean", function() {
			search.reset();
			let input = 'true',
				inputAsRegEx = new RegExp('.*' + escapeStringRegexp(input + '') + '.*', 'i'),
				helpers = {
					lang: ['ru','en','de', 'fr'],
					prop: ['P180', 'P190', 'P11']
				},
				result = search.parse(input, schema, helpers);
			expect(result).to.be.deep.equal([
				{'name': inputAsRegEx},
				{'active': true},
				{'details.articles.ru.active': true},
				{'details.articles.en.active': true},
				{'details.articles.de.active': true},
				{'details.articles.fr.active': true},
			]);
		});
	});

	describe("process", function() {

	});
});
