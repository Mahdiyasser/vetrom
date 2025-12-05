document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const contactModal = document.getElementById('contact-modal');
    const openModalButton = document.getElementById('open-contact-modal');
    const closeButton = document.querySelector('.close-button');


    // --- Theme Toggle Logic ---
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        body.setAttribute('data-theme', newTheme);
        themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        
        // Optional: Save preference to local storage
        localStorage.setItem('vetrom-theme', newTheme);
    });

    // Check for saved theme preference on load
    const savedTheme = localStorage.getItem('vetrom-theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    } else {
        // Set default based on body's initial attribute (light)
        themeToggle.textContent = '🌙';
    }


    // --- Smooth Scroll Navigation ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                // Scroll smoothly to the target element
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });

                // Optional: Update URL hash without page jump (for history/shareability)
                history.pushState(null, null, targetId);
            }
        });
    });

    // --- Modal Logic ---

    // Function to open modal
    function openModal() {
        contactModal.style.display = 'block';
        body.style.overflow = 'hidden'; // Prevent scrolling the background
    }

    // Function to close modal
    function closeModal() {
        contactModal.style.display = 'none';
        body.style.overflow = ''; // Restore background scrolling
    }
    
    // Open modal on button click
    if (openModalButton) {
        openModalButton.addEventListener('click', openModal);
    }
    
    // Close modal on 'x' button click
    if (closeButton) {
        closeButton.addEventListener('click', closeModal);
    }

    // Close modal if user clicks outside of the content area
    window.addEventListener('click', (event) => {
        if (event.target === contactModal) {
            closeModal();
        }
    });

    // Close modal on ESC key press
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape" && contactModal.style.display === 'block') {
            closeModal();
        }
    });


    // --- Contact Form Interaction ---
    const contactForm = document.getElementById('contact-form');
    const formMessage = document.getElementById('form-message');

    if (contactForm) {
        // Formspree requires you to use the 'name' attribute for form fields.
        // Your HTML is missing 'name' attributes. Let's add a warning.
        
        // **IMPORTANT:** Add 'name' attributes to your input fields in index.html
        // e.g., <input type="text" id="name" required> should be 
        // <input type="text" id="name" name="name" required>
        
        contactForm.addEventListener('submit', function(e) {
            // e.preventDefault() is removed to allow Formspree submission
            
            formMessage.textContent = 'Sending message...';
            formMessage.className = 'success'; // Temporarily use success style
            formMessage.classList.remove('hidden');

            // NOTE: The form will now submit and redirect the user to Formspree's
            // 'Thank You' page by default, unless you configure a redirect URL.
            // You may want to look into an AJAX submission for a smoother, non-redirecting experience.
        });
    }
});
