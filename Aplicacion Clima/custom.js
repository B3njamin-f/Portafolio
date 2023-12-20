document.addEventListener('DOMContentLoaded', function() {
    loadCountries();
    const form = document.querySelector('.get-weather');
    if(form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});

function loadCountries() {
    fetch('https://restcountries.com/v3.1/all')
        .then(response => response.json())
        .then(data => {
            const countrySelect = document.getElementById('country');
            data.forEach(country => {
                let option = document.createElement('option');
                option.value = country.cca2;
                option.text = country.name.common;
                countrySelect.appendChild(option);
            });
        })
        .catch(error => console.error('Error loading countries:', error));
}

function handleFormSubmit(e) {
    e.preventDefault();

    const selectedCountry = document.getElementById('country').value;
    const selectedCity = document.getElementById('city').value;

    if (selectedCity === '' || selectedCountry === '') {
        showError('Both fields are required...');
        return;
    }

    callAPI(selectedCity, selectedCountry);
}

function callAPI(city, country) {
    const apiId = 'INSERT_YOUR_OPENWEATHERMAP_API_KEY_HERE';
    const url = `http://api.openweathermap.org/data/2.5/weather?q=${city},${country}&appid=${apiId}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.cod === '404') {
                showError('City not found...');
            } else {
                clearHTML();
                showWeather(data);
            }
        })
        .catch(error => console.log(error));
}


const iconMap = {
    // Grupo: Clear Sky
    '01d': 'wi-day-sunny', // Cielo claro (día)
    '01n': 'wi-night-clear', // Cielo claro (noche)

    // Grupo: Few Clouds
    '02d': 'wi-day-cloudy', // Pocas nubes (día)
    '02n': 'wi-night-alt-cloudy', // Pocas nubes (noche)

    // Grupo: Scattered Clouds
    '03d': 'wi-cloud', // Nubes dispersas (día)
    '03n': 'wi-cloud', // Nubes dispersas (noche)

    // Grupo: Broken Clouds
    '04d': 'wi-cloudy', // Nubes rotas (día)
    '04n': 'wi-cloudy', // Nubes rotas (noche)

    // Grupo: Shower Rain
    '09d': 'wi-showers', // Lluvia (día)
    '09n': 'wi-showers', // Lluvia (noche)

    // Grupo: Rain
    '10d': 'wi-day-rain', // Lluvia (día)
    '10n': 'wi-night-rain', // Lluvia (noche)

    // Grupo: Thunderstorm
    '11d': 'wi-day-thunderstorm', // Tormenta (día)
    '11n': 'wi-night-thunderstorm', // Tormenta (noche)

    // Grupo: Snow
    '13d': 'wi-day-snow', // Nieve (día)
    '13n': 'wi-night-snow', // Nieve (noche)

    // Grupo: Mist
    '50d': 'wi-fog', // Niebla (día)
    '50n': 'wi-fog' // Niebla (noche)
};




function showWeather(data) {
    const { name, main: { temp, temp_min, temp_max }, weather: [arr], coord } = data;

    const degrees = kelvinToCentigrade(temp);
    const min = kelvinToCentigrade(temp_min);
    const max = kelvinToCentigrade(temp_max);
    const weatherIconClass = iconMap[arr.icon] || 'wi-na';

    const content = document.createElement('div');
    content.innerHTML = `
        <h5>The weather in ${name} is</h5>
        <i class="wi ${weatherIconClass}"></i>
        <h2>${degrees}°C</h2>
        <p>Max: ${max}°C</p>
        <p>Min: ${min}°C</p>
    `;

    const result = document.querySelector('.result');
    result.appendChild(content);

    if (coord) {
        map.setView([coord.lat, coord.lon], 13);
        L.marker([coord.lat, coord.lon]).addTo(map);
    } else {
        console.error('Coordinates not available for the city:', name);
    }
}





function showError(message) {
    const form = document.querySelector('.get-weather');
    const alert = document.createElement('p');
    alert.classList.add('alert-message');
    alert.innerHTML = message;

    form.appendChild(alert);
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

function kelvinToCentigrade(temp) {
    return parseInt(temp - 273.15);
}

function clearHTML() {
    const result = document.querySelector('.result');
    result.innerHTML = '';
}

let map;

document.addEventListener('DOMContentLoaded', function() {
    loadCountries();
    initLeafletMap();
    const form = document.querySelector('.get-weather');
    if(form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});


function initLeafletMap() {
    map = L.map('map').setView([51.505, -0.09], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 22,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);
}

async function getCountryCoordinates(countryCode) {
    try {
        const response = await fetch(`https://restcountries.com/v3.1/alpha/${countryCode}`);
        if (!response.ok) {
            throw new Error(`Error getting country data: ${response.status}`);
        }
        const data = await response.json();
        const { latlng } = data[0];

        
        if (!latlng || latlng.length !== 2) {
            throw new Error(`No coordinates found for the country: ${countryCode}`);
        }

        return { lat: latlng[0], lng: latlng[1] };
    } catch (error) {
        console.error(`Error in getCountryCoordinates: ${error.message}`);
        return null;
    }
}

