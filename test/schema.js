const Schema = require('mongoose').Schema;

module.exports = {
	name:{
		type: String,
		sortable: true,
		searchable: true
	},
	active:{
		type: Boolean,
		searchable: true
	},
	age:{
		type: Number,
		searchable: true
	},
	shadow:{
		type: String,
		sortable: false,
		searchable: false
	},
	details:{
		type: Schema.Types.Mixed,
		sortable: false,
		searchable: true,
		properties: {
			String: [
				'title.{::lang}',
				'articles.{::lang}.title',
				'properties.{::prop}.title',
				''
			],
			Number: [
				'articles.{::lang}.count'
			],
			Boolean: [
				'articles.{::lang}.active'
			]
		},
		filterConverter: (key, val)=>{return parseInt(val)+1;}
	},
	password:{
		type: String,
		searchable: false
	},
	roles:{
		type: Set,
		searchable: true
	}
};
