<?php

class AbstractCoordinateParser
{

    /**
     * Go through array of arrays of coordinates, return a bounding box
     * @param array[] $coords
     * @param array $coordMaxMin
     * @param int $maxDepth
     * @return array
     */
    protected function processCoordinates($coords, $coordMaxMin = null, $maxDepth = 20)
    {
        if (!$coordMaxMin) {
            $coordMaxMin = array(
                'left' => +180,
                'right' => -180,
                'bottom' => +90,
                'top' => -90
            );
        }
        if ($maxDepth > 0) {
            if (count($coords) === 2 && is_float($coords[0]) && is_float($coords[1])) {
                if ($coordMaxMin['left'] > $coords[0]) {
                    $coordMaxMin['left'] = $coords[0];
                }
                if ($coordMaxMin['right'] < $coords[0]) {
                    $coordMaxMin['right'] = $coords[0];
                }
                if ($coordMaxMin['bottom'] > $coords[1]) {
                    $coordMaxMin['bottom'] = $coords[1];
                }
                if ($coordMaxMin['top'] < $coords[1]) {
                    $coordMaxMin['top'] = $coords[1];
                }
            } else {
                for ($i = count($coords) - 1; $i >= 0; $i--) {
                    $coordMaxMin = $this->processCoordinates($coords[$i], $coordMaxMin, $maxDepth - 1);
                }
            }
        }
        return $coordMaxMin;
    }
}
