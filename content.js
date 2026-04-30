const SHORTS_PATH = "/shorts/";
const PASSIVE_SURFACE_PATHS = new Set([
  "/",
  "/feed/explore",
  "/feed/history",
  "/feed/subscriptions",
  "/watch"
]);

function isShortsPath(pathname) {
  return pathname === "/shorts" || pathname.startsWith(SHORTS_PATH);
}

function isShortsUrl(url) {
  try {
    return isShortsPath(new URL(url, window.location.origin).pathname);
  } catch {
    return false;
  }
}

function isSearchPage() {
  return window.location.pathname === "/results";
}

function shouldRemoveShortsLinks() {
  return !isSearchPage();
}

function redirectAwayFromShortsPage() {
  if (isShortsPath(window.location.pathname)) {
    window.location.replace("https://www.youtube.com/");
  }
}

function removeElement(element) {
  if (element && !element.dataset.noYoutubeShortsRemoved) {
    element.dataset.noYoutubeShortsRemoved = "true";
    element.remove();
  }
}

function removeShortsShelves() {
  if (!PASSIVE_SURFACE_PATHS.has(window.location.pathname)) return;

  document
    .querySelectorAll(
      [
        "ytd-rich-section-renderer",
        "ytd-reel-shelf-renderer",
        "ytd-horizontal-card-list-renderer",
        "ytd-shelf-renderer"
      ].join(",")
    )
    .forEach(section => {
      const hasShortsLink = Boolean(section.querySelector('a[href^="/shorts/"]'));
      const hasShortsLabel = section.textContent.toLowerCase().includes("shorts");

      if (hasShortsLink || hasShortsLabel) {
        removeElement(section);
      }
    });
}

function removeShortsCards() {
  if (!shouldRemoveShortsLinks()) return;

  document.querySelectorAll('a[href^="/shorts/"], a[href*="youtube.com/shorts/"]').forEach(link => {
    const container = link.closest(
      [
        "ytd-rich-item-renderer",
        "ytd-video-renderer",
        "ytd-grid-video-renderer",
        "ytd-compact-video-renderer",
        "ytd-reel-item-renderer",
        "yt-lockup-view-model",
        "ytd-item-section-renderer"
      ].join(",")
    );

    removeElement(container || link);
  });
}

function removeShortsNavigation() {
  document
    .querySelectorAll('a[href^="/shorts/"], a[title="Shorts"]')
    .forEach(link => {
      const isNavigationLink =
        link.matches('a[title="Shorts"]') ||
        link.closest("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytd-topbar-menu-button-renderer");

      if (isNavigationLink && isShortsUrl(link.href)) {
        removeElement(link.closest("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer") || link);
      }
    });
}

function removeShorts() {
  redirectAwayFromShortsPage();
  removeShortsShelves();
  removeShortsCards();
  removeShortsNavigation();
}

function scheduleCleanup() {
  window.requestAnimationFrame(removeShorts);
}

window.addEventListener("yt-navigate-finish", scheduleCleanup);
window.addEventListener("yt-page-data-updated", scheduleCleanup);
window.addEventListener("popstate", scheduleCleanup);

const observer = new MutationObserver(scheduleCleanup);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

removeShorts();
