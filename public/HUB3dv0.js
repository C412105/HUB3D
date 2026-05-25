// ========================== Auth state ==========================
// Runs on every page — shows/hides elements based on login status.
// Add class "show-if-logged-in" or "hide-if-logged-in" to any
// HTML element you want to conditionally display.
function applyAuthState() {
    const userId = sessionStorage.getItem("hub3d_user_id");
    const isLoggedIn = !!userId;

    document.querySelectorAll(".show-if-logged-in")
        .forEach(el => el.style.display = isLoggedIn ? "" : "none");

    document.querySelectorAll(".hide-if-logged-in")
        .forEach(el => el.style.display = isLoggedIn ? "none" : "");
}

document.addEventListener("DOMContentLoaded", applyAuthState);
