const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const srcDir = 'src';
const srcNotebooksDir = path.join(srcDir, 'notebooks');
const buildDir = 'build';
const buildNotebooksDir = path.join(buildDir, 'notebooks');
const outDir = '.';

// ---- Utilities ----

function formatDate(d) {
  // gray-matter parses dates into Date objects, so we must handle both
  if (d instanceof Date) {
    // Reconstruct from UTC to avoid timezone shift (frontmatter has no tz)
    const year = d.getUTCFullYear();
    const mon = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    const hrs = String(d.getUTCHours()).padStart(2, '0');
    const min = String(d.getUTCMinutes()).padStart(2, '0');
    return `${year}.${mon}.${day}, ${hrs}:${min}`;
  }
  const s = String(d);
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/);
  if (!m) return s;
  const [, year, mon, day, hrs = '00', min = '00'] = m;
  return `${year}.${mon}.${day}, ${hrs}:${min}`;
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
  <link href="../../style.css" rel="stylesheet">
  <title>${title}</title>
${mathjaxBlock()}
</head>
<body>

<p></p><cite><a href="../../index.html">Notebooks</a></cite>

<div class="text">
<div class="left">
  <h2>${title}</h2>
  <i>Last update: ${formattedUpdated}</i>
  <br><i>First version: ${formattedCreated}</i>
  <hr>
  ${renderedBody}
</div>
</div>

<div class="text">
<div class="left">
  <hr>
  <p style="display:flex;justify-content:space-between">
    <a href="${slug}.html">permanent link</a>
    <cite><a href="../../index.html">Notebooks</a></cite>
    <a href="${slug}.rss">RSS feed</a>
  </p>
</div>
</div>

</body>
</html>`;
}

function pageHtml(slug, title, formattedCreated, formattedUpdated, renderedBody) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="../style.css" rel="stylesheet">
  <title>${title}</title>
${mathjaxBlock()}
</head>
<body>

<p></p><cite><a href="../index.html">Notebooks</a></cite>

<div class="text">
<div class="left">
  <h2>${title}</h2>
  <i>Last update: ${formattedUpdated}</i>
  <br><i>First version: ${formattedCreated}</i>
  <hr>
  ${renderedBody}
</div>
</div>

<div class="text">
<div class="left">
  <hr>
  <p style="display:flex;justify-content:space-between">
    <a href="${slug}.html">permanent link</a>
    <cite><a href="../index.html">Notebooks</a></cite>
  </p>
</div>
</div>

</body>
</html>`;
}

function notebookRss(slug, title, formattedUpdated, renderedBody, updatedDate) {
  const link = `${config.baseUrl}/build/notebooks/${slug}.html`;
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
  const faqLine = hasFaq
    ? `<p>I have compiled a list of <a href="build/faq.html" target="_blank">frequently asked questions (FAQ)</a>, and their answers. The questions, and by extension their answers, pertain only to the notebooks and not my larger body of work.</p>\n\n`
    : '';
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

<blockquote><center><em>These are my fancies, by which
	<br>I endeavor not to make things known
	<br>but myself.</em></center></blockquote>

<blockquote><em>&para; And I turned my selfe to behold wisedome, and madnesse and folly: for what can the man doe, that commeth after the king? euen that which hath bene already done. Then I saw that wisedome excelleth folly, as farre as light excelleth darkenesse. The wise mans eyes are in his head, but the foole walketh in darknes: and I my selfe perceiued also that one euent happeneth to them all. Then said I in my heart, As it happeneth to the foole, so it happeneth euen to me, and why was I then more wise? then I said in my heart, That this also is vanitie.</em>
	&mdash;Solomon, <cite>Ecclesiastes</cite> 2:12&ndash;15 (1611, KJV)</blockquote>

<p>These are the notebooks &mdash; more accurately, a slow porting of my previous OneNote notebooks, titled the Libers (Book of Records), where I left abstracts, questions, comments, and links to notes on the topics at hand. This carries on that spirit. If you have answers to any unanswered questions, and reasonable sources for the substantiation of them, feel free to <a href="https://krisyotam.com/contact" target="_blank">write</a>.</p>

${faqLine}<p>&mdash; <a href="https://krisyotam.com/home">Kris</a></p>

<center><a href="build/feed.rss" target="_blank">RSS feed</a> &nbsp; <a href="build/colophon.html" target="_blank">Colophon</a> &nbsp; <a href="https://krisyotam.com/contact" target="_blank">Contact</a></center>

</div>
</div>

${notebookEntries}

</body>
</html>`;
}

function masterRss(notebooks) {
  const items = notebooks.map(n => {
    const link = `${config.baseUrl}/build/notebooks/${n.slug}.html`;
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

// Ensure output directories exist
fs.mkdirSync(buildDir, { recursive: true });
fs.mkdirSync(buildNotebooksDir, { recursive: true });

const files = fs.readdirSync(srcNotebooksDir).filter(f => f.endsWith('.md'));

const notebooks = files.map(file => {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(srcNotebooksDir, file), 'utf8');
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

// Write per-notebook files to build/notebooks/
for (const nb of notebooks) {
  const formattedCreated = formatDate(nb.created);
  const formattedUpdated = formatDate(nb.updated);

  const html = notebookHtml(nb.slug, nb.title, formattedCreated, formattedUpdated, nb.renderedBody);
  fs.writeFileSync(path.join(buildNotebooksDir, `${nb.slug}.html`), html);

  const rss = notebookRss(nb.slug, nb.title, formattedUpdated, nb.renderedBody, nb.updated);
  fs.writeFileSync(path.join(buildNotebooksDir, `${nb.slug}.rss`), rss);

  console.log(`  build/notebooks/${nb.slug}.html  build/notebooks/${nb.slug}.rss`);
}

// Write index to repo root
const notebookEntries = notebooks.map(nb => {
  const formattedUpdated = formatDate(nb.updated);
  return `<div class="listing"><div class="left"><dl><dt><a href="build/notebooks/${nb.slug}.html" target="_blank">${nb.title}</a> <i>(${formattedUpdated})</i></dt></dl></div></div>`;
}).join('\n');

const hasFaq = config.faq && fs.existsSync(path.join(srcDir, 'faq.md'));

fs.writeFileSync(path.join(outDir, 'index.html'), indexHtml(notebookEntries, hasFaq));
console.log('  index.html');

// Write master RSS to build/
fs.writeFileSync(path.join(buildDir, 'feed.rss'), masterRss(notebooks));
console.log('  build/feed.rss');

// Write FAQ if present
if (hasFaq) {
  const raw = fs.readFileSync(path.join(srcDir, 'faq.md'), 'utf8');
  const { data, content } = matter(raw);
  const renderedBody = renderMarkdown(content);
  const formattedCreated = formatDate(data.created);
  const formattedUpdated = formatDate(data.updated);
  const html = pageHtml('faq', data.title || 'FAQ', formattedCreated, formattedUpdated, renderedBody);
  fs.writeFileSync(path.join(buildDir, 'faq.html'), html);
  console.log('  build/faq.html');
}

// Write colophon if present
const hasColophon = fs.existsSync(path.join(srcDir, 'colophon.md'));
if (hasColophon) {
  const raw = fs.readFileSync(path.join(srcDir, 'colophon.md'), 'utf8');
  const { data, content } = matter(raw);
  const renderedBody = renderMarkdown(content);
  const formattedCreated = formatDate(data.created);
  const formattedUpdated = formatDate(data.updated);
  const html = pageHtml('colophon', data.title || 'Colophon', formattedCreated, formattedUpdated, renderedBody);
  fs.writeFileSync(path.join(buildDir, 'colophon.html'), html);
  console.log('  build/colophon.html');
}

console.log('Done.');
