/// <reference path="jquery-1.11.2.min.js" />
/// <reference path="spectrum.js" />

function RQColorPaletteOptions() {
    this.applyAllSelector = ".className";
    this.defaultColor = "black";
    this.applyAs = 'background-color';
    this.pos = {
        x: 0, y: 0
    };
    this.adjustment = {
        x: 0, y: 0
    };
    this.onchange = function (selectedColorStr) {
    }
    this.onapply = function (selectedColorStr) {
    }
    this.onapplyAll = function (selectedColorStr) {
    }
    this.ondefault = function () {
    }
    this.oncancel = function () {
    }
}

(function ($) {
    //var RQColorPaletteOptions = {
    //    applyAllSelector: ".className",
    //    defaultColor: "black",
    //    applyAs: 'background-color',
    //    pos: {
    //        x: 0, y: 0
    //    },
    //    adjustment: {
    //        x: 0, y: 0
    //    },
    //    onchange: function (selectedColorStr) {
    //    },
    //    onapply: function (selectedColorStr) {
    //    },
    //    onapplyAll: function (selectedColorStr) {
    //    },
    //    ondefault: function () {
    //    },
    //    oncancel: function () {
    //    }
    //};

    // Usage2
    //var options = new RQColorPaletteOptions();
    //options.applyAllSelector = applyAllSelector;
    //options.defaultColor = defaultColor;
    //options.onapply = onapply;
    //options.onapplyAll = onapplyAll;
    //options.ondefault = ondefault;
    //$curTaskbar.RQColorPalette(options);

    function RQColorPalette(options) {
        if (!options.applyAs)
            options.applyAs = 'background-color';
        if (!options.defaultColor)
            options.defaultColor = "black";
        if (!options.adjustment)
            options.adjustment = { x: 0, y: 0 };
        if (!options.adjustment.x)
            options.adjustment.x = 0;
        if (!options.adjustment.y)
            options.adjustment.y = 0;

        // Initialize the tab with color palette elements.
        var $tab = $("<div id='tabs' style='height: 280px; width: 290px; top:0px; position: absolute; z-index: 1; padding-bottom: 19px; font-size: 11px;'> \n" +
            "<ul><li><a href='#tabs-1'>Colorpalette</a></li><li></ul> \n" +
            "<div id='tabs-1'style='height: 207px;'><input type='text' class='colorPalette' style='display: none;' /></div>\n" +
            "<div class='buttonContainer' style='font-size: 13px;'><button type='button' class='apply'>Apply </button><button type='button' class='applyAll'>ApplyAll </button><button type='button' class='default'>Default</button><button type='button' class='cancel'>Close</button></div> \n" +
            "</div>");
        $(document.body).append($tab);
        if (options.pos)
            $tab.tabs().css({ "margin-left": (options.pos.x + options.adjustment.x), "margin-top": (options.pos.y + options.adjustment.y) });
        else
            $tab.tabs().css({ "margin-left": (this.offset().left + options.adjustment.x), "margin-top": (this.offset().top + this.height() + 2 + options.adjustment.y) });

        // Using Contextmenu to show the color palette window.
        return new openColorPalette(this, $tab, options);
    }
    function openColorPalette($elem, $tab, options) {
        var selectedColor = options.defaultColor, $taskbars, isApplyAll = false;

        var $boundElemClone = this.$boundElemClone = $elem.clone();
        var $boundAllElemClone = this.$boundAllElemClone = $(options.applyAllSelector).clone();

        // Widget initialization for Color Palette using 'Spectrum' plugin.
        $('.colorPalette').spectrum({
            color: selectedColor,
            flat: true,
            showButtons: false,
            hideAfterPaletteSelect: true,
            change: function (colorSelected) {
                selectedColor = colorSelected.toHexString();

                if (options.onchange)
                    options.onchange.call($elem, selectedColor);
            }
        });

        // Change the color to the current element.
        $(".apply", $tab).click(function () {
            var timer = setTimeout(function () {
                if (options.onapply) {
                    var canPreventDefault = options.onapply.call($elem, selectedColor, options.applyAs);
                    if (canPreventDefault == true)
                        return;
                }
                $elem.css(options.applyAs, selectedColor);
            }, 10);
        });
        // Change the color to the all elements.
        $('.applyAll', $tab).click(function () {
            var timer = setTimeout(function () {
                isApplyAll = true;
                $taskbars = $(options.applyAllSelector);
                
                if (options.onapplyAll) {
                    var canPreventDefault = options.onapplyAll.call($taskbars, selectedColor, $taskbars, options.applyAs);
                    if (canPreventDefault == true)
                        return;
                }

                $taskbars.css(options.applyAs, selectedColor);
            }, 10);

        });
        var self = this;
        // Based on the condition to reset the element.
        $('.default', $tab).click(function () {
            var timer = setTimeout(function () {
                self.RevertToDefault();
            }, 10);
        });

        this.RevertToDefault = function () {
            var $element, $elemClone;
            if (isApplyAll) {
                $element = $taskbars;
                $elemClone = $boundAllElemClone;
            }
            else {
                $element = $elem;
                $elemClone = $boundElemClone;
            }

            if (options.ondefault)
                options.ondefault.call($elem, $element, $elemClone, options.applyAs, isApplyAll, options.defaultColor);
        }

        // To hide the color palette window.
        $('.cancel', $tab).click(function () {
            $tab.remove();
            $(document).unbind(".rq-color-palette .spectrum");
            $(window).unbind(".spectrum");
        });

        // To hide color palette window when we click outside the window.
        $(document).bind("mouseup.rq-color-palette", function (e) {
            if ($tab.has(e.target).length == 0) {
                $tab.remove();
                $(document).unbind(".rq-color-palette .spectrum");
                $(window).unbind(".spectrum");
            }
        });

        return this;
    }
    $.fn.RQColorPalette = RQColorPalette;
})(jQuery);