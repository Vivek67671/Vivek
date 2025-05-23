document.addEventListener("DOMContentLoaded", function() {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const darkModeText = document.getElementById("darkModeText");

    function updateText() {
        darkModeText.textContent = darkModeToggle.checked ? "Toggle for Light Mode" : "Toggle for Dark Mode";
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    darkModeToggle.addEventListener("change", function() {
        document.body.classList.toggle("dark-mode", this.checked);
        updateText();
    });

    updateText();

    // --- Fix: Active Nav Link Logic (Moved Outside) ---
    const navLinks = document.querySelectorAll("nav a");

    // Initialize Splide Slider
    var splide = new Splide('.splide', {
        type   : 'loop',
        perPage: 3,
        perMove: 1,
        gap    : '1rem',
        breakpoints: {
            768: {
                perPage: 1,
                arrows: false /* Hide arrows on smaller screens */
            }
        }
    });
    splide.mount();

    // --- Set Consistent Slide Height (jQuery) ---
    $(window).on('load', function() {
        let maxHeight = 0;

        $(".splide__slide").each(function() {
            const slideHeight = $(this).outerHeight();
            if (slideHeight > maxHeight) {
                maxHeight = slideHeight;
            }
        });

        $(".splide__slide").height(maxHeight);
        $(".splide__list").height(maxHeight);
        splide.refresh()
    });

    // --- Smooth Scrolling with Header Offset (GSAP Implementation) ---
    gsap.registerPlugin(ScrollToPlugin);

    const navLinksSmooth = document.querySelectorAll("nav a");

    navLinksSmooth.forEach(link => {
        link.addEventListener("click", function(event) {
            event.preventDefault();

            const targetId = this.getAttribute("href").substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                const headerHeight = document.querySelector("header").offsetHeight;
                const targetTop = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                gsap.to(window, {
                    duration: 1.5, // Increased duration for smoother scroll
                    scrollTo: {
                        y: targetTop,
                        autoKill: false
                    },
                    ease: "power2.out" // Updated easing for a smoother effect
                });
            }
        });
    });

    // GSAP animation (run after DOM is loaded)
    if (!prefersReducedMotion) {
        gsap.registerPlugin(ScrollToPlugin); // Register even if not dark mode

        gsap.from(".fade-in-up", {
            duration: 1,
            y: 50,
            opacity: 0,
            stagger: 0.2,
            ease: "power2.out"
        });
    }

    // Modal preview for card and gallery images
    const previewModal = document.getElementById('preview-modal');
    let modalSplide; // For modal slider instance

    // --- Add caption elements ---
    const previewCaption = document.querySelector('.preview-caption');
    const previewTitle = document.querySelector('.preview-title');
    const previewDesc = document.querySelector('.preview-desc');

    // Helper to update caption based on current slide
    function updatePreviewCaption(slideIndex) {
        if (!modalSplide) return;
        const slides = previewModal.querySelectorAll('.splide__slide img');
        if (!slides.length) {
            previewCaption.style.display = 'none';
            return;
        }
        const img = slides[slideIndex];
        if (img) {
            previewTitle.textContent = img.getAttribute('data-title') || img.alt || '';
            previewDesc.textContent = img.getAttribute('data-desc') || '';
            previewCaption.style.display = (previewTitle.textContent || previewDesc.textContent) ? 'block' : 'none';
        } else {
            previewCaption.style.display = 'none';
        }
    }

    // Attach click event to each gallery card to display all its images
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.stopPropagation();
            const images = this.querySelectorAll('img');
            if (images.length > 0 && previewModal) {
                const sliderList = previewModal.querySelector('.splide__list');
                sliderList.innerHTML = '';
                const loadPromises = [];
                images.forEach(img => {
                    const li = document.createElement('li');
                    li.className = 'splide__slide';
                    const newImg = document.createElement('img');
                    newImg.src = img.src;
                    newImg.alt = img.alt || '';
                    if (img.getAttribute('data-title')) newImg.setAttribute('data-title', img.getAttribute('data-title'));
                    if (img.getAttribute('data-desc')) newImg.setAttribute('data-desc', img.getAttribute('data-desc'));
                    li.appendChild(newImg);
                    sliderList.appendChild(li);
                    loadPromises.push(new Promise(resolve => {
                        if (newImg.complete && newImg.naturalWidth > 0) {
                            resolve();
                        } else {
                            newImg.addEventListener('load', resolve, { once: true });
                            newImg.addEventListener('error', resolve, { once: true });
                        }
                    }));
                });
                previewModal.classList.add('open');
                previewModal.setAttribute('aria-hidden', 'false');
                document.body.style.overflow = 'hidden';
                Promise.all(loadPromises).then(() => {
                    // Force reflow and add extra delay before mounting modal Splide
                    sliderList.offsetHeight;
                    setTimeout(() => {
                        mountModalSplide();
                    }, 500); // increased delay to 500ms
                });
            }
        });
    });

    // Helper to mount Splide and update caption
    function mountModalSplide() {
        if (modalSplide) {
            modalSplide.destroy();
        }
        modalSplide = new Splide(previewModal.querySelector('.preview-slider'), {
            type: 'loop',
            perPage: 1,
            rewind: true
        });
        modalSplide.on('mounted move', function() {
            updatePreviewCaption(modalSplide.index);
        });
        modalSplide.mount();
        // Force a refresh of Splide after mounting
        requestAnimationFrame(() => {
            modalSplide.refresh();
        });
        updatePreviewCaption(0);
    }

    // Retain existing preview close logic
    if (document.querySelector('.preview-close')) {
        document.querySelector('.preview-close').addEventListener('click', function() {
            if (previewModal) {
                previewModal.classList.remove('open');
                previewModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                // Hide caption
                if (previewCaption) previewCaption.style.display = 'none';
            }
        });
    }

    if (previewModal) {
        previewModal.addEventListener('click', function(e) {
            if (e.target === previewModal) {
                previewModal.classList.remove('open');
                previewModal.setAttribute('aria-hidden', 'true');
                document.body.style.overflow = '';
                // Hide caption
                if (previewCaption) previewCaption.style.display = 'none';
            }
        });
    }

    // Function to handle scroll event
    function handleScroll() {
        const galleryItems = document.querySelectorAll('.gallery-item');

        galleryItems.forEach(item => {
            const itemRect = item.getBoundingClientRect();
            const secondImage = item.querySelector('.second-image');

            // Check if the item is in the viewport
            if (itemRect.top <= window.innerHeight && itemRect.bottom >= 0) {
                // If the second image exists and is not already visible, show it
                if (secondImage && secondImage.style.display === 'none') {
                    secondImage.style.display = 'block';
                }
            }
        });
    }

    // Attach scroll event listener
    window.addEventListener('scroll', handleScroll);

    // Initial check in case some items are already in view on load
    handleScroll();
});

// Fix: Remove Hover Class on Mouse Leave (No Change)
$(".hover").mouseleave(function () {
    $(this).removeClass("hover");
});

// Responsive nav toggle
document.addEventListener("DOMContentLoaded", function() {
    const navToggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('main-nav');
    if (navToggle && nav) {
        navToggle.addEventListener('click', function(e) {
            const isOpen = nav.classList.toggle('open');
            navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            e.stopPropagation(); // Prevent click from bubbling to document
        });

        // Close nav when clicking outside the nav or hamburger
        document.addEventListener('click', function(e) {
            const isMenuOpen = nav.classList.contains('open');
            if (
                isMenuOpen &&
                !nav.contains(e.target) &&
                !navToggle.contains(e.target)
            ) {
                nav.classList.remove('open');
                navToggle.setAttribute('aria-expanded', 'false');
            }
        });

        // Close nav when a nav link is clicked (for mobile/tablet)
        nav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 900) {
                    nav.classList.remove('open');
                    navToggle.setAttribute('aria-expanded', 'false');
                }
            });
        });
    }
});

// Note: No certification-related code exists in this file.
