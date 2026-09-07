const state = {
  filter: "all",
  documents: [
    {
      id: "doc-1",
      source: "KPN Mobile BV",
      type: "purchase invoice",
      date: "2026-07-14",
      amount: -84.7,
      vat: 14.7,
      ledger: "Telecom costs",
      vatCode: "Input VAT 21%",
      confidence: 0.96,
      status: "auto",
      matchedBankId: "bank-1"
    },
    {
      id: "doc-2",
      source: "Studio North",
      type: "sales invoice",
      date: "2026-08-03",
      amount: 1815,
      vat: 315,
      ledger: "Service revenue 21%",
      vatCode: "Output VAT 21%",
      confidence: 0.98,
      status: "auto",
      matchedBankId: "bank-2"
    },
    {
      id: "doc-3",
      source: "Apple Store",
      type: "purchase invoice",
      date: "2026-08-18",
      amount: -1451.99,
      vat: 252.0,
      ledger: "Hardware capital expenditure",
      vatCode: "Input VAT 21%",
      confidence: 0.74,
      status: "review",
      reason: "Possible capital expenditure instead of direct cost",
      matchedBankId: "bank-3"
    },
    {
      id: "doc-4",
      source: "Market Restaurant",
      type: "receipt",
      date: "2026-09-01",
      amount: -126.4,
      vat: 10.44,
      ledger: "Representation costs limited deductible",
      vatCode: "Mixed VAT",
      confidence: 0.61,
      status: "review",
      reason: "Business purpose is missing",
      matchedBankId: "bank-4"
    }
  ],
  transactions: [
    { id: "bank-1", date: "2026-07-16", name: "KPN Mobile", amount: -84.7, matched: true },
    { id: "bank-2", date: "2026-08-09", name: "Studio North payment", amount: 1815, matched: true },
    { id: "bank-3", date: "2026-08-18", name: "Apple Store Amsterdam", amount: -1451.99, matched: true },
    { id: "bank-4", date: "2026-09-01", name: "Market Restaurant", amount: -126.4, matched: true },
    { id: "bank-5", date: "2026-09-02", name: "Owner withdrawal", amount: -300, matched: false }
  ],
  openItems: [
    { name: "Invoice S-2026-083 to Delta Legal", type: "Accounts receivable", amount: 2420, date: "2026-09-04" },
    { name: "Exact Online subscription", type: "Accounts payable", amount: -58.08, date: "2026-09-05" },
    { name: "MacBook Pro 2026", type: "Capital expenditure", amount: -1451.99, date: "2026-08-18" }
  ]
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(value);

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

function classifyFile(file, index) {
  const patterns = [
    ["purchase invoice", "Software costs", "Input VAT 21%", -119.79, 20.79, 0.88],
    ["sales invoice", "Service revenue 21%", "Output VAT 21%", 605, 105, 0.93],
    ["receipt", "Representation costs limited deductible", "Mixed VAT", -72.5, 5.99, 0.58]
  ];
  const pattern = patterns[index % patterns.length];

  return {
    id: `upload-${Date.now()}-${index}`,
    source: file.name.replace(/\.[^.]+$/, ""),
    type: pattern[0],
    date: new Date().toISOString().slice(0, 10),
    amount: pattern[3],
    vat: pattern[4],
    ledger: pattern[1],
    vatCode: pattern[2],
    confidence: pattern[5],
    status: pattern[5] >= 0.85 ? "auto" : "review",
    reason: pattern[5] >= 0.85 ? "" : "New counterparty or insufficient evidence",
    matchedBankId: null
  };
}

function totals() {
  const outgoingVat = state.documents
    .filter((doc) => doc.amount > 0)
    .reduce((sum, doc) => sum + doc.vat, 0);
  const inputVat = state.documents
    .filter((doc) => doc.amount < 0)
    .reduce((sum, doc) => sum + doc.vat, 0);
  const revenue = state.documents
    .filter((doc) => doc.amount > 0)
    .reduce((sum, doc) => sum + (doc.amount - doc.vat), 0);
  const costs = state.documents
    .filter((doc) => doc.amount < 0 && !doc.ledger.includes("Capital expenditure"))
    .reduce((sum, doc) => sum + Math.abs(doc.amount) - doc.vat, 0);
  const autoCount = state.documents.filter((doc) => doc.status === "auto").length;

  return {
    vatPayable: outgoingVat - inputVat,
    profitImpact: revenue - costs,
    automationRate: Math.round((autoCount / state.documents.length) * 100),
    needsReview: state.documents.filter((doc) => doc.status === "review").length
  };
}

function renderMetrics() {
  const data = totals();
  document.querySelector("#vatPayable").textContent = formatCurrency(data.vatPayable);
  document.querySelector("#profitImpact").textContent = formatCurrency(data.profitImpact);
  document.querySelector("#automationRate").textContent = `${data.automationRate}%`;
  document.querySelector("#needsReview").textContent = data.needsReview;
}

function renderTransactions() {
  document.querySelector("#transactions").innerHTML = state.transactions
    .map((tx) => `
      <article class="transaction">
        <div>
          <strong>${tx.name}</strong>
          <div class="source-meta">${formatDate(tx.date)}</div>
        </div>
        <span class="amount ${tx.amount < 0 ? "negative" : "positive"}">${formatCurrency(tx.amount)}</span>
        <span class="badge ${tx.matched ? "" : "review"}">${tx.matched ? "Match" : "Open"}</span>
      </article>
    `)
    .join("");
}

function renderProposals() {
  const visible = state.documents.filter((doc) => state.filter === "all" || doc.status === state.filter);
  document.querySelector("#proposals").innerHTML = visible
    .map((doc) => `
      <div class="table-row" role="row">
        <span>
          <span class="source-title">${doc.source}</span>
          <span class="source-meta">${doc.type} | ${formatDate(doc.date)} | ${formatCurrency(doc.amount)}</span>
        </span>
        <span>
          ${doc.ledger}
          <span class="confidence">${Math.round(doc.confidence * 100)}% confidence${doc.reason ? ` | ${doc.reason}` : ""}</span>
        </span>
        <span>${doc.vatCode}</span>
        <span><span class="badge ${doc.status === "review" ? "review" : ""}">${doc.status === "auto" ? "Auto" : "Review"}</span></span>
        <span><button type="button" data-approve="${doc.id}">Approve</button></span>
      </div>
    `)
    .join("");
}

function renderOpenItems() {
  document.querySelector("#openItems").innerHTML = state.openItems
    .map((item) => `
      <article class="open-item">
        <div>
          <strong>${item.name}</strong>
          <div class="source-meta">${item.type} | ${formatDate(item.date)}</div>
        </div>
        <span class="amount ${item.amount < 0 ? "negative" : "positive"}">${formatCurrency(item.amount)}</span>
      </article>
    `)
    .join("");
}

function renderVatLines() {
  const data = totals();
  const salesVat = state.documents.filter((doc) => doc.amount > 0).reduce((sum, doc) => sum + doc.vat, 0);
  const purchaseVat = state.documents.filter((doc) => doc.amount < 0).reduce((sum, doc) => sum + doc.vat, 0);
  const lines = [
    ["1a Supplies high rate", salesVat],
    ["5b Input VAT", -purchaseVat],
    ["Draft balance", data.vatPayable]
  ];

  document.querySelector("#vatLines").innerHTML = lines
    .map(([label, value]) => `
      <article class="vat-line">
        <strong>${label}</strong>
        <span class="amount">${formatCurrency(value)}</span>
      </article>
    `)
    .join("");
}

function renderQueue(files = []) {
  const queue = document.querySelector("#queue");
  if (!files.length) {
    queue.innerHTML = "";
    return;
  }

  queue.innerHTML = files
    .map((file) => `
      <article class="queue-item">
        <div>
          <strong>${file.name}</strong>
          <div class="source-meta">Extracted and added to proposals</div>
        </div>
        <span class="badge">New</span>
      </article>
    `)
    .join("");
}

function render() {
  renderMetrics();
  renderTransactions();
  renderProposals();
  renderOpenItems();
  renderVatLines();
}

function handleFiles(files) {
  const fileList = [...files];
  const newDocuments = fileList.map(classifyFile);
  state.documents = [...newDocuments, ...state.documents];
  renderQueue(fileList);
  render();
}

document.querySelector("#fileInput").addEventListener("change", (event) => {
  handleFiles(event.target.files);
});

document.querySelector("#dropzone").addEventListener("dragover", (event) => {
  event.preventDefault();
  event.currentTarget.classList.add("is-dragging");
});

document.querySelector("#dropzone").addEventListener("dragleave", (event) => {
  event.currentTarget.classList.remove("is-dragging");
});

document.querySelector("#dropzone").addEventListener("drop", (event) => {
  event.preventDefault();
  event.currentTarget.classList.remove("is-dragging");
  handleFiles(event.dataTransfer.files);
});

document.querySelector(".toolbar").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-filter]");
  if (!button) return;
  state.filter = button.dataset.filter;
  document.querySelectorAll(".toolbar button").forEach((item) => item.classList.remove("is-active"));
  button.classList.add("is-active");
  renderProposals();
});

document.querySelector("#proposals").addEventListener("click", (event) => {
  const button = event.target.closest("button[data-approve]");
  if (!button) return;
  const documentItem = state.documents.find((doc) => doc.id === button.dataset.approve);
  if (documentItem) {
    documentItem.status = "auto";
    documentItem.confidence = Math.max(documentItem.confidence, 0.9);
    documentItem.reason = "";
    render();
  }
});

document.querySelector("#syncBank").addEventListener("click", () => {
  state.transactions = [
    { id: `bank-${Date.now()}`, date: new Date().toISOString().slice(0, 10), name: "New bank transaction", amount: -49.95, matched: false },
    ...state.transactions
  ];
  renderTransactions();
});

render();
