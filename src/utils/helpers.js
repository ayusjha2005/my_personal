const { marked } = require('marked');
const hljs = require('highlight.js');
const sanitizeHtml = require('sanitize-html');

// Configure marked with highlight.js
marked.setOptions({
  highlight: function (code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return hljs.highlight(code, { language: lang }).value;
      } catch (e) {}
    }
    return hljs.highlightAuto(code).value;
  },
  breaks: true,
  gfm: true,
});

/**
 * Format date like "Oct 13, 2026"
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Calculate reading time in minutes
 */
function calculateReadTime(textOrHtml) {
  if (!textOrHtml) return 1;
  const clean = textOrHtml.replace(/<[^>]+>/g, ' ');
  const words = clean.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/**
 * Render Markdown or safe HTML into styled HTML with code blocks
 */
function renderContent(rawContent) {
  if (!rawContent) return '';
  // Convert markdown to HTML
  const parsedHtml = marked.parse(rawContent);

  // Sanitize HTML while allowing code highlighting classes and pre/code tags
  const cleanHtml = sanitizeHtml(parsedHtml, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'span', 'pre', 'code', 'div', 'button', 'svg', 'path'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'id', 'style', 'data-*', 'aria-*'],
      img: ['src', 'alt', 'title', 'loading', 'width', 'height'],
      a: ['href', 'name', 'target', 'rel'],
    },
    allowedSchemes: ['http', 'https', 'mailto', 'data'],
  });

  // Enhance codeblocks with wrapping div and copy bar
  return cleanHtml.replace(/<pre><code class="language-([a-zA-Z0-9_-]+)">([\s\S]*?)<\/code><\/pre>/gi, (match, lang, code) => {
    return `
      <div class="codeblock" data-lang="${lang}">
        <pre><code class="language-${lang}">${code}</code></pre>
      </div>
    `;
  }).replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (match, code) => {
    return `
      <div class="codeblock" data-lang="code">
        <pre><code>${code}</code></pre>
      </div>
    `;
  });
}

/**
 * Extract Table of Contents from HTML
 */
function extractToc(html) {
  if (!html) return [];
  const toc = [];
  const headingRegex = /<h2[^>]*id=["']([^"']*)["'][^>]*>(.*?)<\/h2>|<h2[^>]*>(.*?)<\/h2>/gi;
  let match;
  let index = 0;

  while ((match = headingRegex.exec(html)) !== null) {
    const rawText = match[2] || match[3] || '';
    const cleanText = rawText.replace(/<[^>]+>/g, '').trim();
    const id = match[1] || `sec-${index}`;
    toc.push({ id, text: cleanText });
    index++;
  }

  return toc;
}

module.exports = {
  formatDate,
  calculateReadTime,
  renderContent,
  extractToc,
};
