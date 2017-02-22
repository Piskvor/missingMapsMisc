<?php

/**
 * Caches files by directory and name - currently only 1-level dirs supported
 */
class DirCache
{

    /** @var string */
    private $cacheDirRelative = 'cache';

    /** @var  string */
    private $cacheDir;

    /** @var int */
    private $defaultExpiry = 7200;

    /**
     * DirCache constructor.
     * @param string $dir
     * @throws \InvalidArgumentException
     */
    public function __construct($dir = null)
    {
        if ($dir) {
            $this->cacheDir = $dir;
        } else {
            /** @noinspection RealpathInSteamContextInspection */
            $this->cacheDir = realpath(__DIR__ . DIRECTORY_SEPARATOR . '..'
                . DIRECTORY_SEPARATOR . $this->cacheDirRelative);
        }
        if (!is_writable($this->cacheDir)) {
            throw new InvalidArgumentException('Cache directory not writable!');
        }
    }

    /**
     * Checks if a fresh entry for the file exists
     * @param string $dir
     * @param string $file
     * @return bool true if cached, false if not exists or if stale
     */
    public function exists($dir,$file) {
        $dir = $this->sanitize($dir);
        $file = $this->sanitize($file);
        if ($file === '' || basename($dir) !== $dir || basename($file) !== $file) {
            return false;
        }
        $filename = $this->cacheDir . DIRECTORY_SEPARATOR . $dir . DIRECTORY_SEPARATOR . $file;
        return file_exists($filename) && !is_link($filename) && $this->isFresh($filename);
    }


    /**
     * Reads the file's content from cache
     * @param string $dir
     * @param string $file
     * @return false|string
     */
    public function fetch($dir,$file) {
        $dir = $this->sanitize($dir);
        $file = $this->sanitize($file);
        if (!$this->exists($dir,$file)) {
            return false;
        }
        $filename = $this->cacheDir . DIRECTORY_SEPARATOR . $dir . DIRECTORY_SEPARATOR . $file;
        if (file_exists($filename)) {
            return file_get_contents($filename);
        } else {
            return false;
        }
    }

    /**
     * Saves a file's content into cache
     * @param string $dir
     * @param string $file
     * @param string $content
     * @throws ErrorException
     */
    public function save($dir, $file, $content) {
        $dir = $this->sanitize($dir);
        $file = $this->sanitize($file);
        $dirName = $this->cacheDir . DIRECTORY_SEPARATOR . $dir;
        if (!@mkdir($dirName) && !is_dir($dirName)) {
            throw new \ErrorException('Cannot create directory');
        }
        $filename = $dirName . DIRECTORY_SEPARATOR . $file;

        file_put_contents($filename, $content);
    }

    /**
     * @param string $insaneString
     * @return string sane string
     */
    private function sanitize($insaneString)
    {
        return preg_replace('/[^A-Za-z0-9._-]/','',$insaneString);
    }

    /**
     * @param string $filename
     * @return bool false if file expired, true if fresh
     */
    private function isFresh($filename)
    {
        return (filemtime($filename) + $this->defaultExpiry) > time();
    }
}
