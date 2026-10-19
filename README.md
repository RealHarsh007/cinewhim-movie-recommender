# CineMind AI
React + Vite + Tailwind client, Express + MongoDB API, TMDB data, explainable recommendation engine with optional AI provider.

## Setup
1. Get a free TMDB API key: themoviedb.org → Settings → API.
2. MongoDB: local (`mongodb://127.0.0.1:27017/cinemind_ai`) or a free Atlas cluster URI.
3. Server:
   - PowerShell: `cd server; copy .env.example .env; npm install; npm run dev`
   - macOS/Linux: `cd server && cp .env.example .env && npm install && npm run dev`
   Edit `.env` (TMDB_API_KEY, MONGODB_URI, JWT_SECRET 32+ chars). Needs Node 20.6+.
4. Client (new terminal): `cd client; npm install; npm run dev` → http://localhost:5173 (Vite proxies `/api` to port 5000).
5. Optional AI: set AI_BASE_URL (e.g. `https://api.openai.com/v1`), AI_API_KEY, AI_MODEL — any OpenAI-compatible chat endpoint. Without them the heuristic engine is used and the UI says so.

## Tests
`cd server; npm test` — covers ranking, exclusion, dedupe, vote-confidence and AI-fallback logic.

## Scoring
`score = .35·genre + .15·mood + .10·user-prefs + .25·rating(vote-confidence weighted) + .15·popularity` (see `server/src/recommend.js`, `WEIGHTS`). Results are re-ranked greedily with a genre-diversity penalty. Likes/dislikes feed genre preference; dislikes are excluded. No ML model is trained.

## API
Auth: `POST /api/auth/{register,login,logout}`, `GET /api/auth/me`. Movies: `GET /api/movies/{trending,popular,top-rated,upcoming,search,discover}`, `/api/movies/:id[/similar|/recommendations|/videos|/credits]`. AI: `POST /api/ai/{recommendations,explain}`. Watchlist: `GET|POST /api/watchlist`, `POST /api/watchlist/merge`, `DELETE /api/watchlist/:movieId`. Users: `GET|PUT /api/users/profile`, `POST /api/users/{favorites,feedback}`, `GET /api/users/{recommendations,history}`.

## Deployment
Set `NODE_ENV=production`, `CLIENT_URL` to your client origin, `VITE_API_URL` to the API URL. Cookies become `Secure; SameSite=None`, so serve both over HTTPS.

## Known limitations
No profile page UI yet (the profile, favorites and history APIs work); no client tests; no API integration tests (Supertest + mongodb-memory-server is the next step); TMDB cache is in-memory per process; MongoDB movie-cache model not implemented. Nothing has been run against live TMDB/MongoDB in this environment.
