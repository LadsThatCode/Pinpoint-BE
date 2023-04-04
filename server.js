const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const City = require('./models/city');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('Send dudes');
// Middleware
app.use(cors());

// Routes
app.delete('/search/:searchID', deleteSearch)
app.post('/search', postSearch)
app.put('/search/:searchID', updateSearch)

// MongoDB connection (Mongoose connection example)
const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define route for searching location data
app.get('/search', async (req, res) => {
  const cityName = req.query.city;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  try {
    // Get geocoding data from Google Maps API
    const geocodingResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&key=${apiKey}`);
    const lat = geocodingResponse.data.results[0].geometry.location.lat;
    const lng = geocodingResponse.data.results[0].geometry.location.lng;

    // Get nearby tourist attractions from Google Maps API using the latitude and longitude, sorted by prominence
    const nearbySearchResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&type=tourist_attraction&rankby=prominence&key=${apiKey}`);
    const placesOfInterest = nearbySearchResponse.data.results.slice(0, 4).map(place => {
      const photoReference = place?.photos?.[0]?.photo_reference;
      const photoUrl = photoReference ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}` : null;

      // Additional information
      const rating = place?.rating;
      const address = place?.vicinity;
      const phoneNumber = place?.formatted_phone_number;

      return {
        name: place.name,
        photo_url: photoUrl,
        rating: rating,
        address: address,
        phone_number: phoneNumber
      };
    });

    const cityPhotoReference = nearbySearchResponse.data.results[0]?.photos?.[0]?.photo_reference;
    const cityPhotoUrl = cityPhotoReference ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${cityPhotoReference}&key=${apiKey}` : null;

    res.json({
      city: cityName,
      city_photo: cityPhotoUrl,
      lat: lat,
      lng: lng,
      places_of_interest: placesOfInterest
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
});

// DELETE search route handler
async function deleteSearch(request, response, next) {
  // DeleteSearch function code should go here
}

// POST search route handler
async function postSearch(request, response, next) {
  // PostSearch function code should go here
}

// PUT search route handler
async function updateSearch(request, response, next) {
  try {
    let id = request.params.searchID;

    let data = request.body;

    const updatedSearch = await City.findByIdAndUpdate(id, data, { new: true, overwrite: true });

    response.status(200).send(updatedSearch);
  } catch (error) {
    next(error);
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});