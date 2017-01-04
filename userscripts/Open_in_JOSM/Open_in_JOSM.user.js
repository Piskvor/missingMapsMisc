/* This program is free software. It comes without any warranty, to
 * the extent permitted by applicable law. You can redistribute it
 * and/or modify it under the terms of the Do What The Fuck You Want
 * To Public License, Version 2, as published by Sam Hocevar. See
 * http://sam.zoy.org/wtfpl/COPYING for more details. */

// ==UserScript==
// @name            Open in JOSM
// @namespace       http://osm.piskvor.org/
// @description     Open a page (GPX track, image, etc.) through JOSM's Remote Control from browser's context menu
// @version         1.0.1
// @author          Piskvor, from original script by LouCypher
// @license         WTFPL http://sam.zoy.org/wtfpl/COPYING
// @include         http://tasks.hotosm.org/project/*
// @include         *.gpx
// @updateURL       https://piskvor.github.io/missingMapsMisc/userscripts/Open_in_JOSM/Open_in_JOSM.user.js
// @icon            https://piskvor.github.io/missingMapsMisc/offlineLandingPage/josm.png
// @grant           none
// ==/UserScript==

/*
 Current version:
 - http://osm.piskvor.org/Open_in_JOSM.user.js
 Original script:
 - http://userscripts-mirror.org/scripts/show/150793
 References:
 - https://hacks.mozilla.org/2011/11/html5-context-menus-in-firefox-screencast-and-code/
 - http://thewebrocks.com/demos/context-menu/
 */

new function () { // do not pollute global scope
    var menu = document.body.appendChild(document.createElement("menu"));
    var html = document.documentElement;
    if (html.hasAttribute("contextmenu")) {
        // We don't want to override web page context menu if any
        var contextmenu = $("#" + html.getAttribute("contextmenu"));
        contextmenu.appendChild(menu); // Append to web page context menu
        console.log(contextmenu);
    } else {
        html.setAttribute("contextmenu", "userscript-open-josm-context-menu");
    }

    function $(aSelector, aNode) {
        return (aNode || document).querySelector(aSelector);
    }

    // URL of the Remote Control
    var josmURL = "http://localhost:8111/import?url=";

    // icon for the menu item
    var josmIcon = 'data:application/ico;base64,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';

    menu.outerHTML = '<menu id="userscript-open-josm-context-menu" type="context">\
                      <menuitem label="JOSM"\
                                icon="' + josmIcon + '">\
                      </menuitem>\
                  </menu>';

    // If browser supports contextmenu
    if ("contextMenu" in html && "HTMLMenuItemElement" in window) {
        // Executed on clicking a menuitem
        $("#userscript-open-josm-context-menu menuitem").addEventListener("click", share, false);
        html.addEventListener("contextmenu", initMenu, false); // Executed on right clicking
    }

    function initMenu(e) {
        var node = e.target;

        var menu = $("#userscript-open-josm-context-menu menuitem");
        var menuLabel = "Open This Page with "; // Set menu label

        var canonical = $("head link[rel='canonical']");
        // Use canonical where available
        var url = canonical ? canonical.href : location.href;

        // If right click on a link
        while (node && node.nodeName != "A") node = node.parentNode;
        if (node && node.hasAttribute("href")) {
            menuLabel = "Open This Link with "; // Menu label when right click on a link
            url = node.href;
        }

        menu.label = menuLabel + 'JOSM';

        // Set menu title and url attributes
        menu.title = menu.label;
        menu.setAttribute("url", url);
    }

    // actually sends the request out - by opening a new tab
    function share(e) {
        var url;
        if (typeof(e['target']) == 'undefined') {
            url = e.toString();
        } else {
            url = e.target.getAttribute("url");
        }
        var hasHash = url.indexOf('#');
        if (hasHash !== -1) {
            var hash = url.substring(hasHash + 1);
            url = url.substring(0, hasHash);
            if (hash.indexOf('task') === 0) { // special handling for project tasks on tasks.hotosm.org
                url += '/' + hash + '.gpx';
            }
        }
        var loadUrl;
        if (url.indexOf(josmURL) === -1) { // 80/20 try to avoid loops - calling /loadUrl=http://localhost/loadUrl
            loadUrl = josmURL + encodeURIComponent(url);
        } else {
            loadUrl = url;
        }
        var name = "userscript-josm-remote";
        // normal window
        var feature = null;
        open(loadUrl,
            name, feature);
    }

    // export the "share" function to bookmarklets
    unsafeWindow.osm_piskvor_org_josm_open = share;

}(); // call self
