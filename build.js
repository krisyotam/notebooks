const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Tell gray-matter to treat all YAML values as strings (no date auto-parsing)
const matterOpts = {
  engines: {
    yaml: {
      parse: s => require('js-yaml').load(s, { schema: require('js-yaml').FAILSAFE_SCHEMA }),
      stringify: o => require('js-yaml').dump(o)
    }
  }
};

const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));
const srcDir = 'src';
const srcNotebooksDir = path.join(srcDir, 'notebooks');
const buildDir = 'build';
const buildNotebooksDir = path.join(buildDir, 'notebooks');
const outDir = '.';

// ---- Utilities ----

function formatDate(d) {
  const s = String(d);
  // Match: 2026-04-04T09:31pm or 2026-04-04T12:00am or plain 2026-04-04
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{1,2}):(\d{2})(am|pm)?)?/i);
  if (!m) return s;
  let [, year, mon, day, hrs = '0', min = '00', ampm] = m;
  let h = parseInt(hrs, 10);
  if (ampm) {
    ampm = ampm.toLowerCase();
    if (ampm === 'am' && h === 12) h = 0;
    else if (ampm === 'pm' && h !== 12) h += 12;
  }
  return `${year}.${mon}.${day}, ${String(h).padStart(2, '0')}:${min}`;
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

// Convert internal relative links to clean /notebooks/slug URLs
function resolveInternalLinks(md) {
  return md.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, href) => {
    if (/^(https?:|mailto:|\/\/|#)/.test(href)) return match;
    if (/\.\w+$/.test(href)) return match;
    return `[${text}](/notebooks/${href})`;
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

var infoSvg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';

var STATUS_EXPLANATION = 'The status indicator reflects the current state of the work:\n\n- Abandoned: Work that has been discontinued\n- Notes: Initial collections of thoughts and references\n- Draft: Early structured version with a central thesis\n- In Progress: Well-developed work actively being refined\n- Finished: Completed work with no planned major changes\n\nThis helps readers understand the maturity and completeness of the content.';

var CERTAINTY_EXPLANATION = 'The confidence tag expresses how well-supported the content is, or how likely its overall ideas are right. This uses a scale from "impossible" to "certain", based on the Kesselman List of Estimative Words:\n\n1. "certain"\n2. "highly likely"\n3. "likely"\n4. "possible"\n5. "unlikely"\n6. "highly unlikely"\n7. "remote"\n8. "impossible"\n\nEven ideas that seem unlikely may be worth exploring if their potential impact is significant enough.';

var IMPORTANCE_EXPLANATION = 'The importance rating distinguishes between trivial topics and those which might change your life. Using a scale from 0-10, content is ranked based on its potential impact on:\n\n- the reader\n- the intended audience\n- the world at large\n\nFor example, topics about fundamental research or transformative technologies would rank 9-10, while personal reflections or minor experiments might rank 0-1.';

function metaColor(type, value) {
  if (type === 'status') {
    if (['Finished','Published','Active'].includes(value)) return 'meta-high';
    if (['In Progress','Draft'].includes(value)) return 'meta-mid';
    return 'meta-low';
  }
  if (type === 'certainty') {
    if (['certain','highly likely'].includes(value)) return 'meta-high';
    if (['likely','possible'].includes(value)) return 'meta-mid';
    return 'meta-low';
  }
  if (type === 'importance') {
    var n = parseInt(value, 10);
    if (n >= 7) return 'meta-high';
    if (n >= 4) return 'meta-mid';
    return 'meta-low';
  }
  return 'meta-mid';
}

function notebookHtml(slug, title, formattedCreated, formattedUpdated, renderedBody, description, status, certainty, importance, theme) {
  const canonicalUrl = `https://krisyotam.com/notebooks/${slug}`;
  const desc = description || `${title} — notebook by Kris Yotam`;
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeXml(desc)}">
  <meta name="author" content="Kris Yotam">
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:title" content="${escapeXml(title)}">
  <meta property="og:description" content="${escapeXml(desc)}">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="article">
  <meta property="og:site_name" content="Kris's Notebooks">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${escapeXml(title)}">
  <meta name="twitter:description" content="${escapeXml(desc)}">
  <link href="/notebooks/style.css" rel="stylesheet">${theme ? `\n  <link href="/notebooks/themes/${theme}.css" rel="stylesheet">` : ''}
  <title>${title} — Kris's Notebooks</title>
${mathjaxBlock()}
</head>
<body>

<div class="nb-wrapper">
<a href="/notebooks/" class="nb-back">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  Return to Notebooks
</a>

<div class="nb-header">
  <h1 class="nb-header-title">${title}</h1>
  ${desc !== `${title} — notebook by Kris Yotam` ? `<p class="nb-header-desc">${escapeXml(description)}</p>` : ''}
  <div class="nb-header-dates">
    <span>start: ${formattedCreated}</span>
    <span class="sep">&middot;</span>
    <span>end: ${formattedUpdated}</span>
  </div>
  <div class="nb-meta">
    <span class="nb-meta-item ${metaColor('status', status)}">
      ${infoSvg}
      <span>status: ${status}</span>
      <span class="nb-popover"><h4>Status Indicator</h4><p>${escapeXml(STATUS_EXPLANATION)}</p></span>
    </span>
    <span class="dot">&middot;</span>
    <span class="nb-meta-item ${metaColor('certainty', certainty)}">
      ${infoSvg}
      <span>certainty: ${certainty}</span>
      <span class="nb-popover"><h4>Confidence Rating</h4><p>${escapeXml(CERTAINTY_EXPLANATION)}</p></span>
    </span>
    <span class="dot">&middot;</span>
    <span class="nb-meta-item ${metaColor('importance', importance)}">
      ${infoSvg}
      <span>importance: ${importance}/10</span>
      <span class="nb-popover"><h4>Importance Rating</h4><p>${escapeXml(IMPORTANCE_EXPLANATION)}</p></span>
    </span>
  </div>
  <hr class="nb-header-rule">
</div>
<div class="nb-outer-rule"></div>
</div>

<div class="text">
<div class="left">
  ${renderedBody}
</div>
</div>

<div class="text">
<div class="left">
  <hr>
  <p style="display:flex;justify-content:space-between">
    <a href="/notebooks/${slug}">permanent link</a>
    <cite><a href="/notebooks/">Notebooks</a></cite>
    <a href="/notebooks/${slug}.rss">RSS feed</a>
  </p>
</div>
</div>

</body>
</html>`;
}

function pageHtml(slug, title, formattedCreated, formattedUpdated, renderedBody, description, status, certainty, importance) {
  const desc = description || '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="/notebooks/style.css" rel="stylesheet">
  <title>${title}</title>
${mathjaxBlock()}
</head>
<body>

<div class="nb-wrapper">
<a href="/notebooks/" class="nb-back">
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
  Return to Notebooks
</a>

<div class="nb-header">
  <h1 class="nb-header-title">${title}</h1>
  ${desc ? `<p class="nb-header-desc">${escapeXml(desc)}</p>` : ''}
  <div class="nb-header-dates">
    <span>start: ${formattedCreated}</span>
    <span class="sep">&middot;</span>
    <span>end: ${formattedUpdated}</span>
  </div>
  <div class="nb-meta">
    <span class="nb-meta-item ${metaColor('status', status)}">
      ${infoSvg}
      <span>status: ${status}</span>
      <span class="nb-popover"><h4>Status Indicator</h4><p>${escapeXml(STATUS_EXPLANATION)}</p></span>
    </span>
    <span class="dot">&middot;</span>
    <span class="nb-meta-item ${metaColor('certainty', certainty)}">
      ${infoSvg}
      <span>certainty: ${certainty}</span>
      <span class="nb-popover"><h4>Confidence Rating</h4><p>${escapeXml(CERTAINTY_EXPLANATION)}</p></span>
    </span>
    <span class="dot">&middot;</span>
    <span class="nb-meta-item ${metaColor('importance', importance)}">
      ${infoSvg}
      <span>importance: ${importance}/10</span>
      <span class="nb-popover"><h4>Importance Rating</h4><p>${escapeXml(IMPORTANCE_EXPLANATION)}</p></span>
    </span>
  </div>
  <hr class="nb-header-rule">
</div>
<div class="nb-outer-rule"></div>
</div>

<div class="text">
<div class="left">
  ${renderedBody}
</div>
</div>

<div class="text">
<div class="left">
  <hr>
  <p style="display:flex;justify-content:space-between">
    <a href="/notebooks/${slug}">permanent link</a>
    <cite><a href="/notebooks/">Notebooks</a></cite>
  </p>
</div>
</div>

</body>
</html>`;
}

function notebookRss(slug, title, formattedUpdated, renderedBody, updatedDate) {
  const link = `${config.baseUrl}/${slug}`;
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
    ? `<p>I have compiled a list of <a href="/notebooks/faq" target="_blank">frequently asked questions (FAQ)</a>, and their answers. The questions, and by extension their answers, pertain only to the notebooks and not my larger body of work.</p>\n\n`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="Kris Yotam's notebooks — abstracts, questions, reading lists, and notes on topics of interest.">
  <meta name="author" content="Kris Yotam">
  <link rel="canonical" href="https://krisyotam.com/notebooks/">
  <meta property="og:title" content="${config.title}">
  <meta property="og:description" content="Kris Yotam's notebooks — abstracts, questions, reading lists, and notes on topics of interest.">
  <meta property="og:url" content="https://krisyotam.com/notebooks/">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Kris's Notebooks">
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${config.title}">
  <meta name="twitter:description" content="Kris Yotam's notebooks — abstracts, questions, reading lists, and notes on topics of interest.">
  <link href="style.css" rel="stylesheet">
  <title>${config.title}</title>
</head>
<body>

<div class="text">
<div class="left">

<h1 class="nb-index-title">${config.title}</h1>

<blockquote><center><em>These are my fancies, by which
	<br>I endeavor not to make things known
	<br>but myself.</em></center></blockquote>

<blockquote><em>&para; And I turned my selfe to behold wisedome, and madnesse and folly: for what can the man doe, that commeth after the king? euen that which hath bene already done. Then I saw that wisedome excelleth folly, as farre as light excelleth darkenesse. The wise mans eyes are in his head, but the foole walketh in darknes: and I my selfe perceiued also that one euent happeneth to them all. Then said I in my heart, As it happeneth to the foole, so it happeneth euen to me, and why was I then more wise? then I said in my heart, That this also is vanitie.</em>
	<div style="text-align:right">&mdash;Solomon, <cite>Ecclesiastes</cite> 2:12&ndash;15 (1611, KJV)</div></blockquote>

<p>These are the notebooks &mdash; more accurately, a slow porting of my previous OneNote notebooks, titled the Libers (Book of Records), where I left abstracts, questions, comments, and links to notes on the topics at hand. This carries on that spirit. If you have answers to any unanswered questions, and reasonable sources for the substantiation of them, feel free to <a href="https://krisyotam.com/contact" target="_blank">write</a>.</p>

${faqLine}<p>&mdash; <a href="https://krisyotam.com/home">Kris</a></p>

<center><a href="/notebooks/feed.rss" target="_blank">rss</a> &nbsp; <a href="/notebooks/ideas" target="_blank">ideas</a> &nbsp; <a href="/notebooks/questions" target="_blank">questions</a> &nbsp; <a href="/notebooks/colophon" target="_blank">colophon</a> &nbsp; <a href="https://krisyotam.com/contact" target="_blank">contact</a></center>

</div>
</div>

${notebookEntries}

</body>
</html>`;
}

function masterRss(notebooks) {
  const items = notebooks.map(n => {
    const link = `${config.baseUrl}/${n.slug}`;
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
    <link>${config.baseUrl}</link>
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

// Copy theme CSS files to build/themes/
const themesDir = 'themes';
const buildThemesDir = path.join(buildDir, 'themes');
if (fs.existsSync(themesDir)) {
  fs.mkdirSync(buildThemesDir, { recursive: true });
  for (const tf of fs.readdirSync(themesDir).filter(f => f.endsWith('.css'))) {
    fs.copyFileSync(path.join(themesDir, tf), path.join(buildThemesDir, tf));
    console.log(`  build/themes/${tf}`);
  }
}

const files = fs.readdirSync(srcNotebooksDir).filter(f => f.endsWith('.md'));

const notebooks = files.map(file => {
  const slug = file.replace(/\.md$/, '');
  const raw = fs.readFileSync(path.join(srcNotebooksDir, file), 'utf8');
  const { data, content } = matter(raw, matterOpts);
  const renderedBody = renderMarkdown(content);
  return {
    slug,
    title: data.title || slug,
    description: data.description || '',
    created: data.created,
    updated: data.updated,
    status: data.status || 'Draft',
    certainty: data.certainty || 'possible',
    importance: parseInt(data.importance, 10) || 5,
    favorite: data.favorite === 'true' || data.favorite === true,
    theme: data.theme || '',
    renderedBody,
  };
});

// Parse custom date format (e.g. "2026-04-05T04:01pm") into a comparable Date
function parseNotebookDate(d) {
  const s = String(d);
  const m = s.match(/(\d{4})-(\d{2})-(\d{2})(?:T(\d{1,2}):(\d{2})(am|pm)?)?/i);
  if (!m) return new Date(0);
  let [, year, mon, day, hrs = '0', min = '00', ampm] = m;
  let h = parseInt(hrs, 10);
  if (ampm) {
    ampm = ampm.toLowerCase();
    if (ampm === 'am' && h === 12) h = 0;
    else if (ampm === 'pm' && h !== 12) h += 12;
  }
  return new Date(year, mon - 1, day, h, parseInt(min, 10));
}

// Sort by updated date, most recent first
notebooks.sort((a, b) => parseNotebookDate(b.updated) - parseNotebookDate(a.updated));

// Write per-notebook files to build/notebooks/
for (const nb of notebooks) {
  const formattedCreated = formatDate(nb.created);
  const formattedUpdated = formatDate(nb.updated);

  const html = notebookHtml(nb.slug, nb.title, formattedCreated, formattedUpdated, nb.renderedBody, nb.description, nb.status, nb.certainty, nb.importance, nb.theme);
  fs.writeFileSync(path.join(buildNotebooksDir, `${nb.slug}.html`), html);

  const rss = notebookRss(nb.slug, nb.title, formattedUpdated, nb.renderedBody, nb.updated);
  fs.writeFileSync(path.join(buildNotebooksDir, `${nb.slug}.rss`), rss);

  console.log(`  build/notebooks/${nb.slug}.html  build/notebooks/${nb.slug}.rss`);
}

// Write index to repo root
const notebookEntries = notebooks.map(nb => {
  const formattedUpdated = formatDate(nb.updated);
  return `<div class="listing"><div class="left"><dl><dt><a href="/notebooks/${nb.slug}" target="_blank">${nb.title}</a> <i>(${formattedUpdated})</i></dt></dl></div></div>`;
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
  const { data, content } = matter(raw, matterOpts);
  const renderedBody = renderMarkdown(content);
  const formattedCreated = formatDate(data.created);
  const formattedUpdated = formatDate(data.updated);
  const html = pageHtml('faq', data.title || 'FAQ', formattedCreated, formattedUpdated, renderedBody, data.description || '', data.status || 'Draft', data.certainty || 'possible', parseInt(data.importance, 10) || 5);
  fs.writeFileSync(path.join(buildDir, 'faq.html'), html);
  console.log('  build/faq.html');
}

// Write colophon if present
const hasColophon = fs.existsSync(path.join(srcDir, 'colophon.md'));
if (hasColophon) {
  const raw = fs.readFileSync(path.join(srcDir, 'colophon.md'), 'utf8');
  const { data, content } = matter(raw, matterOpts);
  const renderedBody = renderMarkdown(content);
  const formattedCreated = formatDate(data.created);
  const formattedUpdated = formatDate(data.updated);
  const html = pageHtml('colophon', data.title || 'Colophon', formattedCreated, formattedUpdated, renderedBody, data.description || '', data.status || 'Draft', data.certainty || 'possible', parseInt(data.importance, 10) || 5);
  fs.writeFileSync(path.join(buildDir, 'colophon.html'), html);
  console.log('  build/colophon.html');
}

console.log('Done.');
