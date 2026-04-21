# Farm Pest & Disease Risk Alerts — Project Proposal

## What are you building? Who is it for?

A web app that gives small and mid-size farmers real-time pest and disease risk alerts for their crops, based on current and forecast weather conditions pulled from government APIs. The target user is a farmer (or agricultural advisor) who wants an early warning before an outbreak damages their yield.

This project is inspired by the work of organizations like Persephone's Basket, which connect communities to local food systems — the goal is to give the growers behind those networks better tools.

## Why? What problem does it solve?

Pest and disease outbreaks are heavily influenced by temperature, humidity, and rainfall — conditions that government agencies already track and publish. But farmers rarely have an easy way to connect that data to crop-specific risk. A late blight warning that comes three days early can save an entire potato harvest. This app bridges the gap between raw environmental data and actionable farm decisions.

## MVP vs. Stretch Goals

### MVP (Minimum Viable Product)
- Farmer enters their location (zip code or city) and selects a crop
- App fetches current and 7-day forecast weather from a free government API (NOAA / Open-Meteo)
- Claude AI interprets the conditions and returns a pest/disease risk assessment with plain-language explanation and recommended actions
- At least 3 supported crops (e.g., tomatoes, potatoes, corn)
- Responsive design that works on mobile (farmers use phones in the field)
- Results saved to local storage so the farmer can revisit without re-entering data

### Stretch Goals
- Support for 10+ crops with crop-specific disease models (e.g., late blight index for potatoes)
- USDA crop data integration for regional context
- Historical risk trend chart (Chart.js) showing risk level over the past 30 days
- Email/SMS alert subscription (Netlify Functions + SendGrid)
- Map view showing risk levels by county using Leaflet

## Technologies

| Layer | Technology |
|-------|-----------|
| Frontend | HTML, CSS (Flexbox/Grid), Vanilla JavaScript |
| Weather Data | [Open-Meteo API](https://open-meteo.com/) (free, no key needed) or NOAA Climate Data Online |
| AI Risk Analysis | Anthropic Claude API (claude-sonnet-4-20250514) |
| Data Visualization (stretch) | Chart.js |
| Maps (stretch) | Leaflet.js |
| Deployment | GitHub Pages (or Netlify if serverless functions needed for API key proxying) |
| Storage | localStorage for saving user crop/location preferences |