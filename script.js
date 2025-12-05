const DATA_URL = './data/newsletters.json';

// Fetch Data
async function fetchNewsletters() {
    const response = await fetch(DATA_URL);
    const data = await response.json();
    return data.newsletters;
}

// Render Index Page
async function initIndex() {
    const list = document.getElementById('newsletter-list');
    if (!list) return;

    const newsletters = await fetchNewsletters();
    window.allNewsletters = newsletters; // Store for search
    renderList(newsletters);
}

function renderList(items) {
    const list = document.getElementById('newsletter-list');
    list.innerHTML = items.map(item => `
        <div class="card">
            <div class="meta">${item.date}</div>
            <h2><a href="newsletter.html?id=${item.id}">${item.title}</a></h2>
            <p>${item.summary}</p>
            <div class="tags">${item.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
        </div>
    `).join('');
}

// Search Function
function filterNewsletters() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    const filtered = window.allNewsletters.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query)
    );
    renderList(filtered);
}

// Render Article Page
async function loadNewsletter() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    const newsletters = await fetchNewsletters();
    const article = newsletters.find(n => n.id === id);

    if (article) {
        document.title = article.title;
        document.getElementById('article-header').innerHTML = `
            <h1>${article.title}</h1>
            <p class="meta">Published on ${article.date}</p>
        `;
        document.getElementById('article-content').innerHTML = article.content_html;
        generateTOC();
    } else {
        document.getElementById('article-content').innerHTML = "<p>Newsletter not found.</p>";
    }
}

// Generate Table of Contents
function generateTOC() {
    const content = document.getElementById('article-content');
    const headings = content.querySelectorAll('h2, h3');
    const toc = document.getElementById('table-of-contents');

    if (headings.length === 0) {
        toc.style.display = 'none';
        return;
    }

    let html = '<strong>Table of Contents</strong><ul>';
    headings.forEach((h, index) => {
        h.id = `section-${index}`;
        html += `<li><a href="#section-${index}">${h.innerText}</a></li>`;
    });
    html += '</ul>';
    toc.innerHTML = html;
}

// Initialize based on page
if (document.getElementById('newsletter-list')) {
    initIndex();
}