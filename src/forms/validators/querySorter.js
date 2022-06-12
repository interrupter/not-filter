const notNode = require('not-node');
const {
  notValidationError
} = require('not-error');

module.exports = async ({
  sorter
}) => {
  if (!sorter) {
    throw new notValidationError(
      'not-filter:query_sorter_is_not_valid', {
        keys: ['not-filter:query_sorter_is_not_valid']
      },
      undefined,
      {
        sorter
      }
    );
  }
};
