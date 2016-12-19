var rnd = Math.random();
Offline.options = {
    checks: {
        image: {url: 'https://piskvor.github.io/missingMapsMisc/offlineLandingPage/josm.png?_' + rnd},
        active: 'image'
    }
};

var doCheckTask = function ($) {
    $('.mm-is-offline').hide();
    $('.mm-is-online-checking').show();
    $.ajax({
        url: 'https://piskvor.github.io/missingMapsMisc/mm.json',
        method: 'GET',
        dataType: 'json',
        cache: false,
        timeout: 30000,
        success: function (data, status, xhr) {
            $('.mm-is-online-checking').hide();
            $('.mm-is-online-done').show();
            $('.mm-link').each(function (idx, xlink) {
                var link = $(xlink);
                link.attr('href', link.data('href').replace('__ID__', data.current));
                link.text(link.text().replace('__ID__', data.current));
            });
        },
        error: function (xhr, errorType, error) {
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
