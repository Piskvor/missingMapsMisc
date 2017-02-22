<?php

class ProjectParser extends AbstractCoordinateParser
{

    /**
     * @var CachingFetcher|UrlFetching
     */
    private $fetcher;
    /**
     * @var DirCache
     */
    private $cache;
    /**
     * @var NaivePolygonParser
     */
    private $poly;
    /**
     * @var int
     */
    private $taskmanId;
    /**
     * @var string
     */
    private $taskName;
    /**
     * @var string
     */
    private $urlTemplate = 'http://tasks.hotosm.org/project/%d.json';

    /**
     * ProjectParser constructor.
     * @param UrlFetching $fetcher
     * @param DirCache $cache
     * @param NaivePolygonParser $poly
     * @param int $taskmanId
     */
    public function __construct(UrlFetching $fetcher, DirCache $cache, NaivePolygonParser $poly, $taskmanId)
    {
        $this->fetcher = $fetcher;
        $this->cache = $cache;
        $this->poly = $poly;
        $this->taskmanId = $taskmanId;
    }

    /**
     * Get the project bounds by loading its polygon and asking for *its* bounds
     * @return Bounds
     */
    public function getBounds()
    {
        return $this->getPolygon()->getBounds();
    }

    /**
     * Get the project polygon:
     *  - if .poly precomputed, load from cache
     *  - if .json in cache, load and compute .poly
     *  - else load .json from TM
     * @return Polygon
     */
    public function getPolygon()
    {
        $boundsFile = $this->taskmanId . '.poly';
        $polygonString = $this->cache->fetch('polygons', $boundsFile);
        $boundsPoly = Polygon::getEmpty();
        if ($polygonString) {
            $boundsPoly = $this->poly->fromString($polygonString);
        }
        if (!$boundsPoly->isEmpty()) {
            $this->taskName = $boundsPoly->getName();
        } else {
            $projectData = $this->getProjectData();
            if (isset($projectData['properties'], $projectData['properties']['name'])) {
                $this->taskName = $projectData['properties']['name'];
            }
            if (isset($projectData['geometry'], $projectData['geometry']['coordinates'])) {
                $bounds = $this->processCoordinates($projectData['geometry']['coordinates']);
                $boundsPoly = $this->poly->fromBounds($bounds, $this->taskName);
                $this->cache->save('polygons', $boundsFile, $boundsPoly->toString());
            }
        }
        return $boundsPoly;
    }

    /**
     * Check if empty by asking the polygon
     * @return bool
     */
    public function isEmpty() {
        return $this->getPolygon()->isEmpty();
    }

    /**
     * Load the JSON data from cache/OSMTM
     * @return array
     */
    private function getProjectData() {
        $projectData = @json_decode($this->fetch(), true);
        if (json_last_error()) {
            $projectData = array();
        }
        return $projectData;
    }

    /**
     * Fetch from URL (cached)
     * @return false|string
     */
    public function fetch() {
        return $this->fetcher->fetch($this->getUrl());
    }

    public function fetchSimplified() {
        $projectFile = $this->taskmanId . '-simplified.json';
        $hostname = 'tasks.hotosm.org';
        $cachedVersion = $this->cache->fetch($hostname, $projectFile);
        if ($cachedVersion) {
            return $cachedVersion;
        } else {
            $polygon = $this->getPolygon();
            $projectData = $this->getProjectData();
            if ($projectData && isset($projectData['geometry'])) {
                $projectData['geometry']['coordinates'] = $polygon->getBounds()->getBoundingPoints();
            }
            $content = json_encode($projectData);
            if ($content) {
                $this->cache->save($hostname, $projectFile, $content);
                return $content;
            } else {
                return '{}';
            }
        }
    }

    public function getProjectJson($simplifiedBox = false)
    {
        if ($this->isEmpty()) {
            return '{}';
        } else if ($simplifiedBox) {
            return $this->fetchSimplified();
        } else {
            return $this->fetch();
        }
    }

    private function getUrl()
    {
        return sprintf($this->urlTemplate, $this->taskmanId);
    }

    public function getName()
    {
        return $this->taskName;
    }

}
