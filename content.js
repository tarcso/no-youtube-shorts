const SHORTS_PATH = "/shorts/";
const PASSIVE_SURFACE_PATHS = new Set([
  "/",
  "/feed/explore",
  "/feed/history",
  "/feed/subscriptions",
  "/watch"
]);
const SHORTS_LINK_SELECTOR = 'a[href^="/shorts"], a[href*="youtube.com/shorts"]';
const SHELF_SELECTOR = [
  "ytd-rich-section-renderer",
  "ytd-reel-shelf-renderer",
  "ytd-horizontal-card-list-renderer",
  "ytd-shelf-renderer"
].join(",");
const SHORTS_CARD_SELECTOR = [
  "ytd-rich-item-renderer",
  "ytd-video-renderer",
  "ytd-grid-video-renderer",
  "ytd-compact-video-renderer",
  "ytd-reel-item-renderer",
  "yt-lockup-view-model"
].join(",");
const NAV_CONTAINER_SELECTOR = [
  "ytd-guide-entry-renderer",
  "ytd-mini-guide-entry-renderer"
].join(",");
const INSPECT_SELECTOR = `${SHELF_SELECTOR}, ${SHORTS_LINK_SELECTOR}, a[title="Shorts"]`;

let cleanupScheduled = false;
let pendingRoots = new Set();

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
  if (element && element.isConnected) {
    element.remove();
  }
}

function shouldInspectNode(node) {
  return (
    node instanceof Element &&
    (node.matches(INSPECT_SELECTOR) || Boolean(node.querySelector(INSPECT_SELECTOR)))
  );
}

function elementsMatching(root, selector) {
  const elements = [];

  if (root instanceof Element) {
    if (root.matches(selector)) {
      elements.push(root);
    }

    elements.push(...root.querySelectorAll(selector));
  } else {
    elements.push(...document.querySelectorAll(selector));
  }

  return elements;
}

function removeShortsShelves(root = document) {
  if (!PASSIVE_SURFACE_PATHS.has(window.location.pathname)) return;

  elementsMatching(root, SHELF_SELECTOR).forEach(section => {
    const hasShortsLink = Boolean(section.querySelector(SHORTS_LINK_SELECTOR));

    if (hasShortsLink) {
      removeElement(section);
      return;
    }

    if (section.textContent.length < 1000) {
      const hasShortsLabel = section.textContent.toLowerCase().includes("shorts");

      if (hasShortsLabel) {
        removeElement(section);
      }
    }
  });
}

function removeShortsCards(root = document) {
  if (!shouldRemoveShortsLinks()) return;

  elementsMatching(root, SHORTS_LINK_SELECTOR).forEach(link => {
    const container = link.closest(SHORTS_CARD_SELECTOR);

    removeElement(container || link);
  });
}

function removeShortsNavigation(root = document) {
  elementsMatching(root, `${SHORTS_LINK_SELECTOR}, a[title="Shorts"]`)
    .forEach(link => {
      const isNavigationLink =
        link.matches('a[title="Shorts"]') ||
        link.closest("ytd-guide-entry-renderer, ytd-mini-guide-entry-renderer, ytd-topbar-menu-button-renderer");

      if (isNavigationLink && isShortsUrl(link.href)) {
        removeElement(link.closest(NAV_CONTAINER_SELECTOR) || link);
      }
    });
}

function removeShorts(root = document) {
  redirectAwayFromShortsPage();
  removeShortsShelves(root);
  removeShortsCards(root);
  removeShortsNavigation(root);
}

function runScheduledCleanup() {
  cleanupScheduled = false;

  const roots = pendingRoots;
  pendingRoots = new Set();

  roots.forEach(root => removeShorts(root));
}

function scheduleCleanup(root = document) {
  pendingRoots.add(root);

  if (cleanupScheduled) return;
  cleanupScheduled = true;

  const scheduleIdleWork = window.requestIdleCallback || (callback => window.setTimeout(callback, 100));
  scheduleIdleWork(runScheduledCleanup, { timeout: 500 });
}

window.addEventListener("yt-navigate-finish", () => scheduleCleanup(document));
window.addEventListener("yt-page-data-updated", () => scheduleCleanup(document));
window.addEventListener("popstate", () => scheduleCleanup(document));

const observer = new MutationObserver(mutations => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach(node => {
      if (shouldInspectNode(node)) {
        scheduleCleanup(node);
      }
    });
  }
});
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

removeShorts();
