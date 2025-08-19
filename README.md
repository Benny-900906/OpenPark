# OpenCut

OpenPark is an Open Source Application for finding nearby parking spots in major Taiwanese cities (Tainan, Taichung, New Taipei, and Taipei). It uses the [Taiwan Transportation Data eXchange (TDX)](https://tdx.transportdata.tw/) APIs to obtain real‑time on‑street parking information.

## Features

- Search for available on-street parking spaces around your current location.
- Supports multiple cities, including Tainan, PingTung, Taipei, and NewTaipei.
- View parking details such as rates, opening hours, and road segments.
- Dark theme with settings for search range and result count.
- Integrates Google Maps for navigation to a selected spot.

## Requirements

- Node.js and npm

### Environment Variables

Create a `.env` file in the project root containing your TDX credentials:

```bash
REACT_APP_TDX_CLIENT_ID=your_client_id
REACT_APP_TDX_CLIENT_SECRET=your_client_secret
REACT_APP_TDX_TOKEN_URL=https://tdx.transportdata.tw/auth/realms/TDXConnect/protocol/openid-connect/token
```

These values are loaded in `lib/tdxServices.tsx` when requesting an access token【F:lib/tdxServices.tsx†L1-L27】.

## Installation

```bash
npm install
npx run start
```

## How It Works

1. On launch, the app fetches an access token from TDX and refreshes it every four hours【F:app/(root)/(tabs)/index.tsx†L6-L21】.
2. When searching for parking, the app obtains your city name from coordinates and queries TDX for nearby parking spots【F:components/Home/MapButtons.tsx†L161-L170】.
3. Available spots are filtered and enriched with rate and time information before being displayed on the map【F:lib/parkingSpotServices.tsx†L90-L200】.
4. Tap a parking marker to view details in a bottom sheet

## Styling

Tailwind CSS is integrated through NativeWind. Styles are defined in `app/global.css` and processed using the custom Metro configuration【F:metro.config.js†L1-L18】.

## License

This project is provided as-is for demonstration purposes and is not licensed for commercial use.
