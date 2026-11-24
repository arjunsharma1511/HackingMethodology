const STORAGE_KEY = "operationGlassboxV1";
const TOTAL = 18;
const defaultState = { completed: [], activeStage: 0 };
let state = loadState();

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadState() {
  try { return { ...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) }; }
  catch { return { ...defaultState }; }
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function complete(id) {
  if (!state.completed.includes(id)) { state.completed.push(id); saveState(); updateProgress(); toast("Checkpoint complete. Progress saved."); }
}
function updateProgress() {
  const count = Math.min(TOTAL, state.completed.length);
  $("#progressText").textContent = `${count}/${TOTAL} complete`; $("#progressBar").value = count;
  $("#completeCard").classList.toggle("show", count === TOTAL);
}
function toast(message) {
  const box = $("#toast"); box.textContent = message; box.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => box.classList.remove("show"), 2200);
}
function setFeedback(selector, message, good) { const box = $(selector); box.textContent = message; box.className = `feedback ${good ? "good" : "bad"}`; }

const stages = [
  {
    name: "Reconnaissance", short: "Recon", icon: "01",
    summary: "Collect authorised information about the target and its visible footprint.",
    what: "Footprinting records domains, addresses, subdomains, paths, technology clues, ownership, and scope-relevant public facts.",
    why: "The assessment needs a reliable picture of the visible attack surface before deciding what should be examined next.",
    output: "A dated, sourced inventory that separates confirmed facts, clues, assumptions, and items outside scope.",
    chips: ["portal.training.example", "198.51.100.25", "admin.portal.training.example", "instructor.portal.training.example", "/login", "/labs/linux/room1"],
    question: "Which item is the best reconnaissance output?",
    options: ["A sourced inventory of domains, subdomains, paths, addresses, and technology clues", "A claim that every discovered host is vulnerable", "A hidden account created on the target"], answer: 0,
    explanation: "Reconnaissance gathers and organises information. It does not prove a vulnerability or authorise changes to a target."
  },
  {
    name: "Scanning", short: "Scan", icon: "02",
    summary: "Identify reachable systems, exposed ports, and basic network response within the authorised scope.",
    what: "A scan records which approved targets respond and which TCP or UDP ports appear open, closed, or filtered.",
    why: "The team needs to know which network entry points are exposed before deeper service identification.",
    output: "A time-stamped exposure list, such as TCP 22, 25, 21, 443, 3306, 7654, and 445 reported open on a fictional host.",
    chips: ["TCP/22 OPEN", "TCP/25 OPEN", "TCP/21 OPEN", "TCP/443 OPEN", "TCP/3306 OPEN", "TCP/445 OPEN"],
    question: "What does an open port directly prove?",
    options: ["A service endpoint responded as open during the observation", "The host has been compromised", "The service definitely contains an exploitable weakness"], answer: 0,
    explanation: "An open result describes exposure at a time. Service identity, version, configuration, and risk still require investigation."
  },
  {
    name: "Enumeration", short: "Enumerate", icon: "03",
    summary: "Add service identity, version clues, configuration context, and asset role to exposed ports.",
    what: "Enumeration asks what is listening, which product or protocol appears present, which version evidence exists, and what the service is used for.",
    why: "Port numbers suggest common services, but an analyst needs stronger evidence before evaluating relevance or risk.",
    output: "A service inventory such as 3306 → MySQL training version, 445 → SMB training version, and 7654 → unknown service requiring identification.",
    chips: ["22 · SSH", "25 · SMTP", "21 · FTP", "443 · HTTPS", "3306 · MySQL 3.1*", "445 · SMB 2.0*"],
    question: "Why is enumeration separate from scanning?",
    options: ["Scanning finds exposure; enumeration adds service and version context", "Enumeration removes all logs", "Scanning already proves every product version"], answer: 0,
    explanation: "A port state is an exposure observation. Enumeration develops the service evidence needed for analysis. Asterisks mark fictional classroom versions."
  },
  {
    name: "Vulnerability Analysis", short: "Analyse", icon: "04",
    summary: "Compare the service and application evidence with relevant weakness information.",
    what: "Analysis evaluates product, version, configuration, application behavior, asset role, exposure, affected conditions, and source reliability.",
    why: "A search result or version string can be outdated, inaccurate, or irrelevant to the exact deployment.",
    output: "A ranked hypothesis with evidence, affected conditions, confidence, possible impact, and a safe validation plan.",
    chips: ["Version evidence", "Configuration", "Trusted advisory", "Affected conditions", "Confidence", "Impact"],
    question: "How should the note “MySQL 3.1 has SQL injection” be treated?",
    options: ["As an unverified hypothesis requiring application and advisory evidence", "As proof that every database query is exploitable", "As permission to change the database"], answer: 0,
    explanation: "SQL injection commonly results from unsafe application query construction. A database version string alone does not prove it."
  },
  {
    name: "Gaining Access", short: "Access", icon: "05",
    summary: "Validate impact only through the safe proof permitted by the rules of engagement.",
    what: "This phase asks whether the confirmed weakness can produce the agreed security impact within the authorised boundary.",
    why: "A finding becomes more actionable when the assessor can provide controlled evidence of impact without exceeding scope.",
    output: "Minimal proof, timestamps, affected asset, account or role context, observed impact, and an immediate stop point.",
    chips: ["Authorised proof", "Minimal impact", "Timestamp", "Affected asset", "Stop condition", "Evidence preserved"],
    question: "Which action best fits an authorised gaining-access phase?",
    options: ["Perform only the pre-approved safe validation and record the result", "Continue beyond scope to see what else is possible", "Disable logging before testing"], answer: 0,
    explanation: "The rules of engagement define the permitted validation, limits, evidence, and stop conditions."
  },
  {
    name: "Maintaining Access", short: "Maintain", icon: "06",
    summary: "Understand the risk of continued unauthorised presence and identify evidence of persistence.",
    what: "From an attacker perspective, this phase seeks continued access. Defenders examine accounts, startup changes, scheduled activity, tokens, and other persistence indicators.",
    why: "A one-time entry and a durable foothold create different exposure, containment, and recovery needs.",
    output: "A documented persistence-risk assessment, observed indicators, affected identities or systems, and recommended removal and monitoring actions.",
    chips: ["New account?", "Startup change?", "Scheduled activity?", "Unexpected token?", "Repeated callback?", "Owner notified"],
    question: "What is the safest classroom outcome for this phase?",
    options: ["Document persistence risk and defender-visible indicators", "Install an unmanaged long-term access method", "Share credentials so access continues"], answer: 0,
    explanation: "The conceptual exercise records what defenders should look for and how persistence changes risk."
  },
  {
    name: "Clearing Tracks", short: "Tracks", icon: "07",
    summary: "Understand attempts to conceal activity and preserve the traces defenders need for investigation.",
    what: "This phase describes attempts to remove, alter, or obscure evidence such as logs, timestamps, audit settings, or activity records.",
    why: "Concealment can delay detection and damage the timeline needed for response, accountability, and recovery.",
    output: "A defender-focused list of log gaps, timestamp anomalies, disabled auditing, missing records, inconsistent sources, and preservation actions.",
    chips: ["Log gap", "Timestamp anomaly", "Audit disabled", "Missing record", "Source mismatch", "Preserve evidence"],
    question: "Which observation most strongly fits clearing-tracks analysis?",
    options: ["A sudden log gap that conflicts with another trusted data source", "A documented open port", "A normal domain registration record"], answer: 0,
    explanation: "Conflicting records and unexplained gaps can indicate evidence loss or alteration. Investigators preserve independent sources and document uncertainty."
  }
];

const orbitPositions = [[44,4],[75,18],[82,53],[63,79],[27,79],[8,53],[14,18]];
$("#orbitSteps").innerHTML = stages.map((stage, index) => `<div class="orbit-step" style="left:${orbitPositions[index][0]}%;top:${orbitPositions[index][1]}%"><b>${stage.icon}</b>${stage.short}</div>`).join("");
$("#stageNav").innerHTML = stages.map((stage, index) => `<button type="button" data-stage="${index}"><b>${stage.icon}</b><span>${stage.name}<small>${stage.summary}</small></span><em>○</em></button>`).join("");

function renderStage() {
  const stage = stages[state.activeStage];
  $$('#stageNav button').forEach((button, index) => {
    button.classList.toggle("active", index === state.activeStage); button.classList.toggle("done", state.completed.includes(`stage-${index + 1}`));
    $('em', button).textContent = state.completed.includes(`stage-${index + 1}`) ? "✓" : "○";
  });
  $("#stageView").innerHTML = `<div class="stage-header"><div><span>STEP ${stage.icon}</span><h3>${stage.name}</h3><p>${stage.summary}</p></div><div class="stage-badge">${stage.icon}</div></div><div class="three-questions"><article><b>WHAT</b><p>${stage.what}</p></article><article><b>WHY</b><p>${stage.why}</p></article><article><b>OUTPUT</b><p>${stage.output}</p></article></div><div class="evidence-animation"><div class="screen">${stage.chips.map(chip => `<div class="evidence-chip">${chip}</div>`).join("")}</div></div><div class="checkpoint"><label>${stage.question}<select id="stageAnswer"><option value="">Choose the best answer</option>${stage.options.map((option, index) => `<option value="${index}">${option}</option>`).join("")}</select></label><button class="primary" id="checkStage" type="button">Check understanding</button><p class="feedback" id="stageFeedback"></p></div>`;
  $("#checkStage").addEventListener("click", () => {
    if ($("#stageAnswer").value === "") return setFeedback("#stageFeedback", "Choose an answer first.", false);
    if (Number($("#stageAnswer").value) !== stage.answer) return setFeedback("#stageFeedback", "Review the What, Why, and Output panels, then try again.", false);
    complete(`stage-${state.activeStage + 1}`); renderStage(); setFeedback("#stageFeedback", stage.explanation, true);
  });
}
$("#stageNav").addEventListener("click", event => { const button = event.target.closest('[data-stage]'); if (!button) return; state.activeStage = Number(button.dataset.stage); saveState(); renderStage(); });
renderStage();

const evidenceTasks = [
  { evidence: "portal.training.example and admin.portal.training.example were recorded from approved sources.", answer: "Reconnaissance", options: ["Reconnaissance", "Scanning", "Clearing Tracks"] },
  { evidence: "TCP ports 22, 443, 3306, and 445 responded as open during the assessment window.", answer: "Scanning", options: ["Scanning", "Enumeration", "Maintaining Access"] },
  { evidence: "Port 445 appears to run the fictional SMB 2.0 training service.", answer: "Enumeration", options: ["Enumeration", "Reconnaissance", "Gaining Access"] },
  { evidence: "Version, configuration, exposure, and advisory conditions were compared for relevance.", answer: "Vulnerability Analysis", options: ["Vulnerability Analysis", "Scanning", "Clearing Tracks"] },
  { evidence: "The pre-approved safe proof confirmed limited impact and stopped at the agreed boundary.", answer: "Gaining Access", options: ["Gaining Access", "Enumeration", "Reconnaissance"] },
  { evidence: "An unexplained audit gap conflicts with independent firewall records, so evidence is preserved.", answer: "Clearing Tracks", options: ["Clearing Tracks", "Maintaining Access", "Scanning"] }
];
$("#evidenceMissions").innerHTML = evidenceTasks.map((task, index) => `<div class="evidence-task" data-task="${index}"><span>TASK ${String(index + 1).padStart(2, "0")}</span><p>${task.evidence}</p><select><option value="">Choose phase</option>${task.options.map(option => `<option>${option}</option>`).join("")}</select><button type="button">Check</button></div>`).join("");
$("#evidenceMissions").addEventListener("click", event => {
  if (event.target.tagName !== "BUTTON") return; const row = event.target.closest('.evidence-task'); const index = Number(row.dataset.task);
  if ($('select', row).value !== evidenceTasks[index].answer) return toast("That evidence belongs to another phase. Follow what the evidence directly describes.");
  row.classList.add("done"); complete(`evidence-${index + 1}`); event.target.textContent = "Correct";
});

const finalQuestions = [
  { q: "Which phase produced the list of open ports?", options: ["Scanning", "Reconnaissance", "Clearing Tracks"], a: 0 },
  { q: "Which phase connected port 445 with an SMB service clue?", options: ["Enumeration", "Gaining Access", "Maintaining Access"], a: 0 },
  { q: "What is wrong with treating “MySQL version found” as proof of SQL injection?", options: ["A version clue alone does not prove unsafe application query handling", "All MySQL services are automatically vulnerable", "SQL injection is the name of port 3306"], a: 0 },
  { q: "What should safe gaining-access evidence show?", options: ["Only the authorised validation, observed impact, and stop point", "Unapproved access to every reachable system", "A disabled audit trail"], a: 0 },
  { q: "Which evidence supports clearing-tracks analysis?", options: ["Log gaps or altered records that conflict with trusted sources", "A normal domain name", "A documented HTTPS port"], a: 0 }
];
$("#finalQuestions").innerHTML = finalQuestions.map((question, index) => `<div class="quiz-row"><label>${index + 1}. ${question.q}<select><option value="">Choose an answer</option>${question.options.map((option, optionIndex) => `<option value="${optionIndex}">${option}</option>`).join("")}</select></label></div>`).join("");
$("#checkFinal").addEventListener("click", () => {
  const selects = $$('#finalQuestions select'); if (selects.some(select => select.value === "")) return setFeedback("#finalFeedback", "Answer all five questions.", false);
  const wrong = finalQuestions.findIndex((question, index) => Number(selects[index].value) !== question.a);
  if (wrong !== -1) return setFeedback("#finalFeedback", `Question ${wrong + 1} needs another look. Use the case board and phase definitions.`, false);
  finalQuestions.forEach((_, index) => complete(`final-${index + 1}`)); setFeedback("#finalFeedback", "5/5 correct. The case follows evidence from scope through clearing-tracks analysis.", true); $("#completeCard").scrollIntoView({ behavior: "smooth", block: "center" });
});

$("#resume").addEventListener("click", () => { const target = state.completed.length >= 13 ? "#case" : state.completed.length >= 7 ? "#evidence" : "#method"; $(target).scrollIntoView({ behavior: "smooth" }); });
$("#reset").addEventListener("click", () => { if (!confirm("Reset all Operation Glassbox progress?")) return; localStorage.removeItem(STORAGE_KEY); location.reload(); });
updateProgress();
