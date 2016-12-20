// actually sends the request out - by opening a new tab
function osm_piskvor_org_share(e) {
    const josmURL = "http://localhost:8111/import?url=";
    let url;
    if (typeof(e['target']) == 'undefined') {
        url = e.toString();
    } else {
        url = e.target.getAttribute("url");
    }
    const hasHash = url.indexOf('#');
    if (hasHash !== -1) {
        const hash = url.substring(hasHash + 1);
        url = url.substring(0, hasHash);
        if (hash.indexOf('task') === 0) { // special handling for project tasks on tasks.hotosm.org
            url += '/' + hash + '.gpx';
        }
    }
    let loadUrl;
    if (url.indexOf(josmURL) === -1) { // 80/20 try to avoid loops - calling /loadUrl=http://localhost/loadUrl
        loadUrl = josmURL + encodeURIComponent(url);
    } else {
        loadUrl = url;
    }
    // background tab
    browser.tabs.create({
        url: loadUrl,
        active: false
    });
}


browser.contextMenus.create({
    id: "osm-piskvor-org-josm-remote-link",
    title: browser.i18n.getMessage("contextMenuItemOpenInJosm"),
    contexts: ["selection","link","page"]
});

/*
 The click event listener, where we perform the appropriate action given the
 ID of the menu item that was clicked.
 */
browser.contextMenus.onClicked.addListener(function (info) {
    if (info['selectionText']) {
        osm_piskvor_org_share(info.selectionText);
    } else if (info['linkUrl']) {
        osm_piskvor_org_share(info.linkUrl);
    } else {
        osm_piskvor_org_share(info.frameUrl);
    }
});

