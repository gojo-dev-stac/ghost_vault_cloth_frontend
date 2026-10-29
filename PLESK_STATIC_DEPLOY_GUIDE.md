# Deploy the GHOST Vault frontend to Plesk (static Vite workflow)

The reference Cyber Ghost Solutions frontend is a static Vite SPA deployed by
uploading the built files to Plesk `httpdocs`. Vault can use the same hosting
workflow: build its client-side SPA shell, put that shell and public assets in a
ZIP, then extract the ZIP contents into the G4057 document root. **No Docker or
Node.js runtime is needed on Plesk.**

## Important: Vault's build output is different

Vault uses TanStack Start, so its normal `npm run build` outputs an SSR server
as well as client assets. Do not upload `.output` or try to use it as the
reference project's `dist` folder. This setup prerenders a client-side SPA
shell, then packages the shell as `index.html` with Apache route fallback rules.
The browser makes API calls directly to `https://api.g4057.com/api`.

## 1. Build a Plesk release ZIP on Windows

Open PowerShell in the Vault frontend folder and run:

```powershell
Set-Location 'D:\workflows_void\cyberghostsolutions\Vault-Frontend'
npm ci
npm run build:plesk
```

The command creates a timestamped `vault-frontend-plesk-YYYYMMDD-HHMMSS-fff.zip`
in the project folder. It contains built static files only, including `.htaccess`,
`index.html`, the campaign frames, videos, logos, and product images. It does not
include source files, `node_modules`, `.output`, or `.env`.

The public `VITE_API_URL` is configured in `.env.plesk` and compiled into
the JavaScript during the build. To change the API host, edit that file and
rebuild. Never put passwords, API secrets, or database credentials in a
`VITE_*` variable.

## 2. Upload and extract on Plesk

1. In Plesk open **Websites & Domains > g4057.com > Files**.
2. Open the domain's document root, normally `httpdocs`. Confirm the correct
   document root under **Hosting & DNS > Hosting** if the account uses another
   path.
3. Back up the existing site files before the first deployment.
4. Upload the generated `vault-frontend-plesk-*.zip` into `httpdocs`.
5. Select the ZIP and click **Extract Files**; enable **Replace existing files**
   when updating an existing deployment.
6. Confirm `index.html`, `.htaccess`, `assets`, `media`, `campaign`, `products`,
   and `brand` are directly inside `httpdocs`. Do not leave them inside a
   nested `dist` or project folder.
7. Test the site, then remove the uploaded ZIP from `httpdocs`. Keep the local
   release ZIP for rollback.

The `.htaccess` file rewrites client-side routes (such as `/collection`,
`/auth`, `/vault`, and `/admin`) to `index.html`, while allowing real assets to
be served as files. Plesk must have Apache `mod_rewrite` enabled and permit
`.htaccess` overrides. If a deep link gives 404, ask the Plesk administrator to
enable these or configure the equivalent rewrite in the hosting panel.

## 3. Point DNS and enable HTTPS

- Point `g4057.com`'s DNS A record to the Plesk server.
- If `www.g4057.com` is also used, point it to the same server and either serve
  the same document root or redirect to `g4057.com`.
- Install a valid TLS certificate for each public hostname and enable HTTPS.
- The backend CORS configuration already allows `https://g4057.com` and
  `https://www.g4057.com`.

## 4. Verify the live site

- Visit `https://g4057.com/`, then directly open and refresh `/collection`,
  `/auth`, `/contact`, and `/admin`.
- Check product detail routes (`/product/<id>`) and protected routes after
  signing in.
- In browser DevTools > **Network**, verify API requests target
  `https://api.g4057.com/api/...`, not localhost.
- Verify images load from `/products/`, campaign frames from
  `/campaign/frames/`, and video from `/media/`. Requests for video byte ranges
  should return HTTP `206` for Safari and iOS playback.
- Test login, catalog, cart/checkout, account, and admin actions against the
  deployed backend.

## Updates

For each code change, run `npm run build:plesk`, upload the new timestamped ZIP,
and extract it into the same document root with **Replace existing files**
enabled. The ZIP contains a complete new static build. Keep the previous ZIP
until the updated site passes its checks.
