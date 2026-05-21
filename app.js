const STORAGE_KEY = "joseki-manager-v4";
const LEGACY_STORAGE_KEY = "shogi-branch-studio-v4";
const INITIAL_SFEN = "lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL b - 1";
const SAMPLE_ROOT_SFEN = "lnsgkgsnl/1r5b1/ppppppppp/9/9/7P1/PPPPPPP1P/1B5R1/LNSGKGSNL w - 2";
const BROKEN_SAMPLE_SFENS = new Map([
  [
    "lnsgkgsnl/1r5b1/ppppppppp/9/9/7P1/PPPPPPPP1/1B5R1/LNSGKGSNL w - 2",
    SAMPLE_ROOT_SFEN
  ],
  [
    "lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/2P4P1/PP1PPPPP1/1B5R1/LNSGKGSNL w - 4",
    "lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/2P4P1/PP1PPPP1P/1B5R1/LNSGKGSNL w - 4"
  ]
]);

const COLOR = window.JKF.Shogi.Color;
const KIND_ORDER = ["HI", "KA", "KI", "GI", "KE", "KY", "FU"];
const KANJI_RANKS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
const DISPLAY_FILES = ["", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
const DISPLAY_RANKS = ["", "一", "二", "三", "四", "五", "六", "七", "八", "九"];

const state = {
  openings: loadOpenings(),
  selectedOpeningId: null,
  activeNodeId: null,
  selectedBranchIndex: 0,
  revealedBranchId: null,
  browseSelection: null,
  replySelection: null,
  path: [],
  screen: "home",
  menuOpen: false,
  moreMenuOpen: false,
  homeExportMode: false,
  homeSelectionMode: null,
  homeSelectedOpeningIds: new Set(),
  homeSearch: "",
  positionSearchResults: [],
  positionSearchOptions: {
    includeFlipped: true
  },
  searchBoardSfen: INITIAL_SFEN,
  searchBoardSelection: null,
  editMode: false,
  composer: null,
  openingSetup: null
};

const elements = {
  body: document.body,
  menuButton: document.querySelector("#menu-button"),
  appbarCopy: document.querySelector(".appbar-copy"),
  homeButton: document.querySelector("#home-button"),
  closeDrawerButton: document.querySelector("#close-drawer-button"),
  scrim: document.querySelector("#scrim"),
  moreButton: document.querySelector("#more-button"),
  moreMenu: document.querySelector("#more-menu"),
  openingSetupSheet: document.querySelector("#opening-setup-sheet"),
  newOpeningButton: document.querySelector("#new-opening-button"),
  drawerPositionSearchButton: document.querySelector("#drawer-position-search-button"),
  moreDeleteButton: document.querySelector("#more-delete-button"),
  renameOpeningButton: document.querySelector("#rename-opening-button"),
  chooseBlackButton: document.querySelector("#choose-black-button"),
  chooseWhiteButton: document.querySelector("#choose-white-button"),
  openingNameInput: document.querySelector("#opening-name-input"),
  saveOpeningButton: document.querySelector("#save-opening-button"),
  cancelOpeningButton: document.querySelector("#cancel-opening-button"),
  addBranchButton: document.querySelector("#add-branch-button"),
  emptyAddBranchButton: document.querySelector("#empty-add-branch-button"),
  cancelComposeButton: document.querySelector("#cancel-compose-button"),
  exportButton: document.querySelector("#export-button"),
  importInput: document.querySelector("#import-input"),
  openingList: document.querySelector("#opening-list"),
  appbarTitle: document.querySelector("#appbar-title"),
  homeView: document.querySelector("#home-view"),
  homeOpeningList: document.querySelector("#home-opening-list"),
  homeSearchInput: document.querySelector("#home-search-input"),
  homeNewOpeningButton: document.querySelector("#home-new-opening-button"),
  homePositionSearchButton: document.querySelector("#home-position-search-button"),
  homeExportModeButton: document.querySelector("#home-export-mode-button"),
  homeDeleteModeButton: document.querySelector("#home-delete-mode-button"),
  homeExportSelectedButton: document.querySelector("#home-export-selected-button"),
  homeDeleteSelectedButton: document.querySelector("#home-delete-selected-button"),
  homeExportCancelButton: document.querySelector("#home-export-cancel-button"),
  positionSearchView: document.querySelector("#position-search-view"),
  positionSearchInput: document.querySelector("#position-search-input"),
  positionSearchButton: document.querySelector("#position-search-button"),
  positionSearchResults: document.querySelector("#position-search-results"),
  searchFlippedButton: document.querySelector("#search-flipped-button"),
  searchFileLabels: document.querySelector("#search-file-labels"),
  searchBoardGrid: document.querySelector("#search-board-grid"),
  searchRankLabels: document.querySelector("#search-rank-labels"),
  searchCaptureActions: document.querySelector("#search-capture-actions"),
  searchToBlackHandButton: document.querySelector("#search-to-black-hand-button"),
  searchToWhiteHandButton: document.querySelector("#search-to-white-hand-button"),
  searchSenteHand: document.querySelector("#search-sente-hand"),
  searchGoteHand: document.querySelector("#search-gote-hand"),
  searchBoardBackButton: document.querySelector("#search-board-back-button"),
  searchBoardResetButton: document.querySelector("#search-board-reset-button"),
  searchBoardTurnButton: document.querySelector("#search-board-turn-button"),
  searchBoardSearchButton: document.querySelector("#search-board-search-button"),
  emptyState: document.querySelector("#empty-state"),
  studyView: document.querySelector("#study-view"),
  turnChip: document.querySelector("#turn-chip"),
  openingChip: document.querySelector("#opening-chip"),
  fileLabels: document.querySelector("#file-labels"),
  boardGrid: document.querySelector("#board-grid"),
  rankLabels: document.querySelector("#rank-labels"),
  senteHand: document.querySelector("#sente-hand"),
  goteHand: document.querySelector("#gote-hand"),
  choiceHead: document.querySelector("#choice-head"),
  evaluationPanel: document.querySelector("#evaluation-panel"),
  evalScore: document.querySelector("#eval-score"),
  branchCount: document.querySelector("#branch-count"),
  choiceNav: document.querySelector("#choice-nav"),
  prevBranchButton: document.querySelector("#prev-branch-button"),
  nextBranchButton: document.querySelector("#next-branch-button"),
  opponentMoveButton: document.querySelector("#opponent-move-button"),
  branchDeleteButton: document.querySelector("#branch-delete-button"),
  replyPanel: document.querySelector("#reply-panel"),
  replyMoveButton: document.querySelector("#reply-move-button"),
  composerPanel: document.querySelector("#composer-panel"),
  composerNote: document.querySelector("#composer-note"),
  composerStatus: document.querySelector("#composer-status"),
  editAddBranchButton: document.querySelector("#edit-add-branch-button"),
  noBranchPanel: document.querySelector("#no-branch-panel"),
  backButton: document.querySelector("#back-button"),
  resetButton: document.querySelector("#reset-button"),
  currentPositionSearchButton: document.querySelector("#current-position-search-button"),
  connectOpeningButton: document.querySelector("#connect-opening-button"),
  deleteBranchButton: document.querySelector("#delete-branch-button")
};

initialize();

function initialize() {
  ensureSelection();
  bindEvents();
  preventBoardDoubleTapZoom();
  render();
}

function bindEvents() {
  on(elements.menuButton, "click", () => setMenuOpen(true));
  on(elements.appbarCopy, "click", openHome);
  on(elements.homeButton, "click", openHome);
  on(elements.closeDrawerButton, "click", () => setMenuOpen(false));
  on(elements.scrim, "click", closeOverlayMenus);
  on(elements.moreButton, "click", toggleMoreMenu);
  on(elements.newOpeningButton, "click", openOpeningSetup);
  on(elements.drawerPositionSearchButton, "click", openPositionSearch);
  on(elements.homeNewOpeningButton, "click", openOpeningSetup);
  on(elements.homePositionSearchButton, "click", openPositionSearch);
  on(elements.homeExportModeButton, "click", openHomeExportMode);
  on(elements.homeDeleteModeButton, "click", openHomeDeleteMode);
  on(elements.homeExportSelectedButton, "click", exportSelectedHomeOpenings);
  on(elements.homeDeleteSelectedButton, "click", deleteSelectedHomeOpenings);
  on(elements.homeExportCancelButton, "click", closeHomeExportMode);
  on(elements.positionSearchButton, "click", searchPositionFromInput);
  on(elements.searchBoardBackButton, "click", openHome);
  on(elements.searchBoardResetButton, "click", resetSearchBoard);
  on(elements.searchBoardTurnButton, "click", toggleSearchBoardTurn);
  on(elements.searchBoardSearchButton, "click", searchPositionFromBoard);
  on(elements.searchFlippedButton, "click", () => togglePositionSearchOption("includeFlipped"));
  on(elements.searchToBlackHandButton, "click", () => moveSearchSelectionToHand(COLOR.Black));
  on(elements.searchToWhiteHandButton, "click", () => moveSearchSelectionToHand(COLOR.White));
  on(elements.moreDeleteButton, "click", () => {
    state.moreMenuOpen = false;
    deleteCurrentOpeningFromMenu();
  });
  on(elements.renameOpeningButton, "click", renameCurrentOpening);
  on(elements.chooseBlackButton, "click", () => chooseOpeningSide("black"));
  on(elements.chooseWhiteButton, "click", () => chooseOpeningSide("white"));
  on(elements.saveOpeningButton, "click", createOpening);
  on(elements.cancelOpeningButton, "click", closeOpeningSetup);
  on(elements.addBranchButton, "click", toggleEditMode);
  on(elements.emptyAddBranchButton, "click", openEditMode);
  on(elements.editAddBranchButton, "click", startBranchComposer);
  on(elements.cancelComposeButton, "click", closeEditMode);
  on(elements.exportButton, "click", exportCurrentOpening);
  on(elements.importInput, "change", importOpenings);
  on(elements.homeSearchInput, "input", (event) => {
    state.homeSearch = event.target.value.trim().toLowerCase();
    renderHome();
  });
  on(elements.prevBranchButton, "click", () => changeBranch(-1));
  on(elements.nextBranchButton, "click", () => changeBranch(1));
  on(elements.opponentMoveButton, "click", editSelectedBranchNote);
  on(elements.branchDeleteButton, "click", deleteSelectedBranchQuick);
  on(elements.replyMoveButton, "click", advanceBranch);
  on(elements.backButton, "click", goBack);
  on(elements.resetButton, "click", resetPath);
  on(elements.currentPositionSearchButton, "click", searchCurrentPosition);
  on(elements.connectOpeningButton, "click", connectToAnotherOpening);
  on(elements.deleteBranchButton, "click", deleteSelectedBranchQuick);
  on(elements.composerNote, "input", updateActiveNodeNote);
}

function on(element, eventName, handler) {
  if (element) {
    element.addEventListener(eventName, handler);
  }
}

function updateActiveNodeNote(event) {
  const opening = getSelectedOpening();
  const target = getActiveMemoTarget();
  if (!opening || !target) {
    return;
  }

  target.note = event.target.value;
  opening.updatedAt = new Date().toISOString();
  saveOpenings();
}

function getActiveMemoTarget() {
  const node = getActiveNode();
  if (!node) {
    return null;
  }

  const revealedBranch = getRevealedBranch(node);
  if (revealedBranch) {
    return revealedBranch;
  }

  if (!state.composer) {
    return node.branches[state.selectedBranchIndex] || null;
  }

  if (state.composer.mode === "root-player") {
    return node;
  }

  if (state.composer.mode === "branch") {
    if (state.composer.branch.opponentMove || state.composer.branch.replyMove) {
      return state.composer.branch;
    }
    return node.branches[state.selectedBranchIndex] || null;
  }

  return null;
}

function syncComposerNote(note = "", disabled = false) {
  if (!elements.composerNote) {
    return;
  }
  elements.composerNote.value = note;
  elements.composerNote.disabled = disabled;
}

function preventBoardDoubleTapZoom() {
  let lastTouchEndAt = 0;
  const blockDoubleTapZoom = (event) => {
    if (event.target.closest(".board-grid, .hand-pieces")) {
      return;
    }
    const now = Date.now();
    if (now - lastTouchEndAt <= 350) {
      event.preventDefault();
    }
    lastTouchEndAt = now;
  };

  document.addEventListener("touchend", blockDoubleTapZoom, { passive: false });
  document.addEventListener("dblclick", (event) => event.preventDefault(), { passive: false });

  [elements.boardGrid, elements.searchBoardGrid].forEach((board) => {
    if (!board) {
      return;
    }
    board.addEventListener("touchend", handleBoardTouchEnd, { passive: false, capture: true });
    board.addEventListener("dblclick", (event) => event.preventDefault());
  });
}

function addTapHandler(element, handler) {
  element.addEventListener("click", handler);
}

function addTouchTapHandler(element, handler) {
  addTapHandler(element, handler);
  element.addEventListener("touchend", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (!element.disabled) {
      handler(event);
    }
  }, { passive: false });
}

function handleBoardTouchEnd(event) {
  const touch = event.changedTouches?.[0];
  const touchedElement = touch ? document.elementFromPoint(touch.clientX, touch.clientY) : event.target;
  const square = touchedElement?.closest(".board-square");
  if (!square) {
    return;
  }

  const x = Number(square.dataset.x);
  const y = Number(square.dataset.y);
  if (!x || !y) {
    return;
  }

  event.preventDefault();
  event.stopPropagation();

  if (event.currentTarget === elements.searchBoardGrid) {
    handleSearchBoardClick(x, y);
    return;
  }

  const node = getActiveNode();
  const revealedBranch = node ? getRevealedBranch(node) : null;
  if (state.composer) {
    handleBoardSquareClick(x, y);
  } else if (revealedBranch) {
    handleReplyBoardClick(x, y);
  } else if (hasInteractiveBranches()) {
    handleBrowseBoardClick(x, y);
  }
}

function loadOpenings() {
  const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!saved) {
    return createSampleOpenings();
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      return createSampleOpenings();
    }
    const normalized = parsed.map(normalizeOpening).filter(Boolean);
    return normalized.length ? normalized : createSampleOpenings();
  } catch {
    return createSampleOpenings();
  }
}

function saveOpenings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state.openings));
}

function createSampleOpenings() {
  const rootId = crypto.randomUUID();
  const nextA = crypto.randomUUID();
  const nextB = crypto.randomUUID();

  return [
    {
      id: crypto.randomUUID(),
      name: "居飛車 基本分岐",
      playerSide: "black",
      rootNodeId: rootId,
      updatedAt: new Date().toISOString(),
      nodes: {
        [rootId]: {
          id: rootId,
          sfen: SAMPLE_ROOT_SFEN,
          eval: null,
          note: "",
          branches: [
            {
              id: crypto.randomUUID(),
              opponentMove: "△8四歩",
              replyMove: "▲2五歩",
              note: "相手が飛車先を伸ばした形。盤面で△8四歩を選ぶと、こちらの▲2五歩を光らせて確認できます。",
              nextNodeId: nextA
            },
            {
              id: crypto.randomUUID(),
              opponentMove: "△3四歩",
              replyMove: "▲7六歩",
              note: "角道を開けてきた形。盤面で△3四歩を選ぶと、こちらの▲7六歩を光らせて確認できます。",
              nextNodeId: nextB
            }
          ]
        },
        [nextA]: {
          id: nextA,
          sfen: "lnsgkgsnl/1r5b1/p1ppppppp/1p7/7P1/9/PPPPPPP1P/1B5R1/LNSGKGSNL w - 4",
          eval: null,
          note: "",
          branches: []
        },
        [nextB]: {
          id: nextB,
          sfen: "lnsgkgsnl/1r5b1/pppppp1pp/6p2/9/2P4P1/PP1PPPP1P/1B5R1/LNSGKGSNL w - 4",
          eval: null,
          note: "",
          branches: []
        }
      }
    }
  ];
}

function normalizeOpening(opening) {
  if (!opening || typeof opening !== "object") {
    return null;
  }

  const nodes = {};
  const rawNodes = opening.nodes && typeof opening.nodes === "object" ? opening.nodes : {};

  Object.values(rawNodes).forEach((node) => {
    if (!node || !node.id) {
      return;
    }

    nodes[String(node.id)] = {
      id: String(node.id),
      sfen: normalizeKnownSfen(typeof node.sfen === "string" && node.sfen.trim() ? node.sfen.trim() : INITIAL_SFEN),
      eval: normalizeEvaluation(node.eval),
      note: String(node.note || ""),
      branches: Array.isArray(node.branches)
        ? node.branches.map((branch) => ({
            id: String(branch.id || crypto.randomUUID()),
            opponentMove: String(branch.opponentMove || "").trim(),
            replyMove: String(branch.replyMove || "").trim(),
            opponentMoveFrom: normalizeMoveSource(branch.opponentMoveFrom),
            replyMoveFrom: normalizeMoveSource(branch.replyMoveFrom),
            note: String(branch.note || ""),
            nextOpeningId: String(branch.nextOpeningId || opening.id || ""),
            nextNodeId: String(branch.nextNodeId || "")
          }))
        : []
    };
  });

  const rootNodeId = String(opening.rootNodeId || Object.keys(nodes)[0] || crypto.randomUUID());
  if (!nodes[rootNodeId]) {
    nodes[rootNodeId] = { id: rootNodeId, sfen: INITIAL_SFEN, eval: null, note: "", branches: [] };
  }

  if (Object.values(nodes).some((node) => hasNifu(node.sfen))) {
    return null;
  }

  return {
    id: String(opening.id || crypto.randomUUID()),
    name: String(opening.name || "新しい定跡"),
    playerSide: opening.playerSide === "white" ? "white" : "black",
    rootNodeId,
    updatedAt: String(opening.updatedAt || new Date().toISOString()),
    nodes
  };
}

function normalizeKnownSfen(sfen) {
  return BROKEN_SAMPLE_SFENS.get(sfen) || sfen;
}

function hasNifu(sfen) {
  const board = String(sfen || "").trim().split(/\s+/)[0];
  if (!board) {
    return false;
  }

  const grid = parseSfenBoard(board);
  const blackPawnFiles = Array(9).fill(0);
  const whitePawnFiles = Array(9).fill(0);

  grid.forEach((rank) => {
    rank.forEach((piece, fileIndex) => {
      if (piece === "P") {
        blackPawnFiles[fileIndex] += 1;
      } else if (piece === "p") {
        whitePawnFiles[fileIndex] += 1;
      }
    });
  });

  return blackPawnFiles.some((count) => count > 1) || whitePawnFiles.some((count) => count > 1);
}

function normalizeEvaluation(value) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") {
    return { score: value };
  }

  if (typeof value === "object") {
    const score = Number(value.score);
    return Number.isFinite(score) ? { score } : null;
  }

  const score = Number(String(value).trim());
  return Number.isFinite(score) ? { score } : null;
}

function ensureSelection() {
  const selectedExists = state.openings.some((opening) => opening.id === state.selectedOpeningId);

  if (!state.openings.length) {
    state.selectedOpeningId = null;
    state.activeNodeId = null;
    state.selectedBranchIndex = 0;
    state.revealedBranchId = null;
    state.browseSelection = null;
    state.replySelection = null;
    state.path = [];
    state.editMode = false;
    state.composer = null;
    return;
  }

  if (!selectedExists) {
    const opening = state.openings[0];
    state.selectedOpeningId = opening.id;
    state.activeNodeId = opening.rootNodeId;
    state.selectedBranchIndex = 0;
    state.revealedBranchId = null;
    state.browseSelection = null;
    state.replySelection = null;
    state.path = [];
    state.editMode = false;
    state.composer = null;
    return;
  }

  const opening = getSelectedOpening();
  if (!opening || !opening.nodes[state.activeNodeId]) {
    state.activeNodeId = opening ? opening.rootNodeId : null;
    state.selectedBranchIndex = 0;
    state.revealedBranchId = null;
    state.browseSelection = null;
    state.replySelection = null;
    state.path = [];
    state.editMode = false;
    state.composer = null;
  }
}

function getHomeFilteredOpenings() {
  const query = state.homeSearch;
  if (!query) {
    return state.openings;
  }

  return state.openings.filter((opening) => opening.name.toLowerCase().includes(query));
}

function getSelectedOpening() {
  return state.openings.find((opening) => opening.id === state.selectedOpeningId) || null;
}

function getActiveNode() {
  const opening = getSelectedOpening();
  return opening ? opening.nodes[state.activeNodeId] || null : null;
}

function getCurrentViewSfen() {
  const node = getActiveNode();
  if (!node) {
    return "";
  }
  if (state.composer) {
    return state.composer.boardSfen;
  }
  return getBoardSfenForView(node, getRevealedBranch(node));
}

function render() {
  renderChrome();
  renderOpeningList();
  renderHome();
  renderPositionSearch();
  renderStudy();
}

function renderChrome() {
  const opening = getSelectedOpening();
  elements.body.dataset.menuOpen = String(state.menuOpen);
  elements.body.dataset.moreMenuOpen = String(state.moreMenuOpen);
  elements.body.dataset.editMode = String(state.editMode);
  elements.body.dataset.screen = state.screen;
  elements.body.dataset.revealedBranch = String(Boolean(state.revealedBranchId));
  elements.moreMenu.classList.toggle("hidden", !state.moreMenuOpen);
  elements.moreButton.disabled = state.screen === "home" || state.screen === "search";
  elements.addBranchButton.textContent = state.editMode ? "×" : "+";
  elements.addBranchButton.setAttribute("aria-label", state.editMode ? "入力をやめる" : "この先を入力");
  elements.appbarTitle.textContent = state.screen === "home" ? "ホーム" : state.screen === "search" ? "局面検索" : opening ? opening.name : "研究画面";
  elements.openingSetupSheet.classList.toggle("hidden", !state.openingSetup);
  elements.chooseBlackButton.classList.toggle("active", state.openingSetup?.playerSide === "black");
  elements.chooseWhiteButton.classList.toggle("active", state.openingSetup?.playerSide === "white");
}

function renderOpeningList() {
  elements.openingList.innerHTML = "";

  getRecentMenuOpenings().forEach((opening) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `opening-item${opening.id === state.selectedOpeningId ? " active" : ""}`;
    button.innerHTML = `<strong>${escapeHtml(opening.name)}</strong><span>${formatSideLabel(opening.playerSide)} ・ ${countBranches(opening)} 手順</span>`;
    button.addEventListener("click", () => selectOpening(opening.id));
    elements.openingList.append(button);
  });
}

function getRecentMenuOpenings() {
  return state.openings
    .slice()
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5);
}

function renderHome() {
  if (!elements.homeView || !elements.homeOpeningList) {
    return;
  }

  elements.homeView.classList.toggle("hidden", state.screen !== "home");
  elements.homeOpeningList.innerHTML = "";
  const selectionMode = state.homeSelectionMode || (state.homeExportMode ? "export" : null);
  state.homeExportMode = Boolean(selectionMode);
  state.homeSelectedOpeningIds.forEach((id) => {
    if (!state.openings.some((opening) => opening.id === id)) {
      state.homeSelectedOpeningIds.delete(id);
    }
  });
  elements.homeExportModeButton.classList.toggle("hidden", Boolean(selectionMode));
  elements.homeDeleteModeButton.classList.toggle("hidden", Boolean(selectionMode));
  elements.homeExportSelectedButton.classList.toggle("hidden", selectionMode !== "export");
  elements.homeDeleteSelectedButton.classList.toggle("hidden", selectionMode !== "delete");
  elements.homeExportCancelButton.classList.toggle("hidden", !selectionMode);
  elements.homeExportSelectedButton.disabled = state.homeSelectedOpeningIds.size === 0;
  elements.homeDeleteSelectedButton.disabled = state.homeSelectedOpeningIds.size === 0;

  const homeOpenings = getHomeFilteredOpenings();
  if (!homeOpenings.length) {
    const empty = document.createElement("p");
    empty.className = "home-empty-message";
    empty.textContent = "該当する定跡がありません";
    elements.homeOpeningList.append(empty);
    return;
  }

  homeOpenings.forEach((opening) => {
    const card = document.createElement("div");
    card.className = `home-opening-card${selectionMode ? " export-mode" : ""}`;
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.className = "home-opening-check";
    checkbox.checked = state.homeSelectedOpeningIds.has(opening.id);
    checkbox.setAttribute("aria-label", `${opening.name}を選択`);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) {
        state.homeSelectedOpeningIds.add(opening.id);
      } else {
        state.homeSelectedOpeningIds.delete(opening.id);
      }
      renderHome();
    });

    const button = document.createElement("button");
    button.type = "button";
    button.className = "home-opening-main";
    button.innerHTML = `
      <span>${formatSideLabel(opening.playerSide)}</span>
      <strong>${escapeHtml(opening.name)}</strong>
      <small>${countBranches(opening)} 手順</small>
    `;
    button.addEventListener("click", () => {
      if (selectionMode) {
        checkbox.checked = !checkbox.checked;
        checkbox.dispatchEvent(new Event("change"));
        return;
      }
      selectOpening(opening.id, false);
    });
    if (selectionMode) {
      card.append(checkbox);
    }
    card.append(button);
    elements.homeOpeningList.append(card);
  });
}

function renderPositionSearch() {
  if (!elements.positionSearchView) {
    return;
  }
  elements.positionSearchView.classList.toggle("hidden", state.screen !== "search");
  if (state.screen !== "search") {
    return;
  }
  renderSearchBoard();
  renderPositionSearchOptions();
  renderPositionSearchResults();
}

function renderPositionSearchOptions() {
  elements.searchFlippedButton?.classList.toggle("active", state.positionSearchOptions.includeFlipped);
}

function renderSearchBoard() {
  if (!elements.searchBoardGrid) {
    return;
  }

  const game = createGameFromSfen(state.searchBoardSfen);
  const coordinates = getBoardCoordinates("black");
  elements.searchBoardTurnButton.textContent = `手番: ${game.turn === COLOR.Black ? "先手" : "後手"}`;
  renderSearchHands(game);
  renderSearchCaptureActions();
  renderBoardCoordinates(elements.searchFileLabels, elements.searchRankLabels, coordinates);
  elements.searchBoardGrid.innerHTML = "";

  coordinates.ranks.forEach((y) => {
    coordinates.files.forEach((x) => {
      const square = document.createElement("button");
      square.type = "button";
      square.className = "board-square";
      square.dataset.x = String(x);
      square.dataset.y = String(y);
      decorateSearchSquare(square, x, y, game);
      addTapHandler(square, () => handleSearchBoardClick(x, y));

      const piece = game.get(x, y);
      if (piece) {
        const pieceElement = document.createElement("span");
        const classes = ["piece", piece.color === COLOR.White ? "gote" : "sente"];
        if (isPromoted(piece.kind)) {
          classes.push("promoted");
        }
        pieceElement.className = classes.join(" ");
        pieceElement.textContent = window.JKF.Shogi.kindToString(piece.kind, true);
        square.append(pieceElement);
      }

      elements.searchBoardGrid.append(square);
    });
  });
}

function renderSearchHands(game) {
  renderSearchHandLine(elements.searchSenteHand, game, COLOR.Black);
  renderSearchHandLine(elements.searchGoteHand, game, COLOR.White);
}

function renderSearchHandLine(container, game, color) {
  if (!container) {
    return;
  }

  const summary = game.getHandsSummary(color);
  const kinds = KIND_ORDER.filter((kind) => summary[kind] > 0);
  container.innerHTML = "";

  if (!kinds.length) {
    container.textContent = "なし";
    return;
  }

  kinds.forEach((kind) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hand-piece-button selectable";
    if (state.searchBoardSelection?.hand && state.searchBoardSelection.kind === kind && state.searchBoardSelection.color === color) {
      button.classList.add("selected");
    }
    button.textContent = `${window.JKF.Shogi.kindToString(kind, true)}${summary[kind] > 1 ? summary[kind] : ""}`;
    addTouchTapHandler(button, () => handleSearchHandClick(kind, color));
    container.append(button);
  });
}

function renderSearchCaptureActions() {
  const selected = state.searchBoardSelection;
  const shouldShow = Boolean(selected?.from);
  elements.searchCaptureActions?.classList.toggle("hidden", !shouldShow);
}

function decorateSearchSquare(square, x, y, game) {
  const selection = state.searchBoardSelection;
  const piece = game.get(x, y);

  if (selection?.hand) {
    if (!piece) {
      square.classList.add("destination");
    }
    return;
  }

  if (!selection) {
    if (piece) {
      square.classList.add("selectable");
    }
    return;
  }

  if (selection.from.x === x && selection.from.y === y) {
    square.classList.add("selected");
    return;
  }

  square.classList.add("destination");
}

function renderPositionSearchResults() {
  if (!elements.positionSearchResults) {
    return;
  }

  elements.positionSearchResults.innerHTML = "";
  if (!state.positionSearchResults.length) {
    const empty = document.createElement("p");
    empty.textContent = "検索結果はここに表示されます";
    elements.positionSearchResults.append(empty);
    return;
  }

  state.positionSearchResults.forEach((match) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "position-result";
    button.innerHTML = `
      <strong>${escapeHtml(match.openingName)}</strong>
      <span>${escapeHtml(matchLabel(match))}</span>
    `;
    button.addEventListener("click", () => openPositionMatch(match));
    elements.positionSearchResults.append(button);
  });
}

function renderStudy() {
  const opening = getSelectedOpening();
  const node = getActiveNode();

  if (state.screen === "home") {
    elements.emptyState.classList.add("hidden");
    elements.studyView.classList.add("hidden");
    return;
  }

  if (state.screen === "search") {
    elements.emptyState.classList.add("hidden");
    elements.studyView.classList.add("hidden");
    return;
  }

  if (!opening || !node) {
    elements.emptyState.classList.remove("hidden");
    elements.studyView.classList.add("hidden");
    return;
  }

  elements.emptyState.classList.add("hidden");
  elements.studyView.classList.remove("hidden");

  const previewBranch = getRevealedBranch(node);
  const boardSfen = getBoardSfenForStudy(node, previewBranch);
  elements.turnChip.textContent = formatTurn(boardSfen);
  elements.openingChip.textContent = state.editMode
    ? `${formatSideLabel(opening.playerSide)} ・ 合計${getPlayedMoveCount(boardSfen)}手`
    : formatSideLabel(opening.playerSide);

  renderBoard(boardSfen, opening.playerSide);
  renderEvaluationPanel(node);
  renderBranchArea(node.branches);
  elements.backButton.disabled = state.path.length === 0 && !state.revealedBranchId && !state.composer;
  elements.resetButton.disabled = state.path.length === 0 || Boolean(state.composer);
  elements.currentPositionSearchButton.disabled = Boolean(state.composer);
  elements.connectOpeningButton.disabled = false;
  elements.deleteBranchButton.disabled = !getDeletionBranch(node);
}

function getBoardSfenForStudy(node, previewBranch) {
  if (!state.composer) {
    return getBoardSfenForView(node, previewBranch);
  }
  return state.composer.boardSfen;
}

function renderBoard(sfen, playerSide = "black") {
  const game = createGameFromSfen(sfen);
  const node = getActiveNode();
  const revealedBranch = node ? getRevealedBranch(node) : null;
  const coordinates = getBoardCoordinates(playerSide);
  renderBoardCoordinates(elements.fileLabels, elements.rankLabels, coordinates);
  elements.boardGrid.innerHTML = "";

  coordinates.ranks.forEach((y) => {
    coordinates.files.forEach((x) => {
      const square = document.createElement("button");
      square.type = "button";
      square.className = "board-square";
      square.dataset.x = String(x);
      square.dataset.y = String(y);

      if (state.composer) {
        decorateComposerSquare(square, x, y, game);
        addTapHandler(square, () => handleBoardSquareClick(x, y));
      } else if (revealedBranch) {
        decorateReplySquare(square, x, y, game, revealedBranch);
        addTapHandler(square, () => handleReplyBoardClick(x, y));
      } else if (hasInteractiveBranches()) {
        decorateBrowseSquare(square, x, y, game);
        addTapHandler(square, () => handleBrowseBoardClick(x, y));
      } else {
        square.disabled = true;
      }

      const piece = game.get(x, y);
      if (piece) {
        const pieceElement = document.createElement("span");
        const classes = ["piece", isPieceUpsideDown(piece.color, playerSide) ? "gote" : "sente"];
        if (isPromoted(piece.kind)) {
          classes.push("promoted");
        }
        pieceElement.className = classes.join(" ");
        pieceElement.textContent = window.JKF.Shogi.kindToString(piece.kind, true);
        square.append(pieceElement);
      }

      elements.boardGrid.append(square);
    });
  });

  renderHands(game);
}

function renderEvaluationPanel(node) {
  if (!elements.evaluationPanel) {
    return;
  }

  elements.evaluationPanel.classList.toggle("hidden", Boolean(state.composer));
  if (state.composer) {
    return;
  }

  const evaluation = normalizeEvaluation(node?.eval);
  elements.evaluationPanel.classList.toggle("hidden", !evaluation || evaluation.score === null);
  if (!evaluation || evaluation.score === null) {
    return;
  }
  elements.evalScore.textContent = formatEvaluationScore(evaluation.score);
}

function renderHands(game) {
  renderHandLine(elements.senteHand, game, COLOR.Black);
  renderHandLine(elements.goteHand, game, COLOR.White);
}

function renderHandLine(container, game, color) {
  const summary = game.getHandsSummary(color);
  const kinds = KIND_ORDER.filter((kind) => summary[kind] > 0);
  container.innerHTML = "";

  if (!kinds.length) {
    container.textContent = "なし";
    return;
  }

  const selectableKinds = getSelectableHandKinds(game, color);
  kinds.forEach((kind) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "hand-piece-button";
    button.textContent = `${window.JKF.Shogi.kindToString(kind, true)}${summary[kind] > 1 ? summary[kind] : ""}`;
    button.disabled = !selectableKinds.includes(kind);
    if (selectableKinds.includes(kind)) {
      button.classList.add("selectable");
      addTouchTapHandler(button, () => handleHandClick(kind, color));
    }
    if (isSelectedHandKind(kind, color)) {
      button.classList.add("selected");
    }
    container.append(button);
  });
}

function getSelectableHandKinds(game, color) {
  if (color !== game.turn) {
    return [];
  }

  if (state.composer) {
    return uniqueKinds(game.getDropsBy(color));
  }

  const node = getActiveNode();
  const revealedBranch = node ? getRevealedBranch(node) : null;
  if (revealedBranch) {
    const move = findBranchMove(game, revealedBranch, "reply");
    return move && !move.from ? [move.kind] : [];
  }

  if (!node || !node.branches.length) {
    return [];
  }

  return uniqueKinds(getBranchMoves(game, node.branches).filter((move) => move.drop));
}

function uniqueKinds(moves) {
  return [...new Set(moves.map((move) => move.kind).filter(Boolean))];
}

function getLegalMovesFrom(game, x, y) {
  return game.getMovesFrom(x, y).flatMap((move) => expandPromotionMove(game, move));
}

function expandPromotionMove(game, move) {
  if (!move.from) {
    return [move];
  }

  const piece = game.get(move.from.x, move.from.y);
  if (!piece || !canPiecePromote(piece.kind) || !isInPromotionArea(piece.color, move.from.y, move.to.y)) {
    return [{ ...move, promote: false }];
  }

  if (mustPromote(piece.kind, piece.color, move.to.y)) {
    return [{ ...move, promote: true }];
  }

  return [
    { ...move, promote: false },
    { ...move, promote: true }
  ];
}

function choosePromotionMove(candidates) {
  if (!candidates.length) {
    return null;
  }
  if (candidates.length === 1) {
    return candidates[0];
  }

  const promoteMove = candidates.find((move) => move.promote);
  const plainMove = candidates.find((move) => !move.promote);
  if (promoteMove && plainMove) {
    return window.confirm("成りますか？") ? promoteMove : plainMove;
  }
  return candidates[0];
}

function canPiecePromote(kind) {
  return Boolean(window.JKF.Shogi.Piece?.canPromote(kind));
}

function promoteKind(kind) {
  return window.JKF.Shogi.Piece?.promote(kind) || kind;
}

function isInPromotionArea(color, fromY, toY) {
  return color === COLOR.Black
    ? fromY <= 3 || toY <= 3
    : fromY >= 7 || toY >= 7;
}

function mustPromote(kind, color, toY) {
  if (kind === "FU" || kind === "KY") {
    return color === COLOR.Black ? toY === 1 : toY === 9;
  }
  if (kind === "KE") {
    return color === COLOR.Black ? toY <= 2 : toY >= 8;
  }
  return false;
}

function isSelectedHandKind(kind, color) {
  return (state.composer?.selected?.drop && state.composer.selected.kind === kind && state.composer.selected.color === color)
    || (state.browseSelection?.drop && state.browseSelection.kind === kind && state.browseSelection.color === color)
    || (state.replySelection?.drop && state.replySelection.kind === kind && state.replySelection.color === color);
}

function getRevealedBranch(node) {
  if (!node || !state.revealedBranchId) {
    return null;
  }
  return node.branches.find((branch) => branch.id === state.revealedBranchId) || null;
}

function getBoardSfenForView(node, branch) {
  if (!branch) {
    return node.sfen;
  }

  if (isConnectionBranch(branch)) {
    return node.sfen;
  }

  try {
    const game = createGameFromSfen(node.sfen);
    const move = findBranchMove(game, branch, "opponent");
    if (!move) {
      return node.sfen;
    }
    applyMoveToGame(game, move);
    return game.toSFENString(1);
  } catch {
    return node.sfen;
  }
}

function hasInteractiveBranches() {
  const node = getActiveNode();
  return Boolean(node && node.branches.length);
}

function decorateComposerSquare(square, x, y, game) {
  const composer = state.composer;
  if (!composer) {
    return;
  }

  const node = getActiveNode();
  const revealedBranch = node ? getRevealedBranch(node) : null;
  if (composer.stage === "registered-reply" && revealedBranch) {
    decorateRegisteredReplySquare(square, x, y, game, revealedBranch);
    return;
  }

  const piece = game.get(x, y);
  const isDropDestination = composer.selected?.drop && composer.legalMoves.some((move) => move.to.x === x && move.to.y === y);
  if (isDropDestination) {
    square.classList.add("destination");
    return;
  }

  const isRegisteredOpponentSource =
    composer.stage === "opponent" &&
    !composer.selected &&
    piece &&
    piece.color === game.turn &&
    hasRegisteredOpponentMoveFromSquare(node, game, x, y);

  const isSelectable =
    !composer.selected &&
    piece &&
    piece.color === game.turn &&
    getLegalMovesFrom(game, x, y).length > 0;
  const isSelected = composer.selected && composer.selected.x === x && composer.selected.y === y;
  const isDestination = composer.legalMoves.some((move) => move.to.x === x && move.to.y === y);

  if (isSelected) {
    square.classList.add("selected");
  } else if (isDestination) {
    square.classList.add("destination");
  } else if (isRegisteredOpponentSource) {
    square.classList.add("registered-opponent");
  } else if (isSelectable) {
    square.classList.add("selectable");
  }
}

function decorateBrowseSquare(square, x, y, game) {
  const node = getActiveNode();
  if (!node || !node.branches.length) {
    square.disabled = true;
    return;
  }

  const branchMoves = getBranchMoves(game, node.branches);
  const selection = state.browseSelection;
  const piece = game.get(x, y);

  if (selection?.drop) {
    const isDestination = selection.moves.some((move) => move.to.x === x && move.to.y === y);
    if (isDestination) {
      square.classList.add("destination");
      return;
    }
    square.disabled = true;
    return;
  }

  if (!selection) {
    const isSelectable = branchMoves.some((move) => move.from && move.from.x === x && move.from.y === y);
    if (isSelectable) {
      square.classList.add("selectable");
    }
    return;
  }

  if (selection.from.x === x && selection.from.y === y) {
    square.classList.add("selected");
    return;
  }

  const isDestination = selection.moves.some((move) => move.to.x === x && move.to.y === y);
  if (isDestination) {
    square.classList.add("destination");
    return;
  }

  const isSelectable = piece && piece.color === game.turn && branchMoves.some((move) => move.from && move.from.x === x && move.from.y === y);
  if (isSelectable) {
    square.classList.add("selectable");
  }
}

function decorateReplySquare(square, x, y, game, branch) {
  if (isConnectionBranch(branch)) {
    square.disabled = true;
    return;
  }

  const move = findBranchMove(game, branch, "reply");
  if (!move) {
    square.disabled = true;
    return;
  }

  const selection = state.replySelection;
  if (!move.from) {
    if (selection?.drop && move.to.x === x && move.to.y === y) {
      square.classList.add("destination");
      return;
    }
    square.disabled = true;
    return;
  }

  const isSource = move.from.x === x && move.from.y === y;
  const isDestination = move.to.x === x && move.to.y === y;

  if (!selection && isSource) {
    square.classList.add("selectable");
    return;
  }

  if (selection && isSource) {
    square.classList.add("selected");
    return;
  }

  if (selection && isDestination) {
    square.classList.add("destination");
    return;
  }

  square.disabled = true;
}

function decorateRegisteredReplySquare(square, x, y, game, branch) {
  if (isConnectionBranch(branch)) {
    return;
  }

  const replyMove = findBranchMove(game, branch, "reply");
  if (!replyMove) {
    return;
  }

  const selected = state.composer?.selected;
  if (replyMove.from && replyMove.from.x === x && replyMove.from.y === y && !selected) {
    square.classList.add("registered-reply");
    return;
  }

  if (replyMove.from && replyMove.from.x === x && replyMove.from.y === y && selected) {
    square.classList.add("selected");
    return;
  }

  if (selected && replyMove.to.x === x && replyMove.to.y === y) {
    square.classList.add("destination");
    return;
  }

  if (!replyMove.from && replyMove.to.x === x && replyMove.to.y === y && !selected) {
    square.classList.add("registered-reply");
  }
}

function applyMoveToGame(game, move) {
  if (move.from) {
    game.move(move.from.x, move.from.y, move.to.x, move.to.y, Boolean(move.promote));
    return;
  }
  game.drop(move.to.x, move.to.y, move.kind);
}

function serializeMoveSource(move) {
  if (!move?.from) {
    return null;
  }
  return { x: move.from.x, y: move.from.y };
}

function normalizeMoveSource(source) {
  if (!source || typeof source !== "object") {
    return null;
  }
  const x = Number(source.x);
  const y = Number(source.y);
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 1 || x > 9 || y < 1 || y > 9) {
    return null;
  }
  return { x, y };
}

function isSameMoveSource(left, right) {
  const normalizedLeft = normalizeMoveSource(left);
  const normalizedRight = normalizeMoveSource(right);
  if (!normalizedLeft && !normalizedRight) {
    return true;
  }
  return Boolean(
    normalizedLeft &&
    normalizedRight &&
    normalizedLeft.x === normalizedRight.x &&
    normalizedLeft.y === normalizedRight.y
  );
}

function renderBranchArea(branches) {
  if (state.composer) {
    renderComposer();
    return;
  }

  renderBranchBrowser(branches);
}

function renderEditorMenu() {
  const memoTarget = getActiveMemoTarget();
  elements.choiceHead.classList.remove("hidden");
  elements.choiceNav.classList.add("hidden");
  elements.noBranchPanel.classList.add("hidden");
  elements.replyPanel.classList.add("hidden");
  elements.opponentMoveButton.classList.add("hidden");
  elements.branchDeleteButton.classList.add("hidden");
  elements.composerPanel.classList.remove("hidden");
  elements.editAddBranchButton.classList.add("hidden");
  elements.cancelComposeButton.textContent = "編集を終わる";
  elements.branchCount.textContent = "編集";
  syncComposerNote(memoTarget?.note || "", !memoTarget);
  elements.composerStatus.textContent = "";
}

function renderComposer() {
  const opening = getSelectedOpening();
  const node = getActiveNode();
  const memoTarget = getActiveMemoTarget();
  const playerSide = opening?.playerSide || "black";
  const opponentSide = getOpponentSide(playerSide);
  const branchForDeletion = getComposerDeletionBranch(node);

  elements.choiceHead.classList.remove("hidden");
  elements.choiceNav.classList.add("hidden");
  elements.noBranchPanel.classList.add("hidden");
  elements.replyPanel.classList.toggle("hidden", !branchForDeletion);
  elements.replyMoveButton.textContent = branchForDeletion ? getBranchDeleteTargetLabel(branchForDeletion) : "";
  elements.opponentMoveButton.classList.toggle("hidden", !branchForDeletion);
  elements.opponentMoveButton.textContent = branchForDeletion ? getBranchDeleteTargetLabel(branchForDeletion) : "";
  elements.branchDeleteButton.classList.add("hidden");
  elements.branchDeleteButton.disabled = true;
  elements.branchDeleteButton.textContent = "";
  elements.composerPanel.classList.remove("hidden");
  syncComposerNote(memoTarget?.note || "", !memoTarget);
  elements.editAddBranchButton.classList.add("hidden");
  elements.cancelComposeButton.textContent = "入力をやめる";

  if (state.composer.mode === "root-player") {
    elements.branchCount.textContent = `${formatSideLabel(playerSide)}の初手`;
    elements.composerStatus.textContent = "";
    return;
  }

  if (state.composer.stage === "opponent") {
    elements.branchCount.textContent = `${formatSideLabel(opponentSide)}の手`;
    elements.composerStatus.textContent = branchForDeletion ? getBranchDeleteTargetLabel(branchForDeletion) : "";
    return;
  }

  if (state.composer.stage === "registered-reply") {
    elements.choiceHead.classList.add("hidden");
    elements.opponentMoveButton.classList.add("hidden");
    elements.replyPanel.classList.add("hidden");
    elements.composerPanel.classList.add("hidden");
    elements.branchCount.textContent = "";
    elements.composerStatus.textContent = "";
    return;
  }

  elements.branchCount.textContent = `${formatSideLabel(playerSide)}の手`;
  elements.composerStatus.textContent = state.composer.branch.opponentMove;
}

function renderBranchBrowser(branches) {
  const hasBranches = branches.length > 0;
  const node = getActiveNode();
  const branch = node ? getVisibleBranch(node) : null;
  const selectedBranch = node ? getRevealedBranch(node) || node.branches[state.selectedBranchIndex] : null;
  const isRevealed = Boolean(branch);

  elements.choiceHead.classList.add("hidden");
  elements.choiceNav.classList.add("hidden");
  elements.composerPanel.classList.toggle("hidden", !selectedBranch);
  elements.editAddBranchButton.classList.add("hidden");
  elements.cancelComposeButton.textContent = "入力をやめる";
  elements.noBranchPanel.classList.toggle("hidden", hasBranches);
  elements.opponentMoveButton.classList.toggle("hidden", !state.editMode || !selectedBranch);
  elements.branchDeleteButton.classList.toggle("hidden", !state.editMode || !selectedBranch);
  elements.branchDeleteButton.disabled = !state.editMode || !selectedBranch;
  elements.prevBranchButton.disabled = !hasBranches;
  elements.nextBranchButton.disabled = !hasBranches;
  elements.replyPanel.classList.add("hidden");

  if (!hasBranches) {
    elements.branchCount.textContent = "";
    elements.branchDeleteButton.textContent = "";
    return;
  }

  if (state.selectedBranchIndex >= branches.length) {
    state.selectedBranchIndex = 0;
    state.revealedBranchId = null;
    state.replySelection = null;
  }

  elements.branchCount.textContent = "";
  syncComposerNote(selectedBranch?.note || "", !selectedBranch);
  elements.composerStatus.textContent = "";
  elements.opponentMoveButton.textContent = state.editMode && selectedBranch ? getBranchDeleteTargetLabel(selectedBranch) : "";
  elements.branchDeleteButton.textContent = selectedBranch ? getBranchDeleteButtonLabel(selectedBranch) : "";
  if (branch && isConnectionBranch(branch)) {
    const connectionIndex = node.branches.findIndex((item) => item.id === branch.id);
    if (connectionIndex >= 0) {
      state.selectedBranchIndex = connectionIndex;
    }
    elements.replyPanel.classList.toggle("hidden", !isRevealed);
  elements.replyMoveButton.textContent = getConnectionButtonLabel(branch);
  }
}

function getVisibleBranch(node) {
  if (!node) {
    return null;
  }

  const revealed = getRevealedBranch(node);
  if (revealed) {
    return revealed;
  }

  const selected = node.branches[state.selectedBranchIndex];
  if (isConnectionBranch(selected)) {
    return selected;
  }

  return node.branches.find((branch) => isConnectionBranch(branch)) || null;
}

function getConnectionButtonLabel(branch) {
  const target = getBranchTarget(getSelectedOpening(), branch);
  return target ? `${target.opening.name}へ接続` : "接続先が見つかりません";
}

function getBranchDeleteButtonLabel(branch) {
  if (!branch) {
    return "";
  }
  if (isConnectionBranch(branch)) {
    return "この接続を削除";
  }
  return branch.opponentMove ? `この手を削除: ${branch.opponentMove}` : "この手を削除";
}

function getBranchDeleteTargetLabel(branch) {
  if (!branch) {
    return "";
  }
  if (isConnectionBranch(branch)) {
    return getConnectionButtonLabel(branch);
  }
  return [branch.opponentMove, branch.replyMove].filter(Boolean).join(" → ");
}

function getComposerDeletionBranch(node) {
  if (!node || !state.editMode || !state.revealedBranchId) {
    return null;
  }
  return getRevealedBranch(node);
}

function findExistingBranchByOpponentMove(node, moveLabel) {
  if (!node || !moveLabel) {
    return null;
  }

  const source = state.composer ? normalizeMoveSource(state.composer.branch.opponentMoveFrom) : null;
  return node.branches.find((branch) =>
    !isConnectionBranch(branch) &&
    branch.opponentMove === moveLabel &&
    isSameMoveSource(branch.opponentMoveFrom, source)
  ) || null;
}

function hasRegisteredOpponentMoveFromSquare(node, game, x, y) {
  if (!node) {
    return false;
  }

  return getBranchMoves(game, node.branches).some((move) =>
    move.from && move.from.x === x && move.from.y === y
  );
}

function startBranchComposer() {
  const node = getActiveNode();
  const opening = getSelectedOpening();
  if (!node || !opening || state.composer) {
    return;
  }

  state.browseSelection = null;
  state.replySelection = null;
  if (needsInitialPlayerMove(opening, node)) {
    state.composer = {
      mode: "root-player",
      stage: "player",
      boardSfen: node.sfen,
      branch: {
        opponentMove: "",
        replyMove: "",
        opponentMoveFrom: null,
        replyMoveFrom: null,
        note: ""
      },
      selected: null,
      legalMoves: []
    };
    render();
    return;
  }

  state.composer = {
    mode: "branch",
    stage: "opponent",
    boardSfen: node.sfen,
    branch: {
      opponentMove: "",
      replyMove: "",
      opponentMoveFrom: null,
      replyMoveFrom: null,
      note: ""
    },
    selected: null,
    legalMoves: []
  };
  render();
}

function cancelComposer() {
  state.composer = null;
  render();
}

function toggleEditMode() {
  if (state.composer) {
    closeEditMode();
    return;
  }

  if (!state.editMode && moveToRevealedBranchNext()) {
    state.editMode = true;
    startBranchComposer();
    return;
  }

  state.editMode = !state.editMode;
  state.browseSelection = null;
  state.replySelection = null;
  if (state.editMode) {
    startBranchComposer();
    return;
  }
  render();
}

function openEditMode() {
  state.editMode = true;
  state.browseSelection = null;
  state.replySelection = null;
  startBranchComposer();
}

function closeEditMode() {
  state.composer = null;
  state.editMode = false;
  state.browseSelection = null;
  state.replySelection = null;
  render();
}

function handleBoardSquareClick(x, y) {
  const composer = state.composer;
  if (!composer) {
    return;
  }

  const game = createGameFromSfen(composer.boardSfen);
  const turn = game.turn;

  if (composer.stage === "registered-reply") {
    handleRegisteredReplyClick(game, x, y);
    return;
  }

  if (composer.selected) {
    const candidates = composer.legalMoves.filter((move) => move.to.x === x && move.to.y === y);
    const chosenMove = choosePromotionMove(candidates);
    if (chosenMove) {
      applyComposerMove(game, chosenMove);
      return;
    }
  }

  const piece = game.get(x, y);
  if (!piece || piece.color !== turn) {
    composer.selected = null;
    composer.legalMoves = [];
    render();
    return;
  }

  const legalMoves = getLegalMovesFrom(game, x, y);
  if (!legalMoves.length) {
    composer.selected = null;
    composer.legalMoves = [];
    render();
    return;
  }

  composer.selected = { x, y };
  composer.legalMoves = legalMoves;
  render();
}

function handleBrowseBoardClick(x, y) {
  const node = getActiveNode();
  if (!node || !node.branches.length || state.composer) {
    return;
  }

  const game = createGameFromSfen(node.sfen);
  const playableBranches = node.branches.filter((branch) => !isConnectionBranch(branch));
  const branchMoves = getBranchMoves(game, playableBranches);

  if (state.browseSelection) {
    const chosen = state.browseSelection.moves.find((move) => move.to.x === x && move.to.y === y);
    if (chosen) {
      state.selectedBranchIndex = chosen.branchIndex;
      const branch = playableBranches[chosen.branchIndex];
      const realBranchIndex = node.branches.findIndex((item) => item.id === branch.id);
      state.selectedBranchIndex = realBranchIndex;
      state.revealedBranchId = branch.id;
      state.browseSelection = null;
      state.replySelection = null;
      render();
      return;
    }
  }

  const piece = game.get(x, y);
  if (!piece || piece.color !== game.turn) {
    state.browseSelection = null;
    render();
    return;
  }

  const movesFromSquare = branchMoves.filter((move) => move.from && move.from.x === x && move.from.y === y);
  if (!movesFromSquare.length) {
    state.browseSelection = null;
    render();
    return;
  }

  state.browseSelection = {
    from: { x, y },
    moves: movesFromSquare
  };
  render();
}

function handleHandClick(kind, color) {
  const node = getActiveNode();
  const revealedBranch = node ? getRevealedBranch(node) : null;
  const boardSfen = state.composer ? state.composer.boardSfen : node ? getBoardSfenForView(node, revealedBranch) : null;
  if (!boardSfen) {
    return;
  }

  const game = createGameFromSfen(boardSfen);
  if (color !== game.turn) {
    return;
  }

  if (state.composer) {
    const legalMoves = game.getDropsBy(color).filter((move) => move.kind === kind);
    state.composer.selected = { drop: true, kind, color };
    state.composer.legalMoves = legalMoves;
    render();
    return;
  }

  if (revealedBranch) {
    const move = findBranchMove(game, revealedBranch, "reply");
    if (!move || move.from || move.kind !== kind) {
      state.replySelection = null;
      render();
      return;
    }
    state.replySelection = { drop: true, kind, color };
    render();
    return;
  }

  if (!node || !node.branches.length) {
    return;
  }

  const dropMoves = getBranchMoves(game, node.branches).filter((move) => move.drop && move.kind === kind);
  if (!dropMoves.length) {
    state.browseSelection = null;
    render();
    return;
  }

  state.browseSelection = {
    drop: true,
    kind,
    color,
    moves: dropMoves
  };
  render();
}

function handleReplyBoardClick(x, y) {
  const node = getActiveNode();
  const branch = node ? getRevealedBranch(node) : null;
  if (!node || !branch || state.composer) {
    return;
  }

  const game = createGameFromSfen(getBoardSfenForView(node, branch));
  const move = findBranchMove(game, branch, "reply");
  if (!move) {
    state.replySelection = null;
    render();
    return;
  }

  if (!move.from) {
    if (state.replySelection?.drop && move.to.x === x && move.to.y === y) {
      advanceBranch();
      return;
    }
    state.replySelection = null;
    render();
    return;
  }

  const isSource = move.from.x === x && move.from.y === y;
  const isDestination = move.to.x === x && move.to.y === y;

  if (state.replySelection && isDestination) {
    advanceBranch();
    return;
  }

  if (isSource) {
    state.replySelection = { x, y };
    render();
    return;
  }

  state.replySelection = null;
  render();
}

function applyComposerMove(game, move) {
  const composer = state.composer;
  if (!composer) {
    return;
  }

  let moveLabel;
  if (move.from) {
    const before = game.get(move.from.x, move.from.y);
    const moverColor = before.color;
    game.move(move.from.x, move.from.y, move.to.x, move.to.y, Boolean(move.promote));
    moveLabel = formatMoveLabel(moverColor, move.to, before.kind, false, { promote: Boolean(move.promote) });
  } else {
    const moverColor = game.turn;
    game.drop(move.to.x, move.to.y, move.kind);
    moveLabel = formatMoveLabel(moverColor, move.to, move.kind, true);
  }

  if (composer.mode === "root-player") {
    saveInitialPlayerMove(game.toSFENString(1));
    return;
  }

  if (composer.stage === "opponent") {
    const existingBranch = findExistingBranchByOpponentMove(getActiveNode(), moveLabel);
    if (existingBranch) {
      state.revealedBranchId = existingBranch.id;
      composer.stage = "registered-reply";
      composer.boardSfen = game.toSFENString(1);
      composer.branch.opponentMove = "";
      composer.branch.replyMove = "";
      composer.branch.opponentMoveFrom = null;
      composer.branch.replyMoveFrom = null;
      composer.branch.note = "";
      composer.selected = null;
      composer.legalMoves = [];
      render();
      return;
    }

    state.revealedBranchId = null;
    composer.branch.opponentMove = moveLabel;
    composer.branch.opponentMoveFrom = serializeMoveSource(move);
    composer.stage = "reply";
    composer.boardSfen = game.toSFENString(1);
    composer.selected = null;
    composer.legalMoves = [];
    render();
    return;
  }

  composer.branch.replyMove = moveLabel;
  composer.branch.replyMoveFrom = serializeMoveSource(move);
  saveComposedBranch(game.toSFENString(1));
}

function handleRegisteredReplyClick(game, x, y) {
  const node = getActiveNode();
  const branch = node ? getRevealedBranch(node) : null;
  const composer = state.composer;
  if (!branch || !composer || isConnectionBranch(branch)) {
    return;
  }

  const move = findBranchMove(game, branch, "reply");
  if (!move) {
    composer.selected = null;
    composer.legalMoves = [];
    render();
    return;
  }

  if (!move.from) {
    if (move.to.x === x && move.to.y === y) {
      advanceExistingBranchForEdit(branch);
      return;
    }
    render();
    return;
  }

  if (composer.selected && move.to.x === x && move.to.y === y) {
    advanceExistingBranchForEdit(branch);
    return;
  }

  if (move.from.x === x && move.from.y === y) {
    composer.selected = { x, y };
    composer.legalMoves = [move];
    render();
    return;
  }

  composer.selected = null;
  composer.legalMoves = [];
  render();
}

function saveComposedBranch(nextSfen) {
  const opening = getSelectedOpening();
  const node = getActiveNode();
  const composer = state.composer;
  if (!opening || !node || !composer) {
    return;
  }
  if (hasNifu(nextSfen)) {
    window.alert("二歩になる局面は保存できません。");
    return;
  }

  const duplicateBranchIndex = node.branches.findIndex((branch) =>
    !isConnectionBranch(branch) &&
    branch.opponentMove === composer.branch.opponentMove &&
    isSameMoveSource(branch.opponentMoveFrom, composer.branch.opponentMoveFrom)
  );
  if (duplicateBranchIndex >= 0) {
    const duplicateBranch = node.branches[duplicateBranchIndex];
    window.alert(`相手の手「${composer.branch.opponentMove}」には、すでに応手が登録されています。\n変更したい場合は、その手を削除してから入力し直してください。`);
    state.selectedBranchIndex = duplicateBranchIndex;
    state.revealedBranchId = duplicateBranch.id;
    state.browseSelection = null;
    state.replySelection = null;
    state.composer = null;
    state.editMode = true;
    render();
    return;
  }

  const existingNode = findNodeByPosition(opening, nextSfen);
  if (existingNode) {
    window.alert("同じ局面がこの定跡内にあるため、既存の局面につなげました。");
  }

  const nextOpeningId = opening.id;
  const nextNodeId = existingNode ? existingNode.id : crypto.randomUUID();
  if (!existingNode) {
    opening.nodes[nextNodeId] = {
      id: nextNodeId,
      sfen: nextSfen,
      eval: null,
      note: "",
      branches: []
    };
  }

  const branchIndex = node.branches.length;
  node.branches.push({
    id: crypto.randomUUID(),
    opponentMove: composer.branch.opponentMove,
    replyMove: composer.branch.replyMove,
    opponentMoveFrom: composer.branch.opponentMoveFrom || null,
    replyMoveFrom: composer.branch.replyMoveFrom || null,
    note: composer.branch.note || "",
    nextOpeningId,
    nextNodeId
  });

  opening.updatedAt = new Date().toISOString();
  state.path.push({
    openingId: state.selectedOpeningId,
    nodeId: state.activeNodeId,
    branchIndex
  });
  state.selectedOpeningId = nextOpeningId;
  state.activeNodeId = nextNodeId;
  state.selectedBranchIndex = 0;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  state.composer = null;
  state.editMode = true;
  saveOpenings();
  startBranchComposer();
}

function saveInitialPlayerMove(nextSfen) {
  const opening = getSelectedOpening();
  const node = getActiveNode();
  if (!opening || !node) {
    return;
  }
  if (hasNifu(nextSfen)) {
    window.alert("二歩になる局面は保存できません。");
    return;
  }

  node.sfen = nextSfen;
  opening.updatedAt = new Date().toISOString();
  state.browseSelection = null;
  state.replySelection = null;
  state.composer = null;
  state.editMode = true;
  saveOpenings();
  startBranchComposer();
}

function changeBranch(direction) {
  const node = getActiveNode();
  if (!node || !node.branches.length || state.composer) {
    return;
  }

  const length = node.branches.length;
  state.selectedBranchIndex = (state.selectedBranchIndex + direction + length) % length;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  render();
}

function revealBranch() {
  const node = getActiveNode();
  if (!node || !node.branches.length || state.composer) {
    return;
  }

  const branch = node.branches[state.selectedBranchIndex];
  state.revealedBranchId = branch.id;
  state.browseSelection = null;
  state.replySelection = null;
  render();
}

function editSelectedBranchNote() {
  elements.composerNote?.focus();
}

function searchPositionFromInput() {
  const sfen = elements.positionSearchInput.value.trim();
  if (!sfen) {
    window.alert("検索したい局面のSFENを入力してください。");
    return;
  }
  try {
    createGameFromSfen(sfen);
  } catch {
    window.alert("SFENとして読み取れませんでした。");
    return;
  }
  state.positionSearchResults = findPositionMatches(sfen);
  state.screen = "search";
  state.menuOpen = false;
  state.moreMenuOpen = false;
  render();
}

function openPositionSearch() {
  state.screen = "search";
  state.menuOpen = false;
  state.moreMenuOpen = false;
  state.editMode = false;
  state.composer = null;
  render();
}

function openHome() {
  state.screen = "home";
  state.searchBoardSelection = null;
  state.menuOpen = false;
  state.moreMenuOpen = false;
  state.editMode = false;
  state.composer = null;
  render();
}

function openHomeExportMode() {
  state.homeExportMode = true;
  state.homeSelectionMode = "export";
  state.homeSelectedOpeningIds.clear();
  renderHome();
}

function openHomeDeleteMode() {
  state.homeExportMode = true;
  state.homeSelectionMode = "delete";
  state.homeSelectedOpeningIds.clear();
  renderHome();
}

function closeHomeExportMode() {
  state.homeExportMode = false;
  state.homeSelectionMode = null;
  state.homeSelectedOpeningIds.clear();
  renderHome();
}

function deleteSelectedHomeOpenings() {
  const selected = state.openings.filter((opening) => state.homeSelectedOpeningIds.has(opening.id));
  if (!selected.length) {
    window.alert("削除する定跡を選択してください。");
    return;
  }
  if (!window.confirm(`選択した定跡を削除しますか？\n定跡数: ${selected.length}`)) {
    return;
  }

  const selectedIds = new Set(selected.map((opening) => opening.id));
  selectedIds.forEach((id) => removeReferencesToOpening(id));
  state.openings = state.openings.filter((opening) => !selectedIds.has(opening.id));
  if (selectedIds.has(state.selectedOpeningId)) {
    state.selectedOpeningId = null;
    state.activeNodeId = null;
    state.path = [];
  }
  state.homeSelectedOpeningIds.clear();
  state.homeExportMode = false;
  state.homeSelectionMode = null;
  ensureSelection();
  saveOpenings();
  render();
}

function searchPositionFromBoard() {
  elements.positionSearchInput.value = state.searchBoardSfen;
  state.positionSearchResults = findPositionMatches(state.searchBoardSfen);
  state.screen = "search";
  state.menuOpen = false;
  state.moreMenuOpen = false;
  render();
}

function resetSearchBoard() {
  state.searchBoardSfen = INITIAL_SFEN;
  state.searchBoardSelection = null;
  elements.positionSearchInput.value = "";
  render();
}

function toggleSearchBoardTurn() {
  const game = createGameFromSfen(state.searchBoardSfen);
  game.editMode(true);
  game.setTurn(game.turn === COLOR.Black ? COLOR.White : COLOR.Black);
  state.searchBoardSfen = game.toSFENString(1);
  state.searchBoardSelection = null;
  elements.positionSearchInput.value = state.searchBoardSfen;
  render();
}

function togglePositionSearchOption(optionName) {
  state.positionSearchOptions[optionName] = !state.positionSearchOptions[optionName];
  state.positionSearchResults = findPositionMatches(elements.positionSearchInput.value.trim() || state.searchBoardSfen);
  render();
}

function updateSearchBoardFromGame(game) {
  state.searchBoardSfen = game.toSFENString(1);
  elements.positionSearchInput.value = state.searchBoardSfen;
}

function handleSearchHandClick(kind, color) {
  state.searchBoardSelection = { hand: true, kind, color };
  render();
}

function moveSearchSelectionToHand(color) {
  const selected = state.searchBoardSelection?.from;
  if (!selected) {
    return;
  }

  const game = createGameFromSfen(state.searchBoardSfen);
  const piece = game.get(selected.x, selected.y);
  if (!piece) {
    state.searchBoardSelection = null;
    render();
    return;
  }

  game.editMode(true);
  game.set(selected.x, selected.y, null);
  game.editMode(false);
  piece.unpromote();
  piece.color = color;
  game.pushToHand(piece);
  updateSearchBoardFromGame(game);
  state.searchBoardSelection = null;
  render();
}

function handleSearchBoardClick(x, y) {
  const game = createGameFromSfen(state.searchBoardSfen);

  if (state.searchBoardSelection) {
    if (state.searchBoardSelection.hand) {
      if (game.get(x, y)) {
        state.searchBoardSelection = null;
        render();
        return;
      }

      const piece = game.popFromHand(state.searchBoardSelection.kind, state.searchBoardSelection.color);
      game.editMode(true);
      game.set(x, y, piece);
      game.editMode(false);
      updateSearchBoardFromGame(game);
      state.searchBoardSelection = null;
      render();
      return;
    }

    const selected = state.searchBoardSelection.from;
    if (selected.x === x && selected.y === y) {
      state.searchBoardSelection = null;
      render();
      return;
    }

    const movingPiece = game.get(selected.x, selected.y);
    if (movingPiece) {
      const targetPiece = game.get(x, y);
      game.editMode(true);
      game.set(x, y, movingPiece);
      game.set(selected.x, selected.y, targetPiece || null);
      game.editMode(false);
      updateSearchBoardFromGame(game);
      state.searchBoardSelection = null;
      render();
      return;
    }
  }

  const piece = game.get(x, y);
  if (!piece) {
    state.searchBoardSelection = null;
    render();
    return;
  }

  state.searchBoardSelection = {
    from: { x, y }
  };
  render();
}

function searchCurrentPosition() {
  const sfen = getCurrentViewSfen();
  if (!sfen) {
    return;
  }
  elements.positionSearchInput.value = getPositionKey(sfen);
  state.searchBoardSfen = sfen;
  state.searchBoardSelection = null;
  state.positionSearchResults = findPositionMatches(sfen);
  state.screen = "search";
  state.menuOpen = false;
  state.moreMenuOpen = false;
  state.editMode = false;
  state.composer = null;
  render();
}

function findPositionMatches(sfen) {
  const targetKeys = getPositionSearchKeys(sfen);
  const matches = [];
  const seen = new Set();

  const getMatchedType = (candidateSfen) => {
    const candidateKeys = getPositionSearchKeys(candidateSfen, { includeFlipped: false });
    return targetKeys.find((target) => candidateKeys.some((candidate) => candidate.key === target.key))?.type || "";
  };

  const addMatch = (match) => {
    const key = [
      match.openingId,
      match.nodeId,
      match.branchId || "",
      match.kind,
      match.matchType
    ].join(":");
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    matches.push(match);
  };

  state.openings.forEach((opening) => {
    Object.values(opening.nodes).forEach((node) => {
      const nodeMatchType = getMatchedType(node.sfen);
      if (nodeMatchType) {
        addMatch({
          kind: "node",
          matchType: nodeMatchType,
          openingId: opening.id,
          openingName: opening.name,
          playerSide: opening.playerSide,
          branchCount: node.branches.length,
          nodeId: node.id
        });
      }

      node.branches.forEach((branch, branchIndex) => {
        const branchSfen = getBranchPreviewSfen(node, branch);
        const branchMatchType = branchSfen ? getMatchedType(branchSfen) : "";
        if (branchMatchType) {
          addMatch({
            kind: "branch",
            matchType: branchMatchType,
            openingId: opening.id,
            openingName: opening.name,
            playerSide: opening.playerSide,
            branchCount: node.branches.length,
            nodeId: node.id,
            branchId: branch.id,
            branchIndex
          });
        }
      });
    });
  });
  return matches;
}

function getBranchPreviewSfen(node, branch) {
  if (!node || !branch || isConnectionBranch(branch)) {
    return null;
  }

  try {
    return getBoardSfenForView(node, branch);
  } catch {
    return null;
  }
}

function matchLabel(match) {
  const base = `${formatSideLabel(match.playerSide)} ・ ${match.branchCount} 手順`;
  const details = [];
  if (match.kind === "branch") {
    details.push("分岐途中");
  }
  if (match.matchType === "flipped") {
    details.push("先後入替で一致");
  }
  return details.length ? `${base} ・ ${details.join(" ・ ")}` : base;
}

function openPositionMatch(matchOrOpeningId, maybeNodeId) {
  const match = typeof matchOrOpeningId === "object"
    ? matchOrOpeningId
    : { openingId: matchOrOpeningId, nodeId: maybeNodeId, kind: "node" };
  const { openingId, nodeId } = match;
  const opening = state.openings.find((item) => item.id === openingId);
  if (!opening || !opening.nodes[nodeId]) {
    return;
  }

  state.selectedOpeningId = opening.id;
  state.activeNodeId = nodeId;
  state.selectedBranchIndex = typeof match.branchIndex === "number" ? match.branchIndex : 0;
  state.revealedBranchId = match.kind === "branch" ? match.branchId : null;
  state.browseSelection = null;
  state.replySelection = null;
  state.path = [];
  state.editMode = false;
  state.composer = null;
  state.openingSetup = null;
  state.screen = "study";
  render();
}

function findConnectTargets(sfen, currentOpeningId) {
  const targetKeys = getConnectionSearchKeys(sfen);
  const seen = new Set();
  const targets = [];

  state.openings
    .filter((item) => item.id !== currentOpeningId)
    .forEach((opening) => {
      Object.values(opening.nodes).forEach((node) => {
        const matchType = getConnectionMatchType(node.sfen, targetKeys);
        if (!matchType) {
          return;
        }
        const key = `${opening.id}:${node.id}:${matchType}`;
        if (seen.has(key)) {
          return;
        }
        seen.add(key);
        targets.push({ opening, node, matchType });
      });
    });

  const priority = {
    exact: 0,
    flipped: 1
  };
  return targets.sort((a, b) => priority[a.matchType] - priority[b.matchType]);
}

function getConnectionSearchKeys(sfen) {
  return [
    { key: getPositionKeyForSearch(sfen), type: "exact" },
    { key: getPositionKeyForSearch(flipSfenPerspective(sfen)), type: "flipped" }
  ].filter((item, index, items) =>
    item.key && items.findIndex((candidate) => candidate.key === item.key) === index
  );
}

function getConnectionMatchType(candidateSfen, targetKeys) {
  const candidateKey = getPositionKeyForSearch(candidateSfen);
  return targetKeys.find((target) => candidateKey === target.key)?.type || "";
}

function formatConnectionMatchType(matchType) {
  return {
    exact: "完全一致",
    flipped: "先後入替で一致"
  }[matchType] || "一致";
}

function connectToAnotherOpening() {
  const opening = getSelectedOpening();
  const node = getActiveNode();
  if (!opening || !node) {
    return;
  }
  state.composer = null;
  state.editMode = true;

  const targets = findConnectTargets(getCurrentViewSfen(), opening.id);

  if (!targets.length) {
    window.alert("接続できる同一局面・先後入替局面が見つかりませんでした。");
    return;
  }

  const menu = targets
    .map((target, index) => `${index + 1}. ${target.opening.name}（${formatSideLabel(target.opening.playerSide)}の定跡） / ${formatConnectionMatchType(target.matchType)} / ${formatTurn(target.node.sfen)} / ${target.node.branches.length} 手順`)
    .join("\n");
  const answer = window.prompt(`接続候補です。\n完全一致を優先して、先後入替の同型も候補に入れています。\n接続先を番号で選んでください。\n\n${menu}`);
  if (answer === null) {
    return;
  }

  const target = targets[Number(answer.trim()) - 1];
  if (!target) {
    window.alert("番号が見つかりませんでした。");
    return;
  }

  const note = window.prompt("この接続のメモ", `${target.opening.name}へ接続（${formatConnectionMatchType(target.matchType)}）`) || "";
  const branchIndex = node.branches.length;
  const connectionBranch = {
    id: crypto.randomUUID(),
    opponentMove: "接続",
    replyMove: "接続",
    note,
    nextOpeningId: target.opening.id,
    nextNodeId: target.node.id
  };
  node.branches.push(connectionBranch);

  opening.updatedAt = new Date().toISOString();
  saveOpenings();
  state.selectedBranchIndex = branchIndex;
  state.revealedBranchId = connectionBranch.id;
  state.browseSelection = null;
  state.replySelection = null;
  state.editMode = false;
  state.composer = null;
  render();
}

function advanceBranch() {
  const node = getActiveNode();
  const opening = getSelectedOpening();
  if (state.composer?.stage === "registered-reply") {
    const branch = node ? getRevealedBranch(node) : null;
    advanceExistingBranchForEdit(branch);
    return;
  }

  if (!node || !node.branches.length || state.composer) {
    return;
  }

  const branch = node.branches[state.selectedBranchIndex];
  const target = getBranchTarget(opening, branch);
  if (!target) {
    return;
  }

  state.path.push({
    openingId: state.selectedOpeningId,
    nodeId: state.activeNodeId,
    branchIndex: state.selectedBranchIndex
  });
  state.selectedOpeningId = target.opening.id;
  state.activeNodeId = target.node.id;
  state.selectedBranchIndex = 0;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  render();
}

function advanceExistingBranchForEdit(branch) {
  const node = getActiveNode();
  const opening = getSelectedOpening();
  if (!node || !opening || !branch) {
    return;
  }

  const branchIndex = node.branches.findIndex((item) => item.id === branch.id);
  const target = getBranchTarget(opening, branch);
  if (branchIndex < 0 || !target) {
    return;
  }

  state.path.push({
    openingId: state.selectedOpeningId,
    nodeId: state.activeNodeId,
    branchIndex
  });
  state.selectedOpeningId = target.opening.id;
  state.activeNodeId = target.node.id;
  state.selectedBranchIndex = 0;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  state.composer = null;
  state.editMode = true;
  startBranchComposer();
}

function moveToRevealedBranchNext() {
  const node = getActiveNode();
  const opening = getSelectedOpening();
  if (!node || !state.revealedBranchId) {
    return false;
  }

  const branchIndex = node.branches.findIndex((branch) => branch.id === state.revealedBranchId);
  const branch = node.branches[branchIndex];
  const target = getBranchTarget(opening, branch);
  if (!target) {
    return false;
  }

  state.path.push({
    openingId: state.selectedOpeningId,
    nodeId: state.activeNodeId,
    branchIndex
  });
  state.selectedOpeningId = target.opening.id;
  state.activeNodeId = target.node.id;
  state.selectedBranchIndex = 0;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  return true;
}

function resetComposerToCurrentOpponent() {
  const composer = state.composer;
  if (!composer) {
    return;
  }

  composer.stage = "opponent";
  composer.boardSfen = getActiveNode()?.sfen || composer.boardSfen;
  composer.branch.opponentMove = "";
  composer.branch.replyMove = "";
  composer.branch.opponentMoveFrom = null;
  composer.branch.replyMoveFrom = null;
  composer.branch.note = "";
  composer.selected = null;
  composer.legalMoves = [];
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  render();
}

function goBack() {
  if (state.composer) {
    if (state.composer.mode === "root-player") {
      state.composer.selected = null;
      state.composer.legalMoves = [];
      render();
      return;
    }

    if (state.composer.stage === "reply") {
      resetComposerToCurrentOpponent();
      return;
    }

    if (state.composer.stage === "registered-reply") {
      resetComposerToCurrentOpponent();
      return;
    }

    const previous = state.path.pop();
    if (previous) {
      state.selectedOpeningId = previous.openingId || state.selectedOpeningId;
      state.activeNodeId = previous.nodeId;
      state.selectedBranchIndex = previous.branchIndex;
      state.revealedBranchId = null;
      state.browseSelection = null;
      state.replySelection = null;
      state.composer = null;
      state.editMode = true;
      startBranchComposer();
      return;
    }

    resetComposerToCurrentOpponent();
    return;
  }

  if (state.revealedBranchId) {
    state.revealedBranchId = null;
    state.browseSelection = null;
    state.replySelection = null;
    render();
    return;
  }

  const previous = state.path.pop();
  if (!previous) {
    return;
  }

  state.selectedOpeningId = previous.openingId || state.selectedOpeningId;
  state.activeNodeId = previous.nodeId;
  state.selectedBranchIndex = previous.branchIndex;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  render();
}

function resetPath() {
  if (state.composer) {
    return;
  }

  const opening = getSelectedOpening();
  if (!opening) {
    return;
  }

  state.activeNodeId = opening.rootNodeId;
  state.selectedBranchIndex = 0;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  state.path = [];
  render();
}

function openOpeningSetup() {
  state.openingSetup = {
    playerSide: "black",
    name: ""
  };
  elements.openingNameInput.value = "";
  setMenuOpen(false);
  state.moreMenuOpen = false;
  renderChrome();
}

function chooseOpeningSide(playerSide) {
  if (!state.openingSetup) {
    return;
  }
  state.openingSetup.playerSide = playerSide;
  renderChrome();
}

function closeOpeningSetup() {
  state.openingSetup = null;
  renderChrome();
}

function createOpening() {
  if (!state.openingSetup) {
    return;
  }

  const name = elements.openingNameInput.value.trim();
  if (!name) {
    window.alert("定跡名を入れてください");
    return;
  }

  const rootNodeId = crypto.randomUUID();
  const opening = {
    id: crypto.randomUUID(),
    name,
    playerSide: state.openingSetup.playerSide,
    rootNodeId,
    updatedAt: new Date().toISOString(),
    nodes: {
      [rootNodeId]: {
        id: rootNodeId,
        sfen: INITIAL_SFEN,
        eval: null,
        note: "",
        branches: []
      }
    }
  };

  state.openings.unshift(opening);
  state.selectedOpeningId = opening.id;
  state.activeNodeId = opening.rootNodeId;
  state.selectedBranchIndex = 0;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  state.path = [];
  state.editMode = false;
  state.composer = null;
  state.openingSetup = null;
  state.screen = "study";
  saveOpenings();
  setMenuOpen(false);
  if (needsInitialPlayerMove(opening, opening.nodes[rootNodeId])) {
    state.editMode = true;
    startBranchComposer();
    return;
  }
  render();
}

function deleteOpening() {
  const opening = getSelectedOpening();
  if (!opening) {
    return;
  }

  const node = getActiveNode();
  const branch = getDeletionBranch(node);
  const options = [];
  if (node && branch) {
    options.push({ key: "1", label: "選択中の手順だけ削除", action: () => deleteCurrentBranch(opening, node, branch) });
  }
  if (node && node.branches.length) {
    options.push({ key: "2", label: "この局面から先を全部削除", action: () => deleteContinuations(opening, node) });
  }
  options.push({ key: "3", label: `定跡「${opening.name}」を全部削除`, action: () => deleteCurrentOpening(opening) });

  const menu = options.map((option) => `${option.key}. ${option.label}`).join("\n");
  const answer = window.prompt(`削除する範囲を選んでください。\n共有・接続されている局面は勝手には消しません。\n\n${menu}`);
  if (answer === null) {
    return;
  }

  const selected = options.find((option) => option.key === answer.trim());
  if (!selected) {
    window.alert("番号が見つかりませんでした。");
    return;
  }
  selected.action();
}

function deleteCurrentOpeningFromMenu() {
  const opening = getSelectedOpening();
  if (!opening) {
    return;
  }
  deleteCurrentOpening(opening);
}

function renameCurrentOpening() {
  const opening = getSelectedOpening();
  if (!opening) {
    return;
  }
  state.moreMenuOpen = false;
  const name = window.prompt("定跡名を変更", opening.name);
  if (name === null) {
    renderChrome();
    return;
  }

  const nextName = name.trim();
  if (!nextName) {
    window.alert("名前を入力してください。");
    renderChrome();
    return;
  }

  opening.name = nextName;
  opening.updatedAt = new Date().toISOString();
  saveOpenings();
  render();
}

function getDeletionBranch(node) {
  if (!node || !node.branches.length) {
    return null;
  }
  return getRevealedBranch(node) || node.branches[state.selectedBranchIndex] || null;
}

function deleteSelectedBranchQuick() {
  const opening = getSelectedOpening();
  const node = getActiveNode();
  const branch = getDeletionBranch(node);
  if (!opening || !node || !branch) {
    return;
  }
  deleteCurrentBranch(opening, node, branch);
}

function deleteCurrentBranch(opening, node, branch) {
  const label = isConnectionBranch(branch)
    ? "この接続"
    : branch.opponentMove
      ? `相手の手「${branch.opponentMove}」から始まる手順`
      : "この手順";
  if (!window.confirm(`${label}を削除しますか？\nこの操作は元に戻せません。`)) {
    return;
  }

  node.branches = node.branches.filter((item) => item.id !== branch.id);
  opening.updatedAt = new Date().toISOString();
  state.selectedBranchIndex = Math.min(state.selectedBranchIndex, Math.max(0, node.branches.length - 1));
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  cleanupOpeningNodes(opening);
  saveOpenings();
  render();
}

function deleteContinuations(opening, node) {
  if (!window.confirm("この局面から先の手順を全部削除しますか？")) {
    return;
  }

  node.branches = [];
  opening.updatedAt = new Date().toISOString();
  state.selectedBranchIndex = 0;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  cleanupOpeningNodes(opening);
  saveOpenings();
  render();
}

function deleteCurrentOpening(opening) {
  const shouldDelete = window.confirm(`「${opening.name}」を削除しますか？`);
  if (!shouldDelete) {
    return;
  }

  removeReferencesToOpening(opening.id);
  state.openings = state.openings.filter((item) => item.id !== opening.id);
  state.selectedOpeningId = null;
  state.activeNodeId = null;
  state.selectedBranchIndex = 0;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  state.path = [];
  state.editMode = false;
  state.composer = null;
  state.screen = "home";
  ensureSelection();
  saveOpenings();
  render();
}

function removeReferencesToOpening(openingId) {
  state.openings.forEach((sourceOpening) => {
    if (sourceOpening.id === openingId) {
      return;
    }
    let changed = false;
    Object.values(sourceOpening.nodes).forEach((node) => {
      const before = node.branches.length;
      node.branches = node.branches.filter((branch) => (branch.nextOpeningId || sourceOpening.id) !== openingId);
      changed = changed || before !== node.branches.length;
    });
    if (changed) {
      sourceOpening.updatedAt = new Date().toISOString();
    }
  });
}

function cleanupOpeningNodes(opening) {
  const keep = new Set([opening.rootNodeId]);
  const stack = [opening.rootNodeId];

  while (stack.length) {
    const nodeId = stack.pop();
    const node = opening.nodes[nodeId];
    if (!node) {
      continue;
    }

    node.branches.forEach((branch) => {
      const targetOpeningId = branch.nextOpeningId || opening.id;
      if (targetOpeningId !== opening.id || !opening.nodes[branch.nextNodeId] || keep.has(branch.nextNodeId)) {
        return;
      }
      keep.add(branch.nextNodeId);
      stack.push(branch.nextNodeId);
    });
  }

  getExternallyReferencedNodeIds(opening.id).forEach((nodeId) => keep.add(nodeId));

  Object.keys(opening.nodes).forEach((nodeId) => {
    if (!keep.has(nodeId)) {
      delete opening.nodes[nodeId];
    }
  });
}

function getExternallyReferencedNodeIds(openingId) {
  const references = new Set();
  state.openings.forEach((sourceOpening) => {
    Object.values(sourceOpening.nodes).forEach((node) => {
      node.branches.forEach((branch) => {
        if ((branch.nextOpeningId || sourceOpening.id) === openingId && sourceOpening.id !== openingId && branch.nextNodeId) {
          references.add(branch.nextNodeId);
        }
      });
    });
  });
  return references;
}

function exportCurrentOpening() {
  const opening = getSelectedOpening();
  if (!opening) {
    return;
  }
  state.moreMenuOpen = false;
  exportOpeningItems([opening], `「${opening.name}」を書き出しますか？`, `${opening.name || "定跡"}.joseki`);
}

async function exportSelectedHomeOpenings() {
  const selected = state.openings.filter((opening) => state.homeSelectedOpeningIds.has(opening.id));
  if (!selected.length) {
    window.alert("書き出す定跡を選択してください。");
    return;
  }
  if (!window.confirm(`選択した定跡を書き出しますか？\n定跡数: ${selected.length}`)) {
    return;
  }

  exportOpeningFolder(selected);
  closeHomeExportMode();
}

function exportOpeningItems(openings, message, filename) {
  const shouldExport = window.confirm(message);
  if (!shouldExport) {
    return;
  }

  const blob = new Blob([JSON.stringify(openings, null, 2)], { type: "application/x-joseki+json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = sanitizeFilename(filename);
  link.click();
  URL.revokeObjectURL(url);
}

function exportOpeningFolder(openings) {
  const folderName = "定跡管理-選択分";
  const usedNames = new Map();
  const files = openings.map((opening) => {
    const baseName = sanitizeFilename(opening.name || "定跡").replace(/\.joseki(?:\.json)?$/i, "");
    const count = usedNames.get(baseName) || 0;
    usedNames.set(baseName, count + 1);
    const fileName = count ? `${baseName}-${count + 1}.joseki` : `${baseName}.joseki`;
    return {
      path: `${folderName}/${fileName}`,
      content: JSON.stringify([opening], null, 2)
    };
  });

  const blob = createZipBlob(files);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${folderName}.zip`;
  link.click();
  URL.revokeObjectURL(url);
}

function createZipBlob(files) {
  const encoder = new TextEncoder();
  const chunks = [];
  const centralDirectory = [];
  let offset = 0;

  files.forEach((file) => {
    const nameBytes = encoder.encode(file.path);
    const dataBytes = encoder.encode(file.content);
    const crc = crc32(dataBytes);
    const localHeader = createZipLocalHeader(nameBytes, dataBytes.length, crc);
    chunks.push(localHeader, nameBytes, dataBytes);
    centralDirectory.push({
      nameBytes,
      crc,
      size: dataBytes.length,
      offset
    });
    offset += localHeader.length + nameBytes.length + dataBytes.length;
  });

  const centralStart = offset;
  centralDirectory.forEach((entry) => {
    const header = createZipCentralDirectoryHeader(entry.nameBytes, entry.size, entry.crc, entry.offset);
    chunks.push(header, entry.nameBytes);
    offset += header.length + entry.nameBytes.length;
  });

  chunks.push(createZipEndRecord(centralDirectory.length, offset - centralStart, centralStart));
  return new Blob(chunks, { type: "application/zip" });
}

function createZipLocalHeader(nameBytes, size, crc) {
  const header = new Uint8Array(30);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x04034b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 0x0800, true);
  view.setUint16(8, 0, true);
  view.setUint32(10, 0, true);
  view.setUint32(14, crc, true);
  view.setUint32(18, size, true);
  view.setUint32(22, size, true);
  view.setUint16(26, nameBytes.length, true);
  view.setUint16(28, 0, true);
  return header;
}

function createZipCentralDirectoryHeader(nameBytes, size, crc, offset) {
  const header = new Uint8Array(46);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x02014b50, true);
  view.setUint16(4, 20, true);
  view.setUint16(6, 20, true);
  view.setUint16(8, 0x0800, true);
  view.setUint16(10, 0, true);
  view.setUint32(12, 0, true);
  view.setUint32(16, crc, true);
  view.setUint32(20, size, true);
  view.setUint32(24, size, true);
  view.setUint16(28, nameBytes.length, true);
  view.setUint16(30, 0, true);
  view.setUint16(32, 0, true);
  view.setUint16(34, 0, true);
  view.setUint16(36, 0, true);
  view.setUint32(38, 0, true);
  view.setUint32(42, offset, true);
  return header;
}

function createZipEndRecord(entryCount, centralSize, centralOffset) {
  const header = new Uint8Array(22);
  const view = new DataView(header.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, entryCount, true);
  view.setUint16(10, entryCount, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, centralOffset, true);
  return header;
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function sanitizeFilename(filename) {
  return String(filename || "定跡管理.joseki")
    .replace(/[\\/:*?"<>|]/g, "_")
    .slice(0, 80);
}

async function importOpenings(event) {
  const files = [...(event.target.files || [])].filter((file) =>
    isJosekiFileName(file.name) ||
    file.name.toLowerCase().endsWith(".zip") ||
    file.name.toLowerCase().endsWith(".json")
  );
  if (!files.length) {
    return;
  }

  try {
    const imported = [];
    for (const file of files) {
      const texts = file.name.toLowerCase().endsWith(".zip")
        ? await extractJosekiTextsFromZip(file)
        : [await file.text()];
      texts.forEach((text) => {
        const parsed = JSON.parse(text || "[]");
        imported.push(...(Array.isArray(parsed) ? parsed : [parsed]));
      });
    }
    const normalized = imported.map(normalizeOpening).filter(Boolean);
    if (!normalized.length) {
      throw new Error("有効な定跡がありません");
    }

    state.openings = normalized;
    selectOpening(normalized[0].id, false);
    saveOpenings();
    render();
  } catch (error) {
    window.alert(`読み込みに失敗しました: ${error.message}`);
  } finally {
    event.target.value = "";
  }
}

async function extractJosekiTextsFromZip(file) {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const decoder = new TextDecoder();
  const texts = [];
  let offset = 0;

  while (offset + 30 <= bytes.length) {
    const signature = view.getUint32(offset, true);
    if (signature !== 0x04034b50) {
      offset += 1;
      continue;
    }

    const flags = view.getUint16(offset + 6, true);
    const method = view.getUint16(offset + 8, true);
    const compressedSize = view.getUint32(offset + 18, true);
    const fileNameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const dataStart = nameStart + fileNameLength + extraLength;
    const dataEnd = dataStart + compressedSize;
    const fileName = decoder.decode(bytes.slice(nameStart, nameStart + fileNameLength));

    if ((flags & 0x08) !== 0) {
      throw new Error("このZIP形式にはまだ対応していません");
    }
    if (dataEnd > bytes.length) {
      throw new Error("ZIPの中身を読み取れませんでした");
    }
    if (isJosekiFileName(fileName)) {
      if (method !== 0) {
        throw new Error("圧縮されたZIPにはまだ対応していません");
      }
      texts.push(decoder.decode(bytes.slice(dataStart, dataEnd)));
    }

    offset = dataEnd;
  }

  if (!texts.length) {
    throw new Error("ZIPの中に.josekiがありません");
  }
  return texts;
}

function isJosekiFileName(fileName) {
  const lower = String(fileName || "").toLowerCase();
  return lower.endsWith(".joseki") || lower.endsWith(".joseki.json");
}

function selectOpening(openingId, closeMenu = true) {
  const opening = state.openings.find((item) => item.id === openingId);
  if (!opening) {
    return;
  }

  state.selectedOpeningId = opening.id;
  state.activeNodeId = opening.rootNodeId;
  state.selectedBranchIndex = 0;
  state.revealedBranchId = null;
  state.browseSelection = null;
  state.replySelection = null;
  state.path = [];
  state.editMode = false;
  state.composer = null;
  state.openingSetup = null;
  state.screen = "study";
  opening.updatedAt = new Date().toISOString();
  saveOpenings();
  if (closeMenu) {
    setMenuOpen(false);
  }
  state.moreMenuOpen = false;
  render();
}

function createGameFromSfen(sfen) {
  const game = new window.JKF.Shogi.Shogi();
  game.initializeFromSFENString(sfen);
  return game;
}

function getBoardCoordinates(playerSide = "black") {
  const files = Array.from({ length: 9 }, (_, index) => index + 1);
  const ranks = Array.from({ length: 9 }, (_, index) => index + 1);

  return playerSide === "white"
    ? { files, ranks: ranks.reverse() }
    : { files: files.reverse(), ranks };
}

function renderBoardCoordinates(fileContainer, rankContainer, coordinates) {
  renderCoordinateLabels(fileContainer, coordinates.files, DISPLAY_FILES);
  renderCoordinateLabels(rankContainer, coordinates.ranks, DISPLAY_RANKS);
}

function renderCoordinateLabels(container, values, labels) {
  if (!container) {
    return;
  }

  container.innerHTML = "";
  values.forEach((value) => {
    const label = document.createElement("span");
    label.textContent = labels[value] || String(value);
    container.append(label);
  });
}

function isPieceUpsideDown(color, playerSide = "black") {
  return playerSide === "white" ? color === COLOR.Black : color === COLOR.White;
}

function getPositionKey(sfen) {
  return String(sfen || "").trim().split(/\s+/).slice(0, 3).join(" ");
}

function getPositionSearchKeys(sfen, options = state.positionSearchOptions) {
  const keys = [];
  const addKey = (candidateSfen, type) => {
    const key = getPositionKeyForSearch(candidateSfen);
    if (!key || keys.some((item) => item.key === key)) {
      return;
    }
    keys.push({ key, type });
  };

  addKey(sfen, "exact");
  if (options.includeFlipped) {
    addKey(flipSfenPerspective(sfen), "flipped");
  }
  return keys;
}

function getPositionKeyForSearch(sfen) {
  const [board, turn = "b", hands = "-"] = String(sfen || "").trim().split(/\s+/);
  if (!board) {
    return "";
  }
  return [board, turn, hands].join(" ");
}

function flipSfenPerspective(sfen) {
  const [board, turn = "b", hands = "-", moveNumber = "1"] = String(sfen || "").trim().split(/\s+/);
  if (!board) {
    return "";
  }
  return [
    flipSfenBoard(board),
    turn === "b" ? "w" : "b",
    flipSfenHands(hands),
    moveNumber
  ].join(" ");
}

function flipSfenBoard(board) {
  const grid = parseSfenBoard(board);
  const flipped = grid.map((rank) => rank.map(() => null));

  for (let y = 0; y < 9; y += 1) {
    for (let x = 0; x < 9; x += 1) {
      const piece = grid[y][x];
      if (piece) {
        flipped[8 - y][8 - x] = flipSfenPiece(piece);
      }
    }
  }

  return flipped.map(formatSfenRank).join("/");
}

function parseSfenBoard(board) {
  return board.split("/").map((rank) => {
    const squares = [];
    for (let index = 0; index < rank.length; index += 1) {
      const char = rank[index];
      if (/\d/.test(char)) {
        for (let count = 0; count < Number(char); count += 1) {
          squares.push(null);
        }
        continue;
      }
      if (char === "+") {
        index += 1;
        squares.push(`+${rank[index]}`);
        continue;
      }
      squares.push(char);
    }
    return squares;
  });
}

function formatSfenRank(rank) {
  let text = "";
  let emptyCount = 0;
  rank.forEach((piece) => {
    if (!piece) {
      emptyCount += 1;
      return;
    }
    if (emptyCount) {
      text += String(emptyCount);
      emptyCount = 0;
    }
    text += piece;
  });
  return text + (emptyCount ? String(emptyCount) : "");
}

function flipSfenPiece(piece) {
  if (piece.startsWith("+")) {
    return `+${flipSfenPiece(piece.slice(1))}`;
  }
  return piece === piece.toUpperCase() ? piece.toLowerCase() : piece.toUpperCase();
}

function flipSfenHands(hands) {
  if (!hands || hands === "-") {
    return "-";
  }

  const counts = {};
  const tokens = hands.match(/\d*[A-Za-z]/g) || [];
  tokens.forEach((token) => {
    const match = token.match(/^(\d*)([A-Za-z])$/);
    if (!match) {
      return;
    }
    const count = Number(match[1] || "1");
    const piece = flipSfenPiece(match[2]);
    counts[piece] = (counts[piece] || 0) + count;
  });

  const order = "RBGSNLPrbgsnlp".split("");
  const text = order
    .filter((piece) => counts[piece])
    .map((piece) => `${counts[piece] > 1 ? counts[piece] : ""}${piece}`)
    .join("");
  return text || "-";
}

function findNodeByPosition(opening, sfen) {
  if (!opening) {
    return null;
  }

  const targetKey = getPositionKey(sfen);
  return Object.values(opening.nodes).find((node) => getPositionKey(node.sfen) === targetKey) || null;
}

function findNodeByPositionAcrossOpenings(sfen, preferredOtherThanOpeningId = "") {
  const targetKey = getPositionKey(sfen);
  const matches = [];

  state.openings.forEach((opening) => {
    Object.values(opening.nodes).forEach((node) => {
      if (getPositionKey(node.sfen) === targetKey) {
        matches.push({ opening, node });
      }
    });
  });

  return matches.find((match) => match.opening.id !== preferredOtherThanOpeningId) || matches[0] || null;
}

function getBranchTarget(currentOpening, branch) {
  if (!branch || !branch.nextNodeId) {
    return null;
  }

  const openingId = branch.nextOpeningId || currentOpening?.id;
  const opening = state.openings.find((item) => item.id === openingId) || currentOpening;
  const node = opening?.nodes[branch.nextNodeId] || null;
  return opening && node ? { opening, node } : null;
}

function needsInitialPlayerMove(opening, node) {
  if (!opening || !node) {
    return false;
  }

  return opening.playerSide === "black"
    && opening.rootNodeId === node.id
    && node.branches.length === 0
    && node.sfen.split(" ")[1] === "b";
}

function getBranchMoves(game, branches) {
  const matches = [];

  for (const [branchIndex, branch] of branches.entries()) {
    const move = findBranchMove(game, branch, "opponent");
    if (!move) {
      continue;
    }

    matches.push({
      branchIndex,
      drop: !move.from,
      kind: move.kind,
      from: move.from ? { x: move.from.x, y: move.from.y } : null,
      to: { x: move.to.x, y: move.to.y }
    });
  }

  return matches;
}

function findBranchMove(game, branch, phase) {
  const label = phase === "reply" ? branch?.replyMove : branch?.opponentMove;
  const source = phase === "reply" ? branch?.replyMoveFrom : branch?.opponentMoveFrom;
  return findMoveByLabel(game, label, source);
}

function findMoveByLabel(game, label, preferredFrom = null) {
  const parsed = parseMoveLabel(label);
  if (!parsed) {
    return null;
  }

  if (parsed.drop) {
    return game.getDropsBy(game.turn).find((move) =>
      move.to.x === parsed.to.x &&
      move.to.y === parsed.to.y &&
      move.kind === parsed.kind
    ) || null;
  }

  const source = normalizeMoveSource(preferredFrom);
  const sources = source
    ? [source, ...getAllBoardSources().filter((item) => item.x !== source.x || item.y !== source.y)]
    : getAllBoardSources();

  for (const { x, y } of sources) {
      const piece = game.get(x, y);
      if (!piece || piece.color !== game.turn) {
        continue;
      }

      for (const move of getLegalMovesFrom(game, x, y)) {
        if (move.to.x !== parsed.to.x || move.to.y !== parsed.to.y) {
          continue;
        }

        if (isParsedMoveMatch(piece, move, parsed)) {
          return move;
        }
      }
  }

  return null;
}

function isParsedMoveMatch(piece, move, parsed) {
  if (piece.kind === parsed.kind) {
    return Boolean(move.promote) === Boolean(parsed.promote);
  }
  if (move.promote && promoteKind(piece.kind) === parsed.kind) {
    return true;
  }
  return false;
}

function getAllBoardSources() {
  const sources = [];
  for (let x = 1; x <= 9; x += 1) {
    for (let y = 1; y <= 9; y += 1) {
      sources.push({ x, y });
    }
  }
  return sources;
}

function parseMoveLabel(label) {
  const text = String(label || "").trim();
  if (text.length < 4) {
    return null;
  }

  const dropSuffix = "\u6253";
  const promoteSuffix = "\u6210";
  const drop = text.endsWith(dropSuffix);
  const promote = text.endsWith(promoteSuffix);
  const body = text.slice(1, text.length - (drop || promote ? 1 : 0));
  const file = Number(body[0]);
  const rank = KANJI_RANKS.indexOf(body[1]);
  const kind = stringToKind(body.slice(2));
  if (!file || rank < 1 || !kind) {
    return null;
  }

  return {
    to: {
      x: file,
      y: rank
    },
    kind,
    drop,
    promote
  };
}

function formatTurn(sfen) {
  return sfen.split(" ")[1] === "b" ? "先手番" : "後手番";
}

function getPlayedMoveCount(sfen) {
  const moveNumber = Number(String(sfen || "").trim().split(/\s+/)[3] || "1");
  return Math.max(0, (Number.isFinite(moveNumber) ? moveNumber : 1) - 1);
}

function formatEvaluationScore(score) {
  if (!Number.isFinite(score)) {
    return "未設定";
  }
  if (Math.abs(score) >= 30000) {
    return score > 0 ? "詰みあり" : "詰まされ";
  }
  return `${score > 0 ? "+" : ""}${score}`;
}

function formatMoveLabel(color, to, kind, isDrop = false, options = {}) {
  const prefix = color === COLOR.Black ? "▲" : "△";
  const suffix = isDrop ? "\u6253" : options.promote ? "\u6210" : "";
  return `${prefix}${to.x}${KANJI_RANKS[to.y]}${window.JKF.Shogi.kindToString(kind, true)}${suffix}`;
}

function stringToKind(text) {
  const kinds = ["FU", "KY", "KE", "GI", "KI", "KA", "HI", "OU", "TO", "NY", "NK", "NG", "UM", "RY"];
  return kinds.find((kind) =>
    window.JKF.Shogi.kindToString(kind, true) === text ||
    window.JKF.Shogi.kindToString(kind, false) === text
  ) || "";
}

function formatSideLabel(playerSide) {
  return playerSide === "white" ? "後手" : "先手";
}

function getOpponentSide(playerSide) {
  return playerSide === "white" ? "black" : "white";
}

function countBranches(opening) {
  return Object.values(opening.nodes).reduce((sum, node) => sum + node.branches.length, 0);
}

function isPromoted(kind) {
  return ["TO", "NY", "NK", "NG", "UM", "RY"].includes(kind);
}

function isConnectionBranch(branch) {
  return branch?.opponentMove === "接続" && branch?.replyMove === "接続";
}

function setMenuOpen(isOpen) {
  state.menuOpen = isOpen;
  if (isOpen) {
    state.moreMenuOpen = false;
  }
  renderChrome();
}

function toggleMoreMenu() {
  state.moreMenuOpen = !state.moreMenuOpen;
  if (state.moreMenuOpen) {
    state.menuOpen = false;
  }
  renderChrome();
}

function closeOverlayMenus() {
  state.menuOpen = false;
  state.moreMenuOpen = false;
  renderChrome();
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
