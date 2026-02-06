# Code Explainer

A web app that explains code line by line. Select a language, paste your code, and get a clear explanation powered by Google's Gemini API.

## Project structure

```
code explainer 2/
├── backend/          # Node + Express API (Gemini)
│   ├── server.js     # Express app, /api/explain
│   ├── gemini.js     # Gemini API integration
│   ├── .env          # GEMINI_API_KEY, PORT
│   └── package.json
├── frontend/         # React + Vite UI
│   ├── src/
│   │   ├── App.jsx
│   │   ├── api/explain.js   # Calls backend /api/explain
│   │   └── ...
│   └── package.json
└── README.md
```

## Setup

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env` (or copy from `backend/.env.example`):

- `GEMINI_API_KEY` – your Gemini API key from [Google AI Studio](https://aistudio.google.com/apikey)
- `PORT` – optional, default `5000`

Start the API:

```bash
npm run dev
```

Backend runs at **http://localhost:5000**.

### 2. Frontend

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:5173** and proxies `/api` to the backend.

## Running the app

1. Start **backend** first: `cd backend && npm run dev`
2. Start **frontend**: `cd frontend && npm run dev`
3. Open http://localhost:5173, select language, paste code, click **Explain code**.

## Build

- **Backend**: `cd backend && npm start` (production)
- **Frontend**: `cd frontend && npm run build` → output in `frontend/dist`

## Security

The Gemini API key lives only in `backend/.env` and is never sent to the browser. The frontend talks to your backend, which calls Gemini.

## Later: Chrome extension

The frontend (or a variant) can be packaged as a Chrome extension; the backend can stay as a hosted API or be adapted for extension use.
