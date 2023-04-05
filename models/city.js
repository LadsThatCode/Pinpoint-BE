const mongoose = require('mongoose');

// Define the schema for a city, which specifies the expected format for data to be stored in MongoDB
const citySchema = new mongoose.Schema({
  name: String, // Name of the city
  state: String, // State or province of the city
  country: String,
  formatted_address: String, // Formatted address of the city (e.g. "1600 Amphitheatre Pkwy, Mountain View, CA 94043, USA")
  current_time: String, // Current time in the city
  places_of_interest: Array,// Array of nearby attractions in the city
  photo_url: String, // URL of a photo of the city
  lat: Number, // Latitude of the city
  lng: Number, // Longitude of the city
});

// Create a City model based on the citySchema schema
const City = mongoose.model('City', citySchema);

// Export the City model so it can be used in other parts of the codebase
module.exports = City;