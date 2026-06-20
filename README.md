# Soundwall

Soundwall is a local-first, open-source web app that connects to Spotify, pulls your top tracks, infers your top albums, and generates a cover-art collage you can export as PNG or PDF.

Everything runs in your browser. There is no backend, no database, and no Soundwall account.

Album scoring is inferred from your **top tracks** (up to 50 per time range across short, medium, and long term), not from a separate Spotify “top albums” API.

## What V1 supports

- Spotify login with Authorization Code + PKCE (`user-top-read` scope)
- Automatic fetch of top tracks across short, medium, and long term
- Album scoring from listening rank
- Cover-only collage preview (no album labels)
- Layout controls: export size, grid size, gap, background color, ranked/shuffled order, one-album-per-artist
- Export presets for square, phone/desktop wallpaper, and poster sizes
- PNG export
- PDF export (large poster PDFs may downscale the embedded image for browser limits)
- Log out to clear the local Spotify token

## What V1 does not support

- Manual album search or editing
- Drag-and-drop collage layout
- Apple Music or other music sources
- Social sharing
- Print store integration
- Hosted accounts or cloud sync
- Server-side storage of listening data
- Album title/artist labels on the collage

## Run locally

### Prerequisites

- Node.js 18+
- npm (included with Node.js)
- A [Spotify Developer](https://developer.spotify.com/dashboard) app

### 1. Create a Spotify Developer app

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard).
2. Create an app (e.g. "Soundwall Local").
3. Open the app settings.
4. Under **Redirect URIs**, add:

   ```
   http://127.0.0.1:5173/callback
   ```

   The redirect URI must match exactly — use `127.0.0.1`, not `localhost`, unless you change both the Spotify app settings and your local env file to match.

5. Copy the **Client ID**.

#### Development mode and user allowlist

New Spotify apps start in **Development Mode**. Only Spotify accounts added under your app’s **Users and Access** (or legacy user management) section can log in until the app is reviewed for extended quota.

If login fails with access errors after redirect, add your Spotify account email to the app allowlist in the Developer Dashboard.

### 2. Configure environment variables

Copy the example env file:

```bash
cp .env.example .env.local
```

On Windows (Command Prompt):

```bat
copy .env.example .env.local
```

On Windows (PowerShell):

```powershell
Copy-Item .env.example .env.local
```

Edit `.env.local`:

```env
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_REDIRECT_URI=http://127.0.0.1:5173/callback
```

`VITE_SPOTIFY_CLIENT_ID` is injected at build time by Vite. It is public in the browser bundle, which is expected for a PKCE client-side app. Do not put a client secret in the frontend.

Restart the dev server after changing `.env.local` — Vite reads env vars at startup.

If `VITE_SPOTIFY_CLIENT_ID` is missing, the app shows an error when you click **Connect Spotify**.

### 3. Install and start

```bash
npm install
npm run dev
```

Open **http://127.0.0.1:5173/** and click **Connect Spotify**.

### Build, preview, test, and lint

```bash
npm run build
npm run preview
npm test
npm run lint
```

**Preview uses port 4173 by default.** If you test OAuth with `npm run preview`, add this redirect URI in Spotify and in `.env.local`:

```
http://127.0.0.1:4173/callback
```

Rebuild after env changes because `VITE_*` values are baked in at build time.

## Required redirect URI

For local development with the default Vite config:

```
http://127.0.0.1:5173/callback
```

Spotify redirects here after login. Soundwall exchanges the authorization code for an access token and stores it in `sessionStorage` only.

## Known limitations

- **Local dev only by default** — the app expects the redirect URI above; hosting requires updating Spotify app settings and env vars.
- **Session storage** — tokens are cleared when the tab/session ends or when you log out; there is no refresh-token flow in V1.
- **Top tracks only** — collage quality depends on Spotify top-track data and available album artwork.
- **Preview vs export layout** — the on-screen preview follows the selected grid shape; export uses the selected export dimensions. If those aspect ratios differ, the preview is a layout guide, not a pixel-perfect print preview.
- **CORS for export** — album covers must load with CORS enabled for canvas/PDF export; most Spotify CDN images work, but failed loads leave blank cells.
- **Large exports** — poster presets at 300 DPI produce very large canvases; PDF export downscales huge images before embedding. PNG is the most reliable format for the largest poster sizes.
- **No persistence** — collage settings and track data are not saved between sessions.
- **Spotify API limits** — subject to Spotify rate limits and account eligibility for top tracks.
- **One album per artist** — when enabled, only the highest-scoring album per artist is kept. Compilation albums credited to **Various Artists** share one artist slot, which can reduce cover variety on large grids.

## Contributing

```bash
npm install
npm test
npm run lint
npm run build
```

GitHub Actions runs the same checks on push and pull requests.

## Roadmap

- Refresh token support for longer sessions
- Optional hosted deployment guide
- Manual album include/exclude
- Drag-and-drop layout editing
- Additional export formats and print-ready presets
- Apple Music support
- Share/export links

## Privacy

- Soundwall runs locally in your browser.
- Your Spotify data is used only to generate the collage.
- No database, no account, no server upload.
- You can log out anytime to clear the local token.

## License and third-party content

Soundwall’s source code is licensed under the MIT License.

This license applies only to the Soundwall source code. It does not grant rights to Spotify content, album artwork, artist images, metadata, trademarks, or other third-party content displayed or exported through the app.

See [NOTICE.md](NOTICE.md) for the full third-party content notice.

Soundwall uses Spotify data through the Spotify Web API. Users are responsible for complying with Spotify’s Developer Terms, Spotify’s branding guidelines, and any applicable copyright or rightsholder restrictions when using exported collages.
