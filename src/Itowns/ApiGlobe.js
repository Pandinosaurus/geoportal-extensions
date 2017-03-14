define([
    "itowns"
], function (
    itowns
) {

    "use strict";

    /**
     * @classdesc
     *
     * ApiGlobe
     *
     */
    function ApiGlobe () {
        this.controls = [];
    };

    /**
     * Constructor (alias)
     */
    ApiGlobe.prototype = itowns.viewer;

    /**
     * Constructor (alias)
     */
    ApiGlobe.prototype.constructor = ApiGlobe;

    /**
     * Add a widget.
     */
    ApiGlobe.prototype.addControl = function addControl(control) {
        this.viewerDiv.appendChild(control.pElement);
        this.getControls().push(control);
        control.setMap(this);
    };

    /**
     * Returns all widgets.
     * @return     {array}  The array of widgets.
     */
    ApiGlobe.prototype.getControls = function getControls() {
        return this.controls;
    };

    /**
     * Remove a widget.
     * @param {object} Widget - The Widget object.
     */
    ApiGlobe.prototype.removeControl = function removeControl(control) {
        control.setMap();
        this.controls.delete(control);
    };

    /**
     * Get the element that serves as the map viewport.
     */
    ApiGlobe.prototype.getViewport = function getViewport() {
        return this.viewerDiv;
    }

    /**
     * Get extent
     */
    ApiGlobe.prototype.getExtent = function getExtent() {
        return [90, -180, -90, 180];
    }

    /**
     * Get extent
     */
    ApiGlobe.prototype.getLayerExtent = function getLayerExtent(layer) {
        return [90, -180, -90, 180];
    }

    /**
     * Has layer
     */
    ApiGlobe.prototype.hasLayer = function hasLayer(layerId) {
        // return this.layersState[layerId]?1:0;
        return true;
    }

    /**
     * Has layer
     */
    ApiGlobe.prototype.getOrderedLayers = function getOrderedLayers() {
        return this.getImageryLayers();
    }

    /**
     * createSceneGlobe overload
     */
    ApiGlobe.prototype._parent_createSceneGlobe = ApiGlobe.prototype.createSceneGlobe;
    ApiGlobe.prototype.createSceneGlobe = function createSceneGlobe(coordCarto, viewerDiv) {
        viewerDiv.style.position = "relative";
        return this._parent_createSceneGlobe(coordCarto, viewerDiv);
    }

    return ApiGlobe;
});