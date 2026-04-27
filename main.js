/* FarmGuard — main.js */

// ── STATE ──
var location_name = localStorage.getItem('fg_location') || '';
var lat = null;
var lon = null;
var crop = '';
var diseases = '';

// Pre-fill location if saved
if (location_name) {
  document.getElementById('location-input').value = location_name;
}

// ── SHOW/HIDE VIEWS ──
function showView(name) {
  document.querySelectorAll('.view').forEach(function(v) {
    v.classList.remove('active');
    v.hidden = true;
  });
  var target = document.getElementById('view-' + name);
  target.hidden = false;
  target.classList.add('active');

  // update step nav
  document.querySelectorAll('.step-btn').forEach(function(btn) {
    btn.classList.toggle('active', btn.dataset.step === name);
  });
}

// back buttons
document.querySelectorAll('.back-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    showView(btn.dataset.back);
  });
});

// step nav buttons
document.querySelectorAll('.step-btn').forEach(function(btn) {
  btn.addEventListener('click', function() {
    if (!btn.disabled) showView(btn.dataset.step);
  });
});

// ── VIEW 1: LOCATION FORM ──
document.getElementById('location-form').addEventListener('submit', function(e) {
  e.preventDefault();
  var val = document.getElementById('location-input').value.trim();
  if (!val) {
    document.getElementById('location-error').hidden = false;
    return;
  }
  document.getElementById('location-error').hidden = true;
  location_name = val;
  localStorage.setItem('fg_location', location_name);
  document.querySelector('#location-display strong').textContent = location_name;
  showView('crop');
});

// GPS button
document.getElementById('gps-btn').addEventListener('click', function() {
  if (!navigator.geolocation) { alert('Geolocation not supported.'); return; }
  navigator.geolocation.getCurrentPosition(function(pos) {
    lat = pos.coords.latitude;
    lon = pos.coords.longitude;
    location_name = lat.toFixed(2) + '°N, ' + Math.abs(lon).toFixed(2) + '°W';
    document.getElementById('location-input').value = location_name;
    localStorage.setItem('fg_location', location_name);
    document.querySelector('#location-display strong').textContent = location_name;
    showView('crop');
  }, function() {
    alert('Could not get location. Please type it in.');
  });
});

// ── VIEW 2: CROP SELECTION ──
document.querySelectorAll('.crop-card').forEach(function(card) {
  card.addEventListener('click', function() {
    document.querySelectorAll('.crop-card').forEach(function(c) { c.classList.remove('selected'); });
    card.classList.add('selected');
    crop = card.dataset.crop;
    diseases = card.dataset.disease;
    setTimeout(startAnalysis, 300);
  });
});

// ── VIEW 3: RUN ANALYSIS ──
async function startAnalysis() {
  showView('results');
  document.getElementById('results-meta').textContent = crop + ' · ' + location_name;
  document.getElementById('results-loading').hidden = false;
  document.getElementById('results-error').hidden = true;
  document.getElementById('results-content').hidden = true;

  try {
    // geocode if no coords yet
    if (!lat || !lon) {
      document.getElementById('loading-step').textContent = 'Looking up location…';
      await geocode();
    }

    // fetch weather
    document.getElementById('loading-step').textContent = 'Fetching 7-day forecast…';
    var weather = await fetchWeather();

    // ask Claude
    document.getElementById('loading-step').textContent = 'Analyzing with AI…';
    var result = await askClaude(weather);

    renderResults(weather, result);

  } catch (err) {
    document.getElementById('results-loading').hidden = true;
    document.getElementById('results-error').hidden = false;
    document.getElementById('error-message').textContent = err.message || 'Something went wrong.';
  }
}

document.getElementById('retry-btn').addEventListener('click', startAnalysis);
document.getElementById('new-search-btn').addEventListener('click', function() {
  document.querySelectorAll('.crop-card').forEach(function(c) { c.classList.remove('selected'); });
  showView('crop');
});

// ── GEOCODE (Open-Meteo — free, no API key) ──
async function geocode() {
  var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' + encodeURIComponent(location_name) + '&count=1';
  var res  = await fetch(url);
  var data = await res.json();
  if (!data.results || !data.results.length) throw new Error('Location not found. Try a different city.');
  lat = data.results[0].latitude;
  lon = data.results[0].longitude;
}

// ── FETCH WEATHER (Open-Meteo — free, no API key) ──
async function fetchWeather() {
  var url = 'https://api.open-meteo.com/v1/forecast'
    + '?latitude=' + lat + '&longitude=' + lon
    + '&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,relative_humidity_2m_mean,weathercode'
    + '&temperature_unit=fahrenheit&precipitation_unit=inch&timezone=auto&forecast_days=7';
  var res  = await fetch(url);
  var data = await res.json();
  if (!data.daily) throw new Error('Could not get weather data.');
  return data.daily.time.map(function(date, i) {
    return {
      date:     date,
      tempMax:  data.daily.temperature_2m_max[i],
      tempMin:  data.daily.temperature_2m_min[i],
      rain:     data.daily.precipitation_sum[i],
      humidity: data.daily.relative_humidity_2m_mean[i],
      code:     data.daily.weathercode[i]
    };
  });
}

// ── ASK CLAUDE ──
var CLAUDE_API_KEY = 'YOUR_API_KEY_HERE'; // replace for local testing

async function askClaude(weather) {
  var summary = weather.map(function(d) {
    return d.date + ': High ' + d.tempMax + 'F, Low ' + d.tempMin + 'F, Rain ' + d.rain + 'in, Humidity ' + d.humidity + '%';
  }).join('\n');

  var prompt = 'You are a plant disease expert. A farmer is growing ' + crop + ' near ' + location_name + '.'
    + ' Common diseases for this crop: ' + diseases + '.'
    + '\n\n7-day forecast:\n' + summary
    + '\n\nGive a pest/disease risk assessment. Respond ONLY in this JSON format:'
    + '\n{"risk":"Low Risk"|"Medium Risk"|"High Risk","explanation":"2-3 sentences about why","actions":["step 1","step 2","step 3"]}';

var res = await fetch('/.netlify/functions/claude', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }]
    })
  });

  if (!res.ok) throw new Error('Claude API error ' + res.status);
  var data = await res.json();
  var text = data.content[0].text.trim();

  // parse JSON from Claude's response
  var match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Could not read AI response.');
  return JSON.parse(match[0]);
}

// ── RENDER RESULTS ──
function renderResults(weather, result) {
  document.getElementById('results-loading').hidden = true;
  document.getElementById('results-content').hidden = false;

  // risk banner
  var level = result.risk.split(' ')[0].toLowerCase(); // "low", "medium", "high"
  var banner = document.getElementById('risk-banner');
  banner.className = 'risk-banner ' + level;
  document.getElementById('risk-level').textContent = result.risk;

  // weather strip
  document.getElementById('weather-strip').innerHTML = weather.map(function(d) {
    var day = new Date(d.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' });
    return '<div class="weather-day">'
      + '<div class="weather-day-name">' + day + '</div>'
      + '<div class="weather-day-icon">' + weatherIcon(d.code) + '</div>'
      + '<div class="weather-day-temp">' + Math.round(d.tempMax) + '°F</div>'
      + '<div class="weather-day-rain">' + (d.rain > 0 ? d.rain.toFixed(2) + '"' : 'Dry') + '</div>'
      + '</div>';
  }).join('');

  // explanation
  document.getElementById('analysis-body').innerHTML = '<p>' + result.explanation + '</p>';

  // action steps
  document.getElementById('action-list').innerHTML = result.actions
    .map(function(a) { return '<li>' + a + '</li>'; }).join('');

  // timestamp
  document.getElementById('results-timestamp').textContent = 'Updated ' + new Date().toLocaleString();
}

// ── WEATHER ICON ──
function weatherIcon(code) {
  if (code === 0)  return '☀️';
  if (code <= 2)   return '⛅';
  if (code <= 3)   return '☁️';
  if (code <= 49)  return '🌫️';
  if (code <= 67)  return '🌧️';
  if (code <= 79)  return '🌨️';
  if (code <= 84)  return '🌦️';
  return '⛈️';
}

// ── START ──
showView('home');