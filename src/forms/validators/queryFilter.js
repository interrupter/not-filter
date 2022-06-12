
const {
	notValidationError
} = require('not-error');

module.exports = async ({
	filter
}) => {
	if (!filter) {
		throw new notValidationError(
			'not-filter:query_filter_is_not_valid', {
				keys: ['not-filter:query_filter_is_not_valid']
			},
			undefined,
			{
				filter
			}
		);
	}
};
