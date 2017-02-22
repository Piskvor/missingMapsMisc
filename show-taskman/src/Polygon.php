<?php

/**
 * Represents the .poly format; like NaivePolygonParser, this deals with contiguous regions without holes.
 */
class Polygon extends AbstractCoordinateParser
{
    protected $coordinates = [];
    private $name;
    private $ident;
    private $endLine = "\n";
    private $separator = "\t";
    private $endSection = 'END';

    /**
     * Polygon constructor.
     * @param array $coordinates
     * @param string $name
     * @param string $ident
     */
    public function __construct($coordinates,$name = null,$ident = null)
    {
        if (!$name) {
            $name = 'none';
        }
        if (!$ident) {
            $ident = '1';
        }
        $this->name = $name;
        $this->ident = $ident;
        $this->coordinates = $coordinates;
    }

    /**
     * An empty polygon - easier to handle than a NULL
     * @return NullPolygon
     */
    public static function getEmpty()
    {
        return new NullPolygon();
    }

    /**
     * Returns a string representation in the .poly format
     * @return string
     */
    public function toString() {
        $result = $this->name . $this->endLine;
        $result .= $this->ident . $this->endLine;
        foreach ($this->coordinates as $coordPair) {
            $result .= $this->separator . $this->formatFloat($coordPair[0])
                . $this->separator . $this->formatFloat($coordPair[1])
                . $this->endLine;
        }
        $result .= $this->endSection . $this->endLine;
        $result .= $this->endSection . $this->endLine;
        return $result;
    }

    /**
     * For a polygon, return its bounding box.
     * @return Bounds
     */
    public function getBounds() {
        return new Bounds($this->processCoordinates($this->coordinates));
    }

    /**
     * Returns the float in suitable output format
     * @param float $floatInput
     * @return string
     */
    public function formatFloat($floatInput)
    {
        return (string)$floatInput;
    }

    /**
     * Return the name of the polygon
     * @return string
     */
    public function getName() {
        return $this->name;
    }

    /**
     * Allow typecasting to string
     * @return string
     */
    public function __toString()
    {
        return $this->toString();
    }

    /**
     * Returns true is no coordinates, false if any exist
     * @return bool
     */
    public function isEmpty()
    {
        return count($this->coordinates) === 0;
    }
}
