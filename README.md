# Gallery Site

A static, VSCO-style photo gallery. Each `.txt` file in `data/` becomes a
subpage — the filename becomes both the nav label and the URL.

## Structure

```
data/
  travel.txt       -> travel.html, nav label "Travel"
  street.txt       -> street.html, nav label "Street"
  my-portraits.txt -> my-portraits.html, nav label "My Portraits"
src/
  build.js          the generator
  style.css         the stylesheet
dist/               generated output (this is what you deploy)
```

Each `.txt` file holds one image URL per line. Blank lines and lines
starting with `#` are ignored.

## Usage

```bash
node src/build.js
```

This regenerates everything in `dist/`. Open `dist/index.html` locally,
or deploy `dist/` to GitHub Pages.

## Adding a new subpage

Just drop a new `data/newname.txt` file with one URL per line and rebuild.
It'll automatically appear in the nav and get its own page.

## Deploying to GitHub Pages

A workflow is already included at `.github/workflows/deploy.yml`. It runs
`node src/build.js` and publishes `dist/` on every push to `main`.

1. Push this repo to GitHub.
2. In repo Settings → Pages, set **Source** to **GitHub Actions**
   (do this before your first push, so the first deploy succeeds).
3. Push to `main` — the workflow builds and deploys automatically.
   You can also trigger it manually from the Actions tab
   (`workflow_dispatch`).

## Customizing

- Site name: edit `SITE_TITLE` in `src/build.js`.
- Colors/type/grid density: edit `src/style.css` (`:root` variables and
  the `.grid` column-count breakpoints).
- Nav order: pages are sorted alphabetically by filename. Prefix files
  with numbers (`01-travel.txt`) if you want manual ordering.
