# expensetrackernew

## Local setup

1. Copy `backend/.env.example` to `backend/.env` and fill in your local MongoDB and mail settings.
2. Copy `frontend/.env.example` to `frontend/.env`. Set `VITE_GOOGLE_CLIENT_ID` to the same Google OAuth client ID as `GOOGLE_CLIENT_ID` in the backend, and set `VITE_API_URL` to your backend API URL.
3. In Google Cloud Console, add `http://localhost:5173` to the OAuth client's authorized JavaScript origins for local development. Add your exact deployed website origin there as well; Google currently rejects the local origin until it is added.
4. Start the backend from `backend` with `npm run dev`, then start the frontend from `frontend` with `npm run dev`.

For deployment, configure the same environment variables in each hosting provider. Do not put backend secrets in frontend variables.