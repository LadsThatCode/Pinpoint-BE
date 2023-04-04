// ./models/city.js
const mongoose = require('mongoose');

const citySchema = new mongoose.Schema({
  name: String,
  state: String,
  country: String,
  formatted_address: String,
  current_time: String,
  places_of_interest: Array,
  photo_url: String,
  lat: Number,
  lng: Number,
});

const City = mongoose.model('City', citySchema);

module.exports = City;
//didn't add real code