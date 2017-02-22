<?php

class CachingFetcher implements UrlFetching
{
    private $fetcher;
    private $cache;

    /**
     * Inject the actual fetcher and cache
     * @param UrlFetching $fetcher
     * @param DirCache $cache
     * @throws \InvalidArgumentException
     */
    public function __construct(UrlFetching $fetcher, DirCache $cache)
    {
        if (is_a($fetcher, \CachingFetcher::class)) {
            throw new \InvalidArgumentException('Infinite fetcher loop detected!');
        }
        $this->fetcher = $fetcher;
        $this->cache = $cache;
    }

    /**
     * {@inheritDoc}
     */
    public function fetch($url)
    {
        if ($this->isAllowed($url)) {
            $filename = $this->getFilename($url);
            $hostname = $this->getHostname($url);
            $cachedVersion = $this->cache->fetch($hostname, $filename);
            if ($cachedVersion) {
                return $cachedVersion;
            } else {
                $content = $this->fetcher->fetch($url);
                if ($content) {
                    $this->cache->save($hostname, $filename, $content);
                    return $content;
                } else {
                    // explicitly return `false` rather than the falsy value we received
                    return false;
                }
            }
        } else {
            return false;
        }
    }

    /**
     * Turn URL into a filename (for caching)
     * @param $url
     * @return string
     */
    private function getFilename($url)
    {
        return basename($url);
    }

    /**
     * Parse hostname from URL
     * @param $url
     * @return string
     */
    private function getHostname($url)
    {
        return strtolower(parse_url($url, PHP_URL_HOST));
    }

    /**
     * Check if we can fetch the given URL - don't make this an open proxy!
     * @param $url
     * @return bool
     */
    private function isAllowed($url)
    {
        $scheme = parse_url($url, PHP_URL_SCHEME);
        return (
            $this->getHostname($url) === 'tasks.hotosm.org'
            && ($scheme === 'http' /* || $scheme === 'https' */)
        );
    }

}
