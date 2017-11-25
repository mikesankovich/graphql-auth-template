const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Every user has an email and password.  The password is not stored as
// plain text - see the authentication helpers below.
const SubmissionSchema = new Schema({
  title: String,
  content: String,
  user: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  responseIds: [{
    type: Schema.Types.ObjectId,
    ref: 'response'
  }]
});

SubmissionSchema.statics.addResponse = function(userId, submissionId, content) {
  const Response = mongoose.model('response');

  return this.findById(submissionId)
    .then(submission => {
      const response = new Response({ userId, submission: submissionId, content })

      submission.responseIds.push(response)

      return Promise.all([response.save(), submission.save()])
        .then(([response, submission]) => submission);
    });
}

SubmissionSchema.statics.findResponses = async function(id) {
  const User = mongoose.model('user');

  const submission = await this.findById(id).populate('responseIds');
  submission.responses = await Promise.all(submission.responseIds.map(async (e) => {
    const { _id, content, userId } = e;
    const user = await User.findById(e.userId);
    const username = user.username;
    response = {
      id: _id,
      content,
      userId,
      username
    }
    return response;
  }));

  return submission.responses;
}

mongoose.model('submission', SubmissionSchema);
