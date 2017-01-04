// ==UserScript==
// @name         Deemphasize complete projects
// @namespace    http://osm.piskvor.org/
// @version      0.3
// @description  Don't clutter project list with completed ones (100%)
// @author       Piskvor
// @license      WTFPL http://sam.zoy.org/wtfpl/COPYING
// @match        http://tasks.hotosm.org/*
// @match        https://tasks.hotosm.org/*
// @grant        none
// @updateURL    https://piskvor.github.io/missingMapsMisc/userscripts/Deemphasize_100-percent/Deemphasize_100-percent.user.js
// ==/UserScript==

(function() {
    'use strict';

    var addGlobalStyle = function(css) {
        var head, style;
        head = document.getElementsByTagName('head')[0];
        if (!head) { return; }
        style = document.createElement('style');
        style.type = 'text/css';
        style.innerHTML = css;
        head.appendChild(style);
    };

    var deemphasize = function($percent, pct) {
        //noinspection EqualityComparisonWithCoercionJS
        if (pct == 100) {
            var $project = $percent.closest(".project");
            if ($project.length) {
                $project.children().not(".project-stats").not('.clear,h4').hide();
                $project.addClass("deemphasize");
            }
        }
    };

    jQuery(function($){
        addGlobalStyle('.deemphasize { opacity: 0.5 }');

        $(".project-stats .progress").each(function(idx,elem){
            var $pct=$(elem.parentElement.parentElement).find('td:last');
            var pct = $pct.text();
            if(pct.indexOf('%')>= 0){
                deemphasize($pct, pct.replace(' ','').replace('%', ''));
            }
        });
    });
})();
