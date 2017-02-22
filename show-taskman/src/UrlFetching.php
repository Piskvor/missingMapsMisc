<?php

interface UrlFetching
{
    /**
     * @param string $url
     * @return string|false
     */
    public function fetch($url);
}
