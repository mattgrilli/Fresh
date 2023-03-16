const mongoose = require('mongoose');

const InvitationCodeSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  expirationDate: { type: Date, required: true },
});

const InvitationCode = mongoose.model('InvitationCode', InvitationCodeSchema);

module.exports = InvitationCode;
