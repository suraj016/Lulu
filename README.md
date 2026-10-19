# Lulu3D storefront

Danish-language React storefront for Lulu3D. The app runs entirely on local mock catalog data and is structured so a dedicated backend can replace the product service later.

## Scripts

```bash
npm install
npm run placeholders
npm run dev
```

Other commands:

- `npm run build` — TypeScript project build and Vite production bundle
- `npm test` — domain-logic tests
- `npm run lint` — Oxlint

The site is served at `http://localhost:5173`.

## Notes

Product photography, the official logo, and campaign banners were not in the repository when this frontend was built. The UI uses clearly marked local SVG placeholders in `public/placeholders`. Replace those files, then update `src/assets/manifest.ts`.
