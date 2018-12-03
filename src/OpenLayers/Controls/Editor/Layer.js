import EventBus from "eventbus";
import EventEditor from "./Event";
import Style from "./Style";
import Legend from "./Legend";
import Filter from "./Filter";
import Utils from "../../../Common/Utils";
import Logger from "../../../Common/Utils/LoggerByDefault";

var logger = Logger.getLogger("editor-layer");

/**
 * @classdesc
 *
 * MapBox filter management
 *
 * @constructor
 * @param {Object} options - options for function call.
 * @example
 *   var layers = new Layer ({
 *      target : ...,
 *      position : 1,
 *      tools : {
 *          visibility : true, // afficher l'icone de visibilité
 *          type : true,       // afficher l'icone du type de geometrie
 *          remove : false,    // TODO afficher l'icone de suppression
 *          clone : false      // TODO afficher l'icone de duplication
 *      },
 *      obj : {
 *          id: "ocs - vegetation", // MANDATORY
 *          type: "fill", // OPTIONAL
 *          source: "pyramide_proto", // OPTIONAL
 *          source-layer: "ocs_vegetation_surf" // OPTIONAL
 *      }
 *   });
 *  layers.addLegend(oLegend);
 *  layers.slotLegend();
 *  layers.addStyle(oStyle);
 *  layers.addFilter(oFilter);
 *  layers.add();
 *  layers.active(false);
 *  layers.visibility(false);
 *  layers.display(false);
 *  layers.toggle();
 */
function Layer (options) {
    logger.trace("[constructor] Layer", options);

    // options
    this.options = options || {};

    if (!(this instanceof Layer)) {
        throw new TypeError("ERROR CLASS_CONSTRUCTOR");
    }

    this._initialize();

    this._initContainer();
};

/**
 * Constructor (alias)
 *
 * @private
 */
Layer.prototype.constructor = Layer;

/**
 * Initialize component
 * (called by constructor)
 *
 * @private
 */
Layer.prototype._initialize = function () {
    // unique editor id (optional!)
    this.id = this.options.id || null;

    if (!this.options.target) {
        // cf. add()
    }

    if (!this.options.position) {
        this.options.position = 0;
    }

    var _toolsDefault = {
        visibility : true,
        type : true,
        remove : false, // TODO
        clone : false // TODO
    };

    if (!this.options.tools) {
        this.options.tools = _toolsDefault;
    }

    Utils.mergeParams(this.options.tools, _toolsDefault, false);

    var _objDefault = {
        "id" : "",
        "type" : "", // icone sur le type de geometrie
        "source" : "",
        "source-layer" : ""
    };

    if (!this.options.obj) {
        this.options.obj = _objDefault;
    }

    Utils.mergeParams(this.options.obj, _objDefault, false);

    // legende intégrée
    this.bSlotLegend = false;

    // obj
    this.oFilter = null;
    this.oStyle = null;
    this.oLegend = null;

    // dom
    this.container = null;
    this.DomVisibility = null;
    this.DomToggle = null;

    // DOM : className or id
    this.name = {
        target : "GPEditorMapBoxLayerTarget",
        container : "GPEditorMapBoxLayerContainer",
        containerlegend : "GPEditorMapBoxLayerLegendContainer",
        containertitle : "GPEditorMapBoxLayerTitleContainer",
        imagelabel : "GPEditorMapBoxLayerImageLabel",
        typeimg : "GPEditorMapBoxLayerTypeImage",
        titleinput : "GPEditorMapBoxLayerTitleInput",
        titlelabel : "GPEditorMapBoxLayerTitleLabel",
        containertools : "GPEditorMapBoxToolsContainer",
        visibilityinput : "GPEditorMapBoxToolsVisibilityInput",
        visibilitylabel : "GPEditorMapBoxToolsVisibilityLabel"
    };
};

/**
 * Graphical rendering of the component
 * (called by constructor)
 *
 * @private
 * @example
 * // >> Titre 1          |OOO| <- menu tools : visibility, clone, remove
 * // >> Titre 2          |OXX| <- affichage configurable (cf. options.tools)
 * // Event : clic sur le titre -> ex. affiche le menu des styles / filtres
 * //       : clic visibility, clone, remove
 * // DOM :
 *      <div class="GPEditorMapBoxLayerContainer">
 *          <div id="GPEditorMapBoxLayerTitleContainer-45" class="GPEditorMapBoxLayerTitleContainer">
 *              <label class="GPEditorMapBoxLayerimageLabel"></label>
 *              <input id="GPEditorMapBoxLayerTitleInput-45" class="GPEditorMapBoxLayerTitleInput" type="checkbox">
 *              <label class="GPEditorMapBoxLayerTitleLabel" for="GPEditorMapBoxLayerTitleInput-45" title="...">...</label>
 *          </div>
 *          <div id="GPEditorMapBoxToolsContainer-45" class="GPEditorMapBoxToolsContainer">
 *              <input id="GPEditorMapBoxToolsVisibilityInput-45" type="checkbox" class="GPEditorMapBoxToolsVisibilityInput">
 *              <label for="GPEditorMapBoxToolsVisibilityInput-45" id="GPEditorMapBoxToolsVisibilityLabel-45" class="GPEditorMapBoxToolsVisibilityLabel" title="Afficher/masquer la couche"></label>
 *          </div>
 *      </div>
 */
Layer.prototype._initContainer = function () {
    // contexte
    var self = this;

    var obj = this.options.obj;

    var div = document.createElement("div");
    div.className = this.name.container;

    // title
    var divTitle = document.createElement("div");
    divTitle.id = this.name.containertitle + "-" + this.options.position;
    divTitle.className = this.name.containertitle;

    // puce
    var labelImage = document.createElement("label");
    labelImage.className = this.name.imagelabel;
    divTitle.appendChild(labelImage);

    // type
    if (this.options.tools.type && obj.type) { // Optionnel !
        var imgType = document.createElement("img");
        imgType.className = this.name.typeimg;
        // TODO il faudrait faire la difference entre :
        // - icone uniquement : SYMBOL-ICON
        // - texte uniquement : SYMBOL-TEXT
        // - les 2 : SYMBOL
        // Mais il nous faut les styles complets (paint & layout)
        // pour determiner les 3 types !
        switch (obj.type.toUpperCase()) {
            case "SYMBOL-ICON": // not used !
                imgType.style["background-position"] = "0px 0";
                break;
            case "SYMBOL-TEXT": // not used !
                imgType.style["background-position"] = "-194px 0";
                break;
            case "SYMBOL":
                imgType.style["background-position"] = "-84px 0";
                break;
            case "LINE":
                imgType.style["background-position"] = "-28px 0";
                break;
            case "FILL":
                imgType.style["background-position"] = "-56px 0";
                break;
            case "BACKGROUND":
                imgType.style["background-position"] = "-140px 0";
                break;
            case "CIRCLE":
                imgType.style["background-position"] = "-168px 0";
                break;
            default:
                // type inconnu ou non pris en charge ou par defaut
                imgType.style["background-position"] = "-112px 0";
        }
        divTitle.appendChild(imgType);
    }

    // container legend (empty)
    var divLegend = document.createElement("div");
    divLegend.id = this.name.containerlegend + "-" + this.options.position;
    divLegend.className = this.name.containerlegend;
    divTitle.appendChild(divLegend);

    // input
    var inputTitle = document.createElement("input");
    inputTitle.id = this.name.titleinput + "-" + this.options.position;
    inputTitle.className = this.name.titleinput;
    inputTitle.type = "checkbox";
    divTitle.appendChild(inputTitle);

    // label for
    var labelTitle = document.createElement("label");
    labelTitle.className = this.name.titlelabel;
    labelTitle.htmlFor = inputTitle.id;
    labelTitle.innerHTML = obj["id"] || obj["source-layer"] || obj["source"];
    labelTitle.title = obj["source-layer"] || obj["source"] || obj["id"];
    labelTitle.data = obj; // on lie le DOM et la couche, utile lors d'evenement !
    if (labelTitle.addEventListener) {
        labelTitle.addEventListener("click", function (e) {
            self.onClickLayerMapBox(e);
        });
    } else if (labelTitle.attachEvent) {
        labelTitle.attachEvent("onclick", function (e) {
            self.onClickLayerMapBox(e);
        });
    }
    divTitle.appendChild(labelTitle);
    // enregistrement utile pour la méthode : toggle()
    this.DomToggle = labelTitle;

    div.appendChild(divTitle);

    // tools :
    // visibility, remove, clone
    var divTools = document.createElement("div");
    divTools.id = this.name.containertools + "-" + this.options.position;
    divTools.className = this.name.containertools;

    // visibility
    if (this.options.tools.visibility) {
        var inputTools = document.createElement("input");
        inputTools.id = this.name.visibilityinput + "-" + this.options.position;
        inputTools.className = this.name.visibilityinput;
        inputTools.type = "checkbox";
        inputTools.checked = "checked"; // par défaut, à modifier via visibility(true|false) !
        inputTools.data = obj; // on lie le DOM et la couche, utile lors d'evenement !
        // event for visibility change
        if (inputTools.addEventListener) {
            inputTools.addEventListener("click", function (e) {
                self.onVisibilityLayerMapBox(e);
            });
        } else if (inputTools.attachEvent) {
            // internet explorer
            inputTools.attachEvent("onclick", function (e) {
                self.onVisibilityLayerMapBox(e);
            });
        }
        divTools.appendChild(inputTools);
        // enregistrement utile pour la méthode : visibility()
        this.DomVisibility = inputTools;

        var labelTools = document.createElement("label");
        labelTools.htmlFor = this.name.visibilityinput + "-" + this.options.position;
        labelTools.id = this.name.visibilitylabel + "-" + this.options.position;
        labelTools.className = this.name.visibilitylabel;
        labelTools.title = "Afficher/masquer la couche";
        divTools.appendChild(labelTools);

        div.appendChild(divTools);
    }

    // clone
    if (this.options.tools.clone) {
        // TODO...
        logger.warn("Dom for tools clone, it's not yet implemented !");
    }

    // remove
    if (this.options.tools.remove) {
        // TODO...
        logger.warn("Dom for tools remove, it's not yet implemented !");
    }

    // main container
    this.container = div;
};

// ################################################################### //
// ##################### public methods ############################## //
// ################################################################### //

/**
 * Add element into target DOM
 */
Layer.prototype.add = function () {
    logger.trace("add()");
    if (!this.options.target) {
        if (!document.getElementById(this.name.target)) {
            var div = document.createElement("div");
            div.id = this.name.target;
            var node = document.documentElement ||
            document.getElementsByTagName("body")[0] ||
            document.getElementsByTagName("head")[0];
            node.appendChild(div);
        }
        this.options.target = document.getElementById(this.name.target);
    }
    if (this.container) {
        this.options.target.appendChild(this.container);
    }
};

/**
 * Add style in the submenu
 *
 * @param {Object} style - style object
 */
Layer.prototype.addStyle = function (style) {
    logger.trace("addStyle()", style);
    if (style && typeof style === "object" && style instanceof Style) {
        this.oStyle = style;
        this.oStyle.display(false); // par defaut !
    }
};

/**
 * Add filter in the submenu
 *
 * @param {Object} filter - filter object
 */
Layer.prototype.addFilter = function (filter) {
    logger.trace("addFilter()", filter);
    if (filter && typeof filter === "object" && filter instanceof Filter) {
        this.oFilter = filter;
        this.oFilter.display(false); // par defaut !
    }
};

/**
 * Add Legend in the submenu
 *
 * @param {Object} legend - legend object
 */
Layer.prototype.addLegend = function (legend) {
    logger.trace("addLegend()", legend);
    if (legend && typeof legend === "object" && legend instanceof Legend) {
        this.oLegend = legend;
        this.oLegend.display(false); // par defaut !
    }
};

/**
 * Integrate Legend to the layer container
 */
Layer.prototype.slotLegend = function () {
    // cas particulier :
    // on souhaite intégrer une partie de la legende dans le container du layer.
    var legend = this.oLegend;
    if (legend) {
        // FIXME c'est pourri...
        var node = null;
        var nodesLvl1 = this.container.childNodes;
        if (nodesLvl1.length) {
            var nodesLvl2 = nodesLvl1[0].childNodes;
            // on recherche le container de la legende
            for (var i = 0; i < nodesLvl2.length; i++) {
                var curnode = nodesLvl2[i];
                if (curnode.id.indexOf(this.name.containerlegend) !== -1) {
                    node = curnode;
                }
            }
        }
        if (node) {
            var render = legend.getRender();
            if (render) {
                node.appendChild(render);
                // legende intégrée
                this.bSlotLegend = true;
            }
        }
    }
};

/**
 * Set or get visibility
 *
 * @param {Boolean} display - set visibility or undefined to get status
 * @returns {Boolean} - true/false
 */
Layer.prototype.visibility = function (display) {
    logger.trace("visibility()", display);
    if (!this.options.tools.visibility) {
        return;
    }
    if (typeof display !== "undefined") {
        this.DomVisibility.checked = (display) ? "checked" : "";
    }
    return this.DomVisibility.checked;
};

/**
* Toggle a layer panel
*/
Layer.prototype.toggle = function () {
    logger.trace("toggle()");
    this.DomToggle.click();
};

/**
* Click on visibility icon
*/
Layer.prototype.visible = function () {
    logger.trace("visible()");
    if (!this.options.tools.visibility) {
        return;
    }
    this.DomVisibility.click();
};

/**
 * Set display or get
 *
 * @param {Boolean} display - show/hidden container or get status
 * @returns {Boolean} - true/false
 */
Layer.prototype.display = function (display) {
    logger.trace("display()", display);
    var checked = document.getElementById(this.DomToggle.htmlFor).checked;
    if (typeof display !== "undefined") {
        this.container.style.display = (display) ? "flex" : "none";
        if (this.oStyle) {
            this.oStyle.display(display && checked);
        }
        if (this.oFilter) {
            this.oFilter.display(display && checked);
        }
        if (this.oLegend) {
            this.oLegend.display(display && checked);
        }
    }
    return checked;
};

/**
 * Set disabled/enabled status
 *
 * @param {Boolean} active - disable/enable layer interaction
 */
Layer.prototype.active = function (active) {
    logger.trace("active()", active);
    this.container.className = (active)
        ? this.name.container
        : this.name.container + " disabled";
};

/**
 * Get container (DOM)
 *
 * @returns {DOMElement} DOM element
 */
Layer.prototype.getContainer = function () {
    return this.container;
};
// ################################################################### //
// ####################### handlers events to dom #################### //
// ################################################################### //

/**
 * this method is called by event '' on '' tag form
 *
 * @param {Object} e - HTMLElement
 * @private
 */
Layer.prototype.onClickLayerMapBox = function (e) {
    logger.trace("onClickLayerMapBox", e);
    // ouverture du panneau des styles / filtres
    var checked = document.getElementById(e.target.htmlFor).checked;
    if (this.oStyle) {
        this.oStyle.display(!checked);
    }
    if (this.oFilter) {
        this.oFilter.display(!checked);
    }
    // attention,
    // la legende ne se trouve pas forcement dans le sous menu !
    if (this.oLegend && !this.bSlotLegend) {
        this.oLegend.display(!checked);
    }
};

/**
 * this method is called by event '' on '' tag form
 *
 * @param {Object} e - HTMLElement
 * @private
 * @fires Layer#editor:layer:visibility
 */
Layer.prototype.onVisibilityLayerMapBox = function (e) {
    logger.trace("onVisibilityLayerMapBox", e);
    e.editorID = this.id;
    EventBus.dispatch(EventEditor.layer.visibility, e);
};

/**
 * this method is called by event '' on '' tag form
 *
 * @param {Object} e - HTMLElement
 * @private
 * @fires Layer#editor:layer:clone
 */
Layer.prototype.onCloneLayerMapBox = function (e) {
    logger.trace("onCloneLayerMapBox", e);
    e.editorID = this.id;
    EventBus.dispatch(EventEditor.layer.clone, e);
};

/**
 * this method is called by event '' on '' tag form
 *
 * @param {Object} e - HTMLElement
 * @private
 * @fires Layer#editor:layer:remove
 */
Layer.prototype.onRemoveLayerMapBox = function (e) {
    logger.trace("onRemoveLayerMapBox", e);
    e.editorID = this.id;
    EventBus.dispatch(EventEditor.layer.remove, e);
};

export default Layer;