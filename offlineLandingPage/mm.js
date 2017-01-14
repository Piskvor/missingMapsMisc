var rnd = Math.random();
Offline.options = {
    checks: {
        image: {
            url: 'https://piskvor.github.io/missingMapsMisc/offlineLandingPage/josm.png?_' + rnd
        },
        active: 'image'
    }
};

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

    var localJosm = { // the following are only checked for a local instance and generated by an outside process
        "is_installed": 1, // is JOSM and its checker even installed?
        "buildings_tools": 1, // has the plugin Buildings tools installed?
        "has_all_plugins": 1, // has the required plugins installed?
        "remote_control": 1, // has remote control enabled?
        "logged_in": 1, // is logged in?
        "is_running": 1 // is JOSM running?
    }
}
var monthNames = [
    "ledna", "února", "března",
    "dubna", "května", "června", "července",
    "srpna", "září", "října",
    "listopadu", "prosince"
];

var allowLocalJsonCheck = true;
var allowJosmRemoteCheck = true;
var allChecksPassed = false;
var checkCount = 4;

if (window.location.hostname.indexOf('local') === -1 || window.location.port != 8080) { // localhost or missingmaps.local.
    allowLocalJsonCheck = false; // we're not in local server
}

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
            timeout: 3000,
            success: function (localJosm) {
                var checksPassed = 0;
                if (localJosm.is_installed) {
                    $('.mm-basic').addClass('less-interesting');
                    var $checkContainer = $('.josm-check');
                    $checkContainer.show();
                    checksPassed += showState($checkContainer, '.has-buildings-tools', localJosm.buildings_tools);
                    checksPassed += showState($checkContainer, '.has-remote-control', localJosm.remote_control);
                    checksPassed += showState($checkContainer, '.is-logged-in', localJosm.logged_in);
                    checksPassed += showState($checkContainer, '.is-running', localJosm.is_running);

                    if (checksPassed < checkCount && !noRepeat) {
                        window.setTimeout(function () {
                            doLocalJsonCheck($);
                        }, 2000);
                    } else {
                        allChecksPassed = true;
                        doJosmCheck($, $checkContainer);
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

var doJosmCheck = function($, $checkContainer) {
    $.ajax({
        url: 'http://localhost:8111/features',
        method: 'GET',
        dataType: 'json',
        cache: false,
        timeout: 3000,
        success: function (features) {
            if (features.length > 0) {
                showState($checkContainer, '.is-remote-control', 1);
            } else {
                showState($checkContainer, '.is-remote-control', 0);
            }
        },
        error: function () {
            showState($checkContainer, '.is-remote-control', 0);
        }
    });
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
                for (var i = loopBy.length - 1; i >= 0; i--) {
                    if (data.currentMapathon.projects[loopBy[i]]) {
                        var project = data.currentMapathon.projects[loopBy[i]];
                        $('.mm-' + loopBy[i] + ' .mm-link').each(function (idx, xlink) {
                            var link = $(xlink);
                            var dataHref = link.data('href');
                            if (dataHref) {
                                link.attr('href', dataHref.replace('__ID__', project.id));
                                link.text(link.text().replace('__ID__', project.id).replace('__NAME__', project.name));
                            }
                        });
                    } else {
                        $('.mm-' + loopBy[i]).hide();
                    }
                }
                $("#current-mapathon-name").text(data.currentMapathon.name);
                $("#current-mapathon-location").prop("href", data.currentMapathon.location.link).text(data.currentMapathon.location.name);
                $("#current-mapathon-map").prop("href", data.currentMapathon.location.map).text(data.currentMapathon.location.address);
                var startDate = null;
                var dates = data.currentMapathon.start.match(/((19|20)\d\d)([- /.])(0[1-9]|1[012])\3(0[1-9]|[12][0-9]|3[01]) ([012]?[0-9]):([0-5]?[0-9])/);
                if (dates) {
                    startDate = new Date();
                    startDate.setFullYear(dates[1]);
                    startDate.setMonth(dates[4] - 1);
                    startDate.setDate(dates[5]);
                    startDate.setHours(dates[6]);
                    startDate.setMinutes(dates[7]);
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

                    $('#current-mapathon-date').text(day + ". " + monthNames[monthIndex] + " " + year + " v " + hours + ":" + (minutes < 10 ? "0" : "") + minutes);
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
            doLocalJsonCheck($);
        },
        error: function () {
            Offline.check();
        }
    })
};

Offline.on('up', function () {
    doCheckTask(Zepto);
});
Offline.on('down', function () {
    Zepto('.mm-basic,.mm-advanced,.mm-is-online-checking').hide();
    Zepto('.show').show();
    $('body').removeClass('mm-is-page-online');
});

Zepto(function ($) {
    $('.hide').hide();
    doLocalJsonCheck($);
    Offline.check();
    doCheckTask($);
});
