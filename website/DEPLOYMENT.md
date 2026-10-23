# Deployment on Render

Render runs the FastAPI backend and serves the frontend from the same web
service. This keeps API and WebSocket requests on one domain.

## Deploy from GitHub

1. Push the repository, including the root-level `render.yaml`, to GitHub.
2. In the Render dashboard, select **New** > **Blueprint** and connect this
   repository.
3. Review the `locallang-tanzania` web service and select **Apply** to deploy.
   The Blueprint uses the `website` directory, installs
   `website/requirements.txt`, and starts the FastAPI app on Render's assigned
   port.
4. When the deployment finishes, open the service URL shown in the Render
   dashboard. The homepage is `/`, the translator is `/index.html`, and the
   health endpoint is `/api/health`.

The service reads its translation CSV files from `website/data`. Supabase and
AI translation settings are optional; add any required values in the Render
service's environment settings, and never commit secret keys to the repository.

Keep the service at one instance because active conversation rooms are stored
in memory. The free instance may spin down after inactivity, so its first
request after a period without traffic can take longer while it starts.
