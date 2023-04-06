const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const verifyUser = require('./auth.js')

// Import custom modules
const City = require('./models/city');
const {
  getGeocodingData,
  getNearbyTouristAttractions
} = require('./utils/googleMapsApi');

// Initialize the Express app
const app = express();
const PORT = process.env.PORT || 3002;

// Middleware setup
app.use(cors());
app.use(verifyUser);
app.use(express.json());

// Route definitions
app.delete('/search/:searchID', deleteSearch);
app.post('/search', postSearch);
app.put('/search/:searchID', updateSearch);
app.get('/search', searchLocation);
app.get('/cities', getAllCities);

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

async function getAllCities(req, res) {
  try {
    // Fetch all cities from the MongoDB database
    const cities = await City.find();
    // Return the list of cities as a JSON response
    res.json(cities);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching all cities' });
  }
}

// Route handler for searching location data
async function searchLocation(req, res) {
  console.log('inside searchLocation');
  const cityName = req.query.city;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  try {
    // Check if the city exists in the MongoDB database
    const cityInDb = await City.findOne({ name: cityName });

    if (cityInDb) {
      // If the city exists in the database, return the stored data
      res.json(cityInDb);
    } else {
      // If the city doesn't exist in the database, fetch the data from the Google API
      console.log('here1', cityName);
      const geocodingData = await getGeocodingData(cityName, apiKey);
      console.log('here2');
      const placesOfInterest = await getNearbyTouristAttractions(geocodingData.lat, geocodingData.lng, apiKey);

      // Create a new City instance with the fetched data
      const newCity = new City({
        name: cityName,
        state: geocodingData.state,
        country: geocodingData.country,
        formatted_address: geocodingData.formatted_address,
        current_time: geocodingData.current_time,
        lat: geocodingData.lat,
        lng: geocodingData.lng,
        places_of_interest: placesOfInterest,
        photo_url: geocodingData.photo_url,
        email: req.user.email // assuming that req.user contains the authenticated user data from Auth0
      });
      console.log('New City Data:', newCity);


      // Save the new city to the MongoDB database
      await newCity.save();

      // Return the new city data
      res.json(newCity);
    }
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
