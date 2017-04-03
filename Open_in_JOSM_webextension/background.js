// fix for *special* browsers
browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

// actually sends the request out - by opening a new tab
function osm_piskvor_org_share(e) {
    // we need to hard-code this, JOSM doesn't let us configure
    const josmURL = "http://localhost:8111/import?url=";

    let url;
    if (typeof(e["target"]) == "undefined") {
        url = e.toString();
    } else {
        // in case we get passed an event
        url = e.target.getAttribute("url");
    }
    const isCz = url.indexOf('openstreetmap.cz') > -1 || url.indexOf('osmap.cz') > -1;
    if (isCz) {
        url = url.replace(/^https?:\/\/(www\.)?(openstreet|os)map\.cz/, 'https://www.openstreetmap.org');
    }
    const hasHash = url.indexOf("#");
    // if hash, try to convert
    if (hasHash !== -1) {
        const hash = url.substring(hasHash + 1);
        url = url.substring(0, hasHash);
        if (hash.indexOf("task") === 0) { // special handling for project tasks on tasks.hotosm.org
            url += "/" + hash + ".gpx";
        }
    }
    let loadUrl = url;
    if (url.indexOf(josmURL) === -1) { // 80/20 try to avoid loops - calling /loadUrl=http://localhost/loadUrl
        loadUrl = josmURL + encodeURIComponent(url);
    }
    // open in background tab
    browser.tabs.create({
        url: loadUrl,
        active: false
    });
}

// create the context menu item
browser.contextMenus.create({
    id: "osm-piskvor-org-josm-remote-link",
    title: browser.i18n.getMessage("contextMenuItemOpenInJosm"),
    contexts: ["selection", "link", "page"]
});

// handle context menu click
browser.contextMenus.onClicked.addListener(function (info) {
    // we only care about our one item
    if (info.menuItemId != "osm-piskvor-org-josm-remote-link") {
        return;
    }
    if (info["selectionText"]) {
        // if there's a selection, load that
        osm_piskvor_org_share(info.selectionText);
    } else if (info["linkUrl"]) {
        // if there's a link, load that
        osm_piskvor_org_share(info.linkUrl);
    } else {
        // otherwise load the current page URL
        osm_piskvor_org_share(info.pageUrl);
    }
});

