const cat = document.getElementById("cat");
const counter = document.getElementById("counter");
const cpsEl = document.getElementById("cps");
const arrow = document.getElementById("arrow");
const menu = document.getElementById("menu");
const clawsBtn = document.getElementById("upgrade-claws");
const petterBtn = document.getElementById("upgrade-petter");
const megaClawBtn = document.getElementById("upgrade-megaclaw");
const superPetterBtn = document.getElementById("upgrade-superpetter");
const rebirthBtn = document.getElementById("rebirth");
const rebirthCostEl = document.getElementById("rebirth-cost");
const treeOverlay = document.getElementById("tree-overlay");
const treePoints = document.getElementById("tree-points");
const treeStage = document.getElementById("tree-stage");
const treeWorld = document.getElementById("tree-world");
const treeLines = document.getElementById("tree-lines");
const treeNodes = document.getElementById("tree-nodes");
const treeClose = document.getElementById("tree-close");
const settingsBtn = document.getElementById("settings");
const settingsPanel = document.getElementById("settings-panel");
const colorInput = document.getElementById("color-input");

settingsBtn.addEventListener("click", () => {
  settingsPanel.classList.toggle("open");
});

document.querySelectorAll(".swatch").forEach((sw) => {
  sw.addEventListener("click", () => applyColor(sw.dataset.color));
});

colorInput.addEventListener("input", (e) => applyColor(e.target.value));

function applyColor(color) {
  document.body.style.setProperty("--base", color);
  colorInput.value = color;
}

let clicks = 0;
let perClick = 1;
let perSecond = 0;
let clawsCount = 0;
let petterCount = 0;
let megaClawCount = 0;
let superPetterCount = 0;
let rebirths = 0;
let rebirthCount = 0;
let recent = [];

let treePerClick = 0;
let treePerSecond = 0;
let treeClickMult = 1;
let treeAutoMult = 1;
let treeMult = 1;
let pointsPerRebirth = 1;
const treeLevels = {};

const CLAWS_BASE = 50;
const CLAWS_STEP = 40;
const PETTER_BASE = 250;
const PETTER_STEP = 150;
const REBIRTH_BASE = 3000;
const REBIRTH_GROWTH = 6;

const TREE = {
  double: {
    name: "Mega Upgrade",
    desc: "+1x income · unlocks Mega Claws & Super Petter",
    x: 700, y: 760, parent: null,
    base: 1, growth: 2, maxLevel: 1, mult: 1,
  },
  sharp: {
    name: "Sharp Claws",
    desc: "+1x click multiplier",
    x: 460, y: 640, parent: "double",
    base: 1, growth: 2, maxLevel: 3, clickMult: 1,
  },
  razor: {
    name: "Razor Claws",
    desc: "+1x click multiplier",
    x: 260, y: 520, parent: "sharp",
    base: 2, growth: 2, maxLevel: 3, clickMult: 1,
  },
  diamond: {
    name: "Diamond Claws",
    desc: "+1x click multiplier",
    x: 140, y: 380, parent: "razor",
    base: 4, growth: 2, maxLevel: 3, clickMult: 1,
  },
  extra: {
    name: "Extra Income",
    desc: "+1x income",
    x: 300, y: 220, parent: "diamond",
    base: 3, growth: 2, maxLevel: 2, mult: 1,
  },
  nest: {
    name: "Cozy Nest",
    desc: "+1x auto-click multiplier",
    x: 940, y: 640, parent: "double",
    base: 1, growth: 2, maxLevel: 3, autoMult: 1,
  },
  luxury: {
    name: "Luxury Nest",
    desc: "+1x auto-click multiplier",
    x: 1140, y: 520, parent: "nest",
    base: 2, growth: 2, maxLevel: 3, autoMult: 1,
  },
  palace: {
    name: "Palace Nest",
    desc: "+1x auto-click multiplier",
    x: 1260, y: 380, parent: "luxury",
    base: 4, growth: 2, maxLevel: 3, autoMult: 1,
  },
  bonus: {
    name: "Bonus Income",
    desc: "+1x income",
    x: 1100, y: 220, parent: "palace",
    base: 3, growth: 2, maxLevel: 2, mult: 1,
  },
  points: {
    name: "More Points",
    desc: "+1 point per rebirth",
    x: 700, y: 540, parent: "double",
    base: 1, growth: 2, maxLevel: 4, points: 1,
  },
  more: {
    name: "Even More Points",
    desc: "+1 point per rebirth",
    x: 700, y: 340, parent: "points",
    base: 2, growth: 2, maxLevel: 4, points: 1,
  },
  plenty: {
    name: "Plenty of Points",
    desc: "+2 points per rebirth",
    x: 700, y: 140, parent: "more",
    base: 4, growth: 2, maxLevel: 3, points: 2,
  },
};

const NODE_W = 180;
const NODE_H = 90;

const mult = () => 1;

function clawsCost() {
  return CLAWS_BASE + clawsCount * CLAWS_STEP;
}

function petterCost() {
  return PETTER_BASE + petterCount * PETTER_STEP;
}

function megaClawCost() {
  return 750 * Math.pow(2, megaClawCount);
}

function superPetterCost() {
  return 3750 * Math.pow(2, superPetterCount);
}

function rebirthCost() {
  return REBIRTH_BASE * Math.pow(REBIRTH_GROWTH, rebirthCount);
}

function addClick() {
  clicks += (perClick + treePerClick) * mult() * treeMult * treeClickMult;
  recent.push(performance.now());
  counter.textContent = clicks.toLocaleString();
  spawnPop();
  updateUpgrades();
  updateRebirth();
}

function spawnPop() {
  const rect = cat.getBoundingClientRect();
  const el = document.createElement("div");
  el.className = "pop";
  el.textContent = "+" + ((perClick + treePerClick) * mult() * treeMult * treeClickMult);
  el.style.left = rect.left + rect.width * (0.2 + Math.random() * 0.6) + "px";
  el.style.top = rect.top + rect.height * 0.15 + "px";
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

function spawnRipple(x, y) {
  const el = document.createElement("div");
  el.className = "ripple";
  el.style.left = x + "px";
  el.style.top = y + "px";
  document.body.appendChild(el);
  el.addEventListener("animationend", () => el.remove());
}

cat.addEventListener("pointerdown", (e) => {
  e.preventDefault();
  cat.style.transform = "scale(0.92)";
  addClick();
  spawnRipple(e.clientX, e.clientY);
});

cat.addEventListener("pointerup", () => {
  cat.style.transform = "";
});

cat.addEventListener("pointerleave", () => {
  cat.style.transform = "";
});

arrow.addEventListener("click", () => {
  const open = menu.classList.toggle("open");
  arrow.classList.toggle("open", open);
});

clawsBtn.addEventListener("click", () => {
  if (clicks >= clawsCost()) {
    clicks -= clawsCost();
    perClick++;
    clawsCount++;
    counter.textContent = clicks.toLocaleString();
    updateAll();
  }
});

petterBtn.addEventListener("click", () => {
  if (clicks >= petterCost()) {
    clicks -= petterCost();
    perSecond++;
    petterCount++;
    counter.textContent = clicks.toLocaleString();
    updateAll();
  }
});

megaClawBtn.addEventListener("click", () => {
  if (clicks >= megaClawCost()) {
    clicks -= megaClawCost();
    perClick += 10;
    megaClawCount++;
    counter.textContent = clicks.toLocaleString();
    updateAll();
  }
});

superPetterBtn.addEventListener("click", () => {
  if (clicks >= superPetterCost()) {
    clicks -= superPetterCost();
    perSecond += 10;
    superPetterCount++;
    counter.textContent = clicks.toLocaleString();
    updateAll();
  }
});

function doRebirth() {
  if (clicks < rebirthCost()) return;
  rebirthCount += 1;
  rebirths += pointsPerRebirth;
  treeMult += 1;
  clicks = 0;
  perClick = 1;
  perSecond = 0;
  clawsCount = 0;
  petterCount = 0;
  megaClawCount = 0;
  superPetterCount = 0;
  counter.textContent = "0";
  openTree();
  updateAll();
}

rebirthBtn.addEventListener("click", doRebirth);

function isShown(id) {
  const node = TREE[id];
  if (node.parent === null) return true;
  if (node.parent === "double") return treeLevels.double > 0;
  return treeLevels[node.parent] >= TREE[node.parent].maxLevel;
}

function isUnlocked(id) {
  const node = TREE[id];
  if (node.parent === null) return true;
  if (node.parent === "double") return treeLevels.double > 0;
  return treeLevels[node.parent] >= TREE[node.parent].maxLevel;
}

function isBuyable(id) {
  const n = TREE[id];
  return isShown(id) && isUnlocked(id) && treeLevels[id] < n.maxLevel;
}

function buildTree() {
  treeNodes.innerHTML = "";
  for (const id of Object.keys(TREE)) {
    const n = TREE[id];
    treeLevels[id] = 0;
    const el = document.createElement("div");
    el.className = "node";
    el.id = "node-" + id;
    el.style.left = n.x + "px";
    el.style.top = n.y + "px";
    el.innerHTML =
      `<span class="n-name">${n.name}</span>` +
      `<span class="n-desc">${n.desc}</span>` +
      `<span class="n-cost">Cost: ${nodeCost(id, 0)} pt</span>`;
    el.addEventListener("click", () => buyNode(id));
    treeNodes.appendChild(el);
  }
}

function nodeCost(id, level) {
  const n = TREE[id];
  return Math.round(n.base * Math.pow(n.growth, level));
}

function buyNode(id) {
  if (!isBuyable(id)) return;
  const n = TREE[id];
  const level = treeLevels[id];
  const cost = nodeCost(id, level);
  if (rebirths < cost) return;
  rebirths -= cost;
  treeLevels[id] = level + 1;
  if (n.mult) treeMult += n.mult;
  if (n.points) pointsPerRebirth += n.points;
  if (n.perClick) treePerClick += n.perClick;
  if (n.perSecond) treePerSecond += n.perSecond;
  if (n.clickMult) treeClickMult += n.clickMult;
  if (n.autoMult) treeAutoMult += n.autoMult;
  updateAll();
}

function drawTree() {
  const lines = [];
  for (const id of Object.keys(TREE)) {
    const n = TREE[id];
    if (!n.parent || treeLevels[n.parent] <= 0) continue;
    const p = TREE[n.parent];
    const cx = (node) => node.x + NODE_W / 2;
    const cy = (node) => node.y + NODE_H / 2;
    lines.push(
      `<line x1="${cx(p)}" y1="${cy(p)}" x2="${cx(n)}" y2="${cy(n)}"/>`
    );
  }
  treeLines.innerHTML = lines.join("");
}

function updateTree() {
  treePoints.textContent = rebirths;
  for (const id of Object.keys(TREE)) {
    const el = document.getElementById("node-" + id);
    if (!el) continue;
    const n = TREE[id];
    const level = treeLevels[id];
    const maxed = level >= n.maxLevel;
    const shown = isShown(id);
    el.classList.toggle("bought", maxed);
    el.classList.toggle("locked", shown && !isUnlocked(id));
    el.style.display = shown ? "" : "none";
    const costEl = el.querySelector(".n-cost");
    if (maxed) {
      costEl.textContent = "Maxed";
    } else {
      costEl.textContent = "Cost: " + nodeCost(id, level) + " pt";
    }
    el.querySelector(".n-desc").textContent =
      n.desc + " (" + level + "/" + n.maxLevel + ")";
  }
  drawTree();
}

function openTree() {
  treeOverlay.classList.add("open");
  const rect = treeStage.getBoundingClientRect();
  const root = TREE.double;
  view.scale = 0.8;
  view.x = rect.width / 2 - (root.x + NODE_W / 2) * view.scale;
  view.y = rect.height / 2 - (root.y + NODE_H / 2) * view.scale;
  applyView();
  updateTree();
}

treeClose.addEventListener("click", () => {
  treeOverlay.classList.remove("open");
});

let view = { x: 0, y: 0, scale: 0.8 };
let dragging = false;
let start = { x: 0, y: 0, vx: 0, vy: 0 };

function applyView() {
  treeWorld.style.transform =
    `translate(${view.x}px, ${view.y}px) scale(${view.scale})`;
}

treeStage.addEventListener("wheel", (e) => {
  e.preventDefault();
  const rect = treeStage.getBoundingClientRect();
  const mx = e.clientX - rect.left;
  const my = e.clientY - rect.top;
  const factor = Math.exp(-e.deltaY * 0.0012);
  const newScale = Math.min(2.5, Math.max(0.35, view.scale * factor));
  const wx = (mx - view.x) / view.scale;
  const wy = (my - view.y) / view.scale;
  view.x = mx - wx * newScale;
  view.y = my - wy * newScale;
  view.scale = newScale;
  applyView();
});

treeStage.addEventListener("pointerdown", (e) => {
  if (e.target.closest(".node")) return;
  dragging = true;
  treeStage.classList.add("dragging");
  start = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
  treeStage.setPointerCapture(e.pointerId);
});

treeStage.addEventListener("pointermove", (e) => {
  if (!dragging) return;
  view.x = start.vx + (e.clientX - start.x);
  view.y = start.vy + (e.clientY - start.y);
  applyView();
});

treeStage.addEventListener("pointerup", () => {
  dragging = false;
  treeStage.classList.remove("dragging");
});

function updateRebirth() {
  rebirthCostEl.textContent = rebirthCost().toLocaleString();
  rebirthBtn.disabled = clicks < rebirthCost();
}

function updateUpgrades() {
  const megaUnlocked = treeLevels.double > 0;
  megaClawBtn.style.display = megaUnlocked ? "" : "none";
  superPetterBtn.style.display = megaUnlocked ? "" : "none";
  clawsBtn.querySelector(".u-cost").textContent =
    "Cost: " + clawsCost().toLocaleString();
  petterBtn.querySelector(".u-cost").textContent =
    "Cost: " + petterCost().toLocaleString();
  megaClawBtn.querySelector(".u-cost").textContent =
    "Cost: " + megaClawCost().toLocaleString();
  superPetterBtn.querySelector(".u-cost").textContent =
    "Cost: " + superPetterCost().toLocaleString();
  clawsBtn.disabled = clicks < clawsCost();
  petterBtn.disabled = clicks < petterCost();
  megaClawBtn.disabled = clicks < megaClawCost();
  superPetterBtn.disabled = clicks < superPetterCost();
}

function updateAll() {
  updateUpgrades();
  updateRebirth();
  updateTree();
}

setInterval(() => {
  if (perSecond + treePerSecond > 0) {
    clicks += (perSecond + treePerSecond) * mult() * treeMult * treeAutoMult;
    counter.textContent = clicks.toLocaleString();
    updateAll();
  }
}, 1000);

function updateCps() {
  const now = performance.now();
  recent = recent.filter((t) => now - t < 1000);
  const passive =
    perSecond + treePerSecond > 0
      ? "  +" + ((perSecond + treePerSecond) * mult() * treeMult * treeAutoMult) + "/s"
      : "";
  cpsEl.textContent = recent.length + " clicks/sec" + passive;
  requestAnimationFrame(updateCps);
}
requestAnimationFrame(updateCps);
buildTree();
applyView();
updateAll();