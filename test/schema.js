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
	password:{
		type: String,
		searchable: false
	},
	roles:{
		type: Set,
		searchable: true
	}
};
