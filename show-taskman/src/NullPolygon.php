<?php

/**
 * An empty polygon. Note that not every empty polygon is necessarily a NullPolygon, but they behave identically
 * @see Polygon::isEmpty()
 */
class NullPolygon extends Polygon
{
    /**
     * {@inheritDoc}
     */
    public function __construct($coordinates = null, $name = null, $ident = null)
    {
        if (!$coordinates) {
            $coordinates = [];
        }
        parent::__construct($coordinates, $name, $ident);
    }

    /**
     * @return Bounds - empty bounds, that is.
     */
    public function getBounds()
    {
        // no need to traverse coordinates
        return new Bounds($this->coordinates);
    }


}
