/**
 * Shared behaviour for chrome that links to the page you are already on.
 *
 * Next's <Link> is a no-op when the href resolves to the current route, so
 * clicking "Acasă" or the seal halfway down the home page did nothing at all.
 * A nav item that visibly lights up as the current tab has to *do* something
 * when pressed; going back to the top is what every site does here.
 *
 * It also drops a lingering `#hash`. Deep links like `/servicii#directoriu`
 * leave the fragment in the address bar, and while it sits there any later
 * arrival at the same route can be re-aimed at the anchor by the browser's own
 * restoration — which is exactly why "Servicii" sometimes landed on the map and
 * sometimes at the top of the page.
 */
export function scrollPageToTop() {
  clearHash();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

export function clearHash() {
  if (!window.location.hash) return;
  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search,
  );
}
