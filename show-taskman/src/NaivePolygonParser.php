<?php

/**
 * Parses and writes the .poly files - only deals with contiguous shapes without holes.
 */
class NaivePolygonParser {

    /**
     * @param $boundsData
     * @return Polygon
     */
    public function fromString($boundsData)
    {
        $boundsData = str_replace("\r",'', $boundsData);
        $rows = explode("\n",$boundsData);
        $name = array_shift($rows);
        $ident = array_shift($rows);
        $coordinates = [];
        foreach($rows as $row) {
            if ($row === 'END') {
                break;
            } else {
                $coords = explode("\t",trim($row));
                $coordinates[] = [(float)$coords[0],(float)$coords[1]];
            }
        }
        return new Polygon($coordinates,$name,$ident);
    }

    /**
     * @param array $boundsData
     * @param string $name
     * @return Polygon
     */
    public function fromBounds($boundsData, $name = null) {
        $ident = '1';
        $coordinates = [
            [$boundsData['left'], $boundsData['top']],
            [$boundsData['right'], $boundsData['top']],
            [$boundsData['right'], $boundsData['bottom']],
            [$boundsData['left'], $boundsData['bottom']]
        ];
        return new Polygon($coordinates,$name,$ident);
    }

}
