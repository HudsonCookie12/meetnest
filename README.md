# MeetNest

An account-free student room lobby that launches meetings with the existing Jitsi Meet service. MeetNest does not implement calling or media transport. It creates a room code and embeds Jitsi's meeting interface.

## Run locally

Requirements: Node.js 20 or newer.

1. Run `npm install` in this folder.
2. Run `npm run dev`.
3. Open the Vite URL shown in the terminal (normally `http://localhost:5173`).

The dev server proxies `/api` to Express on port 3001. For a production-style local run, use `npm run build` and then `npm start`; the app listens on `PORT` (defaults to 3001).

## Deploy

Deploy as one Node web service so Express serves both the API and built site. For Render, set the build command to `npm install && npm run build`, the start command to `npm start`, and deploy. No meeting API credentials are needed. Camera and microphone access requires HTTPS in production; localhost is allowed for development.

## Use on a Chromebook

The Chromebook does not need Node.js or the source ZIP. Deploy MeetNest once, then students open its HTTPS link in ChromeOS Chrome. Allow camera and microphone access when Chrome asks. Jitsi lists Chrome as a supported browser, and its embedded meeting API works in browsers. If access was blocked earlier, use the site controls beside the address bar to allow Camera and Microphone, then reload the page.

## Rooms and Jitsi

- The server generates an eight-character room code. Jitsi uses that code as its room name.
- The Jitsi IFrame API loads from `meet.jit.si` when someone enters the room. Jitsi provides the meeting interface and audio/video service.
- MeetNest has no accounts or passwords. Share room codes only with the intended group.
- The public `meet.jit.si` service may ask the first person entering a room to authenticate or wait for a moderator. That behavior is controlled by Jitsi. For anonymous room creation without that prompt, use a Jitsi deployment configured for anonymous creation or another provider with suitable access rules.

## Files

- `src/` — React interface, Jitsi embed, and responsive styling
- `server/index.js` — room-code endpoint and production static hosting
- `vite.config.js` — local development API proxy
