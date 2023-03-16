const mongoose = require('mongoose');

const SnippetSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  code: { type: String, required: true },
  description: { type: String, required: true },
  language: { type: String, required: true },
});

const Snippet = mongoose.model('Snippet', SnippetSchema);

module.exports = Snippet;
