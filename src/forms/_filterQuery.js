const {MODULE_NAME} = require('../const');

const Form = require('not-node').Form;
const requiredObject = 'not-node//requiredObject';

const FIELDS = [
	['size', `${MODULE_NAME}//queryPagerSize`],
	['skip', `${MODULE_NAME}//queryPagerSkip`],
	['search', `${MODULE_NAME}//querySearch`],
	['sorter', requiredObject],
	['fitler', requiredObject],
];

const validateSearch = require('./validators/querySearch.js');
const validatePager = require('./validators/queryPager.js');
const validateSorter = require('./validators/querySorter.js');
const validateFilter = require('./validators/queryFilter.js');

const FORM_NAME = `${MODULE_NAME}:_FilterQueryForm`;

module.exports = class _FilterQueryForm extends Form{
	constructor({app}){
		super({FIELDS, FORM_NAME, app});
	}

	extract(data){return data;}

	getFormValidationRules(){
		return [
			validateSearch,
			validatePager,
			validateSorter,
			validateFilter
		];
	}

};
