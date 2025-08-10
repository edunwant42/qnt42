// Smooth scrolling navigation without URL hash changes
document.addEventListener('DOMContentLoaded', function () {
    const navLinks = document.querySelectorAll('nav a[data-target]');
    const navIndicator = document.querySelector('.nav-indicator');

    // Function to update indicator position
    function updateIndicator(activeLink) {
        const rect = activeLink.getBoundingClientRect();
        const navRect = activeLink.parentElement.getBoundingClientRect();
        const offsetLeft = rect.left - navRect.left;
        const width = rect.width;

        navIndicator.style.width = width + 'px';
        navIndicator.style.left = offsetLeft + 'px';
    }

    // Set initial indicator position
    const initialActive = document.querySelector('nav a.active');
    if (initialActive) {
        updateIndicator(initialActive);
    }

    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault(); // Prevent default anchor behavior

            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));

            // Add active class to clicked link
            this.classList.add('active');

            // Update indicator position
            updateIndicator(this);

            const targetId = this.getAttribute('data-target');
            const targetSection = document.getElementById(targetId);

            if (targetSection) {
                // Calculate offset for fixed navbar
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight - 20; // 20px extra spacing

                // Smooth scroll to target
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Update active link based on scroll position
    window.addEventListener('scroll', function () {
        const sections = ['hero', 'about', 'features', 'contact'];
        const navbarHeight = document.querySelector('.navbar').offsetHeight;
        const scrollPos = window.scrollY + navbarHeight + 100; // 100px offset for better detection

        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId);
            const link = document.querySelector(`nav a[data-target="${sectionId}"]`);

            if (section && link) {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;

                if (scrollPos >= sectionTop && scrollPos < sectionBottom) {
                    // Remove active from all links
                    navLinks.forEach(l => l.classList.remove('active'));

                    // Add active to current link
                    link.classList.add('active');

                    // Update indicator
                    updateIndicator(link);
                }
            }
        });
    });

    // Handle window resize to update indicator position
    window.addEventListener('resize', function () {
        const activeLink = document.querySelector('nav a.active');
        if (activeLink) {
            updateIndicator(activeLink);
        }
    });
});
