const welcomeSection = document.getElementById("welcome-section");
const heroGetStartedBtn = document.getElementById("hero-get-started");
const heroSampleDataBtn = document.getElementById("hero-sample-data");
const dropZone = document.getElementById("drop-zone");
const fileInput = document.getElementById("file-input");
const sampleDataBtn = document.getElementById("sample-data-btn");
const uploadStatus = document.getElementById("upload-status");
const uploadProgress = document.getElementById("upload-progress");
const uploadProgressBar = document.getElementById("upload-progress-bar");
const uploadSection = document.getElementById("upload-section");
const appSection = document.getElementById("app-section");
const sourceFilename = document.getElementById("source-filename");
const changeFileBtn = document.getElementById("change-file-btn");
const addTableBtn = document.getElementById("add-table-btn");
const addTableInput = document.getElementById("add-table-input");
const addTableStatus = document.getElementById("add-table-status");
const addTableProgress = document.getElementById("add-table-progress");
const addTableProgressBar = document.getElementById("add-table-progress-bar");
const exportReportBtn = document.getElementById("export-report-btn");
const printReportBtn = document.getElementById("print-report-btn");
const dashboardContent = document.getElementById("dashboard-content");
const dashboardNarrative = document.getElementById("dashboard-narrative");
const dataHealthBanner = document.getElementById("data-health-banner");
const relationshipsPanel = document.getElementById("relationships-panel");
const schemaDiagramOverlay = document.getElementById("schema-diagram-overlay");
const schemaDiagramClose = document.getElementById("schema-diagram-close");
const schemaDiagramBody = document.getElementById("schema-diagram-body");
const suggestedQuestionsEl = document.getElementById("suggested-questions");
const chatPanel = document.getElementById("chat-panel");
const chatLog = document.getElementById("chat-log");
const chatEmptyState = document.getElementById("chat-empty-state");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");
const chatSubmit = document.getElementById("chat-submit");
const insightsSection = document.getElementById("insights-section");
const insightsContent = document.getElementById("insights-content");
const insightsTakeaways = document.getElementById("insights-takeaways");
const insightsRefresh = document.getElementById("insights-refresh");
const customInsightBtn = document.getElementById("custom-insight-btn");
const customInsightOverlay = document.getElementById("custom-insight-overlay");
const customInsightClose = document.getElementById("custom-insight-close");
const customInsightForm = document.getElementById("custom-insight-form");
const customInsightTableSelect = document.getElementById("custom-insight-table");
const customInsightDimensionSelect = document.getElementById("custom-insight-dimension");
const customInsightAggSelect = document.getElementById("custom-insight-agg");
const customInsightMeasureField = document.getElementById("custom-insight-measure-field");
const customInsightMeasureSelect = document.getElementById("custom-insight-measure");
const customInsightFilterColumnSelect = document.getElementById("custom-insight-filter-column");
const customInsightFilterValueField = document.getElementById("custom-insight-filter-value-field");
const customInsightFilterValueSelect = document.getElementById("custom-insight-filter-value");
const customInsightFilterMeasureSelect = document.getElementById("custom-insight-filter-measure");
const customInsightFilterNumericRow = document.getElementById("custom-insight-filter-numeric-row");
const customInsightFilterOperatorSelect = document.getElementById("custom-insight-filter-operator");
const customInsightFilterThresholdInput = document.getElementById("custom-insight-filter-threshold");
const customInsightChartTypeSelect = document.getElementById("custom-insight-chart-type");
const customInsightTitleInput = document.getElementById("custom-insight-title-input");
const customInsightError = document.getElementById("custom-insight-error");
const customInsightSubmit = document.getElementById("custom-insight-submit");
const historyToggle = document.getElementById("history-toggle");
const historyPanel = document.getElementById("history-panel");
const historySearchInput = document.getElementById("history-search");
const historyListEl = document.getElementById("history-list");
const newChatBtn = document.getElementById("new-chat-btn");
const dashboardExportAllBtn = document.getElementById("dashboard-export-all-btn");
const chatSearchToggle = document.getElementById("chat-search-toggle");
const chatSearchBar = document.getElementById("chat-search-bar");
const chatSearchInput = document.getElementById("chat-search-input");
const chatSearchCount = document.getElementById("chat-search-count");
const chatSearchPrev = document.getElementById("chat-search-prev");
const chatSearchNext = document.getElementById("chat-search-next");
const chatSearchClose = document.getElementById("chat-search-close");
const themeToggle = document.getElementById("theme-toggle");
const themeToggleIcon = document.getElementById("theme-toggle-icon");
const paletteToggle = document.getElementById("palette-toggle");
const toastContainer = document.getElementById("toast-container");
const chatShortcutHint = document.getElementById("chat-shortcut-hint");
const shortcutsBtn = document.getElementById("shortcuts-btn");
const shortcutsOverlay = document.getElementById("shortcuts-overlay");
const shortcutsClose = document.getElementById("shortcuts-close");
const shortcutsListEl = document.getElementById("shortcuts-list");
const modelModalOverlay = document.getElementById("model-modal-overlay");
const modelModalClose = document.getElementById("model-modal-close");
const modelListEl = document.getElementById("model-list");
const insightModalOverlay = document.getElementById("insight-modal-overlay");
const insightModalTitle = document.getElementById("insight-modal-title");
const insightModalClose = document.getElementById("insight-modal-close");
const insightModalBody = document.getElementById("insight-modal-body");
const commandPaletteOverlay = document.getElementById("command-palette-overlay");
const commandPaletteInput = document.getElementById("command-palette-input");
const commandPaletteResults = document.getElementById("command-palette-results");
const columnProfileOverlay = document.getElementById("column-profile-overlay");
const columnProfileTitle = document.getElementById("column-profile-title");
const columnProfileClose = document.getElementById("column-profile-close");
const columnProfileBody = document.getElementById("column-profile-body");
const dataBrowserOverlay = document.getElementById("data-browser-overlay");
const dataBrowserTitle = document.getElementById("data-browser-title");
const dataBrowserClose = document.getElementById("data-browser-close");
const dataBrowserExportBtn = document.getElementById("data-browser-export");
const dataBrowserSummary = document.getElementById("data-browser-summary");
const dataBrowserPrev = document.getElementById("data-browser-prev");
const dataBrowserNext = document.getElementById("data-browser-next");
const dataBrowserTableWrap = document.getElementById("data-browser-table-wrap");
const dataBrowserSearchInput = document.getElementById("data-browser-search");
const dataBrowserSearchClear = document.getElementById("data-browser-search-clear");
const dataBrowserFilterChip = document.getElementById("data-browser-filter-chip");
const dataBrowserFilterChipText = document.getElementById("data-browser-filter-chip-text");
const dataBrowserFilterChipClear = document.getElementById("data-browser-filter-chip-clear");
const authGate = document.getElementById("auth-gate");
const authForm = document.getElementById("auth-form");
const authUsername = document.getElementById("auth-username");
const authPassword = document.getElementById("auth-password");
const authSubmit = document.getElementById("auth-submit");
const authModeToggle = document.getElementById("auth-mode-toggle");
const authError = document.getElementById("auth-error");
const authTitle = document.getElementById("auth-title");
const authHint = document.getElementById("auth-hint");
const authLogout = document.getElementById("auth-logout");

let sessionId = null;
let authMode = "login";
let uploading = false;
let activeChatAbort = null;
const DEFAULT_PALETTE = ["#5b8cff", "#7fd1ae", "#ffb86b", "#ff6b6b", "#b98cff", "#6bd0ff"];
// Okabe & Ito (2008) — the standard qualitative palette designed to stay
// distinguishable under all common types of color vision deficiency, not
// just "looks fine to me." Reordered so the first (most-used) slot is a
// blue close in brightness to the default palette's accent.
const COLORBLIND_PALETTE = ["#0072B2", "#E69F00", "#009E73", "#D55E00", "#CC79A7", "#56B4E9"];
let CHART_COLORS = DEFAULT_PALETTE;

function hexToRgba(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// A single-series bar chart reads flat and generic with one solid color on
// every bar. Shading each bar by its own value relative to the tallest one —
// full accent for the leader, tapering down for the rest — draws the eye to
// the top result the way Power BI/Tableau's default bar treatment does,
// without needing a second real color (which would wrongly imply category).
function rankedBarColors(values) {
  const max = Math.max(1, ...values.map((v) => (typeof v === "number" ? Math.abs(v) : 0)));
  return values.map((v) => {
    const ratio = typeof v === "number" ? Math.abs(v) / max : 0;
    return hexToRgba(CHART_COLORS[0], 0.45 + ratio * 0.55);
  });
}
const SESSION_STORAGE_KEY = "cwyd-session-id";
const PINNED_STORAGE_PREFIX = "cwyd-pinned-";
const DISMISSED_STORAGE_PREFIX = "cwyd-dismissed-";
const CHART_TYPE_OVERRIDE_PREFIX = "cwyd-chart-override-";
const INSIGHT_ORDER_PREFIX = "cwyd-insight-order-";
const DATA_BROWSER_PAGE_SIZE = 50;
// /run-sql routes through run_query(), which caps returned rows at
// RESULT_ROWS_FOR_MODEL (200, backend/query/duckdb_session.py) regardless of
// the SQL's own LIMIT — that's the real ceiling for a single export request,
// tighter than sql_guard.py's 500-row DEFAULT_ROW_LIMIT.
const DATA_BROWSER_EXPORT_LIMIT = 200;
let dataBrowserTable = null;
let dataBrowserOffset = 0;
let dataBrowserSort = null;
let dataBrowserRequestId = 0;
let dataBrowserSearch = "";
let dataBrowserSearchDebounce = null;
let dataBrowserFilter = null; // { column, value } exact-match filter set by a chart drilldown
let dataBrowserDuplicatesOnly = false; // set by clicking the "duplicate rows" stat pill

// Snapshots kept only for the "Export report" feature — the rest of the app
// fetches/renders each of these fresh and doesn't need them cached.
let currentDashboard = null;
let currentInsights = [];
let currentHistory = [];
let historyNavIndex = -1; // -1 = not recalling; 0 = most recent question, increasing = further back
let historyNavDraft = "";
let currentSourceLabel = "";
let currentRelationships = [];
let currentSuggestedQuestions = [];

// Insight cards a user has pinned — kept client-side (full view payload, not
// just an id) so a pin survives "Regenerate", which replaces the LLM's whole
// proposal list. Keyed by table+dimension+chart_type, mirroring the backend's
// own (dimension, chart_type) dedupe key from insights.py's diversity pass.
let pinnedInsights = [];

// LLM-proposed cards a user has hidden (not pinned, not custom) — a "not
// useful, stop showing me this" signal distinct from unpin/remove. Kept as
// keys only (view content isn't needed back) so a Regenerate that proposes
// the same (dimension, chart_type) again is filtered out rather than
// reappearing right after the user hid it.
let dismissedInsights = [];

// A user's manual "view this as a different chart type" choice per insight,
// e.g. a proposed bar chart re-viewed as a line chart. Purely a client-side
// re-render — the underlying dimension/value rows never change — so it's
// stored separately from the LLM's own chart_type rather than mutating
// view.chart_type (which would also shift the view's insightKey identity
// and break pin/dismiss matching). Persisted per-session like pins/dismissals.
let chartTypeOverrides = {};

// A user's manual drag-to-reorder of the suggested-views grid — a list of
// insightKey()s in the order the user chose. Cards not present in this list
// (new proposals, custom views) fall back to their natural position at the
// end, appended in whatever order they already had. Persisted per-session
// like pins/dismissals/chart-type overrides.
let insightOrderOverride = [];

function insightKey(view) {
  return `${view.table}|${view.dimension}|${view.chart_type}`;
}

// Pins are also persisted to localStorage per-session so they survive a page
// reload — restoreSession() reads this back in, matching the fact that the
// rest of the restored session (chat, dashboard) doesn't lose user state either.
function pinnedStorageKey(sid) {
  return `${PINNED_STORAGE_PREFIX}${sid}`;
}

function savePinnedInsights() {
  if (!sessionId) return;
  try {
    localStorage.setItem(pinnedStorageKey(sessionId), JSON.stringify(pinnedInsights));
  } catch {
    // best-effort — quota exceeded or storage disabled shouldn't break pinning in-session
  }
}

function loadPinnedInsights(sid) {
  try {
    const raw = localStorage.getItem(pinnedStorageKey(sid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function dismissedStorageKey(sid) {
  return `${DISMISSED_STORAGE_PREFIX}${sid}`;
}

function saveDismissedInsights() {
  if (!sessionId) return;
  try {
    localStorage.setItem(dismissedStorageKey(sessionId), JSON.stringify(dismissedInsights));
  } catch {
    // best-effort — quota exceeded or storage disabled shouldn't break dismissing in-session
  }
}

function loadDismissedInsights(sid) {
  try {
    const raw = localStorage.getItem(dismissedStorageKey(sid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function chartTypeOverrideStorageKey(sid) {
  return `${CHART_TYPE_OVERRIDE_PREFIX}${sid}`;
}

function saveChartTypeOverrides() {
  if (!sessionId) return;
  try {
    localStorage.setItem(chartTypeOverrideStorageKey(sessionId), JSON.stringify(chartTypeOverrides));
  } catch {
    // best-effort — quota exceeded or storage disabled shouldn't break the toggle in-session
  }
}

function loadChartTypeOverrides(sid) {
  try {
    const raw = localStorage.getItem(chartTypeOverrideStorageKey(sid));
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function insightOrderStorageKey(sid) {
  return `${INSIGHT_ORDER_PREFIX}${sid}`;
}

function saveInsightOrder() {
  if (!sessionId) return;
  try {
    localStorage.setItem(insightOrderStorageKey(sessionId), JSON.stringify(insightOrderOverride));
  } catch {
    // best-effort — quota exceeded or storage disabled shouldn't break reordering in-session
  }
}

function loadInsightOrder(sid) {
  try {
    const raw = localStorage.getItem(insightOrderStorageKey(sid));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Applies insightOrderOverride to a fresh views list: known keys sort to the
// front in the user's chosen order, anything unrecognized (new proposals,
// custom views added since the last drag) keeps its natural relative order
// appended at the end.
function applyInsightOrder(views) {
  if (!insightOrderOverride.length) return views;
  const byKey = new Map(views.map((v) => [insightKey(v), v]));
  const ordered = insightOrderOverride.filter((k) => byKey.has(k)).map((k) => byKey.get(k));
  const orderedKeys = new Set(insightOrderOverride);
  const rest = views.filter((v) => !orderedKeys.has(insightKey(v)));
  return [...ordered, ...rest];
}

// --- Theme (light/dark, persisted) ---

// Chart.js's own defaults (mid-gray tick/legend/title text, ~3.3:1 contrast)
// fall short of the rest of this UI's palette against the dark theme's
// near-black background. Chart.js resolves+bakes each instance's colors in
// at construction time, so changing Chart.defaults afterward doesn't
// repaint an already-rendered chart — existing instances need their own
// options mutated and a redraw, not just a defaults change.
function chartThemeColors() {
  const cs = getComputedStyle(document.documentElement);
  return {
    text: cs.getPropertyValue("--text").trim() || "#e7e9ee",
    muted: cs.getPropertyValue("--muted").trim() || "#8b93a3",
    grid: cs.getPropertyValue("--border-soft").trim() || "#1d212a",
    error: cs.getPropertyValue("--error").trim() || "#ff6b6b",
  };
}

function applyChartTheme() {
  if (typeof Chart === "undefined") return;
  const colors = chartThemeColors();
  Chart.defaults.color = colors.muted;
  Chart.defaults.borderColor = colors.grid;
  for (const chart of Object.values(Chart.instances)) {
    const opts = chart.options;
    opts.color = colors.muted;
    if (opts.plugins?.legend?.labels) opts.plugins.legend.labels.color = colors.muted;
    if (opts.plugins?.title) opts.plugins.title.color = colors.text;
    for (const scale of Object.values(opts.scales || {})) {
      if (scale.ticks) scale.ticks.color = colors.muted;
      if (scale.grid) scale.grid.color = colors.grid;
      if (scale.border) scale.border.color = colors.grid;
    }
    chart.update("none");
  }
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeToggleIcon.textContent = theme === "light" ? "☀️" : "🌙";
  themeToggle.setAttribute("aria-label", theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  applyChartTheme();
}

applyTheme(document.documentElement.dataset.theme || "dark");

themeToggle.addEventListener("click", () => {
  const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
  localStorage.setItem("cwyd-theme", next);
  applyTheme(next);
});

// --- Colorblind-safe chart palette (persisted, applies to newly-rendered
// charts immediately since CHART_COLORS is read at chart-construction time,
// not baked in ahead of time) ---

// Chart.js bakes each dataset's colors in at `new Chart(...)` time, so
// swapping CHART_COLORS alone doesn't repaint anything already on screen —
// unlike applyChartTheme()'s text/grid colors, which Chart.js re-reads from
// mutable chart.options on every update(). The only reliable fix is to
// rebuild the currently-visible chart-bearing sections from their already-
// cached data. Historical charts embedded in past chat answers are left as
// rendered — recoloring the live chat log would mean walking arbitrary past
// DOM, for a cosmetic-only fix on messages already read; a new question
// asked after toggling picks up the new palette like everything else.
function repaintVisibleCharts() {
  if (currentDashboard) renderDashboard(currentDashboard);
  if (currentInsights.length) {
    insightsContent.innerHTML = "";
    activeLeafletMaps.length = 0;
    currentInsights.forEach((view) => insightsContent.appendChild(renderInsightCard(view)));
  }
  applyChartTheme();
}

function applyPalette(mode) {
  CHART_COLORS = mode === "colorblind" ? COLORBLIND_PALETTE : DEFAULT_PALETTE;
  paletteToggle.setAttribute("aria-pressed", String(mode === "colorblind"));
  paletteToggle.title = mode === "colorblind" ? "Switch to default chart colors" : "Switch to colorblind-safe chart colors";
  paletteToggle.setAttribute("aria-label", paletteToggle.title);
}

applyPalette(localStorage.getItem("cwyd-palette") || "default");

paletteToggle.addEventListener("click", () => {
  const next = CHART_COLORS === COLORBLIND_PALETTE ? "default" : "colorblind";
  localStorage.setItem("cwyd-palette", next);
  applyPalette(next);
  repaintVisibleCharts();
  showToast(next === "colorblind" ? "Colorblind-safe chart colors on" : "Default chart colors restored", "info");
});

// --- Toast notifications ---

function showToast(message, type = "info", timeout = 3200, action = null) {
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  const icon = type === "success" ? "✓" : type === "error" ? "⚠" : type === "warning" ? "⏱" : "ℹ";
  const dismiss = () => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), 200);
  };

  if (action) {
    // Same markup shape as showIdleWarningToast/showSessionExpiredToast: a
    // dedicated close button instead of click-anywhere-to-dismiss, so the
    // action button itself is safely clickable.
    toast.innerHTML =
      `<span class="toast-icon" aria-hidden="true">${icon}</span>` +
      '<span class="toast-body">' +
      '<span class="toast-text"></span>' +
      '<button type="button" class="btn-link toast-action"></button>' +
      "</span>" +
      '<button type="button" class="toast-close-btn" aria-label="Dismiss">×</button>';
    toast.querySelector(".toast-text").textContent = message;
    toast.querySelector(".toast-action").textContent = action.label;
    toastContainer.appendChild(toast);
    const timer = setTimeout(dismiss, timeout);
    toast.querySelector(".toast-close-btn").addEventListener("click", () => {
      clearTimeout(timer);
      dismiss();
    });
    toast.querySelector(".toast-action").addEventListener("click", () => {
      clearTimeout(timer);
      dismiss();
      action.onClick();
    });
    return toast;
  }

  toast.innerHTML = `<span class="toast-icon" aria-hidden="true">${icon}</span><span></span>`;
  toast.lastElementChild.textContent = message;
  toastContainer.appendChild(toast);
  const timer = setTimeout(dismiss, timeout);
  toast.addEventListener("click", () => {
    clearTimeout(timer);
    dismiss();
  });
  return toast;
}

// --- Idle-session warning ---
// The backend evicts a session after SESSION_TTL_SECONDS (30 min) of no
// requests (backend/models.py: sweep_expired_sessions). Reloading after that
// silently loses the dashboard/chat with no explanation unless we warn first.
const SESSION_TTL_MS = 30 * 60 * 1000;
const IDLE_WARNING_LEAD_MS = 3 * 60 * 1000;
let lastTouchAt = Date.now();
let idleWarningEl = null;

function noteSessionTouch() {
  lastTouchAt = Date.now();
  if (idleWarningEl) {
    idleWarningEl.querySelector(".toast-close-btn")?.click();
    idleWarningEl = null;
  }
}

function showIdleWarningToast() {
  const toast = document.createElement("div");
  toast.className = "toast warning";
  toast.innerHTML =
    '<span class="toast-icon" aria-hidden="true">⏱</span>' +
    '<span class="toast-body">' +
    '<span class="toast-text">Your session has been idle a while and will expire soon — ask a question to stay active.</span>' +
    '<button type="button" class="btn-link toast-action">Stay active</button>' +
    "</span>" +
    '<button type="button" class="toast-close-btn" aria-label="Dismiss">×</button>';
  toastContainer.appendChild(toast);
  toast.querySelector(".toast-close-btn").addEventListener("click", () => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), 200);
  });
  toast.querySelector(".toast-action").addEventListener("click", async () => {
    if (!sessionId) return;
    try {
      await fetch(`/dashboard/${sessionId}`);
      noteSessionTouch();
      showToast("Session kept active", "success");
    } catch {
      /* best-effort — the periodic check will warn again if this failed */
    }
  });
  idleWarningEl = toast;
}

setInterval(() => {
  if (!sessionId || idleWarningEl) return;
  if (Date.now() - lastTouchAt >= SESSION_TTL_MS - IDLE_WARNING_LEAD_MS) {
    showIdleWarningToast();
  }
}, 20000);

// --- Local model status (Ollama reachability + model availability) ---
// /health only ever told the backend whether *something* answered at
// localhost:11434 — "server up" and "the configured model is actually
// pulled" are independent failure modes, so a user could sit looking at a
// working-seeming app and only discover the real problem after a chat
// question times out. Surface both cases proactively instead.

const llmStatusEl = document.getElementById("llm-status");
const llmStatusText = document.getElementById("llm-status-text");
const LLM_STATUS_POLL_MS = 45000;

async function checkLlmStatus() {
  try {
    const res = await fetch("/health");
    const data = await res.json();
    const llm = data.llm || {};
    if (!llm.reachable) {
      llmStatusEl.className = "llm-status status-down";
      llmStatusText.textContent = "Model offline";
      llmStatusEl.title = "Ollama isn't reachable at localhost:11434 — start it to enable chat and insights.";
    } else if (llm.model_available === false) {
      llmStatusEl.className = "llm-status status-warning";
      llmStatusText.textContent = "Model missing";
      llmStatusEl.title = `Ollama is running, but "${llm.model}" isn't pulled yet — run "ollama pull ${llm.model}".`;
    } else {
      llmStatusEl.className = "llm-status status-ok";
      llmStatusText.textContent = "Model ready";
      llmStatusEl.title = llm.model ? `Local model ready — ${llm.model}` : "Local model ready";
    }
  } catch {
    llmStatusEl.className = "llm-status status-down";
    llmStatusText.textContent = "Model offline";
    llmStatusEl.title = "Couldn't reach the backend to check the local model.";
  }
}

checkLlmStatus();
setInterval(checkLlmStatus, LLM_STATUS_POLL_MS);

// --- Modal focus trapping ---
// aria-modal="true" alone doesn't stop Tab from reaching the page behind
// the dialog. These helpers wrap every overlay's open/close so Tab cycles
// inside the dialog, initial focus lands somewhere useful, and focus
// returns to whatever triggered the modal once it closes.

function getFocusable(container) {
  return Array.from(
    container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  ).filter((el) => el.offsetParent !== null);
}

function openModal(overlay, focusEl) {
  overlay._returnFocusEl = document.activeElement;
  overlay.classList.remove("hidden");
  if (!overlay._trapHandler) {
    overlay._trapHandler = (e) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable(overlay);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    overlay.addEventListener("keydown", overlay._trapHandler);
  }
  (focusEl || getFocusable(overlay)[0] || overlay).focus();
}

function closeModal(overlay) {
  overlay.classList.add("hidden");
  const returnEl = overlay._returnFocusEl;
  overlay._returnFocusEl = null;
  if (returnEl && document.body.contains(returnEl)) returnEl.focus();
}

// --- Keyboard shortcuts ---

const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform || navigator.userAgent);
const modKeyLabel = isMac ? "⌘" : "Ctrl";
chatShortcutHint.textContent = `${modKeyLabel}K`;

const SHORTCUTS = [
  { keys: [`${modKeyLabel}K`], desc: "Open command palette" },
  { keys: ["N"], desc: "Start a new chat" },
  { keys: ["H"], desc: "Toggle question history" },
  { keys: ["F"], desc: "Find in this conversation" },
  { keys: ["↑", "↓"], desc: "Recall previous questions in the chat box" },
  { keys: ["R"], desc: "Regenerate suggested views" },
  { keys: ["T"], desc: "Toggle light / dark theme" },
  { keys: ["P"], desc: "Print / save session as PDF" },
  { keys: ["Esc"], desc: "Close a panel or dialog" },
  { keys: ["?"], desc: "Show this shortcuts list" },
];

function renderShortcutsList() {
  shortcutsListEl.innerHTML = "";
  for (const { keys, desc } of SHORTCUTS) {
    const row = document.createElement("div");
    row.className = "shortcut-row";
    const span = document.createElement("span");
    span.textContent = desc;
    row.appendChild(span);
    for (const k of keys) {
      const kbdEl = document.createElement("kbd");
      kbdEl.textContent = k;
      row.appendChild(kbdEl);
    }
    shortcutsListEl.appendChild(row);
  }
}
renderShortcutsList();

function openShortcutsModal() {
  openModal(shortcutsOverlay, shortcutsClose);
}
function closeShortcutsModal() {
  closeModal(shortcutsOverlay);
}
shortcutsBtn.addEventListener("click", openShortcutsModal);
shortcutsClose.addEventListener("click", closeShortcutsModal);
shortcutsOverlay.addEventListener("click", (e) => {
  if (e.target === shortcutsOverlay) closeShortcutsModal();
});

// --- Local model picker ---
// Lets the user switch which pulled Ollama model answers chat questions and
// generates insights, without leaving the browser or editing backend config.

function renderModelList(current, available, message) {
  modelListEl.innerHTML = "";
  if (message) {
    const p = document.createElement("p");
    p.className = message.error ? "model-list-error" : "model-list-empty";
    p.textContent = message.text;
    modelListEl.appendChild(p);
    return;
  }
  for (const name of available) {
    const row = document.createElement("button");
    row.type = "button";
    row.className = "model-row" + (name === current ? " is-current" : "");
    const nameEl = document.createElement("span");
    nameEl.className = "model-row-name";
    nameEl.textContent = name;
    row.appendChild(nameEl);
    if (name === current) {
      const check = document.createElement("span");
      check.className = "model-row-check";
      check.textContent = "✓ Active";
      row.appendChild(check);
    }
    row.addEventListener("click", () => selectModel(name));
    modelListEl.appendChild(row);
  }
}

async function loadModelList() {
  renderModelList(null, [], { text: "Loading models…" });
  try {
    const res = await fetch("/models");
    if (!res.ok) throw new Error("request failed");
    const data = await res.json();
    if (!data.available || !data.available.length) {
      renderModelList(data.current, [], { text: "No models found. Ollama may be offline, or run \"ollama pull <name>\" to add one." });
      return;
    }
    renderModelList(data.current, data.available, null);
  } catch {
    renderModelList(null, [], { error: true, text: "Couldn't reach the backend to list models." });
  }
}

async function selectModel(name) {
  const rows = Array.from(modelListEl.querySelectorAll(".model-row"));
  rows.forEach((r) => (r.disabled = true));
  try {
    const res = await fetch("/models/select", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: name }),
    });
    const data = await res.json();
    if (!res.ok) {
      showToast(data.detail || "Couldn't switch models.", "error");
      rows.forEach((r) => (r.disabled = false));
      return;
    }
    showToast(`Now using ${name}`, "success");
    await checkLlmStatus();
    closeModelModal();
  } catch {
    showToast("Couldn't reach the backend to switch models.", "error");
    rows.forEach((r) => (r.disabled = false));
  }
}

function openModelModal() {
  openModal(modelModalOverlay, modelModalClose);
  loadModelList();
}
function closeModelModal() {
  closeModal(modelModalOverlay);
}
llmStatusEl.addEventListener("click", openModelModal);
modelModalClose.addEventListener("click", closeModelModal);
modelModalOverlay.addEventListener("click", (e) => {
  if (e.target === modelModalOverlay) closeModelModal();
});

// --- Insight card expand modal ---

let modalChart = null;
let modalMap = null;

function closeInsightModal() {
  closeModal(insightModalOverlay);
  if (modalChart) {
    modalChart.destroy();
    modalChart = null;
  }
  if (modalMap) {
    modalMap.remove();
    modalMap = null;
  }
  insightModalBody.innerHTML = "";
}

function openInsightModal(view) {
  insightModalTitle.textContent = view.title;
  insightModalBody.innerHTML = "";
  openModal(insightModalOverlay, insightModalClose);
  // Match whatever chart type the card is currently showing (the user may
  // have switched it via the chart-type toggle) rather than reverting to
  // the original LLM-proposed type — map/scatter are never override targets
  // (the toggle only ever stores bar/line/pie), so this falls through to
  // view.chart_type unchanged for those.
  const effectiveType = chartTypeOverrides[insightKey(view)] || view.chart_type;

  if (view.highlight) {
    const highlight = document.createElement("p");
    highlight.className = "insight-modal-highlight";
    highlight.textContent = view.highlight;
    insightModalBody.appendChild(highlight);
  }

  if (effectiveType === "map") {
    const mapEl = document.createElement("div");
    mapEl.className = "insight-modal-map";
    insightModalBody.appendChild(mapEl);
    // Leaflet needs the container laid out (not display:none) before init —
    // the overlay is unhidden above, so wait one frame for real layout size.
    requestAnimationFrame(() => {
      renderMap(mapEl, view).then((map) => {
        modalMap = map;
        map.invalidateSize();
      });
    });
  } else {
    const chartWrap = document.createElement("div");
    chartWrap.className = "insight-modal-chart-wrap";
    const canvas = document.createElement("canvas");
    chartWrap.appendChild(canvas);
    insightModalBody.appendChild(chartWrap);
    const drillable = isInsightDrillable(view);
    const chartSpec =
      effectiveType === "scatter"
        ? { type: "scatter", x: view.columns[0], y: view.columns[1], title: view.title }
        : { type: effectiveType, x: "dimension", y: "value", title: view.title };
    modalChart = renderChartFromResult(
      canvas,
      chartSpec,
      { columns: view.columns, rows: view.rows },
      drillable ? (rawValue) => drillIntoInsight(view, rawValue) : null,
      effectiveType === "line" ? view.forecast : null,
      effectiveType === "line" ? view.anomalies : null
    );
    if (modalChart) {
      chartWrap.appendChild(buildChartDownloadButton(modalChart, view.title || "chart"));
    }
    if (drillable) {
      const hint = document.createElement("p");
      hint.className = "insight-chart-hint";
      hint.textContent = "Click a bar, slice, or point to view the underlying rows";
      chartWrap.appendChild(hint);
    }
    if (effectiveType === "line" && view.forecast) {
      chartWrap.appendChild(buildForecastCaption(view));
    }
    if (effectiveType === "line" && view.anomalies && view.anomalies.length) {
      chartWrap.appendChild(buildAnomalyCaption(view.anomalies, view));
    }
  }

  const tableHeading = document.createElement("h3");
  tableHeading.className = "insight-modal-table-heading";
  tableHeading.textContent = "Data";
  insightModalBody.appendChild(tableHeading);
  const tableWrap = document.createElement("div");
  tableWrap.className = "insight-modal-table-wrap";
  tableWrap.appendChild(buildSortableTable(view.columns, view.rows));
  insightModalBody.appendChild(tableWrap);
}

insightModalClose.addEventListener("click", closeInsightModal);
insightModalOverlay.addEventListener("click", (e) => {
  if (e.target === insightModalOverlay) closeInsightModal();
});

// --- Column profile modal ---

let columnProfileChart = null;

function closeColumnProfile() {
  closeModal(columnProfileOverlay);
  if (columnProfileChart) {
    columnProfileChart.destroy();
    columnProfileChart = null;
  }
  columnProfileBody.innerHTML = "";
}

function openColumnProfile(table, column, type) {
  columnProfileTitle.textContent = column;
  columnProfileBody.innerHTML = "";
  openModal(columnProfileOverlay, columnProfileClose);

  const typeLabel = type === "numeric" ? "Numeric column" : type === "date" ? "Date column" : "Categorical column";
  const tag = document.createElement("span");
  tag.className = "column-type-tag";
  tag.textContent = `${typeLabel} · ${table.table}`;
  columnProfileBody.appendChild(tag);

  const missing = (table.missing_values || {})[column] || 0;
  const missingPct = table.row_count ? Math.round((missing / table.row_count) * 100) : 0;
  const uniqueCount = (table.unique_counts || {})[column];

  const stats = document.createElement("div");
  stats.className = "column-profile-stats";

  function addStat(label, value) {
    const stat = document.createElement("div");
    stat.className = "column-profile-stat";
    stat.innerHTML = `<span class="column-profile-stat-label">${label}</span><span class="column-profile-stat-value">${value}</span>`;
    stats.appendChild(stat);
  }

  if (type === "numeric") {
    const s = table.numeric_stats[column] || {};
    addStat("Min", fmt(s.min));
    addStat("Max", fmt(s.max));
    addStat("Mean", fmt(s.mean));
    addStat("Median", fmt(s.median));
  }
  if (uniqueCount !== undefined) addStat("Unique", uniqueCount.toLocaleString());
  addStat("Missing", `${missing.toLocaleString()} (${missingPct}%)`);

  columnProfileBody.appendChild(stats);

  if (type === "numeric") {
    const s = table.numeric_stats[column] || {};
    if (s.min !== null && s.max !== null && s.min !== undefined && s.max !== undefined && s.max > s.min) {
      const range = document.createElement("div");
      range.className = "column-profile-range";
      const track = document.createElement("div");
      track.className = "column-profile-range-track";
      const marker = document.createElement("div");
      marker.className = "column-profile-range-marker";
      const pct = ((s.mean - s.min) / (s.max - s.min)) * 100;
      marker.style.left = `${Math.min(100, Math.max(0, pct))}%`;
      marker.title = `Mean: ${fmt(s.mean)}`;
      track.appendChild(marker);
      range.appendChild(track);
      const labels = document.createElement("div");
      labels.className = "column-profile-range-labels";
      labels.innerHTML = `<span>${fmt(s.min)}</span><span>${fmt(s.max)}</span>`;
      range.appendChild(labels);
      columnProfileBody.appendChild(range);
    }
  }

  if (type === "date") {
    const d = (table.date_stats || {})[column];
    if (d && (d.min || d.max)) {
      const range = document.createElement("div");
      range.className = "column-profile-range";
      const labels = document.createElement("div");
      labels.className = "column-profile-range-labels";
      labels.innerHTML = `<span>${d.min || "—"}</span><span>${d.max || "—"}</span>`;
      range.appendChild(labels);
      columnProfileBody.appendChild(range);
    }
  }

  const categories = (table.top_categories || {})[column];
  if (type === "categorical" && categories && categories.length) {
    const chartWrap = document.createElement("div");
    chartWrap.className = "column-profile-chart-wrap";
    const canvas = document.createElement("canvas");
    canvas.setAttribute("role", "img");
    canvas.setAttribute(
      "aria-label",
      `Bar chart: top ${categories.length.toLocaleString()} values of ${column} by count.`
    );
    chartWrap.appendChild(canvas);
    columnProfileBody.appendChild(chartWrap);
    columnProfileChart = new Chart(canvas, {
      type: "bar",
      data: {
        labels: categories.map((e) => e.value),
        datasets: [{ data: categories.map((e) => e.count), backgroundColor: rankedBarColors(categories.map((e) => e.count)), borderRadius: 4 }],
      },
      options: {
        responsive: true,
        indexAxis: "y",
        plugins: { legend: { display: false } },
        scales: { x: { beginAtZero: true } },
      },
    });
  }

  const allValues = (table.all_values || {})[column];
  if (type === "categorical" && allValues && allValues.length) {
    const heading = document.createElement("div");
    heading.className = "column-list-heading";
    heading.textContent = `All values (${allValues.length})`;
    columnProfileBody.appendChild(heading);
    const values = document.createElement("div");
    values.className = "column-profile-values";
    for (const v of allValues) {
      const chip = document.createElement("span");
      chip.className = "column-chip";
      chip.textContent = v;
      values.appendChild(chip);
    }
    columnProfileBody.appendChild(values);
  } else if (type === "categorical" && categories && categories.length && uniqueCount) {
    const note = document.createElement("p");
    note.className = "column-profile-note";
    note.textContent = `${uniqueCount.toLocaleString()} unique values — showing the top ${categories.length} most frequent.`;
    columnProfileBody.appendChild(note);
  } else if (type === "categorical" && !categories && uniqueCount) {
    const note = document.createElement("p");
    note.className = "column-profile-note";
    note.textContent = `${uniqueCount.toLocaleString()} unique values — too high-cardinality to break down (likely an identifier column).`;
    columnProfileBody.appendChild(note);
  }
}

columnProfileClose.addEventListener("click", closeColumnProfile);
columnProfileOverlay.addEventListener("click", (e) => {
  if (e.target === columnProfileOverlay) closeColumnProfile();
});

// --- Data browser modal ---
// Reuses the existing /run-sql "power-user escape hatch" endpoint instead of a
// new one: SELECT * with a server-validated ORDER BY/LIMIT/OFFSET is exactly
// what that endpoint already safely executes for a hand-edited query.

function quoteIdent(name) {
  return `"${String(name).replace(/"/g, '""')}"`;
}

function escapeSqlLiteral(value) {
  return String(value).replace(/'/g, "''");
}

async function runSql(sql) {
  const res = await fetch("/run-sql", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session_id: sessionId, sql }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.detail || "Query failed.");
  return data;
}

function closeDataBrowser() {
  closeModal(dataBrowserOverlay);
  dataBrowserTableWrap.innerHTML = "";
  dataBrowserTable = null;
  clearTimeout(dataBrowserSearchDebounce);
}

function syncDataBrowserFilterChip() {
  if (dataBrowserDuplicatesOnly) {
    dataBrowserFilterChipText.textContent = "Filtered: duplicate rows only";
    dataBrowserFilterChip.classList.remove("hidden");
  } else if (dataBrowserFilter && dataBrowserFilter.range) {
    const [startVal, endVal] = dataBrowserFilter.range;
    dataBrowserFilterChipText.textContent = `Filtered: ${dataBrowserFilter.column} in [${startVal}, ${endVal})`;
    dataBrowserFilterChip.classList.remove("hidden");
  } else if (dataBrowserFilter) {
    dataBrowserFilterChipText.textContent = `Filtered: ${dataBrowserFilter.column} = ${dataBrowserFilter.value}`;
    dataBrowserFilterChip.classList.remove("hidden");
  } else {
    dataBrowserFilterChip.classList.add("hidden");
  }
}

function openDataBrowser(table, filter = null, duplicatesOnly = false) {
  dataBrowserTable = table;
  dataBrowserOffset = 0;
  dataBrowserSort = null;
  dataBrowserSearch = "";
  dataBrowserSearchInput.value = "";
  dataBrowserSearchClear.classList.add("hidden");
  dataBrowserFilter = duplicatesOnly ? null : filter;
  dataBrowserDuplicatesOnly = duplicatesOnly;
  syncDataBrowserFilterChip();
  dataBrowserTitle.textContent = `${table.table} — browse data`;
  openModal(dataBrowserOverlay, dataBrowserSearchInput);
  loadDataBrowserPage();
}

// Shared by loadDataBrowserPage and the export handler so the FROM source
// (plain table, or the duplicate-rows-only derived table) can't drift apart.
function dataBrowserFromSource(table) {
  if (!dataBrowserDuplicatesOnly) return quoteIdent(table.table);
  const allCols = [...table.numeric_columns, ...table.categorical_columns, ...table.date_columns];
  const partitionBy = allCols.map(quoteIdent).join(", ");
  return (
    `(SELECT * EXCLUDE (__dup_count) FROM (` +
    `SELECT *, COUNT(*) OVER (PARTITION BY ${partitionBy}) AS __dup_count FROM ${quoteIdent(table.table)}` +
    `) WHERE __dup_count > 1) AS dedup`
  );
}

// Shared by loadDataBrowserPage and the export handler so the two WHERE
// clauses (exact-match drilldown filter + free-text search) can't drift apart.
function buildDataBrowserWhereClause(table) {
  const clauses = [];
  if (dataBrowserFilter && dataBrowserFilter.range) {
    const [startVal, endVal] = dataBrowserFilter.range;
    const col = quoteIdent(dataBrowserFilter.column);
    clauses.push(`${col} >= '${escapeSqlLiteral(startVal)}' AND ${col} < '${escapeSqlLiteral(endVal)}'`);
  } else if (dataBrowserFilter) {
    clauses.push(`${quoteIdent(dataBrowserFilter.column)} = '${escapeSqlLiteral(dataBrowserFilter.value)}'`);
  }
  const searchableCols = [...table.numeric_columns, ...table.categorical_columns, ...table.date_columns];
  if (dataBrowserSearch && searchableCols.length) {
    const term = escapeSqlLiteral(dataBrowserSearch);
    const ors = searchableCols.map((c) => `CAST(${quoteIdent(c)} AS VARCHAR) ILIKE '%${term}%'`);
    clauses.push(`(${ors.join(" OR ")})`);
  }
  return clauses.length ? ` WHERE ${clauses.join(" AND ")}` : "";
}

async function loadDataBrowserPage() {
  const table = dataBrowserTable;
  if (!table) return;
  const requestId = ++dataBrowserRequestId;
  dataBrowserTableWrap.innerHTML = `<p class="data-browser-status">Loading…</p>`;
  dataBrowserPrev.disabled = true;
  dataBrowserNext.disabled = true;

  const whereClause = buildDataBrowserWhereClause(table);
  const fromSource = dataBrowserFromSource(table);
  const needsCount = whereClause || dataBrowserDuplicatesOnly;

  let sql = `SELECT * FROM ${fromSource}${whereClause}`;
  if (dataBrowserSort) {
    sql += ` ORDER BY ${quoteIdent(dataBrowserSort.column)} ${dataBrowserSort.dir === "desc" ? "DESC" : "ASC"}`;
  }
  sql += ` LIMIT ${DATA_BROWSER_PAGE_SIZE} OFFSET ${dataBrowserOffset}`;

  try {
    const requests = [runSql(sql)];
    if (needsCount) {
      requests.push(runSql(`SELECT COUNT(*) FROM ${fromSource}${whereClause}`));
    }
    const [pageData, countData] = await Promise.all(requests);
    if (requestId !== dataBrowserRequestId) return; // superseded by a newer page/sort/search request
    const total = needsCount ? Number(countData.result.rows[0][0]) : table.row_count;
    renderDataBrowserTable(pageData.result, total);
  } catch (err) {
    if (requestId !== dataBrowserRequestId) return;
    const error = document.createElement("p");
    error.className = "data-browser-status data-browser-error";
    error.textContent = err.message || "Couldn't load rows.";
    dataBrowserTableWrap.replaceChildren(error);
  }
}

function renderDataBrowserTable(result, total) {
  const start = total === 0 ? 0 : dataBrowserOffset + 1;
  const end = Math.min(dataBrowserOffset + result.rows.length, total);
  dataBrowserSummary.textContent = `Showing ${start.toLocaleString()}–${end.toLocaleString()} of ${total.toLocaleString()} rows`;
  dataBrowserPrev.disabled = dataBrowserOffset === 0;
  dataBrowserNext.disabled = dataBrowserOffset + DATA_BROWSER_PAGE_SIZE >= total;

  dataBrowserTableWrap.innerHTML = "";
  if (!result.rows.length) {
    dataBrowserTableWrap.innerHTML = `<p class="data-browser-status">No matching rows.</p>`;
    return;
  }
  const wrap = document.createElement("div");
  wrap.className = "sortable-table-wrap";
  const tableEl = document.createElement("table");
  tableEl.className = "sortable-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  result.columns.forEach((col) => {
    const th = document.createElement("th");
    th.textContent = col;
    if (dataBrowserSort && dataBrowserSort.column === col) th.dataset.sortDir = dataBrowserSort.dir;
    th.addEventListener("click", () => {
      const asc = !(dataBrowserSort && dataBrowserSort.column === col && dataBrowserSort.dir === "asc");
      dataBrowserSort = { column: col, dir: asc ? "asc" : "desc" };
      dataBrowserOffset = 0;
      loadDataBrowserPage();
    });
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  tableEl.appendChild(thead);

  const tbody = document.createElement("tbody");
  for (const row of result.rows) {
    const tr = document.createElement("tr");
    for (const cell of row) {
      const td = document.createElement("td");
      td.textContent = typeof cell === "number" ? fmt(cell) : cell === null || cell === undefined ? "—" : cell;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  tableEl.appendChild(tbody);
  wrap.appendChild(tableEl);
  dataBrowserTableWrap.appendChild(wrap);
}

dataBrowserClose.addEventListener("click", closeDataBrowser);
dataBrowserOverlay.addEventListener("click", (e) => {
  if (e.target === dataBrowserOverlay) closeDataBrowser();
});
dataBrowserPrev.addEventListener("click", () => {
  if (dataBrowserOffset === 0) return;
  dataBrowserOffset = Math.max(0, dataBrowserOffset - DATA_BROWSER_PAGE_SIZE);
  loadDataBrowserPage();
});
dataBrowserNext.addEventListener("click", () => {
  if (!dataBrowserTable) return;
  dataBrowserOffset += DATA_BROWSER_PAGE_SIZE;
  loadDataBrowserPage();
});
dataBrowserSearchInput.addEventListener("input", () => {
  dataBrowserSearchClear.classList.toggle("hidden", !dataBrowserSearchInput.value);
  clearTimeout(dataBrowserSearchDebounce);
  dataBrowserSearchDebounce = setTimeout(() => {
    dataBrowserSearch = dataBrowserSearchInput.value.trim();
    dataBrowserOffset = 0;
    loadDataBrowserPage();
  }, 300);
});
dataBrowserSearchClear.addEventListener("click", () => {
  dataBrowserSearchInput.value = "";
  dataBrowserSearchClear.classList.add("hidden");
  clearTimeout(dataBrowserSearchDebounce);
  dataBrowserSearch = "";
  dataBrowserOffset = 0;
  loadDataBrowserPage();
  dataBrowserSearchInput.focus();
});

dataBrowserFilterChipClear.addEventListener("click", () => {
  dataBrowserFilter = null;
  dataBrowserDuplicatesOnly = false;
  syncDataBrowserFilterChip();
  dataBrowserOffset = 0;
  loadDataBrowserPage();
});

dataBrowserExportBtn.addEventListener("click", async () => {
  const table = dataBrowserTable;
  if (!table) return;

  const whereClause = buildDataBrowserWhereClause(table);
  const fromSource = dataBrowserFromSource(table);
  const needsCount = whereClause || dataBrowserDuplicatesOnly;

  let sql = `SELECT * FROM ${fromSource}${whereClause}`;
  if (dataBrowserSort) {
    sql += ` ORDER BY ${quoteIdent(dataBrowserSort.column)} ${dataBrowserSort.dir === "desc" ? "DESC" : "ASC"}`;
  }
  sql += ` LIMIT ${DATA_BROWSER_EXPORT_LIMIT}`;

  const originalLabel = dataBrowserExportBtn.textContent;
  dataBrowserExportBtn.disabled = true;
  dataBrowserExportBtn.textContent = "Exporting…";
  try {
    const requests = [runSql(sql)];
    requests.push(
      needsCount
        ? runSql(`SELECT COUNT(*) FROM ${fromSource}${whereClause}`)
        : Promise.resolve(null)
    );
    const [pageData, countData] = await Promise.all(requests);
    const total = countData ? Number(countData.result.rows[0][0]) : table.row_count;
    downloadCsv(table.table, pageData.result.columns, pageData.result.rows);
    if (total > DATA_BROWSER_EXPORT_LIMIT) {
      showToast(`Only the first ${DATA_BROWSER_EXPORT_LIMIT.toLocaleString()} of ${total.toLocaleString()} matching rows were exported.`, "warning", 5000);
    }
  } catch (err) {
    showToast(err.message || "Export failed.", "error");
  } finally {
    dataBrowserExportBtn.disabled = false;
    dataBrowserExportBtn.textContent = originalLabel;
  }
});

// --- Command palette ---

let commandPaletteItems = [];
let commandPaletteSelected = 0;

function buildCommandPaletteActions() {
  const actions = [
    { icon: "＋", label: "New chat", enabled: !newChatBtn.classList.contains("hidden"), run: () => newChatBtn.click() },
    { icon: "🔎", label: "Find in this conversation", enabled: !chatSearchToggle.classList.contains("hidden"), run: () => chatSearchToggle.click() },
    { icon: "🕘", label: "Toggle question history", enabled: !historyToggle.classList.contains("hidden"), run: () => historyToggle.click() },
    { icon: "↻", label: "Regenerate suggested views", enabled: !insightsSection.classList.contains("hidden"), run: () => insightsRefresh.click() },
    { icon: "◐", label: "Toggle light / dark theme", enabled: true, run: () => themeToggle.click() },
    { icon: "⬇", label: "Export session report", enabled: true, run: () => exportReportBtn.click() },
    { icon: "🖨", label: "Print / Save as PDF", enabled: true, run: () => printReportBtn.click() },
    { icon: "⌨", label: "Show keyboard shortcuts", enabled: true, run: () => openShortcutsModal() },
    { icon: "📁", label: "Upload a different file", enabled: true, run: () => changeFileBtn.click() },
  ];
  return actions.filter((a) => a.enabled).map(({ enabled, ...rest }) => ({ ...rest, group: "Actions" }));
}

function replayHistoryEntry(entry) {
  chatEmptyState.classList.add("hidden");
  appendMessage("user", entry.question);
  const bubble = appendMessage("assistant", "");
  renderAnswerInto(bubble, entry);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function buildCommandPaletteEntries(query) {
  const trimmed = query.trim();
  const needle = trimmed.toLowerCase();
  const entries = [];

  for (const action of buildCommandPaletteActions()) {
    if (!needle || action.label.toLowerCase().includes(needle)) entries.push(action);
  }

  for (const q of currentSuggestedQuestions) {
    if (!needle || q.toLowerCase().includes(needle)) {
      entries.push({ icon: "✨", label: q, group: "Suggested questions", run: () => askQuestion(q) });
    }
  }

  const seen = new Set();
  for (const entry of [...currentHistory].reverse()) {
    if (seen.has(entry.question) || seen.size >= 8) continue;
    if (!needle || entry.question.toLowerCase().includes(needle)) {
      seen.add(entry.question);
      entries.push({ icon: "↺", label: entry.question, group: "Recent questions", run: () => replayHistoryEntry(entry) });
    }
  }

  // Placed last, not first: an exact action/suggestion/history match above is
  // almost always what the user meant by their keystrokes, so it should win
  // the default (index 0) selection over a literal "ask this text" fallback.
  if (trimmed) {
    entries.push({ icon: "💬", label: `Ask "${trimmed}"`, group: "Ask", run: () => askQuestion(trimmed) });
  }

  return entries;
}

function updateCommandPaletteSelection() {
  const rows = commandPaletteResults.querySelectorAll(".command-palette-item");
  rows.forEach((row, idx) => {
    row.classList.toggle("selected", idx === commandPaletteSelected);
    if (idx === commandPaletteSelected) row.scrollIntoView({ block: "nearest" });
  });
}

function runCommandPaletteItem(idx) {
  const item = commandPaletteItems[idx];
  if (!item) return;
  closeCommandPalette();
  item.run();
}

function renderCommandPaletteResults() {
  commandPaletteItems = buildCommandPaletteEntries(commandPaletteInput.value);
  commandPaletteSelected = Math.min(commandPaletteSelected, Math.max(0, commandPaletteItems.length - 1));
  commandPaletteResults.innerHTML = "";

  if (!commandPaletteItems.length) {
    const empty = document.createElement("div");
    empty.className = "command-palette-empty";
    empty.textContent = "No matches.";
    commandPaletteResults.appendChild(empty);
    return;
  }

  let lastGroup = null;
  commandPaletteItems.forEach((item, idx) => {
    if (item.group !== lastGroup) {
      const groupEl = document.createElement("div");
      groupEl.className = "command-palette-group";
      groupEl.textContent = item.group;
      commandPaletteResults.appendChild(groupEl);
      lastGroup = item.group;
    }
    const row = document.createElement("button");
    row.type = "button";
    row.className = "command-palette-item" + (idx === commandPaletteSelected ? " selected" : "");
    const iconEl = document.createElement("span");
    iconEl.className = "command-palette-item-icon";
    iconEl.setAttribute("aria-hidden", "true");
    iconEl.textContent = item.icon;
    const labelEl = document.createElement("span");
    labelEl.className = "command-palette-item-label";
    labelEl.textContent = item.label;
    row.appendChild(iconEl);
    row.appendChild(labelEl);
    row.addEventListener("mouseenter", () => {
      commandPaletteSelected = idx;
      updateCommandPaletteSelection();
    });
    row.addEventListener("click", () => runCommandPaletteItem(idx));
    commandPaletteResults.appendChild(row);
  });
}

function openCommandPalette() {
  commandPaletteInput.value = "";
  commandPaletteSelected = 0;
  renderCommandPaletteResults();
  openModal(commandPaletteOverlay, commandPaletteInput);
}

function closeCommandPalette() {
  closeModal(commandPaletteOverlay);
}

commandPaletteInput.addEventListener("input", () => {
  commandPaletteSelected = 0;
  renderCommandPaletteResults();
});

commandPaletteInput.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown") {
    e.preventDefault();
    commandPaletteSelected = Math.min(commandPaletteSelected + 1, commandPaletteItems.length - 1);
    updateCommandPaletteSelection();
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    commandPaletteSelected = Math.max(commandPaletteSelected - 1, 0);
    updateCommandPaletteSelection();
  } else if (e.key === "Enter") {
    e.preventDefault();
    runCommandPaletteItem(commandPaletteSelected);
  }
});

commandPaletteOverlay.addEventListener("click", (e) => {
  if (e.target === commandPaletteOverlay) closeCommandPalette();
});

function isEditableTarget(el) {
  if (!el) return false;
  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

document.addEventListener("keydown", (e) => {
  const cmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
  if (cmdK && !appSection.classList.contains("hidden")) {
    e.preventDefault();
    openCommandPalette();
    return;
  }

  if (e.key === "Escape") {
    if (!commandPaletteOverlay.classList.contains("hidden")) closeCommandPalette();
    else if (!dataBrowserOverlay.classList.contains("hidden")) closeDataBrowser();
    else if (!columnProfileOverlay.classList.contains("hidden")) closeColumnProfile();
    else if (!shortcutsOverlay.classList.contains("hidden")) closeShortcutsModal();
    else if (!modelModalOverlay.classList.contains("hidden")) closeModelModal();
    else if (!insightModalOverlay.classList.contains("hidden")) closeInsightModal();
    else if (!historyPanel.classList.contains("hidden")) historyPanel.classList.add("hidden");
    else if (!chatSearchBar.classList.contains("hidden")) closeChatSearch();
    else if (document.activeElement === chatInput) chatInput.blur();
    return;
  }

  // Single-letter shortcuts below must never fire while the user is typing
  // (chat input, history search, edit-SQL textarea, etc.) or with a modifier
  // held (which would otherwise hijack browser/OS shortcuts like Ctrl+R).
  if (e.metaKey || e.ctrlKey || e.altKey || isEditableTarget(e.target)) return;

  if (e.key === "?") {
    e.preventDefault();
    shortcutsOverlay.classList.contains("hidden") ? openShortcutsModal() : closeShortcutsModal();
    return;
  }

  if (appSection.classList.contains("hidden")) return;

  const key = e.key.toLowerCase();
  if (key === "t") {
    themeToggle.click();
  } else if (key === "n" && !newChatBtn.classList.contains("hidden")) {
    newChatBtn.click();
  } else if (key === "h" && !historyToggle.classList.contains("hidden")) {
    historyToggle.click();
  } else if (key === "f" && !chatSearchToggle.classList.contains("hidden")) {
    chatSearchToggle.click();
  } else if (key === "r" && !insightsSection.classList.contains("hidden")) {
    insightsRefresh.click();
  } else if (key === "p") {
    printReportBtn.click();
  }
});

// --- CSV export ---

function toCsvValue(v) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function resultToCsv(columns, rows) {
  const lines = [columns.map(toCsvValue).join(",")];
  for (const row of rows) lines.push(row.map(toCsvValue).join(","));
  return lines.join("\n");
}

function downloadCsv(filename, columns, rows) {
  const csv = resultToCsv(columns, rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast(`Exported ${filename}`, "success");
}

function buildExportButton(filename, columns, rows) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "export-btn";
  btn.textContent = "Export CSV";
  btn.addEventListener("click", () => downloadCsv(filename, columns, rows));
  return btn;
}

// --- Session report export ---

function buildSessionReportMarkdown() {
  const lines = [];
  lines.push(`# Datalume session report`);
  lines.push("");
  lines.push(`**Source:** ${currentSourceLabel || "—"}  `);
  lines.push(`**Generated:** ${new Date().toLocaleString()}`);

  if (currentDashboard && currentDashboard.tables && currentDashboard.tables.length) {
    lines.push("");
    lines.push(`## Dataset summary`);
    for (const t of currentDashboard.tables) {
      lines.push("");
      lines.push(`### ${t.table}`);
      const dupWord = t.duplicate_rows === 1 ? "duplicate row" : "duplicate rows";
      lines.push(`- ${t.row_count.toLocaleString()} rows, ${t.column_count} columns, ${t.duplicate_rows.toLocaleString()} ${dupWord}`);
      if (t.numeric_columns && t.numeric_columns.length) {
        lines.push(`- Numeric columns: ${t.numeric_columns.join(", ")}`);
      }
      if (t.categorical_columns && t.categorical_columns.length) {
        lines.push(`- Categorical columns: ${t.categorical_columns.join(", ")}`);
      }
      if (t.date_columns && t.date_columns.length) {
        lines.push(`- Date columns: ${t.date_columns.join(", ")}`);
      }
      const missingEntries = Object.entries(t.missing_values || {});
      if (missingEntries.length) {
        lines.push(`- Missing values: ${missingEntries.map(([c, n]) => `${c} (${n})`).join(", ")}`);
      }
    }
  }

  if (currentRelationships.length) {
    lines.push("");
    lines.push(`## Table relationships`);
    for (const r of currentRelationships) {
      lines.push(`- ${r.from_table}.${r.from_column} → ${r.to_table}.${r.to_column}`);
    }
  }

  if (currentInsights.length) {
    lines.push("");
    lines.push(`## Suggested views`);
    for (const view of currentInsights) {
      const conf = typeof view.confidence === "number" ? ` — ${Math.round(view.confidence * 100)}% confidence` : "";
      lines.push(`- **${view.title}** (${view.chart_type})${conf}`);
    }
  }

  if (currentHistory.length) {
    lines.push("");
    lines.push(`## Questions & answers`);
    for (const entry of currentHistory) {
      lines.push("");
      lines.push(`**Q: ${entry.question}**`);
      lines.push("");
      lines.push(entry.answer || "_(no answer recorded)_");
      if (entry.sql) {
        lines.push("");
        lines.push("```sql");
        lines.push(entry.sql);
        lines.push("```");
      }
    }
  }

  lines.push("");
  lines.push("---");
  lines.push("_Generated by Datalume._");
  return lines.join("\n");
}

function downloadReport() {
  const markdown = buildSessionReportMarkdown();
  const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "datalume-report.md";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
  showToast("Report exported", "success");
}

exportReportBtn.addEventListener("click", downloadReport);

printReportBtn.addEventListener("click", () => window.print());

// Chart.js canvases and Leaflet maps are sized for their on-screen container;
// the print stylesheet reflows panels to a single column, so both need an
// explicit resize once that reflow has actually happened or the printed
// output can show charts clipped/blank from their old on-screen dimensions.
const activeLeafletMaps = [];
function resyncChartsAndMaps() {
  for (const chart of Object.values(Chart.instances)) chart.resize();
  for (const map of activeLeafletMaps) map.invalidateSize();
}
window.addEventListener("beforeprint", resyncChartsAndMaps);
window.addEventListener("afterprint", resyncChartsAndMaps);

// --- Welcome screen ---

function enterUpload() {
  welcomeSection.classList.add("hidden");
  uploadSection.classList.remove("hidden");
}

heroGetStartedBtn.addEventListener("click", enterUpload);

heroSampleDataBtn.addEventListener("click", () => {
  enterUpload();
  loadSampleData(heroSampleDataBtn);
});

// --- Upload: drag & drop + click-to-browse ---

dropZone.addEventListener("click", () => fileInput.click());

dropZone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    fileInput.click();
  }
});

["dragenter", "dragover"].forEach((evt) =>
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.add("drag-active");
  })
);

["dragleave", "dragend"].forEach((evt) =>
  dropZone.addEventListener(evt, (e) => {
    e.preventDefault();
    dropZone.classList.remove("drag-active");
  })
);

dropZone.addEventListener("drop", (e) => {
  e.preventDefault();
  dropZone.classList.remove("drag-active");
  const file = e.dataTransfer.files[0];
  if (file) uploadFile(file);
});

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];
  if (file) uploadFile(file);
});

async function loadSampleData(button) {
  try {
    button.disabled = true;
    const res = await fetch("sample_superstore.csv");
    if (!res.ok) throw new Error("Couldn't load the sample file.");
    const blob = await res.blob();
    const file = new File([blob], "sample_superstore.csv", { type: "text/csv" });
    await uploadFile(file);
  } catch (err) {
    showUploadStatus(err.message, true);
  } finally {
    button.disabled = false;
  }
}

sampleDataBtn.addEventListener("click", () => loadSampleData(sampleDataBtn));

async function resetToUpload() {
  if (sessionId) {
    try {
      await fetch(`/session/${sessionId}`, { method: "DELETE" });
    } catch {
      // best-effort cleanup — the session will TTL out server-side regardless
    }
    localStorage.removeItem(pinnedStorageKey(sessionId));
    localStorage.removeItem(dismissedStorageKey(sessionId));
    localStorage.removeItem(chartTypeOverrideStorageKey(sessionId));
    localStorage.removeItem(insightOrderStorageKey(sessionId));
    localStorage.removeItem(dataHealthDismissedKey());
  }
  sessionId = null;
  localStorage.removeItem(SESSION_STORAGE_KEY);
  fileInput.value = "";
  chatInput.value = "";
  chatInput.style.height = "";
  chatLog.innerHTML = "";
  chatLog.appendChild(chatEmptyState);
  chatEmptyState.classList.remove("hidden");
  uploadStatus.classList.add("hidden");
  appSection.classList.add("hidden");
  uploadSection.classList.remove("hidden");
  dashboardNarrative.innerHTML = "";
  dashboardNarrative.classList.add("hidden");
  dashboardExportAllBtn.classList.add("hidden");
  insightsContent.innerHTML = "";
  insightsSection.classList.add("hidden");
  insightsRefresh.classList.add("hidden");
  insightsTakeaways.innerHTML = "";
  insightsTakeaways.classList.add("hidden");
  closeModal(customInsightOverlay);
  customInsightForm.reset();
  customInsightError.classList.add("hidden");
  insightFieldCandidates = null;
  historyListEl.innerHTML = "";
  historySearchInput.value = "";
  historyPanel.classList.add("hidden");
  historyToggle.classList.add("hidden");
  newChatBtn.classList.add("hidden");
  closeChatSearch();
  chatSearchToggle.classList.add("hidden");
  currentDashboard = null;
  currentInsights = [];
  activeLeafletMaps.length = 0;
  pinnedInsights = [];
  dismissedInsights = [];
  chartTypeOverrides = {};
  insightOrderOverride = [];
  currentHistory = [];
  historyNavIndex = -1;
  currentSourceLabel = "";
  currentRelationships = [];
  relationshipsPanel.innerHTML = "";
  relationshipsPanel.classList.add("hidden");
  addTableStatus.classList.add("hidden");
  addTableProgress.classList.add("hidden");
  addTableProgressBar.classList.remove("indeterminate");
  addTableProgressBar.style.width = "0%";
}
changeFileBtn.addEventListener("click", resetToUpload);

// A session-scoped request (chat, etc.) 404ing with this backend message means
// the 30-minute TTL swept the session server-side — the idle-warning toast
// above is the main defense against this, but it can still happen (sleep,
// backgrounded tab, multiple tabs). Give the user a one-click way out instead
// of leaving them stuck on a dashboard where every further action will also
// silently fail.
function isSessionExpiredMessage(message) {
  return typeof message === "string" && /session (not found|expired)/i.test(message);
}

function showSessionExpiredToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast error";
  toast.innerHTML =
    '<span class="toast-icon" aria-hidden="true">⚠</span>' +
    '<span class="toast-body">' +
    `<span class="toast-text">${escapeHtml(message)}</span>` +
    '<button type="button" class="btn-link toast-action">Start over</button>' +
    "</span>" +
    '<button type="button" class="toast-close-btn" aria-label="Dismiss">×</button>';
  toastContainer.appendChild(toast);
  const dismiss = () => {
    toast.classList.add("leaving");
    setTimeout(() => toast.remove(), 200);
  };
  toast.querySelector(".toast-close-btn").addEventListener("click", dismiss);
  toast.querySelector(".toast-action").addEventListener("click", () => {
    dismiss();
    resetToUpload();
  });
  return toast;
}

historyToggle.addEventListener("click", () => {
  historyPanel.classList.toggle("hidden");
});

// --- In-conversation find (distinct from the saved-history search above:
// this filters the live, currently-open chat log by message text) ---

let chatSearchMatches = [];
let chatSearchIndex = -1;

function isChatSearchOpen() {
  return !chatSearchBar.classList.contains("hidden");
}

function clearChatSearchFilter() {
  chatSearchMatches = [];
  chatSearchIndex = -1;
  chatSearchCount.textContent = "";
  chatLog.querySelectorAll(".msg").forEach((el) => {
    el.classList.remove("chat-search-hidden", "chat-search-active");
  });
}

function updateChatSearchNav() {
  chatSearchPrev.disabled = chatSearchMatches.length === 0;
  chatSearchNext.disabled = chatSearchMatches.length === 0;
  chatSearchMatches.forEach((el) => el.classList.remove("chat-search-active"));
  if (!chatSearchMatches.length) {
    chatSearchCount.textContent = chatSearchInput.value.trim() ? "0/0" : "";
    return;
  }
  chatSearchCount.textContent = `${chatSearchIndex + 1}/${chatSearchMatches.length}`;
  const active = chatSearchMatches[chatSearchIndex];
  active.classList.add("chat-search-active");
  active.scrollIntoView({ block: "center", behavior: "smooth" });
}

function runChatSearch() {
  const query = chatSearchInput.value.trim().toLowerCase();
  if (!query) {
    clearChatSearchFilter();
    return;
  }
  chatSearchMatches = [];
  chatLog.querySelectorAll(".msg").forEach((el) => {
    const isMatch = el.textContent.toLowerCase().includes(query);
    el.classList.toggle("chat-search-hidden", !isMatch);
    el.classList.remove("chat-search-active"); // avoid a stale active flag surviving on a message that just fell out of the match set
    if (isMatch) chatSearchMatches.push(el);
  });
  chatSearchIndex = chatSearchMatches.length ? 0 : -1;
  updateChatSearchNav();
}

function chatSearchStep(delta) {
  if (!chatSearchMatches.length) return;
  chatSearchIndex = (chatSearchIndex + delta + chatSearchMatches.length) % chatSearchMatches.length;
  updateChatSearchNav();
}

function openChatSearch() {
  chatSearchBar.classList.remove("hidden");
  chatSearchInput.focus();
  chatSearchInput.select();
  runChatSearch();
}

function closeChatSearch() {
  chatSearchBar.classList.add("hidden");
  chatSearchInput.value = "";
  clearChatSearchFilter();
}

chatSearchToggle.addEventListener("click", () => {
  isChatSearchOpen() ? closeChatSearch() : openChatSearch();
});
chatSearchClose.addEventListener("click", closeChatSearch);
chatSearchInput.addEventListener("input", runChatSearch);
chatSearchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    chatSearchStep(e.shiftKey ? -1 : 1);
  } else if (e.key === "Escape") {
    e.preventDefault();
    closeChatSearch();
  }
});
chatSearchPrev.addEventListener("click", () => chatSearchStep(-1));
chatSearchNext.addEventListener("click", () => chatSearchStep(1));

dashboardExportAllBtn.addEventListener("click", exportAllDashboardCharts);

newChatBtn.addEventListener("click", async () => {
  if (!sessionId) return;
  if (activeChatAbort) {
    activeChatAbort.abort();
  }
  try {
    await fetch(`/dashboard/${sessionId}/clear-chat`, { method: "POST" });
  } catch {
    // best-effort — worst case the old context lingers server-side until it's overwritten
  }
  chatLog.innerHTML = "";
  chatLog.appendChild(chatEmptyState);
  chatEmptyState.classList.remove("hidden");
  historyPanel.classList.add("hidden");
  showToast("Started a new chat", "info");
});

function uploadWithProgress(formData, onProgress, url = "/upload") {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(e.loaded / e.total);
    };
    xhr.onload = () => {
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Upload failed: the server sent an invalid response."));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data.detail || "Upload failed."));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed — check your connection and try again."));
    xhr.send(formData);
  });
}

async function uploadFile(file) {
  if (uploading) return;
  uploading = true;
  dropZone.classList.add("busy");
  showUploadStatus(`Uploading "${file.name}"…`, false);
  uploadProgressBar.classList.remove("indeterminate");
  uploadProgressBar.style.width = "0%";
  uploadProgress.classList.remove("hidden");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const data = await uploadWithProgress(formData, (fraction) => {
      if (fraction >= 1) {
        uploadProgressBar.style.width = "100%";
        uploadProgressBar.classList.add("indeterminate");
        showUploadStatus(`Parsing "${file.name}"…`, false);
      } else {
        uploadProgressBar.style.width = `${Math.round(fraction * 100)}%`;
        showUploadStatus(`Uploading "${file.name}"… ${Math.round(fraction * 100)}%`, false);
      }
    });

    sessionId = data.session_id;
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    currentSourceLabel = file.name;
    sourceFilename.textContent = `${currentSourceLabel} — ${data.schema.length} table${data.schema.length === 1 ? "" : "s"}`;
    currentDashboard = data.dashboard;
    currentInsights = [];
    pinnedInsights = [];
    dismissedInsights = [];
    chartTypeOverrides = {};
    insightOrderOverride = [];
    currentHistory = [];
    historyNavIndex = -1;
    currentRelationships = data.relationships || [];
    renderDashboard(data.dashboard);
    renderRelationships(currentRelationships);
    renderSuggestedQuestions(data.suggested_questions);
    chatLog.innerHTML = "";
    chatEmptyState.classList.remove("hidden");
    chatLog.appendChild(chatEmptyState);
    uploadStatus.classList.add("hidden");
    welcomeSection.classList.add("hidden");
    uploadSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    loadInsights(sessionId); // fire-and-forget — never blocks the dashboard render
    loadNarrative(sessionId); // fire-and-forget — never blocks the dashboard render
  } catch (err) {
    showUploadStatus(err.message, true);
  } finally {
    uploading = false;
    dropZone.classList.remove("busy");
    uploadProgress.classList.add("hidden");
    uploadProgressBar.classList.remove("indeterminate");
    uploadProgressBar.style.width = "0%";
  }
}

function showUploadStatus(text, isError) {
  uploadStatus.textContent = text;
  uploadStatus.classList.remove("hidden");
  uploadStatus.classList.toggle("error", isError);
}

// --- Add another file to the current session ---
// Distinct from uploadFile()/resetToUpload(): this keeps the existing
// session, chat history, and DuckDB connection intact, just merging in the
// new file's table(s) and rebuilding schema/relationships/dashboard around
// the combined set.

let addingTable = false;

function showAddTableStatus(text, isError) {
  addTableStatus.textContent = text;
  addTableStatus.classList.remove("hidden");
  addTableStatus.classList.toggle("error", isError);
}

addTableBtn.addEventListener("click", () => {
  if (!sessionId || addingTable) return;
  addTableInput.click();
});

addTableInput.addEventListener("change", () => {
  const file = addTableInput.files[0];
  addTableInput.value = "";
  if (file) addTable(file);
});

async function addTable(file) {
  if (!sessionId || addingTable) return;
  addingTable = true;
  addTableBtn.disabled = true;
  showAddTableStatus(`Uploading "${file.name}"…`, false);
  addTableProgressBar.classList.remove("indeterminate");
  addTableProgressBar.style.width = "0%";
  addTableProgress.classList.remove("hidden");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const data = await uploadWithProgress(formData, (fraction) => {
      if (fraction >= 1) {
        addTableProgressBar.style.width = "100%";
        addTableProgressBar.classList.add("indeterminate");
        showAddTableStatus(`Parsing "${file.name}"…`, false);
      } else {
        addTableProgressBar.style.width = `${Math.round(fraction * 100)}%`;
        showAddTableStatus(`Uploading "${file.name}"… ${Math.round(fraction * 100)}%`, false);
      }
    }, `/upload/${sessionId}/add-table`);

    currentSourceLabel = `${currentSourceLabel} + ${file.name}`;
    sourceFilename.textContent = `${currentSourceLabel} — ${data.schema.length} table${data.schema.length === 1 ? "" : "s"}`;
    currentDashboard = data.dashboard;
    currentRelationships = data.relationships || [];
    renderDashboard(data.dashboard);
    renderRelationships(currentRelationships);
    renderSuggestedQuestions(data.suggested_questions || []);

    // Insights/narrative are invalidated server-side (they're stale against
    // the new combined dashboard) — refresh them the same fire-and-forget
    // way a fresh upload does, without touching chat history.
    dashboardNarrative.innerHTML = "";
    dashboardNarrative.classList.add("hidden");
    loadInsights(sessionId, true);
    loadNarrative(sessionId, true);

    const added = data.added_tables && data.added_tables.length ? data.added_tables.join(", ") : file.name;
    showAddTableStatus(`Added "${added}" to this session.`, false);
  } catch (err) {
    showAddTableStatus(err.message, true);
  } finally {
    addingTable = false;
    addTableBtn.disabled = false;
    addTableProgress.classList.add("hidden");
    addTableProgressBar.classList.remove("indeterminate");
    addTableProgressBar.style.width = "0%";
  }
}

async function removeTable(tableName) {
  if (!sessionId || addingTable) return;
  if (!window.confirm(`Remove table "${tableName}" from this session? This can't be undone.`)) return;

  addingTable = true; // reuse the add-table busy flag — both mutate the same session shape
  try {
    const res = await fetch(`/session/${sessionId}/table/${encodeURIComponent(tableName)}`, {
      method: "DELETE",
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to remove table.");

    currentSourceLabel = currentSourceLabel
      .replace(/ — \d+ tables?$/, "")
      .split(" + ")
      .filter((part) => !part.startsWith(tableName))
      .join(" + ");
    sourceFilename.textContent = `${currentSourceLabel} — ${data.schema.length} table${data.schema.length === 1 ? "" : "s"}`;
    currentDashboard = data.dashboard;
    currentRelationships = data.relationships || [];
    renderDashboard(data.dashboard);
    renderRelationships(currentRelationships);
    renderSuggestedQuestions(data.suggested_questions || []);

    dashboardNarrative.innerHTML = "";
    dashboardNarrative.classList.add("hidden");
    loadInsights(sessionId, true);
    loadNarrative(sessionId, true);

    showToast(`Removed "${tableName}" from this session.`, "success");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    addingTable = false;
  }
}

async function renameTable(tableName) {
  if (!sessionId || addingTable) return;
  const newName = window.prompt(`Rename table "${tableName}" to:`, tableName);
  if (!newName || newName.trim() === "" || newName === tableName) return;

  addingTable = true; // reuse the add-table busy flag — both mutate the same session shape
  try {
    const res = await fetch(`/session/${sessionId}/table/${encodeURIComponent(tableName)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ new_name: newName.trim() }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to rename table.");

    currentDashboard = data.dashboard;
    currentRelationships = data.relationships || [];
    renderDashboard(data.dashboard);
    renderRelationships(currentRelationships);
    renderSuggestedQuestions(data.suggested_questions || []);

    dashboardNarrative.innerHTML = "";
    dashboardNarrative.classList.add("hidden");
    loadInsights(sessionId, true);
    loadNarrative(sessionId, true);

    showToast(`Renamed "${tableName}" to "${data.new_name}".`, "success");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    addingTable = false;
  }
}

// --- Session rehydration on page load ---
// A page refresh normally loses all client state even though the backend
// session survives up to 30 minutes — restore it from the saved session id
// so a reload doesn't throw away the dashboard/chat.

async function restoreSession() {
  const savedId = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!savedId) return;

  try {
    const res = await fetch(`/dashboard/${savedId}`);
    if (!res.ok) throw new Error("expired");
    const data = await res.json();

    sessionId = savedId;
    noteSessionTouch();
    pinnedInsights = loadPinnedInsights(sessionId);
    dismissedInsights = loadDismissedInsights(sessionId);
    chartTypeOverrides = loadChartTypeOverrides(sessionId);
    insightOrderOverride = loadInsightOrder(sessionId);
    currentSourceLabel = data.source_filename || "Restored session";
    sourceFilename.textContent = currentSourceLabel;
    currentDashboard = data.dashboard;
    currentRelationships = data.relationships || [];
    renderDashboard(data.dashboard);
    renderRelationships(currentRelationships);
    renderSuggestedQuestions(data.suggested_questions || []);

    welcomeSection.classList.add("hidden");
    uploadSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    loadInsights(sessionId); // fire-and-forget — never blocks the restore
    loadNarrative(sessionId); // fire-and-forget — never blocks the restore

    const histRes = await fetch(`/dashboard/${sessionId}/history`);
    if (histRes.ok) {
      const histData = await histRes.json();
      const history = histData.history || [];
      const clearedAt = histData.chat_cleared_at || 0;
      // Only replay entries asked after the last "New chat" reset into the
      // visible log — the History panel below still gets the full archive,
      // so clearing chat never loses anything, it just stops auto-replaying it.
      const visibleHistory = history.filter((entry) => entry.timestamp > clearedAt);
      if (visibleHistory.length) {
        chatEmptyState.classList.add("hidden");
        for (const entry of visibleHistory) {
          appendMessage("user", entry.question);
          renderAnswerInto(appendMessage("assistant", ""), entry);
        }
        chatLog.scrollTop = chatLog.scrollHeight;
      }
      renderHistoryPanel(history);
    }

    showToast("Restored your previous session", "info");
  } catch {
    const hadSession = !!localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedId) localStorage.removeItem(pinnedStorageKey(savedId));
    localStorage.removeItem(SESSION_STORAGE_KEY);
    sessionId = null;
    if (hadSession) {
      showToast("Your previous session expired from inactivity — please upload again", "info", 5000);
    }
  }
}

function renderAuthMode() {
  const registering = authMode === "register";
  authTitle.textContent = registering ? "Create your Datalume account" : "Sign in to Datalume";
  authHint.textContent = registering
    ? "Create a private account for your dashboards and saved sessions."
    : "Use your Datalume account to keep sessions private and available after a reload.";
  authSubmit.textContent = registering ? "Create account" : "Sign in";
  authModeToggle.textContent = registering ? "Already have an account? Sign in" : "Need an account? Create one";
  authPassword.autocomplete = registering ? "new-password" : "current-password";
}

function showAuthError(message) {
  authError.textContent = message || "";
}

async function initAuth() {
  try {
    const res = await fetch("/auth/status", { credentials: "same-origin" });
    if (!res.ok) throw new Error("Couldn't check authentication.");
    const status = await res.json();
    if (status.authenticated) {
      authLogout.classList.remove("hidden");
      return true;
    }
    authMode = status.has_users ? "login" : "register";
    renderAuthMode();
    authGate.classList.remove("hidden");
    setTimeout(() => authUsername.focus(), 0);
    return false;
  } catch (err) {
    showAuthError(err.message || "Couldn't reach the backend.");
    authGate.classList.remove("hidden");
    return false;
  }
}

authModeToggle.addEventListener("click", () => {
  authMode = authMode === "login" ? "register" : "login";
  showAuthError("");
  renderAuthMode();
  authPassword.focus();
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  authSubmit.disabled = true;
  showAuthError("");
  try {
    const endpoint = authMode === "register" ? "/auth/register" : "/auth/login";
    const res = await fetch(endpoint, {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: authUsername.value.trim(), password: authPassword.value }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Authentication failed.");
    authGate.classList.add("hidden");
    authLogout.classList.remove("hidden");
    authPassword.value = "";
    await restoreSession();
  } catch (err) {
    showAuthError(err.message || "Authentication failed.");
  } finally {
    authSubmit.disabled = false;
  }
});

authLogout.addEventListener("click", async () => {
  authLogout.disabled = true;
  try {
    await fetch("/auth/logout", { method: "POST", credentials: "same-origin" });
  } finally {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    window.location.reload();
  }
});

renderAuthMode();
initAuth().then((authenticated) => {
  if (authenticated) restoreSession();
});

// --- Chat ---

const CHAT_INPUT_MAX_HEIGHT = 160;

function autoResizeChatInput() {
  if (!chatInput.value) {
    chatInput.style.height = "";
    return;
  }
  chatInput.style.height = "auto";
  chatInput.style.height = Math.min(chatInput.scrollHeight, CHAT_INPUT_MAX_HEIGHT) + "px";
}

chatInput.addEventListener("input", autoResizeChatInput);

function recallableQuestions() {
  // newest first, so ArrowUp once recalls the most recent question
  return [...currentHistory].reverse().map((entry) => entry.question);
}

chatInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter" && !e.shiftKey) {
    e.preventDefault();
    historyNavIndex = -1;
    chatForm.requestSubmit();
    return;
  }

  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
    const list = recallableQuestions();
    const atCaretStart = chatInput.selectionStart === 0 && chatInput.selectionEnd === 0;

    if (e.key === "ArrowUp" && list.length && (historyNavIndex !== -1 || atCaretStart)) {
      if (historyNavIndex === -1) historyNavDraft = chatInput.value;
      if (historyNavIndex < list.length - 1) {
        historyNavIndex++;
        const value = list[historyNavIndex];
        chatInput.value = value;
        autoResizeChatInput();
        chatInput.setSelectionRange(value.length, value.length);
      }
      e.preventDefault();
    } else if (e.key === "ArrowDown" && historyNavIndex !== -1) {
      historyNavIndex--;
      const value = historyNavIndex === -1 ? historyNavDraft : list[historyNavIndex];
      chatInput.value = value;
      autoResizeChatInput();
      chatInput.setSelectionRange(value.length, value.length);
      e.preventDefault();
    }
  } else if (
    historyNavIndex !== -1 &&
    !["Shift", "Control", "Alt", "Meta", "CapsLock", "Tab"].includes(e.key)
  ) {
    // any other real edit (typing, backspace, paste-via-Ctrl+V's keydown, etc.) exits recall mode
    historyNavIndex = -1;
  }
});

chatForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (activeChatAbort) {
    activeChatAbort.abort();
    return;
  }
  const message = chatInput.value.trim();
  if (!message || !sessionId) return;
  chatInput.value = "";
  autoResizeChatInput();
  askQuestion(message);
});

function renderSuggestedQuestions(questions) {
  currentSuggestedQuestions = questions || [];
  suggestedQuestionsEl.innerHTML = "";
  for (const q of questions) {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "suggestion-chip";
    chip.textContent = q;
    chip.addEventListener("click", () => askQuestion(q));
    suggestedQuestionsEl.appendChild(chip);
  }
}

// The typing bubble's status text and a newly appended answer change silently
// for screen-reader users, so both are also spoken through a polite live
// region. Errors are not repeated here: the toast container already announces
// them. Each update replaces any still-pending one so a slow reader is never
// left on a stale status.
const chatAnnouncer = document.getElementById("chat-announcer");
let chatAnnounceTimer = null;
function announceChat(text) {
  if (!chatAnnouncer) return;
  window.clearTimeout(chatAnnounceTimer);
  // Clearing first makes the same text (e.g. two identical statuses) speak again.
  chatAnnouncer.textContent = "";
  chatAnnounceTimer = window.setTimeout(() => { chatAnnouncer.textContent = text; }, 60);
}

const ANNOUNCE_MAX_CHARS = 600;
function answerAnnouncement(answer) {
  const plain = String(answer || "").replace(/[*`#>]+/g, "").replace(/\s+/g, " ").trim();
  if (!plain) return "Answer ready.";
  const clipped = plain.length > ANNOUNCE_MAX_CHARS ? `${plain.slice(0, ANNOUNCE_MAX_CHARS)}…` : plain;
  return `Answer: ${clipped}`;
}

async function askQuestion(message, { regenerateEl } = {}) {
  if (activeChatAbort) return; // one in-flight question at a time
  noteSessionTouch();
  chatEmptyState.classList.add("hidden");
  // Regenerate reuses the existing answer bubble in place rather than
  // appending a duplicate question + answer at the end of the chat log.
  if (!regenerateEl) appendMessage("user", message);
  const pending = regenerateEl ? resetToTypingIndicator(regenerateEl) : appendTypingIndicator();
  const controller = new AbortController();
  activeChatAbort = controller;
  setChatBusy(true);

  const statusEl = pending.querySelector(".typing-status");

  try {
    const res = await fetch("/chat/stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionId, message }),
      signal: controller.signal,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.detail || "Something went wrong.");
    }

    // Server-Sent Events: each event is a "data: {...}\n\n" chunk. Buffer raw
    // bytes across reads since a chunk boundary can land mid-event.
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let finalData = null;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop(); // last chunk may be incomplete — keep it for next read
      for (const raw of events) {
        const line = raw.split("\n").find((l) => l.startsWith("data: "));
        if (!line) continue;
        const evt = JSON.parse(line.slice("data: ".length));
        if (evt.type === "status" && statusEl) {
          statusEl.textContent = evt.message;
          announceChat(evt.message);
        } else if (evt.type === "error") {
          throw new Error(evt.message || "Something went wrong.");
        } else if (evt.type === "done") {
          finalData = evt;
          announceChat(answerAnnouncement(evt.answer));
        }
      }
    }

    if (!finalData) throw new Error("Something went wrong.");
    renderAnswerInto(pending, finalData, message);
  } catch (err) {
    pending.innerHTML = "";
    const textEl = document.createElement("div");
    textEl.className = "text";
    if (err.name === "AbortError") {
      textEl.classList.add("text-muted");
      textEl.textContent = "Stopped.";
      pending.appendChild(textEl);
      announceChat("Stopped.");
    } else {
      textEl.textContent = err.message;
      pending.appendChild(textEl);
      if (isSessionExpiredMessage(err.message)) {
        showSessionExpiredToast(err.message);
      } else {
        showToast(err.message, "error");
        // The local model timing out or dropping mid-request is the most
        // common failure here — a one-click retry beats making the user
        // retype the whole question.
        const actions = document.createElement("div");
        actions.className = "answer-actions";
        const retryBtn = document.createElement("button");
        retryBtn.type = "button";
        retryBtn.className = "copy-btn answer-regen-btn";
        retryBtn.textContent = "Retry";
        retryBtn.addEventListener("click", () => askQuestion(message, { regenerateEl: pending }));
        actions.appendChild(retryBtn);
        pending.appendChild(actions);
      }
      checkLlmStatus(); // a chat failure is the most likely moment the local model just went down
    }
    if (isChatSearchOpen()) runChatSearch();
  } finally {
    activeChatAbort = null;
    setChatBusy(false);
    chatLog.scrollTop = chatLog.scrollHeight;
    refreshHistory(); // fire-and-forget — never blocks the chat UI
  }
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Small, hand-rolled markdown subset for model answers (bold/italic/inline
// code/lists/paragraphs) — no dependency, and every line is HTML-escaped
// before any markup is applied so the model's own text can never inject tags.
function renderMarkdownLite(raw) {
  const inline = (s) =>
    escapeHtml(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, "$1<em>$2</em>");

  const lines = String(raw ?? "").split(/\r?\n/);
  const htmlParts = [];
  let listItems = [];
  let listTag = null;

  const flushList = () => {
    if (!listItems.length) return;
    htmlParts.push(`<${listTag}>${listItems.map((li) => `<li>${li}</li>`).join("")}</${listTag}>`);
    listItems = [];
    listTag = null;
  };

  for (const line of lines) {
    const bullet = line.match(/^\s*[-*]\s+(.+)/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.+)/);
    if (bullet) {
      if (listTag !== "ul") flushList();
      listTag = "ul";
      listItems.push(inline(bullet[1]));
    } else if (numbered) {
      if (listTag !== "ol") flushList();
      listTag = "ol";
      listItems.push(inline(numbered[1]));
    } else {
      flushList();
      if (line.trim() !== "") htmlParts.push(`<p>${inline(line)}</p>`);
    }
  }
  flushList();
  return htmlParts.join("") || "<p></p>";
}

async function sendFeedback(entryId, rating) {
  if (!sessionId || !entryId) return;
  try {
    await fetch(`/dashboard/${sessionId}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entry_id: entryId, rating }),
    });
  } catch {
    // best-effort — a dropped feedback signal isn't worth surfacing to the user
  }
}

function renderAnswerInto(container, data, question) {
  container.innerHTML = "";
  const textEl = document.createElement("div");
  textEl.className = "text";
  textEl.innerHTML = renderMarkdownLite(data.answer);
  container.appendChild(textEl);

  if (data.sql) {
    container.appendChild(buildSqlBlock(data.sql));
  }
  if (data.explanation) {
    const explEl = document.createElement("div");
    explEl.className = "explanation";
    explEl.textContent = data.explanation;
    container.appendChild(explEl);
  }
  if (data.chart && data.result) {
    const canvas = document.createElement("canvas");
    container.appendChild(canvas);
    const chart = renderChartFromResult(canvas, data.chart, data.result);
    if (!chart) {
      canvas.remove();
      const note = document.createElement("p");
      note.className = "chart-render-fallback";
      note.textContent = "Couldn't render a chart for this result — showing the answer above instead.";
      container.appendChild(note);
    }
  }
  if (data.result && data.result.rows && data.result.rows.length) {
    const actions = document.createElement("div");
    actions.className = "result-actions";
    actions.appendChild(buildExportButton("query_result", data.result.columns, data.result.rows));
    container.appendChild(actions);
  }

  if (data.follow_up_questions && data.follow_up_questions.length) {
    const followUps = document.createElement("div");
    followUps.className = "follow-up-chips";
    for (const q of data.follow_up_questions) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "suggestion-chip";
      chip.textContent = q;
      chip.addEventListener("click", () => askQuestion(q));
      followUps.appendChild(chip);
    }
    container.appendChild(followUps);
  }

  const q = question || data.question;
  if (data.answer) {
    const answerActions = document.createElement("div");
    answerActions.className = "answer-actions";

    const copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "copy-btn answer-copy-btn";
    copyBtn.textContent = "Copy";
    copyBtn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(data.answer);
        copyBtn.textContent = "Copied";
        setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
      } catch {
        copyBtn.textContent = "Couldn't copy";
      }
    });
    answerActions.appendChild(copyBtn);

    if (q) {
      const regenBtn = document.createElement("button");
      regenBtn.type = "button";
      regenBtn.className = "copy-btn answer-regen-btn";
      regenBtn.textContent = "Regenerate";
      // Re-ask the same question in place — replaces this answer bubble
      // instead of appending a duplicate question + answer at the end of the log.
      regenBtn.addEventListener("click", () => askQuestion(q, { regenerateEl: container }));
      answerActions.appendChild(regenBtn);
    }

    if (data.id) {
      let rating = data.feedback || null;

      const upBtn = document.createElement("button");
      upBtn.type = "button";
      upBtn.className = "copy-btn feedback-btn feedback-up";
      upBtn.title = "Good answer";
      upBtn.setAttribute("aria-label", "Good answer");
      upBtn.textContent = "\u{1F44D}";

      const downBtn = document.createElement("button");
      downBtn.type = "button";
      downBtn.className = "copy-btn feedback-btn feedback-down";
      downBtn.title = "Bad answer";
      downBtn.setAttribute("aria-label", "Bad answer");
      downBtn.textContent = "\u{1F44E}";

      const syncFeedbackButtons = () => {
        upBtn.classList.toggle("active", rating === "up");
        downBtn.classList.toggle("active", rating === "down");
      };
      syncFeedbackButtons();

      const setRating = (next) => {
        rating = rating === next ? null : next;
        syncFeedbackButtons();
        sendFeedback(data.id, rating || "none");
      };

      upBtn.addEventListener("click", () => setRating("up"));
      downBtn.addEventListener("click", () => setRating("down"));

      answerActions.appendChild(upBtn);
      answerActions.appendChild(downBtn);
    }

    container.appendChild(answerActions);
  }

  const stamp = document.createElement("div");
  stamp.className = "msg-timestamp";
  const when = typeof data.timestamp === "number" ? new Date(data.timestamp * 1000) : new Date();
  stamp.textContent = when.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  container.appendChild(stamp);

  // Content just replaced this bubble's innerHTML wholesale — an active
  // search filter needs to re-evaluate it rather than keep stale match state.
  if (isChatSearchOpen()) runChatSearch();
}

function setChatBusy(busy) {
  chatInput.disabled = busy;
  chatSubmit.textContent = busy ? "Stop" : "Ask";
  chatSubmit.classList.toggle("stop-btn", busy);
  chatLog.classList.toggle("chat-busy", busy);
  if (!busy) chatInput.focus();
}

const SQL_KEYWORDS = new Set([
  "select", "from", "where", "group", "by", "order", "limit", "join", "left",
  "right", "inner", "outer", "full", "on", "as", "and", "or", "not", "in",
  "is", "null", "distinct", "having", "case", "when", "then", "else", "end",
  "union", "all", "with", "desc", "asc", "between", "like", "ilike", "over",
  "partition", "using", "cross", "offset", "interval", "filter",
]);

const SQL_FUNCTIONS = new Set([
  "count", "sum", "avg", "min", "max", "cast", "coalesce", "date_trunc",
  "extract", "round", "now", "strftime", "date", "upper", "lower", "trim",
  "length", "substr", "substring", "concat", "abs", "floor", "ceil",
  "row_number", "rank", "dense_rank", "lag", "lead", "nullif", "greatest",
  "least", "to_char", "list", "array_agg", "string_agg",
]);

// Lightweight regex tokenizer, not a real parser — good enough to color a
// read-only display of backend-validated SQL, not to re-lex arbitrary input.
function highlightSql(sql) {
  const tokenRe = /(--[^\n]*)|('(?:[^']|'')*')|("(?:[^"]|"")*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|([^\sA-Za-z0-9_]+)/g;
  let out = "";
  let m;
  while ((m = tokenRe.exec(sql)) !== null) {
    const [, comment, sq, dq, num, word, ws, punct] = m;
    if (comment) out += `<span class="sql-tok-comment">${escapeHtml(comment)}</span>`;
    else if (sq) out += `<span class="sql-tok-string">${escapeHtml(sq)}</span>`;
    else if (dq) out += `<span class="sql-tok-ident">${escapeHtml(dq)}</span>`;
    else if (num) out += `<span class="sql-tok-number">${escapeHtml(num)}</span>`;
    else if (word) {
      const lower = word.toLowerCase();
      if (SQL_KEYWORDS.has(lower)) out += `<span class="sql-tok-keyword">${escapeHtml(word)}</span>`;
      else if (SQL_FUNCTIONS.has(lower)) out += `<span class="sql-tok-function">${escapeHtml(word)}</span>`;
      else out += escapeHtml(word);
    } else if (ws) out += ws;
    else if (punct) out += escapeHtml(punct);
  }
  return out;
}

function buildSqlBlock(sql) {
  const wrap = document.createElement("div");
  wrap.className = "sql-block";

  const actions = document.createElement("div");
  actions.className = "sql-actions";

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "edit-btn";
  editBtn.textContent = "Edit & run";

  const copyBtn = document.createElement("button");
  copyBtn.type = "button";
  copyBtn.className = "copy-btn";
  copyBtn.textContent = "Copy";
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(sqlEl.textContent);
      copyBtn.textContent = "Copied";
      setTimeout(() => (copyBtn.textContent = "Copy"), 1500);
    } catch {
      copyBtn.textContent = "Couldn't copy";
    }
  });

  actions.appendChild(editBtn);
  actions.appendChild(copyBtn);

  const sqlEl = document.createElement("pre");
  sqlEl.className = "sql";
  sqlEl.innerHTML = highlightSql(sql);

  const editor = document.createElement("textarea");
  editor.className = "sql-editor hidden";
  editor.spellcheck = false;
  editor.value = sql;

  const editActions = document.createElement("div");
  editActions.className = "sql-edit-actions hidden";
  const runBtn = document.createElement("button");
  runBtn.type = "button";
  runBtn.className = "sql-run-btn";
  runBtn.textContent = "Run query";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "sql-cancel-btn";
  cancelBtn.textContent = "Cancel";
  editActions.appendChild(runBtn);
  editActions.appendChild(cancelBtn);

  const resultSlot = document.createElement("div");
  resultSlot.className = "sql-run-result";

  function enterEditMode() {
    sqlEl.classList.add("hidden");
    editBtn.classList.add("hidden");
    editor.classList.remove("hidden");
    editActions.classList.remove("hidden");
    editor.focus();
  }

  function exitEditMode() {
    editor.classList.add("hidden");
    editActions.classList.add("hidden");
    sqlEl.classList.remove("hidden");
    editBtn.classList.remove("hidden");
  }

  editBtn.addEventListener("click", enterEditMode);
  cancelBtn.addEventListener("click", exitEditMode);

  runBtn.addEventListener("click", async () => {
    const candidate = editor.value.trim();
    if (!candidate || !sessionId) return;
    noteSessionTouch();
    runBtn.disabled = true;
    runBtn.textContent = "Running…";
    resultSlot.innerHTML = "";

    try {
      const res = await fetch("/run-sql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, sql: candidate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Query failed.");

      sqlEl.innerHTML = highlightSql(data.sql);
      editor.value = data.sql;

      const result = data.result;
      if (result.rows.length) {
        resultSlot.appendChild(buildSortableTable(result.columns, result.rows));
        const meta = document.createElement("div");
        meta.className = "sql-run-meta";
        meta.textContent = result.truncated
          ? `Showing ${result.rows.length} of ${result.total_rows} rows.`
          : `${result.total_rows} row${result.total_rows === 1 ? "" : "s"}.`;
        resultSlot.appendChild(meta);
        const exportRow = document.createElement("div");
        exportRow.className = "result-actions";
        exportRow.appendChild(buildExportButton("query_result", result.columns, result.rows));
        resultSlot.appendChild(exportRow);
      } else {
        const empty = document.createElement("div");
        empty.className = "sql-run-meta";
        empty.textContent = "Query ran successfully — no rows returned.";
        resultSlot.appendChild(empty);
      }
      exitEditMode();
    } catch (err) {
      const errEl = document.createElement("div");
      errEl.className = "sql-run-error";
      errEl.textContent = err.message;
      resultSlot.appendChild(errEl);
    } finally {
      runBtn.disabled = false;
      runBtn.textContent = "Run query";
    }
  });

  wrap.appendChild(actions);
  wrap.appendChild(sqlEl);
  wrap.appendChild(editor);
  wrap.appendChild(editActions);
  wrap.appendChild(resultSlot);
  return wrap;
}

function appendMessage(role, text) {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  const textEl = document.createElement("div");
  textEl.className = "text";
  textEl.textContent = text;
  el.appendChild(textEl);
  if (role === "user") {
    el.appendChild(buildMessageEditButton(el, textEl));
  }
  const stamp = document.createElement("div");
  stamp.className = "msg-timestamp";
  stamp.textContent = new Date().toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  el.appendChild(stamp);
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
  if (isChatSearchOpen()) runChatSearch();
  return el;
}

// Lets a user fix a typo or rephrase a past question in place, then
// resubmits it — reuses the following assistant bubble (askQuestion's
// regenerateEl path) rather than appending a duplicate Q&A pair.
function buildMessageEditButton(msgEl, textEl) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "msg-edit-btn";
  btn.title = "Edit & resubmit";
  btn.setAttribute("aria-label", "Edit & resubmit this question");
  btn.textContent = "✎";
  btn.addEventListener("click", () => enterMessageEditMode(msgEl, textEl, btn));
  return btn;
}

function enterMessageEditMode(msgEl, textEl, editBtn) {
  if (activeChatAbort) return; // don't allow edits while a question is in flight
  const original = textEl.textContent;

  const editor = document.createElement("textarea");
  editor.className = "msg-edit-editor";
  editor.value = original;

  const actions = document.createElement("div");
  actions.className = "msg-edit-actions";
  const saveBtn = document.createElement("button");
  saveBtn.type = "button";
  saveBtn.className = "sql-run-btn";
  saveBtn.textContent = "Save & resubmit";
  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "sql-cancel-btn";
  cancelBtn.textContent = "Cancel";
  actions.appendChild(cancelBtn);
  actions.appendChild(saveBtn);

  textEl.classList.add("hidden");
  editBtn.classList.add("hidden");
  msgEl.insertBefore(editor, textEl.nextSibling);
  msgEl.insertBefore(actions, editor.nextSibling);
  editor.focus();
  editor.setSelectionRange(editor.value.length, editor.value.length);

  const exit = () => {
    editor.remove();
    actions.remove();
    textEl.classList.remove("hidden");
    editBtn.classList.remove("hidden");
  };

  cancelBtn.addEventListener("click", exit);
  editor.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      e.preventDefault();
      exit();
    } else if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      saveBtn.click();
    }
  });

  saveBtn.addEventListener("click", () => {
    const value = editor.value.trim();
    if (!value) return;
    const nextEl = msgEl.nextElementSibling;
    exit();
    if (value === original) return; // unchanged — nothing to resubmit
    textEl.textContent = value;
    if (nextEl && nextEl.classList.contains("assistant")) {
      askQuestion(value, { regenerateEl: nextEl });
    } else {
      askQuestion(value, { regenerateEl: appendMessage("assistant", "") });
    }
  });
}

function appendTypingIndicator() {
  const el = document.createElement("div");
  el.className = "msg assistant";
  el.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div><div class="typing-status"></div>`;
  chatLog.appendChild(el);
  chatLog.scrollTop = chatLog.scrollHeight;
  return el;
}

function resetToTypingIndicator(el) {
  el.className = "msg assistant";
  el.innerHTML = `<div class="typing-indicator"><span></span><span></span><span></span></div><div class="typing-status"></div>`;
  chatLog.scrollTop = chatLog.scrollHeight;
  return el;
}

// --- Query history ---

async function refreshHistory() {
  if (!sessionId) return;
  try {
    const res = await fetch(`/dashboard/${sessionId}/history`);
    if (!res.ok || sessionId === null) return;
    const data = await res.json();
    renderHistoryPanel(data.history || []);
  } catch {
    // best-effort — history is a convenience feature, not critical path
  }
}

function renderHistoryPanel(history) {
  currentHistory = history;
  if (!history.length) {
    historyToggle.classList.add("hidden");
    newChatBtn.classList.add("hidden");
    chatSearchToggle.classList.add("hidden");
    closeChatSearch();
    return;
  }
  historyToggle.classList.remove("hidden");
  newChatBtn.classList.remove("hidden");
  chatSearchToggle.classList.remove("hidden");
  renderHistoryList(historySearchInput.value);
}

function renderHistoryList(filterText) {
  const needle = (filterText || "").trim().toLowerCase();
  const entries = [...currentHistory].reverse();
  const filtered = needle ? entries.filter((entry) => entry.question.toLowerCase().includes(needle)) : entries;

  historyListEl.innerHTML = "";
  if (!filtered.length) {
    const empty = document.createElement("div");
    empty.className = "history-empty";
    empty.textContent = needle ? `No questions match "${filterText.trim()}"` : "No questions asked yet.";
    historyListEl.appendChild(empty);
    return;
  }

  for (const entry of filtered) {
    const item = document.createElement("div");
    item.className = "history-item";

    const question = document.createElement("div");
    question.className = "history-question";
    question.textContent = entry.question;
    item.appendChild(question);

    const meta = document.createElement("div");
    meta.className = "history-meta";
    const rowsPart = entry.row_count === null || entry.row_count === undefined ? "" : ` · ${entry.row_count} rows`;
    const timePart = typeof entry.elapsed === "number" ? ` · ${entry.elapsed.toFixed(1)}s` : "";
    meta.textContent = `${entry.success ? "✓" : "✗"}${rowsPart}${timePart}`;
    item.appendChild(meta);

    item.addEventListener("click", () => {
      historyPanel.classList.add("hidden");
      chatEmptyState.classList.add("hidden");
      appendMessage("user", entry.question);
      const bubble = appendMessage("assistant", "");
      renderAnswerInto(bubble, entry);
      chatLog.scrollTop = chatLog.scrollHeight;
    });

    historyListEl.appendChild(item);
  }
}

historySearchInput.addEventListener("input", () => renderHistoryList(historySearchInput.value));

// --- Detected relationships (cross-table, multi-sheet/pbix uploads only) ---

function _tableColumnNames(tableName) {
  if (!currentDashboard || !currentDashboard.tables) return [];
  const t = currentDashboard.tables.find((tb) => tb.table === tableName);
  if (!t) return [];
  return [...t.numeric_columns, ...t.categorical_columns, ...t.date_columns];
}

function _buildRelationshipAddForm() {
  const wrap = document.createElement("div");
  wrap.className = "relationship-add";

  const tables = (currentDashboard && currentDashboard.tables) || [];
  if (tables.length < 2) return wrap; // nothing to relate with only one table

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.className = "btn-link relationship-add-toggle";
  toggleBtn.textContent = "+ Add relationship";
  wrap.appendChild(toggleBtn);

  const form = document.createElement("div");
  form.className = "relationship-add-form hidden";

  const fromTableSel = document.createElement("select");
  const toTableSel = document.createElement("select");
  const fromColSel = document.createElement("select");
  const toColSel = document.createElement("select");
  [fromTableSel, toTableSel].forEach((sel) => sel.classList.add("relationship-select"));
  [fromColSel, toColSel].forEach((sel) => sel.classList.add("relationship-select"));

  for (const t of tables) {
    const o1 = document.createElement("option");
    o1.value = t.table;
    o1.textContent = t.table;
    fromTableSel.appendChild(o1);
    const o2 = document.createElement("option");
    o2.value = t.table;
    o2.textContent = t.table;
    toTableSel.appendChild(o2);
  }
  if (tables.length > 1) toTableSel.selectedIndex = 1;

  const fillColumns = (sel, tableName) => {
    sel.innerHTML = "";
    for (const c of _tableColumnNames(tableName)) {
      const o = document.createElement("option");
      o.value = c;
      o.textContent = c;
      sel.appendChild(o);
    }
  };
  fillColumns(fromColSel, fromTableSel.value);
  fillColumns(toColSel, toTableSel.value);
  fromTableSel.addEventListener("change", () => fillColumns(fromColSel, fromTableSel.value));
  toTableSel.addEventListener("change", () => fillColumns(toColSel, toTableSel.value));

  const arrow = document.createElement("span");
  arrow.className = "rel-arrow";
  arrow.textContent = "→";

  const submitBtn = document.createElement("button");
  submitBtn.type = "button";
  submitBtn.className = "btn-secondary relationship-add-submit";
  submitBtn.textContent = "Add";
  submitBtn.addEventListener("click", () => {
    if (!fromColSel.value || !toColSel.value) {
      showToast("Pick a column on each side.", "error");
      return;
    }
    addRelationship(fromTableSel.value, fromColSel.value, toTableSel.value, toColSel.value);
  });

  const row = document.createElement("div");
  row.className = "relationship-add-row";
  row.append(fromTableSel, fromColSel, arrow, toTableSel, toColSel, submitBtn);
  form.appendChild(row);
  wrap.appendChild(form);

  toggleBtn.addEventListener("click", () => form.classList.toggle("hidden"));

  return wrap;
}

function renderRelationships(relationships) {
  relationshipsPanel.innerHTML = "";
  const tables = (currentDashboard && currentDashboard.tables) || [];
  const hasAny = relationships && relationships.length;

  if (!hasAny && tables.length < 2) {
    relationshipsPanel.classList.add("hidden");
    return;
  }
  relationshipsPanel.classList.remove("hidden");

  const heading = document.createElement("div");
  heading.className = "relationships-heading relationships-heading-row";
  const headingLabel = document.createElement("span");
  headingLabel.textContent = hasAny ? `Relationships (${relationships.length})` : "Relationships";
  heading.appendChild(headingLabel);
  if (tables.length >= 2) {
    const diagramBtn = document.createElement("button");
    diagramBtn.type = "button";
    diagramBtn.className = "btn-link schema-diagram-btn";
    diagramBtn.textContent = "Diagram";
    diagramBtn.addEventListener("click", openSchemaDiagram);
    heading.appendChild(diagramBtn);
  }
  relationshipsPanel.appendChild(heading);

  if (hasAny) {
    const list = document.createElement("div");
    list.className = "relationships-list";
    relationships.forEach((r, index) => {
      const item = document.createElement("div");
      item.className = "relationship-item";

      const from = document.createElement("span");
      from.className = "rel-table";
      from.textContent = r.from_table;
      const fromCol = document.createElement("span");
      fromCol.className = "rel-col";
      fromCol.textContent = `.${r.from_column}`;

      const arrow = document.createElement("span");
      arrow.className = "rel-arrow";
      arrow.textContent = "→";

      const to = document.createElement("span");
      to.className = "rel-table";
      to.textContent = r.to_table;
      const toCol = document.createElement("span");
      toCol.className = "rel-col";
      toCol.textContent = `.${r.to_column}`;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "rel-remove-btn";
      removeBtn.textContent = "×";
      removeBtn.title = "Remove this relationship";
      removeBtn.addEventListener("click", () => deleteRelationship(index));

      item.append(from, fromCol, arrow, to, toCol, removeBtn);
      list.appendChild(item);
    });
    relationshipsPanel.appendChild(list);
  }

  relationshipsPanel.appendChild(_buildRelationshipAddForm());
}

async function addRelationship(fromTable, fromColumn, toTable, toColumn) {
  if (!sessionId) return;
  try {
    const res = await fetch(`/session/${sessionId}/relationship`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        from_table: fromTable,
        from_column: fromColumn,
        to_table: toTable,
        to_column: toColumn,
      }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to add relationship.");
    currentRelationships = data.relationships || [];
    renderRelationships(currentRelationships);
    showToast(`Added relationship ${fromTable}.${fromColumn} → ${toTable}.${toColumn}.`, "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function deleteRelationship(index) {
  if (!sessionId) return;
  try {
    const res = await fetch(`/session/${sessionId}/relationship/${index}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Failed to remove relationship.");
    currentRelationships = data.relationships || [];
    renderRelationships(currentRelationships);
    showToast("Relationship removed.", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openSchemaDiagram() {
  if (!sessionId) return;
  const tables = (currentDashboard && currentDashboard.tables) || [];
  schemaDiagramBody.innerHTML = "";

  if (tables.length < 2) {
    const empty = document.createElement("div");
    empty.className = "schema-diagram-empty";
    empty.textContent = "Add a second table to see a data model diagram.";
    schemaDiagramBody.appendChild(empty);
    openModal(schemaDiagramOverlay, schemaDiagramClose);
    return;
  }

  const relationships = currentRelationships || [];
  const keyColumns = new Map();
  for (const r of relationships) {
    if (!keyColumns.has(r.from_table)) keyColumns.set(r.from_table, new Set());
    keyColumns.get(r.from_table).add(r.from_column);
    if (!keyColumns.has(r.to_table)) keyColumns.set(r.to_table, new Set());
    keyColumns.get(r.to_table).add(r.to_column);
  }

  const wrap = document.createElement("div");
  wrap.className = "schema-diagram-wrap";

  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("class", "schema-diagram-svg");

  const boxes = document.createElement("div");
  boxes.className = "schema-diagram-boxes";

  const boxEls = new Map();
  for (const t of tables) {
    const box = document.createElement("div");
    box.className = "schema-diagram-table";

    const name = document.createElement("div");
    name.className = "schema-diagram-table-name";
    name.textContent = t.table;
    box.appendChild(name);

    const cols = document.createElement("div");
    cols.className = "schema-diagram-columns";
    const allCols = [...t.numeric_columns, ...t.categorical_columns, ...t.date_columns];
    const keys = keyColumns.get(t.table) || new Set();
    for (const c of allCols) {
      const colEl = document.createElement("div");
      colEl.className = "schema-diagram-column" + (keys.has(c) ? " is-key" : "");
      colEl.textContent = c;
      cols.appendChild(colEl);
    }
    box.appendChild(cols);

    boxes.appendChild(box);
    boxEls.set(t.table, box);
  }

  wrap.append(svg, boxes);
  schemaDiagramBody.appendChild(wrap);
  openModal(schemaDiagramOverlay, schemaDiagramClose);

  requestAnimationFrame(() => {
    const wrapRect = wrap.getBoundingClientRect();

    const anchor = (rect, otherCenter) => {
      const cx = rect.left + rect.width / 2 - wrapRect.left;
      const cy = rect.top + rect.height / 2 - wrapRect.top;
      const dx = otherCenter.x - cx;
      const dy = otherCenter.y - cy;
      if (Math.abs(dx) > Math.abs(dy)) {
        return { x: dx > 0 ? cx + rect.width / 2 : cx - rect.width / 2, y: cy };
      }
      return { x: cx, y: dy > 0 ? cy + rect.height / 2 : cy - rect.height / 2 };
    };

    relationships.forEach((r) => {
      const fromBox = boxEls.get(r.from_table);
      const toBox = boxEls.get(r.to_table);
      if (!fromBox || !toBox || fromBox === toBox) return;

      const fr = fromBox.getBoundingClientRect();
      const tr = toBox.getBoundingClientRect();
      const fromCenter = { x: fr.left + fr.width / 2 - wrapRect.left, y: fr.top + fr.height / 2 - wrapRect.top };
      const toCenter = { x: tr.left + tr.width / 2 - wrapRect.left, y: tr.top + tr.height / 2 - wrapRect.top };

      const p1 = anchor(fr, toCenter);
      const p2 = anchor(tr, fromCenter);

      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("class", "schema-diagram-line");
      line.setAttribute("x1", p1.x);
      line.setAttribute("y1", p1.y);
      line.setAttribute("x2", p2.x);
      line.setAttribute("y2", p2.y);
      svg.appendChild(line);

      const labelX = (p1.x + p2.x) / 2;
      const labelY = (p1.y + p2.y) / 2;

      const labelBg = document.createElementNS(svgNS, "rect");
      labelBg.setAttribute("class", "schema-diagram-line-label-bg");
      svg.appendChild(labelBg);

      const label = document.createElementNS(svgNS, "text");
      label.setAttribute("class", "schema-diagram-line-label");
      label.setAttribute("x", labelX);
      label.setAttribute("y", labelY);
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "middle");
      label.textContent = `${r.from_column} = ${r.to_column}`;
      svg.appendChild(label);

      const bbox = label.getBBox();
      labelBg.setAttribute("x", bbox.x - 4);
      labelBg.setAttribute("y", bbox.y - 2);
      labelBg.setAttribute("width", bbox.width + 8);
      labelBg.setAttribute("height", bbox.height + 4);
      labelBg.setAttribute("rx", 4);
    });
  });
}

schemaDiagramClose.addEventListener("click", () => closeModal(schemaDiagramOverlay));
schemaDiagramOverlay.addEventListener("click", (e) => {
  if (e.target === schemaDiagramOverlay) closeModal(schemaDiagramOverlay);
});

// --- Dashboard ---

// Animates a stat pill's number counting up from 0 on first render, rather
// than the value just appearing — respects prefers-reduced-motion since it's
// pure polish, not information (the final value is identical either way).
function animateCountUp(el, target, duration = 700) {
  const n = Number(target) || 0;
  if (n === 0 || (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
    el.textContent = n.toLocaleString();
    return;
  }
  const start = performance.now();
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
  function tick(now) {
    const progress = Math.min(1, (now - start) / duration);
    el.textContent = Math.round(n * easeOutCubic(progress)).toLocaleString();
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function computeQualityScore(table) {
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  const totalCells = table.row_count * table.column_count;
  const missingTotal = Object.values(table.missing_values || {}).reduce((a, b) => a + b, 0);
  const completeness = totalCells > 0 ? 1 - missingTotal / totalCells : 1;

  const uniqueness = table.row_count > 0 ? 1 - table.duplicate_rows / table.row_count : 1;

  const outlierTotal = Object.values(table.outlier_counts || {}).reduce((a, b) => a + b, 0);
  const numericCells = table.row_count * table.numeric_columns.length;
  const cleanliness = numericCells > 0 ? 1 - Math.min(1, outlierTotal / numericCells) : 1;

  const score = completeness * 0.5 + uniqueness * 0.3 + cleanliness * 0.2;
  return {
    score: Math.round(clamp01(score) * 100),
    completeness: Math.round(clamp01(completeness) * 100),
    uniqueness: Math.round(clamp01(uniqueness) * 100),
    cleanliness: Math.round(clamp01(cleanliness) * 100),
  };
}

function buildQualityGauge(table) {
  const q = computeQualityScore(table);
  const tier = q.score >= 90 ? "high" : q.score >= 70 ? "medium" : "low";
  const tierLabel = tier === "high" ? "Excellent" : tier === "medium" ? "Fair" : "Needs attention";
  const tooltip = `Data quality: ${tierLabel} — ${q.completeness}% complete, ${q.uniqueness}% unique rows, ${q.cleanliness}% outlier-free`;

  const wrap = document.createElement("span");
  wrap.className = `quality-gauge tier-${tier} has-tooltip`;
  wrap.setAttribute("tabindex", "0");
  wrap.setAttribute("data-tooltip", tooltip);
  wrap.setAttribute("aria-label", `Data quality score ${q.score} out of 100. ${tooltip}`);
  wrap.innerHTML = `
    <svg class="quality-gauge-ring" viewBox="0 0 36 36" aria-hidden="true">
      <path class="quality-gauge-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      <path class="quality-gauge-fill" stroke-dasharray="${q.score}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
    </svg>
    <span class="quality-gauge-text">${q.score}</span>
  `;
  return wrap;
}

function renderDashboard(dashboard) {
  dashboardContent.innerHTML = "";
  dashboardExportAllBtn.classList.remove("hidden");
  for (const table of dashboard.tables) {
    const card = document.createElement("div");
    card.className = "table-card";
    card.id = `table-card-${dashboard.tables.indexOf(table)}`;

    const titleRow = document.createElement("div");
    titleRow.className = "table-card-title-row";
    const titleMain = document.createElement("div");
    titleMain.className = "table-card-title-main";
    const title = document.createElement("h3");
    title.textContent = table.table;
    titleMain.appendChild(title);
    titleMain.appendChild(buildQualityGauge(table));
    titleRow.appendChild(titleMain);
    const browseBtn = document.createElement("button");
    browseBtn.type = "button";
    browseBtn.className = "btn-link table-card-browse-btn";
    browseBtn.textContent = "Browse data";
    browseBtn.addEventListener("click", () => openDataBrowser(table));
    titleRow.appendChild(browseBtn);
    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "btn-link table-card-rename-btn";
    renameBtn.textContent = "Rename";
    renameBtn.addEventListener("click", () => renameTable(table.table));
    titleRow.appendChild(renameBtn);
    if (dashboard.tables.length > 1) {
      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "btn-link table-card-remove-btn";
      removeBtn.textContent = "Remove table";
      removeBtn.addEventListener("click", () => removeTable(table.table));
      titleRow.appendChild(removeBtn);
    }
    card.appendChild(titleRow);

    const stats = document.createElement("div");
    stats.className = "pill-row";
    const dupClass = table.duplicate_rows > 0 ? "pill pill-warn" : "pill";

    const rowsPill = document.createElement("span");
    rowsPill.className = "pill";
    const rowsCount = document.createElement("span");
    rowsCount.className = "pill-count";
    rowsPill.append(rowsCount, document.createTextNode(" rows"));

    const colsPill = document.createElement("span");
    colsPill.className = "pill";
    const colsCount = document.createElement("span");
    colsCount.className = "pill-count";
    colsPill.append(colsCount, document.createTextNode(" columns"));

    const dupClickable = table.duplicate_rows > 0;
    const dupPill = document.createElement(dupClickable ? "button" : "span");
    dupPill.className = dupClickable ? `${dupClass} pill-clickable` : dupClass;
    if (dupClickable) {
      dupPill.type = "button";
      dupPill.title = "View the duplicate rows";
      dupPill.addEventListener("click", () => openDataBrowser(table, null, true));
    }
    const dupCount = document.createElement("span");
    dupCount.className = "pill-count";
    dupPill.append(dupCount, document.createTextNode(table.duplicate_rows === 1 ? " duplicate row" : " duplicate rows"));

    stats.append(rowsPill, colsPill, dupPill);
    card.appendChild(stats);
    animateCountUp(rowsCount, table.row_count);
    animateCountUp(colsCount, table.column_count);
    animateCountUp(dupCount, table.duplicate_rows);

    const missingEntries = Object.entries(table.missing_values || {}).sort((a, b) => b[1] - a[1]);
    if (missingEntries.length) {
      const dq = document.createElement("div");
      dq.className = "data-quality";
      const heading = document.createElement("div");
      heading.className = "data-quality-heading";
      heading.textContent = "Missing values";
      dq.appendChild(heading);
      const list = document.createElement("div");
      list.className = "data-quality-list";
      for (const [col, count] of missingEntries.slice(0, 6)) {
        const pct = table.row_count ? Math.round((count / table.row_count) * 100) : 0;
        const chip = document.createElement("span");
        chip.className = `dq-chip ${pct >= 20 ? "dq-high" : "dq-low"}`;
        chip.textContent = `${col} — ${count.toLocaleString()} (${pct}%)`;
        list.appendChild(chip);
      }
      if (missingEntries.length > 6) {
        const more = document.createElement("span");
        more.className = "dq-chip dq-more";
        more.textContent = `+${missingEntries.length - 6} more`;
        list.appendChild(more);
      }
      dq.appendChild(list);
      card.appendChild(dq);
    }

    const outlierEntries = Object.entries(table.outlier_counts || {}).sort((a, b) => b[1] - a[1]);
    if (outlierEntries.length) {
      const dq = document.createElement("div");
      dq.className = "data-quality";
      const heading = document.createElement("div");
      heading.className = "data-quality-heading";
      heading.textContent = "Statistical outliers";
      dq.appendChild(heading);
      const list = document.createElement("div");
      list.className = "data-quality-list";
      for (const [col, count] of outlierEntries.slice(0, 6)) {
        const pct = table.row_count ? Math.round((count / table.row_count) * 100) : 0;
        const chip = document.createElement("span");
        chip.className = `dq-chip ${pct >= 10 ? "dq-high" : "dq-low"}`;
        chip.title = "Values beyond 1.5× the interquartile range (Tukey fence)";
        chip.textContent = `${col} — ${count.toLocaleString()} (${pct}%)`;
        list.appendChild(chip);
      }
      if (outlierEntries.length > 6) {
        const more = document.createElement("span");
        more.className = "dq-chip dq-more";
        more.textContent = `+${outlierEntries.length - 6} more`;
        list.appendChild(more);
      }
      dq.appendChild(list);
      card.appendChild(dq);
    }

    const firstCategorical = Object.keys(table.top_categories)[0];
    if (firstCategorical) {
      const chartWrap = document.createElement("div");
      chartWrap.className = "chart-wrap";
      const canvas = document.createElement("canvas");
      canvas.setAttribute("role", "img");
      const entries = table.top_categories[firstCategorical];
      canvas.setAttribute(
        "aria-label",
        `Bar chart: top ${entries.length.toLocaleString()} values of ${firstCategorical} by count, for ${table.table}.`
      );
      chartWrap.appendChild(canvas);
      card.appendChild(chartWrap);
      const chart = new Chart(canvas, {
        type: "bar",
        data: {
          labels: entries.map((e) => e.value),
          datasets: [
            {
              label: `${firstCategorical} (count)`,
              data: entries.map((e) => e.count),
              backgroundColor: rankedBarColors(entries.map((e) => e.count)),
              borderRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        },
      });
      chartWrap.appendChild(buildChartDownloadButton(chart, `${table.table}-${firstCategorical}`));
    }

    if (table.numeric_columns.length) {
      const list = document.createElement("div");
      list.className = "stat-row";
      list.innerHTML = table.numeric_columns
        .slice(0, 4)
        .map((col) => {
          const s = table.numeric_stats[col];
          return `<span><strong>${col}</strong> avg ${fmt(s.mean)}, min ${fmt(s.min)}, max ${fmt(s.max)}</span>`;
        })
        .join("");
      card.appendChild(list);
    }

    const allColumns = [
      ...table.numeric_columns.map((c) => ({ name: c, type: "numeric" })),
      ...table.categorical_columns.map((c) => ({ name: c, type: "categorical" })),
      ...table.date_columns.map((c) => ({ name: c, type: "date" })),
    ];
    if (allColumns.length) {
      const heading = document.createElement("div");
      heading.className = "column-list-heading";
      heading.textContent = "Columns";
      card.appendChild(heading);
      const list = document.createElement("div");
      list.className = "column-list";
      for (const col of allColumns) {
        const chip = document.createElement("button");
        chip.type = "button";
        chip.className = "column-chip";
        chip.innerHTML = `<span class="column-chip-dot type-${col.type}"></span>${col.name}`;
        chip.addEventListener("click", () => openColumnProfile(table, col.name, col.type));
        list.appendChild(chip);
      }
      card.appendChild(list);
    }

    dashboardContent.appendChild(card);
  }
  renderDataHealthBanner(dashboard);
}

const DATA_HEALTH_DISMISSED_PREFIX = "cwyd-health-dismissed-";
function dataHealthDismissedKey() {
  return `${DATA_HEALTH_DISMISSED_PREFIX}${sessionId}`;
}

function columnTypeOf(table, column) {
  if (table.numeric_columns?.includes(column)) return "numeric";
  if (table.date_columns?.includes(column)) return "date";
  if (table.categorical_columns?.includes(column)) return "categorical";
  return null;
}

function computeTableIssue(table) {
  const q = computeQualityScore(table);
  const missingEntries = Object.entries(table.missing_values || {}).sort((a, b) => b[1] - a[1]);
  const outlierEntries = Object.entries(table.outlier_counts || {}).sort((a, b) => b[1] - a[1]);
  const completenessGap = 100 - q.completeness;
  const uniquenessGap = 100 - q.uniqueness;
  const cleanlinessGap = 100 - q.cleanliness;
  const biggest = Math.max(completenessGap, uniquenessGap, cleanlinessGap);

  let detail = null;
  let column = null;
  if (biggest === completenessGap && missingEntries.length) {
    const [col, count] = missingEntries[0];
    const pct = table.row_count ? Math.round((count / table.row_count) * 100) : 0;
    detail = `"${col}" is missing in ${pct}% of rows`;
    column = col;
  } else if (biggest === uniquenessGap && table.duplicate_rows > 0) {
    const pct = table.row_count ? Math.round((table.duplicate_rows / table.row_count) * 100) : 0;
    const rowWord = table.duplicate_rows === 1 ? "duplicate row" : "duplicate rows";
    detail = `${table.duplicate_rows.toLocaleString()} ${rowWord} (${pct}%)`;
  } else if (biggest === cleanlinessGap && outlierEntries.length) {
    const [col, count] = outlierEntries[0];
    const pct = table.row_count ? Math.round((count / table.row_count) * 100) : 0;
    detail = `"${col}" has ${pct}% statistical outliers`;
    column = col;
  }
  return { score: q.score, detail, column, columnType: column ? columnTypeOf(table, column) : null };
}

function renderDataHealthBanner(dashboard) {
  const tables = dashboard.tables || [];
  if (!tables.length || localStorage.getItem(dataHealthDismissedKey())) {
    dataHealthBanner.classList.add("hidden");
    return;
  }

  const issues = tables.map((table, idx) => ({ idx, table, ...computeTableIssue(table) }));
  const totalRows = tables.reduce((sum, t) => sum + t.row_count, 0) || 1;
  const overallScore = Math.round(
    issues.reduce((sum, i) => sum + i.score * i.table.row_count, 0) / totalRows
  );
  const worst = issues.reduce((a, b) => (b.score < a.score ? b : a));

  const tier = overallScore >= 90 ? "good" : overallScore >= 70 ? "warning" : "issue";
  const icon = tier === "good" ? "✓" : "⚠";
  const tableLabel = tables.length > 1 ? ` in "${worst.table.table}"` : "";

  let message;
  if (tier === "good") {
    message = `Data quality looks great — ${overallScore}/100${tables.length > 1 ? ` across ${tables.length} tables` : ""}.`;
  } else if (worst.detail) {
    message = `Data quality is ${tier === "warning" ? "fair" : "a concern"} (${overallScore}/100). Biggest issue: ${worst.detail}${tableLabel}.`;
  } else {
    message = `Data quality is ${tier === "warning" ? "fair" : "a concern"} (${overallScore}/100)${tableLabel}.`;
  }

  dataHealthBanner.className = `data-health-banner tier-${tier}`;
  dataHealthBanner.innerHTML = "";

  const iconEl = document.createElement("span");
  iconEl.className = "data-health-icon";
  iconEl.setAttribute("aria-hidden", "true");
  iconEl.textContent = icon;

  const textEl = document.createElement("span");
  textEl.className = "data-health-text";
  textEl.textContent = message;

  const actions = document.createElement("div");
  actions.className = "data-health-actions";

  if (tier !== "good") {
    const viewBtn = document.createElement("button");
    viewBtn.type = "button";
    viewBtn.className = "btn-link";
    viewBtn.textContent = worst.column ? `View "${worst.column}"` : "View table";
    viewBtn.addEventListener("click", () => {
      const target = document.getElementById(`table-card-${worst.idx}`);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "center" });
      target.classList.add("table-card-highlight");
      setTimeout(() => target.classList.remove("table-card-highlight"), 1600);
      if (worst.column && worst.columnType) {
        openColumnProfile(worst.table, worst.column, worst.columnType);
      }
    });
    actions.appendChild(viewBtn);
  }

  const dismissBtn = document.createElement("button");
  dismissBtn.type = "button";
  dismissBtn.className = "icon-btn data-health-dismiss";
  dismissBtn.setAttribute("aria-label", "Dismiss data quality summary");
  dismissBtn.textContent = "✕";
  dismissBtn.addEventListener("click", () => {
    localStorage.setItem(dataHealthDismissedKey(), "1");
    dataHealthBanner.classList.add("hidden");
  });
  actions.appendChild(dismissBtn);

  dataHealthBanner.append(iconEl, textEl, actions);
  dataHealthBanner.classList.remove("hidden");
}

// Chart.js draws to a <canvas>, which is otherwise an unlabeled blank
// graphic to a screen reader — role="img" + a text summary of what the
// chart shows is the actual accessible content in that case.
const CHART_TYPE_LABELS = { bar: "Bar chart", line: "Line chart", pie: "Pie chart", scatter: "Scatter plot" };

function chartAriaLabel(chartSpec, result) {
  const typeLabel = CHART_TYPE_LABELS[chartSpec.type] || "Chart";
  const n = result.rows.length;
  const points = `${n.toLocaleString()} data point${n === 1 ? "" : "s"}`;
  return chartSpec.title ? `${typeLabel}: ${chartSpec.title}. ${points}.` : `${typeLabel} with ${points}.`;
}

function renderChartFromResult(canvas, chartSpec, result, onPointClick, forecast, anomalies) {
  const xIdx = result.columns.indexOf(chartSpec.x);
  const yIdx = result.columns.indexOf(chartSpec.y);
  if (xIdx === -1 || yIdx === -1) return null;

  const type = ["bar", "line", "pie", "scatter"].includes(chartSpec.type) ? chartSpec.type : "bar";

  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", chartAriaLabel({ ...chartSpec, type }, result));

  if (onPointClick) canvas.classList.add("chart-clickable");

  if (type === "scatter") {
    const points = result.rows
      .map((r) => ({ x: r[xIdx], y: r[yIdx] }))
      .filter((p) => typeof p.x === "number" && typeof p.y === "number");
    return new Chart(canvas, {
      type: "scatter",
      data: {
        datasets: [
          {
            label: chartSpec.title || `${chartSpec.x} vs ${chartSpec.y}`,
            data: points,
            backgroundColor: CHART_COLORS[0],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          title: { display: !!chartSpec.title, text: chartSpec.title || "" },
        },
        scales: {
          x: { title: { display: true, text: chartSpec.x } },
          y: { title: { display: true, text: chartSpec.y } },
        },
      },
    });
  }

  const labels = result.rows.map((r) => r[xIdx]);
  const values = result.rows.map((r) => r[yIdx]);

  const datasets = [
    {
      label: chartSpec.y,
      data: values,
      backgroundColor: type === "pie" ? CHART_COLORS : type === "bar" ? rankedBarColors(values) : CHART_COLORS[0],
      borderColor: CHART_COLORS[0],
      borderRadius: type === "bar" ? 4 : 0,
    },
  ];

  const anomalyIndexSet = new Set(
    type === "line" && anomalies ? anomalies.map((a) => a.index) : []
  );
  if (anomalyIndexSet.size) {
    const anomalyColor = chartThemeColors().error;
    datasets[0].pointBackgroundColor = (ctx) =>
      anomalyIndexSet.has(ctx.dataIndex) ? anomalyColor : CHART_COLORS[0];
    datasets[0].pointBorderColor = (ctx) =>
      anomalyIndexSet.has(ctx.dataIndex) ? anomalyColor : CHART_COLORS[0];
    datasets[0].pointRadius = (ctx) => (anomalyIndexSet.has(ctx.dataIndex) ? 6 : 3);
    datasets[0].pointHoverRadius = (ctx) => (anomalyIndexSet.has(ctx.dataIndex) ? 8 : 5);
  }

  let allLabels = labels;
  const hasForecast = type === "line" && forecast && forecast.labels && forecast.labels.length;
  if (hasForecast) {
    allLabels = labels.concat(forecast.labels);
    datasets[0].data = values.concat(forecast.labels.map(() => null));
    // the projection dataset starts null, echoes the last real point once so
    // the dashed segment visually connects to the solid line, then continues
    const projectionData = labels.map(() => null);
    projectionData[projectionData.length - 1] = values[values.length - 1];
    datasets.push({
      label: "Projected",
      data: projectionData.concat(forecast.values),
      borderColor: CHART_COLORS[0],
      backgroundColor: "transparent",
      borderDash: [6, 4],
      borderWidth: 2,
      pointRadius: (ctx) => (ctx.dataIndex >= labels.length ? 3 : 0),
      fill: false,
    });
  }

  return new Chart(canvas, {
    type,
    data: {
      labels: allLabels,
      datasets,
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: type === "pie" || hasForecast },
        title: { display: !!chartSpec.title, text: chartSpec.title || "" },
        tooltip: anomalyIndexSet.size
          ? {
              callbacks: {
                afterLabel: (ctx) => {
                  if (ctx.datasetIndex !== 0 || !anomalyIndexSet.has(ctx.dataIndex)) return undefined;
                  const a = anomalies.find((x) => x.index === ctx.dataIndex);
                  if (!a) return undefined;
                  const pct = a.pct_diff != null ? `, ${a.pct_diff > 0 ? "+" : ""}${a.pct_diff}%` : "";
                  return `⚠ Unusual: ${a.direction} the trend line${pct}`;
                },
              },
            }
          : undefined,
      },
      onClick: onPointClick
        ? (_evt, elements) => {
            if (!elements.length) return;
            onPointClick(labels[elements[0].index]);
          }
        : undefined,
    },
  });
}

function buildAnomalyCaption(anomalies, view) {
  const caption = document.createElement("button");
  caption.type = "button";
  caption.className = "insight-anomaly-caption insight-caption-btn";
  const parts = anomalies.map((a) => {
    const pct = a.pct_diff != null ? ` (${a.pct_diff > 0 ? "+" : ""}${a.pct_diff}%)` : "";
    return `${a.label}${pct}`;
  });
  caption.textContent = `⚠ Unusual vs. the trend: ${parts.join(", ")}`;
  caption.title = "Ask the chat about these outliers";
  caption.setAttribute("aria-label", `Ask the chat about these outliers: ${parts.join(", ")}`);
  caption.addEventListener("click", () => askAboutAnomalies(view, anomalies));
  return caption;
}

function buildForecastCaption(view) {
  const caption = document.createElement("button");
  caption.type = "button";
  caption.className = "insight-forecast-caption insight-caption-btn";
  caption.textContent = `↗ Dashed line: ${view.forecast.method}`;
  caption.title = "Ask the chat about this forecast";
  caption.setAttribute("aria-label", `Ask the chat about the ${view.forecast.method} forecast`);
  caption.addEventListener("click", () => askAboutForecast(view));
  return caption;
}

function downloadChartPng(chart, filename) {
  const a = document.createElement("a");
  a.href = chart.toBase64Image("image/png", 1);
  a.download = `${filename.replace(/[^\w-]+/g, "_")}.png`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

function buildChartDownloadButton(chart, filename) {
  chart.$exportFilename = filename; // read back by exportAllDashboardCharts()
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "chart-download-btn";
  btn.title = "Download chart as PNG";
  btn.setAttribute("aria-label", "Download chart as PNG");
  btn.textContent = "⬇";
  btn.addEventListener("click", () => downloadChartPng(chart, filename));
  return btn;
}

function exportAllDashboardCharts() {
  const charts = Object.values(Chart.instances).filter(
    (chart) => chart.canvas && chart.canvas.closest("#dashboard-content, #insights-content")
  );
  if (!charts.length) {
    showToast("No charts to download yet.", "info");
    return;
  }
  // Staggered, not simultaneous: browsers throttle/block a burst of same-tick downloads.
  charts.forEach((chart, i) => {
    setTimeout(() => downloadChartPng(chart, chart.$exportFilename || `chart-${i + 1}`), i * 400);
  });
  showToast(
    `Downloading ${charts.length} chart${charts.length === 1 ? "" : "s"} — allow multiple downloads if your browser asks.`,
    "success"
  );
}

function fmt(n) {
  if (n === null || n === undefined) return "—";
  return Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 });
}

// --- Suggested views (LLM-picked insight cards) ---

function buildInsightSkeletonCard(delayMs) {
  const card = document.createElement("div");
  card.className = "insight-skeleton-card";
  card.style.animationDelay = `${delayMs}ms`;
  card.innerHTML = `
    <div class="skeleton-header-row">
      <div class="skeleton-block skeleton-title"></div>
      <div class="skeleton-block skeleton-badge"></div>
    </div>
    <div class="skeleton-block skeleton-chart"></div>
  `;
  return card;
}

function flashInsightCard(key) {
  const card = insightsContent.querySelector(`.insight-card[data-insight-key="${CSS.escape(key)}"]`);
  if (!card) return;
  card.scrollIntoView({ behavior: "smooth", block: "center" });
  card.classList.remove("insight-card-flash");
  void card.offsetWidth; // restart the animation if it's already mid-flash
  card.classList.add("insight-card-flash");
}

function renderTakeaways(insights) {
  const picks = insights
    .filter((v) => v.highlight && typeof v.confidence === "number")
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3);

  insightsTakeaways.innerHTML = "";
  if (!picks.length) {
    insightsTakeaways.classList.add("hidden");
    return;
  }

  const heading = document.createElement("h3");
  heading.className = "insights-takeaways-heading";
  heading.textContent = "Key takeaways";
  insightsTakeaways.appendChild(heading);

  const list = document.createElement("div");
  list.className = "insights-takeaways-list";
  picks.forEach((view) => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = "insights-takeaway-item btn-link";
    item.textContent = view.highlight;
    item.title = "Jump to this view";
    item.addEventListener("click", () => flashInsightCard(insightKey(view)));
    list.appendChild(item);
  });
  insightsTakeaways.appendChild(list);
  insightsTakeaways.classList.remove("hidden");
}

// --- Dataset overview (LLM-written headline paragraph) ---

// Local LLM calls share a single queue, so a call fired right after upload
// can sit behind narrative/insights/chat work already in flight and take far
// longer than it does in isolation. Without this, the static loading copy
// makes a slow-but-healthy wait look identical to a stuck one.
function scheduleProgressiveText(el, updates) {
  const timers = updates.map(({ delay, text }) =>
    setTimeout(() => {
      if (el.isConnected) el.textContent = text;
    }, delay)
  );
  return () => timers.forEach(clearTimeout);
}

async function loadNarrative(sid, refresh = false) {
  dashboardNarrative.classList.remove("hidden");
  dashboardNarrative.innerHTML = `
    <div class="dashboard-narrative-skeleton-wrap">
      <div class="dashboard-narrative-skeleton"></div>
      <span class="dashboard-narrative-loading-text">Writing a summary…</span>
    </div>`;
  const loadingTextEl = dashboardNarrative.querySelector(".dashboard-narrative-loading-text");
  const stopProgress = scheduleProgressiveText(loadingTextEl, [
    { delay: 12000, text: "Still working — the local model is busy…" },
    { delay: 35000, text: "Taking longer than usual. Large uploads queue several model calls at once." },
  ]);

  try {
    const res = await fetch(`/dashboard/${sid}/narrative${refresh ? "?refresh=true" : ""}`);
    if (sid !== sessionId) return; // a newer upload superseded this request
    const data = await res.json();
    if (!res.ok || !data.narrative) {
      dashboardNarrative.classList.add("hidden");
      dashboardNarrative.innerHTML = "";
      return;
    }
    dashboardNarrative.innerHTML = "";
    const icon = document.createElement("span");
    icon.className = "dashboard-narrative-icon";
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "✦";
    const text = document.createElement("p");
    text.className = "dashboard-narrative-text";
    text.textContent = data.narrative;
    const refreshBtn = document.createElement("button");
    refreshBtn.type = "button";
    refreshBtn.className = "btn-link dashboard-narrative-refresh";
    refreshBtn.title = "Regenerate this summary";
    refreshBtn.textContent = "Regenerate";
    refreshBtn.addEventListener("click", () => loadNarrative(sid, true));
    dashboardNarrative.appendChild(icon);
    dashboardNarrative.appendChild(text);
    dashboardNarrative.appendChild(refreshBtn);
  } catch {
    if (sid !== sessionId) return;
    dashboardNarrative.classList.add("hidden");
    dashboardNarrative.innerHTML = "";
  } finally {
    stopProgress();
  }
}

async function loadInsights(sid, refresh = false) {
  insightsSection.classList.remove("hidden");
  insightsContent.innerHTML = "";
  const skeletonWrap = document.createElement("div");
  skeletonWrap.className = "insights-loading-note";
  skeletonWrap.innerHTML = `<p class="insights-loading">Analyzing your data for useful views…</p>`;
  insightsContent.appendChild(skeletonWrap);
  for (let i = 0; i < 3; i++) {
    insightsContent.appendChild(buildInsightSkeletonCard(i * 60));
  }
  insightsRefresh.classList.add("hidden");
  const stopProgress = scheduleProgressiveText(skeletonWrap.querySelector(".insights-loading"), [
    { delay: 12000, text: "Still working — the local model is busy…" },
    { delay: 35000, text: "Taking longer than usual. Large uploads queue several model calls at once." },
  ]);

  try {
    const res = await fetch(`/dashboard/${sid}/insights${refresh ? "?refresh=true" : ""}`);
    if (sid !== sessionId) return; // a newer upload superseded this request
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Couldn't generate suggested views.");
    if (sid !== sessionId) return;

    if ((!data.insights || !data.insights.length) && !pinnedInsights.length) {
      insightsSection.classList.add("hidden");
      insightsTakeaways.innerHTML = "";
      insightsTakeaways.classList.add("hidden");
      currentInsights = [];
      return;
    }

    // Pinned cards survive a regenerate — the LLM's fresh proposal list would
    // otherwise silently drop whatever the user chose to keep. Dismissed cards
    // are the opposite: filtered back out even if the LLM proposes them again.
    const fresh = (data.insights || []).filter((v) => !dismissedInsights.includes(insightKey(v)));
    const merged = applyInsightOrder(
      [...pinnedInsights, ...fresh.filter((v) => !pinnedInsights.some((p) => insightKey(p) === insightKey(v)))]
    );

    currentInsights = merged;
    renderTakeaways(merged);
    insightsContent.innerHTML = "";
    activeLeafletMaps.length = 0; // old cards' map instances are gone with the DOM above
    merged.forEach((view, idx) => {
      const card = renderInsightCard(view);
      card.style.animationDelay = `${Math.min(idx, 6) * 45}ms`;
      insightsContent.appendChild(card);
    });
    insightsRefresh.classList.remove("hidden");
    if (refresh) showToast("Suggested views regenerated", "success");
  } catch (err) {
    if (sid !== sessionId) return;
    insightsTakeaways.innerHTML = "";
    insightsTakeaways.classList.add("hidden");
    insightsContent.innerHTML = "";
    const errNote = document.createElement("div");
    errNote.className = "insights-error-note";
    const errorText = document.createElement("p");
    errorText.textContent = `Couldn't generate suggested views${err && err.message ? `: ${err.message}` : "."}`;
    errNote.appendChild(errorText);
    const retryBtn = document.createElement("button");
    retryBtn.type = "button";
    retryBtn.className = "btn-secondary";
    retryBtn.textContent = "Retry";
    retryBtn.addEventListener("click", () => loadInsights(sid, true));
    errNote.appendChild(retryBtn);
    insightsContent.appendChild(errNote);
  } finally {
    stopProgress();
  }
}

insightsRefresh.addEventListener("click", () => {
  if (!sessionId) return;
  noteSessionTouch();
  loadInsights(sessionId, true);
});

// --- Drag-to-reorder suggested views ---
// Native HTML5 DnD delegated on the container: cards are re-created on every
// loadInsights() render, so listeners live on the stable parent rather than
// being rebound per-card. Dragging is restricted to the .insight-drag-handle
// grip — dragstart's e.target is wherever the gesture actually began inside
// the draggable card, so bailing out unless that's the handle keeps normal
// clicks/selection everywhere else on the card (pin, ask, chart-type pills)
// from being hijacked as a drag.
let draggedInsightCard = null;

function clearInsightDragIndicators() {
  insightsContent.querySelectorAll(".drag-over-before, .drag-over-after").forEach((el) => {
    el.classList.remove("drag-over-before", "drag-over-after");
  });
}

insightsContent.addEventListener("dragstart", (e) => {
  const card = e.target.closest(".insight-card");
  if (!card || !e.target.closest(".insight-drag-handle")) {
    e.preventDefault();
    return;
  }
  draggedInsightCard = card;
  requestAnimationFrame(() => card.classList.add("dragging"));
  e.dataTransfer.effectAllowed = "move";
  e.dataTransfer.setData("text/plain", card.dataset.insightKey || "");
});

insightsContent.addEventListener("dragend", () => {
  if (draggedInsightCard) draggedInsightCard.classList.remove("dragging");
  draggedInsightCard = null;
  clearInsightDragIndicators();
});

insightsContent.addEventListener("dragover", (e) => {
  if (!draggedInsightCard) return;
  e.preventDefault();
  e.dataTransfer.dropEffect = "move";
  const target = e.target.closest(".insight-card");
  clearInsightDragIndicators();
  if (!target || target === draggedInsightCard) return;
  const rect = target.getBoundingClientRect();
  const draggedRect = draggedInsightCard.getBoundingClientRect();
  // Two-column grid: same-row cards reorder left/right, different-row cards
  // reorder by which half of the target's row the pointer is in.
  const sameRow = Math.abs(rect.top - draggedRect.top) < rect.height / 2;
  const before = sameRow ? e.clientX < rect.left + rect.width / 2 : e.clientY < rect.top + rect.height / 2;
  target.classList.toggle("drag-over-before", before);
  target.classList.toggle("drag-over-after", !before);
});

insightsContent.addEventListener("drop", (e) => {
  if (!draggedInsightCard) return;
  e.preventDefault();
  const target = e.target.closest(".insight-card");
  if (target && target !== draggedInsightCard) {
    const rect = target.getBoundingClientRect();
    const draggedRect = draggedInsightCard.getBoundingClientRect();
    const sameRow = Math.abs(rect.top - draggedRect.top) < rect.height / 2;
    const before = sameRow ? e.clientX < rect.left + rect.width / 2 : e.clientY < rect.top + rect.height / 2;
    insightsContent.insertBefore(draggedInsightCard, before ? target : target.nextSibling);
  }
  clearInsightDragIndicators();
  persistInsightOrderFromDom();
});

function persistInsightOrderFromDom() {
  insightOrderOverride = Array.from(insightsContent.querySelectorAll(".insight-card"))
    .map((el) => el.dataset.insightKey)
    .filter(Boolean);
  currentInsights = applyInsightOrder(currentInsights);
  saveInsightOrder();
}

// Drag-to-reorder (above) has no keyboard equivalent, so these buttons are
// the accessible path to the same feature — not a visual extra, a requirement
// for anyone who can't use a mouse to grab the drag handle.
function moveInsightCard(card, direction) {
  const sibling = direction < 0 ? card.previousElementSibling : card.nextElementSibling;
  if (!sibling || !sibling.classList.contains("insight-card")) return;
  if (direction < 0) {
    insightsContent.insertBefore(card, sibling);
  } else {
    insightsContent.insertBefore(sibling, card);
  }
  persistInsightOrderFromDom();
}

// --- Custom insight builder ---

let insightFieldCandidates = null;

function populateSelect(select, options) {
  select.innerHTML = "";
  options.forEach((value) => {
    const opt = document.createElement("option");
    opt.value = value;
    opt.textContent = value;
    select.appendChild(opt);
  });
}

function syncCustomInsightTable() {
  const info = (insightFieldCandidates || {})[customInsightTableSelect.value];
  if (!info) return;
  populateSelect(customInsightDimensionSelect, [...info.dimensions, ...info.dates]);
  populateSelect(customInsightMeasureSelect, info.measures);
  customInsightFilterColumnSelect.innerHTML = "";
  const noFilterOpt = document.createElement("option");
  noFilterOpt.value = "";
  noFilterOpt.textContent = "No filter";
  customInsightFilterColumnSelect.appendChild(noFilterOpt);
  info.dimensions.forEach((col) => {
    if (!(info.filter_values || {})[col]) return; // nothing to filter on
    const opt = document.createElement("option");
    opt.value = col;
    opt.textContent = col;
    customInsightFilterColumnSelect.appendChild(opt);
  });
  customInsightFilterMeasureSelect.innerHTML = "";
  const noNumericFilterOpt = document.createElement("option");
  noNumericFilterOpt.value = "";
  noNumericFilterOpt.textContent = "No numeric filter";
  customInsightFilterMeasureSelect.appendChild(noNumericFilterOpt);
  info.measures.forEach((col) => {
    if (!(info.numeric_ranges || {})[col]) return; // nothing to bound a threshold against
    const opt = document.createElement("option");
    opt.value = col;
    opt.textContent = col;
    customInsightFilterMeasureSelect.appendChild(opt);
  });
  syncCustomInsightAgg();
  syncCustomInsightFilterColumn();
  syncCustomInsightFilterMeasure();
}

function syncCustomInsightAgg() {
  const isCount = customInsightAggSelect.value === "count";
  customInsightMeasureField.classList.toggle("hidden", isCount);
  customInsightMeasureSelect.required = !isCount;
}

function syncCustomInsightFilterColumn() {
  const col = customInsightFilterColumnSelect.value;
  customInsightFilterValueField.classList.toggle("hidden", !col);
  if (!col) {
    customInsightFilterValueSelect.innerHTML = "";
    return;
  }
  const info = (insightFieldCandidates || {})[customInsightTableSelect.value];
  const values = (info && info.filter_values && info.filter_values[col]) || [];
  populateSelect(customInsightFilterValueSelect, values);
}

function syncCustomInsightFilterMeasure() {
  const col = customInsightFilterMeasureSelect.value;
  customInsightFilterNumericRow.classList.toggle("hidden", !col);
  customInsightFilterThresholdInput.required = !!col;
  if (!col) {
    customInsightFilterThresholdInput.removeAttribute("placeholder");
    return;
  }
  const info = (insightFieldCandidates || {})[customInsightTableSelect.value];
  const range = info && info.numeric_ranges && info.numeric_ranges[col];
  if (range) {
    customInsightFilterThresholdInput.placeholder = `${range.min} to ${range.max}`;
  }
}

customInsightTableSelect.addEventListener("change", syncCustomInsightTable);
customInsightAggSelect.addEventListener("change", syncCustomInsightAgg);
customInsightFilterColumnSelect.addEventListener("change", syncCustomInsightFilterColumn);
customInsightFilterMeasureSelect.addEventListener("change", syncCustomInsightFilterMeasure);

async function openCustomInsightModal() {
  if (!sessionId) return;
  customInsightError.classList.add("hidden");
  customInsightError.textContent = "";
  customInsightForm.reset();
  try {
    const res = await fetch(`/dashboard/${sessionId}/insight-fields`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Couldn't load fields.");
    insightFieldCandidates = data.candidates || {};
    const tableNames = Object.keys(insightFieldCandidates);
    if (!tableNames.length) {
      showToast("No chartable columns found in this dataset", "error");
      return;
    }
    populateSelect(customInsightTableSelect, tableNames);
    syncCustomInsightTable();
    openModal(customInsightOverlay, customInsightTableSelect);
  } catch (err) {
    showToast(err.message || "Couldn't load fields for the custom view builder", "error");
  }
}

customInsightBtn.addEventListener("click", openCustomInsightModal);
customInsightClose.addEventListener("click", () => closeModal(customInsightOverlay));
customInsightOverlay.addEventListener("click", (e) => {
  if (e.target === customInsightOverlay) closeModal(customInsightOverlay);
});

customInsightForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!sessionId) return;
  customInsightError.classList.add("hidden");
  customInsightSubmit.disabled = true;
  try {
    const isCount = customInsightAggSelect.value === "count";
    const filterColumn = customInsightFilterColumnSelect.value || null;
    const filterMeasure = customInsightFilterMeasureSelect.value || null;
    let filterThreshold = null;
    if (filterMeasure) {
      const raw = customInsightFilterThresholdInput.value.trim();
      if (raw === "" || Number.isNaN(Number(raw))) {
        throw new Error("Enter a numeric threshold for the numeric filter.");
      }
      filterThreshold = Number(raw);
    }
    const body = {
      table: customInsightTableSelect.value,
      dimension: customInsightDimensionSelect.value,
      agg: customInsightAggSelect.value,
      chart_type: customInsightChartTypeSelect.value,
      measure: isCount ? null : customInsightMeasureSelect.value,
      title: customInsightTitleInput.value.trim() || null,
      filter_column: filterColumn,
      filter_value: filterColumn ? customInsightFilterValueSelect.value : null,
      filter_measure: filterMeasure,
      filter_operator: filterMeasure ? customInsightFilterOperatorSelect.value : null,
      filter_threshold: filterThreshold,
    };
    const res = await fetch(`/dashboard/${sessionId}/custom-insight`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Couldn't build that view.");
    noteSessionTouch();
    closeModal(customInsightOverlay);
    customInsightForm.reset();
    const view = data.insight;
    currentInsights.push(view);
    insightsSection.classList.remove("hidden");
    insightsRefresh.classList.remove("hidden");
    const card = renderInsightCard(view);
    insightsContent.insertBefore(card, insightsContent.firstChild);
    showToast("View added", "success");
  } catch (err) {
    customInsightError.textContent = err.message || "Couldn't build that view.";
    customInsightError.classList.remove("hidden");
  } finally {
    customInsightSubmit.disabled = false;
  }
});

// A chart is safe to drill into raw rows when its "dimension" values are
// exact category values (matched with =), OR when it's a DATE_TRUNC'd bucket
// whose granularity we know (backend sends `granularity` alongside date-
// dimensioned insights) — in that case drillIntoInsight matches with a
// [bucket start, bucket end) range instead of an exact value.
function isInsightDrillable(view) {
  if (!currentDashboard || view.chart_type === "map" || view.chart_type === "scatter") return false;
  const table = currentDashboard.tables.find((t) => t.table === view.table);
  if (!table) return false;
  if (!table.date_columns.includes(view.dimension)) return true;
  return !!view.granularity;
}

// Turns a DATE_TRUNC bucket's start value (e.g. "2024-04-01") into a
// half-open [start, end) range at the matching granularity, computed in UTC
// since these are date-only values with no timezone of their own.
function bucketRange(startValue, granularity) {
  const start = new Date(`${String(startValue).slice(0, 10)}T00:00:00Z`);
  const end = new Date(start);
  if (granularity === "day") end.setUTCDate(end.getUTCDate() + 1);
  else if (granularity === "year") end.setUTCFullYear(end.getUTCFullYear() + 1);
  else end.setUTCMonth(end.getUTCMonth() + 1); // "month" default
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
}

function drillIntoInsight(view, rawValue) {
  if (!currentDashboard) return;
  const table = currentDashboard.tables.find((t) => t.table === view.table);
  if (!table) return;
  closeModal(insightModalOverlay);
  const filter = view.granularity
    ? { column: view.dimension, range: bucketRange(rawValue, view.granularity) }
    : { column: view.dimension, value: rawValue };
  openDataBrowser(table, filter);
}

function flashChatAndAsk(message) {
  if (!sessionId) return;
  chatPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  chatPanel.classList.remove("chat-panel-flash");
  void chatPanel.offsetWidth; // restart the animation if it's already mid-flash from a prior click
  chatPanel.classList.add("chat-panel-flash");
  askQuestion(message);
}

function askAboutInsight(view) {
  flashChatAndAsk(`Tell me more about "${view.title}" — what's driving this, and are there any outliers worth flagging?`);
}

function askAboutAnomalies(view, anomalies) {
  const labels = anomalies.map((a) => a.label);
  const subject = labels.length > 1 ? `these periods (${labels.join(", ")})` : `"${labels[0]}"`;
  flashChatAndAsk(
    `In "${view.title}", ${subject} looked unusual compared to the trend — what's different about ${
      labels.length > 1 ? "them" : "it"
    }, and why might that be?`
  );
}

function askAboutForecast(view) {
  flashChatAndAsk(
    `Tell me more about the forecast for "${view.title}" (method: ${view.forecast.method}) — how reliable is it, and what should I watch out for?`
  );
}

function updateInsightsSectionVisibility() {
  const visible = insightsContent.querySelector(".insight-card:not(.insight-card-pending-hide)");
  insightsSection.classList.toggle("hidden", !visible);
}

function renderInsightCard(view) {
  const card = document.createElement("div");
  card.className = "insight-card";
  card.dataset.insightKey = insightKey(view);
  card.draggable = true;

  const header = document.createElement("div");
  header.className = "insight-card-header";

  const dragHandle = document.createElement("span");
  dragHandle.className = "insight-drag-handle";
  dragHandle.textContent = "⠿";
  dragHandle.title = "Drag to reorder";
  dragHandle.setAttribute("aria-hidden", "true");
  card.appendChild(dragHandle); // absolutely positioned — kept out of the header's flex flow

  const titleWrap = document.createElement("div");
  titleWrap.className = "insight-card-title";
  const title = document.createElement("h3");
  title.textContent = view.title;
  titleWrap.appendChild(title);
  if (typeof view.confidence === "number") {
    const badge = document.createElement("span");
    const tier = view.confidence >= 0.7 ? "high" : view.confidence >= 0.45 ? "medium" : "low";
    badge.className = `confidence-badge conf-${tier} has-tooltip`;
    badge.textContent = `${Math.round(view.confidence * 100)}%`;
    if (view.confidence_reason) {
      badge.setAttribute("data-tooltip", view.confidence_reason);
      badge.setAttribute("tabindex", "0");
      badge.setAttribute("aria-label", `Confidence ${Math.round(view.confidence * 100)}%: ${view.confidence_reason}`);
    }
    titleWrap.appendChild(badge);
  }
  if (view.period_delta && typeof view.period_delta.pct === "number") {
    const pd = view.period_delta;
    const deltaBadge = document.createElement("span");
    deltaBadge.className = `period-delta-badge delta-${pd.direction} has-tooltip`;
    const arrow = pd.direction === "up" ? "▲" : "▼";
    deltaBadge.textContent = `${arrow} ${Math.abs(pd.pct).toFixed(1)}%`;
    deltaBadge.setAttribute("data-tooltip", `${pd.current_label} ${pd.label} (${pd.previous_label})`);
    deltaBadge.setAttribute("tabindex", "0");
    deltaBadge.setAttribute(
      "aria-label",
      `${Math.abs(pd.pct).toFixed(1)}% ${pd.direction} ${pd.label}, comparing ${pd.current_label} to ${pd.previous_label}`
    );
    titleWrap.appendChild(deltaBadge);
  }
  (view.filters || []).forEach((f) => {
    const filterChip = document.createElement("span");
    filterChip.className = "insight-filter-chip";
    filterChip.textContent = `${f.column} ${f.op} ${f.value}`;
    titleWrap.appendChild(filterChip);
  });
  header.appendChild(titleWrap);

  const toggle = document.createElement("div");
  toggle.className = "view-toggle";
  const chartBtn = document.createElement("button");
  chartBtn.type = "button";
  chartBtn.className = "pill active";
  chartBtn.textContent = "Chart";
  const tableBtn = document.createElement("button");
  tableBtn.type = "button";
  tableBtn.className = "pill";
  tableBtn.textContent = "Table";
  toggle.appendChild(chartBtn);
  toggle.appendChild(tableBtn);

  const actions = document.createElement("div");
  actions.className = "insight-card-actions";
  actions.appendChild(toggle);

  const moveUpBtn = document.createElement("button");
  moveUpBtn.type = "button";
  moveUpBtn.className = "insight-move-btn";
  moveUpBtn.title = "Move earlier (keyboard-friendly alternative to dragging)";
  moveUpBtn.setAttribute("aria-label", "Move this view earlier");
  moveUpBtn.textContent = "▲";
  moveUpBtn.addEventListener("click", () => moveInsightCard(card, -1));
  actions.appendChild(moveUpBtn);

  const moveDownBtn = document.createElement("button");
  moveDownBtn.type = "button";
  moveDownBtn.className = "insight-move-btn";
  moveDownBtn.title = "Move later (keyboard-friendly alternative to dragging)";
  moveDownBtn.setAttribute("aria-label", "Move this view later");
  moveDownBtn.textContent = "▼";
  moveDownBtn.addEventListener("click", () => moveInsightCard(card, 1));
  actions.appendChild(moveDownBtn);

  const isPinned = () => pinnedInsights.some((p) => insightKey(p) === insightKey(view));
  const pinBtn = document.createElement("button");
  pinBtn.type = "button";
  pinBtn.className = "insight-pin-btn";
  const syncPinBtn = () => {
    const pinned = isPinned();
    pinBtn.classList.toggle("active", pinned);
    pinBtn.textContent = pinned ? "📌" : "📍";
    pinBtn.title = pinned ? "Unpin (will be replaced on regenerate)" : "Pin (keeps this view across regenerate)";
    pinBtn.setAttribute("aria-label", pinBtn.title);
    card.classList.toggle("insight-card-pinned", pinned);
  };
  pinBtn.addEventListener("click", () => {
    if (isPinned()) {
      pinnedInsights = pinnedInsights.filter((p) => insightKey(p) !== insightKey(view));
      showToast("Unpinned view", "info");
    } else {
      pinnedInsights.push(view);
      showToast("Pinned — this view stays even after Regenerate", "success");
    }
    savePinnedInsights();
    syncPinBtn();
  });
  syncPinBtn();
  actions.appendChild(pinBtn);

  const askBtn = document.createElement("button");
  askBtn.type = "button";
  askBtn.className = "insight-ask-btn";
  askBtn.title = "Ask the chat about this view";
  askBtn.setAttribute("aria-label", "Ask the chat about this view");
  askBtn.textContent = "💬";
  askBtn.addEventListener("click", () => askAboutInsight(view));
  actions.appendChild(askBtn);

  const expandBtn = document.createElement("button");
  expandBtn.type = "button";
  expandBtn.className = "insight-expand-btn";
  expandBtn.title = "Expand this view";
  expandBtn.setAttribute("aria-label", "Expand this view");
  expandBtn.textContent = "⤢";
  expandBtn.addEventListener("click", () => openInsightModal(view));
  actions.appendChild(expandBtn);

  if (!view.custom) {
    const dismissBtn = document.createElement("button");
    dismissBtn.type = "button";
    dismissBtn.className = "insight-dismiss-btn";
    dismissBtn.title = "Not useful — hide this view";
    dismissBtn.setAttribute("aria-label", "Hide this view");
    dismissBtn.textContent = "✕";
    dismissBtn.addEventListener("click", () => {
      const index = currentInsights.indexOf(view);
      const wasPinned = isPinned();
      currentInsights = currentInsights.filter((v) => v !== view);
      if (wasPinned) {
        pinnedInsights = pinnedInsights.filter((p) => insightKey(p) !== insightKey(view));
        savePinnedInsights();
      }
      dismissedInsights.push(insightKey(view));
      saveDismissedInsights();
      card.classList.add("insight-card-pending-hide");
      updateInsightsSectionVisibility();

      const undoWindowMs = 5000;
      const finalizeTimer = setTimeout(() => {
        card.remove();
        updateInsightsSectionVisibility();
      }, undoWindowMs);

      showToast("Hidden — won't reappear this session", "info", undoWindowMs, {
        label: "Undo",
        onClick: () => {
          clearTimeout(finalizeTimer);
          dismissedInsights = dismissedInsights.filter((k) => k !== insightKey(view));
          saveDismissedInsights();
          currentInsights.splice(index, 0, view);
          if (wasPinned) {
            pinnedInsights.push(view);
            savePinnedInsights();
          }
          card.classList.remove("insight-card-pending-hide");
          updateInsightsSectionVisibility();
        },
      });
    });
    actions.appendChild(dismissBtn);
  }

  if (view.custom) {
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.className = "insight-remove-btn";
    removeBtn.title = "Remove this view";
    removeBtn.setAttribute("aria-label", "Remove this view");
    removeBtn.textContent = "✕";
    removeBtn.addEventListener("click", () => {
      const index = currentInsights.indexOf(view);
      const wasPinned = isPinned();
      currentInsights = currentInsights.filter((v) => v !== view);
      if (wasPinned) {
        pinnedInsights = pinnedInsights.filter((p) => insightKey(p) !== insightKey(view));
        savePinnedInsights();
      }
      card.classList.add("insight-card-pending-hide");
      updateInsightsSectionVisibility();

      const undoWindowMs = 5000;
      const finalizeTimer = setTimeout(() => {
        card.remove();
        updateInsightsSectionVisibility();
      }, undoWindowMs);

      showToast("View removed", "info", undoWindowMs, {
        label: "Undo",
        onClick: () => {
          clearTimeout(finalizeTimer);
          currentInsights.splice(index, 0, view);
          if (wasPinned) {
            pinnedInsights.push(view);
            savePinnedInsights();
          }
          card.classList.remove("insight-card-pending-hide");
          updateInsightsSectionVisibility();
        },
      });
    });
    actions.appendChild(removeBtn);
  }

  header.appendChild(actions);
  card.appendChild(header);

  if (view.highlight) {
    const highlight = document.createElement("p");
    highlight.className = "insight-card-highlight";
    highlight.textContent = view.highlight;
    card.appendChild(highlight);
  }

  const chartWrap = document.createElement("div");
  chartWrap.className = "insight-chart-wrap";
  const tableWrap = document.createElement("div");
  tableWrap.className = "insight-table-wrap hidden";
  tableWrap.appendChild(buildSortableTable(view.columns, view.rows));
  if (view.rows && view.rows.length) {
    const exportRow = document.createElement("div");
    exportRow.className = "result-actions";
    exportRow.appendChild(buildExportButton(view.title || "insight", view.columns, view.rows));
    tableWrap.appendChild(exportRow);
  }

  let leafletMap = null;
  if (view.chart_type === "map") {
    const mapEl = document.createElement("div");
    mapEl.className = "insight-map";
    chartWrap.appendChild(mapEl);

    card.renderMapNow = () => {
      if (leafletMap) {
        leafletMap.invalidateSize();
        return;
      }
      renderMap(mapEl, view).then((map) => {
        leafletMap = map;
        activeLeafletMaps.push(map);
      });
    };
  } else {
    // scatter pairs two real numeric columns (not the dimension/value shape),
    // so it can't be freely re-rendered as bar/line/pie — only bar/line/pie
    // interchange amongst themselves, since they all share that shape.
    const supportsChartSwitch = view.chart_type !== "scatter";
    let displayChartType = supportsChartSwitch
      ? chartTypeOverrides[insightKey(view)] || view.chart_type
      : view.chart_type;
    let activeChart = null;

    const drawChart = (type) => {
      chartWrap
        .querySelectorAll(
          "canvas, .insight-chart-hint, .chart-download-btn, .insight-forecast-caption, .insight-anomaly-caption"
        )
        .forEach((el) => el.remove());
      if (activeChart) {
        activeChart.destroy();
        activeChart = null;
      }
      const canvas = document.createElement("canvas");
      chartWrap.insertBefore(canvas, chartWrap.firstChild);
      const drillable = isInsightDrillable(view);
      const chartSpec =
        type === "scatter"
          ? { type: "scatter", x: view.columns[0], y: view.columns[1], title: view.title }
          : { type, x: "dimension", y: "value", title: view.title };
      activeChart = renderChartFromResult(
        canvas,
        chartSpec,
        { columns: view.columns, rows: view.rows },
        drillable ? (rawValue) => drillIntoInsight(view, rawValue) : null,
        type === "line" ? view.forecast : null,
        type === "line" ? view.anomalies : null
      );
      if (activeChart) {
        chartWrap.appendChild(buildChartDownloadButton(activeChart, view.title || "chart"));
      } else {
        canvas.remove();
        const note = document.createElement("p");
        note.className = "chart-render-fallback";
        note.textContent = "Couldn't render this view as a chart — try the table view instead.";
        chartWrap.appendChild(note);
      }
      if (activeChart && drillable) {
        const hint = document.createElement("p");
        hint.className = "insight-chart-hint";
        hint.textContent = "Click a bar, slice, or point to view the underlying rows";
        chartWrap.appendChild(hint);
      }
      if (activeChart && type === "line" && view.forecast) {
        chartWrap.appendChild(buildForecastCaption(view));
      }
      if (activeChart && type === "line" && view.anomalies && view.anomalies.length) {
        chartWrap.appendChild(buildAnomalyCaption(view.anomalies, view));
      }
    };

    drawChart(displayChartType);

    if (supportsChartSwitch) {
      const typeToggle = document.createElement("div");
      typeToggle.className = "view-toggle chart-type-toggle";
      const CHART_TYPE_OPTIONS = [
        { key: "bar", label: "▤", title: "View as bar chart" },
        { key: "line", label: "📈", title: "View as line chart" },
        { key: "pie", label: "🥧", title: "View as pie chart" },
      ];
      const typeBtns = CHART_TYPE_OPTIONS.map(({ key, label, title }) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = `pill${key === displayChartType ? " active" : ""}`;
        btn.textContent = label;
        btn.title = title;
        btn.setAttribute("aria-label", title);
        btn.addEventListener("click", () => {
          if (key === displayChartType) return;
          displayChartType = key;
          typeBtns.forEach((b) => b.classList.remove("active"));
          btn.classList.add("active");
          drawChart(displayChartType);
          chartTypeOverrides[insightKey(view)] = key;
          saveChartTypeOverrides();
          if (!chartBtn.classList.contains("active")) chartBtn.click();
        });
        return btn;
      });
      typeBtns.forEach((btn) => typeToggle.appendChild(btn));
      actions.insertBefore(typeToggle, toggle.nextSibling);
    }
  }

  card.appendChild(chartWrap);
  card.appendChild(tableWrap);

  chartBtn.addEventListener("click", () => {
    if (chartBtn.classList.contains("active")) return;
    chartBtn.classList.add("active");
    tableBtn.classList.remove("active");
    chartWrap.classList.remove("hidden");
    tableWrap.classList.add("hidden");
    if (card.renderMapNow) card.renderMapNow();
  });

  tableBtn.addEventListener("click", () => {
    if (tableBtn.classList.contains("active")) return;
    tableBtn.classList.add("active");
    chartBtn.classList.remove("active");
    tableWrap.classList.remove("hidden");
    chartWrap.classList.add("hidden");
  });

  if (card.renderMapNow) {
    // Container must be laid out (not display:none) before Leaflet initializes.
    requestAnimationFrame(() => card.renderMapNow());
  }

  return card;
}

function buildSortableTable(columns, rows) {
  const wrap = document.createElement("div");
  wrap.className = "sortable-table-wrap";
  const table = document.createElement("table");
  table.className = "sortable-table";

  const thead = document.createElement("thead");
  const headRow = document.createElement("tr");
  columns.forEach((col, idx) => {
    const th = document.createElement("th");
    th.textContent = col;
    th.addEventListener("click", () => {
      const asc = th.dataset.sortDir !== "asc";
      headRow.querySelectorAll("th").forEach((h) => delete h.dataset.sortDir);
      th.dataset.sortDir = asc ? "asc" : "desc";
      const sorted = [...rows].sort((a, b) => {
        const av = a[idx];
        const bv = b[idx];
        if (typeof av === "number" && typeof bv === "number") return asc ? av - bv : bv - av;
        return asc ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
      });
      renderRows(sorted);
    });
    headRow.appendChild(th);
  });
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement("tbody");
  table.appendChild(tbody);

  function renderRows(data) {
    tbody.innerHTML = "";
    for (const row of data) {
      const tr = document.createElement("tr");
      for (const cell of row) {
        const td = document.createElement("td");
        td.textContent = typeof cell === "number" ? fmt(cell) : cell === null || cell === undefined ? "—" : cell;
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  }
  renderRows(rows);

  wrap.appendChild(table);
  return wrap;
}

let usStatesTopologyPromise = null;
function loadUsStatesTopology() {
  if (!usStatesTopologyPromise) {
    usStatesTopologyPromise = fetch("/vendor/us-atlas/states-10m.json").then((res) => {
      if (!res.ok) throw new Error("Couldn't load US states map data.");
      return res.json();
    });
  }
  return usStatesTopologyPromise;
}

async function renderMap(container, view) {
  const topology = await loadUsStatesTopology();
  const geojson = topojson.feature(topology, topology.objects.states);

  const dimIdx = view.columns.indexOf("dimension");
  const valIdx = view.columns.indexOf("value");
  const valueByState = {};
  for (const row of view.rows) {
    valueByState[row[dimIdx]] = row[valIdx];
  }
  const maxValue = Math.max(0, ...Object.values(valueByState));
  const theme = mapThemeColors();

  const map = L.map(container, { scrollWheelZoom: false }).setView([37.8, -96], 3.5);

  L.geoJSON(geojson, {
    style: (feature) => {
      const value = valueByState[feature.properties.name];
      return {
        fillColor: value === undefined ? theme.noData : mapColor(value, maxValue, theme),
        fillOpacity: 0.85,
        color: theme.stroke,
        weight: 1,
      };
    },
    onEachFeature: (feature, layer) => {
      const value = valueByState[feature.properties.name];
      layer.bindTooltip(`${feature.properties.name}: ${value !== undefined ? fmt(value) : "no data"}`);
    },
  }).addTo(map);

  map.invalidateSize();
  return map;
}

// Maps are torn down and rebuilt by repaintVisibleCharts() on theme toggle,
// so reading these live (rather than hardcoding dark-theme hex values) is
// what makes the choropleth actually follow light/dark mode like every
// other chart in the app.
function mapThemeColors() {
  const cs = getComputedStyle(document.documentElement);
  return {
    noData: cs.getPropertyValue("--border").trim() || "#262b36",
    stroke: cs.getPropertyValue("--bg").trim() || "#0f1115",
    startRgb: hexToRgb(cs.getPropertyValue("--accent-dim").trim() || "#2b3a63"),
    endRgb: (cs.getPropertyValue("--accent-rgb").trim() || "91, 140, 255")
      .split(",")
      .map((n) => parseInt(n.trim(), 10)),
  };
}

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [43, 58, 99];
}

function mapColor(value, maxValue, theme) {
  if (!maxValue) return CHART_COLORS[0];
  const t = Math.min(1, value / maxValue);
  const rgb = theme.startRgb.map((s, i) => Math.round(s + (theme.endRgb[i] - s) * t));
  return `rgb(${rgb.join(",")})`;
}
