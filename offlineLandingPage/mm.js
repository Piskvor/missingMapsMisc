var rnd = Math.random();
Offline.options = {
    checks: {
        image: {
            url: 'https://piskvor.github.io/missingMapsMisc/offlineLandingPage/josm.png?_' + rnd
        },
        active: 'image'
    }
};

if (0) {
// dummy structure for parsing
    var data = {
        "current": 2398, // task to do if there's no mapathon currently running
        "currentMapathon": {
            "projects": {
                "basic": { // editing with iD
                    "id": 2398, // project ID
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
                "link": "https://openstreetmap.cz/way/8072073" // link to provide
            }
        }
    };
}

var doCheckTask = function ($) {
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
            if (data.currentMapathon) {
                var loopBy = ['basic','advanced'];
                for (var i = loopBy.length - 1; loopBy.length >= 0; i--) {
                    if (data.currentMapathon.projects[loopBy[i]]) {
                        var project = data.currentMapathon.projects[loopBy[i]];
                        $('.mm-' + loopBy[i] + ' .mm-link').each(function (idx, xlink) {
                            var link = $(xlink);
                            link.attr('href', link.data('href').replace('__ID__', project.id));
                            link.text(link.text().replace('__ID__', project.id).replace('__NAME__', project.name));
                        });
                    } else {
                        $('.mm-' + loopBy[i]).hide();
                    }
                }
            } else {
                $('.mm-advanced').hide();
                $('.mm-link').each(function (idx, xlink) {
                    var link = $(xlink);
                    link.attr('href', link.data('href').replace('__ID__', data.current));
                    link.text(link.text().replace('__ID__', data.current));
                });
            }
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
    Zepto('.hide').hide();
    Zepto('.show').show();
});

Zepto(function ($) {
    $('.hide').hide();
    Offline.check();
    doCheckTask($);
});
