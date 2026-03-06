document.addEventListener('DOMContentLoaded', () => {

    const body          = document.body;
    const themeToggle   = document.getElementById('theme-toggle');
    const contactModal  = document.getElementById('contact-modal');
    const openModalBtn  = document.getElementById('open-contact-modal');
    const closeBtn      = document.querySelector('.close-button');
    const mobileToggle  = document.querySelector('.mobile-menu-toggle');
    const mainNav       = document.getElementById('main-nav');
    const navLinks      = document.querySelectorAll('nav ul li a');
    const contactForm   = document.getElementById('contact-form');
    const formMessage   = document.getElementById('form-message');
    const header        = document.querySelector('header');
    const catalogueGrid = document.getElementById('catalogue-grid');


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


    // ─── Smooth Scroll ───────────────────────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') return;
            const target = document.querySelector(id);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth' });
                history.pushState(null, null, id);
            }
        });
    });


    // ─── Modal ───────────────────────────────────────────────────────────────
    function openModal()  { contactModal.classList.add('active');    body.style.overflow = 'hidden'; }
    function closeModal() { contactModal.classList.remove('active'); body.style.overflow = ''; }

    if (openModalBtn) openModalBtn.addEventListener('click', openModal);
    if (closeBtn)     closeBtn.addEventListener('click', closeModal);
    window.addEventListener('click', e => { if (e.target === contactModal) closeModal(); });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && contactModal.classList.contains('active')) closeModal();
    });


    // ─── Contact Form ────────────────────────────────────────────────────────
    if (contactForm && formMessage) {
        contactForm.addEventListener('submit', () => {
            formMessage.textContent = 'Sending your message…';
            formMessage.className = 'success';
            formMessage.classList.remove('hidden');
        });
    }


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


    // ─── Header Shadow ───────────────────────────────────────────────────────
    window.addEventListener('scroll', () => {
        header.style.boxShadow = window.scrollY > 20 ? '0 4px 30px rgba(0,0,0,0.3)' : 'none';
    }, { passive: true });


    // ─── Reveal ──────────────────────────────────────────────────────────────
    // Checks every .reveal and .product-card on scroll and after catalogue loads.
    // Uses getBoundingClientRect — no IntersectionObserver, no thresholds, no rootMargin.
    function reveal() {
        const vh = window.innerHeight;
        document.querySelectorAll('.reveal, .product-card').forEach(el => {
            if (el.classList.contains('visible')) return;
            if (el.getBoundingClientRect().top < vh) {
                const delay = parseInt(el.dataset.revealDelay || 0);
                if (delay > 0) {
                    setTimeout(() => el.classList.add('visible'), delay);
                } else {
                    el.classList.add('visible');
                }
            }
        });
    }

    window.addEventListener('scroll', reveal, { passive: true });
    reveal(); // run immediately on load


    // ─── Product Cards ───────────────────────────────────────────────────────
    const CATEGORY_ICONS = {
        'authentication':     'fa-solid fa-shield-halved',
        'content management': 'fa-solid fa-newspaper',
        'data management':    'fa-solid fa-hard-drive',
        'messaging':          'fa-solid fa-comments',
        'commerce':           'fa-solid fa-bag-shopping',
        'default':            'fa-solid fa-cube',
    };

    function getStyleClass(type) {
        if (!type) return 'style-other';
        const t = type.toLowerCase();
        if (t.includes('system'))   return 'style-system';
        if (t.includes('platform')) return 'style-platform';
        return 'style-other';
    }

    function buildCard(product, index) {
        const pricing    = product.pricing || 'paid';
        const isFree     = pricing === 'free';
        const tagClass   = isFree ? 'free' : 'paid';
        const tagIcon    = isFree ? '<i class="fa-solid fa-unlock"></i>' : '<i class="fa-solid fa-lock"></i>';
        const tagLabel   = isFree ? 'Free' : 'Paid';
        const category   = (product.category || '').toLowerCase();
        const iconClass  = CATEGORY_ICONS[category] || CATEGORY_ICONS['default'];
        const styleClass = getStyleClass(product.type);
        const typeLabel  = product.type || 'Digital Solution';
        const desc       = (product.description || '').trim();
        const href = `/software/?key=${product.key}`;

        return `<div class="product-card" data-reveal-delay="${index * 80}">
            <div class="card-top">
                <div class="card-icon ${styleClass}"><i class="${iconClass}"></i></div>
                <span class="tag ${tagClass}">${tagIcon} ${tagLabel}</span>
            </div>
            <span class="card-type-label">${typeLabel}</span>
            <h4>${product.name}</h4>
            <p>${desc}</p>
            <div class="card-footer">
                <a href="${href}" class="button secondary">View Details <i class="fa-solid fa-arrow-right"></i></a>
            </div>
        </div>`;
    }

    async function renderCatalogue() {
        if (!catalogueGrid) return;

        const entries = [...catalogueGrid.querySelectorAll('[data-product-id]')].map(el =>
            parseInt(el.dataset.productId, 10)
        );

        if (!entries.length) return;

        catalogueGrid.innerHTML = `
            <div class="catalogue-loading" style="grid-column:1/-1">
                <i class="fa-solid fa-circle-notch"></i>
                <span>Loading solutions...</span>
            </div>`;

        try {
            const res = await fetch(catalogueGrid.dataset.source || './data/data.json');
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const all = await res.json();

            const html = entries.map((id, i) => {
                const p = all.find(p => p.id === id);
                return p ? buildCard(p, i) : '';
            }).join('');

            if (!html.trim()) throw new Error('No products found.');

            catalogueGrid.innerHTML = html;

            // After cards are in the DOM, run reveal
            requestAnimationFrame(() => {
                requestAnimationFrame(reveal);
            });

        } catch (err) {
            catalogueGrid.innerHTML = `
                <div class="catalogue-error" style="grid-column:1/-1">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>Could not load the software catalogue.</p>
                    <p style="font-size:0.8em;margin-top:8px;opacity:0.6">${err.message}</p>
                </div>`;
        }
    }

    renderCatalogue();

});
