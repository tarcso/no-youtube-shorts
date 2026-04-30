const SHORTS_PATH = "/shorts/";
const SHORTS_LINK_SELECTOR = 'a[href^="/shorts"], a[href*="youtube.com/shorts"]';
const SHORTS_CONTAINER_SELECTOR = [
  "ytd-rich-section-renderer",
  "ytd-reel-shelf-renderer",
  "ytd-horizontal-card-list-renderer",
  "ytd-shelf-renderer",
  "ytd-rich-item-renderer",
  "ytd-video-renderer",
  "ytd-grid-video-renderer",
  "ytd-compact-video-renderer",
  "ytd-reel-item-renderer",
  "yt-lockup-view-model",
  "ytd-guide-entry-renderer",
  "ytd-mini-guide-entry-renderer"
].join(",");

let cleanupTimer = null;
let navigationCleanupTimers = [];
let lastScrollCleanup = 0;

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

function removeShorts() {
  redirectAwayFromShortsPage();

  if (isSearchPage()) return;

  document.querySelectorAll(SHORTS_LINK_SELECTOR).forEach(link => {
    const container = link.closest(SHORTS_CONTAINER_SELECTOR);
    (container || link).remove();
  });
}

function scheduleCleanup(delay = 250) {
  window.clearTimeout(cleanupTimer);
  cleanupTimer = window.setTimeout(removeShorts, delay);
}

function clearNavigationCleanups() {
  navigationCleanupTimers.forEach(timer => window.clearTimeout(timer));
  navigationCleanupTimers = [];
}

function scheduleNavigationCleanup(delay) {
  navigationCleanupTimers.push(window.setTimeout(removeShorts, delay));
}

function scheduleNavigationCleanups() {
  clearNavigationCleanups();
  redirectAwayFromShortsPage();
  scheduleCleanup(250);
  scheduleNavigationCleanup(1200);
  scheduleNavigationCleanup(3000);
}

function handleScroll() {
  const now = Date.now();

  if (now - lastScrollCleanup < 1500) return;
  lastScrollCleanup = now;

  scheduleCleanup(500);
}

scheduleNavigationCleanups();

window.addEventListener("yt-navigate-start", redirectAwayFromShortsPage);
window.addEventListener("yt-navigate-finish", scheduleNavigationCleanups);
window.addEventListener("yt-page-data-updated", scheduleNavigationCleanups);
window.addEventListener("popstate", scheduleNavigationCleanups);
window.addEventListener("scroll", handleScroll, { passive: true });
