const DATA_URL = './data/newsletters.json';
const ITEMS_PER_PAGE = 9;
let currentPage = 1;
let currentFilteredNewsletters = [];

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

    setDynamicGreeting();

    let newsletters = await fetchNewsletters();

    // Sort newsletters by date (newest first)
    newsletters.sort((a, b) => new Date(b.date) - new Date(a.date));

    window.allNewsletters = newsletters; // Store for search
    currentFilteredNewsletters = newsletters;
    renderPage(1);
}

function setDynamicGreeting() {
    const greetingElement = document.getElementById('greeting');
    if (!greetingElement) return;

    const hour = new Date().getHours();
    let greeting = 'Hello, Engineer.';

    if (hour < 12) greeting = 'Good Morning, Engineer.';
    else if (hour < 18) greeting = 'Good Afternoon, Engineer.';
    else greeting = 'Good Evening, Engineer.';

    greetingElement.innerText = greeting;
}

function renderPage(page, shouldScroll = false) {
    currentPage = page;
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    const items = currentFilteredNewsletters.slice(start, end);

    renderList(items);
    renderPaginationControls();

    // Scroll to top of page on page change
    if (shouldScroll) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function renderList(items) {
    const list = document.getElementById('newsletter-list');
    list.innerHTML = items.map((item, index) => `
        <div class="card" style="animation-delay: ${index * 0.05}s">
            <div class="meta">${item.date}</div>
            <h2><a href="newsletter.html?id=${item.id}">${item.title}</a></h2>
            <p>${item.summary}</p>
            <div class="tags">${item.tags.map(tag => `<span>${tag}</span>`).join('')}</div>
        </div>
    `).join('');
}

function renderPaginationControls() {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    const totalPages = Math.ceil(currentFilteredNewsletters.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = '';

    // Previous Button
    html += `<button class="page-btn" onclick="renderPage(${currentPage - 1}, true)" ${currentPage === 1 ? 'disabled' : ''}>&larr; Prev</button>`;

    // Page Numbers
    for (let i = 1; i <= totalPages; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="renderPage(${i}, true)">${i}</button>`;
    }

    // Next Button
    html += `<button class="page-btn" onclick="renderPage(${currentPage + 1}, true)" ${currentPage === totalPages ? 'disabled' : ''}>Next &rarr;</button>`;

    pagination.innerHTML = html;
}

// Search Function
function filterNewsletters() {
    const query = document.getElementById('searchBar').value.toLowerCase();
    currentFilteredNewsletters = window.allNewsletters.filter(item =>
        item.title.toLowerCase().includes(query) ||
        item.summary.toLowerCase().includes(query)
    );
    renderPage(1); // Reset to first page on search
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
        // Update article header/content if elements exist (for article page)
        const headerEl = document.getElementById('article-header');
        const contentEl = document.getElementById('article-content');

        if (headerEl) {
            headerEl.innerHTML = `
                <h1>${article.title}</h1>
                <p class="meta">Published on ${article.date}</p>
            `;
        }
        if (contentEl) {
            contentEl.innerHTML = article.content_html;
            generateTOC();
        }
    } else {
        const contentEl = document.getElementById('article-content');
        if (contentEl) contentEl.innerHTML = "<p>Newsletter not found.</p>";
    }
}

// Generate Table of Contents
function generateTOC() {
    const content = document.getElementById('article-content');
    if (!content) return;

    const headings = content.querySelectorAll('h2, h3');
    const toc = document.getElementById('table-of-contents');

    if (!toc) return;

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
} else {
    loadNewsletter();
}