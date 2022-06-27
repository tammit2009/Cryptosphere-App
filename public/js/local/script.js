
const baseUrl          = 'http://localhost:5000';
const current_page_URL = location.href;  // current location

// Set active nav menu
(function setActiveNavMenu() {
    var menus = document.querySelectorAll(".menubar.navbar-nav .nav-item"); // NodeList
    
    Array.from(menus).forEach((el) => {
        // First remove any possible active class
        el.classList.remove('active');

        // Get the inner element
        var a = el.querySelector(".nav-link");

        // Set active class if url matches current location
        let target_URL = a.getAttribute("href");
        if (target_URL !== '#' && current_page_URL == `${baseUrl}${target_URL}`) {
            el.classList.add('active');
        }
    });
})();