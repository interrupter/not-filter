module.exports = {
	name: 'not-filter',
	paths:{
		controllers:  __dirname + '/front/controllers'
	},
	filter:    require('./back/filter.js'),
	search:    require('./back/search.js'),
	sorter:    require('./back/sort.js'),
	return:    require('./back/return.js'),
	pager:     require('./back/pager.js'),
};
