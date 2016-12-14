define([
    "ol",
    "woodman",
    "Ol3/Utils",
    "Common/Utils/SelectorID",
    "Common/Controls/ToolBoxDOM"
], function (
    ol,
    woodman,
    Utils,
    ID,
    ToolBoxDOM
) {

    "use strict";

    woodman.load("console");
    var logger = woodman.getLogger("toolbox");

    var ToolBox = {

        /**
        * liste des uid/map (pour chaque toolbox)
        * { map : uid }
        * Ex. { "map1" : 465456456486845 }
        */
        _toolbox : {},

        /**
        * Ajout d'un controle dans la ToolBox.
        * Creation de la toolbox si besoin...
        *
        * @param {ol.Map} map - ...
        * @param {ol.control.Control} ctrl - ...
        * @param {String} name - ...
        */
        add : function (map, ctrl, name) {
            logger.trace("ToolBox.add()", ctrl);

            if (! map) {
                logger.trace("map doesn't exist !?");
                return;
            }

            var mapContainer = map.getTargetElement();
            var mapDocument  = mapContainer.ownerDocument;
            var mapId = mapContainer.id;

            if (!this._toolbox || Object.keys(this._toolbox).length === 0 ) {
                this._toolbox[mapId] = ID.generate();
            } else {
                if (!this._toolbox[mapId]) {
                    this._toolbox[mapId] = ID.generate();
                }
            }

            var uid = this._toolbox[mapId];
            if (! mapDocument.getElementById(this.getToolBoxID(uid, name))) {
                logger.trace("create toolbox !");
                // creation et ajout de la toolbox sur la map
                var toolboxContainer = this._createToolBoxContainerElement(uid, name);
                var overlaysContainer = mapContainer.getElementsByClassName("ol-overlaycontainer-stopevent");
                overlaysContainer[0].appendChild(toolboxContainer);
                // mapContainer.appendChild(toolboxContainer);
            }

            // ajout du widget dans la toolbox
            var widgetContainer = mapDocument.getElementById(this.getWidgetID(uid, name));
            ctrl.setTarget(widgetContainer);
            logger.trace("add control to toolbox !");

        }
    };

    Utils.assign(ToolBox, ToolBoxDOM);

    return ToolBox;

});
