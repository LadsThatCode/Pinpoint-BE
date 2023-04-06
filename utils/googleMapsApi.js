const axios = require('axios');

// This function retrieves the latitude and longitude of a given city using the Google Geocoding API
async function getGeocodingData(cityName, apiKey) {
  const geocodingResponse = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(cityName)}&key=${apiKey}`);
  console.log(geocodingResponse.data);
  const lat = geocodingResponse.data.results[0].geometry.location.lat;
  const lng = geocodingResponse.data.results[0].geometry.location.lng;
  const formatted_address = geocodingResponse.data.results[0].formatted_address;

  // Parse state and country from geocodingResponse.data
  let state = '';
  let country = '';

  const addressComponents = geocodingResponse.data.results[0].address_components;

  addressComponents.forEach(component => {
    if (component.types.includes('administrative_area_level_1')) {
      state = component.long_name;
    }
    if (component.types.includes('country')) {
      country = component.long_name;
    }
  });

  // Get current time using Google Time Zone API
  const timestamp = Math.floor(Date.now() / 1000);
  const timeZoneResponse = await axios.get(`https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`);
  const timeZoneId = timeZoneResponse.data.timeZoneId;
  const timeZoneOffset = timeZoneResponse.data.dstOffset + timeZoneResponse.data.rawOffset;
  const currentTime = new Date((timestamp + timeZoneOffset) * 1000).toISOString();
  console.log('Geocoding API Response:', geocodingResponse.data);



  return {
    lat,
    lng,
    formatted_address,
    state,
    country,
    current_time: currentTime
  };
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
  console.log('Nearby Search API Response:', nearbySearchResponse.data);

  return placesOfInterest;
}

// Export the two functions so they can be used in other parts of the codebase
module.exports = {
  getGeocodingData,
  getNearbyTouristAttractions,
};