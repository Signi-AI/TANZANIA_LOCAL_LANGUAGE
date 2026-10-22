# Deployment on Render

Render hosts the FastAPI backend and serves the frontend from the same service.
The API and WebSocket connections therefore use the same domain.

## Deploy

1. Push this repository to GitHub.
2. In Render, choose **New** > **Blueprint** and select the repository.
3. Review the service from the root-level `render.yaml`, then deploy it.
4. When deployment finishes, open the Render service URL. The service is named
   `locallang-tanzania`, so its free address will typically be
   `https://locallang-tanzania.onrender.com`. Render will confirm the exact
   address and whether the name is available. The homepage is at `/`, and the
   translator is at `/index.html`.
5. Confirm the backend is responding by opening `/api/health` on that same URL.

The service reads the translation CSV files from `website/data`. Supabase and
AI translation settings are optional; add any required values in the Render
service's environment settings, and never commit secret keys to the repository.

Keep the service at one instance because conversation rooms are stored in
memory and are not shared between multiple backend instances.
