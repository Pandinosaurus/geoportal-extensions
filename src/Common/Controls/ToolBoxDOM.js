define([], function () {

    "use strict";

    var ToolBoxDOM = {

        _toolboxId : "GPtoolbox-main",
        _buttonId : "GPtoolbox-button",
        _widgetId : "GPtoolbox-widget",

        /** get toolBox ID */
        getToolBoxID : function (uid, name) {
            var id = this._toolboxId;
            if (name) {
                id = id + "-" + name;
            }
            if (uid) {
                id = id + "-" + uid;
            }
            return id;
        },

        /** get toolBox ID */
        getButtonID : function (uid, name) {
            var id = this._buttonId;
            if (name) {
                id = id + "-" + name;
            }
            if (uid) {
                id = id + "-" + uid;
            }
            return id;
        },

        /** get toolBox Container for widget */
        getWidgetID : function (uid, name) {
            var id = this._widgetId;
            if (name) {
                id = id + "-" + name;
            }
            if (uid) {
                id = id + "-" + uid;
            }
            return id;
        },

        /**
        * Main container (DOM)
        *
        * @returns {DOMElement} DOM element
        */
        _createToolBoxContainerElement : function (uid, name) {

            // <div id="GPtoolbox-main">
            //   <button id="GPtoolbox-button">&#9776;</button>
            //   <div id="GPtoolbox-widget">
            //     <!-- HERE : widgets tools measures -->
            //   </div>
            // </div>
            var container = document.createElement("div");
            container.id  = this.getToolBoxID(uid, name);
            container.className = "GPshowAdvancedToolPicto";

            var button = document.createElement("button");
            button.id = this.getButtonID(uid, name);
            var self = this;
            button.addEventListener("click", function () {
                this.blur(); // permet de perdre le focus !
                var widget = document.getElementById(self.getWidgetID(uid, name));
                if ( widget.style.display === "block") {
                    widget.style.display = "none";
                } else {
                    widget.style.display = "block";
                }
            });
            container.appendChild(button);

            var widget = document.createElement("div");
            widget.id = this.getWidgetID(uid, name);
            widget.addEventListener("click", function () {

                /*
                    e.preventDefault();

                    // FIXME desactiver tous les outils sur
                    // l'ouverture/fermeture de la toolbox ?

                    var current = e.target.parentNode.getAttribute("for");
                    var widgets = this.querySelectorAll("div > input");
                    for (var i = 0; i < widgets.length; i++) {
                        var id = widgets[i].id;

                        if (document.getElementById(id) &&
                            document.getElementById(id).checked &&
                            document.querySelector("#" + id + " + label")) {
                                document.querySelector("#" + id + " + label").click();
                                // document.getElementById(id).checked = true;
                        }

                        if (current === id && widgets[i].checked) {
                            widgets[i].checked = false;
                        } else if (current === id && !widgets[i].checked) {
                            widgets[i].checked = true;
                        }
                    }
                */

            }, false);

            container.appendChild(widget);

            return container;
        }
    };

    return ToolBoxDOM;
});
