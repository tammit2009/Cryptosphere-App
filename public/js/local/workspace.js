
// Javascript to enable link to tab (access e.g. http://localhost:5000/workspace/#account)
var hash = location.hash.replace(/^#/, '');  // ^ meaning only match the first hash
if (hash) {
    $('.nav_link a[href="#' + hash + '"]').tab('show');
} 

/*
// ALT: Javascript to enable link to tab using prefix(access e.g. http://localhost:5000/workspace/#tab_account)
var hash = document.location.hash; 
var prefix = "tab_";
if (hash) {
    $('.nav_link a[href="' + hash.replace(prefix, "") + '"]').tab('show');
} 

// Change hash for page-reload
$('.nav_link a').on('shown', function (e) {
    window.location.hash = e.target.hash.replace("#", "#" + prefix);
});
*/