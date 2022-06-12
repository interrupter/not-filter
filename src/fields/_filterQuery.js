const notNode = require('not-node');
const Schema = require('mongoose').Schema;
const {MODULE_NAME} = require('../const');

module.exports = {
  model:{
    type: Schema.Types.Mixed,
    required: true,
    validate: [{
      validator(val) {
        return notNode.Application.getForm(`${MODULE_NAME}//_filterQuery`).run(val);
      },
      message: 'filter_query_is_not_valid'
    }]
  }
};
