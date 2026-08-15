#!/usr/bin/env node
/**
 * Static gallery site generator.
 * Reads every .txt file in data/ (one image URL per line).
 * Each file becomes a subpage; the filename (minus extension) becomes
 * both the nav label and the URL slug (e.g. data/travel.txt -> travel.html).
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const DIST_DIR = path.join(__dirname, "..", "dist");
const SITE_TITLE = "GALLERY"; // change to your site name

function slugify(filename) {
  return path.basename(filename, ".txt");
}

function labelize(slug) {
  // "street-photos" -> "Street Photos"
  return slug
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function readGalleries() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`No data/ directory found at ${DATA_DIR}`);
    process.exit(1);
  }
  const files = fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".txt"))
    .sort();

  if (files.length === 0) {
    console.error("No .txt files found in data/. Add one file per subpage.");
    process.exit(1);
  }

  return files.map((file) => {
    const slug = slugify(file);
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    const urls = raw
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.startsWith("#"));
    return { slug, label: labelize(slug), urls };
  });
}

function navHTML(galleries, activeSlug) {
  const links = galleries
    .map((g) => {
      const cls = g.slug === activeSlug ? ' class="active"' : "";
      return `<a href="${g.slug}.html"${cls}>${g.label}</a>`;
    })
    .join("\n        ");
  return `<header class="site-header">
      <a href="index.html" class="wordmark">${SITE_TITLE}</a>
      <nav class="site-nav">
        ${links}
      </nav>
    </header>`;
}

function galleryPage(gallery, allGalleries) {
  const tiles = gallery.urls
    .map(
      (url, i) => `<figure class="tile">
        <img src="${url}" alt="${gallery.label} ${i + 1}" loading="lazy" />
      </figure>`
    )
    .join("\n      ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${gallery.label} — ${SITE_TITLE}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  ${navHTML(allGalleries, gallery.slug)}
  <main class="grid">
    ${tiles}
  </main>
</body>
</html>
`;
}

function indexPage(galleries) {
  // simple centered landing page — just links to each subpage
  const links = galleries
    .map(
      (g) =>
        `<li><a href="${g.slug}.html">${g.label}</a></li>`
    )
    .join("\n        ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${SITE_TITLE}</title>
  <link rel="stylesheet" href="style.css" />
</head>
<body>
  <main class="landing">
    <h1 class="landing-title">${SITE_TITLE}</h1>
    <ul class="landing-list">
        ${links}
    </ul>
  </main>
</body>
</html>
`;
}

function build() {
  const galleries = readGalleries();

  if (!fs.existsSync(DIST_DIR)) fs.mkdirSync(DIST_DIR, { recursive: true });

  // copy stylesheet
  fs.copyFileSync(
    path.join(__dirname, "style.css"),
    path.join(DIST_DIR, "style.css")
  );

  // write each subpage
  galleries.forEach((gallery) => {
    const html = galleryPage(gallery, galleries);
    fs.writeFileSync(path.join(DIST_DIR, `${gallery.slug}.html`), html);
    console.log(`built ${gallery.slug}.html (${gallery.urls.length} images)`);
  });

  // write index
  fs.writeFileSync(path.join(DIST_DIR, "index.html"), indexPage(galleries));
  console.log(`built index.html`);

  console.log(`\nDone. ${galleries.length} pages in dist/`);
}

build();
