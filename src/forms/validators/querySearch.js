
const {
	notValidationError
} = require('not-error');

module.exports = async ({
	search
}) => {
	if (typeof search !== 'string') {
		throw new notValidationError(
			'not-filter:query_search_is_not_valid', {
				keys: ['not-filter:query_search_is_not_valid']
			},
			undefined,
			{
				search
			}
		);
	}
};
