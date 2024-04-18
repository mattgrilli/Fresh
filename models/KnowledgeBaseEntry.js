// KnowledgeBaseEntry.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const KnowledgeBaseEntrySchema = new Schema({
  title: { type: String, required: true },
  entryContent: { type: String, required: false },
  tags: [String],
  knowledgeBase: { type: Schema.Types.ObjectId, ref: 'KnowledgeBase' },
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});


const KnowledgeBaseEntry = mongoose.model('KnowledgeBaseEntry', KnowledgeBaseEntrySchema);

module.exports = KnowledgeBaseEntry;
