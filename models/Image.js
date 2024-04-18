const mongoose = require('mongoose');
const { Schema } = mongoose;

const ImageSchema = new Schema({
  filename: { type: String, required: true, unique: true },
  uploader: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
});

const Image = mongoose.model('Image', ImageSchema);

module.exports = Image;
