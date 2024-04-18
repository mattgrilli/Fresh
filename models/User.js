const mongoose = require('mongoose');
const { Schema } = mongoose;
const Image = require('./Image');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  invitationCode: {
    type: String,
    required: true,
    unique: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  profileImage: {
    type: Schema.Types.ObjectId,
    ref: 'Image',
    default: function () {
      return new Image({
        filename: '/default.png',
        contentType: 'image/png',
        
      });
    },
  },
});

module.exports = mongoose.model('User', UserSchema);
