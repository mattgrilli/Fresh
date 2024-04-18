const mongoose = require('mongoose');
const { Schema } = mongoose;

const KnowledgeBaseSchema = new Schema({
  name: { type: String, required: true },
  owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  entries: [
    {
      type: Schema.Types.ObjectId,
      ref: 'KnowledgeBaseEntry',
    },
  ],
});

module.exports = mongoose.model('KnowledgeBase', KnowledgeBaseSchema);
