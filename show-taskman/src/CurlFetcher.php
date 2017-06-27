<?php

class CurlFetcher implements UrlFetching
{

    /**
     * {@inheritDoc}
     */
    public function fetch($url)
    {
        $ch = curl_init();
        $timeout = 30;
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
        $data = curl_exec($ch);
        curl_close($ch);
        if (!$data) {
            return false;
        } else {
            return $data;
        }
    }
}
