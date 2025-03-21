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

    navLinks.forEach(link => {
        link.addEventListener("click", function () {
            // Remove active class from all links
            navLinks.forEach(item => item.classList.remove("active"));

            // Add active class to the clicked link
            this.classList.add("active");
        });
    });

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
                    duration: 1, // Adjust duration as needed
                    scrollTo: {
                        y: targetTop,
                        autoKill: false  // Important: Prevent GSAP from stopping the animation if the user scrolls
                    },
                    ease: "power3.inOut" // Choose an easing function you like
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
});

// Fix: Remove Hover Class on Mouse Leave (No Change)
$(".hover").mouseleave(function () {
    $(this).removeClass("hover");
});
