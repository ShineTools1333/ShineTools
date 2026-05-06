// =================================================================================================
// ShineTools_Main.jsx
// Clean Base: 2026-05-02
// Version: v1.1
// Build marker: CLEAN_BASE_HOVERLIVE_RENAME_REFRESH_2026-05-02
//
// Notes:
// - Conservative cleanup pass from the working HoverLive clean base.
// - Keeps current UI behavior, tool wiring, workspace loading, and hover polling intact.
// - Removes stale diagnostic comments and consolidates only obvious redundant namespace setup.
// - Uses native ScriptUI controls; no custom paint callbacks are installed.
// - 2026-05-05 stability pass: removed remaining hover-driven dropdown clamp + ShineTracker hover swap.
// =================================================================================================

var ST = ST || {};

ST.TEXT = ST.TEXT || {
    // Tabs / section titles
    MAIN: "MAIN",
    PROJECTS: "PROJECTS",
    SOLIDS: "SOLIDS",
    TEXT: "TEXT",
    HELP: "HELP",
    UPDATES: "UPDATES",
    REQUESTS: "REQUESTS",

    // Common button/option labels
    TEXT_BOX: "TEXT BOX",
    TRIM_LAYER: "TRIM LAYER",
    BREAK_APART_TEXT: "BREAK APART TEXT",
    FRAME_AS_JPG: "FRAME AS .JPG...",
    SOLID_BTN: "SOLID...",
    PRORES_422: "PRORES 422...",
    REFRESH: "REFRESH",
    STATUS: "STATUS",
    EASE_IN: "EASE IN",
    EASE_OUT: "EASE OUT",
    EXPONENTIAL: "EXPONENTIAL",
    CUBIC: "CUBIC",
    SQUARE: "SQUARE",

    // Shared UI labels
    CHECK_FOR_UPDATES: "CHECK FOR UPDATES",
    INSTALL_UPDATE: "INSTALL UPDATE",
    OFFSET_LAYERS: "OFFSET LAYERS",
    ANIMATE_STROKE: "ANIMATE STROKE",
    BOUNCE: "BOUNCE",
    UTILITIES: "UTILITIES",
    EXPORT_FONT_LIST: "EXPORT FONT LIST",
    COPY_FOUND_FONTS: "COPY FOUND FONTS"
};

ST.CONST = ST.CONST || {
    // Common folder names
    FOLDER_01_MAIN: "01_MAIN",
    FOLDER_04_IMAGES: "04_IMAGES",
    FOLDER_04_PHOTOS: "04_PHOTOS",
    FOLDER_07_PRECOMPS: "07_PRECOMPS",
    // Common color arrays (used for solids / ScriptUI pens/brushes)
    COLORS: {
        WHITE_RGB: [1, 1, 1],
        TRANSPARENT_RGBA: [0, 0, 0, 0],
        SHINE_YELLOW_RGBA: [1.0, 0.82, 0.2, 1]
    }
};

// Backwards-compatible aliases (existing code continues to use ST_LABELS / ST_CONST)
var ST_LABELS = ST.TEXT;
var ST_CONST  = ST.CONST;

// =======================================================
// SHINE TOOLS – VERSION (EDIT THIS ONLY PER RELEASE)
// =======================================================
// File name stays: ShineTools.jsx
// Panel title: ShineTools_vX.Y
// Other UI: vX.Y

var SHINE_PRODUCT_NAME = "ShineTools";
var SHINE_VERSION      = "1.1";
var __ST_PATCH_MARKER__ = "LIGHTWEIGHT_ACCORDION_CLIP_FIX_2026-05-05";
var SHINE_VERSION_TAG  = "v" + SHINE_VERSION;
var SHINE_TITLE_TEXT   = SHINE_PRODUCT_NAME + "_" + SHINE_VERSION_TAG;
var SHINETOOLS_VERSION = SHINE_VERSION_TAG;

function _resolveActiveWorkspaceStatusName() {
    var name = "";
    try { name = String(pal.__stCurrentWorkspaceName || ""); } catch (e0) { name = ""; }

    try {
        if (!name && pal.__stWorkspaceDropdown && pal.__stWorkspaceDropdown.selection) {
            name = String(pal.__stWorkspaceDropdown.selection.text || "");
        }
    } catch (e1) {}

    try {
        if (!name && pal.__stPendingWorkspaceName) {
            name = String(pal.__stPendingWorkspaceName || "");
        }
    } catch (e2) {}

    return String(name || "");
}

function _updateWorkspaceStatusLabel(options) {
    try {
        var name = "";
        var __stHasAnyWorkspaces = false;
        try {
            var __stNames = _stListWorkspaceNames();
            __stHasAnyWorkspaces = !!(__stNames && __stNames.length);
        } catch (eNames) { __stHasAnyWorkspaces = false; }

        if (!__stHasAnyWorkspaces) {
            // Do not clear the persisted last-used workspace here.
            // During startup / refresh there can be transient moments where the list is empty.
            // We only want the UI to fall back visually, not wipe the saved active workspace.
            try { pal.__stWorkspaceStatusName = ""; } catch (eClrA) {}
            name = "";
        } else {
            try { name = String(pal.__stWorkspaceStatusName || ""); } catch (e0) { name = ""; }
            try { if (!name) name = String(pal.__stCurrentWorkspaceName || ""); } catch (e1) {}
            try { if (!name) name = String(pal.__stStartupAppliedWorkspaceName || ""); } catch (e3) {}
            try { if (!name) name = String(pal.__stPendingWorkspaceName || ""); } catch (e4) {}
            try { if (!name) name = String(_stReadLastUsedWorkspaceName() || ""); } catch (e2) {}
            try { if (!name && pal.__stWorkspaceDropdown && pal.__stWorkspaceDropdown.selection) name = String(pal.__stWorkspaceDropdown.selection.text || ""); } catch (e1a) {}
        }

        name = String(name || "").replace(/^\s+|\s+$/g, "");
        var __statusDisplayText = name ? ("Workspace: " + name) : "Workspace:";
        try { pal.__stWorkspaceStatusName = name; } catch (e5) {}

        try {
            if (pal.__stWorkspaceStatusNameLabel_MAIN) {
                pal.__stWorkspaceStatusNameLabel_MAIN.text = ((name && String(name).replace(/^\s+|\s+$/g, "")) ? ("Workspace: " + name) : "Workspace:");
                try { pal.__stWorkspaceStatusNameLabel_MAIN.characters = Math.max(12, Math.min(64, String(name ? ("Workspace: " + name) : "Workspace:").length + 1)); } catch (e6a0) {}
                try { pal.__stWorkspaceStatusNameLabel_MAIN.justify = "right"; } catch (e6a1) {}
                try { pal.__stWorkspaceStatusNameLabel_MAIN.alignment = ["right", "center"]; } catch (e6a2) {}
                try { pal.__stWorkspaceStatusNameLabel_MAIN.minimumSize = [0, 20]; pal.__stWorkspaceStatusNameLabel_MAIN.maximumSize = [10000, 20]; } catch (e6a3) {}
            }
        } catch (e6a) {}
        try {
            if (pal.__stWorkspaceStatusNameLabel_TEXT) {
                pal.__stWorkspaceStatusNameLabel_TEXT.text = ((name && String(name).replace(/^\s+|\s+$/g, "")) ? ("Workspace: " + name) : "Workspace:");
                try { pal.__stWorkspaceStatusNameLabel_TEXT.characters = Math.max(12, Math.min(64, String(name ? ("Workspace: " + name) : "Workspace:").length + 1)); } catch (e6b0) {}
                try { pal.__stWorkspaceStatusNameLabel_TEXT.justify = "right"; } catch (e6b1) {}
                try { pal.__stWorkspaceStatusNameLabel_TEXT.alignment = ["right", "center"]; } catch (e6b2) {}
                try { pal.__stWorkspaceStatusNameLabel_TEXT.minimumSize = [0, 20]; pal.__stWorkspaceStatusNameLabel_TEXT.maximumSize = [10000, 20]; } catch (e6b3) {}
            }
        } catch (e6b) {}
        try {
            if (pal.__stWorkspaceStatusNameLabel) {
                pal.__stWorkspaceStatusNameLabel.text = ((name && String(name).replace(/^\s+|\s+$/g, "")) ? ("Workspace: " + name) : "Workspace:");
                try { pal.__stWorkspaceStatusNameLabel.characters = Math.max(12, Math.min(64, String(name ? ("Workspace: " + name) : "Workspace:").length + 1)); } catch (e6c0) {}
                try { pal.__stWorkspaceStatusNameLabel.justify = "right"; } catch (e6c1) {}
                try { pal.__stWorkspaceStatusNameLabel.alignment = ["right", "center"]; } catch (e6c2) {}
                try { pal.__stWorkspaceStatusNameLabel.minimumSize = [0, 20]; pal.__stWorkspaceStatusNameLabel.maximumSize = [260, 20]; pal.__stWorkspaceStatusNameLabel.preferredSize = [Math.max(18, Math.min(260, (String(__statusDisplayText || "Workspace:").length * 9) + 10)), 20]; } catch (e6c3) {}
            }
        } catch (e6c) {}

        try {
            if (pal.__stWorkspaceStatusNameLabels && pal.__stWorkspaceStatusNameLabels.length) {
                for (var i = 0; i < pal.__stWorkspaceStatusNameLabels.length; i++) {
                    try {
                        var lbl = pal.__stWorkspaceStatusNameLabels[i];
                        if (!lbl) continue;
                        lbl.text = __statusDisplayText;
                        try { lbl.characters = Math.max(1, Math.min(32, String(__statusDisplayText || "Workspace:").length + 1)); } catch (e7a) {}
                        try { lbl.justify = "right"; } catch (e7b) {}
                        try { lbl.alignment = ["right", "center"]; } catch (e7c) {}
                        try { lbl.minimumSize = [0, 20]; lbl.maximumSize = [260, 20]; lbl.preferredSize = [Math.max(18, Math.min(260, (String(__statusDisplayText || "Workspace:").length * 9) + 10)), 20]; } catch (e7d) {}
                    } catch (e7) {}
                }
            }
        } catch (e8) {}

        var __stDoRelayout = true;
        try { if (options && options.suppressLayout) __stDoRelayout = false; } catch (eOpt0) {}
        if (__stDoRelayout) {
            try { if ($.global.__ST_isSafeToTouchUI__ && !$.global.__ST_isSafeToTouchUI__()) return; } catch (eSafeWS) { return; }
            try { if (pal.layout) pal.layout.layout(true); } catch (e9) {}
            try { if (pal.layout) pal.layout.resize(); } catch (e10) {}
            try { if (pal.update) pal.update(); } catch (e11) {}
        }
    } catch (e12) {}
}

function _stReadLastUsedWorkspaceName() {
    try {
        if (app && app.settings && app.settings.haveSetting("ShineTools", "CurrentWorkspaceName")) {
            return String(app.settings.getSetting("ShineTools", "CurrentWorkspaceName") || "");
        }
    } catch (e0) {}
    return "";
}

function _stWriteLastUsedWorkspaceName(name) {
    try {
        var clean = String(name || "").replace(/^\s+|\s+$/g, "");
        if (!app || !app.settings) return false;
        app.settings.saveSetting("ShineTools", "CurrentWorkspaceName", clean);
        return true;
    } catch (e1) {}
    return false;
}

function _syncWorkspaceDropdownToActiveName() {
    try {
        if (!pal || !pal.__stWorkspaceDropdown) return false;
        var dd = pal.__stWorkspaceDropdown;
        var wanted = "";
        try { wanted = String(pal.__stCurrentWorkspaceName || pal.__stStartupAppliedWorkspaceName || pal.__stPendingWorkspaceName || ""); } catch (e0) { wanted = ""; }
        if (!wanted) return false;

        try {
            pal.__stWorkspaceDropdownSyncing = true;
            for (var i = 0; i < dd.items.length; i++) {
                try {
                    if (String(dd.items[i].text || "") === wanted) {
                        dd.selection = i;
                        try { pal.__stWorkspaceStatusName = wanted; } catch (e1a) {}
                        return true;
                    }
                } catch (e1) {}
            }
        } catch (e2) {}
        finally {
            try { pal.__stWorkspaceDropdownSyncing = false; } catch (e3) {}
        }
    } catch (e4) {}
    return false;
}

(function ShineTool(thisObj) {

    // ============================================================
    // INIT GUARD: prevent double-initialization
    // If the loader (or user) runs ShineTools more than once, reuse the existing panel instead of re-building.
    // ============================================================
    try {
        if ($.global.__ShineToolsInitialized) {
            var __p = null;
            try { __p = $.global.__ShineTools_pal; } catch (e0) {}
            if (__p) { try { __p.toString(); } catch (e1) { __p = null; } }
            if (__p) {
                try { $.global.__ShineToolsKickLayout && $.global.__ShineToolsKickLayout(); } catch (e2) {}
                return;
            } else {
                try { $.global.__ShineToolsInitialized = false; } catch (e3) {}
            }
        }
    } catch (eG) {}

    // ============================================================
    // GLOBAL MODAL SAFETY (scheduleTask-safe)
    // ------------------------------------------------------------
    // scheduleTask() executes in the global eval context, so any
    // wrapper MUST live on $.global (not only inside this closure).
    // ============================================================
    try {
        if (!$.global.__ST_withModalSafety__) {

            // Global "is it safe to touch ScriptUI right now?" helper.
            // Used to prevent post-render / modal edge-case panel freezes.
            $.global.__ST_isSafeToTouchUI__ = function () {
                try {
                    try { if ($.global.__ShineToolsClosing__ === true) return false; } catch (ePCG) {}
                    try { if ($.global.__ShineToolsIsPanelSafe__ && !$.global.__ShineToolsIsPanelSafe__()) return false; } catch (ePCS) {}
                    // UI cooldown window (ms) after long ops like render.
                    try {
                        if ($.global.__ST_UI_COOLDOWN_UNTIL__) {
                            var nowMs = (new Date()).getTime();
                            if (nowMs < $.global.__ST_UI_COOLDOWN_UNTIL__) return false;
                        }
                    } catch (eC) {}

                    // Explicit long-op flag (we set this around renders).
                    try { if ($.global.__ST_LONGOP__ === true) return false; } catch (eL) {}

                    // Saving can trigger modal-ish UI moments.
                    try { if (app && app.isSaving) return false; } catch (eS) {}

                    // Rendering state (Render Queue)
                    try {
                        if (app && app.project && app.project.renderQueue) {
                            if (app.project.renderQueue.rendering) return false;
                        }
                    } catch (eR) {}

                    return true;
                } catch (e) {}
                return true; // best-effort fallback
            };

            // Simple helper to set a UI cooldown (ms) after long ops.
            $.global.__ST_SetUICooldown__ = function (ms) {
                try {
                    var dur = (ms === undefined || ms === null) ? 500 : ms;
                    dur = Math.max(0, dur);
                    $.global.__ST_UI_COOLDOWN_UNTIL__ = (new Date()).getTime() + dur;
                } catch (e) {}
            };

            $.global.__ST_withModalSafety__ = function (fn) {
                try {
                    if ($.global.__ST_isSafeToTouchUI__ && !$.global.__ST_isSafeToTouchUI__()) return;
                    if (fn && typeof fn === "function") fn();
                } catch (e) {}
            };

            // Global panel-closing guard: all deferred UI ticks must bail once the panel is hiding/closing.
            try { if ($.global.__ShineToolsClosing__ === undefined) $.global.__ShineToolsClosing__ = false; } catch (ePC0) {}
            $.global.__ShineToolsIsPanelSafe__ = function () {
                try { if ($.global.__ShineToolsClosing__ === true) return false; } catch (ePC1) {}
                try {
                    var p = $.global.__ShineTools_pal;
                    if (!p) return false;
                    try { p.toString(); } catch (ePC2) { return false; }
                    return true;
                } catch (ePC3) {}
                return false;
            };
        }
    } catch (eG) {}


    // ============================================================
    // MODAL/RENDER SAFE UI GATE
    // ------------------------------------------------------------
    // Do not remove any features. Instead, any direct ScriptUI touch
    // (layout/update/dropdown clamp/hover tick) should pass through this
    // gate so AE is not asked to execute UI code while it is returning
    // from a native modal dialog, render, save, or focus transition.
    // ============================================================
    try {
        $.global.__ST_MODAL_SAFE_PATCH_VERSION__ = "MODAL_RENDER_SAFE_UI_GATE";

        $.global.__ST_nowMs__ = function(){
            try { return (new Date()).getTime(); } catch(e) { return 0; }
        };

        $.global.__ST_SetUICooldown__ = function(ms) {
            try {
                var dur = (ms === undefined || ms === null) ? 1800 : ms;
                dur = Math.max(0, dur);
                var until = $.global.__ST_nowMs__() + dur;
                if (!$.global.__ST_UI_COOLDOWN_UNTIL__ || until > $.global.__ST_UI_COOLDOWN_UNTIL__) {
                    $.global.__ST_UI_COOLDOWN_UNTIL__ = until;
                }
            } catch (e) {}
        };

        $.global.__ST_isSafeToTouchUI__ = function () {
            try {
                try { if ($.global.__ShineToolsClosing__ === true) return false; } catch (e0) {}
                try { if ($.global.__ST_LONGOP__ === true) return false; } catch (e1) {}
                try { if ($.global.__ST_MODAL_DEPTH__ && $.global.__ST_MODAL_DEPTH__ > 0) return false; } catch (e2) {}
                try {
                    if ($.global.__ST_UI_COOLDOWN_UNTIL__) {
                        var now = $.global.__ST_nowMs__ ? $.global.__ST_nowMs__() : (new Date()).getTime();
                        if (now < $.global.__ST_UI_COOLDOWN_UNTIL__) return false;
                    }
                } catch (e3) {}
                try { if (app && app.isSaving) { $.global.__ST_SetUICooldown__(1800); return false; } } catch (e4) {}
                try {
                    if (app && app.project && app.project.renderQueue && app.project.renderQueue.rendering) {
                        $.global.__ST_LONGOP__ = true;
                        $.global.__ST_SetUICooldown__(3000);
                        return false;
                    }
                } catch (e5) {}
                try {
                    if ($.global.__ShineToolsIsPanelSafe__ && !$.global.__ShineToolsIsPanelSafe__()) return false;
                } catch (e6) {}
                return true;
            } catch (e) {}
            return false;
        };

        $.global.__ST_SafeUITouch__ = function(fn) {
            try {
                if ($.global.__ST_isSafeToTouchUI__ && !$.global.__ST_isSafeToTouchUI__()) return null;
                if (fn && typeof fn === "function") return fn();
            } catch (e) {}
            return null;
        };
    } catch (eSTSafePatch) {}

    try {
        if ($.global.__ST_HOST_PANEL && ($.global.__ST_HOST_PANEL instanceof Panel)) {
            thisObj = $.global.__ST_HOST_PANEL;
        }
    } catch (eHost) {}
    try { $.global.__ST_HOST_PANEL = null; } catch (eClr) {}

// =================================================================================================
// UTILITIES: BOOTSTRAP: Shared-root / self-loader
// =================================================================================================
    function _stGetSharedRootFolder() {
        // Prefer the SYSTEM payload location (installer drops assets here):
        //   /Library/Application Support/ShineTools
        // Fallbacks:
        //   ~/Library/Application Support/ShineTools  (user-level payload)
        //   ~/Library/Application Support/ShineTools           (legacy root)
        try {
            var sysPayload = new Folder("/Library/Application Support/ShineTools");
            if (sysPayload && sysPayload.exists) return sysPayload;

            var userPayload = new Folder("~/Library/Application Support/ShineTools");
            if (userPayload && userPayload.exists) return userPayload;
        } catch (_p) {}

        // USER Application Support (macOS): ~/Library/Application Support/ShineTools
        // NOTE: In After Effects ExtendScript on macOS, Folder.appData may resolve to the SYSTEM /Library.
        // Folder.userData is more reliable for the current user. We then step up to ".../Application Support".
        try {
            var ud = Folder.userData; // often: ~/Library/Application Support/Adobe
            var appSupport = null;

            if (ud && ud.exists) {
                // If userData points to ".../Application Support/Adobe", parent is ".../Application Support"
                if (ud.parent && ud.parent.exists && /Application Support$/.test(ud.parent.fsName)) {
                    appSupport = ud.parent;
                } else if (/\/Library$/.test(ud.fsName) || /\/Library$/.test(ud.fsName)) {
                    // If userData is just ".../Library"
                    appSupport = new Folder(ud.fsName + "/Application Support");
                } else if (/Application Support$/.test(ud.fsName)) {
                    // If userData is already ".../Application Support"
                    appSupport = ud;
                } else if (ud.parent && ud.parent.exists && (/\/Library$/.test(ud.parent.fsName) || /\/Library$/.test(ud.parent.fsName))) {
                    // If parent is ".../Library"
                    appSupport = new Folder(ud.parent.fsName + "/Application Support");
                }
            }

            if (!appSupport) appSupport = new Folder("~/Library/Application Support");
            return new Folder(appSupport.fsName + "/ShineTools");
        } catch (e) {
            return new Folder("~/Library/Application Support/ShineTools");
        }
    }

function _stGetSharedMainFile() {
        // System-wide shared location. Installer will place the main script here so all AE versions load the same code.
        // NOTE: Writing here generally requires admin during install, but ShineTools updates will also target this file.
        // If your environment blocks writes to /Library from AE, switch to Folder.userData instead.
        try {
            var dir = _stGetSharedRootFolder();
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
// =================================================================================================
// UTILITIES: UI SUPPORT: Dropdown temp state / flash
// =================================================================================================
    function _ensureDDStore() {
        if (!$.global.__ShineToolsDDStore) $.global.__ShineToolsDDStore = {};
        return $.global.__ShineToolsDDStore;
    }

    // ============================================================
    // DEBUG FLAGS (set to true temporarily while troubleshooting)
    // ============================================================
    var ST_DEBUG_LISTS = false; // when true, logs list load/save source to the JavaScript Console
// =================================================================================================
// UTILITIES: DEBUG + OS INTEGRATION: debug info / clipboard / safe run
// =================================================================================================
    function _dbgList(msg) {
        try { if (ST_DEBUG_LISTS) $.writeln("[ShineTools][LIST] " + msg); } catch (e) {}
    }

    // ============================================================
    // 0b) Lightweight helpers (safe, mac-only)
    // ============================================================
    // Namespace for debug toggles / shared state (kept global so a docked panel reload can reuse it).
    var ST = $.global.__ShineToolsNS || ($.global.__ShineToolsNS = { DEBUG: false });
    // Modal-safe mode: avoid persistent app.scheduleTask UI ticks; allow guarded one-shot dropdown clear.
    // Set false if you want the original deferred UI polish back.
    ST.SAFE_MODE = (ST.SAFE_MODE === false) ? false : true;
    var SHINETOOLS_BUILD_STAMP = "2026-01-18 02:08 UTC";

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
            // Store the last error for quick support snapshots.
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

    ST.Settings    = ST.Settings    || {};
    ST.Core        = ST.Core        || {};

    // Core input helpers (macOS modifiers)
    ST.Core.isCmdDown  = ST.Core.isCmdDown  || function() { return _isCmdDown(); };
    ST.Core.isOptDown  = ST.Core.isOptDown  || function() { return _isOptDown(); };
    ST.Core.isShiftDown = ST.Core.isShiftDown || function() { return isShiftDown(); };

    try {
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

    function _stNowMs() {
        try { return (new Date()).getTime(); } catch (e) {}
        return 0;
    }

    function _stMarkDropdownInteraction(dd, holdMs) {
        try {
            if (!dd) return;
            _ddEnsureKey(dd);
            var ms = (holdMs == null) ? 5000 : Math.max(0, holdMs);
            dd.__stDropdownInteracting = true;
            dd.__stDropdownInteractionUntil = _stNowMs() + ms;
        } catch (e) {}
    }

    function _stClearDropdownInteraction(dd, keepAliveMs) {
        try {
            if (!dd) return;
            if (keepAliveMs != null && keepAliveMs > 0) {
                dd.__stDropdownInteractionUntil = _stNowMs() + Math.max(0, keepAliveMs);
            }
            dd.__stDropdownInteracting = false;
        } catch (e) {}
    }

    function _stIsDropdownInteractionActive(dd) {
        try {
            if (!dd) return false;
            var now = _stNowMs();
            var until = 0;
            try { until = dd.__stDropdownInteractionUntil || 0; } catch (e0) {}
            if (until && now <= until) return true;
            try {
                var ks = ScriptUI.environment.keyboardState;
                if (dd.active && ks && (ks.leftButtonPressed || ks.rightButtonPressed)) return true;
            } catch (e1) {}
        } catch (e) {}
        return false;
    }

// =================================================================================================
// UTILITIES: TASKING: scheduleTask safe cancel
// =================================================================================================
    function _cancelTaskSafe(taskId) {
        try { if (taskId) app.cancelTask(taskId); } catch (e) {}
    }

    // ------------------------------------------------------------
    // Settings/state persistence removed.

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

    function _isOptDown() {
        // macOS Option key is reported as Alt in ScriptUI.
        try {
            var ks = ScriptUI.environment.keyboardState;
            return (ks && ks.altKey) ? true : false;
        } catch (e) {}
        return false;
    }

    function _isCmdDown() {
        // macOS Command key is reported as Meta in ScriptUI.
        try {
            var ks = ScriptUI.environment.keyboardState;
            return (ks && ks.metaKey) ? true : false;
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

    // Simple, robust dropdown reset used by MAIN Favorites and TEXT Animators.
    // It avoids the older shared message/defer framework that can leave the dropdown
    // stuck in a programmatic state after workspace-manager rebuilds.
    function _stResetDropdownToBlankSoon(dd, delayMs) {
        try {
            if (!dd) return;
            // Do not let the normal blank-reset routine erase the temporary "Added" message.
            try { if (dd.__stShowingAddedFlash === true) return; } catch (eFlashGuard) {}
            try { if ($.global.__ST_isSafeToTouchUI__ && !$.global.__ST_isSafeToTouchUI__()) return; } catch (eSafe) {}

            dd.__shineProgrammatic = true;
            try { dd.selection = 0; } catch (eSel) {}
            try { if (dd.window && dd.window.update) dd.window.update(); } catch (eUpd) {}
            dd.__shineProgrammatic = false;
            dd.__stBlankResetTaskId = 0;
        } catch (e) {}
    }

    // Temporary dropdown feedback used by PLUS buttons.
    // Shows "Added" directly in the CLOSED dropdown box for a short, real-time flash,
    // then rebuilds the dropdown back to its normal contents.
    // Keep the clear step independent from the broader post-dialog UI cooldown.
    try {
        if (!$.global.__ST_clearDropdownAddedFlash__) {
            $.global.__ST_clearDropdownAddedFlash__ = function (ddKey) {
                try {
                    var store = $.global.__ShineToolsDDStore || {};
                    var dd = store[String(ddKey || "")];
                    if (!dd) return;

                    // Overdue task guard:
                    // AE native progress windows (Import Project, render finalization, etc.) can hold
                    // a scheduleTask until AFTER the modal/progress state ends. If this clear task is
                    // badly overdue, do not touch ScriptUI immediately on that first post-modal tick.
                    // The next real user interaction / rebuild will normalize the dropdown safely.
                    try {
                        var __due = dd.__stAddedFlashDueMs || 0;
                        var __now = (new Date()).getTime();
                        if (__due && (__now - __due) > 700) {
                            try { dd.__stAddedFlashTaskId = 0; } catch (eLateTask) {}
                            return;
                        }
                    } catch (eLateGuard) {}

                    // Do not use the broad modal/render cooldown gate here.
                    // That gate includes the post-file-dialog cooldown, which was stretching
                    // the visible "Added" time to several seconds no matter what frame count was passed.
                    // Only avoid truly unsafe states: panel closing/dead or active render.
                    try { if ($.global.__ShineToolsClosing__ === true) return; } catch (eCloseGuard) {}
                    try { if ($.global.__ShineToolsIsPanelSafe__ && !$.global.__ShineToolsIsPanelSafe__()) return; } catch (ePanelGuard) {}
                    try {
                        if (app && app.project && app.project.renderQueue && app.project.renderQueue.rendering) {
                            // Do not queue a delayed ScriptUI clear during render/progress states.
                            return;
                        }
                    } catch (eRenderGuard) {}

                    dd.__shineProgrammatic = true;
                    try {
                        dd.__stShowingAddedFlash = false;
                        dd.__stFlashBlankText = " ";

                        // Restore the real dropdown contents. This is more reliable than trying
                        // to edit one item label back in place after ScriptUI has painted the closed box.
                        if (dd.__stAddedFlashRebuild && typeof dd.__stAddedFlashRebuild === "function") {
                            dd.__stAddedFlashRebuild();
                        } else {
                            try { dd.removeAll(); } catch (eRA) {}
                            try {
                                var blank = dd.add("item", " ");
                                blank._isBlank = true;
                                dd.selection = blank;
                            } catch (eBlank) {}
                        }

                        try { if (dd.items && dd.items.length > 0) dd.selection = dd.items[0]; } catch (eSel) {}
                        try { if (dd.window && dd.window.update) dd.window.update(); } catch (eUpd) {}
                    } catch (eUI) {}
                    dd.__shineProgrammatic = false;
                    try { dd.__stSuppressOnChangeUntil = 0; } catch (eSupDone) {}
                    try { dd.__stAddedFlashTaskId = 0; } catch (eDone) {}
                } catch (e) {}
            };
        }
    } catch (eAddedGlobal) {}

    function _dropdownResetAfterFrames(dd, frames) {
        // MODAL DIAGNOSTIC:
        // Do not queue a post-dialog/post-import scheduleTask that may run as AE returns
        // from a native progress window. Leave dropdown cleanup to the next normal rebuild.
        try { if (dd) dd.__stAddedFlashTaskId = 0; } catch (e) {}
        return;
    }

    function _ddFlashAddedFrames(dd, frames, rebuildFn) {
        try {
            if (!dd) return;
            var key = _ddEnsureKey(dd);
            if (!key) return;

            // The PLUS click continues only after the native file dialog has closed.
            // Do NOT bail because of the general modal/render cooldown here -- that cooldown
            // was preventing the user-facing "Added" feedback from ever appearing.
            // The delayed CLEAR task below remains safety-gated.

            try { if (dd.__stAddedFlashTaskId) app.cancelTask(dd.__stAddedFlashTaskId); } catch (eCancel) {}
            try { if (rebuildFn && typeof rebuildFn === "function") dd.__stAddedFlashRebuild = rebuildFn; } catch (eRebSet) {}

            // IMPORTANT: Do not just rename the existing blank item. In AE ScriptUI, the
            // closed dropdown box often will not repaint that change. Instead, temporarily
            // replace the dropdown contents with a single selected "Added" item, then rebuild
            // the normal list after roughly the requested frame count. This is visibly inside the blue box.
            var __flashMs = Math.max(120, Math.min(5000, Math.round(((frames == null) ? 30 : frames) * 33.333)));
            dd.__shineProgrammatic = true;
            try {
                dd.__stShowingAddedFlash = true;
                dd.__stSuppressOnChangeUntil = (new Date()).getTime() + __flashMs + 250;
                try { dd.removeAll(); } catch (eRemove) {}
                var addedItem = dd.add("item", "Added");
                // Do NOT mark this as _isBlank. Some AE builds fire onChange after the
                // programmatic selection, and the old blank-row logic would immediately
                // reset the dropdown before the user ever saw the message.
                try { addedItem._isAddedFlash = true; } catch (eFlag) {}
                try { addedItem.enabled = true; } catch (eEn) {}
                try { dd.selection = addedItem; } catch (eSelObj) { try { dd.selection = 0; } catch (eSelIdx) {} }
                try { dd.active = false; } catch (eAct) {}
                try { if (dd.parent && dd.parent.layout) dd.parent.layout.layout(true); } catch (eLayLocal) {}
                try { if (dd.window && dd.window.update) dd.window.update(); } catch (eUpd) {}
            } catch (eUI) {}
            // SAFE SYNC FLASH: keep the user-facing "Added" message visible briefly,
            // but do NOT use app.scheduleTask. scheduleTask was one of the risky pieces
            // around AE native progress windows. This blocks only this click handler for
            // a short moment, then restores the real dropdown contents synchronously.
            try {
                try { $.sleep(__flashMs); } catch (eSleep) {}
                dd.__stShowingAddedFlash = false;
                if (dd.__stAddedFlashRebuild && typeof dd.__stAddedFlashRebuild === "function") dd.__stAddedFlashRebuild();
                try { if (dd.items && dd.items.length > 0) dd.selection = dd.items[0]; } catch (eSel0) {}
                try { if (dd.window && dd.window.update) dd.window.update(); } catch (eUpd2) {}
            } catch (eRebNow) {}
            dd.__shineProgrammatic = false;
            // Intentionally no delayed reset task here.
        } catch (e) {}
    }

    // Apply an .ffx preset to a text layer (create/select a text layer if needed).
    // Exposed globally so dropdown handlers / deferred tasks can trigger it safely.
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
                    var __stRefLayer = null;
                    try {
                        if (comp.selectedLayers && comp.selectedLayers.length) __stRefLayer = comp.selectedLayers[0];
                    } catch (eRef0) {}

                    var target = null;
                    if (comp.selectedLayers && comp.selectedLayers.length > 0) {
                        var l = comp.selectedLayers[0];
                        if (l && l instanceof TextLayer) target = l;
                    }

                    if (!target) {
                        target = comp.layers.addText("Enter Text");
                        try {
                            var t0 = comp.time;
                            var d = t0 - target.inPoint;
                            target.startTime = target.startTime + d;
                            target.inPoint = t0;
                            if (target.outPoint < t0) target.outPoint = comp.duration;
                        } catch (eCTI) {}
                        try { if (__stRefLayer) target.moveBefore(__stRefLayer); } catch (eMv0) {}
                    }

                    try {
                        for (var i = 1; i <= comp.numLayers; i++) comp.layer(i).selected = false;
                    } catch (eSel) {}
                    try { target.selected = true; } catch (eSel2) {}

                    target.applyPreset(presetFile);
                });
            } catch (e) {
                alert("Could not apply preset.\n\n" + e.toString());
            }
        };
    }

    // Defer applying an .ffx preset so ScriptUI can repaint the dropdown selection first.
    // Also guards against rapid double-fires by canceling any pending apply task per dropdown.
    function _ddDeferApplyFFX(dd, presetPath, delayMs) {
        try {
            if (!dd) return;
            if (!_stIsDropdownInteractionActive(dd)) return;
            _stMarkDropdownInteraction(dd, 5000);
            dd.__shineApplyTaskId = 0;

            var safe = String(presetPath || "");
            try { $.global._shineToolsApplyFFXPreset(safe); } catch(eNow) {}
        } catch (e) {}
    }

    // ============================================================
    // Shared UI namespaces used by Workspace + Organize systems
    // ============================================================
    ST.UI = ST.UI || {};
    ST.UI.Dropdown = ST.UI.Dropdown || {};
    ST.UI.Dropdown.flash = ST.UI.Dropdown.flash || function(dd, frames) {
        return _ddFlashThenReset(dd, frames);
    };
    ST.UI.Dropdown.reset = ST.UI.Dropdown.reset || function(dd, delayMs) {
        return _stResetDropdownToBlankSoon(dd, delayMs);
    };
    ST.UI.Dropdown.deferPresetApply = ST.UI.Dropdown.deferPresetApply || function(dd, presetPath, delayMs) {
        return _ddDeferApplyFFX(dd, presetPath, delayMs);
    };
    ST.UI.Dropdown.markInteraction = ST.UI.Dropdown.markInteraction || function(dd, holdMs) {
        return _stMarkDropdownInteraction(dd, holdMs);
    };
    ST.UI.Dropdown.isInteractionActive = ST.UI.Dropdown.isInteractionActive || function(dd) {
        return _stIsDropdownInteractionActive(dd);
    };

    ST.UI.Organize = ST.UI.Organize || {};
    ST.UI.Organize.getSharedSizing = ST.UI.Organize.getSharedSizing || function() {
        var dialogW = 860;
        var dialogH = 580;
        return {
            dialogW: dialogW,
            dialogH: dialogH,
            listW: dialogW - 36,
            listH: 400
        };
    };
    ST.UI.Organize.buildConfig = ST.UI.Organize.buildConfig || function(kind, overrides) {
        var cfg = {};
        var sizing = ST.UI.Organize.getSharedSizing();
        cfg.dialogW = sizing.dialogW;
        cfg.dialogH = sizing.dialogH;
        cfg.listW = sizing.listW;
        cfg.listH = sizing.listH;
        cfg.multiselect = true;
        cfg.allowDelete = true;
        cfg.allowRename = true;
        cfg.allowNewDivider = true;
        cfg.allowDividerSelection = true;
        cfg.allowDividerDeletion = true;
        cfg.returnObjects = true;
        cfg.indentNonDividerRows = true;
        cfg.__stOrganizeSharedLayout = true; // Library Elements + Text Animators must stay visually identical.
        // Wider left/right dialog padding for the Organize dialogs so the list box
        // sits farther from the window edges.
        cfg.dialogPadLR = 28;
        cfg.dialogPadTop = 10;
        cfg.dialogPadBot = 10;

        if (kind === "text_animators") {
            // Keep Organize Text Animators visually matched to Organize Library Elements:
            // same shared dialog sizing, same list sizing, same bottom button architecture,
            // and the same one-line info copy so the dialog height/spacing does not shift.
            cfg.infoText = 'Shift / Cmd - Select multiple items to reorder, use "Move To..." to place them under section dividers, Rename selected items, or press Delete / Backspace to remove selected items.';
            cfg.addFilesHelpTip = "Add .ffx files to Text Animators";
        } else if (kind === "library_elements") {
            cfg.infoText = 'Shift / Cmd - Select multiple items to reorder, use "Move To..." to place them under section dividers, Rename selected items, or press Delete / Backspace to remove selected items.';
            cfg.addFilesHelpTip = "Add files to Library Elements";
        }

        if (overrides) {
            for (var k in overrides) {
                if (overrides.hasOwnProperty(k)) cfg[k] = overrides[k];
            }
        }
        return cfg;
    };

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

        try {
            var sharedLogo = tryIconsFolder(_stGetSharedRootFolder().fsName + "/logo");
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
    function warn(msg) {
    try {
        if (typeof __ST_withModalSafety__ === "function") {
            $.global.__ST_withModalSafety__(function(){ alert(msg); });
        } else {
            alert(msg);
        }
    } catch (e) {
        try { alert(msg); } catch (e2) {}
    }
}

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

// ------------------------------------------------------------
// Place a newly-created layer at the current time indicator (CTI)
// - Ensures the layer appears where you clicked, not at comp start.
// - Best-effort: sets startTime + inPoint, and caps outPoint to comp duration.
// ------------------------------------------------------------
function _stPlaceLayerAtCTI(layer, comp) {
    try {
        if (!layer) return;
        comp = comp || (layer.containingComp ? layer.containingComp : null);
        if (!comp) return;
        var t = 0;
        try { t = comp.time; } catch (eT) { t = 0; }

        // Shift the layer so its inPoint lands at CTI.
        // startTime can be used even on camera/light/null; inPoint ensures visibility starts at CTI.
        try { layer.startTime = t; } catch (eST) {}
        try { layer.inPoint  = t; } catch (eIN) {}
        try {
            // Keep the layer ending at comp end if possible
            var endT = comp.duration;
            if (endT !== undefined && endT !== null && isFinite(endT)) {
                if (layer.outPoint < endT) {
                    // Some layers default shorter; extend if needed
                    layer.outPoint = endT;
                } else {
                    // Otherwise, cap to comp end (most users expect full length)
                    layer.outPoint = Math.min(layer.outPoint, endT);
                }
            }
        } catch (eOUT) {}
    } catch (e) {}
}

    function isSolidFootageItem(it) {
        try {
            return (it && (it instanceof FootageItem) && it.mainSource && (it.mainSource instanceof SolidSource));
        } catch (e) { return false; }
    }

    // Robust solid detection helper (used by Organize Bin and test-solid cleanup)
    function isSolidFootageSafe(it){
        try{
            if (!(it && (it instanceof FootageItem))) return false;
            // Preferred: SolidSource
            try{ if (typeof isSolidFootageItem === "function" && isSolidFootageItem(it)) return true; }catch(e0){}
            var ms = it.mainSource;
            if (ms && (ms instanceof SolidSource)) return true;
            // Fallback heuristic: no file + has color/width/height (solid-like mainSource)
            if (!it.file && ms){
                if (ms.hasOwnProperty("color") && ms.hasOwnProperty("width") && ms.hasOwnProperty("height")) return true;
            }
        }catch(e){}
        return false;
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
        var userBaseName = __ST_promptSafe__("Name the new comp:", String(srcComp.name || "Comp") + "_");
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
        var suffix = __ST_promptSafe__("Add a suffix for the copied comps:", "_2");
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
            var precompsFolder = _findOrCreateRootFolder(ST_CONST.FOLDER_07_PRECOMPS);
            if (!precompsFolder) { alert("Could not create/find 07_PRECOMPS folder in the Project panel."); return; }

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

    function removeEffectByName(layer, effectName) {
        try {
            if (!layer) return false;
            var fx = layer.property("ADBE Effect Parade");
            if (!fx) return false;
            // Iterate backwards since removing shifts indices.
            for (var i = fx.numProperties; i >= 1; i--) {
                var e = fx.property(i);
                if (e && e.name === effectName) {
                    try { e.remove(); return true; } catch (eRm) { return false; }
                }
            }
        } catch (e) {}
        return false;
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

        // Prefer CompItem.selectedProperties when available.
        // This captures selections from the Effect Controls panel as well as the timeline.
        try {
            if (c && c.selectedProperties && c.selectedProperties.length) {
                var spC = c.selectedProperties;
                for (var a = 0; a < spC.length; a++) {
                    try {
                        var pC = spC[a];
                        if (pC && pC.canSetExpression) props.push(pC);
                    } catch (eC) {}
                }
            }
        } catch (e0) {}

        // Fallback: timeline selections via selectedLayers[].selectedProperties
        try {
            var layers = c.selectedLayers;
            for (var i = 0; i < layers.length; i++) {
                var sp = layers[i].selectedProperties;
                for (var j = 0; j < sp.length; j++) {
                    if (sp[j] && sp[j].canSetExpression) props.push(sp[j]);
                }
            }
        } catch (e1) {}

        // De-dupe (same prop can appear in both arrays)
        try {
            var out = [];
            var seen = {};
            for (var k = 0; k < props.length; k++) {
                var p = props[k];
                if (!p) continue;
                var key = "";
                try {
                    // propertyDepth+matchName is usually stable enough for dedupe.
                    key = String(p.propertyDepth) + "|" + String(p.matchName) + "|" + String(p.name);
                } catch (eK) {
                    key = "k" + k;
                }
                if (!seen[key]) { seen[key] = true; out.push(p); }
            }
            return out;
        } catch (e2) {}

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
        /* watcher no longer auto-starts on panel load (reduces AE cursor flicker); it starts on first TEXT BOX use */return;
    }

    // ---------- Module ----------
    var mod = {};
    mod.__version = "2.36";

    // ===== Tags =====
    var TAG_PRECOMP_LAYER = "SHINE_TEXT_BOX_PRECOMP_LAYER";
    var TAG_PRECOMP_COMP  = "ST_PRECOMP_COMP";
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
    var WATCH_INTERVAL_MS = 1000; // (disabled watcher) kept for legacy

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
   NOTE: Legacy list helpers removed; ShineTools now uses the unified
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
            if (!eff) return 0;
            return eff.property(1).value;
        } catch (e) { return 0; }
    }

    function getRevealSlider(boxLayer) {
        try {
            var fx = boxLayer.property("ADBE Effect Parade");
            if (!fx) return null;
            var e = fx.property("Animate %");
            if (!e) return null;
            return e.property(1);
        } catch (e) { return null; }
    }

    function ensureAnimateState(boxLayer) {

        // Patched: ANIMATE toggle removed. Do not auto-manage keys.
        return;
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
                // Only build keys if they are missing (do NOT retime existing keys)
                if (reveal.numKeys < 2) {
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

    // Public helper: enable ANIMATE + build Animate % keys immediately (used by TEXT BOX Option-click)
    mod.__enableRevealAnim = function(compId, boxIndex) {
        try {
            var comp = app.project && app.project.itemByID(compId);
            if (!isComp(comp)) return;
            if (boxIndex < 1 || boxIndex > comp.numLayers) return;

            var boxLayer = comp.layer(boxIndex);
            if (!boxLayer) return;

            try {
                var fx = boxLayer.property("ADBE Effect Parade");
                if (fx) {
                    if (a) a.property(1).setValue(1);
                    var r = fx.property("Animate %");
                    if (r) r.property(1).setValue(0);
                }
            } catch (eSet) {}
        } catch (e) {}
    };

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
                                "var p = 1; try { p = effect(\"Animate %\")(\"Slider\")/100; } catch (err) { p = 1; }",
                "var w = fullW*p;",
                "[w, fullH];"
            ].join("\n");

            rectPos.expressionEnabled = true;
            rectPos.expression = [
                "var px = effect(\"Padding\")(\"Point\")[0];",
                "var sr = thisLayer.parent.sourceRectAtTime(time,false);",
                "var fullW = sr.width + px*2;",
                                "var p = 1; try { p = effect(\"Animate %\")(\"Slider\")/100; } catch (err) { p = 1; }",
                "var w = fullW*p;",
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
                // Native control: set defaults once, then user edits Fill Color in Contents.
                try { fill.property("ADBE Vector Fill Color").setValue(DEFAULT_FILL_COLOR); } catch (eFC) {}
                // Keep checkbox controlling visibility
                fill.property("ADBE Vector Fill Opacity").expression = 'effect("FILL")("Checkbox")*100;';
            }

            if (stroke) {
                // Native control: set defaults once, then user edits Stroke Color/Width in Contents.
                try { stroke.property("ADBE Vector Stroke Width").setValue(DEFAULT_STROKE_W); } catch (eSW) {}
                try { stroke.property("ADBE Vector Stroke Color").setValue(DEFAULT_STROKE_COL); } catch (eSC) {}
                // Keep checkbox controlling visibility
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

            // Route the newly-created precomp comp into 07_PRECOMPS
            try { var _pf = _stGetOrCreatePrecompsFolderRoot(); if (_pf && pc) pc.parentFolder = _pf; } catch (ePF) {}

            // Tag the precomp comp so ORGANIZE BIN can route it later if needed
            try { if (pc) pc.comment = TAG_PRECOMP_COMP; } catch (eTag) {}
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

                    // Run directly (scheduleTask removed by request).
                    try { eval(_cmdOpenPrecompAndSelect); } catch (eSelPass1) {}
                    try { eval(_cmdOpenPrecompAndSelect); } catch (eSelPass2) {}
                    try { eval(_cmdSelectInside); } catch (eSelInside1) {}
                    try { eval(_cmdSelectInside); } catch (eSelInside2) {}
 } catch (eDockSel) {}

            }
            // TextBox watcher removed (no continuous polling needed)
} catch (e) {
            try { $.writeln("TEXT BOX precomp error: " + e.toString()); } catch (_e) {}
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
        // NOTE: Color/Width are now native Shape properties (no Effect Controls)

        addCheck(fx, "STROKE", DEFAULT_STROKE_ON);

        addSlider(fx, "Animate %", 100);
        try { fx.property("Animate %").property(1).minValue = 0; } catch (eMin) {}
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

        // Apply expressions + precompose directly (scheduleTask removed by request)
        try { $.global.__ST_withModalSafety__(function(){ $.global.ShineTools.TextBox.applyExpressions(compId, bi); }); } catch (eApplyNow) {}

        try { $.global.__ST_withModalSafety__(function(){ $.global.ShineTools.TextBox.precomposeTextBox(compId, ti, bi, initialName); }); } catch (ePreNow) {}
            // TextBox watcher removed (no continuous polling needed)
};

    // ----- Re-animate preset -----
    // Clears any keyframes on the "Animate %" slider and sets 0 -> 100 over N frames at the current time.
    mod.resetAnimate = function(frames) {
        try {
            frames = (frames === undefined || frames === null) ? 30 : Math.max(1, Math.floor(frames));
            var comp = app.project && app.project.activeItem;
            if (!isComp(comp)) { alert("Select a comp first."); return; }

            var t = comp.time;
            var dt = frames * comp.frameDuration;

            function isBoxLayer(lyr) {
                if (!lyr) return false;
                try {
                    if (isShapeLayer && isShapeLayer(lyr)) {
                        var nm = String(lyr.name || "");
                        if (nm.toLowerCase() === "text box") return true;
                    }
                } catch (e) {}
                // Fallback: check comment tag
                try {
                    var c = getCommentSafe(lyr);
                    if (c && String(c).indexOf("SHINE_TEXT_BOX_BOX_LAYER") !== -1) return true;
                } catch (e2) {}
                return false;
            }

            function findBoxForTextLayer(textLyr) {
                try {
                    if (!textLyr) return null;
                    for (var i=1; i<=comp.numLayers; i++) {
                        var lyr = comp.layer(i);
                        if (!lyr) continue;
                        if (lyr.parent === textLyr && isBoxLayer(lyr)) return lyr;
                    }
                } catch (e) {}
                return null;
            }

            var targetBox = null;

            // Prefer selected layer(s)
            if (comp.selectedLayers && comp.selectedLayers.length > 0) {
                var sel = comp.selectedLayers[0];

                // If a TEXT BOX shape is selected
                if (isBoxLayer(sel)) {
                    targetBox = sel;
                } else {
                    // If a text layer is selected, find its paired box (parented)
                    try {
                        if (isTextLayer && isTextLayer(sel)) {
                            targetBox = findBoxForTextLayer(sel);
                        }
                    } catch (e3) {}
                }
            }

            // Fallback: find first TEXT BOX layer in comp
            if (!targetBox) {
                for (var j=1; j<=comp.numLayers; j++) {
                    var l = comp.layer(j);
                    if (isBoxLayer(l)) { targetBox = l; break; }
                }
            }

            if (!targetBox) { alert("No TEXT BOX layer found. Select a TEXT BOX layer (or its text layer) and try again."); return; }

            var fx = targetBox.property("ADBE Effect Parade");
            if (!fx) { alert("TEXT BOX has no effects."); return; }

            var animFx = fx.property("Animate %");
            if (!animFx) { alert('Could not find "Animate %" on the TEXT BOX layer.'); return; }

            var slider = animFx.property(1);
            if (!slider) { alert('Could not access "Animate %" slider value.'); return; }

            app.beginUndoGroup("TEXT BOX Re-animate");

            // Clear keys
            try {
                while (slider.numKeys > 0) slider.removeKey(1);
            } catch (eK) {}

            // Set 0 -> 100 over N frames
            try { slider.setValueAtTime(t, 0); } catch (eA) { try { slider.setValue(0); } catch (eA2) {} }
            try { slider.setValueAtTime(t + dt, 100); } catch (eB) {}

            // Ensure current value is visible at CTI
            try { slider.setValueAtTime(t, 0); } catch (eC) {}

            app.endUndoGroup();

        } catch (e) {
            alert("TEXT BOX reset error:\n" + e.toString());
        }
    };

// ----- Toggle animation keys (SHIFT-click helper) -----
// If keyframes exist on "Animate %", remove them and set to 100.
// If none exist, add 0 -> 100 over N frames at the current time.
mod.toggleAnimateKeys = function(frames) {
    try {
        frames = (frames === undefined || frames === null) ? 30 : Math.max(1, Math.floor(frames));
        var comp = app.project && app.project.activeItem;
        if (!isComp(comp)) { alert("Select a comp first."); return; }

        // Require a selected TEXT BOX shape layer (per Jim's request)
        if (!comp.selectedLayers || comp.selectedLayers.length < 1) {
            alert('Select the TEXT BOX shape layer, then SHIFT-click "TEXT BOX" to toggle keys.');
            return;
        }

        var sel = comp.selectedLayers[0];
        // Validate selection is the box layer
        var isBox = false;
        try {
            if (isShapeLayer && isShapeLayer(sel)) {
                var nm = String(sel.name || "");
                if (nm.toLowerCase() === "text box") isBox = true;
            }
        } catch (e0) {}
        if (!isBox) {
            // Fallback: tag check
            try {
                var c = getCommentSafe(sel);
                if (c && String(c).indexOf("SHINE_TEXT_BOX_BOX_LAYER") !== -1) isBox = true;
            } catch (e1) {}
        }
        if (!isBox) {
            alert('SHIFT toggle requires the TEXT BOX shape layer to be selected.');
            return;
        }

        var fx = sel.property("ADBE Effect Parade");
        if (!fx) { alert("TEXT BOX has no effects."); return; }

        var animFx = fx.property("Animate %");
        if (!animFx) { alert('Could not find "Animate %" on the TEXT BOX layer.'); return; }

        var s = animFx.property(1);
        if (!s) { alert('Could not access "Animate %" slider value.'); return; }

        var t = comp.time;
        var dt = frames * comp.frameDuration;

        app.beginUndoGroup("TEXT BOX Toggle Animate Keys");

        if (s.numKeys && s.numKeys > 0) {
            // Remove keys and return to 100
            try { while (s.numKeys > 0) s.removeKey(1); } catch (eK) {}
            try { s.setValue(100); } catch (eV) {}
        } else {
            // Add 0 -> 100 keys over N frames
            try { s.setValueAtTime(t, 0); } catch (eA) { try { s.setValue(0); } catch (eA2) {} }
            try { s.setValueAtTime(t + dt, 100); } catch (eB) {}

try {
    var easeIn  = new KeyframeEase(0, 33);
    var easeOut = new KeyframeEase(0, 33);
    // First key (0%)
    if (s.numKeys >= 1) {
        s.setTemporalEaseAtKey(1, [easeIn], [easeOut]);
    }
    // Second key (100%)
    if (s.numKeys >= 2) {
        s.setTemporalEaseAtKey(2, [easeIn], [easeOut]);
    }
} catch (eEase) {}
}

        app.endUndoGroup();

    } catch (e) {
        alert("TEXT BOX toggle error:\n" + e.toString());
    }
};

    // ---------- Publish module (integrated) ----------
    ST.TextBox = mod;
    /* watcher no longer auto-starts on panel load; it starts on first TEXT BOX use */
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

        // MODAL DIAGNOSTIC:
        // Import can show AE's native progress UI for a while. Treat it like a long host op
        // and make sure ShineTools has no hover/dropdown/UI task waiting to touch ScriptUI
        // immediately after AE returns.
        try { if ($.global.__ShineTools_CancelHoverPoll__) $.global.__ShineTools_CancelHoverPoll__(); } catch (eH) {}
        try { if ($.global && $.global.__ST_SetUICooldown__) $.global.__ST_SetUICooldown__(3000); } catch (eCD0) {}
        try { $.global.__ST_LONGOP__ = true; } catch (eL0) {}
        try {
            var io = new ImportOptions(fileObj);
            return app.project.importFile(io);
        } finally {
            try { if ($.global && $.global.__ST_SetUICooldown__) $.global.__ST_SetUICooldown__(3000); } catch (eCD1) {}
            try { $.global.__ST_LONGOP__ = false; } catch (eL1) {}
        }
    }

    var FAV_SETTINGS_SECTION = "ShineTools";
    var FAV_SETTINGS_KEY     = "";
    var FAV_MAX              = 50;
    var FAV_DEFAULT_START_FOLDER = "/Volumes/EDIT DRIVE 8TB/_LIBRARY ELEMENTS";

var FAV_DEFAULT_START_FOLDER_NAME = "LIBRARY ELEMENTS_1"; // preferred start folder (mounted volume)

    var FAV_DIVIDER_PREFIX = "__FAV_DIVIDER__:";
    var FAV_DEFAULT_DIVIDERS = ["TEXTURES", "LENS FLARES", "LIGHT LEAKS", "TRANSITIONS"];

    function _favDividerToken(label) {
        return FAV_DIVIDER_PREFIX + String(label || "").toUpperCase();
    }
    function _favIsDividerToken(v) {
        return String(v || "").indexOf(FAV_DIVIDER_PREFIX) === 0;
    }
    function _favDividerLabelFromToken(v) {
        return String(v || "").replace(FAV_DIVIDER_PREFIX, "");
    }
    function _favDividerDisplay(label) {
        label = String(label || "").toUpperCase();
        return "──" + label + "──";
    }
    function _favEntryPath(v) {
        try {
            if (v && typeof v === "object") {
                if (v.path != null) return String(v.path || "");
            }
        } catch (e0) {}
        return String(v || "");
    }
    function _favEntryLabel(v) {
        try {
            if (v && typeof v === "object") return String(v.label || "");
        } catch (e0) {}
        return "";
    }
    function _favMakeEntry(pathStr, label) {
        var p = String(pathStr || "");
        if (!p) return "";
        if (_favIsDividerToken(p)) return p;
        return { path: p, label: String(label || "") };
    }
    function _favNormalizeEntries(arr) {
        var out = [];
        arr = arr || [];
        for (var iNE = 0; iNE < arr.length; iNE++) {
            var entry = arr[iNE];
            var p = _favEntryPath(entry);
            if (!p) continue;
            if (_favIsDividerToken(p)) out.push(p);
            else out.push(_favMakeEntry(p, _favEntryLabel(entry)));
        }
        return out;
    }
    function _favEnsureDefaultDividers(arr) {
        var out = [];
        var seen = {};
        var i, entry, v;
        var hasAnyDivider = false;
        arr = _favNormalizeEntries(arr || []);

        for (i = 0; i < arr.length; i++) {
            v = _favEntryPath(arr[i]);
            if (!v) continue;
            if (_favIsDividerToken(v)) { hasAnyDivider = true; break; }
        }

        if (!hasAnyDivider) {
            for (i = 0; i < FAV_DEFAULT_DIVIDERS.length; i++) {
                v = _favDividerToken(FAV_DEFAULT_DIVIDERS[i]);
                out.push(v);
                seen[v] = true;
            }
        }

        for (i = 0; i < arr.length; i++) {
            entry = arr[i];
            v = _favEntryPath(entry);
            if (!v) continue;
            if (_favIsDividerToken(v)) {
                if (_favIsDividerToken(v) && seen[v]) continue;
                out.push(v);
                seen[v] = true;
            } else {
                if (seen[v]) continue;
                out.push(_favMakeEntry(v, _favEntryLabel(entry)));
                seen[v] = true;
            }
        }

        for (i = 0; i < FAV_DEFAULT_DIVIDERS.length; i++) {
            v = _favDividerToken(FAV_DEFAULT_DIVIDERS[i]);
            if (!seen[v]) out.push(v);
        }

        return out;
    }

    var ANIM_DIVIDER_PREFIX = "__ANIM_DIVIDER__:";
    var ANIM_DEFAULT_DIVIDERS = ["USER ADDED"];

    function _animDividerToken(label) {
        return ANIM_DIVIDER_PREFIX + String(label || "").toUpperCase();
    }
    function _animIsDividerToken(v) {
        return String(v || "").indexOf(ANIM_DIVIDER_PREFIX) === 0;
    }
    function _animDividerLabelFromToken(v) {
        return String(v || "").replace(ANIM_DIVIDER_PREFIX, "");
    }
    function _animDividerDisplay(label) {
        label = String(label || "").toUpperCase();
        return "──────── " + label + " ────────";
    }
    function _animEnsureDefaultDividers(arr) {
        var out = [];
        var seen = {};
        var i, v;
        var hasAnyDivider = false;
        arr = arr || [];

        for (i = 0; i < arr.length; i++) {
            v = String(arr[i] || "");
            if (!v) continue;
            if (_animIsDividerToken(v)) { hasAnyDivider = true; break; }
        }

        if (!hasAnyDivider) {
            for (i = 0; i < ANIM_DEFAULT_DIVIDERS.length; i++) {
                v = _animDividerToken(ANIM_DEFAULT_DIVIDERS[i]);
                out.push(v);
                seen[v] = true;
            }
        }

        for (i = 0; i < arr.length; i++) {
            v = String(arr[i] || "");
            if (!v) continue;
            if (_animIsDividerToken(v) && seen[v]) continue;
            out.push(v);
            seen[v] = true;
        }

        for (i = 0; i < ANIM_DEFAULT_DIVIDERS.length; i++) {
            v = _animDividerToken(ANIM_DEFAULT_DIVIDERS[i]);
            if (!seen[v]) out.push(v);
        }

        return out;
    }

    // TEXT TAB: ANIMATIONS BAR (preset list)
    var ANIM_SETTINGS_SECTION = "ShineTools";
    var ANIM_SETTINGS_KEY     = "text_animations_ffx_v1";
    var ANIM_BUNDLED_ORDER_KEY = "text_animations_bundled_order_v1";
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

    try {
        var sharedPF = Folder(_stGetSharedRootFolder().fsName + "/" + ANIM_BUNDLED_SUBFOLDER);
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

// Session-only list helpers
    // ------------------------------------------------------------
    function _listParseCompat(raw) {
        if (!raw) return [];
        // Prefer JSON (current format)
        var arr = _favParse(raw);
        if (arr && arr.length) return arr;

        // Legacy parse fallback retained only so old in-memory strings do not error
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
    // Session-only loader.
    return [];
}

// --- Session-only list storage (UI list persistence removed) ---
function _listLoadChunked(section, keyBase, maxLen) {
    // Do not read favorites or text animator lists from saved settings.
    return [];
}

function _listSaveChunked(section, keyBase, arr, maxLen) {
    // Keep runtime list behavior only; do not save any UI state.
    try { return _listClean(arr || [], maxLen); } catch (e) {}
    return [];
}

function _listSave(section, key, arr, maxLen) {
    // Session-only list pass-through.
    try { return _listSaveChunked(section, key, arr, maxLen); } catch (e) {}
    return [];
}

    var __ST_SESSION_MAIN_FAVORITES__ = [];
var __ST_SESSION_MAIN_FAVORITES_SHOW_ORIGINAL__ = false;
var __ST_SESSION_TEXT_FAVORITES__ = [];
var __ST_SESSION_TEXT_FAVORITES_SHOW_ORIGINAL__ = false;
var __ST_SESSION_TEXT_BUNDLED_ORDER__ = [];
var __ST_SESSION_TEXT_UNIFIED_ORDER__ = [];
var __ST_SESSION_TEXT_LABELS__ = {};

function _animNormalizeEntryId(id) {
    var s = String(id || "");
    if (!s) return "";
    if (_animIsDividerToken(s)) return s;
    if (s.indexOf("B::") === 0 || s.indexOf("U::") === 0) return s;
    return "U::" + s;
}
function _animLabelMapClone(src) {
    var out = {};
    try {
        if (src) {
            for (var k in src) {
                if (!src.hasOwnProperty(k)) continue;
                out[String(k)] = String(src[k] || "");
            }
        }
    } catch (e) {}
    return out;
}
function _animLabelGet(id) {
    var key = _animNormalizeEntryId(id);
    if (!key) return "";
    try { if (__ST_SESSION_TEXT_LABELS__ && __ST_SESSION_TEXT_LABELS__.hasOwnProperty(key)) return String(__ST_SESSION_TEXT_LABELS__[key] || ""); } catch (e0) {}
    return "";
}
function _animLabelSet(id, label) {
    var key = _animNormalizeEntryId(id);
    if (!key || _animIsDividerToken(key)) return;
    try {
        if (!__ST_SESSION_TEXT_LABELS__) __ST_SESSION_TEXT_LABELS__ = {};
        var clean = String(label || "").replace(/^\s+|\s+$/g, "");
        if (clean) __ST_SESSION_TEXT_LABELS__[key] = clean;
        else delete __ST_SESSION_TEXT_LABELS__[key];
    } catch (e) {}
}
function _animLabelDelete(id) {
    var key = _animNormalizeEntryId(id);
    if (!key) return;
    try { if (__ST_SESSION_TEXT_LABELS__ && __ST_SESSION_TEXT_LABELS__.hasOwnProperty(key)) delete __ST_SESSION_TEXT_LABELS__[key]; } catch (e) {}
}
function _animLabelMapReplace(mapObj) {
    try { __ST_SESSION_TEXT_LABELS__ = _animLabelMapClone(mapObj || {}); } catch (e) { __ST_SESSION_TEXT_LABELS__ = {}; }
}
function _animLabelMapLoad() {
    try { return _animLabelMapClone(__ST_SESSION_TEXT_LABELS__ || {}); } catch (e) {}
    return {};
}

function favLoad() {
        var arr = [];
        try { arr = (__ST_SESSION_MAIN_FAVORITES__ && __ST_SESSION_MAIN_FAVORITES__.slice) ? __ST_SESSION_MAIN_FAVORITES__.slice(0) : []; } catch (eFavMem) { arr = []; }
        if (!arr || !(arr instanceof Array)) arr = [];
        try { arr = _favEnsureDefaultDividers(arr || []); } catch (eFavDiv) {}
        return arr || [];
    }

    function favSave(arr) {
        try { arr = _favEnsureDefaultDividers(arr || []); } catch (eFavDiv2) {}
        try { __ST_SESSION_MAIN_FAVORITES__ = (arr && arr.slice) ? arr.slice(0) : (arr || []); } catch (eFavSet) {}
    }

    function favAddPath(pathStr) {
        try { pathStr = _normalizePath(pathStr); } catch(eN) {}
        var favs = favLoad();
        var out = [];
        var i;
        var alreadyExists = false;

        for (i = 0; i < favs.length; i++) {
            if (_favEntryPath(favs[i]) === String(pathStr)) {
                alreadyExists = true;
                break;
            }
        }

        for (i = 0; i < favs.length; i++) out.push(favs[i]);

        if (!alreadyExists) out.push(_favMakeEntry(pathStr, ""));

        favSave(out);
    }

    function favRemovePath(pathStr) {
        var favs = favLoad();
        var out = [];
        for (var i = 0; i < favs.length; i++) {
            if (_favEntryPath(favs[i]) !== String(pathStr)) out.push(favs[i]);
        }
        favSave(out);
    }

    function favClear() { favSave([]); }

    function animLoad() {
        var arr = [];
        try { arr = (__ST_SESSION_TEXT_FAVORITES__ && __ST_SESSION_TEXT_FAVORITES__.slice) ? __ST_SESSION_TEXT_FAVORITES__.slice(0) : []; } catch (eAnimMem) { arr = []; }
        if (!arr || !(arr instanceof Array)) arr = [];
        try { arr = _animEnsureDefaultDividers(arr || []); } catch (eAnimDiv) {}
        return arr || [];
    }

    function animSave(arr) {
        try { arr = _animEnsureDefaultDividers(arr || []); } catch (eAnimDiv2) {}
        try { __ST_SESSION_TEXT_FAVORITES__ = (arr && arr.slice) ? arr.slice(0) : (arr || []); } catch (eAnimSet) {}
    }

    function animClear() { animSave([]); try { animUnifiedOrderSave([]); } catch (eAnimClrU) {} }

    function animRemovePath(pathStr) {
        var arr = animLoad();
        var out = [];
        for (var i = 0; i < arr.length; i++) {
            if (String(arr[i]) !== String(pathStr)) out.push(arr[i]);
        }
        animSave(out);
    }

    function animBundledOrderLoad() {
        var arr = [];
        try { arr = (__ST_SESSION_TEXT_BUNDLED_ORDER__ && __ST_SESSION_TEXT_BUNDLED_ORDER__.slice) ? __ST_SESSION_TEXT_BUNDLED_ORDER__.slice(0) : []; } catch (eBundMem) { arr = []; }
        if (!arr || !(arr instanceof Array)) arr = [];
        return arr || [];
    }

    function animBundledOrderSave(arr) {
        try { __ST_SESSION_TEXT_BUNDLED_ORDER__ = (arr && arr.slice) ? arr.slice(0) : (arr || []); } catch (eBundSet) {}
    }

    function animUnifiedOrderLoad() {
        var arr = [];
        try { arr = (__ST_SESSION_TEXT_UNIFIED_ORDER__ && __ST_SESSION_TEXT_UNIFIED_ORDER__.slice) ? __ST_SESSION_TEXT_UNIFIED_ORDER__.slice(0) : []; } catch (eUniMem) { arr = []; }
        if (!arr || !(arr instanceof Array)) arr = [];
        return arr || [];
    }

    function animUnifiedOrderSave(arr) {
        try { __ST_SESSION_TEXT_UNIFIED_ORDER__ = (arr && arr.slice) ? arr.slice(0) : (arr || []); } catch (eUniSet) {}
    }

    function _applyPathOrder(paths, savedOrder) {
        var out = [];
        var used = {};
        var i, j, sid, pth;
        paths = paths || [];
        savedOrder = savedOrder || [];
        for (i = 0; i < savedOrder.length; i++) {
            sid = String(savedOrder[i] || "");
            if (!sid || used[sid]) continue;
            for (j = 0; j < paths.length; j++) {
                pth = String(paths[j] || "");
                if (pth === sid) { out.push(pth); used[sid] = true; break; }
            }
        }
        for (j = 0; j < paths.length; j++) {
            pth = String(paths[j] || "");
            if (!pth || used[pth]) continue;
            out.push(pth);
            used[pth] = true;
        }
        return out;
    }

    function _shineShowReorderListDialog(title, items, opts) {
        try {
            items = items || [];
            opts = opts || {};
            var dlgW = Math.max(300, opts.dialogW || 340);
            var listW = Math.max(260, opts.listW || (dlgW - 36));
            var listH = Math.max(180, opts.listH || 240);

            var dlg = new Window("dialog", String(title || "Reorder"), undefined, { closeButton: true });
            dlg.orientation = "column";
            dlg.alignChildren = ["fill", "top"];
            dlg.spacing = 10;

            // Unified dialog padding for section reorder, button reorder-style lists,
            // and Library/Text Animator organize dialogs.
            var __dlgPadLR = (opts.dialogPadLR != null) ? Number(opts.dialogPadLR) : 18;
            var __dlgPadTop = (opts.dialogPadTop != null) ? Number(opts.dialogPadTop) : 10;
            var __dlgPadBot = (opts.dialogPadBot != null) ? Number(opts.dialogPadBot) : 10;
            dlg.margins = [__dlgPadLR, __dlgPadTop, __dlgPadLR, __dlgPadBot];

            if (opts.infoText) {
                var infoWrap = dlg.add("group");
                infoWrap.orientation = "row";
                infoWrap.alignChildren = ["left", "top"];
                infoWrap.alignment = ["fill", "top"];
                infoWrap.spacing = 0;
                infoWrap.margins = [0, 0, 0, 0];

                var infoPad = infoWrap.add("statictext", undefined, "");
                try { infoPad.minimumSize = [5, 1]; } catch (eInfoPad) {}
                try { infoPad.maximumSize = [8, 1]; } catch (eInfoPad2) {}

                var info = infoWrap.add("statictext", undefined, String(opts.infoText));
                info.alignment = ["fill", "top"];
            }

            var lb = dlg.add("listbox", undefined, [], { multiselect: !!opts.multiselect });
            lb.preferredSize = [listW, listH];
            lb.minimumSize = [listW, listH];
            lb.maximumSize = [listW, 10000];

            var __stShowOriginalNames = !!(opts && opts.initialShowOriginalFilename === true);
            var __ST_UNIFIED_INDENT = "    ";

            function _stStripLeadingIndent(label) {
                try { return String(label == null ? "" : label).replace(/^[\s\u00A0]+/, ""); } catch (eStripLbl) {}
                return String(label == null ? "" : label);
            }

            function _stGetDisplayLabelForDialogItem(id, currentLabel, isDivider, indentThisRow) {
                try {
                    var outLabel = _stStripLeadingIndent(currentLabel || "");
                    if (!isDivider) {
                        if (__stShowOriginalNames && typeof opts.displayLabelForId === "function") {
                            outLabel = String(opts.displayLabelForId(id, currentLabel, { _isDivider: !!isDivider }, __stShowOriginalNames) || currentLabel || "");
                        }
                        var __stShouldIndent = !!indentThisRow;
                        try {
                            if (opts && opts.indentNonDividerRows === true) __stShouldIndent = true;
                        } catch (eIndentOpt) {}
                        if (__stShouldIndent) outLabel = __ST_UNIFIED_INDENT + outLabel;
                        return outLabel;
                    }
                    return outLabel;
                } catch (eDisp0) {}
                return String(currentLabel || "");
            }

            function _stRefreshDialogLabels() {
                try {
                    var __stSeenDivider = false;
                    for (var rdi = 0; rdi < lb.items.length; rdi++) {
                        var dit = lb.items[rdi];
                        if (!dit) continue;
                        var srcLabel = "";
                        try { srcLabel = _stStripLeadingIndent(dit._label || dit.text || ""); } catch (eSrcLbl) { srcLabel = ""; }
                        var __stIndentThisRow = (!dit._isDivider && __stSeenDivider);
                        try {
                            if (opts && opts.indentNonDividerRows === true) __stIndentThisRow = !dit._isDivider;
                        } catch (eIndentFlag) {}
                        var newText = _stGetDisplayLabelForDialogItem(String(dit._id || ""), srcLabel, !!dit._isDivider, __stIndentThisRow);
                        try { dit.text = newText; } catch (eSetTxt) {}
                        try { dit.helpTip = newText; } catch (eSetTip) {}
                        if (dit._isDivider) __stSeenDivider = true;
                    }
                    try { dlg.update(); } catch (eUpd0) {}
                } catch (eRefresh) {}
            }

            function _stRebuildDialogListboxLiveRefresh(selectIds) {
                try {
                    if (!lb || !lb.items) return false;

                    var wanted = {};
                    if (selectIds) {
                        if (!(selectIds instanceof Array)) selectIds = [selectIds];
                        for (var ws = 0; ws < selectIds.length; ws++) {
                            try { wanted[String(selectIds[ws] || "")] = true; } catch (eWant0) {}
                        }
                    } else {
                        try {
                            var curSel = lb.selection;
                            if (curSel instanceof Array) {
                                for (var cs = 0; cs < curSel.length; cs++) {
                                    try { wanted[String(curSel[cs]._id || "")] = true; } catch (eWant1) {}
                                }
                            } else if (curSel) {
                                wanted[String(curSel._id || "")] = true;
                            }
                        } catch (eWant2) {}
                    }

                    var rows = [];
                    for (var rb = 0; rb < lb.items.length; rb++) {
                        try {
                            var oldIt = lb.items[rb];
                            if (!oldIt) continue;
                            rows.push({
                                id: String(oldIt._id || ""),
                                label: _stStripLeadingIndent(oldIt._label || oldIt.text || ""),
                                isDivider: !!oldIt._isDivider,
                                enabled: (oldIt.enabled !== false)
                            });
                        } catch (eRow0) {}
                    }

                    try { lb.removeAll(); } catch (eRemoveLive) {}

                    var seenDivider = false;
                    for (var nr = 0; nr < rows.length; nr++) {
                        var row = rows[nr];
                        var indentRow = (!row.isDivider && seenDivider);
                        try {
                            if (opts && opts.indentNonDividerRows === true) indentRow = !row.isDivider;
                        } catch (eIndentLive) {}
                        var shown = _stGetDisplayLabelForDialogItem(row.id, row.label, row.isDivider, indentRow);
                        var newIt = lb.add("item", shown);
                        newIt._id = row.id;
                        newIt._label = row.label;
                        newIt._isDivider = row.isDivider;
                        try { newIt.helpTip = shown; } catch (eTipLive) {}
                        try {
                            if (newIt._isDivider && !opts.allowDividerSelection) newIt.enabled = false;
                            else newIt.enabled = row.enabled;
                        } catch (eEnLive) {}
                        try { if (wanted[row.id]) newIt.selected = true; } catch (eSelLive) {}
                        if (row.isDivider) seenDivider = true;
                    }

                    try { if (lb.window && lb.window.layout) lb.window.layout.layout(true); } catch (eLayLive) {}
                    try { if (lb.window && lb.window.update) lb.window.update(); } catch (eWinUpdLive) {}
                    try { dlg.update(); } catch (eDlgUpdLive) {}
                    return true;
                } catch (eLiveRefresh) {}
                return false;
            }

            function _addIt(obj) {
                var initialLabel = _stStripLeadingIndent(obj.label || "");
                var __stInitialIndent = false;
                try { if (opts && opts.indentNonDividerRows === true && !obj._isDivider) __stInitialIndent = true; } catch (eInitialIndent) {}
                var shownLabel = _stGetDisplayLabelForDialogItem(String(obj.id || ""), initialLabel, !!obj._isDivider, __stInitialIndent);
                var it = lb.add("item", shownLabel);
                it._id = String(obj.id || "");
                it._label = initialLabel;
                it._isDivider = !!obj._isDivider;
                try { it.helpTip = shownLabel; } catch (eTip) {}
                try {
                    if (it._isDivider && !opts.allowDividerSelection) it.enabled = false;
                    else it.enabled = true;
                } catch (eDis) {}
                return it;
            }

            for (var ii = 0; ii < items.length; ii++) _addIt(items[ii]);
            try { _stRefreshDialogLabels(); } catch (eInitRefresh) {}
            if (lb.items.length) {
                // No default preselection in reorder/organize dialogs.
                try { lb.selection = null; } catch (eInitSel) {}
            }

            var controls = dlg.add("group");
            controls.orientation = "row";
            controls.alignChildren = ["left", "center"];
            controls.spacing = 8;
            controls.margins = 0;

            function _makeDlgMiniArrowButton(parent, glyph, tip) {
                var w = 24, h = 24;
                var wrap = parent.add('group');
                wrap.orientation   = 'stack';
                wrap.alignChildren = ['fill', 'fill'];
                wrap.alignment     = ['left', 'center'];
                wrap.margins       = 0;
                wrap.spacing       = 0;
                try { wrap.minimumSize = [w, h]; } catch (eW0) {}
                try { wrap.maximumSize = [w, h]; } catch (eW1) {}
                try { wrap.preferredSize = [w, h]; } catch (eW2) {}

                var btn = wrap.add('button', undefined, glyph);
                btn.alignment = ['fill','fill'];
                try { btn.minimumSize = [w, h]; } catch (eB0) {}
                try { btn.maximumSize = [w, h]; } catch (eB1) {}
                try { btn.preferredSize = [w, h]; } catch (eB2) {}
                try { btn.helpTip = tip || ''; } catch (eTip2) {}
                try { btn.justify = 'center'; } catch (eJ) {}
                try { btn.graphics.font = ScriptUI.newFont('Helvetica', 'BOLD', 13); } catch (eF) {
                    try { btn.graphics.font = ScriptUI.newFont(btn.graphics.font.name, 'Bold', 13); } catch (eF2) {}
                }
                try { defocusButtonBestEffort(btn); } catch (eDF) {}
                btn.onClick = function () {
                    try { btn.active = false; } catch (eA0) {}
                    try { if (typeof wrap.__onActivate === 'function') wrap.__onActivate(); } catch (eAct) {}
                    try { btn.active = false; } catch (eA1) {}
                };
                try { wrap.__button = btn; } catch (eWB) {}
                return wrap;
            }

            var arrowGrp = controls.add('group');
            arrowGrp.orientation = 'row';
            arrowGrp.alignChildren = ['left','center'];
            arrowGrp.spacing = 2;
            arrowGrp.margins = [0,0,0,0];

            var btnUp = _makeDlgMiniArrowButton(arrowGrp, '▲', 'Move up');
            var btnDn = _makeDlgMiniArrowButton(arrowGrp, '▼', 'Move down');

            function __makeDlgCellBtn__(parent, label, minW){
                var cell = parent.add('group');
                cell.orientation   = 'stack';
                cell.alignChildren = ['fill','fill'];
                cell.alignment     = ['left','center'];
                cell.margins       = 0;

                var b = cell.add('button', undefined, label);
                var __dlgBtnH2 = (typeof clippedBtnH === "function") ? clippedBtnH() : 24;
                var __dlgMinW2 = 90;
                b.alignment     = ['fill','center'];
                b.preferredSize = [0, __dlgBtnH2];
                b.minimumSize   = [minW || __dlgMinW2, __dlgBtnH2];
                b.maximumSize   = [10000, __dlgBtnH2];
                try { defocusButtonBestEffort(b); } catch (eDF2) {}
                return { cell: cell, btn: b };
            }

            var __controlsLeadSpacer = controls.add('statictext', undefined, '   ');

            var btnAddFiles = null;
            if (typeof opts.onAddFiles === "function") {
                var __addFilesPack = __makeDlgCellBtn__(controls, 'Add File...', 110);
                btnAddFiles = __addFilesPack.btn;
                try { btnAddFiles.helpTip = String(opts.addFilesHelpTip || "Add files to this list"); } catch (eAddFilesTip) {}
            }

            var btnNewDivider = null;
            if (opts.allowNewDivider) {
                var __newDivPack = __makeDlgCellBtn__(controls, 'New Divider', 120);
                btnNewDivider = __newDivPack.btn;
                try { btnNewDivider.helpTip = "Create a new divider"; } catch (eNewDivTip) {}
            }

            var __newDividerToMoveGap = null;
            var __newDividerToMoveLineWrap = null;
            var __newDividerToMoveLine = null;
            if (opts.allowNewDivider && opts.sectionChoices && opts.sectionChoices.length) {
                __newDividerToMoveGap = controls.add('group');
                __newDividerToMoveGap.orientation = 'row';
                __newDividerToMoveGap.alignChildren = ['left', 'center'];
                __newDividerToMoveGap.spacing = 0;
                __newDividerToMoveGap.margins = 0;
                try { __newDividerToMoveGap.minimumSize = [5, 1]; } catch (eSepGapND0) {}
                try { __newDividerToMoveGap.maximumSize = [5, 10000]; } catch (eSepGapND1) {}

                __newDividerToMoveLineWrap = controls.add('group');
                __newDividerToMoveLineWrap.orientation = 'column';
                __newDividerToMoveLineWrap.alignChildren = ['fill', 'center'];
                __newDividerToMoveLineWrap.spacing = 0;
                __newDividerToMoveLineWrap.margins = [0, 0, 0, 0];
                try { __newDividerToMoveLineWrap.minimumSize = [1, 24]; } catch (eSepWrapND0) {}
                try { __newDividerToMoveLineWrap.maximumSize = [1, 24]; } catch (eSepWrapND1) {}

                __newDividerToMoveLine = __newDividerToMoveLineWrap.add('panel');
                try {
                    __newDividerToMoveLine.alignment = ['fill', 'center'];
                    __newDividerToMoveLine.minimumSize = [1, 20];
                    __newDividerToMoveLine.maximumSize = [1, 20];
                    __newDividerToMoveLine.margins = [0, 0, 0, 0];
                } catch (eSepLineND0) {}

                var __newDividerToMoveGap2 = controls.add('group');
                __newDividerToMoveGap2.orientation = 'row';
                __newDividerToMoveGap2.alignChildren = ['left', 'center'];
                __newDividerToMoveGap2.spacing = 0;
                __newDividerToMoveGap2.margins = 0;
                try { __newDividerToMoveGap2.minimumSize = [4, 1]; } catch (eSepGapND2a) {}
                try { __newDividerToMoveGap2.maximumSize = [4, 10000]; } catch (eSepGapND2b) {}
            }

            var btnMoveTo = null;
            if (opts.sectionChoices && opts.sectionChoices.length) {
                var __movePack = __makeDlgCellBtn__(controls, 'Move To...', 110);
                btnMoveTo = __movePack.btn;
            }

            var btnRename = null;
            if (opts.allowRename) {
                var __renamePack = __makeDlgCellBtn__(controls, 'Rename', 92);
                btnRename = __renamePack.btn;
                try { btnRename.helpTip = "Rename selected item"; } catch (eRenameTip) {}
            }

            var btnDelete = null;
            if (opts.allowDelete) {
                var __deletePack = __makeDlgCellBtn__(controls, 'Delete', 90);
                btnDelete = __deletePack.btn;
                try { btnDelete.helpTip = "Delete selected items"; } catch (eDelTip) {}
            }

            var __actionsToConfirmGap = controls.add('group');
            __actionsToConfirmGap.orientation = 'row';
            __actionsToConfirmGap.alignChildren = ['left', 'center'];
            __actionsToConfirmGap.spacing = 0;
            __actionsToConfirmGap.margins = 0;
            try { __actionsToConfirmGap.minimumSize = [5, 1]; } catch (eSepGap0) {}
            try { __actionsToConfirmGap.maximumSize = [5, 10000]; } catch (eSepGap1) {}

            var __actionsToConfirmLineWrap = controls.add('group');
            __actionsToConfirmLineWrap.orientation = 'column';
            __actionsToConfirmLineWrap.alignChildren = ['fill', 'center'];
            __actionsToConfirmLineWrap.spacing = 0;
            __actionsToConfirmLineWrap.margins = [0, 0, 0, 0];
            try { __actionsToConfirmLineWrap.minimumSize = [1, 24]; } catch (eSepWrap0) {}
            try { __actionsToConfirmLineWrap.maximumSize = [1, 24]; } catch (eSepWrap1) {}

            var __actionsToConfirmLine = __actionsToConfirmLineWrap.add('panel');
            try {
                __actionsToConfirmLine.alignment = ['fill', 'center'];
                __actionsToConfirmLine.minimumSize = [1, 20];
                __actionsToConfirmLine.maximumSize = [1, 20];
                __actionsToConfirmLine.margins = [0, 0, 0, 0];
            } catch (eSepLine0) {}

            var __actionsToConfirmGap2 = controls.add('group');
            __actionsToConfirmGap2.orientation = 'row';
            __actionsToConfirmGap2.alignChildren = ['left', 'center'];
            __actionsToConfirmGap2.spacing = 0;
            __actionsToConfirmGap2.margins = 0;
            try { __actionsToConfirmGap2.minimumSize = [4, 1]; } catch (eSepGap2a) {}
            try { __actionsToConfirmGap2.maximumSize = [4, 10000]; } catch (eSepGap2b) {}

            var __okPack     = __makeDlgCellBtn__(controls, 'OK', 70);
            var btnOk        = __okPack.btn;
            var __cancelPack = __makeDlgCellBtn__(controls, 'Cancel', 90);
            var btnCancel    = __cancelPack.btn;

            // For the simple section reorder dialogs, keep the bottom controls contained
            // within the list-box width: arrows shift slightly right, OK/Cancel slightly left,
            // and the divider line stays visually centered.
            var __stSimpleSectionReorder = (!!opts
                && opts.hideOriginalToggle === true
                && !(typeof opts.onAddFiles === "function")
                && !opts.allowNewDivider
                && !(opts.sectionChoices && opts.sectionChoices.length)
                && !opts.allowRename
                && !opts.allowDelete);
            if (__stSimpleSectionReorder) {
                // For the simple section-reorder dialogs, use the SAME four bottom controls
                // as the Reorder Buttons dialog: Up, Down, OK, Cancel.
                // Keep the same button architecture/style and remove the divider/gap treatment.
                var __stOkW = 70;      // same as Reorder Buttons dialog
                var __stCancelW = 90;  // same as Reorder Buttons dialog

                try { controls.alignment = ['center', 'top']; } catch (eSC0) {}
                try { controls.spacing = 8; } catch (eSC1) {}
                try { arrowGrp.spacing = 2; } catch (eSC2) {}
                try {
                    if (__controlsLeadSpacer) {
                        __controlsLeadSpacer.text = '   ';
                        __controlsLeadSpacer.minimumSize = undefined;
                        __controlsLeadSpacer.preferredSize = undefined;
                        __controlsLeadSpacer.maximumSize = undefined;
                    }
                } catch (eSC3) {}

                // Hide the section-dialog divider and its side gaps so the row matches Reorder Buttons.
                try { __actionsToConfirmGap.visible = false; __actionsToConfirmGap.minimumSize = [0,0]; __actionsToConfirmGap.preferredSize = [0,0]; __actionsToConfirmGap.maximumSize = [0,0]; } catch (eSC4) {}
                try { __actionsToConfirmLineWrap.visible = false; __actionsToConfirmLineWrap.minimumSize = [0,0]; __actionsToConfirmLineWrap.preferredSize = [0,0]; __actionsToConfirmLineWrap.maximumSize = [0,0]; } catch (eSC5) {}
                try { __actionsToConfirmGap2.visible = false; __actionsToConfirmGap2.minimumSize = [0,0]; __actionsToConfirmGap2.preferredSize = [0,0]; __actionsToConfirmGap2.maximumSize = [0,0]; } catch (eSC6) {}
                try { if (__actionsToConfirmLine) __actionsToConfirmLine.visible = false; } catch (eSC7) {}

                // Match OK / Cancel sizing to Reorder Buttons dialog exactly.
                try { __okPack.cell.minimumSize = [__stOkW,24]; __okPack.cell.preferredSize = [__stOkW,24]; __okPack.cell.maximumSize = [__stOkW,24]; } catch (eSC8) {}
                try { btnOk.minimumSize.width = __stOkW; btnOk.preferredSize.width = __stOkW; btnOk.maximumSize.width = __stOkW; } catch (eSC9) {}

                try { __cancelPack.cell.margins = [0,0,0,0]; } catch (eSC10) {}
                try { __cancelPack.cell.minimumSize = [__stCancelW,24]; __cancelPack.cell.preferredSize = [__stCancelW,24]; __cancelPack.cell.maximumSize = [__stCancelW,24]; } catch (eSC11) {}
                try { btnCancel.minimumSize.width = __stCancelW; btnCancel.preferredSize.width = __stCancelW; btnCancel.maximumSize.width = __stCancelW; } catch (eSC12) {}

                // Keep focus on the listbox so the buttons do not pick up a native focus ring.
                try { btnOk.active = false; } catch (eSC13) {}
                try { btnCancel.active = false; } catch (eSC14) {}
                try {
                    var __stPrevOnShow = dlg.onShow;
                    dlg.onShow = function(){
                        try { if (typeof __stPrevOnShow === 'function') __stPrevOnShow(); } catch (eSh0) {}
                        try { btnOk.active = false; } catch (eSh1) {}
                        try { btnCancel.active = false; } catch (eSh2) {}
                        try { lb.active = true; } catch (eSh3) {}
                    };
                } catch (eSC15) {}
                try { lb.active = true; } catch (eSC16) {}
            }

            var __showOriginalToggle = null;
            if (!(opts && opts.hideOriginalToggle === true)) {
                var __bottomToggleRow = dlg.add('group');
                __bottomToggleRow.orientation = 'row';
                __bottomToggleRow.alignChildren = ['left', 'center'];
                __bottomToggleRow.alignment = ['fill', 'top'];
                __bottomToggleRow.spacing = 8;
                __bottomToggleRow.margins = [0, 0, 0, 0];

                // Custom toggle button (matches ShineTools style)
                var __toggleTextMax = '✓ Show Original Filename';
                var __toggleCharW = 7;
                var __toggleBtnW = (__toggleTextMax.length * __toggleCharW) + 24;

                var __toggleBtnPack = __makeDlgCellBtn__(__bottomToggleRow, 'Show Original Filename', __toggleBtnW);
                __showOriginalToggle = __toggleBtnPack.btn;
                var __toggleState = !!__stShowOriginalNames;

                function __updateToggleVisual() {
                    try {
                        if (__toggleState) {
                            __showOriginalToggle.text = '✓ Show Original Filename';
                        } else {
                            __showOriginalToggle.text = 'Show Original Filename';
                        }

                        var __t = String(__showOriginalToggle.text || __toggleTextMax);
                        var __btnW2 = Math.max(__toggleBtnW, (__t.length * __toggleCharW) + 24);
                        try { __showOriginalToggle.minimumSize.width = __btnW2; } catch(eW0){}
                        try { __showOriginalToggle.maximumSize.width = __btnW2; } catch(eW1){}
                        try { __showOriginalToggle.preferredSize.width = __btnW2; } catch(eW2){}
                    } catch(eTxt){}
                }

                __showOriginalToggle.onClick = function() {
                    __toggleState = !__toggleState;
                    try { __stShowOriginalNames = __toggleState; } catch(eSet){}
                    __updateToggleVisual();

                    // Force the listbox rows to repaint immediately when flipping
                    // between renamed labels and original filenames.  In some AE
                    // ScriptUI builds, changing item.text alone does not visually
                    // refresh until the user clicks back into the list.
                    try {
                        if (!_stRebuildDialogListboxLiveRefresh()) {
                            try { _stRefreshDialogLabels(); } catch (eFallbackRefresh) {}
                        }
                    } catch (eToggleRefresh) {
                        try { _stRefreshDialogLabels(); } catch (eToggleRefresh2) {}
                    }

                    try { lb.active = true; } catch(eToggleActive){}
                    try { dlg.update(); } catch(eToggleUpdate){}
                };

                __updateToggleVisual();
            }

            try { lb.active = true; } catch(eAF){}

            function moveSel(dir){
                if (!lb || !lb.items || !lb.items.length) return;

                var sels = [];
                var i = 0;

                for (i = 0; i < lb.items.length; i++) {
                    try { if (lb.items[i].selected) sels.push(lb.items[i]); } catch (eSelScan) {}
                }
                if (!sels.length) {
                    try {
                        if (lb.selection instanceof Array) sels = lb.selection;
                        else if (lb.selection) sels = [lb.selection];
                    } catch (eSelArr) {
                        try { if (lb.selection) sels = [lb.selection]; } catch (eSelOne) {}
                    }
                }
                if (!sels || !sels.length) return;

                var entries = [];
                var selectedIds = {};
                for (i = 0; i < lb.items.length; i++) {
                    entries.push({
                        text: lb.items[i].text,
                        label: lb.items[i]._label,
                        id: lb.items[i]._id,
                        tip: lb.items[i].helpTip,
                        isDivider: !!lb.items[i]._isDivider
                    });
                }
                for (i = 0; i < sels.length; i++) {
                    try {
                        if (sels[i] && sels[i]._isDivider && !opts.allowDividerSelection) return;
                        selectedIds[String(sels[i]._id || "")] = true;
                    } catch (eSelID) {}
                }

                var selectedEntries = [];
                var firstIndex = -1;
                var lastIndex = -1;
                for (i = 0; i < entries.length; i++) {
                    if (selectedIds[String(entries[i].id || "")]) {
                        if (firstIndex < 0) firstIndex = i;
                        lastIndex = i;
                        selectedEntries.push(entries[i]);
                    }
                }
                if (!selectedEntries.length) return;

                var remaining = [];
                for (i = 0; i < entries.length; i++) {
                    if (!selectedIds[String(entries[i].id || "")]) remaining.push(entries[i]);
                }

                var insertAt = -1;
                var count = 0;

                if (dir < 0) {
                    if (firstIndex <= 0) return;
                    // insert before the item directly above the selected block,
                    // even if that means crossing a fixed divider.
                    for (i = 0; i < firstIndex - 1; i++) {
                        if (!selectedIds[String(entries[i].id || "")]) count++;
                    }
                    insertAt = count;
                } else {
                    if (lastIndex >= entries.length - 1) return;
                    // insert after the item directly below the selected block,
                    // even if that means crossing a fixed divider.
                    count = 0;
                    for (i = 0; i <= lastIndex + 1; i++) {
                        if (!selectedIds[String(entries[i].id || "")]) count++;
                    }
                    insertAt = count;
                }

                if (insertAt < 0) return;
                if (insertAt > remaining.length) insertAt = remaining.length;

                var newEntries = [];
                for (i = 0; i < insertAt; i++) newEntries.push(remaining[i]);
                for (i = 0; i < selectedEntries.length; i++) newEntries.push(selectedEntries[i]);
                for (i = insertAt; i < remaining.length; i++) newEntries.push(remaining[i]);

                try { lb.removeAll(); } catch (eClrLB2) {}
                for (i = 0; i < newEntries.length; i++) {
                    var __storedLbl2 = String((newEntries[i].label != null) ? newEntries[i].label : (newEntries[i].text || ""));
                    var it2 = lb.add("item", _stGetDisplayLabelForDialogItem(String(newEntries[i].id || ""), __storedLbl2, !!newEntries[i].isDivider));
                    it2._id = String(newEntries[i].id || "");
                    it2._label = __storedLbl2;
                    it2._isDivider = !!newEntries[i].isDivider;
                    try { it2.helpTip = String(it2.text || ""); } catch (eTip2) {}
                    try { if (it2._isDivider && !opts.allowDividerSelection) it2.enabled = false; else it2.enabled = true; } catch (eDis2) {}
                    try {
                        if (selectedIds[String(it2._id || "")]) it2.selected = true;
                    } catch (eSelSet) {}
                }

                try {
                    for (i = 0; i < lb.items.length; i++) {
                        if (selectedIds[String(lb.items[i]._id || "")]) { lb.selection = lb.items[i]; break; }
                    }
                } catch (eSelFinal) {}
            }

            function moveSelectedToSection() {
                try {
                    if (!btnMoveTo) return;
                    if (!lb.selection) return;

                    var sels = [];
                    var i = 0;

                    for (i = 0; i < lb.items.length; i++) {
                        try { if (lb.items[i].selected) sels.push(lb.items[i]); } catch (eSelScan2) {}
                    }
                    if (!sels.length) {
                        try {
                            if (lb.selection instanceof Array) sels = lb.selection;
                            else if (lb.selection) sels = [lb.selection];
                        } catch (eSelArr2) {
                            try { if (lb.selection) sels = [lb.selection]; } catch (eSelOne2) {}
                        }
                    }
                    if (!sels || !sels.length) return;

                    var __sectionChoices = [];
                    var __sectionChoiceIds = [];
                    var __seenSectionIds = {};
                    try {
                        for (i = 0; i < lb.items.length; i++) {
                            var __secItem = lb.items[i];
                            if (!__secItem || !__secItem._isDivider) continue;
                            var __secId = String(__secItem._id || "");
                            if (!__secId || __seenSectionIds[__secId]) continue;
                            __seenSectionIds[__secId] = true;
                            var __secLabel = String(__secItem._label || __secItem.text || __secId);
                            __secLabel = _stStripLeadingIndent(__secLabel).replace(/^[\s \-—–_]+/, "").replace(/[\s \-—–_]+$/, "");
                            if (!__secLabel) continue;
                            __sectionChoices.push(__secLabel);
                            __sectionChoiceIds.push(__secId);
                        }
                    } catch (eSecScan) {}

                    if (!__sectionChoices.length && opts.sectionChoices && opts.sectionChoices.length) {
                        for (i = 0; i < opts.sectionChoices.length; i++) {
                            var __fallbackChoice = String(opts.sectionChoices[i] || "");
                            if (!__fallbackChoice) continue;
                            __sectionChoices.push(__fallbackChoice);
                            __sectionChoiceIds.push((typeof opts.sectionTokenForChoice === "function")
                                ? String(opts.sectionTokenForChoice(__fallbackChoice) || __fallbackChoice)
                                : __fallbackChoice);
                        }
                    }
                    if (!__sectionChoices.length) return;

                    var secDlg = new Window("dialog", "Move To Section");
                    secDlg.orientation = "column";
                    secDlg.alignChildren = ["fill", "top"];
                    secDlg.spacing = 10;
                    secDlg.margins = [12, 12, 12, 12];

                    var msg = secDlg.add("statictext", undefined, "Move selected items to:");
                    msg.alignment = ["fill", "top"];

                    var dd = secDlg.add("dropdownlist", undefined, __sectionChoices);
                    dd.alignment = ["fill", "top"];
                    try { dd.selection = 0; } catch (eDDSel) {}

                    var row = secDlg.add("group");
                    row.orientation = "row";
                    row.alignChildren = ["right", "center"];
                    row.alignment = ["right", "top"];
                    row.spacing = 8;

                    // Use the same no-blue-focus dialog button architecture as the other
                    // Organize/Reorder dialog controls. Do NOT use {name:"ok"}/{name:"cancel"}
                    // here because AE/ScriptUI promotes those to native default/cancel buttons
                    // and brings back the blue focus ring style.
                    var __moveOkPack = __makeDlgCellBtn__(row, "Move", 76);
                    var ok = __moveOkPack.btn;
                    var __moveCancelPack = __makeDlgCellBtn__(row, "Cancel", 90);
                    var cancel = __moveCancelPack.btn;
                    try { defocusButtonBestEffort(ok); } catch (eMoveOkDF) {}
                    try { defocusButtonBestEffort(cancel); } catch (eMoveCancelDF) {}

                    var chosenIndex = -1;
                    ok.onClick = function () {
                        if (!dd.selection) return;
                        try { chosenIndex = dd.selection.index; } catch (eDDIndex) { chosenIndex = -1; }
                        if (chosenIndex < 0) chosenIndex = 0;
                        secDlg.close(1);
                    };
                    cancel.onClick = function () { secDlg.close(0); };

                    if (secDlg.show() !== 1 || chosenIndex < 0) return;

                    var dividerToken = String(__sectionChoiceIds[chosenIndex] || "");
                    if (!dividerToken) return;

                    var entries = [];
                    var selectedIds = {};
                    for (i = 0; i < lb.items.length; i++) {
                        entries.push({
                            text: lb.items[i].text,
                            id: lb.items[i]._id,
                            tip: lb.items[i].helpTip,
                            isDivider: !!lb.items[i]._isDivider
                        });
                    }
                    for (i = 0; i < sels.length; i++) {
                        try {
                            if (sels[i] && sels[i]._isDivider && !opts.allowDividerSelection) return;
                            selectedIds[String(sels[i]._id || sels[i].text || "")] = true;
                        } catch (eID) {}
                    }

                    var moved = [];
                    var remaining = [];
                    for (i = 0; i < entries.length; i++) {
                        if (selectedIds[String(entries[i].id || "")]) moved.push(entries[i]);
                        else remaining.push(entries[i]);
                    }
                    if (!moved.length) return;

                    var insertAt = -1;
                    for (i = 0; i < remaining.length; i++) {
                        if (String(remaining[i].id || "") === dividerToken) {
                            insertAt = i + 1;
                        }
                    }
                    if (insertAt < 0) return;

                    var newEntries = [];
                    for (i = 0; i < insertAt; i++) newEntries.push(remaining[i]);
                    for (i = 0; i < moved.length; i++) newEntries.push(moved[i]);
                    for (i = insertAt; i < remaining.length; i++) newEntries.push(remaining[i]);

                    try { lb.removeAll(); } catch (eClrLB) {}
                    for (i = 0; i < newEntries.length; i++) {
                        var it2 = lb.add("item", String(newEntries[i].text || ""));
                        it2._id = String(newEntries[i].id || "");
                        it2._isDivider = !!newEntries[i].isDivider;
                        try { it2.helpTip = String(newEntries[i].tip || ""); } catch (eTip3) {}
                        try { if (it2._isDivider && !opts.allowDividerSelection) it2.enabled = false; else it2.enabled = true; } catch (eDis3) {}
                        try {
                            var keepSel = false;
                            var id2 = String(newEntries[i].id || "");
                            if (selectedIds[id2]) keepSel = true;
                            it2.selected = keepSel;
                        } catch (eSelKeep) {}
                    }
                } catch (eMoveTo) {
                    alert("Move To failed: " + String(eMoveTo));
                }
            }

            function deleteSelectedItems() {
                try {
                    if (!opts.allowDelete || !lb || !lb.items || !lb.items.length) return false;

                    var sels = [];
                    var i = 0;

                    for (i = 0; i < lb.items.length; i++) {
                        try { if (lb.items[i].selected) sels.push(lb.items[i]); } catch (eSelScan3) {}
                    }
                    if (!sels.length) {
                        try {
                            if (lb.selection instanceof Array) sels = lb.selection;
                            else if (lb.selection) sels = [lb.selection];
                        } catch (eSelArr3) {
                            try { if (lb.selection) sels = [lb.selection]; } catch (eSelOne3) {}
                        }
                    }
                    if (!sels || !sels.length) return false;

                    var selectedRows = {};
                    var selectedCount = 0;
                    for (i = 0; i < sels.length; i++) {
                        try {
                            if (!sels[i]) continue;
                            if (sels[i]._isDivider && !opts.allowDividerDeletion && !opts.allowDividerSelection) continue;
                            for (var j = 0; j < lb.items.length; j++) {
                                try {
                                    if (lb.items[j] === sels[i]) {
                                        if (!selectedRows[j]) {
                                            selectedRows[j] = true;
                                            selectedCount++;
                                        }
                                        break;
                                    }
                                } catch (eSelCmp3) {}
                            }
                        } catch (eSelRow3) {}
                    }
                    if (!selectedCount) return false;

                    var kept = [];
                    for (i = 0; i < lb.items.length; i++) {
                        try {
                            var idKeep = String(lb.items[i]._id || "");
                            if ((lb.items[i]._isDivider && !(opts.allowDividerDeletion || opts.allowDividerSelection)) || !selectedRows[i]) {
                                kept.push({
                                    text: lb.items[i].text,
                                    id: idKeep,
                                    tip: lb.items[i].helpTip,
                                    isDivider: !!lb.items[i]._isDivider
                                });
                            }
                        } catch (eKeep) {}
                    }

                    if ((lb.items.length - kept.length) !== selectedCount) return false;

                    try { lb.removeAll(); } catch (eClrLB4) {}
                    for (i = 0; i < kept.length; i++) {
                        var it3 = lb.add("item", String(kept[i].text || ""));
                        it3._id = String(kept[i].id || "");
                        it3._isDivider = !!kept[i].isDivider;
                        try { it3.helpTip = String(kept[i].tip || ""); } catch (eTip4) {}
                        try { if (it3._isDivider && !opts.allowDividerSelection) it3.enabled = false; else it3.enabled = true; } catch (eDis4) {}
                    }

                    if (lb.items.length) {
                        var _firstSelectableAfterDelete = -1;
                        for (i = 0; i < lb.items.length; i++) {
                            try {
                                if ((opts.allowDividerSelection || !lb.items[i]._isDivider) && lb.items[i].enabled !== false) { _firstSelectableAfterDelete = i; break; }
                            } catch (eFS2) {}
                        }
                        try { if (_firstSelectableAfterDelete >= 0) lb.selection = _firstSelectableAfterDelete; } catch (eSelAfterDel) {}
                    } else {
                        try { lb.selection = null; } catch (eSelAfterDel2) {}
                    }

                    try { _stRefreshDialogLabels(); } catch (eLiveDelIndent) {}
                    try { dlg.update(); } catch (eUDDel) {}
                    return true;
                } catch (eDeleteSel) {
                    alert("Delete failed: " + String(eDeleteSel));
                }
                return false;
            }

            function __stHandledDeleteKeyOnce(evt) {
                try {
                    var now = (new Date()).getTime();
                    var code = "";
                    try { code = String(evt && (evt.keyIdentifier || evt.keyName) || ""); } catch (e0) {}
                    var lastCode = "";
                    var lastTime = 0;
                    try { lastCode = String(dlg.__stLastDeleteKeyCode || ""); } catch (e1) {}
                    try { lastTime = Number(dlg.__stLastDeleteKeyTime || 0); } catch (e2) {}
                    if (lastCode === code && (now - lastTime) < 250) return true;
                    try { dlg.__stLastDeleteKeyCode = code; } catch (e3) {}
                    try { dlg.__stLastDeleteKeyTime = now; } catch (e4) {}
                } catch (e) {}
                return false;
            }

            function addNewDivider() {
                try {
                    if (!opts.allowNewDivider) return false;
                    var raw = prompt("New Divider", "");
                    if (raw === null) return false;
                    var label = String(raw || "").replace(/^\s+|\s+$/g, "");
                    if (!label) return false;

                    var token = (typeof opts.newDividerTokenForLabel === "function") ? String(opts.newDividerTokenForLabel(label) || "") : String(label || "");
                    var display = (typeof opts.newDividerDisplayForLabel === "function") ? String(opts.newDividerDisplayForLabel(label) || label) : String(label || "");
                    if (!token) return false;

                    for (var ai = 0; ai < lb.items.length; ai++) {
                        try { if (String(lb.items[ai]._id || "") === token) return false; } catch (eDup) {}
                    }

                    var entries = [];
                    var insertAt = lb.items.length;
                    for (var i = 0; i < lb.items.length; i++) {
                        entries.push({ text: lb.items[i].text, id: lb.items[i]._id, tip: lb.items[i].helpTip, isDivider: !!lb.items[i]._isDivider });
                    }
                    try {
                        if (lb.selection) {
                            var selId = String(lb.selection._id || "");
                            for (var si = 0; si < entries.length; si++) {
                                if (String(entries[si].id || "") == selId) { insertAt = si + 1; break; }
                            }
                        }
                    } catch (eSelIns) {}

                    entries.splice(insertAt, 0, { text: display, id: token, tip: display, isDivider: true });

                    try { lb.removeAll(); } catch (eClrLB5) {}
                    for (var ri = 0; ri < entries.length; ri++) {
                        var itn = lb.add("item", String(entries[ri].text || ""));
                        itn._id = String(entries[ri].id || "");
                        itn._isDivider = !!entries[ri].isDivider;
                        try { itn.helpTip = String(entries[ri].tip || ""); } catch (eTipN) {}
                        try {
                            if (itn._isDivider && !opts.allowDividerSelection) itn.enabled = false;
                            else itn.enabled = true;
                        } catch (eDisN) {}
                        try { itn.selected = (String(itn._id || "") === token); } catch (eSelN) {}
                    }
                    try { _stRefreshDialogLabels(); } catch (eLiveNewIndent) {}
                    try { dlg.update(); } catch (eUDNew) {}
                    return true;
                } catch (eAddDiv) {
                    alert("New Divider failed: " + String(eAddDiv));
                }
                return false;
            }

            function addFilesToDialogList() {
                try {
                    if (typeof opts.onAddFiles !== "function") return false;
                    var added = opts.onAddFiles(lb, dlg, opts);
                    try { _stRefreshDialogLabels(); } catch (eLiveAddFilesIndent) {}
                    try { dlg.update(); } catch (eUDAddFiles) {}
                    return (added === undefined) ? true : !!added;
                } catch (eAddFiles) {
                    alert("Add File failed: " + String(eAddFiles));
                }
                return false;
            }

            function renameSelectedItem() {
                try {
                    if (!opts.allowRename) return false;
                    if (!lb || !lb.selection) return false;

                    var sel = lb.selection;
                    if (sel instanceof Array) {
                        if (!sel.length) return false;
                        sel = sel[0];
                    }
                    if (!sel) return false;

                    var id = String(sel._id || "");
                    if (!id) return false;

                    if (sel._isDivider) {
                        var currentDividerName = "";
                        try {
                            if (typeof _animDividerLabelFromToken === "function" && _animIsDividerToken && _animIsDividerToken(id)) currentDividerName = String(_animDividerLabelFromToken(id) || "");
                        } catch (eDivAnim0) {}
                        try {
                            if (!currentDividerName && typeof _favDividerLabelFromToken === "function" && _favIsDividerToken && _favIsDividerToken(id)) currentDividerName = String(_favDividerLabelFromToken(id) || "");
                        } catch (eDivFav0) {}
                        if (!currentDividerName) {
                            currentDividerName = String(sel._label || sel.text || "");
                            currentDividerName = currentDividerName.replace(/^[\s\u00A0\-—–_]+/, "").replace(/[\s\u00A0\-—–_]+$/, "");
                        }

                        var rawDivider = prompt("Rename Divider", currentDividerName || "");
                        if (rawDivider === null) return false;

                        var cleanDivider = String(rawDivider || "").replace(/^\s+|\s+$/g, "");
                        if (!cleanDivider) return false;

                        var newDividerId = id;
                        try {
                            if (typeof opts.newDividerTokenForLabel === "function") newDividerId = String(opts.newDividerTokenForLabel(cleanDivider) || id);
                        } catch (eDivId0) {}
                        var newDividerLabel = cleanDivider;
                        try {
                            if (typeof opts.newDividerDisplayForLabel === "function") newDividerLabel = String(opts.newDividerDisplayForLabel(cleanDivider) || cleanDivider);
                        } catch (eDivLbl0) {}

                        try { sel._id = newDividerId; } catch (eDivSet0) {}
                        try { sel._label = newDividerLabel; } catch (eDivSet1) {}
                        try { sel.text = _stGetDisplayLabelForDialogItem(newDividerId, newDividerLabel, true, false); } catch (eDivSet2) {}
                        try { sel.helpTip = String(sel.text || newDividerLabel); } catch (eDivSet3) {}

                        try { _stRebuildDialogListboxLiveRefresh([newDividerId]); } catch (eDivLive0) {}
                        try { lb.active = true; } catch (eDivActive0) {}
                        try { dlg.update(); } catch (eDivUpd) {}
                        return true;
                    }

                    var originalLeaf = "";
                    try {
                        if (typeof opts.originalFilenameForId === "function") originalLeaf = String(opts.originalFilenameForId(id) || "");
                    } catch (eOrig0) {}
                    if (!originalLeaf) originalLeaf = _stPrettyFileLabel(id);

                    var dot = originalLeaf.lastIndexOf(".");
                    var ext = (dot > 0) ? originalLeaf.substring(dot) : "";
                    var originalBase = (dot > 0) ? originalLeaf.substring(0, dot) : originalLeaf;

                    var currentLabel = String(sel._label || sel.text || originalLeaf);
                    currentLabel = _stStripLeadingIndent(currentLabel);
                    var currentBase = currentLabel;
                    if (ext && currentBase.length > ext.length && currentBase.slice(-ext.length) === ext) {
                        currentBase = currentBase.substring(0, currentBase.length - ext.length);
                    }

                    var raw = prompt("Rename Item (extension will be kept)", currentBase || originalBase);
                    if (raw === null) return false;

                    var cleanBase = String(raw || "").replace(/^\s+|\s+$/g, "");
                    var finalLabel = cleanBase ? (cleanBase + ext) : originalLeaf;

                    try { sel._label = finalLabel; } catch (eLbl0) {}
                    try { sel.text = _stGetDisplayLabelForDialogItem(id, finalLabel, false); } catch (eTxt0) {}
                    try { sel.helpTip = String(sel.text || finalLabel); } catch (eTip0) {}

                    try { _stRebuildDialogListboxLiveRefresh([id]); } catch (eItemLive0) {}
                    try { lb.active = true; } catch (eItemActive0) {}
                    try { dlg.update(); } catch (eUD0) {}
                    return true;
                } catch (eRename) {
                    alert("Rename failed: " + String(eRename));
                }
                return false;
            }

            btnUp.__onActivate = function(){ moveSel(-1); try { dlg.update(); } catch(eUD1) {} try { lb.active = true; } catch(eAFU) {} };
            btnDn.__onActivate = function(){ moveSel(1); try { dlg.update(); } catch(eUD2) {} try { lb.active = true; } catch(eAFD) {} };
            if (btnAddFiles) btnAddFiles.onClick = function(){ addFilesToDialogList(); };
            if (btnNewDivider) btnNewDivider.onClick = function(){ addNewDivider(); };
            if (btnMoveTo) btnMoveTo.onClick = function(){ moveSelectedToSection(); try { dlg.update(); } catch(eUD3) {} };
            if (btnRename) btnRename.onClick = function(){ renameSelectedItem(); };
            if (btnDelete) btnDelete.onClick = function(){ deleteSelectedItems(); };

            try {
                lb.onDoubleClick = function() {
                    try {
                        if (!lb.selection) return;
                        var sel = lb.selection;
                        if (sel instanceof Array) {
                            if (!sel.length) return;
                            sel = sel[0];
                        }
                        if (!sel) return;
                        renameSelectedItem();
                    } catch (eDbl0) {}
                };
            } catch (eDbl1) {}
            if (btnRename) btnRename.onClick = function(){ renameSelectedItem(); };
            btnCancel.onClick = function(){ dlg.close(0); };
            btnOk.onClick = function(){ dlg.close(1); };

            try {
                lb.addEventListener("keydown", function(k){
                    try {
                        var keyName = String(k.keyName || "");
                        var keyId = String(k.keyIdentifier || "");
                        if (keyName === "Delete" || keyName === "Backspace" || keyId === "Delete" || keyId === "Backspace" || keyId === "U+007F" || keyId === "U+0008") {
                            if (__stHandledDeleteKeyOnce(k)) {
                                try { k.preventDefault(); } catch (eKP0a) {}
                                try { k.stopPropagation(); } catch (eKS0a) {}
                                return;
                            }
                            if (deleteSelectedItems()) {
                                try { k.preventDefault(); } catch (eKP0) {}
                                try { k.stopPropagation(); } catch (eKS0) {}
                            }
                        }
                    } catch (eKD0) {}
                });
            } catch (eKD1) {}

            try {
                dlg.addEventListener("keydown", function(k){
                    try {
                        var keyName = String(k.keyName || "");
                        var keyId = String(k.keyIdentifier || "");
                        if (keyName === "Delete" || keyName === "Backspace" || keyId === "Delete" || keyId === "Backspace" || keyId === "U+007F" || keyId === "U+0008") {
                            if (__stHandledDeleteKeyOnce(k)) {
                                try { k.preventDefault(); } catch (eKP1a) {}
                                try { k.stopPropagation(); } catch (eKS1a) {}
                                return;
                            }
                            if (deleteSelectedItems()) {
                                try { k.preventDefault(); } catch (eKP1) {}
                                try { k.stopPropagation(); } catch (eKS1) {}
                            }
                        }
                    } catch (eKD2) {}
                });
            } catch (eKD3) {}

            try {
                dlg.onShow = function() {
                    try { dlg.layout.layout(true); } catch(eLS) {}
                    try {
                        var __stAbsLeft = function(ctrl) {
                            var x = 0;
                            var cur = ctrl;
                            while (cur && cur !== dlg) {
                                try { x += Number(cur.bounds.x || 0); } catch (eAbsL0) {}
                                try { cur = cur.parent; } catch (eAbsL1) { break; }
                            }
                            return x;
                        };
                        var __stAbsRight = function(ctrl) {
                            return __stAbsLeft(ctrl) + Number((ctrl && ctrl.bounds) ? ctrl.bounds.width : 0);
                        };

                        var __targetLeft = -1;
                        var __targetRight = -1;

                        if (!(opts && opts.hideOriginalToggle === true)) {
                            try { if (__showOriginalToggle) __targetLeft = __stAbsLeft(__showOriginalToggle); } catch (eListTargetL) {}
                            try { if (__cancelPack && __cancelPack.cell) __targetRight = __stAbsRight(__cancelPack.cell); } catch (eListTargetR) {}

                            if (__targetLeft >= 0 && __targetRight > __targetLeft) {
                                var __targetW = Math.max(260, __targetRight - __targetLeft);
                                try { lb.alignment = ['left', 'top']; } catch (eLbAlign0) {}
                                try { lb.minimumSize = [__targetW, listH]; } catch (eLbMin0) {}
                                try { lb.maximumSize = [__targetW, 10000]; } catch (eLbMax0) {}
                                try { lb.preferredSize = [__targetW, listH]; } catch (eLbPref0) {}
                                try { lb.bounds = [__targetLeft, lb.bounds.y, __targetRight, lb.bounds.y + Math.max(listH, Number(lb.bounds.height || listH))]; } catch (eLbBounds0) {}
                                try { dlg.layout.layout(true); } catch (eLS2) {}
                            }
                        }
                    } catch (eListFit) {}
                    try {
                        if (opts && opts.compactSectionDialog === true) {
                            var __tightW = Math.max(300, Number(opts.dialogW || 0) || ((Number(listW) || 300) + 36));
                            var __b = dlg.bounds;
                            if (__b) dlg.bounds = [__b.x, __b.y, __b.x + __tightW, __b.y + Number(__b.height || 520)];
                        }
                    } catch (eTight) {}
                    try { dlg.update(); } catch(eUS) {}
                };
            } catch (eOnShow) {}

            if (dlg.show() !== 1) return null;

            var out = [];
            for (var li=0; li<lb.items.length; li++) {
                if (opts.returnObjects) {
                    var __outId = String(lb.items[li]._id || "");
                    var __outIsDivider = !!lb.items[li]._isDivider;
                    var __outLabel = String(lb.items[li]._label || lb.items[li].text || "");
                    if (!__outIsDivider) {
                        // IMPORTANT: SHOW ORIGINAL FILENAME is display-only.
                        // Do not save the temporary original-filename view back into the label map.
                        // Otherwise, closing/reopening the Organize dialog overwrites renamed labels,
                        // and the toggle appears to stop working because both states become identical.
                        __outLabel = _stStripLeadingIndent(__outLabel);
                    }
                    out.push({
                        id: __outId,
                        label: __outLabel,
                        _isDivider: __outIsDivider
                    });
                } else {
                    out.push(String(lb.items[li]._id || ""));
                }
            }
            try { out.__stShowOriginalFilename = !!__stShowOriginalNames; } catch (eOutShowOriginal) {}
            return out;
        } catch (eDlg) {
            alert("Reorder failed: " + String(eDlg));
        }
        return null;
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
    try { return __ST_openDialogSafe__(prompt, filter, !!multiSelect); } catch (e2) {}
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

    // Capture reference layer (for "insert above selected layer") BEFORE we import/create anything.
    // Import / applyPreset can change the selection, so we must grab it early.
    var __stRefLayer = null;
    try { if (comp && comp.selectedLayers && comp.selectedLayers.length) __stRefLayer = comp.selectedLayers[0]; } catch (eRef) {}

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

                // Insert ABOVE the originally selected layer (if any)
                try { if (__stRefLayer) { lyr.moveBefore(__stRefLayer); } } catch (eMv) {}
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
            var __stRefLayer = null;
            try { if (c.selectedLayers && c.selectedLayers.length) __stRefLayer = c.selectedLayers[0]; } catch (eRef) {}

            var cam = c.layers.addCamera("Camera 1", [c.width / 2, c.height / 2]);
            cam.label = LABEL_ORANGE;

            // Place rig layers at CTI
            try { _stPlaceLayerAtCTI(cam, c); } catch (eCTICam) {}
            var nul = c.layers.addNull();
            nul.threeDLayer = true;
            nul.name = "CAM CONTROL";
            nul.label = LABEL_ORANGE;

            try { _stPlaceLayerAtCTI(nul, c); } catch (eCTINul) {}
            try { nul.autoOrient = AutoOrientType.NO_AUTO_ORIENT; } catch (e0) {}
            try { nul.property("Transform").property("Orientation").setValue([0, 0, 0]); } catch (e1) {}
            try { nul.property("Transform").property("X Rotation").setValue(0); } catch (e2) {}
            try { nul.property("Transform").property("Y Rotation").setValue(0); } catch (e3) {}
            try { nul.property("Transform").property("Z Rotation").setValue(0); } catch (e4) {}

            nul.property("Transform").property("Position").setValue([c.width / 2, c.height / 2, 0]);

            cam.parent = nul;
            nul.moveBefore(cam);

            // If a layer was selected before running, insert the whole rig above it
            try {
                if (__stRefLayer) {
                    cam.moveBefore(__stRefLayer);
                    nul.moveBefore(cam);
                }
            } catch (eRigMv) {}
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
            var __stRefLayer = null;
            try { if (c.selectedLayers && c.selectedLayers.length) __stRefLayer = c.selectedLayers[0]; } catch (eRef) {}

            var adjA = c.layers.addSolid(ST_CONST.COLORS.WHITE_RGB, "COLOR", c.width, c.height, c.pixelAspect, c.duration);
            adjA.adjustmentLayer = true;
            adjA.label = LABEL_LAVENDER;

            try { _stPlaceLayerAtCTI(adjA, c); } catch (eCTIAdjA) {}
            addEffect(adjA, "ADBE Easy Levels2") || addEffect(adjA, "ADBE Levels");
            addEffect(adjA, "ADBE HUE SATURATION") || addEffect(adjA, "ADBE Hue Saturation");
            addEffect(adjA, "ADBE CurvesCustom") || addEffect(adjA, "ADBE Curves");

            var adjB = c.layers.addSolid(ST_CONST.COLORS.WHITE_RGB, "VIGNETTE + NOISE", c.width, c.height, c.pixelAspect, c.duration);
            adjB.adjustmentLayer = true;
            adjB.label = LABEL_LAVENDER;

            try { _stPlaceLayerAtCTI(adjB, c); } catch (eCTIAdjB) {}
            var vig = addEffect(adjB, "CC Vignette");
            if (vig) { try { vig.property("Amount").setValue(200); } catch (eV) {} }

            var noise = addEffect(adjB, "ADBE Noise") || addEffect(adjB, "Noise");
            if (noise) {
                try { noise.property("Amount of Noise").setValue(10); } catch (eN1) {}
                try { noise.property("Use Color Noise").setValue(false); } catch (eN2) {}
            }

            var adjC = c.layers.addSolid(ST_CONST.COLORS.WHITE_RGB, "CAMERA LENS BLUR", c.width, c.height, c.pixelAspect, c.duration);
            adjC.adjustmentLayer = true;
            adjC.label = LABEL_LAVENDER;

            try { _stPlaceLayerAtCTI(adjC, c); } catch (eCTIAdjC) {}
            var clb = addEffect(adjC, "ADBE Camera Lens Blur") || addEffect(adjC, "Camera Lens Blur");
            if (clb) { try { clb.property("Blur Amount").setValue(10); } catch (eB) {} }

            if (__stRefLayer) {
                // Insert the rig as a block above the originally-selected layer (keep top->bottom order)
                try { adjA.moveBefore(__stRefLayer); } catch (eMvA) {}
                try { adjC.moveBefore(adjA); } catch (eMvC) {}
                try { adjB.moveBefore(adjC); } catch (eMvB) {}
            } else {
                // No selection: keep original behavior (top of stack)
                adjB.moveToBeginning();
                adjC.moveAfter(adjB);
                adjA.moveAfter(adjC);
            }
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
    // ============================================================
    // PRECOMPS FOLDER (ROOT) – canonical helper
    //  - Used to route newly-created precomps into 07_PRECOMPS
    //  - Does NOT move existing comps when ORGANIZE BIN is pressed
    // ============================================================
    function _stGetOrCreatePrecompsFolderRoot(){
        if (!app.project) return null;
        var proj = app.project;
        var root = proj.rootFolder;

        function _isFolder(it){ return (it && (it instanceof FolderItem)); }
        function _normName(nm){
            return String(nm || "")
                .replace(/^[\s]+/g, "")
                .replace(/[\s\.]+$/g, "")
                .toLowerCase();
        }

        var target = "07_precomps";
        for (var i = 1; i <= proj.numItems; i++){
            var it = proj.item(i);
            if (_isFolder(it) && it.parentFolder === root){
                if (_normName(it.name) === target) return it;
            }
        }
        try{
            var f = proj.items.addFolder(ST_CONST.FOLDER_07_PRECOMPS);
            f.parentFolder = root;
            return f;
        }catch(e){ return null; }
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
            if (!col || col.length < 3) return ST_CONST.COLORS.WHITE_RGB;
            var r = col[0], g = col[1], b = col[2];
            if (r > 1 || g > 1 || b > 1) return [r / 255, g / 255, b / 255];
            return [r, g, b];
        }

        app.beginUndoGroup("ShineTools - ADD SOLID");
        try {
            if (!requireProject()) return;
            ensureCompViewer(c);

            var __stRefLayer = null;
            try { if (c.selectedLayers && c.selectedLayers.length) __stRefLayer = c.selectedLayers[0]; } catch (eRef) {}
var solidIdsBefore = {};
            for (var i = 1; i <= app.project.numItems; i++) {
                var itB = app.project.item(i);
                if (isSolidFootageItem(itB)) solidIdsBefore[String(itB.id)] = true;
            }

            var layersBefore = c.numLayers;
            app.executeCommand(cmd);

            if (c.numLayers > layersBefore) {
                try {
                    var sel0 = c.selectedLayers;
                    if (sel0 && sel0.length) {
                        _stPlaceLayerAtCTI(sel0[0], c);
                        try { if (__stRefLayer) sel0[0].moveBefore(__stRefLayer); } catch (eMv) {}
                        _stPlaceLayerSourceInSolidsFolder(sel0[0]);
                    }
                } catch (eCreated) {}
                return;
            }

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

            var col = ST_CONST.COLORS.WHITE_RGB;
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
                    try { _stPlaceLayerAtCTI(newLayer, c); } catch (eCTIS) {}
                    try { if (__stRefLayer) newLayer.moveBefore(__stRefLayer); } catch (eMv2) {}
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
            try {
                var sel = c.selectedLayers;
                if (sel && sel.length) _stPlaceLayerAtCTI(sel[0], c);
            } catch (eCTIL) {}
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
            var __stRefLayer = null;
            try { if (c.selectedLayers && c.selectedLayers.length) __stRefLayer = c.selectedLayers[0]; } catch (eRef) {}

            // Create a plain white solid with no dialog
            var white = ST_CONST.COLORS.WHITE_RGB;
            var name = "WHITE SOLID";
            var lay = c.layers.addSolid(white, name, c.width, c.height, c.pixelAspect, c.duration);
            /* selection set after placement */

            _stPlaceLayerAtCTI(lay, c);
            try { if (__stRefLayer) lay.moveBefore(__stRefLayer); } catch (eMv) {}
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
            var __stRefLayer = null;
            try { if (c.selectedLayers && c.selectedLayers.length) __stRefLayer = c.selectedLayers[0]; } catch (eRef) {}

            var nul = c.layers.addNull();
            /* selection set after placement */

            _stPlaceLayerAtCTI(nul, c);
            try { if (__stRefLayer) nul.moveBefore(__stRefLayer); } catch (eMv) {}
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
                try {
                    var selL = c.selectedLayers;
                    if (selL && selL.length) _stPlaceLayerAtCTI(selL[0], c);
                } catch (eCTI) {}

                                // The command creates a solid-source FootageItem; move it into canonical SOLIDS.
                try {
                    var sel = c.selectedLayers;
                    if (sel && sel.length) _stPlaceLayerSourceInSolidsFolder(sel[0]);
                } catch (eAdjCmd) {}
            } else {
                var adj = c.layers.addSolid(ST_CONST.COLORS.WHITE_RGB, "Adjustment Layer", c.width, c.height, c.pixelAspect, c.duration);
                adj.adjustmentLayer = true;

                _stPlaceLayerAtCTI(adj, c);
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

        var __stRefLayer = (c.selectedLayers && c.selectedLayers.length) ? c.selectedLayers[0] : null;
        var t0 = c.time;
        var t1 = t0 + 1.0;

        app.beginUndoGroup("ShineTools - ADD TRIM PATHS");
        try {
            var lineLen = Math.round(c.width * 0.9);
            var strokeW = 100;

            var lyr = c.layers.addShape();
            lyr.name = "Trim Line";
            lyr.property("Transform").property("Position").setValue([c.width / 2, c.height / 2]);

            // CTI START: set layer start BEFORE keyframes so the first keyframe lands at the CTI
            try {
                var __stDelta0 = t0 - lyr.inPoint;
                lyr.startTime += __stDelta0;
                lyr.inPoint = t0;
                // Ensure the layer lasts long enough for the 30f animation
                try {
                    if (lyr.outPoint < t1) lyr.outPoint = Math.min(c.duration, t1 + (1.0 / c.frameRate));
                } catch (eOP0) {}
            } catch (eTimeTL0) {}

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
            stroke.property("ADBE Vector Stroke Color").setValue(ST_CONST.COLORS.WHITE_RGB);
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

            // Place Trim Line above the originally selected layer (if any)
            try {
                if (__stRefLayer) {
                    lyr.moveBefore(__stRefLayer);
                } else {
                    lyr.moveToBeginning();
                }
            } catch (eMoveTL) {
                try { lyr.moveToBeginning(); } catch (eMoveTL2) {}
            }

            // Make the layer bar start at the CTI
            try {
                var __stDelta = t0 - lyr.inPoint;
                lyr.startTime += __stDelta;
                lyr.inPoint = t0;
                // Preserve outPoint if possible; clamp to comp duration
                try {
                    if (lyr.outPoint < t0) lyr.outPoint = Math.min(c.duration, t0 + 1.0);
                } catch (eOP) {}
            } catch (eTimeTL) {}

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

        var __stRefLayer = (c.selectedLayers && c.selectedLayers.length) ? c.selectedLayers[0] : null;
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
            stroke.property("ADBE Vector Stroke Color").setValue(ST_CONST.COLORS.WHITE_RGB);
            stroke.property("ADBE Vector Stroke Width").setValue(strokeW);
            stroke.property("ADBE Vector Stroke Line Cap").setValue(1); // Round cap

            var trim = grpContents.addProperty("ADBE Vector Filter - Trim");
            var startProp = trim.property("ADBE Vector Trim Start");
            var endProp   = trim.property("ADBE Vector Trim End");

            try { startProp.setValue(0); } catch (eS0) {}
            try { endProp.setValue(100); } catch (eE0) {}

            var animProp = (whichProp === "START") ? startProp : endProp;

            // Make the layer bar start at the CTI (do this BEFORE setting keyframes)
            try {
                var __stDelta = t0 - lyr.inPoint;
                lyr.startTime += __stDelta;
                lyr.inPoint = t0;
                // Preserve outPoint if possible; clamp to comp duration
                try {
                    if (lyr.outPoint < t0) lyr.outPoint = Math.min(c.duration, t0 + 1.0);
                } catch (eOP) {}
            } catch (eTimeTL) {}
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
            // Place Trim Line above the originally selected layer (if any)
            try {
                if (__stRefLayer) {
                    lyr.moveBefore(__stRefLayer);
                } else {
                    lyr.moveToBeginning();
                }
            } catch (eMoveTL) {
                try { lyr.moveToBeginning(); } catch (eMoveTL2) {}
            }

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

    function doHardBounce(_deferred) {
        var c = requireComp(); if (!c) return;

        // Some AE UI contexts (notably clicking a property in the Effect Controls panel)
        // can take a beat before the selection is reflected in comp.selectedLayers[].selectedProperties.
        // Auto-retry twice so you don't have to click the button twice.
        if (!$.global.__ST_doHardBounceDeferred) {
            $.global.__ST_doHardBounceDeferred = function () {
                try { doHardBounce(true); } catch (e) {}
            };
        }

        var props = getSelectedExprProps(c);
        if (!props || props.length === 0) {
            if (_deferred !== true) {
                try { $.global.__ST_doHardBounceDeferred(); } catch (eT) {}
                return;
            }
            warn("Select one or more properties (Position/Scale/Rotation/etc.) in the timeline or Effect Controls, then click the button.");
            return;
        }

        var host = hostLayerFromProps(c, props);
        if (!host) { warn("Could not determine a layer to host HARD BOUNCE sliders."); return; }

        app.beginUndoGroup("ShineTools - HARD BOUNCE");
        try {
            applyExpressionToProps(props, hardBounceExpr());
            getOrAddSlider(host, "ELASTICITY", 0.30);
            getOrAddSlider(host, "GRAVITY", 10000);
            getOrAddSlider(host, "NUMBER OF BOUNCES", 6);
            } finally { app.endUndoGroup(); }
    }

    function doInertialBounce(_deferred) {
        var c = requireComp(); if (!c) return;

        // Some AE UI contexts (notably clicking a property in the Effect Controls panel)
        // can take a beat before the selection is reflected in comp.selectedLayers[].selectedProperties.
        // Auto-retry twice so you don't have to click the button twice.
        if (!$.global.__ST_doInertialBounceDeferred) {
            $.global.__ST_doInertialBounceDeferred = function () {
                try { doInertialBounce(true); } catch (e) {}
            };
        }

        var props = getSelectedExprProps(c);
        if (!props || props.length === 0) {
            if (_deferred !== true) {
                try { $.global.__ST_doInertialBounceDeferred(); } catch (eT) {}
                return;
            }
            warn("Select one or more properties (Position/Scale/Rotation/etc.) in the timeline or Effect Controls, then click the button.");
            return;
        }

        var host = hostLayerFromProps(c, props);
        if (!host) { warn("Could not determine a layer to host INERTIAL BOUNCE sliders."); return; }

        app.beginUndoGroup("ShineTools - INERTIAL BOUNCE");
        try {
            applyExpressionToProps(props, inertialBounceExpr());
            getOrAddSlider(host, "AMOUNT", 20);
            getOrAddSlider(host, "FREQUENCY", 3.5);
            getOrAddSlider(host, "DECAY", 6);
            } finally { app.endUndoGroup(); }
    }

    function doWiggle(_deferred) {
        var c = requireComp(); if (!c) return;

        // Some AE UI contexts (notably clicking a property in the Effect Controls panel)
        // can take a beat before the selection is reflected in comp.selectedLayers[].selectedProperties.
        // If we don't see any expression-capable properties on first click, retry once on a short delay.
        if (!$.global.__ST_doWiggleDeferred) {
            $.global.__ST_doWiggleDeferred = function () {
                try { doWiggle(true); } catch (e) {}
            };
        }

        var props = getSelectedExprProps(c);
        if (!props || props.length === 0) {
            if (_deferred !== true) {
                try { $.global.__ST_doWiggleDeferred(); } catch (eT) {}
                return;
            }
            warn("Select one or more properties (Position/Scale/Rotation/etc.) in the timeline, then click the button.");
            return;
        }

        var host = hostLayerFromProps(c, props);
        if (!host) { warn("Could not determine a layer to host WIGGLE sliders."); return; }

        function _isOurWiggleExpr(expr) {
            try {
                if (!expr) return false;
                var s = String(expr);
                var hasFreq = (s.indexOf("effect('FREQ')") !== -1) || (s.indexOf('effect("FREQ")') !== -1);
                var hasAmt  = (s.indexOf("effect('AMOUNT')") !== -1) || (s.indexOf('effect("AMOUNT")') !== -1);
                var hasWig  = (s.indexOf("wiggle(") !== -1);
                return (hasFreq && hasAmt && hasWig);
            } catch (e) { return false; }
        }

        // Toggle behavior:
        // - If ALL selected properties currently have our ShineTools wiggle expression, REMOVE it and delete sliders.
        // - Otherwise, ADD/overwrite the expression on the selected properties and ensure sliders exist.
        var allAreWiggle = true;
        for (var i = 0; i < props.length; i++) {
            try {
                var p = props[i];
                if (!p) { allAreWiggle = false; break; }
                if (!p.expressionEnabled) { allAreWiggle = false; break; }
                if (!_isOurWiggleExpr(p.expression)) { allAreWiggle = false; break; }
            } catch (eChk) { allAreWiggle = false; break; }
        }

        app.beginUndoGroup("ShineTools - WIGGLE");
        try {
            if (allAreWiggle) {
                // REMOVE
                for (var r = 0; r < props.length; r++) {
                    try {
                        props[r].expression = "";
                        props[r].expressionEnabled = false;
                    } catch (eR) {}
                }

                // Remove the linked sliders we create for this tool (safe no-op if missing).
                removeEffectByName(host, "FREQ");
                removeEffectByName(host, "AMOUNT");
            } else {
                // ADD
                applyExpressionToProps(props, wiggleExpr());
                getOrAddSlider(host, "FREQ", 2);
                getOrAddSlider(host, "AMOUNT", 100);
}
        } finally { app.endUndoGroup(); }
    }

    function trimLayerToNeighbor(trimToAboveOverride) {
        var c = requireComp();
        if (!c) return;

        var layers = c.selectedLayers;
        if (!layers || layers.length === 0) {
            alert("Select one or more layers to trim.");
            return;
        }

        // Explicit buttons can force the mode; legacy modifier-click still works if no override is passed.
        var trimToAbove = (trimToAboveOverride === true) ? true : ((trimToAboveOverride === false) ? false : isOptionDown());

        // Build a quick lookup so we can skip over selected layers
        var selectedIndex = {};
        try {
            for (var s = 0; s < layers.length; s++) {
                try { selectedIndex[layers[s].index] = true; } catch (eIdx) {}
            }
        } catch (eMap) {}

        app.beginUndoGroup("ShineTools - TRIM LAYER");
        try {
            for (var i = 0; i < layers.length; i++) {
                var lyr = layers[i];
                if (!lyr) continue;

                var idx = lyr.index;

                // Find the first UNSELECTED neighbor in the chosen direction
                var ref = null;
                if (trimToAbove) {
                    for (var j = idx - 1; j >= 1; j--) {
                        if (!selectedIndex[j]) { ref = c.layer(j); break; }
                    }
                } else {
                    for (var k = idx + 1; k <= c.numLayers; k++) {
                        if (!selectedIndex[k]) { ref = c.layer(k); break; }
                    }
                }

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

            // Extend the parent comp duration so the selected precomp layer(s) can extend past the old end.
            // (We intentionally do NOT extend any other parent-comp layers.)
            ensureCompDuration(comp, targetEndAbs - comp.displayStartTime, verbose ? log : null);

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
    function _stGetLayerSourceSize(layer) {
        var out = { width: 0, height: 0 };
        try {
            if (!layer) return out;

            try {
                if (layer.source) {
                    var sw = Number(layer.source.width || 0);
                    var sh = Number(layer.source.height || 0);
                    if (sw > 0 && sh > 0) {
                        out.width = sw;
                        out.height = sh;
                        return out;
                    }
                }
            } catch (e0) {}

            try {
                var r = layer.sourceRectAtTime(0, false);
                if (r) {
                    out.width = Math.max(0, Number(r.width || 0));
                    out.height = Math.max(0, Number(r.height || 0));
                }
            } catch (e1) {}
        } catch (eAll) {}
        return out;
    }

    function _stRefitPhotoBorderPrecomp(precomp) {
        try {
            if (!precomp || !(precomp instanceof CompItem)) return false;

            var innerContent = null;
            try { innerContent = precomp.layer("BORDER_CONTENT"); } catch (e0) { innerContent = null; }
            if (!innerContent) {
                try { innerContent = precomp.layer(1); } catch (e1) { innerContent = null; }
            }
            if (!innerContent) return false;

            try { safeSetName(innerContent, "BORDER_CONTENT"); } catch (e2) {}

            var sz = _stGetLayerSourceSize(innerContent);
            var newW = Math.max(4, Math.round(Number(sz.width || 0)));
            var newH = Math.max(4, Math.round(Number(sz.height || 0)));
            if (!(newW > 0 && newH > 0)) return false;

            try { precomp.width = newW; } catch (eW) {}
            try { precomp.height = newH; } catch (eH) {}

            try {
                var tr = innerContent.property("Transform");
                var ap = tr ? tr.property("Anchor Point") : null;
                var pos = tr ? tr.property("Position") : null;
                if (ap) ap.setValue([newW / 2, newH / 2]);
                if (pos) pos.setValue([precomp.width / 2, precomp.height / 2]);
            } catch (eTr) {}

            try {
                var shp = precomp.layer("BORDER_SHAPE");
                if (shp) {
                    var t = shp.property("Transform");
                    if (t) {
                        try { t.property("Position").setValue([0,0]); } catch (eSP) {}
                        try { t.property("Anchor Point").setValue([0,0]); } catch (eSA) {}
                    }
                }
            } catch (e3) {}

            return true;
        } catch (eAll2) {}
        return false;
    }

    function _stRefreshSelectedPhotoBorders_Util() {
        var comp = requireComp();
        if (!comp) return false;

        if (!comp.selectedLayers || comp.selectedLayers.length === 0) {
            alert("Select one or more bordered precomp layers.");
            return false;
        }

        var didAny = false;

        try {
            var layers = comp.selectedLayers.slice(0);
            for (var i = 0; i < layers.length; i++) {
                var lyr = layers[i];
                if (!lyr || !(lyr instanceof AVLayer)) continue;

                var srcComp = null;
                try { srcComp = lyr.source; } catch (e0) { srcComp = null; }
                if (!srcComp || !(srcComp instanceof CompItem)) continue;

                if (_stRefitPhotoBorderPrecomp(srcComp)) {
                    didAny = true;
                }
            }
        } catch (e1) {}

        if (!didAny) {
            alert("Selected layer is not a supported bordered precomp.\n\nOpen the border precomp, replace BORDER_CONTENT, then Option-click ADD PHOTO BORDER to refit it.");
        }
        return didAny;
    }

    function addPhotoBorder_Util(forceRefit) {
        var comp = requireComp();
        if (!comp) return;

        var __stDoRefit = false;
        try {
            if (forceRefit === true) __stDoRefit = true;
            else if (forceRefit === false) __stDoRefit = false;
            else __stDoRefit = isOptionDown();
        } catch (eRefitOpt) { __stDoRefit = false; }

        if (__stDoRefit) {
            app.beginUndoGroup("Refit Photo Border");
            try {
                _stRefreshSelectedPhotoBorders_Util();
            } finally {
                app.endUndoGroup();
            }
            return;
        }

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

                // Route the newly-created precomp comp into 07_PRECOMPS
                try { var _pf2 = _stGetOrCreatePrecompsFolderRoot(); if (_pf2) precomp.parentFolder = _pf2; } catch (ePF2) {}

                try { if (precomp) precomp.comment = TAG_PRECOMP_COMP; } catch (eTag2) {}
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

                // Fit the precomp to the current content immediately
                try { _stRefitPhotoBorderPrecomp(precomp); } catch (eFit0) {}

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
                            "var p1 = L.toComp([r.left, r.top]);\n" +
                            "var p2 = L.toComp([r.left + r.width, r.top + r.height]);\n" +
                            "[Math.abs(p2[0]-p1[0]), Math.abs(p2[1]-p1[1])];";

                        rect.property("Position").expression =
                            "var L = thisComp.layer('BORDER_CONTENT');\n" +
                            "var r = L.sourceRectAtTime(time,false);\n" +
                            "var p1 = L.toComp([r.left, r.top]);\n" +
                            "var p2 = L.toComp([r.left + r.width, r.top + r.height]);\n" +
                            "[(p1[0]+p2[0])/2, (p1[1]+p2[1])/2];";

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

                try { _stRefitPhotoBorderPrecomp(precomp); } catch (eFit1) {}
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

    function safeFileName(name) {
        try { return String(name).replace(/[\\\/\:\*\?\"\<\>\|]/g, "_"); } catch (e) { return "output"; }
    }

    function revealInOS(fileObj) {
        try {
            if (!fileObj) return;
            var osStr = ($.os || "").toLowerCase();
            var fs = fileObj.fsName;

            if (osStr.indexOf("mac") !== -1) {
                system.callSystem('open -R "' + fs.replace(/"/g, '\\"') + '"');
            } else if (osStr.indexOf("windows") !== -1) {
                system.callSystem('explorer.exe /select,"' + fs.replace(/"/g, '\\"') + '"');
            }
        } catch (e) {}
    }

    // Reveal finder/explorer ONLY when CMD is held (prevents Finder stealing focus).
    // - Normal click: no reveal
    // - CMD-click: reveal output in Finder/Explorer
    function _revealIfRequested(fileObj) {
        try {
            if (!fileObj) return;
            if (typeof _isCmdDown === "function" && _isCmdDown()) {
                try { revealInOS(fileObj); } catch (e) {}
            }
        } catch (e2) {}
    }

    function applyFirstMatchingOMTemplate(om, candidates) {
        for (var i = 0; i < candidates.length; i++) {
            try {
                om.applyTemplate(candidates[i]);
                return candidates[i];
            } catch (e) {}
        }
        return null;
    }

    function forceRGBAlphaIfPossible(om) {
        // Best-effort: If template doesn't already set alpha, try to enforce it.
        // This may fail silently depending on AE/format settings.
        try {
            var s = om.getSettings(GetSettingsFormat.OBJECT);
            if (s && s.OutputModuleSettings) {
                if (s.OutputModuleSettings.Channels !== undefined) s.OutputModuleSettings.Channels = "RGB+Alpha";
                if (s.OutputModuleSettings["Channels"] !== undefined) s.OutputModuleSettings["Channels"] = "RGB+Alpha";

                if (s.OutputModuleSettings.Depth !== undefined) s.OutputModuleSettings.Depth = "Millions of Colors+";
                if (s.OutputModuleSettings["Depth"] !== undefined) s.OutputModuleSettings["Depth"] = "Millions of Colors+";

                om.setSettings(s);
            }
        } catch (e) {}
    }

    function renderPRORES422WithSaveDialog(use4444Override, queueOnlyOverride) {
        var undoOpen = false;

        try {
            if (!requireProject()) return;

            var c = requireComp();
            if (!c) return;

            // Explicit buttons can force the mode; legacy modifier-click still works if no override is passed.
            var ks = ScriptUI.environment.keyboardState;
            var use4444 = (use4444Override === true) ? true : ((use4444Override === false) ? false : (ks && ks.altKey === true));
            var queueOnly = (queueOnlyOverride === true) ? true : ((queueOnlyOverride === false) ? false : (ks && ks.shiftKey === true));

var rsTemplate = "Best Settings"; // Always Best Settings
            var omTemplateCandidates = use4444
                ? [
                    "PRORES 4444 RGB+ALPHA",
                    "PRORES 4444 RGB+ALPHA (Straight)",
                    "PRORES 4444",
                    "Apple ProRes 4444",
                    "ProRes 4444"
                ]
                : [
                    "PRORES 422",
                    "Apple ProRes 422",
                    "ProRes 422",
                    "PRORES 422 HQ",
                    "Apple ProRes 422 HQ"
                ];

            app.beginUndoGroup("ShineTools - PRORES Render");
            undoOpen = true;

            // Add comp to Render Queue
            var rqItem = app.project.renderQueue.items.add(c);

            // Render Settings = Best Settings
            try { rqItem.applyTemplate(rsTemplate); } catch (eRS) {}

            // Output Module
            var om = rqItem.outputModule(1);

            var appliedName = applyFirstMatchingOMTemplate(om, omTemplateCandidates);

            if (!appliedName) {
                if (use4444) {
                    alert(
                        "Could not find a PRORES 4444 (RGB+ALPHA) Output Module template.\n\n" +
                        "Go to: Edit > Templates > Output Module...\n" +
                        "Create one (QuickTime + Apple ProRes 4444, Channels: RGB+Alpha)\n" +
                        "Name it exactly: 'PRORES 4444 RGB+ALPHA' (recommended)."
                    );
                } else {
                    alert(
                        "Could not find a PRORES 422 Output Module template.\n\n" +
                        "Go to: Edit > Templates > Output Module...\n" +
                        "Create/rename one to 'PRORES 422' (recommended)."
                    );
                }

                try { rqItem.remove(); } catch (eRm) {}
                app.endUndoGroup(); undoOpen = false;
                return;
            }

            // Best-effort enforcement of RGB+Alpha when using 4444
            if (use4444) {
                forceRGBAlphaIfPossible(om);
            }

            // Save dialog (pause hover polling if present)
            try { if ($.global && $.global.__ShineTools_CancelHoverPoll__) $.global.__ShineTools_CancelHoverPoll__(); } catch (eH) {}

            var suffix = use4444 ? "_PRORES4444_ALPHA.mov" : "_PRORES422mov";
            var promptTitle = use4444 ? "Save PRORES 4444 (RGB+ALPHA) render as…" : "Save PRORES 422 render as…";
            var outFile = __ST_saveDialogSafe__(promptTitle, "*.mov");

            if (!outFile) {
                try { rqItem.remove(); } catch (eRm2) {}
                app.endUndoGroup(); undoOpen = false;
                return;
            }

            if (!/\.mov$/i.test(outFile.fsName)) {
                outFile = new File(outFile.fsName + ".mov");
            }

            om.file = outFile;

            // Close undo group BEFORE leaving (avoids mismatch warning)
            app.endUndoGroup();
            undoOpen = false;

            // SHIFT-click = Queue only (no auto-render). Lets you CMD+H / Show Desktop, etc.
            if (queueOnly) {
                // IMPORTANT: Do NOT toggle the Render Queue panel here.
                // The menu command is a toggle (open/close). If the user already has it open,
                // executing it would close it—which is what you were seeing.
                // So for SHIFT-click we simply leave the RQ item queued and return.
                return;
            }

// Normal click = Auto-render (original behavior), but defer a tick so the Save dialog fully releases.
            try {
                // Capture whether CMD was held at click-time (since render runs later)
                var _doReveal = false;
                try { _doReveal = (typeof _isCmdDown === "function" && _isCmdDown()); } catch (eC) {}

                $.global.__ST_lastRenderOutFileFS = outFile.fsName;
                $.global.__ST_lastRenderReveal = _doReveal;

                if (!$.global.__ST_RQRenderAndReveal__) {
                    $.global.__ST_RQRenderAndReveal__ = function () {
                        try {
                            var p = $.global.__ST_lastRenderOutFileFS;
                            var rev = $.global.__ST_lastRenderReveal === true;
                            var f = (p ? new File(p) : null);

                            try { $.global.__ST_LONGOP__ = true; } catch (eL0) {}
                            try {
                                try { if ($.global && $.global.__ST_SetUICooldown__) $.global.__ST_SetUICooldown__(3000); } catch (eCD0) {}
                try { $.global.__ST_LONGOP__ = true; } catch (eL0b) {}
                try {
                    app.project.renderQueue.render();
                } finally {
                    // UI cooldown after render to avoid post-render ScriptUI edge-case freezes
                    try { if ($.global && $.global.__ST_SetUICooldown__) $.global.__ST_SetUICooldown__(3000); } catch (eCD1) {}
                    try { $.global.__ST_LONGOP__ = false; } catch (eL1b) {}
                }
                            } finally {
                                // UI cooldown after render to avoid post-render ScriptUI edge-case freezes
                                try { if ($.global && $.global.__ST_SetUICooldown__) $.global.__ST_SetUICooldown__(3000); } catch (eCD) {}
                                try { $.global.__ST_LONGOP__ = false; } catch (eL1) {}
                                // MODAL DIAGNOSTIC: do not touch ScriptUI immediately after renderQueue.render() returns.
                                // try { if ($.global && $.global.__ShineTools_RequestFullRelayoutSoon__) $.global.__ShineTools_RequestFullRelayoutSoon__(); } catch (eRL) {}
                            }

                            if (rev && f) {
                                try { revealInOS(f); } catch (eR) {}
                            }
                        } catch (e) {
                            alert("Render failed:\n" + e.toString());
                        }
                    };
                }

                try { $.global.__ST_RQRenderAndReveal__(); } catch (eRunNow) {}
            } catch (eSched) {
                // Fallback: render immediately if scheduling fails
                try { if ($.global && $.global.__ST_SetUICooldown__) $.global.__ST_SetUICooldown__(3000); } catch (eCD0) {}
                try { $.global.__ST_LONGOP__ = true; } catch (eL0b) {}
                try {
                    app.project.renderQueue.render();
                } finally {
                    // UI cooldown after render to avoid post-render ScriptUI edge-case freezes
                    try { if ($.global && $.global.__ST_SetUICooldown__) $.global.__ST_SetUICooldown__(3000); } catch (eCD1) {}
                    try { $.global.__ST_LONGOP__ = false; } catch (eL1b) {}
                }
                _revealIfRequested(outFile);
            }
} catch (err) {
            if (undoOpen) {
                try { app.endUndoGroup(); } catch (eEnd) {}
            }
            alert("Render failed:\n" + err.toString());
        }
    }

    function saveCurrentFramePSDOrJPG(usePSDOverride) {
        // Explicit buttons can force JPG/PSD; legacy modifier-click still works if no override is passed.
        try {
            if (usePSDOverride === true) return saveCurrentFramePSDStill();
            if (usePSDOverride === false) return saveCurrentFrameJPGStill();
            if (typeof _isOptDown === "function" && _isOptDown()) {
                return saveCurrentFramePSDStill();
            }
        } catch (e) {}
        return saveCurrentFrameJPGStill();
    }

    function saveCurrentFramePSDStill() {
    var c = requireComp();
    if (!c) return;
    if (!requireProject()) return;

    var rq = app.project.renderQueue;
    var rqItem = null;
    var prevStates = [];
    var outFile = null;

    // Helper: suppress AE dialogs if API exists
    function _beginSuppress() { try { if (app.beginSuppressDialogs) app.beginSuppressDialogs(); } catch (e) {} }
    function _endSuppress()   { try { if (app.endSuppressDialogs) app.endSuppressDialogs(false); } catch (e) {} }

    // Helper: restore other RQ item render flags
    function _restoreStates() {
        try {
            for (var i = 1; i <= rq.numItems; i++) {
                if (typeof prevStates[i] !== "undefined") rq.item(i).render = prevStates[i];
            }
        } catch (e) {}
    }

    // Helper: try apply OM templates
    function _applyFirstOM(om, list) {
        for (var i = 0; i < list.length; i++) {
            try { om.applyTemplate(list[i]); return true; } catch (e) {}
        }
        return false;
    }

    // Helper: normalize numbered/temp outputs to the requested file
    function _normalizePSD(targetFile) {
        try {
            var folder = targetFile.parent;
            if (!folder || !folder.exists) return targetFile;

            var base = targetFile.displayName.replace(/\.psd$/i, "");
            var candidates = [];

            // Direct target
            if (targetFile.exists) candidates.push(targetFile);

            // Scan folder for likely variants (Match.psd00399, Match_00399.psd, AEtemp-*.psd etc)
            var files = folder.getFiles(function(f){
                if (!(f instanceof File)) return false;
                var n = f.displayName;
                if (!/\.psd/i.test(n)) return false;
                // same base-ish OR AEtemp prefix
                if (n.indexOf(base) === 0 || n.indexOf("AEtemp-") === 0) return true;
                return false;
            });

            for (var i = 0; i < files.length; i++) {
                var f = files[i];
                if (!f.exists) continue;
                // accept: base.psd#### or base_####.psd or base-####.psd
                var n = f.displayName;
                if (n === targetFile.displayName) { candidates.push(f); continue; }
                if (n.indexOf(base + ".psd") === 0) { candidates.push(f); continue; }
                if (new RegExp("^" + base.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "[_\\-]\\d+\\.psd$", "i").test(n)) { candidates.push(f); continue; }
                if (n.indexOf("AEtemp-") === 0) { candidates.push(f); continue; }
            }

            // Pick best candidate: largest non-zero size
            var best = null;
            var bestSize = -1;
            for (var j = 0; j < candidates.length; j++) {
                try {
                    var sz = candidates[j].length;
                    if (sz > bestSize) { bestSize = sz; best = candidates[j]; }
                } catch (e) {}
            }
            if (!best) return targetFile;

            // If best isn't the target name, rename it to target (overwrite any empty target)
            if (best.fsName !== targetFile.fsName) {
                try {
                    if (targetFile.exists && targetFile.length === 0) { try { targetFile.remove(); } catch(eRm){} }
                    best.rename(targetFile.displayName);
                } catch (eRen) {}
            }

            // Remove extras (keep only targetFile)
            try {
                var finalFile = new File(folder.fsName + "/" + targetFile.displayName);
                for (var k = 0; k < candidates.length; k++) {
                    var ff = candidates[k];
                    if (!ff.exists) continue;
                    if (ff.fsName === finalFile.fsName) continue;
                    try { ff.remove(); } catch (eDel) {}
                }
                return finalFile;
            } catch (eFinal) {}

            return targetFile;
        } catch (eTop) { return targetFile; }
    }

    try {
        outFile = __ST_saveDialogSafe__("Save current frame as PSD", "Photoshop:*.psd");
        if (!outFile) return;

        var fs = outFile.fsName;
        if (!/\.psd$/i.test(fs)) fs += ".psd";
        outFile = new File(fs);

        // Snapshot other queue items' render flags and disable them
        try {
            for (var qi = 1; qi <= rq.numItems; qi++) {
                prevStates[qi] = rq.item(qi).render;
                rq.item(qi).render = false;
            }
        } catch (eStates) {}

        rqItem = rq.items.add(c);

        // Apply templates (some reset time span)
        try { rqItem.applyTemplate("Best Settings"); } catch (eRS) {}

        var om = rqItem.outputModule(1);
        var okOM = _applyFirstOM(om, ["Photoshop", "PHOTOSHOP", "Photoshop (PSD)", "PSD", "PSD Still", "PSD STILL"]);
        if (!okOM) {
            alert("Couldn't find a Photoshop/PSD Output Module template.\nCreate one in Output Module Templates (Render Queue) and try again.");
            try { rqItem.remove(); } catch(eRm) {}
            _restoreStates();
            return;
        }

        try { om.file = outFile; } catch (eFile) {}

        // Force single-frame span AFTER templates
        var frameDur = (c.frameDuration && c.frameDuration > 0) ? c.frameDuration : (1 / (c.frameRate || 24));
        var t = c.time; if (t < 0) t = 0;
        var frameIndex = Math.floor(t / frameDur + 1e-9);
        var startTime = frameIndex * frameDur;
        var maxStart = Math.max(0, c.duration - frameDur);
        if (startTime > maxStart) startTime = maxStart;

        rqItem.timeSpanStart = startTime;
        try { rqItem.timeSpanDuration = frameDur; } catch (eDur) { rqItem.timeSpanDuration = frameDur + (frameDur * 0.001); }
        rqItem.render = true;

        _beginSuppress();
        var renderErr = null;
        try { rq.render(); } catch (eRender) { renderErr = eRender; }
        try { $.sleep(700); } catch (eSleep) {}
        _endSuppress();

        // Normalize/cleanup variants and ensure final exists and is non-empty
        var finalPSD = _normalizePSD(outFile);

        if (!finalPSD || !finalPSD.exists || (typeof finalPSD.length === "number" && finalPSD.length === 0)) {
            if (renderErr) alert("Save Frame (PSD) failed:\n" + renderErr.toString());
            else alert("Save Frame (PSD) failed:\nNo valid PSD output was created.");
        } else {
            try { _revealIfRequested(finalPSD); } catch (eReveal) {}
        }

    } catch (err) {
        try { alert("Save Frame (PSD) failed:\n" + err.toString()); } catch (eA) {}
    } finally {
        try { if (rqItem) rqItem.remove(); } catch (eRm2) {}
        _restoreStates();
        _endSuppress();
    }
}

function saveCurrentFrameJPGStill() {
        var c = requireComp();
        if (!c) return;
        if (!requireProject()) return;
        try {
            // Ask where to save (closest practical match to AE's "Save Frame As > File..." flow)
            var outFile = __ST_saveDialogSafe__("Save current frame as JPG", "JPEG:*.jpg;*.jpeg");
            if (!outFile) return;

            // Force .jpg extension
            var fs = outFile.fsName;
            if (!/\.(jpe?g)$/i.test(fs)) fs += ".jpg";
            outFile = new File(fs);

            var rq = app.project.renderQueue;

            // Remember/disable other queue items so we ONLY render this frame item
            var prevStates = [];
            try {
                for (var qi = 1; qi <= rq.numItems; qi++) {
                    prevStates[qi] = rq.item(qi).render;
                    rq.item(qi).render = false;
                }
            } catch (eStates) {}

            // Add comp to queue (new item will be last)
            var rqItem = rq.items.add(c);

            // Apply templates FIRST (some templates reset time span!)
            try { rqItem.applyTemplate("Best Settings"); } catch (eRS) {}

            var om = rqItem.outputModule(1);
            var omCandidates = ["JPG Still", "JPG STILL", "JPEG Still", "JPEG STILL", "JPG_STILL", "JPEG_STILL"];
            for (var i = 0; i < omCandidates.length; i++) {
                try { om.applyTemplate(omCandidates[i]); break; } catch (eOM) {}
            }

            // Output file
            try { om.file = outFile; } catch (eFile) {}

            // Time span = current frame only (set AFTER templates)
            var t = c.time;
            var frameDur = (c.frameDuration && c.frameDuration > 0) ? c.frameDuration : (1 / (c.frameRate || 24));
            var maxStart = Math.max(0, c.duration - frameDur);
            if (t < 0) t = 0;
            if (t > maxStart) t = maxStart;

            rqItem.timeSpanStart = t;

            // Some AE builds are extremely strict about float bounds; set duration with a tiny epsilon if needed
            try {
                rqItem.timeSpanDuration = frameDur;
            } catch (eDur1) {
                try {
                    rqItem.timeSpanDuration = frameDur + (frameDur * 0.001);
                } catch (eDur2) {
                    // Last resort: use minimum allowable duration if AE reports one
                    rqItem.timeSpanDuration = frameDur;
                }
            }

            // Mark only this new item for render
            rqItem.render = true;

            // Render
            rq.render();

            // AE sometimes appends frame numbers even for a 1-frame still (e.g. Match.jpg00396).
            // If that happens, find the rendered file and rename it back to the requested filename.
            try {
                if (!outFile.exists) {
                    function _escRE(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
                    var folder = outFile.parent;
                    var name = outFile.name; // e.g. Match.jpg
                    var base = name.replace(/\.(jpe?g)$/i, ""); // Match
                    var baseRE = _escRE(base);

                    var candidates = folder.getFiles(function(f) {
                        if (!(f instanceof File)) return false;
                        var n = f.name;
                        // Match.jpg00396
                        if (new RegExp("^" + baseRE + "\\.(?:jpe?g)\\d+$", "i").test(n)) return true;
                        // Match_00396.jpg / Match-00396.jpg / Match00396.jpg
                        if (new RegExp("^" + baseRE + "([_-]?\\d+)\\.(?:jpe?g)$", "i").test(n)) return true;
                        return false;
                    });

                    if (candidates && candidates.length) {
                        // pick the most recently modified
                        var best = candidates[0];
                        for (var ci = 1; ci < candidates.length; ci++) {
                            try {
                                if (candidates[ci].modified && best.modified && (candidates[ci].modified.getTime() > best.modified.getTime())) {
                                    best = candidates[ci];
                                }
                            } catch (eMod) {}
                        }

                        // If the target already exists, remove it first
                        try { if (outFile.exists) outFile.remove(); } catch (eRmTarget) {}

                        // Rename in place to the desired filename
                        try { best.rename(outFile.name); } catch (eRen) {}

                        // Refresh handle
                        outFile = new File(folder.fsName + "/" + outFile.name);
                    }
                }
            } catch (eSeqFix) {}

            // Reveal file
            _revealIfRequested(outFile);

            // Cleanup: remove the item we created (avoid queue buildup)
            try { rqItem.remove(); } catch (eRm) {}

            // Restore other queue item states
            try {
                for (var rqi = 1; rqi <= rq.numItems; rqi++) {
                    if (typeof prevStates[rqi] !== "undefined") rq.item(rqi).render = prevStates[rqi];
                }
            } catch (eRestore) {}

        } catch (err) {
            alert("Save Frame failed:\n" + err.toString());
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

        function _stIsInVersionsFolder(item){
                    try{
                        var pf = item ? item.parentFolder : null;
                        while (pf && pf !== root) {
                            var nm = String(pf.name || "").replace(/^\s+|\s+$/g,"").toLowerCase();
                            if (nm === "versions") return true;
                            pf = pf.parentFolder;
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

        function _stGetFootageFilePath(it){
            try { if (it && it.file) return String(it.file.fsName || it.file.fullName || ""); } catch(e) {}
            try { if (it && it.mainSource && it.mainSource.file) return String(it.mainSource.file.fsName || it.mainSource.file.fullName || ""); } catch(e2) {}
            return "";
        }
        function _stIsFromShineElementsDrive(it){
            try{
                var p = _stGetFootageFilePath(it);
                if (!p) return false;
                var u = String(p).toLowerCase();
                // macOS volumes typically: /Volumes/<DRIVE_NAME>/...
                // windows can vary; we simply look for the drive-name token in the path.
                if (u.indexOf("library elements_1") !== -1) return true;
                if (u.indexOf("stock elements") !== -1) return true;
                return false;
            }catch(e){ return false; }
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

function _stFindRootFolderExact(name) {
    for (var i = 1; i <= proj.numItems; i++) {
        var it = proj.item(i);
        if (isFolder(it) && it.parentFolder === root && it.name === name) return it;
    }
    return null;
}

function _stFindFirstRootFolderStartingWith(prefix) {
    var p = String(prefix || "");
    for (var i = 1; i <= proj.numItems; i++) {
        var it = proj.item(i);
        if (isFolder(it) && it.parentFolder === root) {
            var n = String(it.name || "");
            if (n.indexOf(p) === 0) return it;
        }
    }
    return null;
}

function _stGetPrimary01Folder() {
    // Preferred "primary" sequence folder. If you rename it later, keep the "01_" prefix.
    var f = _stFindRootFolderExact(ST_CONST.FOLDER_01_MAIN);
    if (f) return f;
    f = _stFindRootFolderExact("01_SEQ");
    if (f) return f;
    // Fall back to ANY root folder starting with "01_"
    f = _stFindFirstRootFolderStartingWith("01_");
    if (f) return f;
    // If none exist, create the new default
    return findOrCreateRootFolder(ST_CONST.FOLDER_01_MAIN);
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
                        try {
                            // Keep the standard bin structure folders even if empty
                            var nm = String(it.name || "").toLowerCase();
                            var protectedNames = {
                                "01_seq":1, "02_video":1, "02_footage":1, "03_audio":1, "04_images":1, "04_photos":1,
                                "05_graphics":1, "05_vectors":1, "06_elements":1, "06_shine elements":1, "07_precomps":1, "08_ref":1,
                                "solids":1,
                                // standard subfolders (keep even if empty)
                                "versions":1, ".:06":1, ".:15":1, ".:30":1, ".:60":1,
                                "color":1, "music":1, "vo":1, "disclaimer":1, "text":1,
                                "old projects":1, "fades":1
                            };
                            if (protectedNames[nm]) continue;
                            it.remove();
                            changed = true;
                        } catch (e) {}
                    }
                }
            }
        }

        // ------------------------------------------------------------
        // Target folders (created if missing)
        //  - Matches Shine Creative structure (see reference screenshot)
        //  - NOTE: We keep a SINGLE consolidated SOLIDS folder via
        //    _stGetOrCreateCanonicalSolidsFolderRoot() (do not change).
        // ------------------------------------------------------------
        var fSEQ      = _stGetPrimary01Folder();
        var fFootage  = findOrCreateRootFolder("02_FOOTAGE");
        var fAudio    = findOrCreateRootFolder("03_AUDIO");
        // Canonical Images folder: 04_IMAGES (migrate/rename from older 04_PHOTOS)
        var fImages  = _stFindRootFolderExact(ST_CONST.FOLDER_04_IMAGES);
        if (!fImages) {
            var _oldPhotos = _stFindRootFolderExact(ST_CONST.FOLDER_04_PHOTOS);
            if (_oldPhotos) {
                try { _oldPhotos.name = ST_CONST.FOLDER_04_IMAGES; } catch(e) {}
                fImages = _oldPhotos;
            } else {
                fImages = findOrCreateRootFolder(ST_CONST.FOLDER_04_IMAGES);
            }
        }
        var fVectors  = findOrCreateRootFolder("05_VECTORS");
        var fShineElements = findOrCreateRootFolder("06_SHINE ELEMENTS");
        var fPrecomps = findOrCreateRootFolder(ST_CONST.FOLDER_07_PRECOMPS);
        var fRef      = findOrCreateRootFolder("08_REF");

        // SOLIDS folder: create/merge case-insensitively (e.g., "Solids", "SOLIDS.")
        var fSolids   = _stGetOrCreateCanonicalSolidsFolderRoot();

        // ------------------------------------------------------------
        // MIGRATION: If older bin names exist, merge contents into the
        // new canonical folders and remove the old folders if empty.
        // (Keeps existing project items safe and prevents duplicates.)
        // ------------------------------------------------------------
        function _migrateRootFolderName(oldName, newFolder){
            try{
                if (!newFolder) return;
                var olds = listRootFoldersByName(oldName);
                for (var i = 0; i < olds.length; i++){
                    try{
                        if (olds[i] && olds[i] !== newFolder){
                            moveAllItems(olds[i], newFolder);
                            removeFolderIfEmpty(olds[i]);
                        }
                    }catch(e){}
                }
            }catch(e){}
        }

        _migrateRootFolderName("02_VIDEO",   fFootage);
        _migrateRootFolderName(ST_CONST.FOLDER_04_PHOTOS,  fImages);
        _migrateRootFolderName("05_GRAPHICS",fVectors);
        _migrateRootFolderName("06_ELEMENTS",fShineElements);

        // ------------------------------------------------------------
        // Ensure standard subfolder structure (do not move existing comps)
        // ------------------------------------------------------------
        function findOrCreateSubFolder(parent, name){
            if (!parent || !(parent instanceof FolderItem)) return null;

            var target = String(name || "");
            var targetKey = target.toLowerCase();

            for (var i = 1; i <= parent.numItems; i++){
                var it = parent.item(i);
                if (it && (it instanceof FolderItem)){
                    var nm = String(it.name || "");
                    if (nm === target) return it;
                    if (nm.toLowerCase() === targetKey) return it;
                    if (nm.replace(/^\s+|\s+$/g, "").toLowerCase() === targetKey) return it;
                }
            }

            try{
                var f = proj.items.addFolder(target);
                f.parentFolder = parent;
                return f;
            }catch(e){ return null; }
        }
        // Versions bucket helper: prevents duplicates like ".:06" vs ":06" (and odd bullet/dot variants)
        function findOrCreateVersionsBucket(parent, code){
            if (!parent || !(parent instanceof FolderItem)) return null;

            var c = String(code || "");
            // ensure 2-digit for your buckets (06,15,30,60)
            if (c.length === 1) c = "0" + c;

            function normalizeBucketName(nm){
                var s = String(nm || "");
                // trim whitespace
                s = s.replace(/^\s+|\s+$/g, "");
                // normalize any leading punctuation before the colon (., •, ·, etc)
                // e.g. ".:06", "•:06", "·:06", ":06"  -> ":06"
                s = s.replace(/^[\.\u2022\u00B7\u25CF\u2219\u30FB\u0387\s]+:/, ":");
                // if somehow it starts with ".:" without matching above, normalize that too
                s = s.replace(/^\.\s*:/, ":");
                // collapse any spaces around colon
                s = s.replace(/\s*:\s*/, ":");
                // lower for compare
                return s.toLowerCase();
            }

            var target = ":" + c;
            var targetKey = target.toLowerCase();

            // First: reuse any existing folder that normalizes to ":XX"
            for (var i = 1; i <= parent.numItems; i++){
                var it = parent.item(i);
                if (it && (it instanceof FolderItem)){
                    var nk = normalizeBucketName(it.name);
                    if (nk === targetKey) return it;
                }
            }

            // Second: create using your preferred visible name (no leading dot)
            try{
                var f = proj.items.addFolder(target);
                f.parentFolder = parent;
                return f;
            }catch(e){ return null; }
        }

        // 01_SEQ > Versions > :06 / :15 / :30 / :60 (reuses existing variants like ".:06")
        var fVersions = findOrCreateSubFolder(fSEQ, "Versions");
        if (fVersions){
            findOrCreateVersionsBucket(fVersions, "06");
            findOrCreateVersionsBucket(fVersions, "15");
            findOrCreateVersionsBucket(fVersions, "30");
            findOrCreateVersionsBucket(fVersions, "60");
        }

        // 02_FOOTAGE subfolders
        findOrCreateSubFolder(fFootage, "Color");

        // 03_AUDIO subfolders
        findOrCreateSubFolder(fAudio, "Music");
        findOrCreateSubFolder(fAudio, "VO");

        // 07_PRECOMPS subfolders
findOrCreateSubFolder(fPrecomps, "TEXT");

        // 08_REF subfolders
        findOrCreateSubFolder(fRef, "Old Projects");

        // Solids subfolders
        if (fSolids) findOrCreateSubFolder(fSolids, "FADES");

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
            ".wav":1, ".wave":1, ".aif":1, ".aiff":1, ".mp3":1, ".m4a":1, ".ogg":1, ".flac":1
        };
        var imageExts = {
            ".jpg":1, ".jpeg":1, ".png":1, ".gif":1, ".psd":1, ".webp":1, ".avif":1,
            // Common additional still/image formats (safe to keep in PHOTOS)
            ".tif":1, ".tiff":1, ".exr":1, ".dpx":1, ".bmp":1, ".heic":1, ".heif":1
        };
        var vectorExts = {
            ".ai":1, ".eps":1, ".svg":1, ".pdf":1
        };
        var footageExts = {
            ".mov":1, ".mp4":1, ".m4v":1, ".avi":1, ".mxf":1, ".xmf":1, ".mpg":1, ".mpeg":1,
            ".wmv":1, ".flv":1, ".webm":1, ".m2v":1,
            ".r3d":1, ".braw":1, ".ari":1, ".dng":1
        };

        function isStillFootage(it) {
            try { return (isFootage(it) && it.mainSource && it.mainSource.isStill); } catch (e) { return false; }
        }

        // ------------------------------------------------------------
        // Move items (single-pass snapshot to avoid index-shift staging)
        // ------------------------------------------------------------
        // NOTE (2026-01-28):
        // Previously, this only organized ROOT-level items. This meant that
        // mis-filed items (e.g. a .psd inside FOOTAGE) would not be corrected.
        // We now scan ALL project items and move them to the appropriate
        // canonical folder (FOOTAGE / IMAGES / AUDIO / SOLIDS / PRECOMPS).
        var moveList = [];
        for (var i = 1; i <= proj.numItems; i++) {
            var it0 = proj.item(i);
            if (!it0) continue;
            if (isFolder(it0)) continue; // ignore folders
            moveList.push(it0);
        }

        for (var k = 0; k < moveList.length; k++) {
            var it = moveList[k];
            if (!it) continue;

            try {
                if (isComp(it)) {
                    // Do not move any premade comps that live under a VERSIONS folder (at any depth)
                    // This preserves template/versioned comps exactly as authored.
                    if (_stIsInVersionsFolder(it)) {
                        continue;
                    }

                    // RULE 1 (PRIMARY 01_):
                    // If a comp name starts with "_" it ALWAYS belongs in the primary 01_ folder (e.g., 01_MAIN).
                    // IMPORTANT: If it's already in the primary 01_ folder, leave it there.
                    try {
                        var _nm = String(it.name || "");
                        if (_nm.length > 0 && _nm.charAt(0) === "_" && fSEQ) {
                            if (it.parentFolder !== fSEQ) {
                                it.parentFolder = fSEQ;
                            }
                            continue; // always stop here for underscore comps
                        }
                    } catch (eUnderscore) {}

                    // RULE 2 (PRECOMPS):
                    // Any NON-underscore comp that is sitting in the primary 01_ folder should be moved into 07_PRECOMPS.
                    // (This fixes cases where precomps end up in 01_SEQ/01_MAIN and never get pulled out.)
                    try {
                        if (fSEQ && fPrecomps && it.parentFolder === fSEQ) {
                            var _nm2 = String(it.name || "");
                            if (!(_nm2.length > 0 && _nm2.charAt(0) === "_")) {
                                it.parentFolder = fPrecomps;
                                continue;
                            }
                        }
                    } catch (eSeqToPrecomp) {}

// Existing behavior:
                    // We only route:
                    //   (a) ShineTools-tagged precomp comps, and
                    //   (b) loose ROOT-level comps (parentFolder === root)
                    // into 07_PRECOMPS.
                    try {
                        var _isTaggedPrecomp = (it.comment && String(it.comment) === TAG_PRECOMP_COMP);
                        var _isLooseRootComp = (it.parentFolder === root);
                        if ((_isTaggedPrecomp || _isLooseRootComp) && fPrecomps && it.parentFolder !== fPrecomps) {
                            it.parentFolder = fPrecomps;
                        }
                    } catch (eMovePC) {}
                    continue;
                }

                // SOLIDS (including null/adjustment sources)
                if (isSolidFootageSafe(it)) {
                    it.parentFolder = fSolids;
                    continue;
                }

                // PRIORITY RULE:
                // Any footage sourced from Shine drive roots goes into 06_SHINE ELEMENTS
                // (e.g. /Volumes/LIBRARY ELEMENTS_1/... or /Volumes/STOCK ELEMENTS/...)
                if (isFootage(it) && _stIsFromShineElementsDrive(it) && fShineElements) {
                    it.parentFolder = fShineElements;
                    continue;
                }

                // VECTORS FIRST:
                // Illustrator/EPS/SVG (often marked as isStill in AE) must go to 05_VECTORS
                try {
                    if (isFootage(it)) {
                        var _extV = getExt(it);
                        if (_extV && vectorExts[_extV] && fVectors) {
                            it.parentFolder = fVectors;
                            continue;
                        }
                    }
                } catch (eVecFirst) {}

                // Stills by AE metadata (covers still sequences, etc.)
                if (isStillFootage(it)) {
                    it.parentFolder = fImages;
                    continue;
                }

                if (isFootage(it)) {
                    var ext = getExt(it);
                    if (ext && audioExts[ext]) {
                        it.parentFolder = fAudio;
                    } else if (ext && vectorExts[ext]) {
                        it.parentFolder = fVectors;
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

    try { if (typeof _stFrameOffset_defocus === "function") { b.addEventListener("mousedown", function(){ try{ _stFrameOffset_defocus(b, sink); }catch(_e){} }); b.addEventListener("mouseup", function(){ try{ _stFrameOffset_defocus(b, sink); }catch(_e){} }); } } catch(eDF) {}
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

function _stFrameOffset_showCurveDialog(comp){
    var fps = (comp && comp.frameRate) ? comp.frameRate : 30;
    var layerCount = 0;
    // Photo-02 style curve dialog (based on Curve Offset.jsx), adapted to ShineTools pipeline.
    // Returns legacy object: { totalFrames, typeIdx, curve50, invert } so existing apply code works.

    var d = new Window("palette", "LAYER OFFSET CURVE", undefined, {resizeable:false});
    d.orientation = "column";
    d.alignChildren = ["fill","top"];
    d.margins = 14;
    d.spacing = 10;

    // Focus sink (helps avoid clipped focus rings on controls)
    var __curveSink = null;
    try{ if(typeof _stFrameOffset_addFocusSink === "function"){ __curveSink = _stFrameOffset_addFocusSink(d); } }catch(e){}
    // Header
    var hdr = d.add("statictext", undefined, "LAYER OFFSET CURVE");
    try{ hdr.graphics.font = ScriptUI.newFont(hdr.graphics.font.name, "BOLD", hdr.graphics.font.size+2); }catch(e){}
    hdr.alignment = ["fill","top"];

    // Controls container
    var controlsBox = d.add("panel", undefined, "Controls");
    controlsBox.orientation = "column";
    controlsBox.alignChildren = ["fill","top"];
    controlsBox.margins = 12;
    controlsBox.spacing = 10;

    // Type row
    var typeRow = controlsBox.add("group");
    typeRow.orientation = "row";
    typeRow.alignChildren = ["left","center"];
    typeRow.spacing = 8;

    typeRow.add("statictext", undefined, "Type:");
    var dd = typeRow.add("dropdownlist", undefined, [ST_LABELS.EXPONENTIAL,ST_LABELS.SQUARE,ST_LABELS.CUBIC,ST_LABELS.EASE_OUT,ST_LABELS.EASE_IN]);
    dd.selection = 0; // default EXPONENTIAL
    dd.preferredSize.width = 160;

    // Curve row (slider)
    var curveRow = controlsBox.add("group");
    curveRow.orientation = "row";
    curveRow.alignChildren = ["left","center"];
    curveRow.spacing = 8;

    curveRow.add("statictext", undefined, "Curve:");
    var curveSlider = curveRow.add("slider", undefined, 60, 0, 100);
    curveSlider.alignment = ["fill","center"];
    curveSlider.preferredSize.width = 220;
    var curveVal = curveRow.add("statictext", undefined, "60");
    curveVal.preferredSize.width = 36;

    // Max frames row
    var maxRow = controlsBox.add("group");
    maxRow.orientation = "row";
    maxRow.alignChildren = ["left","center"];
    maxRow.spacing = 8;

    maxRow.add("statictext", undefined, "Max (fr):");
    var maxEt = maxRow.add("edittext", undefined, "20");
    maxEt.characters = 6;

    // Invert row
    var invRow = controlsBox.add("group");
    invRow.orientation = "row";
    invRow.alignChildren = ["left","center"];
    invRow.spacing = 8;
    var __invSpacer = invRow.add("statictext", undefined, ""); __invSpacer.preferredSize.width = 10;
    var invCb = invRow.add("checkbox", undefined, "Invert");
    invCb.value = false;

    // Preview container
    var previewBox = d.add("panel", undefined, "Preview");
    previewBox.orientation = "column";
    previewBox.alignChildren = ["fill","fill"];
    previewBox.margins = 12;
    previewBox.spacing = 6;

    var preview = previewBox.add("panel"); // blank panel to draw into
    preview.alignment = ["fill","fill"];
    preview.preferredSize.height = 220;

    // Footer status
    var status = d.add("statictext", undefined, "");
    status.alignment = ["fill","top"];

    // Bottom buttons — match the FRAME OFFSET dialog stack-cell architecture (no blue focus ring).
    var btnRow = d.add("group");
    btnRow.orientation = "row";
    btnRow.alignChildren = ["fill","center"];
    btnRow.spacing = 10;
    btnRow.alignment = ["fill","bottom"];

    var __dlgH = (typeof clippedBtnH === "function") ? clippedBtnH() : 24;
    var __dlgMinW = 110;

    function __makeCurveDlgCellBtn(parent, label, minW){
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

        try { if (typeof _stFrameOffset_defocus === "function") { b.addEventListener("mousedown", function(){ try{ _stFrameOffset_defocus(b, __curveSink); }catch(_e){} }); b.addEventListener("mouseup", function(){ try{ _stFrameOffset_defocus(b, __curveSink); }catch(_e){} }); } } catch(eDF) {}
        return { cell: cell, btn: b };
    }

    var btnRefresh = __makeCurveDlgCellBtn(btnRow, "REFRESH PREVIEW", 140).btn;
    var btnApply   = __makeCurveDlgCellBtn(btnRow, "APPLY OFFSET",    120).btn;
    var btnClose   = __makeCurveDlgCellBtn(btnRow, "CLOSE",            90).btn;

    // --- helpers ---
    function clamp(v,a,b){ return Math.max(a, Math.min(b, v)); }

    function getTypeIdx(){
        // Map Photo-02 dropdown to existing ShineTools curve types used by _stFrameOffset_computeOffsetsFloat:
        // 0=square-ish, 1=cubic-ish, 2=sigmoid-ish, 3=exponential-ish
        var t = (dd.selection ? dd.selection.text : "EXPONENTIAL");
        if(t==="SQUARE") return 0;
        if(t==="CUBIC") return 1;
        if(t==="EASE OUT" || t==="EASE IN") return 2; // closest available in legacy pipeline
        return 3; // EXPONENTIAL
    }

    function getCurve50(){
        // Legacy curve strength is 0..50; our slider is 0..100.
        var v = Math.round(curveSlider.value);
        return clamp(Math.round(v/2), 0, 50);
    }

    function getMaxFrames(){
        var v = parseInt(maxEt.text, 10);
        if(isNaN(v)) v = 0;
        v = clamp(v, 0, 9999);
        return v;
    }

    function _getSelCount(){
        try{
            if(comp && (comp instanceof CompItem)){
                var sel = comp.selectedLayers;
                return (sel && sel.length) ? sel.length : 0;
            }
        }catch(e){}
        return 0;
    }

    function computeOffsetsForCount(n, previewMode){
        var maxFrames = getMaxFrames();
        var typeIdx   = getTypeIdx();
        var curve50   = getCurve50();
        var invert    = !!invCb.value;

        if(n <= 1){
            return { offs:[0], maxFrames:maxFrames, typeIdx:typeIdx, curve50:curve50, invert:invert, count:n };
        }

        // For EASE IN vs EASE OUT, approximate by using inverted preview curve only.
        var previewInvert = invert;
        if(previewMode && dd.selection){
            if(dd.selection.text === ST_LABELS.EASE_IN) previewInvert = !invert;
        }

        var offs = _stFrameOffset_computeOffsetsFloat(n, Math.max(1, maxFrames), typeIdx, curve50, previewInvert);
        return { offs:offs, maxFrames:maxFrames, typeIdx:typeIdx, curve50:curve50, invert:invert, count:n };
    }

    function drawPreview(){
        var selCount = _getSelCount();

        // status line (auto-hide when nothing selected)
        if(!selCount || selCount <= 0){
            status.visible = false;
            status.text = "";
        }else{
            status.visible = true;
            status.text = "Selected layers: " + selCount + "  |  Curve: " + Math.round(curveSlider.value) + "  |  Max: " + getMaxFrames() + " fr";
        }

        // Always draw a curve, even with nothing selected (use a fixed sample count)
        var previewCount = (selCount && selCount >= 2) ? selCount : 20;
        var info = computeOffsetsForCount(previewCount, true);

        var pts = [];
        var n = previewCount;
        var maxF = Math.max(1, info.maxFrames);
        for(var i=0;i<n;i++){
            var x01 = (n<=1) ? 0 : (i/(n-1));
            var y01 = clamp((info.offs[i]||0)/maxF, 0, 1);
            pts.push([x01,y01]);
        }


        // force redraw
        try { previewBox.layout.layout(true); } catch (e1) {}
        try { d.layout.layout(true); } catch (e2) {}
        try { d.update(); } catch (e3) {}
        try { var v = preview.visible; preview.visible = false; preview.visible = v; } catch (e4) {}
        return info;
    }

    function refresh(){ drawPreview(); }

    // Live updates
    dd.onChange = refresh;
    invCb.onClick = refresh;
    maxEt.onChange = refresh;

    curveSlider.onChanging = function(){
        curveVal.text = ""+Math.round(curveSlider.value);
        refresh();
    };
    curveSlider.onChange = function(){
        curveVal.text = ""+Math.round(curveSlider.value);
        refresh();
    };

    btnRefresh.onClick = function(){ refresh(); };

    btnApply.onClick = function(){
        if(!comp || !(comp instanceof CompItem)){
            try{ alert("Open a comp and select at least 2 layers."); }catch(e){}
            return;
        }
        var layers = _stFrameOffset_getSelectedLayersInUserOrder(comp);
        if(!layers || layers.length < 2){
            try{ alert("Select at least 2 layers in the active comp."); }catch(e){}
            return;
        }
        var info = computeOffsetsForCount(layers.length, false);
        app.beginUndoGroup("Layer Offset Curve");
        try{
            _stFrameOffset_applyCurveOffset(comp, layers, info.maxFrames, info.typeIdx, info.curve50, info.invert);
        }catch(e){
            try{ alert("Offset Layers failed:\n" + e.toString()); }catch(e2){}
        }
        try{ app.endUndoGroup(); }catch(e3){}
        try{ d.close(); }catch(e4){}
    };
    btnClose.onClick = function(){ try{ d.close(); }catch(e){} };

    // initial
    refresh();
    d.show();
    return;
}

function _stFrameOffset_applyCurveOffset(comp, layers, totalFrames, typeIdx, curve50, invert){
    var fps=comp.frameRate;
    var offsF=_stFrameOffset_computeOffsetsFloat(layers.length, totalFrames, typeIdx, curve50, invert);
    for(var i=0;i<layers.length;i++){
        layers[i].startTime += (offsF[i] / fps);
    }
}

// Entry point for the MAIN > UTILITIES button

// ============================================================
// Modal-safe helpers: pause background scheduleTask loops while dialogs are open
// (AE throws "Cannot run a script while a modal dialog is waiting for response")
// ============================================================
function __ST_pauseBackgroundTasks__(){
    try{
        // Cancel hover label polling (it uses scheduleTask while hovering)
        if ($.global && $.global.__ShineTools_CancelHoverPoll__) $.global.__ShineTools_CancelHoverPoll__();
    }catch(e1){}
}

function __ST_resumeBackgroundTasks__(){
}

function __ST_runExclusive__(fn){
    try {
        if (!$.global) $.global = {};
        if ($.global.__ST_BUSY__ === true) {
            var busyStarted = 0;
            try { busyStarted = $.global.__ST_BUSY_STARTED_MS__ || 0; } catch (eBusy0) { busyStarted = 0; }
            var busyNow = 0;
            try { busyNow = (new Date()).getTime(); } catch (eBusy1) { busyNow = 0; }
            if (!busyStarted || !busyNow || (busyNow - busyStarted) < 10000) return null;
            try { $.global.__ST_BUSY__ = false; } catch (eBusy2) {}
        }
        $.global.__ST_BUSY__ = true;
        try { $.global.__ST_BUSY_STARTED_MS__ = (new Date()).getTime(); } catch (eBusy3) {}
    } catch (e0) {
        // if $.global isn't writable, just run without the lock
        try { return fn(); } catch (e1) { throw e1; }
    }

    try {
        return fn();
    } finally {
        try { $.global.__ST_BUSY__ = false; } catch (e2) {}
        try { $.global.__ST_BUSY_STARTED_MS__ = 0; } catch (e3) {}
    }
}

function __ST_withModalSafety__(fn){
    try {
        if ($.global && $.global.__ST_MODAL_DEPTH__ > 0) {
            return fn();
        }
    } catch (eDepth0) {}
    return __ST_runExclusive__(function(){
        // During long blocking operations (e.g. Render Queue render), skip UI scheduleTask callbacks
        // to avoid ScriptUI re-entrancy / glyph loss on focus changes.
        try { if ($.global && $.global.__ST_LONGOP__ === true) return null; } catch (eSkip) {}
        // Also skip scheduleTask UI callbacks during saves or when renderQueue reports rendering.
        try { if (app && app.isSaving) return null; } catch (eSkipS) {}
        try { if (app && app.project && app.project.renderQueue && app.project.renderQueue.rendering) return null; } catch (eSkipR) {}
        try { $.global.__ST_MODAL_DEPTH__ = 1; } catch (eDepth1) {}
        __ST_pauseBackgroundTasks__();
        try {
            return fn();
        } finally {
            __ST_resumeBackgroundTasks__();
            try { $.global.__ST_MODAL_DEPTH__ = 0; } catch (eDepth2) {}
            try { if ($.global && $.global.__ST_SetUICooldown__) $.global.__ST_SetUICooldown__(2500); } catch (eCool) {}
            try { if (typeof _stRecoverAfterHostModal === "function") _stRecoverAfterHostModal(); } catch (eRecover) {}
        }
    });
}

function __ST_promptSafe__(question, defaultText){
    return $.global.__ST_withModalSafety__(function(){
        return prompt(question, defaultText);
    });
}

function __ST_confirmSafe__(question){
    return $.global.__ST_withModalSafety__(function(){
        return confirm(question);
    });
}

function __ST_openDialogSafe__(title, filter, multiSelect){
    return $.global.__ST_withModalSafety__(function(){
        return File.openDialog(title, filter, multiSelect);
    });
}

function __ST_selectDialogSafe__(title){
    return $.global.__ST_withModalSafety__(function(){
        return Folder.selectDialog(title);
    });
}

function __ST_saveDialogSafe__(title, filter){
    return $.global.__ST_withModalSafety__(function(){
        return File.saveDialog(title, filter);
    });
}

// Do not monkey-patch AE's global alert/confirm/prompt.
// Those globals live in the shared ExtendScript engine, and replacing them can leave
// AE-owned native modal flows (like Save Animation Preset warnings) in a bad focus state.
// If an older loaded copy patched them, restore the native functions now.
try{
    if (!$.global) $.global = {};
    // Ensure the global alias points at the latest implementation
    $.global.__ST_withModalSafety__ = __ST_withModalSafety__;

    if ($.global.__ST_ModalFnsPatched__) {
        try { if ($.global.__ST_alertOriginal__) alert = $.global.__ST_alertOriginal__; } catch (eRestoreA) {}
        try { if ($.global.__ST_confirmOriginal__) confirm = $.global.__ST_confirmOriginal__; } catch (eRestoreC) {}
        try { if ($.global.__ST_promptOriginal__) prompt = $.global.__ST_promptOriginal__; } catch (eRestoreP) {}
    }

    $.global.__ST_ModalFnsPatched__ = false;
}catch(ePatch){}

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
            _stFrameOffset_showCurveDialog(comp);
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

function offsetSelectedLayers_ShineTools(useCurveOverride){
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
        useCurve: (useCurveOverride === true) ? true : ((useCurveOverride === false) ? false : (isOptionDown() ? true : false))
    };

    // Open directly (scheduleTask removed by request).
    try { ($.global.__ST_RunOffsetLayersModal__ || __ST_RunOffsetLayersModal__)(); } catch (e2) {}
}

function buildUI(thisObj) {

        var pal = (thisObj instanceof Panel)
            ? thisObj
            : new Window("palette", "ShineTools_v" + SHINE_VERSION, undefined, { resizeable: true });

        // Install hover label hooks; modifier flips are also handled by hover-only polling
        try { _stHoverInstallMouseHook(pal); } catch(eHook) {}

        // Also try key hooks for instant modifier flips (best-effort fallback).
        try { _stHoverInstallKeyHook(pal); } catch(eKey) {}
        // Do not attach blank-panel click/focus handlers.
        // Do not attach root mousedown/focus/activate handlers to the palette/panel;
        // the user's lockup is triggered by clicking empty panel space after render.
        // Button-level hover/click features remain intact.
        // NO-EVENT-HOOK DIAGNOSTIC:
        // Do not attach root activate/deactivate handlers. The freeze still happened after
        // scheduleTask removal, so this build avoids touching ScriptUI/app state merely
        // because the user clicks back into the panel after a render/import.
        try { pal.onDeactivate = null; pal.onActivate = null; } catch(e) {}

        // Focus sink (used to kill blue focus ring on buttons after click)
        function ensureFocusSink() {
            try { if (pal instanceof Panel) return null; } catch (ePanelSink) {}
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

        function _buildTopTabHeader(pal) {
            // -------------------------
            // TOP TAB LABELS + ACTIVE UNDERLINE
            //   (implemented as a stacked header so we can draw an underline
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
            tabUnderlineLayer.minimumSize   = [10, 6];
            tabUnderlineLayer.preferredSize = [10, 6];
            tabUnderlineLayer.maximumSize   = [10000, 6];

            var topMetaRow = tabHeader.add("group");
            topMetaRow.orientation   = "row";
            topMetaRow.alignChildren = ["fill", "center"];
            topMetaRow.alignment     = ["fill", "top"];
            topMetaRow.margins       = 0;
            topMetaRow.spacing       = 0;
            try { topMetaRow.visible = false; } catch (eWSHide0) {}
            try { topMetaRow.minimumSize = [0, 0]; } catch (eWSHide1) {}
            try { topMetaRow.preferredSize = [0, 0]; } catch (eWSHide2) {}
            try { topMetaRow.maximumSize = [0, 0]; } catch (eWSHide3) {}

            function _makeTopTabLabel(txt, host) {
                if (!host) host = tabBarLeft;
                var st = host.add("statictext", undefined, txt);

                // Keep these labels visually stable during live resize.
                // ScriptUI can "breathe" horizontally when labels are auto-measured,
                // which shows up as left/right jitter in the top-right tabs.
                st.justify = "center";
                st.margins = 0;

                var w = 0;
                try {
                    w = Math.ceil(st.graphics.measureString(String(txt || "")).width) + 12;
                } catch (eM) {}
                if (!w || w < 24) {
                    if (txt === "REQUESTS") w = 82;
                    else if (txt === "UPDATES") w = 76;
                    else if (txt === "HELP") w = 44;
                    else if (txt === "MAIN") w = 44;
                    else if (txt === "TEXT") w = 42;
                    else w = Math.max(24, (String(txt || "").length * 8) + 12);
                }
                try { st.minimumSize   = [w, 18]; } catch (e0) {}
                try { st.preferredSize = [w, 18]; } catch (e1) {}
                try { st.maximumSize   = [w, 18]; } catch (e2) {}

                return st;
            }

            var tabLblMain = _makeTopTabLabel("MAIN", tabBarLeft);
            var tabLblText = _makeTopTabLabel("TEXT", tabBarLeft);

            // Pinned (right) tabs: REQUESTS / UPDATES / HELP (HELP far right)
            var tabLblRequests = _makeTopTabLabel("REQUESTS", tabBarRight);
            var tabLblUpdates  = _makeTopTabLabel("UPDATES", tabBarRight);
            var tabLblHelp     = _makeTopTabLabel("HELP", tabBarRight);

            // Mirrors the tab row structure: MAIN/TEXT on left, flexible gap, right tabs pinned.
            var __stTabUnderline = {};
            try {
                tabUnderlineLayer.orientation = "row";
                tabUnderlineLayer.alignChildren = ["fill", "center"];
                tabUnderlineLayer.alignment = ["fill", "top"];
                tabUnderlineLayer.spacing = 14;

                var ulLeft = tabUnderlineLayer.add("group");
                ulLeft.orientation = "row";
                ulLeft.alignChildren = ["left", "center"];
                ulLeft.alignment = ["left", "center"];
                ulLeft.margins = 0;
                ulLeft.spacing = 14;

                function __makeNativeTabUnderline(host, tabLabel) {
                    var w = 44;
                    try { w = Math.max(24, tabLabel.preferredSize[0]); } catch (eW) {}
                    var u = host.add("statictext", undefined, "");
                    u.justify = "center";
                    u.minimumSize = [w, 6];
                    u.preferredSize = [w, 6];
                    u.maximumSize = [w, 6];
                    try { u.graphics.font = ScriptUI.newFont(u.graphics.font.name, "Bold", 8); } catch (eF) {}
                    try { u.graphics.foregroundColor = u.graphics.newPen(u.graphics.PenType.SOLID_COLOR, [1.0, 0.82, 0.0, 1], 1); } catch (eC) {}
                    return u;
                }

                __stTabUnderline.MAIN = __makeNativeTabUnderline(ulLeft, tabLblMain);
                __stTabUnderline.TEXT = __makeNativeTabUnderline(ulLeft, tabLblText);

                var ulGap = tabUnderlineLayer.add("group");
                ulGap.minimumSize = [0, 0];
                ulGap.maximumSize = [10000, 10000];
                ulGap.alignment = ["fill", "fill"];

                var ulRight = tabUnderlineLayer.add("group");
                ulRight.orientation = "row";
                ulRight.alignChildren = ["right", "center"];
                ulRight.alignment = ["right", "center"];
                ulRight.margins = 0;
                ulRight.spacing = 14;

                __stTabUnderline.REQUESTS = __makeNativeTabUnderline(ulRight, tabLblRequests);
                __stTabUnderline.UPDATES  = __makeNativeTabUnderline(ulRight, tabLblUpdates);
                __stTabUnderline.HELP     = __makeNativeTabUnderline(ulRight, tabLblHelp);
            } catch (eULBuild) {}

            try {
                } catch (e) {}
            var TAB_LABEL_ACTIVE = [1.0, 0.82, 0.0, 1];  // Shine yellow
            var TAB_LABEL_IDLE   = [0.85, 0.85, 0.85, 1];

            function __stSetNativeTabUnderline(activeName) {
                try {
                    var keys = ["MAIN", "TEXT", "REQUESTS", "UPDATES", "HELP"];
                    for (var i = 0; i < keys.length; i++) {
                        var k = keys[i];
                        if (__stTabUnderline && __stTabUnderline[k]) {
                            __stTabUnderline[k].text = (k === activeName) ? "━━━━" : "";
                        }
                    }
                } catch (e) {}
            }

            function _setTopTabLabelColor(st, rgbaArr) {
                try {
                    st.graphics.foregroundColor = st.graphics.newPen(st.graphics.PenType.SOLID_COLOR, rgbaArr, 1);
                } catch (e) {}
            }

            // Tab underlines use native statictext characters via __stSetNativeTabUnderline().
            function _drawTopTabUnderline(g, st, underlineEl) { return; }

try { __stSetNativeTabUnderline("MAIN"); } catch (eNativeUL0) {}

            return {
                tabHeader: tabHeader,
                tabBar: tabBar,
                tabBarLeft: tabBarLeft,
                tabBarRight: tabBarRight,
                tabUnderlineLayer: tabUnderlineLayer,
                topMetaRow: topMetaRow,
                tabLblMain: tabLblMain,
                tabLblText: tabLblText,
                tabLblUpdates: tabLblUpdates,
                tabLblRequests: tabLblRequests,
                tabLblHelp: tabLblHelp,
                TAB_LABEL_ACTIVE: TAB_LABEL_ACTIVE,
                TAB_LABEL_IDLE: TAB_LABEL_IDLE,
                setTopTabLabelColor: _setTopTabLabelColor,
                setNativeTabUnderline: __stSetNativeTabUnderline
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

            var tabMain             = tabStack.add("group");
            var tabText             = tabStack.add("group");
            var tabRequests         = tabStack.add("group");
            var tabUpdates          = tabStack.add("group");
            var tabHelp             = tabStack.add("group");
            var tabWorkspaceManager = tabStack.add("group");

            tabRequests.visible         = false;
            tabUpdates.visible          = false;
            tabHelp.visible             = false;
            tabWorkspaceManager.visible = false;

            return {
                tabStack: tabStack,
                tabMain: tabMain,
                tabText: tabText,
                tabRequests: tabRequests,
                tabUpdates: tabUpdates,
                tabHelp: tabHelp,
                tabWorkspaceManager: tabWorkspaceManager,
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
        var topMetaRow = _topTabs.topMetaRow;

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

        var tabMain       = _tabs.tabMain;
        var tabText       = _tabs.tabText;
        var tabRequests         = _tabs.tabRequests;
        var tabUpdates          = _tabs.tabUpdates;
        var tabHelp             = _tabs.tabHelp;
        var tabWorkspaceManager = _tabs.tabWorkspaceManager;

        // Expose tab references for takeover/restore logic
        try {
            pal.__stTabStack    = tabStack;
            pal.__stTabMain     = tabMain;
            pal.__stTabText     = tabText;
            pal.__stTabRequests         = tabRequests;
            pal.__stTabUpdates          = tabUpdates;
            pal.__stTabHelp             = tabHelp;
            pal.__stTabWorkspaceManager = tabWorkspaceManager;
        } catch (e) {}

function _stAddPinnedTabFooter(tabRoot, tabKey) {
    try {
        if (!tabRoot || tabRoot.__stPinnedFooterBuilt) return null;
        tabRoot.__stPinnedFooterBuilt = true;

        var spacer = tabRoot.add("group");
        spacer.alignment = ["fill", "fill"];
        spacer.minimumSize = [0, 0];
        spacer.preferredSize = [0, 0];

        var footer = tabRoot.add("group");
        footer.orientation   = "column";
        footer.alignChildren = ["left", "center"];
        footer.alignment     = ["fill", "bottom"];
        footer.margins       = [16, 4, 10, 6];
        footer.minimumSize   = [0, 34];
        footer.maximumSize   = [10000, 34];
        footer.spacing       = 2;

        var topRow = footer.add("group");
        topRow.orientation   = "row";
        topRow.alignChildren = ["left","center"];
        topRow.alignment = ["left","bottom"];
        topRow.margins       = [0, 0, 0, 0];
        topRow.spacing       = 0;

        var statusLabel = topRow.add("statictext", undefined, "Update available.");
        statusLabel.margins = 0;
        statusLabel.alignment = ["left","center"];
        try { statusLabel.characters = 22; } catch (eCh) {}
        try { statusLabel.visible = false; } catch (eVis0) {}
        try { statusLabel.text = ""; } catch (eTxt0) {}

        var copyRow = footer.add("group");
        copyRow.orientation   = "row";
        copyRow.alignChildren = ["left","center"];
        copyRow.alignment = ["left","bottom"];
        copyRow.margins       = [0, 0, 0, 0];
        copyRow.spacing       = 0;

        var copy = copyRow.add("statictext", undefined, "(c) 2025 Shine Creative | v" + SHINE_VERSION);
        copy.margins = 0;
        copy.alignment = ["left","center"];
        try {
            var __copyG = copy.graphics;
            __copyG.foregroundColor = __copyG.newPen(__copyG.PenType.SOLID_COLOR, [0.78, 0.78, 0.78, 1], 1);
        } catch (eCopyColor) {}

        try {
            if (!pal.__stFooterStatusLabels) pal.__stFooterStatusLabels = [];
            pal.__stFooterStatusLabels.push(statusLabel);
        } catch (eStore) {}

        try {
            if (!pal.__stPinnedFooters) pal.__stPinnedFooters = [];
            pal.__stPinnedFooters.push(footer);
        } catch (eStore2) {}

        return footer;
    } catch (e) {}
    return null;
}

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
try { pal.__stFooterGroup = globalFooter; } catch(eFGStore) {}

// Row 1: Update Status (LEFT pinned)
var gfTopRow = globalFooter.add("group");
gfTopRow.orientation   = "row";
gfTopRow.alignChildren = ["left", "center"];
gfTopRow.alignment     = ["left", "center"];
gfTopRow.margins       = [10, 0, 0, 0];
gfTopRow.spacing       = 0;

// Update status label
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
gfCopyRow.margins = [8, 0, 0, 0];
gfCopyRow.spacing       = 0;

var gfCopy = gfCopyRow.add("statictext", undefined, "(c) 2025 Shine Creative | v" + SHINE_VERSION);
gfCopy.margins = 0;
gfCopy.alignment = ["left","center"];
try {
    var __gfCopyG = gfCopy.graphics;
    __gfCopyG.foregroundColor = __gfCopyG.newPen(__gfCopyG.PenType.SOLID_COLOR, [0.78, 0.78, 0.78, 1], 1);
} catch (eGfCopyColor) {}

function _setFooterUpdateIndicator(isUpToDate, msgOverride) {
    try {
        var nextText = "";
        if (typeof msgOverride === "string") {
            nextText = msgOverride;
        } else if (isUpToDate === true) {
            nextText = "✓ Up to date.";
        } else if (isUpToDate === false) {
            nextText = "Update available.";
        } else {
            nextText = "";
        }

        try {
            var labels = pal.__stFooterStatusLabels || [];
            for (var i = 0; i < labels.length; i++) {
                try {
                    if (!labels[i]) continue;
                    labels[i].text = nextText;
                    labels[i].visible = (nextText !== "");
                } catch (eOne) {}
            }
        } catch (eList) {}

        try {
            gfStatusLabel.text = nextText;
            gfStatusLabel.visible = (nextText !== "");
        } catch (eGf) {}

        try { if (pal && pal.layout) pal.layout.resize(); } catch (eL0) {}
        try { if (pal && pal.update) pal.update(); } catch (eL1) {}
    } catch (e) {}
}

// Default until the first check runs
try {
    gfStatusLabel.text = "";
} catch(e) {}

try { _stAddPinnedTabFooter(pal.__stMainTabRoot, "MAIN"); } catch (eFootMain) {}

// Keep the old global footer out of layout flow; each tab now owns its own pinned footer.
try {
    __footerGlue.visible = false;
    __footerGlue.enabled = false;
    __footerGlue.alignment = ["fill", "top"];
    __footerGlue.minimumSize = [0,0];
    __footerGlue.maximumSize = [0,0];
    __footerGlue.preferredSize = [0,0];
} catch (eHideGlue) {}

try {
    globalFooter.visible = false;
    globalFooter.enabled = false;
    globalFooter.alignment = ["fill", "top"];
    globalFooter.minimumSize = [0,0];
    globalFooter.maximumSize = [0,0];
    globalFooter.preferredSize = [0,0];
    globalFooter.margins = 0;
    globalFooter.spacing = 0;
} catch (eHideFooter) {}

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
                out.sort(function (a, b) {
                    a = String(a || "");
                    b = String(b || "");
                    if (a === _stDefaultWorkspaceName() && b !== _stDefaultWorkspaceName()) return -1;
                    if (b === _stDefaultWorkspaceName() && a !== _stDefaultWorkspaceName()) return 1;
                    return (a < b) ? -1 : ((a > b) ? 1 : 0);
                });
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

              var auditBtn = auditCell.add("button", undefined, ST_LABELS.REFRESH);
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
              var hStatus = header.add("statictext", undefined, ST_LABELS.STATUS);
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

// __ST__FONTBTN_PAD_PATCH__: give extra horizontal breathing room for the two long primary buttons
try {
    if (label === ST_LABELS.EXPORT_FONT_LIST || label === ST_LABELS.COPY_FOUND_FONTS) {
        // Increase minimum width so the label doesn't feel cramped.
        b.minimumSize = [__dlgMinW + 40, __dlgBtnH];
    }
} catch (ePad) {}
                try { defocusButtonBestEffort(b); } catch (eDF) {}
                return { cell: cell, btn: b };
              }

              var __export = __makeDialogCellButton__(btns, ST_LABELS.EXPORT_FONT_LIST);
              var exportCell = __export.cell;
              var exportBtn  = __export.btn;
              exportCell.visible = false;

              var __get = __makeDialogCellButton__(btns, ST_LABELS.COPY_FOUND_FONTS);
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

                var outFile = __ST_saveDialogSafe__("Save Font List", "Text:*.txt");
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
                        try { pal.__stTextTabRoot = textRoot; } catch (eStoreTextRoot) {}
                        textRoot.orientation   = "column";
                        textRoot.alignChildren = ["fill", "fill"];
                        textRoot.margins       = 0;
                        textRoot.spacing       = 0;

                        // Workspace Manager launcher
                        _addWorkspaceLauncherRow(textRoot, "TEXT");

                        // Same logo header for alignment
                        addLogoHeader(textRoot);

                        // Text tab content container matches MAIN’s accordion region margins
                        var textContent = textRoot.add("group");
                        try { pal.__stTextContentRoot = textContent; } catch (eStoreTextContent) {}
                        textContent.orientation   = "column";
                        textContent.alignChildren = ["fill", "top"];
                        textContent.alignment     = ["fill", "fill"];
                        try { textContent.maximumSize = [10000, 200000]; } catch (eTextContentMax) {}
                        textContent.margins       = [10, 8, 14, 0];
                        textContent.spacing       = 10;

                                // ANIMATIONS BAR (TEXT tab) — mirrors MAIN tab Favorites bar height/spacing for alignment
                        var animWrap = textContent.add("group");
                        animWrap.orientation   = "column";
                        animWrap.alignChildren = ["fill", "top"];
                        animWrap.alignment     = ["fill", "top"];
                        animWrap.margins       = ST_CONST.COLORS.TRANSPARENT_RGBA;
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
                                    ST_CONST.COLORS.SHINE_YELLOW_RGBA,
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
                        try { animAddBtn.alignment = ["left","bottom"]; animAddBtn.margins = [-10, 0, 0, 0]; } catch(eA) {}

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

                                    var blank0 = animDD.add("item", String(animDD.__stFlashBlankText || " "));
                                    blank0._isBlank = true;
                                    var __animIndent = "    ";

                                    var bundled = [];
                                    try { bundled = _stGetBundledTextAnimatorPaths(); } catch (eB) {}
                                    try { bundled = _applyPathOrder(bundled, animBundledOrderLoad()); } catch (eBO) {}

                                    var arrRaw = animLoad();
                                    var arr = [];
                                    try {
                                        for (var ci = 0; ci < arrRaw.length; ci++) {
                                            var pp = String(arrRaw[ci] || "");
                                            if (!pp) continue;
                                            if (_animIsDividerToken(pp) || /\.ffx$/i.test(pp)) arr.push(pp);
                                        }
                                        if (arr.length !== arrRaw.length) animSave(arr);
                                    } catch (eClean) { arr = arrRaw; }

                                    if (arr.length === 0) arr = _animEnsureDefaultDividers([]);

                                    var unified = [];
                                    var useUnified = false;
                                    try { unified = animUnifiedOrderLoad(); } catch (eUni0) { unified = []; }
                                    try { useUnified = !!(unified && unified.length); } catch (eUni1) { useUnified = false; }

                                    if (!useUnified) {
                                        unified.push(_animDividerToken("BUNDLED"));
                                        for (var bi = 0; bi < bundled.length; bi++) {
                                            var bp0 = String(bundled[bi] || "");
                                            if (bp0) unified.push("B::" + bp0);
                                        }
                                        for (var ai = 0; ai < arr.length; ai++) {
                                            var ap0 = String(arr[ai] || "");
                                            if (ap0) unified.push(ap0);
                                        }
                                    }

                                    var bundledSeen = {};
                                    var addedSeen = {};
                                    for (var ui = 0; ui < unified.length; ui++) {
                                        var uv = String(unified[ui] || "");
                                        if (!uv) continue;

                                        if (_animIsDividerToken(uv)) {
                                            var divItem = animDD.add("item", _animDividerDisplay(_animDividerLabelFromToken(uv)));
                                            divItem._isDivider = true;
                                            try { divItem.enabled = false; } catch (eAnimDivDis) {}
                                            continue;
                                        }

                                        if (uv.indexOf("B::") === 0) {
                                            var bp = String(uv.substring(3) || "");
                                            if (!bp || bundledSeen[bp]) continue;
                                            bundledSeen[bp] = true;
                                            var __bShowOrig = false; try { __bShowOrig = (__ST_SESSION_TEXT_FAVORITES_SHOW_ORIGINAL__ === true); } catch (eBShowOrig) {}
                                            var __bLabel = String((__bShowOrig ? _stPrettyFileLabel(bp) : (_animLabelGet("B::" + bp) || _stPrettyFileLabel(bp))) || "").replace(/^[\s\u00A0]+/, "");
                                            var bItem = animDD.add("item", __animIndent + __bLabel);
                                            bItem._fullText = __animIndent + __bLabel;
                                            bItem.__path = bp;
                                            bItem._isDefault = true;
                                            try { bItem.helpTip = __bLabel; } catch (eTipBund) {}
                                            continue;
                                        }

                                        var p = uv;
                                        if (uv.indexOf("U::") === 0) p = String(uv.substring(3) || "");
                                        if (!p || addedSeen[p] || !/\.ffx$/i.test(p)) continue;
                                        addedSeen[p] = true;
                                        var __uShowOrig = false; try { __uShowOrig = (__ST_SESSION_TEXT_FAVORITES_SHOW_ORIGINAL__ === true); } catch (eUShowOrig) {}
                                        var label = String((__uShowOrig ? _stPrettyFileLabel(p) : (_animLabelGet("U::" + p) || _stPrettyFileLabel(p))) || "").replace(/^[\s\u00A0]+/, "");
                                        var it = animDD.add("item", __animIndent + label);
                                        it._fullText = __animIndent + label;
                                        it.__path = p;
                                        try { it.helpTip = label; } catch (eTipAnim) {}
                                    }

                                    animDD.add("separator");
                                    var clearIt = animDD.add("item", ANIM_ACTION_CLEAR);
                                    clearIt.__action = "clear";
                                    try { animDD.selection = 0; } catch (eSel) {}
}

                                    _applyDropdownLabelClamp(animDD);

                                try {
                                    var _openAnimReorder = function () {
                                        var bundledPaths = [];
                                        var addedPaths = [];
                                        var ANIM_DIV_BUNDLED = _animDividerToken("BUNDLED");
                                        var ANIM_SECTION_CHOICES = ["BUNDLED"];

                                        try { bundledPaths = _applyPathOrder(_stGetBundledTextAnimatorPaths(), animBundledOrderLoad()); } catch (eAB) { bundledPaths = _stGetBundledTextAnimatorPaths(); }
                                        try { addedPaths = _animEnsureDefaultDividers(animLoad() || []); } catch (eAU) { addedPaths = _animEnsureDefaultDividers([]); }

                                        if ((!bundledPaths || !bundledPaths.length) && (!addedPaths || !addedPaths.length)) {
                                            alert("No Text Animators found to reorder.");
                                            return;
                                        }

                                        var items = [];
                                        var bi2, ai2, bp2, ap2;
                                        var unifiedItems = [];
                                        var __bundledSeen = {};
                                        var __addedSeen = {};

                                        try { unifiedItems = animUnifiedOrderLoad(); } catch (eAnimUniLoad) { unifiedItems = []; }
                                        if (unifiedItems && unifiedItems.length) {
                                            for (var ui2 = 0; ui2 < unifiedItems.length; ui2++) {
                                                var uid = String(unifiedItems[ui2] || "");
                                                if (!uid) continue;
                                                if (_animIsDividerToken(uid)) {
                                                    var sectionNameU = _animDividerLabelFromToken(uid);
                                                    if (sectionNameU !== "BUNDLED") ANIM_SECTION_CHOICES.push(sectionNameU);
                                                    items.push({ id: uid, label: _animDividerDisplay(sectionNameU), _isDivider: true });
                                                } else if (uid.indexOf("B::") === 0) {
                                                    bp2 = String(uid.substring(3) || "");
                                                    if (!bp2 || __bundledSeen[bp2]) continue;
                                                    __bundledSeen[bp2] = true;
                                                    items.push({ id: "B::" + bp2, label: String(_animLabelGet("B::" + bp2) || _stPrettyFileLabel(bp2) || "").replace(/^[\s\u00A0]+/, "") });
                                                } else {
                                                    ap2 = (uid.indexOf("U::") === 0) ? String(uid.substring(3) || "") : uid;
                                                    if (!ap2 || __addedSeen[ap2]) continue;
                                                    __addedSeen[ap2] = true;
                                                    items.push({ id: "U::" + ap2, label: String(_animLabelGet("U::" + ap2) || _stPrettyFileLabel(ap2) || "").replace(/^[\s\u00A0]+/, "") });
                                                }
                                            }
                                        } else {
                                            items.push({ id: ANIM_DIV_BUNDLED, label: _animDividerDisplay("BUNDLED"), _isDivider: true });
                                            for (bi2 = 0; bi2 < bundledPaths.length; bi2++) {
                                                bp2 = String(bundledPaths[bi2] || "");
                                                if (!bp2) continue;
                                                items.push({ id: "B::" + bp2, label: String(_animLabelGet("B::" + bp2) || _stPrettyFileLabel(bp2) || "").replace(/^[\s\u00A0]+/, "") });
                                            }

                                            for (ai2 = 0; ai2 < addedPaths.length; ai2++) {
                                                ap2 = String(addedPaths[ai2] || "");
                                                if (!ap2) continue;
                                                if (_animIsDividerToken(ap2)) {
                                                    var sectionName = _animDividerLabelFromToken(ap2);
                                                    if (sectionName !== "BUNDLED") ANIM_SECTION_CHOICES.push(sectionName);
                                                    items.push({ id: ap2, label: _animDividerDisplay(sectionName), _isDivider: true });
                                                } else {
                                                    items.push({ id: "U::" + ap2, label: String(_animLabelGet("U::" + ap2) || _stPrettyFileLabel(ap2) || "").replace(/^[\s\u00A0]+/, "") });
                                                }
                                            }
                                        }

                                        var outAnim = _shineShowReorderListDialog(
                                            "Organize Text Animators",
                                            items,
                                            ST.UI.Organize.buildConfig("text_animators", {
                                                onAddFiles: function(lb, dlg, opts) {
                                                    var picked = animOpenDialogFromDefaultFolder();
                                                    if (!picked) return false;
                                                    if (!(picked instanceof Array)) picked = [picked];

                                                    var insertAt = lb.items.length;
                                                    try {
                                                        if (lb.selection) {
                                                            var selId = String(lb.selection._id || "");
                                                            for (var si = 0; si < lb.items.length; si++) {
                                                                if (String(lb.items[si]._id || "") === selId) { insertAt = si + 1; break; }
                                                            }
                                                        }
                                                    } catch (eAnimSelIns) {}

                                                    var addedAny = false;
                                                    for (var pi = 0; pi < picked.length; pi++) {
                                                        var f = picked[pi];
                                                        if (!f || !f.exists) continue;
                                                        var presetPath = String(f.fsName || "");
                                                        if (!presetPath || !/\.ffx$/i.test(presetPath)) continue;
                                                        var itemId = "U::" + presetPath;

                                                        var exists = false;
                                                        for (var li = 0; li < lb.items.length; li++) {
                                                            try { if (String(lb.items[li]._id || "") === itemId) { exists = true; break; } } catch (eAnimDup) {}
                                                        }
                                                        if (exists) continue;

                                                        var addLabel = String(_stPrettyFileLabel(presetPath) || "").replace(/^[\s ]+/, "");
                                                        var itAdded = lb.add("item", addLabel);
                                                        try { itAdded._id = itemId; } catch (eAnimSet0) {}
                                                        try { itAdded._label = addLabel; } catch (eAnimSet1) {}
                                                        try { itAdded._isDivider = false; } catch (eAnimSet2) {}
                                                        try { itAdded.helpTip = addLabel; } catch (eAnimSet3) {}
                                                        try { itAdded.enabled = true; } catch (eAnimSet4) {}
                                                        try { itAdded.selected = true; } catch (eAnimSet5) {}
                                                        try {
                                                            if (typeof insertAt === "number" && insertAt < (lb.items.length - 1)) {
                                                                itAdded.index = insertAt;
                                                                insertAt++;
                                                            }
                                                        } catch (eAnimReindex) {}
                                                        addedAny = true;
                                                    }
                                                    return addedAny;
                                                },
                                                originalFilenameForId: function(id) {
                                                    var cleanId = String(id || "");
                                                    if (cleanId.indexOf("B::") === 0) cleanId = String(cleanId.substring(3) || "");
                                                    else if (cleanId.indexOf("U::") === 0) cleanId = String(cleanId.substring(3) || "");
                                                    return _stPrettyFileLabel(cleanId);
                                                },
                                                displayLabelForId: function(id, label, obj, showOriginalFilename) {
                                                    if (obj && obj._isDivider) return label;
                                                    var cleanId = String(id || "");
                                                    if (cleanId.indexOf("B::") === 0) cleanId = String(cleanId.substring(3) || "");
                                                    else if (cleanId.indexOf("U::") === 0) cleanId = String(cleanId.substring(3) || "");
                                                    if (!showOriginalFilename && label) return String(label);
                                                    return _stPrettyFileLabel(cleanId);
                                                },
                                                sectionChoices: ANIM_SECTION_CHOICES,
                                                sectionTokenForChoice: function(choice) { return _animDividerToken(choice); },
                                                newDividerTokenForLabel: function(label) { return _animDividerToken(label); },
                                                newDividerDisplayForLabel: function(label) { return _animDividerDisplay(label); },
                                                initialShowOriginalFilename: (__ST_SESSION_TEXT_FAVORITES_SHOW_ORIGINAL__ === true)
                                            })
                                        );
                                        if (!outAnim || !outAnim.length) return;
                                        try { __ST_SESSION_TEXT_FAVORITES_SHOW_ORIGINAL__ = (outAnim.__stShowOriginalFilename === true); } catch (eAnimShowSave) {}

                                        var outBundled = [];
                                        var outAdded = [];
                                        var outUnified = [];
                                        var outLabelMap = {};
                                        for (var oa = 0; oa < outAnim.length; oa++) {
                                            var objAnim = outAnim[oa];
                                            var idv = String((objAnim && objAnim.id != null) ? objAnim.id : objAnim || "");
                                            var lblv = String((objAnim && objAnim.label != null) ? objAnim.label : "");
                                            if (!idv) continue;
                                            outUnified.push(idv);
                                            if (_animIsDividerToken(idv)) {
                                                if (idv !== ANIM_DIV_BUNDLED) outAdded.push(idv);
                                                continue;
                                            }
                                            if (idv.indexOf("B::") === 0) {
                                                outBundled.push(idv.substring(3));
                                            } else if (idv.indexOf("U::") === 0) {
                                                outAdded.push(idv.substring(3));
                                            }
                                            if (lblv) outLabelMap[_animNormalizeEntryId(idv)] = lblv;
                                        }
                                        animBundledOrderSave(outBundled);
                                        animSave(outAdded);
                                        try { animUnifiedOrderSave(outUnified); } catch (eAnimUniSave) {}
                                        try { _animLabelMapReplace(outLabelMap); } catch (eAnimLblSave) {}
                                        animRebuildDropdown();
                                        try { animDD.__shineProgrammatic = true; } catch (eAP0) {}
                                        try { animDD.selection = 0; } catch (eAP1) {}
                                        try { animDD.__shineProgrammatic = false; } catch (eAP2) {}
                                        try { _applyDropdownLabelClamp(animDD); } catch (eClampAnim) {}
                                        try { if (typeof relayout === "function") relayout(); } catch (eRelayoutAnim) {}
                                        try { if (textContent && textContent.layout) { textContent.layout.layout(true); textContent.layout.resize(); } } catch (eTextLayoutAnim) {}
                                        try { if (pal && pal.layout) { pal.layout.layout(true); pal.layout.resize(); } } catch (ePalLayoutAnim) {}
                                        try { if (pal && pal.update) pal.update(); } catch (ePalUpdateAnim) {}
                                        try { _applyDropdownLabelClamp(animDD); } catch (eClampAnim) {}
                                        try { if (typeof relayout === "function") relayout(); } catch (eRelayoutAnim) {}
                                        try { if (textContent && textContent.layout) { textContent.layout.layout(true); textContent.layout.resize(); } } catch (eTextLayoutAnim) {}
                                        try { if (pal && pal.layout) { pal.layout.layout(true); pal.layout.resize(); } } catch (ePalLayoutAnim) {}
                                        try { if (pal && pal.update) pal.update(); } catch (ePalUpdateAnim) {}
                                    };
                                    var _animReorderMouse = function(){
                                        var ks = null; try { ks = ScriptUI.environment.keyboardState; } catch (eKSA) {}
                                        if (ks && ks.altKey) { _openAnimReorder(); }
                                    };
                                    animStar.addEventListener("mousedown", _animReorderMouse);
                                    animLbl.addEventListener("mousedown", _animReorderMouse);
                                } catch (eAnimReorder) {}

                                (animAddBtn.__button || animAddBtn).onClick = function () {
                                    // TEXT tab (+): NORMAL click ONLY adds .ffx preset(s) to the dropdown list.
                                    // (No applying to layers and no layer creation on click.)
                                    var picked = animOpenDialogFromDefaultFolder(); // multi-select enabled
                                    if (!picked) return;

                                    // Normalize to array
                                    if (!(picked instanceof Array)) picked = [picked];

                                    // Add all picked presets to the current list (top of list = first picked)
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
                                    try { animUnifiedOrderSave([]); } catch (eAnimAddU) {}
                                    animRebuildDropdown();
                                try { _ddFlashAddedFrames(animDD, 26, animRebuildDropdown); } catch(eMsg) {}
                                };

                                                                animDD.onChange = function () {
                                    try {
                                        try {
                                            if (animDD.__stShowingAddedFlash === true) return;
                                            if (animDD.__stSuppressOnChangeUntil && (new Date()).getTime() < animDD.__stSuppressOnChangeUntil) return;
                                        } catch (eAnimFlashGuard) {}
                                        if (animDD.__shineProgrammatic) {
                                            animDD.__shineProgrammatic = false;
                                            return;
                                        }
                                        if (!animDD.selection) return;
                                        var sel = animDD.selection;

                                        // Divider / blank rows are non-actions.
                                        if (sel && (sel._isDivider || sel._isBlank)) {
                                            ST.UI.Dropdown.reset(animDD, 1);
                                            return;
                                        }

                                        // Cmd+click removes the item from the current list (TEXT tab parity with MAIN).
                                        if (sel && sel.__path && _isCmdDown() && !sel._isDefault) {
                                            try {
                                                animRemovePath(sel.__path);
                                                animRebuildDropdown();
                                                try { if (typeof relayout === "function") relayout(); } catch (eRL) {}
                                            } catch (eR) {}
                                            ST.UI.Dropdown.reset(animDD, 1);
                                            return;
                                        }
                                        if (sel.__action === "clear") {
                                            animClear();
                                            animRebuildDropdown();
                                            ST.UI.Dropdown.reset(animDD, 1);
                                            return;
                                        }

                                        var presetPath = String(sel.__path || "");
                                        if (!presetPath) {
                                            ST.UI.Dropdown.reset(animDD, 1);
                                            return;
                                        }

                                        try { $.global._shineToolsApplyFFXPreset(presetPath); } catch (eApply) {
                                            try { alert("Animation preset apply failed:\n" + eApply.toString()); } catch (eApply2) {}
                                        }
                                        ST.UI.Dropdown.reset(animDD, 1);
                                    } catch (eAnimSel) {
                                        try { alert("Animation dropdown error:\n" + eAnimSel.toString()); } catch (eAnimSel2) {}
                                    }
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
                        try { pal.__stTextAccordionHost = textAccHost; } catch (eStoreTextAccHost) {}
                        textAccHost.orientation   = "column";
                        textAccHost.alignChildren = ["fill", "top"];
                        textAccHost.alignment     = ["fill", "top"];
                        textAccHost.margins       = ST_CONST.COLORS.TRANSPARENT_RGBA;
                        textAccHost.spacing       = 10;

                        // Build a TEXT accordion (now supports Auto Collapse, like MAIN)
                        textAcc = createAccordion(textAccHost, null, function(){ requestRelayoutSoon(textContent, 40); }, "TEXT_UI");
                        try { pal.__stTextAccordion = textAcc; } catch (eTextAcc0) {}

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
// Non-dirty detection only: NEVER creates temp comps/layers/effects.
// This avoids marking the project as modified, which can trigger Save dialogs
// on app quit or project switch.
// =============================================================
var _stModernExprCache = null;

function _stParseModernExpressionEngineValue(raw) {
    try {
        if (raw === null || typeof raw === "undefined") return null;

        var s = String(raw).toLowerCase();
        s = s.replace(/^\s+|\s+$/g, "");
        if (!s) return null;

        if (s.indexOf("javascript") !== -1 || s.indexOf("modern") !== -1) return true;
        if (s.indexOf("extendscript") !== -1 || s.indexOf("legacy") !== -1) return false;

        // Some hosts may return a simple 0/1-like value; keep this conservative.
        if (s === "1" || s === "true") return true;
        if (s === "0" || s === "false") return false;
    } catch (e) {}
    return null;
}

function _stReadExpressionEnginePrefSafe() {
    var sections = [
        "Main Pref Section",
        "Scripting & Expressions",
        "Scripting and Expressions",
        "Expressions",
        "General Section"
    ];
    var keys = [
        "Pref_EXPRESSION_ENGINE",
        "Pref_ExpressionEngine",
        "Expression Engine",
        "expressionEngine",
        "Pref_SCRIPTING_EXPRESSION_ENGINE"
    ];

    function _tryRead(methodName, section, key) {
        try {
            if (!app || !app.preferences || !app.preferences[methodName]) return null;
            return app.preferences[methodName](section, key);
        } catch (e) {
            return null;
        }
    }

    for (var si = 0; si < sections.length; si++) {
        for (var ki = 0; ki < keys.length; ki++) {
            var section = sections[si];
            var key = keys[ki];

            var parsed = _stParseModernExpressionEngineValue(_tryRead("getPrefAsString", section, key));
            if (parsed !== null) return parsed;

            parsed = _stParseModernExpressionEngineValue(_tryRead("getPrefAsLong", section, key));
            if (parsed !== null) return parsed;

            parsed = _stParseModernExpressionEngineValue(_tryRead("getPrefAsBool", section, key));
            if (parsed !== null) return parsed;
        }
    }
    return null;
}

function _stGetModernExpressionEngineStateNonDirty() {
    try {
        if (app && app.project && typeof app.project.expressionEngine !== "undefined") {
            var parsedProject = _stParseModernExpressionEngineValue(app.project.expressionEngine);
            if (parsedProject !== null) return parsedProject;
        }
    } catch (e0) {}

    try {
        var parsedPref = _stReadExpressionEnginePrefSafe();
        if (parsedPref !== null) return parsedPref;
    } catch (e1) {}

    return null;
}

function _stIsModernExpressionEngine(comp) {
    // Cache per-session to avoid repeated lookups once we have a definitive result.
    if (_stModernExprCache !== null) return _stModernExprCache;

    try {
        var detected = _stGetModernExpressionEngineStateNonDirty();
        if (detected !== null) {
            _stModernExprCache = detected;
            return detected;
        }

        // Unknown: fail open and DO NOT cache. This avoids false warnings while also
        // guaranteeing we never dirty the project just to check the engine.
        return true;
    } catch (e) {
        _stModernExprCache = null;
        return true;
    }
}

function _stShowModernExpressionWarningDialog() {
    var dlg = null;
    try {
        dlg = new Window("dialog", "ShineTools Warning");
        dlg.orientation = "column";
        dlg.alignChildren = ["fill", "top"];
        dlg.spacing = 0;
        dlg.margins = 16;
        dlg.preferredSize.width = 500;

        var shineYellow = [1.0, 0.8, 0.0, 1.0];
        var sink = null;
        try { sink = _stFrameOffset_addFocusSink(dlg); } catch (eSink) { sink = null; }

        var headerGroup = dlg.add("group");
        headerGroup.orientation = "column";
        headerGroup.alignChildren = ["fill", "top"];
        headerGroup.spacing = 8;
        headerGroup.margins = [0, 0, 0, 0];

        var titleRow = headerGroup.add("group");
        titleRow.orientation = "row";
        titleRow.alignChildren = ["left", "center"];
        titleRow.spacing = 8;
        titleRow.margins = [0, 0, 0, 0];
        titleRow.alignment = ["fill", "top"];

        var warnIcon = titleRow.add("group");
        var iconW = 22, iconH = 20;
        warnIcon.preferredSize = [iconW, iconH];
        warnIcon.minimumSize   = [iconW, iconH];
        warnIcon.maximumSize   = [iconW, iconH];
        try { warnIcon.alignment = ["left", "center"]; } catch (eAI2) {}

        var titleTxt = titleRow.add("statictext", undefined, "Modern JavaScript Expressions Required");
        titleTxt.alignment = ["fill", "center"];
        titleTxt.justify = "left";
        try { titleTxt.preferredSize.width = 430; } catch (eTW) {}
        try {
            var tf = titleTxt.graphics.font;
            titleTxt.graphics.font = ScriptUI.newFont(tf.name, "Bold", tf.size + 2);
        } catch (eFont1) {}
        try {
            titleTxt.graphics.foregroundColor = titleTxt.graphics.newPen(titleTxt.graphics.PenType.SOLID_COLOR, shineYellow, 1);
        } catch (eTitleColor) {}

        var dividerWrap = headerGroup.add("group");
        dividerWrap.orientation = "column";
        dividerWrap.alignChildren = ["fill", "top"];
        dividerWrap.margins = [0, 2, 0, 0];
        var divider = dividerWrap.add("panel");
        divider.alignment = ["fill", "top"];
        divider.minimumSize.height = 2;
        divider.maximumSize.height = 2;
        try {
            divider.graphics.backgroundColor = divider.graphics.newBrush(divider.graphics.BrushType.SOLID_COLOR, shineYellow);
        } catch (eDiv) {}

        var bodyGroup = dlg.add("group");
        bodyGroup.orientation = "column";
        bodyGroup.alignChildren = ["fill", "top"];
        bodyGroup.spacing = 10;
        bodyGroup.margins = [0, 12, 0, 0];

        var introTxt = bodyGroup.add(
            "statictext",
            undefined,
            "These number counters require the Modern JavaScript Expression Engine.",
            { multiline: true }
        );
        introTxt.alignment = ["fill", "top"];
        try { introTxt.preferredSize.width = 448; } catch (eIW) {}
        try {
            var ifn = introTxt.graphics.font;
            introTxt.graphics.font = ScriptUI.newFont(ifn.name, ifn.style, ifn.size + 2);
        } catch (eIntroFont) {}

        var stepsTxt = bodyGroup.add(
            "statictext",
            undefined,
            "Enable it here:\n\n" +
            "• After Effects → Settings (or Preferences) → Scripting & Expressions\n" +
            "• Expression Engine → JavaScript\n\n" +
            "You must restart After Effects before using this counter.",
            { multiline: true }
        );
        stepsTxt.alignment = ["fill", "top"];
        try { stepsTxt.preferredSize.width = 448; } catch (eSW) {}
        try {
            var sfn = stepsTxt.graphics.font;
            stepsTxt.graphics.font = ScriptUI.newFont(sfn.name, sfn.style, sfn.size + 2);
        } catch (eStepsFont) {}

        var buttonWrap = dlg.add("group");
        buttonWrap.orientation = "stack";
        buttonWrap.alignment = ["fill", "top"];
        buttonWrap.margins = [0, 16, 0, 0];
        try { buttonWrap.preferredSize.height = 30; } catch (eBWH) {}

        var sinkCell = buttonWrap.add("group");
        sinkCell.orientation = "row";
        sinkCell.alignment = ["fill", "fill"];
        sinkCell.margins = [0, 0, 0, 0];
        try {
            sinkCell.add("edittext", [0, 0, 1, 1], "", { readonly:true, borderless:true });
        } catch (eFS) {}

        var buttonRow = buttonWrap.add("group");
        buttonRow.orientation = "row";
        buttonRow.alignChildren = ["center", "center"];
        buttonRow.alignment = ["center", "center"];
        buttonRow.spacing = 0;
        buttonRow.margins = [0, 0, 0, 0];

        var okBtn = buttonRow.add("button", undefined, "OK", { name: "ok" });
        try { okBtn.preferredSize = [112, 28]; } catch (eBtn) {}
        try { if (typeof defocusButtonBestEffort === "function") defocusButtonBestEffort(okBtn); } catch (eDF1) {}
        try {
            if (typeof _stFrameOffset_defocus === "function") {
                okBtn.addEventListener("mousedown", function(){ try { _stFrameOffset_defocus(okBtn, sink); } catch (_e1) {} });
                okBtn.addEventListener("mouseup", function(){ try { _stFrameOffset_defocus(okBtn, sink); } catch (_e2) {} });
            }
        } catch (eDF2) {}

        okBtn.onClick = function () {
            try { if (typeof _stFrameOffset_defocus === "function") _stFrameOffset_defocus(okBtn, sink); } catch (e0) {}
            try { okBtn.active = false; } catch (e1) {}
            try { if (sink) sink.active = true; } catch (e2) {}
            try { dlg.close(1); } catch (e3) { try { dlg.close(); } catch (e4) {} }
        };

        dlg.onShow = function () {
            try { if (sink) sink.active = true; } catch (e5) {}
            try { okBtn.active = false; } catch (e6) {}
            try { if (dlg && dlg.update) dlg.update(); } catch (e7) {}
        };

        try { dlg.layout.layout(true); } catch (eLayout) {}
        try { dlg.center(); } catch (eCenter) {}
        dlg.show();
    } catch (e) {
        try {
            alert(
                "These number counters require the Modern JavaScript Expression Engine.\n\n" +
                "Enable it here:\n" +
                "After Effects → Settings (or Preferences) → Scripting & Expressions → Expression Engine → JavaScript\n\n" +
                "You must restart After Effects before using this counter."
            );
        } catch (e2) {}
    }
}

function _stEnsureModernExpressionsForCounters(comp) {
    if (_stIsModernExpressionEngine(comp)) return true;

    _stShowModernExpressionWarningDialog();
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
            var root = _stGetSharedRootFolder();
            var base = root.fsName + "/presets/text/";
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
                textAcc.defineSection(ST_LABELS.UTILITIES, function(body){
                    addGrid2(body, [
                        {
                            text: "TEXT BOX",
                            helpTip: "Creates a Text Box (text + auto-sizing shape).",
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
                        },
                        {
                            text: "ANIMATE TEXT BOX",
                            helpTip: "With the TEXT BOX shape layer selected: Toggle Animate % keyframes (0→100 over 30f).",
                            onClick: function(){
                                try {
                                    if ($.global && $.global.ShineTools && $.global.ShineTools.TextBox && $.global.ShineTools.TextBox.toggleAnimateKeys) {
                                        $.global.ShineTools.TextBox.toggleAnimateKeys(30);
                                    } else {
                                        alert("TEXT BOX module not initialized.");
                                    }
                                } catch (eTB2) {
                                    alert("TEXT BOX ANIMATE error:\n" + eTB2.toString());
                                }
                            }
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

// Build accordion in current live session order
                textAcc.build();
                // TEXT tab footer removed: an older footer instance was visually overlapping
                // the bottom of the section area in the docked TEXT tab.
            } catch (eBT) {
                alert("TEXT tab build error:\n\n" + eBT.toString());
            }

        }
var textAcc = null;
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

        function _stRefreshWorkspaceManagerSurface() {
            try {
                try { if (pal.__stWorkspaceManagerRoot && pal.__stWorkspaceManagerRoot.layout) pal.__stWorkspaceManagerRoot.layout.layout(true); } catch (e0) {}
                try { if (tabWorkspaceManager && tabWorkspaceManager.layout) tabWorkspaceManager.layout.layout(true); } catch (e1) {}
                try { if (pal && pal.update) pal.update(); } catch (e3) {}
            } catch (e) {}
        }

        function _stCommitWorkspaceSelectionUI(name, options) {
            try {
                var wanted = String(name || "").replace(/^\s+|\s+$/g, "");
                if (!wanted) return;

                try { pal.__stCurrentWorkspaceName = wanted; } catch (e0) {}
                try { pal.__stPendingWorkspaceName = wanted; } catch (e1) {}
                try { pal.__stWorkspaceStatusName = wanted; } catch (e2) {}

                try { _syncWorkspaceDropdownToActiveName(); } catch (e3) {}
                try { _updateWorkspaceStatusLabel({ suppressLayout: true }); } catch (e4) {}

                // One shared refresh path only.
                try { _stRefreshWorkspaceManagerSurface(); } catch (e5) {}
                try { if (!(options && options.skipUpdate) && pal && pal.update) pal.update(); } catch (e6) {}
            } catch (e) {}
        }

        function _stSetActiveWorkspaceNameState(name, options) {
            try {
                var wanted = String(name || "").replace(/^\s+|\s+$/g, "");
                try { pal.__stCurrentWorkspaceName = wanted; } catch (e0) {}
                try { pal.__stPendingWorkspaceName = wanted; } catch (e1) {}
                try { pal.__stStartupAppliedWorkspaceName = wanted; } catch (e2) {}
                try { pal.__stWorkspaceStatusName = wanted; } catch (e3) {}
                try {
                    if (!(options && options.skipPersist)) _stWriteLastUsedWorkspaceName(wanted);
                } catch (e4) {}
            } catch (e) {}
        }

        function _stApplyWorkspaceStatusText(name) {
            try {
                var wanted = String(name || "").replace(/^\s+|\s+$/g, "");
                var statusText = wanted ? ("Workspace: " + wanted) : "Workspace:";
                try { if (pal.__stWorkspaceStatusNameLabel_MAIN) pal.__stWorkspaceStatusNameLabel_MAIN.text = statusText; } catch (e0) {}
                try { if (pal.__stWorkspaceStatusNameLabel_TEXT) pal.__stWorkspaceStatusNameLabel_TEXT.text = statusText; } catch (e1) {}
                try { if (pal.__stWorkspaceStatusNameLabel) pal.__stWorkspaceStatusNameLabel.text = statusText; } catch (e2) {}
                return statusText;
            } catch (e) {}
            return "Workspace:";
        }

        function _stPublishWorkspaceApi() {
            try {
                ST.Workspaces = ST.Workspaces || {};
                ST.Workspaces.folder = _stWorkspaceFolder;
                ST.Workspaces.fileByName = _stWorkspaceFileByName;
                ST.Workspaces.list = _stListWorkspaceNames;
                ST.Workspaces.capture = _stCaptureWorkspaceState;
                ST.Workspaces.apply = _stApplyWorkspaceState;
                ST.Workspaces.read = _stReadWorkspaceByName;
                ST.Workspaces.load = _stLoadWorkspaceByName;
                ST.Workspaces.save = _stSaveWorkspaceByName;
                ST.Workspaces.remove = _stDeleteWorkspaceByName;
                ST.Workspaces.importJson = _stImportWorkspaceFromJsonFile;
                ST.Workspaces.revealInFinder = _stRevealWorkspaceInFinder;
                ST.Workspaces.syncStatus = _updateWorkspaceStatusLabel;
                ST.Workspaces.setActiveNameState = _stSetActiveWorkspaceNameState;
                ST.Workspaces.applyStatusText = _stApplyWorkspaceStatusText;
            } catch (e) {}
        }

        function _stRefreshWorkspaceApplySurface() {
            try {
                try { if (tabMain && tabMain.layout) tabMain.layout.layout(true); } catch (e0) {}
                try { if (tabText && tabText.layout) tabText.layout.layout(true); } catch (e1) {}
                try { if (pal && pal.update) pal.update(); } catch (e3) {}
            } catch (e) {}
        }

        function _stSettleWorkspaceManagerInitialWidths() {
            try {
                // Only touch the visible workspace-manager surface.
                try { if (pal.__stWorkspaceManagerRoot && pal.__stWorkspaceManagerRoot.layout) pal.__stWorkspaceManagerRoot.layout.layout(true); } catch (e0) {}
                try { if (tabWorkspaceManager && tabWorkspaceManager.layout) tabWorkspaceManager.layout.layout(true); } catch (e1) {}
                try { if (tabWorkspaceManager && tabWorkspaceManager.layout) tabWorkspaceManager.layout.resize(); } catch (e2) {}
                try { if (pal.__stWorkspaceManagerRoot && pal.__stWorkspaceManagerRoot.layout) pal.__stWorkspaceManagerRoot.layout.layout(true); } catch (e3) {}
                try { if (pal && pal.update) pal.update(); } catch (e4) {}
            } catch (e) {}
        }

        function _selectTopTab(which) {
            try { pal.__activeTopTab = which; } catch(eAT) {}
            var isMain = (which === "MAIN");
            var isText = (which === "TEXT");
            var isUpdates = (which === "UPDATES");
            var isRequests = (which === "REQUESTS");
            var isHelp = (which === "HELP");
            var isWorkspaceManager = (which === "WORKSPACE_MANAGER");
            tabMain.visible = isMain;
            tabText.visible = isText;
            tabUpdates.visible = isUpdates;
            tabRequests.visible = isRequests;
            tabHelp.visible = isHelp;
            tabWorkspaceManager.visible = isWorkspaceManager;
            try { topMetaRow.visible = false; } catch (eWSVis) {}
            // Refresh Previous Computer label when Help tab becomes visible
            if (isHelp) {
                try { if ($.global.__ST_PrevComputerUI && $.global.__ST_PrevComputerUI.refresh) { $.global.__ST_PrevComputerUI.refresh(); } } catch (ePH) {}
            }
// Build heavy tabs on first use
            if (isText) { try { _buildTextTabIfNeeded(); } catch (eBT) {} }

            _setTopTabLabelColor(tabLblMain, isMain ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            _setTopTabLabelColor(tabLblText, isText ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            _setTopTabLabelColor(tabLblUpdates, isUpdates ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            _setTopTabLabelColor(tabLblRequests, isRequests ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            _setTopTabLabelColor(tabLblHelp, isHelp ? TAB_LABEL_ACTIVE : TAB_LABEL_IDLE);
            try {
                if (_topTabs && _topTabs.setNativeTabUnderline) {
                    _topTabs.setNativeTabUnderline(isText ? "TEXT" : (isUpdates ? "UPDATES" : (isRequests ? "REQUESTS" : (isHelp ? "HELP" : "MAIN"))));
                }
            } catch (eNU) {}
// Native underline is text-based.

            // Keep logo headers centered during tab changes too,
            // not just after deferred resize settles.
            try { if ($.global.__ShineToolsCenterLogoHeaders__) $.global.__ShineToolsCenterLogoHeaders__(); } catch (eLogoTab0) {}

            // Ultra-light tab switching:
            // Avoid full relayout on every switch (it can be very slow on large panels).
            // Do ONE settling layout the first time only; after that, do a lightweight
            // immediate resize pass so centered headers do not snap left while the tab changes.
            if (isWorkspaceManager) {
                try { _stRefreshWorkspaceManagerSurface(); } catch (e2w0) {}
                return;
            }

            if (!pal.__didInitialTabLayout) {
                pal.__didInitialTabLayout = true;
                try { pal.layout.layout(true); } catch (e1) {}
                try { if ($.global.__ShineToolsCenterLogoHeaders__) $.global.__ShineToolsCenterLogoHeaders__(); } catch (eLogoTab1) {}
            } else {
                try { pal.layout.resize(); } catch (e1b) {}
                try { if ($.global.__ShineToolsCenterLogoHeaders__) $.global.__ShineToolsCenterLogoHeaders__(); } catch (eLogoTab1b) {}
            }
            try { pal.update(); } catch (e2) {}
            try { if ($.global.__ShineToolsCenterLogoHeaders__) $.global.__ShineToolsCenterLogoHeaders__(); } catch (eLogoTab2) {}
            try { if (pal && pal.update) pal.update(); } catch (e2b) {}
            try { _stKickFooterStableLayout(); } catch (e3) {}
        }

        try {
            tabLblMain.addEventListener("mousedown", function(){
                var ks = null; try { ks = ScriptUI.environment.keyboardState; } catch (eKS0) {}
                if (ks && ks.altKey) {
                    try { if (mainAcc && mainAcc.showReorderSectionsDialog) mainAcc.showReorderSectionsDialog("Reorder Main Sections"); } catch (eRM) { alert("Reorder failed: " + String(eRM)); }
                    return;
                }
                _selectTopTab("MAIN");
            });
            tabLblText.addEventListener("mousedown", function(){
                var ks = null; try { ks = ScriptUI.environment.keyboardState; } catch (eKS1) {}
                if (ks && ks.altKey) {
                    try { _buildTextTabIfNeeded(); } catch (eBT2) {}
                    try { if (textAcc && textAcc.showReorderSectionsDialog) textAcc.showReorderSectionsDialog("Reorder Text Sections"); } catch (eRT) { alert("Reorder failed: " + String(eRT)); }
                    return;
                }
                _selectTopTab("TEXT");
            });
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
        tabUpdates.margins       = ST_CONST.COLORS.TRANSPARENT_RGBA;
        tabUpdates.spacing       = 0;

        tabRequests.orientation   = "column";
        tabRequests.alignChildren = ["fill", "top"];
        tabRequests.margins       = ST_CONST.COLORS.TRANSPARENT_RGBA;
        tabRequests.spacing       = 0;

        tabHelp.orientation   = "column";
        tabHelp.alignChildren = ["fill", "top"];
        tabHelp.margins       = 12;
        tabHelp.spacing       = 4;

        tabWorkspaceManager.orientation   = "column";
        tabWorkspaceManager.alignChildren = ["fill", "fill"];
        tabWorkspaceManager.margins       = 0;
        tabWorkspaceManager.spacing       = 0;

        try { pal.__stWorkspaceReturnTab = "MAIN"; } catch (eWRT0) {}

        function _stWorkspaceFolder() {
            try {
                var root = new Folder("~/Documents/ShineTools");
                if (!root.exists) try { root.create(); } catch (e0) {}
                var ws = new Folder("~/Documents/ShineTools/Workspaces");
                if (!ws.exists) try { ws.create(); } catch (e1) {}
                return ws;
            } catch (e) {}
            return new Folder("~/Documents/ShineTools/Workspaces");
        }

        function _stWorkspaceFileByName(name) {
            try {
                name = String(name || "").replace(/^\s+|\s+$/g, "");
                if (!name) return null;
                name = name.replace(/[\\\/:*?"<>|]/g, "_");
                return new File(_stWorkspaceFolder().fsName + "/" + name + ".json");
            } catch (e) {}
            return null;
        }

        function _stDefaultWorkspaceName() {
            return "Default";
        }

        function _stIsProtectedWorkspaceName(name) {
            try {
                return String(name || "").replace(/^\s+|\s+$/g, "") === _stDefaultWorkspaceName();
            } catch (e) {}
            return false;
        }

        function _stApplyFactoryDefaultButtonOrder(data) {
            try {
                if (!data || typeof data !== "object") data = {};
                if (!data.buttonOrderMain || typeof data.buttonOrderMain !== "object") data.buttonOrderMain = {};

                // Default workspace factory order for the split-button layout.
                // This is applied only to the protected Default workspace so older
                // Default.json files do not keep stale button ordering.
                data.mainSectionOrder = [
                    "ADD LAYER",
                    "ADD RIG",
                    "ADD EXPRESSION",
                    ST_LABELS.UTILITIES,
                    "STROKE",
                    "TIMELINE",
                    "CLEAN UP",
                    "RENDER"
                ];

                data.buttonOrderMain["ADD EXPRESSION"] = [
                    "WIGGLE",
                    "INERTIAL BOUNCE",
                    "HARD BOUNCE"
                ];

                data.buttonOrderMain["STROKE"] = [
                    "ANIMATED STROKE",
                    "ANIMATE STROKE START",
                    "TRIM PATHS"
                ];

                data.buttonOrderMain["TIMELINE"] = [
                    "EXTEND PRECOMP",
                    "TRIM LAYER ABOVE",
                    "FRAME OFFSET",
                    "TRIM LAYER BELOW",
                    "CURVE OFFSET"
                ];
            } catch (e) {}
            return data;
        }

        function _stRevealWorkspaceInFinder(name) {
            try {
                var target = null;
                try {
                    var cleanName = String(name || "").replace(/^\s+|\s+$/g, "");
                    if (cleanName) {
                        var workspaceFile = _stWorkspaceFileByName(cleanName);
                        if (workspaceFile && workspaceFile.exists) target = workspaceFile;
                    }
                } catch (e0) {}

                if (!target) {
                    try { target = _stWorkspaceFolder(); } catch (e1) { target = null; }
                }
                if (!target) return false;

                var osStr = "";
                try { osStr = String($.os || "").toLowerCase(); } catch (e2) { osStr = ""; }

                if (osStr.indexOf("mac") !== -1) {
                    try {
                        if (target instanceof File) {
                            system.callSystem('open -R "' + String(target.fsName || "").replace(/"/g, '\\"') + '"');
                        } else {
                            system.callSystem('open "' + String(target.fsName || "").replace(/"/g, '\\"') + '"');
                        }
                        return true;
                    } catch (e3) {}
                }

                try { target.execute(); return true; } catch (e4) {}
            } catch (e) {
                try { alert("Could not reveal workspace in Finder:\n" + String(e)); } catch (eAlert) {}
            }
            return false;
        }

        function _stCloneSimple(v) {
            try { return _stJsonParse(_stJsonStringify(v)); } catch (e) {}
            return v;
        }

        function _stListWorkspaceNames() {
            var out = [];
            try {
                var dir = _stWorkspaceFolder();
                if (!dir || !dir.exists) return out;
                var files = dir.getFiles("*.json");
                for (var i = 0; i < files.length; i++) {
                    try {
                        var f = files[i];
                        if (!(f instanceof File)) continue;
                        var n = String(f.name || "");
                        n = n.replace(/\.json$/i, "");
                        if (n) out.push(n);
                    } catch (e1) {}
                }
                out.sort();
            } catch (e) {}
            return out;
        }

        function _stCaptureWorkspaceState() {
            var data = {
                format: "ShineToolsWorkspace",
                version: 1,
                savedAt: (new Date()).toString(),
                mainSectionOrder: [],
                textSectionOrder: [],
                mainCollapsed: {},
                textCollapsed: {},
                buttonOrderMain: {},
                buttonOrderText: {},
                favoritesMain: [],
                favoritesText: [],
                textBundledOrder: [],
                textUnifiedOrder: [],
                textLabelMap: {}
            };
            try { if (pal.__stMainAccordion && pal.__stMainAccordion.getOrder) data.mainSectionOrder = pal.__stMainAccordion.getOrder(); } catch (e0) {}
            try { if (pal.__stTextAccordion && pal.__stTextAccordion.getOrder) data.textSectionOrder = pal.__stTextAccordion.getOrder(); } catch (e1) {}
            try { if (pal.__stMainAccordion && pal.__stMainAccordion.getCollapsedMap) data.mainCollapsed = pal.__stMainAccordion.getCollapsedMap(); } catch (e2) {}
            try { if (pal.__stTextAccordion && pal.__stTextAccordion.getCollapsedMap) data.textCollapsed = pal.__stTextAccordion.getCollapsedMap(); } catch (e3) {}
            try {
                if (__ST_SECTION_BUTTONS && __ST_SECTION_BUTTONS["MAIN_UI"]) data.buttonOrderMain = _stCloneSimple(__ST_SECTION_BUTTONS["MAIN_UI"]) || {};
                if (__ST_SECTION_BUTTONS && __ST_SECTION_BUTTONS["TEXT_UI"]) data.buttonOrderText = _stCloneSimple(__ST_SECTION_BUTTONS["TEXT_UI"]) || {};
            } catch (e4) {}
            try { data.favoritesMain = favLoad(); } catch (e5) {}
            try { data.favoritesText = animLoad(); } catch (e6) {}
            try { data.textBundledOrder = animBundledOrderLoad(); } catch (e7) {}
            try { data.textUnifiedOrder = animUnifiedOrderLoad(); } catch (e8) {}
            try { data.textLabelMap = _animLabelMapLoad(); } catch (e9) {}
            return data;
        }

        function _stApplyWorkspaceState(data) {
            try { if (!data) return false; } catch (e0) {}
            try {
                __ST_SECTION_BUTTONS = __ST_SECTION_BUTTONS || {};
                __ST_SECTION_BUTTONS["MAIN_UI"] = _stCloneSimple(data.buttonOrderMain || {}) || {};
                __ST_SECTION_BUTTONS["TEXT_UI"] = _stCloneSimple(data.buttonOrderText || {}) || {};
            } catch (e1) {}

            try { favSave((data.favoritesMain && data.favoritesMain.slice) ? data.favoritesMain.slice(0) : []); } catch (e2) {}
            try { animSave((data.favoritesText && data.favoritesText.slice) ? data.favoritesText.slice(0) : []); } catch (e3) {}
            try { animBundledOrderSave((data.textBundledOrder && data.textBundledOrder.slice) ? data.textBundledOrder.slice(0) : []); } catch (e4) {}
            try { animUnifiedOrderSave((data.textUnifiedOrder && data.textUnifiedOrder.slice) ? data.textUnifiedOrder.slice(0) : []); } catch (e4u) {}
            try { _animLabelMapReplace(data.textLabelMap || {}); } catch (e4m) {}
            try { if (pal.__stFavRebuildDropdown) pal.__stFavRebuildDropdown(); } catch (e4a) {}
            try { if (pal.__stAnimRebuildDropdown) pal.__stAnimRebuildDropdown(); } catch (e4b) {}

            try {
                if (pal.__stMainAccordion) {
                    if (data.mainSectionOrder && data.mainSectionOrder.slice) pal.__stMainAccordion.setOrder(data.mainSectionOrder.slice(0));
                    if (data.mainCollapsed) pal.__stMainAccordion.setCollapsedMap(data.mainCollapsed);
                }
            } catch (e5) {}
            try {
                if (pal.__stTextAccordion) {
                    if (data.textSectionOrder && data.textSectionOrder.slice) pal.__stTextAccordion.setOrder(data.textSectionOrder.slice(0));
                    if (data.textCollapsed) pal.__stTextAccordion.setCollapsedMap(data.textCollapsed);
                }
            } catch (e6) {}

            try { _stRefreshWorkspaceApplySurface(); } catch (e7) {}
            try { if (pal && pal.update) pal.update(); } catch (e9) {}
            return true;
        }

        function _stEnsureDefaultWorkspaceExists(seedPayload) {
            try {
                var name = _stDefaultWorkspaceName();
                var f = _stWorkspaceFileByName(name);
                if (!f) return false;
                if (f.exists) return true;

                var payload = null;
                try { payload = seedPayload ? _stCloneSimple(seedPayload) : null; } catch (e0) { payload = null; }
                if (!payload) {
                    try { payload = _stCaptureWorkspaceState(); } catch (e1) { payload = null; }
                }
                if (!payload || typeof payload !== "object") payload = {};
                try { payload.name = name; } catch (e2) {}
                try { if (!payload.format) payload.format = "ShineToolsWorkspace"; } catch (e3) {}
                try { if (!payload.version) payload.version = 1; } catch (e4) {}
                try { payload.savedAt = (new Date()).toString(); } catch (e5) {}
                try { payload = _stApplyFactoryDefaultButtonOrder(payload); } catch (e6) {}

                return _stSaveWorkspaceByName(name, payload, { silent: true, skipActiveState: true, allowProtectedOverwrite: true });
            } catch (e) {}
            return false;
        }

        function _stReadWorkspaceByName(name) {
            var f = null;
            try {
                f = _stWorkspaceFileByName(name);
                if (!f || !f.exists) return null;
                f.encoding = "UTF-8";
                if (!f.open("r")) return null;
                var raw = f.read();
                f.close();
                return _stJsonParse(raw);
            } catch (e) {
                try { if (f && f.opened) f.close(); } catch (e2) {}
            }
            return null;
        }

        
        function _stWorkspaceJsonOpenFilter(item) {
            // File.openDialog on macOS needs a FILE dialog, not Folder.selectDialog.
            // Returning true for folders lets the user navigate; .json files stay selectable.
            try {
                if (item instanceof Folder) return true;
                if (item instanceof File) return (/\.json$/i).test(String(item.name || ""));
            } catch (e) {}
            return true;
        }

        function _stOpenWorkspaceJsonFile() {
            var picked = null;
            return $.global.__ST_withModalSafety__(function(){
                try {
                    var startFolder = null;
                    try { startFolder = _stWorkspaceFolder(); } catch (eStart) { startFolder = null; }
                    if (startFolder && startFolder.exists) {
                        try { Folder.current = startFolder; } catch (eCur) {}
                        var seed = new File(startFolder.fsName + "/");
                        picked = seed.openDlg("Load Workspace JSON", _stWorkspaceJsonOpenFilter, false);
                    } else {
                        picked = File.openDialog("Load Workspace JSON", _stWorkspaceJsonOpenFilter, false);
                    }
                } catch (ePick) {
                    try { picked = File.openDialog("Load Workspace JSON", _stWorkspaceJsonOpenFilter, false); } catch (eFallback) { picked = null; }
                }
                return picked;
            });
        }

        function _stImportWorkspaceFromJsonFile() {
            var f = null;
            try {
                // IMPORTANT: use a File.openDialog-compatible picker here.
                // The previous code called Folder.selectDialog through __ST_selectDialogSafe__,
                // which made .json files appear greyed out in Finder.
                f = _stOpenWorkspaceJsonFile();
                if (!f) return false;

                f = File(f);
                if (!f.exists) { alert("Selected workspace file could not be found."); return false; }

                var raw = "";
                try {
                    f.encoding = "UTF-8";
                    if (!f.open("r")) { alert("Could not open workspace file."); return false; }
                    raw = String(f.read() || "");
                    f.close();
                } catch (eRead) {
                    try { if (f && f.opened) f.close(); } catch (eRead2) {}
                    alert("Could not read workspace file.");
                    return false;
                }

                var data = null;
                try { data = _stJsonParse(raw); } catch (eParse0) { data = null; }
                if (!data || typeof data !== "object") {
                    alert("That file does not appear to be a valid workspace JSON.");
                    return false;
                }

                var defaultName = "";
                try { defaultName = String(data.name || ""); } catch (eName0) { defaultName = ""; }
                defaultName = defaultName.replace(/^\s+|\s+$/g, "");
                if (!defaultName) {
                    try { defaultName = String(f.displayName || f.name || "Imported Workspace"); } catch (eName1) { defaultName = "Imported Workspace"; }
                    defaultName = defaultName.replace(/\.json$/i, "").replace(/^\s+|\s+$/g, "");
                }
                if (!defaultName) defaultName = "Imported Workspace";

                var name = "";
                try { name = __ST_promptSafe__("Load workspace as:", defaultName); } catch (ePrompt0) { name = prompt("Load workspace as:", defaultName); }
                if (name === null || name === undefined) return false;

                name = String(name || "").replace(/^\s+|\s+$/g, "");
                if (!name) { alert("Workspace name cannot be blank."); return false; }

                var existing = null;
                try { existing = _stReadWorkspaceByName(name); } catch (eExisting) { existing = null; }
                if (existing) {
                    if (_stIsProtectedWorkspaceName(name)) {
                        alert("The Default workspace cannot be overwritten.");
                        return false;
                    }
                    var okOverwrite = false;
                    try { okOverwrite = __ST_confirmSafe__("Overwrite workspace \"" + name + "\"?"); } catch (eConf0) { okOverwrite = confirm("Overwrite workspace \"" + name + "\"?"); }
                    if (!okOverwrite) return false;
                }

                try { data.name = name; } catch (eSetName) {}
                if (!_stSaveWorkspaceByName(name, data)) {
                    alert("Could not save imported workspace.");
                    return false;
                }

                try { pal.__stCurrentWorkspaceName = name; } catch (e3a) {}
                try { pal.__stPendingWorkspaceName = name; } catch (e3b) {}
                try { pal.__stStartupAppliedWorkspaceName = name; } catch (e3c) {}
                try { pal.__stWorkspaceStatusName = name; } catch (e3d) {}
                try { _stWriteLastUsedWorkspaceName(name); } catch (e3e) {}
                try { _wmRefreshDropdown(name); } catch (e3f) {}
                try {
                    if (wmDropdown && wmDropdown.selection && String(wmDropdown.selection.text || "") === name) {
                        if (wmDropdown.onChange) wmDropdown.onChange();
                    } else {
                        _stLoadWorkspaceByName(name, { syncDropdown: false });
                    }
                } catch (e3g) {
                    try { _stLoadWorkspaceByName(name, { syncDropdown: false }); } catch (e3h) {}
                }
                try { _updateWorkspaceStatusLabel({ suppressLayout: true }); } catch (e3i) {}
                return true;
            } catch (eImport) {
                alert("Load Workspace failed: " + String(eImport));
            }
            return false;
        }

function _stLockFooterDuringWorkspaceSwitch() {
            var __unlock = function () {};
            try {
                var fg = null;
                try { fg = pal.__stFooterGroup || null; } catch (e0) { fg = null; }
                if (!fg) return __unlock;

                var oldMin = null, oldMax = null, oldPref = null, oldAlign = null;
                try { oldMin = fg.minimumSize ? [fg.minimumSize[0], fg.minimumSize[1]] : null; } catch (e1) {}
                try { oldMax = fg.maximumSize ? [fg.maximumSize[0], fg.maximumSize[1]] : null; } catch (e2) {}
                try { oldPref = fg.preferredSize ? [fg.preferredSize[0], fg.preferredSize[1]] : null; } catch (e3) {}
                try { oldAlign = fg.alignment ? [fg.alignment[0], fg.alignment[1]] : null; } catch (e4) {}

                var h = 0;
                try {
                    if (fg.size && fg.size[1] && fg.size[1] > 0) h = fg.size[1];
                } catch (e5) {}
                try {
                    if (!h && fg.bounds) h = Math.max(0, fg.bounds.bottom - fg.bounds.top);
                } catch (e6) {}
                if (!h) h = 38;

                try { fg.minimumSize = [0, h]; } catch (e7) {}
                try { fg.maximumSize = [10000, h]; } catch (e8) {}
                try { fg.preferredSize = [-1, h]; } catch (e9) {}
                try { fg.alignment = ["fill", "bottom"]; } catch (e10) {}

                __unlock = function () {
                    try { if (oldMin) fg.minimumSize = oldMin; } catch (u1) {}
                    try { if (oldMax) fg.maximumSize = oldMax; } catch (u2) {}
                    try { if (oldPref) fg.preferredSize = oldPref; } catch (u3) {}
                    try { if (oldAlign) fg.alignment = oldAlign; } catch (u4) {}
                };
            } catch (e) {}
            return __unlock;
        }


function _stSettleProtectedDefaultWorkspaceLayoutNow() {
            // ALL_WORKSPACES_CLIP_FIX_2026-05-05:
            // Any workspace can rebuild/reorder accordions or lazy-build newly expanded sections.
            // Give the affected workspace tab areas one contained, synchronous layout pass.
            // Do NOT use app.scheduleTask here and do NOT kick a delayed full-panel startup settle.
            try {
                try { if ($.global.__ShineToolsClosing__ === true) return false; } catch (e0) {}
                try { if ($.global.__ST_isSafeToTouchUI__ && !$.global.__ST_isSafeToTouchUI__()) return false; } catch (e1) { return false; }

                var targets = [];
                try { if (pal && pal.__stMainAccordionHost) targets.push(pal.__stMainAccordionHost); } catch (e2a) {}
                try { if (pal && pal.__stMainContentRoot) targets.push(pal.__stMainContentRoot); } catch (e2b) {}
                try { if (pal && pal.__stMainTabRoot) targets.push(pal.__stMainTabRoot); } catch (e2c) {}
                try { if (pal && pal.__stTabMain) targets.push(pal.__stTabMain); } catch (e2d) {}
                try { if (pal && pal.__stTextAccordionHost) targets.push(pal.__stTextAccordionHost); } catch (e2e) {}
                try { if (pal && pal.__stTextContentRoot) targets.push(pal.__stTextContentRoot); } catch (e2f) {}
                try { if (pal && pal.__stTextTabRoot) targets.push(pal.__stTextTabRoot); } catch (e2g) {}
                try { if (pal && pal.__stTabText) targets.push(pal.__stTabText); } catch (e2h) {}

                for (var i = 0; i < targets.length; i++) {
                    try {
                        var g = targets[i];
                        if (!g || !g.layout) continue;
                        try { g.layout.layout(true); } catch (eL1) {}
                        try { g.layout.resize(); } catch (eL2) {}
                    } catch (eEach) {}
                }

                // Paint only. Avoid pal.layout.layout(true) / pal.layout.resize() here.
                try { if (pal && pal.update) pal.update(); } catch (eUpd) {}
                return true;
            } catch (e) {}
            return false;
        }

function _stLoadWorkspaceByName(name, options) {
            try {
                var wanted = String(name || "").replace(/^\s+|\s+$/g, "");
                if (!wanted) return false;

                var data = null;
                try { data = _stReadWorkspaceByName(wanted); } catch (e0) { data = null; }
                if (!data) return false;

                var __stUnlockFooter = function () {};
                try { __stUnlockFooter = _stLockFooterDuringWorkspaceSwitch(); } catch (e0a) {}

                try { if (typeof _buildTextTabIfNeeded === "function") _buildTextTabIfNeeded(); } catch (e1) {}

                // Set active-name state immediately so the status line updates before the heavier workspace apply.
                try { _stSetActiveWorkspaceNameState(wanted); } catch (e2a) {}
                try { _stApplyWorkspaceStatusText(wanted); } catch (e2b) {}

                var __stProtectedDefaultLoad = false;
                try { __stProtectedDefaultLoad = _stIsProtectedWorkspaceName(wanted); } catch (eProtectedCheck) { __stProtectedDefaultLoad = false; }
                try { if (__stProtectedDefaultLoad) data = _stApplyFactoryDefaultButtonOrder(data); } catch (eDefaultOrder) {}
                try { _stApplyWorkspaceState(data); } catch (e3) {}
                try { _stSettleProtectedDefaultWorkspaceLayoutNow(); } catch (eWorkspaceLocalSettle) {}

                // Reassert active-name state in case the apply path touched any workspace/status variables.
                try { _stSetActiveWorkspaceNameState(wanted); } catch (e4a) {}
                try { _stApplyWorkspaceStatusText(wanted); } catch (e4b) {}

                try {
                    if (options && options.syncDropdown && typeof _wmRefreshDropdown === "function") {
                        _wmRefreshDropdown(wanted);
                    }
                } catch (e5) {}

                // Only sync the dropdown when explicitly needed; onChange already has the correct selection.
                try {
                    if (options && options.syncDropdown) _syncWorkspaceDropdownToActiveName();
                } catch (e6) {}

                try { _updateWorkspaceStatusLabel({ suppressLayout: true }); } catch (e7) {}

                // Keep redraws minimal to avoid the visible "jump" after workspace switches.
                // Refresh the manager surface only; avoid a second footer/apply-surface settle here.
                try { _stRefreshWorkspaceManagerSurface(); } catch (e8a) {}
                try { if (pal.update) pal.update(); } catch (e10) {}
                // Docked AE panels sometimes report their final bounds one tick after a workspace loads.
                // Queue a one-shot settle pass so Default/workspace accordions do not clip until the user resizes.
                try { if ($.global.__ShineToolsQueueLayoutSettle__) $.global.__ShineToolsQueueLayoutSettle__(120); } catch (eSettleWS) {}
                return true;
            } catch (e11) {}
            return false;
        }
        function _stSaveWorkspaceByName(name, explicitPayload, options) {
            var f = null;
            try {
                name = String(name || "").replace(/^\s+|\s+$/g, "");
                if (!name) return false;
                options = options || {};
                if (_stIsProtectedWorkspaceName(name) && !options.allowProtectedOverwrite) return false;

                f = _stWorkspaceFileByName(name);
                if (!f) return false;
                var payload = explicitPayload ? _stCloneSimple(explicitPayload) : _stCaptureWorkspaceState();
                if (!payload || typeof payload !== "object") payload = {};
                payload.name = String(name || "");
                var raw = _stJsonStringify(payload);
                f.encoding = "UTF-8";
                if (!f.open("w")) return false;
                f.write(raw);
                f.close();
                if (!options.skipActiveState) {
                    try { pal.__stCurrentWorkspaceName = String(name || ""); } catch (e0) {}
                    try { pal.__stPendingWorkspaceName = String(name || ""); } catch (e0a) {}
                    try { pal.__stWorkspaceStatusName = String(name || ""); } catch (e0b) {}
                    try { _updateWorkspaceStatusLabel({ suppressLayout: true }); } catch (eUpd) {}
                }
                return true;
            } catch (e) {
                try { if (f && f.opened) f.close(); } catch (e2) {}
                if (!(options && options.silent)) {
                    alert("Could not save workspace:\n" + String(e));
                }
            }
            return false;
        }
        function _stDeleteWorkspaceByName(name) {
            try {
                name = String(name || "").replace(/^\s+|\s+$/g, "");
                if (!name || _stIsProtectedWorkspaceName(name)) return false;
                var f = _stWorkspaceFileByName(name);
                if (!f || !f.exists) return false;
                return !!f.remove();
            } catch (e) {
                alert("Could not delete workspace:\n" + String(e));
            }
            return false;
        }

        try { _stPublishWorkspaceApi(); } catch (ePublishWS) {}

        function _openWorkspaceManager(fromTabName) {
            try { pal.__stWorkspaceReturnTab = String(fromTabName || pal.__activeTopTab || "MAIN"); } catch (e0) {}
            try { pal.__stPendingWorkspaceName = String(pal.__stCurrentWorkspaceName || pal.__stPendingWorkspaceName || ""); } catch (e0a) {}
            try {
                if (!pal.__stWorkspaceManagerBuilt) _buildWorkspaceManagerShell();
            } catch (e1) { try { alert("Workspace Manager build error:\n" + String(e1)); } catch (e1a) {} return; }
            try { _syncWorkspaceDropdownToActiveName(); } catch (e1b) {}
            try { if (pal.__stWorkspaceManagerUpdateActionStates) pal.__stWorkspaceManagerUpdateActionStates(); } catch (e1c) {}
            try { _selectTopTab("WORKSPACE_MANAGER"); } catch (e2) {}
            try { _stCommitWorkspaceSelectionUI(pal.__stCurrentWorkspaceName || pal.__stPendingWorkspaceName || "", { skipUpdate: true }); } catch (e2a) {}
            try { _stSettleWorkspaceManagerInitialWidths(); } catch (e3) {}
            try { if (pal.update) pal.update(); } catch (e4) {}
        }

        function _closeWorkspaceManager() {
            var target = "MAIN";
            try { target = String(pal.__stWorkspaceReturnTab || "MAIN"); } catch (e0) {}
            if (target !== "TEXT") target = "MAIN";
            try { _selectTopTab(target); } catch (e1) { try { _selectTopTab("MAIN"); } catch (e2) {} }
            try { _updateWorkspaceStatusLabel({ suppressLayout: true }); } catch (e0a) {}
        }

        function _makeMiniWorkspaceButton(parent, label, width, helpTip, onActivate) {
            if (!parent) return null;

            var __isWorkspaceLauncher = (String(label || "") === ">");
            var h = __isWorkspaceLauncher ? 20 : 24;
            var w = __isWorkspaceLauncher ? 20 : width;

            var wrap = parent.add("group");
            wrap.orientation   = "stack";
            wrap.alignChildren = ["fill", "fill"];
            wrap.alignment     = ["right", "center"];
            wrap.margins       = 0;
            wrap.spacing       = 0;
            try { wrap.minimumSize = [w, h]; } catch (eW0) {}
            try { wrap.maximumSize = [w, h]; } catch (eW1) {}
            try { wrap.preferredSize = [w, h]; } catch (eW2) {}

            var btnLabel = __isWorkspaceLauncher ? "\u25B6" : label;
            var btn = wrap.add("button", undefined, btnLabel);
            btn.alignment     = ["fill", "fill"];
            try { btn.minimumSize = [w, h]; } catch (eB0) {}
            try { btn.maximumSize = [w, h]; } catch (eB1) {}
            try { btn.preferredSize = [w, h]; } catch (eB2) {}
            try { btn.helpTip = helpTip || ""; } catch (eTip0) {}
            try { defocusButtonBestEffort(btn); } catch (eDF) {}

            if (__isWorkspaceLauncher) {
                try { btn.text = "\u25B6"; } catch (eT0) {}
                try { btn.justify = "center"; } catch (eT1) {}
                try { btn.alignment = ["right", "center"]; } catch (eT2) {}
                try { btn.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 13); } catch (eT3) {}
            }

            btn.onClick = function () {
                try { btn.active = false; } catch (eA0) {}
                try { if (onActivate) onActivate(); } catch (eAct) { try { alert("Workspace Manager error:\n" + String(eAct)); } catch (eAA) {} }
                try { btn.active = false; } catch (eA1) {}
            };

            try { wrap.__label = btn; } catch (eL) {}
            try { wrap.__button = btn; } catch (eP) {}
            return wrap;
        }

        function _addWorkspaceLauncherRow(parent, sourceTabName) {
            if (!parent) return null;
            var lane = parent.add("group");
            lane.orientation   = "row";
            lane.alignChildren = ["right", "center"];
            lane.alignment     = ["fill", "top"];
            lane.margins       = [10, 6, 14, 0];
            lane.spacing       = 6;

            var spacer = lane.add("group");
            spacer.alignment   = ["fill", "fill"];
            spacer.minimumSize = [0, 0];
            spacer.maximumSize = [10000, 10000];

            var __statusSeedName = "";
            var __statusSeedHasWorkspaces = false;
            try {
                var __statusSeedNames = _stListWorkspaceNames();
                __statusSeedHasWorkspaces = !!(__statusSeedNames && __statusSeedNames.length);
            } catch (eLblSeedHas) { __statusSeedHasWorkspaces = false; }
            if (__statusSeedHasWorkspaces) {
                try { __statusSeedName = String(pal.__stWorkspaceStatusName || ""); } catch (eLblSeed0) {}
                try { if (!__statusSeedName) __statusSeedName = String(_stReadLastUsedWorkspaceName() || ""); } catch (eLblSeed1) {}
                try { if (!__statusSeedName) __statusSeedName = String(pal.__stCurrentWorkspaceName || pal.__stStartupAppliedWorkspaceName || pal.__stPendingWorkspaceName || ""); } catch (eLblSeed2) {}
            }

            var __statusSeedText = (__statusSeedName && String(__statusSeedName).replace(/^\s+|\s+$/g, "")) ? ("Workspace: " + __statusSeedName) : "Workspace:";
            var statusLbl = lane.add("statictext", undefined, __statusSeedText);
            statusLbl.alignment = ["right", "center"];
            try { statusLbl.justify = "right"; } catch (eLbl0) {}
            try { statusLbl.minimumSize = [0, 20]; } catch (eLbl1) {}
            try { statusLbl.maximumSize = [1000, 20]; } catch (eLbl2) {}
            try { statusLbl.characters = Math.max(12, Math.min(64, __statusSeedText.length + 1)); } catch (eLbl3) {}
            try { statusLbl.preferredSize = [Math.max(110, Math.min(1000, (__statusSeedText.length * 10) + 16)), 20]; } catch (eLbl4) {}
            try { _setShineYellowBold(statusLbl); } catch (eLbl5) {}

            try {
                if (!pal.__stWorkspaceStatusNameLabels) pal.__stWorkspaceStatusNameLabels = [];
                pal.__stWorkspaceStatusNameLabels.push(statusLbl);
                pal.__stWorkspaceStatusNameLabel = statusLbl;
                if (String(sourceTabName || "") === "TEXT") pal.__stWorkspaceStatusNameLabel_TEXT = statusLbl;
                else pal.__stWorkspaceStatusNameLabel_MAIN = statusLbl;
            } catch (eStore) {}

            try { _updateWorkspaceStatusLabel(); } catch (eSyncLbl) {}
            try { if (lane.layout) lane.layout.layout(true); } catch (eSyncLbl2) {}

            _makeMiniWorkspaceButton(
                lane,
                ">",
                26,
                "WORKSPACE MANAGER",
                function () { _openWorkspaceManager(sourceTabName || "MAIN"); }
            );

            return lane;
        }

        function _buildWorkspaceManagerShell() {
            try {
                if (pal.__stWorkspaceManagerBuilt && pal.__stWorkspaceManagerRoot) return true;
            } catch (eBuilt0) {}

            try {
                while (tabWorkspaceManager.children && tabWorkspaceManager.children.length) {
                    try { tabWorkspaceManager.remove(tabWorkspaceManager.children[0]); } catch (eRm) { break; }
                }
            } catch (e1) {}

            tabWorkspaceManager.orientation   = "column";
            tabWorkspaceManager.alignChildren = ["fill", "fill"];
            tabWorkspaceManager.alignment     = ["fill", "fill"];
            tabWorkspaceManager.margins       = 0;
            tabWorkspaceManager.spacing       = 0;

            var wmRoot = tabWorkspaceManager.add("group");
            wmRoot.orientation   = "column";
            wmRoot.alignChildren = ["fill", "top"];
            wmRoot.alignment     = ["fill", "fill"];
            wmRoot.margins       = [10, 18, 10, 10];
            wmRoot.spacing       = 8;

            var wmHeader = wmRoot.add("group");
            wmHeader.orientation   = "row";
            wmHeader.alignChildren = ["left", "center"];
            wmHeader.alignment     = ["fill", "top"];
            wmHeader.margins       = 0;
            wmHeader.spacing       = 8;

            var wmBackBtn = _makeMiniWorkspaceButton(
                wmHeader,
                "< BACK",
                86,
                "Back to previous tab",
                function () { _closeWorkspaceManager(); }
            );
            try { wmBackBtn.alignment = ["left", "center"]; } catch (eB0) {}
            try { wmBackBtn.minimumSize = [86, 24]; } catch (eB1) {}
            try { wmBackBtn.maximumSize = [86, 24]; } catch (eB2) {}
            try { wmBackBtn.preferredSize = [86, 24]; } catch (eB3) {}

            var wmTitle = wmHeader.add("statictext", undefined, "WORKSPACE MANAGER");
            try { _setShineYellowBold(wmTitle); } catch (e) {}
            try { wmTitle.graphics.foregroundColor = wmTitle.graphics.newPen(wmTitle.graphics.PenType.SOLID_COLOR, [1, 0.8, 0], 1); } catch (e2) {}
            try { _setShineYellowBold(wmTitle); } catch (e) {}
            try { wmTitle.alignment = ["left", "center"]; } catch (eT0) {}
            try { _setShineYellowBold(wmTitle); } catch (eT1) {}

            var wmSpacer = wmHeader.add("group");
            wmSpacer.alignment   = ["fill", "fill"];
            wmSpacer.minimumSize = [0, 0];
            wmSpacer.maximumSize = [10000, 10000];

            var wmHelpText = wmRoot.add("statictext", undefined,
                "Layout and Favorites changes are NOT saved automatically.\nAlways click \"Save Changes to This Workspace\" after making edits.",
                { multiline: true }
            );
            var wmHelpSpacer = wmRoot.add("group");
            wmHelpSpacer.minimumSize = [0, 8];
            wmHelpSpacer.maximumSize = [10000, 8];

            try { wmHelpText.alignment = ["fill", "top"]; } catch (eHT0) {}
            try { wmHelpText.characters = 48; } catch (eHT1) {}

            var wmBody = wmRoot.add("group");
            wmBody.orientation   = "column";
            wmBody.alignChildren = ["fill", "top"];
            wmBody.alignment     = ["fill", "fill"];
            wmBody.margins       = [0, 8, 0, 0];
            wmBody.spacing       = 10;

            var wmDropWrap = wmBody.add("group");
            wmDropWrap.orientation   = "row";
            wmDropWrap.alignChildren = ["left", "center"];
            wmDropWrap.alignment     = ["fill", "top"];
            wmDropWrap.margins       = 0;
            wmDropWrap.spacing       = 3;

            var wmDropLabel = wmDropWrap.add("statictext", undefined, "Workspace:");
            try { _setShineYellowBold(wmDropLabel); } catch (eL0) {}
            try { wmDropLabel.minimumSize = [78, 20]; } catch (eL1) {}
            try { wmDropLabel.maximumSize = [78, 20]; } catch (eL2) {}

            var wmDropdown = wmDropWrap.add("dropdownlist", undefined, []);
            wmDropdown.alignment = ["fill", "center"];
            try { wmDropdown.minimumSize = [220, 24]; } catch (eDD0) {}
            try { pal.__stWorkspaceDropdown = wmDropdown; } catch (eDD1) {}

            var wmBtns = wmBody.add("group");
            wmBtns.orientation   = "column";
            wmBtns.alignChildren = ["fill", "top"];
            wmBtns.alignment     = ["fill", "top"];
            wmBtns.margins       = 0;
            wmBtns.spacing       = 8;

            function _wmMakeActionButton(labelText, onClickFn) {
                var row = wmBtns.add("group");
                row.orientation   = "row";
                row.alignChildren = ["fill", "center"];
                row.alignment     = ["fill", "top"];
                row.margins       = 0;
                row.spacing       = 0;

                var b = row.add("button", undefined, labelText);
                b.alignment = ["fill", "center"];
                try { b.preferredSize.height = 24; } catch (eH) {}
                try { defocusButtonBestEffort(b); } catch (eDF) {}
                b.onClick = onClickFn;
                return b;
            }

            var btnSaveCurrent = _wmMakeActionButton("Save Changes to This Workspace", function () {
                var name = "";
                try { name = (wmDropdown.selection && wmDropdown.selection.text) ? String(wmDropdown.selection.text) : ""; } catch (e0) {}
                if (!name) { alert("No workspace selected."); return; }
                if (_stIsProtectedWorkspaceName(name)) { alert("The Default workspace cannot be overwritten."); return; }

                var ok = false;
                try { ok = __ST_confirmSafe__("Overwrite workspace \"" + name + "\"?"); } catch (e1a) { ok = confirm("Overwrite workspace \"" + name + "\"?"); }
                if (!ok) return;

                _stSaveWorkspaceByName(name);
                try { _wmRefreshDropdown(name); } catch (e1) {}
                try { _updateWorkspaceStatusLabel(); } catch (e2) {}
            });

            var btnSaveAsNew = _wmMakeActionButton("Save as New Workspace...", function () {
                var proposed = "";
                try { proposed = (wmDropdown.selection && wmDropdown.selection.text) ? String(wmDropdown.selection.text) : ""; } catch (e0) {}
                var name = "";
                try { name = __ST_promptSafe__("Name the new workspace:", proposed || "New Workspace"); } catch (e1) { name = prompt("Name the new workspace:", proposed || "New Workspace"); }
                try { name = String(name || "").replace(/^\s+|\s+$/g, ""); } catch (e2) {}
                if (!name) return;
                if (_stSaveWorkspaceByName(name)) {
                    try { pal.__stCurrentWorkspaceName = name; } catch (e3a) {}
                    try { pal.__stPendingWorkspaceName = name; } catch (e3b) {}
                    try { pal.__stStartupAppliedWorkspaceName = name; } catch (e3c) {}
                    try { pal.__stWorkspaceStatusName = name; } catch (e3d) {}
                    try { _stWriteLastUsedWorkspaceName(name); } catch (e3e) {}
                    try { _wmRefreshDropdown(name); } catch (e3) {}
                    try {
                        if (wmDropdown && wmDropdown.selection && String(wmDropdown.selection.text || "") === name) {
                            if (wmDropdown.onChange) wmDropdown.onChange();
                        }
                    } catch (e3f) {}
                    try { _updateWorkspaceStatusLabel(); } catch (e3g) {}
                }
            });

            
            var btnLoadWorkspace = _wmMakeActionButton("Load Workspace...", function () {
                try { _stImportWorkspaceFromJsonFile(); } catch (eLoadBtn) { alert("Load Workspace failed: " + String(eLoadBtn)); }
            });

            var btnRevealWorkspace = _wmMakeActionButton("Reveal Workspace in Finder", function () {
                var name = "";
                try { name = (wmDropdown.selection && wmDropdown.selection.text) ? String(wmDropdown.selection.text) : ""; } catch (e0) {}
                try {
                    if (!_stRevealWorkspaceInFinder(name)) {
                        alert("Could not reveal the workspace in Finder.");
                    }
                } catch (eRevealBtn) {
                    alert("Reveal Workspace in Finder failed: " + String(eRevealBtn));
                }
            });

var btnDelete = _wmMakeActionButton("Delete Workspace", function () {
                var name = "";
                try { name = (wmDropdown.selection && wmDropdown.selection.text) ? String(wmDropdown.selection.text) : ""; } catch (e0) {}
                if (!name) { alert("Choose a workspace to delete."); return; }
                if (_stIsProtectedWorkspaceName(name)) { alert("The Default workspace cannot be deleted."); return; }
                var ok = false;
                try { ok = __ST_confirmSafe__("Delete workspace \"" + name + "\"?"); } catch (e1) { ok = confirm("Delete workspace \"" + name + "\"?"); }
                if (!ok) return;

                if (_stDeleteWorkspaceByName(name)) {

                    try { _wmRefreshDropdown(""); } catch (e0a) {}

                    var names = [];
                    try { names = _stListWorkspaceNames() || []; } catch (e0b) { names = []; }

                    if (!names || !names.length) {
                        try { pal.__stCurrentWorkspaceName = ""; } catch (e1a) {}
                        try { pal.__stPendingWorkspaceName = ""; } catch (e1b) {}
                        try { pal.__stStartupAppliedWorkspaceName = ""; } catch (e1c) {}
                        try { pal.__stWorkspaceStatusName = ""; } catch (e1d) {}
                        try { _stWriteLastUsedWorkspaceName(""); } catch (e1e) {}
                        try { if (wmDropdown) wmDropdown.selection = null; } catch (e1f) {}

                        var fallback = "Workspace:";
                        try { if (pal.__stWorkspaceStatusNameLabel_MAIN) pal.__stWorkspaceStatusNameLabel_MAIN.text = fallback; } catch (e1g) {}
                        try { if (pal.__stWorkspaceStatusNameLabel_TEXT) pal.__stWorkspaceStatusNameLabel_TEXT.text = fallback; } catch (e1h) {}
                        try { if (pal.__stWorkspaceStatusNameLabel) pal.__stWorkspaceStatusNameLabel.text = fallback; } catch (e1i) {}

                        try { _updateWorkspaceStatusLabel(); } catch (e1j) {}
                    } else {
                        var __nextName = "";
                        try {
                            if (wmDropdown && wmDropdown.selection) __nextName = String(wmDropdown.selection.text || "");
                        } catch (e2a) {}
                        if (!__nextName) {
                            try { __nextName = String(names[0] || ""); } catch (e2b) { __nextName = ""; }
                            try {
                                if (wmDropdown && wmDropdown.items) {
                                    for (var i = 0; i < wmDropdown.items.length; i++) {
                                        try {
                                            if (String(wmDropdown.items[i].text || "") === __nextName) {
                                                wmDropdown.selection = i;
                                                break;
                                            }
                                        } catch (e2c) {}
                                    }
                                }
                            } catch (e2d) {}
                        }

                        if (__nextName) {
                            try { pal.__stCurrentWorkspaceName = __nextName; } catch (e3a) {}
                            try { pal.__stPendingWorkspaceName = __nextName; } catch (e3b) {}
                            try { pal.__stStartupAppliedWorkspaceName = __nextName; } catch (e3c) {}
                            try { pal.__stWorkspaceStatusName = __nextName; } catch (e3d) {}

                            var __statusText = "Workspace: " + __nextName;
                            try { if (pal.__stWorkspaceStatusNameLabel_MAIN) pal.__stWorkspaceStatusNameLabel_MAIN.text = __statusText; } catch (e3f) {}
                            try { if (pal.__stWorkspaceStatusNameLabel_TEXT) pal.__stWorkspaceStatusNameLabel_TEXT.text = __statusText; } catch (e3g) {}
                            try { if (pal.__stWorkspaceStatusNameLabel) pal.__stWorkspaceStatusNameLabel.text = __statusText; } catch (e3h) {}

                            try { _stLoadWorkspaceByName(__nextName, { syncDropdown: false }); } catch (e3i) {}
                        } else {
                            try { _updateWorkspaceStatusLabel(); } catch (e3j) {}
                        }
                    }

                    try { if (pal.layout) pal.layout.layout(true); } catch (e4a) {}
                    try { if (pal.update) pal.update(); } catch (e4b) {}
                }
            });

            function _wmGetSelectedWorkspaceName() {
                var name = "";
                try { name = (wmDropdown.selection && wmDropdown.selection.text) ? String(wmDropdown.selection.text) : ""; } catch (e0) { name = ""; }
                try { name = String(name || "").replace(/^\s+|\s+$/g, ""); } catch (e1) { name = ""; }
                return name;
            }

            function _wmUpdateActionButtonStates() {
                try {
                    var selName = _wmGetSelectedWorkspaceName();
                    var canEdit = (!!selName && !_stIsProtectedWorkspaceName(selName));
                    try { if (btnSaveCurrent) btnSaveCurrent.enabled = canEdit; } catch (eSaveState) {}
                    try { if (btnDelete) btnDelete.enabled = canEdit; } catch (eDelState) {}
                    return canEdit;
                } catch (e) {}
                return false;
            }

            try { pal.__stWorkspaceManagerUpdateActionStates = _wmUpdateActionButtonStates; } catch (eWMStatePub) {}

            function _wmRefreshDropdown(selectName) {
                var names = _stListWorkspaceNames();
                try { wmDropdown.removeAll(); } catch (e0) {}
                for (var i = 0; i < names.length; i++) {
                    try { wmDropdown.add("item", names[i]); } catch (e1) {}
                }

                if (!names || !names.length) {
                    // Do not clear current/pending/startup workspace state here.
                    // The dropdown can refresh before the list is repopulated, and we still want
                    // the saved active workspace to survive that rebuild.
                    try { pal.__stWorkspaceStatusName = ""; } catch (eEmpty3) {}
                }

                var wanted = String(selectName || "");
                if (!wanted) {
                    try { wanted = String(pal.__stCurrentWorkspaceName || pal.__stStartupAppliedWorkspaceName || pal.__stPendingWorkspaceName || ""); } catch (e1a) { wanted = ""; }
                }
                if (!wanted) {
                    try { wanted = String(_stReadLastUsedWorkspaceName() || ""); } catch (e1b) { wanted = ""; }
                }
                wanted = String(wanted || "").replace(/^\s+|\s+$/g, "");

                var idxSel = -1;
                if (wanted) {
                    for (var j = 0; j < wmDropdown.items.length; j++) {
                        if (String(wmDropdown.items[j].text) === wanted) { idxSel = j; break; }
                    }
                }
                if (idxSel < 0 && wmDropdown.items.length) idxSel = 0;

                try { pal.__stWorkspaceDropdownSyncing = true; } catch (eSync0) {}
                if (idxSel >= 0) {
                    try { wmDropdown.selection = idxSel; } catch (e2) {}
                } else {
                    try { wmDropdown.selection = null; } catch (e3) {}
                }
                try { pal.__stWorkspaceDropdownSyncing = false; } catch (eSync1) {}

                if (wmDropdown.selection) {
                    try {
                        var __selName = String(wmDropdown.selection.text || "");
                        // Mirror the visible dropdown selection into the status text only.
                        // Do NOT commit current/pending/startup workspace state here; that happens only
                        // after a workspace is actually loaded/applied.
                        pal.__stWorkspaceStatusName = __selName;
                    } catch (eSelSync) {}
                }

                if ((!names || !names.length) || !wmDropdown.selection) {
                    try { pal.__stWorkspaceStatusName = ""; } catch (eClr0) {}
                    try { _updateWorkspaceStatusLabel(); } catch (eClr1) {}
                } else {
                    try { _updateWorkspaceStatusLabel(); } catch (eClr2) {}
                }

                try { _wmUpdateActionButtonStates(); } catch (e4) {}
            }

            wmDropdown.onChange = function () {
                try { if (pal.__stWorkspaceDropdownSyncing) return; } catch (eSyncGuard) {}
                var name = "";
                try { name = (wmDropdown.selection && wmDropdown.selection.text) ? String(wmDropdown.selection.text) : ""; } catch (e0) {}
                try { _wmUpdateActionButtonStates(); } catch (eState0) {}
                if (!name) return;

                // Update the status line immediately so the UI feels responsive.
                try { pal.__stCurrentWorkspaceName = name; } catch (e0a) {}
                try { pal.__stPendingWorkspaceName = name; } catch (e0b) {}
                try { pal.__stStartupAppliedWorkspaceName = name; } catch (e0c) {}
                try { pal.__stWorkspaceStatusName = name; } catch (e0d) {}
                try { _stWriteLastUsedWorkspaceName(name); } catch (e0dd) {}
                try { _updateWorkspaceStatusLabel(); } catch (e0e) {}

                if (!_stLoadWorkspaceByName(name, { syncDropdown: false })) {
                    alert("Could not load workspace \"" + name + "\".");
                    return;
                }

                try { _selectTopTab(pal.__stWorkspaceReturnTab || "MAIN"); } catch (e2) {}
            };

            try {
                var __stInitialWanted = "";
                try { __stInitialWanted = String(_stReadLastUsedWorkspaceName() || ""); } catch (eR0) { __stInitialWanted = ""; }
                try { if (!__stInitialWanted) __stInitialWanted = String(_resolveActiveWorkspaceStatusName() || ""); } catch (eR1) {}
                _wmRefreshDropdown(__stInitialWanted);
            } catch (eR) {}

            try { pal.__stWorkspaceManagerRoot = wmRoot; } catch (e2a) {}
            try { pal.__stWorkspaceManagerBuilt = true; } catch (e2b) {}
            try { tabWorkspaceManager.visible = true; } catch (e2c) {}
            try { wmRoot.visible = true; } catch (e2d) {}
            try { wmRoot.layout.layout(true); } catch (e2e) {}
            try { tabWorkspaceManager.layout.layout(true); } catch (e2f) {}
            try { _stSettleWorkspaceManagerInitialWidths(); } catch (e2g0) {}
            try { if (pal.update) pal.update(); } catch (e2h) {}
            try { if (pal && pal.update) pal.update(); } catch (e2i) {}
            return true;
        }
        function _buildUpdatesTab(tabUpdates) {
            // -------------------------
            // UPDATES TAB CONTENT (UI only for now)
            // Centralized labels/status strings (reduce repeated literals)
            var __UPD_LABELS = {
                BTN_CHECK: ST_LABELS.CHECK_FOR_UPDATES,
                BTN_INSTALL: ST_LABELS.INSTALL_UPDATE
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
            var kvCurrent = _makeKVRow("Current version:", ((typeof SHINETOOLS_VERSION !== "undefined" && SHINETOOLS_VERSION) ? String(SHINETOOLS_VERSION) : ("v" + SHINE_VERSION)));
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
            // Auto-check toggle
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
            // Start clean each launch: no saved Updates-tab state.
            try { cbAutoCheck.value = false; } catch (eAutoInit) {}
            cbAutoCheck.onClick = function(){};

            // GitHub update check
            var GITHUB_VERSION_JSON_URL = "https://raw.githubusercontent.com/ShineTools1333/ShineTools/main/version.json";

    // --- version.json format (single source of truth) ---
    // Required:
    //   "latest": "1.5"
    //   "jsxUrl": "https://raw.githubusercontent.com/.../ShineTools_Main.jsx"
    // Preferred simplified changelog format:
    //   "changelog": {
    //      "1.5": ["Current release note 1", "Current release note 2"],
    //      "1.4": ["Older release note"],
    //      "1.0": ["Initial Release."]
    //   }
    // Legacy supported:
    //   "notes": ["Current release note"]
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
            // Updates-tab caching removed.
            function _cacheChangelogTextSafe(t) {}
            function _cacheUpdatesPayloadSafe(obj) {}
            function _loadCachedPayloadSafe() { return null; }

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
                    
                } catch (e) {}
            }

            function _setUpdatesStatus(msg) {
                try { kvStatus.val.text = msg || ""; } catch (e) {}
            }

            function _stFormatVersionLabel(ver) {
                try {
                    var s = String(ver || "").replace(/^\s+|\s+$/g, "");
                    if (!s || s === "—") return "—";
                    return (/^v/i.test(s)) ? s : ("v" + s);
                } catch (e) {}
                return "—";
            }

            function _setUpdatesVersion(ver) {
                try { kvLatest.val.text = _stFormatVersionLabel(ver); } catch (e) {}
            }

            function _setUpdatesChangelogStructured(latestVer, currentNotes, historyArr, labelMode) {
                // Running changelog list:
                //   LATEST VERSION first when an update is available.
                //   CURRENT VERSION first when installed version is current.
                //   Older versions continue directly below.
                try {
                    function _notesToCleanArray(v) {
                        var out = [];
                        try {
                            if (v === null || v === undefined) return out;
                            if (typeof v === "string") return [v];
                            if (v.length !== undefined && typeof v !== "string") {
                                for (var ai = 0; ai < v.length; ai++) {
                                    var item = v[ai];
                                    if (item === null || item === undefined) continue;
                                    if (typeof item === "string") out.push(item);
                                    else if (item.text !== undefined) out.push(String(item.text));
                                    else if (item.note !== undefined) out.push(String(item.note));
                                    else if (item.title !== undefined) out.push(String(item.title));
                                }
                                return out;
                            }
                            if (v.notes !== undefined) return _notesToCleanArray(v.notes);
                            if (v.changes !== undefined) return _notesToCleanArray(v.changes);
                            if (v.items !== undefined) return _notesToCleanArray(v.items);
                        } catch (eA) {}
                        return out;
                    }

                    var s = "";
                    var vLatest = String(latestVer || "").replace(/^v\s*/i, "");
                    var today = _formatStamp(new Date());
                    var topLabel = (String(labelMode || "").toLowerCase() === "latest") ? "LATEST VERSION" : "CURRENT VERSION";

                    if (vLatest) {
                        s += topLabel + " " + _stFormatVersionLabel(vLatest) + " — " + today + "\n";
                    } else {
                        s += topLabel + " — " + today + "\n";
                    }

                    var cn = _notesToCleanArray(currentNotes);

                    if (cn && cn.length) {
                        for (var i=0; i<cn.length; i++) {
                            s += "• " + String(cn[i]) + "\n";
                        }
                    } else {
                        s += "• (No release notes.)\n";
                    }

                    if (historyArr && historyArr.length) {
                        s += "\n";
                        for (var h = 0; h < historyArr.length; h++) {
                            var it = historyArr[h];
                            if (!it) continue;

                            var v = it.version || it.ver || it.v || "";
                            v = String(v || "").replace(/^v\s*/i, "");
                            if (!v) continue;

                            var d = it.date || it.when || it.timestamp || "";
                            if (d) s += _stFormatVersionLabel(v) + " — " + d + "\n";
                            else   s += _stFormatVersionLabel(v) + "\n";

                            var notes = _notesToCleanArray(it.notes || it.changes || it.items || []);

                            if (notes && notes.length) {
                                for (var n = 0; n < notes.length; n++) {
                                    s += "• " + String(notes[n]) + "\n";
                                }
                            } else {
                                s += "• (No notes.)\n";
                            }
                            s += "\n";
                        }
                    }

                    s = s.replace(/\n+$/, "");
                    chBox.text = s || "—";
                    _cacheChangelogTextSafe(chBox.text);
                } catch (e) {
                    try { chBox.text = "—"; } catch(_e) {}
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

            function _stIsArrayLikeForUpdates(v) {
                try {
                    if (!v || typeof v === "string") return false;
                    if (v.constructor === Array) return true;
                    if (Object.prototype.toString.call(v) === "[object Array]") return true;
                    return (typeof v.length === "number" && v.length >= 0);
                } catch (e) {}
                return false;
            }

            function _stNotesArrayForUpdates(v) {
                var out = [];
                try {
                    if (v === null || v === undefined) return out;
                    if (typeof v === "string") return [v];

                    if (_stIsArrayLikeForUpdates(v)) {
                        for (var i = 0; i < v.length; i++) {
                            try {
                                var item = v[i];
                                if (item === null || item === undefined) continue;
                                if (typeof item === "string") out.push(item);
                                else if (item.text !== undefined) out.push(String(item.text));
                                else if (item.note !== undefined) out.push(String(item.note));
                                else if (item.title !== undefined) out.push(String(item.title));
                            } catch (eI) {}
                        }
                        return out;
                    }

                    // Allow expanded per-version objects too:
                    // "1.2": { "date":"05/04/2026", "notes":["..."] }
                    if (v.notes !== undefined) return _stNotesArrayForUpdates(v.notes);
                    if (v.changes !== undefined) return _stNotesArrayForUpdates(v.changes);
                    if (v.items !== undefined) return _stNotesArrayForUpdates(v.items);
                } catch (e) {}
                return out;
            }

            function _stIsChangelogMapForUpdates(ch) {
                try {
                    if (!ch || typeof ch === "string") return false;
                    if (_stIsArrayLikeForUpdates(ch)) return false;
                    for (var k in ch) {
                        try {
                            if (!ch.hasOwnProperty || ch.hasOwnProperty(k)) return true;
                        } catch (eK) { return true; }
                    }
                } catch (e) {}
                return false;
            }

            function _normalizeUpdateChangelogPayload(data) {
                // Supports the easier version.json format:
                //   "changelog": {
                //      "1.2": ["..."],
                //      "1.1": ["..."],
                //      "1.0": ["Initial Release."]
                //   }
                // Also preserves the older notes/history format.
                var result = { notes: [], history: null };
                try {
                    if (!data) return result;

                    var latest = String(data.latest || data.version || "").replace(/^v\s*/i, "");
                    var ch = data.changelog;

                    // New simplified object/map format.
                    if (_stIsChangelogMapForUpdates(ch)) {
                        try {
                            if (latest && ch[latest] !== undefined) {
                                result.notes = _stNotesArrayForUpdates(ch[latest]);
                            } else if (latest && ch["v" + latest] !== undefined) {
                                result.notes = _stNotesArrayForUpdates(ch["v" + latest]);
                            }
                        } catch (eLatest) {}

                        var versions = [];
                        for (var k in ch) {
                            try {
                                if (ch.hasOwnProperty && !ch.hasOwnProperty(k)) continue;
                                var cleanK = String(k || "").replace(/^v\s*/i, "");
                                if (!cleanK) continue;
                                if (latest && cleanK === latest) continue;
                                versions.push(cleanK);
                            } catch (eK) {}
                        }
                        try {
                            versions.sort(function(a,b){ return _compareVersions(b, a); });
                        } catch (eSort) {}

                        result.history = [];
                        for (var i = 0; i < versions.length; i++) {
                            try {
                                var vk = versions[i];
                                var val = (ch[vk] !== undefined) ? ch[vk] : ch["v" + vk];
                                var entry = { version: vk, notes: _stNotesArrayForUpdates(val) };
                                try { if (val && val.date) entry.date = val.date; } catch (eD) {}
                                result.history.push(entry);
                            } catch (eV) {}
                        }

                        if (!result.notes || !result.notes.length) {
                            result.notes = _stNotesArrayForUpdates(data.notes);
                        }
                        return result;
                    }

                    // Legacy format.
                    result.notes = _stNotesArrayForUpdates(data.notes || data.changelog || []);
                    result.history = data.history || data.changelogHistory || data.releaseHistory || null;
                } catch (e) {}
                return result;
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

            
            function _setInitialUpdatesChangelogFromBundledNotes() {
                // No network check is needed just to show the built-in release notes on launch.
                // CHECK FOR UPDATES still refreshes this from version.json.
                try {
                    var bundled = {
                        "1.1": [
                            "Added new Save Workspace/Favorites Manager.",
                            "Added new Organize Library Elements dialog with custom section dividers, custom filenames, and reordering.",
                            "Changed section reordering to use Option-click on the MAIN and TEXT tabs.",
                            "Removed modifier keys on buttons.  Each action now has its own button - This was causing the crash.",
                            "Bug fixes."
                        ],
                        "1.0": [
                            "Initial Release."
                        ]
                    };

                    var current = String(_getCurrentVersionString() || "").replace(/^v\s*/i, "");
                    var notes = bundled[current] || [];
                    var hist = [];

                    for (var k in bundled) {
                        try {
                            if (bundled.hasOwnProperty && !bundled.hasOwnProperty(k)) continue;
                            var ck = String(k || "").replace(/^v\s*/i, "");
                            if (!ck || ck === current) continue;
                            if (_compareVersions(ck, current) > 0) continue; // do not show future notes before checking
                            hist.push({ version: ck, notes: bundled[k] });
                        } catch (eK) {}
                    }

                    try { hist.sort(function(a,b){ return _compareVersions(b.version, a.version); }); } catch (eSort) {}
                    _setUpdatesChangelogStructured(current, notes, hist, "current");
                } catch (e) {}
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

                var changelogPayload = _normalizeUpdateChangelogPayload(data);
                var notes = changelogPayload.notes || [];
                var historyArr = changelogPayload.history || null;
                var cmp = _compareVersions(String(data.latest), String(currentVer));
                _setUpdatesChangelogStructured(data.latest, notes, historyArr, (cmp > 0 ? "latest" : "current"));
                _cacheUpdatesPayloadSafe(data);
                _cacheChangelogTextSafe(chBox.text);
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
                                var needsAdmin = false; // User-library install: no admin needed

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

                    var changelogPayload = _normalizeUpdateChangelogPayload(data);
                    var notes = changelogPayload.notes || [];
                    var historyArr = changelogPayload.history || null;
                    _setUpdatesChangelogStructured(data.latest, notes, historyArr);
                } catch (e) {}
            }

            
            try { _setInitialUpdatesChangelogFromBundledNotes(); } catch (eInitChangelog) {}

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
                    try { $.global.__ShineToolsUpdateAutoCheck(); } catch (eNow) {}
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
                try { folder = __ST_selectDialogSafe__("Shared volume not found. Choose where to save your submission (.txt)"); } catch(eFD) { folder = null; }
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
            helpWrap.margins = [12, 18, 12, 10];
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
            _addHelpLine("• OPTION-click the MAIN or TEXT tab to reorder sections.");
            _addHelpLine("• Single-click a section name to expand or collapse it.");
            _addHelpLine("• SHIFT-click a section name to expand multiple sections.");
            _addHelpLine("• CMD-click a section name to collapse all sections.");

            _spacer(24);

            // --- BUTTONS & MODIFIERS ---
            var hdrButtons = helpWrap.add("statictext", undefined, "BUTTONS & MODIFIERS");
            _setShineYellowBold(hdrButtons);

            _addHelpLine("  (CMD, OPTION, or SHIFT for alternate actions)");
            var line1 = helpWrap.add("statictext", undefined,
    "• OPTION-click a section name to reorder the buttons\n   in that section.",
    { multiline: true }
);
line1.alignment = ["fill", "top"];

            _spacer(24);

            // --- FAVORITES & IMPORTS ---
            var hdrFav = helpWrap.add("statictext", undefined, "FAVORITES & IMPORTS");
            _setShineYellowBold(hdrFav);

            _addHelpLine("• Click the plus sign to add elements to the favorites list.");
            _addHelpLine("• Select a file to import it to the timeline at the CTI.");
            _addHelpLine("• OPTION-click the STAR to organize Favorites lists.");
            _addHelpLine("• OPTION-click a file from the list to set ADD blend mode.");

            _spacer(24);

            // --- RENDER SETTINGS ---
            var hdrRender = helpWrap.add("statictext", undefined, "RENDER SETTINGS");
            _setShineYellowBold(hdrRender);

            var line2 = helpWrap.add("statictext", undefined,
    "• Must set up a render template labeled PRORES 422",
    { multiline: true }
);
line2.alignment = ["fill", "top"];
            _addHelpLine("  to use the PRORES 422 render button.");

            _spacer(24);
            // --- REQUIRED SETTINGS ---
            var hdrReq = helpWrap.add("statictext", undefined, "REQUIRED SETTINGS");
            _setShineYellowBold(hdrReq);

            _addHelpLine("• Enable \"Allow Scripts to Write Files and Access Network\"");
            _addHelpLine("• File > Project Settings > Expressions must be set to JavaScript.");

            _spacer(24);

            // --- TOOL TIPS ---
            var hdrTips = helpWrap.add("statictext", undefined, "TOOL TIPS");
            _setShineYellowBold(hdrTips);

            _addHelpLine("• Hover over buttons for more info.");

            _spacer(24);

            try {
                (function _ST_PreviousComputerRow_inHelp(parent) {

                    // ---------- Base64 decode (ExtendScript compatible) ----------
                    function __st_b64IndexOf(c) {
                        var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
                        return chars.indexOf(c);
                    }
                    function __st_base64DecodeToString(b64) {
                        try { b64 = String(b64 || "").replace(/\s+/g, ""); } catch (e) { b64 = ""; }
                        var out = "";
                        var i = 0;
                        while (i < b64.length) {
                            var c1 = __st_b64IndexOf(b64.charAt(i++));
                            var c2 = __st_b64IndexOf(b64.charAt(i++));
                            var c3ch = b64.charAt(i++);
                            var c4ch = b64.charAt(i++);

                            if (c1 < 0 || c2 < 0) break;

                            var c3 = (c3ch === "=") ? -1 : __st_b64IndexOf(c3ch);
                            var c4 = (c4ch === "=") ? -1 : __st_b64IndexOf(c4ch);

                            var b1 = (c1 << 2) | (c2 >> 4);
                            out += String.fromCharCode(b1 & 0xFF);

                            if (c3 >= 0) {
                                var b2 = ((c2 & 15) << 4) | (c3 >> 2);
                                out += String.fromCharCode(b2 & 0xFF);
                            }
                            if (c4 >= 0 && c3 >= 0) {
                                var b3 = ((c3 & 3) << 6) | c4;
                                out += String.fromCharCode(b3 & 0xFF);
                            }
                        }
                        return out;
                    }

                    // ---------- Pathing ----------
                    function __st_getReferenceFolderFromProject() {
                        try {
                            if (!app.project || !app.project.file) return null;
                            var projFile = app.project.file;   // File
                            var projFolder = projFile.parent;  // Folder containing .aep
                            var up1 = projFolder ? projFolder.parent : null;
                            var up2 = up1 ? up1.parent : null;
                            if (!up2) return null;
                            var refFolder = new Folder(up2.fsName + "/08_REFERENCE");
                            return (refFolder && refFolder.exists) ? refFolder : null;
                        } catch (e) {}
                        return null;
                    }

                    function __st_pickMetaFile(refFolder) {
                        try {
                            if (!refFolder || !refFolder.exists) return null;
                            if (!app.project || !app.project.file) return null;

                            var projName = app.project.file.name.replace(/\.[^\.]+$/, ""); // remove extension
                            var candidate = new File(refFolder.fsName + "/" + projName + "_ShineTools_ProjectTracker.meta");
                            if (candidate && candidate.exists) return candidate;

                            // fallback: any *_ShineTools_ProjectTracker.meta (newest modified)
                            var list = refFolder.getFiles(function (f) {
                                return (f instanceof File) && (/_ShineTools_ProjectTracker\.meta$/i).test(f.name);
                            });
                            if (!list || list.length === 0) return null;
                            if (list.length === 1) return list[0];

                            var newest = list[0];
                            for (var i = 1; i < list.length; i++) {
                                try {
                                    if (list[i].modified && newest.modified && (list[i].modified.getTime() > newest.modified.getTime())) {
                                        newest = list[i];
                                    }
                                } catch (e2) {}
                            }
                            return newest;
                        } catch (e) {}
                        return null;
                    }

                    function __st_readFileText(fileObj) {
                        if (!fileObj || !fileObj.exists) return null;
                        var txt = null;
                        try {
                            fileObj.encoding = "UTF-8";
                            fileObj.open("r");
                            txt = fileObj.read();
                            fileObj.close();
                        } catch (e) {
                            try { if (fileObj.opened) fileObj.close(); } catch (e2) {}
                            return null;
                        }
                        return txt;
                    }

                    function __st_extractPayload(rawText) {
                        try {
                            if (!rawText) return null;
                            var m = String(rawText).match(/\[ST_PT_META\]([\s\S]*?)\[\/ST_PT_META\]/);
                            if (!m || m.length < 2) return null;
                            return m[1];
                        } catch (e) {}
                        return null;
                    }

                    function __st_getPreviousComputerName() {
                        // Returns a display string (never throws)
                        try {
                            if (!app.project || !app.project.file) return "—";

                            var refFolder = __st_getReferenceFolderFromProject();
                            if (!refFolder) return "—";

                            var metaFile = __st_pickMetaFile(refFolder);
                            if (!metaFile) return "—";

                            var raw = __st_readFileText(metaFile);
                            if (!raw) return "—";

                            var payload = __st_extractPayload(raw);
                            if (!payload) return "—";

                            var decoded = __st_base64DecodeToString(payload);

                            // decoded is non-strict JSON (e.g. unquoted keys) so we eval like the test script
                            var obj = null;
                            try { obj = eval(decoded); } catch (eEval) { obj = null; }

                            if (obj && obj.previousComputer !== undefined && obj.previousComputer !== null && String(obj.previousComputer) !== "") {
                                return __st_formatComputerDisplay(obj.previousComputer);
}
                        } catch (e) {}
                        return "—";
                    }

// ---------- Display mapping ----------
// Map internal machine codes -> friendly display labels
var __ST_COMP_LABELS = {
    "ShineCA": "ShineCA (Edit 6)",
    "ShineCF": "ShineCF (Edit 7)",
    "ShineCB": "ShineCB (Edit 2)",
    "ShineCC": "ShineCC (Edit 4)",
    "ShineCE": "ShineCE (Edit 1)",
    "ShineCD": "ShineCD (EDIT 5)",
    "Shine_SD": "Shine_SD (Lucas)",
    "ShineBC": "ShineBC (Shine Hub 3)",
    "ShineAF": "ShineAF (Shine Hub 1)",
    "ShineBB": "ShineBB (Shine Hub 2)"
};
function __st_formatComputerDisplay(code) {
    try {
        var c = String(code);
        if (__ST_COMP_LABELS.hasOwnProperty(c)) return __ST_COMP_LABELS[c];
        return c;
    } catch (e) { return String(code); }
}

                    // ---------- UI row ----------
                    var prevPanel = parent.add("panel", undefined, "");
                    prevPanel.name = "__ST_PREV_COMPUTER_PANEL__";
                    prevPanel.orientation = "column";
                    prevPanel.alignChildren = ["center","top"];
                    prevPanel.alignment = ["fill","top"];
                    prevPanel.margins = [10, 10, 10, 10];
                    prevPanel.spacing = 2;
                    // Centered stacked labels inside the box
                    var prevLabel = prevPanel.add("statictext", undefined, "Previous Computer:");
                    try { prevLabel.justify = "center"; } catch (eJ1) {}
                    prevLabel.alignment = ["center","top"];

                    var prevValue = prevPanel.add("statictext", undefined, "—");
                    try { prevValue.justify = "center"; } catch (eJ2) {}
                    prevValue.alignment = ["center","top"];
// Ensure the computer name isn't truncated, WITHOUT forcing a wide field.
                    // Using `characters` gives it room to render long names, while still allowing
                    // the label+value pair to size-to-content and be centered as ONE unit.
                    try { prevValue.characters = 28; } catch (eC) {}
                    try { _setShineYellowBold(prevValue); } catch (eY) {}
// Register for later refresh (project may not be loaded/saved yet when panel builds)
                    try {
                        if (!$.global.__ST_PrevComputerUI) $.global.__ST_PrevComputerUI = {};
                        $.global.__ST_PrevComputerUI.label = prevValue;
                        $.global.__ST_PrevComputerUI.getName = __st_getPreviousComputerName;
                        $.global.__ST_PrevComputerUI.refresh = function () {
                            try {
                                if ($.global.__ST_PrevComputerUI && $.global.__ST_PrevComputerUI.label) {
                                    $.global.__ST_PrevComputerUI.label.text = __st_getPreviousComputerName();
                                }
                            } catch (eR) {}
                        };
                    } catch (eReg) {}

                    // Initial populate + one immediate refresh
                    try { prevValue.text = __st_getPreviousComputerName(); } catch (eSet) {}
                    try {
                        if ($.global.__ST_PrevComputerUI && $.global.__ST_PrevComputerUI.refresh) { $.global.__ST_PrevComputerUI.refresh(); }
                    } catch (eSch) {}
try { if (parent && parent.layout) { parent.layout.layout(true); parent.layout.resize(); } } catch (eL) {}

                })(tabHelp);
            } catch (ePC) {}

            try {
                (function _ST_ShineTrackerLaunchRow_inHelp(parent) {

                    // Button Row: Launch ShineTracker (icon + label, hover swap)
                    var launchRow = parent.add("group");
                    launchRow.name = "__ST_LAUNCH_TRACKER_ROW__";
                    launchRow.orientation = "column";
                    launchRow.alignChildren = ["center","top"];
                    launchRow.alignment = ["fill","top"];
                    launchRow.margins = [0, 16, 0, 0];
                    launchRow.spacing = 0;

                    launchRow.minimumSize.height = 60;

                    // Clickable icon + label (no ScriptUI button chrome)
                    var launchTrackerIconCtl, launchTrackerLabel, launchClickGroup;
                    var __stLaunchImgNormal = null;
                    var __stLaunchImgHover  = null;

                    function _stLaunchShineTracker() {
                        try {
                            var trackerPath = "/Applications/ShineTracker.app";
                            if (Folder(trackerPath).exists) {
                                system.callSystem('open "' + trackerPath + '"');
                            } else {
                                alert("ShineTracker.app not found in /Applications.");
                            }
                        } catch (err) {
                            alert("Error launching ShineTracker:\\n" + err.toString());
                        }
                    }

                    function _stSetLaunchIcon(isHover) {
                        try {
                            if (!launchTrackerIconCtl) return;
                            if (isHover && __stLaunchImgHover) {
                                launchTrackerIconCtl.image = __stLaunchImgHover;
                            } else if (__stLaunchImgNormal) {
                                launchTrackerIconCtl.image = __stLaunchImgNormal;
                            }
                        } catch (e) {}
                    }

                    try {
                        var _stRoot = _stGetSharedRootFolder();

                        // Prefer shared root icons folder, fallback to system path
                        var _iconNormal = (_stRoot && _stRoot.exists) ? new File(_stRoot.fsName + "/icons/launch_tracker_normal_32.png")
                                                                      : new File("/Library/Application Support/ShineTools/icons/launch_tracker_normal_32.png");

                        var _iconHover  = (_stRoot && _stRoot.exists) ? new File(_stRoot.fsName + "/icons/launch_tracker_hover_32.png")
                                                                      : new File("/Library/Application Support/ShineTools/icons/launch_tracker_hover_32.png");

                        if (_iconNormal && _iconNormal.exists) {

                            __stLaunchImgNormal = ScriptUI.newImage(_iconNormal);
                            if (_iconHover && _iconHover.exists) __stLaunchImgHover = ScriptUI.newImage(_iconHover);

                            // Group that holds icon + text (left-justified and non-stretching)
                            launchClickGroup = launchRow.add("group");
                            launchClickGroup.orientation = "column";
                            launchClickGroup.alignChildren = ["center","top"];
                            launchClickGroup.alignment = ["center","top"];
                            launchClickGroup.margins = 0;
                            launchClickGroup.spacing = 4;
                            launchClickGroup.helpTip = "Launch ShineTracker";

                            // Image control: no border / no button chrome
                            launchTrackerIconCtl = launchClickGroup.add("image", undefined, __stLaunchImgNormal);

                            try { launchTrackerIconCtl.alignment = ["center","top"]; } catch(eAl) {}

                            // Control box size (use a 28x28 render here to align with text)
                            launchTrackerIconCtl.preferredSize = [28, 28];
                            launchTrackerIconCtl.minimumSize   = [28, 28];
                            launchTrackerIconCtl.maximumSize   = [28, 28];

                            // Label to the right
                            launchTrackerLabel = launchClickGroup.add("statictext", undefined, "Launch ShineTracker");
                            launchTrackerLabel.justify = "center";
                            launchTrackerLabel.alignment = ["center","top"];

                            // Hide label by default; reveal on hover over the icon (no tooltip/popup).
                            // Use fixed character width so layout doesn't jump when toggling text.
                            try {
                                launchTrackerLabel.characters = 22;
                                launchTrackerLabel.text = "";
                            } catch (eLbl) {}

                            // Make both icon and label clickable
                            launchTrackerIconCtl.addEventListener("mousedown", function () { _stLaunchShineTracker(); });
                            launchTrackerLabel.addEventListener("mousedown",   function () { _stLaunchShineTracker(); });
                            launchClickGroup.addEventListener("mousedown",     function () { _stLaunchShineTracker(); });

                            // Stability cleanup: hover-driven icon/label swapping disabled.
                            // Click behavior remains intact; avoids mouseover/mouseout ScriptUI layout churn.
                            function _stSetLaunchLabel(show) {
                                try {
                                    if (!launchTrackerLabel) return;
                                    launchTrackerLabel.text = "";
                                } catch (e) {}
                            }
                        }

                    } catch (eIcon) {}

                    if (!launchClickGroup) {
                        // Fallback: standard text button if icon(s) missing
                        var launchCell = launchRow.add("group");
                        launchCell.orientation   = "stack";
                        launchCell.alignChildren = ["fill","fill"];
                        launchCell.alignment     = ["left","center"];
                        launchCell.margins       = 0;

                        var launchTrackerBtnFallback = launchCell.add("button", undefined, "Launch ShineTracker");
                        launchTrackerBtnFallback.minimumSize.height = 28;
                        try { defocusButtonBestEffort(launchTrackerBtnFallback); } catch (eDF) {}
                        launchTrackerBtnFallback.onClick = function () { _stLaunchShineTracker(); };
                    }

                    try { if(parent && parent.layout) { parent.layout.layout(true); parent.layout.resize(); } } catch(e) {}

                })(tabHelp);
            } catch (eTT) {}
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
        var TOPROW_PLUS_W     = 62;  // ADD button width in true section-button style
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
            // NO-EVENT-HOOK DIAGNOSTIC: avoid dropdown activate/mouseover/focus handlers and list-size mutation.
            // This may allow wider/taller native dropdown popups, but it removes another post-modal ScriptUI touch path.
            return;
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
                try { _stMarkDropdownInteraction(dd, 5000); } catch (eMarkA) {}
                if (_prevActivate) { try { _prevActivate(); } catch (ePrev) {} }
                _clamp();
            };

            var _prevDeactivate = dd.onDeactivate;
            dd.onDeactivate = function () {
                if (_prevDeactivate) { try { _prevDeactivate(); } catch (ePrevD) {} }
                try { _stClearDropdownInteraction(dd, 1200); } catch (eMarkD) {}
            };

            // Extra safety: some hosts don't fire onActivate reliably for dropdowns.
            try {
                dd.addEventListener('mousedown', function () { try { _stMarkDropdownInteraction(dd, 5000); } catch (eMD) {} _clamp(); });
                try { dd.addEventListener('mouseup', function () { _stMarkDropdownInteraction(dd, 1500); }); } catch (eMU) {}
                // Stability cleanup: no hover-driven dropdown clamp. Clamp on mousedown/focus only.
                try { dd.addEventListener('focus', function () { try { _stMarkDropdownInteraction(dd, 5000); } catch (eF) {} _clamp(); }); } catch (e5) {}
                try { dd.addEventListener('blur', function () { _stClearDropdownInteraction(dd, 1200); }); } catch (e6) {}
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
                if (s && typeof s === "object" && !(s instanceof File)) {
                    var lbl = _favEntryLabel(s);
                    if (lbl) return String(lbl);
                    s = _favEntryPath(s);
                }
            } catch (eObj) {}
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
                    if (!it || it._isBlank || it.text === "(No files)" || it.text === "(No presets)" || it.type === "separator") continue;
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

function __stNoForceRelayoutDiagnosticActive() {
    try { return ($.global.__ST_NO_FORCE_RELAYOUT_DIAG_ACTIVE__ === true); } catch (e) {}
    return false;
}

function relayoutScoped(scopeGroup) {
    // Optional emergency bypass for forced relayout.
    try { if (__stNoForceRelayoutDiagnosticActive()) return; } catch (eDiag) { return; }
    try {
        if ($.global.__ST_isSafeToTouchUI__ && !$.global.__ST_isSafeToTouchUI__()) return;
    } catch (eSafe0) { return; }
    try {
        if ($.global.__ShineToolsIsLiveResizing__ === true) {
            try { if (!$.global.__ST_isSafeToTouchUI__ || $.global.__ST_isSafeToTouchUI__()) pal.layout.resize(); } catch (e0) {}
            return;
        }
    } catch (eLive0) {}
    try { (scopeGroup || pal).layout.layout(true); } catch (e1) {}
    try { (scopeGroup || pal).layout.resize(); } catch (e2) {}
    try { pal.layout.resize(); } catch (e3) {}
}

function relayout() {
    try { if (__stNoForceRelayoutDiagnosticActive()) return; } catch (eDiag) { return; }
    relayoutScoped(pal);
}

// ---- Render/modal-safe helpers (avoid ScriptUI layout during Render Queue or native modal transitions) ----
function _stIsRendering() {
    try { return !!(app && app.project && app.project.renderQueue && app.project.renderQueue.rendering); } catch (e) { return false; }
}

function _stCanTouchUI() {
    try { return !($.global.__ST_isSafeToTouchUI__ && !$.global.__ST_isSafeToTouchUI__()); } catch(e) {}
    return false;
}

function requestRelayoutSoon(scopeGroup, delayMs) {
    try { if (__stNoForceRelayoutDiagnosticActive()) return; } catch (eDiag) { return; }
    try { if (!_stCanTouchUI()) return; } catch (eSafe) { return; }
    try {
        // Lightweight accordion refresh: only relayout the requested scope.
        // Do NOT run the broad all-workspace settle on every expand/collapse; that caused lag.
        relayoutScoped(scopeGroup || pal);
    } catch (e) {
        try {
            if (!_stCanTouchUI()) return;
            if (scopeGroup && scopeGroup.layout) {
                scopeGroup.layout.layout(true);
                scopeGroup.layout.resize();
            } else if (pal && pal.layout) {
                pal.layout.layout(true);
                pal.layout.resize();
            }
        } catch (e2) {}
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
            // NO-EVENT-HOOK DIAGNOSTIC: do not add extra mouse handlers just to clear focus rings.
            // Keep button behavior native for this freeze test.
            return;
        }

// -------------------------
// - Keeps the visual idea of a floating PLUS sign.
// -------------------------
function addPlusGlyphButton(parent, w, h, helpTip, handler) {
    var __btnW = Math.max(w, 62);
    var __btnH = Math.max(h, UI.btnH);

    // Use the same straightforward stack-cell button architecture as the section buttons.
    var cell = parent.add("group");
    cell.orientation   = "stack";
    cell.alignChildren = ["fill", "fill"];
    cell.alignment     = ["left", "bottom"];
    cell.margins       = [0, 0, 0, 0];
    cell.spacing       = 0;
    cell.minimumSize   = [__btnW, __btnH];
    cell.preferredSize = [__btnW, __btnH];
    cell.maximumSize   = [__btnW, __btnH];

    var b = cell.add("button", undefined, "Add...");
    b.alignment     = ["fill", "center"];
    b.minimumSize   = [__btnW, __btnH];
    b.preferredSize = [__btnW, __btnH];
    b.maximumSize   = [__btnW, __btnH];
    try { b.helpTip = helpTip || "Add"; } catch (eTip) {}
    try { b.justify = "center"; } catch (eJ) {}
    try { defocusButtonBestEffort(b); } catch (eDF) {}
    try { b.graphics.font = ScriptUI.newFont("Helvetica", "BOLD", 11); } catch (eF) { try { b.graphics.font = ScriptUI.newFont(b.graphics.font.name, "Bold", 11); } catch (eF2) {} }
    if (typeof handler === "function") b.onClick = handler;

    try { cell.__button = b; } catch (eB) {}
    return cell;
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
        // ==========================================================
        // Hover label helpers (Modifier-aware) — tiny hover-only tick
        // ----------------------------------------------------------
        // While a button is actively hovered, run a lightweight scheduleTask
        // so Option/Shift label changes update immediately without requiring
        // mouse movement. The tick stops on mouseout / modal cancel.
        // ==========================================================

        var _hoverBtn = null;
        var _hoverText = "";
        var _hoverOptionText = "";
        var _hoverShiftText = "";
        var _hoverLastAlt = null;
        var _hoverLastShift = null;

// =================================================================================================
// UTILITIES: HOVER SYSTEM: instant modifier hover labels
// =================================================================================================
        function _hoverClearInternal() {
            _hoverBtn = null;
            _hoverLastAlt = null;
            _hoverLastShift = null;
        }

        // Expose a global canceller so we can pause hover state when a modal dialog is shown
        $.global.__ShineTools_CancelHoverPoll__ = function () {
            try { _hoverClearInternal(); } catch (e) {}
            try { _stHoverSetRunning(false); } catch (e2) {}
            try { _stHoverCancelTask(); } catch (e3) {}
        };

        function _hoverSafeSetText(btn, t) { try { btn.text = t; } catch (e) {} }

        function _hoverComputeText() {
            var altNow = isOptionDown();
            var shiftNow = isShiftDown();
            var next = shiftNow ? (_hoverShiftText || _hoverText) : (altNow ? _hoverOptionText : _hoverText);
            return { alt: altNow, shift: shiftNow, text: next };
        }

        function _hoverUpdateIfChanged() {
            if (!_hoverBtn) return;
            var st = _hoverComputeText();
            if (_hoverLastAlt === null || _hoverLastShift === null || st.alt !== _hoverLastAlt || st.shift !== _hoverLastShift) {
                _hoverLastAlt = st.alt;
                _hoverLastShift = st.shift;
                _hoverSafeSetText(_hoverBtn, st.text);
            }
        }

        function _hoverStart(btn, baseText, hoverText, optionHoverText, shiftHoverText) {
            // DISABLED FOR AE STABILITY:
            // Do not change ScriptUI button labels on hover, and do not start hover polling.
            // Real-world testing showed multi-label hover buttons can freeze AE after render/project modal states.
            try { _hoverClearInternal(); } catch (e0) {}
            try { _stHoverSetRunning(false); } catch (e1) {}
            try { _stHoverCancelTask(); } catch (e2) {}
            return;
        }

        function _hoverStop(btn, baseText) {
            // DISABLED FOR AE STABILITY:
            // Do not reset/touch button text on mouseout. Buttons keep their static base label.
            try { if (_hoverBtn === btn) _hoverClearInternal(); } catch (e0) {}
            try { _stHoverSetRunning(false); } catch (e1) {}
            try { _stHoverCancelTask(); } catch (e2) {}
            return;
}
        // ------------------------------------------------------------
        // Modifier-hover label update via tiny hover-only tick
        // ------------------------------------------------------------
        // ScriptUI doesn't reliably emit events for modifier key changes.
        // This tick runs ONLY while a button is hovered, so pressing/releasing
        // Option or Shift flips the visible button label without mouse movement.
        // It is intentionally allowed even when ST.SAFE_MODE is true; SAFE_MODE
        // still disables heavier/background UI polish elsewhere.
var _stHoverRunning = false;
var _stHoverTaskId  = null;
var _stHoverTaskDueMs = 0;
var _stHoverStartedMs = 0;
var _stHoverIntervalMs = 90; // Poll only while a button is actively hovered; allows modifier-only label flips.
var _stHoverMaxOverdueMs = 260; // If AE holds a hover tick through an Import/Render modal, cancel it before it touches UI.

function _stHoverNowMs(){ try { return (new Date()).getTime(); } catch(e) { return 0; } }

// Expose a callable for scheduleTask (string-based) to invoke our closure safely.
$.global.__ST_HoverTick__ = function () {
    // Hover label flipping is disabled; no scheduled hover UI work should run.
    return;
};

function _stHoverIsRunning(){ return _stHoverRunning; }
function _stHoverSetRunning(v){ _stHoverRunning = v ? true : false; }

function _stHoverCancelTask(){
    try {
        if (_stHoverTaskId !== null) {
            app.cancelTask(_stHoverTaskId);
        }
    } catch (e) {}
    _stHoverTaskId = null;
    _stHoverTaskDueMs = 0;
}

function _stHoverEnsureTick(){
    // DISABLED FOR AE STABILITY: never schedule hover polling for label flipping.
    try { _hoverClearInternal(); } catch (e0) {}
    try { _stHoverSetRunning(false); } catch (e1) {}
    try { _stHoverCancelTask(); } catch (e2) {}
    return;
}

function _stHoverScheduleNext(){
    // DISABLED FOR AE STABILITY: no hover label scheduleTask should ever be queued.
    try { _stHoverSetRunning(false); } catch (e0) {}
    try { _stHoverCancelTask(); } catch (e1) {}
    return;
}

function _stHoverStopTickIfIdle(){
    // Stop if no hover target (or the palette loses focus).
    if (_hoverBtn) return;
    _stHoverRunning = false;
    _stHoverCancelTask();
}

function _stHoverTickInternal(){
    // DISABLED FOR AE STABILITY: no hover label UI mutation should occur from a scheduled tick.
    try { _hoverClearInternal(); } catch (e0) {}
    try { _stHoverSetRunning(false); } catch (e1) {}
    try { _stHoverCancelTask(); } catch (e2) {}
    return;
}

function _stRecoverAfterHostModal(){
    try {
        if ($.global && $.global.__ST_BUSY__ === true) {
            var started = 0;
            try { started = $.global.__ST_BUSY_STARTED_MS__ || 0; } catch(eB0) { started = 0; }
            var now = 0;
            try { now = (new Date()).getTime(); } catch(eB1) { now = 0; }
            if (!started || !now || (now - started) > 10000) {
                $.global.__ST_BUSY__ = false;
                $.global.__ST_BUSY_STARTED_MS__ = 0;
            }
        }
    } catch(e2) {}
    try {
        if ($.global && $.global.__ST_LONGOP__ === true) {
            var stillSaving = false;
            var stillRendering = false;
            try { stillSaving = !!(app && app.isSaving); } catch(eS) { stillSaving = false; }
            try { stillRendering = !!(app && app.project && app.project.renderQueue && app.project.renderQueue.rendering); } catch(eR) { stillRendering = false; }
            if (!stillSaving && !stillRendering) $.global.__ST_LONGOP__ = false;
        }
    } catch(e3) {}
}

// Install a single mousemove listener on the palette/panel to refresh hovered button label.
function _stHoverInstallMouseHook(root){
    // NO-EVENT-HOOK DIAGNOSTIC: do not install root mousemove/mouseover/mousedown hooks.
    return;
}

// Best-effort: key hooks (not reliable in all AE ScriptUI builds), but when they fire they give instant updates.
function _stHoverInstallKeyHook(root){
    // NO-EVENT-HOOK DIAGNOSTIC: do not install root keydown/keyup hooks.
    return;
}

function _stAppendHoverHelpTip(btn, baseText, hoverText, optionHoverText, shiftHoverText) {
            // Hover label flipping is disabled, but preserve the alternate-action info in the tooltip.
            try {
                if (!btn) return;
                var existing = "";
                try { existing = String(btn.helpTip || ""); } catch (eTip0) { existing = ""; }
                var parts = [];
                try { if (existing) parts.push(existing); } catch (e0) {}
                try {
                    var altInfo = [];
                    if (hoverText && String(hoverText) !== String(baseText)) altInfo.push("Click: " + String(hoverText));
                    if (optionHoverText) altInfo.push("Option-click: " + String(optionHoverText));
                    if (shiftHoverText) altInfo.push("Shift-click: " + String(shiftHoverText));
                    if (altInfo.length) parts.push(altInfo.join("\n"));
                } catch (e1) {}
                try { btn.helpTip = parts.join(parts.length > 1 ? "\n\n" : ""); } catch (eSet) {}
            } catch (e) {}
        }

function enableHoverOptionLabel(btn, baseText, hoverText, optionHoverText) {
            // DISABLED FOR AE STABILITY:
            // Do not attach mouseover/mouseout/mousemove handlers and do not change button text on hover.
            try { if (btn) btn.text = baseText; } catch (eTxt) {}
            try { _stAppendHoverHelpTip(btn, baseText, hoverText, optionHoverText, ""); } catch (eTip) {}
            return;
        }

        function enableHoverModifierLabel(btn, baseText, hoverText, optionHoverText, shiftHoverText) {
            // DISABLED FOR AE STABILITY:
            // Do not attach mouseover/mouseout/mousemove handlers and do not change button text on hover.
            try { if (btn) btn.text = baseText; } catch (eTxt) {}
            try { _stAppendHoverHelpTip(btn, baseText, hoverText, optionHoverText, shiftHoverText); } catch (eTip) {}
            return;
        }

// -------------------------
        // Per-section button registry for live reorder dialogs
        // -------------------------
        var __ST_BTN_ORDER_SECTION = "ShineTools";
        var __ST_BTN_ORDER_PREFIX  = "";
        var __ST_SECTION_BUTTONS   = {}; // { accordionKey: { sectionTitle: [ String label, ... ] } }

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

        function _stBO_register(accordionKey, sectionTitle, items){
            try {
                if (!accordionKey || !sectionTitle || !items || !items.length) return;
                if (!__ST_SECTION_BUTTONS[accordionKey]) __ST_SECTION_BUTTONS[accordionKey] = {};
                var labels = [];
                for (var i=0; i<items.length; i++) {
                    var lbl = _stBO_itemLabel(items[i]) || ('BTN_' + i);
                    labels.push(_stBO_safeStr(lbl));
                }
                __ST_SECTION_BUTTONS[accordionKey][sectionTitle] = labels;
            } catch (e) {}
        }

// 2-column grid with badge indicator support

	        // 2-column grid with badge indicator support
	        // NOTE: Indicator is implemented as a fixed-width sibling (NOT an overlay)
	        // to keep clicks reliable and resizing snappy.
	        function addGrid2(parentBody, items) {
            // Register per-section buttons when inside an accordion section.
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
                    try {
                        var _savedOrder = _stBO_getRegistry(_aKey, _sTitle) || [];
                        if (_savedOrder && _savedOrder.length) {
                            var _usedMap = {};
                            var _reordered = [];
                            var _ii, _jj, _lbl;
                            for (_ii = 0; _ii < _savedOrder.length; _ii++) {
                                _lbl = String(_savedOrder[_ii] || "");
                                if (!_lbl || _usedMap[_lbl]) continue;
                                for (_jj = 0; _jj < items.length; _jj++) {
                                    if (_stBO_itemLabel(items[_jj]) === _lbl) {
                                        _reordered.push(items[_jj]);
                                        _usedMap[_lbl] = true;
                                        break;
                                    }
                                }
                            }
                            for (_jj = 0; _jj < items.length; _jj++) {
                                _lbl = _stBO_itemLabel(items[_jj]);
                                if (_lbl && _usedMap[_lbl]) continue;
                                _reordered.push(items[_jj]);
                            }
                            items = _reordered;
                        }
                    } catch (eBOApply) {}
                    // Register these buttons for the current live session dialog list.
                    _stBO_register(_aKey, _sTitle, items);
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
                    // Use a live statictext overlay on the right edge of the button.
                    // It is NOT disabled, because disabled statictext can disappear in AE ScriptUI.
                    var line = cell.add("statictext", undefined, "▐");
                    line.alignment     = ["right", "top"];
                    line.margins       = [0, 0, -2, 0];
                    line.minimumSize   = [10, 20];
                    line.preferredSize = [10, 20];
                    line.maximumSize   = [10, 20];
                    line.justify       = "center";
                    line.helpTip       = item.helpTip || "";
                    try { line.graphics.font = ScriptUI.newFont(line.graphics.font.name, "Bold", 20); } catch (eF) {}
                    try { line.graphics.foregroundColor = line.graphics.newPen(line.graphics.PenType.SOLID_COLOR, [1, 0.82, 0.20, 1], 1); } catch (eC) {}

                    // If the user clicks directly on the marker, pass it through to the button behavior.
                    try {
                        line.addEventListener("click", function () {
                            try { if (btn && typeof btn.onClick === "function") btn.onClick(); } catch (eLineClick) {}
                        });
                    } catch (eEvt) {
                        try { line.onClick = function () { try { if (btn && typeof btn.onClick === "function") btn.onClick(); } catch (eLineClick2) {} }; } catch (eOC) {}
                    }
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
            // Keep the logo truly centered, but avoid auto-center remeasurement jitter during live resize.
            // We create a fill-width outer row, then manually position the fixed-width center lane.
            var outer = parent.add("group");
            outer.orientation   = "row";
            outer.alignment     = ["fill", "top"];
            outer.alignChildren = ["left", "center"];
            outer.margins       = [0, 8, 0, 6];
            outer.spacing       = 0;

            var LOGO_W = 240, LOGO_H = 121; // widened so the logo image is never clipped
            outer.minimumSize = [0, LOGO_H];
            outer.maximumSize = [10000, LOGO_H];

            // Use a stack so the fixed-width logo lane starts centered immediately on first paint,
            // before any manual recenter pass runs. We still keep the manual centering helper below
            // for resize changes, but this avoids the brief left snap on load/open.
            outer.orientation   = "stack";
            outer.alignChildren = ["center", "center"];

            var fillLane = outer.add("group");
            fillLane.orientation   = "row";
            fillLane.alignment     = ["fill", "fill"];
            fillLane.alignChildren = ["fill", "fill"];
            fillLane.margins       = 0;
            fillLane.spacing       = 0;
            try { fillLane.minimumSize = [0, LOGO_H]; } catch (eFL1) {}
            try { fillLane.maximumSize = [10000, LOGO_H]; } catch (eFL2) {}

            var centerLane = outer.add("group");
            centerLane.orientation   = "column";
            centerLane.alignment     = ["center", "center"];
            centerLane.alignChildren = ["center", "center"];
            centerLane.margins       = 0;
            centerLane.spacing       = 0;
            try { centerLane.minimumSize = [LOGO_W, LOGO_H]; } catch (eCL1) {}
            try { centerLane.preferredSize = [LOGO_W, LOGO_H]; } catch (eCL2) {}
            try { centerLane.maximumSize = [LOGO_W, LOGO_H]; } catch (eCL3) {}

            var logoFile = findShineLogoFileLocal();
            if (logoFile && logoFile.exists) {
                var img = centerLane.add("image", undefined, logoFile);
                img.alignment     = ["center", "center"];
                img.preferredSize = [LOGO_W, LOGO_H];
                img.minimumSize   = [LOGO_W, LOGO_H];
                img.maximumSize   = [LOGO_W, LOGO_H];
            } else {
                var fb = centerLane.add("statictext", undefined, "SHINE TOOLS (logo missing)");
                fb.alignment = ["center", "center"];
                fb.justify   = "center";
                fb.preferredSize = [260, LOGO_H];
                fb.minimumSize   = [260, LOGO_H];
                fb.maximumSize   = [260, LOGO_H];
            }

            try {
                if (!$.global.__ShineToolsLogoHeaders) $.global.__ShineToolsLogoHeaders = [];
                $.global.__ShineToolsLogoHeaders.push({ outer: outer, lane: centerLane, width: LOGO_W, height: LOGO_H });
            } catch (eReg) {}

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
            // Native text arrows with baseline compensation.
            // This keeps the original-style look, but uses a wrapper to lift the glyph
            // slightly so its optical center lines up with the section title text.
            var twirlWrap = parent.add("group");
            twirlWrap.orientation = "column";
            twirlWrap.alignChildren = ["left", "top"];
            twirlWrap.alignment = ["left", "center"];
            twirlWrap.spacing = 0;
            twirlWrap.margins = 0;
            twirlWrap.minimumSize = [UI.twirlW, UI.headerH];
            twirlWrap.maximumSize = [UI.twirlW, UI.headerH];
            twirlWrap.preferredSize = [UI.twirlW, UI.headerH];

            var twirlBox = twirlWrap.add("statictext", undefined, "▶");
            twirlBox.minimumSize = [UI.twirlW, Math.max(0, UI.headerH - 3)];
            twirlBox.maximumSize = [UI.twirlW, Math.max(0, UI.headerH - 3)];
            twirlBox.preferredSize = [UI.twirlW, Math.max(0, UI.headerH - 3)];
            twirlBox.justify = "center";
            twirlBox.alignment = ["left", "top"];
            twirlBox.margins = 0;
            twirlBox._collapsed = true;
            try { twirlBox.graphics.font = ScriptUI.newFont(twirlBox.graphics.font.name, "Bold", Math.max(13, twirlBox.graphics.font.size + 2)); } catch (eFont) {}

            // Bottom spacer physically lifts the native glyph inside the fixed-height header.
            var twirlBottomPad = twirlWrap.add("group");
            twirlBottomPad.minimumSize = [0, 3];
            twirlBottomPad.maximumSize = [10000, 3];
            twirlBottomPad.preferredSize = [0, 3];
            twirlBottomPad.margins = 0;

            function _twirlSetColor(rgba) {
                try { twirlBox.graphics.foregroundColor = twirlBox.graphics.newPen(twirlBox.graphics.PenType.SOLID_COLOR, rgba, 1); } catch (e) {}
            }
            twirlBox._stUpdateText = function () {
                try { twirlBox.text = twirlBox._collapsed ? "▶" : "▼"; } catch (eT) {}
                try { _twirlSetColor(twirlBox._collapsed ? SECTION_LABEL_COLOR_IDLE : SECTION_LABEL_COLOR_EXPANDED); } catch (eC) {}
            };
            try { twirlBox._stUpdateText(); } catch (eInit) {}
            return twirlBox;
        }

        // -------------------------
        // Accordion factory (reusable per-tab)
        // -------------------------

// -------------------------
// Accordion factory (reusable per-tab)
// -------------------------
function createAccordion(container, autoCollapseCheckboxOrNull, relayoutFn, accordionKeyOrNull) {

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

    // Session-only accordion model (all disk/prefs persistence removed)
    var defs = [];            // { title:String, buildFn:Function }
    var statesByTitle = {};   // { title: { collapsed:Boolean } }
    var currentOrder = [];    // live-session order only

    // ---- internal build (creates UI in current runtime order only) ----
    function _buildAccordionUI() {
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

        // finalize current live order list
        var order = [];
        // keep current in-memory order first (only if defs exist)
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
        currentOrder = order;

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
            // Section label base color
            _setLabelColor(label, SECTION_LABEL_COLOR_IDLE);
            try { label.graphics.font = ScriptUI.newFont(label.graphics.font.name, "Bold", label.graphics.font.size); } catch (e) {}

            makeDivider(section);

            var bodyWrap = section.add("group");
            bodyWrap.orientation   = "column";
            bodyWrap.alignChildren = ["fill", "top"];
            bodyWrap.alignment     = ["fill", "top"];

            var body = bodyWrap.add("group");
            body.orientation   = "column";
            // Tag this body so addGrid2 can identify the section host
            try { body._stSectionTitle = title; } catch (eTag1) {}
            try { body._stAccordionKey = accordionKeyOrNull || "SESSION_ONLY"; } catch (eTag2) {}

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
                    // Keep current button-order registry so rebuilt UI can honor the live/session order.
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
                try { if (twirlBox._stUpdateText) twirlBox._stUpdateText(); } catch (eTwirlUpdate) {}

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

                // Lightweight no-clipping nudge: when opening a section, ask only this section
                // and its accordion container to recalculate before the normal scoped relayout.
                // This avoids the heavier all-workspace settle that made toggles feel laggy.
                if (!v) {
                    try { if (body && body.layout) body.layout.layout(true); } catch (eLL1) {}
                    try { if (bodyWrap && bodyWrap.layout) bodyWrap.layout.layout(true); } catch (eLL2) {}
                    try { if (container && container.layout) container.layout.layout(true); } catch (eLL3) {}
                }

                if (!silent) safeRelayout();
}

            function _showReorderButtonsDialog(title, aKey, reg) {

                var used = {};
                reg = reg || [];

                try {

                    var dlg = new Window("dialog", "Reorder Buttons: " + title, undefined, { closeButton: true });

                    dlg.orientation = "column";

                    dlg.alignChildren = ["fill", "top"];

                    dlg.spacing = 10;

                    // Match the same left/right/top/bottom padding used by the section reorder
                    // and Library/Text Animator organize dialogs.
                    dlg.margins = [18, 10, 18, 10];

                    // Align this description's first letter with the visible left edge of the list box.
                    var infoWrap = dlg.add("group");
                    infoWrap.orientation = "row";
                    infoWrap.alignChildren = ["left", "top"];
                    infoWrap.alignment = ["fill", "top"];
                    infoWrap.spacing = 0;
                    infoWrap.margins = [0, 0, 0, 0];

                    var infoPad = infoWrap.add("statictext", undefined, "");
                    try { infoPad.minimumSize = [5, 1]; } catch (eInfoPad) {}
                    try { infoPad.maximumSize = [8, 1]; } catch (eInfoPad2) {}

                    var info = infoWrap.add("statictext", undefined, "Reorder buttons (affects grid order).");

                    info.alignment = ["fill", "top"];

                    var lb = dlg.add("listbox", undefined, [], { multiselect: false });

                    // Match the effective width of the shared Reorder Sections dialog.
                    // Sections request 220, but _shineShowReorderListDialog clamps listW to 260,
                    // which also lines up with the bottom ▲ ▼ OK Cancel row.
                    // Keep the current width/edge-aligned button row, but make this dialog
                    // roughly half as tall by shortening only the list box height.
                    lb.preferredSize = [260, 200];
                    lb.minimumSize = [260, 200];
                    lb.maximumSize = [260, 10000];

                    function addItem(labelText){

                        var it = lb.add('item', labelText);

                        it._id = String(labelText || '');

                    }

                    for (var ri2=0; ri2<reg.length; ri2++) {

                        var rid = String(reg[ri2]);

                        if (!used[rid]) { addItem(reg[ri2]); used[rid]=true; }

                    }

// No default preselection in reorder dialogs.

                    var controls = dlg.add("group");

                    controls.orientation = "row";

                    controls.alignChildren = ["left", "center"];

                    controls.spacing = 8;

                    // Arrow-only native buttons matching the section reordering controls.

                    function _makeDlgMiniArrowButton(parent, glyph, tip) {

                        var w = 24, h = 24;

                        var wrap = parent.add('group');
                        wrap.orientation   = 'stack';
                        wrap.alignChildren = ['fill','fill'];
                        wrap.alignment     = ['left','center'];
                        wrap.margins       = 0;
                        wrap.spacing       = 0;
                        try { wrap.minimumSize = [w, h]; } catch (eW0) {}
                        try { wrap.maximumSize = [w, h]; } catch (eW1) {}
                        try { wrap.preferredSize = [w, h]; } catch (eW2) {}

                        var btn = wrap.add('button', undefined, glyph);
                        btn.alignment = ['fill','fill'];
                        try { btn.minimumSize = [w, h]; } catch (eB0) {}
                        try { btn.maximumSize = [w, h]; } catch (eB1) {}
                        try { btn.preferredSize = [w, h]; } catch (eB2) {}
                        try { btn.helpTip = tip || ''; } catch (eTip2) {}
                        try { btn.justify = 'center'; } catch (eJ) {}
                        try { btn.graphics.font = ScriptUI.newFont('Helvetica', 'BOLD', 13); } catch (eF) {
                            try { btn.graphics.font = ScriptUI.newFont(btn.graphics.font.name, 'Bold', 13); } catch (eF2) {}
                        }
                        try { defocusButtonBestEffort(btn); } catch (eDF) {}
                        btn.onClick = function(){
                            try { btn.active = false; } catch (eA0) {}
                            try { if (typeof wrap.__onActivate === 'function') wrap.__onActivate(); } catch (eAct) {}
                            try { btn.active = false; } catch (eA1) {}
                        };
                        try { wrap.__button = btn; } catch (eWB) {}
                        return wrap;

                    }

                    // Keep arrows close together

                    var arrowGrp = controls.add('group');

                    arrowGrp.orientation = 'row';

                    arrowGrp.alignChildren = ['left','center'];

                    arrowGrp.spacing = 2;

                    arrowGrp.margins = 0;

                    var btnUp = _makeDlgMiniArrowButton(arrowGrp, '▲', 'Move up');

                    var btnDn = _makeDlgMiniArrowButton(arrowGrp, '▼', 'Move down');

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

                    var __controlsLeadSpacer = controls.add('statictext', undefined, '   ');

                    var __okPack     = __makeDlgCellBtn__(controls, 'OK', 70);

                    var btnOk        = __okPack.btn;

                    var __cancelPack = __makeDlgCellBtn__(controls, 'Cancel', 90);

                    var btnCancel    = __cancelPack.btn;

                    // Keep this row exactly as wide as the list box, with the arrows
                    // pinned to the left edge and OK / Cancel pinned to the right edge.
                    try { controls.alignment = ['center', 'top']; } catch (eRC0) {}
                    try { controls.spacing = 8; } catch (eRC1) {}
                    try { controls.minimumSize = [260, 24]; controls.preferredSize = [260, 24]; controls.maximumSize = [260, 24]; } catch (eRC1b) {}
                    try { arrowGrp.spacing = 2; } catch (eRC2) {}
                    try { arrowGrp.minimumSize = [50,24]; arrowGrp.preferredSize = [50,24]; arrowGrp.maximumSize = [50,24]; } catch (eRC2b) {}
                    try {
                        if (__controlsLeadSpacer) {
                            // 260 list width - 50 arrows - 70 OK - 90 Cancel - 3 row gaps of 8 = 26.
                            __controlsLeadSpacer.text = '';
                            __controlsLeadSpacer.minimumSize = [26, 1];
                            __controlsLeadSpacer.preferredSize = [26, 1];
                            __controlsLeadSpacer.maximumSize = [26, 1];
                        }
                    } catch (eRC3) {}
                    try { __okPack.cell.minimumSize = [70,24]; __okPack.cell.preferredSize = [70,24]; __okPack.cell.maximumSize = [70,24]; } catch (eRC4a) {}
                    try { btnOk.minimumSize.width = 70; btnOk.preferredSize.width = 70; btnOk.maximumSize.width = 70; } catch (eRC4) {}
                    try { __cancelPack.cell.margins = [0,0,0,0]; } catch (eRC5a) {}
                    try { __cancelPack.cell.minimumSize = [90,24]; __cancelPack.cell.preferredSize = [90,24]; __cancelPack.cell.maximumSize = [90,24]; } catch (eRC5b) {}
                    try { btnCancel.minimumSize.width = 90; btnCancel.preferredSize.width = 90; btnCancel.maximumSize.width = 90; } catch (eRC5) {}

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

                    btnUp.__onActivate = function(){ moveSel(-1); try { lb.active = true; } catch(eAFU) {} };

                    btnDn.__onActivate = function(){ moveSel(1); try { lb.active = true; } catch(eAFD) {} };

                    btnCancel.onClick = function(){ dlg.close(0); };

                    btnOk.onClick = function(){ dlg.close(1); };

                    var res = dlg.show();

                    if (res === 1) {

                        var outIds = [];

                        for (var li=0; li<lb.items.length; li++) {

                            try { outIds.push(String(lb.items[li]._id)); } catch (eX) {}

                        }

                        try {
                            if (!__ST_SECTION_BUTTONS[aKey]) __ST_SECTION_BUTTONS[aKey] = {};
                            __ST_SECTION_BUTTONS[aKey][title] = outIds.slice(0);
                        } catch (eRegSave) {}

                        // Rebuild the accordion UI (prevents duplicate UI nodes when sections have complex buildFns)

                        try { _buildAccordionUI(); } catch (eRB2) {}

                        try { safeRelayout(); } catch (eRL2) {}

                        // IMPORTANT: after rebuilding UI nodes, request a single debounced full palette relayout (avoids layout storms).

                        try { requestFullRelayoutSoon(); } catch (eFR) {}
                try { if (container && container.layout) container.layout.layout(true); } catch (eCL) {}
                try { if (container && container.parent && container.parent.layout) container.parent.layout.layout(true); } catch (eCPL) {}

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

                         var aKey = (body && body._stAccordionKey) ? body._stAccordionKey : "SESSION_ONLY";
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
        collapseAll: function() { try { collapseAllNow(); } catch (e) {} },
        getOrder: function() {
            try { return currentOrder ? currentOrder.slice(0) : []; } catch (e) {}
            return [];
        },
        getCollapsedMap: function() {
            var out = {};
            try {
                for (var k in statesByTitle) {
                    if (!statesByTitle.hasOwnProperty(k)) continue;
                    out[k] = !!(statesByTitle[k] && statesByTitle[k].collapsed);
                }
            } catch (e) {}
            return out;
        },
        setCollapsedMap: function(mapObj) {
            try {
                mapObj = mapObj || {};
                for (var k in mapObj) {
                    if (!mapObj.hasOwnProperty(k)) continue;
                    if (!statesByTitle[k]) statesByTitle[k] = { collapsed: true };
                    statesByTitle[k].collapsed = !!mapObj[k];
                }
                _buildAccordionUI();
                try { safeRelayout(); } catch (eRL3) {}
                try { requestFullRelayoutSoon(); } catch (eFR3) {}
            } catch (eSetCol) {}
        },
        setOrder: function(arr, skipSave) {
            try {
                currentOrder = (arr && arr.slice) ? arr.slice(0) : [];
                try {
                    if (defs && defs.length) {
                        var __orderedDefs1 = [];
                        var __usedDefs1 = {};
                        for (var __i1 = 0; __i1 < currentOrder.length; __i1++) {
                            var __t1 = String(currentOrder[__i1]);
                            for (var __j1 = 0; __j1 < defs.length; __j1++) {
                                if (defs[__j1] && defs[__j1].title === __t1 && !__usedDefs1[__t1]) {
                                    __orderedDefs1.push(defs[__j1]);
                                    __usedDefs1[__t1] = true;
                                    break;
                                }
                            }
                        }
                        for (var __k1 = 0; __k1 < defs.length; __k1++) {
                            var __d1 = defs[__k1];
                            var __dt1 = (__d1 && __d1.title) ? String(__d1.title) : "";
                            if (!__dt1 || __usedDefs1[__dt1]) continue;
                            __orderedDefs1.push(__d1);
                            __usedDefs1[__dt1] = true;
                        }
                        defs = __orderedDefs1;
                    }
                } catch (eSync1) {}
                _buildAccordionUI();
                try { safeRelayout(); } catch (eRL2) {}
                try { requestFullRelayoutSoon(); } catch (eFR2) {}
            } catch (eSetOrd) {}
        },
        showReorderSectionsDialog: function(dialogTitle) {
            try {
                var items = [];
                for (var i = 0; i < currentOrder.length; i++) {
                    items.push({ id: currentOrder[i], label: currentOrder[i] });
                }
                var outIds = _shineShowReorderListDialog(
                    dialogTitle || "Reorder Sections",
                    items,
                    {
                        infoText: (String(dialogTitle || "").indexOf("Text") >= 0) ? "Reorder sections for the TEXT tab." : "Reorder sections for the MAIN tab.",
                        dialogW: 0,
                        listW: 220,
                        listH: 300,
                        dialogPadLR: 18,
                        dialogPadTop: 10,
                        dialogPadBot: 10,
                        hideOriginalToggle: true,
                        compactSectionDialog: false
                    }
                );
                if (!outIds || !outIds.length) return;
                currentOrder = outIds.slice(0);
                try {
                    if (defs && defs.length) {
                        var __orderedDefs2 = [];
                        var __usedDefs2 = {};
                        for (var __i2 = 0; __i2 < currentOrder.length; __i2++) {
                            var __t2 = String(currentOrder[__i2]);
                            for (var __j2 = 0; __j2 < defs.length; __j2++) {
                                if (defs[__j2] && defs[__j2].title === __t2 && !__usedDefs2[__t2]) {
                                    __orderedDefs2.push(defs[__j2]);
                                    __usedDefs2[__t2] = true;
                                    break;
                                }
                            }
                        }
                        for (var __k2 = 0; __k2 < defs.length; __k2++) {
                            var __d2 = defs[__k2];
                            var __dt2 = (__d2 && __d2.title) ? String(__d2.title) : "";
                            if (!__dt2 || __usedDefs2[__dt2]) continue;
                            __orderedDefs2.push(__d2);
                            __usedDefs2[__dt2] = true;
                        }
                        defs = __orderedDefs2;
                    }
                } catch (eSync2) {}
                _buildAccordionUI();
                try { safeRelayout(); } catch (eRL) {}
                try { requestFullRelayoutSoon(); } catch (eFR) {}
            } catch (eDlg) {
                alert("Reorder failed: " + String(eDlg));
            }
        }
    };

    return api;
}

// Pass 4.7: expose accordion builder on ST.UI namespace (no behavior change)
try { ST.UI.createAccordion = createAccordion; } catch (e) {}

// =========================================================
        // MAIN TAB UI
        // =========================================================
        var root = tabMain.add("group");
        try { pal.__stMainTabRoot = root; } catch (eStoreMain) {}
        root.orientation   = "column";
        root.alignChildren = ["fill", "fill"];
        root.margins       = 0;
        root.spacing       = 0;

        // Workspace Manager launcher
        _addWorkspaceLauncherRow(root, "MAIN");

        // LOGO HEADER (shared helper)
        addLogoHeader(root);

        // CONTENT (accordion container)
        var content = root.add("group");
        try { pal.__stMainContentRoot = content; } catch (eStoreMainContent) {}
        content.orientation   = "column";
        content.alignChildren = ["fill", "top"];
        // Fill the available tab area so expanded Default/workspace sections relayout against
        // the docked panel height instead of being clipped against a top-sized content group.
        content.alignment     = ["fill", "fill"];
        try { content.maximumSize = [10000, 200000]; } catch (eContentMax) {}
        content.margins       = [10, 8, 14, 0];
        content.spacing       = 10;

                // FAVORITES BAR
        var favWrap = content.add("group");
        favWrap.orientation   = "column";
        favWrap.alignChildren = ["fill", "top"];
        favWrap.alignment     = ["fill", "top"];
        favWrap.margins       = ST_CONST.COLORS.TRANSPARENT_RGBA;
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
                    ST_CONST.COLORS.SHINE_YELLOW_RGBA,
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
        try { favAddBtn.alignment = ["left","bottom"]; favAddBtn.margins = [-10, 0, 0, 0]; } catch(eA) {}

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
                    var blank = favDD.add("item", String(favDD.__stFlashBlankText || " "));
                    blank._isBlank = true;
                    var __favIndent = "    ";
                    var favs = favLoad();
                    if (favs.length === 0) {
                        var empty = favDD.add("item", "(No files)");
                        empty.enabled = false;
                    } else {
                        for (var i = 0; i < favs.length; i++) {
                            var favEntry = favs[i];
                            var rawFav = _favEntryPath(favEntry);
                            if (!rawFav) continue;

                            if (_favIsDividerToken(rawFav)) {
                                var divLabel = _favDividerDisplay(_favDividerLabelFromToken(rawFav));
                                var divItem = favDD.add("item", divLabel);
                                divItem._isDivider = true;
                                divItem._fullText = divLabel;
                                try { divItem.enabled = false; } catch (eDivDis) {}
                                continue;
                            }

                            var __favShowOrig = false; try { __favShowOrig = (__ST_SESSION_MAIN_FAVORITES_SHOW_ORIGINAL__ === true); } catch (eFavShowOrig) {}
                            var displayName = String((__favShowOrig ? _stPrettyFileLabel(rawFav) : (_favEntryLabel(favEntry) || _stPrettyFileLabel(rawFav))) || "").replace(/^[\s\u00A0]+/, "");
                            var it = favDD.add("item", __favIndent + displayName);
                            it._fullText = __favIndent + displayName;
                            it._path = rawFav;
                            try { it.helpTip = displayName; } catch (eTip) {}
                        }
                    }

                    favDD.add("separator");
                    favDD.add("item", FAV_ACTION_CLEAR);
                    try { favDD.selection = 0; } catch (eSel) {}
                }

                    // Ensure popup width never exceeds control width
                    _applyDropdownLabelClamp(favDD);

                favRebuildDropdown();
                try { pal.__stFavRebuildDropdown = favRebuildDropdown; } catch (eFavHook) {}

                try {
                    var _openFavReorder = function () {
                        var favs = favLoad() || [];
                        if (!favs.length) { alert("No Library Elements to reorder."); return; }
                        var items = [];
                        for (var iFR = 0; iFR < favs.length; iFR++) {
                            var favEntry = favs[iFR];
                            var fp = _favEntryPath(favEntry);
                            if (!fp) continue;
                            if (_favIsDividerToken(fp)) {
                                var __favDivLbl = _favDividerDisplay(_favDividerLabelFromToken(fp));
                                items.push({ id: fp, label: __favDivLbl, _isDivider: true });
                            } else {
                                items.push({ id: fp, label: String(_favEntryLabel(favEntry) || _stPrettyFileLabel(fp) || "").replace(/^[\s\u00A0]+/, "") });
                            }
                        }
                        var outFav = _shineShowReorderListDialog(
                            "Organize Library Elements",
                            items,
                            ST.UI.Organize.buildConfig("library_elements", {
                                onAddFiles: function(lb, dlg, opts) {
                                    var picked = favOpenDialogFromDefaultFolder();
                                    if (!picked) return false;
                                    if (!(picked instanceof Array)) picked = [picked];

                                    var insertAt = lb.items.length;
                                    try {
                                        if (lb.selection) {
                                            var selId = String(lb.selection._id || "");
                                            for (var si = 0; si < lb.items.length; si++) {
                                                if (String(lb.items[si]._id || "") === selId) { insertAt = si + 1; break; }
                                            }
                                        }
                                    } catch (eFavSelIns) {}

                                    var addedAny = false;
                                    for (var pi = 0; pi < picked.length; pi++) {
                                        var f = picked[pi];
                                        if (!f || !f.exists) continue;
                                        var favPath = String(f.fsName || "");
                                        if (!favPath) continue;

                                        var exists = false;
                                        for (var li = 0; li < lb.items.length; li++) {
                                            try { if (String(lb.items[li]._id || "") === favPath) { exists = true; break; } } catch (eFavDup) {}
                                        }
                                        if (exists) continue;

                                        var addLabel = String(_stPrettyFileLabel(favPath) || "").replace(/^[\s ]+/, "");
                                        var itAdded = lb.add("item", addLabel);
                                        try { itAdded._id = favPath; } catch (eFavSet0) {}
                                        try { itAdded._label = addLabel; } catch (eFavSet1) {}
                                        try { itAdded._isDivider = false; } catch (eFavSet2) {}
                                        try { itAdded.helpTip = addLabel; } catch (eFavSet3) {}
                                        try { itAdded.enabled = true; } catch (eFavSet4) {}
                                        try { itAdded.selected = true; } catch (eFavSet5) {}
                                        try {
                                            if (typeof insertAt === "number" && insertAt < (lb.items.length - 1)) {
                                                itAdded.index = insertAt;
                                                insertAt++;
                                            }
                                        } catch (eFavReindex) {}
                                        addedAny = true;
                                    }
                                    return addedAny;
                                },
                                originalFilenameForId: function(id) { return _stPrettyFileLabel(id); },
                                displayLabelForId: function(id, label, obj, showOriginalFilename) {
                                    if (obj && obj._isDivider) return label;
                                    if (!showOriginalFilename && label) return String(label);
                                    return _stPrettyFileLabel(id);
                                },
                                sectionChoices: FAV_DEFAULT_DIVIDERS,
                                sectionTokenForChoice: function(choice) { return _favDividerToken(choice); },
                                newDividerTokenForLabel: function(label) { return _favDividerToken(label); },
                                newDividerDisplayForLabel: function(label) { return _favDividerDisplay(label); },
                                initialShowOriginalFilename: (__ST_SESSION_MAIN_FAVORITES_SHOW_ORIGINAL__ === true)
                            })
                        );
                        if (!outFav || !outFav.length) return;
                        try { __ST_SESSION_MAIN_FAVORITES_SHOW_ORIGINAL__ = (outFav.__stShowOriginalFilename === true); } catch (eFavShowSave) {}

                        var outEntries = [];
                        for (var iFO = 0; iFO < outFav.length; iFO++) {
                            var obj = outFav[iFO];
                            var outId = String(obj.id || "");
                            if (!outId) continue;
                            if (_favIsDividerToken(outId)) {
                                outEntries.push(outId);
                            } else {
                                outEntries.push(_favMakeEntry(outId, String(obj.label || "")));
                            }
                        }

                        try { outEntries = _favEnsureDefaultDividers(outEntries); } catch (eFavDivSave) {}
                        favSave(outEntries);
                        favRebuildDropdown();
                        try { _fitDropdownPopupToContent(favDD, { minW: 160, maxW: 900, padW: 44 }); } catch (eFit2) {}

                        try {
                            var __wsName = String((pal && pal.__stCurrentWorkspaceName) ? pal.__stCurrentWorkspaceName : "");
                            if (__wsName && typeof _stSaveWorkspaceByName === "function") _stSaveWorkspaceByName(__wsName);
                        } catch (eWSSave) {}
                    };
                    var _favReorderMouse = function(){
                        var ks = null; try { ks = ScriptUI.environment.keyboardState; } catch (eKSF) {}
                        if (ks && ks.altKey) { _openFavReorder(); }
                    };
                    favStar.addEventListener("mousedown", _favReorderMouse);
                    favLbl.addEventListener("mousedown", _favReorderMouse);
                } catch (eFavReorder) {}

                // Keep the popup list tight to content (no excessive empty space on the right)
                _fitDropdownPopupToContent(favDD, { minW: 160, maxW: 520, padW: 44 });
                try {
                    favDD.onActivate = function () {
                        try { ST.UI.Dropdown.markInteraction(favDD, 5000); } catch (eMarkFav) {}
                        _fitDropdownPopupToContent(favDD, { minW: 160, maxW: 520, padW: 44 });
                    };
                    favDD.onMouseDown = favDD.onActivate; // some builds fire mouse down earlier than activate
                } catch (ePop) {}

                (favAddBtn.__button || favAddBtn).onClick = function () {
                    if (!requireProject()) return;

                    var ks = null;
                    try { ks = ScriptUI.environment.keyboardState; } catch (eKs) {}
                    var doImport = false;
                    try { doImport = !!(ks && ks.metaKey); } catch (eDo) {}

                    var picked = favOpenDialogFromDefaultFolder(); // multi-select enabled
                    if (!picked) return;

                    // Normalize to array
                    if (!(picked instanceof Array)) picked = [picked];

                    // Add to list (no import on normal click)
                    for (var i = 0; i < picked.length; i++) {
                        var f = picked[i];
                        if (!f || !f.exists) continue;
                        favAddPath(f.fsName);
                    }
                    favRebuildDropdown();
                    try { relayout(); } catch (eRLAdded0) {}
                    try { _ddFlashAddedFrames(favDD, 26, favRebuildDropdown); } catch(eMsg) {}
                    // Cmd+click = add to list AND import into bin + active comp timeline.
                    if (doImport) {
                        for (var j = 0; j < picked.length; j++) {
                            var ff = picked[j];
                            if (!ff || !ff.exists) continue;
                            try { favImportToBinAndTimeline(ff); } catch (eImp) {}
                        }
                    }

                    try { favAddBtn.visible = true; favAddBtn.enabled = true; } catch (eV) {}
                    // Do not relayout after the flash is shown; a layout pass here can repaint
                    // the closed dropdown back to blank before the 30-frame message is visible.
                };

                favDD.onChange = function () {
                    try {
                        try {
                            if (favDD.__stShowingAddedFlash === true) return;
                            if (favDD.__stSuppressOnChangeUntil && (new Date()).getTime() < favDD.__stSuppressOnChangeUntil) return;
                        } catch (eFavFlashGuard) {}
                        if (favDD.__shineProgrammatic) {
                            favDD.__shineProgrammatic = false;
                            return;
                        }
                        if (!favDD.selection) return;

                        var item = favDD.selection;

                        // Cmd+click (modified selection) removes the item from the list.
                        if (item && item._path && _isCmdDown()) {
                            try {
                                favRemovePath(item._path);
                                favRebuildDropdown();
                                relayout();
                            } catch (eR) {}
                            ST.UI.Dropdown.reset(favDD, 1);
                            return;
                        }
                        if (item && item._isBlank) {
                            ST.UI.Dropdown.reset(favDD, 1);
                            return;
                        }
                        var choice = item.text;

                        if (choice === "(No files)") { ST.UI.Dropdown.reset(favDD, 1); return; }

                        if (choice === FAV_ACTION_CLEAR) {
                            favClear();
                            favRebuildDropdown();
                            relayout();
                            ST.UI.Dropdown.reset(favDD, 1);
                            return;
                        }

                        var path = String(item._path || "");
                        if (!path) {
                            ST.UI.Dropdown.reset(favDD, 1);
                            return;
                        }

                        var fileObj = new File(path);
                        if (!fileObj.exists) {
                            alert("This file can’t be found:\n" + path + "\n\nIt will stay in Favorites until you Clear Favorites.");
                            ST.UI.Dropdown.reset(favDD, 1);
                            return;
                        }

                        try { favImportToBinAndTimeline(fileObj); } catch (eFavImp) {
                            try { alert("Favorite import failed:\n" + eFavImp.toString()); } catch (eFavImp2) {}
                        }
                        ST.UI.Dropdown.reset(favDD, 1);
                    } catch (eFavSel) {
                        try { alert("Favorites dropdown error:\n" + eFavSel.toString()); } catch (eFavSel2) {}
                    }
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
        try { pal.__stMainAccordionHost = accHost; } catch (eStoreMainAccHost) {}
        accHost.orientation   = "column";
        accHost.alignChildren = ["fill", "top"];
        // IMPORTANT: keep the accordion host top-sized, not fill-sized.
        // When it is ["fill", "fill"], ScriptUI can clip the last Default sections
        // inside this internal group, leaving unused panel space below. Top-sizing lets
        // the section list flow naturally down to the actual panel edge.
        accHost.alignment     = ["fill", "top"];
        try { accHost.maximumSize = [10000, 200000]; } catch (eAccMax) {}
        accHost.margins       = ST_CONST.COLORS.TRANSPARENT_RGBA;
        accHost.spacing       = 10;

        var mainAcc = createAccordion(accHost, null, function(){ requestRelayoutSoon(content, 40); }, "MAIN_UI");
        try { pal.__stMainAccordion = mainAcc; } catch (eMainAcc0) {}

// =========================
// Sections / buttons (MAIN)  (re-orderable with header chevrons)
// =========================
mainAcc.defineSection("ADD LAYER", function(body){
    addGrid2(body, [
        { text: "SOLID...", onClick: addSolidNativePrompt, helpTip: "Open the native Solid dialog." },
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
        { text: "WIGGLE", onClick: doWiggle },
        { text: "INERTIAL BOUNCE", onClick: doInertialBounce, helpTip: "Apply the Inertial Bounce expression." },
        { text: "HARD BOUNCE", onClick: doHardBounce, helpTip: "Apply the Hard Bounce expression." }
    ]);
});

mainAcc.defineSection(ST_LABELS.UTILITIES, function(body){
    addGrid2(body, [
        {
	            text: "COPY UNIQUE COMP",
	            onClick: copyUniqueCompDeepToPrecompsFromSelectedLayer,
	            helpTip: "Duplicates the selected precomp AND all nested precomps."
	        },
        {
            text: "ADD PHOTO BORDER",
            onClick: function () { addPhotoBorder_Util(false); },
            helpTip: "Create a photo border rig around the selected image."
        },
        {
            text: "EXTEND BORDERS",
            onClick: extendBorders_Util,
            helpTip: "Adds CC Repetile to the selected layer, expands 1000px on all sides, and sets Tiling to Unfold."
        }
]);
});

mainAcc.defineSection("STROKE", function(body){
    addGrid2(body, [
        { text: "ANIMATED STROKE", onClick: addTrimLineAnimateEnd_30f, helpTip: "Create a Trim Line shape and animate the End value." },
        { text: "ANIMATE STROKE START", onClick: trimPathsAnimateSelectedShapeStart_30f, helpTip: "Add/animate Trim Paths Start on the selected shape." },
        { text: "TRIM PATHS", onClick: trimPathsAnimateSelectedShape_30f, helpTip: "Add Trim Paths to the selected shape layer and animate it." }
    ]);
});

mainAcc.defineSection("TIMELINE", function(body){
    addGrid2(body, [
        {
        text: "EXTEND PRECOMP",
        onClick: extendPrecompToCTI_Util,
        helpTip: "Extends selected precomp (and layers inside) so the last visible frame lands on the CTI."
        },
        { text: "TRIM LAYER ABOVE", onClick: function () { trimLayerToNeighbor(true); }, helpTip: "Trim selected layer(s) to the nearest unselected layer above." },
        { text: "FRAME OFFSET", onClick: function () { offsetSelectedLayers_ShineTools(false); }, helpTip: "Offset selected layers by a linear frame offset." },
        { text: "TRIM LAYER BELOW", onClick: function () { trimLayerToNeighbor(false); }, helpTip: "Trim selected layer(s) to the nearest unselected layer below." },
        { text: "CURVE OFFSET", onClick: function () { offsetSelectedLayers_ShineTools(true); }, helpTip: "Offset selected layers using the curve offset dialog." }
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
        { text: "PRORES 422", onClick: function () { renderPRORES422WithSaveDialog(false, false); },
  helpTip: "Save + auto-render ProRes 422." },
        {
            text: "FRAME AS .PSD",
            onClick: function () { saveCurrentFramePSDOrJPG(true); },
            helpTip: "Save current frame as .PSD (Output Module: Photoshop)."
        }]);
});

// Build accordion in current live session order
mainAcc.build();

var collapseGap = content.add("group");
        // No extra spacer below the accordion; it caused the Default section list to clip early
        // in docked panels.
        collapseGap.minimumSize = [0, 0];
        collapseGap.preferredSize = [0, 0];
        collapseGap.maximumSize = [10000, 0];

        var utilRow = content.add("group");
        utilRow.orientation   = "row";
        utilRow.alignChildren = ["left", "top"];
        utilRow.alignment     = ["fill", "top"];
        utilRow.margins       = 0;
        utilRow.spacing       = 0;
        try { utilRow.minimumSize = [0,0]; utilRow.preferredSize = [0,0]; utilRow.maximumSize = [10000,0]; } catch(eUtilRowZero) {}

// TEXT tab content is built on demand in _buildTextTabIfNeeded() to speed initial load.
        // Default to MAIN tab handled by _selectTopTab("MAIN") above.
        // Enforce a minimum panel size so footer never gets clipped
        try { pal.minimumSize = [300, 260]; } catch (eMin) {}

        // --------------------------------------------------
        // Panel close/hide cleanup
        // --------------------------------------------------
        function _stPanelCloseCleanup() {
            try {
                if (!(myPal instanceof Window)) return;
            } catch (eDock) {}
            try { $.global.__ShineToolsClosing__ = true; } catch (e0) {}
            try { $.global.__ShineToolsIsLiveResizing__ = false; } catch (e0a) {}
            try { if (__resizeTask) app.cancelTask(__resizeTask); } catch (e1) {}
            try { if (_stHoverTaskId !== null) app.cancelTask(_stHoverTaskId); } catch (e4) {}
            try { $.global.__ShineTools_pal = null; } catch (e6) {}
            try { $.global.__ShineToolsInitialized = false; } catch (e7) {}
        }

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

        function _clampAllDropdowns() {
            try { if ($.global.__ST_isSafeToTouchUI__ && !$.global.__ST_isSafeToTouchUI__()) return; } catch (eSafeDD0) { return; }
            try {
                var dds = $.global.__ShineToolsAllDropdowns;
                if (dds && dds.length) {
                    for (var di = 0; di < dds.length; di++) {
                        _applyDropdownLabelClamp(dds[di]);
                    }
                }
            } catch (eDD) {}
        }

        var __lastLiveResizeMs = 0;
        var __LIVE_RESIZE_INTERVAL_MS = 120;

        function _stNowMsLocal() {
            try { return (new Date()).getTime(); } catch (eNow) {}
            return 0;
        }

        $.global[__RESIZE_TICK_FN] = function () {
            __resizeTask = 0;
            try { if ($.global.__ST_NO_FORCE_RELAYOUT_DIAG_ACTIVE__ === true) return; } catch (eDiagResize) { return; }
            try { if ($.global.__ShineToolsClosing__ === true) return; } catch (ePC5) {}
            try { if ($.global.__ST_isSafeToTouchUI__ && !$.global.__ST_isSafeToTouchUI__()) return; } catch (eSafeResize) { return; }
            try { pal.layout.layout(true); } catch (e1) {}
            try { __stCenterLogoHeaders(); } catch (e1a) {}
            try { pal.layout.resize(); } catch (e2) {}
            try { __stCenterLogoHeaders(); } catch (e2a) {}
            _clampAllDropdowns();
            try { if (pal && pal.update) pal.update(); } catch (e3) {}
        };

        function requestFullRelayoutSoon() {
            try { if ($.global.__ST_NO_FORCE_RELAYOUT_DIAG_ACTIVE__ === true) return; } catch (eDiagFull) { return; }
            try { if ($.global.__ShineToolsClosing__ === true) return; } catch (e0) {}
            try { if ($.global.__ST_isSafeToTouchUI__ && !$.global.__ST_isSafeToTouchUI__()) return; } catch (eSafeFull) { return; }
            try { if (pal && pal.layout) pal.layout.resize(); } catch (e5) {}
            try { __stCenterLogoHeaders(); } catch (e6) {}
            try { _clampAllDropdowns(); } catch (e7) {}
            try { if (pal && pal.update) pal.update(); } catch (e8) {}
        }

        // Expose relayout request so long operations can refresh UI after blocking calls (render, etc.)
        try { $.global.__ShineTools_RequestFullRelayoutSoon__ = requestFullRelayoutSoon; } catch (eExp) {}

        var __lastLiveResizeW = -1;
        var __lastLiveResizeH = -1;
        var __stLiveResizeChromeFrozen = false;
        var __stLiveResizeFrozenCtrls = [];

        function __stCenterLogoHeaders() {
            try {
                var arr = $.global.__ShineToolsLogoHeaders;
                if (!arr || !arr.length) return;
                for (var i = 0; i < arr.length; i++) {
                    var item = arr[i];
                    try {
                        if (!item || !item.outer || !item.lane) continue;
                        var outerW = 0, laneW = 0, y = 0;
                        try {
                            if (item.outer.size) outerW = item.outer.size[0];
                            if (item.lane.size) laneW = item.lane.size[0];
                        } catch (eSz) {}
                        if (outerW <= 0) {
                            try { outerW = item.outer.bounds[2] - item.outer.bounds[0]; } catch (eB0) {}
                        }
                        if (laneW <= 0) {
                            try { laneW = item.lane.bounds[2] - item.lane.bounds[0]; } catch (eB1) {}
                        }
                        if (laneW <= 0 && item.width) laneW = item.width;
                        try { y = item.lane.location ? item.lane.location[1] : 0; } catch (eY) { y = 0; }
                        if (outerW > 0 && laneW > 0) {
                            var x = Math.round((outerW - laneW) / 2);
                            try { item.lane.location = [x, y]; } catch (eLoc) {}
                        }
                    } catch (eOne) {}
                }
            } catch (e) {}
        }

        try { $.global.__ShineToolsCenterLogoHeaders__ = __stCenterLogoHeaders; } catch (eExpLogo) {}

        function __stFreezeCtrlSize(ctrl) {
            try {
                if (!ctrl || ctrl.__stFrozenByLiveResize) return;
                var w = 0, h = 0;
                try {
                    if (ctrl.size) { w = ctrl.size[0]; h = ctrl.size[1]; }
                    if ((!w && w !== 0) || (!h && h !== 0)) {
                        w = ctrl.bounds[2] - ctrl.bounds[0];
                        h = ctrl.bounds[3] - ctrl.bounds[1];
                    }
                } catch (eB) {}
                if (w <= 0 || h <= 0) return;
                ctrl.__stOldMinSize = ctrl.minimumSize;
                ctrl.__stOldPrefSize = ctrl.preferredSize;
                ctrl.__stOldMaxSize = ctrl.maximumSize;
                try { ctrl.minimumSize = [w, h]; } catch (e0) {}
                try { ctrl.preferredSize = [w, h]; } catch (e1) {}
                try { ctrl.maximumSize = [w, h]; } catch (e2) {}
                ctrl.__stFrozenByLiveResize = true;
                __stLiveResizeFrozenCtrls.push(ctrl);
            } catch (e) {}
        }

        function __stFreezeLiveResizeChrome() {
            if (__stLiveResizeChromeFrozen) return;
            __stLiveResizeChromeFrozen = true;
            __stLiveResizeFrozenCtrls = [];
            try { __stFreezeCtrlSize(tabBarLeft); } catch (e0) {}
            try { __stFreezeCtrlSize(tabBarRight); } catch (e1) {}
            try { __stFreezeCtrlSize(tabLblMain); } catch (e2) {}
            try { __stFreezeCtrlSize(tabLblText); } catch (e3) {}
            try { __stFreezeCtrlSize(tabLblRequests); } catch (e4) {}
            try { __stFreezeCtrlSize(tabLblUpdates); } catch (e5) {}
            try { __stFreezeCtrlSize(tabLblHelp); } catch (e6) {}
            try { __stFreezeCtrlSize(wsMgrBackBtn); } catch (e9) {}
            try { __stFreezeCtrlSize(wsMgrTitle); } catch (e10) {}
        }

        function __stUnfreezeLiveResizeChrome() {
            var arr = __stLiveResizeFrozenCtrls || [];
            for (var i = 0; i < arr.length; i++) {
                var ctrl = arr[i];
                try {
                    if (!ctrl) continue;
                    try { if (ctrl.__stOldMinSize !== undefined) ctrl.minimumSize = ctrl.__stOldMinSize; } catch (e0) {}
                    try { if (ctrl.__stOldPrefSize !== undefined) ctrl.preferredSize = ctrl.__stOldPrefSize; } catch (e1) {}
                    try { if (ctrl.__stOldMaxSize !== undefined) ctrl.maximumSize = ctrl.__stOldMaxSize; } catch (e2) {}
                    try { ctrl.__stFrozenByLiveResize = false; } catch (e3) {}
                } catch (e) {}
            }
            __stLiveResizeFrozenCtrls = [];
            __stLiveResizeChromeFrozen = false;
        }

        pal.onResizing = function () {
            _cancelResizeTask();
            try { $.global.__ShineToolsIsLiveResizing__ = true; } catch (eFlag0) {}
            try { if ($.global.__ST_NO_FORCE_RELAYOUT_DIAG_ACTIVE__ === true) return; } catch (eDiagResizeA) { return; }
            try { if (pal && pal.layout) pal.layout.resize(); } catch (e0) {}
            try { __stCenterLogoHeaders(); } catch (e0a) {}
            try { if (pal && pal.update) pal.update(); } catch (e1) {}
        };

        pal.onResize = function () {
            try { $.global.__ShineToolsIsLiveResizing__ = false; } catch (eFlag1) {}
            __lastLiveResizeW = -1;
            __lastLiveResizeH = -1;
            __lastLiveResizeMs = 0;
            try { if ($.global.__ST_NO_FORCE_RELAYOUT_DIAG_ACTIVE__ === true) return; } catch (eDiagResizeB) { return; }

            try { if (pal && pal.layout) pal.layout.resize(); } catch (e0) {}
            try { __stCenterLogoHeaders(); } catch (e1) {}
            try { _clampAllDropdowns(); } catch (e2) {}
            try { if (pal && pal.update) pal.update(); } catch (e3) {}
        };

        function _stApplyInitialWorkspaceOnLaunch() {
            try {
                try { _stEnsureDefaultWorkspaceExists(_stCaptureWorkspaceState()); } catch (eDef0) {}

                var names = [];
                try { names = _stListWorkspaceNames() || []; } catch (eNames) { names = []; }

                if (!names || !names.length) {
                    try { pal.__stCurrentWorkspaceName = ""; } catch (e0a) {}
                    try { pal.__stPendingWorkspaceName = ""; } catch (e0b) {}
                    try { pal.__stStartupAppliedWorkspaceName = ""; } catch (e0c) {}
                    try { pal.__stWorkspaceStatusName = ""; } catch (e0d) {}
                    try { _stWriteLastUsedWorkspaceName(""); } catch (e0e) {}
                    try { _updateWorkspaceStatusLabel(); } catch (e0f) {}
                    return;
                }

                var wanted = "";
                try { wanted = String(_stReadLastUsedWorkspaceName() || ""); } catch (e1) { wanted = ""; }
                wanted = String(wanted || "").replace(/^\s+|\s+$/g, "");

                var exists = false;
                if (wanted) {
                    for (var i = 0; i < names.length; i++) {
                        try { if (String(names[i] || "") === wanted) { exists = true; break; } } catch (e1a) {}
                    }
                }
                if (!exists) {
                    try { wanted = String(names[0] || ""); } catch (e2) { wanted = ""; }
                }
                if (!wanted) {
                    try { _updateWorkspaceStatusLabel(); } catch (e3) {}
                    return;
                }

                try { _stLoadWorkspaceByName(wanted, { syncDropdown: true }); } catch (e4) {}
            } catch (eInitWS) {}
        }

        try { _stApplyInitialWorkspaceOnLaunch(); } catch (eInitWS2) {}

        relayout();
        try { __stCenterLogoHeaders(); } catch (eCen0) {}
                try { _applyDefaultHelpTips(pal); } catch(eTT) {}
        try { _updateWorkspaceStatusLabel(); } catch (eStat0) {}
        try { if (pal.layout) pal.layout.layout(true); } catch (eStat1) {}
        try { _updateWorkspaceStatusLabel(); } catch (eStat2) {}

        return pal;
    }

    // ============================================================
    // Init
    // ============================================================
    var myPal = buildUI(thisObj);

    // ------------------------------------------------------------
    // DEV SANITY CHECKS (no user-facing behavior changes)
    // Helps catch missing helpers after refactors when ST.DEBUG = true.
    // ------------------------------------------------------------
    function ST_DEBUG_VALIDATE_SYNTAX() {
        try {
            var missing = [];
            if (typeof isSolidFootageSafe !== "function") missing.push("isSolidFootageSafe");
            if (typeof isSolidFootageItem !== "function") missing.push("isSolidFootageItem");
            if (typeof _stGetOrCreateCanonicalSolidsFolderRoot !== "function") missing.push("_stGetOrCreateCanonicalSolidsFolderRoot");
            if (typeof _stGetSharedRootFolder !== "function") missing.push("_stGetSharedRootFolder");
            if (typeof _stFrameOffset_addFocusSink !== "function") missing.push("_stFrameOffset_addFocusSink");
            if (typeof _stFrameOffset_defocus !== "function") missing.push("_stFrameOffset_defocus");
            if (missing.length) {
                try { $.writeln("[ShineTools][DEBUG] Missing helpers: " + missing.join(", ")); } catch (e0) {}
            } else {
                try { $.writeln("[ShineTools][DEBUG] Sanity check OK"); } catch (e1) {}
            }
        } catch (e) {
            try { $.writeln("[ShineTools][DEBUG] Sanity check error: " + e.toString()); } catch (e2) {}
        }
    }

    try { if (ST && ST.DEBUG === true) ST_DEBUG_VALIDATE_SYNTAX(); } catch (eDbg) {}

    // ------------------------------------------------------------
    // Launch startup check: AE File/Network scripting permission only.
    // 2026-05-05: Restored ONLY the check for:
    //   Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network
    // Kept removed: setup takeover panel, Modern JS launch check, write-permission probe cleanup,
    // temp test-solid cleanup, and any resize hooks / delayed layout tasks.
    // ------------------------------------------------------------
    function _stIsFileNetworkAccessAllowedAtLaunch() {
        try {
            return app.preferences.getPrefAsBool("Main Pref Section", "Pref_SCRIPTING_FILE_NETWORK_SECURITY") === true;
        } catch (ePref) {}

        // Fallback only if the preference cannot be read in this AE build.
        // Keep this tiny and self-cleaning; do not create project items or relayout the UI.
        var f = null;
        try {
            f = new File(Folder.temp.fsName + "/st_file_network_access_test.txt");
            try { if (f.exists) f.remove(); } catch (eRm0) {}
            if (!f.open("w")) return false;
            f.encoding = "UTF-8";
            f.write("test");
            f.close();
            try { f.remove(); } catch (eRm1) {}
            return true;
        } catch (eProbe) {
            try { if (f && f.opened) f.close(); } catch (eClose) {}
            return false;
        }
    }

    function _stShowNetworkAccessSetupRequiredPanel() {
        try {
            if (!myPal) return;

            var host = null;
            try { host = myPal.__stTabStack || myPal; } catch (eHost0) { host = myPal; }
            if (!host) return;

            // Hide normal tab bodies, but leave the native top tab/header area visible.
            try { if (myPal.__stTabMain) myPal.__stTabMain.visible = false; } catch (eH0) {}
            try { if (myPal.__stTabText) myPal.__stTabText.visible = false; } catch (eH1) {}
            try { if (myPal.__stTabRequests) myPal.__stTabRequests.visible = false; } catch (eH2) {}
            try { if (myPal.__stTabUpdates) myPal.__stTabUpdates.visible = false; } catch (eH3) {}
            try { if (myPal.__stTabHelp) myPal.__stTabHelp.visible = false; } catch (eH4) {}
            try { if (myPal.__stTabWorkspaceManager) myPal.__stTabWorkspaceManager.visible = false; } catch (eH5) {}

            if (myPal.__stNetworkAccessWarnPanel) {
                try { myPal.__stNetworkAccessWarnPanel.visible = true; } catch (eOld0) {}
                try { if (myPal.layout) myPal.layout.layout(true); } catch (eOld1) {}
                return;
            }

            var shineYellow = [1.0, 0.82, 0.2, 1.0];

            var warnPanel = host.add("panel", undefined, "Setup Required");
            myPal.__stNetworkAccessWarnPanel = warnPanel;
            warnPanel.orientation = "column";
            warnPanel.alignChildren = ["fill", "top"];
            warnPanel.margins = 14;
            warnPanel.spacing = 12;
            try { warnPanel.alignment = ["fill", "fill"]; } catch (eA0) {}

            var bodyBox = warnPanel.add("panel");
            bodyBox.orientation = "column";
            bodyBox.alignChildren = ["fill", "top"];
            bodyBox.margins = 14;
            bodyBox.spacing = 12;
            try { bodyBox.alignment = ["fill", "top"]; } catch (eA1) {}
            var contentRow = bodyBox.add("group");
            contentRow.orientation = "row";
            contentRow.alignChildren = ["left", "top"];
            contentRow.spacing = 14;
            contentRow.margins = 0;
            contentRow.alignment = ["fill", "top"];

            var iconCol = contentRow.add("group");
            iconCol.orientation = "column";
            iconCol.alignChildren = ["center", "top"];
            iconCol.spacing = 0;
            iconCol.margins = 0;
            try { iconCol.preferredSize = [130, -1]; } catch (eIC0) {}

            // Native text glyph, not custom drawing/onDraw. Use a larger warning icon block
            // so the setup panel fills the available space better without reintroducing custom graphics.
            var warnIcon = iconCol.add("statictext", undefined, "⚠");
            warnIcon.alignment = ["center", "top"];
            try { warnIcon.preferredSize = [130, 110]; } catch (eI0) {}
            try {
                var iconFont = warnIcon.graphics.font;
                warnIcon.graphics.font = ScriptUI.newFont(iconFont.name, "Bold", iconFont.size + 64);
            } catch (eI1) {}
            try {
                warnIcon.graphics.foregroundColor = warnIcon.graphics.newPen(warnIcon.graphics.PenType.SOLID_COLOR, shineYellow, 1);
            } catch (eI2) {}

            var textCol = contentRow.add("group");
            textCol.orientation = "column";
            textCol.alignChildren = ["fill", "top"];
            textCol.spacing = 10;
            textCol.margins = 0;
            textCol.alignment = ["fill", "top"];

            var headerText = textCol.add("statictext", undefined, "ShineTools needs this setting enabled:");
            headerText.alignment = ["fill", "top"];
            try {
                var headerFont = headerText.graphics.font;
                headerText.graphics.font = ScriptUI.newFont(headerFont.name, "Bold", headerFont.size + 1);
            } catch (eF0) {}

            var bodyText = textCol.add("statictext", undefined,
                "Fix steps:\n" +
                "\u2022 Settings > Scripting & Expressions > Allow Scripts\n" +
                "  to Write Files and Access Network\n\n" +
                "\u2022 Restart After Effects",
                { multiline: true }
            );
            bodyText.alignment = ["fill", "top"];
            try { bodyText.preferredSize = [Math.max(280, myPal.size[0] - 210), -1]; } catch (eT0) {}

            try { if (host.layout) host.layout.layout(true); } catch (eL0) {}
            try { if (myPal.layout) myPal.layout.layout(true); } catch (eL1) {}
            try { if (myPal.update) myPal.update(); } catch (eU0) {}
        } catch (ePanel) {
            try {
                alert(
                    "ShineTools needs this After Effects setting enabled:\n\n" +
                    "Settings > Scripting & Expressions > Allow Scripts to Write Files and Access Network\n\n" +
                    "Enable it, then restart After Effects."
                );
            } catch (eAlert) {}
        }
    }

    try {
        if (!_stIsFileNetworkAccessAllowedAtLaunch()) {
            _stShowNetworkAccessSetupRequiredPanel();
        }
    } catch (eLaunchNetworkCheck) {}

// Expose pal globally, but disable startup force-relayout behavior for this stability test.
// 2026-05-05: The remaining reported freeze appears to happen during AE/ShineTools startup.
// For this build, do NOT perform the old startup "kick" layout pass and do NOT queue the
// delayed docked-panel post-paint settle scheduleTask. Render/modal safety gates remain intact.
try { $.global.__ShineTools_pal = myPal; } catch (e0) {}
try { $.global.__ShineToolsClosing__ = false; } catch (e0a) {}
try { $.global.__ShineToolsIsLiveResizing__ = false; } catch (e0aa) {}

try { $.global.__ShineToolsInitialized = true; } catch (e0b) {}
try {
    $.global.__ShineToolsKickLayout = function () {
        // Disabled intentionally for STARTUP_RELAYOUT_DISABLED_TEST_2026-05-05.
        return;
    };
} catch (e6) {}

// Startup/docked layout settle disabled for stability test.
// Keep the globals defined as no-ops so older calls safely do nothing instead of queuing UI work.
try {
    try { if ($.global.__ShineToolsLayoutSettleTask__) app.cancelTask($.global.__ShineToolsLayoutSettleTask__); } catch (eCancelOldSettle) {}
    $.global.__ShineToolsLayoutSettleTask__ = 0;
    $.global.__ShineToolsDockedLayoutSettle__ = function () {
        try { $.global.__ShineToolsLayoutSettleTask__ = 0; } catch (eT0) {}
        return;
    };
    $.global.__ShineToolsQueueLayoutSettle__ = function (delayMs) {
        try { if ($.global.__ShineToolsLayoutSettleTask__) app.cancelTask($.global.__ShineToolsLayoutSettleTask__); } catch (e1) {}
        try { $.global.__ShineToolsLayoutSettleTask__ = 0; } catch (e2) {}
        return;
    };
} catch (eSettleDef) {}

try {
    if (myPal instanceof Window) {
        myPal.onClose = _stPanelCloseCleanup;
        myPal.onHide  = _stPanelCloseCleanup;
    } else {
        myPal.onClose = function(){};
        myPal.onHide  = function(){};
    }
} catch (ePCOnBind) {}

if (myPal instanceof Window) {
    myPal.center();
    myPal.show();

    // Startup force-relayout disabled for stability test.
} else {
    // Docked startup force-relayout and delayed post-paint settle disabled for stability test.
}

try { $.global.__ST_NO_FORCE_RELAYOUT_DIAG_ACTIVE__ = false; } catch (eRelayoutBypass) {}

// Robust host-panel resolution (prevents "Object is invalid" when stale Panel refs exist)
})( (function(){
    try {
        var __h = $.global.__ST_HOST_PANEL__;
        if (__h !== undefined && __h !== null) {
            __h.toString(); // touch; invalid objects throw
            return __h;
        }
    } catch (e) {}
    return this;
})() );

function _updateWorkspaceManagerLoadedStatus(name) {
    try {
        var nm = String(name || "").replace(/^\s+|\s+$/g, "");
        if (!nm) return;
        if (pal.__stWorkspaceManagerStatusLabel) {
            pal.__stWorkspaceManagerStatusLabel.text = "Loaded Workspace: " + nm;
        }
    } catch (e) {}
}
