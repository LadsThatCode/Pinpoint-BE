const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: String,
  cities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'City',
    },
  ],
});

const User = mongoose.model('User', userSchema);

module.exports = User;