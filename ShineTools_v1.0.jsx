/*  ShineTools_v1.0.jsx  (Tabbed UI)
// BUILD: YellowLine merge + Dot removed | FIX PACK b (Animate Stroke hover + Option START Trim Paths) | 2026-01-17T17:51:19.217244Z
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
var SHINE_VERSION      = "1.1";
var SHINE_VERSION_TAG  = "v" + SHINE_VERSION;
var SHINE_TITLE_TEXT   = SHINE_PRODUCT_NAME + "_" + SHINE_VERSION_TAG;
var SHINETOOLS_VERSION = SHINE_VERSION_TAG;


// ============================================================
// PASS 1-2: ORGANIZE + CONSOLIDATE PERSISTENCE (NO BEHAVIOR CHANGES)
// ------------------------------------------------------------
// TABLE OF CONTENTS (high-level)
//   0) Globals / Debug
//   1) Settings + JSON helpers (app.settings + file fallback)
//   2) UI + Tabs
//   3) Accordion Factory (order persistence)
//   4) Tools (MAIN)
//   5) Tools (TEXT)
// ============================================================




// ============================================================
// PASS 6: DOCS + NAMING CLEANUP (COMMENT-ONLY)
//  - Normalize section headers and add short doc comments
//  - Remove a few duplicate divider lines / stale comments
//  - NO behavioral, layout, or persistence changes
// ============================================================

(function ShineTool(thisObj) {

    // ============================================================
    // PASS 14: DOCKED PANEL HANDOFF (LOADER -> MAIN)
    // ------------------------------------------------------------
    // When a ScriptUI Panels "loader" evalFile()s the shared main,
    // After Effects does NOT automatically pass the docked Panel
    // instance into the evaluated script. Without this, the main
    // script thinks it is running standalone and creates a floating
    // Window("palette"), leaving the docked panel blank.
    //
    // Fix:
    //  - Loader sets $.global.__ST_HOST_PANEL to the docked Panel.
    //  - Main picks it up here and uses it as thisObj.
    // ============================================================
    try {
        if ($.global.__ST_HOST_PANEL && ($.global.__ST_HOST_PANEL instanceof Panel)) {
            thisObj = $.global.__ST_HOST_PANEL;
        }
    } catch (eHost) {}
    try { $.global.__ST_HOST_PANEL = null; } catch (eClr) {}


    // ============================================================
    // PASS 13: AE 2025/2026 SHARED-MAIN BOOTSTRAP (LOADER MODEL)
    // ------------------------------------------------------------
    // Goal:
    //  - Allow one "loader" file to live in each AE version's ScriptUI Panels folder
    //  - Keep the real ShineTools code in a user-writable shared location
    //  - Updater writes ONLY to the shared location (avoids /Applications permissions)
    //
    // Behavior:
    //  - If this file is NOT the shared main file AND the shared main file exists,
    //    we eval the shared main and return early (so this file behaves as a loader).
    //  - If the shared main file doesn't exist yet, we run normally (self-contained),
    //    and the updater can create the shared main on first update.
    // ============================================================

    function _stGetSharedMainFile() {
        // System-wide shared location. Installer will place the main script here so all AE versions load the same code.
        // NOTE: Writing here generally requires admin during install, but ShineTools updates will also target this file.
        // If your environment blocks writes to /Library from AE, switch to Folder.userData instead.
        try {
            var basePath = "/Library/Application Support/ShineTools";
            var dir = new Folder(basePath);
            if (!dir.exists) {
                try { dir.create(); } catch (eMk) {}
            }
            return new File(dir.fsName + "/ShineTools_Main.jsx");
        } catch (e) {}
        return null;
    }

function _stLooksLikeShineToolsMain(raw) {
        // Lightweight signature check to prevent accidentally eval'ing HTML or random content.
        try {
            if (!raw) return false;
            var s = String(raw);
            if (s.indexOf("ShineTools") === -1) return false;
            if (s.indexOf("Tabbed UI") === -1 && s.indexOf("SHINE TOOLS") === -1) return false;
            return true;
        } catch (e) {}
        return false;
    }

    function _stMaybeLoadSharedMainAndExit() {
        try {
            var shared = _stGetSharedMainFile();
            if (!shared || !shared.exists) return false;

            // If we're already running FROM the shared main file, do nothing.
            var thisPath = null;
            try { thisPath = $.fileName ? String($.fileName) : null; } catch (eFN) { thisPath = null; }
            if (thisPath) {
                try {
                    var tf = new File(thisPath);
                    if (tf && tf.exists && shared.fsName && (String(shared.fsName) === String(tf.fsName))) return false;
                } catch (eCmp) {}
            }

            // Safety: read a small chunk to validate
            var ok = false;
            try {
                shared.encoding = "UTF-8";
                if (shared.open("r")) {
                    var head = shared.read(4000);
                    shared.close();
                    ok = _stLooksLikeShineToolsMain(head);
                }
            } catch (eR) { try { if (shared && shared.opened) shared.close(); } catch (eRC) {} }

            if (!ok) return false;

            // Pass through docked Panel host, if any, so the shared main builds into the docked UI.
            try { $.global.__ST_HOST_PANEL = (thisObj instanceof Panel) ? thisObj : null; } catch (eHP) {}

            try { $.evalFile(shared); } catch (eEval) {
                try { alert("ShineTools loader couldn't load shared main:\\n" + shared.fsName + "\\n\\n" + eEval.toString()); } catch (eA) {}
                return false;
            }
            return true; // loaded shared main, caller should return;
        } catch (e) {}
        return false;
    }

    // If a shared main exists, this file acts as a loader and exits.
    if (_stMaybeLoadSharedMainAndExit()) { return; }


    // ============================================================
    // 0a) Dropdown helpers (temporary display then revert to blank)
    // ============================================================
    function _ensureDDStore() {
        if (!$.global.__ShineToolsDDStore) $.global.__ShineToolsDDStore = {};
        return $.global.__ShineToolsDDStore;
    }


    // ============================================================
    // DEBUG FLAGS (set to true temporarily while troubleshooting)
    // ============================================================
    var ST_DEBUG_LISTS = false; // when true, logs list load/save source to the JavaScript Console
    function _dbgList(msg) {
        try { if (ST_DEBUG_LISTS) $.writeln("[ShineTools][LIST] " + msg); } catch (e) {}
    }



    // ============================================================
    // 0b) Lightweight helpers (safe, mac-only)
    // ============================================================
    // Namespace for debug toggles / shared state (kept global so a docked panel reload can reuse it).
    var ST = $.global.__ShineToolsNS || ($.global.__ShineToolsNS = { DEBUG: false });
    var SHINETOOLS_BUILD_STAMP = "2026-01-18 02:08 UTC";

    // ============================================================
    // PASS 12: DISTRIBUTION READINESS (ENV + BUILD INFO HANDLES)
    // ------------------------------------------------------------
    // Provide stable introspection helpers for packaging/support.
    // No functional changes to tools.
    // ============================================================
    ST.RELEASE_MODE = (ST.RELEASE_MODE !== false); // default true unless explicitly set to false
    ST.BuildInfo = ST.BuildInfo || {};
    try { ST.BuildInfo.version = (typeof SHINETOOLS_VERSION !== "undefined") ? String(SHINETOOLS_VERSION) : ""; } catch (e) {}
    try { ST.BuildInfo.build = (typeof SHINETOOLS_BUILD_STAMP !== "undefined") ? String(SHINETOOLS_BUILD_STAMP) : ""; } catch (e) {}

    ST.Env = ST.Env || {};
    ST.Env.getScriptFile = ST.Env.getScriptFile || function() {
        try { return File($.fileName); } catch (e) { return null; }
    };
    ST.Env.getPanelsFolder = ST.Env.getPanelsFolder || function() {
        try { return findScriptUIPanelsFolderByScript(); } catch (e) { return null; }
    };




    // ============================================================
    // PASS 9: HARDENING + DIAGNOSTICS (NO BEHAVIOR CHANGES)
    // ------------------------------------------------------------
    // Centralized logging helpers. Default is quiet unless ST.DEBUG
    // or the specific flag is enabled.
    // ============================================================
    ST.DEBUG = (ST.DEBUG === true); // normalize
    try { if (ST && ST.RELEASE_MODE !== false) { /* release mode */ ST.DEBUG = false; } } catch(eRM) {}

    ST.Log = ST.Log || {};
    ST.Log.flags = ST.Log.flags || {
        ui: false,
        updates: false,
        settings: false,
        tools: false,
        perf: false
    };

    ST.Log._write = ST.Log._write || function(tag, msg) {
        try { $.writeln("[ShineTools]" + (tag ? "[" + tag + "] " : " ") + String(msg)); } catch (e) {}
    };

    ST.Log.d = ST.Log.d || function(tag, msg) {
        try {
            if (ST.DEBUG || (ST.Log.flags && ST.Log.flags[tag] === true)) ST.Log._write(tag, msg);
        } catch (e) {}
    };

    ST.Log.e = ST.Log.e || function(tag, msg, err) {
        try {
            var out = String(msg || "Error");
            if (err) { try { out += " :: " + err.toString(); } catch (e2) {} }
            // store last error for quick diagnostics (no behavior impact)
            try { ST.LastError = { tag: String(tag || "ERR"), message: out, time: (new Date()).toString() }; } catch (eLE) {}
            ST.Log._write(tag || "ERR", out);
        } catch (e) {}
    };

    ST.Error = ST.Error || function(tag, msg, err, alsoAlert) {
        try {
            ST.Log.e(tag, msg, err);
            if (alsoAlert === true) {
                try { alert(String(msg || "Error") + (err ? ("\n\n" + err.toString()) : "")); } catch (eA) {}
            }
        } catch (e) {}
    };



    // UI namespace (Pass 4.7): isolate core UI builders without behavior changes
    ST.UI = ST.UI || {};

    // ============================================================
    // PASS 7: FEATURE BOUNDARIES (NO BEHAVIOR CHANGES)
    //  - Expose stable module-style APIs on the global ST namespace
    //  - Keep legacy function names in place (buttons/handlers unchanged)
    // ============================================================
    ST.Settings    = ST.Settings    || {};
    ST.Persistence = ST.Persistence || {};
    ST.Core        = ST.Core        || {};

    // Settings (best-effort app.settings + file fallback)
    ST.Settings.get = ST.Settings.get || function(section, key, defaultValue) { return _settingsGet(section, key, defaultValue); };
    ST.Settings.set = ST.Settings.set || function(section, key, value) { return _settingsSet(section, key, value); };

    // Persistence helpers (ExtendScript-safe JSON + file settings)
    ST.Persistence.jsonParse      = ST.Persistence.jsonParse      || function(raw) { return _stJsonParse(raw); };
    ST.Persistence.jsonStringify  = ST.Persistence.jsonStringify  || function(val) { return _stJsonStringify(val); };
    ST.Persistence.settingsPath   = ST.Persistence.settingsPath   || function() { return _stSettingsFilePath(); };
    ST.Persistence.loadFileSettings = ST.Persistence.loadFileSettings || function() { return _stLoadFileSettings(); };
    ST.Persistence.saveFileSettings = ST.Persistence.saveFileSettings || function(obj) { return _stSaveFileSettings(obj); };

    // Core input helpers (macOS modifiers)
    ST.Core.isCmdDown  = ST.Core.isCmdDown  || function() { return _isCmdDown(); };
    ST.Core.isOptDown  = ST.Core.isOptDown  || function() { return _isOptDown(); };
    ST.Core.isShiftDown = ST.Core.isShiftDown || function() { return isShiftDown(); };



    

    // ============================================================
    // PASS 7.1: UI API SURFACE + LAYOUT UTILITIES (NO BEHAVIOR CHANGES)
    // ------------------------------------------------------------
    // Standardize UI helpers under ST.UI so future tweaks don't have to
    // spelunk for local function names.
    // ============================================================
    try {
        ST.UI = ST.UI || {};

        // Layout / relayout utilities
        ST.UI.relayoutScoped     = ST.UI.relayoutScoped     || function(scopeGroup){ return relayoutScoped(scopeGroup); };
        ST.UI.requestRelayout    = ST.UI.requestRelayout    || function(scopeGroup, delayMs){ return requestRelayoutSoon(scopeGroup, delayMs); };
        ST.UI.requestFullRelayout = ST.UI.requestFullRelayout || function(){ return requestFullRelayoutSoon(); };

        // Resize helpers
        ST.UI.clampAllDropdowns  = ST.UI.clampAllDropdowns  || function(){ return _clampAllDropdowns(); };

        // UI builders (aliases)
        ST.UI.buildTopTabHeader  = ST.UI.buildTopTabHeader  || function(palRef){ return _buildTopTabHeader(palRef); };
        ST.UI.buildTabStack      = ST.UI.buildTabStack      || function(palRef){ return _buildTabStack(palRef); };

        // Dialogs (already extracted)
        ST.UI.showReorderButtonsDialog = ST.UI.showReorderButtonsDialog || function(title, aKey, reg){
            return _showReorderButtonsDialog(title, aKey, reg);
        };
    } catch (e) {}



    // ============================================================
    // PASS 7.2: TOOLS API SURFACE (NO BEHAVIOR CHANGES)
    // ============================================================
    // PASS 8: USER POLISH (TOOLTIPS + MINOR UX CONSISTENCY)
    //  - Add helpful tooltips to key UPDATES controls
    //  - No behavior/layout changes
    // ============================================================

    // ------------------------------------------------------------
    // Expose commonly-used tool entry points in a stable namespace.
    // This does NOT change button wiring; it only provides clean handles
    // for future features / hotkeys / external triggers.
    // ============================================================
    try {
        ST.Tools      = ST.Tools      || {};
        ST.Tools.Main = ST.Tools.Main || {};
        ST.Tools.Text = ST.Tools.Text || {};

        // MAIN tab tools
        if (typeof uniqueCompDeepFromSelectedLayer === "function")
            ST.Tools.Main.uniqueComp = ST.Tools.Main.uniqueComp || uniqueCompDeepFromSelectedLayer;

        if (typeof copyUniqueCompDeepToPrecompsFromSelectedLayer === "function")
            ST.Tools.Main.copyUniqueCompToPrecomps = ST.Tools.Main.copyUniqueCompToPrecomps || copyUniqueCompDeepToPrecompsFromSelectedLayer;

        // TEXT BOX module bootstrap (creates $.global.ShineTools.TextBox)
        if (typeof initTextBoxModule === "function")
            ST.Tools.Text.initTextBoxModule = ST.Tools.Text.initTextBoxModule || initTextBoxModule;

        // If the TextBox module is already present, alias it for convenience
        try {
            if ($.global.ShineTools && $.global.ShineTools.TextBox) {
                ST.Tools.Text.TextBox = ST.Tools.Text.TextBox || $.global.ShineTools.TextBox;
            }
        } catch (eTB) {}

    } catch (e) {}

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
    // Settings persistence
    //  - Primary: app.settings (AE prefs)
    //  - Fallback: JSON file in userData (survives prefs oddities / permissions)
    // ------------------------------------------------------------
    function _stSettingsFilePath() {
        // Prefer a user-writable sidecar location (same idea as your section-order fix).
        // Primary: ~/Documents/ShineTools/ShineTools_settings.json
        // Fallback: Folder.userData/ShineTools/ShineTools_settings.json
        try {
            var f = null;
            // 1) Documents/ShineTools
            try {
                var docs = Folder.myDocuments;
                if (docs) {
                    var dir1 = Folder(docs.fsName + "/ShineTools");
                    if (!dir1.exists) { try { dir1.create(); } catch (eC1) {} }
                    f = File(dir1.fsName + "/ShineTools_settings.json");
                    // Quick write test (create if missing)
                    if (f) {
                        try {
                            if (!f.exists) { f.encoding = "UTF-8"; f.open("w"); f.write("{}"); f.close(); }
                            return f;
                        } catch (eT1) {
                            try { if (f && f.opened) f.close(); } catch (eTC1) {}
                        }
                    }
                }
            } catch (e1) {}

            // 2) userData fallback
            try {
                var base = Folder.userData;
                if (!base) return null;
                var dir2 = Folder(base.fsName + "/ShineTools");
                if (!dir2.exists) { try { dir2.create(); } catch (eC2) {} }
                return File(dir2.fsName + "/ShineTools_settings.json");
            } catch (e2) {}
        } catch (e) {}
        return null;
    }

    // Minimal JSON helpers for ExtendScript environments where JSON may be missing.
    function _stJsonEscape(s) {
        s = String(s);
        s = s.replace(/\\/g, "\\\\");
        s = s.replace(/\"/g, "\\\"");
        s = s.replace(/\r/g, "\\r");
        s = s.replace(/\n/g, "\\n");
        s = s.replace(/\t/g, "\\t");
        return s;
    }

    function _stJsonStringify(val) {
        try {
            if (typeof JSON !== 'undefined' && JSON && JSON.stringify) return JSON.stringify(val);
        } catch (e0) {}

        // Fallback: supports objects/arrays/strings/numbers/booleans/null.
        if (val === null || val === undefined) return "null";
        var t = typeof val;
        if (t === "string") return '"' + _stJsonEscape(val) + '"';
        if (t === "number") return isFinite(val) ? String(val) : "null";
        if (t === "boolean") return val ? "true" : "false";

        // Array
        try {
            if (val && val.length !== undefined && val.constructor === Array) {
                var partsA = [];
                for (var i = 0; i < val.length; i++) partsA.push(_stJsonStringify(val[i]));
                return "[" + partsA.join(",") + "]";
            }
        } catch (eA) {}

        // Object
        var partsO = [];
        for (var k in val) {
            if (!val.hasOwnProperty(k)) continue;
            partsO.push('"' + _stJsonEscape(k) + '":' + _stJsonStringify(val[k]));
        }
        return "{" + partsO.join(",") + "}";
    }

    function _stJsonParse(raw) {
        if (!raw) return {};
        try {
            if (typeof JSON !== 'undefined' && JSON && JSON.parse) return JSON.parse(raw);
        } catch (e0) {}
        try {
            // JSON is valid JS; wrapping in parentheses helps eval return objects.
            return eval('(' + raw + ')');
        } catch (e1) {}
        return {};
    }

    function _stLoadFileSettings() {
        try {
            if ($.global.__ShineToolsFileSettings) return $.global.__ShineToolsFileSettings;
            var f = _stSettingsFilePath();
            var obj = {};
            if (f && f.exists) {
                try {
                    f.encoding = "UTF-8";
                    f.open("r");
                    var raw = f.read();
                    f.close();
                    if (raw) obj = _stJsonParse(raw);
                } catch (eR) {
                    try { if (f && f.opened) f.close(); } catch (eC) {}
                    try { if (ST && ST.Log) ST.Log.e("settings", "Failed to read settings file", eR); } catch(eLg) {}
                    obj = {};
                }
            }
            $.global.__ShineToolsFileSettings = obj;
            return obj;
        } catch (e2) {}
        $.global.__ShineToolsFileSettings = {};
        return $.global.__ShineToolsFileSettings;
    }

    function _stSaveFileSettings(obj) {
        var f = null;
        try {
            if (!obj) obj = {};
            f = _stSettingsFilePath();
            if (!f) return false;
            f.encoding = "UTF-8";
            if (!f.open("w")) return false;
            var payload = _stJsonStringify(obj);
            if (payload === undefined || payload === null) payload = "{}";
            f.write(String(payload));
            f.close();
            // Keep the in-memory cache in sync.
            try { $.global.__ShineToolsFileSettings = obj; } catch (eC0) {}
            return true;
        } catch (e) {
            try { if (f && f.opened) f.close(); } catch (e2) {}
            try { if (ST && ST.Log) ST.Log.e("settings", "Failed to write settings file", e); } catch(eLg2) {}
            return false;
        }
    }

    function _settingsGetRawApp(section, key) {
        try {
            var vApp = _appGetSetting(section, key, null);
            if (vApp !== null && vApp !== undefined) { return vApp; }
        } catch (e) {}
        return null;
    }

    function _settingsGetRawFile(section, key) {
        try {
            var fs = _stLoadFileSettings();
            if (fs && fs[section] && fs[section].hasOwnProperty(key)) {
                return fs[section][key];
            }
        } catch (e2) {}
        return null;
    }

    // Best-effort getter that prefers the "better" value when app.settings truncates.
    // If both exist and are strings, prefer the longer one; otherwise prefer app.settings first.
    function _settingsGetBest(section, key, defaultValue) {
        var vApp = _settingsGetRawApp(section, key);
        var vFile = _settingsGetRawFile(section, key);

        if (vApp !== null && vApp !== undefined && vApp !== "") {
            // If file exists too and seems more complete, prefer it.
            if (vFile !== null && vFile !== undefined && vFile !== "") {
                try {
                    if (typeof vApp === "string" && typeof vFile === "string") {
                        if (vFile.length > vApp.length) return vFile;
                    }
                } catch (eL) {}
            }
            return vApp;
        }

        if (vFile !== null && vFile !== undefined && vFile !== "") return vFile;
        return (defaultValue !== undefined) ? defaultValue : "";
    }

    
// --- app.settings wrappers (centralized try/catch) ---
function _appHaveSetting(section, key) {
    try { return app.settings.haveSetting(section, key); } catch (e) { return false; }
}
function _appGetSetting(section, key, defaultValue) {
    try {
        if (app.settings.haveSetting(section, key)) return app.settings.getSetting(section, key);
    } catch (e) {}
    return defaultValue;
}
function _appSaveSetting(section, key, value) {
    try { app.settings.saveSetting(section, key, String(value)); return true; } catch (e) { return false; }
}

function _settingsGet(section, key, defaultValue) {
        return _settingsGetBest(section, key, defaultValue);
    }

    function _settingsSet(section, key, value) {
        var ok = false;

        // 1) app.settings
        try {
            _appSaveSetting(section, key, value);
            ok = true;
        } catch (e) {}

        // 2) file fallback
        try {
            var fs = _stLoadFileSettings();
            if (!fs[section]) fs[section] = {};
            fs[section][key] = String(value);
            _stSaveFileSettings(fs);
            ok = true;
        } catch (e2) {}

        return ok;
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




    function _isCmdDown() {
        // macOS-only: Command key.
        try {
            var ks = ScriptUI.environment.keyboardState;
            return (ks && ks.metaKey) ? true : false;
        } catch (e) {}
        return false;
    }


    function _isOptDown() {
        // macOS Option key is reported as Alt in ScriptUI.
        try {
            var ks = ScriptUI.environment.keyboardState;
            return (ks && ks.altKey) ? true : false;
        } catch (e) {}
        return false;
    }



    
    // Safe runner with centralized error logging (no alerts unless requested)
    
    // Compose a short debug snapshot string (for support / troubleshooting)
    function _stGetDebugInfoString() {
        var lines = [];
        try { lines.push("ShineTools Debug Info"); } catch (e) {}
        try { lines.push("Version: " + ((typeof SHINETOOLS_VERSION !== "undefined") ? SHINETOOLS_VERSION : "(unknown)")); } catch (e) {}
        try { lines.push("Build: " + ((typeof SHINETOOLS_BUILD_STAMP !== "undefined") ? SHINETOOLS_BUILD_STAMP : "(unknown)")); } catch (e) {}
        try { lines.push("Date: " + (new Date()).toString()); } catch (e) {}
try { lines.push("AE: " + app.version + " (" + app.buildNumber + ")"); } catch (e) {}
        try { lines.push("OS: " + $.os); } catch (e) {}
        try { lines.push("Settings file: " + _stSettingsFilePath()); } catch (e) {}
        try {
            if (ST && ST.LastError) {
                lines.push("LastError: [" + ST.LastError.tag + "] " + ST.LastError.message);
                lines.push("LastErrorTime: " + ST.LastError.time);
            } else {
                lines.push("LastError: (none)");
            }
        } catch (e) {}
        return lines.join("\n");
    }

    // Best-effort copy to clipboard (ExtendScript supports this in many hosts)
    function _stCopyToClipboardBestEffort(str) {
        try { if (app && app.setClipboard) { app.setClipboard(String(str)); return true; } } catch (e) {}
        try { if ($.setenv) { $.setenv("SHINETOOLS_CLIPBOARD", String(str)); } } catch (e2) {}
        return false;
    }

function _safeRun(tag, name, fn, alsoAlert) {
        try {
            if (!fn || typeof fn !== "function") return null;
            return fn();
        } catch (e) {
            try { if (ST && ST.Error) ST.Error(tag, name, e, alsoAlert === true); } catch (e2) {}
            return null;
        }
    }

function _withUndoGroup(name, fn) {
        // Safe Undo wrapper: guarantees endUndoGroup even if fn throws.
        if (!fn || typeof fn !== "function") return;
        try { app.beginUndoGroup(String(name || "ShineTools")); } catch (eBegin) {}
        try { fn(); } catch (eRun) { throw eRun; } finally { try { app.endUndoGroup(); } catch (eEnd) {} }
    }



    // ============================================================
    // 0) Locate ScriptUI Panels folder + logo
    // ============================================================
    var SCRIPT_FILENAME = "ShineTools_v1.0.jsx";
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


            // Escape single quotes for scheduleTask string
            var safe = String(presetPath || "").replace(/'/g, "\\'");
            var taskStr = "$.global._shineToolsApplyFFXPreset('" + safe + "');";
            dd.__shineApplyTaskId = app.scheduleTask(taskStr, ms, false);

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
        // PASS 14: Prefer system-wide shared install path first
        //   /Library/Application Support/ShineTools/logo
        try {
            var sharedLogo = tryIconsFolder("/Library/Application Support/ShineTools/logo");
            if (sharedLogo) { __ST_CACHE.logoFile = sharedLogo; return __ST_CACHE.logoFile; }
        } catch (eSharedLogo) {}


        // 1) Relative to the running script (most reliable)
        try {
            var sf = new File($.fileName);
            if (sf && sf.exists) {
                var parent = sf.parent; // folder containing the running jsx
                // <parent>/icons
                var f1 = tryIconsFolder(parent.fsName + "/icons");
                if (f1) { __ST_CACHE.logoFile = f1; return __ST_CACHE.logoFile; }

                // <parent>/ShineTools/icons  (common when ShineTools.jsx sits in ScriptUI Panels root)
                var f2 = tryIconsFolder(parent.fsName + "/ShineTools/logo");
                if (f2) { __ST_CACHE.logoFile = f2; return __ST_CACHE.logoFile; }

                // if script itself is inside .../ShineTools/, also try sibling icons
                var f3 = tryIconsFolder(parent.parent ? (parent.parent.fsName + "/logo") : "");
                if (f3) { __ST_CACHE.logoFile = f3; return __ST_CACHE.logoFile; }
            }
        } catch (e0) {}

        // 2) Derived ScriptUI Panels folder
        try {
            var panelsFolder = findScriptUIPanelsFolderByScript();
            if (panelsFolder) {
                // New expected layout: ScriptUI Panels/ShineTools/icons/
                var f4 = tryIconsFolder(panelsFolder.fsName + "/ShineTools/logo");
                if (f4) { __ST_CACHE.logoFile = f4; return __ST_CACHE.logoFile; }

                // Legacy layout fallback
                var f5 = tryIconsFolder(panelsFolder.fsName + "/ShineTools_logo");
                if (f5) { __ST_CACHE.logoFile = f5; return __ST_CACHE.logoFile; }
            }
        } catch (e1) {}

        // 3) Hard fallback: known macOS install path
        try {
            var hard1 = tryIconsFolder("/Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels/ShineTools/logo");
            if (hard1) { __ST_CACHE.logoFile = hard1; return __ST_CACHE.logoFile; }

            var hard2 = tryIconsFolder("/Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels/ShineTools_logo");
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

    var _stLastComp = null;
    function getComp() {
        var a = app.project && app.project.activeItem;
        if (a && a instanceof CompItem) { _stLastComp = a; return a; }

        // Viewer fallback: when focus is in Project panel, activeItem may not be the comp,
        // but the comp can still be the active viewer source.
        try {
            if (app.activeViewer && app.activeViewer.type === ViewerType.VIEWER_COMPOSITION) {
                var src = app.activeViewer.source;
                if (src && (src instanceof CompItem)) {
                    _stLastComp = src;
                    return src;
                }
            }
        } catch (eV) {}

        return _stLastComp;
    }

    function requireComp() {
        var c = getComp();
        if (!c) warn("Please select an active composition.");
        return c;
    }

    function isSolidFootageItem(it) {
        try { return (it && (it instanceof FootageItem) && it.mainSource && (it.mainSource instanceof SolidSource)); } catch (e) { return false; }
    }

    // ============================================================
    // UNIQUE COMP (Deep duplicate selected precomp layer + nested precomps)
    // - Leaves original layer untouched
    // - Duplicates the selected precomp layer (layer.duplicate) and swaps source to a deep-duplicated comp tree
    // ============================================================
    function uniqueCompDeepFromSelectedLayer() {
        if (!app.project) { alert("No project is open."); return; }

        var comp = getComp();
        if (!comp) { alert("Make a comp active and select a precomp layer."); return; }

        var sel = comp.selectedLayers;
        if (!sel || sel.length !== 1) {
            alert("Please select exactly one precomp layer in the active comp timeline.");
            return;
        }

        var lyr = sel[0];
        if (!(lyr instanceof AVLayer) || !lyr.source || !(lyr.source instanceof CompItem)) {
            alert("Selected layer is not a precomp layer. Please select a precomp layer (AVLayer with a Comp source).");
            return;
        }

        var srcComp = lyr.source;

        // Prompt for a base name for the unique duplicate
        var userBaseName = prompt("Name the new comp:", String(srcComp.name || "Comp") + "_");
        if (userBaseName === null) { return; }
        userBaseName = String(userBaseName || "");
        if (!userBaseName) { userBaseName = String(srcComp.name || "Comp") + "_"; }

        function _compNameExists(folder, name) {
            try {
                for (var i = 1; i <= app.project.numItems; i++) {
                    var it = app.project.item(i);
                    if (it && (it instanceof CompItem) && it.name === name) {
                        try {
                            if ((folder && it.parentFolder && it.parentFolder.id === folder.id) || (!folder && !it.parentFolder)) return true;
                        } catch (e1) { return true; }
                    }
                }
            } catch (e) {}
            return false;
        }

        function _uniqueCompName(folder, base) {
            var baseName = String(base || "Comp");
            var candidate = baseName;
            var n = 2;
            while (_compNameExists(folder, candidate) && n < 500) {
                candidate = baseName + "_" + n;
                n++;
            }
            return candidate;
        }

        app.beginUndoGroup("ShineTools - UNIQUE COMP");

        try {
            var dupMap = {};

            function dupCompRecursive(c) {
                if (!c) return null;

                var key = String(c.id);
                if (dupMap[key]) return dupMap[key];

                var newComp = null;
                try { newComp = c.duplicate(); } catch (eDup) { newComp = null; }
                if (!newComp) return null;

                dupMap[key] = newComp;

                // Keep in same folder and give a unique-ish name
                try { if (c.parentFolder) newComp.parentFolder = c.parentFolder; } catch (ePF) {}
                try { newComp.name = _uniqueCompName(c.parentFolder, (c === srcComp ? userBaseName : (String(c.name || "Comp") + "_"))); } catch (eNm) {}

                // Relink nested precomps inside the duplicated comp
                try {
                    for (var i = 1; i <= newComp.numLayers; i++) {
                        var childL = newComp.layer(i);
                        if (!childL || !childL.source || !(childL.source instanceof CompItem)) continue;

                        var origChild = childL.source;
                        var newChild  = dupCompRecursive(origChild);
                        if (newChild) {
                            try { childL.replaceSource(newChild, false); } catch (eReplace) {}
                        }
                    }
                } catch (eLoop) {}

                return newComp;
            }

            var uniqueComp = dupCompRecursive(srcComp);
            if (!uniqueComp) { alert("Could not deep-duplicate the selected comp."); return; }

            // Duplicate the layer (preserves transforms, keys, effects, masks, matte relationships, etc.)
            var newLayer = null;
            try { newLayer = lyr.duplicate(); } catch (eLD) { newLayer = null; }
            if (!newLayer) { alert("Could not duplicate the selected layer."); return; }

            // Put the unique one above the original
            try { newLayer.moveBefore(lyr); } catch (eMv) {}

            // Swap its source to the new unique comp
            try { newLayer.replaceSource(uniqueComp, false); } catch (eRS) {}

            // Friendly rename
            try { newLayer.name = String(userBaseName || (lyr.name || "Precomp") + "_"); } catch (eLN) {}

        } catch (e) {
            alert("UNIQUE COMP error:\n" + e.toString());
        } finally {
            app.endUndoGroup();
        }
    }


    // ============================================================
    // COPY UNIQUE COMP (Deep duplicate selected precomp layer + nested precomps)
    // - Leaves original layer untouched
    // - Duplicates the selected precomp layer and swaps source to a deep-duplicated comp tree
    // - Applies an automatic prefix and moves ALL duplicated comps into the PRECOMPS folder
    // ============================================================
    function copyUniqueCompDeepToPrecompsFromSelectedLayer() {
        if (!app.project) { alert("No project is open."); return; }

        var comp = getComp();
        if (!comp) { alert("Make a comp active and select a precomp layer."); return; }

        var sel = comp.selectedLayers;
        if (!sel || sel.length !== 1) {
            alert("Please select exactly one precomp layer in the active comp timeline.");
            return;
        }

        var lyr = sel[0];
        if (!(lyr instanceof AVLayer) || !lyr.source || !(lyr.source instanceof CompItem)) {
            alert("Selected layer is not a precomp layer. Please select a precomp layer (AVLayer with a Comp source).");
            return;
        }

        var srcComp = lyr.source;

        // Prompt for a suffix (default: "_2")
        // Example: "LowerThird" -> "LowerThird_2" or "LowerThird_ALT"
        var suffix = prompt("Add a suffix for the copied comps:", "_2");
        if (suffix === null) { return; }
        suffix = String(suffix || "");
        // If user entered nothing, fall back to _2 to keep behavior predictable.
        if (!suffix) suffix = "_2";

        function _findOrCreateRootFolder(folderName) {
            try {
                // Find existing root-level folder first
                for (var i = 1; i <= app.project.numItems; i++) {
                    var it = app.project.item(i);
                    if (it && (it instanceof FolderItem) && String(it.name) === String(folderName)) {
                        // Ensure it's root-level (or treat any match as acceptable)
                        return it;
                    }
                }
            } catch (e) {}
            try {
                var f = app.project.items.addFolder(String(folderName));
                return f;
            } catch (e2) {}
            return null;
        }

        function _compNameExistsInFolder(folder, name) {
            try {
                for (var i = 1; i <= app.project.numItems; i++) {
                    var it = app.project.item(i);
                    if (it && (it instanceof CompItem) && it.name === name) {
                        try {
                            if (folder && it.parentFolder && it.parentFolder.id === folder.id) return true;
                        } catch (e1) { return true; }
                    }
                }
            } catch (e) {}
            return false;
        }

        function _uniqueCompNameInFolder(folder, base) {
            var baseName = String(base || "Comp");
            var candidate = baseName;
            var n = 2;
            while (_compNameExistsInFolder(folder, candidate) && n < 500) {
                candidate = baseName + "_" + n;
                n++;
            }
            return candidate;
        }

        app.beginUndoGroup("ShineTools - COPY UNIQUE COMP");

        try {
            var precompsFolder = _findOrCreateRootFolder("PRECOMPS");
            if (!precompsFolder) { alert("Could not create/find PRECOMPS folder in the Project panel."); return; }

            var dupMap = {};

            function dupCompRecursiveToPrecomps(c) {
                if (!c) return null;

                var key = String(c.id);
                if (dupMap[key]) return dupMap[key];

                var newComp = null;
                try { newComp = c.duplicate(); } catch (eDup) { newComp = null; }
                if (!newComp) return null;

                dupMap[key] = newComp;

                // Force ALL duplicates into PRECOMPS
                try { newComp.parentFolder = precompsFolder; } catch (ePF) {}

                // Name with suffix
                try {
                    var baseName = String(c.name || "Comp") + suffix;
                    newComp.name = _uniqueCompNameInFolder(precompsFolder, baseName);
                } catch (eNm) {}

                // Relink nested precomps inside the duplicated comp
                try {
                    for (var i = 1; i <= newComp.numLayers; i++) {
                        var childL = newComp.layer(i);
                        if (!childL || !childL.source || !(childL.source instanceof CompItem)) continue;

                        var origChild = childL.source;
                        var newChild  = dupCompRecursiveToPrecomps(origChild);
                        if (newChild) {
                            try { childL.replaceSource(newChild, false); } catch (eReplace) {}
                        }
                    }
                } catch (eLoop) {}

                return newComp;
            }

            var newRootComp = dupCompRecursiveToPrecomps(srcComp);
            if (!newRootComp) { alert("Could not deep-duplicate the selected comp."); return; }

            // Duplicate the layer (preserves transforms, keys, effects, masks, mattes, etc.)
            var newLayer = null;
            try { newLayer = lyr.duplicate(); } catch (eLD) { newLayer = null; }
            if (!newLayer) { alert("Could not duplicate the selected layer."); return; }

            // Put the copy above the original
            try { newLayer.moveBefore(lyr); } catch (eMv) {}

            // Swap its source to the new copied comp tree
            try { newLayer.replaceSource(newRootComp, false); } catch (eRS) {}

            // Rename the layer to match the new comp (optional, keeps timelines tidy)
            try { newLayer.name = String(newRootComp.name || (String(lyr.name || "Precomp") + suffix)); } catch (eLN) {}

        } catch (e) {
            alert("COPY UNIQUE COMP error:\n" + e.toString());
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

    function isShiftDown() {
        try {
            var ks = ScriptUI.environment.keyboardState;
            return (ks && ks.shiftKey) ? true : false;
        } catch (e) { return false; }
    }


    // ============================================================
    // 2.5) TEXT BOX module (integrated from ShineTools_TEXT_BOX_v2.36_panel_fix.jsx)
    // ============================================================
    // Safe name setter used across utilities (kept at top-level scope)
    function safeSetName(obj, nm) {
        try {
            if (!obj || nm === undefined || nm === null) return;
            obj.name = String(nm);
        } catch (e) {}
    }


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
    var DEFAULT_ANIMATE_ON = 0;
    var ANIMATE_FRAMES = 30;

    // Watch cadence
    var WATCH_INTERVAL_MS = 200;

    // Pause watcher while user is editing/has text selected
    var EDIT_PAUSE_MS = 5000;

    // ===== Small helpers =====
    function isComp(item){ return (item && (item instanceof CompItem)); }

    function isTextLayer(lyr) {
        if (!lyr) return false;
        try { return !!lyr.property("ADBE Text Properties").property("ADBE Text Document"); } catch (e) { return false; }
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
        // Renames the TEXT layer based on the first 3 words of its text.
        // IMPORTANT: Comp renaming intentionally disabled (was renaming parent/child comps to 'enter text').
        try {
            if (!textLayer || !isTextLayer(textLayer) || !isComp(owningComp)) return;

            var raw = getTextStringSafe(textLayer);
            var nm = desiredNameFromText(raw);

            // Keep: text layer rename (optional quality-of-life)
            safeSetName(textLayer, nm);

            // Removed: safeSetName(owningComp, nm);
        } catch (e) {}
    }

/* =========================
   PERSISTENT DROPDOWN LISTS (LEGACY)
   NOTE: Legacy list helpers removed; ShineTools now uses the unified
   settings + list persistence helpers near the top of the file.
   ========================= */

function syncNamesForPrecompLayer(precompLayer) {
        // Previously, this auto-renamed the precomp layer + the precomp itself
        // to match the first 3 words of the text. This caused comps to be renamed
        // to the default placeholder ('enter text') on creation.
        // IMPORTANT: Only the internal tagged TEXT layer name is kept in sync now.
        try {
            if (!precompLayer || !precompLayer.source || !isComp(precompLayer.source)) return;
            var sourceComp = precompLayer.source;
            var desired = computeFirst3FromComp(sourceComp);
            if (!desired) desired = DEFAULT_TEXT_STRING;

            // Removed: safeSetName(precompLayer, desired);
            // Removed: safeSetName(sourceComp, desired);

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
    function getAnimateCheckboxValue(boxLayer) {
        try {
            var fx = boxLayer.property("ADBE Effect Parade");
            if (!fx) return 0;
            var eff = fx.property("ANIMATE");
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

    function ensureAnimateState(boxLayer) {
        try {
            if (!boxLayer || !isShapeLayer(boxLayer)) return;
            var comp = boxLayer.containingComp;
            if (!isComp(comp)) return;

            var reveal = getRevealSlider(boxLayer);
            if (!reveal) return;

            var on = (getAnimateCheckboxValue(boxLayer) === 1);

            var id = "L" + String(boxLayer.id);
            if (!mod.__animState) mod.__animState = {};
            var prev = (mod.__animState[id] === undefined) ? -1 : mod.__animState[id];

            if (on) {
                // Only rebuild keys when we newly turned on, or keys are missing
                if (prev !== 1 || reveal.numKeys < 2) {
                    if (reveal.numKeys > 0) removeAllKeys(reveal);

                    var t0 = Math.max(comp.time, boxLayer.inPoint);
                    var t1 = t0 + (ANIMATE_FRAMES / comp.frameRate);

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

            mod.__animState[id] = on ? 1 : 0;
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
                "var on = effect(\"ANIMATE\")(\"Checkbox\");",
                "var p = 1; try { p = effect(\"Reveal %\")(\"Slider\")/100; } catch (err) { p = 1; }",
                "var w = (on==1) ? (fullW*p) : fullW;",
                "[w, fullH];"
            ].join("\n");

            rectPos.expressionEnabled = true;
            rectPos.expression = [
                "var px = effect(\"Padding\")(\"Point\")[0];",
                "var sr = thisLayer.parent.sourceRectAtTime(time,false);",
                "var fullW = sr.width + px*2;",
                "var on = effect(\"ANIMATE\")(\"Checkbox\");",
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

                // AE will often select the newly-created precomp item in the Project panel (especially when docked).
                // Goal: end with the SHAPE layer named "TEXT BOX" selected INSIDE the TEXT BOX precomp.
                //
                // Strategy:
                //  1) Try selecting inside the precomp directly (works when panel is run as a script).
                //  2) For docked panels, first activate the parent comp viewer, select the new precomp layer,
                //     run "Open Layer" (like double-clicking the layer), then select "TEXT BOX" inside.
                try {
                    var _pcId = pc.id;
                    var _parentId = parentCompId;
                    var _layerIndex = insertAt;

                    // Select "TEXT BOX" layer inside a given comp
                                        var _cmdSelectInside = "try{"
                        + "var c=app.project.itemByID(" + _pcId + ");"
                        + "if(c && (c instanceof CompItem)){"
                        + "try{c.openInViewer();}catch(eV){}"
                        + "try{app.project.activeItem=c;}catch(eA){}"
                        + "try{c.openInViewer();}catch(eV2){}"
                        + "try{if(app.activeViewer&&app.activeViewer.setActive){app.activeViewer.setActive();}}catch(eAV){}"
                        + "try{if(app.activeViewer&&app.activeViewer.source&&app.activeViewer.source.id!==" + _pcId + "){try{c.openInViewer();}catch(eV3){}}}catch(eChk){}"
                        + "try{for(var i=1;i<=c.numLayers;i++){try{c.layer(i).selected=false;}catch(e0){}}}catch(eD){}"
                        + "var t=null;"
                        + "for(var i2=1;i2<=c.numLayers;i2++){"
                        + "  try{var L=c.layer(i2);"
                        + "      if(L && L.matchName && String(L.matchName)==='ADBE Vector Layer'){"
                        + "         var nm=String(L.name||'');"
                        + "         if(nm==='TEXT BOX'){t=L;break;}"
                        + "         try{if(String(L.comment||'')==='SHINE_TEXT_BOX_BOX_LAYER'){t=L;break;}}catch(eC){}"
                        + "      }"
                        + "  }catch(eX){}"
                        + "}"
                        + "if(!t){try{t=c.layer(2);}catch(eY){}}"
                        + "if(t){try{t.selected=true;}catch(eS){} }"
                        + "}"
                        + "}catch(e){}";

                    // Docked-panel reliable path (v4): open the NEW TEXT BOX precomp directly (do NOT re-open parent comp)
                                        var _cmdOpenPrecompAndSelect = "try{"
                        + "var c=app.project.itemByID(" + _pcId + ");"
                        + "if(c && (c instanceof CompItem)){"
                        + "try{c.openInViewer();}catch(eV){}"
                        + "try{app.project.activeItem=c;}catch(eA){}"
                        + "try{c.openInViewer();}catch(eV2){}"
                        + "try{if(app.activeViewer&&app.activeViewer.setActive){app.activeViewer.setActive();}}catch(eAV){}"
                        + "try{if(app.activeViewer&&app.activeViewer.source&&app.activeViewer.source.id!==" + _pcId + "){try{c.openInViewer();}catch(eV3){}}}catch(eChk){}"
                        + "try{for(var j=1;j<=c.numLayers;j++){try{c.layer(j).selected=false;}catch(e0){}}}catch(eD){}"
                        + "var t=null;"
                        + "for(var k=1;k<=c.numLayers;k++){"
                        + "  try{var L=c.layer(k);"
                        + "      if(L && L.matchName && String(L.matchName)==='ADBE Vector Layer'){"
                        + "         var nm=String(L.name||'');"
                        + "         if(nm==='TEXT BOX'){t=L;break;}"
                        + "         try{if(String(L.comment||'')==='SHINE_TEXT_BOX_BOX_LAYER'){t=L;break;}}catch(eC){}"
                        + "      }"
                        + "  }catch(eX){}"
                        + "}"
                        + "if(!t){try{t=c.layer(2);}catch(eY){}}"
                        + "if(t){try{t.selected=true;}catch(eS){} }"
                        + "}"
                        + "}catch(e){}";

                    // Run a few passes to outlast AE focus switching — but ONLY targeting the precomp.
                    app.scheduleTask(_cmdOpenPrecompAndSelect, 80, false);
                    app.scheduleTask(_cmdOpenPrecompAndSelect, 180, false);
                    app.scheduleTask(_cmdOpenPrecompAndSelect, 420, false);
                    app.scheduleTask(_cmdOpenPrecompAndSelect, 700, false);

                    // Re-assert selection INSIDE the TEXT BOX precomp
                    app.scheduleTask(_cmdSelectInside, 520, false);
                    app.scheduleTask(_cmdSelectInside, 920, false);
                    app.scheduleTask(_cmdSelectInside, 1300, false);
 } catch (eDockSel) {}

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
            var l = comp.selectedLayers[0];
            if (!l || !isTextLayer(l)) return false;
            // Only pause/rename behavior for Shine-managed TEXT BOX text layers
            try { return (l.comment === TAG_TEXT_LAYER); } catch (eTag) { return false; }
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



    // Track last-known LAYER NAMES for tagged text layers so we can sync the owning precomp name
    // when the user manually renames the text layer (Project panel / Timeline rename).
    // Key: "compId_layerId" -> lastName
    mod.__nameState = {};
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

    function _sanitizeCompNameFromLayerName(nm) {
        // Comp names allow most characters, but a few cause filesystem / UI issues.
        // Keep this conservative and consistent with the existing sanitizeName() helper.
        try {
            nm = String(nm || "");
            nm = nm.replace(/[\/\\\:\*\?\"\<\>\|]/g, "");
            nm = nm.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
            // Avoid empty comp names
            if (!nm) nm = DEFAULT_TEXT_STRING;
            // Keep it reasonable
            if (nm.length > 80) nm = nm.substring(0, 80);
            return nm;
        } catch (e) {
            return DEFAULT_TEXT_STRING;
        }
    }

    function maybeSyncCompNameOnTextLayerRename(comp) {
        // If the user renames the tagged TEXT layer, mirror that name onto the *owning* precomp only.
        // We intentionally do NOT rename any parent comps that contain the precomp layer.
        try {
            if (!isComp(comp)) return;

            for (var i=1; i<=comp.numLayers; i++) {
                var lyr = comp.layer(i);
                if (!lyr || !isTextLayer(lyr)) continue;

                var isTagged = false;
                try { isTagged = (lyr.comment === TAG_TEXT_LAYER); } catch (eTag) { isTagged = false; }
                if (!isTagged) continue;

                var key = String(comp.id) + "_" + String(lyr.id);
                var curName = "";
                try { curName = String(lyr.name || ""); } catch (eNm) { curName = ""; }

                var prevName = (mod.__nameState[key] === undefined) ? null : mod.__nameState[key];
                if (prevName === null) {
                    mod.__nameState[key] = curName;
                    continue;
                }

                if (curName !== prevName) {
                    mod.__nameState[key] = curName;

                    var desiredCompName = _sanitizeCompNameFromLayerName(curName);
                    try {
                        if (String(comp.name) !== String(desiredCompName)) comp.name = desiredCompName;
                    } catch (eSet) {}
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

            

            // Sync comp name when the user renames the tagged text layer
            maybeSyncCompNameOnTextLayerRename(comp);
// Only run automation behaviors after edit pause window
            if (now >= mod.__watcher.editPauseUntil) {
                var boxes = findBoxLayersInComp(comp);
                for (var b=0; b<boxes.length; b++) ensureAnimateState(boxes[b]);


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
        
        try { $.global.ShineTools.TextBox.__nameState[String(comp.id) + "_" + String(textLayer.id)] = String(textLayer.name || ""); } catch (eSeedN) {}
// Ensure initial naming is synced to first 3 words
        try { updateNamesFromTextLayer(textLayer, comp); } catch (eName0) {}

        var raw = getTextStringSafe(textLayer);
        var initialName = sanitizeName(firstNWords(raw, 3));
        // If the user hasn't typed yet, avoid naming comps 'enter text'
        if (!initialName || String(initialName).toLowerCase() === String(DEFAULT_TEXT_STRING).toLowerCase()) {
            initialName = "TEXT BOX";
        }

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

        addCheck(fx, "ANIMATE", DEFAULT_ANIMATE_ON);
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


    // Bundled Text Animator presets (shipped with ShineTools)
    // These are shown at the top of the TEXT ANIMATORS dropdown, above a divider.
    // User-added items are stored separately via animLoad()/animSave().
    var ANIM_BUNDLED_SUBFOLDER = "presets/text";
    var ANIM_BUNDLED_DEFAULTS = [
        "Blinking Cursor.ffx",
        "Blur and Fade In.ffx",
        "Contract.ffx",
        "Decrease Tracking.ffx",
        "Flicker Exposure.ffx",
        "Increase Tracking.ffx",
        "Opacity Flicker In.ffx",
        "Slide and Pop In.ffx",
        "Typewriter.ffx"
    ];

    function _stResolveBundledTextPresetFolder() {
    // PASS 14: Prefer system-wide shared install path first
    //   /Library/Application Support/ShineTools/presets/text
    try {
        var sharedPF = Folder("/Library/Application Support/ShineTools/" + ANIM_BUNDLED_SUBFOLDER);
        if (sharedPF && sharedPF.exists) return sharedPF;
    } catch (eShared) {}

    // Bundled preset folder lives at:
    //   .../Scripts/ScriptUI Panels/ShineTools/presets/text
    // We try, in order:
    //   1) If this script is inside the ShineTools folder, use it.
    //   2) If this script is alongside a ShineTools folder, use that.
    //   3) Fall back to AE install folder lookups (best-effort).
    try {
        var sf = File($.fileName);
        if (sf && sf.exists) {
            var scriptFolder = sf.parent;

            // Case 1: script is already inside ".../ShineTools"
            if (scriptFolder && scriptFolder.exists && String(scriptFolder.name).toLowerCase() === "shinetools") {
                var pfA = Folder(scriptFolder.fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
                if (pfA && pfA.exists) return pfA;
            }

            // Case 2: script is in ScriptUI Panels root, and ShineTools is a sibling folder
            if (scriptFolder && scriptFolder.exists) {
                var stSibling = Folder(scriptFolder.fsName + "/ShineTools");
                if (stSibling && stSibling.exists) {
                    var pfB = Folder(stSibling.fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
                    if (pfB && pfB.exists) return pfB;
                }
            }
        }
    } catch (e0) {}

    // Case 3: best-effort fallbacks from common AE locations

// Fast-path: derive from Folder.startup (usually the AE app folder)
try {
    var su = null;
    try { su = Folder.startup; } catch (esu) {}
    if (su && su.exists) {
        var stSu = Folder(su.fsName + "/Scripts/ScriptUI Panels/ShineTools");
        if (stSu && stSu.exists) {
            var pfSu = Folder(stSu.fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
            if (pfSu && pfSu.exists) return pfSu;
        }
        var stSu2 = Folder(su.fsName + "/Support Files/Scripts/ScriptUI Panels/ShineTools");
        if (stSu2 && stSu2.exists) {
            var pfSu2 = Folder(stSu2.fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
            if (pfSu2 && pfSu2.exists) return pfSu2;
        }
    }
} catch (eStartup) {}

// Fast-path: explicit macOS AE 2025 install folder (most common)
try {
    var ae2025 = Folder("/Applications/Adobe After Effects 2025");
    if (ae2025 && ae2025.exists) {
        var st2025 = Folder(ae2025.fsName + "/Scripts/ScriptUI Panels/ShineTools");
        if (st2025 && st2025.exists) {
            var pf2025 = Folder(st2025.fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
            if (pf2025 && pf2025.exists) return pf2025;
        }
        var st2025b = Folder(ae2025.fsName + "/Support Files/Scripts/ScriptUI Panels/ShineTools");
        if (st2025b && st2025b.exists) {
            var pf2025b = Folder(st2025b.fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
            if (pf2025b && pf2025b.exists) return pf2025b;
        }
    }
} catch (e2025) {}

// Enumerate /Applications for "Adobe After Effects *" folders (handles other versions)
try {
    var apps = Folder("/Applications");
    if (apps && apps.exists) {
        var kids = apps.getFiles(function (f) { try { return (f instanceof Folder) && (/^Adobe After Effects/i.test(String(f.name))); } catch(e){ return false; } });
        for (var ki = 0; ki < kids.length; ki++) {
            var k = kids[ki];
            if (!k || !k.exists) continue;
            var stK = Folder(k.fsName + "/Scripts/ScriptUI Panels/ShineTools");
            if (stK && stK.exists) {
                var pfK = Folder(stK.fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
                if (pfK && pfK.exists) return pfK;
            }
            var stKb = Folder(k.fsName + "/Support Files/Scripts/ScriptUI Panels/ShineTools");
            if (stKb && stKb.exists) {
                var pfKb = Folder(stKb.fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
                if (pfKb && pfKb.exists) return pfKb;
            }
        }
    }
} catch (eAppsEnum) {}

    try {
        // app.path on mac often points into "Support Files" — we check both parent + self.
        var ap = null;
        try { ap = Folder(app.path); } catch (eap) {}
        var candidates = [];
        if (ap && ap.exists) {
            candidates.push(ap);
            try { if (ap.parent && ap.parent.exists) candidates.push(ap.parent); } catch (epar) {}
        }

        // Also try standard /Applications location (mac)
        try { candidates.push(Folder("/Applications")); } catch (eapps) {}

        for (var ci = 0; ci < candidates.length; ci++) {
            var base = candidates[ci];
            if (!base || !base.exists) continue;

            // Search a couple of likely install roots
            var rootsToTry = [];
            try { rootsToTry.push(base); } catch (eX) {}

            for (var ri = 0; ri < rootsToTry.length; ri++) {
                var r = rootsToTry[ri];
                if (!r || !r.exists) continue;

                // Typical install layout (mac / win-like)
                var st1 = Folder(r.fsName + "/Scripts/ScriptUI Panels/ShineTools");
                if (st1 && st1.exists) {
                    var pf1 = Folder(st1.fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
                    if (pf1 && pf1.exists) return pf1;
                }

                // Support Files variant
                var st2 = Folder(r.fsName + "/Support Files/Scripts/ScriptUI Panels/ShineTools");
                if (st2 && st2.exists) {
                    var pf2 = Folder(st2.fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
                    if (pf2 && pf2.exists) return pf2;
                }
            }
        }
    } catch (e1) {}

    return null;
}

    function _stGetBundledTextAnimatorPaths() {
    // Returns full fsName paths for bundled text animator .ffx presets.
    // Excludes "counter" presets (anything with "counter" in the filename).
    var out = [];
    var pf = null;
    try { pf = _stResolveBundledTextPresetFolder(); } catch (e) {}
    if (!pf || !pf.exists) return out;

    try {
        var files = pf.getFiles(function (f) {
            try {
                if (!(f instanceof File)) return false;
                var n = String(f.name || "");
                if (!/\.ffx$/i.test(n)) return false;
                // Exclude counter-related presets
                if (/counter/i.test(n)) return false;
                return true;
            } catch (e2) { return false; }
        });

        // Sort by name for a stable dropdown
        files.sort(function (a, b) {
            var an = String(a.name || "").toLowerCase();
            var bn = String(b.name || "").toLowerCase();
            if (an < bn) return -1;
            if (an > bn) return 1;
            return 0;
        });

        for (var i = 0; i < files.length; i++) {
            try { out.push(files[i].fsName); } catch (e3) {}
        }
    } catch (e1) {}

    return out;
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

    
    function _normalizePath(p) {
        try {
            if (!p) return "";
            p = String(p);

            // Convert file:// URIs into a usable filesystem path
            if (p.indexOf("file://") === 0) {
                try { return (new File(p)).fsName; } catch (e0) {}
            }

            // Decode URL-encoded characters (e.g., %20) that sometimes get stored in prefs
            if (p.indexOf("%") !== -1) {
                try {
                    // decodeURIComponent will throw if malformed; fall back gracefully
                    var dec = decodeURIComponent(p);
                    if (dec && dec.length) p = dec;
                } catch (e1) {
                    // minimal common fix
                    p = p.replace(/%20/g, " ");
                }
            }

            return p;
        } catch (e) {}
        return String(p || "");
    }

function _listClean(arr, maxLen) {
        var clean = [];
        var seen = {};
        try {
            for (var i = 0; i < arr.length; i++) {
                var p = _normalizePath(arr[i] || "");
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
            // Load without pruning first, then prune missing files.
            var arr = _listLoadChunked(section, key, maxLen);

            // Prune missing files ONLY if they are actually missing; never prune due to encoding.
            var out = [];
            for (var i = 0; i < arr.length; i++) {
                var p = _normalizePath(arr[i]);
                if (!p) continue;
                try {
                    var f = new File(p);
                    if (f && f.exists) out.push(p);
                    else out.push(p); // keep even if missing (user can Clear Favorites)
                } catch (e1) {
                    out.push(p);
                }
                if (maxLen && out.length >= maxLen) break;
            }

            // Save back the normalized list (keeps both stores in sync)
            _listSave(section, key, out, maxLen);

            return out;
        } catch (e) {}
        return [];
    }


    

    function _listLoadNoPrune(section, key, maxLen) {
    // Legacy single-key loader (JSON string + file-backed fallback via _settingsGetBest).
    // Also performs a one-time migration to chunked storage under the SAME base key.
    try {
        var raw = "";
        try { raw = _settingsGetBest(section, key, ""); } catch (eG) { raw = ""; }

        var arr = _listParseCompat(raw);

        // Migrate forward: write chunked keys (and normalized legacy JSON) so future loads are robust.
        try {
            if (arr && arr.length) { _dbgList(section + ":" + key + " loaded via legacy JSON/file (len=" + arr.length + ") -> migrated"); _listSaveChunked(section, key, arr, maxLen); }
        } catch (eM) {}

        return _listClean(arr || [], maxLen);
    } catch (e) {}
    return [];
}


// --- Chunked settings storage for long lists (avoids app.settings truncation) ---
function _listLoadChunked(section, keyBase, maxLen) {
    try {
        var countKey = keyBase + "_count";
        var n = 0;
        try {
            if (_appHaveSetting(section, countKey)) {
                n = parseInt(_appGetSetting(section, countKey, ""), 10) || 0;
            }
        } catch (eC) {}

                // If count key exists and is 0, treat as authoritative empty list (prevents legacy resurrection)
        try {
            if (_appHaveSetting(section, countKey) && n === 0) {
                _dbgList(section + ":" + keyBase + " authoritative empty (count=0)");
                return [];
            }
        } catch (eZ) {}

var arr = [];
        if (n > 0) {
            for (var i = 0; i < n; i++) {
                try {
                    var k = keyBase + "_" + i;
                    if (_appHaveSetting(section, k)) {
                        var v = _appGetSetting(section, k, "");
                        if (v) arr.push(_normalizePath(v));
                    }
                } catch (eI) {}
                if (maxLen && arr.length >= maxLen) break;
            }
            // Clean + return
            _dbgList(section + ":" + keyBase + " loaded from chunks n=" + n);
            return _listClean(arr, maxLen);
        }


        // Legacy chunk import (older builds used keyBase + "__chunk_*").
        // This is a one-time self-heal: if we find old chunks, we migrate them into the new canonical chunk keys.
        try {
            var oldCountKey = keyBase + "__chunk_count";
            var oldN = 0;
            if (_appHaveSetting(section, oldCountKey)) {
                oldN = parseInt(_appGetSetting(section, oldCountKey, ""), 10) || 0;
            }

            if (oldN > 0) {
                var oldArr = [];
                for (var oi = 0; oi < oldN; oi++) {
                    try {
                        var ok = keyBase + "__chunk_" + oi;
                        if (_appHaveSetting(section, ok)) {
                            var ov = _appGetSetting(section, ok, "");
                            if (ov) oldArr.push(_normalizePath(ov));
                        }
                    } catch (eO) {}
                    if (maxLen && oldArr.length >= maxLen) break;
                }

                var healed = _listClean(oldArr, maxLen);
                if (healed && healed.length) {
                    // Migrate forward (writes new chunk keys + legacy JSON/file fallback).
                    _dbgList(section + ":" + keyBase + " imported legacy __chunk_* oldN=" + oldN + " -> migrated");
                    _listSaveChunked(section, keyBase, healed, maxLen);
                    return healed;
                }
            }
        } catch (eLegacy) {}

        // Fallback to legacy loaders (JSON string + file settings)
        _dbgList(section + ":" + keyBase + " fallback legacy JSON/file");
        return _listLoadNoPrune(section, keyBase, maxLen);
    } catch (e) {}
    return [];
}

function _listSaveChunked(section, keyBase, arr, maxLen) {
    try {
        var clean = _listClean(arr || [], maxLen);

        // 1) Chunked app.settings (robust against truncation)
        try {
            var countKey = keyBase + "_count";

            // Clear previous NEW chunk keys (bounded by previous count, with a small "ghost key" sweep)
            var oldN = 0;
            try {
                if (_appHaveSetting(section, countKey)) {
                    oldN = parseInt(_appGetSetting(section, countKey, ""), 10) || 0;
                }
            } catch (eON) {}

            // If count is missing/zero but keys exist, do a light sweep to avoid resurrected ghosts.
            if (oldN <= 0) {
                try {
                    for (var s0 = 0; s0 < 25; s0++) {
                        if (_appHaveSetting(section, keyBase + "_" + s0)) { oldN = 25; break; }
                    }
                } catch (eSweep0) {}
            }

            for (var j = 0; j < oldN; j++) {
                try { _appSaveSetting(section, keyBase + "_" + j, ""); } catch (eCL) {}
            }

            // Clear previous LEGACY chunk keys (keyBase + "__chunk_*") so migration cannot resurrect old items
            try {
                var oldCountKeyLegacy = keyBase + "__chunk_count";
                var oldNLegacy = 0;

                try {
                    if (_appHaveSetting(section, oldCountKeyLegacy)) {
                        oldNLegacy = parseInt(_appGetSetting(section, oldCountKeyLegacy, ""), 10) || 0;
                    }
                } catch (eOLN) {}

                // If legacy count is missing/zero but keys exist, sweep a little.
                if (oldNLegacy <= 0) {
                    try {
                        for (var s1 = 0; s1 < 25; s1++) {
                            if (_appHaveSetting(section, keyBase + "__chunk_" + s1)) { oldNLegacy = 25; break; }
                        }
                    } catch (eSweep1) {}
                }

                for (var lj = 0; lj < oldNLegacy; lj++) {
                    try { _appSaveSetting(section, keyBase + "__chunk_" + lj, ""); } catch (eLJ) {}
                }

                // Reset legacy count
                try { _appSaveSetting(section, oldCountKeyLegacy, "0"); } catch (eLC) {}
            } catch (eLegacyClear) {}

            // Write new chunks
            _appSaveSetting(section, countKey, String(clean.length));
            for (var i = 0; i < clean.length; i++) {
                try { _appSaveSetting(section, keyBase + "_" + i, String(clean[i])); } catch (eS) {}
            }
        } catch (eA) {}

        // 2) Legacy single-key + file fallback (keeps older builds happy)
        _settingsSet(section, keyBase, JSON.stringify(clean));
    } catch (e) {}
}

function _listSave(section, key, arr, maxLen) {
    // Canonical list saver: chunked app.settings (primary) + legacy JSON/file fallback (for older builds).
    // Uses the SAME base key for both chunked and legacy so all list types behave consistently.
    try { return _listSaveChunked(section, key, arr, maxLen); } catch (e) {}
    return [];
}



    function favLoad() {
        // Canonical list loader (chunked + legacy fallback handled internally)
        return _listLoad(FAV_SETTINGS_SECTION, FAV_SETTINGS_KEY, FAV_MAX);
    }

    function favSave(arr) {
        // Canonical list saver (chunked + legacy fallback handled internally)
        _listSave(FAV_SETTINGS_SECTION, FAV_SETTINGS_KEY, arr, FAV_MAX);
    }

    function favAddPath(pathStr) {
        try { pathStr = _normalizePath(pathStr); } catch(eN) {}
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

    // Capture the active comp FIRST (import can steal focus / change activeItem).
    var comp = null;
    try { comp = getComp(); } catch (eC0) { comp = null; }
    if (!comp) { try { comp = _stLastComp; } catch (eLC) {} }

    // Last-resort fallback: if no active comp could be detected (Project panel focus, etc.),
    // pick the first CompItem in the project so elements can still land on the timeline.
    if (!comp) {
        try {
            for (var ii = 1; ii <= app.project.numItems; ii++) {
                var pit = app.project.item(ii);
                if (pit && (pit instanceof CompItem)) { comp = pit; _stLastComp = pit; break; }
            }
        } catch (eFC) {}
    }

    // Find existing imported footage for this path (if still in the project).
    function _findExistingFootageForFile(f) {
        try {
            var target = f.fsName;
            for (var i = 1; i <= app.project.numItems; i++) {
                var it = app.project.item(i);
                if (!it) continue;
                if (!(it instanceof FootageItem)) continue;
                if (!it.mainSource) continue;
                var srcFile = null;
                try { srcFile = it.file; } catch (eF) { srcFile = null; }
                if (!srcFile) continue;
                if (srcFile.fsName === target) return it;
            }
        } catch (e) {}
        return null;
    }

    app.beginUndoGroup("ShineTools - Import Element");
    try {
        var projItem = null;

        // Prefer existing item if it's still present; otherwise import.
        projItem = _findExistingFootageForFile(fileObj);
        if (!projItem) {
            projItem = importFootage(fileObj);
        }
        if (!projItem) return;

        // Always add to timeline if we have a comp.
        if (comp && (comp instanceof CompItem)) {
            try {
                var lyr = comp.layers.add(projItem);

                // Place at CTI explicitly.
                try { lyr.startTime = comp.time; } catch (eST) {}
                try { lyr.inPoint   = comp.time; } catch (eIP) {}

                // OPTION held: set blend mode to ADD instead of NORMAL
                try { if (_isOptDown()) { lyr.blendingMode = BlendingMode.ADD; } } catch (eBM) {}

                try { comp.openInViewer(); } catch (eV) {}
            } catch (eAdd) {}
        }
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
    // ------------------------------------------------------------
    // SOLIDS folder canonicalization (root-level)
    // Ensures there is exactly one root folder named "SOLIDS" (all caps).
    // Merges variants like "Solids", "SOLIDS.", "solids " into the primary folder.
    // ------------------------------------------------------------
    function _stGetOrCreateCanonicalSolidsFolderRoot(){
        if (!app.project) return null;
        var proj = app.project;
        var root = proj.rootFolder;

        function _isFolder(it){ return (it && (it instanceof FolderItem)); }
        function _normName(nm){
            return String(nm || "")
                .replace(/^[\s]+/g, "")
                .replace(/[\s\.]+$/g, "")   // trim spaces + trailing dots
                .toLowerCase();
        }
        function _moveAll(fromFolder, toFolder){
            try{
                for (var j = fromFolder.numItems; j >= 1; j--){
                    var child = fromFolder.item(j);
                    if (child) child.parentFolder = toFolder;
                }
            }catch(e){}
        }

        var candidates = [];
        for (var i = 1; i <= proj.numItems; i++){
            var it = proj.item(i);
            if (!_isFolder(it)) continue;
            if (it.parentFolder !== root) continue;
            if (_normName(it.name) === "solids") candidates.push(it);
        }

        var primary = null;
        if (candidates.length === 0){
            primary = proj.items.addFolder("SOLIDS");
            primary.parentFolder = root;
            return primary;
        }

        primary = candidates[0];
        for (var k = 0; k < candidates.length; k++){
            if (String(candidates[k].name) === "SOLIDS"){ primary = candidates[k]; break; }
        }

        for (var m2 = 0; m2 < candidates.length; m2++){
            var other = candidates[m2];
            if (other === primary) continue;
            _moveAll(other, primary);
            try { if (other.numItems === 0) other.remove(); } catch(eRem){}
        }

        try { primary.name = "SOLIDS"; } catch(eRen){}
        return primary;
    }

    function _stPlaceLayerSourceInSolidsFolder(layer){
        try{
            if (!layer) return;
            var src = layer.source;
            if (src && (src instanceof FootageItem)){
                var f = _stGetOrCreateCanonicalSolidsFolderRoot();
                if (f) src.parentFolder = f;
            }
        }catch(e){}
    }

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
            // Ensure SOLIDS folder exists (canonical all-caps) and place the new solid into it.
            try{
                var _solidsFolder = _stGetOrCreateCanonicalSolidsFolderRoot();
                if (_solidsFolder) newestSolid.parentFolder = _solidsFolder;
            }catch(eFolder){}

            var col = [1, 1, 1];
            try { col = safeColor01(newestSolid.mainSource.color); } catch (eC) {}

            // Place the newly-created Solid footage into the comp WITHOUT creating a second solid.
            // app.executeCommand("Solid...") creates the FootageItem; adding via addSolid() would duplicate it.
            // Instead, add the FootageItem as a layer.
            try {                // Put the newly-created solid footage into the canonical SOLIDS folder.
                try{
                    var solidsFolder = _stGetOrCreateCanonicalSolidsFolderRoot();
                    if (solidsFolder) newestSolid.parentFolder = solidsFolder;
                }catch(eSF){}

                var newLayer = null;
                try { newLayer = c.layers.add(newestSolid); } catch (eAdd) { newLayer = null; }
                if (newLayer) {
                    try { newLayer.selected = true; } catch (eSel) {}
                }
            } catch (eAddOuter) {}

            return;

        } catch (err) {
            warn("Error running Solid command:\n" + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function addLightNativePrompt() {
        var c = requireComp();
        if (!c) return;

        // Use AE's native dialog so the user can pick Light Type/Color/Intensity/etc.
        var cmd = app.findMenuCommandId("Light...");
        if (!cmd) cmd = app.findMenuCommandId("New Light...");
        if (!cmd) cmd = app.findMenuCommandId("Light Settings...");

        if (!cmd) {
            warn("Couldn't find the Light... menu command.\nIf AE is localized, tell me the exact menu text under Layer > New for Light.");
            return;
        }

        app.beginUndoGroup("ShineTools - ADD LIGHT");
        try {
            if (!requireProject()) return;
            ensureCompViewer(c);
            app.executeCommand(cmd);
        } catch (err) {
            warn("Error running Light command:\n" + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }



    function addWhiteSolidDefault() {
        var c = requireComp();
        if (!c) return;

        app.beginUndoGroup("ShineTools - ADD WHITE SOLID");
        try {
            // Create a plain white solid with no dialog
            var white = [1, 1, 1];
            var name = "WHITE SOLID";
            var lay = c.layers.addSolid(white, name, c.width, c.height, c.pixelAspect, c.duration);
            try { lay.selected = true; } catch (eSel) {}
        
            // Ensure the underlying solid footage item lives in SOLIDS (all caps)
            _stPlaceLayerSourceInSolidsFolder(lay);
} catch (err) {
            warn("Error: " + err.toString());
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
        
            // Ensure the null's solid source footage item lives in SOLIDS (all caps)
            _stPlaceLayerSourceInSolidsFolder(nul);
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
                // The command creates a solid-source FootageItem; move it into canonical SOLIDS.
                try {
                    var sel = c.selectedLayers;
                    if (sel && sel.length) _stPlaceLayerSourceInSolidsFolder(sel[0]);
                } catch (eAdjCmd) {}
            } else {
                var adj = c.layers.addSolid([1, 1, 1], "Adjustment Layer", c.width, c.height, c.pixelAspect, c.duration);
                adj.adjustmentLayer = true;
                _stPlaceLayerSourceInSolidsFolder(adj);
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


    // Option-click helper for ANIMATE STROKE: add Trim Paths to the SELECTED shape layer
    // and animate End 0→100 over 30 frames (starting at the CTI) with Easy Ease.
    function trimPathsAnimateSelectedShape_30f() {
        var c = requireComp();
        if (!c) return;

        if (!c.selectedLayers || c.selectedLayers.length !== 1) {
            alert("Select exactly ONE Shape Layer.");
            return;
        }

        var lyr = c.selectedLayers[0];

        // Robust Shape Layer detection
        var isShape = false;
        try {
            if (lyr && lyr.matchName && String(lyr.matchName) === "ADBE Vector Layer") isShape = true;
        } catch (e0) {}
        if (!isShape) {
            try {
                var g0 = lyr.property("ADBE Root Vectors Group");
                if (g0) isShape = true;
            } catch (e1) {}
        }
        if (!isShape) {
            alert("The selected layer is not a Shape Layer.\n\nSelect a Shape Layer (with Contents).");
            return;
        }

        var t0 = c.time;
        var t1 = t0 + (30.0 / c.frameRate);

        app.beginUndoGroup("ShineTools - TRIM PATHS (Selected Shape)");
        try {
            // Contents (Root Vectors Group)
            var contents = null;
            try { contents = lyr.property("ADBE Root Vectors Group"); } catch (e2) { contents = null; }
            if (!contents) {
                // Fallback: scan top-level props for matchName
                try {
                    for (var i = 1; i <= (lyr.numProperties || 0); i++) {
                        var pp = lyr.property(i);
                        if (pp && pp.matchName && String(pp.matchName) === "ADBE Root Vectors Group") { contents = pp; break; }
                    }
                } catch (e3) {}
            }
            if (!contents) throw new Error("Couldn't access the layer Contents.");

            // Add Trim Paths at root Contents
            var trim = null;
            try { trim = contents.addProperty("ADBE Vector Filter - Trim"); } catch (e4) {}
            if (!trim) {
                try { trim = contents.addProperty("ADBE Vector Filter - Trim Paths"); } catch (e5) {}
            }
            if (!trim) {
                try { trim = contents.addProperty("Trim Paths"); } catch (e6) {}
            }
            if (!trim) throw new Error("Couldn't add Trim Paths.");

            // End property
            var endProp = null;
            try { endProp = trim.property("ADBE Vector Trim End"); } catch (e7) { endProp = null; }
            if (!endProp) {
                try { endProp = trim.property("End"); } catch (e8) { endProp = null; }
            }
            if (!endProp) throw new Error("Couldn't find Trim Paths End property.");

            // Keyframes: 0 → 100 over 30 frames
            endProp.setValueAtTime(t0, 0);
            endProp.setValueAtTime(t1, 100);

            var k1 = endProp.nearestKeyIndex(t0);
            var k2 = endProp.nearestKeyIndex(t1);

            try {
                endProp.setInterpolationTypeAtKey(k1, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
                endProp.setInterpolationTypeAtKey(k2, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            } catch (eI) {}

            // Easy Ease both keys
            var easeIn = new KeyframeEase(0, 33.333);
            var easeOut = new KeyframeEase(0, 33.333);
            try {
                endProp.setTemporalEaseAtKey(k1, [easeIn], [easeOut]);
                endProp.setTemporalEaseAtKey(k2, [easeIn], [easeOut]);
            } catch (eE) {
                // Some AE versions are picky; try the 1D form
                try {
                    endProp.setTemporalEaseAtKey(k1, easeIn, easeOut);
                    endProp.setTemporalEaseAtKey(k2, easeIn, easeOut);
                } catch (eE2) {}
            }

            try { endProp.selected = true; } catch (eSel) {}
            try { lyr.selected = true; } catch (eSel2) {}

        } catch (err) {
            warn("Error: " + err.toString());
            try { alert("TRIM PATHS failed:\n\n" + err.toString()); } catch (_a) {}
        } finally {
            app.endUndoGroup();
        }
    }
    function trimPathsAnimateSelectedShapeStart_30f() {
        var c = requireComp();
        if (!c) return;

        if (!c.selectedLayers || c.selectedLayers.length !== 1) {
            alert("Select exactly ONE Shape Layer.");
            return;
        }

        var lyr = c.selectedLayers[0];

        // Robust Shape Layer detection
        var isShape = false;
        try {
            if (lyr && lyr.matchName && String(lyr.matchName) === "ADBE Vector Layer") isShape = true;
        } catch (e0) {}
        if (!isShape) {
            try {
                var g0 = lyr.property("ADBE Root Vectors Group");
                if (g0) isShape = true;
            } catch (e1) {}
        }
        if (!isShape) {
            alert("The selected layer is not a Shape Layer.\n\nSelect a Shape Layer (with Contents).");
            return;
        }

        var t0 = c.time;
        var t1 = t0 + (30.0 / c.frameRate);

        app.beginUndoGroup("ShineTools - TRIM PATHS START (Selected Shape)");
        try {
            // Contents (Root Vectors Group)
            var contents = null;
            try { contents = lyr.property("ADBE Root Vectors Group"); } catch (e2) { contents = null; }
            if (!contents) {
                // Fallback: scan top-level props for matchName
                try {
                    for (var i = 1; i <= (lyr.numProperties || 0); i++) {
                        var pp = lyr.property(i);
                        if (pp && pp.matchName && String(pp.matchName) === "ADBE Root Vectors Group") { contents = pp; break; }
                    }
                } catch (e3) {}
            }
            if (!contents) throw new Error("Couldn't access the layer Contents.");

            // Add Trim Paths at root Contents
            var trim = null;
            try { trim = contents.addProperty("ADBE Vector Filter - Trim"); } catch (e4) {}
            if (!trim) {
                try { trim = contents.addProperty("ADBE Vector Filter - Trim Paths"); } catch (e5) {}
            }
            if (!trim) {
                try { trim = contents.addProperty("Trim Paths"); } catch (e6) {}
            }
            if (!trim) throw new Error("Couldn't add Trim Paths.");

            // Start property
            var startProp = null;
            try { startProp = trim.property("ADBE Vector Trim Start"); } catch (e7) { startProp = null; }
            if (!startProp) {
                try { startProp = trim.property("Start"); } catch (e8) { startProp = null; }
            }
            if (!startProp) throw new Error("Couldn't find Trim Paths Start property.");

            // Keyframes: 0 → 100 over 30 frames
            startProp.setValueAtTime(t0, 0);
            startProp.setValueAtTime(t1, 100);

            var k1 = startProp.nearestKeyIndex(t0);
            var k2 = startProp.nearestKeyIndex(t1);

            try {
                startProp.setInterpolationTypeAtKey(k1, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
                startProp.setInterpolationTypeAtKey(k2, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            } catch (eI) {}

            // Easy Ease both keys
            var easeIn = new KeyframeEase(0, 33.333);
            var easeOut = new KeyframeEase(0, 33.333);
            try {
                startProp.setTemporalEaseAtKey(k1, [easeIn], [easeOut]);
                startProp.setTemporalEaseAtKey(k2, [easeIn], [easeOut]);
            } catch (eE) {
                // Some AE versions are picky; try the 1D form
                try {
                    startProp.setTemporalEaseAtKey(k1, easeIn, easeOut);
                    startProp.setTemporalEaseAtKey(k2, easeIn, easeOut);
                } catch (eE2) {}
            }

            try { startProp.selected = true; } catch (eSel) {}
            try { lyr.selected = true; } catch (eSel2) {}

        } catch (err) {
            warn("Error: " + err.toString());
            try { alert("TRIM PATHS START failed:\n\n" + err.toString()); } catch (_a) {}
        } finally {
            app.endUndoGroup();
        }
    }

    // ============================
    // ANIMATE STROKE helpers — create Trim Line and animate START/END 0→100 over 30 frames, Easy Ease
    // ============================
    function _addTrimLineAndAnimate_30f(whichProp) {
        var c = requireComp();
        if (!c) return;

        var t0 = c.time;
        var t1 = t0 + (30 / c.frameRate); // 30 frames

        app.beginUndoGroup("ShineTools - ANIMATE STROKE (" + whichProp + ")");
        try {
            var lineLen = Math.round(c.width * 0.9);
            var strokeW = 100;

            var lyr = c.layers.addShape();
            lyr.name = "Trim Line";
            lyr.property("Transform").property("Position").setValue([c.width / 2, c.height / 2]);

            var root = lyr.property("ADBE Root Vectors Group"); // Contents
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
            stroke.property("ADBE Vector Stroke Line Cap").setValue(1); // Round cap

            var trim = grpContents.addProperty("ADBE Vector Filter - Trim");
            var startProp = trim.property("ADBE Vector Trim Start");
            var endProp   = trim.property("ADBE Vector Trim End");

            try { startProp.setValue(0); } catch (eS0) {}
            try { endProp.setValue(100); } catch (eE0) {}

            var animProp = (whichProp === "START") ? startProp : endProp;

            animProp.setValueAtTime(t0, 0);
            animProp.setValueAtTime(t1, 100);

            var k1 = animProp.nearestKeyIndex(t0);
            var k2 = animProp.nearestKeyIndex(t1);

            try {
                animProp.setInterpolationTypeAtKey(k1, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
                animProp.setInterpolationTypeAtKey(k2, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            } catch (eInt) {}

            var easeIn  = new KeyframeEase(0, 33.333);
            var easeOut = new KeyframeEase(0, 33.333);
            try {
                animProp.setTemporalEaseAtKey(k1, [easeIn], [easeOut]);
                animProp.setTemporalEaseAtKey(k2, [easeIn], [easeOut]);
            } catch (eEase) {}

            try { animProp.selected = true; } catch (eSel) {}
            lyr.moveToBeginning();

        } catch (err) {
            warn("Animate Stroke failed: " + err.toString());
        } finally {
            app.endUndoGroup();
        }
    }

    function addTrimLineAnimateEnd_30f() { _addTrimLineAndAnimate_30f("END"); }
    function addTrimLineAnimateStart_30f() { _addTrimLineAndAnimate_30f("START"); }



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
            "freq  = effect('FREQ')('Slider');",
            "amt   = effect('AMOUNT')('Slider');",
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
            getOrAddSlider(host, "ELASTICITY", 0.30);
            getOrAddSlider(host, "GRAVITY", 10000);
            getOrAddSlider(host, "NUMBER OF BOUNCES", 6);
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
            getOrAddSlider(host, "FREQ", 2);
            getOrAddSlider(host, "AMOUNT", 100);
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
        var comp = requireComp();
        if (!comp) return;

        var sel = comp.selectedLayers;
        if (!sel || sel.length < 1) {
            warn("Select one or more precomp layers in the active comp.");
            return;
        }

        // Allow multi-select: operate on every selected precomp layer.
        var preLayers = [];
        for (var s = 0; s < sel.length; s++) {
            var l = sel[s];
            if (l && (l instanceof AVLayer) && l.source && (l.source instanceof CompItem)) {
                preLayers.push(l);
            }
        }
        if (!preLayers.length) {
            warn("Selection must include at least one precomp layer (AVLayer with CompItem source).");
            return;
        }

        // Defaults match the tester checkboxes (both checked)
        var verbose = false;
        var hardRefresh = true;
        var forceSameAbsEnd = true;

        // Modifiers:
        //   Shift-click: show debug output
        //   Option/Alt-click: disable hard refresh
        try {
            var ks = ScriptUI.environment.keyboardState;
            verbose = !!(ks && ks.shiftKey);
            if (ks && (ks.altKey || ks.optionKey)) hardRefresh = false;
        } catch (eKS) {}

        var log = [];
        app.beginUndoGroup("ShineTools - EXTEND PRECOMP");
        try {
            var targetEndAbs = comp.time + comp.frameDuration; // include CTI frame

            if (verbose) {
                log.push('--- SETTINGS ---');
                log.push('verbose=' + verbose + ' | hardRefresh=' + hardRefresh + ' | forceSameAbsEnd=' + forceSameAbsEnd);
                log.push('ActiveComp=' + comp.name + ' | CTI=' + comp.time + ' | targetEndAbs=' + targetEndAbs);
                try { log.push('SelectedPrecompLayers=' + preLayers.length); } catch(_eCnt) {}
                log.push('');
            }
            var opts = {
                verbose: verbose,
                hardRefresh: hardRefresh,
                forceSameAbsEnd: forceSameAbsEnd
            };

            var seen = {};

            // Extend every selected source comp recursively
            for (var p = 0; p < preLayers.length; p++) {
                var preL = preLayers[p];
                if (!preL || !preL.source) continue;

                if (verbose) {
                    try {
                        log.push('--- LAYER ' + (p + 1) + ' ---');
                        log.push('SelectedLayer=' + preL.name + ' | startTime=' + preL.startTime + ' | stretch=' + preL.stretch);
                        log.push('SourceComp=' + preL.source.name + ' | sourceDuration=' + preL.source.duration + ' | sourceDisplayStart=' + preL.source.displayStartTime);
                    } catch(_eL) {}
                }

                extendRecursive(preL.source, rawChildNeedAbs(comp, preL, targetEndAbs), null, opts, 0, seen, log);

                // Extend the selected layer outPoint in the parent comp
                try { preL.outPoint = Math.max(preL.outPoint, targetEndAbs); } catch (eOP) {}
            }

            // Also extend the parent comp itself and its layers to match the CTI expectation
            ensureCompDuration(comp, targetEndAbs - comp.displayStartTime, verbose ? log : null);
            extendAllLayerOutPoints(comp, targetEndAbs - comp.displayStartTime, verbose ? log : null);


            // Force viewer refresh so the new duration propagates immediately
            try { var t = comp.time; comp.time = t + comp.frameDuration; comp.time = t; } catch (eT) {}
            try {
                if (hardRefresh) {
                    for (var r = 0; r < preLayers.length; r++) {
                        try { hardRefreshLayer(preLayers[r], verbose ? log : null); } catch (_eHR2) {}
                    }
                }
            } catch (eHR) {}
        } catch (err) {
            warn("EXTEND PRECOMP error:\n" + err.toString());
        } finally {
            app.endUndoGroup();
        }

        if (verbose && log.length) {
            try { alert(log.join("\n")); } catch (eA) {}
        }

function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }

function isAVLayer(x){
    try{ return (x && (x instanceof AVLayer)); }catch(_e){ return false; }
  }

function isCompItem(x){
    try{ return (x && (x instanceof CompItem)); }catch(_e){ return false; }
  }

function isSolidFootageItem(it){
    try{
      if(!it) return false;
      if(!(it instanceof FootageItem)) return false;
      if(!it.mainSource) return false;
      // SolidSource exists for solids
      return (it.mainSource instanceof SolidSource);
    }catch(_e){
      return false;
    }
  }

function hardRefreshLayer(layer){
    try{
      if(!layer) return null;
      if(!layer.duplicate) return null;

      // Avoid breaking track mattes: if layer is a matte or has a matte, skip.
      try{
        if(layer.isTrackMatte) return layer; // AE2024+ may have this
      }catch(_e0){}
      try{
        if(layer.trackMatteType && layer.trackMatteType !== TrackMatteType.NO_TRACK_MATTE) return layer;
      }catch(_e1){}
      try{
        // If the layer below uses this as matte, duplication/deletion could break; best effort check
        var idx = layer.index;
        if(idx>1){
          var above = layer.containingComp.layer(idx-1);
          if(above && above.trackMatteType && above.trackMatteType !== TrackMatteType.NO_TRACK_MATTE) return layer;
        }
      }catch(_e2){}

      var comp = layer.containingComp;
      var idx0 = layer.index;

      var dup = layer.duplicate();
      // Move duplicate back to original index position
      try{
        if(dup.index < idx0){
          dup.moveBefore(layer);
        }else{
          dup.moveAfter(layer);
        }
        // Now dup should be adjacent; place exactly where original is
        // (If moveBefore worked, dup is above original; that's okay.)
      }catch(_e3){}

      // Preserve a few common switches
      try{ dup.enabled = layer.enabled; }catch(_e4){}
      try{ dup.threeDLayer = layer.threeDLayer; }catch(_e5){}
      try{ dup.collapseTransformation = layer.collapseTransformation; }catch(_e6){}
      try{ dup.adjustmentLayer = layer.adjustmentLayer; }catch(_e7){}
      try{ dup.blendingMode = layer.blendingMode; }catch(_e8){}
      try{ dup.motionBlur = layer.motionBlur; }catch(_e9){}
      try{ dup.shy = layer.shy; }catch(_e10){}
      try{ dup.guideLayer = layer.guideLayer; }catch(_e11){}
      try{ dup.label = layer.label; }catch(_e12){}
      try{ dup.audioEnabled = layer.audioEnabled; }catch(_e13){}
      try{ dup.name = layer.name; }catch(_e14){}

      // Keep the same timing
      try{ dup.startTime = layer.startTime; }catch(_e15){}
      try{ dup.inPoint = layer.inPoint; }catch(_e16){}
      try{ dup.outPoint = layer.outPoint; }catch(_e17){}

      // Select dup and delete original
      try{ dup.selected = true; }catch(_e18){}
      try{ layer.remove(); }catch(_e19){}

      // Return the new layer reference
      return dup;

    }catch(_e){
      return layer;
    }
  }

function ensureCompDuration(comp, newEndLocal, log){
    // newEndLocal is absolute time in comp space (0..duration)
    try{
      if(!comp) return;
      var newDur = Math.max(comp.duration, newEndLocal);
      if(newDur > comp.duration + (comp.frameDuration*0.25)){
        if(log) log.push('    duration: ' + comp.duration + ' -> ' + newDur);
        comp.duration = newDur;
      }
    }catch(_e){}
  }

function extendAllLayerOutPoints(comp, endLocal, log){
    try{
      var endAbs = comp.displayStartTime + endLocal;
      for(var i=1;i<=comp.numLayers;i++){
        var ly = comp.layer(i);
        if(!ly) continue;
        try{
          // Extend outPoint; do not change inPoint.
          if(ly.outPoint < endAbs){
            if(log) log.push('    layer['+i+']: ' + ly.name + ' out: ' + ly.outPoint + ' -> ' + endAbs);
            ly.outPoint = endAbs;
          }
        }catch(_e1){}

        // If this is a solid, extend its source duration too
        try{
          if(isAVLayer(ly) && isSolidFootageItem(ly.source)){
            var src = ly.source;
            if(src && src.mainSource && src.mainSource.duration < endLocal){
              if(log) log.push('      solidSourceDuration: ' + src.mainSource.duration + ' -> ' + endLocal);
              src.mainSource.duration = endLocal;
            }
          }
        }catch(_e2){}
      }
    }catch(_e){}
  }

function rawChildNeedAbs(parentComp, parentPrecompLayer, parentTargetEndAbs){
    // Map parent end time (absolute, in parent comp time) into child source comp absolute time.
    // Uses startTime + stretch only (no clamping).
    var st = 0;
    try{ st = parentPrecompLayer.startTime; }catch(_e){}
    var stretch = 100;
    try{ stretch = parentPrecompLayer.stretch; }catch(_e2){}
    if(!stretch || stretch === 0) stretch = 100;

    var src = parentPrecompLayer.source; // CompItem
    var childDisplayStart = 0;
    try{ childDisplayStart = src.displayStartTime; }catch(_e3){}

    // parentLocal = abs - displayStart
    var parentLocal = parentTargetEndAbs - parentComp.displayStartTime;

    // relation: parentTime = layer.startTime + (childTime - childDisplayStart) * (stretch/100)
    // => childTime = childDisplayStart + (parentTime - layer.startTime) * (100/stretch)
    var childAbs = childDisplayStart + (parentTargetEndAbs - st) * (100.0 / stretch);

    return childAbs;
  }

function maybeRecurseThroughLayer(precompLayer){
      if(!precompLayer || !isAVLayer(precompLayer)) return;
      var src = null;
      try{ src = precompLayer.source; }catch(_e){}
      if(!isCompItem(src)) return;

      var key = String(src.id);
      if(!seen[key]) seen[key] = {maxEnd:-1};

      // Compute child target end (absolute in child comp time)
      var childTargetAbs = rawChildNeedAbs(parentComp, precompLayer, parentTargetEndAbs);

      // Force child to at least reach the same absolute end as parentTargetAbs when displayStartTime=0 scenarios.
      // (This helps if you want "open the child at the same CTI" behavior.)
      if(opts.forceSameAbsEnd){
        childTargetAbs = Math.max(childTargetAbs, parentTargetEndAbs);
      }

      if(opts.verbose){
        var st=0, stretch=100;
        try{ st = precompLayer.startTime; }catch(_e2){}
        try{ stretch = precompLayer.stretch; }catch(_e3){}
        log.push(indent + '  LAYER[' + precompLayer.index + ']: ' + precompLayer.name + ' | startTime=' + st + ' | stretch=' + stretch);
        log.push(indent + '    childTargetAbs=' + childTargetAbs + ' | childDur=' + src.duration + ' | childDisplayStart=' + src.displayStartTime);
      }

      // Extend child if needed
      if(childTargetAbs > seen[key].maxEnd + (parentComp.frameDuration*0.25)){
        seen[key].maxEnd = childTargetAbs;
        extendRecursive(src, childTargetAbs, null, opts, depth+1, seen, log);
      }

      // Hard refresh the precomp layer instance in the parent comp (optional)
      if(opts.hardRefresh){
        if(opts.verbose) log.push(indent + '    hardRefresh: ' + precompLayer.name);
        var newLayer = hardRefreshLayer(precompLayer);
        // nothing else needed
      }
    }

function extendRecursive(parentComp, parentTargetEndAbs, layer, opts, depth, seen, log){
    depth = depth || 0;
    if(depth > 50) return; // safety

    if(!isCompItem(parentComp)) return;

    var indent = new Array(depth+1).join('  ');

    // Extend the parent comp itself to reach target end
    var endLocal = parentTargetEndAbs - parentComp.displayStartTime;
    endLocal = Math.max(0, endLocal);

    if(opts.verbose){
      log.push(indent + 'COMP: ' + parentComp.name + ' | targetEndAbs=' + parentTargetEndAbs + ' | endLocal=' + endLocal);
      log.push(indent + '  numLayers=' + parentComp.numLayers);
    }

    ensureCompDuration(parentComp, endLocal, opts.verbose?log:null);
    extendAllLayerOutPoints(parentComp, endLocal, opts.verbose?log:null);

    // If a specific layer was passed (the selected precomp layer), recurse through it; otherwise scan comp.
    function maybeRecurseThroughLayer(precompLayer){
      if(!precompLayer || !isAVLayer(precompLayer)) return;
      var src = null;
      try{ src = precompLayer.source; }catch(_e){}
      if(!isCompItem(src)) return;

      var key = String(src.id);
      if(!seen[key]) seen[key] = {maxEnd:-1};

      // Compute child target end (absolute in child comp time)
      var childTargetAbs = rawChildNeedAbs(parentComp, precompLayer, parentTargetEndAbs);

      // Force child to at least reach the same absolute end as parentTargetAbs when displayStartTime=0 scenarios.
      // (This helps if you want "open the child at the same CTI" behavior.)
      if(opts.forceSameAbsEnd){
        childTargetAbs = Math.max(childTargetAbs, parentTargetEndAbs);
      }

      if(opts.verbose){
        var st=0, stretch=100;
        try{ st = precompLayer.startTime; }catch(_e2){}
        try{ stretch = precompLayer.stretch; }catch(_e3){}
        log.push(indent + '  LAYER[' + precompLayer.index + ']: ' + precompLayer.name + ' | startTime=' + st + ' | stretch=' + stretch);
        log.push(indent + '    childTargetAbs=' + childTargetAbs + ' | childDur=' + src.duration + ' | childDisplayStart=' + src.displayStartTime);
      }

      // Extend child if needed
      if(childTargetAbs > seen[key].maxEnd + (parentComp.frameDuration*0.25)){
        seen[key].maxEnd = childTargetAbs;
        extendRecursive(src, childTargetAbs, null, opts, depth+1, seen, log);
      }

      // Hard refresh the precomp layer instance in the parent comp (optional)
      if(opts.hardRefresh){
        if(opts.verbose) log.push(indent + '    hardRefresh: ' + precompLayer.name);
        var newLayer = hardRefreshLayer(precompLayer);
        // nothing else needed
      }
    }

    if(layer){
      maybeRecurseThroughLayer(layer);
    }else{
      // Recurse through all nested precomp layers in this comp
      for(var i=1;i<=parentComp.numLayers;i++){
        var ly = parentComp.layer(i);
        if(!ly) continue;
        if(opts.verbose){
          var srcType = '<null>';
          try{ srcType = ly.source ? ly.source.toString() : '<null>'; }catch(_e4){}
          log.push(indent + '  layer[' + i + ']: ' + ly.name + ' | source=' + srcType);
        }
        maybeRecurseThroughLayer(ly);
      }
    }
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

            // If an unnamed/default instance of this effect exists (e.g. "Slider Control"), reuse it and rename
            try {
                for (var ii = 1; ii <= fx.numProperties; ii++) {
                    var cand = fx.property(ii);
                    if (cand && cand.matchName === matchName) {
                        safeSetName(cand, displayName);
                        existing = cand;
                        break;
                    }
                }
            } catch (eFind) {}
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
                ensureEffect(precompLayer, "ADBE Slider Control", "BORDER WIDTH", 40);
                ensureEffect(precompLayer, "ADBE Color Control",  "BORDER COLOR", [1,1,1]);

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
                            "var w = L.effect(\"BORDER WIDTH\")(\"Slider\");\n" +
                            "var sx = L.transform.scale[0]/100;\n" +
                            "var sy = L.transform.scale[1]/100;\n" +
                            "var s = (sx+sy)/2;\n" +
                            "if (s <= 0.0001) s = 1;\n" +
                            "w / s;";

                        stroke.property("Color").expression =
                            'comp("' + parentCompExprName + '").layer("' + precompLayerExprName + '").effect("BORDER COLOR")("Color");';

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

            // Set Tiling to UNFOLD (matches dropdown in your screenshot: 1=Repeat, 2=Checker Flip H, 3=Checker Flip V, 4=Unfold)
            var __til = null;
            try { __til = repetile.property("Tiling"); } catch (eT1) {}
            if (!__til) {
                try {
                    for (var pi = 1; pi <= repetile.numProperties; pi++) {
                        var pr = repetile.property(pi);
                        if (pr && pr.name === "Tiling") { __til = pr; break; }
                    }
                } catch (eT2) {}
            }
            if (__til) {
                try { __til.setValue(4); } catch (eT3) {}
            }


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

    
    function saveCurrentFrameJPGStill() {
        var c = requireComp();
        if (!c) return;
        if (!requireProject()) return;

        // Use Render Queue so we can force the Output Module template to: "JPEG STILL"
        var outFile = File.saveDialog("Save frame as JPG", "JPEG Image:*.jpg;*.jpeg");
        if (!outFile) return;

        function ensureExt(f, ext) {
            var fs = f.fsName;
            var lower = fs.toLowerCase();
            if (lower.slice(-ext.length) !== ext) return new File(fs + ext);
            return f;
        }
        outFile = ensureExt(outFile, ".jpg");

        var JPG_TEMPLATES = [
            "JPEG STILL",
            "JPEG Still",
            "JPEG (Still)",
            "JPEG",
            "JPG",
            "JPEG Sequence",
            "JPEG - Highest Quality"
        ];

        function tryApplyAnyTemplate(omObj, names) {
            for (var i = 0; i < names.length; i++) {
                try { omObj.applyTemplate(names[i]); return true; } catch (e) {}
            }
            return false;
        }

        app.beginUndoGroup("ShineTools - SAVE FRAME (JPG)");
        try {
            var rq = app.project.renderQueue;
            var rqItem = rq.items.add(c);

            // Apply settings FIRST (templates can reset time span), then clamp to current frame.
            try { rqItem.applyTemplate("Best Settings"); } catch (eRS) {}

            try { rqItem.timeSpanStart = c.time; } catch (eTS1) {}
            try { rqItem.timeSpanDuration = c.frameDuration; } catch (eTS2) {}

            var om = rqItem.outputModule(1);
            var ok = tryApplyAnyTemplate(om, JPG_TEMPLATES);

            if (!ok) {
                alert(
                    "Couldn't apply an Output Module template for JPG." +
                    "\n\nPlease create (or rename) an Output Module template called:" +
                    "\n\n\"JPEG STILL\"\n\nThen run again."
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


    function cleanUpProjectBin() {
    if (!app.project) { alert("No project is open."); return; }

    app.beginUndoGroup("Organize Bin");

    try {
        var proj = app.project;
        var root = proj.rootFolder;

        // ------------------------------------------------------------
        // Helpers
        // ------------------------------------------------------------
        function isFolder(it) { return (it && (it instanceof FolderItem)); }
        function isComp(it) { return (it && (it instanceof CompItem)); }
        function isFootage(it) { return (it && (it instanceof FootageItem)); }

        // Solid detection (robust): catches true solids, nulls/adjustments (solid-source),
        // even if AE returns unusual mainSource objects on some versions.
        function isSolidFootageSafe(it){
            try{
                if (!isFootage(it)) return false;
                // Preferred: SolidSource
                try{ if (typeof isSolidFootageItem === "function" && isSolidFootageItem(it)) return true; }catch(e0){}
                var ms = it.mainSource;
                if (ms && (ms instanceof SolidSource)) return true;
                // Fallback heuristic: no file + has color/width/height
                if (!it.file && ms){
                    if (ms.hasOwnProperty("color") && ms.hasOwnProperty("width") && ms.hasOwnProperty("height")) return true;
                }
            }catch(e){}
            return false;
        }

        function normExt(e) {
            if (!e) return "";
            e = String(e).toLowerCase();
            if (e.charAt(0) !== ".") e = "." + e;
            if (e === ".h.264") e = ".h264";
            return e;
        }

        function getExt(it) {
            try {
                if (!it || !it.file) return "";
                var n = String(it.file.name || "");
                var dot = n.lastIndexOf(".");
                if (dot < 0) return "";
                return normExt(n.substring(dot));
            } catch (e) { return ""; }
        }

        function findOrCreateRootFolder(name) {
            // Prefer the first folder with this name under root
            for (var i = 1; i <= proj.numItems; i++) {
                var it = proj.item(i);
                if (isFolder(it) && it.name === name && it.parentFolder === root) return it;
            }
            var f = proj.items.addFolder(name);
            f.parentFolder = root;
            return f;
        }

        function listRootFoldersByName(name) {
            var out = [];
            for (var i = 1; i <= proj.numItems; i++) {
                var it = proj.item(i);
                var target = String(name).toLowerCase();
                if (isFolder(it) && String(it.name).toLowerCase() === target && it.parentFolder === root) out.push(it);
            }
            return out;
        }

        function moveAllItems(fromFolder, toFolder) {
            if (!fromFolder || !toFolder || fromFolder === toFolder) return;
            // Move items out; index shifts, so loop backwards
            for (var j = fromFolder.numItems; j >= 1; j--) {
                try {
                    var child = fromFolder.item(j);
                    if (child) child.parentFolder = toFolder;
                } catch (e) {}
            }
        }

        function removeFolderIfEmpty(folder) {
            try {
                if (!folder || !isFolder(folder)) return false;
                if (folder.numItems !== 0) return false;
                // Don't delete root
                if (folder === root) return false;
                folder.remove();
                return true;
            } catch (e) { return false; }
        }

        function deleteEmptyFoldersUnderRoot() {
            // Iterate until no more deletions (because deletions can expose empties)
            var changed = true;
            var guard = 0;
            while (changed && guard < 50) {
                changed = false;
                guard++;
                for (var i = proj.numItems; i >= 1; i--) {
                    var it = proj.item(i);
                    if (isFolder(it) && it.numItems === 0) {
                        try { it.remove(); changed = true; } catch (e) {}
                    }
                }
            }
        }

        // ------------------------------------------------------------
        // Target folders (created if missing)
        // ------------------------------------------------------------
        var fFootage = findOrCreateRootFolder("FOOTAGE");
        // SOLIDS folder: create/merge case-insensitively (e.g., "Solids", "SOLIDS.")
function getOrCreateCanonicalSolidsFolder(){
    // match "solids", "solids.", etc (case-insensitive, ignore trailing dots/spaces)
    var candidates = [];
    for (var ii = 1; ii <= proj.numItems; ii++) {
        var itF = proj.item(ii);
        if (!isFolder(itF)) continue;
        if (itF.parentFolder !== root) continue;
        var nm = String(itF.name || "").replace(/[\s\.]+$/g, "");
        if (nm.toLowerCase() === "solids") candidates.push(itF);
    }
    if (candidates.length === 0) {
        var f = proj.items.addFolder("SOLIDS");
        f.parentFolder = root;
        return f;
    }
    // Prefer the one named exactly "SOLIDS" if present; else first.
    var primary = candidates[0];
    for (var p=0; p<candidates.length; p++){
        if (String(candidates[p].name) === "SOLIDS") { primary = candidates[p]; break; }
    }
    // Merge others into primary
    for (var m=0; m<candidates.length; m++){
        var other = candidates[m];
        if (other === primary) continue;
        moveAllItems(other, primary);
        removeFolderIfEmpty(other);
    }
    // Normalize name (optional)
    try { primary.name = "SOLIDS"; } catch(e){}
    return primary;
}

var fSolids  = getOrCreateCanonicalSolidsFolder();
        var fImages  = findOrCreateRootFolder("IMAGES");
        var fAudio   = findOrCreateRootFolder("AUDIO");
        var fPrecomps= findOrCreateRootFolder("PRECOMPS");

        // ------------------------------------------------------------
        // ------------------------------------------------------------
        // TEST CLEANUP (DISABLED): Previously removed root-level SOLIDS folders and contents.
        // This was only for early warning-probe testing and MUST NOT run on user projects.
        // We now only delete ShineTools-created test solids by name prefix elsewhere.
        // ------------------------------------------------------------
// ------------------------------------------------------------
        // Classification
        // ------------------------------------------------------------
        var audioExts = {
            ".wav":1, ".aif":1, ".aiff":1, ".mp3":1
        };
        var imageExts = {
            ".jpg":1, ".jpeg":1, ".png":1, ".gif":1, ".psd":1, ".ai":1, ".webp":1, ".avif":1,
            // Common additional still/image formats (safe to keep in IMAGES)
            ".tif":1, ".tiff":1, ".exr":1, ".dpx":1, ".bmp":1, ".heic":1, ".heif":1
        };
        var footageExts = {
            ".mov":1, ".mp4":1, ".m4v":1, ".avi":1, ".mxf":1, ".r3d":1,
            ".mpeg":1, ".mpg":1
        };

        function isSolidFootage(it) {
            try { return (isFootage(it) && it.mainSource && (it.mainSource instanceof SolidSource)); } catch (e) { return false; }
        }

        function isStillFootage(it) {
            try { return (isFootage(it) && it.mainSource && it.mainSource.isStill); } catch (e) { return false; }
        }

        // ------------------------------------------------------------
        // Move items (single-pass snapshot to avoid index-shift staging)
        // ------------------------------------------------------------
        var moveList = [];
        for (var i = 1; i <= proj.numItems; i++) {
            var it0 = proj.item(i);
            if (!it0) continue;
            if (isFolder(it0)) continue;            // ignore folders
            if (it0.parentFolder !== root) continue; // ROOT ONLY
            moveList.push(it0);
        }

        for (var k = 0; k < moveList.length; k++) {
            var it = moveList[k];
            if (!it) continue;

            try {
                if (isComp(it)) {
                    // PRECOMPS: only comps WITHOUT a leading underscore
                    if (String(it.name).charAt(0) !== "_") {
                        it.parentFolder = fPrecomps;
                    } else {
                        // leading underscore stays in ROOT
                        it.parentFolder = root;
                    }
                    continue;
                }

                // SOLIDS (including null/adjustment sources)
                if (isSolidFootageSafe(it)) {
                    it.parentFolder = fSolids;
                    continue;
                }
                // Stills by AE metadata (covers still sequences, etc.)
                if (isStillFootage(it)) {
                    it.parentFolder = fImages;
                    continue;
                }

                if (isFootage(it)) {
                    var ext = getExt(it);
                    // SOLIDS: route solid footage into SOLIDS folder (never FOOTAGE)
                    if (isSolidFootageSafe(it)) {
                        it.parentFolder = fSolids;
                    } else if (ext && audioExts[ext]) {
                        it.parentFolder = fAudio;
                    } else if (ext && imageExts[ext]) {
                        it.parentFolder = fImages;
                    } else if (ext && footageExts[ext]) {
                        it.parentFolder = fFootage;
                    } else {
                        // Default: treat unknown footage items as FOOTAGE
                        it.parentFolder = fFootage;
                    }
                }
            } catch (eMove) {}
        }

// ------------------------------------------------------------
        // Clean up: remove any empty folders at root
        // ------------------------------------------------------------
        deleteEmptyFoldersUnderRoot();

    } catch (e) {
        alert("ORGANIZE BIN error:\n" + e.toString());
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
    // TEXT UTIL: Create Shapes from Text (Layer > Create)
    // ============================================================
    function createShapesFromText_Util() {
        // Runs AE menu command: Layer > Create > Create Shapes from Text
        // Requires at least one selected TextLayer.
        try {
            if (!app.project) { alert("No project is open."); return; }

            var c = getComp();
            if (!c) { alert("Please make a comp active."); return; }

            var sel = c.selectedLayers;
            if (!sel || sel.length === 0) { alert("Please select a text layer."); return; }

            var hasText = false;
            for (var i = 0; i < sel.length; i++) {
                if (sel[i] && (sel[i] instanceof TextLayer)) { hasText = true; break; }
            }
            if (!hasText) { alert("Please select at least one TEXT layer."); return; }

            var cmd = findMenuCommandIdAny([
                "Create Shapes from Text",
                "Create Shapes From Text"
            ]);
            if (!cmd) {
                alert("Couldn't find the 'Create Shapes from Text' command in this AE version/localization.");
                return;
            }

            app.beginUndoGroup("ShineTools - CREATE SHAPES FROM TEXT");
            try { app.executeCommand(cmd); }
            catch (e) { alert("Create Shapes from Text failed:\n" + e.toString()); }
            finally { app.endUndoGroup(); }

        } catch (eOuter) {
            alert("Create Shapes from Text failed:\n" + eOuter.toString());
        }
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
    

// ============================================================
// Offset Layers Utility (ported from OffsetLayers_Standalone15.jsx)
// NOTE: Must be in global scope so MAIN > UTILITIES button can call it.
// ============================================================
// ============================================================
// Offset Layers Utility (Frame Offset engine)
// Ported from: Frame Offset.jsx
// NOTE: Must be in global scope so MAIN > UTILITIES button can call it.
// Click: Linear Frame Offset dialog
// Option/Alt: Curve Offset dialog (Square/Cubic/Ease In-Out/Exponential + preview + invert)
// ============================================================

var ST_FO_MAX_SPREAD_FRAMES = 90; // max total spread for CURVE mode (frames)

function _stFrameOffset_getComp(){ var i=app.project && app.project.activeItem; return (i&&i instanceof CompItem)?i:null; }

// selection order respects shift-select direction (top->bottom or bottom->top)
function _stFrameOffset_getSelectedLayersInUserOrder(comp){
    var s=comp.selectedLayers; if(!s||s.length<2) return [];
    var min=s[0].index; for(var i=1;i<s.length;i++) if(s[i].index<min) min=s[i].index;
    var down=(s[0].index===min), out=[];
    if(!down){ for(i=1;i<=comp.numLayers;i++) if(comp.layer(i).selected) out.push(comp.layer(i)); }
    else{ for(i=comp.numLayers;i>=1;i--) if(comp.layer(i).selected) out.push(comp.layer(i)); }
    return out;
}

// ---- focus ring suppression ----
function _stFrameOffset_addFocusSink(win){
    var sink = win.add("edittext", undefined, "");
    sink.visible = false; sink.enabled = true;
    sink.maximumSize=[0,0]; sink.minimumSize=[0,0];
    return sink;
}
function _stFrameOffset_focusSink(sink){ try{ sink && (sink.active=true); }catch(e){} }
function _stFrameOffset_defocus(btn,sink){
    // Best-effort: remove ScriptUI's blue focus ring by moving focus to a hidden edittext.
    // Some AE ScriptUI builds ignore addEventListener on dialog buttons, so we also set onMouseDown/onMouseUp.
    if(!btn) return;

    function _do(){
        try{ btn.active = false; }catch(e){}
        try{ if(sink) sink.active = true; }catch(e2){}
        try{ if(btn.window && btn.window.update) btn.window.update(); }catch(e3){}
    }

    try{ btn.addEventListener("mousedown", _do); }catch(eA){}
    try{ btn.addEventListener("mouseup",   _do); }catch(eB){}
    try{ btn.addEventListener("click",     _do); }catch(eC){}

    // Older/quirky ScriptUI fallbacks
    try{ btn.onMouseDown = _do; }catch(eD){}
    try{ btn.onMouseUp   = _do; }catch(eE){}
}

// Dialog buttons (OK/Cancel) need extra help: explicitly defocus BEFORE closing the dialog.
function _stFrameOffset_wireDialogBtn(btn, sink, closeFn){
    if(!btn) return;
    btn.onClick = function(){
        try{ _stFrameOffset_defocus(btn, sink); }catch(e0){}
        try{ btn.active = false; }catch(e1){}
        try{ if(sink) sink.active = true; }catch(e2){}
        try{ if(btn.window && btn.window.update) btn.window.update(); }catch(e3){}
        try{ if(closeFn) closeFn(); }catch(e4){}
    };
    // Also hook mouse down/up so the ring doesn't "stick" while the dialog is still open.
    try{ btn.onMouseDown = function(){ try{ btn.active=false; }catch(e){} try{ if(sink) sink.active=true; }catch(e2){} }; }catch(e5){}
    try{ btn.onMouseUp   = function(){ try{ btn.active=false; }catch(e){} try{ if(sink) sink.active=true; }catch(e2){} }; }catch(e6){}
}



// ===================== LINEAR (NORMAL CLICK) =====================
function _stFrameOffset_showFrameOffsetDialog(){
    var d=new Window("dialog","Frame Offset");
    d.orientation="column";
    d.alignChildren=["fill","top"];
    d.margins = 12;
    d.spacing = 8;

    // Smaller, tighter dialog
    d.minimumSize   = [220, 0];
    d.preferredSize = [220, 0];

    var sink=_stFrameOffset_addFocusSink(d);

    var row=d.add("group");
    row.orientation="row";
    row.alignChildren=["left","center"];
    row.alignment=["fill","top"];
    row.spacing = 6;

    row.add("statictext", undefined, "Frames:");
    var et=row.add("edittext", undefined, "3");
    et.characters = 4;

    // ensure focus sink so no blue ring appears on buttons
    d.onShow=function(){
        try{ et.active=true; }catch(e){}
    };

    function parseFrames(){
        var v = parseInt(et.text,10);
        if(isNaN(v)) v = 0;
        if(v < 0) v = 0;
        if(v > 9999) v = 9999;
        return v;
    }

    
var btns = d.add("group");
btns.orientation = "row";
btns.alignment = ["right","top"];
btns.spacing = 8;

// Dialog action buttons (match ShineTools stack-cell button architecture used in Font Audit CLOSE)
// This avoids the native macOS focus ring look.
var __dlgH = (typeof clippedBtnH === "function") ? clippedBtnH() : 24;
var __dlgMinW = 90;

function __makeDlgCellBtn(parent, label, minW){
    var cell = parent.add("group");
    cell.orientation   = "stack";
    cell.alignChildren = ["fill","fill"];
    cell.alignment     = ["left","center"];
    cell.margins       = 0;

    var b = cell.add("button", undefined, label);
    b.alignment     = ["fill","center"];
    b.preferredSize = [0, __dlgH];
    b.minimumSize   = [minW || __dlgMinW, __dlgH];
    b.maximumSize   = [10000, __dlgH];

    try { defocusButtonBestEffort(b); } catch(eDF) {}
    return { cell: cell, btn: b };
}

var __cancelPack = __makeDlgCellBtn(btns, "Cancel", 90);
var __okPack     = __makeDlgCellBtn(btns, "OK", 70);
var cBtn = __cancelPack.btn;
var oBtn = __okPack.btn;

cBtn.onClick = function(){ try{ d.close(0); }catch(e){ try{ d.close(); }catch(e2){} } };
oBtn.onClick = function(){ try{ d.close(1); }catch(e){ try{ d.close(); }catch(e2){} } };
d.layout.layout(true);
    try { d.pack(); } catch(e) {}

    if(d.show()!==1) return null;
    return { frames: parseFrames() };
}

function _stFrameOffset_applyLinearOffset(comp, layers, frameOffset){
    if(frameOffset === 0) return;
    var fps=comp.frameRate;
    app.beginUndoGroup("Offset Layers (Linear)");
    for(var i=0;i<layers.length;i++){
        layers[i].startTime += (i * frameOffset) / fps;
    }
    app.endUndoGroup();
}

// ===================== CURVE (OPTION CLICK) =====================
function _stFrameOffset_lerp(a,b,t){ return a + (b-a)*t; }
function _stFrameOffset_curveNorm50(curve50){ return Math.max(0, Math.min(1, curve50/50)); } // 0..1

function _stFrameOffset_f_power(t, p){ return Math.pow(t, p); }
function _stFrameOffset_f_sigmoid(t, a){
    var ta = Math.pow(t, a);
    var ua = Math.pow(1-t, a);
    var den = ta + ua;
    return den !== 0 ? (ta/den) : t;
}

function _stFrameOffset_f_exponential(t, k){
    // Normalized exponential curve: 0->0, 1->1. Higher k = more back-loaded.
    if(k <= 1e-6) return t;
    var ek = Math.exp(k);
    var num = Math.exp(k*t) - 1;
    var den = ek - 1;
    return den !== 0 ? (num/den) : t;
}


function _stFrameOffset_invertOffsets(offsets){
    if(!offsets || offsets.length < 3) return offsets;
    var inc=[], i;
    for(i=1;i<offsets.length;i++) inc.push(offsets[i]-offsets[i-1]);
    inc.reverse();
    var out=[0];
    for(i=0;i<inc.length;i++) out.push(out[out.length-1] + inc[i]);
    return out;
}

// typeIdx: 0=Square, 1=Cubic, 2=Ease In-Out, 3=Exponential
function _stFrameOffset_computeOffsetsFloat(count, totalFrames, typeIdx, curve50, invert){
    if(count<=1) return [0];

    var n = _stFrameOffset_curveNorm50(curve50);

    // Curve 0 -> linear, 50 -> strong curvature.
    var p_square = _stFrameOffset_lerp(1.35, 4.2, n);
    var p_cubic  = _stFrameOffset_lerp(1.8,  6.0, n);
    var a_sig    = _stFrameOffset_lerp(1.25, 8.0, n);
    var k_exp    = _stFrameOffset_lerp(0.75, 7.5, n);

    var out=[];
    for(var i=0;i<count;i++){
        var t = (i/(count-1));
        var y;
        if(typeIdx===0) y = _stFrameOffset_f_power(t, p_square);
        else if(typeIdx===1) y = _stFrameOffset_f_power(t, p_cubic);
        else if(typeIdx===2) y = _stFrameOffset_f_sigmoid(t, a_sig);
        else y = _stFrameOffset_f_exponential(t, k_exp);
        out.push(y * totalFrames);
    }

    for(i=1;i<out.length;i++){
        if(out[i] < out[i-1]) out[i] = out[i-1];
    }
    if(invert) out = _stFrameOffset_invertOffsets(out);
    for(i=1;i<out.length;i++){
        if(out[i] < out[i-1]) out[i] = out[i-1];
    }
    return out;
}
function _stFrameOffset_computeOffsetsRounded(count, totalFrames, typeIdx, curve50, invert){
    var f = _stFrameOffset_computeOffsetsFloat(count, totalFrames, typeIdx, curve50, invert);
    var r=[];
    for(var i=0;i<f.length;i++) r.push(Math.round(f[i]));
    for(i=1;i<r.length;i++) if(r[i] < r[i-1]) r[i]=r[i-1];
    return r;
}

// ---- ASCII preview ----
var ST_FO_DOT_CHAR = "·";      // background
var ST_FO_CURVE_DOT = "●";    // curve position (large dot)
function _stFrameOffset_makeBarLine(pos, cols){
    if(cols < 18) cols = 18;
    if(pos < 0) pos = 0;
    if(pos > cols-1) pos = cols-1;
    var s="";
    for(var c=0;c<cols;c++){
        if(c===pos) s += ST_FO_CURVE_DOT;
        else s += ST_FO_DOT_CHAR;
    }
    return s;
}

function _stFrameOffset_computeBarPositions(offsets, cols){
    var max = offsets[offsets.length-1] || 1;
    var pos=[];
    for(var i=0;i<offsets.length;i++){
        pos.push(Math.round((offsets[i]/max)*(cols-1)));
    }
    return pos;
}
function _stFrameOffset_measureLineWidth(st, cols){
    try{
        // Worst-case width estimate: mostly ST_FO_DOT_CHAR with at least one ST_FO_CURVE_DOT.
        // Some fonts render ST_FO_CURVE_DOT wider than ST_FO_DOT_CHAR; this prevents line-wrap "extra spacing".
        var sample="";
        for(var i=0;i<cols;i++) sample += ST_FO_DOT_CHAR;
        if(cols > 2){
            // put ST_FO_CURVE_DOT near the middle
            var mid = Math.floor(cols/2);
            sample = sample.substring(0, mid) + ST_FO_CURVE_DOT + sample.substring(mid+1);
        }else if(cols === 2){
            sample = ST_FO_CURVE_DOT + ST_FO_DOT_CHAR;
        }else if(cols === 1){
            sample = ST_FO_CURVE_DOT;
        }
        return st.graphics.measureString(sample)[0];
    }catch(e){
        return cols * 6;
    }
}
function _stFrameOffset_calcNoWrapCols(previewPanel, st){
    // Use the best available width estimate (sizes can be 0 until after first layout)
    var w = 0;
    try{ w = (st && st.size && st.size.width) ? st.size.width : 0; }catch(e){}
    if(!w){
        try{ w = (previewPanel && previewPanel.size && previewPanel.size.width) ? previewPanel.size.width : 0; }catch(e){}
    }
    if(!w){
        try{ w = (previewPanel && previewPanel.window && previewPanel.window.size) ? (previewPanel.window.size.width - 60) : 260; }catch(e){}
    }
    // Prefer dialog/window width so the preview can use the full available space
    try{
        if(previewPanel && previewPanel.window && previewPanel.window.size && previewPanel.window.size.width){
            w = Math.max(w, previewPanel.window.size.width - 60);
        }
    }catch(e){}
    if(!w || w < 80) w = 260;

    var dotW=5.5;
    try{
    var wDot = st.graphics.measureString(ST_FO_DOT_CHAR)[0] || dotW;
    var wCurve = st.graphics.measureString(ST_FO_CURVE_DOT)[0] || wDot;
    dotW = Math.max(wDot, wCurve) || dotW;
}catch(e){}
// Nudge smaller so we can fit more dots (loop below backs off if we overflow)
dotW *= 0.90;


    // EVEN WIDER: assume minimal padding (we also reduce panel margins below)
    var usable = w - 0;
    var cols = ((Math.floor(usable/dotW) + 18) * 2) + 60; // more columns to reach the edge
    if(isNaN(cols) || cols < 18) cols = 18;
    if(cols > 800) cols = 800;

    // keep a tiny right margin so we don't clip inside panel
    var pad = 8; // safety padding to avoid wrap
    var tries=0;
    while(tries<260 && _stFrameOffset_measureLineWidth(st, cols) > (w - pad)){
        cols--;
        tries++;
    }
    if(cols < 18) cols = 18;
    return cols;
}

function _stFrameOffset_showCurveDialog(layerCount, fps){
    var maxFramesMax = ST_FO_MAX_SPREAD_FRAMES;
    // default spread starts at ~1 second worth of frames (clamped to 90)
    var maxFrames = Math.min(maxFramesMax, Math.max(1, Math.round(fps * 1.0)));

    var d=new Window("dialog","Curve Offset");
    d.orientation="column";
    d.alignChildren=["fill","top"];
    // tighter overall dialog so the bottom hugs the buttons
    d.margins=12; d.spacing=4;

    d.minimumSize=[340,470];
    d.preferredSize=[340,470];

    var sink=_stFrameOffset_addFocusSink(d);

    var row=d.add("group");
    row.orientation="row";
    row.alignChildren=["left","center"];
    row.alignment=["fill","top"];
    // tighten label-to-control spacing
    row.spacing=5;

    // (removed top Curve readout; Curve label/value now lives above the bottom slider)
// flexible spacer to push Type controls to the right edge
var flex=row.add("group");
flex.alignment=["fill","center"];
flex.add("statictext", undefined, "");

// Type controls pinned right
var typeGrp = row.add("group");
typeGrp.orientation = "row";
typeGrp.alignChildren = ["left","center"];
typeGrp.alignment = ["right","center"];
typeGrp.spacing = 3;

typeGrp.add("statictext", undefined, "Type:");
var dd = typeGrp.add("dropdownlist", undefined, ["Square","Cubic","Ease In-Out","Exponential"]);
dd.selection = 3; // Exponential (default)
dd.preferredSize = [140, 22];
dd.alignment=["right","center"];

// --- Max Frame Spread (frames) ---
var maxRow=d.add("group");
maxRow.orientation="row";
maxRow.alignChildren=["left","center"];
maxRow.alignment=["fill","top"];
maxRow.spacing=5;

maxRow.add("statictext", undefined, "Max Spread (Frames):");
var mfv=maxRow.add("statictext", undefined, String(maxFrames));
mfv.minimumSize=[46,0];

var maxSlider=d.add("slider", undefined, maxFrames, 1, maxFramesMax);
maxSlider.alignment=["fill","top"];

var maxLR=d.add("group");
maxLR.orientation="row"; maxLR.alignment=["fill","top"];
maxLR.add("statictext",undefined,"1").alignment=["left","center"];
maxLR.add("statictext",undefined,"").alignment=["fill","center"];
maxLR.add("statictext",undefined,String(maxFramesMax)).alignment=["right","center"];

// --- Curve control ---
var curveRow=d.add("group");
curveRow.orientation="row";
curveRow.alignChildren=["left","center"];
curveRow.alignment=["fill","top"];
curveRow.spacing=5;
curveRow.add("statictext", undefined, "Curve:");
var cv=curveRow.add("statictext", undefined, "20");
cv.minimumSize=[34,0];

// Range: 0 .. 50 (0 = linear, 50 = strongest)
var cs=d.add("slider",undefined,20,0,50);
cs.alignment=["fill","top"];

var lr=d.add("group");
lr.orientation="row"; lr.alignment=["fill","top"];
lr.add("statictext",undefined,"0").alignment=["left","center"];lr.add("statictext",undefined,"50").alignment=["right","center"];

    // PREVIEW (no border)
    // ScriptUI panels always draw a border on some OS builds, so we use a group + our own label.
    var preview=d.add("group");
    preview.orientation="column";
    preview.alignment=["fill","top"];
    preview.alignChildren=["fill","top"];
    preview.margins=[0,0,0,0];
    preview.spacing=0;

    // push the header row down a touch
    var preTopPad=preview.add("group");
    preTopPad.minimumSize=[0,10];

    var preTitleRow=preview.add("group");
    preTitleRow.orientation="row";
    preTitleRow.alignChildren=["left","center"];
    preTitleRow.alignment=["fill","top"];
    preTitleRow.spacing=8;

    // (Preview label removed) — use this header row space for the Invert control
    var leftPad = preTitleRow.add("group");
    leftPad.minimumSize=[6,0];

    // Push Invert to the far right
    var preFlex=preTitleRow.add("group");
    preFlex.alignment=["fill","center"];
    preFlex.add("statictext", undefined, "");

    var invCb=preTitleRow.add("checkbox", undefined, "Invert");
    invCb.alignment=["right","center"];
    // add extra gap so dots/bars sit noticeably lower than the title
    var preTitlePad=preview.add("group");
    preTitlePad.minimumSize=[0,16];

    var st=preview.add("statictext",undefined,"",{multiline:true});
    st.alignment=["fill","fill"];
    // reduce preview height so the dialog bottom hugs the buttons
    st.minimumSize=[10,230];
    // Auto-grow dialog/preview to fit more layers (up to a sane max), so lines don't clip.
    // We size once based on layerCount; sliders shouldn't affect line count.
    var PREVIEW_BASE_LINES = 12;
    var PREVIEW_LINE_H = 14;      // approx line height in pixels
    var PREVIEW_BASE_H = 230;     // matches the st.minimumSize height above
    var PREVIEW_MAX_H  = 620;     // cap so dialog doesn't exceed screen on huge selections

    function sizeForLayerCount(){
        var cntPreview = Math.min(30, Math.max(2, layerCount||6));
        var desiredH = PREVIEW_BASE_H + Math.max(0, (cntPreview - PREVIEW_BASE_LINES)) * PREVIEW_LINE_H;
        if(desiredH > PREVIEW_MAX_H) desiredH = PREVIEW_MAX_H;

        // Apply heights
        st.minimumSize = [10, desiredH];
        st.preferredSize = [10, desiredH];

        // Grow the window proportionally (cap via preview cap above)
        var extra = desiredH - PREVIEW_BASE_H;
        if(extra > 0){
            var targetH = 470 + extra;
            d.minimumSize = [340, targetH];
            d.preferredSize = [340, targetH];
            try{ d.size = d.preferredSize; }catch(e){}
        }
    }

    try{ st.graphics.font = ScriptUI.newFont("Courier New","REGULAR",11); }catch(e){}

    function update(){
        var curve50=Math.max(0, Math.min(50, Math.round(cs.value)));
        cv.text=String(curve50);
        var invert = (invCb && invCb.value) ? true : false;
        var typeIdx = dd.selection ? dd.selection.index : 0;

        var cnt=Math.min(30, Math.max(2, layerCount||6));
        maxFrames = Math.max(1, Math.round(maxSlider.value));
        mfv.text = String(maxFrames);
        var offs=_stFrameOffset_computeOffsetsRounded(cnt, maxFrames, typeIdx, curve50, invert);

        try{ d.layout.layout(true); }catch(e){}
        var cols = _stFrameOffset_calcNoWrapCols(preview, st);
        var pos = _stFrameOffset_computeBarPositions(offs, cols);

        var lines=[];
        for(var i=0;i<pos.length;i++) lines.push(_stFrameOffset_makeBarLine(pos[i], cols));
        st.text = lines.join("\n");

        _stFrameOffset_focusSink(sink);
        try{ d.layout.layout(true); }catch(e){}
    }

    maxSlider.onChanging=update;
    cs.onChanging=update;
    dd.onChange=update;
    if(invCb) invCb.onClick=update;
    d.onShow=function(){ sizeForLayerCount(); update(); _stFrameOffset_focusSink(sink); };

    
var btns=d.add("group");
btns.alignment=["right","bottom"];
btns.spacing=10;
btns.margins=[0,0,0,0];

// Dialog action buttons (match ShineTools stack-cell button architecture used in Font Audit CLOSE)
// This avoids the native macOS focus ring look.
var __dlgH = (typeof clippedBtnH === "function") ? clippedBtnH() : 24;
var __dlgMinW = 90;

function __makeDlgCellBtn(parent, label, minW){
    var cell = parent.add("group");
    cell.orientation   = "stack";
    cell.alignChildren = ["fill","fill"];
    cell.alignment     = ["left","center"];
    cell.margins       = 0;

    var b = cell.add("button", undefined, label);
    b.alignment     = ["fill","center"];
    b.preferredSize = [0, __dlgH];
    b.minimumSize   = [minW || __dlgMinW, __dlgH];
    b.maximumSize   = [10000, __dlgH];

    try { defocusButtonBestEffort(b); } catch(eDF) {}
    return { cell: cell, btn: b };
}

var __cancelPack = __makeDlgCellBtn(btns, "Cancel", 90);
var __okPack     = __makeDlgCellBtn(btns, "OK", 70);
var cBtn = __cancelPack.btn;
var oBtn = __okPack.btn;

cBtn.onClick = function(){ try{ d.close(0); }catch(e){ try{ d.close(); }catch(e2){} } };
oBtn.onClick = function(){ try{ d.close(1); }catch(e){ try{ d.close(); }catch(e2){} } };
if(d.show()!==1) return null;

    return {
        totalFrames: maxFrames,
        typeIdx: (dd.selection ? dd.selection.index : 0),
        curve50: Math.max(0, Math.min(50, Math.round(cs.value))),
        invert: (invCb && invCb.value) ? true : false
    };
}

function _stFrameOffset_applyCurveOffset(comp, layers, totalFrames, typeIdx, curve50, invert){
    var fps=comp.frameRate;
    var offsF=_stFrameOffset_computeOffsetsFloat(layers.length, totalFrames, typeIdx, curve50, invert);

    app.beginUndoGroup("Offset Layers (Curve)");
    for(var i=0;i<layers.length;i++){
        layers[i].startTime += (offsF[i] / fps);
    }
    app.endUndoGroup();
}

// Entry point for the MAIN > UTILITIES button

// ============================================================
// Modal-safe helpers: pause background scheduleTask loops while dialogs are open
// (AE throws "Cannot run a script while a modal dialog is waiting for response")
// ============================================================
function __ST_pauseBackgroundTasks__(){
    try{
        // Pause TextBox watcher (it uses a scheduleTask loop)
        if ($.global && $.global.ShineTools && $.global.ShineTools.TextBox && $.global.ShineTools.TextBox.__watcher){
            $.global.__ST_TextBoxWatcherWasRunning__ = !!$.global.ShineTools.TextBox.__watcher.running;
            $.global.ShineTools.TextBox.__watcher.running = false;
        } else {
            $.global.__ST_TextBoxWatcherWasRunning__ = false;
        }
    }catch(e0){}

    try{
        // Cancel hover label polling (it uses scheduleTask while hovering)
        if ($.global && $.global.__ShineTools_CancelHoverPoll__) $.global.__ShineTools_CancelHoverPoll__();
    }catch(e1){}
}

function __ST_resumeBackgroundTasks__(){
    try{
        if ($.global && $.global.ShineTools && $.global.ShineTools.TextBox && $.global.ShineTools.TextBox.ensureWatcherRunning){
            if ($.global.__ST_TextBoxWatcherWasRunning__) {
                $.global.ShineTools.TextBox.ensureWatcherRunning();
            }
        }
    }catch(e2){}
}

// Runs after a short delay (scheduled) so any in-flight scheduled tasks can finish
// before we open a modal dialog.
function __ST_RunOffsetLayersModal__(){
    var pending = null;
    try { pending = $.global.__ST_PendingOffsetLayers__; } catch(e0) {}
    // clear immediately to avoid re-entrancy
    try { $.global.__ST_PendingOffsetLayers__ = null; } catch(e1) {}

    try{
        var comp = null;

        // Try to locate the original comp by id (best-effort)
        try{
            if (pending && pending.compId && app.project){
                for (var i=1; i<=app.project.numItems; i++){
                    var it = app.project.item(i);
                    if (it && (it instanceof CompItem) && it.id === pending.compId){
                        comp = it;
                        break;
                    }
                }
            }
        }catch(e2){}

        // Fallback to active comp
        if (!comp) comp = _stFrameOffset_getComp();
        if (!comp) return;

        // Restore the intended layer list by index (best-effort)
        var layers = [];
        try{
            if (pending && pending.layerIdxs && pending.layerIdxs.length){
                for (var k=0; k<pending.layerIdxs.length; k++){
                    var idx = pending.layerIdxs[k];
                    try{
                        var lyr = comp.layer(idx);
                        if (lyr) layers.push(lyr);
                    }catch(e3){}
                }
            }
        }catch(e4){}

        // If we couldn't rebuild, just use current selection (in user order)
        if (!layers || layers.length < 2){
            layers = _stFrameOffset_getSelectedLayersInUserOrder(comp);
        }
        if (!layers || layers.length < 2) return;

        if (pending && pending.useCurve){
            var r = _stFrameOffset_showCurveDialog(layers.length, comp.frameRate);
            if (r) _stFrameOffset_applyCurveOffset(comp, layers, r.totalFrames, r.typeIdx, r.curve50, r.invert);
        } else {
            var lin = _stFrameOffset_showFrameOffsetDialog();
            if (lin) _stFrameOffset_applyLinearOffset(comp, layers, lin.frames);
        }
    }catch(e){
        try{ alert("Offset Layers failed:\n\n" + e.toString()); }catch(ea){}
    }finally{
        __ST_resumeBackgroundTasks__();
    }
}
// Expose modal runner for app.scheduleTask (runs in global scope)
try { $.global.__ST_RunOffsetLayersModal__ = __ST_RunOffsetLayersModal__; } catch(e) {}


function offsetSelectedLayers_ShineTools(){
    var comp = _stFrameOffset_getComp();
    if (!comp) return alert("No active comp.");

    var layers = _stFrameOffset_getSelectedLayersInUserOrder(comp);
    if (!layers || layers.length < 2) return alert("Select 2+ layers.");

    // Pause any repeating scheduleTask loops BEFORE showing a modal dialog.
    __ST_pauseBackgroundTasks__();

    // Snapshot selection so we can open the dialog slightly later (lets any already-scheduled tasks finish)
    var idxs = [];
    try { for (var i=0; i<layers.length; i++) idxs.push(layers[i].index); } catch(e0) {}

    $.global.__ST_PendingOffsetLayers__ = {
        compId: comp.id,
        layerIdxs: idxs,
        useCurve: isOptionDown() ? true : false
    };

    // Open the dialog AFTER a short delay so any in-flight scheduled tasks can complete
    // (prevents AE modal-dialog scheduleTask conflicts).
    try { app.scheduleTask("$.global.__ST_RunOffsetLayersModal__();", 260, false); } catch (e1) {
        // Fallback: try immediately
        try { ($.global.__ST_RunOffsetLayersModal__ || __ST_RunOffsetLayersModal__)(); } catch (e2) {}
    }
}


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

        pal.preferredSize = [380, 748];
        pal.minimumSize   = [320, 420];
        // Resize handlers are attached later (after UI is built) for better performance.
        pal.orientation   = "column";
        pal.alignChildren = ["fill", "fill"];
        pal.margins       = 0;
        pal.spacing       = 0;


        // ============================================================
        // PASS 3: BUILDUI SPLIT (NO BEHAVIOR CHANGES)
        //   - Extracted: Top tab header builder
        //   - Extracted: Tab stack builder
        // ============================================================

        function _buildTopTabHeader(pal) {
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
            // PASS 13.1: CMD-click HELP toggles DEBUG INFO panel at bottom of HELP tab
            try {
                tabLblHelp.addEventListener("mousedown", function () {
                    try {
                        var ks = ScriptUI.environment.keyboardState;
                        if (ks && ks.metaKey) {
                            ST.UI = ST.UI || {};
                            var p = ST.UI._helpDebugPanel;
                            if (p) {
                                var newVis = !(ST.UI._helpDebugVisible === true);
                                ST.UI._helpDebugVisible = newVis;

                                try { p.visible = newVis; } catch (eV) {}
                                try { p.enabled = newVis; } catch (eE) {}

                                try {
                                    if (newVis) {
                                        try { p.minimumSize = ST.UI._dbgPanelMinSize || [0,0]; } catch(e1) {}
                                        try { p.maximumSize = ST.UI._dbgPanelMaxSize || [10000,10000]; } catch(e2) {}
                                        try { p.preferredSize = ST.UI._dbgPanelPrefSize || [0,0]; } catch(e3) {}
                                        try { if (typeof ST.UI._helpDebugRefresh === "function") ST.UI._helpDebugRefresh(); } catch(eR) {}
                                    } else {
                                        try { p.minimumSize = [0,0]; p.maximumSize = [0,0]; p.preferredSize = [0,0]; } catch(e4) {}
                                    }
                                } catch (eSz) {}

                                try { if (tabHelp && tabHelp.layout) { tabHelp.layout.layout(true); tabHelp.layout.resize(); } } catch (eL) {}
                            }
                        }
                    } catch (e) {}
                });
            } catch (e) {}
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

            return {
                tabHeader: tabHeader,
                tabBar: tabBar,
                tabBarLeft: tabBarLeft,
                tabBarRight: tabBarRight,
                tabUnderlineLayer: tabUnderlineLayer,
                tabLblMain: tabLblMain,
                tabLblText: tabLblText,
                tabLblUpdates: tabLblUpdates,
                tabLblRequests: tabLblRequests,
                tabLblHelp: tabLblHelp,
                TAB_LABEL_ACTIVE: TAB_LABEL_ACTIVE,
                TAB_LABEL_IDLE: TAB_LABEL_IDLE,
                setTopTabLabelColor: _setTopTabLabelColor
            };
        }

        function _buildTabStack(pal) {
            // -------------------------
            // TAB CONTENT STACK (replaces ScriptUI tabbedpanel so we can style labels safely)
            // -------------------------
            var tabStack = pal.add("group");
            tabStack.orientation   = "stack";
            // Expose stack host for takeover warning overlay
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

            return {
                tabStack: tabStack,
                tabMain: tabMain,
                tabText: tabText,
                tabRequests: tabRequests,
                tabUpdates: tabUpdates,
                tabHelp: tabHelp
            };
        }
        // -------------------------
        // -------------------------

        // -------------------------
        // TOP TAB LABELS + ACTIVE UNDERLINE
        // -------------------------
        var _topTabs = _buildTopTabHeader(pal);

        var tabHeader = _topTabs.tabHeader;
        var tabBar = _topTabs.tabBar;
        var tabBarLeft = _topTabs.tabBarLeft;
        var tabBarRight = _topTabs.tabBarRight;
        var tabUnderlineLayer = _topTabs.tabUnderlineLayer;

        var tabLblMain = _topTabs.tabLblMain;
        var tabLblText = _topTabs.tabLblText;
        var tabLblRequests = _topTabs.tabLblRequests;
        var tabLblUpdates = _topTabs.tabLblUpdates;
        var tabLblHelp = _topTabs.tabLblHelp;

        var TAB_LABEL_ACTIVE = _topTabs.TAB_LABEL_ACTIVE;
        var TAB_LABEL_IDLE   = _topTabs.TAB_LABEL_IDLE;

        function _setTopTabLabelColor(st, rgbaArr) {
            return _topTabs.setTopTabLabelColor(st, rgbaArr);
        }





        // -------------------------
        // TAB CONTENT STACK (replaces ScriptUI tabbedpanel so we can style labels safely)
        // -------------------------
        var _tabs = _buildTabStack(pal);
        var tabStack = _tabs.tabStack;

        var tabMain     = _tabs.tabMain;
        var tabText     = _tabs.tabText;
        var tabRequests = _tabs.tabRequests;
        var tabUpdates  = _tabs.tabUpdates;
        var tabHelp     = _tabs.tabHelp;

        // Expose tab references for takeover/restore logic
        try {
            pal.__stTabStack    = tabStack;
            pal.__stTabMain     = tabMain;
            pal.__stTabText     = tabText;
            pal.__stTabRequests = tabRequests;
            pal.__stTabUpdates  = tabUpdates;
            pal.__stTabHelp     = tabHelp;
        } catch (e) {}

        
// Flexible glue to keep footer pinned to the bottom even in docked panels.
// ScriptUI can sometimes re-measure the main stack too small after visibility changes;
// this glue absorbs remaining height so the footer stays bottom-anchored.
var __footerGlue = pal.add("group");
__footerGlue.alignment = ["fill","fill"];
try { __footerGlue.minimumSize = [0,0]; } catch(eMin) {}
try { __footerGlue.preferredSize = [0,0]; } catch(ePref) {}

// GLOBAL FOOTER (outside tabs)
// -------------------------
// Two-line footer, both lines pinned LEFT to the panel edge.
//  Line 1: Status (if visible) + Legend
//  Line 2: Copyright / version
var globalFooter = pal.add("group");
globalFooter.orientation   = "column";
globalFooter.alignChildren = ["left", "center"];
globalFooter.alignment     = ["fill", "bottom"];
globalFooter.margins       = [10, 4, 10, 6];
// Ensure footer has enough height for 2 lines (legend/status + copyright)
globalFooter.minimumSize  = [0, 34];

globalFooter.spacing       = 2;

// Row 1: Legend + Update Status (LEFT pinned)
var gfTopRow = globalFooter.add("group");
gfTopRow.orientation   = "row";
gfTopRow.alignChildren = ["left", "center"];
gfTopRow.alignment     = ["left", "center"];
gfTopRow.margins       = 0;
gfTopRow.spacing       = 6;

// Yellow option indicator (vertical Shine-yellow line)
var gfLine = gfTopRow.add("group");
gfLine.margins = 0;
gfLine.minimumSize = [8, 16];
gfLine.preferredSize = [8, 16];
gfLine.maximumSize = [8, 16];
gfLine.onDraw = function () {
    try {
        var g = this.graphics;
        var W = this.size[0], H = this.size[1];
        var pen = g.newPen(g.PenType.SOLID_COLOR, [1, 0.82, 0.20, 1], 3);
        var x = Math.round(W - 3);
        g.newPath();
        g.moveTo(x, 3);
        g.lineTo(x, H - 1);
        g.strokePath(pen);
    } catch (e) {}
};
try { gfLine.notify("onDraw"); } catch (e0) {}

// Legend text (exact format requested)
var gfLegend = gfTopRow.add("statictext", undefined, "= Multiple options |");
gfLegend.justify = "left";
gfLegend.margins = 0;
gfLegend.alignment = ["left", "center"];

// Update status label (immediately to the right of legend)
// NOTE: ScriptUI statictext created with empty string can get "stuck" at ~0 width.
// We create it with a sizing template, then clear the text.
var gfStatusLabel = gfTopRow.add("statictext", undefined, "Update available.");
gfStatusLabel.margins = 0;
gfStatusLabel.alignment = ["left","center"];
try { gfStatusLabel.characters = 22; } catch(eCh) {}
try { gfStatusLabel.visible = false; } catch(eVis0) {}
try { gfStatusLabel.text = ""; } catch(eTxt0) {}

// Row 2: Copyright / version (LEFT pinned)
var gfCopyRow = globalFooter.add("group");
gfCopyRow.orientation   = "row";
gfCopyRow.alignChildren = ["left", "center"];
gfCopyRow.alignment     = ["left", "bottom"];
gfCopyRow.margins       = 0;
gfCopyRow.spacing       = 0;

var gfCopy = gfCopyRow.add("statictext", undefined, "(c) 2025 Shine Creative | v" + SHINE_VERSION);
gfCopy.margins = 0;
gfCopy.alignment = ["left","center"];

function _setFooterUpdateIndicator(isUpToDate, msgOverride) {
    try {
        // if caller provides explicit message, use it
        if (typeof msgOverride === "string") {
            gfStatusLabel.text = msgOverride;
        } else if (isUpToDate === true) {
            gfStatusLabel.text = "✓ Up to date.";
        } else if (isUpToDate === false) {
            gfStatusLabel.text = "Update available.";
        } else {
            gfStatusLabel.text = "";
        }

        // Ensure it actually becomes visible (2-line footer can be clipped without relayout)
        try { gfStatusLabel.visible = (gfStatusLabel.text !== ""); } catch(eV) {}
        try { globalFooter.layout.layout(true); } catch(eL0) {}
        try { pal.layout.layout(true); } catch(eL1) {}
        try { pal.layout.resize(); } catch(eL2) {}
    } catch (e) {}
}


// Default until the first check runs
try {
    gfStatusLabel.text = "";
} catch(e) {}
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
                // Project-local FONTS folder (CLIENT/SPOT/PROJECTS/AE -> CLIENT/SPOT/FONTS)
                try {
                    if (app.project && app.project.file) {
                        var cur = app.project.file.parent; // folder containing the .aep (usually .../PROJECTS/AE)
                        var spotFolder = null;

                        // Walk up until we find a folder named "PROJECTS", then its parent is the SPOT folder
                        var guard = 0;
                        while (cur && guard < 20) {
                            if (cur.name && cur.name.toUpperCase() === "PROJECTS") {
                                spotFolder = cur.parent;
                                break;
                            }
                            cur = cur.parent;
                            guard++;
                        }

                        // Fallback: assume .../PROJECTS/AE and go up two levels to reach SPOT
                        if (!spotFolder && app.project.file.parent && app.project.file.parent.parent && app.project.file.parent.parent.parent) {
                            // AE folder parent is PROJECTS; PROJECTS parent is SPOT
                            spotFolder = app.project.file.parent.parent;
                        }

                        if (spotFolder) {
                            var projectFonts = Folder(spotFolder.fsName + "/FONTS");
                            if (projectFonts.exists) {
                                roots.push({p: projectFonts.fsName, r:true});
                            }
                        }
                    }
                } catch (_e) {}
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

              // FONT AUDIT button (use same 2x2 grid cell architecture to avoid macOS focus ring artifacts)
              var hFA = clippedBtnH();
              var auditCell = top.add("group");
              auditCell.orientation   = "stack";
              auditCell.alignChildren = ["fill","fill"];
              auditCell.margins       = 0;

              var auditBtn = auditCell.add("button", undefined, "REFRESH");
              auditBtn.alignment     = ["fill","top"];
              auditBtn.preferredSize = [0, hFA];
              auditBtn.minimumSize   = [110, hFA];
              auditBtn.maximumSize   = [10000, hFA];
              defocusButtonBestEffort(auditBtn);

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
              btns.orientation   = "row";
              btns.alignChildren = ["left","center"];
              btns.spacing       = 10;

              // Match the MAIN-tab 2x2 grid button architecture (stack cell + sizing + defocus).
              // Keep EXPORT FONT LIST and GET FONTS hidden until the font list is populated.
              var __dlgBtnH   = clippedBtnH();
              var __dlgMinW   = 110;

              function __makeDialogCellButton__(parent, label) {
                var cell = parent.add("group");
                cell.orientation   = "stack";
                cell.alignChildren = ["fill","fill"];
                cell.alignment     = ["left","center"];
                cell.margins       = 0;

                var b = cell.add("button", undefined, label);
                b.alignment     = ["fill","center"];
                b.preferredSize = [0, __dlgBtnH];
                b.minimumSize   = [__dlgMinW, __dlgBtnH];
                b.maximumSize   = [10000, __dlgBtnH];

                try { defocusButtonBestEffort(b); } catch (eDF) {}
                return { cell: cell, btn: b };
              }

              var __export = __makeDialogCellButton__(btns, "EXPORT FONT LIST");
              var exportCell = __export.cell;
              var exportBtn  = __export.btn;
              exportCell.visible = false;

              var __get = __makeDialogCellButton__(btns, "COPY FOUND FONTS");
              var getFontsCell = __get.cell;
              var getFontsBtn  = __get.btn;
              getFontsCell.visible = false;

              var __close = __makeDialogCellButton__(btns, "CLOSE");
              var closeBtn = __close.btn;
              closeBtn.onClick = function(){ try{ win.close(0); }catch(e){ try{ win.close(); }catch(e2){} } };
// State
              var currentRows = [];
              var currentFonts = [];

              function runAudit(){
                if(!app.project){ alert("No project is open."); return; }

                var fonts = getFontsInProject({});
                currentFonts = fonts.slice(0);

                clearList();
                currentRows = [];

                // Hide action buttons until we have results
                try { exportCell.visible = false; getFontsCell.visible = false; } catch(eVis0) {}

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

                // Reveal action buttons after list is populated
                try { exportCell.visible = true; getFontsCell.visible = true; } catch(eVis1) {}

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

              function _getSpotFolderFromProject_(){
                try{
                  if(!app.project || !app.project.file) return null; // requires saved project
                  var cur = app.project.file.parent; // folder containing the .aep (usually .../PROJECTS/AE)
                  var spotFolder = null;

                  // Walk up until we find a folder named "PROJECTS", then its parent is the SPOT folder
                  var guard = 0;
                  while(cur && guard < 25){
                    try{
                      if(cur.name && String(cur.name).toUpperCase() === "PROJECTS"){
                        spotFolder = cur.parent;
                        break;
                      }
                    }catch(eN){}
                    cur = cur.parent;
                    guard++;
                  }

                  // Fallback: assume .../PROJECTS/AE and go up two levels to reach SPOT
                  if(!spotFolder){
                    try{
                      if(app.project.file.parent && app.project.file.parent.parent){
                        // AE folder parent is PROJECTS; PROJECTS parent is SPOT
                        spotFolder = app.project.file.parent.parent;
                      }
                    }catch(eF){}
                  }

                  return spotFolder;
                }catch(e){ return null; }
              }

              function _ensureFolder_(folderObj){
                try{
                  if(!folderObj) return false;
                  if(folderObj.exists) return true;
                  return folderObj.create();
                }catch(e){ return false; }
              }

              function _uniqueDestFile_(destFolder, srcFile){
                // Avoid overwriting existing files; if a name collision occurs, append " (n)".
                try{
                  var base = srcFile.name || "font";
                  var dot  = base.lastIndexOf(".");
                  var stem = (dot>0) ? base.substring(0,dot) : base;
                  var ext  = (dot>0) ? base.substring(dot) : "";
                  var n = 0;
                  var out = new File(destFolder.fsName + "/" + base);
                  while(out.exists && n < 999){
                    n++;
                    out = new File(destFolder.fsName + "/" + stem + " (" + n + ")" + ext);
                  }
                  return out;
                }catch(e){
                  try{ return new File(destFolder.fsName + "/" + (srcFile.name||"font")); }catch(e2){ return null; }
                }
              }

              function copyFoundFontsToProjectFonts(){
                try{
                  if(!currentRows || !currentRows.length){
                    alert("Nothing to copy. Click FONT AUDIT first.");
                    return;
                  }
                  if(!app.project || !app.project.file){
                    alert("Please save the project first so ShineTools can locate the project folder hierarchy.");
                    return;
                  }

                  var spotFolder = _getSpotFolderFromProject_();
                  if(!spotFolder){
                    alert("Could not locate the SPOT folder from the project path.\n\nExpected: CLIENT / SPOT / PROJECTS / AE / <project>.aep\nAnd a FONTS folder in SPOT.");
                    return;
                  }

                  var fontsFolder = new Folder(spotFolder.fsName + "/FONTS");
                  if(!_ensureFolder_(fontsFolder)){
                    alert("Could not create or access the FONTS folder at:\n" + fontsFolder.fsName);
                    return;
                  }

                  var seenSrc = {};
                  var copied = 0;
                  var skipped = 0;
                  var missing = 0;
                  var errors = 0;

                  for(var i=0; i<currentRows.length; i++){
                    var row = currentRows[i];
                    if(!row) continue;

                    if(row.status !== "OK" || !row.path){
                      missing++;
                      continue;
                    }

                    var srcPath = String(row.path);
                    if(seenSrc[srcPath]){ skipped++; continue; }
                    seenSrc[srcPath] = true;

                    var srcFile = new File(srcPath);
                    if(!srcFile.exists){
                      missing++;
                      continue;
                    }

                    var dstFile = _uniqueDestFile_(fontsFolder, srcFile);
                    if(!dstFile){ errors++; continue; }

                    if(dstFile.exists){
                      skipped++;
                      continue;
                    }

                    try{
                      if(srcFile.copy(dstFile.fsName)) copied++;
                      else errors++;
                    }catch(eC){
                      errors++;
                    }
                  }

                  var msg = "COPY FOUND FONTS complete.\n\n" +
                            "Destination:\n" + fontsFolder.fsName + "\n\n" +
                            "Copied: " + copied + "\n" +
                            "Skipped (duplicates/existing): " + skipped + "\n" +
                            "Not found/unresolved: " + missing + "\n" +
                            "Errors: " + errors;

                  alert(msg);

                  try{
                    if(isMac()) safeCallSystem('open "' + fontsFolder.fsName + '"');
                    else safeCallSystem('explorer "' + fontsFolder.fsName + '"');
                  }catch(eR){}
                }catch(e){
                  alert("COPY FOUND FONTS error:\n" + e.toString());
                }
              }


              auditBtn.onClick = function(){
                try{ runAudit(); } catch(e){ alert("Font Audit error:\n" + e.toString()); }
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

              


              getFontsBtn.onClick = function(){
                try{ copyFoundFontsToProjectFonts(); } catch(e){ alert("COPY FOUND FONTS error:\n" + e.toString()); }
              };

              exportBtn.onClick = function(){
                try{ exportFontList(); } catch(e){ alert("Export error:\n" + e.toString()); }
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
        try { _primeUpdatesOnLaunch(); } catch (e) {}

              // Auto-run audit on open
              try{ runAudit(); }catch(eAuto){ /* ignore */ }

        win.center();
              win.show();

            }

                __RunFontAuditModal__();
            } catch (e) {
                alert("Font Audit error:\n" + String(e));
            }
        }


        


        function _buildTextTabUI() {


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
                        var _ddMinText = Math.max(50, TOPROW_DD_MIN_W_TEXT - TOPROW_DD_RIGHT_TRIM);
                        var _ddMaxTop  = Math.max(_ddMinText, TOPROW_DD_MAX_W - TOPROW_DD_RIGHT_TRIM);
                        animDD.minimumSize   = [_ddMinText, UI.btnH];
                        animDD.preferredSize = [_ddMinText, UI.btnH];
                        animDD.__shineNoTruncate = true; // keep full labels in popup (no manual ellipsis)
                        animDD.maximumSize   = [_ddMaxTop, UI.btnH]; // soft max (control can grow up to this)
        _lockDropdownPopupWidth(animDD, 12);

        // Right-edge alignment: reserve a small spacer so the dropdown's right edge lines up with the button grid below
        var animRightPad = animRow.add("group");
        animRightPad.minimumSize = [TOPROW_DD_RIGHT_TRIM, 1];
        animRightPad.maximumSize = [TOPROW_DD_RIGHT_TRIM, 10000];


                        try {
                            var f = animDD.graphics.font;
                            var newSize = Math.max(12, (f && f.size ? (f.size + 2) : 13));
                            animDD.graphics.font = ScriptUI.newFont((f && f.name) ? f.name : "Arial", (f && f.style) ? f.style : "Regular", newSize);
                        } catch (e) {}

                                var ANIM_ACTION_CLEAR = "Clear Added Animations";

                                function animRebuildDropdown() {
                                    try { animDD.removeAll(); } catch (e0) {}

                                    // (rebuilt)
                                    // Bundled (shipped) presets — shown first and not user-removable.
                                    var bundled = [];
                                    try { bundled = _stGetBundledTextAnimatorPaths(); } catch (eB) {}
                                    for (var bi = 0; bi < bundled.length; bi++) {
                                        var bp = bundled[bi];
                                        if (!bp) continue;
                                        var bItem = animDD.add("item", _stPrettyFileLabel(bp));
                                        bItem.__path = bp;
                                        bItem._isDefault = true;
                                    }

                                    // Divider — user-added items live below
                                    // Spacer line for visual separation
                                    var spacer = animDD.add("item", " ");
                                    spacer._isDivider = true;
                                    try { spacer.enabled = false; } catch (eSp) {}

                                    var divider = animDD.add("item", "— user presets —");
                                    divider._isDivider = true;
                                    try { divider.enabled = false; } catch (eDim) {}

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
                                            try { label = decodeURIComponent(label); } catch (eDec2) {}
                                            label = label.replace(/%20/g, " ");
                                            var it = animDD.add("item", label);
                                            it._fullText = label;
                                            it.__path = p;
                                        }
                                    }

                                    animDD.add("separator");
                                    var clearIt = animDD.add("item", ANIM_ACTION_CLEAR);
                                    clearIt.__action = "clear";
                                    // Default selection: none (do not auto-apply)
                                    try { animDD.selection = null; } catch (eSel) {}
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
                                    // Divider is non-selectable — reset to blank.
                                    if (sel && sel._isDivider) {
                                        try {
                                            animDD.__shineProgrammatic = true;
                                            animDD.selection = 0;
                                        } catch (eD) {}
                                        try { animDD.__shineProgrammatic = false; } catch (eD2) {}
                                        return;
                                    }
                                    // Cmd+click removes the item from the saved list (TEXT tab parity with MAIN).
                                    if (sel && sel.__path && _isCmdDown() && !sel._isDefault) {
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
                        var textAcc = createAccordion(textAccHost, null, function(){ requestRelayoutSoon(textContent, 40); }, "AccordionOrder_TEXT");



                textAcc.defineSection("BREAK APART TEXT", function(body){
                    addGrid2(body, [
                        { text: "BY CHARACTER", onClick: function(){ breakApartTextRun(SPLIT_MODE.CHARACTERS); } },
                        { text: "BY WORD",      onClick: function(){ breakApartTextRun(SPLIT_MODE.WORDS); } },
                        { text: "BY LINE",      onClick: function(){ breakApartTextRun(SPLIT_MODE.LINES); } }
                    ]);
                });

                


textAcc.defineSection("NUMBER COUNTERS", function(body){
    // Built-in AE counter presets shipped with ShineTools (relative to this script)
    function _stResolveShineToolsRoot() {
        try {
            var sf = File($.fileName);

            // Candidate roots to try (in priority order)
            var candidates = [];

            // 1) Folder containing this script (works when panel is installed normally)
            if (sf && sf.exists) {
                candidates.push(sf.parent);
            }

            // 2) After Effects "startup" folder derived install paths (covers when user runs a copy from Desktop)
            // Folder.startup typically points at the AE install folder (platform dependent).
            try {
                if (Folder.startup) {
                    candidates.push(Folder(Folder.startup.fsName + "/Scripts/ScriptUI Panels/ShineTools"));
                    candidates.push(Folder(Folder.startup.fsName + "/../Scripts/ScriptUI Panels/ShineTools"));
                }
            } catch (e2) {}


            // 3) macOS Applications fallback search (covers odd Folder.startup values)
            try {
                var appsRoot = new Folder("/Applications");
                if (appsRoot.exists) {
                    var aeFolders = appsRoot.getFiles("Adobe After Effects*");
                    for (var ai = 0; ai < aeFolders.length; ai++) {
                        var af = aeFolders[ai];
                        if (!(af instanceof Folder)) continue;

                        var st1 = new Folder(af.fsName + "/Scripts/ScriptUI Panels/ShineTools");
                        if (st1.exists) candidates.push(st1);

                        // Some installs have a "Support Files" subfolder—try stepping into it too
                        var st2 = new Folder(af.fsName + "/Support Files/Scripts/ScriptUI Panels/ShineTools");
                        if (st2.exists) candidates.push(st2);
                    }
                }
            } catch (e2b) {}
            // Validate candidates by checking for expected preset folder
            for (var i = 0; i < candidates.length; i++) {
                var c = candidates[i];
                try {
                    if (c && c.exists) {
                        var presetFolder = Folder(c.fsName + "/presets/text");
                        if (presetFolder.exists) return c;
                    }
                } catch (e3) {}
            }
        } catch (e) {}
        return null;
    }

    // Resolve a preset File from a relative path inside the ShineTools folder
    
    




    
    
// =============================================================
// Expression Engine Guard (Modern JavaScript required for counters)
// =============================================================
var _stModernExprCache = null;

function _stIsModernExpressionEngine(comp) {
    // Cache per-session to avoid repeated probing once we have a definitive result.
    if (_stModernExprCache !== null) return _stModernExprCache;

    try {
        // If we can't probe (no active comp), don't block — but also DON'T cache,
        // otherwise we may permanently "true" the cache before a real probe.
        if (!comp || !(comp instanceof CompItem)) {
            return true;
        }

        app.beginUndoGroup("ShineTools Expression Engine Probe");

        var testLayer = comp.layers.addNull();
        testLayer.enabled = false;

        var fxParade = testLayer.property("ADBE Effect Parade");
        var sliderFx = fxParade.addProperty("ADBE Slider Control");
        var sliderProp = sliderFx.property(1); // Slider

        // Modern-JS-only syntax. Legacy engine should throw an expression error.
        sliderProp.expression = "let x = 1; x;";

        // Force evaluation so expressionError is populated.
        try { sliderProp.value; } catch (eEval1) {}
        try { sliderProp.valueAtTime(comp.time, false); } catch (eEval2) {}

        var err = "";
        try { err = sliderProp.expressionError; } catch (eErr) { err = ""; }

        try { testLayer.remove(); } catch (eRem) {}
        app.endUndoGroup();

        // AE usually returns "" when there is no error; otherwise it returns a message.
        _stModernExprCache = (!err || err === "");
        return _stModernExprCache;

    } catch (e) {
        try { app.endUndoGroup(); } catch (e2) {}
        // Fail-open to avoid blocking users if probing fails for some unexpected reason.
        _stModernExprCache = null;
        return true;
    }
}


function _stEnsureModernExpressionsForCounters(comp) {
    if (_stIsModernExpressionEngine(comp)) return true;

    alert(
        "These number counters require the Modern JavaScript Expression Engine.\n\n" +
        "Enable it here:\n" +
        "After Effects → Settings (or Preferences) → Scripting & Expressions → Expression Engine → JavaScript\n\n" +
        "**YOU MUST RESTART AFTER EFFECTS** before using this counter."
    );
    return false;
}


// ============================================================
// OFFSET LAYERS (Utilities)
//   - Click: Linear frame offset (prompts for frames; can be negative)
//   - Option+Click: Exponential offset (curve + invert preview)
// ============================================================
var ST_OFFSETLAYERS_EXP_TOTAL_SPREAD_FRAMES = 24; // total spread for Exponential mode



function _stApplyCounterPreset(fileName, newLayerName) {
    // Guard: counters rely on Modern JavaScript expressions
    if (!_stEnsureModernExpressionsForCounters(app.project && app.project.activeItem)) return;


        try {
            var base = "/Applications/Adobe After Effects 2025/Scripts/ScriptUI Panels/ShineTools/presets/text/";
            var f = new File(base + String(fileName || ""));
            if (!f || !f.exists) {
                alert("Counter preset not found:\n" + (f ? f.fsName : String(fileName)));
                return;
            }

            // Capture state so we can rename the newly-created text layer reliably.
            var comp = null;
            try { comp = (app.project && app.project.activeItem && (app.project.activeItem instanceof CompItem)) ? app.project.activeItem : null; } catch (eC) {}
            var beforeCount = 0;
            try { beforeCount = comp ? comp.layers.length : 0; } catch (eBC) { beforeCount = 0; }

            if ($.global && $.global._shineToolsApplyFFXPreset) {
                $.global._shineToolsApplyFFXPreset(f.fsName);
            } else {
                alert("Preset apply helper is unavailable.");
                return;
            }

            // Rename the new text layer (do NOT touch comp name).
            if (newLayerName && comp) {
                try {
                    var afterCount = comp.layers.length;
                    var newLyr = null;

                    if (afterCount > beforeCount) {
                        // AE adds new layers at the top (index 1).
                        newLyr = comp.layer(1);
                    } else {
                        // Fallback: use selection if preset selected something.
                        try { if (comp.selectedLayers && comp.selectedLayers.length) newLyr = comp.selectedLayers[0]; } catch (eSel) {}
                    }

                    if (newLyr && (newLyr instanceof TextLayer)) {
                        newLyr.name = String(newLayerName);
                    }
                } catch (eRN) {}
            }
        } catch (e) {
            alert("Could not apply counter preset.\n\n" + e.toString());
        }
    }


addGrid2(body, [
        {
            text: "SIMPLE",
            onClick: function(){ _stApplyCounterPreset("Counter Countup Monospaced.ffx", "SIMPLE COUNTER"); }
        },
        {
            text: "$ CURRENCY $",
            onClick: function(){ _stApplyCounterPreset("Currency Counter Monospaced.ffx", "CURRENCY COUNTER"); }
        },
        {
            text: "% PERCENT %",
            onClick: function(){ _stApplyCounterPreset("Percentage Counter Monospaced.ffx", "PERCENT COUNTER"); }
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
                        },
                        {
                            text: "CREATE SHAPE",
                            onClick: createShapesFromText_Util,
                            helpTip: "Runs: Layer > Create > Create Shapes from Text\n\nSelect one or more TEXT layers, then click."
                        }
                    ]);
                });

                

                // TEXT TAB: Fonts
                textAcc.defineSection("FONTS", function(body){
                    // 2-column grid (placeholder auto-added if odd count)
                    addGrid2(body, [
                        {
                            text: "FONT AUDIT...",
                            onClick: function(){ _showFontAuditDialog(); }
                        }
                    ]);
                });

                

// Build accordion in persisted order
                textAcc.build();
            } catch (eBT) {
                alert("TEXT tab build error:\n\n" + eBT.toString());
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


            _buildTextTabUI();


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



        // ============================================================
        // PASS 3.4: TAB BUILDERS (extracted for readability; NO behavior change)
        // ============================================================
        function _buildUpdatesTab(tabUpdates) {
            // -------------------------
            // UPDATES TAB CONTENT (UI only for now)
            // Centralized labels/status strings (reduce repeated literals)
            var __UPD_LABELS = {
                BTN_CHECK: "CHECK FOR UPDATES",
                BTN_INSTALL: "INSTALL UPDATE"
            };

            var __UPD_STATUS = {
                CHECKING: "Checking updates…",
                UP_TO_DATE: "Up to date.",
                UPDATE_AVAILABLE: "Update available.",
                RUN_CHECK_FIRST: "Run CHECK FOR UPDATES first.",
                NO_PENDING: "No pending update to install. Run CHECK FOR UPDATES first.",
                NO_URL: "Update is available, but no downloadable installer/script URL was provided in version.json.",
                DL_INSTALLER: "Downloading installer…",
                DL_SCRIPT: "Downloading script update…",
                INSTALLING_ADMIN: "Installing (admin password required)…",
                SUCCESS_RESTART: "Update successful, please restart After Effects.",
                READ_FAIL: "Downloaded version.json but couldn't read it.",
                MKDIR_FAIL: "Could not create cache folder.",
                SELF_PATH_FAIL: "Could not determine installed .jsx path for self-replace.",
                HTML_RETRY_CDN: "Primary download returned HTML. Retrying via CDN…",
                HTML_RETRY_MEDIA: "Still getting HTML. Retrying via media endpoint…"
            };

            // -------------------------
            var updatesWrap = tabUpdates.add("group");
            updatesWrap.orientation   = "column";
            updatesWrap.alignChildren = ["fill", "top"];
            updatesWrap.alignment     = ["fill", "top"];
            updatesWrap.margins       = [12, 18, 12, 10];
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

            // Button cells (stack groups) to match MAIN tab grid button architecture
            var checkCell = updatesControlsRow.add("group");
            checkCell.orientation   = "stack";
            checkCell.alignChildren = ["fill","fill"];
            checkCell.alignment     = ["left","center"];
            checkCell.margins       = 0;

            var btnCheckUpdates = checkCell.add("button", undefined, __UPD_LABELS.BTN_CHECK);
            try { defocusButtonBestEffort(btnCheckUpdates); } catch(eDFu1) {}


                        _setHelpTipBestEffort(btnCheckUpdates, "Check GitHub for a newer ShineTools version. If an update is found, INSTALL UPDATE will appear below.");
            // Auto-check toggle (persisted)
            var autoChkGrp = updatesControlsRow.add("group");
            autoChkGrp.orientation   = "row";
            autoChkGrp.alignChildren = ["left","center"];
            autoChkGrp.alignment     = ["left","center"];
                        _focusSafeMargins(autoChkGrp, 4, 1, 0, 1); // focus ring breathing room
            autoChkGrp.spacing       = 6;

            var cbAutoCheck = autoChkGrp.add("checkbox", undefined, "Auto check on launch");
                        _setHelpTipBestEffort(cbAutoCheck, "When enabled, ShineTools will automatically run a version check each time the panel launches.");
            // These only appear AFTER a newer version is detected.
            // Keep INSTALL UPDATE directly UNDER the CHECK button (not in the same row),
            // so the Changelog and its box can live below both.
            var installRow = updatesWrap.add("group");
            installRow.orientation   = "row";
            installRow.alignChildren = ["fill","center"];
            installRow.alignment     = ["fill","top"];
            installRow.margins       = 0;
            installRow.spacing       = 0;

            var installCell = installRow.add("group");
            installCell.orientation   = "stack";
            installCell.alignChildren = ["fill","fill"];
            installCell.alignment     = ["left","center"];
            installCell.margins       = 0;

            var btnInstallUpdate = installCell.add("button", undefined, __UPD_LABELS.BTN_INSTALL);
            try { defocusButtonBestEffort(btnInstallUpdate); } catch(eDFu2) {}
                        _setHelpTipBestEffort(btnInstallUpdate, "Install the downloaded update (only available after a newer version is detected).");
            // Start hidden (only CHECK is visible on load).
            btnInstallUpdate.visible = false;
            btnInstallUpdate.enabled = false;


            // Spacer: push Changelog lower below the buttons
            var _updatesChangelogSpacer = updatesWrap.add("group");
            _updatesChangelogSpacer.minimumSize = [10, 14];
            _updatesChangelogSpacer.maximumSize = [10000, 14];

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

            var __UPD_SETTINGS_SECTION = "ShineToolsUpdates";

            var __UPD_KEYS = {
                CHANGELOG_TEXT: "changelogText",
                LAST_CHECKED: "lastChecked",
                CACHED_PAYLOAD: "cachedPayload",
                AUTO_CHECK: "autoCheckOnLaunch"
            };


            // Populate Changelog immediately on launch from cached data (no need to click CHECK).
            try {
                var cachedCL = _settingsGet(__UPD_SETTINGS_SECTION, __UPD_KEYS.CHANGELOG_TEXT, "");
                if (cachedCL && cachedCL.length) {
                    chBox.text = cachedCL;
                } else {
                    // If no cached text, try cached payload (offline friendly)
                    var cp = _loadCachedPayloadSafe();
                    if (cp && cp.latest) {
                        var _n = cp.notes || cp.changelog || [];
                        if (typeof _n === "string") _n = [_n];
                        var _h = cp.history || cp.changelogHistory || cp.releaseHistory || null;
                        _setUpdatesChangelogStructured(cp.latest, _n, _h);
                    }
                }

                var cachedLast = _settingsGet(__UPD_SETTINGS_SECTION, __UPD_KEYS.LAST_CHECKED, "");
                if (cachedLast && cachedLast.length) {
                    kvLast.val.text = cachedLast;
                }


            // Restore persisted Auto-check state
            var __autoCheckEnabled = false;
            try {
                var rawAuto = _settingsGet(__UPD_SETTINGS_SECTION, __UPD_KEYS.AUTO_CHECK, "false");
                __autoCheckEnabled = (String(rawAuto).toLowerCase() === "true");
            } catch (eAuto0) { __autoCheckEnabled = false; }
            try { cbAutoCheck.value = __autoCheckEnabled; } catch (eAuto1) {}
            cbAutoCheck.onClick = function(){
                try {
                    __autoCheckEnabled = !!cbAutoCheck.value;
                    _settingsSet(__UPD_SETTINGS_SECTION, __UPD_KEYS.AUTO_CHECK, __autoCheckEnabled ? "true" : "false");
                } catch (eAuto2) {}
            };

            } catch (eCacheInit) {}


            // GitHub update check
            var GITHUB_VERSION_JSON_URL = "https://raw.githubusercontent.com/ShineTools1333/ShineTools/main/version.json";


    // --- version.json format (single source of truth) ---
    // Required:
    //   "latest": "1.5"
    //   "jsxUrl": "https://raw.githubusercontent.com/.../ShineTools.jsx"
    //   "notes": ["Current release note 1", "Current release note 2"]
    // Optional:
    //   "history": [ { "version": "1.4", "notes": ["Older note"] }, ... ]
    // Notes:
    //   - Do NOT prefix versions with "v" (UI formatting handles labels).
    //   - Dates are optional; the panel displays today's date for CURRENT VERSION.
    // -----------------------------------------------
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

            // ------------------------------------------------------------
            // Updates tab persistence (simple cache so Changelog survives AE restart)
            // ------------------------------------------------------------
            function _cacheChangelogTextSafe(t) {
                try {
                    if (t === undefined || t === null) return;
                    // Never cache placeholder dash
                    if (String(t).replace(/\s+/g,"") === "—") return;
                    _settingsSet(__UPD_SETTINGS_SECTION, __UPD_KEYS.CHANGELOG_TEXT, String(t));
                } catch (e) {}
            }

            function _cacheUpdatesPayloadSafe(obj) {
                // Optional: persist last good parsed JSON for offline launch
                try {
                    var s = null;
                    if (typeof JSON !== "undefined" && JSON && JSON.stringify) {
                        s = JSON.stringify(obj);
                    } else if (obj && obj.toSource) {
                        s = obj.toSource();
                    } else {
                        s = String(obj);
                    }
                    _settingsSet(__UPD_SETTINGS_SECTION, __UPD_KEYS.CACHED_PAYLOAD, s);
                } catch (e) {}
            }

            function _loadCachedPayloadSafe() {
                try {
                    var raw = _settingsGet(__UPD_SETTINGS_SECTION, __UPD_KEYS.CACHED_PAYLOAD, "");
                    if (!raw || !raw.length) return null;

                    // Try JSON.parse first
                    try {
                        if (typeof JSON !== "undefined" && JSON && JSON.parse) {
                            return JSON.parse(raw);
                        }
                    } catch (eJSON) {}

                    // Fallback to eval for ExtendScript
                    try {
                        return eval("(" + raw + ")");
                    } catch (eE) {}

                } catch (e) {}
                return null;
            }


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
                        val = val.replace(/\\n/g, "\n").replace(/\\r/g, "\r").replace(/\\t/g, "\t").replace(/\\\"/g, "\"").replace(/\\\\/g, "\\");
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
                try {
                    kvLast.val.text = _formatStamp(d || new Date());
                    _settingsSet(__UPD_SETTINGS_SECTION, __UPD_KEYS.LAST_CHECKED, kvLast.val.text);
                } catch (e) {}
            }

            function _setUpdatesStatus(msg) {
                try { kvStatus.val.text = msg || ""; } catch (e) {}
            }

            function _setUpdatesVersion(ver) {
                try { kvLatest.val.text = ver || "—"; } catch (e) {}
            }





            function _setUpdatesChangelogStructured(latestVer, currentNotes, historyArr) {
                // Visual separation:
                //   CURRENT VERSION (bold-ish notes)
                //   PREVIOUS RELEASES (history list)
                try {
                    var s = "";

                    var vLatest = String(latestVer || "").replace(/^v\s*/i, "");
                    var today = _formatStamp(new Date());

                    // Current section
                    if (vLatest) {
                        s += "CURRENT VERSION (" + vLatest + ") — " + today + "\n";
                    } else {
                        s += "CURRENT VERSION — " + today + "\n";
                    }

                    var cn = currentNotes || [];
                    if (typeof cn === "string") cn = [cn];

                    if (cn && cn.length) {
                        for (var i=0; i<cn.length; i++) {
                            s += "• " + String(cn[i]) + "\n";
                        }
                    } else {
                        s += "• (NO RELEASE NOTES)\n";
                    }

                    s += "\n";
                    s += "----------------------------------------\n";
                    s += "\n";
                    s += "PREVIOUS RELEASES\n";

                    // History section
                    if (historyArr && historyArr.length) {
                        s += "\n";
                        for (var h = 0; h < historyArr.length; h++) {
                            var it = historyArr[h];
                            if (!it) continue;

                            var v = it.version || it.ver || it.v || "";
                            v = String(v || "").replace(/^v\s*/i, "");
                            if (!v) continue;

                            var d = it.date || it.when || it.timestamp || "";
                            if (d) s += v + " — " + d + "\n";
                            else   s += v + "\n";

                            var notes = it.notes || it.changes || it.items || [];
                            if (typeof notes === "string") notes = [notes];

                            if (notes && notes.length) {
                                for (var n = 0; n < notes.length; n++) {
                                    s += "• " + notes[n] + "\n";
                                }
                            } else {
                                s += "• (no notes)\n";
                            }
                            s += "\n";
                        }
                    } else {
                        s += "• (no previous releases)\n";
                    }

                    s = s.replace(/\n+$/, "");
                    chBox.text = s || "—";
                    _cacheChangelogTextSafe(chBox.text);
                } catch (e) {
                    try {
                        var cached = _settingsGet(__UPD_SETTINGS_SECTION, __UPD_KEYS.CHANGELOG_TEXT, "");
                        if (cached && cached.length) chBox.text = cached;
                        else chBox.text = "—";
                    } catch(_e) { try { chBox.text = "—"; } catch(__e) {} }
                }
            }


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
                // Single source of truth: prefer SHINETOOLS_VERSION when available.
                try { if (typeof SHINETOOLS_VERSION !== "undefined" && SHINETOOLS_VERSION) return String(SHINETOOLS_VERSION); } catch (eV) {}
                // Back-compat: Pull from footer if possible, else fallback.
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
                    _setUpdatesStatus(__UPD_STATUS.MKDIR_FAIL);
                    return;
                }

                _setUpdatesLastChecked(new Date());

                _setUpdatesStatus(__UPD_STATUS.CHECKING);

                // IMPORTANT: GITHUB_VERSION_JSON_URL must ultimately point to a *file* direct link for version.json.
                // If it's a folder link, GitHub will return HTML if the URL isn't raw and JSON.parse will fail.
                var versionUrl = _normalizeUpdateUrl(GITHUB_VERSION_JSON_URL);
                var versionPath = cacheDir.fsName + "/version.json";

                var dl = _downloadWithRetries(versionUrl, versionPath, 3);
                if (!dl.ok) {
                    _setUpdatesStatus("Update check failed: could not download version.json. " + (dl.msg ? ("(" + dl.msg + ")") : ""));
                    try { if (ST && ST.Log) ST.Log.e("updates", "Download version.json failed", dl.msg || ""); } catch(eLg) {}
                    return;
                }

                var raw = _readTextFile(versionPath);
                if (!raw) {
                    _setUpdatesStatus(__UPD_STATUS.READ_FAIL);
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

                // ExtendScript on some AE builds can be flaky with JSON.parse (or missing altogether).
                // As a controlled fallback (our own GitHub JSON), eval can correctly parse arrays/objects (incl. history).
                if (!data) {
                    try {
                        // Ensure we eval a single expression object
                        data = eval("(" + clean + ")");
                    } catch (eEVAL) {
                        data = null;
                    }
                }

                // Minimal fallback if parsing isn't available / fails (notes only)

                if (!data) {
                    try { if (ST && ST.Log) ST.Log.e("updates", "Failed to parse version.json; using minimal fallback", ""); } catch(eLgP) {}

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

                // New: prefer continuous JSON history when present
                var historyArr = data.history || data.changelogHistory || data.releaseHistory || null;
                _setUpdatesChangelogStructured(data.latest, notes, historyArr);
                _cacheUpdatesPayloadSafe(data);
                _cacheChangelogTextSafe(chBox.text);

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
                    _setUpdatesStatus(__UPD_STATUS.UP_TO_DATE);
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
                _setUpdatesStatus(__UPD_STATUS.UPDATE_AVAILABLE);
                return;
            }

            function _doInstallUpdate() {
                // Install the pending update (requires __UPDATE_STATE.available === true)
                try {
                    if (!__UPDATE_STATE || !__UPDATE_STATE.available || !__UPDATE_STATE.latest) {
                        _setUpdatesStatus(__UPD_STATUS.NO_PENDING);
                        return;
                    }

                    var cacheRoot = Folder.userData.fsName + "/ShineTools";
                    var cacheDir = _ensureFolder(cacheRoot);
                    if (!cacheDir) cacheDir = _ensureFolder(Folder.temp.fsName + "/ShineTools");
                    if (!cacheDir) {
                        _setUpdatesStatus(__UPD_STATUS.MKDIR_FAIL);
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

                        _setUpdatesStatus(__UPD_STATUS.DL_SCRIPT);
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
                                    _setUpdatesStatus(__UPD_STATUS.HTML_RETRY_CDN);
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
                                        _setUpdatesStatus(__UPD_STATUS.HTML_RETRY_MEDIA);
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
        _setUpdatesStatus("Install failed: downloaded file does not look like ShineTools_v1.0.jsx. " + (why.reason ? ("(" + why.reason + ")") : ""));
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
                            _setUpdatesStatus(__UPD_STATUS.SELF_PATH_FAIL);
                            return;
                        }

                        var thisFile = new File(thisPath);

                        // Prefer installing updates into the shared main file (user-writable).
                        // This avoids permission issues when the loader lives in /Applications/...
                        try {
                            var __stSharedMain = _stGetSharedMainFile();
                            if (__stSharedMain) {
                                try { if (__stSharedMain.parent && !__stSharedMain.parent.exists) __stSharedMain.parent.create(); } catch (eSMk) {}
                                thisFile = __stSharedMain;
                            }
                        } catch (eSMain) {}
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
                            // If we targeted the system-wide shared main in /Library, we may need admin privileges.
                            try {
                                var destFS = thisFile && thisFile.fsName ? String(thisFile.fsName) : "";
                                var srcFS  = newFile && newFile.fsName ? String(newFile.fsName) : "";
                                var needsAdmin = (destFS.indexOf("/Library/") === 0);

                                if (needsAdmin && srcFS && destFS) {
                                    try { _setUpdatesStatus(__UPD_STATUS.INSTALLING_ADMIN); } catch (eST) {}

                                    // Use AppleScript to request admin privileges and perform the copy.
                                    // NOTE: We keep it simple: copy over destination (and rely on our backup above).
                                    var cmd = 'osascript -e ' +
                                              '"do shell script \"cp -f \\"' + srcFS.replace(/"/g, '\\"') + '\\" \\"' + destFS.replace(/"/g, '\\"') + '\\"\" with administrator privileges"';

                                    var out = null;
                                    try { out = safeCallSystem(cmd); } catch (eSC) { out = null; }

                                    // Re-check
                                    try { copied = (thisFile && thisFile.exists); } catch (eEX) { copied = false; }
                                }
                            } catch (eADM) {}

                            if (!copied) {
                                _setUpdatesStatus("Downloaded v" + latest + " but couldn't replace the installed .jsx (permissions).");
                                return;
                            }
                        }

                        // Mark as installed (still requires restart for the UI to show new version)
                        __UPDATE_STATE.available = false;
                        btnInstallUpdate.enabled = false;
                        try { btnInstallUpdate.visible = false; } catch (eV0) {}
                    
                        try { relayoutScoped(tabUpdates); } catch (eRL0) {}
                        _setFooterUpdateIndicator(true);
                        _setUpdatesStatus(__UPD_STATUS.SUCCESS_RESTART);
    return;
                    }

                    // Optional PKG path (future)
                    if (__UPDATE_STATE.pkgUrl) {
                        var pkgUrl = _normalizeUpdateUrl(String(__UPDATE_STATE.pkgUrl));
                        var pkgName = "ShineTools_" + latest.replace(/[^\w\.\-]/g,"_") + ".pkg";
                        var pkgPath = cacheDir.fsName + "/" + pkgName;

                        _setUpdatesStatus(__UPD_STATUS.DL_INSTALLER);
                        var dlPkg = _curlDownload(pkgUrl, pkgPath);
                        if (!dlPkg.ok) {
                            _setUpdatesStatus("Failed to download PKG." + (dlPkg.msg ? (" (" + dlPkg.msg + ")") : ""));
                            return;
                        }

                        _setUpdatesStatus(__UPD_STATUS.INSTALLING_ADMIN);
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
                        _setUpdatesStatus(__UPD_STATUS.SUCCESS_RESTART);
    return;
                    }

                    _setUpdatesStatus(__UPD_STATUS.NO_URL);
                } catch (e) {
                    try { if (ST && ST.Log) ST.Log.e("updates", "Install failed", e); } catch(eLgI) {}
                    _setUpdatesStatus("Install failed: " + String(e));
                }
            }

            btnInstallUpdate.onClick = function () {
                _safeRun("updates", "Install update", function () {
                    if (!__UPDATE_STATE || !__UPDATE_STATE.checked) {
                        _setUpdatesStatus(__UPD_STATUS.RUN_CHECK_FIRST);
                        return;
                    }
                    if (!__UPDATE_STATE.available) {
                        _setUpdatesStatus(__UPD_STATUS.UP_TO_DATE);
                        _setFooterUpdateIndicator(true);
                        return;
                    }
                    _doInstallUpdate();
                }, false);
            };

            function _primeUpdatesOnLaunch() {
                // Populate changelog from version.json on panel load (no last-checked stamp, no status changes).
                try {
                    var cacheRoot = Folder.userData.fsName + "/ShineTools";
                    var cacheDir = _ensureFolder(cacheRoot);
                    if (!cacheDir) cacheDir = _ensureFolder(Folder.temp.fsName + "/ShineTools");
                    if (!cacheDir) return;

                    var versionUrl = _normalizeUpdateUrl(GITHUB_VERSION_JSON_URL);
                    var versionPath = cacheDir.fsName + "/version.json";

                    var dl = _downloadWithRetries(versionUrl, versionPath, 2);
                    if (!dl.ok) return;

                    var raw = _readTextFile(versionPath);
                    if (!raw) return;

                    var clean = String(raw).replace(/^\uFEFF/, "").replace(/^\s+|\s+$/g, "");

                    var data = null;
                    try {
                        if (typeof JSON !== "undefined" && JSON && JSON.parse) data = JSON.parse(clean);
                    } catch (eJSON) { data = null; }

                    if (!data) return;

                    if (data.latest) _setUpdatesVersion(String(data.latest));

                    var notes = data.notes || data.changelog || [];
                    if (typeof notes === "string") notes = [notes];

                    var historyArr = data.history || data.changelogHistory || data.releaseHistory || null;
                    _setUpdatesChangelogStructured(data.latest, notes, historyArr);
                } catch (e) {}
            }


            btnCheckUpdates.onClick = function () {
                _safeRun("updates", "Check for updates", function () {
                    _doCheckForUpdates();
                }, false) || (function(){})();

                // Preserve prior user-facing error messaging if something bubbles outside _safeRun
            };



            // Auto-check on panel launch (when enabled): check for updates and auto-open the UPDATES tab if needed.
            try {
                $.global.__ShineToolsUpdateAutoCheck = function(){
                    try {
                        _doCheckForUpdates();
                        if (__UPDATE_STATE && __UPDATE_STATE.available) {
                            try { _selectTopTab("UPDATES"); } catch (eT) {}
                        }
                    } catch (e) {}
                };
            } catch (eG) {}

            try {
                if (__autoCheckEnabled) {
                    app.scheduleTask("try{ if($.global.__ShineToolsUpdateAutoCheck) $.global.__ShineToolsUpdateAutoCheck(); }catch(e){}", 250, false);
                }
            } catch (eS) {}



        }

        function _buildRequestsTab(tabRequests) {
            // -------------------------
            // REQUESTS TAB CONTENT
            // -------------------------
            var reqWrap = tabRequests.add("group");
            reqWrap.orientation   = "column";
            reqWrap.alignChildren = ["fill", "top"];
            reqWrap.alignment     = ["fill", "top"];
            reqWrap.margins       = [12, 18, 12, 10];
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

            // SUBMIT button (use same architecture as MAIN tab grid buttons to avoid macOS blue focus ring)
            var submitCell = reqBtns.add("group");
            submitCell.orientation   = "stack";
            submitCell.alignChildren = ["fill","fill"];
            submitCell.alignment     = ["left","center"];
            submitCell.margins       = 0;

            var btnSaveReq = submitCell.add("button", undefined, "SUBMIT");
            try { defocusButtonBestEffort(btnSaveReq); } catch(eDF) {}

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
            // Auto-route submissions to the shared mounted volume.
            var typ = "Bug";
            try { typ = ddType.selection ? String(ddType.selection.text) : "Bug"; } catch(eT) { typ = "Bug"; }
            var baseRoot = "/Volumes/LIBRARY ELEMENTS_1/ShineTools";
            var subDir = (typ === "Bug") ? "Bugs" : "Requests";
            var targetPath = baseRoot + "/" + subDir;
            var folder = new Folder(targetPath);
            if (!folder.exists) {
                try { folder.create(); } catch(eMk) {}
            }
            if (!folder.exists) {
                // If the shared volume isn't mounted, fall back to prompting.
                try { folder = Folder.selectDialog("Shared volume not found. Choose where to save your submission (.txt)"); } catch(eFD) { folder = null; }
            }
            if (!folder) {
                reqStatus.text = "Save canceled.";
                return;
            }

            var nm = "";
            try { nm = String(rowName.field.text || ""); } catch(eN2) { nm = ""; }
            nm = nm.replace(/[\\\/\:\*\?\"\<\>\|]/g, "_"); // safe file chars

            var prefix = (typ === "Bug") ? "ShineTools_Bug_" : "ShineTools_Request_";
            var base = prefix + (nm ? nm + "_" : "") + _timestampForFilename() + ".txt";
            var outFile = new File(folder.fsName + "/" + base);

            outFile.encoding = "UTF-8";
            outFile.lineFeed = "Unix";
            if (!outFile.open("w")) {
                reqStatus.text = "Could not write file.";
                return;
            }
            outFile.write(_buildRequestText());
            outFile.close();

            reqStatus.text = "Submitted: " + outFile.name;
            try {
                if (isMac && isMac()) safeCallSystem('open -R "' + outFile.fsName + '"');
            } catch(eR) {}
            try { pal.update(); } catch(eU2) {}
        } catch(e) {
            reqStatus.text = "Save failed: " + String(e);
        }
    };;



        }

        

        function _buildHelpTab(tabHelp) {
            // Ensure HELP tab lays out from the top (prevents vertical centering gaps)
            try {
                tabHelp.orientation = "column";
                tabHelp.alignChildren = ["fill", "top"];
                tabHelp.alignment = ["fill", "top"];
                tabHelp.spacing = 0;
                tabHelp.margins = 0;
            } catch (eLay) {}

            var helpWrap = tabHelp.add("group");
            helpWrap.orientation = "column";
            helpWrap.alignChildren = ["fill", "top"];
            helpWrap.alignment = ["fill", "top"];
            helpWrap.margins = [12, 8, 12, 10];
            helpWrap.spacing = 0; // ultra-tight (per Jim)

            var SHINE_YELLOW_RGB = [1.0, 0.82, 0.0]; // Shine yellow

            function _setShineYellowBold(st) {
                try {
                    if (!st || !st.graphics) return;
                    var g = st.graphics;
                    // bold (best-effort)
                    try {
                        var f = g.font;
                        if (f && ScriptUI && ScriptUI.newFont && ScriptUI.FontStyle) {
                            g.font = ScriptUI.newFont(f.family, ScriptUI.FontStyle.BOLD, f.size);
                            try { st.font = g.font; } catch(eF2) {}
                        }
                    } catch (eF) {}
                    try { g.foregroundColor = g.newPen(g.PenType.SOLID_COLOR, SHINE_YELLOW_RGB, 1); } catch (eC) {}
                } catch (e) {}
            }

            function _spacer(px) {
                try {
                    var h = Math.max(0, px || 0);
                    if (h === 0) return null;
                    var sp = helpWrap.add("group");
                    sp.minimumSize = [0, h];
                    sp.maximumSize = [10000, h];
                    sp.preferredSize = [0, h];
                    return sp;
                } catch (e) {}
                return null;
            }

            // Title
            var helpTitleTop = helpWrap.add("statictext", undefined, "NAVIGATING THE SHINETOOLS INTERFACE:");
            try { helpTitleTop.alignment = ["fill","top"]; } catch(e) {}

            
            _setShineYellowBold(helpTitleTop);
// Divider
            var helpDivider = helpWrap.add("statictext", undefined, "----------------------------------");
            try { helpDivider.alignment = ["fill","top"]; } catch(e) {}

            _spacer(12);

            // --- SECTIONS ---
            var hdrSections = helpWrap.add("statictext", undefined, "SECTIONS");
            _setShineYellowBold(hdrSections);

            function _addHelpLine(str) {
                var st = helpWrap.add("statictext", undefined, String(str || ""));
                try { st.alignment = ["fill", "top"]; } catch (e) {}
                return st;
            }

            // SECTIONS bullets (single-line controls to avoid extra vertical padding)
            _addHelpLine("• Single-click a section name to expand or collapse it");
            _addHelpLine("• SHIFT-click a section name to expand multiple sections");
            _addHelpLine("• CMD-click a section name to collapse all sections");
            _addHelpLine("• Hidden arrows on the right side of each section allow you to reorder sections");

            _spacer(12);

            // --- BUTTONS & MODIFIERS ---
            var hdrButtons = helpWrap.add("statictext", undefined, "BUTTONS & MODIFIERS");
            _setShineYellowBold(hdrButtons);

            _addHelpLine("• Buttons with a yellow indicator support modifier keys");
            _addHelpLine("  (CMD, OPTION, or SHIFT for alternate actions)");
            _addHelpLine("• OPTION-click on a section name to reorder the buttons within that section");

            _spacer(12);

            // --- FAVORITES & IMPORTS ---
            var hdrFav = helpWrap.add("statictext", undefined, "FAVORITES & IMPORTS");
            _setShineYellowBold(hdrFav);

            _addHelpLine("• Single-click the PLUS (+) icon to add files to your Favorites");
            _addHelpLine("• CMD-click the PLUS (+) icon to add files to your Favorites and timeline");
            _addHelpLine("• In the Favorites list:");
            _addHelpLine("  – CMD-click a file to remove it from the list");
            _addHelpLine("  – OPTION-click sets blend mode to ADD");

            _spacer(12);

            // --- REQUIRED SETTINGS ---
            var hdrReq = helpWrap.add("statictext", undefined, "REQUIRED SETTINGS");
            _setShineYellowBold(hdrReq);

            _addHelpLine("• Enable \"Allow Scripts to Write Files and Access Network\"");
            _addHelpLine("• File > Project Settings > Expressions must be set to JavaScript");

            // PASS 13: DEBUG INFO (bottom of HELP tab, hidden by default; toggled via CMD-click HELP)
            try {
                ST.UI = ST.UI || {};
                ST.UI._helpDebugVisible = false;

                var dbgPanel = tabHelp.add("panel", undefined, "DEBUG INFO");
                dbgPanel.orientation   = "column";
                dbgPanel.alignChildren = ["fill","top"];
                dbgPanel.alignment     = ["fill","bottom"];
                dbgPanel.margins       = 10;
                dbgPanel.spacing       = 8;

                // Save normal sizes for restore
                try { ST.UI._dbgPanelPrefSize = dbgPanel.preferredSize; } catch (eS0) {}
                try { ST.UI._dbgPanelMinSize  = dbgPanel.minimumSize; } catch (eS1) {}
                try { ST.UI._dbgPanelMaxSize  = dbgPanel.maximumSize; } catch (eS2) {}

                var dbgTxt = dbgPanel.add("statictext", undefined, "", { multiline:true });
                dbgTxt.alignment = ["fill","top"];
                dbgTxt.preferredSize = [0, 120];

                var dbgBtns = dbgPanel.add("group");
                dbgBtns.orientation = "row";
                dbgBtns.alignChildren = ["left","center"];
                dbgBtns.alignment = ["left","top"];
                dbgBtns.margins = 0;
                dbgBtns.spacing = 8;

                var btnCopyDebug = dbgBtns.add("button", undefined, "COPY DEBUG INFO");
                _setHelpTipBestEffort(btnCopyDebug, "Copies a short system/version snapshot + last error to the clipboard (for troubleshooting).");

                var btnRefreshDebug = dbgBtns.add("button", undefined, "REFRESH");
                _setHelpTipBestEffort(btnRefreshDebug, "Refreshes the debug info panel.");

                function _refreshDebugPanelText() {
                    try { dbgTxt.text = _stGetDebugInfoString(); } catch (e) { try { dbgTxt.text = "Unable to gather debug info."; } catch(e2) {} }
                }

                btnRefreshDebug.onClick = function () {
                    _safeRun("ui", "Refresh debug info", function () { _refreshDebugPanelText(); }, false);
                };

                btnCopyDebug.onClick = function () {
                    _safeRun("ui", "Copy debug info", function () {
                        var s = _stGetDebugInfoString();
                        _refreshDebugPanelText();
                        _stCopyToClipboardBestEffort(s);
                    }, false);
                };

                // Register for toggle
                ST.UI._helpDebugPanel = dbgPanel;
                ST.UI._helpDebugText = dbgTxt;
                ST.UI._helpDebugRefresh = _refreshDebugPanelText;

                // Hide/collapse by default
                try { dbgPanel.visible = false; } catch (eV0) {}
                try { dbgPanel.enabled = false; } catch (eE0) {}
                try { dbgPanel.minimumSize = [0,0]; dbgPanel.maximumSize = [0,0]; dbgPanel.preferredSize = [0,0]; } catch (eSz0) {}

                // Fill once (not visible until toggled)
                try { _refreshDebugPanelText(); } catch (eF) {}
            } catch (eDbg) {}
        }

        _buildUpdatesTab(tabUpdates);

        _buildRequestsTab(tabRequests);

        _buildHelpTab(tabHelp);


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
        var TOPROW_DD_MIN_W_MAIN = 80;  // MAIN tab dropdown default width (matches header label)
        var TOPROW_DD_MIN_W_TEXT = TOPROW_DD_MIN_W_MAIN; // TEXT tab dropdown default width (match MAIN)
        var TOPROW_DD_MAX_W   = 520; // soft max (prevents monitor-wide stretch when docked)
        // Trim the dropdown's RIGHT edge so it lines up with the right edge of the buttons below.
        // (Keeps both MAIN and TEXT dropdowns visually aligned.)
        var TOPROW_DD_RIGHT_TRIM = 3;


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

            if (dd.__shineNoTruncate === true) return;
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

        // Popup width helper: clamp the dropdown popup list to the content width (not the closed control width).
        // Useful when the CLOSED dropdown is wide (fills the row) but we want a tighter POPUP like the TEXT tab.
        


        // Keep dropdown popup width from ballooning by ensuring item labels
        // never exceed the *current* closed-control width.
        // (ScriptUI dropdown popup width is driven by the widest item label.)
        function _truncateDropdownLabel(dd, label) {
            try {
                label = String(label == null ? "" : label);

                if (dd && dd.__shineNoTruncate === true) return label;

                // Determine current control width (fallback to preferred sizes)
                var w = 0;
                try { if (dd.size && dd.size.width) w = dd.size.width; } catch (e0) {}
                if (!w) { try { if (dd.bounds && dd.bounds.length === 4) w = (dd.bounds[2] - dd.bounds[0]); } catch (e1) {} }
                if (!w) { try { if (dd.preferredSize && dd.preferredSize.width) w = dd.preferredSize.width; } catch (e2) {} }
                if (!w) w = 220;

                // If the popup list is wider than the closed control (common in some layouts),
                // prefer the popup width so we don't manually ellipsis too early.
                try {
                    var lw = 0;
                    if (dd.list) {
                        try { if (dd.list.size && dd.list.size.width) lw = dd.list.size.width; } catch (eL0) {}
                        if (!lw) { try { if (dd.list.bounds && dd.list.bounds.length === 4) lw = (dd.list.bounds[2] - dd.list.bounds[0]); } catch (eL1) {} }
                    }
                    if (lw && lw > w) w = lw;
                } catch (eL) {}


                // Leave room for arrow + insets (empirical; keeps popup from expanding wider than control)
                var usable = Math.max(50, w - 28);

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

        // Normalize file/path labels for display in dropdowns (decode URI, fix %20, prefer filename when possible).
        function _stPrettyFileLabel(pathOrLabel) {
            var s = pathOrLabel;
            try {
                if (s instanceof File) {
                    if (s && s.name) return String(s.name);
                }
            } catch (e0) {}
            try {
                if (typeof s === "string") {
                    var f = new File(s);
                    if (f && f.name) s = f.name;
                }
            } catch (e1) {}
            s = String(s == null ? "" : s);
            try { s = decodeURIComponent(s); } catch (e2) {}
            try { s = s.replace(/%20/g, " "); } catch (e3) {}
            return s;
        }


        function _applyDropdownLabelClamp(dd) {
            try {
                if (!dd || !dd.items) return;
                // Some dropdowns (e.g., MAIN tab Library Elements) should never be manually ellipsed.
                if (dd.__shineNoTruncate) return;
                for (var i = 0; i < dd.items.length; i++) {
                    var it = dd.items[i];
                    if (!it || it._isBlank || it.text === "(No saved files)" || it.text === "(No saved presets)" || it.type === "separator") continue;
                    var full = it._fullText || it._pathName || it._name || it.text;
                    it._fullText = full;
                    it.text = _truncateDropdownLabel(dd, full);
                }
            } catch (e) {}
        }

        // Fit dropdown popup list width to content (keeps collapsed control unchanged).
        // Used for MAIN tab "LIB. ELEMENTS" dropdown to avoid excessive empty space on the right.
        function _fitDropdownPopupToContent(dd, opts) {
            try {
                if (!dd || !dd.items || dd.items.length === 0) return;

                opts = opts || {};
                var minW = (opts.minW != null) ? opts.minW : 140;
                var maxW = (opts.maxW != null) ? opts.maxW : 520;
                var padW = (opts.padW != null) ? opts.padW : 44; // scrollbar + padding
                var MAX_ITEMS = (opts.maxVisibleItems != null) ? Math.max(4, opts.maxVisibleItems) : 12;

                // Prefer list graphics for accurate font metrics when available
                var gfx = null;
                try { gfx = (dd.list && dd.list.graphics) ? dd.list.graphics : dd.graphics; } catch (eG) { gfx = dd.graphics; }
                if (!gfx || !gfx.measureString) return;

                var maxTextW = 0;
                for (var i = 0; i < dd.items.length; i++) {
                    var it = dd.items[i];
                    if (!it || it.type === "separator" || it._isBlank) continue;
                    var label = it._fullText || it.text || "";
                    if (!label) continue;
                    var w = 0;
                    try { w = gfx.measureString(label)[0]; } catch (eM) { w = 0; }
                    if (w > maxTextW) maxTextW = w;
                }

                var targetW = Math.round(maxTextW + padW);
                if (targetW < minW) targetW = minW;
                if (targetW > maxW) targetW = maxW;

                // Apply to popup list only (dd.list). This should not affect the collapsed control.
                if (dd.list) {
                    try { dd.list.minimumSize = [targetW, dd.list.minimumSize ? dd.list.minimumSize[1] : 0]; } catch (e1) {}
                    try { dd.list.preferredSize = [targetW, dd.list.preferredSize ? dd.list.preferredSize[1] : 0]; } catch (e2) {}
                    try { dd.list.maximumSize = [targetW, dd.list.maximumSize ? dd.list.maximumSize[1] : 10000]; } catch (e3) {}

                    // Height clamp: keep macOS from showing a monitor-tall popup when there are many items.
                    try {
                        if (dd.list.size) {
                            var itemH = 16;
                            try { if (dd.list.itemSize && dd.list.itemSize.height) itemH = dd.list.itemSize.height; } catch (eIH) {}
                            var maxH = (itemH * MAX_ITEMS) + 10;
                            if (dd.list.size.height > maxH) dd.list.size.height = maxH;
                        }
                    } catch (eH) {}
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

function relayoutScoped(scopeGroup) {
    try { (scopeGroup || pal).layout.layout(true); } catch (e1) {}
    try { (scopeGroup || pal).layout.resize(); } catch (e2) {}
    // A window resize pass helps redraw without forcing a full tree relayout.
    try { pal.layout.resize(); } catch (e3) {}
}

function relayout() {
    // Full relayout (use sparingly)
    relayoutScoped(pal);
}


// ============================================================
// PASS 5: PERFORMANCE – Batched relayout requests
// ------------------------------------------------------------
// ScriptUI can get sluggish if many sections trigger layout() in rapid succession
// (accordion toggles, reorder dialog commits, etc.). We batch those requests into a
// single scheduled tick that relayouts only the affected scope groups.
// ============================================================
var __ST_RelayoutTaskId = 0;
var __ST_RELAYOUT_TICK_FN = "__ShineTools_BatchedRelayoutTick__";

function _stQueueRelayout(scopeGroup) {
    try {
        if (!$.global.__ShineToolsRelayoutQueue) $.global.__ShineToolsRelayoutQueue = [];
        var q = $.global.__ShineToolsRelayoutQueue;
        // De-dupe by strict equality
        for (var i = 0; i < q.length; i++) { if (q[i] === scopeGroup) return; }
        q.push(scopeGroup);
    } catch (e) {}
}

function _stCancelRelayoutTick() {
    try { if (__ST_RelayoutTaskId) app.cancelTask(__ST_RelayoutTaskId); } catch (e) {}
    __ST_RelayoutTaskId = 0;
}

// Request a relayout soon (debounced). If scopeGroup is null, falls back to pal.
function requestRelayoutSoon(scopeGroup, delayMs) {
    try {
        _stQueueRelayout(scopeGroup || pal);
        _stCancelRelayoutTick();

        // Define tick once (uses the queued objects stored on $.global)
        $.global[__ST_RELAYOUT_TICK_FN] = function () {
            __ST_RelayoutTaskId = 0;
            var q = null;
            try { q = $.global.__ShineToolsRelayoutQueue; } catch (eQ) { q = null; }
            try { $.global.__ShineToolsRelayoutQueue = []; } catch (eClr) {}

            if (!q || !q.length) return;

            // Relayout each queued scope group. If the palette itself is included,
            // do it last so child scopes don't immediately get re-laid out again.
            var palQueued = false;
            for (var i = 0; i < q.length; i++) {
                try { if (q[i] === pal) { palQueued = true; continue; } } catch (eP) {}
                try { relayoutScoped(q[i]); } catch (eR) {}
            }
            if (palQueued) {
                try { relayoutScoped(pal); } catch (eR2) {}
            }
        };

        var ms = Math.max(0, (delayMs == null ? 40 : delayMs));
        __ST_RelayoutTaskId = app.scheduleTask(__ST_RELAYOUT_TICK_FN + "()", ms, false);
    } catch (e) {
        // Fallback: immediate scoped relayout
        try { relayoutScoped(scopeGroup || pal); } catch (e2) {}
    }
}

        function makeDivider(parent) {
            var d = parent.add("panel", undefined, "");
            d.alignment   = ["fill", "top"];
            d.minimumSize = [0, 1];
            d.maximumSize = [10000, 1];
            d.enabled     = false;
            return d;
        }

        
    // ============================================================
    // PASS 10: UX CONSISTENCY SWEEP (LOW RISK)
    // ------------------------------------------------------------
    // Helpers to standardize small UI behaviors (focus ring safety,
    // helpTips, and lightweight visual consistency) without changing
    // tool behavior.
    // ============================================================
    function _focusSafeMargins(grp, leftPx, topPx, rightPx, bottomPx) {
        try {
            if (!grp) return;
            var L = (leftPx  === undefined ? 2 : leftPx);
            var T = (topPx   === undefined ? 1 : topPx);
            var R = (rightPx === undefined ? 0 : rightPx);
            var B = (bottomPx=== undefined ? 1 : bottomPx);
            grp.margins = [L, T, R, B];
        } catch (e) {}
    }

    function _setHelpTipBestEffort(ctrl, tip) {
        try { if (ctrl && tip) ctrl.helpTip = String(tip); } catch (e) {}
    }

    // PASS 10.1: apply default tooltips to common buttons to common buttons (best-effort)
    function _walkUIControls(root, visitFn) {
        try {
            if (!root) return;
            var kids = null;
            try { kids = root.children; } catch (e) { kids = null; }
            if (kids && kids.length) {
                for (var i = 0; i < kids.length; i++) {
                    var c = kids[i];
                    try { visitFn(c); } catch (eV) {}
                    _walkUIControls(c, visitFn);
                }
            }
        } catch (e) {}
    }

    function _applyDefaultHelpTips(root) {
        // Keyed by button text as shown in UI
        var tips = {
            "CHECK FOR UPDATES": "Check GitHub for a newer ShineTools version. If an update is found, INSTALL UPDATE will appear below.",
            "INSTALL UPDATE": "Install the downloaded update (only available after a newer version is detected).",
            "COPY DEBUG INFO": "Copies a short system/version snapshot + last error to the clipboard (for troubleshooting).",
            "UNIQUE COMP": "Duplicate the selected comp and any nested comps so edits are isolated from the original.",
            "EXTEND COMP": "Extend the duration of the active comp (and optionally its layers) without rebuilding your timeline.",
            "EXTEND PRECOMP": "Extend a selected precomp and its contents so it matches your active comp timing.",
            "TRIM LAYER": "Trim the selected layer(s) to the work area or comp bounds (depending on tool options).",
            "CREATE TEXT BOX": "Create a styled text box (text + shape background) using ShineTools defaults.",
            "BREAK APART TEXT": "Split text into separate layers (chars/words/lines) for animation.",
            "FONT AUDIT": "Scan project fonts and highlight missing/invalid fonts across the project.",
            "CLEAN UP": "Run project cleanup utilities (remove unused, tidy folders, etc.)."
        };

        _walkUIControls(root, function (c) {
            try {
                var t = null;
                try { t = c.type; } catch (eT) { t = null; }
                // Buttons + checkboxes both support helpTip; we only auto-fill if empty.
                if (t === "button" || t === "checkbox") {
                    var label = null;
                    try { label = c.text; } catch (eL) { label = null; }
                    if (label && tips[label]) {
                        var hasTip = false;
                        try { hasTip = !!c.helpTip && String(c.helpTip).length > 0; } catch (eHT) { hasTip = false; }
                        if (!hasTip) _setHelpTipBestEffort(c, tips[label]);
                    }
                }
            } catch (e) {}
        });
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

        // Hover + Option label engine (3-state)
        var _hoverBtn = null;
        var _hoverText = "";
        var _hoverOptionText = "";
        var _hoverShiftText = "";
        var _hoverLastAlt = null;
        var _hoverLastShift = null;
        var _hoverTask = 0;

        var HOVER_TICK_FN = "__ShineTools_c83_HoverTick__";

        function _hoverClearInternal() {
            if (_hoverTask) { try { app.cancelTask(_hoverTask); } catch (e0) {} _hoverTask = 0; }
            _hoverBtn = null;
            _hoverLastAlt = null;
            _hoverLastShift = null;
        }

        
        // Expose a global canceller so we can pause hover polling when a modal dialog is shown
        // (AE cannot execute scheduled tasks while a modal dialog is open).
        $.global.__ShineTools_CancelHoverPoll__ = function(){
            try{ _hoverClearInternal(); }catch(e){}
        };

function _hoverSafeSetText(btn, txt) { try { btn.text = txt; } catch (e) {} }

        $.global[HOVER_TICK_FN] = function () {
            _hoverTask = 0;
            if (!_hoverBtn) return;

            var altNow = isOptionDown();
            var shiftNow = isShiftDown();

            if (_hoverLastAlt === null || _hoverLastShift === null || altNow !== _hoverLastAlt || shiftNow !== _hoverLastShift) {
                _hoverLastAlt = altNow;
                _hoverLastShift = shiftNow;

                var next = shiftNow ? (_hoverShiftText || _hoverText) : (altNow ? _hoverOptionText : _hoverText);
                _hoverSafeSetText(_hoverBtn, next);
            }

            try { _hoverTask = app.scheduleTask(HOVER_TICK_FN + "()", 50, false); } catch (e1) {}
        };

        function _hoverStart(btn, baseText, hoverText, optionHoverText, shiftHoverText) {
            _hoverBtn = btn;
            _hoverText = hoverText;
            _hoverOptionText = optionHoverText;
            _hoverShiftText = shiftHoverText || "";
            _hoverLastAlt = null;
            _hoverLastShift = null;

            var next0 = isShiftDown() ? (_hoverShiftText || _hoverText) : (isOptionDown() ? _hoverOptionText : _hoverText);
            _hoverSafeSetText(btn, next0);

            if (_hoverTask) { try { app.cancelTask(_hoverTask); } catch (e0) {} _hoverTask = 0; }
            try { _hoverTask = app.scheduleTask(HOVER_TICK_FN + "()", 50, false); } catch (e1) {}
        }

        function _hoverStop(btn, baseText) {
            if (_hoverBtn === btn) _hoverClearInternal();
            _hoverSafeSetText(btn, baseText);
        }

        function enableHoverOptionLabel(btn, baseText, hoverText, optionHoverText) {
            btn.addEventListener("mouseover", function () { _hoverStart(btn, baseText, hoverText, optionHoverText, ""); });
            btn.addEventListener("mouseout",  function () { _hoverStop(btn, baseText); });
        }

        function enableHoverModifierLabel(btn, baseText, hoverText, optionHoverText, shiftHoverText) {
            btn.addEventListener("mouseover", function () { _hoverStart(btn, baseText, hoverText, optionHoverText, shiftHoverText); });
            btn.addEventListener("mouseout",  function () { _hoverStop(btn, baseText); });
        }


        

        // -------------------------
        // Per-section BUTTON order (Option+Click on section header)
        // -------------------------
        var __ST_BTN_ORDER_SECTION = "ShineTools";
        var __ST_BTN_ORDER_PREFIX  = "ButtonOrder::";
        var __ST_SECTION_BUTTONS   = {}; // { accordionKey: { sectionTitle: [ {id:String, label:String} ] } }

        function _stBO_safeStr(v){ try{ return String(v==null?"":v); }catch(e){ return ""; } }

        function _stBO_parseArray(raw){
            if (!raw) return null;
            // Try strict JSON first
            try { if (typeof JSON !== 'undefined' && JSON && JSON.parse) return JSON.parse(raw); } catch (eJSON) {}
            // Then a safe-ish eval fallback (ExtendScript)
            try { return eval('(' + raw + ')'); } catch (eEval) {}
            // Finally handle legacy comma-separated strings ("a,b,c")
            try {
                if (typeof raw === 'string' && raw.indexOf(',') >= 0 && raw.indexOf('[') === -1) {
                    var parts = raw.split(',');
                    var out = [];
                    for (var i=0; i<parts.length; i++) {
                        var p = String(parts[i]);
                        // Trim
                        p = p.replace(/^\s+/, '').replace(/\s+$/, '');
                        if (p) out.push(p);
                    }
                    return out;
                }
            } catch (eSplit) {}
            return null;
        }

        function _stBO_escapeStr(s) {
            try {
                s = String(s);
                s = s.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"").replace(/\r/g, "\\r").replace(/\n/g, "\\n");
                return s;
            } catch (e) { return ""; }
        }

        function _stBO_stringifyArray(arr) {
            // Always produce a JSON array string, even if JSON.stringify is missing.
            try { if (typeof JSON !== 'undefined' && JSON && JSON.stringify) return JSON.stringify(arr); } catch (eJSON) {}
            var out = '[';
            for (var i=0; i<(arr?arr.length:0); i++) {
                out += '"' + _stBO_escapeStr(arr[i]) + '"';
                if (i < arr.length - 1) out += ',';
            }
            out += ']';
            return out;
        }

        function _stBO_key(accordionKey, sectionTitle){
            return __ST_BTN_ORDER_PREFIX + _stBO_safeStr(accordionKey) + '::' + _stBO_safeStr(sectionTitle);
        }

        function _stBO_clearRegistry(accordionKey, sectionTitle){
            try {
                if (!accordionKey || !sectionTitle) return;
                if (!__ST_SECTION_BUTTONS[accordionKey]) __ST_SECTION_BUTTONS[accordionKey] = {};
                __ST_SECTION_BUTTONS[accordionKey][sectionTitle] = [];
            } catch (e) {}
        }

        function _stBO_getRegistry(accordionKey, sectionTitle){
            try {
                if (!accordionKey || !sectionTitle) return null;
                if (!__ST_SECTION_BUTTONS[accordionKey]) return null;
                return __ST_SECTION_BUTTONS[accordionKey][sectionTitle] || null;
            } catch (e) {}
            return null;
        }

        function _stBO_itemLabel(item){
            try {
                if (item && item.hoverLabels && item.hoverLabels.base) return _stBO_safeStr(item.hoverLabels.base);
                if (item && item.text) return _stBO_safeStr(item.text);
            } catch (e) {}
            return '';
        }

        function _stBO_hash32(str){
            // Deterministic 32-bit hash (djb2); stable across sessions and order.
            try {
                str = String(str);
                var h = 5381;
                for (var i = 0; i < str.length; i++) {
                    h = ((h << 5) + h) + str.charCodeAt(i);
                    h = h & 0xFFFFFFFF;
                }
                // Convert to unsigned-ish string
                if (h < 0) h = 0xFFFFFFFF + h + 1;
                return String(h);
            } catch (e) { return "0"; }
        }

        function _stBO_stableIdForItem(it, idx){
            // CRITICAL: this ID must NOT depend on truncated labels or layout-dependent text.
            // Prefer explicit IDs, otherwise hash ONLY the onClick function source.
            // This keeps the ID stable across sessions/rebuilds.
            try {
                if (it && it.id !== undefined && it.id !== null && String(it.id) !== "") return _stBO_safeStr(it.id);
            } catch (e0) {}
            try {
                if (it && it._stId !== undefined && it._stId !== null && String(it._stId) !== "") return _stBO_safeStr(it._stId);
            } catch (e1) {}

            var fn = "";
            try { if (it && it.onClick) fn = String(it.onClick); } catch (e3) { fn = ""; }
            if (fn) return "fn_" + _stBO_hash32(fn);

            // Fallback: hash the label text if there's no onClick.
            var lbl = "";
            try {
                if (it && it.hoverLabels && it.hoverLabels.base) lbl = _stBO_safeStr(it.hoverLabels.base);
                else if (it && it.text) lbl = _stBO_safeStr(it.text);
            } catch (e2) { lbl = ""; }
            return "lbl_" + _stBO_hash32(lbl || ("BTN_" + idx));
        }

        function _stBO_makeIds(items){
            // IMPORTANT: IDs must remain stable across sessions and NOT depend on the *current* order.
            // We prefer explicit IDs if authors provide them. Otherwise we hash function+label (+helpTip)
            // and only fall back to an index suffix when *true duplicates* exist.
            var out = [];
            var seen = {};
            for (var i=0; i<items.length; i++) {
                var it = items[i];
                var base = _stBO_stableIdForItem(it, i);
                if (!base) base = 'BTN_' + i;

                var id = base;
                if (seen[id] !== undefined) {
                    // Duplicate action+label+helpTip: suffix with a deterministic hash that includes the original slot.
                    // NOTE: We only use index when duplicates exist.
                    id = base + "@@" + _stBO_hash32(base + "@@" + String(i));
                }
                seen[base] = true;

                try { it._stBO_id = id; } catch (e2) {}
                out.push(id);
            }
            return out;
        }

        function _stBO_register(accordionKey, sectionTitle, items){
            try {
                if (!accordionKey || !sectionTitle || !items || !items.length) return;
                if (!__ST_SECTION_BUTTONS[accordionKey]) __ST_SECTION_BUTTONS[accordionKey] = {};
                if (!__ST_SECTION_BUTTONS[accordionKey][sectionTitle]) __ST_SECTION_BUTTONS[accordionKey][sectionTitle] = [];

                _stBO_makeIds(items);

                var reg = __ST_SECTION_BUTTONS[accordionKey][sectionTitle];
                // Append in current grid order
                for (var i=0; i<items.length; i++) {
                    var it = items[i];
                    var id = it && it._stBO_id ? _stBO_safeStr(it._stBO_id) : _stBO_safeStr(_stBO_itemLabel(it) || ('BTN_' + i));
                    var label = _stBO_itemLabel(it) || id;
                    reg.push({ id: id, label: label });
                }
            } catch (e) {}
        }

        function _stBO_loadOrder(accordionKey, sectionTitle){
            try {
                var key = _stBO_key(accordionKey, sectionTitle);
                // Prefer the most complete source. app.settings can sometimes fail or write stale '[]'
                // while the file-backed store contains the correct value.
                var rawApp  = _settingsGetRawApp(__ST_BTN_ORDER_SECTION, key);
                var rawFile = _settingsGetRawFile(__ST_BTN_ORDER_SECTION, key);
                var arrApp  = _stBO_parseArray(rawApp);
                var arrFile = _stBO_parseArray(rawFile);
                if (arrFile && arrFile.length) return arrFile;
                if (arrApp && arrApp.length) return arrApp;
            } catch (e) {}
            return null;
        }

        function _stBO_saveOrder(accordionKey, sectionTitle, arr){
            try {
                var key = _stBO_key(accordionKey, sectionTitle);
                var payload = arr && arr.length ? _stBO_stringifyArray(arr) : '[]';
                var ok = _settingsSet(__ST_BTN_ORDER_SECTION, key, payload);
                if (!ok) {
                    var pth = "";
                    try { var f = _stSettingsFilePath(); if (f) pth = f.fsName; } catch (eP) {}
                    alert("ShineTools couldn't save button order.\n\nThis usually means a write-permission issue.\n\nTried saving to:\n" + (pth || "(unknown)"));
                }
            } catch (e) {}
        }

        function _stBO_applyOrder(items, savedIds){
            if (!items || !items.length || !savedIds || !savedIds.length) return items;
            _stBO_makeIds(items);

            var map = {};
            for (var i=0; i<items.length; i++) {
                try { map[_stBO_safeStr(items[i]._stBO_id)] = items[i]; } catch (e) {}
            }

            var out = [];
            // First: items in saved order
            for (var j=0; j<savedIds.length; j++) {
                var id = _stBO_safeStr(savedIds[j]);
                if (map[id]) {
                    out.push(map[id]);
                    map[id] = null;
                }
            }
            // Then: any new/unseen items
            for (var k=0; k<items.length; k++) {
                var id2 = _stBO_safeStr(items[k]._stBO_id);
                if (map[id2]) out.push(items[k]);
            }
            return out;
        }

// 2-column grid with badge indicator support

	        // 2-column grid with badge indicator support
	        // NOTE: Indicator is implemented as a fixed-width sibling (NOT an overlay)
	        // to keep clicks reliable and resizing snappy.
	        function addGrid2(parentBody, items) {
            // Apply per-section button order when inside an accordion section.
            // IMPORTANT: buildFns often create nested groups inside the section body and call addGrid2()
            // on those nested groups. So we must walk up the parent chain to find the tagged section body.
            try {
                function _stBO_findTaggedBody(g) {
                    var cur = g;
                    for (var hop=0; cur && hop<12; hop++) {
                        if (cur._stAccordionKey && cur._stSectionTitle) return cur;
                        cur = cur.parent;
                    }
                    return null;
                }

                var tagged = _stBO_findTaggedBody(parentBody);
                var _aKey = tagged && tagged._stAccordionKey;
                var _sTitle = tagged && tagged._stSectionTitle;

                if (_aKey && _sTitle && items && items.length) {
                    // Register these buttons for the dialog list (append; section build clears registry once).
                    _stBO_register(_aKey, _sTitle, items);

                    // Apply saved ordering to the grid.
                    var _saved = _stBO_loadOrder(_aKey, _sTitle);
                    if (_saved && _saved.length) items = _stBO_applyOrder(items, _saved);
                }
            } catch (eBO) {}

            var h = clippedBtnH();
            var MIN_BTN_W = 125;

	            function makeCellButton(row, item) {
                // Cell is a STACK so we can place the indicator exactly on the button's RIGHT EDGE
                // without affecting layout math and without overlaying a hit-target that steals clicks.
                // The indicator is a disabled draw-only group, so mouse events pass through to the button.
                var cell = row.add("group");
                cell.orientation   = "stack";
                cell.alignChildren = ["fill", "top"];
                cell.alignment     = ["fill", "top"];
                cell.margins       = 0;
                cell.spacing       = 0;

                // Reserve stable width so columns never collapse/overlap.
                try {
                    cell.minimumSize   = [MIN_BTN_W, h];
                    cell.preferredSize = [0, h];
                    cell.maximumSize   = [10000, h];
                } catch (eCellSz) {}

                var btn = cell.add("button", undefined, item.text);
                btn.alignment     = ["fill", "top"];
                btn.preferredSize = [0, h];
                btn.minimumSize   = [MIN_BTN_W, h];
                btn.maximumSize   = [10000, h];

                if (item.helpTip) btn.helpTip = item.helpTip;
                if (item.onClick) btn.onClick = item.onClick;

                if (item.hoverLabels && item.hoverLabels.base && item.hoverLabels.hover && item.hoverLabels.optionHover) {
                    btn.text = item.hoverLabels.base;
                    if (item.hoverLabels.shiftHover) {
                        enableHoverModifierLabel(btn, item.hoverLabels.base, item.hoverLabels.hover, item.hoverLabels.optionHover, item.hoverLabels.shiftHover);
                    } else {
                        enableHoverOptionLabel(btn, item.hoverLabels.base, item.hoverLabels.hover, item.hoverLabels.optionHover);
                    }
                }

                if (item.badgeDot) {
                    // Right-edge indicator line (draw-only, disabled; sits ON the button edge)
                    var LINE_W = 3;
                    var line = cell.add("group");
                    line.alignment     = ["right", "top"];
                    line.minimumSize   = [LINE_W, h];
                    line.preferredSize = [LINE_W, h];
                    line.maximumSize   = [LINE_W, h];
                    // Disabled so it cannot intercept clicks; still draws via onDraw.
                    try { line.enabled = false; } catch (eEn) {}

                    line.onDraw = function () {
                        try {
                            var g = this.graphics;
                            var W = this.size[0];
                            var H = this.size[1];
                            if (!W || !H) return;
                            var brush = g.newBrush(g.BrushType.SOLID_COLOR, [1.0, 0.82, 0.2, 1]);
                            // Slight top/bottom inset so it looks centered on the button face
                            g.rectPath(0, 3, W, Math.max(0, H - 6));
                            g.fillPath(brush);
                        } catch (e) {}
                    };
                    try { line.notify('onDraw'); } catch (eN) {}
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

    // Relayout can get called a lot during accordion toggles/reorders.
    // Guard against re-entrant layout calls (can freeze ScriptUI over time).
    var _stIsRelayouting = false;
    function safeRelayout() {
        if (!relayoutFn) return;
        if (_stIsRelayouting) return;
        _stIsRelayouting = true;
        try { relayoutFn(); } catch (e) {}
        _stIsRelayouting = false;
    }


    // Persisted order helpers
    var ORDER_SETTINGS_SECTION = "ShineTools";
        function _stEnsureDir(dir) {
        try { if (dir && !dir.exists) dir.create(); } catch (e) {}
        return (dir && dir.exists) ? dir : null;
    }

    // JSON helpers (centralized): use the global _stJsonParse/_stJsonStringify implementations
    // so every persistence system behaves consistently.
    function _stParseOrder(raw) {
        try { return _stJsonParse(raw); } catch (e) {}
        return null;
    }

    function _stStringifyOrder(arr) {
        try {
            var s = _stJsonStringify(arr || []);
            return (s === undefined || s === null) ? "[]" : String(s);
        } catch (e) {}
        return "[]";
    }


    function _stAccordionOrderFilePrimary() {
        try {
            if (!orderSettingsKeyOrNull) return null;
            var dir = _stEnsureDir(Folder(Folder.myDocuments.fsName + "/ShineTools"));
            if (!dir) return null;
            return File(dir.fsName + "/" + orderSettingsKeyOrNull + ".json");
        } catch (e) {}
        return null;
    }

    function loadOrder() {
        if (!orderSettingsKeyOrNull) return [];

        // Unified persistence (preferred): stored via _settingsGet/_settingsSet with file fallback.
        var unifiedKey = "AccordionOrder::" + orderSettingsKeyOrNull;

        // 0) Unified settings first
        try {
            var rawU = _settingsGet(ORDER_SETTINGS_SECTION, unifiedKey, "");
            var arrU = _stParseOrder(rawU);
            if (arrU && arrU.length) return arrU;
        } catch (eU) {}

        var arr = [];

        // 1) Legacy dedicated per-accordion file (migration path)
        try {
            var f = _stAccordionOrderFilePrimary();
            if (f && f.exists) {
                f.encoding = "UTF-8";
                f.open("r");
                var rawF = f.read();
                f.close();
                if (rawF) {
                    var arrF = _stParseOrder(rawF);
                    if (arrF && arrF.length) arr = arrF;
                }
            }
        } catch (eF) {}

        // 2) Legacy app.settings fallback (migration path)
        if (!arr || !arr.length) {
            try {
                if (_appHaveSetting(ORDER_SETTINGS_SECTION, orderSettingsKeyOrNull)) {
                    var rawS = _appGetSetting(ORDER_SETTINGS_SECTION, orderSettingsKeyOrNull, "") || "";
                    var arrS = _stParseOrder(rawS);
                    if (arrS && arrS.length) arr = arrS;
                }
            } catch (eS) {}
        }

        // Migrate legacy -> unified (best effort)
        if (arr && arr.length) {
            try { _settingsSet(ORDER_SETTINGS_SECTION, unifiedKey, _stStringifyOrder(arr)); } catch (eM) {}
        }

        return arr || [];
    }

    function saveOrder(arr) {
        if (!orderSettingsKeyOrNull) return;

        arr = arr || [];
        var unifiedKey = "AccordionOrder::" + orderSettingsKeyOrNull;

        // 0) Unified persistence (preferred)
        try { _settingsSet(ORDER_SETTINGS_SECTION, unifiedKey, _stStringifyOrder(arr)); } catch (eU) {}

        // 1) Legacy app.settings (keep for backwards compatibility)
        try {
            _appSaveSetting(ORDER_SETTINGS_SECTION, orderSettingsKeyOrNull, _stStringifyOrder(arr));
        } catch (e1) {}

        // 2) Legacy dedicated per-accordion file(s)
        try {
            var f2 = _stAccordionOrderFilePrimary();
            if (f2) {
                f2.encoding = "UTF-8";
                f2.open("w");
                f2.write(_stStringifyOrder(arr));
                f2.close();
            }
        } catch (e2) {}
    }

    var defs = [];            // {title:String, buildFn:Function}
    var statesByTitle = {};   // { title: {collapsed:Boolean} }
    var currentOrder = loadOrder();

    // Ensure persisted order is flushed to disk once at startup (helps AE restart persistence)
    try { if (currentOrder && currentOrder.length) saveOrder(currentOrder); } catch (eFlush) {}

    function collapseAllNow() {
        try { api.collapseAll(); } catch (e) {}
        try { safeRelayout(); } catch (e) {}
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
            try { safeRelayout(); } catch (e) {}
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

            var hitArea = header.add("group");
            hitArea.orientation   = "row";
            hitArea.alignChildren = ["left", "center"];
            hitArea.alignment     = ["fill", "center"];
            hitArea.spacing       = 6;
            hitArea.margins       = 0;

            var twirlBox = addTwirlControl(hitArea);

            var label = hitArea.add("statictext", undefined, title);
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

                    // Ensure a consistent font size across hover/click (prevents "bouncing")
                    try {
                        if (!this._glyphFont) {
                            var _fName = g.font.name;
                            var _fSize = g.font.size;
                            // Choose a stable size once, then reuse (avoid per-state font metrics changes)
                            this._glyphFont = ScriptUI.newFont(_fName, "Regular", Math.max(12, _fSize + 4));
                        }
                        g.font = this._glyphFont;
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
            // Tag this body so addGrid2 can persist per-section button order
            try { body._stSectionTitle = title; } catch (eTag1) {}
            try { body._stAccordionKey = orderSettingsKeyOrNull || "NOACC"; } catch (eTag2) {}
            
            body.alignChildren = ["fill", "top"];
            body.alignment     = ["fill", "top"];
            body.margins       = [8, 0, 8, 0];
            body.spacing       = UI.btnGap;

            

                        var state = statesByTitle[title] || { collapsed: true };
            statesByTitle[title] = state;

            if (state._lastToggle === undefined) state._lastToggle = 0;
// Track current body host so previously-built sections rebuild after a reorder UI rebuild
            state._builtHost = body;
            state._built = false;
// Lazy-build section contents to speed initial panel load.
            // ScriptUI UI-tree construction is the main startup cost; there's no need to
            // create every button/grid while the section is collapsed.
            // We build once, the first time the section is expanded.
            if (state._built !== true) state._built = false;


            // For blink revert + expanded label color
            try { label._getExpanded = function(){ return !state.collapsed; }; } catch (eGE) {}
            function _ensureBuilt() {
                // If the accordion UI was rebuilt (e.g. after reordering), the body group is new.
                // Rebuild the contents for the new body host.
                if (state._built && state._builtHost === body) return;
                if (!buildFn) { state._built = true; return; }
                try {
                    // Reset button registry for this section before rebuilding
                    try {
                        var _aK = (body && body._stAccordionKey) ? body._stAccordionKey : (orderSettingsKeyOrNull || "NOACC");
                        _stBO_clearRegistry(_aK, title);
                    } catch (eClr) {}
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
                                try { bodyWrap.preferredSize = undefined; } catch (ePS) {}
try { bodyWrap.minimumSize = v ? [0, 0] : [0, 0]; } catch (eMin) {}
                try { bodyWrap.maximumSize = v ? [10000, 0] : [10000, 200000]; } catch (eMax) {}


                if (!silent) safeRelayout();
}

            function _showReorderButtonsDialog(title, aKey, reg) {

                try {

                    var dlg = new Window("dialog", "Reorder Buttons: " + title, undefined, { closeButton: true });

                    dlg.orientation = "column";

                    dlg.alignChildren = ["fill", "top"];

                    dlg.spacing = 10;

                    dlg.margins = [10, 10, 10, 10];


                    var info = dlg.add("statictext", undefined, "Reorder buttons for this section (affects the grid order).");

                    info.alignment = ["fill", "top"];


                    var lb = dlg.add("listbox", undefined, [], { multiselect: false });

                    lb.preferredSize = [220, 220];


                    // Build list in saved order if it exists; otherwise registry order

                    var saved = _stBO_loadOrder(aKey, title) || [];

                    var used = {};


                    function addItem(r){

                        var it = lb.add('item', r.label);

                        it._id = r.id;

                    }


                    if (saved && saved.length) {

                        for (var si=0; si<saved.length; si++) {

                            var sid = String(saved[si]);

                            for (var ri=0; ri<reg.length; ri++) {

                                if (String(reg[ri].id) === sid && !used[sid]) { addItem(reg[ri]); used[sid]=true; break; }

                            }

                        }

                    }

                    for (var ri2=0; ri2<reg.length; ri2++) {

                        var rid = String(reg[ri2].id);

                        if (!used[rid]) { addItem(reg[ri2]); used[rid]=true; }

                    }


                    if (lb.items.length) lb.selection = 0;


                    var controls = dlg.add("group");

                    controls.orientation = "row";

                    controls.alignChildren = ["left", "center"];

                    controls.spacing = 8;


                    // Arrow-only buttons using the SAME custom chevron architecture as section reordering

                    // (draw-only glyph, no blue focus ring look)

                    function _styleDlgChevron(btn, glyph, tip) {

                        btn.minimumSize = [30, 26];

                        btn.maximumSize = [30, 26];

                        btn.alignment   = ['left','center'];

                        btn.margins     = 0;

                        try { btn.helpTip = tip; } catch (eTip2) {}


                        btn._glyph = glyph;

                        btn.text = "";

                        btn._isHover = false;

                        btn._isDown  = false;


                        function _inv(){ try { btn.notify('onDraw'); } catch(e0) {} try { btn.parent.update(); } catch(e1) {} }

                        btn.addEventListener('mouseover', function(){ btn._isHover = true; _inv(); });

                        btn.addEventListener('mouseout',  function(){ btn._isHover = false; btn._isDown = false; _inv(); });

                        btn.addEventListener('mousedown', function(){ btn._isDown = true; _inv(); });

                        btn.addEventListener('mouseup',   function(){ btn._isDown = false; _inv(); });


                        btn.onDraw = function(){

                            var g = this.graphics;

                            // Always visible in dialog: idle gray, hover/pressed yellow

                            var col = (this._isHover || this._isDown) ? ARROW_COLOR_HOVER : [0.70,0.70,0.70,1];

                            try {

                                if (!this._glyphFont) {

                                    this._glyphFont = ScriptUI.newFont(g.font.name, 'Regular', Math.max(12, g.font.size + 4));

                                }

                                g.font = this._glyphFont;

                            } catch(eF) {}

                            var w = this.size[0], h = this.size[1];

                            var x = Math.round(w/2 - 4);

                            var y = Math.round(h/2 - (g.font.size/2) - 1);

                            try {

                                var pen = g.newPen(g.PenType.SOLID_COLOR, col, 1);

                                g.drawString(this._glyph || glyph, pen, x, y);

                            } catch(eD) {}

                        };


                        defocusButtonBestEffort(btn);

                    }


                    // Keep arrows close together

                    var arrowGrp = controls.add('group');

                    arrowGrp.orientation = 'row';

                    arrowGrp.alignChildren = ['left','center'];

                    arrowGrp.spacing = 2;

                    arrowGrp.margins = 0;


                    var btnUp = arrowGrp.add("button", undefined, "▲");

                    var btnDn = arrowGrp.add("button", undefined, "▼");

                    _styleDlgChevron(btnUp, '▲', 'Move up');

                    _styleDlgChevron(btnDn, '▼', 'Move down');


                    // Dialog action buttons using the SAME stack-cell architecture used elsewhere (e.g. Font Audit CLOSE)

                    // This avoids the native focus-ring look on macOS.

                    var __dlgBtnH2 = clippedBtnH();

                    var __dlgMinW2 = 90;


                    function __makeDlgCellBtn__(parent, label, minW){

                        var cell = parent.add('group');

                        cell.orientation   = 'stack';

                        cell.alignChildren = ['fill','fill'];

                        cell.alignment     = ['left','center'];

                        cell.margins       = 0;


                        var b = cell.add('button', undefined, label);

                        b.alignment     = ['fill','center'];

                        b.preferredSize = [0, __dlgBtnH2];

                        b.minimumSize   = [minW || __dlgMinW2, __dlgBtnH2];

                        b.maximumSize   = [10000, __dlgBtnH2];

                        try { defocusButtonBestEffort(b); } catch (eDF2) {}

                        return { cell: cell, btn: b };

                    }


                    controls.add('statictext', undefined, '   ');


                    var __okPack     = __makeDlgCellBtn__(controls, 'OK', 70);

                    var btnOk        = __okPack.btn;

                    var __cancelPack = __makeDlgCellBtn__(controls, 'Cancel', 90);

                    var btnCancel    = __cancelPack.btn;


                    // Do NOT force focus to OK (causes highlight ring). Keep focus on listbox.

                    try { lb.active = true; } catch(eAF){ }


                    function moveSel(dir){

                        if (!lb.selection) return;

                        var idx = lb.selection.index;

                        var nidx = idx + dir;

                        if (nidx < 0 || nidx >= lb.items.length) return;

                        var cur = lb.items[idx];

                        var tmpText = cur.text;

                        var tmpId = cur._id;

                        cur.text = lb.items[nidx].text;

                        cur._id  = lb.items[nidx]._id;

                        lb.items[nidx].text = tmpText;

                        lb.items[nidx]._id  = tmpId;

                        lb.selection = nidx;

                    }


                    btnUp.onClick = function(){ moveSel(-1); };

                    btnDn.onClick = function(){ moveSel(1); };


                    btnCancel.onClick = function(){ dlg.close(0); };

                    btnOk.onClick = function(){ dlg.close(1); };


                    var res = dlg.show();

                    if (res === 1) {

                        var outIds = [];

                        for (var li=0; li<lb.items.length; li++) {

                            try { outIds.push(String(lb.items[li]._id)); } catch (eX) {}

                        }

                        _stBO_saveOrder(aKey, title, outIds);


                        // Rebuild the accordion UI (prevents duplicate UI nodes when sections have complex buildFns)

                        try { _buildAccordionUI(); } catch (eRB2) {}

                        try { safeRelayout(); } catch (eRL2) {}

                        // IMPORTANT: after rebuilding UI nodes, request a single debounced full palette relayout (avoids layout storms).

                        try { requestFullRelayoutSoon(); } catch (eFR) {}







                    }
                     
                } catch (eDlgInner) {

                    alert('Reorder failed: ' + String(eDlgInner));

                }

            }


            // Pass 4.8: expose Button Reorder dialog helper

            try { ST.UI.showReorderButtonsDialog = _showReorderButtonsDialog; } catch (e) {}


            function toggle() {
                // Debounce: prevent accidental double-toggles from overlapping mouse handlers
                var now = 0;
                try { now = (new Date()).getTime(); } catch (eT) { now = 0; }
                if (now && state._lastToggle && (now - state._lastToggle) < 180) return;
                state._lastToggle = now;


                var ks = null;
                try { ks = ScriptUI.environment.keyboardState; } catch (eKS) {}

                var isCmdOrCtrl = !!(ks && ks.metaKey);
                 var isShift     = !!(ks && ks.shiftKey);
                 var isAlt       = !!(ks && ks.altKey);

                 // Option + Click = reorder BUTTONS within this section
                 if (isAlt) {
                     try {
                         // Ensure contents are built at least once so we know the section's buttons
                         _ensureBuilt();

                         var aKey = (body && body._stAccordionKey) ? body._stAccordionKey : (orderSettingsKeyOrNull || "NOACC");
                         var reg = _stBO_getRegistry(aKey, title) || [];
                         if (!reg || !reg.length) {
                             alert("No buttons found in this section yet.\n\nTry expanding the section once, then Option+Click again.");
                             return;
                         }

                         _showReorderButtonsDialog(title, aKey, reg);
} catch (eDlg) {
                         alert('Reorder failed: ' + String(eDlg));
                     }
                     try { var fs = ensureFocusSink(); if (fs) fs.active = true; } catch (eFS2) {}
                     return;
                 }

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
                    safeRelayout();
return;
                }


                 // Normal click = accordion behavior (open one, close others)
                if (state.collapsed) {
                    collapseOthers(state);
                    setCollapsed(false, true);
                } else {
                    setCollapsed(true, false);
                }

                safeRelayout();
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
            safeRelayout();
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

// Pass 4.7: expose accordion builder on ST.UI namespace (no behavior change)
try { ST.UI.createAccordion = createAccordion; } catch (e) {}

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
        // Keep the collapsed (closed) dropdown compact; the popup list can be wider.
        favDD.alignment     = ["fill", "bottom"];
        // IMPORTANT (MAIN tab Library Elements dropdown): do NOT manually ellipsis.
        // ScriptUI will naturally clip based on the popup width; manual ellipsis truncates too early.
        favDD.__shineNoTruncate = true;

        // Responsive collapsed width (like TEXT tab): narrow minimum, expands with panel
        var _ddMinMain = Math.max(50, TOPROW_DD_MIN_W_TEXT - TOPROW_DD_RIGHT_TRIM); // match TEXT tab minimum
        var _ddMaxMain = Math.max(_ddMinMain, TOPROW_DD_MAX_W - TOPROW_DD_RIGHT_TRIM); // soft max
        favDD.minimumSize   = [_ddMinMain, UI.btnH];
        favDD.preferredSize = [_ddMinMain, UI.btnH];
        favDD.maximumSize   = [_ddMaxMain, UI.btnH]; // allow growth when docked/resized
        // Encourage a wider popup list (character-based hint)
                // Right-edge alignment: reserve a small spacer so the dropdown's right edge lines up with the button grid below
        var favRightPad = favRow.add("group");
        favRightPad.minimumSize = [TOPROW_DD_RIGHT_TRIM, 1];
        favRightPad.maximumSize = [TOPROW_DD_RIGHT_TRIM, 10000];


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
                            var displayName = _stPrettyFileLabel(favs[i]);
                            // Do not manually ellipsis; let ScriptUI clip naturally based on popup width.
                            var it = favDD.add("item", displayName);
                            it._fullText = displayName;
                            it._path = favs[i];
                            try { it.helpTip = displayName; } catch (eTip) {}
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

                // Keep the popup list tight to content (no excessive empty space on the right)
                _fitDropdownPopupToContent(favDD, { minW: 160, maxW: 520, padW: 44 });
                try {
                    favDD.onActivate = function () { _fitDropdownPopupToContent(favDD, { minW: 160, maxW: 520, padW: 44 }); };
                    favDD.onMouseDown = favDD.onActivate; // some builds fire mouse down earlier than activate
                } catch (ePop) {}



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

                    try { favAddBtn.visible = true; favAddBtn.enabled = true; } catch (eV) {}
                    try { favAddBtn.notify("onDraw"); } catch (eD) {}
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

        var mainAcc = createAccordion(accHost, null, function(){ requestRelayoutSoon(content, 40); }, "AccordionOrder_MAIN");

        
// =========================
// Sections / buttons (MAIN)  (re-orderable with header chevrons)
// =========================
mainAcc.defineSection("ADD LAYER", function(body){
    addGrid2(body, [
        {
            text: "SOLID...",
            badgeDot: true,
            onClick: function () { isOptionDown() ? addWhiteSolidDefault() : addSolidNativePrompt(); },
            helpTip: "Click: Solid dialog\nOption+Click: White Solid",
            hoverLabels: { base: "SOLID...", hover: "SOLID...", optionHover: "WHITE SOLID" }
        },
        { text: "3D LIGHT...",   onClick: addLightNativePrompt },
        { text: "NULL",       onClick: addNullDefault },
        { text: "ADJ. LAYER", onClick: addAdjustmentLayerDefault }
    ]);
});

mainAcc.defineSection("ADD RIG", function(body){
    addGrid2(body, [
        { text: "3D CAMERA RIG",  onClick: addCameraRig },
        { text: "ADJ. LAYER RIG", onClick: addCCAdjustmentRig }
    ]);
});

mainAcc.defineSection("ADD EXPRESSION", function(body){
    addGrid2(body, [
        {
            text: "BOUNCE",
            badgeDot: true,
            onClick: function () { isOptionDown() ? doHardBounce() : doInertialBounce(); },
            helpTip: "Inertial Bounce\nOption: Hard Bounce",
            hoverLabels: { base: "BOUNCE", hover: "INERTIAL BOUNCE", optionHover: "HARD BOUNCE" }
        },
        { text: "WIGGLE", onClick: doWiggle }
    ]);
});

mainAcc.defineSection("UTILITIES", function(body){
    addGrid2(body, [
        {
	            text: "COPY UNIQUE COMP",
	            onClick: copyUniqueCompDeepToPrecompsFromSelectedLayer,
	            helpTip: "Duplicates the selected precomp AND all nested precomps."
	        },
        {
            text: "ADD PHOTO BORDER",
            onClick: addPhotoBorder_Util,
            helpTip: "Creates a stroke-only rectangle border shape layer sized to the comp."
        },
        {
            text: "EXTEND BORDERS",
            onClick: extendBorders_Util,
            helpTip: "Adds CC Repetile to the selected layer, expands 1000px on all sides, and sets Tiling to Unfold."
        },
        {
            text: "ANIMATE STROKE",
            badgeDot: true,
            onClick: function () {
                if (isShiftDown()) {
                    trimPathsAnimateSelectedShape_30f(); // SHIFT: TRIM PATHS (END)
                } else if (isOptionDown()) {
                    trimPathsAnimateSelectedShapeStart_30f(); // OPTION: START
                } else {
                    addTrimLineAnimateEnd_30f(); // NORMAL: END
                }
            },
            helpTip: "Creates a Trim Line shape and animates it\nOPTION: Add Trim Paths Start animation.\nSHIFT: Adds Trim Paths to selected Shape Layer and animates it",
            hoverLabels: { base: "ANIMATE STROKE", hover: "END", optionHover: "START", shiftHover: "TRIM PATHS" }
        }
]);
});

mainAcc.defineSection("TIMELINE", function(body){
    addGrid2(body, [
        {
        text: "TRIM LAYER",
        badgeDot: true,
        onClick: trimLayerToNeighbor,
        helpTip: "Trim to layer below\nOption: Trim to layer above\nClick runs the shown mode",
        hoverLabels: { base: "TRIM LAYER", hover: "BELOW", optionHover: "ABOVE" }
        },
        {
        text: "OFFSET LAYERS",
        badgeDot: true,
        onClick: offsetSelectedLayers_ShineTools,
        helpTip: "Offsets selected layers in time.\nClick: Linear Frame Offset\nOption: Curve Offset (Type + Max Spread + Curve + Invert)",
        hoverLabels: { base: "OFFSET LAYERS", hover: "FRAME OFFSET", optionHover: "CURVE OFFSET" }
        },
        {
        text: "EXTEND PRECOMP",
        onClick: extendPrecompToCTI_Util,
        helpTip: "Extends selected precomp (and layers inside) so the last visible frame lands on the CTI."
        }
    ]);
});

mainAcc.defineSection("CLEAN UP", function(body){
    // Use wrappers so the UI can build even if functions are defined later
    addGrid2(body, [
        { text: "ORGANIZE BIN", onClick: function(){ try{ if (typeof cleanUpProjectBin === "function") cleanUpProjectBin(); } catch(e){} } },
        { text: "REDUCE PROJECT", onClick: function(){ try{ if (typeof reduceProject === "function") reduceProject(); } catch(e){} } }
    ]);
});

mainAcc.defineSection("RENDER", function(body){
    addGrid2(body, [
        { text: "RENDER PRORES 422...", onClick: renderPRORES422WithSaveDialog },
        {
            text: "SAVE FRAME AS .JPG",
            onClick: saveCurrentFrameJPGStill,
            helpTip: "Saves the current frame as a .JPG using the Output Module template: JPEG STILL."
        }
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


        // PASS 4 (lite): consolidate dropdown clamp loop (used in resize tick + live resize)
        function _clampAllDropdowns() {
            try {
                var dds = $.global.__ShineToolsAllDropdowns;
                if (dds && dds.length) {
                    for (var di = 0; di < dds.length; di++) {
                        _applyDropdownLabelClamp(dds[di]);
                    }
                }
            } catch (eDD) {}
        }
        $.global[__RESIZE_TICK_FN] = function () {
            __resizeTask = 0;
            try { pal.layout.layout(true); } catch (e1) {}
            try { pal.layout.resize(); } catch (e2) {}
            // Keep the yellow badge indicators stable during/after resize
// After resize, re-clamp dropdown item labels so popup widths match controls.
            _clampAllDropdowns();
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
            // Keep badge indicators stable while the user is actively dragging the panel size
            _clampAllDropdowns();
        };

        pal.onResize = function () {
            requestFullRelayoutSoon();
        };

        relayout();
                try { _applyDefaultHelpTips(pal); } catch(eTT) {}

        return pal;
    }

    // ============================================================
    // Init
    // ============================================================
    var myPal = buildUI(thisObj);

    // ------------------------------------------------------------
    // TEST CLEANUP: Remove any "Solids"/"SOLIDS" folders + their solid items
    // (Used during warnings testing; safe best-effort removal)
    // ------------------------------------------------------------
    
    // ------------------------------------------------------------
    // TEST CLEANUP: Remove any "Solids"/"SOLIDS" folder(s) + their contents
    // (Used during warnings testing; safe best-effort removal)
    // ------------------------------------------------------------
    function _cleanupSolidsFoldersBestEffort() {
        // IMPORTANT: Only delete the temporary test solids ShineTools creates for its startup checks.
        // Never delete user-created solids or wipe the entire Solids folder.
        try {
            if (!app.project) return;
            var proj = app.project;

            function isFootage(it) { try { return (it && (it instanceof FootageItem)); } catch (e) { return false; } }
            function isSolidFootage(it) {
                try { return (isFootage(it) && it.mainSource && (it.mainSource instanceof SolidSource)); } catch (e) { return false; }
            }

            // Any test solids created by ShineTools MUST use this prefix.
            var TEST_PREFIX = "_ST_TEST_SOLID_";

            // Pass 1: remove matching solids anywhere in the project
            for (var i = proj.numItems; i >= 1; i--) {
                var it = null;
                try { it = proj.item(i); } catch (eIt) { it = null; }
                if (!it) continue;

                var nm = "";
                try { nm = String(it.name || ""); } catch (eN) { nm = ""; }
                if (!nm) continue;

                if (nm.indexOf(TEST_PREFIX) === 0 && isSolidFootage(it)) {
                    try { it.remove(); } catch (eRm) {}
                }
            }

            // NOTE: We intentionally do NOT remove the "Solids" folder itself, even if empty.
            // Users may already have one and we should never touch their structure.

        } catch (e) {}
    }

    // Run once per launch (best-effort)
    try { _cleanupSolidsFoldersBestEffort(); } catch(e0) {}

    // Expose + run delayed cleanups (startup checks may create Solids after initial UI)
    try { $.global.__ShineToolsCleanupSolidsFoldersBestEffort = _cleanupSolidsFoldersBestEffort; } catch(eG) {}

    // Run several times over the first ~5 seconds to catch late-created Solids folders.
    try {
        for (var dly = 250; dly <= 5250; dly += 500) {
            app.scheduleTask("try{$.global.__ShineToolsCleanupSolidsFoldersBestEffort&&$.global.__ShineToolsCleanupSolidsFoldersBestEffort();}catch(e){}", dly, false);
        }
    } catch (eT) {}



// ------------------------------------------------------------
// ShineTools Launch Setup Check (TAKEOVER WARNING)
// Shows ONLY a takeover warning screen if required settings are NOT enabled.
// If user dismisses, warning hides for this AE session and returns to MAIN.
// ------------------------------------------------------------
try {
    (function (pal) {
        if (!pal) return;

        // --- Checks ---
        function _stCanWriteFilesEffective() {
            // We want to reflect the actual checkbox (pref) when possible,
            // but also avoid false-negatives in some AE builds by doing a quick write probe.
            var prefEnabled = null;
            try {
                prefEnabled = app.preferences.getPrefAsBool("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY");
            } catch (ePref) { prefEnabled = null; }

            function _tryWrite(folderObj, name) {
                var f = null;
                try {
                    if (!folderObj || !folderObj.exists) return false;
                    f = new File(folderObj.fsName + "/" + name);
                    try { if (f.exists) f.remove(); } catch (e0) {}
                    if (!f.open("w")) return false;
                    f.encoding = "UTF-8";
                    f.write("test");
                    f.close();
                    try { f.remove(); } catch (e1) {}
                    return true;
                } catch (e) {
                    try { if (f && f.opened) f.close(); } catch (e2) {}
                    return false;
                }
            }

            var writeOk = false;
            try { writeOk = _tryWrite(Folder.temp, "st_write_test.txt") || _tryWrite(Folder.userData, "st_write_test.txt"); } catch (eW) { writeOk = false; }

            // If prefs explicitly say enabled, trust that.
            if (prefEnabled === true) return true;

            // If prefs explicitly say disabled, only consider it "enabled" if the write probe succeeds.
            // (Some hosts/versions can mis-report the pref; this avoids blocking users incorrectly.)
            if (prefEnabled === false) return (writeOk === true);

            // Pref unknown: fall back to probe.
            return (writeOk === true);
        }

        function _stProjectSaysJavaScriptExpressions() {
    // Robust across AE versions: set a JS-only expression and read expressionError.
    // If the project is using Legacy expressions, this should produce an error string.
    if (!app.project) return false;

    var testComp = null;
    var testLayer = null;
    var ok = true;

    try {
        testComp = app.project.items.addComp("_ST_JS_TEST_", 16, 16, 1, 1, 30);
        testLayer = testComp.layers.addSolid([1, 1, 1], "_ST_TEST_SOLID_JS_", 16, 16, 1);

        var prop = testLayer.opacity;
        prop.expression = "(()=>100)()";

        // Force a parse/eval pass (some hosts are lazy until value is queried)
        try { prop.valueAtTime(0, false); } catch (eEval) {}

        var err = "";
        try { err = prop.expressionError; } catch (eErr) { err = ""; }

        if (err && err.toString && err.toString().length > 0) ok = false;
    } catch (e) {
        ok = false;
    }

    // Cleanup
    try { if (testComp) testComp.remove(); } catch (e2) {}

    return ok;
}

function _stEnsureProjectForProbe() {
            try { if (!app.project) app.newProject(); } catch (e) {}
            return app.project || null;
        }

        function _stProbeJavaScriptExpressions() {
            var proj = _stEnsureProjectForProbe();
            if (!proj) return null;

            var comp = null, layer = null, prop = null;
            // Use a token legacy doesn't support. 'const' should fail in Legacy ExtendScript expressions.
            var expr = "var a = (()=>1)(); a*100;";

            function attemptOnce() {
                var out = { ok: false, err: "", val: null };
                try {
                    comp = proj.items.addComp("_ST_JS_PROBE_", 16, 16, 1, 1, 30);
                    layer = comp.layers.addSolid([1, 1, 1], "_probeSolid", 16, 16, 1);
                    prop = layer.property("ADBE Transform Group").property("ADBE Opacity");
                    prop.expression = expr;
                    prop.expressionEnabled = true;

                    try { out.val = prop.valueAtTime(0, false); } catch (eVal) {}
                    try { out.err = prop.expressionError || ""; } catch (eErr) { out.err = ""; }

                    if (!out.err || out.err === "") {
                        if (typeof out.val === "number" && Math.abs(out.val - 100) < 0.001) out.ok = true;
                    }
                } catch (e) {
                    out.ok = false;
                    out.err = String(e);
                } finally {
                    try { if (comp) comp.remove(); } catch (eRm) {}
                    comp = null; layer = null; prop = null;
                }
                return out;
            }

            for (var i = 0; i < 3; i++) {
                var res = attemptOnce();
                if (res.ok === true) return true;

                var err = (res.err || "").toLowerCase();
                if (err.indexOf("syntax") !== -1 || err.indexOf("unexpected") !== -1 || err.indexOf("parse") !== -1) return false;
                try { $.sleep(50); } catch (eS) {}
            }

            return false;
        }

        function _stRunLaunchChecks() {
            var canWrite = _stCanWriteFilesEffective();

            var jsExpr = null;
            try { jsExpr = _stProjectSaysJavaScriptExpressions(); } catch (e1) { jsExpr = null; }

            if (jsExpr === null) {
                try { app.beginUndoGroup("ShineTools - Launch Check"); } catch (eUG) {}
                try { jsExpr = _stProbeJavaScriptExpressions(); } catch (eP) { jsExpr = null; }
                try { app.endUndoGroup(); } catch (eUE) {}
            }

            var canWriteOk = (canWrite === true);
            var jsExprOk   = (jsExpr === true);
            return { ok: (canWriteOk && jsExprOk), canWrite: canWriteOk, jsExpr: jsExprOk };
        }

        // --- UI takeover ---
        var __stWarnPanel = null;
        var __stWarnHeader = null;
        var __stWarnText = null;
        function _stBuildTakeoverUI() {
            if (__stWarnPanel) return;

            // Full-panel takeover container
            var __stHost = (pal.__stTabStack) ? pal.__stTabStack : pal;
            __stWarnPanel = __stHost.add("panel", undefined, "Setup Required");
            __stWarnPanel.orientation = "column";
            __stWarnPanel.alignChildren = ["fill", "top"];
            __stWarnPanel.margins = 14;
            __stWarnPanel.spacing = 12;
            try { __stWarnPanel.alignment = ["fill", "fill"]; } catch (eA0) {}

            // Inner boxed content (matches screenshot)
            var bodyBox = __stWarnPanel.add("panel");
            bodyBox.orientation = "column";
            bodyBox.alignChildren = ["fill", "top"];
            bodyBox.margins = 14;
            bodyBox.spacing = 10;
            try { bodyBox.alignment = ["fill", "top"]; } catch (eAB) {}            // Header row: icon + single-line headline (matches your earlier styled warning)
            var headerRow = bodyBox.add("group");
            headerRow.orientation = "row";
            headerRow.alignChildren = ["left", "center"];
            headerRow.spacing = 10;
            headerRow.alignment = ["fill", "top"];
            headerRow.margins = 0;

            // Big yellow triangle (reliable in docked panels)
            var warnIcon = headerRow.add("group");
            var iconW = 25, iconH = 25;
            warnIcon.preferredSize = [iconW, iconH];
            warnIcon.minimumSize   = [iconW, iconH];
            warnIcon.maximumSize   = [iconW, iconH];
            try { warnIcon.alignment = ["left", "center"]; } catch (eAI2) {}

            warnIcon.onDraw = function () {
                try {
                    var gr = this.graphics;
                    var w = this.size[0], h = this.size[1];
                    var pad = 2;

                    var topX = Math.round(w * 0.5);
                    var topY = pad;
                    var leftX = pad;
                    var leftY = h - pad;
                    var rightX = w - pad;
                    var rightY = h - pad;

                    var yellow = [1.0, 0.82, 0.0, 1.0]; // Shine yellow
                    var fillBrush = gr.newBrush(gr.BrushType.SOLID_COLOR, yellow);

                    var black = [0.08, 0.08, 0.08, 1];
                    var strokePen = gr.newPen(gr.PenType.SOLID_COLOR, black, 1);

                    gr.newPath();
                    gr.moveTo(topX, topY);
                    gr.lineTo(rightX, rightY);
                    gr.lineTo(leftX, leftY);
                    gr.closePath();

                    gr.fillPath(fillBrush);

                    try { gr.strokePath(strokePen); } catch(eS) {}
                } catch (eD) {}
            };
            try { warnIcon.notify('onDraw'); } catch (eND) {}

            __stWarnHeader = headerRow.add("statictext", undefined, "ShineTools needs these settings enabled:");
            __stWarnHeader.alignment = ["fill", "center"];

            // Body copy below headline
            __stWarnText = bodyBox.add("statictext", undefined, "", { multiline: true });
            __stWarnText.alignment = ["fill", "top"];

            // Populate copy immediately so the bodyBox isn't blank on first draw.
            try { _stSetWarnCopy(_stRunLaunchChecks()); } catch (eCopy) {}

        }

        function _stSetWarnCopy(status) {
            // Only show the lines that actually need to be changed.
            // status: { ok:Boolean, canWrite:Boolean, jsExpr:Boolean }
            var lines = [];

            // Normalize
            status = status || {};
            var needWrite = (status.canWrite !== true);
            var needJS    = (status.jsExpr   !== true);

            lines.push("");
            lines.push("Fix steps:");

            if (needWrite) {
                lines.push("• Settings > Scripting & Expressions > Allow Scripts");
                lines.push("  to Write Files and Access Network");
                // spacer between bullets if both are needed
                if (needJS) lines.push("");
            }

            if (needJS) {
                lines.push("• File > Project Settings > Expressions > Use \"JavaScript\"");
            }

            lines.push("");
            lines.push("• Restart After Effects");

            try { if (__stWarnText) __stWarnText.text = lines.join("\n"); } catch (eT) {}
            try { if (__stWarnHeader) __stWarnHeader.text = "ShineTools needs these settings enabled:"; } catch (eH) {}
        }

                // 
function _stCollapseWarn() {
            try {
                if (!__stWarnPanel) return;
                __stWarnPanel.visible = false;
                __stWarnPanel.minimumSize = [0, 0];
                __stWarnPanel.maximumSize = [0, 0];
                __stWarnPanel.preferredSize = [0, 0];
            } catch (e) {}
        }

        function _stExpandWarn() {
            try {
                if (!__stWarnPanel) return;
                __stWarnPanel.visible = true;
                __stWarnPanel.minimumSize = [0, 0];
                __stWarnPanel.maximumSize = [9999, 9999];
                __stWarnPanel.preferredSize = [pal.size[0], pal.size[1]];

                // Encourage wrapping by constraining width
                try {
                    var pad = 60; // approx margins + icon + spacing
                    var w = Math.max(200, pal.size[0] - pad);
                    __stWarnText.preferredSize = [w, -1];
                    try { __stWarnHeader.preferredSize = [w, -1]; } catch (eWH) {}
                } catch (eW) {}

                // Pin to top + fill
                try { __stWarnPanel.alignment = ["fill", "top"]; } catch (eA) {}
                try { __stWarnPanel.location = [0, 0]; } catch (eL) {}
                try { __stWarnPanel.bounds = [0, 0, pal.size[0], pal.size[1]]; } catch (eB) {}
            } catch (e) {}
        }

        function _stApplyTakeoverVisibility(forceRestore) {
            var res = _stRunLaunchChecks();
            var shouldWarn = (!res.ok && !forceRestore);

            try { _stSetWarnCopy(res); } catch (eCopy2) {}
// If the warning lives inside the tabStack, we must NOT hide the tabStack itself.
            var host = null;
            try { host = (pal.__stTabStack) ? pal.__stTabStack : pal; } catch (eH) { host = pal; }

            // 1) Root visibility on the pal level.
            //    - When warning is active: hide everything except the host container.
            //    - When warning is NOT active: show everything, but DO NOT force all stack tabs visible.
            try {
                for (var i = 0; i < pal.children.length; i++) {
                    var ch = pal.children[i];
                    if (!ch) continue;

                    if (shouldWarn) {
                        // Keep host visible (it will either be pal itself, or the stack group inside pal)
                        if (host !== pal && ch === host) { ch.visible = true; continue; }
                        // If warning is hosted on pal directly, keep only the warn panel visible
                        if (host === pal && __stWarnPanel && ch === __stWarnPanel) { ch.visible = true; continue; }
                        ch.visible = false;
                    } else {
                        // Restore normal UI; don't override tab visibility logic
                        ch.visible = true;
                    }
                }
            } catch (eRoot) {}

            // 2) If warning is hosted inside the tabStack, we MUST restore a visible content tab
            //    because during takeover we hide all other stack children.
            if (host && host !== pal) {
                try {
                    // First: hide everything in the stack (we'll explicitly re-show the correct tab next)
                    for (var j = 0; j < host.children.length; j++) {
                        var hc = host.children[j];
                        if (!hc) continue;
                        hc.visible = false;
                    }

                    if (shouldWarn) {
                        // Show only the warning overlay
                        if (__stWarnPanel) __stWarnPanel.visible = true;
                    } else {
                        // Hide overlay and restore MAIN (fallback to first non-overlay child)
                        if (__stWarnPanel) __stWarnPanel.visible = false;

                        var mainTab = null;
                        try { mainTab = pal.__stTabMain || null; } catch (eM) { mainTab = null; }

                        if (mainTab) {
                            mainTab.visible = true;
                        } else {
                            // Fallback: first stack child that isn't the overlay
                            for (var k = 0; k < host.children.length; k++) {
                                var cc = host.children[k];
                                if (!cc) continue;
                                if (__stWarnPanel && cc === __stWarnPanel) continue;
                                cc.visible = true;
                                break;
                            }
                        }
                    }
                } catch (eHost) {}
            }

            // Ensure warning visibility + sizing
            try {
                if (__stWarnPanel) {
                    __stWarnPanel.visible = shouldWarn ? true : false;
                    __stWarnPanel.minimumSize = [0, 0];
                    __stWarnPanel.maximumSize = [9999, 9999];
                    __stWarnPanel.alignment = ["fill", "fill"];
                }
            } catch (eW) {}

            // Refresh layout
            try {
                pal.layout.layout(true);
                pal.layout.resize();
            } catch (eL) {}
        }


        _stBuildTakeoverUI();
        _stCollapseWarn();
        _stApplyTakeoverVisibility(false);

        // Keep takeover pinned during resize
        try {
            var prevResize = pal.onResize;
            pal.onResize = function () {
                try { if (prevResize) prevResize(); } catch (e0) {}
                try { if (__stWarnPanel && __stWarnPanel.visible) _stExpandWarn(); } catch (e1) {}
            };
        } catch (eR) {}

        try {
            var prevResizing = pal.onResizing;
            pal.onResizing = function () {
                try { if (prevResizing) prevResizing(); } catch (e0) {}
                try { if (__stWarnPanel && __stWarnPanel.visible) _stExpandWarn(); } catch (e1) {}
            };
        } catch (eRR) {}

    })(myPal);
} catch (eLaunchCheck) {}


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
