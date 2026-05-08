// src/data/locations.js

import { countries } from 'countries-list'; // Corrected import

// Get all countries from the 'countries-list' package
const allCountries = Object.keys(countries)
  .map(code => ({
    code: code.toLowerCase(), // Changed to lowercase for consistency with react-world-flags
    name: countries[code].name,
  }))
  .sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

// Add the "Unspecified Location" option at the beginning
const locationsData = [{
  code: '', // A placeholder code for "Unspecified Location"
  name: 'Unspecified Location'
}, ...allCountries];

export default locationsData;