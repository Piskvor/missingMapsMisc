<?php

class Converter
{
    /**
     * From URL path, return TM project ID
     * @param string $path
     * @return int
     */
    public static function getTaskmanId($path) {
        $taskmanId = 0;
        // get TM project ID
        if (!empty($path)) {
            $matches = [];
            if (preg_match('/show-taskman.([0-9]+)/', $path, $matches)) {
                $taskmanId = (int) $matches[1];
            }
        }
        return $taskmanId;
    }

    /**
     * Choose the appropriate response type from request URL path
     * @param string $path
     * @return string
     */
    public static function getResponseType($path) {
        if (preg_match('/\.json$/', $path, $matches)) {
            return 'application/json';
        } elseif (preg_match('/\.poly$/', $path, $matches)) {
            return 'text/plain';
        } elseif (preg_match('/\.gpx$/', $path, $matches)) {
            return 'text/xml';
        } else {
            return 'text/html';
        }
    }
}
