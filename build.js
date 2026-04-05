const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const srcDir = 'src';
const outDir = '.';

// ---- Utilities ----

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function formatDate(d) {
  const date = new Date(d);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const mon = MONTHS[date.getUTCMonth()];
  const year = date.getUTCFullYear();
  return `${day} ${mon} ${year}`;
}

function rssDate(d) {
  return new Date(d).toUTCString();
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '');
}

function truncate(str, n) {
  return str.length > n ? str.slice(0, n) + '...' : str;
}

// Convert internal relative links (no extension, no protocol) to .html links
function resolveInternalLinks(md) {
  // Match markdown links: [text](target)
  return md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
    // Skip if it has a protocol, a fragment only, or already has an extension
    if (/^(https?:|mailto:|\/\/|#)/.test(href)) return match;
    if (/\.\w+$/.test(href)) return match;
    return `[${text}](${href}.html)`;
  });
}

function renderMarkdown(body) {
  return marked.parse(resolveInternalLinks(body));
}

// ---- Templates ----

function mathjaxBlock() {
  if (!config.mathjax) return '';
  return `  <script>
    MathJax = { tex: { inlineMath: [['$','$'],['\\\\(','\\\\)']] } };
  </script>
  <script src="${config.mathjaxUrl}" id="MathJax-script" async></script>`;
}

function notebookHtml(slug, title, formattedCreated, formattedUpdated, renderedBody) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="style.css" rel="stylesheet">
  <title>${title}</title>
${mathjaxBlock()}
</head>
<body>

<p></p><cite><a href="index.html">Notebooks</a></cite>

<div class="text">
<div class="left">
  <h2>${title}</h2>
  <i>Last update: ${formattedUpdated}</i>
  <br><i>First version: ${formattedCreated}</i>
  <hr>
  ${renderedBody}
</div>
</div>

<hr>

<div class="text">
<div class="left">
  <p>
    <a href="${slug}.html">permanent link for this notebook</a> &nbsp;
    <a href="${slug}.rss">RSS feed for this notebook</a>
  </p>
</div>
</div>

<div class="text">
<center>
  <cite><a href="index.html">Notebooks</a></cite>
</center>
</div>

</body>
</html>`;
}

function notebookRss(slug, title, formattedUpdated, renderedBody, updatedDate) {
  const link = `${config.baseUrl}/${slug}.html`;
  const description = truncate(stripHtml(renderedBody), 500);
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${link}</link>
    <description>${escapeXml(title)} notebook</description>
    <lastBuildDate>${rssDate(updatedDate)}</lastBuildDate>
    <item>
      <title>${escapeXml(title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${rssDate(updatedDate)}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>
  </channel>
</rss>`;
}

function indexHtml(notebookEntries, hasFaq) {
  const faqLink = hasFaq ? `<a href="faq.html">FAQ</a> &nbsp; ` : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="style.css" rel="stylesheet">
  <title>${config.title}</title>
</head>
<body>

<div class="text">
<div class="left">
  <h1>${config.title}</h1>
  <p>${faqLink}<a href="feed.rss">RSS feed</a></p>
  <hr>
</div>
</div>

${notebookEntries}

</body>
</html>`;
}

function masterRss(notebooks) {
  const items = notebooks.map(n => {
    const link = `${config.baseUrl}/${n.slug}.html`;
    const description = truncate(stripHtml(n.renderedBody), 500);
    return `    <item>
      <title>${escapeXml(n.title)}</title>
      <link>${link}</link>
      <guid>${link}</guid>
      <pubDate>${rssDate(n.updated)}</pubDate>
      <description>${escapeXml(description)}</description>
    </item>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${config.baseUrl}/index.html</link>
    <description>${escapeXml(config.title)} by ${escapeXml(config.author)}</description>
    <lastBuildDate>${rssDate(new Date())}</lastBuildDate>
${items}
  </channel>
</rss>`;
}

function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// ---- Build ----

const files = fs.readdirSync(srcDir).filter(f => f.endsWith('.md') && f !== 'faq.md');

const notebooks = files.map(file => {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(srcDir, file), 'utf8');
  const { data, content } = matter(raw);
  const renderedBody = renderMarkdown(content);
  return {
    slug,
    title: data.title || slug,
    created: data.created,
    updated: data.updated,
    renderedBody,
  };
});

// Sort by updated date, most recent first
notebooks.sort((a, b) => new Date(b.updated) - new Date(a.updated));

// Write per-notebook files
for (const nb of notebooks) {
  const formattedCreated = formatDate(nb.created);
  const formattedUpdated = formatDate(nb.updated);

  const html = notebookHtml(nb.slug, nb.title, formattedCreated, formattedUpdated, nb.renderedBody);
  fs.writeFileSync(path.join(outDir, `${nb.slug}.html`), html);

  const rss = notebookRss(nb.slug, nb.title, formattedUpdated, nb.renderedBody, nb.updated);
  fs.writeFileSync(path.join(outDir, `${nb.slug}.rss`), rss);

  console.log(`  ${nb.slug}.html  ${nb.slug}.rss`);
}

// Write index
const notebookEntries = notebooks.map(nb => {
  const formattedUpdated = formatDate(nb.updated);
  return `<div class="listing"><div class="left"><dl><dt><a href="${nb.slug}.html">${nb.title}</a> <i>(${formattedUpdated})</i></dt></dl></div></div>`;
}).join('\n');

const hasFaq = config.faq && fs.existsSync(path.join(srcDir, 'faq.md'));

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml(notebookEntries, hasFaq));
console.log('  index.html');

// Write master RSS
fs.writeFileSync(path.join(outDir, 'feed.rss'), masterRss(notebooks));
console.log('  feed.rss');

// Write FAQ if present
if (hasFaq) {
  const raw = fs.readFileSync(path.join(srcDir, 'faq.md'), 'utf8');
  const { data, content } = matter(raw);
  const renderedBody = renderMarkdown(content);
  const formattedCreated = formatDate(data.created);
  const formattedUpdated = formatDate(data.updated);
  const html = notebookHtml('faq', data.title || 'FAQ', formattedCreated, formattedUpdated, renderedBody);
  fs.writeFileSync(path.join(outDir, 'faq.html'), html);
  console.log('  faq.html');
}

console.log('Done.');
