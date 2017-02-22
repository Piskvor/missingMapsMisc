<?php

class ConditionalResponder
{
    /**
     * Adds an ETag header.
     * If matches previous version, send a 304 and exit.
     * @param $content
     * @param string $ifNoneMatch
     */
    public function sendResponse($content, $ifNoneMatch = null) {
        $hash = '"' . md5($content) . '"'; // we need *a* hash, not particularly collision-resistant
        header('ETag: ' . $hash);
        if ($ifNoneMatch === $hash) {
            header('HTTP/1.1 304 Not Modified');
            exit;
        } else {
            echo $content;
        }
    }
}
