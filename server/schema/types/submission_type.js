const mongoose = require('mongoose');
const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLList
} = graphql;

const ResponseType = require('./response_type');
const Submission = mongoose.model('submission');

const SubmissionType = new GraphQLObjectType({
  name: 'SubmissionType',
  fields: {
    id: { type: GraphQLID },
    title: { type: GraphQLString },
    content: { type: GraphQLString },
    username: { type: GraphQLString },
    responseIds: { type: new GraphQLList(GraphQLString) },
    responses: {
      type: new GraphQLList(ResponseType),
      resolve(parentValue) {
        return Submission.findResponses(parentValue.id);
      }
    }
  }
});

module.exports = SubmissionType;
