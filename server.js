const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());

// Routes
app.delete('/search:searchID', deleteSearch)
app.post('/search', postSearch)
app.put('/search', updateSearch)
app.get('/search', async (req, res) => {
  const lat = req.query.lat;
  const lng = req.query.lng;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  try {
    const response = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&type=point_of_interest&key=${apiKey}`);
    const results = response.data.results;
    
    // Format results as human-readable string
    const formattedResults = results.map(result => {
      return {
        name: result.name,
        address: result.vicinity,
        types: result.types.join(', '),
      };
    });

    res.json(formattedResults);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching data from Google Places API' });
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
