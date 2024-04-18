const mongoose = require('mongoose');
const { Schema } = mongoose;

const SnippetSchema = new Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  owner: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
});

const Snippet = mongoose.model('Snippet', SnippetSchema);

module.exports = Snippet;
