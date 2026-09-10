import { createNlVatReturnLines } from "./src/countries/nl/vatReturn.js";
import { getFiscalCategory } from "./src/countries/nl/fiscalCategories.js";
import { getVatCode } from "./src/countries/nl/vatCodes.js";
import { initialState } from "./src/data/demoData.js";
import { createBalanceAdjustmentProposals } from "./src/services/balanceAdjustmentService.js";
import { classifyUploadedFile } from "./src/services/documentService.js";
import { calculateFiscalSummary } from "./src/services/fiscalSummaryService.js";
import { createProfitLossStatement } from "./src/services/profitLossService.js";
import { approveProposal, syncBankFeed } from "./src/services/workflowService.js";

const state = structuredClone(initialState);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-GB", { style: "currency", currency: "EUR" }).format(value);

const formatDate = (value) =>
  new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

function renderMetrics() {
  const summary = calculateFiscalSummary(state.documents);
  document.querySelector("#vatPayable").textContent = formatCurrency(summary.vatPayable);
  document.querySelector("#profitImpact").textContent = formatCurrency(summary.profitImpact);
  document.querySelector("#automationRate").textContent = `${summary.automationRate}%`;
  document.querySelector("#needsReview").textContent = summary.needsReview;
}

function renderTransactions() {
  document.querySelector("#transactions").innerHTML = state.transactions
    .map((transaction) => `
      <article class="transaction">
        <div>
          <strong>${transaction.name}</strong>
          <div class="source-meta">${formatDate(transaction.date)}</div>
        </div>
        <span class="amount ${transaction.amount < 0 ? "negative" : "positive"}">${formatCurrency(transaction.amount)}</span>
        <span class="badge ${transaction.matched ? "" : "review"}">${transaction.matched ? "Match" : "Open"}</span>
      </article>
    `)
    .join("");
}

function renderProposals() {
  const visibleDocuments = state.documents.filter((documentItem) =>
    state.filter === "all" || documentItem.status === state.filter
  );

  document.querySelector("#proposals").innerHTML = visibleDocuments
    .map((documentItem) => {
      const category = getFiscalCategory(documentItem.fiscalCategory);
      const vatCode = getVatCode(documentItem.vatCode);

      return `
        <div class="table-row" role="row">
          <span>
            <span class="source-title">${documentItem.source}</span>
            <span class="source-meta">${documentItem.displayType} | ${formatDate(documentItem.date)} | ${formatCurrency(documentItem.amountIncludingVat)}</span>
          </span>
          <span>
            ${category.label}
            <span class="confidence">${Math.round(documentItem.confidence * 100)}% confidence${documentItem.reviewReason ? ` | ${documentItem.reviewReason}` : ""}</span>
          </span>
          <span>${vatCode.label}</span>
          <span><span class="badge ${documentItem.status === "review" ? "review" : ""}">${documentItem.status === "auto" ? "Auto" : "Review"}</span></span>
          <span><button type="button" data-approve="${documentItem.id}">Approve</button></span>
        </div>
      `;
    })
    .join("");
}

function renderOpenItems() {
  document.querySelector("#openItems").innerHTML = state.openItems
    .map((item) => `
      <article class="open-item">
        <div>
          <strong>${item.name}</strong>
          <div class="source-meta">${item.displayType} | ${formatDate(item.date)}</div>
        </div>
        <span class="amount ${item.amount < 0 ? "negative" : "positive"}">${formatCurrency(item.amount)}</span>
      </article>
    `)
    .join("");
}

function renderBalanceProposals() {
  document.querySelector("#balanceProposals").innerHTML = createBalanceAdjustmentProposals(state)
    .map((proposal) => `
      <article class="balance-proposal">
        <div>
          <strong>${proposal.title}</strong>
          <div class="source-meta">${proposal.description} | ${formatDate(proposal.date)}</div>
          <ul>
            <li>${proposal.balanceImpact}</li>
            <li>${proposal.profitImpact}</li>
            <li>${proposal.taxImpact}</li>
          </ul>
        </div>
        <span class="badge ${proposal.status === "review_required" ? "review" : ""}">
          ${proposal.status === "proposed" ? "Proposed" : "Review"}
        </span>
      </article>
    `)
    .join("");
}

function renderVatLines() {
  document.querySelector("#vatLines").innerHTML = createNlVatReturnLines(state.documents)
    .map((line) => `
      <article class="vat-line">
        <strong>${line.code} ${line.label}</strong>
        <span class="amount">${formatCurrency(line.amount)}</span>
      </article>
    `)
    .join("");
}

function renderStatementSection(section) {
  const lines = section.lines.length
    ? section.lines
    : [{ code: "empty", label: "No lines", amount: 0 }];

  return `
    <article class="statement-section">
      <header>
        <strong>${section.title}</strong>
        <strong>${formatCurrency(section.total)}</strong>
      </header>
      ${lines
        .map((line) => `
          <div class="statement-line">
            <span>${line.label}</span>
            <span>${formatCurrency(line.amount)}</span>
          </div>
        `)
        .join("")}
      <div class="statement-total">
        <span>Total ${section.title.toLowerCase()}</span>
        <span>${formatCurrency(section.total)}</span>
      </div>
    </article>
  `;
}

function renderProfitLossStatement() {
  const statement = createProfitLossStatement(state);
  document.querySelector("#profitLossOutput").innerHTML = `
    ${renderStatementSection(statement.revenue)}
    ${renderStatementSection(statement.expenses)}
    ${renderStatementSection(statement.depreciation)}
    <article class="statement-section net-profit">
      <div class="statement-line">
        <span>Net profit for ${statement.period}</span>
        <span>${formatCurrency(statement.netProfit)}</span>
      </div>
    </article>
  `;
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
  renderBalanceProposals();
  renderVatLines();
}

function handleFiles(files) {
  const fileList = [...files];
  const newDocuments = fileList.map(classifyUploadedFile);
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

  approveProposal(state, button.dataset.approve);
  render();
});

document.querySelector("#syncBank").addEventListener("click", () => {
  syncBankFeed(state);
  render();
});

document.querySelector("#generateProfitLoss").addEventListener("click", () => {
  renderProfitLossStatement();
});

render();
