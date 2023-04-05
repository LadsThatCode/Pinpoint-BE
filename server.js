const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

// Import custom modules
const City = require('./models/city');
const {
  getGeocodingData,
  getNearbyTouristAttractions
} = require('./utils/googleMapsApi');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(cors());
app.use(express.json());

// Route definitions
app.delete('/search/:searchID', deleteSearch);
app.post('/search', postSearch);
app.put('/search/:searchID', updateSearch);
app.get('/search', searchLocation);

// MongoDB connection using Mongoose
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

// Route handler for searching location data
async function searchLocation(req, res) {
  const cityName = req.query.city;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  try {
    // Fetch latitude and longitude using geocoding data
    const { lat, lng } = await getGeocodingData(cityName, apiKey);
    // Fetch nearby tourist attractions using latitude and longitude
    const placesOfInterest = await getNearbyTouristAttractions(lat, lng, apiKey);

    // Return a JSON object containing city name, latitude, longitude, and places of interest
    res.json({
      city: cityName,
      lat: lat,
      lng: lng,
      places_of_interest: placesOfInterest,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
}

// DELETE search route handler
async function deleteSearch(req, res) {
  try {
    const searchID = req.params.searchID;
    await City.findByIdAndDelete(searchID);
    res.status(200).json({ message: 'Search deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error deleting search' });
  }
}

// POST search route handler
async function postSearch(req, res) {
  try {
    const newSearch = new City(req.body);
    await newSearch.save();
    res.status(201).json(newSearch);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving search' });
  }
}

// PUT search route handler
async function updateSearch(req, res) {
  try {
    // Extract search ID from the request parameters
    const id = req.params.searchID;
    // Extract data to be updated from the request body
    const data = req.body;

    // Update the search data in the database
    const updatedSearch = await City.findByIdAndUpdate(id, data, { new: true });

    // Send the updated search data as a response
    res.status(200).send(updatedSearch);
  } catch (error) {
    // Handle any errors during the update process
    res.status(500).json({ message: 'Error updating search' });
  }
}

// Start the server and listen for incoming connections
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
