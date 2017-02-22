<?php

class Bounds {

    /**
     * @var array
     */
    private $boundsArray;

    /**
     * @param array $boundsArray
     */
    public function __construct($boundsArray)
    {
        $this->boundsArray = $boundsArray;
    }

    /**
     * Returns the bounding structure as an associative array
     * @return array
     */
    public function getArray() {
        $result = [];
        if (count($this->boundsArray)) {
            foreach ($this->boundsArray as $key => $float) {
                $result[$key] = sprintf('%.17f', $float);
            }
        }
        return $result;
    }

    /**
     * Returns the structure as an array of coordinates
     * @return array[]
     */
    public function getBoundingPoints() {
        $bounds = $this->getArray();
        $result = array(
            [$bounds['left'],$bounds['top']],
            [$bounds['right'],$bounds['top']],
            [$bounds['right'],$bounds['bottom']],
            [$bounds['left'],$bounds['bottom']]
        );
        return $result;
    }
}
