# Deploy client to Vercel

## Environment variables in Vercel

In **Vercel** → your project → **Settings** → **Environment Variables**, add:

| Name | Value | Environments |
|------|--------|--------------|
| `VITE_API_URL` | `https://room-craft-studio.onrender.com/api` | Production, Preview |
| `VITE_SOCKET_URL` | `https://room-craft-studio.onrender.com` | Production, Preview |

These point the frontend to your Render backend. The client uses `VITE_API_URL` for REST and `VITE_SOCKET_URL` for WebSockets.

**Note:** The GitHub Actions workflow (`.github/workflows/deploy-vercel.yml`) already sets these for the build when deploying from the repo, so the client is built with the correct backend URL. If you also use Vercel’s native Git integration or deploy from the CLI, set the variables above in the Vercel dashboard so those builds use the same backend.
