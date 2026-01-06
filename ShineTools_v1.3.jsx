/*  ShineTools_v1.0.jsx  (Tabbed UI)
    Tabs:
      - MAIN  (your current full tool)
      - TEXT  (Break Apart Text tools)

    NOTES:
      - Favorites live ONLY in MAIN tab.
      - TEXT tab now includes the same SHINE TOOLS logo header for alignment.
      - TEXT tab has a collapsible section: "BREAK APART TEXT" with 3 buttons:
          BY CHARACTER / BY WORD / BY LINE
*/

(function ShineTool(thisObj) {

    // ============================================================
    // 0a) Dropdown helpers (temporary display then revert to blank)
    // ============================================================
    function _ensureDDStore() {
        if (!$.global.__ShineToolsDDStore) $.global.__ShineToolsDDStore = {};
        return $.global.__ShineToolsDDStore;
    }

    // Expose a global reset function so app.scheduleTask can call it.
    if (!$.global._shineToolsResetDropdown) {
        $.global._shineToolsResetDropdown = function (key) {
            try {
                var store = $.global.__ShineToolsDDStore;
                var dd = store ? store[key] : null;
                if (!dd) return;
                if (!dd.items || dd.items.length < 1) return;
                dd.__shineProgrammatic = true;
                dd.selection = 0; // blank item
                try {
                    app.scheduleTask("try{var s=$.global.__ShineToolsDDStore;var d=s? s['" + key + "']:null; if(d) d.__shineProgrammatic=false;}catch(e){}", 0, false);
                } catch (e2) {}
            } catch (e) {}
        };
    }

    // Expose a global restore function so app.scheduleTask can revert a temporary dropdown message.
    if (!$.global._shineToolsRestoreDropdownBlank) {
        $.global._shineToolsRestoreDropdownBlank = function (key) {
            try {
                var store = $.global.__ShineToolsDDStore;
                var dd = store ? store[key] : null;
                if (!dd) return;
                if (!dd.items || dd.items.length < 1) return;
                dd.__shineProgrammatic = true;
                try {
                    // item 0 is the reserved blank row
                    dd.items[0].text = ' ';
                    dd.selection = 0;
                    if (dd.window && dd.window.update) dd.window.update();
                } catch (eInner) {}
                try {
                    app.scheduleTask("try{var s=$.global.__ShineToolsDDStore;var d=s? s['" + key + "']:null; if(d) d.__shineProgrammatic=false;}catch(e){}", 0, false);
                } catch (e2) {}
            } catch (e) {}
        };
    }

    // Show a short message inside a dropdown's display area without triggering its onChange behavior.
    // Implementation: temporarily changes item[0] (reserved blank row) text, selects it, then restores.
    function _ddShowTempMessage(dd, message, seconds) {
        try {
            if (!dd) return;
            var store = _ensureDDStore();
            if (!dd.__shineDDKey) {
                dd.__shineDDKey = 'dd_' + (new Date().getTime()) + '_' + Math.floor(Math.random() * 1000000);
                store[dd.__shineDDKey] = dd;
            }

            var ms = Math.round((Math.max(0.1, seconds || 1) * 1000));

            // Cancel any pending restore for this dropdown
            try { if (dd.__shineMsgTaskId) app.cancelTask(dd.__shineMsgTaskId); } catch (eCancel) {}

            dd.__shineProgrammatic = true;
            try {
                if (dd.items && dd.items.length > 0) {
                    dd.items[0].text = String(message || 'Added');
                    dd.selection = 0;
                    if (dd.window && dd.window.update) dd.window.update();
                }
            } catch (eSet) {}

            dd.__shineMsgTaskId = app.scheduleTask("$.global._shineToolsRestoreDropdownBlank('" + dd.__shineDDKey + "');", ms, false);
        } catch (e) {}
    }


    // Apply an .ffx preset to a text layer (create/select a text layer if needed).
    // Exposed globally so app.scheduleTask can trigger it (lets UI update before applyPreset).
    if (!$.global._shineToolsApplyFFXPreset) {
        $.global._shineToolsApplyFFXPreset = function (presetPath) {
            try {
                var presetFile = new File(presetPath);
                if (!presetFile.exists) {
                    alert("Animation preset not found:\n" + presetPath);
                    return;
                }

                if (!app.project) {
                    alert("No project is open.");
                    return;
                }

                var comp = app.project.activeItem;
                if (!comp || !(comp instanceof CompItem)) {
                    alert("Please make a comp active.");
                    return;
                }

                app.beginUndoGroup("Apply Text Preset");

                // Pick target: selected text layer if available, otherwise create a new text layer.
                var target = null;
                if (comp.selectedLayers && comp.selectedLayers.length > 0) {
                    var l = comp.selectedLayers[0];
                    if (l && l instanceof TextLayer) target = l;
                }
                if (!target) {
                    target = comp.layers.addText("Enter Text");
                }

                // Ensure only target is selected (AE can be picky about applyPreset context)
                try {
                    for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).selected = false;
                } catch (eSel) {}
                try { target.selected = true; } catch (eSel2) {}

                // Apply preset
                target.applyPreset(presetFile);

                app.endUndoGroup();
            } catch (e) {
                try { app.endUndoGroup(); } catch (e2) {}
                alert("Could not apply preset.\n\n" + e.toString());
            }
        };
    }


    function _dropdownResetAfterFrames(dd, frames) {
        try {
            if (!dd) return;

            var comp = null;
            try { comp = (app.project && app.project.activeItem && (app.project.activeItem instanceof CompItem)) ? app.project.activeItem : null; } catch (eC) {}
            var fps = 30;
            try { if (comp && comp.frameRate) fps = comp.frameRate; } catch (eF) {}
            if (!fps || fps <= 0) fps = 30;

            var ms = Math.round((Math.max(1, frames) / fps) * 1000);

            var store = _ensureDDStore();
            if (!dd.__shineDDKey) {
                dd.__shineDDKey = "dd_" + (new Date().getTime()) + "_" + Math.floor(Math.random() * 1000000);
                store[dd.__shineDDKey] = dd;
            }

            // Cancel any pending reset for this dropdown
            try { if (dd.__shineDDTaskId) app.cancelTask(dd.__shineDDTaskId); } catch (eCancel) {}

            dd.__shineDDTaskId = app.scheduleTask("$.global._shineToolsResetDropdown('" + dd.__shineDDKey + "');", ms, false);
        } catch (e) {}
    }


    function _dropdownResetAfterSeconds(dd, seconds) {
        try {
            if (!dd) return;

            var ms = Math.round((Math.max(0.1, seconds) * 1000));

            var store = _ensureDDStore();
            if (!dd.__shineDDKey) {
                dd.__shineDDKey = "dd_" + (new Date().getTime()) + "_" + Math.floor(Math.random() * 1000000);
                store[dd.__shineDDKey] = dd;
            }

            // Cancel any pending reset for this dropdown
            try { if (dd.__shineDDTaskId) app.cancelTask(dd.__shineDDTaskId); } catch (eCancel) {}

            dd.__shineDDTaskId = app.scheduleTask("$.global._shineToolsResetDropdown('" + dd.__shineDDKey + "');", ms, false);
        } catch (e) {}
    }


    function _isCmdOrCtrlDown() {
        try {
            var ks = ScriptUI.environment.keyboardState;
            // Mac: Command = metaKey. Windows: Ctrl = ctrlKey.
            return (ks && (ks.metaKey || ks.ctrlKey)) ? true : false;
        } catch (e) {}
        return false;
    }


    // ============================================================
    // 0) Locate ScriptUI Panels folder + logo
    // ============================================================
    var SCRIPT_FILENAME = "ShineTools_v1.0.jsx";
    var LOGO_FILENAME   = "shine_logo.png";

    // Unified dropdown "flash then reset" helper (matches MAIN behavior across tabs).
    function _ddFlashThenReset(dd, frames) {
        try {
            if (!dd) return;
            // force a repaint so the selected text actually shows before any heavy work runs
            try { if (dd.window && dd.window.update) dd.window.update(); } catch (eUpd) {}
            _dropdownResetAfterFrames(dd, frames);
        } catch (e) {}
    }

    // Defer applying an .ffx preset so ScriptUI can repaint the dropdown selection first.
    // Also guards against rapid double-fires by canceling any pending apply task per dropdown.
    function _ddDeferApplyFFX(dd, presetPath, delayMs) {
        try {
            if (!dd) return;
            var ms = (delayMs == null) ? 50 : Math.max(0, delayMs);

            // Cancel any pending apply for this dropdown
            try { if (dd.__shineApplyTaskId) app.cancelTask(dd.__shineApplyTaskId); } catch (eCancel) {}

            var safe = String(presetPath || "").replace(/\\/g, "\\\\").replace(/'/g, "\\'");
            dd.__shineApplyTaskId = app.scheduleTask("$.global._shineToolsApplyFFXPreset('" + safe + "');", ms, false);
        } catch (e) {}
    }


    // Cache (AE 2025 safe-pass): avoid repeated disk/path checks during UI build
    var __ST_CACHE = {
        panelsFolder: null,
        panelsFolderChecked: false,
        logoFile: null,
        logoChecked: false
    };

    function findScriptUIPanelsFolderByScript() {
        // Cached: this can be called multiple times during tab/section builds
        if (__ST_CACHE.panelsFolderChecked) return __ST_CACHE.panelsFolder;

        __ST_CACHE.panelsFolderChecked = true;
        __ST_CACHE.panelsFolder = null;

        // Fast path: the panel is running from its own file on disk
        try {
            var sf = File($.fileName);
            if (sf && sf.exists) { __ST_CACHE.panelsFolder = sf.parent; return __ST_CACHE.panelsFolder; }
        } catch (e) {}

        // Fallback: derive Scripts/ScriptUI Panels from the running AE install path
        // (Much faster than scanning /Applications and generally works on both macOS and Windows.)
        try {
            if (app && app.path) {
                var scriptsPanels = new Folder(app.path.fsName + "/Scripts/ScriptUI Panels");
                if (scriptsPanels.exists) { __ST_CACHE.panelsFolder = scriptsPanels; return __ST_CACHE.panelsFolder; }
            }
        } catch (e2) {}

        return __ST_CACHE.panelsFolder;
    }

    function findShineLogoFileLocal() {
        // Cached to avoid repeated File.exists() calls during UI build
        if (__ST_CACHE.logoChecked) return __ST_CACHE.logoFile;

        __ST_CACHE.logoChecked = true;
        __ST_CACHE.logoFile = null;

        try {
            var panelsFolder = findScriptUIPanelsFolderByScript();
            if (panelsFolder) {
                var lf = new File(panelsFolder.fsName + "/ShineTools_icons/" + LOGO_FILENAME);
                if (lf.exists) { __ST_CACHE.logoFile = lf; return __ST_CACHE.logoFile; }
            }
        } catch (e0) {}

        // Final fallback: known install path (macOS)
        try {
            var hard = new File("/Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels/ShineTools_icons/" + LOGO_FILENAME);
            if (hard.exists) { __ST_CACHE.logoFile = hard; return __ST_CACHE.logoFile; }
        } catch (e1) {}

        return __ST_CACHE.logoFile;
    }

    // ============================================================
    // 1) Labels
    // ============================================================
    function findLabelIndexByName(labelName) {
        try {
            if (!app.project || !app.project.labelNames) return 0;
            var names = app.project.labelNames;
            var target = (labelName || "").toLowerCase();

            for (var i = 1; i <= names.length; i++) {
                var n = (names[i - 1] || "").toString().toLowerCase();
                if (n === target) return i;
            }
            for (var j = 1; j <= names.length; j++) {
                var n2 = (names[j - 1] || "").toString().toLowerCase();
                if (n2.indexOf(target) !== -1) return j;
            }
            return 0;
        } catch (e) { return 0; }
    }

    function getLabelIndexOrFallback(name, fallbackIndex) {
        var idx = findLabelIndexByName(name);
        return (idx && idx > 0) ? idx : fallbackIndex;
    }

    var LABEL_ORANGE   = getLabelIndexOrFallback("Orange", 6);
    var LABEL_LAVENDER = getLabelIndexOrFallback("Lavender", 5);

    // ============================================================
    // 2) Core helpers
    // ============================================================
    function warn(msg) { alert(msg); }

    function requireProject() {
        try {
            if (!app.project) app.newProject();
            return !!app.project;
        } catch (e) {
            warn("Could not create/open a project.");
            return false;
        }
    }

    function getComp() {
        var a = app.project && app.project.activeItem;
        return (a && a instanceof CompItem) ? a : null;
    }

    function requireComp() {
        var c = getComp();
        if (!c) warn("Please select an active composition.");
        return c;
    }

    function isSolidFootageItem(it) {
        try { return (it && (it instanceof FootageItem) && it.mainSource && (it.mainSource instanceof SolidSource)); } catch (e) { return false; }
    }

    function duplicateCompDeep() {
        if (!app.project) { alert("No project is open."); return; }

        var srcComp = getComp();
        if (!srcComp) {
            try {
                var sel = app.project.selection;
                if (sel && sel.length === 1 && (sel[0] instanceof CompItem)) srcComp = sel[0];
            } catch (e) {}
        }
        if (!srcComp) {
            alert("Select a comp in the Project panel, or make a comp active, then run DUPLICATE COMP.");
            return;
        }

        var suffix = prompt("Enter suffix to append to duplicated comps:", "_v02");
        if (suffix === null) return;
        suffix = String(suffix);
        if (suffix === "") suffix = "_copy";

        function isCompSource(layer) {
            try { return (layer && layer.source && (layer.source instanceof CompItem)); } catch (e) { return false; }
        }

        function folderNameExists(parentFolder, name) {
            try {
                for (var i = 1; i <= app.project.numItems; i++) {
                    var it = app.project.item(i);
                    if (it && (it instanceof FolderItem) && it.parentFolder === parentFolder && it.name === name) return true;
                }
            } catch (e) {}
            return false;
        }

        function makeUniqueFolderName(parentFolder, baseName) {
            if (!folderNameExists(parentFolder, baseName)) return baseName;
            var n = 2;
            while (n < 1000) {
                var candidate = baseName + " (" + n + ")";
                if (!folderNameExists(parentFolder, candidate)) return candidate;
                n++;
            }
            return baseName + " (Copy)";
        }

        var dupMap = {};

        function dupCompRecursive(comp) {
            if (!comp) return null;

            var key = String(comp.id);
            if (dupMap[key]) return dupMap[key];

            var newComp = null;
            try { newComp = comp.duplicate(); } catch (e) {}
            if (!newComp) return null;

            try { newComp.name = comp.name + suffix; } catch (eName) {}

            dupMap[key] = newComp;

            try {
                for (var i = 1; i <= newComp.numLayers; i++) {
                    var lyr = newComp.layer(i);
                    if (!isCompSource(lyr)) continue;

                    var origChild = lyr.source;
                    var newChild  = dupCompRecursive(origChild);
                    if (newChild) {
                        try { lyr.replaceSource(newChild, false); } catch (eReplace) {}
                    }
                }
            } catch (eLoop) {}

            return newComp;
        }

        app.beginUndoGroup("ShineTools - DUPLICATE COMP (DEEP)");
        try {
            var result = dupCompRecursive(srcComp);
            if (!result) { alert("Deep duplicate failed."); return; }

            var parentFolder = null;
            try { parentFolder = srcComp.parentFolder ? srcComp.parentFolder : app.project.rootFolder; } catch (ePF) { parentFolder = app.project.rootFolder; }

            var baseFolderName = srcComp.name + suffix;
            var folderName = makeUniqueFolderName(parentFolder, baseFolderName);

            var folder = app.project.items.addFolder(folderName);
            try { folder.parentFolder = parentFolder; } catch (eSetParent) {}

            for (var k in dupMap) {
                if (!dupMap.hasOwnProperty(k)) continue;
                var dc = dupMap[k];
                try { dc.parentFolder = folder; } catch (eMove) {}
            }

            try { result.openInViewer(); } catch (eOpen) {}

        } catch (e) {
            alert("Error:\n" + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function ensureCompViewer(c) { try { if (c) c.openInViewer(); } catch (e) {} }

    function findMenuCommandIdAny(names) {
        for (var i = 0; i < names.length; i++) {
            var id = app.findMenuCommandId(names[i]);
            if (id) return id;
        }
        return 0;
    }

    function addEffect(layer, matchName) {
        try { return layer.property("ADBE Effect Parade").addProperty(matchName); } catch (e) { return null; }
    }

    function findEffectByName(layer, effectName) {
        var fx = layer.property("ADBE Effect Parade");
        if (!fx) return null;
        for (var i = 1; i <= fx.numProperties; i++) {
            var e = fx.property(i);
            if (e && e.name === effectName) return e;
        }
        return null;
    }

    function getOrAddSlider(layer, sliderName, defaultValue) {
        var existing = findEffectByName(layer, sliderName);
        if (existing) return existing;

        var s = addEffect(layer, "ADBE Slider Control");
        if (!s) return null;

        s.name = sliderName;
        try { s.property("ADBE Slider Control-0001").setValue(defaultValue); } catch (e) {}
        return s;
    }

    function getSelectedExprProps(c) {
        var props = [];
        var layers = c.selectedLayers;
        for (var i = 0; i < layers.length; i++) {
            var sp = layers[i].selectedProperties;
            for (var j = 0; j < sp.length; j++) {
                if (sp[j] && sp[j].canSetExpression) props.push(sp[j]);
            }
        }
        return props;
    }

    function requireSelectedProps(c) {
        var props = getSelectedExprProps(c);
        if (!props || props.length === 0) {
            warn("Select one or more properties (Position/Scale/Rotation/etc.) in the timeline, then click the button.");
            return null;
        }
        return props;
    }

    function layerFromProperty(prop) {
        try { return prop.propertyGroup(prop.propertyDepth); } catch (e) { return null; }
    }

    function hostLayerFromProps(c, props) {
        if (props && props.length > 0) {
            var l = layerFromProperty(props[0]);
            if (l) return l;
        }
        return (c.selectedLayers && c.selectedLayers.length > 0) ? c.selectedLayers[0] : null;
    }

    function applyExpressionToProps(props, expr) {
        for (var i = 0; i < props.length; i++) {
            try {
                props[i].expression = expr;
                props[i].expressionEnabled = true;
            } catch (e) {}
        }
    }

    function isOptionDown() {
        try {
            var ks = ScriptUI.environment.keyboardState;
            return (ks && ks.altKey) ? true : false;
        } catch (e) { return false; }
    }

    
    // ============================================================
    // 2.5) TEXT BOX module (integrated from ShineTools_TEXT_BOX_v2.36_panel_fix.jsx)
    // ============================================================
    function initTextBoxModule() {
// ---------- Safe root namespace ----------
    if (!$.global.ShineTools) $.global.ShineTools = {};
    var ST = $.global.ShineTools;

    // Avoid double-registration if the main script loads this more than once
    if (ST.TextBox && ST.TextBox.__version === "2.36") {
        // Still ensure watcher is running if UI is not shown.
        try { ST.TextBox.ensureWatcherRunning(); } catch (e) {}
        return;
    }

    // ---------- Module ----------
    var mod = {};
    mod.__version = "2.36";

    // ===== Tags =====
    var TAG_PRECOMP_LAYER = "SHINE_TEXT_BOX_PRECOMP_LAYER";
    var TAG_TEXT_LAYER    = "SHINE_TEXT_BOX_TEXT_LAYER";
    var TAG_BOX_LAYER     = "SHINE_TEXT_BOX_BOX_LAYER";

    // ===== Defaults =====
    var DEFAULT_PAD_X       = 40;
    var DEFAULT_PAD_Y       = 25;
    var DEFAULT_ROUND       = 12;

    var DEFAULT_FILL_ON     = 1;
    var DEFAULT_FILL_COLOR  = [1.0, 0.82, 0.0]; // Shine yellow

    var DEFAULT_STROKE_ON   = 0;
    var DEFAULT_STROKE_W    = 8;
    var DEFAULT_STROKE_COL  = [1.0, 1.0, 1.0];

    var DEFAULT_TEXT_SIZE   = 200;
    var DEFAULT_TEXT_STRING = "enter text";

    // Highlight defaults
    var DEFAULT_HIGHLIGHT_ON = 0;
    var HIGHLIGHT_FRAMES = 20;

    // Watch cadence
    var WATCH_INTERVAL_MS = 200;

    // Pause watcher while user is editing/has text selected
    var EDIT_PAUSE_MS = 5000;

    // ===== Small helpers =====
    function isComp(item){ return (item && (item instanceof CompItem)); }

    function isTextLayer(lyr) {
        if (!lyr) return false;
        try { return !!lyr.property("ADBE Text Properties").property("ADBE Text Document"); }
        catch (e) { return false; }
    }

    function isShapeLayer(lyr) {
        try { return lyr && (lyr.matchName === "ADBE Vector Layer"); } catch (e) { return false; }
    }

    function getTextStringSafe(textLayer) {
        try {
            var tdProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
            if (!tdProp) return "";
            var td = tdProp.value;
            return String((td && td.text) ? td.text : "");
        } catch (e) { return ""; }
    }

    function sanitizeName(name) {
        name = String(name || "");
        name = name.replace(/[\/\\\:\*\?\"\<\>\|]/g, "");
        name = name.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
        if (!name) return "";
        if (name.length > 60) name = name.substring(0, 60);
        return name;
    }

    function firstNWords(str, n) {
        str = String(str || "");
        str = str.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
        if (!str) return "";
        var parts = str.split(" ");
        return parts.slice(0, Math.max(1, n)).join(" ");
    }

    function setCommentSafe(obj, tag) {
        try { if (obj && obj.comment !== undefined) obj.comment = tag; } catch (e) {}
    }

    function safeSetName(obj, nm) {
        try { if (obj && nm && obj.name !== nm) obj.name = nm; } catch (e) {}
    }

    function clearAnchorExpression(layer) {
        try {
            var ap = layer.property("ADBE Transform Group").property("ADBE Anchor Point");
            if (ap && ap.canSetExpression) {
                ap.expression = "";
                ap.expressionEnabled = false;
            }
        } catch (e) {}
    }

    function centerLayerAnchorOnceKeepWorld(layer) {
        // Centers anchor to sourceRect and compensates Position so the layer doesn't jump.
        try {
            var t = layer.property("ADBE Transform Group");
            if (!t) return;

            var ap = t.property("ADBE Anchor Point");
            var pos = t.property("ADBE Position");
            if (!ap || !pos) return;

            var time = 0;
            try { if (layer.containingComp) time = layer.containingComp.time; } catch (e0) {}

            var sr = layer.sourceRectAtTime(time, false);
            var newAP = [sr.left + sr.width/2, sr.top + sr.height/2];

            var oldAP = ap.value;
            var oldPos = pos.value;

            var dx = newAP[0] - oldAP[0];
            var dy = newAP[1] - oldAP[1];

            ap.setValue(newAP);
            var newPos = [oldPos[0] + dx, oldPos[1] + dy];
            try { if (oldPos.length === 3) newPos.push(oldPos[2]); } catch (eZ) {}
            pos.setValue(newPos);

        } catch (e) {}
    }

    function resetLayerTransformToZero(lyr) {
        try {
            var t = lyr.property("ADBE Transform Group");
            if (!t) return;
            t.property("ADBE Anchor Point").setValue([0,0,0]);
            t.property("ADBE Position").setValue([0,0,0]);
            t.property("ADBE Scale").setValue([100,100,100]);
            t.property("ADBE Rotation").setValue(0);
            if (t.property("ADBE Opacity")) t.property("ADBE Opacity").setValue(100);
        } catch (e) {}
    }


    function centerTextBoxInPrecomp(precompComp) {
        // Centers the TEXT (and therefore the parented BOX) in the given precomp.
        try {
            if (!isComp(precompComp)) return;

            var tl = null, bl = null;

            for (var i=1; i<=precompComp.numLayers; i++) {
                var lyr = precompComp.layer(i);
                if (!lyr) continue;
                if (!tl && isTextLayer(lyr) && lyr.comment === TAG_TEXT_LAYER) tl = lyr;
                if (!bl && isShapeLayer(lyr) && lyr.comment === TAG_BOX_LAYER) bl = lyr;
            }

            // Fallbacks
            if (!tl) {
                for (var j=1; j<=precompComp.numLayers; j++) {
                    var l2 = precompComp.layer(j);
                    if (isTextLayer(l2)) { tl = l2; break; }
                }
            }
            if (!bl) {
                for (var k=1; k<=precompComp.numLayers; k++) {
                    var l3 = precompComp.layer(k);
                    if (isShapeLayer(l3) && String(l3.name).toLowerCase() === "text box") { bl = l3; break; }
                }
            }

            if (!tl) return;

            // Ensure anchor is centered on the text, then place it at comp center
            clearAnchorExpression(tl);
            centerLayerAnchorOnceKeepWorld(tl);

            var center = [precompComp.width/2, precompComp.height/2];
            try {
                var t = tl.property("ADBE Transform Group");
                if (t && t.property("ADBE Position")) t.property("ADBE Position").setValue(center);
            } catch (ePos) {}

            // Ensure the box stays correctly parented/zeroed so it follows the text cleanly
            try {
                if (bl) {
                    try { bl.parent = tl; } catch (ePar) {}
                    resetLayerTransformToZero(bl);
                }
            } catch (eBox) {}

        } catch (e) {}
    }

    // ----- Effect creators -----
    function addSlider(fx, name, val) {
        var s = fx.addProperty("ADBE Slider Control");
        s.name = name;
        try { s.property(1).setValue(val); } catch (e) {}
        return s;
    }

    function addColor(fx, name, rgb) {
        var c = fx.addProperty("ADBE Color Control");
        c.name = name;
        try { c.property(1).setValue(rgb); } catch (e) {}
        return c;
    }

    function addCheck(fx, name, onVal) {
        var cb = fx.addProperty("ADBE Checkbox Control");
        cb.name = name;
        try { cb.property(1).setValue(onVal ? 1 : 0); } catch (e) {}
        return cb;
    }

    function removeAllKeys(prop) {
        try { while (prop && prop.numKeys > 0) prop.removeKey(1); } catch (e) {}
    }

    function runEasyEaseMenuOnKeys(prop, keys, owningLayer) {
        // Runs AE menu command: Animation > Keyframe Assistant > Easy Ease
        // This relies on UI selection, so we temporarily select the layer/property/keys.
        try {
            if (!prop || !keys || keys.length === 0) return;

            var cmd = 0;
            try { cmd = app.findMenuCommandId("Easy Ease"); } catch (e0) { cmd = 0; }
            if (!cmd) {
                // Some AE builds/locales may not find it; try the older name.
                try { cmd = app.findMenuCommandId("Easy ease"); } catch (e1) {}
            }
            if (!cmd) return;

            // Try to ensure the owning layer is selected in the active comp
            try {
                if (owningLayer && owningLayer.containingComp) {
                    var comp = owningLayer.containingComp;
                    // Deselect other layers to avoid applying to unintended keys
                    try {
                        for (var i=1; i<=comp.numLayers; i++) comp.layer(i).selected = false;
                    } catch (eD) {}
                    owningLayer.selected = true;
                }
            } catch (e2) {}

            // Select the property (UI) and keys
            try { prop.selected = true; } catch (e3) {}
            for (var k=0; k<keys.length; k++) {
                try { prop.setSelectedAtKey(keys[k], true); } catch (e4) {}
            }

            // Execute command
            app.executeCommand(cmd);

            // Optional cleanup: leave selection as-is (users often don't mind).
        } catch (e) {}
    }

    // ----- Find layers in a comp -----
    function findTaggedTextLayer(comp) {
        if (!isComp(comp)) return null;

        for (var i=1; i<=comp.numLayers; i++) {
            var lyr = comp.layer(i);
            if (!lyr) continue;
            try {
                if (lyr.comment === TAG_TEXT_LAYER && isTextLayer(lyr)) return lyr;
            } catch (e) {}
        }
        // fallback: first text layer
        for (var j=1; j<=comp.numLayers; j++) {
            var lyr2 = comp.layer(j);
            if (isTextLayer(lyr2)) return lyr2;
        }
        return null;
    }

    function computeFirst3FromComp(comp) {
        var tl = findTaggedTextLayer(comp);
        if (!tl) return "";
        var raw = getTextStringSafe(tl);
        return sanitizeName(firstNWords(raw, 3));
    }

    
    function desiredNameFromText(str) {
        var nm = sanitizeName(firstNWords(str, 3));
        if (!nm) nm = DEFAULT_TEXT_STRING;
        return nm;
    }

    function updateNamesFromTextLayer(textLayer, owningComp) {
        // Renames:
        // - the text layer itself (inside precomp)
        // - the owning comp (precomp)
        // Parent comp precomp-layer name will auto-sync when user returns to parent comp via existing syncNamesForPrecompLayer().
        try {
            if (!textLayer || !isTextLayer(textLayer) || !isComp(owningComp)) return;

            var raw = getTextStringSafe(textLayer);
            var nm = desiredNameFromText(raw);

            safeSetName(textLayer, nm);
            safeSetName(owningComp, nm);
        } catch (e) {}
    }

function syncNamesForPrecompLayer(precompLayer) {
        try {
            if (!precompLayer || !precompLayer.source || !isComp(precompLayer.source)) return;
            var sourceComp = precompLayer.source;
            var desired = computeFirst3FromComp(sourceComp);
            if (!desired) desired = DEFAULT_TEXT_STRING;
            safeSetName(precompLayer, desired);
            safeSetName(sourceComp, desired);
            var textL = findTaggedTextLayer(sourceComp);
            if (textL) safeSetName(textL, desired);
        } catch (e) {}
    }

    function findTaggedPrecompLayersInComp(comp) {
        var out = [];
        if (!isComp(comp)) return out;
        for (var i=1; i<=comp.numLayers; i++) {
            var lyr = comp.layer(i);
            if (!lyr) continue;
            try {
                if (lyr.comment === TAG_PRECOMP_LAYER && lyr.source && isComp(lyr.source)) out.push(lyr);
            } catch (e) {}
        }
        return out;
    }

    function findBoxLayersInComp(comp) {
        var out = [];
        if (!isComp(comp)) return out;
        for (var i=1; i<=comp.numLayers; i++) {
            var lyr = comp.layer(i);
            if (!lyr) continue;
            try {
                if (isShapeLayer(lyr) && (lyr.comment === TAG_BOX_LAYER || String(lyr.name).toLowerCase() === "text box")) out.push(lyr);
            } catch (e) {}
        }
        return out;
    }

    // ----- Highlight / Reveal helpers -----
    function getHighlightCheckboxValue(boxLayer) {
        try {
            var fx = boxLayer.property("ADBE Effect Parade");
            if (!fx) return 0;
            var eff = fx.property("HIGHLIGHT");
            if (!eff) return 0;
            return eff.property(1).value;
        } catch (e) { return 0; }
    }

    function getRevealSlider(boxLayer) {
        try {
            var fx = boxLayer.property("ADBE Effect Parade");
            if (!fx) return null;
            var e = fx.property("Reveal %");
            if (!e) return null;
            return e.property(1);
        } catch (e) { return null; }
    }

    function ensureHighlightState(boxLayer) {
        try {
            if (!boxLayer || !isShapeLayer(boxLayer)) return;
            var comp = boxLayer.containingComp;
            if (!isComp(comp)) return;

            var reveal = getRevealSlider(boxLayer);
            if (!reveal) return;

            var on = (getHighlightCheckboxValue(boxLayer) === 1);

            var id = "L" + String(boxLayer.id);
            if (!mod.__hlState) mod.__hlState = {};
            var prev = (mod.__hlState[id] === undefined) ? -1 : mod.__hlState[id];

            if (on) {
                // Only rebuild keys when we newly turned on, or keys are missing
                if (prev !== 1 || reveal.numKeys < 2) {
                    if (reveal.numKeys > 0) removeAllKeys(reveal);

                    var t0 = comp.time;
                    var t1 = t0 + (HIGHLIGHT_FRAMES / comp.frameRate);

                    reveal.setValueAtTime(t0, 0);
                    reveal.setValueAtTime(t1, 100);

                    // Since we just created them, they are key 1 and 2
                    if (reveal.numKeys >= 2) {
                        // Run the actual AE menu command on both keys
                        runEasyEaseMenuOnKeys(reveal, [1,2], boxLayer);
                    }
                }
            } else {
                if (reveal.numKeys > 0) removeAllKeys(reveal);
                try { reveal.setValue(100); } catch (eSet) {}
            }

            mod.__hlState[id] = on ? 1 : 0;
        } catch (e) {}
    }

    // ----- Expressions application -----
    mod.applyExpressions = function(compId, boxIndex) {
        try {
            var comp = app.project && app.project.itemByID(compId);
            if (!isComp(comp)) return;
            if (boxIndex < 1 || boxIndex > comp.numLayers) return;

            var boxLayer = comp.layer(boxIndex);
            if (!boxLayer) return;

            var root = boxLayer.property("ADBE Root Vectors Group");
            if (!root) return;

            var revealGroup = root.property("Reveal");
            if (!revealGroup) return;

            var gc = revealGroup.property("ADBE Vectors Group");
            if (!gc) return;

            var rect = gc.property("Auto Rect");
            var fill = gc.property("Fill");
            var stroke = gc.property("Stroke");
            if (!rect) return;

            var rectSize = rect.property("ADBE Vector Rect Size");
            var rectPos  = rect.property("ADBE Vector Rect Position");
            var rectRound = rect.property("ADBE Vector Rect Roundness");

            rectSize.expressionEnabled = true;
            rectSize.expression = [
                "var px = effect(\"Padding\")(\"Point\")[0];",
                "var py = effect(\"Padding\")(\"Point\")[1];",
                "var sr = thisLayer.parent.sourceRectAtTime(time,false);",
                "var fullW = sr.width + px*2;",
                "var fullH = sr.height + py*2;",
                "var on = effect(\"HIGHLIGHT\")(\"Checkbox\");",
                "var p = 1; try { p = effect(\"Reveal %\")(\"Slider\")/100; } catch (err) { p = 1; }",
                "var w = (on==1) ? (fullW*p) : fullW;",
                "[w, fullH];"
            ].join("\n");

            rectPos.expressionEnabled = true;
            rectPos.expression = [
                "var px = effect(\"Padding\")(\"Point\")[0];",
                "var sr = thisLayer.parent.sourceRectAtTime(time,false);",
                "var fullW = sr.width + px*2;",
                "var on = effect(\"HIGHLIGHT\")(\"Checkbox\");",
                "var p = 1; try { p = effect(\"Reveal %\")(\"Slider\")/100; } catch (err) { p = 1; }",
                "var w = (on==1) ? (fullW*p) : fullW;",
                "[-(fullW - w)/2, 0];"
            ].join("\n");

            if (rectRound) {
                rectRound.expressionEnabled = true;
                rectRound.expression = 'effect("Roundness")("Slider");';
            }

            // Center group to text bounds
            var gt = revealGroup.property("ADBE Vector Transform Group");
            var gPos = gt.property("ADBE Vector Position");
            if (gPos) {
                gPos.expressionEnabled = true;
                gPos.expression =
                    'var sr = thisLayer.parent.sourceRectAtTime(time,false);\n' +
                    'var cx = sr.left + sr.width/2;\n' +
                    'var cy = sr.top + sr.height/2;\n' +
                    '[cx, cy];';
            }

            if (fill) {
                fill.property("ADBE Vector Fill Color").expression = 'effect("Box Color")("Color");';
                fill.property("ADBE Vector Fill Opacity").expression = 'effect("FILL")("Checkbox")*100;';
            }

            if (stroke) {
                stroke.property("ADBE Vector Stroke Width").expression = 'effect("Stroke Width")("Slider");';
                stroke.property("ADBE Vector Stroke Color").expression = 'effect("Stroke Color")("Color");';
                stroke.property("ADBE Vector Stroke Opacity").expression = 'effect("STROKE")("Checkbox")*100;';
            }

        } catch (e) {}
    };

    // ----- Precompose -----
    mod.precomposeTextBox = function(parentCompId, textIndex, boxIndex, initialName) {
        try {
            var parentComp = app.project && app.project.itemByID(parentCompId);
            if (!isComp(parentComp)) return;

            var idx = [textIndex, boxIndex].sort(function(a,b){ return a-b; });
            var insertAt = idx[0];

            var pc = parentComp.layers.precompose(idx, initialName, true);

            var precompLayer = parentComp.layer(insertAt);
            if (precompLayer) {
                setCommentSafe(precompLayer, TAG_PRECOMP_LAYER);
                try { precompLayer.collapseTransformation = true; } catch (e1) {}
                syncNamesForPrecompLayer(precompLayer);

            }

            if (pc && isComp(pc)) {
                // Tag + enforce box under text in the precomp
                var tl = null;
                var bl = null;

                for (var i=1; i<=pc.numLayers; i++) {
                    var lyr = pc.layer(i);
                    if (!lyr) continue;
                    try {
                        if (isTextLayer(lyr)) { setCommentSafe(lyr, TAG_TEXT_LAYER); tl = lyr; }
                        if (isShapeLayer(lyr) && String(lyr.name).toLowerCase() === "text box") { setCommentSafe(lyr, TAG_BOX_LAYER); bl = lyr; }
                    } catch (e2) {}
                }

                // Ensure box is UNDER text: moveAfter(text)
                try { if (tl && bl) bl.moveAfter(tl); } catch (eMove) {}

                // Center the text+box inside the new precomp (box follows text via parenting)
                try { centerTextBoxInPrecomp(pc); } catch (eCenter) {}

                try { pc.openInViewer(); } catch (eOpen) {}
            }

            mod.ensureWatcherRunning();

        } catch (e) {
            alert("TEXT BOX precomp error:\n" + e.toString());
        }
    };

    // ----- Watcher (single scheduleTask loop) -----
    function selectionSignature(comp) {
        try {
            if (!isComp(comp)) return "";
            var arr = comp.selectedLayers;
            if (!arr || arr.length === 0) return "none";
            var ids = [];
            for (var i=0; i<arr.length; i++) {
                try { ids.push(String(arr[i].id)); } catch (e) {}
            }
            return ids.join(",");
        } catch (e2) { return ""; }
    }

    function shouldPauseWatcherForEditing(comp) {
        try {
            if (!isComp(comp)) return false;
            if (!comp.selectedLayers || comp.selectedLayers.length !== 1) return false;
            return isTextLayer(comp.selectedLayers[0]);
        } catch (e) { return false; }
    }

    // watcher state (kept inside module to avoid clutter)
    mod.__watcher = {
        running: false,
        lastCompId: 0,
        lastSelSig: "",
        editPauseUntil: 0,
        pendingRecenter: false,
        lastEditingTextId: 0,
        lastEditingCompId: 0
    };

    // Track last-known text per text layer id so we can recenter after edits
    mod.__textState = {}; // { "compId_layerId": "lastText" }

    function maybeRecenterOnTextChange(comp) {
        // If a tagged text layer's text changed and it's NOT currently selected, recenter anchor once.
        try {
            if (!isComp(comp)) return;

            var selectedTextId = 0;
            try {
                if (comp.selectedLayers && comp.selectedLayers.length === 1 && isTextLayer(comp.selectedLayers[0])) {
                    selectedTextId = comp.selectedLayers[0].id;
                }
            } catch (eSel) {}

            for (var i=1; i<=comp.numLayers; i++) {
                var lyr = comp.layer(i);
                if (!lyr || !isTextLayer(lyr)) continue;

                // Only watch Shine-managed text layers
                var isTagged = false;
                try { isTagged = (lyr.comment === TAG_TEXT_LAYER); } catch (eTag) { isTagged = false; }
                if (!isTagged) continue;

                var key = String(comp.id) + "_" + String(lyr.id);
                var cur = getTextStringSafe(lyr);
                var prev = (mod.__textState[key] === undefined) ? null : mod.__textState[key];

                if (prev === null) {
                    mod.__textState[key] = cur;
                    continue;
                }

                // Changed AND not selected => safe to recenter
                if (cur !== prev && lyr.id !== selectedTextId) {
                    clearAnchorExpression(lyr);
                    centerLayerAnchorOnceKeepWorld(lyr);
                    updateNamesFromTextLayer(lyr, comp);
                    mod.__textState[key] = cur;
                } else if (cur !== prev) {
                    // Changed but still selected (actively editing) => just update later
                    // Don't update stored value yet so we still recenter after deselect.
                } else {
                    // unchanged
                }
            }
        } catch (e) {}
    }


    mod.__watchTick = function() {
        try {
            var comp = app.project && app.project.activeItem;
            if (!isComp(comp)) return;

            var now = (new Date()).getTime();

            // Pause during text edit to avoid interfering with AE typing focus
            if (shouldPauseWatcherForEditing(comp)) {
                mod.__watcher.editPauseUntil = now + EDIT_PAUSE_MS;
                try {
                    var tlEdit = comp.selectedLayers[0];
                    mod.__watcher.lastEditingTextId = tlEdit ? tlEdit.id : 0;
                    mod.__watcher.lastEditingCompId = comp.id;
                    mod.__watcher.pendingRecenter = true;
                } catch (eEdit) {}
                return;
            }

            // Recenter ONCE when the user clicks away from the edited text layer
            if (mod.__watcher.pendingRecenter) {
                try {
                    var tid = mod.__watcher.lastEditingTextId;
                    var isStillSelected = false;

                    if (comp.selectedLayers && comp.selectedLayers.length === 1) {
                        try { if (comp.selectedLayers[0] && comp.selectedLayers[0].id === tid) isStillSelected = true; } catch (eSel) {}
                    }

                    if (!isStillSelected) {
                        if (mod.__watcher.lastEditingCompId === comp.id && tid) {
                            var tl = null;
                            for (var li=1; li<=comp.numLayers; li++) {
                                try { if (comp.layer(li).id === tid) { tl = comp.layer(li); break; } } catch (eFind) {}
                            }
                            if (tl && isTextLayer(tl)) {
                                clearAnchorExpression(tl);
                                centerLayerAnchorOnceKeepWorld(tl);
                                updateNamesFromTextLayer(tl, comp);
                            }
                        }
                        mod.__watcher.pendingRecenter = false;
                        mod.__watcher.lastEditingTextId = 0;
                        mod.__watcher.lastEditingCompId = 0;
                    }
                } catch (ePR) {}
            }

            // Backup recenter: detect text changes and recenter when safe (not selected)
            maybeRecenterOnTextChange(comp);

            // Only run automation behaviors after edit pause window
            if (now >= mod.__watcher.editPauseUntil) {
                var boxes = findBoxLayersInComp(comp);
                for (var b=0; b<boxes.length; b++) ensureHighlightState(boxes[b]);


                // Bounds-based precomp anchor recenter (runs every tick, lightweight via cached sig)

                var compId = comp.id;
                var sig = selectionSignature(comp);

                if (compId !== mod.__watcher.lastCompId || sig !== mod.__watcher.lastSelSig) {
                    var layers = findTaggedPrecompLayersInComp(comp);
                    for (var i=0; i<layers.length; i++) syncNamesForPrecompLayer(layers[i]);
                }

                // Keep precomp layer anchor centered if its bounds change (text/box edits inside)

                mod.__watcher.lastCompId = compId;
                mod.__watcher.lastSelSig = sig;
            }

        } catch (e) {
        } finally {
            if (mod.__watcher.running) {
                app.scheduleTask('$.global.ShineTools.TextBox.__watchTick();', WATCH_INTERVAL_MS, false);
            }
        }
    };

    mod.ensureWatcherRunning = function(){
        if (!mod.__watcher.running) {
            mod.__watcher.running = true;
            app.scheduleTask('$.global.ShineTools.TextBox.__watchTick();', WATCH_INTERVAL_MS, false);
        }
    };

    // ----- Main: create text box + precomp -----
    mod.makeTextBox = function(){
        var comp = app.project && app.project.activeItem;
        if (!isComp(comp)) { alert("Please select an active comp."); return; }

        app.beginUndoGroup("TEXT BOX");

        var textLayer = null;

        if (comp.selectedLayers.length === 1 && isTextLayer(comp.selectedLayers[0])) {
            textLayer = comp.selectedLayers[0];
        } else if (comp.selectedLayers.length === 0) {
            textLayer = comp.layers.addText(DEFAULT_TEXT_STRING);
            textLayer.name = DEFAULT_TEXT_STRING;

            try {
                var tdProp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
                var td = tdProp.value;
                td.fontSize = DEFAULT_TEXT_SIZE;
                try { td.justification = ParagraphJustification.CENTER_JUSTIFY; } catch (eJust) {}
                tdProp.setValue(td);
            } catch (e) {}

            try {
                textLayer.property("ADBE Transform Group").property("ADBE Position")
                    .setValue([comp.width/2, comp.height/2]);
            } catch (e2) {}
        } else {
            app.endUndoGroup();
            alert("Select ONE text layer, or select NOTHING to create a new one.");
            return;
        }

        // Keep text editable: no anchor expressions; only recenter on deselect via watcher
        // Force CENTER JUSTIFIED text
        try {
            var _tdp = textLayer.property("ADBE Text Properties").property("ADBE Text Document");
            if (_tdp) {
                var _td = _tdp.value;
                try { _td.justification = ParagraphJustification.CENTER_JUSTIFY; } catch (eJ2) {}
                _tdp.setValue(_td);
            }
        } catch (eJ) {}
        setCommentSafe(textLayer, TAG_TEXT_LAYER);
        clearAnchorExpression(textLayer);
        centerLayerAnchorOnceKeepWorld(textLayer);
        // Seed text state so later edits trigger recenter-on-change
        try { $.global.ShineTools.TextBox.__textState[String(comp.id) + "_" + String(textLayer.id)] = getTextStringSafe(textLayer); } catch (eSeed) {}
        // Ensure initial naming is synced to first 3 words
        try { updateNamesFromTextLayer(textLayer, comp); } catch (eName0) {}

        var raw = getTextStringSafe(textLayer);
        var initialName = sanitizeName(firstNWords(raw, 3)) || DEFAULT_TEXT_STRING;

        var boxLayer = comp.layers.addShape();

        // Remove default shape contents
        try {
            var rootContents = boxLayer.property("ADBE Root Vectors Group");
            if (rootContents) {
                for (var ci = rootContents.numProperties; ci >= 1; ci--) {
                    try { rootContents.property(ci).remove(); } catch (eRem) {}
                }
            }
        } catch (eClean) {}

        boxLayer.name = "TEXT BOX";
        setCommentSafe(boxLayer, TAG_BOX_LAYER);

        // MUST be UNDER the text in the timeline
        try { boxLayer.moveAfter(textLayer); } catch (e3) {}

        // Parent to text for sourceRect-based sizing
        try { boxLayer.parent = textLayer; } catch (e4) {}
        resetLayerTransformToZero(boxLayer);

        var fx = boxLayer.property("ADBE Effect Parade");

        // Effects (ordered)
        addCheck(fx, "FILL", DEFAULT_FILL_ON);

        var padCtrl = fx.addProperty("ADBE Point Control");
        padCtrl.name = "Padding";
        try { padCtrl.property(1).setValue([DEFAULT_PAD_X, DEFAULT_PAD_Y]); } catch (eP) {}

        addSlider(fx, "Roundness", DEFAULT_ROUND);
        addColor(fx, "Box Color", DEFAULT_FILL_COLOR);

        addCheck(fx, "STROKE", DEFAULT_STROKE_ON);
        addSlider(fx, "Stroke Width", DEFAULT_STROKE_W);
        addColor(fx, "Stroke Color", DEFAULT_STROKE_COL);

        addCheck(fx, "HIGHLIGHT", DEFAULT_HIGHLIGHT_ON);
        addSlider(fx, "Reveal %", 100);

        // Shape contents
        var root = boxLayer.property("ADBE Root Vectors Group");
        var reveal = root.addProperty("ADBE Vector Group");
        reveal.name = "Reveal";

        var gc = reveal.property("ADBE Vectors Group");
        gc.addProperty("ADBE Vector Shape - Rect").name = "Auto Rect";
        gc.addProperty("ADBE Vector Graphic - Fill").name = "Fill";
        gc.addProperty("ADBE Vector Graphic - Stroke").name = "Stroke";

        var compId = comp.id;
        var ti = textLayer.index;
        var bi = boxLayer.index;

        app.endUndoGroup();

        // Apply expressions + precompose (tight timing for responsiveness)
        app.scheduleTask('$.global.ShineTools.TextBox.applyExpressions(' + compId + ',' + bi + ');', 50, false);
        app.scheduleTask('$.global.ShineTools.TextBox.precomposeTextBox(' + compId + ',' + ti + ',' + bi + ',"' + initialName.replace(/"/g,'\\"') + '");', 120, false);

        mod.ensureWatcherRunning();
    };

    // ---------- Publish module (integrated) ----------
    ST.TextBox = mod;
    try { mod.ensureWatcherRunning(); } catch (e) {}
    }
    // Initialize once so the TEXT tab button can call it
    try { initTextBoxModule(); } catch (eInitTB) {}

// ============================================================
    // 3) Favorites / Import
    // ============================================================
    function findFootageByFile(fileObj) {
        if (!fileObj || !app.project) return null;
        for (var i = 1; i <= app.project.numItems; i++) {
            var it = app.project.item(i);
            if (it && it instanceof FootageItem && it.file && it.file.fsName === fileObj.fsName) return it;
        }
        return null;
    }

    function importFootage(fileObj) {
        if (!fileObj || !fileObj.exists) return null;
        if (!requireProject()) return null;

        var existing = findFootageByFile(fileObj);
        if (existing) return existing;

        var io = new ImportOptions(fileObj);
        return app.project.importFile(io);
    }

    var FAV_SETTINGS_SECTION = "ShineTools";
    var FAV_SETTINGS_KEY     = "favorites_files_v1";
    var FAV_MAX              = 50;
    var FAV_DEFAULT_START_FOLDER = "/Volumes/EDIT DRIVE 8TB/_LIBRARY ELEMENTS";

var FAV_DEFAULT_START_FOLDER_NAME = "LIBRARY ELEMENTS_1"; // preferred start folder (mounted volume)

    // TEXT TAB: ANIMATIONS BAR (preset list)
    var ANIM_SETTINGS_SECTION = "ShineTools";
    var ANIM_SETTINGS_KEY     = "text_animations_ffx_v1";
    var ANIM_MAX              = 50;

    function _favStringify(arr) {
        try { return JSON.stringify(arr); } catch (e) {}
        var s = "";
        for (var i = 0; i < arr.length; i++) {
            if (i) s += "|";
            s += String(arr[i]).replace(/\|/g, " ");
        }
        return s;
    }

    function _favParse(str) {
        if (!str) return [];
        try {
            var v = JSON.parse(str);
            return (v && v.length) ? v : [];
        } catch (e) {}
        var parts = String(str).split("|");
        var out = [];
        for (var i = 0; i < parts.length; i++) if (parts[i]) out.push(parts[i]);
        return out;
    }

    function favLoad() {
        try {
            if (app.settings.haveSetting(FAV_SETTINGS_SECTION, FAV_SETTINGS_KEY)) {
                var raw = app.settings.getSetting(FAV_SETTINGS_SECTION, FAV_SETTINGS_KEY);
                var arr = _favParse(raw);

                var clean = [];
                var seen = {};
                for (var i = 0; i < arr.length; i++) {
                    var p = String(arr[i] || "");
                    if (!p) continue;
                    if (seen[p]) continue;
                    seen[p] = true;
                    clean.push(p);
                    if (clean.length >= FAV_MAX) break;
                }
                return clean;
            }
        } catch (e) {}
        return [];
    }

    function favSave(arr) {
        try {
            var clean = [];
            var seen = {};
            for (var i = 0; i < arr.length; i++) {
                var p = String(arr[i] || "");
                if (!p) continue;
                if (seen[p]) continue;
                seen[p] = true;
                clean.push(p);
                if (clean.length >= FAV_MAX) break;
            }
            app.settings.saveSetting(FAV_SETTINGS_SECTION, FAV_SETTINGS_KEY, _favStringify(clean));
        } catch (e) {}
    }

    function favAddPath(pathStr) {
        var favs = favLoad();
        var out = [pathStr];
        for (var i = 0; i < favs.length; i++) if (favs[i] !== pathStr) out.push(favs[i]);
        favSave(out);
    }

    function favRemovePath(pathStr) {
        var favs = favLoad();
        var out = [];
        for (var i = 0; i < favs.length; i++) {
            if (String(favs[i]) !== String(pathStr)) out.push(favs[i]);
        }
        favSave(out);
    }


    function favClear() { favSave([]); }


    function animLoad() {
        try {
            if (app.settings.haveSetting(ANIM_SETTINGS_SECTION, ANIM_SETTINGS_KEY)) {
                var raw = app.settings.getSetting(ANIM_SETTINGS_SECTION, ANIM_SETTINGS_KEY);
                var arr = [];
                try { arr = eval(raw); } catch (e1) { arr = []; }
                if (arr && arr.length) return arr;
            }
        } catch (e) {}
        return [];
    }

    function animSave(arr) {
        try {
            var clean = [];
            var seen = {};
            for (var i = 0; i < arr.length; i++) {
                var p = String(arr[i] || "");
                if (!p) continue;
                if (seen[p]) continue;
                seen[p] = true;
                clean.push(p);
                if (clean.length >= ANIM_MAX) break;
            }
            app.settings.saveSetting(ANIM_SETTINGS_SECTION, ANIM_SETTINGS_KEY, _favStringify(clean));
        } catch (e) {}
    }

    function animClear() { animSave([]); }

    function animRemovePath(pathStr) {
        var arr = animLoad();
        var out = [];
        for (var i = 0; i < arr.length; i++) {
            if (String(arr[i]) !== String(pathStr)) out.push(arr[i]);
        }
        animSave(out);
    }

function animOpenDialogFromDefaultFolder() {
    // TEXT tab (+) : start in User Presets
    var startFolder = null;
    try { var startFolder = _getUserPresetsStartFolder(); } catch (e0) {}
    // _openDialogAtFolder will show a single dialog and return null on cancel (no second fallback dialog).
    return _openDialogAtFolder(startFolder, "Choose After Effects preset(s) (.ffx) to add…", "After Effects Preset:*.ffx", true);
}

// Try to find a mounted folder by name (macOS: /Volumes/*/<name> or /Volumes/*/*/<name>)
function _findMountedFolderByName(folderName) {
    if (!folderName) return null;
    try {
        var vols = new Folder("/Volumes");
        if (!vols.exists) return null;

        var volItems = vols.getFiles();
        for (var i = 0; i < volItems.length; i++) {
            var v = volItems[i];
            if (!(v instanceof Folder)) continue;

            var direct = new Folder(v.fsName + "/" + folderName);
            if (direct.exists) return direct;

            // One level deep search (helps if the folder is inside a share root)
            var subs = v.getFiles(function (f) { return (f instanceof Folder); });
            for (var j = 0; j < subs.length; j++) {
                var s = subs[j];
                var deep = new Folder(s.fsName + "/" + folderName);
                if (deep.exists) return deep;
            }
        }
    } catch (e) {}
    return null;
}

function _getLibraryElementsStartFolder() {
    var startFolder = null;

    // 1) Explicit path (legacy default)
    try {
        startFolder = new Folder(FAV_DEFAULT_START_FOLDER);
        if (startFolder && startFolder.exists) return startFolder;
    } catch (e1) {}

    // 2) macOS mounted folder name (preferred)
    try {
        if ($.os && $.os.toLowerCase().indexOf("mac") !== -1) {
            startFolder = _findMountedFolderByName(FAV_DEFAULT_START_FOLDER_NAME);
            if (startFolder && startFolder.exists) return startFolder;
        }
    } catch (e2) {}

    return null;
}

function _getUserPresetsStartFolder() {
    try {
        // macOS: ~/Documents/Adobe/After Effects 2025/User Presets
        var docs = Folder.myDocuments;
        if (docs && docs.exists) {
            var f = new Folder(docs.fsName + "/Adobe/After Effects 2025/User Presets");
            if (f.exists) return f;
        }
    } catch (e) {}
    return null;
}



    

// Open a file dialog starting from a specific folder (more reliable than Folder.current on macOS/docked panels)
// IMPORTANT: If the dialog is shown and the user cancels, we must NOT open a second fallback dialog.
function _openDialogAtFolder(startFolder, prompt, filter, multiSelect) {
    // If we have a valid start folder, show ONE dialog (seed.openDlg) and return its result (can be null on cancel).
    try {
        if (startFolder && startFolder.exists) {
            try { Folder.current = startFolder; } catch (e0) {}
            var seed = new File(startFolder.fsName + "/");
            return seed.openDlg(prompt, filter, !!multiSelect);
        }
    } catch (e1) {
        // If something went wrong before showing the dialog, we'll fall through to the generic fallback below.
    }

    // Fallback only when we couldn't use the startFolder method (missing folder / exception before showing dialog).
    try { return File.openDialog(prompt, filter, !!multiSelect); } catch (e2) {}
    return null;
}
function favOpenDialogFromDefaultFolder() {
    // MAIN tab (+) : start in server Library Elements folder (mounted volume)
    var startFolder = null;
    try { var startFolder = _getLibraryElementsStartFolder(); } catch (e0) {}
    // _openDialogAtFolder will show a single dialog and return null on cancel (no second fallback dialog).
    return _openDialogAtFolder(startFolder, "Choose file(s) to add to Favorites…", "All Files:*.*", true);
}

    function favImportToBinAndTimeline(fileObj) {
        if (!fileObj || !fileObj.exists) return;
        if (!requireProject()) return;

        app.beginUndoGroup("ShineTools - Import Favorite");
        try {
            var item = importFootage(fileObj);
            if (!item) return;

            var c = getComp();
            if (c) { try { c.layers.add(item); } catch (eAdd) {} }
        } catch (e) {
            alert("Import failed:\n" + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================================================
    // 4) RIGS
    // ============================================================
    function addCameraRig() {
        var c = requireComp();
        if (!c) return;

        app.beginUndoGroup("ShineTools - 3D CAMERA RIG");
        try {
            var cam = c.layers.addCamera("Camera 1", [c.width / 2, c.height / 2]);
            cam.label = LABEL_ORANGE;

            var nul = c.layers.addNull();
            nul.threeDLayer = true;
            nul.name = "CAM CONTROL";
            nul.label = LABEL_ORANGE;

            try { nul.autoOrient = AutoOrientType.NO_AUTO_ORIENT; } catch (e0) {}
            try { nul.property("Transform").property("Orientation").setValue([0, 0, 0]); } catch (e1) {}
            try { nul.property("Transform").property("X Rotation").setValue(0); } catch (e2) {}
            try { nul.property("Transform").property("Y Rotation").setValue(0); } catch (e3) {}
            try { nul.property("Transform").property("Z Rotation").setValue(0); } catch (e4) {}

            nul.property("Transform").property("Position").setValue([c.width / 2, c.height / 2, 0]);

            cam.parent = nul;
            nul.moveBefore(cam);

            try {
                var p = cam.property("Transform").property("Position").value;
                cam.property("Transform").property("Position").setValue([0, 0, p[2]]);
            } catch (eCamPos) {}

        } catch (err) {
            warn("Error: " + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function addCCAdjustmentRig() {
        var c = requireComp();
        if (!c) return;

        app.beginUndoGroup("ShineTools - ADD CC ADJUSTMENT LAYER RIG");
        try {
            var adjA = c.layers.addSolid([1, 1, 1], "ADJ - Color", c.width, c.height, c.pixelAspect, c.duration);
            adjA.adjustmentLayer = true;
            adjA.label = LABEL_LAVENDER;

            addEffect(adjA, "ADBE Easy Levels2") || addEffect(adjA, "ADBE Levels");
            addEffect(adjA, "ADBE HUE SATURATION") || addEffect(adjA, "ADBE Hue Saturation");
            addEffect(adjA, "ADBE CurvesCustom") || addEffect(adjA, "ADBE Curves");

            var adjB = c.layers.addSolid([1, 1, 1], "ADJ - Vignette + Noise", c.width, c.height, c.pixelAspect, c.duration);
            adjB.adjustmentLayer = true;
            adjB.label = LABEL_LAVENDER;

            var vig = addEffect(adjB, "CC Vignette");
            if (vig) { try { vig.property("Amount").setValue(200); } catch (eV) {} }

            var noise = addEffect(adjB, "ADBE Noise") || addEffect(adjB, "Noise");
            if (noise) {
                try { noise.property("Amount of Noise").setValue(10); } catch (eN1) {}
                try { noise.property("Use Color Noise").setValue(false); } catch (eN2) {}
            }

            var adjC = c.layers.addSolid([1, 1, 1], "ADJ - Camera Lens Blur", c.width, c.height, c.pixelAspect, c.duration);
            adjC.adjustmentLayer = true;
            adjC.label = LABEL_LAVENDER;

            var clb = addEffect(adjC, "ADBE Camera Lens Blur") || addEffect(adjC, "Camera Lens Blur");
            if (clb) { try { clb.property("Blur Amount").setValue(10); } catch (eB) {} }

            adjC.moveToBeginning();
            adjB.moveAfter(adjC);
            adjA.moveAfter(adjB);

        } catch (err) {
            warn("Error: " + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================================================
    // 5) LAYERS
    // ============================================================
    function addSolidNativePrompt() {
        var c = requireComp();
        if (!c) return;

        var cmd = app.findMenuCommandId("Solid...");
        if (!cmd) cmd = app.findMenuCommandId("New Solid...");
        if (!cmd) cmd = app.findMenuCommandId("Solid Settings...");

        if (!cmd) {
            warn("Couldn't find the Solid... menu command.\nIf AE is localized, tell me the exact menu text under Layer > New for Solid.");
            return;
        }

        function safeColor01(col) {
            if (!col || col.length < 3) return [1, 1, 1];
            var r = col[0], g = col[1], b = col[2];
            if (r > 1 || g > 1 || b > 1) return [r / 255, g / 255, b / 255];
            return [r, g, b];
        }

        app.beginUndoGroup("ShineTools - ADD SOLID");
        try {
            if (!requireProject()) return;
            ensureCompViewer(c);

            var solidIdsBefore = {};
            for (var i = 1; i <= app.project.numItems; i++) {
                var itB = app.project.item(i);
                if (isSolidFootageItem(itB)) solidIdsBefore[String(itB.id)] = true;
            }

            var layersBefore = c.numLayers;
            app.executeCommand(cmd);

            if (c.numLayers > layersBefore) return;

            var newestSolid = null;
            for (var j = 1; j <= app.project.numItems; j++) {
                var itA = app.project.item(j);
                if (!isSolidFootageItem(itA)) continue;
                var key = String(itA.id);
                if (!solidIdsBefore[key]) newestSolid = itA;
            }

            if (!newestSolid) return;

            var col = [1, 1, 1];
            try { col = safeColor01(newestSolid.mainSource.color); } catch (eC) {}

            var newLayer = c.layers.addSolid(col, newestSolid.name, c.width, c.height, c.pixelAspect, c.duration);
            try { newLayer.selected = true; } catch (eSel) {}

        } catch (err) {
            warn("Error running Solid command:\n" + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function addNullDefault() {
        var c = requireComp();
        if (!c) return;

        app.beginUndoGroup("ShineTools - ADD NULL");
        try {
            var nul = c.layers.addNull();
            try { nul.selected = true; } catch (eSel) {}
        } catch (err) {
            warn("Error: " + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function addAdjustmentLayerDefault() {
        var c = requireComp();
        if (!c) return;

        app.beginUndoGroup("ShineTools - ADD ADJUSTMENT LAYER");
        try {
            var cmd = findMenuCommandIdAny([
                "Adjustment Layer",
                "Adjustment Layer...",
                "New Adjustment Layer",
                "New Adjustment Layer..."
            ]);

            ensureCompViewer(c);

            if (cmd) {
                app.executeCommand(cmd);
            } else {
                var adj = c.layers.addSolid([1, 1, 1], "Adjustment Layer", c.width, c.height, c.pixelAspect, c.duration);
                adj.adjustmentLayer = true;
            }
        } catch (err) {
            warn("Error: " + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================================================
    // 6) EXPRESSIONS
    // ============================================================
    function addTrimPaths() {
        var c = requireComp();
        if (!c) return;

        var t0 = c.time;
        var t1 = t0 + 1.0;

        app.beginUndoGroup("ShineTools - ADD TRIM PATHS");
        try {
            var lineLen = Math.round(c.width * 0.9);
            var strokeW = 100;

            var lyr = c.layers.addShape();
            lyr.name = "Trim Line";
            lyr.property("Transform").property("Position").setValue([c.width / 2, c.height / 2]);

            var root = lyr.property("ADBE Root Vectors Group");
            var grp = root.addProperty("ADBE Vector Group");
            grp.name = "Line Group";
            var grpContents = grp.property("ADBE Vectors Group");

            var pathProp = grpContents.addProperty("ADBE Vector Shape - Group");
            var shp = new Shape();
            shp.vertices = [[-lineLen / 2, 0], [lineLen / 2, 0]];
            shp.inTangents = [[0, 0], [0, 0]];
            shp.outTangents = [[0, 0], [0, 0]];
            shp.closed = false;
            pathProp.property("ADBE Vector Shape").setValue(shp);

            var stroke = grpContents.addProperty("ADBE Vector Graphic - Stroke");
            stroke.property("ADBE Vector Stroke Color").setValue([1, 1, 1]);
            stroke.property("ADBE Vector Stroke Width").setValue(strokeW);
            stroke.property("ADBE Vector Stroke Line Cap").setValue(1);

            var trim = grpContents.addProperty("ADBE Vector Filter - Trim");
            var endProp = trim.property("ADBE Vector Trim End");

            endProp.setValueAtTime(t0, 0);
            endProp.setValueAtTime(t1, 100);

            endProp.setInterpolationTypeAtKey(1, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            endProp.setInterpolationTypeAtKey(2, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);

            endProp.setTemporalEaseAtKey(1, [new KeyframeEase(0, 66)], [new KeyframeEase(0, 66)]);
            endProp.setTemporalEaseAtKey(2, [new KeyframeEase(0, 85)], [new KeyframeEase(0, 17)]);

            lyr.moveToBeginning();

        } catch (err) {
            warn("Error: " + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function hardBounceExpr() {
        return [
            "e = effect('ELASTICITY')('Slider');",
            "g = effect('GRAVITY')('Slider');",
            "nMax = Math.floor(effect('NUMBER OF BOUNCES')('Slider'));",
            "",
            "n = 0;",
            "if (numKeys > 0){",
            " n = nearestKey(time).index;",
            " if (key(n).time > time) n--;",
            "}",
            "if (n > 0){",
            " t = time - key(n).time;",
            " v = -velocityAtTime(key(n).time - .001)*e;",
            " vl = length(v);",
            " if (value instanceof Array){",
            "   vu = (vl > 0) ? normalize(v) : [0,0,0];",
            " }else{",
            "   vu = (v < 0) ? -1 : 1;",
            " }",
            " tCur = 0;",
            " segDur = 2*vl/g;",
            " tNext = segDur;",
            " nb = 1;",
            " while (tNext < t && nb <= nMax){",
            "   vl *= e;",
            "   segDur *= e;",
            "   tCur = tNext;",
            "   tNext += segDur;",
            "   nb++",
            " }",
            " if(nb <= nMax){",
            "   delta = t - tCur;",
            "   value +  vu*delta*(vl - g*delta/2);",
            " }else{",
            "   value",
            " }",
            "}else",
            " value"
        ].join("\n");
    }

    function inertialBounceExpr() {
        return [
            "amt   = effect('AMOUNT')('Slider');",
            "freq  = effect('FREQUENCY')('Slider');",
            "decay = effect('DECAY')('Slider');",
            "",
            "if (numKeys < 2) {",
            "  value;",
            "} else {",
            "  n = 0;",
            "  if (key(numKeys).time <= time) {",
            "    n = numKeys;",
            "  } else {",
            "    for (i = 1; i <= numKeys; i++) {",
            "      if (key(i).time > time) { n = i - 1; break; }",
            "    }",
            "  }",
            "  if (n < 2) {",
            "    value;",
            "  } else {",
            "    t = time - key(n).time;",
            "    v = velocityAtTime(key(n).time - thisComp.frameDuration/10);",
            "    if (value instanceof Array) {",
            "      vLen = Math.max(length(v), 0.001);",
            "      dir = v / vLen;",
            "      value + dir * (amt * Math.sin(t * freq * 2 * Math.PI) * Math.exp(-decay * t));",
            "    } else {",
            "      vLen = Math.max(Math.abs(v), 0.001);",
            "      dir = v / vLen;",
            "      value + dir * (amt * Math.sin(t * freq * 2 * Math.PI) * Math.exp(-decay * t));",
            "    }",
            "  }",
            "}"
        ].join("\n");
    }

    function wiggleExpr() {
        return [
            "freq = effect('Wiggle Frequency')('Slider');",
            "amt  = effect('Wiggle Amount')('Slider');",
            "wiggle(freq, amt);"
        ].join("\n");
    }

    function doHardBounce() {
        var c = requireComp(); if (!c) return;
        var props = requireSelectedProps(c); if (!props) return;

        var host = hostLayerFromProps(c, props);
        if (!host) { warn("Could not determine a layer to host HARD BOUNCE sliders."); return; }

        app.beginUndoGroup("ShineTools - HARD BOUNCE");
        try {
            getOrAddSlider(host, "ELASTICITY", 0.7);
            getOrAddSlider(host, "GRAVITY", 5000);
            getOrAddSlider(host, "NUMBER OF BOUNCES", 9);
            applyExpressionToProps(props, hardBounceExpr());
        } finally { app.endUndoGroup(); }
    }

    function doInertialBounce() {
        var c = requireComp(); if (!c) return;
        var props = requireSelectedProps(c); if (!props) return;

        var host = hostLayerFromProps(c, props);
        if (!host) { warn("Could not determine a layer to host INERTIAL BOUNCE sliders."); return; }

        app.beginUndoGroup("ShineTools - INERTIAL BOUNCE");
        try {
            getOrAddSlider(host, "AMOUNT", 20);
            getOrAddSlider(host, "FREQUENCY", 3.5);
            getOrAddSlider(host, "DECAY", 6);
            applyExpressionToProps(props, inertialBounceExpr());
        } finally { app.endUndoGroup(); }
    }

    function doWiggle() {
        var c = requireComp(); if (!c) return;
        var props = requireSelectedProps(c); if (!props) return;

        var host = hostLayerFromProps(c, props);
        if (!host) { warn("Could not determine a layer to host WIGGLE sliders."); return; }

        app.beginUndoGroup("ShineTools - WIGGLE");
        try {
            getOrAddSlider(host, "Wiggle Frequency", 2);
            getOrAddSlider(host, "Wiggle Amount", 20);
            applyExpressionToProps(props, wiggleExpr());
        } finally { app.endUndoGroup(); }
    }

    // ============================================================
    // 7) UTILITIES
    // ============================================================
    function trimLayerToNeighbor() {
        var c = requireComp();
        if (!c) return;

        var layers = c.selectedLayers;
        if (!layers || layers.length === 0) {
            alert("Select one or more layers to trim.");
            return;
        }

        var trimToAbove = isOptionDown(); // OPTION = ABOVE, default = BELOW

        app.beginUndoGroup("ShineTools - TRIM LAYER");
        try {
            for (var i = 0; i < layers.length; i++) {
                var lyr = layers[i];
                var idx = lyr.index;

                var refIdx = trimToAbove ? (idx - 1) : (idx + 1);
                if (refIdx < 1 || refIdx > c.numLayers) continue;

                var ref = c.layer(refIdx);
                if (!ref) continue;

                try {
                    lyr.inPoint  = ref.inPoint;
                    lyr.outPoint = ref.outPoint;
                } catch (e) {}
            }
        } finally {
            app.endUndoGroup();
        }
    }
    // Extend selected precomp layer (and its internal layers) so the LAST VISIBLE frame lands on the CTI frame.
    // Note: AE layer outPoint is exclusive, so we set outPoint = (CTI snapped to frame) + 1 frame.
    // This is the "2-frames-off from source duration" behavior we saw in testing, but it matches editor expectation.
    function extendPrecompToCTI_Util() {
        var c = requireComp();
        if (!c) return;

        var sel = c.selectedLayers;
        if (!sel || sel.length !== 1) { warn("Select exactly ONE precomp layer in the active comp."); return; }

        var lyr = sel[0];
        if (!lyr || !lyr.source || !(lyr.source instanceof CompItem)) {
            warn("Selected layer is not a precomp layer (its source is not a comp).");
            return;
        }

        var srcComp = lyr.source; // CompItem
        var parentFD = c.frameDuration;
        var srcFD    = srcComp.frameDuration;

        function getFPS(comp) {
            var fd = comp.frameDuration;
            if (!fd || fd <= 0) return 30.0;
            return 1.0 / fd;
        }
        var fpsParent = getFPS(c);
        var fpsSrc    = getFPS(srcComp);

        function safeTimeToFrames(t, fps) {
            try { if (typeof timeToFrames === "function") return timeToFrames(t, fps); } catch (e) {}
            return Math.round(t * fps);
        }
        function safeFramesToTime(fr, fps) {
            try { if (typeof framesToTime === "function") return framesToTime(fr, fps); } catch (e) {}
            return fr / fps;
        }

        // Frame-quantize CTI to the comp's frame grid
        var ctiRaw   = c.time;
        var ctiFrame = safeTimeToFrames(ctiRaw, fpsParent);
        var cti      = safeFramesToTime(ctiFrame, fpsParent);

        // Editor-friendly: include the CTI frame => exclusive outPoint is CTI + 1 frame
        var desiredParentOut = cti + parentFD;

        // RAW mapping (ignore time-remap clamping/oddities)
        var stretchPct = (lyr.stretch !== undefined) ? lyr.stretch : 100;
        if (!stretchPct) stretchPct = 100;
        var rawSourceT = (cti - lyr.startTime) * (100.0 / stretchPct);
        if (rawSourceT < srcComp.displayStartTime) rawSourceT = srcComp.displayStartTime;

        // Extend SOURCE duration FIRST so AE won't clamp the parent layer outPoint.
        // Two constraints:
        //  A) Must cover rawSourceT + small safety
        //  B) Must cover desiredParentOut + small buffer (precomp clamp quirks)
        var neededDur = Math.max(
            rawSourceT + (srcFD * 3.0),
            desiredParentOut + (srcFD * 2.0)
        );

        // Frame-align to source comp grid
        var needFrames = safeTimeToFrames(neededDur - srcComp.displayStartTime, fpsSrc);
        var durAligned = safeFramesToTime(needFrames, fpsSrc) + srcComp.displayStartTime;

        app.beginUndoGroup("ShineTools - Extend Precomp To CTI");
        try {
            if (srcComp.duration < durAligned) srcComp.duration = durAligned;

            // Extend all layers inside the source comp (extend-only)
            for (var i = 1; i <= srcComp.numLayers; i++) {
                var L = srcComp.layer(i);
                if (L && L.outPoint < srcComp.duration) L.outPoint = srcComp.duration;
            }

            // Now extend the parent precomp layer outPoint
            if (lyr.outPoint < desiredParentOut) lyr.outPoint = desiredParentOut;

            // Refresh nudge (helps AE re-evaluate cached frames)
            try {
                var prev = lyr.enabled;
                lyr.enabled = false;
                lyr.enabled = prev;
            } catch (eT) {}

        } catch (err) {
            warn("Extend Precomp To CTI failed:\n" + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // --------------------------------------------------
    // UTILITIES: PHOTO BORDERS (FINAL IMPLEMENTATIONS)
    // --------------------------------------------------

    function isAVLayer(layer) {
        return layer && (layer instanceof AVLayer);
    }

    function safeSetName(item, name) {
        try { item.name = name; } catch (e) {}
    }

    function ensureEffect(layer, matchName, displayName, defaultValue) {
        try {
            var fx = layer.property("Effects");
            if (!fx) return null;

            var existing = fx.property(displayName);
            if (existing) return existing;

            var e = fx.addProperty(matchName);
            if (!e) return null;
            safeSetName(e, displayName);

            try {
                if (matchName === "ADBE Slider Control") {
                    e.property("Slider").setValue(defaultValue);
                } else if (matchName === "ADBE Color Control") {
                    e.property("Color").setValue(defaultValue);
                }
            } catch (eSet) {}

            return e;
        } catch (eAll) {
            return null;
        }
    }

    function esc(s){
        return String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    }

    // ADD PHOTO BORDER (from ShineTools_BorderButton_Test_v4.jsx)
    function addPhotoBorder_Util() {
        var comp = requireComp();
        if (!comp) return;

        if (!comp.selectedLayers || comp.selectedLayers.length === 0) {
            alert("Select at least one image/footage layer (jpg/png/psd/etc).");
            return;
        }

        app.beginUndoGroup("Add Photo Border");

        try {
            var layers = comp.selectedLayers.slice(0);
            layers.sort(function(a, b){ return b.index - a.index; });

            for (var i = 0; i < layers.length; i++) {
                var lyr = layers[i];
                if (!isAVLayer(lyr)) continue;

                var src = null;
                try { src = lyr.source; } catch (e) {}
                if (!src) continue;

                var baseName = lyr.name;
                var parentCompName = comp.name;
                var precompName = "BORDER - " + baseName;

                // Precompose (LEAVE attributes)
                var precomp = null;
                try {
                    precomp = comp.layers.precompose([lyr.index], precompName, false);
                } catch (ePre) {
                    continue;
                }
                if (!precomp || !(precomp instanceof CompItem)) continue;

                // The new precomp layer in parent comp should still be at the same index
                var precompLayer = null;
                try { precompLayer = comp.layer(lyr.index); } catch (eL) { precompLayer = null; }
                if (!precompLayer) continue;

                // Add controls on the precomp layer in the parent comp
                ensureEffect(precompLayer, "ADBE Slider Control", "Border Width", 40);
                ensureEffect(precompLayer, "ADBE Color Control",  "Border Color", [1,1,1]);

                // Inside the precomp: rename inner content layer to stable name
                var innerContent = null;
                try { innerContent = precomp.layer(1); } catch (eInner) { innerContent = null; }
                if (innerContent) {
                    safeSetName(innerContent, "BORDER_CONTENT");
                }

                // Add shape layer for border inside the precomp
                var shp = null;
                try {
                    shp = precomp.layers.addShape();
                    safeSetName(shp, "BORDER_SHAPE");
                    shp.moveToBeginning();
                    shp.threeDLayer = false;
                } catch (eShape) {
                    shp = null;
                }

                if (shp && innerContent) {
                    try {
                        // Put shape layer at comp origin
                        var t = shp.property("Transform");
                        t.property("Position").setValue([0,0]);
                        t.property("Anchor Point").setValue([0,0]);

                        var contents = shp.property("Contents");

                        // Group
                        var grp = contents.addProperty("ADBE Vector Group");
                        grp.name = "Border";
                        var grpContents = grp.property("Contents");

                        // Rectangle Path
                        var rect = grpContents.addProperty("ADBE Vector Shape - Rect");
                        rect.name = "Rect";

                        rect.property("Size").expression =
                            "var L = thisComp.layer('BORDER_CONTENT');\n" +
                            "var r = L.sourceRectAtTime(time,false);\n" +
                            "[r.width, r.height];";

                        rect.property("Position").expression =
                            "var L = thisComp.layer('BORDER_CONTENT');\n" +
                            "var r = L.sourceRectAtTime(time,false);\n" +
                            "[r.left + r.width/2, r.top + r.height/2];";

                        rect.property("Roundness").setValue(0);

                        // Stroke
                        var stroke = grpContents.addProperty("ADBE Vector Graphic - Stroke");
                        stroke.name = "Stroke";
                        stroke.property("Opacity").setValue(100);

                        var parentCompExprName = esc(parentCompName);
                        var precompLayerExprName = esc(precompLayer.name);

                        stroke.property("Stroke Width").expression =
                            "var L = comp(\"" + parentCompExprName + "\").layer(\"" + precompLayerExprName + "\");\n" +
                            "var w = L.effect(\"Border Width\")(\"Slider\");\n" +
                            "var sx = L.transform.scale[0]/100;\n" +
                            "var sy = L.transform.scale[1]/100;\n" +
                            "var s = (sx+sy)/2;\n" +
                            "if (s <= 0.0001) s = 1;\n" +
                            "w / s;";

                        stroke.property("Color").expression =
                            'comp("' + parentCompExprName + '").layer("' + precompLayerExprName + '").effect("Border Color")("Color");';

                        try { stroke.property("Line Join").setValue(2); } catch (eJoin) {}
                        try { stroke.property("Line Cap").setValue(2); } catch (eCap) {}

                        // No fill
                        var fill = grpContents.addProperty("ADBE Vector Graphic - Fill");
                        fill.name = "Fill";
                        fill.property("Opacity").setValue(0);

                    } catch (eBuild) {}
                }
            }
        } catch (err) {
            alert("ADD PHOTO BORDER failed:\n" + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // EXTEND BORDERS (from ShineTools_ExtendBorders_v1.0.jsx)
    function extendBorders_Util() {
        var comp = requireComp();
        if (!comp) return;

        if (!comp.selectedLayers || comp.selectedLayers.length !== 1) {
            alert("Please select exactly one layer.");
            return;
        }

        var layer = comp.selectedLayers[0];

        app.beginUndoGroup("Extend Borders (CC Repetile)");

        try {
            var effects = layer.property("ADBE Effect Parade");
            if (!effects) throw new Error("Layer has no Effects group.");

            var repetile = effects.addProperty("CC Repetile");
            if (!repetile) throw new Error("Could not add CC Repetile (is the effect available?).");

            repetile.property("Expand Right").setValue(1000);
            repetile.property("Expand Left").setValue(1000);
            repetile.property("Expand Up").setValue(1000);
            repetile.property("Expand Down").setValue(1000);

            repetile.property("Tiling").setValue(1); // 1 = Repeat (popup order: Repeat=1, Unfold=2)

        } catch (err2) {
            alert("Error applying CC Repetile:\n" + err2.toString());
        }

        app.endUndoGroup();
    }

    // ============================================================
    // 8) RENDER
    // ============================================================
    function renderQueueSolo(rqItem) {
        var rq = app.project.renderQueue;
        var prev = [];
        for (var i = 1; i <= rq.numItems; i++) {
            prev[i] = rq.item(i).render;
            rq.item(i).render = false;
        }
        rqItem.render = true;

        rq.render();

        for (var j = 1; j <= rq.numItems; j++) {
            try { rq.item(j).render = prev[j]; } catch (eR) {}
        }
    }

    function renderPRORES422WithSaveDialog() {
        var c = requireComp();
        if (!c) return;
        if (!requireProject()) return;

        app.beginUndoGroup("ShineTools - RENDER PRORES 422");
        try {
            var rq = app.project.renderQueue;
            var rqItem = rq.items.add(c);

            try { rqItem.applyTemplate("Best Settings"); } catch (e1) {}

            var om = rqItem.outputModule(1);
            try { om.applyTemplate("PRORES 422"); } catch (e2) {
                alert("Couldn't apply Output Module template: PRORES 422\n\nDouble-check the template name matches exactly.");
                try { rqItem.remove(); } catch (eRm) {}
                return;
            }

            var outFile = File.saveDialog("Choose output location", "QuickTime Movie:*.mov");
            if (!outFile) { try { rqItem.remove(); } catch (eRm2) {} return; }

            var fs = outFile.fsName;
            if (fs.toLowerCase().slice(-4) !== ".mov") outFile = new File(fs + ".mov");
            om.file = outFile;

            renderQueueSolo(rqItem);

        } catch (err) {
            alert("Error:\n" + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function saveCurrentFramePSDOrJPG() {
        var c = requireComp();
        if (!c) return;
        if (!requireProject()) return;

        var wantJPG = isOptionDown();

        var outFile = wantJPG
            ? File.saveDialog("Save frame as JPG", "JPEG Image:*.jpg;*.jpeg")
            : File.saveDialog("Save frame as PSD", "Photoshop:*.psd");
        if (!outFile) return;

        function ensureExt(f, ext) {
            var fs = f.fsName;
            var lower = fs.toLowerCase();
            if (lower.slice(-ext.length) !== ext) return new File(fs + ext);
            return f;
        }
        outFile = ensureExt(outFile, wantJPG ? ".jpg" : ".psd");

        var PSD_TEMPLATES = ["Photoshop", "PSD", "Photoshop (PSD)", "Photoshop Layers", "Photoshop Layers (PSD)"];
        var JPG_TEMPLATES = ["JPEG", "JPG", "JPEG Sequence", "JPEG (Still)", "JPEG - Highest Quality"];

        function tryApplyAnyTemplate(omObj, names) {
            for (var i = 0; i < names.length; i++) {
                try { omObj.applyTemplate(names[i]); return true; } catch (e) {}
            }
            return false;
        }

        app.beginUndoGroup("ShineTools - SAVE FRAME (" + (wantJPG ? "JPG" : "PSD") + ")");
        try {
            var rq = app.project.renderQueue;
            var rqItem = rq.items.add(c);

            try { rqItem.timeSpanStart = c.time; } catch (eTS1) {}
            try { rqItem.timeSpanDuration = c.frameDuration; } catch (eTS2) {}
            try { rqItem.applyTemplate("Best Settings"); } catch (eRS) {}

            var om = rqItem.outputModule(1);
            var ok = tryApplyAnyTemplate(om, wantJPG ? JPG_TEMPLATES : PSD_TEMPLATES);

            if (!ok) {
                alert(
                    "Couldn't apply an Output Module template for " + (wantJPG ? "JPG" : "PSD") + ".\n\n" +
                    "Try creating a custom Output Module template named:\n" +
                    (wantJPG ? "\"JPEG\"" : "\"Photoshop\"") +
                    "\n\nThen run again."
                );
                try { rqItem.remove(); } catch (eRm) {}
                return;
            }

            om.file = outFile;
            renderQueueSolo(rqItem);

        } catch (e) {
            alert("Save Frame failed:\n" + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================================================
    // 9) CLEAN UP
    // ============================================================
    function cleanUpProjectBin() {
        if (!app.project) { alert("No project is open."); return; }

        function normExt(e) {
            if (!e) return "";
            e = String(e).toLowerCase();
            if (e.charAt(0) !== ".") e = "." + e;
            if (e === ".h.264") e = ".h264";
            return e;
        }

        function getFileExtLower(fileObj) {
            try {
                if (!fileObj) return "";
                var n = String(fileObj.name || "");
                var dot = n.lastIndexOf(".");
                if (dot < 0) return "";
                return normExt(n.substring(dot));
            } catch (e) { return ""; }
        }

        function findOrCreateRootFolder(folderName) {
            var root = app.project.rootFolder;

            for (var i = 1; i <= app.project.numItems; i++) {
                var it = app.project.item(i);
                if (it && (it instanceof FolderItem) && it.name === folderName && it.parentFolder === root) return it;
            }

            var f = app.project.items.addFolder(folderName);
            try { f.parentFolder = root; } catch (e2) {}
            return f;
        }

        var FOOTAGE_EXT = { ".mov":1, ".mp4":1, ".mxf":1, ".h264":1 };
        var IMAGE_EXT   = { ".ai":1, ".psd":1, ".webp":1, ".jpg":1, ".jpeg":1, ".gif":1, ".png":1, ".pdf":1 };
        var AUDIO_EXT   = { ".wav":1, ".mp3":1 };

        app.beginUndoGroup("ShineTools - ORGANIZE BIN");
        try {
            var fFootage  = findOrCreateRootFolder("FOOTAGE");
            var fImages   = findOrCreateRootFolder("IMAGES");
            var fAudio    = findOrCreateRootFolder("AUDIO");
            var fSolids   = findOrCreateRootFolder("SOLIDS");
            var fPrecomps = findOrCreateRootFolder("PRECOMPS");

            var moves = [];
            var counts = { footage:0, images:0, audio:0, solids:0, precomps:0 };

            for (var i = 1; i <= app.project.numItems; i++) {
                var it = app.project.item(i);
                if (!it) continue;
                if (it instanceof FolderItem) continue;

                if (isSolidFootageItem(it)) {
                    if (it.parentFolder !== fSolids) { moves.push({ item: it, folder: fSolids }); counts.solids++; }
                    continue;
                }

                if (it instanceof CompItem) {
                    var nm = String(it.name || "");
                    var first = nm.charAt(0);
                    if (first !== "_" && first !== "*") {
                        if (it.parentFolder !== fPrecomps) { moves.push({ item: it, folder: fPrecomps }); counts.precomps++; }
                    }
                    continue;
                }

                var ext = "";
                try { ext = getFileExtLower(it.file); } catch (eF) { ext = ""; }

                if (ext && FOOTAGE_EXT[ext]) {
                    if (it.parentFolder !== fFootage) { moves.push({ item: it, folder: fFootage }); counts.footage++; }
                    continue;
                }

                if (ext && IMAGE_EXT[ext]) {
                    if (it.parentFolder !== fImages) { moves.push({ item: it, folder: fImages }); counts.images++; }
                    continue;
                }

                if (ext && AUDIO_EXT[ext]) {
                    if (it.parentFolder !== fAudio) { moves.push({ item: it, folder: fAudio }); counts.audio++; }
                    continue;
                }
            }

            for (var m = 0; m < moves.length; m++) {
                try { moves[m].item.parentFolder = moves[m].folder; } catch (eMove) {}
            }

            alert(
                "ORGANIZE BIN complete:\n\n" +
                "FOOTAGE:  " + counts.footage + "\n" +
                "IMAGES:   " + counts.images  + "\n" +
                "AUDIO:    " + counts.audio   + "\n" +
                "SOLIDS:   " + counts.solids  + "\n" +
                "PRECOMPS: " + counts.precomps
            );
        } catch (err) {
            alert("ORGANIZE BIN error:\n" + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function reduceProject() {
        if (!app.project) { alert("No project is open."); return; }

        var cmd = findMenuCommandIdAny([
            "Reduce Project",
            "Reduce Project...",
            "File Dependencies Reduce Project",
            "Dependencies Reduce Project"
        ]);

        if (!cmd) { alert("Couldn't find the 'Reduce Project' command in this AE version/localization."); return; }

        app.beginUndoGroup("ShineTools - REDUCE PROJECT");
        try { app.executeCommand(cmd); } catch (e) { alert("Reduce Project failed:\n" + e.toString()); } finally { app.endUndoGroup(); }
    }

    // ============================================================
    // 10) TEXT TOOLS: Break Apart (Characters / Words / Lines)
    // ============================================================
    var SPLIT_MODE = { CHARACTERS: 0, WORDS: 1, LINES: 2 };

    function _setLayerPosition(layer, posX, posY) {
        var transform = layer.property("Transform");
        var positionProp = transform.property("Position");

        if (positionProp.dimensionsSeparated) {
            transform.property("X Position").setValue(posX);
            transform.property("Y Position").setValue(posY);
        } else {
            positionProp.setValue([posX, posY]);
        }
    }

    function _getLayerPosition(layer) {
        var transform = layer.property("Transform");
        var positionProp = transform.property("Position");

        if (positionProp.dimensionsSeparated) {
            return [
                transform.property("X Position").value,
                transform.property("Y Position").value
            ];
        } else {
            return positionProp.value;
        }
    }

    function _validateTextSelection() {
        var c = getComp();
        if (!c) return { ok:false, msg:"No Composition\n\nPlease open a composition first." };

        var selectedLayers = c.selectedLayers;
        if (!selectedLayers || selectedLayers.length === 0)
            return { ok:false, msg:"No Text Layers\n\nPlease select at least one text layer." };

        var textLayers = [];
        for (var i = 0; i < selectedLayers.length; i++) {
            if (selectedLayers[i] instanceof TextLayer) textLayers.push(selectedLayers[i]);
        }
        if (textLayers.length === 0)
            return { ok:false, msg:"No Text Layers\n\nPlease select at least one text layer." };

        return { ok:true, comp:c, layers:textLayers };
    }

    var SplitTextEngine = {

        createControllerNull: function(textLayer, originalName) {
            var activeComp = textLayer.containingComp;
            var controllerNull = activeComp.layers.addNull();
            controllerNull.name = originalName + " - Controller";

            var transformProps = ["Anchor Point", "Scale", "Rotation", "Opacity"];
            for (var p = 0; p < transformProps.length; p++) {
                try {
                    var srcProp = textLayer.property("Transform").property(transformProps[p]);
                    var destProp = controllerNull.property("Transform").property(transformProps[p]);
                    destProp.setValue(srcProp.value);
                } catch (error) {}
            }

            var srcPos = _getLayerPosition(textLayer);
            _setLayerPosition(controllerNull, srcPos[0], srcPos[1]);

            controllerNull.inPoint = textLayer.inPoint;
            controllerNull.outPoint = textLayer.outPoint;

            controllerNull.moveBefore(textLayer);
            return controllerNull;
        },

        measureCharacterPositions: function(textLayer, textContent) {
            var positions = [];
            var activeComp = textLayer.containingComp;
            var time = activeComp.time;

            var measureLayer = textLayer.duplicate();
            measureLayer.name = "TEMP_MEASURE";

            var textProps = measureLayer.property("ADBE Text Properties");
            var animators = textProps.property("ADBE Text Animators");

            var animator = animators.addProperty("ADBE Text Animator");
            animator.name = "Measurement Isolator";

            var animatorProps = animator.property("ADBE Text Animator Properties");
            var scaleProperty = animatorProps.addProperty("ADBE Text Scale 3D");
            // shrink non-selected glyphs out of the way
            try { scaleProperty.setValue([0, 0, 100]); } catch (eS) {}

            var selectors = animator.property("ADBE Text Selectors");
            var rangeSelector = selectors.addProperty("ADBE Text Selector");

            var advancedProps = rangeSelector.property("ADBE Text Range Advanced");
            // Units = Index, Type = Characters, Mode = Subtract, Max Amount = 100
            try { advancedProps.property("ADBE Text Range Units").setValue(2); } catch (e0) {}
            try { advancedProps.property("ADBE Text Range Type2").setValue(2); } catch (e1) {}
            try { advancedProps.property("ADBE Text Selector Mode").setValue(2); } catch (e2) {}
            try { advancedProps.property("ADBE Text Selector Max Amount").setValue(100); } catch (e3) {}

            var indexStart = rangeSelector.property("ADBE Text Index Start");
            var indexEnd = rangeSelector.property("ADBE Text Index End");
            var indexOffset = rangeSelector.property("ADBE Text Index Offset");

            indexStart.setValue(0);
            indexEnd.setValue(1);

            var charIndex = 0;
            for (var c = 0; c < textContent.length; c++) {
                var character = textContent.charAt(c);

                if (character === " " || character === "\r" || character === "\n") {
                    positions.push({ character: character, index: -1, stringIndex: c, isSpace: true });
                } else {
                    indexOffset.setValue(charIndex);
                    var bounds = measureLayer.sourceRectAtTime(time, false);

                    positions.push({
                        character: character,
                        index: charIndex,
                        stringIndex: c,
                        left: bounds.left,
                        top: bounds.top,
                        width: bounds.width,
                        height: bounds.height,
                        centerX: bounds.left + (bounds.width / 2),
                        centerY: bounds.top + (bounds.height / 2)
                    });

                    charIndex++;
                }
            }

            measureLayer.remove();
            return positions;
        },

        measureWordPositions: function(textLayer, textContent) {
            var positions = [];
            var activeComp = textLayer.containingComp;
            var time = activeComp.time;

            var words = [];
            var currentWord = "";
            for (var i = 0; i < textContent.length; i++) {
                var ch = textContent.charAt(i);
                if (ch === " " || ch === "\r" || ch === "\n") {
                    if (currentWord.length > 0) { words.push(currentWord); currentWord = ""; }
                } else {
                    currentWord += ch;
                }
            }
            if (currentWord.length > 0) words.push(currentWord);

            var measureLayer = textLayer.duplicate();
            measureLayer.name = "TEMP_MEASURE";

            var textProps = measureLayer.property("ADBE Text Properties");
            var animators = textProps.property("ADBE Text Animators");

            var animator = animators.addProperty("ADBE Text Animator");
            animator.name = "Measurement Isolator";

            var animatorProps = animator.property("ADBE Text Animator Properties");
            var scaleProperty = animatorProps.addProperty("ADBE Text Scale 3D");
            try { scaleProperty.setValue([0, 0, 100]); } catch (eS) {}

            var selectors = animator.property("ADBE Text Selectors");
            var rangeSelector = selectors.addProperty("ADBE Text Selector");

            var advancedProps = rangeSelector.property("ADBE Text Range Advanced");
            // Units = Index, Type = Words, Mode = Subtract, Max Amount = 100
            try { advancedProps.property("ADBE Text Range Units").setValue(2); } catch (e0) {}
            try { advancedProps.property("ADBE Text Range Type2").setValue(3); } catch (e1) {}
            try { advancedProps.property("ADBE Text Selector Mode").setValue(2); } catch (e2) {}
            try { advancedProps.property("ADBE Text Selector Max Amount").setValue(100); } catch (e3) {}

            var indexStart = rangeSelector.property("ADBE Text Index Start");
            var indexEnd = rangeSelector.property("ADBE Text Index End");
            var indexOffset = rangeSelector.property("ADBE Text Index Offset");

            indexStart.setValue(0);
            indexEnd.setValue(1);

            for (var w = 0; w < words.length; w++) {
                indexOffset.setValue(w);
                var bounds = measureLayer.sourceRectAtTime(time, false);

                positions.push({
                    word: words[w],
                    index: w,
                    left: bounds.left,
                    top: bounds.top,
                    width: bounds.width,
                    height: bounds.height,
                    centerX: bounds.left + (bounds.width / 2),
                    centerY: bounds.top + (bounds.height / 2)
                });
            }

            measureLayer.remove();
            return positions;
        },

        measureLinePositions: function(textLayer, textContent) {
            var positions = [];
            var activeComp = textLayer.containingComp;
            var time = activeComp.time;

            var allLines = textContent.split(/\r\n|\r|\n/);

            var measureLayer = textLayer.duplicate();
            measureLayer.name = "TEMP_MEASURE";

            var textProps = measureLayer.property("ADBE Text Properties");
            var animators = textProps.property("ADBE Text Animators");

            var animator = animators.addProperty("ADBE Text Animator");
            animator.name = "Measurement Isolator";

            var animatorProps = animator.property("ADBE Text Animator Properties");
            var scaleProperty = animatorProps.addProperty("ADBE Text Scale 3D");
            try { scaleProperty.setValue([0, 0, 100]); } catch (eS) {}

            var selectors = animator.property("ADBE Text Selectors");
            var rangeSelector = selectors.addProperty("ADBE Text Selector");

            var advancedProps = rangeSelector.property("ADBE Text Range Advanced");
            // Units = Index, Type = Lines, Mode = Subtract, Max Amount = 100
            try { advancedProps.property("ADBE Text Range Units").setValue(2); } catch (e0) {}
            try { advancedProps.property("ADBE Text Range Type2").setValue(4); } catch (e1) {}
            try { advancedProps.property("ADBE Text Selector Mode").setValue(2); } catch (e2) {}
            try { advancedProps.property("ADBE Text Selector Max Amount").setValue(100); } catch (e3) {}

            var indexStart = rangeSelector.property("ADBE Text Index Start");
            var indexEnd = rangeSelector.property("ADBE Text Index End");
            var indexOffset = rangeSelector.property("ADBE Text Index Offset");

            indexStart.setValue(0);
            indexEnd.setValue(1);

            for (var l = 0; l < allLines.length; l++) {
                var lineText = allLines[l];
                if (lineText.length > 0) {
                    indexOffset.setValue(l);
                    var bounds = measureLayer.sourceRectAtTime(time, false);

                    positions.push({
                        line: lineText,
                        index: l,
                        left: bounds.left,
                        top: bounds.top,
                        width: bounds.width,
                        height: bounds.height,
                        centerX: bounds.left + (bounds.width / 2),
                        centerY: bounds.top + (bounds.height / 2)
                    });
                }
            }

            measureLayer.remove();
            return positions;
        },

        reorderLayers: function(newLayers, originalLayer) {
            for (var r = newLayers.length - 1; r >= 0; r--) {
                try { newLayers[r].moveBefore(originalLayer); } catch (e) {}
            }
        },

        createCharacterLayers: function(textLayer, textContent, originalName, controllerNull, characterPositions) {
            var charCounts = {};
            var outLayers = [];
            var actualCount = 0;
            var activeComp = textLayer.containingComp;
            var time = activeComp.time;

            for (var i = 0; i < characterPositions.length; i++) {
                var cd = characterPositions[i];
                if (cd.isSpace) continue;

                var character = cd.character;

                try {
                    var charLayer = textLayer.duplicate();

                    var textProp = charLayer.property("Source Text");
                    var textDoc = textProp.value;
                    textDoc.text = character;
                    textProp.setValue(textDoc);

                    if (charCounts[character]) {
                        charCounts[character]++;
                        charLayer.name = originalName + " - " + character + " - " + charCounts[character];
                    } else {
                        charCounts[character] = 1;
                        charLayer.name = originalName + " - " + character;
                    }

                    var b = charLayer.sourceRectAtTime(time, false);
                    var ax = b.left + (b.width / 2);
                    var ay = b.top  + (b.height / 2);

                    // Centered anchor on the glyph
                    charLayer.property("Transform").property("Anchor Point").setValue([ax, ay]);

                    charLayer.parent = controllerNull;

                    // Place anchor at the measured center location (preserves tracking/spacing)
                    _setLayerPosition(charLayer, cd.centerX, cd.centerY);

                    charLayer.opened = false;
                    outLayers.push(charLayer);
                    actualCount++;

                } catch (err) {}
            }

            return { layers: outLayers, count: actualCount };
        },

        createWordLayers: function(textLayer, textContent, originalName, controllerNull, wordPositions) {
            var wordCounts = {};
            var outLayers = [];
            var actualCount = 0;
            var activeComp = textLayer.containingComp;
            var time = activeComp.time;

            for (var i = 0; i < wordPositions.length; i++) {
                var wd = wordPositions[i];
                var word = wd.word;

                try {
                    var wordLayer = textLayer.duplicate();

                    var textProp = wordLayer.property("Source Text");
                    var textDoc = textProp.value;
                    textDoc.text = word;
                    textProp.setValue(textDoc);

                    if (wordCounts[word]) {
                        wordCounts[word]++;
                        wordLayer.name = originalName + " - " + word + " - " + wordCounts[word];
                    } else {
                        wordCounts[word] = 1;
                        wordLayer.name = originalName + " - " + word;
                    }

                    var b = wordLayer.sourceRectAtTime(time, false);
                    var ax = b.left + (b.width / 2);
                    var ay = b.top  + (b.height / 2);

                    wordLayer.property("Transform").property("Anchor Point").setValue([ax, ay]);

                    wordLayer.parent = controllerNull;
                    _setLayerPosition(wordLayer, wd.centerX, wd.centerY);

                    wordLayer.opened = false;
                    outLayers.push(wordLayer);
                    actualCount++;

                } catch (err) {}
            }

            return { layers: outLayers, count: actualCount };
        },

        createLineLayers: function(textLayer, textContent, originalName, controllerNull, linePositions) {
            var outLayers = [];
            var actualCount = 0;
            var activeComp = textLayer.containingComp;
            var time = activeComp.time;

            for (var i = 0; i < linePositions.length; i++) {
                var ld = linePositions[i];
                var line = ld.line;

                try {
                    var lineLayer = textLayer.duplicate();

                    var textProp = lineLayer.property("Source Text");
                    var textDoc = textProp.value;
                    textDoc.text = line;
                    textProp.setValue(textDoc);

                    lineLayer.name = originalName + " - Line " + (i + 1);

                    var b = lineLayer.sourceRectAtTime(time, false);
                    var ax = b.left + (b.width / 2);
                    var ay = b.top  + (b.height / 2);

                    lineLayer.property("Transform").property("Anchor Point").setValue([ax, ay]);

                    lineLayer.parent = controllerNull;
                    _setLayerPosition(lineLayer, ld.centerX, ld.centerY);

                    lineLayer.opened = false;
                    outLayers.push(lineLayer);
                    actualCount++;

                } catch (err) {}
            }

            return { layers: outLayers, count: actualCount };
        },

        processTextLayer: function(textLayer, splitMode) {
            var sourceProp = textLayer.property("Source Text");
            var textDocument = sourceProp.value;
            var textContent = textDocument.text;

            if (!textContent || textContent.length === 0) throw new Error("Text layer is empty");

            var originalName = textLayer.name;

            var controllerNull = this.createControllerNull(textLayer, originalName);

            var positions, result;

            if (splitMode === SPLIT_MODE.CHARACTERS) {
                positions = this.measureCharacterPositions(textLayer, textContent);
                result = this.createCharacterLayers(textLayer, textContent, originalName, controllerNull, positions);
            } else if (splitMode === SPLIT_MODE.WORDS) {
                positions = this.measureWordPositions(textLayer, textContent);
                result = this.createWordLayers(textLayer, textContent, originalName, controllerNull, positions);
            } else {
                positions = this.measureLinePositions(textLayer, textContent);
                result = this.createLineLayers(textLayer, textContent, originalName, controllerNull, positions);
            }

            this.reorderLayers(result.layers, textLayer);

            // Disable original
            try { textLayer.enabled = false; } catch (e0) {}

            return result.count;
        }
    };

    function breakApartTextRun(mode) {
        var v = _validateTextSelection();
        if (!v.ok) { alert(v.msg); return; }

        var label = (mode === SPLIT_MODE.CHARACTERS) ? "Characters" : (mode === SPLIT_MODE.WORDS) ? "Words" : "Lines";

        app.beginUndoGroup("ShineTools - Break Apart (" + label + ")");
        try {
            var layers = v.layers;
            for (var i = 0; i < layers.length; i++) {
                SplitTextEngine.processTextLayer(layers[i], mode);
            }
        } catch (e) {
            alert("Break Apart failed:\n\n" + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================================================
    // 11) UI — TABS + Accordion
    // ============================================================
    function buildUI(thisObj) {

        var pal = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", "ShineTools v1.0", undefined, { resizeable: true });

        // Focus sink (used to kill blue focus ring on buttons after click)
        function ensureFocusSink() {
            if (pal.__focusSink) return pal.__focusSink;
            try {
                var fs = pal.add("edittext", undefined, "");
                fs.visible = false;
                fs.enabled = true;
                fs.preferredSize = [0, 0];
                try { fs.location = [-10000, -10000]; } catch (eLoc) {}
                pal.__focusSink = fs;
                return fs;
            } catch (eFS) {
                return null;
            }
        }

        if (!pal) return pal;

        pal.preferredSize = [360, 780];
        pal.minimumSize   = [220, 420];
        // Resize handlers are attached later (after UI is built) for better performance.
        pal.orientation   = "column";
        pal.alignChildren = ["fill", "fill"];
        pal.margins       = 0;
        pal.spacing       = 0;
        // -------------------------
        // -------------------------
// TOP TAB LABELS + ACTIVE UNDERLINE
//   (implemented as a stacked header so we can draw an underline
//    without hijacking tabBar.onDraw — which can suppress child text)
// -------------------------
var tabHeader = pal.add("group");
tabHeader.orientation   = "column";
tabHeader.alignChildren = ["fill", "top"];
tabHeader.alignment     = ["fill", "top"];
tabHeader.margins       = [10, 8, 10, 4];
tabHeader.spacing       = 0;

var tabBar = tabHeader.add("group");
tabBar.orientation   = "row";
tabBar.alignChildren = ["left", "center"];
tabBar.alignment     = ["fill", "top"];
tabBar.margins       = 0;
tabBar.spacing       = 14;

// Transparent overlay used ONLY for drawing the underline
var tabUnderlineLayer = tabHeader.add("group");
tabUnderlineLayer.orientation   = "row";
tabUnderlineLayer.alignChildren = ["fill", "fill"];
tabUnderlineLayer.alignment     = ["fill", "top"];
tabUnderlineLayer.margins       = 0;
tabUnderlineLayer.spacing       = 0;

// A ScriptUI group with no children can collapse to 0px height, which
// prevents onDraw from displaying anything. Give this layer a fixed height.
tabUnderlineLayer.minimumSize   = [10, 6];
tabUnderlineLayer.preferredSize = [10, 6];
tabUnderlineLayer.maximumSize   = [10000, 6];

function _makeTopTabLabel(txt) {
    var st = tabBar.add("statictext", undefined, txt);
    st.justify = "left";
    st.margins = 0;
    st.minimumSize = [42, 16];
    return st;
}

var tabLblMain = _makeTopTabLabel("MAIN");
var tabLblText = _makeTopTabLabel("TEXT");
var tabLblHelp = _makeTopTabLabel("HELP");
var tabLblUpdates = _makeTopTabLabel("UPDATES");
var TAB_LABEL_ACTIVE = [1.0, 0.82, 0.0, 1];  // Shine yellow
var TAB_LABEL_IDLE   = [0.85, 0.85, 0.85, 1];

function _setTopTabLabelColor(st, rgbaArr) {
    try {
        st.graphics.foregroundColor = st.graphics.newPen(st.graphics.PenType.SOLID_COLOR, rgbaArr, 1);
    } catch (e) {}
}

function _drawTopTabUnderline(g, st, underlineEl) {
    try {
        if (!g || !st || !underlineEl) return;

        // Convert tab label bounds (parent coordinates) into underline element local coordinates
        var b  = st.bounds;                // [l,t,r,b] in tabBar coords
        var bb = st.parent ? st.parent.bounds : [0,0,0,0]; // tabBar bounds in tabHeader coords
        var ub = underlineEl.bounds;       // underline bounds in tabHeader coords

        // Base X in underline local space
        var baseL = (bb[0] + b[0]) - ub[0];
        var baseR = (bb[0] + b[2]) - ub[0];

        // Prefer underline width based on the actual text (not the whole tab hit area)
        // so the line only sits under the word.
        var pad = 2; // small breathing room
        var wText = 0;
        try {
            var ms = st.graphics.measureString(st.text);
            wText = (ms && ms.length) ? ms[0] : 0;
        } catch (eMS) { wText = 0; }

        // Fallback: if measureString fails, use the label bounds
        if (!wText || wText <= 0) {
            wText = Math.max(0, (baseR - baseL) - 4);
        }

        var labelW = (baseR - baseL);

        // "Typographically" friendlier underline placement:
        // - Avoid hardcoded nudges per-tab
        // - Estimate the actual glyph start by removing the control's left padding
        //   and compensating for font-specific left bearing/kerning using measureString.
        // NOTE: ScriptUI doesn't expose true font metrics, so we approximate via deltas.
        var inset = 0;
        try {
            var j = (st.justify ? (""+st.justify).toLowerCase() : "");
            if (j.indexOf("center") >= 0) inset = (labelW - wText) * 0.5;
            else if (j.indexOf("right") >= 0) inset = (labelW - wText);
            else inset = 0; // left-justified: start at the control's true left
        } catch (eJ) { inset = 0; }

        // Approximate left-bearing/kerning at the start of the string.
        // Measure a stable prefix character and the prefix+text; the delta vs wText
        // often reveals small horizontal offsets for the first glyph.
        var lb = 0;
        try {
            var wP  = st.graphics.measureString("H");
            var wPT = st.graphics.measureString("H" + st.text);
            var wp  = (wP  && wP.length)  ? wP[0]  : 0;
            var wpt = (wPT && wPT.length) ? wPT[0] : 0;
            lb = (wpt - wp - wText);
            if (isNaN(lb) || !isFinite(lb)) lb = 0;
            // Keep it sane; we only want micro-adjustments.
            if (lb > 6) lb = 6;
            if (lb < -6) lb = -6;
        } catch (eLB) { lb = 0; }

        var x1 = baseL + inset + lb - pad;
        var x2 = x1 + wText + (pad * 2);

        // Micro-nudge: MAIN underline 2px left (visual optical alignment)
        var _tabTxt = (st && st.text) ? String(st.text) : "";
        if (_tabTxt === "MAIN") { x1 -= 2; x2 -= 2; }

        // Slightly shorten non-MAIN underlines for a tighter optical fit
        if (_tabTxt !== "MAIN") { x1 += 2; x2 -= 2; }


        // Draw along the bottom of the underline element itself
        var y  = underlineEl.size[1] - 1;

        // Clamp just in case
        if (x2 < x1) { var tmp = x1; x1 = x2; x2 = tmp; }
        x1 = Math.max(0, x1);
        x2 = Math.min(underlineEl.size[0], x2);

        var pen = g.newPen(g.PenType.SOLID_COLOR, TAB_LABEL_ACTIVE, 2);
        g.newPath();
        g.moveTo(x1, y);
        g.lineTo(x2, y);
        g.strokePath(pen);
    } catch (e) {}
}


tabUnderlineLayer.onDraw = function () {
    try {
        var which = pal.__activeTopTab || "MAIN";
        var st = (which === "TEXT") ? tabLblText :
                 ((which === "UPDATES") ? tabLblUpdates :
                 ((which === "HELP") ? tabLblHelp : tabLblMain));
        _drawTopTabUnderline(tabUnderlineLayer.graphics, st, tabUnderlineLayer);
    } catch (e) {}
};



        // -------------------------
        // TAB CONTENT STACK (replaces ScriptUI tabbedpanel so we can style labels safely)
        // -------------------------
        var tabStack = pal.add("group");
        tabStack.orientation   = "stack";
        tabStack.alignChildren = ["fill", "fill"];
        tabStack.alignment     = ["fill", "fill"];
        tabStack.margins       = 0;
        tabStack.spacing       = 0;

        var tabMain = tabStack.add("group");
        var tabText = tabStack.add("group");
        var tabHelp = tabStack.add("group");
        var tabUpdates = tabStack.add("group");
        tabHelp.visible = false;
        tabUpdates.visible = false;// GLOBAL FOOTER (outside tabs)
        // -------------------------
        var globalFooter = pal.add("group");
        globalFooter.orientation   = "row";
        globalFooter.alignChildren = ["fill", "bottom"];
        globalFooter.alignment     = ["fill", "bottom"];
        globalFooter.margins       = [10, 0, 10, 6];
        globalFooter.spacing       = 0;

        var gfLeft = globalFooter.add("group");
        gfLeft.orientation   = "row";
        gfLeft.alignChildren = ["left", "bottom"];
        gfLeft.alignment     = ["fill", "bottom"];
        gfLeft.margins       = 0;
        gfLeft.spacing       = 0;

        var gfRight = globalFooter.add("group");
        gfRight.orientation   = "row";
        gfRight.alignChildren = ["right", "bottom"];
        gfRight.alignment = ["right", "bottom"];
        gfRight.margins       = 0;
        gfRight.spacing       = 0;

        // Left text
        var gfCopy = gfLeft.add("statictext", undefined, "(c) 2025 Shine Creative | v1.1");
        gfCopy.margins = 0;

        // flexible gap
        var gfGap = globalFooter.add("group");
        gfGap.minimumSize = [0, 0];
        gfGap.maximumSize = [10000, 10000];
        gfGap.alignment   = ["fill","fill"];

        // Right legend
        var gfDot = gfRight.add("statictext", undefined, "●");
        // Nudge the footer legend dot down slightly for better baseline alignment.
        // (Button dots are pinned; footer dot lives in a row layout.)
        gfDot.margins = [0, 0, 0, 0];
        gfDot.alignment = ["right", "center"];
        gfDot.minimumSize = [12, 12];
        gfDot.maximumSize = [12, 12];
        gfDot.preferredSize = [12, 12];
        gfDot.justify = "center";
        try {
            var g = gfDot.graphics;
            g.foregroundColor = g.newPen(g.PenType.SOLID_COLOR, [1.0, 0.8, 0.0, 1], 1);
        } catch (e) {}

        // Spacer between dot and '='
                var _gfSpacer = gfRight.add("statictext", undefined, " ");
                _gfSpacer.margins = 0;
                _gfSpacer.minimumSize = [4, 12];
                _gfSpacer.maximumSize = [4, 12];
                _gfSpacer.preferredSize = [4, 12];

        var gfLegend = gfRight.add("statictext", undefined, "= Multiple Options");
                gfLegend.justify = "right";
                gfLegend.margins = 0;

        // Keep global footer single-line and avoid clipping on narrow panels
        function applyGlobalFooterResponsive() {
            try {
                var W = 0;
                try { W = pal.size[0] || 0; } catch (eW) { W = 0; }
                // Hide legend label when too narrow so nothing clips (dot stays visible)
                gfLegend.visible = (W === 0) ? true : (W >= 420);
                // Keep right group anchored
                gfRight.alignment = ["right","bottom"];
            } catch (e) {}
        }
        globalFooter.onResizing = function () {
            // Throttle to reduce flicker while dragging
            var now = +new Date();
            if (!globalFooter.__lastTick || (now - globalFooter.__lastTick) >= 60) {
                globalFooter.__lastTick = now;
                applyGlobalFooterResponsive();
            }
        };
        globalFooter.onResize   = function () { applyGlobalFooterResponsive(); };




        // --------------------------------------------------
        // Deferred build: TEXT tab (speeds initial panel load)
        // --------------------------------------------------
        var __textTabBuilt = false;
        var __textTabPlaceholder = tabText.add("group");
        __textTabPlaceholder.orientation = "column";
        __textTabPlaceholder.alignChildren = ["fill","top"];
        __textTabPlaceholder.alignment = ["fill","fill"];
        __textTabPlaceholder.margins = 20;
        __textTabPlaceholder.spacing = 8;

        try {
            var __ph = __textTabPlaceholder.add("statictext", undefined, "Loading…", {multiline:false});
            __ph.justify = "center";
            __ph.alignment = ["fill","top"];
            try { __ph.graphics.foregroundColor = __ph.graphics.newPen(__ph.graphics.PenType.SOLID_COLOR, [0.6,0.6,0.6,1], 1); } catch(ePH) {}
        } catch (ePH2) {}

        function _buildTextTabIfNeeded() {
            if (__textTabBuilt) return;
            __textTabBuilt = true;

            // IMPORTANT: In ScriptUI, an invisible placeholder group can still influence layout
            // (especially inside stacked tab containers). Hard-disable its layout footprint.
            try {
                __textTabPlaceholder.visible = false;
                __textTabPlaceholder.enabled = false;
                __textTabPlaceholder.margins = 0;
                __textTabPlaceholder.spacing = 0;
                __textTabPlaceholder.minimumSize = [0, 0];
                __textTabPlaceholder.maximumSize = [0, 0];
                __textTabPlaceholder.preferredSize = [0, 0];
                // Try to remove it entirely (supported in most ScriptUI builds)
                try { tabText.remove(__textTabPlaceholder); } catch (eRem) {}
            } catch (e0) {}

            try {
                        // =========================================================
                        var textRoot = tabText.add("group");
                        textRoot.orientation   = "column";
                        textRoot.alignChildren = ["fill", "fill"];
                        textRoot.margins       = 0;
                        textRoot.spacing       = 0;

                        // Same logo header for alignment
                        addLogoHeader(textRoot);

                        // Text tab content container matches MAIN’s accordion region margins
                        var textContent = textRoot.add("group");
                        textContent.orientation   = "column";
                        textContent.alignChildren = ["fill", "top"];
                        textContent.alignment     = ["fill", "top"];
                        textContent.margins       = [10, 8, 14, 0];
                        textContent.spacing       = 10;

                                // ANIMATIONS BAR (TEXT tab) — mirrors MAIN tab Favorites bar height/spacing for alignment
                        var animWrap = textContent.add("group");
                        animWrap.orientation   = "column";
                        animWrap.alignChildren = ["fill", "top"];
                        animWrap.alignment     = ["fill", "top"];
                        animWrap.margins       = [0, 0, 0, 0];
                        animWrap.spacing       = 3;

                        var animRow = animWrap.add("group");
                        animRow.orientation   = "row";
                        animRow.alignChildren = ["left", "bottom"];
                        animRow.alignment     = ["fill", "bottom"];
                        animRow.margins       = 0;
                        animRow.spacing       = TOPROW_ROW_GAP;

                        var animStar = animRow.add("statictext", undefined, "★");
                        animStar.alignment = ["left","bottom"];
                        animStar.minimumSize = [UI.twirlW, UI.headerH];
                        animStar.maximumSize = [UI.twirlW, UI.headerH];
                        animStar.justify = "center";
                        try { animStar.graphics.font = ScriptUI.newFont(animStar.graphics.font.name, animStar.graphics.font.style, animStar.graphics.font.size + 4); } catch (eF) {}
                        try {
                            animStar.graphics.foregroundColor =
                                animStar.graphics.newPen(
                                    animStar.graphics.PenType.SOLID_COLOR,
                                    [1.0, 0.82, 0.2, 1],
                                    1
                                );
                        } catch (e) {}

                        _chainOnLayoutShiftY(animRow, animStar, -2);

                        var animStarPad = animRow.add("group");
                        animStarPad.minimumSize = [TOPROW_LABEL_INSET, 0];
                        animStarPad.maximumSize = [TOPROW_LABEL_INSET, 10000];

                        var animLbl = animRow.add("statictext", undefined, "TEXT ANIMATORS:");
                        animLbl.alignment = ["left","bottom"];
                        animLbl.justify = "left";
                        animLbl.minimumSize = [TOPROW_LABEL_W, UI.headerH];
                        animLbl.preferredSize = [TOPROW_LABEL_W, UI.headerH];
                        animLbl.maximumSize = [TOPROW_LABEL_W, UI.headerH];
                        try { animLbl.graphics.font = ScriptUI.newFont(animLbl.graphics.font.name, "Bold", animLbl.graphics.font.size + 1); } catch (e) {}
                        try { _setLabelColor(animLbl, [0.65, 0.65, 0.65, 1]); } catch(eC) {}

                        var animAddBtn = addPlusGlyphButton(animRow, TOPROW_PLUS_W, TOPROW_PLUS_H, "Add animation file", function () {});
                        try { animAddBtn.alignment = ["left","bottom"]; } catch(eA) {}

                        var animDDCol = animRow.add("group");
                        animDDCol.orientation = "column";
                        animDDCol.alignChildren = ["fill","top"];
                        animDDCol.alignment = ["fill","bottom"];
                        animDDCol.margins = 0;
                        animDDCol.spacing = 2;

                        var animDDHdr = addDropdownHeader(animDDCol, "Select Animation…", TOPROW_HDR_INSET);
                        animDDHdr.justify = "left";
                        animDDHdr.alignment = ["fill","top"];
                        try { _setLabelColor(animDDHdr, [0.55, 0.55, 0.55, 1]); } catch(eH) {}

                        var animDD = animDDCol.add("dropdownlist", undefined, []);
                        animDD.alignment     = ["fill", "bottom"];
                        animDD.minimumSize   = [TOPROW_DD_MIN_W, UI.btnH];
                        animDD.preferredSize = [TOPROW_DD_MIN_W, UI.btnH];
                        animDD.maximumSize   = [TOPROW_DD_MAX_W, UI.btnH]; // soft max (control can grow up to this)
        _lockDropdownPopupWidth(animDD, 12);

                        try {
                            var f = animDD.graphics.font;
                            var newSize = Math.max(12, (f && f.size ? (f.size + 2) : 13));
                            animDD.graphics.font = ScriptUI.newFont((f && f.name) ? f.name : "Arial", (f && f.style) ? f.style : "Regular", newSize);
                        } catch (e) {}

                                var ANIM_ACTION_CLEAR = "Clear Animation Files";

                                function animRebuildDropdown() {
                                    try { animDD.removeAll(); } catch (e0) {}

                                    var blank = animDD.add("item", " ");
                                    blank._isBlank = true;

                                    var arrRaw = animLoad();
                                    // Cleanup: enforce .ffx only and purge legacy/non-ffx saved entries (one-time).
                                    var arr = [];
                                    try {
                                        for (var ci = 0; ci < arrRaw.length; ci++) {
                                            var pp = String(arrRaw[ci] || "");
                                            if (!pp) continue;
                                            if (!/\.ffx$/i.test(pp)) continue;
                                            arr.push(pp);
                                        }
                                        // If anything was removed, persist the cleaned list so it stays clean.
                                        if (arr.length !== arrRaw.length) {
                                            animSave(arr);
                                        }
                                    } catch (eClean) { arr = arrRaw; }

                                    if (arr.length === 0) {
                                        var empty = animDD.add("item", "(No saved files)");
                                        empty.enabled = false;
                                    } else {
                                        for (var i = 0; i < arr.length; i++) {
                                            var p = String(arr[i]);
                                            // Only allow .ffx entries (filters legacy/invalid saved paths)
                                            if (!/\.ffx$/i.test(p)) continue;
                                            var f = new File(p);
                                            var label = (f && f.exists) ? f.displayName : ("(Missing) " + p);
                                            var it = animDD.add("item", _truncateDropdownLabel(animDD, label));
                                            it._fullText = label;
                                            it.__path = p;
                                        }
                                    }

                                    animDD.add("separator");
                                    var clearIt = animDD.add("item", ANIM_ACTION_CLEAR);
                                    clearIt.__action = "clear";
                                    // Default selection: blank row
                                    try { animDD.selection = 0; } catch (eSel) {}
                                }

                                    _applyDropdownLabelClamp(animDD);

                                animAddBtn.onClick = function () {
                                    // TEXT tab (+): NORMAL click ONLY adds .ffx preset(s) to the dropdown list.
                                    // (No applying to layers and no layer creation on click.)
                                    var picked = animOpenDialogFromDefaultFolder(); // multi-select enabled
                                    if (!picked) return;

                                    // Normalize to array
                                    if (!(picked instanceof Array)) picked = [picked];

                                    // Add all picked presets to the saved list (top of list = first picked)
                                    var arr = animLoad();
                                    for (var i = picked.length - 1; i >= 0; i--) {
                                        var f = picked[i];
                                        if (!f) continue;
                                        var p = f.fsName;

                                        // Enforce .ffx only
                                        if (!/\.ffx$/i.test(p)) continue;

                                        arr.unshift(p);
                                    }
                                    animSave(arr);
                                    animRebuildDropdown();
                                try { _ddShowTempMessage(animDD, 'Added', 1.0); } catch(eMsg) {}
                                };

                                                                animDD.onChange = function () {
                                    if (animDD.__shineProgrammatic) return;
                                    if (!animDD.selection) return;
                                    var sel = animDD.selection;

                                    // Cmd/Ctrl+click removes the item from the saved list (TEXT tab parity with MAIN).
                                    if (sel && sel.__path && _isCmdOrCtrlDown()) {
                                        try {
                                            animRemovePath(sel.__path);
                                            animRebuildDropdown();
                                            try { if (typeof relayout === "function") relayout(); } catch (eRL) {}
                                        } catch (eR) {}
                                        return;
                                    }
                                    if (sel && sel._isBlank) return;
                                    if (sel.__action === "clear") {
                                        animClear();
                                        animRebuildDropdown();
                                        return;
                                    }

                                    var presetPath = sel.__path;
                                    if (!presetPath) return;

                                    // Show the chosen item in the dropdown box briefly (like MAIN), then revert to blank.
                                    _ddFlashThenReset(animDD, 25);

                                    // Defer preset application slightly so ScriptUI can repaint the dropdown text first.
                                    _ddDeferApplyFFX(animDD, presetPath, 50);
                                };

                        animRebuildDropdown();

                        // Divider under ANIMATIONS bar (match MAIN tab Favorites divider + spacing)
                        var animGap = animWrap.add("group");
                        animGap.minimumSize = [0, 2];
                        animGap.maximumSize = [10000, 4];

                        makeDivider(textContent);
                // ANIMATIONS BAR SAFETY (ensure visible)
                try { animWrap.visible = true; animWrap.enabled = true; } catch (e) {}

                // Accordion host (keeps ANIMATIONS bar above)
                        var textAccHost = textContent.add("group");
                        textAccHost.orientation   = "column";
                        textAccHost.alignChildren = ["fill", "top"];
                        textAccHost.alignment     = ["fill", "top"];
                        textAccHost.margins       = [0, 0, 0, 0];
                        textAccHost.spacing       = 10;

                        // Build a TEXT accordion (now supports Auto Collapse, like MAIN)
                        var textAcc = createAccordion(textAccHost, null, function(){ relayoutScoped(textContent); }, "AccordionOrder_TEXT");



                textAcc.defineSection("BREAK APART TEXT", function(body){
                    addGrid2(body, [
                        { text: "BY CHARACTER", onClick: function(){ breakApartTextRun(SPLIT_MODE.CHARACTERS); } },
                        { text: "BY WORD",      onClick: function(){ breakApartTextRun(SPLIT_MODE.WORDS); } },
                        { text: "BY LINE",      onClick: function(){ breakApartTextRun(SPLIT_MODE.LINES); } }
                    ]);
                });

                // TEXT TAB: Utilities (uses same accordion behavior + layout as MAIN)
                textAcc.defineSection("UTILITIES", function(body){
                    addGrid2(body, [
                        { 
                            text: "TEXT BOX",
                            onClick: function(){
                                try {
                                    if ($.global && $.global.ShineTools && $.global.ShineTools.TextBox && $.global.ShineTools.TextBox.makeTextBox) {
                                        $.global.ShineTools.TextBox.makeTextBox();
                                    } else {
                                        alert("TEXT BOX module not initialized.");
                                    }
                                } catch (eTB) {
                                    alert("TEXT BOX error:\n" + eTB.toString());
                                }
                            }
                        }
                    ]);
                });

                // Build accordion in persisted order
                textAcc.build();
            } catch (eBT) {
                alert("TEXT tab build error:\n\n" + eBT.toString());
            }

            // One scoped relayout (fast) to settle new controls
            try { relayoutScoped(tabText); } catch (eR) {}
        }

        function _selectTopTab(which) {
            try { pal.__activeTopTab = which; } catch(eAT) {}
            var isMain = (which === "MAIN");
            var isText = (which === "TEXT");
            var isUpdates = (which === "UPDATES");
            var isHelp = (which === "HELP");
            tabMain.visible = isMain;
            tabText.visible = isText;
            tabUpdates.visible = isUpdates;
            tabHelp.visible = isHelp;
// Build heavy tabs on first use
            if (isText) { try { _buildTextTabIfNeeded(); } catch (eBT) {} }

            _setTopTabLabelColor(tabLblMain, isMain ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            _setTopTabLabelColor(tabLblText, isText ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            _setTopTabLabelColor(tabLblUpdates, isUpdates ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            _setTopTabLabelColor(tabLblHelp, isHelp ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
// Force underline redraw without full relayout
            try { tabUnderlineLayer.visible = false; tabUnderlineLayer.visible = true; } catch (eU) {}

            // Ultra-light tab switching:
            // Avoid full relayout on every switch (it can be very slow on large panels).
            // Do ONE settling layout the first time only; after that, just update the paint.
            if (!pal.__didInitialTabLayout) {
                pal.__didInitialTabLayout = true;
                try { pal.layout.layout(true); } catch (e1) {}
            }
            try { pal.update(); } catch (e2) {}
        }

        try {
            tabLblMain.addEventListener("mousedown", function(){ _selectTopTab("MAIN"); });
            tabLblText.addEventListener("mousedown", function(){ _selectTopTab("TEXT"); });
            tabLblUpdates.addEventListener("mousedown", function(){ _selectTopTab("UPDATES"); });
            tabLblHelp.addEventListener("mousedown", function(){ _selectTopTab("HELP"); });
} catch (eEvt) {}

        tabMain.orientation   = "column";
        tabMain.alignChildren = ["fill", "fill"];
        tabMain.margins       = 0;
        tabMain.spacing       = 0;

        tabText.orientation   = "column";
        tabText.alignChildren = ["fill", "fill"];
        tabText.margins       = 0;
        tabText.spacing       = 0;


        tabUpdates.orientation   = "column";
        tabUpdates.alignChildren = ["fill", "top"];
        tabUpdates.margins       = [0, 0, 0, 0];
        tabUpdates.spacing       = 0;
        tabHelp.orientation   = "column";
        tabHelp.alignChildren = ["fill", "top"];
        tabHelp.margins       = 12;
        tabHelp.spacing       = 4;


        // -------------------------
        // UPDATES TAB CONTENT (UI only for now)
        // -------------------------
        var updatesWrap = tabUpdates.add("group");
        updatesWrap.orientation   = "column";
        updatesWrap.alignChildren = ["fill", "top"];
        updatesWrap.alignment     = ["fill", "top"];
        updatesWrap.margins       = [12, 10, 12, 10];
        updatesWrap.spacing       = 10;

        // Title
        var updatesTitle = updatesWrap.add("statictext", undefined, "Updates");
        updatesTitle.justify = "left";
        try {
            updatesTitle.graphics.font = updatesTitle.graphics.newFont(updatesTitle.graphics.font.name, ScriptUI.FontStyle.BOLD, updatesTitle.graphics.font.size + 2);
        } catch(eUF) {}

        // Version / Status
        var updatesMeta = updatesWrap.add("group");
        updatesMeta.orientation   = "column";
        updatesMeta.alignChildren = ["fill", "top"];
        updatesMeta.margins       = 0;
        updatesMeta.spacing       = 4;

        // NOTE: Keep version in one obvious place for future wiring.
        var SHINE_TOOLS_VERSION = "v1.0";

        function _makeKVRow(k, v) {
            var r = updatesMeta.add("group");
            r.orientation   = "row";
            r.alignChildren = ["left", "center"];
            r.margins       = 0;
            r.spacing       = 8;

            var kst = r.add("statictext", undefined, k);
            kst.minimumSize = [120, 16];
            kst.maximumSize = [120, 16];

            var vst = r.add("statictext", undefined, v);
            vst.alignment = ["fill", "center"];
            return {row:r, key:kst, val:vst};
        }

        var kvVersion = _makeKVRow("Current version:", SHINE_TOOLS_VERSION);
        var kvLatest  = _makeKVRow("Latest version:", "—");
        var kvStatus  = _makeKVRow("Status:", "Not checked yet");
        var kvLast    = _makeKVRow("Last checked:", "—");

        // Changelog
        var chLabel = updatesWrap.add("statictext", undefined, "Changelog");
        chLabel.justify = "left";

        var chBox = updatesWrap.add("edittext", undefined,
            "• Coming soon: automatic update checking.\n• This tab will show what changed between versions.",
            {multiline:true, readonly:true}
        );
        chBox.alignment     = ["fill", "top"];
        chBox.minimumSize   = [10, 170];
        chBox.preferredSize = [10, 170];

        // Controls
        var updatesControls = updatesWrap.add("group");
        updatesControls.orientation   = "row";
        updatesControls.alignChildren = ["left", "center"];
        updatesControls.alignment     = ["fill", "top"];
        updatesControls.margins       = 0;
        updatesControls.spacing       = 12;

        var btnCheckUpdates = updatesControls.add("button", undefined, "CHECK FOR UPDATES");
        var cbAutoCheck     = updatesControls.add("checkbox", undefined, "Auto-check on launch");
        cbAutoCheck.value = false;

        // Box.com PKG updater (wired)

        // -------------------------
        // BOX.COM UPDATE CHECK (PKG workflow)
        // -------------------------
        // NOTE:
        //  - For automated downloads, Box shared links should be a *direct file link* (not a folder link).
        //  - One common direct-download pattern for shared links is converting:
        //      https://app.box.com/s/<TOKEN>  =>  https://<your-subdomain>.box.com/shared/static/<TOKEN>
        //    However, that pattern only works when the token is for a FILE direct link.
        //
        // Your current Box shared link (provided by Jim):
        var BOX_SHARED_LINK = "https://app.box.com/shared/static/e66eq1vcr1y0m8vx28j83ropqr779jdd.json";
        // Expected JSON shape (version.json):
        // {
        //   "latest": "1.0.6",
        //   "date": "2026-01-05",
        //   "pkgUrl": "https://<subdomain>.box.com/shared/static/<token>.pkg",
        //   "notes": ["...", "..."]
        // }
        //
        // Where to install (handled by the PKG payload):
        //   /Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels

        function _boxSharedToStatic(url) {
            try {
                // Keep it conservative: only transform the common /s/ token form.
                // The caller can also paste a direct /shared/static/ link here.
                if (!url) return url;
                // If already a shared/static link, leave it.
                if (url.indexOf("/shared/static/") !== -1) return url;

                // Convert https://app.box.com/s/<token> to https://app.box.com/shared/static/<token>
                // (Some enterprises use <subdomain>.box.com; users can paste that full URL directly.)
                var m = url.match(/https?:\/\/([^\/]+)\/s\/([^\/\?\#]+)/i);
                if (m && m[1] && m[2]) {
                    return "https://" + m[1].replace("app.", "") + "/shared/static/" + m[2];
                }
            } catch (e) {}
            return url;
        }

        function _ensureFolder(pathStr) {
            try {
                var f = new Folder(pathStr);
                if (!f.exists) f.create();
                return f.exists ? f : null;
            } catch (e) { return null; }
        }

        function _readTextFile(fp) {
            var f = new File(fp);
            if (!f.exists) return null;
            try {
                f.encoding = "UTF-8";
                if (!f.open("r")) return null;
                var s = f.read();
                f.close();
                return s;
            } catch (e) { try{f.close();}catch(_e){} }
            return null;
        }

        function _writeTextFile(fp, content) {
            var f = new File(fp);
            try {
                f.encoding = "UTF-8";
                if (!f.open("w")) return false;
                f.write(content || "");
                f.close();
                return true;
            } catch (e) { try{f.close();}catch(_e){} }
            return false;
        }

        function _shellEscape(s) {
            // Minimal POSIX shell escaping for paths/URLs.
            s = String(s || "");
            return "'" + s.replace(/'/g, "'\\''") + "'";
        }

        function _curlDownload(url, outPath) {
            // Returns { ok:boolean, msg:string }
            try {
                var cmd = "curl -L --fail --silent --show-error " + _shellEscape(url) + " -o " + _shellEscape(outPath);
                var out = system.callSystem(cmd);
                // curl writes errors to stderr; callSystem merges output.
                // We'll check file existence/size instead.
                var f = new File(outPath);
                if (f.exists && f.length > 0) return { ok:true, msg: out || "" };
                return { ok:false, msg: out || "Download failed." };
            } catch (e) {
                return { ok:false, msg:String(e) };
            }
        }

        function _runPkgInstaller(pkgPath) {
            // Use AppleScript to prompt for admin and run installer.
            // Returns { ok:boolean, msg:string }
            try {
                var cmd = 'osascript -e ' + _shellEscape('do shell script "installer -pkg ' + pkgPath.replace(/"/g,'\\"') + ' -target /" with administrator privileges');
                var out = system.callSystem(cmd);
                // If user cancels auth, AppleScript typically returns an error string.
                // We'll treat any output containing "error" as a failure, otherwise assume ok.
                var lc = String(out || "").toLowerCase();
                if (lc.indexOf("error") !== -1 || lc.indexOf("canceled") !== -1 || lc.indexOf("cancelled") !== -1) {
                    return { ok:false, msg: out || "Install canceled." };
                }
                return { ok:true, msg: out || "" };
            } catch (e) {
                return { ok:false, msg:String(e) };
            }
        }

        function _pad2(n){ n = parseInt(n,10); if (isNaN(n)) n = 0; return (n < 10 ? "0" : "") + n; }

        function _formatStamp(d) {
            try {
                return d.getFullYear() + "-" + _pad2(d.getMonth()+1) + "-" + _pad2(d.getDate()) + " " + _pad2(d.getHours()) + ":" + _pad2(d.getMinutes());
            } catch (e) { return String(d); }
        }

        function _setUpdatesLastChecked(d) {
            try { kvLast.val.text = _formatStamp(d || new Date()); } catch (e) {}
        }

        function _setUpdatesStatus(msg) {
            try { kvStatus.val.text = msg || ""; } catch (e) {}
        }

        function _setUpdatesVersion(ver) {
            try { kvLatest.val.text = ver || "—"; } catch (e) {}
        }

        function _setUpdatesChangelog(linesArr) {
            try {
                if (!linesArr || !linesArr.length) {
                    chBox.text = "—";
                    return;
                }
                var s = "";
                for (var i=0; i<linesArr.length; i++) {
                    s += "• " + linesArr[i] + "\n";
                }
                chBox.text = s.replace(/\n$/, "");
            } catch (e) {}
        }

        function _compareVersions(a, b) {
            // returns 1 if a>b, -1 if a<b, 0 if equal (simple semver-ish)
            function norm(v){
                v = String(v||"").replace(/^v/i,"");
                var parts = v.split(".");
                var nums = [];
                for (var i=0;i<parts.length;i++){
                    var n = parseInt(parts[i],10);
                    nums.push(isNaN(n)?0:n);
                }
                while (nums.length < 3) nums.push(0);
                return nums;
            }
            var A = norm(a), B = norm(b);
            for (var i=0;i<Math.max(A.length,B.length);i++){
                var x=A[i]||0, y=B[i]||0;
                if (x>y) return 1;
                if (x<y) return -1;
            }
            return 0;
        }

        function _getCurrentVersionString() {
            // Pull from footer if possible, else hardcode.
            try {
                var t = (gfCopy && gfCopy.text) ? gfCopy.text : "";
                var m = t.match(/v(\d+\.\d+(?:\.\d+)?)/i);
                if (m && m[1]) return m[1];
            } catch (e) {}
            return "1.0";
        }

        function _doCheckForUpdates() {
            var cacheRoot = Folder.userData.fsName + "/ShineTools";
            var cacheDir = _ensureFolder(cacheRoot);
            if (!cacheDir) cacheDir = _ensureFolder(Folder.temp.fsName + "/ShineTools");
            if (!cacheDir) {
                _setUpdatesStatus("Could not create cache folder.");
                return;
            }

            _setUpdatesLastChecked(new Date());

            _setUpdatesStatus("Checking Box…");

            // IMPORTANT: BOX_SHARED_LINK must ultimately point to a *file* direct link for version.json.
            // If it's a folder link, Box will return HTML and JSON.parse will fail.
            var versionUrl = _boxSharedToStatic(BOX_SHARED_LINK);
            var versionPath = cacheDir.fsName + "/version.json";

            var dl = _curlDownload(versionUrl, versionPath);
            if (!dl.ok) {
                _setUpdatesStatus("Could not download version.json. (Is this a direct *file* link?)");
                return;
            }

            var raw = _readTextFile(versionPath);
            if (!raw) {
                _setUpdatesStatus("Downloaded version.json but couldn't read it.");
                return;
            }

            var data = null;
            try { data = JSON.parse(raw); } catch (eJSON) { data = null; }

            if (!data || !data.latest) {
                _setUpdatesStatus("version.json is not valid JSON. Make sure the Box link is a direct file link.");
                return;
            }

            var currentVer = _getCurrentVersionString();
            _setUpdatesVersion(String(data.latest));

            var notes = data.notes || data.changelog || [];
            if (typeof notes === "string") notes = [notes];
            _setUpdatesChangelog(notes);

            var cmp = _compareVersions(String(data.latest), String(currentVer));
            if (cmp <= 0) {
                _setUpdatesStatus("Up to date. (Installed: v" + currentVer + ")");
                return;
            }

            _setUpdatesStatus("Update available: v" + data.latest + " (Installed: v" + currentVer + ")");

            // If we have a pkgUrl, offer install immediately.
            if (!data.pkgUrl) {
                _setUpdatesStatus("Update available: v" + data.latest + " (Installed: v" + currentVer + "). PKG not published yet.");
                return;
            }

            // Download PKG
            var pkgUrl = String(data.pkgUrl);
            if (pkgUrl.indexOf("YOUR_PKG_TOKEN") !== -1 || pkgUrl.indexOf("YOUR_PKG") !== -1) {
                _setUpdatesStatus("Update available: v" + data.latest + " (Installed: v" + currentVer + "). PKG link is still a placeholder.");
                return;
            }
            var pkgName = "ShineTools_" + String(data.latest).replace(/[^\w\.\-]/g,"_") + ".pkg";
            var pkgPath = cacheDir.fsName + "/" + pkgName;

            _setUpdatesStatus("Downloading installer…");
            var dlPkg = _curlDownload(pkgUrl, pkgPath);
            if (!dlPkg.ok) {
                _setUpdatesStatus("Failed to download PKG.");
                return;
            }

            _setUpdatesStatus("Installing (admin password required)…");
            var res = _runPkgInstaller(pkgPath);
            if (!res.ok) {
                _setUpdatesStatus("Install canceled or failed.");
                return;
            }

            _setUpdatesStatus("Installed v" + data.latest + ". Please restart After Effects.");
        }

        btnCheckUpdates.onClick = function () {
            try { _doCheckForUpdates(); } catch (e) { _setUpdatesStatus("Update check failed."); }
        };


        // HELP TAB DUMMY CONTENT (placeholder)
        var helpWrap = tabHelp.add("group");
        helpWrap.orientation = "column";
        helpWrap.alignChildren = ["fill", "top"];
        helpWrap.margins = 0;
        helpWrap.spacing = 0;

        var helpText = "Welcome to Shine Tools v1.0!\n\nThere are two main tabs on the top, MAIN and TEXT.\n\nThe top bar of each section allows you to import files and text animation presets and store them in a list for easy one click access later. Click the + button to import a file which will import it into the project bin and timeline. It will also remain stored in the dropdown list. Just select any stored file in the list and it will immediately add it to the project. You can CMD+Click any saved file to delete it from the list.\n\nYou can expand / collapse each section by clicking on the name or the arrow.\n- SHIFT+Click will expand multiple sections\n- CMD+Click will collapse all sections.\n\nYou can re-order the sections by the hidden UP and DOWN arrows on the right side of the section.\n\nSome buttons have a yellow dot which indicates the button has multiple options by normal clicking or OPTION clicking. If you hover over the buttons a tool tip will tell you your options.";
        var helpTitle = helpWrap.add("statictext", undefined, helpText, {multiline:true});
        try { helpTitle.graphics.foregroundColor = helpTitle.graphics.newPen(helpTitle.graphics.PenType.SOLID_COLOR, [0.85,0.85,0.85,1], 1); } catch(eHT) {}
        // Font sizing: On some AE/ScriptUI builds, changing graphics.font alone doesn't stick.
        // Set both .graphics.font and .font for maximum compatibility.
        try {
            var hf = helpTitle.graphics.font;
            var bigger = ScriptUI.newFont(hf.name, hf.style, hf.size + 10);
            helpTitle.graphics.font = bigger;
            helpTitle.font = bigger;
        } catch(eHF) {}
        // Default selection
        _selectTopTab("MAIN");
        // -------------------------
        // Shared UI knobs/helpers
        // -------------------------
        var IS_MAC = false;
        try { IS_MAC = ($.os && $.os.toLowerCase().indexOf("mac") >= 0); } catch (eOS) {}

        // ScriptUI control heights can render taller on macOS (especially with custom fonts),
        // which can throw off top-row alignment. Use slightly smaller defaults on Mac.
        var UI = {
            headerH: IS_MAC ? 26 : 28,
            twirlW : 22,
            btnH   : IS_MAC ? 24 : 28,
            btnGap : 4,
            twirlNudgeY: -3,
            collapseBtnW: 95,
            clipHDelta: 0
        };

        // Top-row alignment constants (keep identical across tabs)
                // Top-row alignment constants (keep identical across tabs)
        var TOPROW_LABEL_W    = 105; // LIB. ELEMENTS / TEXT ANIMATORS label width
        var TOPROW_PLUS_W     = 38;  // plus icon button width (slightly larger / easier hit)
        var TOPROW_PLUS_H     = UI.btnH; // match dropdown height for perfect vertical centering
        var TOPROW_HDR_INSET  = 7;   // px: nudge header text right to align with dropdown text inset
        var TOPROW_ROW_GAP    = 2;   // spacing between items on the top row (brings dropdown closer to +)
        var TOPROW_LABEL_INSET = 4; // extra px between ★ and label to align with section headers
        var TOPROW_DD_MIN_W   = 120; // narrower minimum so the control can shrink further without clipping the arrow
        var TOPROW_DD_MAX_W   = 520; // soft max (prevents monitor-wide stretch when docked)


        // Chevron colors (reorder arrows)

        // Section label blink feedback (5-frame-ish flash)
        var SECTION_LABEL_COLOR_IDLE  = [0.90, 0.90, 0.90, 1];
        var SECTION_LABEL_COLOR_EXPANDED = [1.00, 0.82, 0.00, 1]; // Shine yellow (expanded)
        var SECTION_LABEL_COLOR_BLINK = [1.00, 0.82, 0.00, 1]; // Shine yellow
        var BLINK_FRAME_MS = 33; // ~30fps
        var BLINK_FRAMES   = 10;

        var _blinkSeq = 0;
        var _blinkTitle = null;

        function _setLabelColor(st, rgba) {
            try {
                st.graphics.foregroundColor = st.graphics.newPen(
                    st.graphics.PenType.SOLID_COLOR,
                    rgba,
                    1
                );
            } catch (e) {}
        }

        // Force dropdown popup list width to match the closed control width (ScriptUI quirk fix).
        // Safe: does not change selection behavior; only clamps the popup list width.
        function _lockDropdownPopupWidth(dd, maxVisibleItems) {
            if (!dd) return;

            // Track all dropdowns so we can re-clamp item labels on resize.
            try {
                if (!$.global.__ShineToolsAllDropdowns) $.global.__ShineToolsAllDropdowns = [];
                var list = $.global.__ShineToolsAllDropdowns;
                var exists = false;
                for (var i = 0; i < list.length; i++) { if (list[i] === dd) { exists = true; break; } }
                if (!exists) list.push(dd);
            } catch (eReg) {}

            // IMPORTANT: Do NOT override onDraw for dropdowns.
            // In some ScriptUI builds (incl. AE 2025), overriding onDraw can suppress
            // the native control rendering, making the dropdown "box" disappear.
            // Instead, clamp the popup list width/height right when the menu is about to open.

            var MAX_ITEMS = (maxVisibleItems != null) ? Math.max(4, maxVisibleItems) : 12;

            function _clamp() {
                try {
                    var w = null;
try {
    // Always match the *current* closed control width (docked panels can resize).
    if (dd.size && dd.size.width) w = dd.size.width;
    else if (dd.bounds && dd.bounds.length === 4) w = (dd.bounds[2] - dd.bounds[0]);
    else if (dd.preferredSize && dd.preferredSize.width) w = dd.preferredSize.width;
    else if (dd.maximumSize && dd.maximumSize.width && dd.maximumSize.width < 9000) w = dd.maximumSize.width;

    // Guard against nonsense values
    if (w && w < 50) w = 50;
} catch (eW0) {}

if (w && dd.list) {
                        if (dd.list.size) dd.list.size.width = w;
                        if (dd.list.minimumSize) dd.list.minimumSize.width = w;
                        if (dd.list.maximumSize) dd.list.maximumSize.width = w;
                    }
                } catch (eW) {}

                // macOS tends to show an overly tall dropdown popup when there are many items.
                // dd.list is a ListBox; we can cap its height to a reasonable number of rows.
                try {
                    if (dd.list && dd.list.size) {
                        var itemH = 16;
                        try {
                            if (dd.list.itemSize && dd.list.itemSize.height) itemH = dd.list.itemSize.height;
                        } catch (eIH) {}
                        var maxH = (itemH * MAX_ITEMS) + 10; // small padding
                        if (dd.list.size.height > maxH) dd.list.size.height = maxH;
                    }
                } catch (eH) {}
            }

            var _prevActivate = dd.onActivate;
            dd.onActivate = function () {
                if (_prevActivate) { try { _prevActivate(); } catch (ePrev) {} }
                _clamp();
            };

            // Extra safety: some hosts don't fire onActivate reliably for dropdowns.
            try {
                dd.addEventListener('mousedown', function () { _clamp(); });
                // Docked panels on macOS can sometimes miss onActivate; clamp on hover/focus too.
                try { dd.addEventListener('mouseover', function () { _clamp(); }); } catch (e4) {}
                try { dd.addEventListener('focus', function () { _clamp(); }); } catch (e5) {}
            } catch (e3) {}
        }


        // Keep dropdown popup width from ballooning by ensuring item labels
        // never exceed the *current* closed-control width.
        // (ScriptUI dropdown popup width is driven by the widest item label.)
        function _truncateDropdownLabel(dd, label) {
            try {
                label = String(label == null ? "" : label);

                // Determine current control width (fallback to preferred sizes)
                var w = 0;
                try { if (dd.size && dd.size.width) w = dd.size.width; } catch (e0) {}
                if (!w) { try { if (dd.bounds && dd.bounds.length === 4) w = (dd.bounds[2] - dd.bounds[0]); } catch (e1) {} }
                if (!w) { try { if (dd.preferredSize && dd.preferredSize.width) w = dd.preferredSize.width; } catch (e2) {} }
                if (!w) w = 220;

                // Leave room for arrow + insets (empirical; keeps popup from expanding wider than control)
                var usable = Math.max(50, w - 42);

                // Prefer real text measurement when available (much more reliable than char-width guessing)
                var g = null;
                try { g = dd.graphics; } catch (eg) {}
                var meas = function (s) {
                    try {
                        if (g && g.measureString) {
                            var ms = g.measureString(s);
                            if (ms && ms.length) return ms[0];
                            if (ms && typeof ms.width === "number") return ms.width;
                        }
                    } catch (eM) {}
                    // Fallback estimate
                    return s.length * 7;
                };

                if (meas(label) <= usable) return label;

                // Binary search best fit
                var ell = "…";
                var lo = 0, hi = label.length;
                while (lo < hi) {
                    var mid = Math.ceil((lo + hi) / 2);
                    var cand = label.substring(0, Math.max(1, mid)) + ell;
                    if (meas(cand) <= usable) lo = mid;
                    else hi = mid - 1;
                }
                var cut = Math.max(1, lo);
                return label.substring(0, cut) + ell;
            } catch (e) {}
            return label;
        }

        function _applyDropdownLabelClamp(dd) {
            try {
                if (!dd || !dd.items) return;
                for (var i = 0; i < dd.items.length; i++) {
                    var it = dd.items[i];
                    if (!it || it._isBlank || it.text === "(No saved files)" || it.text === "(No saved presets)" || it.type === "separator") continue;
                    var full = it._fullText || it._pathName || it._name || it.text;
                    it._fullText = full;
                    it.text = _truncateDropdownLabel(dd, full);
                }
            } catch (e) {}
        }

        // Chain a small Y-shift to a parent group's onLayout without breaking existing handlers.
        // Useful for pixel-perfect alignment nudges (e.g., the ★ icon).
        function _chainOnLayoutShiftY(parentGroup, ctrl, dy) {
            if (!parentGroup || !ctrl || !dy) return;
            var prev = parentGroup.onLayout;
            parentGroup.onLayout = function () {
                if (prev) try { prev(); } catch (e0) {}
                try {
                    var b = ctrl.bounds; // [l,t,r,b]
                    ctrl.bounds = [b[0], b[1] + dy, b[2], b[3] + dy];
                } catch (e) {}
            };
        }

        function _blinkSectionLabel(st, seqAtCall) {
            if (!st) return;
            try { st._blinkSeq = seqAtCall; } catch (e0) {}
            try { st._isBlinking = true; } catch (eB) {}
            var __isExp = (st && st._getExpanded && st._getExpanded()) ? true : false;
            _setLabelColor(st, __isExp ? SECTION_LABEL_COLOR_IDLE : SECTION_LABEL_COLOR_EXPANDED);

            // revert after ~5 frames; ignore if another blink started
            try {
                var fn = "__ShineTools_BlinkLabel__";
                $.global[fn] = function () {
                    try {
                        if (!st || !st.graphics) return;
                        if (st._blinkSeq !== seqAtCall) return;
                        try { st._isBlinking = false; } catch (eB2) {}
                        var col = (st && st._getExpanded && st._getExpanded()) ? SECTION_LABEL_COLOR_EXPANDED : SECTION_LABEL_COLOR_IDLE;
                        _setLabelColor(st, col);
                        try { st.parent && st.parent.parent && st.parent.parent.update(); } catch (eU) {}
                    } catch (e) {}
                };
                app.scheduleTask(fn + "()", BLINK_FRAME_MS * BLINK_FRAMES, false);
            } catch (e1) {}
        }


        var ARROW_COLOR_IDLE  = [0.35, 0.35, 0.35, 1]; // dark gray
        var ARROW_COLOR_HOVER = [1.00, 0.82, 0.00, 1]; // Shine yellow

        function clippedBtnH() { return Math.max(18, UI.btnH + UI.clipHDelta); }

        // --------------------------------------------------
// Relayout helpers (optimized for snappy accordion)
// --------------------------------------------------
// ScriptUI layout() on the whole palette can be expensive once the TabbedPanel is added.
// For accordion toggles, we relayout ONLY the accordion container group, then resize the window.
// (We still do a full relayout once at the end of buildUI.)
// --------------------------------------------------
// Pinned option dots (stable during resize)
// --------------------------------------------------
var _DOT_PINS = []; // {btn: Button, dot: StaticText, r: Number, t: Number}
function _pinDot(btn, dot, insetR, insetT) {
    if (!btn || !dot) return;
    _DOT_PINS.push({ btn: btn, dot: dot, r: (insetR||6), t: (insetT||1) });
}
function _repositionPinnedDots() {
    for (var i = 0; i < _DOT_PINS.length; i++) {
        var p = _DOT_PINS[i];
        if (!p || !p.btn || !p.dot) continue;
        try {
            var bw = p.btn.size[0];
            var bh = p.btn.size[1];
            var dw = p.dot.size ? p.dot.size[0] : 0;
            var dh = p.dot.size ? p.dot.size[1] : 0;
            // Ensure the dot has a size first
            if (!dw || !dh) {
                dw = 12; dh = 12;
                p.dot.minimumSize = [dw, dh];
                p.dot.maximumSize = [dw, dh];
                p.dot.preferredSize = [dw, dh];
            }
            // Place inside the button bounds (upper-right, inset)
            p.dot.location = [Math.max(0, bw - dw - p.r), Math.max(0, p.t)];
        } catch (e) {}
    }
}

function relayoutScoped(scopeGroup) {
    try { (scopeGroup || pal).layout.layout(true); } catch (e1) {}
    try { (scopeGroup || pal).layout.resize(); } catch (e2) {}
    // A window resize pass helps redraw without forcing a full tree relayout.
    try { pal.layout.resize(); } catch (e3) {}
    _repositionPinnedDots();
}

function relayout() {
    // Full relayout (use sparingly)
    relayoutScoped(pal);
}

        function makeDivider(parent) {
            var d = parent.add("panel", undefined, "");
            d.alignment   = ["fill", "top"];
            d.minimumSize = [0, 1];
            d.maximumSize = [10000, 1];
            d.enabled     = false;
            return d;
        }

        function defocusButtonBestEffort(btn) {
            btn.addEventListener("mousedown", function () {
                try { btn.active = false; } catch (e) {}
                try { pal.active = true; } catch (e2) {}
            });
            btn.addEventListener("mouseup", function () {
                try { btn.active = false; } catch (e) {}
                try { pal.active = true; } catch (e2) {}
            });
        }

        function addBtnClippedFixedLeft(parent, text, width, handler) {
    var wrap = parent.add("group");
    wrap.orientation   = "column";
    wrap.alignChildren = ["left", "top"];
    wrap.alignment     = ["left", "top"];
    wrap.margins       = 0;
    wrap.spacing       = 0;

    var h = clippedBtnH();
    wrap.minimumSize = [width, h];
    wrap.maximumSize = [width, h];

    var b = wrap.add("button", undefined, text);
    b.alignment     = ["left", "top"];
    b.preferredSize = [width, h];
    b.minimumSize   = [width, h];
    b.maximumSize   = [width, h];
    b.helpTip       = text;

    if (handler) b.onClick = handler;

    // Best-effort: prevent "stuck focus" artifacts
    try { defocusButtonBestEffort(b); } catch (e) {}

    return b;
}

// -------------------------
// PLUS glyph button (no box, hover turns PLUS yellow)
// Uses a lightweight group with onDraw so there is no native button chrome.
// -------------------------
function addPlusGlyphButton(parent, w, h, helpTip, handler) {
    // Use an iconbutton (toolbutton) so it behaves like a real button (onClick works),
    // but we draw the PLUS ourselves to avoid native button chrome.
    var b = parent.add("iconbutton", undefined, undefined, { style: "toolbutton" });
    b.alignment     = ["left","bottom"];
    b.minimumSize   = [w, h];
    b.preferredSize = [w, h];
    b.maximumSize   = [w, h];
    b.helpTip       = helpTip || "Add";

    b._hover = false;
    b._down  = false;

    function redraw() { try { b.notify("onDraw"); } catch (e) {} }

    // Hover tracking (drives yellow highlight)
    try {
        b.addEventListener("mouseover", function () { b._hover = true; redraw(); });
        b.addEventListener("mouseout",  function () { b._hover = false; b._down = false; redraw(); });
        b.addEventListener("mousedown", function () { b._down  = true; redraw(); });
        b.addEventListener("mouseup",   function () { b._down  = false; redraw(); });
    } catch (eEvt) {
        b.onMouseEnter = function () { b._hover = true; redraw(); };
        b.onMouseExit  = function () { b._hover = false; b._down = false; redraw(); };
        b.onMouseDown  = function () { b._down  = true; redraw(); };
        b.onMouseUp    = function () { b._down  = false; redraw(); };
    }

    // Click handler (external code can override b.onClick later if needed)
    if (typeof handler === "function") b.onClick = handler;

    b.onDraw = function () {
        var gr = this.graphics;
        var W = this.size[0], H = this.size[1];

        var colIdle  = [0.82, 0.82, 0.82, 1];
        var colHover = [1.00, 0.82, 0.20, 1]; // Shine yellow
        var col = (this._hover || this._down) ? colHover : colIdle;

        // slightly thicker PLUS (requested)
        var pen = gr.newPen(gr.PenType.SOLID_COLOR, col, 3);

        var cx = Math.round(W / 2);
        var cy = Math.round(H / 2);

        // Slightly larger PLUS for easier targeting
        var len = Math.round(Math.min(W, H) * 0.23) + 1;

        try {
            gr.newPath();
            gr.moveTo(cx - len, cy);
            gr.lineTo(cx + len, cy);
            gr.moveTo(cx, cy - len);
            gr.lineTo(cx, cy + len);
            gr.strokePath(pen);
        } catch (e) {
            try {
                gr.drawLine(pen, cx - len, cy, cx + len, cy);
                gr.drawLine(pen, cx, cy - len, cx, cy + len);
            } catch (e2) {}
        }
    };

    // First paint
    try { b.notify("onDraw"); } catch (e0) {}

    return b;
}

// -------------------------
// Dropdown header with left inset (aligns header text with dropdown field text)
// -------------------------
function addDropdownHeader(col, text, insetPx) {
    var row = col.add("group");
    row.orientation   = "row";
    row.alignChildren = ["left","center"];
    row.alignment     = ["fill","top"];
    row.margins       = 0;
    row.spacing       = 0;

    if (insetPx && insetPx > 0) {
        var sp = row.add("statictext", undefined, "");
        sp.minimumSize = [insetPx, 1];
        sp.maximumSize = [insetPx, 1];
    }

    var st = row.add("statictext", undefined, text);
    st.justify   = "left";
    st.alignment = ["fill","center"];
    return st;
}

// Button wrapper that clips the RIGHT edge to hide the blue focus ring.

        // The real button is slightly wider than the wrapper; the wrapper's fixed width crops the ring.
        function addBtnClipRight(parent, label, visualW, onClick) {
            var wrap = parent.add("group");
            wrap.orientation   = "column";
            wrap.alignChildren = ["left", "top"];
            wrap.alignment     = ["left", "top"];
            wrap.margins       = 0;
            wrap.spacing       = 0;

            var h = clippedBtnH();
            wrap.minimumSize = [visualW, h];
            wrap.maximumSize = [visualW, h];

            var realW = visualW + 14;

            var b = wrap.add("button", undefined, label);
            b.alignment     = ["left", "top"];
            b.preferredSize = [realW, h];
            b.minimumSize   = [realW, h];
            b.maximumSize   = [realW, h];
            b.helpTip       = label;

            if (onClick) b.onClick = onClick;

            // Best-effort: prevent "stuck focus" artifacts
            try { defocusButtonBestEffort(b); } catch (e) {}
            return b;
        }

        // Hover + Option label engine (3-state)
        var _hoverBtn = null;
        var _hoverText = "";
        var _hoverOptionText = "";
        var _hoverLastAlt = null;
        var _hoverTask = 0;

                var HOVER_TICK_FN = "__ShineTools_c83_HoverTick__";

function _hoverClearInternal() {
            if (_hoverTask) { try { app.cancelTask(_hoverTask); } catch (e0) {} _hoverTask = 0; }
            _hoverBtn = null;
            _hoverLastAlt = null;
        }

        function _hoverSafeSetText(btn, txt) { try { btn.text = txt; } catch (e) {} }

        $.global[HOVER_TICK_FN] = function () {
            _hoverTask = 0;
            if (!_hoverBtn) return;

            try {
                if (!_hoverBtn.visible || !_hoverBtn.enabled) { _hoverClearInternal(); return; }
            } catch (eFail) { _hoverClearInternal(); return; }

            var altNow = isOptionDown();
            if (_hoverLastAlt === null || altNow !== _hoverLastAlt) {
                _hoverLastAlt = altNow;
                _hoverSafeSetText(_hoverBtn, altNow ? _hoverOptionText : _hoverText);
            }

            try { _hoverTask = app.scheduleTask(HOVER_TICK_FN + "()", 50, false); } catch (e2) {}
        };

        function _hoverStart(btn, baseText, hoverText, optionHoverText) {
            _hoverBtn = btn;
            _hoverText = hoverText;
            _hoverOptionText = optionHoverText;
            _hoverLastAlt = null;

            _hoverSafeSetText(btn, isOptionDown() ? optionHoverText : hoverText);

            if (_hoverTask) { try { app.cancelTask(_hoverTask); } catch (e0) {} _hoverTask = 0; }
            try { _hoverTask = app.scheduleTask(HOVER_TICK_FN + "()", 50, false); } catch (e1) {}
        }

        function _hoverStop(btn, baseText) {
            if (_hoverBtn === btn) _hoverClearInternal();
            _hoverSafeSetText(btn, baseText);
        }

        function enableHoverOptionLabel(btn, baseText, hoverText, optionHoverText) {
            btn.addEventListener("mouseover", function () { _hoverStart(btn, baseText, hoverText, optionHoverText); });
            btn.addEventListener("mouseout",  function () { _hoverStop(btn, baseText); });
        }

        // 2-column grid with badge dot support

        // 2-column grid with badge dot support (dot does NOT affect sizing)
        function addGrid2(parentBody, items) {
            var h = clippedBtnH();
            var MIN_BTN_W = 110;

            function makeCellButton(row, item) {
                var cell = row.add("group");
                cell.orientation   = "stack";
                cell.alignChildren = ["fill", "fill"];
                cell.alignment     = ["fill", "top"];
                cell.margins       = 0;

                var btn = cell.add("button", undefined, item.text);
                btn.alignment     = ["fill", "top"];
                btn.preferredSize = [0, h];
                btn.minimumSize   = [MIN_BTN_W, h];
                btn.maximumSize   = [10000, h];

                if (item.helpTip) btn.helpTip = item.helpTip;
                if (item.onClick) btn.onClick = item.onClick;

                if (item.hoverLabels && item.hoverLabels.base && item.hoverLabels.hover && item.hoverLabels.optionHover) {
                    btn.text = item.hoverLabels.base;
                    enableHoverOptionLabel(btn, item.hoverLabels.base, item.hoverLabels.hover, item.hoverLabels.optionHover);
                }

                if (item.badgeDot) {
                    var dot = cell.add("statictext", undefined, "●");
	   	    dot.margins = [0, 0, 0, 0]; // move footer dot DOWN 1px (net up vs previous)
                    dot.alignment = ["right", "top"];
                    dot.minimumSize = [12, 12];
                    dot.maximumSize = [12, 12];
                    dot.preferredSize = [12, 12];
                    _pinDot(btn, dot, 6, 0); // insetR, insetT (higher)
                    dot.justify = "center";
                    try {
                        dot.graphics.foregroundColor = dot.graphics.newPen(
                            dot.graphics.PenType.SOLID_COLOR,
                            [1.0, 0.82, 0.2, 1],
                            1
                        );
                    } catch (e) {}
                }

                defocusButtonBestEffort(btn);
                return btn;
            }

            for (var i = 0; i < items.length; i += 2) {
                var row = parentBody.add("group");
                row.orientation   = "row";
                row.alignChildren = ["fill", "top"];
                row.alignment     = ["fill", "top"];
                row.margins       = 0;
                row.spacing       = 6;

                makeCellButton(row, items[i]);

                if (i + 1 < items.length) {
                    makeCellButton(row, items[i + 1]);
                } else {
                    var ph = row.add("button", undefined, " ");
                    ph.alignment     = ["fill", "top"];
                    ph.preferredSize = [0, h];
                    ph.minimumSize   = [MIN_BTN_W, h];
                    ph.maximumSize   = [10000, h];
                    ph.enabled = false;
                    ph.helpTip = "";
                }
            }
        }

        // -------------------------
        // Shared Logo Header helper (used on BOTH tabs)
        // -------------------------
        function addLogoHeader(parent) {
            // A robust centering approach for ScriptUI:
            //  - Outer "stack" group fills the width.
            //  - Inner group is center-aligned, so the logo/placeholder stays centered at any width.
            var outer = parent.add("group");
            outer.orientation   = "stack";
            outer.alignment     = ["fill", "top"];
            outer.alignChildren = ["fill", "fill"];
            outer.margins       = [0, 8, 0, 6];
            outer.spacing       = 0;

            var LOGO_W = 240, LOGO_H = 121; // widened so the logo image is never clipped
            outer.minimumSize = [0, LOGO_H];
            outer.maximumSize = [10000, LOGO_H];

            var inner = outer.add("group");
            inner.orientation   = "column";
            inner.alignment     = ["center", "center"];
            inner.alignChildren = ["center", "center"];
            inner.margins       = 0;
            inner.spacing       = 0;

            var logoFile = findShineLogoFileLocal();
            if (logoFile && logoFile.exists) {
                var img = inner.add("image", undefined, logoFile);
                img.alignment     = ["center", "center"];
                img.preferredSize = [LOGO_W, LOGO_H];
                img.minimumSize   = [LOGO_W, LOGO_H];
                img.maximumSize   = [LOGO_W, LOGO_H];
            } else {
                var fb = inner.add("statictext", undefined, "SHINE TOOLS (logo missing)");
                fb.alignment = ["center", "center"];
                fb.justify   = "center";
                // Give the placeholder a stable width so it truly centers.
                fb.preferredSize = [260, LOGO_H];
                fb.minimumSize   = [260, LOGO_H];
                fb.maximumSize   = [260, LOGO_H];
            }

            // 15px GAP BELOW LOGO (matches MAIN)
            var gap = parent.add("group");
            gap.minimumSize = [0, 15];
            gap.maximumSize = [10000, 15];
        }

        // -------------------------
        // Footer responsiveness (prevents legend clipping on narrow panels)
        // ------------------------- (prevents legend clipping on narrow panels)
        // -------------------------
        function makeFooterResponsive(footerCol, footerRow, footerLeft, footerRight, legendTextCtrl) {
            // Single-line footer only. When narrow, hide legend text to avoid clipping.
            if (!footerRow) return;

            function apply() {
                var W = 0;
                try { W = footerRow.size[0] || (footerRow.parent && footerRow.parent.size[0]) || 0; } catch (e) { W = 0; }

                try {
                    // Always keep row layout (single line)
                    if (footerRow.orientation !== "row") footerRow.orientation = "row";
                    footerRow.alignChildren = ["fill", "bottom"];
                    if (footerLeft)  footerLeft.alignment  = ["left", "center"];
                    if (footerRight) footerRight.alignment = ["fill", "center"];
                    if (footerRight) footerRight.alignChildren = ["right", "center"];

                    // Hide legend label when too narrow so nothing clips.
                    if (legendTextCtrl) {
                        var showLegend = (W === 0) ? true : (W >= 420);
                        legendTextCtrl.visible = showLegend;
                    }

                    // Keep footer height constant
                    footerRow.minimumSize = [0, 18];
                    footerRow.maximumSize = [10000, 18];
                    if (footerCol) { footerCol.minimumSize = [0, 34]; footerCol.maximumSize = [10000, 34]; }
                } catch (e2) {}
            }

            footerRow.onResizing = function () {
                var now = +new Date();
                if (!footerRow.__lastTick || (now - footerRow.__lastTick) >= 60) {
                    footerRow.__lastTick = now;
                    apply();
                }
            };
            footerRow.onResize   = function () { apply(); };
            try { apply(); } catch (e3) {}
        }

// -------------------------
        // Custom twirl control
        // -------------------------
        function addTwirlControl(parent) {
            var twirlBox = parent.add("panel", undefined, "");
            twirlBox.minimumSize = [UI.twirlW, UI.headerH];
            twirlBox.maximumSize = [UI.twirlW, UI.headerH];
            twirlBox.margins = 0;
            twirlBox._collapsed = true;

            twirlBox.onDraw = function () {
                var g = this.graphics;
                try { g.font = ScriptUI.newFont(g.font.name, "Regular", g.font.size); } catch (e) {}

                var ch = this._collapsed ? "▶" : "▼";
                var w  = this.size[0];
                var h  = this.size[1];

                var x = Math.round((w / 2) - 4);
                var y = Math.round((h / 2) - (g.font.size / 2) + UI.twirlNudgeY);

                var col = this._collapsed ? [0.7, 0.7, 0.7, 1] : [1.0, 0.82, 0.2, 1];
                var pen = g.newPen(g.PenType.SOLID_COLOR, col, 1);
                g.drawString(ch, pen, x, y);
            };

            return twirlBox;
        }

        // -------------------------
        // Accordion factory (reusable per-tab)
        // -------------------------
        
// -------------------------
// Accordion factory (reusable per-tab) + optional section re-ordering
//   - Adds Up/Down chevrons on header hover
//   - Persists order via app.settings (per accordion key)
// -------------------------
function createAccordion(container, autoCollapseCheckboxOrNull, relayoutFn, orderSettingsKeyOrNull) {

    // Persisted order helpers
    var ORDER_SETTINGS_SECTION = "ShineTools";
    function loadOrder() {
        if (!orderSettingsKeyOrNull) return [];
        try {
            if (app.settings.haveSetting(ORDER_SETTINGS_SECTION, orderSettingsKeyOrNull)) {
                var raw = app.settings.getSetting(ORDER_SETTINGS_SECTION, orderSettingsKeyOrNull);
                var arr = JSON.parse(raw);
                if (arr && arr.length) return arr;
            }
        } catch (e) {}
        return [];
    }
    function saveOrder(arr) {
        if (!orderSettingsKeyOrNull) return;
        try { app.settings.saveSetting(ORDER_SETTINGS_SECTION, orderSettingsKeyOrNull, JSON.stringify(arr)); } catch (e) {}
    }

    var defs = [];            // {title:String, buildFn:Function}
    var statesByTitle = {};   // { title: {collapsed:Boolean} }
    var currentOrder = loadOrder();

    function collapseAllNow() {
        try { api.collapseAll(); } catch (e) {}
        if (relayoutFn) try { relayoutFn(); } catch (e2) {}
        try { var fs = ensureFocusSink(); if (fs) fs.active = true; } catch (e3) {}
    }

    // ---- internal build (creates UI in correct order) ----
    function buildUI() {
        // snapshot collapsed state
        try {
            for (var k = 0; k < defs.length; k++) {
                var t = defs[k].title;
                if (!statesByTitle[t]) statesByTitle[t] = { collapsed: true };
            }
        } catch (eSnap) {}

        // wipe container
        try {
            while (container.children && container.children.length) {
                container.remove(container.children[0]);
            }
        } catch (eWipe) {}

        var sections = []; // array of state objects in built order

        function collapseOthers(keepState) {
            for (var i = 0; i < sections.length; i++) {
                if (sections[i] !== keepState) sections[i].setCollapsed(true, true);
            }
        }

        // finalize order list
        var order = [];
        // keep saved order first (only if defs exist)
        for (var iO = 0; iO < currentOrder.length; iO++) {
            var titleO = currentOrder[iO];
            for (var d0 = 0; d0 < defs.length; d0++) {
                if (defs[d0].title === titleO) { order.push(titleO); break; }
            }
        }
        // append any missing defs (new sections)
        for (var d1 = 0; d1 < defs.length; d1++) {
            var t1 = defs[d1].title;
            var found = false;
            for (var o1 = 0; o1 < order.length; o1++) if (order[o1] === t1) { found = true; break; }
            if (!found) order.push(t1);
        }
        // keep for persistence
        currentOrder = order;
        saveOrder(currentOrder);

        function reorder(title, dir) {
            if (!orderSettingsKeyOrNull) return; // reordering disabled
            var idx = -1;
            for (var i = 0; i < currentOrder.length; i++) { if (currentOrder[i] === title) { idx = i; break; } }
            if (idx < 0) return;

            var newIdx = idx + dir;
            if (newIdx < 0 || newIdx >= currentOrder.length) return;

            // swap
            var tmp = currentOrder[idx];
            currentOrder[idx] = currentOrder[newIdx];
            currentOrder[newIdx] = tmp;

            saveOrder(currentOrder);

            // Visual feedback: blink the moved section label after rebuild
            _blinkSeq++;
            _blinkTitle = title;

            buildUI();
            if (relayoutFn) try { relayoutFn(); } catch (eRL) {}
        }

        function addAccordionSection(title, buildFn) {
            var section = container.add("group");
            section.orientation   = "column";
            section.alignChildren = ["fill", "top"];
            section.spacing       = 6;

            var header = section.add("group");
            header.orientation   = "row";
            header.alignChildren = ["left", "center"];
            header.alignment     = ["fill", "top"];
            header.spacing       = 6;
            header.minimumSize   = [0, UI.headerH];
            header.maximumSize   = [10000, UI.headerH];

            var twirlBox = addTwirlControl(header);

            var label = header.add("statictext", undefined, title);
            label.alignment = ["fill", "center"];
            label.justify   = "left";
            // Section label base color (and blink feedback when moved)
            _setLabelColor(label, SECTION_LABEL_COLOR_IDLE);
            if (_blinkTitle && _blinkTitle === title) {
                var _seq = _blinkSeq;
                _blinkTitle = null; // consume
                _blinkSectionLabel(label, _seq);
            }
            try { label.graphics.font = ScriptUI.newFont(label.graphics.font.name, "Bold", label.graphics.font.size); } catch (e) {}

            // Reorder chevrons (invisible until hovered; larger hit area for reliable clicks)
            var reorderWrap = header.add("group");
            reorderWrap.orientation   = "row";
            reorderWrap.alignChildren = ["center", "center"];
            reorderWrap.alignment     = ["right", "center"];
            reorderWrap.spacing       = 2;
            reorderWrap.margins       = 0;

            // Use actual buttons (not statictext) for stable hit-testing
            var upBtn = reorderWrap.add("button", undefined, "▲");
            var dnBtn = reorderWrap.add("button", undefined, "▼");

            function styleChevronButton(btn) {
                // Custom-drawn chevron button:
                //  - Idle: dark gray
                //  - Hover/pressed: Shine yellow
                //  - No native button box/border (we draw only the glyph)
                btn.minimumSize = [30, UI.headerH - 2];
                btn.maximumSize = [30, UI.headerH - 2];
                btn.alignment   = ["right", "center"];
                btn.margins     = 0;
                try { btn.helpTip = "Move section"; } catch (eTip) {}

                // Capture glyph then clear native text so the OS theme doesn't draw it
                try { btn._glyph = btn.text; } catch (eG) { btn._glyph = "▲"; }
                btn.text = "";

                // Hover/pressed state
                btn._isHover = false;
                btn._isDown  = false;

                function invalidate() {
                    try { btn.notify("onDraw"); } catch (eN) {}
                    try { btn.parent.update(); } catch (eU) {}
                }

                // Events
                btn.addEventListener("mouseover", function(){ btn._isHover = true; invalidate(); });
                btn.addEventListener("mouseout",  function(){ btn._isHover = false; btn._isDown = false; invalidate(); });
                btn.addEventListener("mousedown", function(){ btn._isDown = true; invalidate(); });
                btn.addEventListener("mouseup",   function(){ btn._isDown = false; invalidate(); });

                // Draw only the chevron glyph (no box)
                btn.onDraw = function () {
                    var g = this.graphics;

                    // Invisible until hovered/pressed
                    if (!(this._isHover || this._isDown)) {
                        return;
                    }

                    // Pick color (hover/pressed only)
                    var col = ARROW_COLOR_HOVER;

                    // Ensure a consistent font weight/size (slightly larger so arrows read better)
                    try {
                        var _fName = g.font.name;
                        var _fSize = g.font.size;
                        g.font = ScriptUI.newFont(_fName, "Regular", Math.max(10, _fSize + 2));
                    } catch (eF) {}

                    var w = this.size[0], h = this.size[1];

                    // Center glyph visually (slight nudge feels better for ▲/▼)
                    var x = Math.round(w/2 - 4);
                    var y = Math.round(h/2 - (g.font.size/2) - 1);

                    // Transparent background: draw nothing but the glyph
                    try {
                        var pen = g.newPen(g.PenType.SOLID_COLOR, col, 1);
                        g.drawString(this._glyph || "▲", pen, x, y);
                    } catch (eD) {}
                };
            }styleChevronButton(upBtn);
            styleChevronButton(dnBtn);

            // Only enable if settings key provided
            if (!orderSettingsKeyOrNull) {
                upBtn.enabled = false; dnBtn.enabled = false;
            }

            // Click handlers (buttons won’t interfere with header toggle)
            upBtn.onClick = function () { reorder(title, -1); };
            dnBtn.onClick = function () { reorder(title,  1); };

            makeDivider(section);

            var bodyWrap = section.add("group");
            bodyWrap.orientation   = "column";
            bodyWrap.alignChildren = ["fill", "top"];
            bodyWrap.alignment     = ["fill", "top"];

            var body = bodyWrap.add("group");
            body.orientation   = "column";
            body.alignChildren = ["fill", "top"];
            body.alignment     = ["fill", "top"];
            body.margins       = [8, 0, 8, 0];
            body.spacing       = UI.btnGap;

            var state = statesByTitle[title] || { collapsed: true };
            statesByTitle[title] = state;

            // Lazy-build section contents to speed initial panel load.
            // ScriptUI UI-tree construction is the main startup cost; there's no need to
            // create every button/grid while the section is collapsed.
            // We build once, the first time the section is expanded.
            if (state._built !== true) state._built = false;


            // For blink revert + expanded label color
            try { label._getExpanded = function(){ return !state.collapsed; }; } catch (eGE) {}
            function _ensureBuilt() {
                if (state._built) return;
                if (!buildFn) { state._built = true; return; }
                try {
                    buildFn(body);
                    state._built = true;
                } catch (eBuild) {
                    state._built = true; // avoid repeat spam
                    alert("Section build error (" + title + "):\n" + eBuild.toString());
                }
            }

            function setCollapsed(v, silent) {
                state.collapsed = v;
                twirlBox._collapsed = v;

                // Build UI only when opening
                if (!v) _ensureBuilt();


                // Header label color: yellow when expanded (unless blink is active)
                try {
                    if (!label._isBlinking) {
                        _setLabelColor(label, v ? SECTION_LABEL_COLOR_IDLE : SECTION_LABEL_COLOR_EXPANDED);
                    }
                } catch (eCol) {}
                bodyWrap.visible = !v;
                try { bodyWrap.minimumSize = v ? [0, 0] : [0, 0]; } catch (eMin) {}
                try { bodyWrap.maximumSize = v ? [10000, 0] : [10000, 200000]; } catch (eMax) {}

                if (!silent && relayoutFn) relayoutFn();
            }

            function toggle() {
                var ks = null;
                try { ks = ScriptUI.environment.keyboardState; } catch (eKS) {}

                var isCmdOrCtrl = !!(ks && (ks.ctrlKey || ks.metaKey));
                var isShift     = !!(ks && ks.shiftKey);

                // Cmd/Ctrl + Click = Collapse All
                if (isCmdOrCtrl) {
                    collapseAllSections();
                    try { var fs = ensureFocusSink(); if (fs) fs.active = true; } catch (eFS) {}
                    return;
                }

                // Shift + Click = toggle only this section (multi-expand)
                if (isShift) {
                    if (state.collapsed) {
                        setCollapsed(false, true);
                    } else {
                        setCollapsed(true, false);
                    }
                    if (relayoutFn) relayoutFn();
                    return;
                }

                // Normal click = accordion behavior (open one, close others)
                if (state.collapsed) {
                    collapseOthers(state);
                    setCollapsed(false, true);
                } else {
                    setCollapsed(true, false);
                }

                if (relayoutFn) relayoutFn();
            }

            twirlBox.addEventListener("mousedown", toggle);
            label.addEventListener("mousedown", toggle);

            state.setCollapsed = setCollapsed;
            sections.push(state);

            // start collapsed unless previously opened (build if starting expanded)
            setCollapsed(!!state.collapsed, true);
        }

        function collapseAllSections() {
            for (var i = 0; i < sections.length; i++) sections[i].setCollapsed(true, true);
            if (relayoutFn) relayoutFn();
        }

        // Build in ordered sequence
        for (var iD = 0; iD < currentOrder.length; iD++) {
            var t = currentOrder[iD];
            var def = null;
            for (var jD = 0; jD < defs.length; jD++) { if (defs[jD].title === t) { def = defs[jD]; break; } }
            if (def) addAccordionSection(def.title, def.buildFn);
        }

        api.collapseAll = collapseAllSections;
    }

    // Public API
    var api = {
        defineSection: function(title, buildFn) { defs.push({ title: title, buildFn: buildFn }); },
        build: function() { buildUI(); },
        collapseAll: function() { try { collapseAllNow(); } catch (e) {} }
    };

    return api;
}

// =========================================================
        // MAIN TAB UI
        // =========================================================
        var root = tabMain.add("group");
        root.orientation   = "column";
        root.alignChildren = ["fill", "fill"];
        root.margins       = 0;
        root.spacing       = 0;

        // LOGO HEADER (shared helper)
        addLogoHeader(root);

        // CONTENT (accordion container)
        var content = root.add("group");
        content.orientation   = "column";
        content.alignChildren = ["fill", "top"];
        content.alignment     = ["fill", "top"];
        content.margins       = [10, 8, 14, 0];
        content.spacing       = 10;

                // FAVORITES BAR
        var favWrap = content.add("group");
        favWrap.orientation   = "column";
        favWrap.alignChildren = ["fill", "top"];
        favWrap.alignment     = ["fill", "top"];
        favWrap.margins       = [0, 0, 0, 0];
        favWrap.spacing       = 3;

        var favRow = favWrap.add("group");
        favRow.orientation   = "row";
        favRow.alignChildren = ["left", "bottom"];
        favRow.alignment     = ["fill", "bottom"];
        favRow.margins       = 0;
        favRow.spacing       = TOPROW_ROW_GAP;

        var favStar = favRow.add("statictext", undefined, "★");
        favStar.alignment = ["left","bottom"];
        favStar.minimumSize = [UI.twirlW, UI.headerH];
        favStar.maximumSize = [UI.twirlW, UI.headerH];
        favStar.justify = "center";
        try { favStar.graphics.font = ScriptUI.newFont(favStar.graphics.font.name, favStar.graphics.font.style, favStar.graphics.font.size + 4); } catch (eF) {}
        try {
            favStar.graphics.foregroundColor =
                favStar.graphics.newPen(
                    favStar.graphics.PenType.SOLID_COLOR,
                    [1.0, 0.82, 0.2, 1],
                    1
                );
        } catch (e) {}

        _chainOnLayoutShiftY(favRow, favStar, -2);

        var favStarPad = favRow.add("group");
        favStarPad.minimumSize = [TOPROW_LABEL_INSET, 0];
        favStarPad.maximumSize = [TOPROW_LABEL_INSET, 10000];

        var favLbl = favRow.add("statictext", undefined, "LIB. ELEMENTS:");
        favLbl.alignment = ["left","bottom"];
        favLbl.justify = "left";
        favLbl.minimumSize = [TOPROW_LABEL_W, UI.headerH];
        favLbl.preferredSize = [TOPROW_LABEL_W, UI.headerH];
        favLbl.maximumSize = [TOPROW_LABEL_W, UI.headerH];
        try { favLbl.graphics.font = ScriptUI.newFont(favLbl.graphics.font.name, "Bold", favLbl.graphics.font.size + 1); } catch (e) {}
        try { _setLabelColor(favLbl, [0.65, 0.65, 0.65, 1]); } catch(eC) {}

        // Plus button (kept as ScriptUI button for reliability)
        var favAddBtn = addPlusGlyphButton(favRow, TOPROW_PLUS_W, TOPROW_PLUS_H, "Add file to Library Elements", function () {});
        try { favAddBtn.alignment = ["left","bottom"]; } catch(eA) {}

        // Label above dropdown
        var favDDCol = favRow.add("group");
        favDDCol.orientation = "column";
        favDDCol.alignChildren = ["fill","top"];
        favDDCol.alignment = ["fill","bottom"];
        favDDCol.margins = 0;
        favDDCol.spacing = 2;

        var favDDHdr = addDropdownHeader(favDDCol, "Select Element…", TOPROW_HDR_INSET);
        favDDHdr.justify = "left";
        favDDHdr.alignment = ["fill","top"];
        try { _setLabelColor(favDDHdr, [0.55, 0.55, 0.55, 1]); } catch(eH) {}

        var favDD = favDDCol.add("dropdownlist", undefined, []);
        favDD.alignment     = ["fill", "bottom"];
        favDD.minimumSize   = [TOPROW_DD_MIN_W, UI.btnH];
        favDD.preferredSize = [TOPROW_DD_MIN_W, UI.btnH];
        favDD.maximumSize   = [TOPROW_DD_MAX_W, UI.btnH]; // soft max (control can grow up to this)
        _lockDropdownPopupWidth(favDD, 12);

        try {
            var f = favDD.graphics.font;
            var newSize = Math.max(12, (f && f.size ? (f.size + 2) : 13));
            favDD.graphics.font = ScriptUI.newFont((f && f.name) ? f.name : "Arial", (f && f.style) ? f.style : "Regular", newSize);
        } catch (e) {}

                var FAV_ACTION_CLEAR = "Clear Favorites";

                function favRebuildDropdown() {

                    try { favDD.removeAll(); } catch (e0) {}
                    var blank = favDD.add("item", " ");
                    blank._isBlank = true;
                    var favs = favLoad();
                    if (favs.length === 0) {
                        var empty = favDD.add("item", "(No saved files)");
                        empty.enabled = false;
                    } else {
                        for (var i = 0; i < favs.length; i++) {
                            var ff = new File(favs[i]);
                            var displayName = (ff && ff.name) ? ff.name : favs[i];
                            var it = favDD.add("item", _truncateDropdownLabel(favDD, displayName));
                            it._fullText = displayName;
                            it._path = favs[i];
                        }
                    }

                    favDD.add("separator");
                    favDD.add("item", FAV_ACTION_CLEAR);
                    // Default selection: blank row
                    try { favDD.selection = 0; } catch (eSel) {}
                }

                    // Ensure popup width never exceeds control width
                    _applyDropdownLabelClamp(favDD);

                favRebuildDropdown();

                favAddBtn.onClick = function () {
                    if (!requireProject()) return;

                    var ks = null;
                    try { ks = ScriptUI.environment.keyboardState; } catch (eKs) {}
                    var doImport = false;
                    try { doImport = !!(ks && (ks.metaKey || ks.ctrlKey)); } catch (eDo) {}

                    var picked = favOpenDialogFromDefaultFolder(); // multi-select enabled
                    if (!picked) return;

                    // Normalize to array
                    if (!(picked instanceof Array)) picked = [picked];

                    // Add to saved list (no import on normal click)
                    for (var i = 0; i < picked.length; i++) {
                        var f = picked[i];
                        if (!f || !f.exists) continue;
                        favAddPath(f.fsName);
                    }
                    favRebuildDropdown();
                    try { _ddShowTempMessage(favDD, 'Added', 1.0); } catch(eMsg) {}
                    // Cmd/Ctrl+click = add to list AND import into bin + active comp timeline.
                    if (doImport) {
                        for (var j = 0; j < picked.length; j++) {
                            var ff = picked[j];
                            if (!ff || !ff.exists) continue;
                            try { favImportToBinAndTimeline(ff); } catch (eImp) {}
                        }
                    }

                    relayout();
                };

                favDD.onChange = function () {
                    if (favDD.__shineProgrammatic) return;
                    if (!favDD.selection) return;

                    var item = favDD.selection;

                    // Cmd/Ctrl+click (modified selection) removes the item from the list.
                    if (item && item._path && _isCmdOrCtrlDown()) {
                        try {
                            favRemovePath(item._path);
                            favRebuildDropdown();
                            relayout();
                        } catch (eR) {}
                        return;
                    }
                    if (item && item._isBlank) return;
                    var choice = item.text;

                    function resetSoon() {
                        try { _ddFlashThenReset(favDD, 25); } catch (eRS) {}
                    }

                    if (choice === "(No saved files)") { try { favDD.selection = 0; } catch (e0) {} return; }

                    if (choice === FAV_ACTION_CLEAR) {
                        favClear();
                        favRebuildDropdown();
                        relayout();
                        return;
                    }

                    var path = item._path;
                    if (!path) return;

                    var fileObj = new File(path);
                    if (!fileObj.exists) {
                        alert("This file can’t be found:\n" + path + "\n\nIt will stay in Favorites until you Clear Favorites.");
                        return;
                    }

                    favImportToBinAndTimeline(fileObj);
                    // Keep the selection visible briefly, then revert to blank.
                    resetSoon();
                };

                var favGap = favWrap.add("group");
                favGap.minimumSize = [0, 2];
                favGap.maximumSize = [10000, 4];

                makeDivider(content);

        // FAVORITES BAR SAFETY (ensure visible)
        try { favWrap.visible = true; favWrap.enabled = true; } catch (e) {}

        // MAIN accordion
        
        // Accordion host (keeps Favorites bar above)
        var accHost = content.add("group");
        accHost.orientation   = "column";
        accHost.alignChildren = ["fill", "top"];
        accHost.alignment     = ["fill", "top"];
        accHost.margins       = [0, 0, 0, 0];
        accHost.spacing       = 10;

        var mainAcc = createAccordion(accHost, null, function(){ relayoutScoped(content); }, "AccordionOrder_MAIN");

        
// =========================
// Sections / buttons (MAIN)  (re-orderable with header chevrons)
// =========================
mainAcc.defineSection("ADD RIG", function(body){
    addGrid2(body, [
        { text: "3D CAMERA RIG",  onClick: addCameraRig },
        { text: "ADJ. LAYER RIG", onClick: addCCAdjustmentRig }
    ]);
});

mainAcc.defineSection("ADD LAYER", function(body){
    addGrid2(body, [
        { text: "SOLID",      onClick: addSolidNativePrompt },
        { text: "NULL",       onClick: addNullDefault },
        { text: "ADJ. LAYER", onClick: addAdjustmentLayerDefault }
    ]);
});

mainAcc.defineSection("ADD EXPRESSION", function(body){
    addGrid2(body, [
        {
            text: "BOUNCE",
            badgeDot: true,
            onClick: function () { isOptionDown() ? doHardBounce() : doInertialBounce(); },
            helpTip: "Hover: Inertial Bounce\nOption (while hovered): Hard Bounce\nClick runs the shown mode",
            hoverLabels: { base: "BOUNCE", hover: "INERTIAL BOUNCE", optionHover: "HARD BOUNCE" }
        },
        { text: "WIGGLE", onClick: doWiggle }
    ]);
});

mainAcc.defineSection("UTILITIES", function(body){
    addGrid2(body, [
        {
            text: "TRIM LAYER",
            badgeDot: true,
            onClick: trimLayerToNeighbor,
            helpTip: "Hover: BELOW (trim to layer below)\nOption (while hovered): ABOVE (trim to layer above)\nClick runs the shown mode",
            hoverLabels: { base: "TRIM LAYER", hover: "BELOW", optionHover: "ABOVE" }
        },
        {
            text: "DUPLICATE COMP",
            onClick: duplicateCompDeep,
            helpTip: "Deep duplicates active (or selected) comp AND all nested precomps.\nPrompts for a suffix and folderizes all duplicated comps."
        },
        {
            text: "ADD PHOTO BORDER",
            onClick: addPhotoBorder_Util,
            helpTip: "Creates a stroke-only rectangle border shape layer sized to the comp."
        },
        {
            text: "EXTEND BORDERS",
            onClick: extendBorders_Util,
            helpTip: "Adds CC Repetile to the selected layer, expands 1000px on all sides, and sets Tiling to Repeat."
        },
        {
            text: "EXTEND PRECOMP",
            onClick: extendPrecompToCTI_Util,
            helpTip: "Extends selected precomp (and layers inside) so the last visible frame lands on the CTI."
        },
        { text: "ANIMATE STROKE", onClick: addTrimPaths }
    ]);
});

mainAcc.defineSection("RENDER", function(body){
    addGrid2(body, [
        { text: "RENDER PRORES 422...", onClick: renderPRORES422WithSaveDialog },
        {
            text: "SAVE FRAME AS...",
            badgeDot: true,
            onClick: saveCurrentFramePSDOrJPG,
            helpTip: "Hover: .PSD\nOption (while hovered): .JPG\nClick saves the shown format",
            hoverLabels: { base: "SAVE FRAME AS...", hover: ".PSD", optionHover: ".JPG" }
        }
    ]);
});

mainAcc.defineSection("CLEAN UP", function(body){
    addGrid2(body, [
        { text: "ORGANIZE BIN", onClick: cleanUpProjectBin },
        { text: "REDUCE PROJECT", onClick: reduceProject }
    ]);
});

// Build accordion in persisted order
mainAcc.build();

var collapseGap = content.add("group");
        collapseGap.minimumSize = [0, 25];
        collapseGap.maximumSize = [10000, 25];

        var utilRow = content.add("group");
        utilRow.orientation   = "row";
        utilRow.alignChildren = ["left", "top"];
        utilRow.alignment     = ["fill", "top"];
        utilRow.margins       = 0;
        utilRow.spacing       = 8;

// TEXT tab content is built on demand in _buildTextTabIfNeeded() to speed initial load.
        // Default to MAIN tab handled by _selectTopTab("MAIN") above.
        // Enforce a minimum panel size so footer never gets clipped
        try { pal.minimumSize = [300, 260]; } catch (eMin) {}

        // --------------------------------------------------
        // Resize / relayout (optimized + stable)
        // --------------------------------------------------
        // ScriptUI can flicker if we call layout(true) repeatedly while dragging.
        // Strategy:
        //   - onResizing: lightweight resize() only (fast)
        //   - onResize:   one debounced full layout(true) pass after mouse-up (stabilizes bounds)
        var __resizeTask = 0;
        var __RESIZE_TICK_FN = "__ShineTools_FullRelayoutTick__";

        function _cancelResizeTask() {
            if (__resizeTask) {
                try { app.cancelTask(__resizeTask); } catch (e0) {}
                __resizeTask = 0;
            }
        }

        $.global[__RESIZE_TICK_FN] = function () {
            __resizeTask = 0;
            try { pal.layout.layout(true); } catch (e1) {}
            try { pal.layout.resize(); } catch (e2) {}
            // After resize, re-clamp dropdown item labels so popup widths match controls.
            try {
                var dds = $.global.__ShineToolsAllDropdowns;
                if (dds && dds.length) {
                    for (var di = 0; di < dds.length; di++) {
                        _applyDropdownLabelClamp(dds[di]);
                    }
                }
            } catch (eDD) {}
        };

        function requestFullRelayoutSoon() {
            _cancelResizeTask();
            // Small debounce keeps UI smooth but correct after drag and after accordion toggles.
            try { __resizeTask = app.scheduleTask(__RESIZE_TICK_FN + "()", 80, false); } catch (e1) {
                try { pal.layout.layout(true); } catch (e2) {}
                try { pal.layout.resize(); } catch (e3) {}
            }
        }

        pal.onResizing = function () {
            _cancelResizeTask();
            try { pal.layout.resize(); } catch (e0) {}
            try {
                var dds = $.global.__ShineToolsAllDropdowns;
                if (dds && dds.length) {
                    for (var di = 0; di < dds.length; di++) {
                        _applyDropdownLabelClamp(dds[di]);
                    }
                }
            } catch (eDD) {}
        };

        pal.onResize = function () {
            requestFullRelayoutSoon();
        };

        relayout();
        return pal;
    }

    // ============================================================
    // Init
    // ============================================================
    var myPal = buildUI(thisObj);

// Expose pal + a safe "kick" relayout to global scope so scheduleTask can access it.
try { $.global.__ShineTools_pal = myPal; } catch (e0) {}

try {
    $.global.__ShineToolsKickLayout = function () {
        var p = null;
        try { p = $.global.__ShineTools_pal; } catch (e1) {}
        if (!p) return;
        try { p.layout.layout(true); } catch (e2) {}
        try { p.layout.resize(); } catch (e3) {}
        try { p.update(); } catch (e4) {}
        try { p.graphics && p.graphics.invalidate && p.graphics.invalidate(); } catch (e5) {}
    };
} catch (e6) {}

if (myPal instanceof Window) {
    myPal.center();
    myPal.show();

    // Windows usually lay out fine, but do a quick extra pass just in case.
    try { $.global.__ShineToolsKickLayout(); } catch (e7) {}
    try { app.scheduleTask("__ShineToolsKickLayout()", 30, false); } catch (e8) {}
    try { app.scheduleTask("__ShineToolsKickLayout()", 120, false); } catch (e9) {}
} else {
    // Dockable panels often need an extra layout pass AFTER they are actually drawn.
    try { $.global.__ShineToolsKickLayout(); } catch (e10) {}
    try { app.scheduleTask("__ShineToolsKickLayout()", 30, false); } catch (e11) {}
    try { app.scheduleTask("__ShineToolsKickLayout()", 120, false); } catch (e12) {}
}

})(this);