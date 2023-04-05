const axios = require('axios');

// This function retrieves the latitude and longitude of a given city using the Google Geocoding API
async function getGeocodingData(cityName, apiKey) {
  const geocodingResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&key=${apiKey}`);
  const lat = geocodingResponse.data.results[0].geometry.location.lat;
  const lng = geocodingResponse.data.results[0].geometry.location.lng;

  return { lat, lng };
}

// This function retrieves a list of nearby tourist attractions for a given latitude and longitude using the Google Places API
async function getNearbyTouristAttractions(lat, lng, apiKey) {
  const nearbySearchResponse = await axios.get(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=500&type=tourist_attraction&rankby=prominence&key=${apiKey}`);
  
  // Only retrieve the top 4 tourist attractions
  const placesOfInterest = nearbySearchResponse.data.results.slice(0, 4).map(place => {
    const photoReference = place?.photos?.[0]?.photo_reference;
    const photoUrl = photoReference ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference=${photoReference}&key=${apiKey}` : null;

    // Additional information for each tourist attraction
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

  return placesOfInterest;
}

// Export the two functions so they can be used in other parts of the codebase
module.exports = {
  getGeocodingData,
  getNearbyTouristAttractions,
};