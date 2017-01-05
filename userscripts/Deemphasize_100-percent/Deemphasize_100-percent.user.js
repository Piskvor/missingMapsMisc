// ==UserScript==
// @name         Deemphasize complete projects
// @namespace    http://osm.piskvor.org/
// @version      0.3.1
// @description  Don't clutter project list with completed ones (100%)
// @author       Piskvor
// @license      WTFPL http://sam.zoy.org/wtfpl/COPYING
// @match        http://tasks.hotosm.org/*
// @match        https://tasks.hotosm.org/*
// @grant        none
// @updateURL    https://piskvor.github.io/missingMapsMisc/userscripts/Deemphasize_100-percent/Deemphasize_100-percent.user.js
// ==/UserScript==

(function () {
    'use strict';

    var addGlobalStyle = function (css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { // A headless knight! (Or it's not HTML)
            return;
        }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    };

    var deemphasize = function ($percent, pct) {
        //noinspection EqualityComparisonWithCoercionJS - we do want type coercion here
        if (pct == 100) {
            var $project = $percent.closest(".project");
            if ($project.length) { // project exists
                $project.children().not(".project-stats").not('.clear,h4').hide();
                $project.addClass("deemphasize");
            }
        }
    };

    jQuery(function ($) { // run when all loaded
        addGlobalStyle('.deemphasize { opacity: 0.5 }');

        $(".project-stats .progress").each(function (idx, elem) { // since we climb up and down the tree, we can't just use a selector
            var $pct = $(elem.parentElement.parentElement).find('td:last');
            var pct = $pct.text();
            if (pct.indexOf('%') >= 0) { // we have a percentage
                deemphasize($pct, pct.replace(' ', '').replace('%', ''));
            }
        });
    });
})();
