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
app.delete('/search:searchID', deleteSearch)
app.post('/search', postSearch)
app.put('/search', updateSearch)

// MongoDB connection (Mongoose connection example)
const MONGODB_URI = process.env.MONGODB_URI;

// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
mongoose.connect(MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define route for searching location data

app.get('/search', async (req, res) => {
  const lat = req.query.lat;
  const lng = req.query.lng;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  try {
    // Get geocoding data from Google Maps API
    const geocodingResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
    const addressComponents = geocodingResponse.data.results[0].address_components;
    const city = addressComponents.find(component => component.types.includes('locality')).long_name;
    const state = addressComponents.find(component => component.types.includes('administrative_area_level_1')).short_name;
    const country = addressComponents.find(component => component.types.includes('country')).long_name;
    const formattedAddress = geocodingResponse.data.results[0].formatted_address;
  
    // Get timezone data from Google Maps API
    const timezoneResponse = await axios.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${Math.floor(Date.now() / 1000)}&key=${apiKey}`);
    const currentTime = new Date(Date.now() + (timezoneResponse.data.rawOffset * 1000) + (timezoneResponse.data.dstOffset * 1000)).toLocaleString();
  
    // Get nearby places of interest from Google Maps API
    const nearbySearchResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&key=${apiKey}`);
    const placesOfInterest = nearbySearchResponse.data.results;
  
    // Get photo reference and build photo URL for the location
    const photoReference = nearbySearchResponse.data.results[0]?.photos?.[0]?.photo_reference;
    const photoUrl = photoReference ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}` : null;
  
    // Check if the city record exists in the database and update it, or create a new one if it doesn't exist
    let cityRecord = await City.findOne({ lat, lng });
  
    if (!cityRecord) {
      cityRecord = new City({
        name: city,
        state,
        country,
        formatted_address: formattedAddress,
        current_time: currentTime,
        places_of_interest: placesOfInterest,
        photo_url: photoUrl,
        lat,
        lng,
      });
  
      await cityRecord.save();
    } else {
      cityRecord.current_time = currentTime;
      cityRecord.places_of_interest = placesOfInterest;
      cityRecord.photo_url = photoUrl;
      await cityRecord.save();
    }
    res.json(cityRecord);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data' });
  }
  
});

async function deleteSearch(request, response,next){
  try{ 
    let id = request.params.bookID;

    let data = request.body;
    
    const updatedSearch await {model name}.findByIdAndUpdate(id,data{new: true, overwrite: true});

    response.status(200).send(updatedSearch)
  }catch(error){
    next(error);
  }
}

async function postSearch(request,response,next){
  let createdSearchgit 
}



// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


app.delete('/search:searchID', deleteSearch)
app.post('/search', postSearch)
app.put('/search', updateSearch)
=======
// MongoDB connection (Mongoose connection example)
const MONGODB_URI = process.env.MONGODB_URI;

// mongoose.connect(MONGODB_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });
mongoose.connect(MONGODB_URI);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

