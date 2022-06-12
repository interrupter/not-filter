const notNode = require('not-node');
const {
  notValidationError
} = require('not-error');

module.exports = async ({
  size, skip
}) => {
  if (isNaN(size) || size < 1 ) {
    throw new notValidationError(
      'not-filter:query_pager_size_is_not_valid', {
        keys: ['not-filter:query_pager_size_is_not_valid']
      },
      undefined,
      {
        size,skip
      }
    );
  }
  if (isNaN(skip) || skip < 0 ) {
    throw new notValidationError(
      'not-filter:query_pager_skip_is_not_valid', {
        keys: ['not-filter:query_pager_skip_is_not_valid']
      },
      undefined,
      {
        size, skip
      }
    );
  }
};
