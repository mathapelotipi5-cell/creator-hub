# Creator Hub

Creator Hub is a React viewer portal backed by an Express API and MongoDB. The public pages show published content; creator operations require a JWT login.

## Local setup

1. Create a MongoDB Atlas database and copy its connection URI.
2. In `server`, copy `.env.example` to `.env`. Set `MONGO_URI`, a long random `JWT_SECRET`, `CREATOR_EMAIL`, and a unique `CREATOR_PASSWORD` of at least 12 characters. Set the profile values as needed.
3. In `client`, copy `.env.example` to `.env`. Keep `VITE_API_URL=http://localhost:5000` and `VITE_USE_MOCK=false` for database-backed use. Set `VITE_USE_MOCK=true` only when intentionally using the browser-local sample demo.
4. From the workspace root, install each package and create the initial creator account:

    powershell
   cd creator-hub\server
   npm install
   npm run seed:creator
   npm start
   

   In a second terminal:

   powershell
   cd creator-hub\client
   npm install
   npm run dev
   

5. Open the Vite URL and use the creator login from `CREATOR_EMAIL` and `CREATOR_PASSWORD` at `/creator/login`.

The seed command creates one creator only and refuses to overwrite an existing account. Passwords are hashed with bcrypt before storage. Do not commit either `.env` file.

To publish the bundled sample photos as interactive Library posts, run `npm run seed:library-photos` from `creator-hub/server` after setting up the database. The command is safe to rerun: it skips photos already present. Each post starts with zero views and likes; viewer comments and engagement use the existing content detail features.

## API

- `POST /api/auth/login`
- `GET /api/creator/profile`
- `GET /api/contents`, `GET /api/contents/:id`
- `POST /api/contents`, `PUT /api/contents/:id`, `DELETE /api/contents/:id` (creator JWT required)
- `POST /api/comments`, `GET /api/comments/:contentId`
- `GET /api/comments?status=pending` (creator JWT required)
- `PATCH /api/comments/:id`, `DELETE /api/comments/:id` (creator JWT required)
- `POST /api/likes`
- `GET /api/dashboard/stats`, `GET /api/dashboard/contents`, `GET /api/dashboard/profile` (creator JWT required)

## Deployment

The client can be deployed to Vercel with the project root set to `creator-hub/client`. Set `VITE_API_URL` to the deployed API origin without `/api` or a trailing slash, and set `VITE_USE_MOCK=false`. The included Vercel rewrite supports client-side routes.

The API can be deployed to Render using the workspace-root `render.yaml` Blueprint. Set `MONGO_URI` to the Atlas URI and `CLIENT_ORIGIN` to the exact deployed frontend origin. Render generates `JWT_SECRET`; set `CREATOR_EMAIL` and `CREATOR_PASSWORD` securely, then run `npm run seed:creator` once from the server directory using the deployed environment. Add the deployed API health URL `/api/health` to deployment checks.

After deploying both services, configure the frontend API URL, redeploy it, create the initial creator account, and test login and content operations using the public frontend URL. Hosting accounts, Atlas network access, production secrets, and the final public URLs must be supplied/configured by the deployer.

## Scope notes

Viewer likes identify an anonymous browser with a local viewer ID; this is not strong identity verification. Content media is provided through URLs rather than uploaded files. Viewer registration is not implemented, so a separate viewers collection is not needed for this version.