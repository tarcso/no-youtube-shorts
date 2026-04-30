const SHORTS_PATH = "/shorts/";
const ALLOW_SHORTS_CLASS = "nys-allow-shorts";

function isShortsPath(pathname) {
  return pathname === "/shorts" || pathname.startsWith(SHORTS_PATH);
}

function isSearchPage() {
  return window.location.pathname === "/results";
}

function redirectAwayFromShortsPage() {
  if (isShortsPath(window.location.pathname)) {
    window.location.replace("https://www.youtube.com/");
  }
}

function updateRouteState() {
  if (!document.documentElement) return;

  document.documentElement.classList.toggle(ALLOW_SHORTS_CLASS, isSearchPage());
  redirectAwayFromShortsPage();
}

updateRouteState();

window.addEventListener("yt-navigate-start", updateRouteState);
window.addEventListener("yt-navigate-finish", updateRouteState);
window.addEventListener("yt-page-data-updated", updateRouteState);
window.addEventListener("popstate", updateRouteState);
