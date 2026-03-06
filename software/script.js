document.addEventListener('DOMContentLoaded', () => {

    const body         = document.body;
    const themeToggle  = document.getElementById('theme-toggle');
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mainNav      = document.getElementById('main-nav');
    const navLinks     = document.querySelectorAll('nav ul li a');
    const header       = document.querySelector('header');
    const main         = document.getElementById('main-content');

    const DATA_URL = '/data/data.json';

    // ─── Theme ───────────────────────────────────────────────────────────────
    function applyTheme(theme) {
        body.setAttribute('data-theme', theme);
        const icon = themeToggle.querySelector('i');
        if (icon) icon.className = theme === 'dark' ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        localStorage.setItem('vetrom-theme', theme);
    }

    applyTheme(localStorage.getItem('vetrom-theme') || 'dark');
    themeToggle.addEventListener('click', () => {
        applyTheme(body.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
    });


    // ─── Mobile Menu ─────────────────────────────────────────────────────────
    if (mobileToggle && mainNav) {
        mobileToggle.addEventListener('click', () => {
            const open = mainNav.classList.toggle('mobile-open');
            mobileToggle.querySelector('i').className = open ? 'fa-solid fa-xmark' : 'fa-solid fa-bars';
        });
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('mobile-open');
                mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
            });
        });
    }


    // ─── Header shadow ───────────────────────────────────────────────────────
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 20 ? '0 4px 30px rgba(0,0,0,0.3)' : 'none';
    }, { passive: true });


    // ─── Reveal ──────────────────────────────────────────────────────────────
    function reveal() {
        const vh = window.innerHeight;
        document.querySelectorAll('.reveal:not(.visible), .product-card:not(.visible)').forEach(el => {
            if (el.getBoundingClientRect().top < vh) {
                const delay = parseInt(el.dataset.revealDelay || 0);
                delay
                    ? setTimeout(() => el.classList.add('visible'), delay)
                    : el.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', reveal, { passive: true });


    // ─── Helpers ─────────────────────────────────────────────────────────────
    const CATEGORY_ICONS = {
        'authentication':     'fa-solid fa-shield-halved',
        'content management': 'fa-solid fa-newspaper',
        'data management':    'fa-solid fa-hard-drive',
        'messaging':          'fa-solid fa-comments',
        'commerce':           'fa-solid fa-bag-shopping',
        'default':            'fa-solid fa-cube',
    };

    function getIcon(category) {
        return CATEGORY_ICONS[(category || '').toLowerCase()] || CATEGORY_ICONS['default'];
    }

    function getStyleClass(type) {
        if (!type) return 'style-other';
        const t = type.toLowerCase();
        if (t.includes('system'))   return 'style-system';
        if (t.includes('platform')) return 'style-platform';
        return 'style-other';
    }

    function tagHTML(pricing) {
        const free = pricing === 'free';
        const cls  = free ? 'free' : 'paid';
        const icon = free ? 'fa-solid fa-unlock' : 'fa-solid fa-lock';
        const lbl  = free ? 'Free' : 'Paid';
        return `<span class="tag ${cls}"><i class="${icon}"></i> ${lbl}</span>`;
    }

    function stackHTML(stack) {
        if (!stack || !stack.length) return '';
        return `<div class="card-stack">${stack.map(s => `<span class="stack-tag">${s}</span>`).join('')}</div>`;
    }


    // ─── Get key from URL ────────────────────────────────────────────────────
    // Supports both /software/tool-key (via .htaccess rewrite → ?key=tool-key)
    // and /software/?key=tool-key directly
    function getKey() {
        // 1. Query string (direct access or fallback)
        const params = new URLSearchParams(window.location.search);
        if (params.get('key')) return params.get('key');

        // 2. Pretty URL — /software/<key>
        const match = window.location.pathname.match(/^\/software\/([a-z0-9-]+)\/?$/);
        return match ? match[1] : null;
    }


    // ─── Fetch data ──────────────────────────────────────────────────────────
    async function fetchData() {
        const res = await fetch(DATA_URL);
        if (!res.ok) throw new Error(`Failed to load data (HTTP ${res.status})`);
        return res.json();
    }


    // ─── CATALOGUE VIEW ──────────────────────────────────────────────────────
    function buildCatalogueCard(product, index) {
        const href = `/software/?key=${product.key}`;
        return `
        <div class="product-card" data-reveal-delay="${index * 70}" onclick="window.location='${href}'">
            <div class="card-top">
                <div class="card-icon ${getStyleClass(product.type)}">
                    <i class="${getIcon(product.category)}"></i>
                </div>
                ${tagHTML(product.pricing)}
            </div>
            <span class="card-type-label">${product.type || 'Digital Solution'}</span>
            <h4>${product.name}</h4>
            <p>${product.description}</p>
            ${stackHTML(product.stack)}
            <div class="card-footer">
                <a href="${href}" class="button secondary">View Details <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        </div>`;
    }

    function buildCategoryFilter(products) {
        const types = ['All', ...new Set(products.map(p => p.type))];
        return types.map(t =>
            `<button class="filter-btn${t === 'All' ? ' active' : ''}" data-filter="${t}">${t}</button>`
        ).join('');
    }

    async function renderCatalogue() {
        main.innerHTML = `
        <section class="page-header">
            <div class="container page-header-inner reveal">
                <div class="breadcrumb">
                    <a href="/">VetroM</a>
                    <i class="fa-solid fa-chevron-right"></i>
                    <span>Software</span>
                </div>
                <div class="section-tag">Full Catalogue</div>
                <h1 class="section-title">All Software</h1>
                <p class="section-desc">Every system and platform built by VetroM — self-hosted, no subscriptions, no bloat.</p>
            </div>
        </section>

        <section class="container">
            <div class="filter-bar reveal" id="filter-bar">
                <div class="state-loading" style="grid-column:1/-1">
                    <i class="fa-solid fa-circle-notch"></i>
                </div>
            </div>
            <div class="catalogue-grid" id="catalogue-grid">
                <div class="state-loading">
                    <i class="fa-solid fa-circle-notch"></i>
                    <span>Loading software...</span>
                </div>
            </div>
        </section>`;

        try {
            const products = await fetchData();
            const grid     = document.getElementById('catalogue-grid');
            const filterBar = document.getElementById('filter-bar');

            // Render filter buttons
            filterBar.innerHTML = buildCategoryFilter(products);

            // Render all cards
            grid.innerHTML = products.map((p, i) => buildCatalogueCard(p, i)).join('');

            // Filter logic
            filterBar.addEventListener('click', e => {
                const btn = e.target.closest('.filter-btn');
                if (!btn) return;

                filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                grid.querySelectorAll('.product-card').forEach(card => {
                    const type = card.querySelector('.card-type-label')?.textContent || '';
                    const show = filter === 'All' || type === filter;
                    card.style.display = show ? '' : 'none';
                });
            });

            requestAnimationFrame(() => requestAnimationFrame(reveal));

        } catch (err) {
            document.getElementById('catalogue-grid').innerHTML = `
                <div class="state-error">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>Could not load software catalogue.</p>
                    <p style="font-size:0.8em;opacity:0.6">${err.message}</p>
                </div>`;
        }
    }


    // ─── DETAIL VIEW ─────────────────────────────────────────────────────────
    function buildDetailView(p) {
        const isFree   = p.pricing === 'free';
        const tagCls   = isFree ? 'free' : 'paid';
        const tagIcon  = isFree ? 'fa-solid fa-unlock' : 'fa-solid fa-lock';
        const tagLabel = isFree ? 'Free' : 'Paid';

        const imageHTML = p.image
            ? `<img src="${p.image.replace(/^\.\.\//, '/')}" alt="${p.name}" class="detail-image" onerror="this.style.display='none'">`
            : `<div class="detail-image-placeholder"><i class="${getIcon(p.category)}"></i></div>`;

        const features = (p.features || []).map(f =>
            `<li><i class="fa-solid fa-check"></i>${f}</li>`
        ).join('');

        const stack = (p.stack || []).map(s =>
            `<span class="stack-tag">${s}</span>`
        ).join('');

        return `
        <section class="page-header">
            <div class="container page-header-inner reveal">
                <div class="breadcrumb">
                    <a href="/">VetroM</a>
                    <i class="fa-solid fa-chevron-right"></i>
                    <a href="/software">Software</a>
                    <i class="fa-solid fa-chevron-right"></i>
                    <span>${p.name}</span>
                </div>
                <div class="section-tag">${p.type || 'Digital Solution'}</div>
                <h1 class="section-title">${p.name}</h1>
            </div>
        </section>

        <section class="container detail-page">
            <div class="detail-layout">

                <div class="detail-main reveal">
                    ${imageHTML}
                    <p class="detail-description">${p.description}</p>
                    <div class="detail-features">
                        <h3>Features</h3>
                        <ul class="feature-list">${features}</ul>
                    </div>
                </div>

                <aside class="detail-sidebar reveal" data-reveal-delay="100">
                    <div class="sidebar-card">
                        <h4>Details</h4>
                        <div class="sidebar-meta">
                            <div class="meta-row">
                                <span class="meta-label">Pricing</span>
                                <span class="tag ${tagCls}"><i class="${tagIcon}"></i> ${tagLabel}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Type</span>
                                <span class="meta-value">${p.type || '—'}</span>
                            </div>
                            <div class="meta-row">
                                <span class="meta-label">Category</span>
                                <span class="meta-value">${p.category || '—'}</span>
                            </div>
                        </div>
                    </div>

                    <div class="sidebar-card">
                        <h4>Stack</h4>
                        <div class="sidebar-stack">${stack}</div>
                    </div>

                    <div class="sidebar-card sidebar-actions">
                        <a href="/#contact" class="button primary">
                            <i class="fa-solid fa-paper-plane"></i> Get This
                        </a>
                        <a href="/software" class="button ghost">
                            <i class="fa-solid fa-arrow-left"></i> Back to Catalogue
                        </a>
                    </div>
                </aside>

            </div>
        </section>`;
    }

    async function renderDetail(key) {
        main.innerHTML = `
        <div class="container" style="padding-top:80px;padding-bottom:80px">
            <div class="state-loading">
                <i class="fa-solid fa-circle-notch"></i>
                <span>Loading...</span>
            </div>
        </div>`;

        try {
            const products = await fetchData();
            const product  = products.find(p => p.key === key);

            if (!product) {
                main.innerHTML = `
                <div class="container" style="padding-top:80px;padding-bottom:80px;text-align:center">
                    <div class="state-error">
                        <i class="fa-solid fa-triangle-exclamation"></i>
                        <p>No product found for <strong>${key}</strong>.</p>
                        <br>
                        <a href="/software" class="button secondary">Back to Catalogue</a>
                    </div>
                </div>`;
                return;
            }

            // Update page title
            document.title = `${product.name} — VetroM`;

            main.innerHTML = buildDetailView(product);
            requestAnimationFrame(() => requestAnimationFrame(reveal));

        } catch (err) {
            main.innerHTML = `
            <div class="container" style="padding-top:80px;padding-bottom:80px;text-align:center">
                <div class="state-error">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>Failed to load product.</p>
                    <p style="font-size:0.8em;opacity:0.6">${err.message}</p>
                </div>
            </div>`;
        }
    }


    // ─── Router ──────────────────────────────────────────────────────────────
    const key = getKey();
    if (key) {
        renderDetail(key);
    } else {
        renderCatalogue();
    }

});
