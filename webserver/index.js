const express = require('express');
const axios = require('axios');
const app = express();
const port = process.env.PORT || 3000;

// Function to get location and weather information
async function getLocationAndWeather(ip) {
    // Fallback to a known IP address for local development
    if (ip === '::1' || ip === '127.0.0.1') {
        ip = '8.8.8.8'; // Google's public DNS server IP as a fallback
    }

    try {
        const locationResponse = await axios.get(`http://ip-api.com/json/${ip}`);
        const city = locationResponse.data.city;
        const lat = locationResponse.data.lat;
        const lon = locationResponse.data.lon;

        const weatherResponse = await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m`);
        const temperature = weatherResponse.data.hourly.temperature_2m[0]; // Get the current hour's temperature

        return { city, temperature };
    } catch (error) {
        console.error('Error fetching location or weather data:', error);
        return { city: 'Unknown', temperature: 'Unknown' };
    }
}

app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Visitor';
    const clientIp = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    try {
        const { city, temperature } = await getLocationAndWeather(clientIp);
        res.json({
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}!, the temperature is ${temperature} degrees Celsius in ${city}`
        });
    } catch (error) {
        res.status(500).json({ error: 'Unable to fetch location or weather data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
