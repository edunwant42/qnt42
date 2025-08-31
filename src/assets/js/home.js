// Mobile menu functionality
document.addEventListener("DOMContentLoaded", function () {
    const hamburger = document.getElementById("hamburger-menu");
    const mainNav = document.getElementById("main-nav");
    const overlay = document.getElementById("overlay");
    const navLinks = document.querySelectorAll(".nav-link");
    const navIndicator = document.querySelector(".nav-indicator");

    // Function to update nav indicator position
    function updateNavIndicator() {
        const activeLink = document.querySelector(".nav-link.active");
        if (activeLink && window.innerWidth > 768) {
            navIndicator.style.width = `${activeLink.offsetWidth}px`;
            navIndicator.style.left = `${activeLink.offsetLeft}px`;
        }
    }

    // Initial update of nav indicator
    updateNavIndicator();

    // Update nav indicator on window resize
    window.addEventListener("resize", updateNavIndicator);

    // Toggle mobile menu
    hamburger.addEventListener("click", function () {
        this.classList.toggle("active");
        mainNav.classList.toggle("mobile-menu-open");
        overlay.classList.toggle("active");
        document.body.classList.toggle("no-scroll");
    });

    // Close menu when overlay is clicked
    overlay.addEventListener("click", function () {
        hamburger.classList.remove("active");
        mainNav.classList.remove("mobile-menu-open");
        this.classList.remove("active");
        document.body.classList.remove("no-scroll");
    });

    // Close menu when a link is clicked
    navLinks.forEach((link) => {
        link.addEventListener("click", function () {
            hamburger.classList.remove("active");
            mainNav.classList.remove("mobile-menu-open");
            overlay.classList.remove("active");
            document.body.classList.remove("no-scroll");

            // Update active class
            navLinks.forEach((l) => l.classList.remove("active"));
            this.classList.add("active");

            // Update nav indicator
            updateNavIndicator();
        });
    });

    // Smooth scrolling for navigation links
    navLinks.forEach((link) => {
        link.addEventListener("click", function (e) {
            e.preventDefault();

            const targetId = this.getAttribute("data-target");
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Calculate offset for fixed navbar
                const navbarHeight = document.querySelector(".navbar").offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;

                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: "smooth",
                });
            }
        });
    });

    // Update active link based on scroll position
    window.addEventListener("scroll", function () {
        const sections = ["hero", "about", "features", "contact"];
        const navbarHeight = document.querySelector(".navbar").offsetHeight;
        const scrollPos = window.scrollY + navbarHeight + 100;

        sections.forEach((sectionId) => {
            const section = document.getElementById(sectionId);
            const link = document.querySelector(`nav a[data-target="${sectionId}"]`);

            if (section && link) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    navLinks.forEach((l) => l.classList.remove("active"));
                    link.classList.add("active");

                    // Update nav indicator
                    updateNavIndicator();
                }
            }
        });
    });
});
