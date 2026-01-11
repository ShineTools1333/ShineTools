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

// =======================================================
// SHINE TOOLS – VERSION (EDIT THIS ONLY PER RELEASE)
// =======================================================
// File name stays: ShineTools.jsx
// Panel title: ShineTools_vX.Y
// Other UI: vX.Y

var SHINE_PRODUCT_NAME = "ShineTools";
var SHINE_VERSION      = "1.5";
var SHINE_VERSION_TAG  = "v" + SHINE_VERSION;
var SHINE_TITLE_TEXT   = SHINE_PRODUCT_NAME + "_" + SHINE_VERSION_TAG;



(function ShineTool(thisObj) {

    // ============================================================
    // 0a) Dropdown helpers (temporary display then revert to blank)
    // ============================================================
    function _ensureDDStore() {
        if (!$.global.__ShineToolsDDStore) $.global.__ShineToolsDDStore = {};
        return $.global.__ShineToolsDDStore;
    }


    // ============================================================
    // 0b) Lightweight helpers (safe, mac-only)
    // ============================================================
    // Namespace for debug toggles / shared state (kept global so a docked panel reload can reuse it).
    var ST = $.global.__ShineToolsNS || ($.global.__ShineToolsNS = { DEBUG: false });
    function _log(msg) {
        try { if (ST && ST.DEBUG) $.writeln("[ShineTools] " + String(msg)); } catch (e) {} finally { __GF_RESP_LOCK = false; }
        }

    function _ddEnsureKey(dd) {
        try {
            if (!dd) return null;
            var store = _ensureDDStore();
            if (!dd.__shineDDKey) {
                dd.__shineDDKey = "dd_" + (new Date().getTime()) + "_" + Math.floor(Math.random() * 1000000);
            }
            store[dd.__shineDDKey] = dd;
            return dd.__shineDDKey;
        } catch (e) {}
        return null;
    }

    function _cancelTaskSafe(taskId) {
        try { if (taskId) app.cancelTask(taskId); } catch (e) {}
    }

    // ------------------------------------------------------------
    // app.settings helpers (single choke-point for persistence)
    // ------------------------------------------------------------
    function _settingsHas(section, key) {
        try { return app.settings.haveSetting(section, key); } catch (e) {}
        return false;
    }
    function _settingsGet(section, key, defaultValue) {
        try {
            if (app.settings.haveSetting(section, key)) {
                return app.settings.getSetting(section, key);
            }
        } catch (e) {}
        return defaultValue;
    }
    function _settingsSet(section, key, value) {
        try {
            app.settings.saveSetting(section, key, String(value));
            return true;
        } catch (e) {}
        return false;
    }
    function _settingsGetJSON(section, key, defaultValue) {
        var raw = _settingsGet(section, key, null);
        if (raw === null || raw === undefined || raw === "") return defaultValue;
        try { return JSON.parse(raw); } catch (e) {}
        return defaultValue;
    }
    function _settingsSetJSON(section, key, obj) {
        try { return _settingsSet(section, key, JSON.stringify(obj)); } catch (e) {}
        return false;
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
        // Show a short message inside a dropdown without firing its onChange.
        // Uses item[0] as a reserved "blank/message" row, then restores to a space.
        try {
            if (!dd) return;

            // Ensure stable key + store ref for scheduleTask callbacks.
            _ddEnsureKey(dd);

            var ms = Math.round((Math.max(0.1, seconds || 1) * 1000));

            // Cancel any pending restore for this dropdown
            _cancelTaskSafe(dd.__shineMsgTaskId);

            dd.__shineProgrammatic = true;
            try {
                if (dd.items && dd.items.length > 0) {
                    dd.items[0].text = String(message || "Added");
                    dd.selection = 0;
                    if (dd.window && dd.window.update) dd.window.update();
                }
            } catch (eSet) {}

            dd.__shineMsgTaskId = app.scheduleTask(
                "$.global._shineToolsRestoreDropdownBlank('" + dd.__shineDDKey + "');",
                ms,
                false
            );
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

                _withUndoGroup("Apply Text Preset", function () {
                
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
                });

            } catch (e) {
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

            _ddEnsureKey(dd);

            // Cancel any pending reset for this dropdown
            _cancelTaskSafe(dd.__shineDDTaskId);

            dd.__shineDDTaskId = app.scheduleTask(
                "$.global._shineToolsResetDropdown('" + dd.__shineDDKey + "');",
                ms,
                false
            );
        } catch (e) {}
    }

    function _dropdownResetAfterSeconds(dd, seconds) {
        try {
            if (!dd) return;

            var ms = Math.round((Math.max(0.1, seconds) * 1000));

            _ddEnsureKey(dd);


            // Cancel any pending reset for this dropdown
            try { if (dd.__shineDDTaskId) app.cancelTask(dd.__shineDDTaskId); } catch (eCancel) {}

            dd.__shineDDTaskId = app.scheduleTask("$.global._shineToolsResetDropdown('" + dd.__shineDDKey + "');", ms, false);
        } catch (e) {}
    }


    function _isCmdDown() {
        // macOS-only: Command key.
        try {
            var ks = ScriptUI.environment.keyboardState;
            return (ks && ks.metaKey) ? true : false;
        } catch (e) {}
        return false;
    }


    function _withUndoGroup(name, fn) {
        // Safe Undo wrapper: guarantees endUndoGroup even if fn throws.
        if (!fn || typeof fn !== "function") return;
        try { app.beginUndoGroup(String(name || "ShineTools")); } catch (eBegin) {}
        try { fn(); }
        catch (eRun) { throw eRun; }
        finally { try { app.endUndoGroup(); } catch (eEnd) {} }
    }



    // ============================================================
    // 0) Locate ScriptUI Panels folder + logo
    // ============================================================
    var SCRIPT_FILENAME = "ShineTools.jsx";
    // Version comes from top-level SHINE_VERSION / SHINE_VERSION_TAG
    var SHINE_TOOLS_VERSION = SHINE_VERSION_TAG;
    var LOGO_FILENAME   = "shinetools_logo.png";

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
        // (Much faster than scanning /Applications and generally works reliably.)
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

        function tryFile(p) {
            try {
                if (!p) return null;
                var f = new File(p);
                if (f.exists) return f;
            } catch (e) {}
            return null;
        }

        function tryIconsFolder(folderPath) {
            try {
                if (!folderPath) return null;
                // exact filename
                var exact = tryFile(folderPath + "/" + LOGO_FILENAME);
                if (exact) return exact;

                // case-insensitive fallback for pngs
                var fld = new Folder(folderPath);
                if (!fld.exists) return null;
                var files = fld.getFiles("*.png");
                for (var i = 0; i < files.length; i++) {
                    try {
                        var f = files[i];
                        if (!(f instanceof File)) continue;
                        if (String(f.name).toLowerCase() === String(LOGO_FILENAME).toLowerCase()) return f;
                    } catch (e2) {}
                }
            } catch (e3) {}
            return null;
        }

        // 1) Relative to the running script (most reliable)
        try {
            var sf = new File($.fileName);
            if (sf && sf.exists) {
                var parent = sf.parent; // folder containing the running jsx
                // <parent>/icons
                var f1 = tryIconsFolder(parent.fsName + "/icons");
                if (f1) { __ST_CACHE.logoFile = f1; return __ST_CACHE.logoFile; }

                // <parent>/ShineTools/icons  (common when ShineTools.jsx sits in ScriptUI Panels root)
                var f2 = tryIconsFolder(parent.fsName + "/ShineTools/icons");
                if (f2) { __ST_CACHE.logoFile = f2; return __ST_CACHE.logoFile; }

                // if script itself is inside .../ShineTools/, also try sibling icons
                var f3 = tryIconsFolder(parent.parent ? (parent.parent.fsName + "/icons") : "");
                if (f3) { __ST_CACHE.logoFile = f3; return __ST_CACHE.logoFile; }
            }
        } catch (e0) {}

        // 2) Derived ScriptUI Panels folder
        try {
            var panelsFolder = findScriptUIPanelsFolderByScript();
            if (panelsFolder) {
                // New expected layout: ScriptUI Panels/ShineTools/icons/
                var f4 = tryIconsFolder(panelsFolder.fsName + "/ShineTools/icons");
                if (f4) { __ST_CACHE.logoFile = f4; return __ST_CACHE.logoFile; }

                // Legacy layout fallback
                var f5 = tryIconsFolder(panelsFolder.fsName + "/ShineTools_icons");
                if (f5) { __ST_CACHE.logoFile = f5; return __ST_CACHE.logoFile; }
            }
        } catch (e1) {}

        // 3) Hard fallback: known macOS install path
        try {
            var hard1 = tryIconsFolder("/Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels/ShineTools/icons");
            if (hard1) { __ST_CACHE.logoFile = hard1; return __ST_CACHE.logoFile; }

            var hard2 = tryIconsFolder("/Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels/ShineTools_icons");
            if (hard2) { __ST_CACHE.logoFile = hard2; return __ST_CACHE.logoFile; }
        } catch (e2) {}

        return __ST_CACHE.logoFile; // null if missing
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
        try {
            if (!obj || nm === undefined || nm === null) return;
            if (obj.name !== nm) obj.name = nm;
        } catch (e) {}
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

    // ------------------------------------------------------------
    
    // ------------------------------------------------------------
    // File / path helpers (macOS-only)
    // ------------------------------------------------------------
    function _pathExists(pathStr) {
        if (!pathStr) return false;
        try {
            var f = new File(pathStr);
            if (f.exists) return true;
        } catch (e1) {}
        try {
            var d = new Folder(pathStr);
            if (d.exists) return true;
        } catch (e2) {}
        return false;
    }

    function _listPruneMissing(arr) {
        var out = [];
        try {
            for (var i = 0; i < (arr ? arr.length : 0); i++) {
                var p = String(arr[i] || "");
                if (!p) continue;
                if (_pathExists(p)) out.push(p);
            }
        } catch (e) {}
        return out;
    }

// List persistence helpers (dedupe/limit + backwards-compatible parse)
    // ------------------------------------------------------------
    function _listParseCompat(raw) {
        if (!raw) return [];
        // Prefer JSON (current format)
        var arr = _favParse(raw);
        if (arr && arr.length) return arr;

        // Back-compat: older builds may have stored a JS array literal string
        // e.g. "['/path/a.ffx','/path/b.ffx']"
        try {
            // eslint-disable-next-line no-eval
            var v = eval(raw);
            if (v && v.length) return v;
        } catch (e) {}
        return [];
    }

    function _listClean(arr, maxLen) {
        var clean = [];
        var seen = {};
        try {
            for (var i = 0; i < arr.length; i++) {
                var p = String(arr[i] || "");
                if (!p) continue;
                if (seen[p]) continue;
                seen[p] = true;
                clean.push(p);
                if (maxLen && clean.length >= maxLen) break;
            }
        } catch (e) {}
        return clean;
    }

    function _listLoad(section, key, maxLen) {
        try {
            var raw = _settingsGet(section, key, "");
            if (!raw) return [];
            var arr = _listParseCompat(raw);
            var clean = _listClean(arr, maxLen);

            // Hygiene: prune missing paths on load (keeps menus clean if files move)
            var pruned = _listPruneMissing(clean);
            if (pruned.length !== clean.length) {
                // Persist the cleaned list so we don't keep re-pruning every launch
                _settingsSet(section, key, _favStringify(pruned));
            }
            return pruned;
        } catch (e) {}
        return [];
    }

    function _listSave(section, key, arr, maxLen) {
        try {
            var clean = _listClean(arr || [], maxLen);
            _settingsSet(section, key, _favStringify(clean));
            return clean;
        } catch (e) {}
        return [];
    }

    function favLoad() {
        return _listLoad(FAV_SETTINGS_SECTION, FAV_SETTINGS_KEY, FAV_MAX);
    }

    function favSave(arr) {
        _listSave(FAV_SETTINGS_SECTION, FAV_SETTINGS_KEY, arr, FAV_MAX);
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
        return _listLoad(ANIM_SETTINGS_SECTION, ANIM_SETTINGS_KEY, ANIM_MAX);
    }

    function animSave(arr) {
        _listSave(ANIM_SETTINGS_SECTION, ANIM_SETTINGS_KEY, arr, ANIM_MAX);
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
            : new Window("palette", "ShineTools_v" + SHINE_VERSION, undefined, { resizeable: true });

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
tabBar.alignChildren = ["fill", "center"];
tabBar.alignment     = ["fill", "top"];
tabBar.margins       = 0;
tabBar.spacing       = 0;

// Left (MAIN/TEXT)
var tabBarLeft = tabBar.add("group");
tabBarLeft.orientation   = "row";
tabBarLeft.alignChildren = ["left", "center"];
tabBarLeft.alignment     = ["left", "center"];
tabBarLeft.margins       = 0;
tabBarLeft.spacing       = 14;

// Flexible gap (push right tabs to the end)
var tabBarGap = tabBar.add("group");
tabBarGap.minimumSize = [0, 0];
tabBarGap.maximumSize = [10000, 10000];
tabBarGap.alignment   = ["fill","fill"];

// Right (HELP/REQUESTS + UPDATES pinned far right)
var tabBarRight = tabBar.add("group");
tabBarRight.orientation   = "row";
tabBarRight.alignChildren = ["right", "center"];
tabBarRight.alignment     = ["right", "center"];
tabBarRight.margins       = 0;
tabBarRight.spacing       = 14;
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

function _makeTopTabLabel(txt, host) {
    if (!host) host = tabBarLeft;
    var st = host.add("statictext", undefined, txt);

    // Compact, left-justified tabs (do NOT stretch across the whole panel).
    st.justify = "center";
    st.margins = 0;

    // Add a touch of padding without forcing a fixed width.
    try { st.characters = Math.max(4, (txt || "").length + 1); } catch (e) {}

    return st;
}

var tabLblMain = _makeTopTabLabel("MAIN", tabBarLeft);
var tabLblText = _makeTopTabLabel("TEXT", tabBarLeft);

// Pinned (right) tabs: REQUESTS / UPDATES / HELP (HELP far right)
var tabLblRequests = _makeTopTabLabel("REQUESTS", tabBarRight);
var tabLblUpdates  = _makeTopTabLabel("UPDATES", tabBarRight);
var tabLblHelp     = _makeTopTabLabel("HELP", tabBarRight);
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

        // Compute tab label bounds relative to tabBar (works even if labels live inside nested groups)
        function _leftInTabBar(ctrl) {
            var x = 0;
            try { x = ctrl.bounds[0]; } catch (e) { x = 0; }
            var p = ctrl.parent;
            while (p && p !== tabBar) {
                try { x += p.bounds[0]; } catch (e2) {}
                p = p.parent;
            }
            return x;
        }

        // Convert label bounds into underlineEl local coordinates (underlineEl bounds are in tabHeader coords)
        var leftTB = _leftInTabBar(st);
        var ub = underlineEl.bounds; // [l,t,r,b] in tabHeader coords
        var labelL = (tabBar.bounds[0] + leftTB) - ub[0];

        var labelW = 0;
        try { labelW = st.bounds[2] - st.bounds[0]; } catch (eW) { labelW = 0; }
        if (labelW <= 0) labelW = underlineEl.size[0];

        // Measure the actual rendered text width so the underline fits the word (not the control box)
        var txt = (st && st.text) ? String(st.text) : "";
        var textW = 0;
        try { textW = st.graphics.measureString(txt).width; } catch (eM) { textW = labelW; }

        var pad = 10; // total padding added to the measured text width
        var underlineW = Math.max(12, textW + pad);

        // Center underline under the text, clamped to the label box
        var cx = labelL + (labelW / 2);
        var x1 = cx - (underlineW / 2);
        var x2 = cx + (underlineW / 2);

        // Small optical tweak so MAIN/TEXT look consistent with longer words
        if (txt === "MAIN") { x1 -= 1; x2 -= 1; }
        if (txt === "UPDATES") { x1 += 1; x2 += 1; }

        var y = underlineEl.size[1] - 1;

        // Clamp inside underline layer
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
                 ((which === "REQUESTS") ? tabLblRequests :
                 ((which === "HELP") ? tabLblHelp : tabLblMain)));
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

        var tabMain     = tabStack.add("group");
var tabText     = tabStack.add("group");
var tabRequests = tabStack.add("group");
var tabUpdates  = tabStack.add("group");
var tabHelp     = tabStack.add("group");
        tabRequests.visible = false;
tabUpdates.visible  = false;
tabHelp.visible     = false;
        // GLOBAL FOOTER (outside tabs)
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
        gfLeft.alignment     = ["left", "bottom"];
        gfLeft.margins       = 0;
        gfLeft.spacing       = 0;        // Left text
        var gfCopy = gfLeft.add("statictext", undefined, "(c) 2025 Shine Creative | v" + SHINE_VERSION);
        gfCopy.margins = 0;

        // flexible gap
        var gfGap = globalFooter.add("group");
        gfGap.minimumSize = [0, 0];
        gfGap.maximumSize = [10000, 10000];
        gfGap.alignment   = ["fill","fill"];




        var gfRight = globalFooter.add("group");
        gfRight.orientation   = "column";
        gfRight.minimumSize = [180, 0];
        gfRight.alignChildren = ["right", "center"];
        gfRight.alignment = ["right", "bottom"];
        gfRight.margins       = 0;
        gfRight.spacing       = 2;

        // Right status + legend (stacked)
        // Status line sits above the legend:
        //  - Up to Date  (with checkmark)
        //  - Update available (no checkmark)
        var gfStatusRow = gfRight.add("group");
        gfStatusRow.orientation   = "row";
        gfStatusRow.alignChildren = ["right", "center"];
        gfStatusRow.alignment     = ["right", "center"];
        gfStatusRow.margins       = 0;
        gfStatusRow.spacing       = 4;

        var gfStatusLabel = gfStatusRow.add("statictext", undefined, "Up to date.");
        gfStatusLabel.margins = 0;
        gfStatusLabel.alignment = ["right","center"];
        gfStatusLabel.justify = "right";

        
        gfStatusLabel.characters = 16;
var gfLegendRow = gfRight.add("group");
        gfLegendRow.orientation   = "row";
        gfLegendRow.alignChildren = ["right", "center"];
        gfLegendRow.alignment     = ["right", "center"];
        gfLegendRow.margins       = 0;
        gfLegendRow.spacing       = 0;

        // Legend (button dot meaning)
        var gfDot = gfLegendRow.add("statictext", undefined, "●");
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
        var _gfSpacer = gfLegendRow.add("statictext", undefined, " ");
        _gfSpacer.margins = 0;
        _gfSpacer.minimumSize = [4, 12];
        _gfSpacer.maximumSize = [4, 12];
        _gfSpacer.preferredSize = [4, 12];

        var gfLegend = gfLegendRow.add("statictext", undefined, "= Multiple Options");
        gfLegend.justify = "right";
        gfLegend.margins = 0;

        function _setFooterUpdateIndicator(isUpToDate) {
            try {
                gfStatusRow.visible = true;
                if (isUpToDate) {
                    gfStatusLabel.text = "✓ Up to date.";
                } else {
                    gfStatusLabel.text = "Update available.";
                }
                // Keep right group anchored
                gfRight.alignment = ["right","bottom"];
            } catch (e) {}
        }

        // Default until the first check runs (auto-check on launch will update quickly)
        try {
            gfStatusRow.visible = false;            gfStatusLabel.text = "";
        } catch(e) {}

        // Keep global footer single-line and avoid clipping on narrow panels
        var __GF_RESP_LOCK = false;

        function applyGlobalFooterResponsive() {
            if (__GF_RESP_LOCK) return;
            __GF_RESP_LOCK = true;
            try {
                var W = 0;
                try { W = pal.size[0] || 0; } catch (eW) { W = 0; }
                // Hide legend label when too narrow so nothing clips (dot stays visible)
                gfLegend.visible = (W === 0) ? true : (W >= 420);
                // Keep right group anchored
                gfRight.alignment = ["right","bottom"];
            } catch (e) {} finally { __GF_RESP_LOCK = false; }
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


        // ============================================================
        // REQUESTS + FONT AUDIT (v1.0 additions)
        // ============================================================
        function _getLoginName() {
            try {
                var u = $.getenv("USER");
                if (u) return String(u);
            } catch (e1) {}
            try {
                var w = $.getenv("USERNAME");
                if (w) return String(w);
            } catch (e2) {}
            return "unknown";
        }

        function _timestampForFilename() {
            function z(n){ return (n < 10 ? "0" : "") + n; }
            try {
                var d = new Date();
                return d.getFullYear() + z(d.getMonth()+1) + z(d.getDate()) + "_" + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds());
            } catch (e) {}
            return "timestamp";
        }

        function _copyToClipboard(txt) {
            try {
                var t = String(txt || "");
                if (!t) return false;
                var isMac = false;
                try { isMac = ($.os && $.os.toLowerCase().indexOf("mac") >= 0); } catch (eOS) {}
                if (isMac) {
                    // pbcopy expects UTF-8
                    var cmd = "printf %s " + _shellEscape(t) + " | pbcopy";
                    system.callSystem(cmd);
                    return true;
                } else {
                    // Windows: clip
                    // Use cmd /c to run a single command. Avoid newlines breaking echo by using powershell if available.
                    var cmd2 = 'cmd.exe /c "echo ' + t.replace(/"/g,'""') + ' | clip"';
                    system.callSystem(cmd2);
                    return true;
                }
            } catch (e) {}
            return false;
        }

        function _getInstalledFontsMap() {
            var map = {};
            try {
                if (app && app.fonts && app.fonts.allFonts) {
                    var af = app.fonts.allFonts;
                    for (var i = 0; i < af.length; i++) {
                        var fn = null;
                        try { fn = af[i].name; } catch (e1) {}
                        if (!fn) { try { fn = af[i].postScriptName; } catch (e2) {} }
                        if (!fn) continue;
                        map[String(fn).toLowerCase()] = true;
                    }
                }
            } catch (e) {}
            return map;
        }

        function _collectProjectFonts() {
            // Returns { rows:[{name,count,installed}], total:int }
            var counts = {};
            var total = 0;

            try {
                if (!app.project) return { rows:[], total:0 };

                for (var i = 1; i <= app.project.numItems; i++) {
                    var it = app.project.item(i);
                    if (!(it && (it instanceof CompItem))) continue;

                    for (var l = 1; l <= it.numLayers; l++) {
                        var lyr = it.layer(l);
                        if (!lyr) continue;

                        var td = null;
                        try {
                            var st = lyr.property("Source Text");
                            if (st) td = st.value;
                        } catch (eST) { td = null; }

                        if (td && td.font) {
                            var fName = String(td.font);
                            if (!counts[fName]) counts[fName] = 0;
                            counts[fName] += 1;
                            total += 1;
                        }
                    }
                }
            } catch (e) {}

            var installedMap = _getInstalledFontsMap();

            var rows = [];
            for (var k in counts) {
                if (!counts.hasOwnProperty(k)) continue;
                var isInstalled = null; // null = unknown
                try {
                    if (installedMap && Object.keys(installedMap).length > 0) {
                        isInstalled = !!installedMap[String(k).toLowerCase()];
                    }
                } catch (e2) {}
                rows.push({ name:k, count:counts[k], installed:isInstalled });
            }

            // sort: missing first, then alphabetic
            rows.sort(function(a,b){
                var ai = (a.installed === false) ? 0 : 1;
                var bi = (b.installed === false) ? 0 : 1;
                if (ai !== bi) return ai - bi;
                var an = a.name.toLowerCase(), bn = b.name.toLowerCase();
                if (an < bn) return -1;
                if (an > bn) return 1;
                return 0;
            });

            return { rows: rows, total: total };
        }

        function _showFontAuditDialog() {
            try {
            /*
              Font Audit Standalone (Minimal) v2.16 FIXED

              Based on user's v2.15 resolver approach:
                - macOS CoreText JXA resolve (PostScript -> file path)
                - bounded scan roots (System/User/Adobe/CoreSync/Adobe app Fonts)

              UI:
                - Legend labels: OK - Resolved, WARN - Ambiguous, MISSING - Font not found
                - Divider line
                - List (no box), no header row, no scrollbar
                - Bottom button: EXPORT FONT LIST (saves font names to .txt and reveals in Finder/Explorer)
            */

            function __RunFontAuditModal__() {

              // ------------------ Constants ------------------
              var COL_STATUS = 80;
              var COL_FONT   = 260;
              var COL_NOTES  = 420;
              var LIST_W      = 760;
              var LIST_H_INIT = 320;



              function isMac(){ return ($.os && $.os.toLowerCase().indexOf("mac") !== -1); }
              function trim(s){ return (s||"").replace(/^\s+|\s+$/g,""); }
              function clip(s, max){ s=(s||""); return (s.length<=max)?s:(s.substring(0, max-1) + "…"); }

              function safeCallSystem(cmd){
                try{ return system.callSystem(cmd); }catch(e){ return ""; }
              }


              function prettyText(s){
                try{
                  if(s === undefined || s === null) return "";
                  s = String(s);

                  // Manual percent-decoding (safe even if decodeURIComponent would throw)
                  s = s.replace(/%([0-9A-Fa-f]{2})/g, function(_m, hh){
                    try{ return String.fromCharCode(parseInt(hh, 16)); }catch(e){ return _m; }
                  });

                  // Then try decodeURIComponent in case there are still encoded sequences
                  try{ s = decodeURIComponent(s); }catch(e1){}

                  // Common leftovers
                  s = s.replace(/%20/g, " ")
                       .replace(/%5B/gi, "[")
                       .replace(/%5D/gi, "]")
                       .replace(/%28/gi, "(")
                       .replace(/%29/gi, ")")
                       .replace(/%2C/gi, ",")
                       .replace(/%26/gi, "&");
                  return s;
                }catch(e2){
                  try{ return String(s); }catch(e3){ return ""; }
                }
              }

              function prettyFileName(p){
                try{
                  if(!p) return "";
                  var nm = File(p).name;
                  try{ nm = decodeURIComponent(nm); }catch(e){}
                  // Also handle literal %20 etc if decodeURIComponent didn't catch (double-encoded cases)
                  nm = nm.replace(/%20/g, " ").replace(/%5B/gi,"[").replace(/%5D/gi,"]");
                  return nm;
                }catch(e2){ return ""; }
              }

              function addListItem(list, rawText){
                var it = list.add("item", prettyText(rawText));
                it.rawName = rawText;
                return it;
              }


            function setBold(st, size){
                try{
                  st.graphics.font = ScriptUI.newFont(st.graphics.font.name, "Bold", size || st.graphics.font.size);
                }catch(e){}
              }

              function fileLooksLikeFontPath(p){ return (p && (/\.(ttf|otf|ttc|otc|dfont)$/i).test(p)); }

              // --- Robust font extraction from text layers ---
              function tryGetTextDocumentFont(layer){
                try{
                  var tp = layer.property("ADBE Text Properties");
                  if(!tp) return "";
                  var tdProp = tp.property("ADBE Text Document");
                  if(!tdProp) return "";
                  var td = tdProp.value;
                  if(td && td.font) return td.font;
                }catch(e){}
                return "";
              }

              function uniqueSorted(arr){
                var m = {};
                for(var i=0;i<arr.length;i++) m[arr[i]] = true;
                var out = [];
                for(var k in m) out.push(k);
                out.sort();
                return out;
              }

              function getFontsInProject(debugOut){
                var found = [];
                var comps=0, layers=0, textLayers=0;

                if(!app.project){
                  if(debugOut) debugOut.noProject = true;
                  return [];
                }

                for(var i=1;i<=app.project.numItems;i++){
                  var item = app.project.item(i);
                  if(!(item instanceof CompItem)) continue;
                  comps++;
                  for(var l=1;l<=item.numLayers;l++){
                    layers++;
                    var layer = item.layer(l);
                    var fn = tryGetTextDocumentFont(layer);
                    if(fn){
                      textLayers++;
                      found.push(fn);
                    }
                  }
                }

                var u = uniqueSorted(found);
                if(debugOut){
                  debugOut.compsScanned = comps;
                  debugOut.layersScanned = layers;
                  debugOut.textLayersFound = textLayers;
                  debugOut.uniqueFonts = u.length;
                }
                return u;
              }

              // --- macOS CoreText: PostScript name -> font file path ---
              function escapeForSingleQuotesBash(s){ return (s||"").replace(/'/g, "'\"'\"'"); }

              function coreTextResolvePath(psName){
                if(!isMac()) return "";
                psName = psName || "";
                if(!psName) return "";

                var jxa =
                  'ObjC.import("CoreText"); ObjC.import("Foundation");' +
                  'var env=$.NSProcessInfo.processInfo.environment;' +
                  'var name=ObjC.unwrap(env.objectForKey("DF_FONTNAME"));' +
                  'if(!name){$.exit(0);} ' +
                  'var font=$.CTFontCreateWithName($(name), 12, null);' +
                  'if(!font){ var alt=name.replace(/-/g," "); font=$.CTFontCreateWithName($(alt), 12, null);} ' +
                  'if(!font){ var alt2=name.replace(/_/g," "); font=$.CTFontCreateWithName($(alt2), 12, null);} ' +
                  'if(!font){$.exit(0);} ' +
                  'var url=$.CTFontCopyAttribute(font, $.kCTFontURLAttribute);' +
                  'if(!url){$.exit(0);} ' +
                  'var nsurl=ObjC.wrap(url);' +
                  'var p=ObjC.unwrap(nsurl.path);' +
                  'if(p){console.log(p);}';

                var cmd = "bash -lc 'DF_FONTNAME=\"" + escapeForSingleQuotesBash(psName) + "\" osascript -l JavaScript -e \"" +
                          jxa.replace(/"/g,'\\"') + "\" 2>/dev/null'";
                var out = trim(safeCallSystem(cmd));
                return (out && fileLooksLikeFontPath(out)) ? out : "";
              }

              // --- Scan index ---
              function pathJoin(a,b){ if(!a) return b; return (a.replace(/\/+$/,"") + "/" + b.replace(/^\/+/,"")); }
              function folderExists(p){ try{ var f=new Folder(p); return f.exists; }catch(e){ return false; } }
              function getHomeDir(){ try{ return Folder("~").fsName; }catch(e){ return ""; } }

              function collectFontFiles(rootPath, recurse, out, cap){
                try{
                  var folder = new Folder(rootPath);
                  if(!folder.exists) return;
                  var files = folder.getFiles();
                  for(var i=0;i<files.length;i++){
                    if(cap && out.length>=cap) return;
                    var f = files[i];
                    if(f instanceof Folder){
                      if(recurse) collectFontFiles(f.fsName, recurse, out, cap);
                    }else{
                      if((f.name||"").match(/\.(ttf|otf|ttc|otc|dfont)$/i)) out.push(f);
                    }
                  }
                }catch(e){}
              }

              function buildMacIndex(){
                var roots = [];

                function addRoot(pth, rec){
                  if(!pth) return;
                  if(folderExists(pth)){
                    roots.push({p:pth, r:rec});
                  }
                }

                function findAdobeAppFontRoots(){
                  var appDirs = ["/Applications"];
                  var candidates = [];

                  for(var di=0; di<appDirs.length; di++){
                    var dPath = appDirs[di];
                    try{
                      var d = new Folder(dPath);
                      if(!d.exists) continue;
                      var kids = d.getFiles();
                      for(var i=0;i<kids.length;i++){
                        var k = kids[i];
                        if(!(k instanceof Folder)) continue;
                        var nm = (k.name||"");
                        if(nm.match(/After Effects/i) || nm.match(/Adobe/i) || nm.match(/Media Encoder/i) || nm.match(/Photoshop/i) || nm.match(/Illustrator/i)){
                          candidates.push(k);
                          if(candidates.length >= 250) break;
                        }
                      }
                    }catch(e){}
                  }

                  for(var ci=0; ci<candidates.length; ci++){
                    try{
                      var f = candidates[ci];
                      var base = f.fsName;

                      if((f.name||"").match(/\.app$/i)){
                        addRoot(base + "/Contents/Resources/Fonts", true);
                        addRoot(base + "/Contents/Resources/pdfl/Fonts", true);
                        addRoot(base + "/Contents/Resources/Required/Fonts", true);
                      }else{
                        var apps = f.getFiles("*.app");
                        for(var ai=0; ai<apps.length; ai++){
                          try{
                            var a = apps[ai];
                            if(!(a instanceof Folder)) continue;
                            var ap = a.fsName;
                            addRoot(ap + "/Contents/Resources/Fonts", true);
                            addRoot(ap + "/Contents/Resources/pdfl/Fonts", true);
                            addRoot(ap + "/Contents/Resources/Required/Fonts", true);
                          }catch(e2){}
                        }
                      }
                    }catch(e3){}
                  }
                }

                roots.push({p:"/System/Library/Fonts", r:true});
                roots.push({p:"/System/Library/Fonts/Supplemental", r:true});
                roots.push({p:"/Library/Fonts", r:true});

                var home = getHomeDir();
                if(home){
                  roots.push({p:pathJoin(home,"Library/Fonts"), r:true});
                  roots.push({p:pathJoin(home,"Library/Application Support/Adobe/Fonts"), r:true});
                  roots.push({p:pathJoin(home,"Library/Application Support/Adobe/CoreSync/plugins/livetype/r"), r:true});
                  roots.push({p:pathJoin(home,"Library/Application Support/Adobe/CoreSync/plugins/livetype/l"), r:true});
                  roots.push({p:pathJoin(home,"Library/Application Support/Adobe/TypeSupport"), r:true});
                }

                roots.push({p:"/Library/Application Support/Adobe/Fonts", r:true});
                roots.push({p:"/Library/Application Support/Adobe/CoreSync/plugins/livetype/r", r:true});
                roots.push({p:"/Library/Application Support/Adobe/TypeSupport", r:true});

                findAdobeAppFontRoots();

                var files = [];
                var existing = [];
                for(var i=0;i<roots.length;i++){
                  if(folderExists(roots[i].p)){
                    existing.push(roots[i].p);
                    collectFontFiles(roots[i].p, roots[i].r, files);
                  }
                }
                return {files:files, roots:existing};
              }

              function normalizeTokenForMatch(s){
                s = (s||"").toLowerCase();
                s = s.replace(/[^a-z0-9]+/g," ");
                s = s.replace(/\s+/g," ");
                return trim(s);
              }

              function scoreMatch(fontName, fileObj){
                var fn = normalizeTokenForMatch(fontName);
                if(!fn) return 0;
                var base = normalizeTokenForMatch((fileObj.name||"").replace(/\.(ttf|otf|ttc|otc|dfont)$/i,""));
                if(!base) return 0;

                if(base.indexOf(fn) !== -1) return 100;

                var fnT = fn.split(" ");
                var bT = base.split(" ");
                var map = {};
                for(var i=0;i<bT.length;i++) map[bT[i]] = true;
                var hits=0;
                for(var j=0;j<fnT.length;j++) if(map[fnT[j]]) hits++;
                return hits;
              }

              function findByScan(fontName, indexFiles){
                var bestScore = 0;
                var best = [];
                var lower = (fontName||"").toLowerCase();

                for(var i=0;i<indexFiles.length;i++){
                  var f = indexFiles[i];
                  var n = (f.name||"").toLowerCase();
                  if(n.indexOf(lower) !== -1) return [{file:f, score:999}];
                }

                for(var k=0;k<indexFiles.length;k++){
                  var f2 = indexFiles[k];
                  var sc = scoreMatch(fontName, f2);
                  if(sc <= 0) continue;
                  if(sc > bestScore){
                    bestScore = sc;
                    best = [{file:f2, score:sc}];
                  }else if(sc === bestScore){
                    best.push({file:f2, score:sc});
                  }
                }
                return best;
              }

              function swatchColor(status){
                if(status === "OK") return [0.20, 0.75, 0.25, 1];
                if(status === "WARN") return [0.95, 0.80, 0.10, 1];
                return [0.90, 0.25, 0.20, 1];
              }

              function addSwatchUI(parent, rgba, size){
                var p = parent.add("panel");
                size = size || 12;
                p.preferredSize = [size, size];
                p.maximumSize = [size, size];
                p.minimumSize = [size, size];
                p.onDraw = function(){
                  try{
                    var g=p.graphics;
                    var b=g.newBrush(g.BrushType.SOLID_COLOR, rgba);
                    g.rectPath(0,0,p.size[0],p.size[1]);
                    g.fillPath(b);
                    var pen=g.newPen(g.PenType.SOLID_COLOR,[0.2,0.2,0.2,1],1);
                    g.strokePath(pen);
                  }catch(e){}
                };
                return p;
              }

              function sortRows(rows){
                var order = {"OK":0,"WARN":1,"MISSING":2};
                rows.sort(function(a,b){
                  var oa = (order[a.status]!==undefined)?order[a.status]:9;
                  var ob = (order[b.status]!==undefined)?order[b.status]:9;
                  if(oa!==ob) return oa-ob;
                  var an=(a.name||"").toLowerCase(), bn=(b.name||"").toLowerCase();
                  return an<bn?-1:(an>bn?1:0);
                });
                return rows;
              }

              // ----------------- Build UI -----------------
              try{
                if($.global.__FontAuditQuickWin__ && $.global.__FontAuditQuickWin__ instanceof Window){
                  try{ $.global.__FontAuditQuickWin__.close(); }catch(_e){}
                }
              }catch(_e2){}

              var win = new Window("dialog","Font Audit (Standalone v2.16 FIXED)", undefined, {resizeable:true, closeButton:true});
              win.orientation="column";
              win.alignChildren=["fill","top"];
              win.spacing=10;
              win.margins=[24,14,14,14];

              var top = win.add("group");
              top.orientation="row";
              top.alignChildren=["left","center"];
              top.spacing=18;

              var auditBtn = top.add("button", undefined, "FONT AUDIT");
              var totalTxt = top.add("statictext", undefined, "Total: 0");

              var spacerTop = win.add("group");
              spacerTop.preferredSize = [0, 14];

              var legend = win.add("group");
              legend.orientation="row";
              legend.alignChildren=["left","center"];
              legend.spacing=14;

              function legendItem(label, rgba){
                var g=legend.add("group");
                g.orientation="row";
                g.alignChildren=["left","center"];
                g.spacing=6;
                addSwatchUI(g, rgba, 12);
                g.add("statictext", undefined, label);
              }

              legendItem("OK - Resolved", swatchColor("OK"));
              legendItem("WARN - Ambiguous", swatchColor("WARN"));
              legendItem("MISSING - Font not found", swatchColor("MISSING"));

              var dividerLine = win.add("panel");
              dividerLine.minimumSize.height = 1;
              dividerLine.maximumSize.height = 1;


              // Header row
              var header = win.add("group");
              header.orientation = "row";
              header.alignChildren = ["left","center"];
              header.spacing = 10;

              var hSpacer = header.add("statictext", undefined, ""); // swatch spacer
              hSpacer.preferredSize = [12,18];
              var hStatus = header.add("statictext", undefined, "STATUS");
              hStatus.preferredSize = [COL_STATUS,18];
              setBold(hStatus, 11);
              var hFont = header.add("statictext", undefined, "FONT");
              hFont.preferredSize = [COL_FONT,18];
              setBold(hFont, 11);
              var hNotes = header.add("statictext", undefined, "NOTES");
              hNotes.preferredSize = [COL_NOTES,18];
              setBold(hNotes, 11);

              var listGroup = win.add("group");
              listGroup.orientation="column";
              listGroup.alignChildren=["fill","top"];
              listGroup.spacing=6;
              listGroup.preferredSize=[LIST_W,LIST_H_INIT];

              function clearList(){
                while(listGroup.children.length) listGroup.remove(listGroup.children[0]);
              }

              function addRowUI(row){
                var g = listGroup.add("group");
                g.orientation="row";
                g.alignChildren=["left","center"];
                g.spacing=10;

                addSwatchUI(g, swatchColor(row.status), 12);

                var st = g.add("statictext", undefined, row.status);
                st.preferredSize=[COL_STATUS,18];
                if(row.status === "OK") setBold(st, 11);

                var fn = g.add("statictext", undefined, row.name);
                fn.preferredSize=[COL_FONT,18];

                var note = g.add("statictext", undefined, clip(prettyText(row.note||""), 140));
                note.preferredSize=[COL_NOTES,18];
              }

              var spacer = win.add("group");
              spacer.preferredSize = [0, 12];

              var btns = win.add("group");
              btns.orientation="row";
              btns.alignChildren=["left","center"];
              btns.spacing=10;

              var exportBtn = btns.add("button", undefined, "EXPORT FONT LIST...");

              var getFontsBtn = btns.add("button", undefined, "GET FONTS...");

              var closeBtn = btns.add("button", undefined, "CLOSE");
              closeBtn.onClick = function(){ try{ win.close(0); }catch(e){ try{ win.close(); }catch(e2){} } };
              defocusButtonBestEffort(closeBtn);
            // State
              var currentRows = [];
              var currentFonts = [];

              function runAudit(){
                if(!app.project){ alert("No project is open."); return; }

                var fonts = getFontsInProject({});
                currentFonts = fonts.slice(0);

                clearList();
                currentRows = [];

                totalTxt.text = "Total: " + fonts.length;

                if(!fonts.length){
                  win.layout.layout(true);
                  return;
                }

                var indexPack = isMac() ? buildMacIndex() : null;

                for (var i = 0; i < fonts.length; i++) {
                  var name = fonts[i];
                  var path = "";
                  var note = "";
                  var status = "MISSING";

                  var ctPath = coreTextResolvePath(name);
                  if (ctPath && fileLooksLikeFontPath(ctPath)) {
                    path = ctPath;
                    status = "OK";
                    note = "Resolved. (" + prettyFileName(path) + ")";
                  } else if (isMac() && indexPack && indexPack.files && indexPack.files.length) {
                    var c = findByScan(name, indexPack.files);

                    if (c && c.length === 1) {
                      path = c[0].file.fsName;
                      status = "OK";
                      note = "Resolved. (" + prettyFileName(path) + ")";
                    } else if (c && c.length > 1) {
                      status = "WARN";
                      note = "Ambiguous (multiple matches).";
                    } else {
                      status = "MISSING";
                      note = "Font not found.";
                    }
                  } else {
                    status = "WARN";
                    note = "Resolver unavailable.";
                  }

                  if (path && fileLooksLikeFontPath(path)) status = "OK";

                  currentRows.push({name:name, status:status, path:path, note:note});
                }

                sortRows(currentRows);
                for(var r=0;r<currentRows.length;r++) addRowUI(currentRows[r]);

                win.layout.layout(true);
              }

              function exportFontList(){
                if(!currentFonts || !currentFonts.length){
                  alert("Nothing to export. Click FONT AUDIT first.");
                  return;
                }

                var outFile = File.saveDialog("Save Font List", "Text:*.txt");
                if(!outFile) return;

                try{
                  var nm = (outFile.name || "");
                  if(nm.toLowerCase().indexOf(".txt") === -1){
                    outFile = new File(outFile.fsName + ".txt");
                  }
                }catch(e0){}

                    // Build lines with extension when we have a resolved file path (OK rows)
                var extByName = {};
                for (var i=0; i<currentRows.length; i++) {
                  try {
                    if (currentRows[i].status === "OK" && currentRows[i].path) {
                      var nm = currentRows[i].name;
                      var fn = File(currentRows[i].path).name;
                      var m = fn.match(/\.([a-z0-9]+)$/i);
                      if (m && m[1]) extByName[nm] = m[1].toLowerCase();
                    }
                  } catch(e) {}
                }

                var lines = [];
                for (var j=0; j<currentFonts.length; j++) {
                  var n = currentFonts[j];
                  var ext = extByName[n];
                  lines.push(ext ? (n + "	." + ext) : n);
                }
                var text = lines.join("\n");
            try{
                  outFile.encoding = "UTF-8";
                  if(!outFile.open("w")){
                    alert("Could not open file for writing.");
                    return;
                  }
                  outFile.write(text);
                  outFile.close();

                  try{
                    if(isMac()) safeCallSystem('open -R "' + outFile.fsName + '"');
                    else safeCallSystem('explorer /select,"' + outFile.fsName + '"');
                  }catch(eR){}
                }catch(eW){
                  try{ outFile.close(); }catch(eC){}
                  alert("Could not write file:\n" + eW.toString());
                }
              }

              auditBtn.onClick = function(){
                try{ runAudit(); }
                catch(e){ alert("Font Audit error:\n" + e.toString()); }
              };


              // ------------------ Remote font search (network / mounted volumes) ------------------
              // Notes:
              // - ExtendScript cannot reliably enumerate "network computers" directly.
              // - This UI shows a list you can edit. For macOS SMB shares, most are mounted under /Volumes/<ShareName>.
              // - When you pick a machine, we attempt to locate its Fonts folders under a mounted root. If not found, you'll be prompted to choose the mounted folder.

              function guessMountedRootForComputer(name){
                if(!isMac()) return "";
                // common pattern: /Volumes/<ComputerName> or /Volumes/<ShareName>
                var p = "/Volumes/" + name;
                try{ if(new Folder(p).exists) return p; }catch(e){}
                return "";
              }

              function buildRemoteIndexFromRoot(rootFs){
                // Build a candidate list of font roots under the remote root, then collect font files.
                // We reuse collectFontFiles from the local scan code.
                var roots = [];

                function add(p, rec){
                  try{
                    var f = new Folder(p);
                    if(f.exists) roots.push({p:p, r:rec});
                  }catch(e){}
                }

                // If user selects a Mac root, it might be the entire disk or a share containing Users/Library
                add(rootFs + "/Library/Fonts", true);
                add(rootFs + "/System/Library/Fonts", true);
                add(rootFs + "/System/Library/Fonts/Supplemental", true);

                // User fonts: attempt common share layouts
                add(rootFs + "/Users/Shared", true);

                // If the share is a user home share, these may exist
                add(rootFs + "/Library/Application Support/Adobe/Fonts", true);
                add(rootFs + "/Library/Application Support/Adobe/CoreSync/plugins/livetype/r", true);
                add(rootFs + "/Library/Application Support/Adobe/TypeSupport", true);

                // If share contains "Users/<user>/Library/Fonts"
                try{
                  var usersFolder = new Folder(rootFs + "/Users");
                  if(usersFolder.exists){
                    var kids = usersFolder.getFiles();
                    for(var i=0;i<kids.length;i++){
                      var k = kids[i];
                      if(k instanceof Folder){
                        add(k.fsName + "/Library/Fonts", true);
                        add(k.fsName + "/Library/Application Support/Adobe/Fonts", true);
                        add(k.fsName + "/Library/Application Support/Adobe/CoreSync/plugins/livetype/r", true);
                        add(k.fsName + "/Library/Application Support/Adobe/TypeSupport", true);
                      }
                    }
                  }
                }catch(eU){}

                // Also allow if the root itself IS a Fonts folder
                add(rootFs, true);

                var files = [];
                for(var r=0;r<roots.length;r++){
                  collectFontFiles(roots[r].p, roots[r].r, files);
                }
                return {files: files, roots: roots};
              }

              function resolveMissingFontsFromRemote(indexFiles, remoteLabel){
                // Only re-check rows that are MISSING or WARN.
                for(var i=0;i<currentRows.length;i++){
                  var row = currentRows[i];
                  if(row.status === "OK") continue;

                  var c = findByScan(row.name, indexFiles);
                  if(c && c.length === 1){
                    row.path = c[0].file.fsName;
                    row.status = "OK";
                    row.note = "Resolved (remote: " + remoteLabel + "). (" + prettyFileName(row.path) + ")";
                  }else if(c && c.length > 1){
                    row.status = "WARN";
                    row.note = "Ambiguous (remote: " + remoteLabel + ").";
                  }else{
                    // keep existing
                    if(!row.note || row.note === "Font not found.") row.note = "Font not found (remote checked: " + remoteLabel + ").";
                  }
                }
                sortRows(currentRows);
                clearList();
                for(var r=0;r<currentRows.length;r++) addRowUI(currentRows[r]);
                win.layout.layout(true);
              }

              function showGetFontsDialog(){
                var d = new Window("dialog", "GET FONTS", undefined, {closeButton:true});
                d.orientation = "column";
                d.alignChildren = ["fill","top"];
                d.margins = 14;
                d.spacing = 10;

                var info = d.add("statictext", undefined, "Search missing fonts on connected computers (mounted volumes) or saved computers:");
                info.maximumSize.width = 600;

                // ---- CONNECTED (auto from /Volumes on macOS) ----
                var connectedLabel = d.add("statictext", undefined, "CONNECTED COMPUTERS (Mounted Volumes)");
                setBold(connectedLabel, 11);

                var connectedList = d.add("listbox", undefined, [], {multiselect:false});
                connectedList.preferredSize = [600, 140];

                var lastClicked = "connected";
                connectedList.onChange = function(){ lastClicked = "connected"; };

                function refreshConnected(){
                  connectedList.removeAll();
                  if(!isMac()){
                    connectedList.add("item", "(Auto-detect supported on macOS only)");
                    connectedList.selection = 0;
                    return;
                  }
                  var vols = new Folder("/Volumes");
                  if(!vols.exists){
                    connectedList.add("item", "(No /Volumes folder found)");
                    connectedList.selection = 0;
                    return;
                  }

                  var kids = [];
                  try{ kids = vols.getFiles(); }catch(e){ kids = []; }

                  // Filter out obvious local/system mounts
                  function isNoise(name){
                    name = (name||"").toLowerCase();
                    if(!name) return true;
                    if(name === "macintosh hd" || name === "macintosh hd - data") return true;
                    if(name.indexOf("time machine") !== -1) return true;
                    if(name.indexOf("com.apple.timemachine") !== -1) return true;
                    if(name.indexOf("recovery") !== -1) return true;
                    if(name.indexOf("preboot") !== -1) return true;
                    if(name.indexOf("vm") !== -1) return true;
                    if(name.indexOf("update") !== -1) return true;
                    return false;
                  }

                  var names = [];
                  for(var i=0;i<kids.length;i++){
                    var k = kids[i];
                    if(!(k instanceof Folder)) continue;
                    if(isNoise(k.name)) continue;
                    names.push(k.name);
                  }
                  names.sort();

                  if(!names.length){
                    connectedList.add("item", "(No mounted network volumes detected)");
                    connectedList.selection = 0;
                    return;
                  }

                  for(var n=0;n<names.length;n++){
                    var raw = names[n];
                    addListItem(connectedList, raw);
                  }
                  connectedList.selection = 0;
                }

                refreshConnected();

                // ---- SAVED (manual list) ----
                var savedLabel = d.add("statictext", undefined, "SAVED COMPUTERS");
                setBold(savedLabel, 11);

                var savedList = d.add("listbox", undefined, [], {multiselect:false});
                savedList.preferredSize = [600, 140];
                savedList.onChange = function(){ lastClicked = "saved"; };

                // Seed list (editable)
                var machines = [
                  "SHINE-EDIT-01",
                  "SHINE-EDIT-02",
                  "SHINE-EDIT-03",
                  "SHINE-EDIT-04",
                  "SHINE-EDIT-05",
                  "SHINE-EDIT-06",
                  "SHINE-EDIT-07",
                  "SHINE-EDIT-08",
                  "SHINE-EDIT-09",
                  "SHINE-EDIT-10"
                ];
                for(var i=0;i<machines.length;i++){
                  var rawS = machines[i];
                  addListItem(savedList, rawS);
                }
                if(savedList.items.length) savedList.selection = 0;

                // ---- Controls ----
                var row = d.add("group");
                row.orientation = "row";
                row.alignChildren = ["left","center"];
                row.spacing = 10;

                var refreshBtn = row.add("button", undefined, "REFRESH");
                var addBtn = row.add("button", undefined, "ADD...");
                var removeBtn = row.add("button", undefined, "REMOVE");
                row.add("statictext", undefined, "   ");
                var cancelBtn = row.add("button", undefined, "CANCEL");
                var goBtn = row.add("button", undefined, "SEARCH");

                refreshBtn.onClick = function(){ refreshConnected(); };

                addBtn.onClick = function(){
                  var name = prompt("Computer / Share name:", "");
                  if(name){
                    addListItem(savedList, name);
                    savedList.selection = savedList.items.length-1;
                  }
                };

                removeBtn.onClick = function(){
                  if(savedList.selection){
                    var idx = savedList.selection.index;
                    savedList.remove(idx);
                    if(savedList.items.length) savedList.selection = Math.max(0, idx-1);
                  }
                };

                cancelBtn.onClick = function(){ d.close(0); };

                function getSelectedTarget(){
                  if(lastClicked === "connected"){
                    if(connectedList.selection){
                      var t = connectedList.selection.text;
                      if(t && t.charAt(0) !== "("){
                        var rawT = connectedList.selection.rawName || t;
                        return {label:rawT, kind:"connected"};
                      }
                    }
                  }else{
                    if(savedList.selection){
                      var s = savedList.selection.text;
                      if(s){
                        var rawS = savedList.selection.rawName || s;
                        return {label:rawS, kind:"saved"};
                      }
                    }
                  }

                  // Fallbacks
                  if(connectedList.selection){
                    var c = connectedList.selection.text;
                    if(c && c.charAt(0) !== "("){
                      var rawC = connectedList.selection.rawName || c;
                      return {label:rawC, kind:"connected"};
                    }
                  }
                  if(savedList.selection){
                    var s2 = savedList.selection.text;
                    if(s2){
                      var rawS2 = savedList.selection.rawName || s2;
                      return {label:rawS2, kind:"saved"};
                    }
                  }
                  return null;
                }

                goBtn.onClick = function(){
                  if(!currentRows || !currentRows.length){
                    alert("Run FONT AUDIT first.");
                    return;
                  }

                  var sel = getSelectedTarget();
                  if(!sel){
                    alert("Select a computer/share from CONNECTED or SAVED.");
                    return;
                  }

                  var comp = sel.label;
                  var rootFolder = null;

                  if(sel.kind === "connected" && isMac()){
                    // Connected volumes are already mounted under /Volumes/<name>
                    var rootGuess = "/Volumes/" + comp;
                    rootFolder = new Folder(rootGuess);
                    if(!rootFolder.exists){
                      // fallback
                      rootFolder = null;
                    }
                  }else{
                    // Saved: try guess mount, otherwise prompt
                    var rootGuess2 = guessMountedRootForComputer(comp);
                    var tryFolder = rootGuess2 ? new Folder(rootGuess2) : null;
                    if(tryFolder && tryFolder.exists){
                      rootFolder = tryFolder;
                    }
                  }

                  if(!rootFolder || !rootFolder.exists){
                    var chosen = Folder.selectDialog("Select the mounted share folder for: " + comp);
                    if(!chosen) return;
                    rootFolder = chosen;
                  }

                  var pack = buildRemoteIndexFromRoot(rootFolder.fsName);
                  if(!pack.files || pack.files.length === 0){
                    alert("No font files found under that share.\nChecked root:\n" + rootFolder.fsName);
                    return;
                  }

                  resolveMissingFontsFromRemote(pack.files, comp);
                  d.close(1);
                };

                d.center();
                d.show();
              }



              getFontsBtn.onClick = function(){
                try{ showGetFontsDialog(); }
                catch(e){ alert("GET FONTS error:\n" + e.toString()); }
              };

              exportBtn.onClick = function(){
                try{ exportFontList(); }
                catch(e){ alert("Export error:\n" + e.toString()); }
              };

              win.onResizing = win.onResize = function(){
                try{
                  var winH = (win.size && win.size.height) ? win.size.height : 650;
                  var reserve = 185;
                  listGroup.preferredSize.height = Math.max(160, winH - reserve);
                  this.layout.resize();
                }catch(e){}
              };

              $.global.__FontAuditQuickWin__ = win;
              win.center();
              win.show();

            }

                __RunFontAuditModal__();
            } catch (e) {
                alert("Font Audit error:\n" + String(e));
            }
        }


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

                                    // Cmd+click removes the item from the saved list (TEXT tab parity with MAIN).
                                    if (sel && sel.__path && _isCmdDown()) {
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

                // TEXT TAB: Fonts
                textAcc.defineSection("FONTS", function(body){
                    // 2-column grid (placeholder auto-added if odd count)
                    addGrid2(body, [
                        {
                            text: "FONT AUDIT",
                            onClick: function(){ _showFontAuditDialog(); }
                        }
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
            var isRequests = (which === "REQUESTS");
            var isHelp = (which === "HELP");
            tabMain.visible = isMain;
            tabText.visible = isText;
            tabUpdates.visible = isUpdates;
            tabRequests.visible = isRequests;
            tabHelp.visible = isHelp;
// Build heavy tabs on first use
            if (isText) { try { _buildTextTabIfNeeded(); } catch (eBT) {} }

            _setTopTabLabelColor(tabLblMain, isMain ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            _setTopTabLabelColor(tabLblText, isText ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            _setTopTabLabelColor(tabLblUpdates, isUpdates ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            _setTopTabLabelColor(tabLblRequests, isRequests ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
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
            tabLblRequests.addEventListener("mousedown", function(){ _selectTopTab("REQUESTS"); });
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

        tabRequests.orientation   = "column";
        tabRequests.alignChildren = ["fill", "top"];
        tabRequests.margins       = [0, 0, 0, 0];
        tabRequests.spacing       = 0;

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

        // NOTE: Version is centralized near the top as SHINE_VERSION.
        // (SHINE_TOOLS_VERSION remains as a derived "vX.Y" display string.)
        var SHINE_TOOLS_VERSION = "v" + SHINE_VERSION;

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

        var kvVersion = _makeKVRow("Current version:", SHINE_VERSION);
        var kvLatest = _makeKVRow("Latest version:", "—");
var kvLast   = _makeKVRow("Last checked:", "—");
var kvStatus = _makeKVRow("Status:", "Not checked yet");

        // Spacer to lower divider a few pixels
        var _updatesDivSpacer = updatesWrap.add("group");
        _updatesDivSpacer.minimumSize = [10, 4];
        _updatesDivSpacer.maximumSize = [10000, 4];

        // Thin divider between Status and buttons
        var updatesDivider = updatesWrap.add("panel");
        updatesDivider.alignment   = ["fill", "top"];
        updatesDivider.minimumSize = [10, 1];
        updatesDivider.maximumSize = [10000, 1];
        try { updatesDivider.margins = 0; } catch(eDiv) {}


        // Controls (kept above the changelog so nothing shifts when buttons appear)
        var updatesControlsCol = updatesWrap.add("group");
        updatesControlsCol.orientation   = "column";
        updatesControlsCol.alignChildren = ["left", "top"];
        updatesControlsCol.alignment     = ["fill", "top"];
        updatesControlsCol.margins       = [0, 10, 0, 0];
        updatesControlsCol.spacing       = 6;

        var updatesControlsRow = updatesControlsCol.add("group");
        updatesControlsRow.orientation   = "row";
        updatesControlsRow.alignChildren = ["left", "center"];
        updatesControlsRow.alignment     = ["fill", "top"];
        updatesControlsRow.margins       = 0;
        updatesControlsRow.spacing       = 12;

        var btnCheckUpdates   = updatesControlsRow.add("button", undefined, "CHECK FOR UPDATES");

        // These only appear AFTER a newer version is detected.
        var btnInstallUpdate  = updatesControlsRow.add("button", undefined, "INSTALL UPDATE");
        // Start hidden (only CHECK is visible on load).
        btnInstallUpdate.visible = false;
btnInstallUpdate.enabled = false;
        // Changelog
        var chLabelRow = updatesWrap.add("group");
        chLabelRow.orientation = "row";
        chLabelRow.alignChildren = ["left","center"];
        chLabelRow.margins = [12, 0, 0, 0]; // nudge right to align with field text

        var chLabel = chLabelRow.add("statictext", undefined, "Changelog");
        chLabel.justify = "left";
        var chBox = updatesWrap.add("edittext", undefined,
            "• Coming soon: automatic update checking.\n• This tab will show what changed between versions.",
            {multiline:true, readonly:true}
        );
        chBox.alignment     = ["fill", "top"];
        chBox.minimumSize   = [10, 340];
        chBox.preferredSize = [10, 340];



        // Render local changelog history on load
        try { _renderChangelogFromHistory(); } catch (eInitCH) {}
        // GitHub update check
        var GITHUB_VERSION_JSON_URL = "https://raw.githubusercontent.com/ShineTools1333/ShineTools/main/version.json";
        // Expected JSON shape (version.json):
        // {
        //   "latest": "1.0.6",
        //   "date": "2026-01-05",
        //   "pkgUrl": "https://<subdomain>.githubusercontent.com/shared/static/<token>.pkg",
        //   "notes": ["...", "..."]
        // }
        //
        // Where to install (handled by the PKG payload):
        //   /Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels

        // Simple in-memory update state so CHECK does not INSTALL.
        var __UPDATE_STATE = {
            checked: false,
            available: false,
            latest: null,
            jsxUrl: null,
            pkgUrl: null,
            notes: null
        };

        function _normalizeUpdateUrl(url) {
            // Normalize update URLs (GitHub raw only).
            // Tolerate "/refs/heads/" URLs by converting to canonical raw path.
            try {
                if (!url) return url;
                var s = String(url);

                if (s.indexOf("raw.githubusercontent.com") !== -1 && s.indexOf("/refs/heads/") !== -1) {
                    // https://raw.githubusercontent.com/ORG/REPO/refs/heads/main/file
                    // -> https://raw.githubusercontent.com/ORG/REPO/main/file
                    s = s.replace(/\/refs\/heads\//, "/");
                }

                return s;
            } catch (e) {
                return url;
            }
        }

        function _appendCacheBuster(url) {
            // Add a cache-buster query param to avoid GitHub edge caching / HTML interstitials.
            try {
                if (!url) return url;
                var s = String(url);
                var cb = (new Date()).getTime();
                // If already has cb=, don't add again.
                if (s.indexOf("cb=") !== -1) return s;
                return s + (s.indexOf("?") === -1 ? "?" : "&") + "cb=" + cb;
            } catch (e2) {
                return url;
            }
        }

function _toJsDelivrRaw(url) {
            // Convert a raw.githubusercontent.com URL to a jsDelivr GitHub CDN URL.
            // raw: https://raw.githubusercontent.com/ORG/REPO/BRANCH/path/to/file
            // cdn: https://cdn.jsdelivr.net/gh/ORG/REPO@BRANCH/path/to/file
            try {
                if (!url) return "";
                var s = String(url);
                var m = s.match(/^https?:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/i);
                if (!m) return "";
                return "https://cdn.jsdelivr.net/gh/" + m[1] + "/" + m[2] + "@" + m[3] + "/" + m[4];
            } catch (e) {
                return "";
            }


        function _toMediaGithubusercontent(url) {
            // Convert raw.githubusercontent.com URL to media.githubusercontent.com (sometimes more reliable than raw/cdn).
            // raw:   https://raw.githubusercontent.com/ORG/REPO/BRANCH/path/to/file
            // media: https://media.githubusercontent.com/media/ORG/REPO/BRANCH/path/to/file
            try {
                if (!url) return "";
                var s = String(url);
                var mm = s.match(/^https?:\/\/raw\.githubusercontent\.com\/([^\/]+)\/([^\/]+)\/([^\/]+)\/(.+)$/i);
                if (!mm) return "";
                return "https://media.githubusercontent.com/media/" + mm[1] + "/" + mm[2] + "/" + mm[3] + "/" + mm[4];
            } catch (e) {
                return "";
            }
        }

        function _headPreview(s, maxChars) {
            try {
                maxChars = maxChars || 160;
                if (!s) return "";
                var t = String(s);
                t = t.replace(/\r\n/g, "\n");
                t = t.replace(/[\t\x00-\x08\x0B\x0C\x0E-\x1F]+/g, " ");
                t = t.replace(/\s+/g, " ");
                if (t.length > maxChars) t = t.substring(0, maxChars) + "…";
                return t;
            } catch (e2) {
                return "";
            }
        }
        }

                
// ------------------ Updater Hardening Helpers ------------------
function _sleepMs(ms){ try{ $.sleep(ms); }catch(e){} }

function _freshCacheBuster(url){
    try{
        if(!url) return url;
        var s = String(url);
        // Remove existing cb= parameter if present
        s = s.replace(/([?&])cb=\d+/g, '$1').replace(/[?&]$/,'');
        // Clean up possible double && or ?&
        s = s.replace(/\?&/g,'?').replace(/&&/g,'&');
        // Add fresh
        return _appendCacheBuster(s);
    }catch(e){ return _appendCacheBuster(url); }
}

function _classifyDownloadBody(raw){
    // returns {isHtml:boolean, reason:string}
    try{
        if(!raw) return {isHtml:true, reason:"Empty response"};
        var p = String(raw);
        var head = p.substr(0, 900);
        if (/^\s*<!doctype/i.test(head) || /^\s*<html/i.test(head) || /^\s*<head/i.test(head)) {
            // Try to differentiate common GitHub responses
            if (/rate\s*limit|abuse\s*detection/i.test(p)) return {isHtml:true, reason:"GitHub rate-limit / abuse protection"};
            if (/not\s*found|404/i.test(p)) return {isHtml:true, reason:"404 Not Found (HTML)"};
            return {isHtml:true, reason:"HTML response"};
        }
        if (/^\s*404\s*:|^\s*404\s+not\s+found/i.test(p) || /Not\s+Found\s*\(404\)/i.test(p)) {
            return {isHtml:true, reason:"404 Not Found"};
        }
        if (/rate\s*limit/i.test(p) && /github/i.test(p)) {
            return {isHtml:true, reason:"GitHub rate-limit"};
        }
        return {isHtml:false, reason:""};
    }catch(e){
        return {isHtml:true, reason:"Unknown parse error"};
    }
}

function _downloadWithRetries(url, outPath, tries){
    // Returns {ok:boolean, msg:string, attempts:int}
    tries = tries || 3;
    var delays = [0, 1200, 3200, 8000]; // ms
    var last = {ok:false, msg:""};
    for (var i=0; i<tries; i++){
        if (i>0) _sleepMs(delays[Math.min(i, delays.length-1)]);
        var u = _freshCacheBuster(url); // cache-bust each attempt
        last = _curlDownload(u, outPath);
        if (last && last.ok) return {ok:true, msg:last.msg||"", attempts:(i+1)};
    }
    return {ok:false, msg:(last?last.msg:""), attempts:tries};
}

function _extractShineVersionFromJsx(raw){
    try{
        if(!raw) return "";
        var m = String(raw).match(/var\s+SHINE_VERSION\s*=\s*["']([^"']+)["']/);
        return (m && m[1]) ? m[1] : "";
    }catch(e){ return ""; }
}

function _looksLikeShineToolsJsx(raw){
    try{
        if(!raw) return false;
        var s = String(raw);
        // Signature checks: must contain ShineTools identifiers AND a version declaration
        if (s.indexOf("ShineTools") === -1) return false;
        if (!/var\s+SHINE_VERSION\s*=/.test(s)) return false;
        if (s.indexOf("ScriptUI Panels") === -1 && s.indexOf("#target aftereffects") === -1) {
            // still allow, but keep minimum signature above
        }
        return true;
    }catch(e){ return false; }
}

function _pruneBackups(folderPath, prefix, keepN){
    // Deletes older backups beyond keepN (best-effort)
    try{
        keepN = keepN || 3;
        var f = new Folder(folderPath);
        if(!f.exists) return;
        var files = f.getFiles(function(it){
            try{
                return (it instanceof File) && it.name && it.name.indexOf(prefix) === 0 && it.name.match(/\.bak$/i);
            }catch(e){ return false; }
        });
        if(!files || files.length <= keepN) return;
        files.sort(function(a,b){ return (a.modified.getTime() > b.modified.getTime()) ? -1 : 1; });
        for (var i=keepN; i<files.length; i++){
            try{ files[i].remove(); }catch(e2){}
        }
    }catch(e){}
}

function _looksLikeHtml(s){
            try{
                if(!s) return false;
                var t = String(s);
                // only treat as HTML if it starts like a document
                return (/^\s*(?:<!doctype\b|<html\b|<head\b)/i).test(t);
            }catch(e){ return false; }
        }

        function _curlDownload(url, outPath) {
            // Returns { ok:boolean, msg:string }
            // macOS-only: uses curl with redirects enabled (GitHub).
            try {
                if (!url) return { ok:false, msg:"Missing URL." };

                var f = new File(outPath);

                // Ensure parent folder exists
                try { if (f.parent && !f.parent.exists) f.parent.create(); } catch (e0) {}

                var curlBin = "/usr/bin/curl";
                var cmd = curlBin + " -L --fail --silent --show-error -H " + _shellEscape("Cache-Control: no-cache") + " "+ _shellEscape(String(url))
                        + " -o " + _shellEscape(String(outPath))
                        + " 2>&1";

                var msg = String(system.callSystem(cmd) || "");

                // Fallback (some environments don't like absolute curl path)
                if ((!f.exists || f.length <= 0) && msg) {
                    try {
                        var cmd2 = "curl -L --fail --silent --show-error -H \"Cache-Control: no-cache\" "+ _shellEscape(String(url))
                                + " -o " + _shellEscape(String(outPath))
                                + " 2>&1";
                        msg = String(system.callSystem(cmd2) || msg);
                    } catch (eFB) {}
                }

                // Verify file written
                if (f.exists && f.length > 0) {

                    // Detect HTML / 404 bodies (GitHub page, proxy login page, etc.)
                    try {
                        var probe = _readTextFile(outPath);
                        if (probe) {
                            var p = String(probe);
                            var head = p.substr(0, 600);
                            // Only treat as HTML if it *starts* like a webpage (avoid false positives if the JSX contains "<html" text).
                            if (/^\s*<!doctype/i.test(head) || /^\s*<html/i.test(head) || /^\s*<head/i.test(head)) {
                                return { ok:false, msg:"Got HTML instead of a file. Use a direct RAW (raw.githubusercontent.com) link." };
                            }
                            if (/^\s*404\s*:|^\s*404\s+not\s+found/i.test(p) || /Not\s+Found\s*\(404\)/i.test(p)) {
                                return { ok:false, msg:"Got 404 Not Found. Check that the RAW URL path is correct." };
                            }
                            if (/rate\s*limit/i.test(p) && /github/i.test(p)) {
                                return { ok:false, msg:"GitHub rate-limit response. Try again later." };
                            }
                        }
                    } catch (eProbe) {}

                    return { ok:true, msg: msg };
                }


                return { ok:false, msg:(msg || "Download failed.") };
            } catch (e2) {
                return { ok:false, msg:String(e2) };
            }
        }

        function _shellEscape(s) {
            // Quote a string so it is safe to pass as a single argument in a macOS shell command.
            // Implementation: wrap in single quotes and escape embedded single quotes.
            try {
                var str = String(s);
                str = str.replace(/'/g, "'\''");
                return "'" + str + "'";
            } catch (e) {
                return "''";
            }
        }

        
        function _readTextFile(pathOrFile) {
            // Reads a text file and returns a string (best-effort).
            // Used only for light probing (e.g., detecting HTML instead of JSON/JSX).
            var f = null;
            try {
                f = (pathOrFile instanceof File) ? pathOrFile : new File(String(pathOrFile));
                if (!f.exists) return "";
                if (!f.open("r")) return "";
                var s = f.read();
                try { f.close(); } catch (e0) {}
                return s || "";
            } catch (e) {
                try { if (f) f.close(); } catch (e1) {}
                return "";
            }
        }

        function _writeTextFile(pathOrFile, contents) {
            // Writes a UTF-8 text file. Returns true/false.
            var f = null;
            try {
                f = (pathOrFile instanceof File) ? pathOrFile : new File(String(pathOrFile));

                // Ensure parent folder exists
                try {
                    var parent = f.parent;
                    if (parent && !parent.exists) parent.create();
                } catch (eP) {}

                try { f.encoding = "UTF-8"; } catch (eEnc) {}
                if (!f.open("w")) return false;
                f.write(String(contents || ""));
                try { f.close(); } catch (e0) {}
                return true;
            } catch (e) {
                try { if (f) f.close(); } catch (e1) {}
                return false;
            }
        }


        function _extractJsonValue(jsonText, key) {
            // Very small helper to extract a top-level string/number value from JSON text.
            // This avoids relying on JSON.parse in older ExtendScript builds.
            try {
                if (!jsonText || !key) return null;
                var re = new RegExp('\"' + key + '\"\\s*:\\s*(?:"([^"]*)"|([0-9]+(?:\\.[0-9]+)?))', "i");
                var m = re.exec(String(jsonText));
                if (!m) return null;
                return (m[1] !== undefined && m[1] !== null) ? String(m[1]) : ((m[2] !== undefined && m[2] !== null) ? String(m[2]) : null);
            } catch (e) { return null; }
        }

        function _extractJsonStringArray(jsonText, key) {
            // Extract an array of strings from JSON text for a given key, e.g. "notes": ["a","b"]
            // Returns [] if not found. Avoids JSON.parse for older ExtendScript builds.
            try {
                if (!jsonText || !key) return [];
                var s = String(jsonText);

                // Find the bracketed array after the key
                var reBlock = new RegExp('\"' + key + '\"\\s*:\\s*\\[([\\s\\S]*?)\\]', 'i');
                var mb = reBlock.exec(s);
                if (!mb || mb.length < 2) return [];

                var inside = String(mb[1] || "");
                var out = [];
                var reStr = /"([^"\\]*(?:\\.[^"\\]*)*)"/g; // handles basic escaped sequences
                var m2;
                while ((m2 = reStr.exec(inside)) !== null) {
                    var val = String(m2[1] || "");
                    // Unescape common JSON escapes
                    val = val.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\"/g, "\"").replace(/\\\\/g, "\\");
                    if (val !== "") out.push(val);
                }
                return out;
            } catch (e) { return []; }
        }


        function _ensureFolder(pathOrFolder) {
            // Returns a Folder (created if needed) or null.
            try {
                var f = (pathOrFolder instanceof Folder) ? pathOrFolder : new Folder(String(pathOrFolder));
                if (!f.exists) {
                    if (!f.create()) return null;
                }
                return f;
            } catch (e) {
                return null;
            }
        }

        function _showToast(msg, ms) {
            // Simple ScriptUI toast: small palette that auto-closes.
            // Appears only when we install an update successfully.
            try {
                ms = (ms == null) ? 2200 : Math.max(800, ms);
                try { if ($.global.__ShineToolsToastWin) $.global.__ShineToolsToastWin.close(); } catch (e0) {}

                var w = new Window('palette', '', undefined, {closeButton:false});
                $.global.__ShineToolsToastWin = w;
                w.orientation = 'column';
                w.alignChildren = ['fill','top'];
                w.margins = 14;
                var st = w.add('statictext', undefined, String(msg || ''), {multiline:true});
                st.maximumSize = [340, 100];
                try {
                    st.graphics.foregroundColor = st.graphics.newPen(st.graphics.PenType.SOLID_COLOR, [0.95,0.95,0.95,1], 1);
                } catch (e1) {}
                w.show();

                try {
                    app.scheduleTask("try{ if($.global.__ShineToolsToastWin) $.global.__ShineToolsToastWin.close(); }catch(e){}", ms, false);
                } catch (e2) {
                    // fallback
                    try { w.close(); } catch (e3) {}
                }
            } catch (e) {
                // Worst-case fallback: alert
                try { alert(String(msg || '')); } catch (e2) {}
            }
        }

        function _promptInstallDialog(latestVer, installedVer) {
            // Returns true if user clicks Install.
            try {
                var d = new Window('dialog', 'ShineTools Update');
                d.orientation = 'column';
                d.alignChildren = ['fill','top'];
                d.margins = 16;
                d.spacing = 10;

                d.add('statictext', undefined, 'A new update is available.', {multiline:true});
                d.add('statictext', undefined, 'Installed: v' + installedVer + '\nLatest: v' + latestVer, {multiline:true});

                var btnRow = d.add('group');
                btnRow.orientation = 'row';
                btnRow.alignChildren = ['right','center'];
                btnRow.alignment = ['fill','top'];
                btnRow.spacing = 10;

                var bCancel = btnRow.add('button', undefined, 'Cancel', {name:'cancel'});
                var bInstall = btnRow.add('button', undefined, 'Install', {name:'ok'});

                var want = false;
                bInstall.onClick = function(){ want = true; d.close(1); };
                bCancel.onClick  = function(){ want = false; d.close(0); };

                d.show();
                return want;
            } catch (e) {
                // fallback
                return confirm('A new update is available.\n\nInstall now?');
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
        // MM/DD/YYYY
        return _pad2(d.getMonth()+1) + "/" + _pad2(d.getDate()) + "/" + d.getFullYear();
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

        
        // ------------------------------------------------------------
        // Persistent changelog history (local, grows over time)
        //   Stores: Folder.userData/ShineTools/changelog_history.json
        //   Shape: { entries:[ {version:"1.0.8", date:"01/11/2026", notes:[...]} ] }
        // ------------------------------------------------------------
        
        // Persistent changelog cache (fallback) using app.settings (survives AE restarts)
        function _saveChangelogCache(str) {
            try {
                if (typeof app !== "undefined" && app.settings) {
                    app.settings.saveSetting("ShineTools", "changelog_cache", String(str || ""));
                }
            } catch (e) {}
        }
        function _loadChangelogCache() {
            try {
                if (typeof app !== "undefined" && app.settings) {
                    if (app.settings.haveSetting("ShineTools", "changelog_cache")) {
                        return app.settings.getSetting("ShineTools", "changelog_cache");
                    }
                }
            } catch (e) {}
            return "";
        }

function _getChangelogHistoryFile() {
            try {
                var root = Folder.userData.fsName + "/ShineTools";
                var dir = _ensureFolder(root);
                if (!dir) dir = _ensureFolder(Folder.temp.fsName + "/ShineTools");
                if (!dir) return null;
                return new File(dir.fsName + "/changelog_history.json");
            } catch (e) { return null; }
        }

        function _loadChangelogHistory() {
            var f = _getChangelogHistoryFile();
            if (!f) return { entries: [] };
            try {
                if (!f.exists) return { entries: [] };
                var raw = _readTextFile(f.fsName);
                if (!raw) return { entries: [] };
                var obj = null;
                try { obj = JSON.parse(raw); } catch (e1) { obj = null; }
                if (!obj || !obj.entries || !(obj.entries instanceof Array)) return { entries: [] };
                return obj;
            } catch (e) {
                return { entries: [] };
            }
        }

        function _saveChangelogHistory(obj) {
            try {
                var f = _getChangelogHistoryFile();
                if (!f) return false;
                var data = (obj && obj.entries) ? obj : { entries: [] };
                return _writeTextFile(f.fsName, JSON.stringify(data, null, 2));
            } catch (e) {
                return false;
            }
        }

        function _historyHasVersion(entries, ver) {
            try {
                if (!entries || !entries.length) return false;
                var v = String(ver || "").replace(/^v\s*/i,"");
                for (var i = 0; i < entries.length; i++) {
                    if (String(entries[i].version || "").replace(/^v\s*/i,"") === v) return true;
                }
            } catch (e) {}
            return false;
        }

        function _addToChangelogHistory(ver, notesArr) {
            try {
                var v = String(ver || "").replace(/^v\s*/i,"");
                if (!v) return false;

                var notes = notesArr || [];
                if (typeof notes === "string") notes = [notes];
                if (!(notes instanceof Array)) notes = [];

                var hist = _loadChangelogHistory();
                if (!hist || !hist.entries) hist = { entries: [] };

                if (_historyHasVersion(hist.entries, v)) return true;

                hist.entries.unshift({
                    version: v,
                    date: _formatStamp(new Date()),
                    notes: notes
                });

                return _saveChangelogHistory(hist);
            } catch (e) {
                return false;
            }
        }

        function _renderChangelogFromHistory() {
            try {
                var hist = _loadChangelogHistory();
                var entries = (hist && hist.entries) ? hist.entries : [];
                if (!entries || !entries.length) {
                    chBox.text = "—";
                    _saveChangelogCache(chBox.text);
                    return;
                }

                var out = "";
                for (var i = 0; i < entries.length; i++) {
                    var e = entries[i] || {};
                    var ver = String(e.version || "").replace(/^v\s*/i,"");
                    var dt  = String(e.date || "");
                    if (ver) {
                        out += "v" + ver + (dt ? (" — " + dt) : "") + "\n";
                    }
                    var n = e.notes || [];
                    if (typeof n === "string") n = [n];
                    if (n && n.length) {
                        for (var j = 0; j < n.length; j++) {
                            out += "• " + n[j] + "\n";
                        }
                    }
                    if (i < entries.length - 1) out += "\n";
                }
                chBox.text = out.replace(/\n$/, "");
                _saveChangelogCache(chBox.text);
            } catch (e) {}
        }

        // _INIT_RENDER_CHANGELOG_ON_LOAD
        // Populate changelog immediately on panel load (no need to click Check)
        try { _renderChangelogFromHistory(); } catch (eInitCH) {}
        try {
            if (String(chBox.text || "") === "—") {
                var _cached = _loadChangelogCache();
                if (_cached && _cached.length) chBox.text = _cached;
            }
        } catch (eInitCache) {}


        function _compareVersions(a, b) {
            // returns 1 if a>b, -1 if a<b, 0 if equal (numeric dotted versions)
            // Handles v1.2.3, 1.2, 1.2.0, 1.10 vs 1.2, etc.
            function norm(v){
                v = String(v||"").replace(/^v\s*/i,"");
                // Extract all numeric chunks (more robust than split("."), which can fail on "1.0-beta")
                var m = v.match(/\d+/g);
                var nums = [];
                if (m) {
                    for (var i=0;i<m.length;i++){
                        var n = parseInt(m[i], 10);
                        nums.push(isNaN(n)?0:n);
                    }
                }
                // Ensure at least 3 parts (major.minor.patch) for stable comparisons
                while (nums.length < 3) nums.push(0);
                return nums;
            }
            var A = norm(a), B = norm(b);
            for (var i=0;i<Math.max(A.length,B.length);i++){
                var x = (i < A.length) ? A[i] : 0;
                var y = (i < B.length) ? B[i] : 0;
                if (x > y) return 1;
                if (x < y) return -1;
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

            _setUpdatesStatus("Checking updates…");

            // IMPORTANT: GITHUB_VERSION_JSON_URL must ultimately point to a *file* direct link for version.json.
            // If it's a folder link, GitHub will return HTML if the URL isn't raw and JSON.parse will fail.
            var versionUrl = _normalizeUpdateUrl(GITHUB_VERSION_JSON_URL);
            var versionPath = cacheDir.fsName + "/version.json";

            var dl = _downloadWithRetries(versionUrl, versionPath, 3);
            if (!dl.ok) {
                _setUpdatesStatus("Update check failed: could not download version.json. " + (dl.msg ? ("(" + dl.msg + ")") : ""));
                return;
            }

            var raw = _readTextFile(versionPath);
            if (!raw) {
                _setUpdatesStatus("Downloaded version.json but couldn't read it.");
                return;
            }

            var data = null;

            // Harden parsing across different ExtendScript builds:
            // - strip UTF-8 BOM
            // - trim whitespace
            // - attempt JSON.parse when available
            // - fallback to regex extraction for the keys we need
            var clean = String(raw).replace(/^\uFEFF/, "").replace(/^\s+|\s+$/g, "");

            try {
                if (typeof JSON !== "undefined" && JSON && JSON.parse) {
                    data = JSON.parse(clean);
                }
            } catch (eJSON) {
                data = null;
            }

            // Minimal fallback if JSON.parse isn't available / fails
            if (!data) {
                data = {};
                data.latest = _extractJsonValue(clean, "latest") || _extractJsonValue(clean, "version");
                data.jsxUrl  = _extractJsonValue(clean, "jsxUrl");
                data.pkgUrl  = _extractJsonValue(clean, "pkgUrl");
                // notes/changelog optional; extract from JSON text when possible
                data.notes = _extractJsonStringArray(clean, "notes");
                if (!data.notes || !data.notes.length) data.notes = _extractJsonStringArray(clean, "changelog");
            }

            if (!data || !data.latest) {
                var prev = clean;
                if (prev.length > 140) prev = prev.substring(0, 140);
                _setUpdatesStatus("version.json could not be parsed or is missing 'latest'. Preview: " + prev);
                return;
            }

            var currentVer = _getCurrentVersionString();
            _setUpdatesVersion(String(data.latest));

            var notes = data.notes || data.changelog || [];
            if (typeof notes === "string") notes = [notes];
            // Changelog is persistent locally and grows over time.
            // When you CHECK FOR UPDATES, we also cache the latest version's notes into the local
            // history (deduped by version). This ensures the changelog box populates immediately
            // after a check, even before installing.
            try {
                if (notes && notes.length) {
                    _addToChangelogHistory(String(data.latest), notes);
                }
            } catch (eHistOnCheck) {}

            try { _renderChangelogFromHistory(); } catch(eCH) {}

// Fallback: if history couldn't be written/read for any reason, at least show the
// current remote notes immediately so the box never stays as "—".
try {
    var __tmp = String(chBox.text || "");
    if (__tmp === "—" || __tmp.replace(/\s+/g,"") === "") {
        var __dt = _formatStamp(new Date());
        var __out = "v" + String(data.latest).replace(/^v\s*/i,"") + " — " + __dt + "\n";
        if (notes && notes.length) {
            for (var __i = 0; __i < notes.length; __i++) __out += "• " + notes[__i] + "\n";
        }
        chBox.text = __out.replace(/\n$/, "");
        try { _saveChangelogCache(chBox.text); } catch (eSaveCH2) {}
    }
} catch (eFallback) {}

var cmp = _compareVersions(String(data.latest), String(currentVer));
            if (cmp <= 0) {
                // Checked and up-to-date
                __UPDATE_STATE.checked = true;
                __UPDATE_STATE.available = false;
                __UPDATE_STATE.latest = String(data.latest);
                __UPDATE_STATE.jsxUrl = null;
                __UPDATE_STATE.notes = notes;
                __UPDATE_STATE.pkgUrl = null;

                btnInstallUpdate.enabled = false;
                    try { btnInstallUpdate.visible = false; } catch (eV0) {}
                    
                    try { relayoutScoped(tabUpdates); } catch (eRL0) {}
                    _setFooterUpdateIndicator(true);
                _setUpdatesStatus("Up to date.");
                return;
            }

            // Update available (but do not install from CHECK)
            __UPDATE_STATE.checked = true;
            __UPDATE_STATE.available = true;
            __UPDATE_STATE.latest = String(data.latest);
            __UPDATE_STATE.jsxUrl = (data.jsxUrl || data.jsxURL || data.jsx || null);
            __UPDATE_STATE.pkgUrl = (data.pkgUrl || null);
            __UPDATE_STATE.notes = notes;

            btnInstallUpdate.enabled = true;
            try { btnInstallUpdate.visible = true; } catch (eV2) {}
try { relayoutScoped(tabUpdates); } catch (eRL1) {}
            _setFooterUpdateIndicator(false);
            _setUpdatesStatus("Update available.");
            return;
        }

        function _doInstallUpdate() {
            // Install the pending update (requires __UPDATE_STATE.available === true)
            try {
                if (!__UPDATE_STATE || !__UPDATE_STATE.available || !__UPDATE_STATE.latest) {
                    _setUpdatesStatus("No pending update to install. Run CHECK FOR UPDATES first.");
                    return;
                }

                var cacheRoot = Folder.userData.fsName + "/ShineTools";
                var cacheDir = _ensureFolder(cacheRoot);
                if (!cacheDir) cacheDir = _ensureFolder(Folder.temp.fsName + "/ShineTools");
                if (!cacheDir) {
                    _setUpdatesStatus("Could not create cache folder.");
                    return;
                }

                var latest = String(__UPDATE_STATE.latest);

                // Prefer JSX self-replace for now
                var jsxUrl = __UPDATE_STATE.jsxUrl;
                if (jsxUrl) {
                    var baseJsxUrl = _normalizeUpdateUrl(String(jsxUrl));
                    jsxUrl = _appendCacheBuster(baseJsxUrl);
                    var jsxName = "ShineTools_" + latest.replace(/[^\w\.\-]/g, "_") + ".jsx";
                    var jsxPath = cacheDir.fsName + "/" + jsxName;

                    _setUpdatesStatus("Downloading script update…");
                    var dlJsx = _curlDownload(jsxUrl, jsxPath);
                    if (!dlJsx.ok) {
                        _setUpdatesStatus("Failed to download updated .jsx." + (dlJsx.msg ? (" (" + dlJsx.msg + ")") : ""));
                        return;
                    }

                    var newRaw = _readTextFile(jsxPath);
                    if (!newRaw || _looksLikeHtml(newRaw)) {

                        // GitHub RAW can occasionally return HTML (rate-limit / cached edge / interstitial).
                        // We'll retry through alternate endpoints.
                        var lastPreview = _headPreview(newRaw, 180);

                        // Retry #1: jsDelivr GitHub CDN
                        try {
                            var alt1 = _toJsDelivrRaw(baseJsxUrl);
                            if (alt1) {
                                _setUpdatesStatus("Primary download returned HTML. Retrying via CDN…");
                                try { $.sleep(1200); } catch (_sl1) {}
                                alt1 = _appendCacheBuster(alt1);
                                var dlAlt1 = _curlDownload(alt1, jsxPath);
                                if (dlAlt1.ok) {
                                    newRaw = _readTextFile(jsxPath);
                                    if (!_looksLikeHtml(newRaw)) lastPreview = "";
                                    else lastPreview = _headPreview(newRaw, 180);
                                }
                            }
                        } catch (eAlt1) {}

                        // Retry #2: media.githubusercontent.com
                        if (!newRaw || _looksLikeHtml(newRaw)) {
                            try {
                                var alt2 = _toMediaGithubusercontent(baseJsxUrl);
                                if (alt2) {
                                    _setUpdatesStatus("Still getting HTML. Retrying via media endpoint…");
                                    try { $.sleep(1200); } catch (_sl2) {}
                                    alt2 = _appendCacheBuster(alt2);
                                    var dlAlt2 = _curlDownload(alt2, jsxPath);
                                    if (dlAlt2.ok) {
                                        newRaw = _readTextFile(jsxPath);
                                        if (!_looksLikeHtml(newRaw)) lastPreview = "";
                                        else lastPreview = _headPreview(newRaw, 180);
                                    }
                                }
                            } catch (eAlt2) {}
                        }

                        if (!newRaw || _looksLikeHtml(newRaw)) {
                            var pv = lastPreview ? (" Preview: " + lastPreview) : "";
                            _setUpdatesStatus("Downloaded file does not look like a .jsx (got HTML). Try again in a minute (GitHub can rate-limit scripted downloads)." + pv);
                            return;
                        }
                    }


// Validate downloaded script looks like ShineTools (signature check)
if (!newRaw || !_looksLikeShineToolsJsx(newRaw)) {
    var why = _classifyDownloadBody(newRaw);
    _setUpdatesStatus("Install failed: downloaded file does not look like ShineTools.jsx. " + (why.reason ? ("(" + why.reason + ")") : ""));
    return;
}

// Prevent reinstall loops (downloaded version matches installed)
var downloadedVer = _extractShineVersionFromJsx(newRaw);
var installedVer = "";
try { installedVer = String(SHINE_VERSION || ""); } catch(eIV){ installedVer=""; }
if (downloadedVer && installedVer && (downloadedVer === installedVer)) {
    _setUpdatesStatus("Downloaded version matches installed (" + installedVer + "). No install needed.");
    return;
}

                    // Determine this running script's path
                    var thisPath = null;
                    try { thisPath = $.fileName ? String($.fileName) : null; } catch (eFN) { thisPath = null; }
                    if (!thisPath) {
                        _setUpdatesStatus("Could not determine installed .jsx path for self-replace.");
                        return;
                    }

                    var thisFile = new File(thisPath);
                    var newFile = new File(jsxPath);

                    // Backup existing script
                    var d = new Date();
                    var stamp = d.getFullYear() + "-" + _pad2(d.getMonth()+1) + "-" + _pad2(d.getDate()) + "_" + _pad2(d.getHours()) + _pad2(d.getMinutes()) + _pad2(d.getSeconds());
                    var backupPath = thisFile.fsName + ".bak_" + stamp;
                    try { if (thisFile.exists) thisFile.copy(backupPath); } catch (eBK) {}
                    try { _pruneBackups(thisFile.parent.fsName, thisFile.name + ".bak_", 3); } catch(ePR) {}

                    // Overwrite installed file
                    try { if (thisFile.exists) thisFile.remove(); } catch (eRM) {}
                    var copied = false;
                    try { copied = newFile.copy(thisFile.fsName); } catch (eCP) { copied = false; }

                    if (!copied) {
                        _setUpdatesStatus("Downloaded v" + latest + " but couldn't replace the installed .jsx (permissions). Try installing from a user Scripts folder or run AE as admin.");
                        return;
                    }

                    // Mark as installed (still requires restart for the UI to show new version)
                    __UPDATE_STATE.available = false;
                    btnInstallUpdate.enabled = false;
                    try { btnInstallUpdate.visible = false; } catch (eV0) {}
                    
                    try { relayoutScoped(tabUpdates); } catch (eRL0) {}
                    _setFooterUpdateIndicator(true);
                                        // Persist changelog entry locally (only the version.json notes for this version)
                    try { _addToChangelogHistory(latest, __UPDATE_STATE.notes || []); } catch(eHist) {}
                    try { _renderChangelogFromHistory(); } catch(eHistR) {}

_setUpdatesStatus("Update successful, please restart After Effects.");
return;
                }

                // Optional PKG path (future)
                if (__UPDATE_STATE.pkgUrl) {
                    var pkgUrl = _normalizeUpdateUrl(String(__UPDATE_STATE.pkgUrl));
                    var pkgName = "ShineTools_" + latest.replace(/[^\w\.\-]/g,"_") + ".pkg";
                    var pkgPath = cacheDir.fsName + "/" + pkgName;

                    _setUpdatesStatus("Downloading installer…");
                    var dlPkg = _curlDownload(pkgUrl, pkgPath);
                    if (!dlPkg.ok) {
                        _setUpdatesStatus("Failed to download PKG." + (dlPkg.msg ? (" (" + dlPkg.msg + ")") : ""));
                        return;
                    }

                    _setUpdatesStatus("Installing (admin password required)…");
                    var res = _runPkgInstaller(pkgPath);
                    if (!res.ok) {
                        _setUpdatesStatus("Install canceled or failed." + (res.msg ? (" (" + res.msg + ")") : ""));
                        return;
                    }

                    __UPDATE_STATE.available = false;
                    btnInstallUpdate.enabled = false;
                    try { btnInstallUpdate.visible = false; } catch (eV0) {}
                    
                    try { relayoutScoped(tabUpdates); } catch (eRL0) {}
                    _setFooterUpdateIndicator(true);
                    _setUpdatesStatus("Update successful, please restart After Effects.");
return;
                }

                _setUpdatesStatus("Update is available, but no downloadable installer/script URL was provided in version.json.");
            } catch (e) {
                _setUpdatesStatus("Install failed: " + String(e));
            }
        }

        btnInstallUpdate.onClick = function () {
            try {
                if (!__UPDATE_STATE || !__UPDATE_STATE.checked) {
                    _setUpdatesStatus("Run CHECK FOR UPDATES first.");
                    return;
                }
                if (!__UPDATE_STATE.available) {
                    _setUpdatesStatus("Up to date.");
_setFooterUpdateIndicator(true);
                    return;
                }
                _doInstallUpdate();
            } catch (e) {
                _setUpdatesStatus("Install failed: " + String(e));
            }
        };
        btnCheckUpdates.onClick = function () {
            try { _doCheckForUpdates(); }
            catch (e) {
                _setUpdatesStatus("Update check failed: " + String(e));
            }
        };



        // -------------------------
        // REQUESTS TAB CONTENT
        // -------------------------
        var reqWrap = tabRequests.add("group");
        reqWrap.orientation   = "column";
        reqWrap.alignChildren = ["fill", "top"];
        reqWrap.alignment     = ["fill", "top"];
        reqWrap.margins       = [12, 10, 12, 10];
        reqWrap.spacing       = 10;

        var reqMeta = reqWrap.add("group");
        reqMeta.orientation   = "column";
        reqMeta.alignChildren = ["fill", "top"];
        reqMeta.margins       = 0;
        reqMeta.spacing       = 6;

        function _makeReqRow(label, value, isEditable) {
            var r = reqMeta.add("group");
            r.orientation = "row";
            r.alignChildren = ["left","center"];
            r.margins = 0;
            r.spacing = 8;

            var k = r.add("statictext", undefined, label);
            k.minimumSize = [120, 18];
            k.maximumSize = [120, 18];

            if (isEditable) {
                var et = r.add("edittext", undefined, value || "");
                et.alignment = ["fill","center"];
                try {
                    var f = et.graphics.font;
                    var bigger = ScriptUI.newFont(f.name, f.style, f.size + 2);
                    et.graphics.font = bigger;
                    et.font = bigger;
                } catch(eF) {}
                return { row:r, key:k, field:et };
             } else {
                // Pad a few pixels so statictext values align with edittext field text inset.
                var pad = r.add("statictext", undefined, " ");
                pad.minimumSize = [3, 18];
                pad.maximumSize = [3, 18];

                var st = r.add("statictext", undefined, value || "");
                st.alignment = ["fill","center"];
                return { row:r, key:k, field:st };
            }
        }

        var loginName = _getLoginName();

        var rowUser    = _makeReqRow("User:", loginName, false);
        var rowTypeGrp = reqMeta.add("group");
        rowTypeGrp.orientation = "row";
        rowTypeGrp.alignChildren = ["left","center"];
        rowTypeGrp.margins = 0;
        rowTypeGrp.spacing = 8;

        var rowTypeLbl = rowTypeGrp.add("statictext", undefined, "Type:");
        rowTypeLbl.minimumSize = [120, 18];
        rowTypeLbl.maximumSize = [120, 18];

        var ddType = rowTypeGrp.add("dropdownlist", undefined, ["Bug", "Feature Request"]);
        ddType.alignment = ["left","center"];
        ddType.selection = 0;

        var rowVersion = _makeReqRow("ShineTools:", ("v" + SHINE_VERSION), false);
        var rowName    = _makeReqRow("Name:", "", true);
        var msgLabelRow = reqWrap.add("group");
        msgLabelRow.orientation = "row";
        msgLabelRow.alignChildren = ["left","center"];
        msgLabelRow.margins = [12, 0, 0, 0]; // nudge right to align with field text
        var msgLabel = msgLabelRow.add("statictext", undefined, "Message:");
        msgLabel.justify = "left";

        var msgBox = reqWrap.add("edittext", undefined, "", {multiline:true});
        msgBox.alignment     = ["fill","top"];
        msgBox.minimumSize   = [10, 170];
        msgBox.preferredSize = [10, 170];
        try {
            var mf = msgBox.graphics.font;
            var biggerMsg = ScriptUI.newFont(mf.name, mf.style, mf.size + 2);
            msgBox.graphics.font = biggerMsg;
            msgBox.font = biggerMsg;
        } catch(eMF) {}

        var reqBtns = reqWrap.add("group");
        reqBtns.orientation = "row";
        reqBtns.alignChildren = ["left","center"];
        reqBtns.alignment = ["fill","top"];
        reqBtns.margins = 0;
        reqBtns.spacing = 12;

        var btnSaveReq = reqBtns.add("button", undefined, "SUBMIT");
        var reqSpacer  = reqBtns.add("group"); reqSpacer.alignment=["fill","fill"]; reqSpacer.minimumSize=[0,0]; reqSpacer.maximumSize=[10000,10000];

        var reqStatus = reqWrap.add("statictext", undefined, " ");
        reqStatus.justify = "left";

        function _buildRequestText() {
            var nm = "";
            try { nm = String(rowName.field.text || ""); } catch(eN) { nm = ""; }
            var typ = "";
            try { typ = ddType.selection ? String(ddType.selection.text) : "Bug"; } catch(eT) { typ = "Bug"; }
            var msg = "";
            try { msg = String(msgBox.text || ""); } catch(eM) { msg = ""; }

            var lines = [];
            lines.push("USER: " + loginName);
            lines.push("NAME: " + (nm ? nm : "(blank)"));
            lines.push("TYPE: " + typ);
            lines.push("SHINETOOLS: v" + SHINE_VERSION);
            lines.push("");
            lines.push("MESSAGE:");
            lines.push(msg ? msg : "(blank)");
            lines.push("");
            return lines.join("\n");
        }

        btnSaveReq.onClick = function() {
            try {
                var folder = null;
                try {
                    folder = Folder.selectDialog("Choose where to save your request (.txt)");
                } catch(eFD) { folder = null; }

                if (!folder) {
                    reqStatus.text = "Save canceled.";
                    return;
                }

                var nm = "";
                try { nm = String(rowName.field.text || ""); } catch(eN2) { nm = ""; }
                nm = nm.replace(/[\\\/\:\*\?\"\<\>\|]/g, "_"); // safe file chars

                var base = "ShineTools_Request_" + (nm ? nm + "_" : "") + _timestampForFilename() + ".txt";
                var outFile = new File(folder.fsName + "/" + base);

                outFile.encoding = "UTF-8";
                outFile.lineFeed = "Unix";
                if (!outFile.open("w")) {
                    reqStatus.text = "Could not write file.";
                    return;
                }
                outFile.write(_buildRequestText());
                outFile.close();

                reqStatus.text = "Saved: " + outFile.name;
                try { pal.update(); } catch(eU2) {}
            } catch(e) {
                reqStatus.text = "Save failed: " + String(e);
            }
        };



        // HELP TAB DUMMY CONTENT (placeholder)
        var helpWrap = tabHelp.add("group");
        helpWrap.orientation = "column";
        helpWrap.alignChildren = ["fill", "top"];
        helpWrap.margins = 0;
        helpWrap.spacing = 0;

        var helpText = "Welcome to Shine Tools v" + SHINE_VERSION + "!\n\nThere are two main tabs on the top, MAIN and TEXT.\n\nThe top bar of each section allows you to import files and text animation presets and store them in a list for easy one click access later. Click the + button to import a file which will import it into the project bin and timeline. It will also remain stored in the dropdown list. Just select any stored file in the list and it will immediately add it to the project. You can CMD+Click any saved file to delete it from the list.\n\nYou can expand / collapse each section by clicking on the name or the arrow.\n- SHIFT+Click will expand multiple sections\n- CMD+Click will collapse all sections.\n\nYou can re-order the sections by the hidden UP and DOWN arrows on the right side of the section.\n\nSome buttons have a yellow dot which indicates the button has multiple options by normal clicking or OPTION clicking. If you hover over the buttons a tool tip will tell you your options.";
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
                    var raw = _settingsGet(ORDER_SETTINGS_SECTION, orderSettingsKeyOrNull, "");
                    if (raw) {
                var arr = JSON.parse(raw);
                if (arr && arr.length) return arr;
            }
        } catch (e) {}
        return [];
    }
    function saveOrder(arr) {
        if (!orderSettingsKeyOrNull) return;
        _settingsSetJSON(ORDER_SETTINGS_SECTION, orderSettingsKeyOrNull, arr);
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
    function _buildAccordionUI() {
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

            _buildAccordionUI();
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

                var isCmdOrCtrl = !!(ks && ks.metaKey);
                var isShift     = !!(ks && ks.shiftKey);

                // Cmd + Click = Collapse All
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
        build: function() { _buildAccordionUI(); },
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
                    try { doImport = !!(ks && ks.metaKey); } catch (eDo) {}

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
                    // Cmd+click = add to list AND import into bin + active comp timeline.
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

                    // Cmd+click (modified selection) removes the item from the list.
                    if (item && item._path && _isCmdDown()) {
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

    // Final layout pass after show (helps ScriptUI settle bounds).
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