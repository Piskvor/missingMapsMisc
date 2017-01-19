var isLoadedCorrectly = false;
var isTimeagoLoaded = false;
if (typeof(window.Offline) === 'undefined' || typeof(window.jQuery) === 'undefined') {
    // check if all loaded - else ugly-hack the DOM to show error
    window.setTimeout(function () {
        var badJs = document.getElementById('bad-js-show');
        badJs.className = '';
        var noJsHide = document.getElementById('no-js-hide');
        noJsHide.className = 'hide';
        var hide = document.getElementsByClassName('hide');
        for (var i = 0; i < hide.length; i++) {
            hide[i].style.display = 'none';
        }
    }, 100);
} else { // we're all good: jQuery and Offline are loaded
    isLoadedCorrectly = true;
    isTimeagoLoaded = (typeof(jQuery.timeago) !== 'undefined');
    if (isTimeagoLoaded) {
        jQuery.timeago.settings.allowFuture = true;
        jQuery.timeago.settings.allowPast = false;
        jQuery.timeago.settings.strings = {
            prefixAgo: null,
            prefixFromNow: "za",
            suffixAgo: null,
            suffixFromNow: null,
            seconds: "méně než minutu",
            minute: "minutu",
            minutes: function(minutesCount) {
                if (minutesCount < 5) {
                    return "%d minuty";
                } else {
                    return "%d minut";
                }
            },
            hour: "hodinu",
            hours: function(hoursCount) {
                if (hoursCount < 5) {
                    return "%d hodiny";
                } else {
                    return "%d hodin";
                }
            },
            day: "1 den",
            days: function(daysCount) {
                if (daysCount < 5) {
                    return "%d dny";
                } else {
                    return "%d dní";
                }
            },
            months: "1 měsíc",
            months: function(monthCount) {
                if (monthCount < 5) {
                    return "%d měsíce";
                } else {
                    return "%d měsíců";
                }
            },
            year: "1 rok",
            years: function(yearCount) {
                if (yearCount < 5) {
                    return "%d roky";
                } else {
                    return "%d let";
                }
            }
        };
    }
    Offline.options = {
        checks: {
            image: {
                url: 'https://piskvor.github.io/missingMapsMisc/offlineLandingPage/josm.png?_' + Math.random()
            },
            active: 'image'
        }
    };
}

var allowLocalJsonCheck = true;
var allowJosmRemoteCheck = true;
var allowOsmtmCheck = false;
var allChecksPassed = false;
var checkCount = 4;
var rcWorkCountdown = 20;
var checksPassed;
var $checkContainer;

if (window.location.hostname.indexOf('local') === -1 || window.location.port != 8080) { // localhost or missingmaps.local.
    allowLocalJsonCheck = false; // we're not in local server
    allowJosmRemoteCheck = false;
}
if (0) { // dummy structure for JS code hinting, never gets executed
    var data = {
        "current": 2398, // task to do if there's no mapathon currently running
        "currentMapathon": {
            "projects": {
                "basic": { // editing with iD
                    "id": 2398, // project number
                    "name": "Aweil" // project name
                },
                "advanced": { // editing with JOSM
                    "id": 2359,
                    "name": "Haiti - Port au Prince"
                }
            },
            "name": "Giving Tuesday", // mapathon name
            "start": "2016-12-16 18:00:00", // start datetime in ISO format
            "location": { // mapathon location
                "name": "Paralelní police",
                "address": "U úlů 1234, Praha",
                "lat": "50.12249",
                "lon": "14.63599",
                "zoom": null, // suggested zoom to show, null to choose automatically
                "map": "https://openstreetmap.cz/way/8072073", // link to the map
                "link": "https://www.paralelnipolis.cz/" // link to the location's page
            }
        }
    };

    //noinspection JSUnusedGlobalSymbols
    var localJosm = { // the following are only checked for a local instance and generated by an outside process
        "is_installed": 1, // is JOSM and its checker even installed?
        "buildings_tools": 1, // has the plugin Buildings tools installed?
        "has_all_plugins": 1, // has the required plugins installed?
        "remote_control": 1, // has remote control enabled?
        "logged_in": 1, // is logged in?
        "is_running": 1 // is JOSM running?
    };

    var project = {
        "geometry": {
            "type": "MultiPolygon",
            "coordinates": [[[[28.99254667929771, -1.228972154544749], [29.002406862935736, -1.228972154544749], [29.04924273521637, -1.332478204824155], [29.162634847053695, -1.39655122077341], [29.162634847053695, -1.416265647207857], [29.078823286130454, -1.522227757714708], [29.06033544180915, -1.520995669372182], [29.06280048771866, -1.583831265287025], [29.022127230211794, -1.583831265287025], [29.024592276121297, -1.573974825293451], [28.99254667929771, -1.572742767012345], [28.99254667929771, -1.228972154544749]]]]
        },
        "type": "Feature",
        "id": 2329,
        "properties": {
            "status": 1,
            "changeset_comment": "#hotosm-project-2329, #MissingMaps, Masisi #CongoDRC Added #majorroads using DG +Vivid",
            "name": "Missing Maps: Masisi territory, North Kivu, DRC (roads part 8)",
            "license": null,
            "created": "2016-11-16T13:58:55Z",
            "description": "",
            "priority": 2,
            "done": 11.98,
            "validated": 0.53
        }
    };
}
var monthNames = [
    "ledna", "února", "března",
    "dubna", "května", "června", "července",
    "srpna", "září", "října",
    "listopadu", "prosince"
];


var showState = function ($checkContainer, checkName, state) {
    var result = 0;
    var $check = $checkContainer.find(checkName);
    if ($check.length) {
        $check.find('span').hide();
        if (state === null) {
            $check.find('.checking').show();
        } else if (state == 0) {
            $check.find('.error').show();
        } else {
            $check.find('.correct').show();
            result = 1;
        }
    }
    return result;
};

var doLocalJsonCheck = function ($, noRepeat) {
    if (allowLocalJsonCheck && !allChecksPassed) {
        $.ajax({
            url: 'local.json',
            method: 'GET',
            dataType: 'json',
            cache: false,
            timeout: 500,
            success: function (localJosm) {
                checksPassed = 0;
                if (localJosm.is_installed) {
                    $('.mm-basic').addClass('less-interesting');
                    $checkContainer.show();
                    checksPassed += showState($checkContainer, '.has-buildings-tools', localJosm.buildings_tools);
                    checksPassed += showState($checkContainer, '.has-remote-control', localJosm.remote_control);

                    checksPassed += showState($checkContainer, '.is-logged-in', localJosm.logged_in);
                    checksPassed += showState($checkContainer, '.is-running', localJosm.is_running);
                    if (checksPassed >= checkCount) {
                        allChecksPassed = true;
                    }
                } else {
                    allowLocalJsonCheck = false;
                }
            },
            error: function () {
                // no local.JSON, omit local checks
                allowLocalJsonCheck = false;
            }
        });
    }
};

var doJosmCheck = function ($, $checkContainer) {
    if (allowJosmRemoteCheck) {
//        showState($checkContainer, '.is-remote-control', null);
//        window.setTimeout(function () {
        $.ajax({
            url: 'http://localhost:8111/features',
            method: 'GET',
            dataType: 'json',
            cache: true,
            timeout: 500,
            success: function (features) {
                if (features.length > 0) {
                    allChecksPassed = true;
                    showState($checkContainer, '.is-remote-control', 1);
                    rcWorkCountdown--;
                } else {
                    showState($checkContainer, '.is-remote-control', 0);
                }
            },
            error: function () {
                showState($checkContainer, '.is-remote-control', 0);
                //allowJosmRemoteCheck = false;
            }
        });
//        }, 500)

        if (rcWorkCountdown <= 0) {
            allowJosmRemoteCheck = false;
        }
    }
};

var processCoordinates = function (coords, coordMaxMin) {
    if (typeof(coordMaxMin) === 'undefined') {
        coordMaxMin = {
            "left": +180,
            "right": -180,
            "bottom": +90,
            "top": -90
        };
    }
    if (coords.length === 2) {
        if (coordMaxMin.left > coords[0]) {
            coordMaxMin.left = coords[0];
        }
        if (coordMaxMin.right < coords[0]) {
            coordMaxMin.right = coords[0];
        }
        if (coordMaxMin.bottom > coords[1]) {
            coordMaxMin.bottom = coords[1];
        }
        if (coordMaxMin.top < coords[1]) {
            coordMaxMin.top = coords[1];
        }
    } else {
        for (var i = coords.length - 1; i >= 0; i--) {
            coordMaxMin = processCoordinates(coords[i], coordMaxMin);
        }
    }
    return coordMaxMin;
};

var doCheckTask = function ($) {
    doLocalJsonCheck($, true);
    $('.mm-is-offline').hide();
    $('.mm-is-online-checking').show();
    $.ajax({
        url: 'https://piskvor.github.io/missingMapsMisc/mm.json',
        method: 'GET',
        dataType: 'json',
        cache: false,
        timeout: 30000,
        success: function (data) {
            $('.mm-is-online-checking').hide();
            $('.mm-is-online-done').show();
            $('body').addClass('mm-is-page-online');
            if (data.currentMapathon) {
                var loopBy = ['basic', 'advanced'];
                var checkAreas = [];
                var areaData = {};
                for (var i = loopBy.length - 1; i >= 0; i--) {
                    if (data.currentMapathon.projects[loopBy[i]]) {
                        var project = data.currentMapathon.projects[loopBy[i]];
                        $('.mm-' + loopBy[i] + ' .mm-link').each(function (idx, xlink) {
                            var link = $(xlink);
                            var dataHref = link.data('href');
                            if (dataHref) {
                                var projectHref = dataHref.replace('__ID__', project.id);
                                if (link.hasClass('project-link') && checkAreas.indexOf(projectHref) < 0) {
                                    checkAreas.push(projectHref);
                                    areaData[project.id] = project;
                                    areaData[project.id].href = projectHref;
                                    link.addClass('project-link-' + project.id);
                                } else if (link.hasClass('smtw-link')) {
                                    link.addClass('smtw-link-' + project.id);
                                }
                                link.data('project-id', project.id);
                                link.attr('href', projectHref);
                                link.text(link.text().replace('__ID__', project.id).replace('__NAME__', project.name));
                            }
                        });
                    } else {
                        $('.mm-' + loopBy[i]).hide();
                    }
                }
                var $smtw = $('.smtw');
                $smtw.each(function (idx, elem) {
                    var $elem = $(elem);
                    if (checkAreas.length < 2 && idx === 0) {
                        // only show one SMTW link
                        $elem.hide();
                    } else {
                        var $smtwLink = $elem.find('.smtw-link');
                        var projectId = $smtwLink.data('project-id');
                        if (projectId && areaData[projectId]) {
                            if (allowOsmtmCheck && typeof(areaData[projectId].bounds) === 'undefined') {
                                var jsonHref = areaData[projectId].href + '.json';
                                var $links = $('.smtw-link-' + project.id);
                                $('.smtw-checking').removeClass('hide').show();
                                $.ajax({
                                    url: jsonHref,
                                    method: 'GET',
                                    dataType: 'json',
                                    cache: true,
                                    timeout: 30000,
                                    success: function (project) {
                                        var done = null;
                                        if (typeof(project.properties.done) !== 'undefined') {
                                            done = project.properties.done;
                                        }
                                        areaData[projectId].done = done;
                                        areaData[projectId].coords = null;
                                        if (typeof(project.geometry) !== 'undefined' || typeof(project.geometry.coordinates) !== 'undefined') {
                                            areaData[projectId].coords = processCoordinates(project.geometry.coordinates);
                                            var coordString =  '&bounds=' + areaData[projectId].coords.left + ',' +areaData[projectId].coords.bottom + ',' + areaData[projectId].coords.right + ',' + areaData[projectId].coords.top;

                                            $links.prop('href', $links.prop('href') + coordString);
                                        }

                                        if (areaData[projectId].done > 0) {
                                            $('.project-link-' + projectId).closest('.mm-is-online-done').find('.smtw-status').show().text('(' + areaData[projectId].done + '% hotovo)');
                                        }
                                        $('.smtw-checking').hide();
                                    },
                                    error: function () {
                                        $('.smtw-checking').hide();
                                    }
                                });
                            }
                        }
                    }
                });
                $("#current-mapathon-name").text(data.currentMapathon.name);
                $("#current-mapathon-location").prop("href", data.currentMapathon.location.link).text(data.currentMapathon.location.name);
                $("#current-mapathon-map").prop("href", data.currentMapathon.location.map).text(data.currentMapathon.location.address);
                var startDate = null;
                var dates = data.currentMapathon.start.match(/((19|20)\d\d)([- /.])(0[1-9]|1[012])\3(0[1-9]|[12][0-9]|3[01])T([012]?[0-9]):([0-5]?[0-9]):([0-5]?[0-9])Z/);
                if (dates) {
                    startDate = new Date();
                    startDate.setUTCFullYear(dates[1]);
                    startDate.setUTCMonth(dates[4] - 1);
                    startDate.setUTCDate(dates[5]);
                    startDate.setUTCHours(dates[6]);
                    startDate.setUTCMinutes(dates[7]);
                    startDate.setUTCSeconds(dates[8]);
                } else {
                    var dateTS = Date.parse(data.currentMapathon.start);
                    if (dateTS) {
                        startDate = new Date(dateTS);
                    }
                }

                if (startDate) {
                    var day = startDate.getDate();
                    var monthIndex = startDate.getMonth();
                    var year = startDate.getFullYear();
                    var hours = startDate.getHours();
                    var minutes = startDate.getMinutes();

                    var $cmdate = $('#current-mapathon-date');
                    $cmdate.attr('datetime', data.currentMapathon.start)
                           .text(day + ". " + monthNames[monthIndex] + " " + year + " v " + hours + ":" + (minutes < 10 ? "0" : "") + minutes);
                    if (isTimeagoLoaded) {
                        $('#current-mapathon-timeago').attr('datetime', $cmdate.attr('datetime')).timeago();
                        $cmdate.append(', tj.');
                    }
                    $('.date-part').show();
                }
            } else {
                $('.mm-advanced').hide();
                $('.mm-link').each(function (idx, xlink) {
                    var link = $(xlink);
                    link.attr('href', link.data('href').replace('__ID__', data.current));
                    link.text(link.text().replace('__ID__', data.current));
                });
            }
            doLocalJsonCheck($, true);
        },
        error: function () {
            Offline.check();
        }
    })
};

if (isLoadedCorrectly) {
    Offline.on('up', function () {
        doCheckTask(jQuery);
    });
    Offline.on('down', function () {
        jQuery('.mm-basic,.mm-advanced,.mm-is-online-checking').hide();
        jQuery('.show').show();
        $('body').removeClass('mm-is-page-online');
    });

    jQuery(function ($) {
        $checkContainer = $('.josm-check');
        $('.hide').hide();
        doLocalJsonCheck($);
        doJosmCheck($, $checkContainer);
        Offline.check();
        doCheckTask($);
        window.setInterval(function () {
            doJosmCheck($, $checkContainer);
            doLocalJsonCheck($);
        }, 3000);

    });
}
