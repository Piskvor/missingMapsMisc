// fix for *special* browsers
browser = (function () {
    return window.msBrowser ||
        window.browser ||
        window.chrome;
})();

// actually sends the request out - by opening a new tab
function osm_piskvor_org_share(e) {
    // we need to hard-code this, JOSM doesn't let us configure
    const josmURL = "http://localhost:8111/";
    const importURL = "import?url=";

    let lon2tile = function (lon, zoom) {
        return (Math.floor((lon + 180) / 360 * Math.pow(2, zoom)));
    };
    let lat2tile = function (lat, zoom) {
        return (Math.floor((1 - Math.log(Math.tan(lat * Math.PI / 180) + 1 / Math.cos(lat * Math.PI / 180)) / Math.PI) / 2 * Math.pow(2, zoom)));
    };
    let tile2lon = function (x, z) {
        return (x / Math.pow(2, z) * 360 - 180);
    };
    let tile2lat = function (y, z) {
        var n = Math.PI - 2 * Math.PI * y / Math.pow(2, z);
        return (180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n))));
    };

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
    let setLoadUrlDirectly = false;

    if (hasHash !== -1) { // if hash, try to convert
        const hash = url.substring(hasHash + 1);
        url = url.substring(0, hasHash);
        if (hash.indexOf("map") === 0) { // #map=zz/xx.xxxx/yy.yyyy
            if (typeof(window['OSM']) !== 'undefined' && typeof(window.OSM['mapParams']) !== 'undefined') { // get data from DOM directly
                setLoadUrlDirectly = true;
                let zoom = window.OSM.mapParams().zoom;
                let centerLatTile = lat2tile(window.OSM.mapParams().lat, zoom);
                let centerLonTile = lon2tile(window.OSM.mapParams().lon, zoom);

                let latNorth = tile2lat(centerLatTile - 2, zoom);
                let latSouth = tile2lat(centerLatTile + 2, zoom);
                let lonWest = tile2lon(centerLonTile - 4, zoom);
                let lonEast = tile2lon(centerLonTile + 4, zoom);
                url = josmURL + 'load_and_zoom?left=' + lonWest + '&right=' + lonEast + '&top=' + latNorth + '&bottom=' + latSouth;
            } else { // fallback to the "edit with remote" workalike
                setLoadUrlDirectly = true;
                url = 'http://www.openstreetmap.org/edit?editor=remote#' + url;
            }
        } else if (hash.indexOf("task") === 0) { // special handling for project tasks on tasks.hotosm.org
            url += "/" + hash + ".gpx";
        }
    }
    if (url.indexOf(josmURL) !== -1) { // 80/20 try to avoid loops - calling /loadUrl=http://localhost/loadUrl
        setLoadUrlDirectly = true;
    }

    let loadUrl = url;
    if (!setLoadUrlDirectly) { // just pass the URL and let JOSM deal with it
        loadUrl = josmURL + importURL + encodeURIComponent(url);
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

