# No YouTube Shorts

A small browser extension that removes YouTube Shorts from passive YouTube surfaces, including the homepage, watch-page recommendations, shelves, and navigation links.

You can still search for Shorts on YouTube. The extension is meant to stop Shorts from being recommended or surfaced while browsing normally.

## Install

### Chrome, Edge, Brave, or another Chromium browser

1. Clone or download this repository.
2. Open your browser's extensions page:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
   - Brave: `brave://extensions`
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select this project folder.

The extension should now run automatically on `www.youtube.com`.

## Use

Open YouTube normally. The extension will:

- remove Shorts shelves from the homepage and other browsing pages
- remove Shorts from watch-page recommendations
- remove Shorts cards from passive feeds
- remove Shorts navigation entries
- redirect away from direct `/shorts` pages
- keep YouTube search results available, including Shorts results

If YouTube is already open when you install or update the extension, reload the YouTube tab.

## Update

After changing the code:

1. Go back to your browser's extensions page.
2. Click the reload button on the No YouTube Shorts extension.
3. Reload any open YouTube tabs.

## Files

- `manifest.json` configures the extension.
- `content.css` hides Shorts elements from the page.
- `content.js` tracks YouTube route changes and redirects direct Shorts pages.
