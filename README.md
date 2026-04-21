# Farm Pest & Disease Risk Alerts

A web app that gives farmers real-time pest and disease risk alerts based on current and forecast weather conditions — powered by government climate data and Claude AI.

Inspired by the community food work of organizations like [Persephone's Basket](https://persephonesbasket.org/), this tool is built for the growers behind local food systems who need early warnings before outbreaks damage their crops.

**Live Demo**: [https://github.com/732198/final-project-pest-alart/]
---

## Features

- Enter your location (zip code or city) and select a crop
- Fetches current conditions and 7-day weather forecast automatically
- Claude AI analyzes the conditions and returns a plain-language pest and disease risk report
- Recommended actions so farmers know exactly what to do
- Results saved locally — no need to re-enter your crop and location on return visits
- Fully responsive — works on mobile phones in the field

---

## Technologies Used

| Layer | Technology |
|-------|-----------|
| Frontend | HTML5, CSS3 (Flexbox/Grid), Vanilla JavaScript |
| Weather Data | [Open-Meteo API](https://open-meteo.com/) — free, no API key required |
| AI Risk Analysis | [Anthropic Claude API](https://www.anthropic.com/) (claude-sonnet-4-20250514) |
| Storage | Browser localStorage |
| Deployment | GitHub Pages |

---

## AI Tools Used

- **Claude (Anthropic)** — core feature: analyzes weather forecast data and returns crop-specific pest and disease risk assessments in plain English. Also used during development for debugging, code review, and learning new concepts.
- **GitHub Copilot** — autocomplete assistance while writing JavaScript fetch logic and event handlers.

---

## Challenges & Solutions

**Challenge**: Protecting the Anthropic API key on a static GitHub Pages site with no backend.  
**Solution**: Proxied API calls through a lightweight Netlify serverless function so the key is never exposed in client-side code.

**Challenge**: Translating raw weather numbers (temperature, humidity, precipitation probability) into meaningful crop-specific risk levels.  
**Solution**: Engineered a detailed Claude prompt that includes the crop type, the 7-day forecast data, and explicit instructions to output a structured risk level (Low / Medium / High) with reasoning and action steps.

**Challenge**: Making the UI usable on a phone in a field (bright sunlight, gloves, small screen).  
**Solution**: Large tap targets, high-contrast color scheme, and a single-column mobile layout tested with Chrome DevTools device simulation.

---

## Future Improvements

- Support for 10+ crops with dedicated disease models (e.g., late blight index for potatoes, downy mildew index for grapes)
- Historical risk trend chart showing how risk has changed over the past 30 days (Chart.js)
- County-level risk map using Leaflet.js and USDA regional data
- Email or SMS alert subscriptions so farmers get notified without opening the app
- Integration with USDA NASS crop progress reports for regional context

---

## Project Structure

```
farm-pest-alert/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── main.js
├── assets/
│   └── images/
├── proposal.md
└── README.md
```

---

## Getting Started (Local Development)

1. Clone the repo
   ```bash
   git clone https://github.com/732198/farm-pest-alert.git
   cd farm-pest-alert
   ```
2. Open `index.html` in your browser — no build step required.
3. To enable AI risk analysis, add your Anthropic API key to a `.env` file (see `js/main.js` comments for details). Never commit your key to GitHub.

---

*Built for OIM3690 AI-Powered Web Development — Spring 2026*