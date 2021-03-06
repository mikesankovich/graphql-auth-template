const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Every user has an email and password.  The password is not stored as
// plain text - see the authentication helpers below.
const ResponseSchema = new Schema({
  content: String,
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'user'
  },
  username: String,
  submission: {
    type: Schema.Types.ObjectId,
    ref: 'submission'
  },
  helpful: { type: Number, default: 0 }
});

mongoose.model('response', ResponseSchema);
