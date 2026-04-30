const SHORTS_PATH = "/shorts/";
const HIDDEN_CLASS = "nys-hidden";
const STYLE_ID = "nys-style";
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

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const style = document.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `.${HIDDEN_CLASS} { display: none !important; }`;
  document.documentElement.append(style);
}

function hideShorts() {
  redirectAwayFromShortsPage();

  if (isSearchPage()) return;

  document.querySelectorAll(SHORTS_LINK_SELECTOR).forEach(link => {
    const container = link.closest(SHORTS_CONTAINER_SELECTOR);
    (container || link).classList.add(HIDDEN_CLASS);
  });
}

function scheduleCleanup(delay = 500) {
  window.clearTimeout(cleanupTimer);
  cleanupTimer = window.setTimeout(() => {
    const scheduleIdleWork = window.requestIdleCallback || (callback => window.setTimeout(callback, 0));
    scheduleIdleWork(hideShorts, { timeout: 1500 });
  }, delay);
}

function scheduleNavigationCleanups() {
  redirectAwayFromShortsPage();
  scheduleCleanup(700);
}

function handleScroll() {
  const now = Date.now();

  if (now - lastScrollCleanup < 2500) return;
  lastScrollCleanup = now;

  scheduleCleanup(900);
}

installStyles();
scheduleNavigationCleanups();

window.addEventListener("yt-navigate-start", redirectAwayFromShortsPage);
window.addEventListener("yt-navigate-finish", scheduleNavigationCleanups);
window.addEventListener("yt-page-data-updated", scheduleNavigationCleanups);
window.addEventListener("popstate", scheduleNavigationCleanups);
window.addEventListener("scroll", handleScroll, { passive: true });
