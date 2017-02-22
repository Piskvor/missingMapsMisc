<?php

// Using an autoloader might be overkill here.
// @todo: use autoloader if extending further
require_once __DIR__ . '/src/UrlFetching.php';
require_once __DIR__ . '/src/CachingFetcher.php';
require_once __DIR__ . '/src/CurlFetcher.php';
require_once __DIR__ . '/src/DirCache.php';

require_once __DIR__ . '/src/ConditionalResponder.php';
require_once __DIR__ . '/src/Converter.php';

require_once __DIR__ . '/src/AbstractCoordinateParser.php';
require_once __DIR__ . '/src/ProjectParser.php';
require_once __DIR__ . '/src/NaivePolygonParser.php';
require_once __DIR__ . '/src/Polygon.php';
require_once __DIR__ . '/src/NullPolygon.php';
require_once __DIR__ . '/src/Bounds.php';

$cache = new DirCache();
$fetcher = new CachingFetcher(new CurlFetcher(), $cache);
$poly = new NaivePolygonParser();
$responder = new ConditionalResponder();

$contentType = Converter::getResponseType($_SERVER['REDIRECT_URL']);

header('Content-Type: ' . $contentType . '; charset=utf-8');
header('Cache-Control: public, max-age=3600, post-check=1800, pre-check=3600');

$taskmanProjectId = 0;
if (isset($_SERVER['REDIRECT_URL'])) {
    $taskmanProjectId = (int)Converter::getTaskmanId($_SERVER['REDIRECT_URL']);
}

if (!$taskmanProjectId) {
    if (isset($_REQUEST['project'])) {
        $taskmanProjectId = (int)$_REQUEST['project'];
    } else if (isset($_REQUEST['id'])) {
        $taskmanProjectId = (int)$_REQUEST['id'];
    } else if (isset($_SERVER['QUERY_STRING'])) {
        $taskmanProjectId = (int)$_SERVER['QUERY_STRING'];
    }
}

if ($taskmanProjectId <= 0) {
    $taskmanProjectId = '';
    $parser = null;
} else {
    $parser = new ProjectParser($fetcher, $cache, $poly, $taskmanProjectId);
}

if ($contentType === 'application/json') {
    if ($taskmanProjectId && $parser && !$parser->isEmpty()) {
        $responder->sendResponse(
            $parser->getProjectJson(strpos($_SERVER['REDIRECT_URL'], '-simplified') > -1),
            isset($_SERVER['HTTP_IF_NONE_MATCH']) ? $_SERVER['HTTP_IF_NONE_MATCH'] : null
        );
    } else {
        echo '{}';
    }
} else if ($taskmanProjectId && $parser && $contentType === 'text/xml') {
    if (isset($_REQUEST['task'])) {
        $taskId = (int)$_REQUEST['task'];
        $urlTemplate = 'http://tasks.hotosm.org/project/%d/task/%d.gpx';
        $responder->sendResponse(
            str_replace('Do not edit outside of this box!', '', $fetcher->fetch(sprintf($urlTemplate, $taskmanProjectId, $taskId))),
            isset($_SERVER['HTTP_IF_NONE_MATCH']) ? $_SERVER['HTTP_IF_NONE_MATCH'] : null
        );
    } else {
        echo '';
    }

} else if ($taskmanProjectId && $parser && $contentType === 'text/plain') {
    $responder->sendResponse(
        $parser->getPolygon(),
        isset($_SERVER['HTTP_IF_NONE_MATCH']) ? $_SERVER['HTTP_IF_NONE_MATCH'] : null
    );
} else {
    // yeah, yeah, this is not how you make a webpage in 2017.
    // Is it the simplest thing that could possibly work? Yes.
    // @todo: use a sane template
    $result = <<<HEADER
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Taskman project ID converted to a bounding box</title>
</head>

<body>

    <form action="./" method="GET"><label>Enter project ID: <input type="number" name="project" value="$taskmanProjectId" title="HOTOSM project ID"></label><input type="submit" value="Compute bounding box"></form>
HEADER;

    if ($taskmanProjectId && $parser) {
        $bounds = $parser->getBounds()->getArray();
        $name = $parser->getName();
        $url = 'https://osmlab.github.io/show-me-the-way/#comment=hotosm-project-' . $taskmanProjectId
            . '&bounds=' . $bounds['bottom'] . ',' . $bounds['left'] . ',' . $bounds['top'] . ',' . $bounds['right'];
        echo '<div><a href="' . $url . '">#' . $taskmanProjectId . ' - ' . $name . '</a></div>';
    }
    $result .= <<<FOOTER
</body>

</html>
FOOTER;
    $responder->sendResponse(
        $result,
        isset($_SERVER['HTTP_IF_NONE_MATCH']) ? $_SERVER['HTTP_IF_NONE_MATCH'] : null
    );
}

