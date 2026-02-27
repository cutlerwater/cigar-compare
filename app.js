// app.js — simple demo data + rendering (no backend needed)

const sampleData = {
  cigar: {
    id: "padron-1964-torpedo",
    name: "Padron 1964 Anniversary Series Torpedo",
    vitola: "Torpedo",
    length: 6.0,
    ringGauge: 52,
    wrapper: "Maduro",
    strength: "Full",
  },
  offers: [
    // --- BOX (20ct) ---
    {
      id: "ofr_001",
      retailer: { name: "Retailer A", perks: "Free ship $99+", logoLetter: "A" },
      packType: "box",
      unitCount: 20,
      priceTotal: 248.0,
      inStock: true,
      updatedLabel: "2h ago",
      url: "#",
    },
    {
      id: "ofr_002",
      retailer: { name: "Retailer B", perks: "Points rewards", logoLetter: "B" },
      packType: "box",
      unitCount: 20,
      priceTotal: 259.99,
      inStock: true,
      updatedLabel: "5h ago",
      url: "#",
    },
    {
      id: "ofr_003",
      retailer: { name: "Retailer C", perks: "Limited stock", logoLetter: "C" },
      packType: "box",
      unitCount: 20,
      priceTotal: 245.0,
      inStock: false,
      updatedLabel: "1d ago",
      url: "#",
    },

    // --- 5-PACK ---
    {
      id: "ofr_101",
      retailer: { name: "Retailer A", perks: "Free ship $99+", logoLetter: "A" },
      packType: "five_pack",
      unitCount: 5,
      priceTotal: 62.5,
      inStock: true,
      updatedLabel: "3h ago",
      url: "#",
    },
    {
      id: "ofr_102",
      retailer: { name: "Retailer D", perks: "Weekly promos", logoLetter: "D" },
      packType: "five_pack",
      unitCount: 5,
      priceTotal: 59.95,
      inStock: true,
      updatedLabel: "9h ago",
      url: "#",
    },
    {
      id: "ofr_103",
      retailer: { name: "Retailer E", perks: "Fast shipping", logoLetter: "E" },
      packType: "five_pack",
      unitCount: 5,
      priceTotal: 57.5,
      inStock: false,
      updatedLabel: "2d ago",
      url: "#",
    },

    // --- SINGLE ---
    {
      id: "ofr_201",
      retailer: { name: "Retailer B", perks: "Points rewards", logoLetter: "B" },
      packType: "single",
      unitCount: 1,
      priceTotal: 14.25,
      inStock: true,
      updatedLabel: "1h ago",
      url: "#",
    },
    {
      id: "ofr_202",
      retailer: { name: "Retailer D", perks: "Weekly promos", logoLetter: "D" },
      packType: "single",
      unitCount: 1,
      priceTotal: 13.75,
      inStock: true,
      updatedLabel: "6h ago",
      url: "#",
    },
    {
      id: "ofr_203",
      retailer: { name: "Retailer C", perks: "Limited stock", logoLetter: "C" },
      packType: "single",
      unitCount: 1,
      priceTotal: 12.99,
      inStock: false,
      updatedLabel: "1d ago",
      url: "#",
    },
  ],
};

// --- State ---
const state = {
  packType: "box",      // "box" | "five_pack" | "single"
  inStockOnly: true,
  sortMode: "value",    // "value" | "total" | "recent"
};

// --- Helpers ---
function money(n) {
  return `$${n.toFixed(2)}`;
}

function perStick(offer) {
  // unitCount already matches pack type (1, 5, 20, etc.)
  return offer.priceTotal / offer.unitCount;
}

function statusPill(inStock) {
  if (inStock) {
    return `<span class="status status-good">In stock</span>`;
  }
  return `<span class="status status-bad">Out</span>`;
}

function packLabel(packType) {
  if (packType === "box") return "Box";
  if (packType === "five_pack") return "5-Pack";
  return "Single";
}

function sortOffers(offers) {
  const sorted = [...offers];

  if (state.sortMode === "value") {
    sorted.sort((a, b) => perStick(a) - perStick(b));
  } else if (state.sortMode === "total") {
    sorted.sort((a, b) => a.priceTotal - b.priceTotal);
  } else if (state.sortMode === "recent") {
    // In real life you'd sort by timestamp.
    // For demo, assume shorter label like "1h ago" is more recent than "1d ago"
    const score = (label) => {
      // crude parser: "2h ago", "1d ago"
      const m = label.match(/^(\d+)\s*([hd])\s*ago$/i);
      if (!m) return 9999;
      const num = parseInt(m[1], 10);
      const unit = m[2].toLowerCase();
      return unit === "h" ? num : num * 24;
    };
    sorted.sort((a, b) => score(a.updatedLabel) - score(b.updatedLabel));
  }

  return sorted;
}

function selectOffers() {
  let offers = sampleData.offers.filter(o => o.packType === state.packType);
  if (state.inStockOnly) offers = offers.filter(o => o.inStock);
  offers = sortOffers(offers);
  return offers;
}

// --- Rendering ---
function render() {
  // Update tabs active state
  document.querySelectorAll('[data-pack]').forEach(btn => {
    btn.classList.toggle("is-active", btn.dataset.pack === state.packType);
  });

  // Update in-stock switch
  const inStockEl = document.getElementById("inStockOnly");
  if (inStockEl) inStockEl.checked = state.inStockOnly;

  // Update sort select
  const sortEl = document.getElementById("sortMode");
  if (sortEl) sortEl.value = state.sortMode;

  // Update heading label + unit count
  const offers = selectOffers();

  const headingEl = document.getElementById("offerHeading");
  const unitEl = document.getElementById("unitCountLabel");
  if (headingEl) {
    headingEl.textContent = `${packLabel(state.packType)} offers`;
  }
  if (unitEl) {
    const exampleUnit = offers[0]?.unitCount ?? (state.packType === "box" ? 20 : state.packType === "five_pack" ? 5 : 1);
    unitEl.textContent =
      state.packType === "box"
        ? `(${exampleUnit} ct)`
        : state.packType === "five_pack"
          ? `(5 ct)`
          : `(single)`;
  }

  // Render rows
  const tbody = document.getElementById("offersBody");
  if (!tbody) return;

  if (offers.length === 0) {
    tbody.innerHTML = `
      <tr class="row-muted">
        <td colspan="6">No offers found for this view.</td>
      </tr>
    `;
  } else {
    tbody.innerHTML = offers.map(o => {
      const rowClass = o.inStock ? "" : "row-muted";
      const per = perStick(o);
      const perClass = (o.packType === "box") ? "mono gold" : "mono";

      const action = o.inStock
        ? `<a class="btn btn-ghost" href="${o.url}" target="_blank" rel="noopener">Go to store</a>`
        : `<button class="btn btn-ghost" disabled>Out of stock</button>`;

      return `
        <tr class="${rowClass}">
          <td>
            <div class="retailer">
              <div class="retailer-logo">${o.retailer.logoLetter}</div>
              <div>
                <div class="retailer-name">${o.retailer.name}</div>
                <div class="retailer-sub">${o.retailer.perks ?? ""}</div>
              </div>
            </div>
          </td>
          <td class="mono">${money(o.priceTotal)}</td>
          <td class="${perClass}">${money(per)}</td>
          <td>${statusPill(o.inStock)}</td>
          <td>${o.updatedLabel}</td>
          <td>${action}</td>
        </tr>
      `;
    }).join("");
  }

  // Update summary card (best value per stick for current tab)
  const best = offers[0];
  const bestPriceEl = document.getElementById("bestPerStick");
  const bestSubEl = document.getElementById("bestSub");
  const bestUpdatedEl = document.getElementById("bestUpdated");

  if (best && bestPriceEl) {
    bestPriceEl.textContent = money(perStick(best));
  }
  if (best && bestSubEl) {
    bestSubEl.textContent = `From ${money(best.priceTotal)} • ${best.unitCount} ct`;
  }
  if (bestUpdatedEl) {
    bestUpdatedEl.textContent = offers.length ? `Updated ${offers[0].updatedLabel}` : "No recent updates";
  }
}

// --- Events / init ---
function init() {
  // Tabs
  document.querySelectorAll('[data-pack]').forEach(btn => {
    btn.addEventListener("click", () => {
      state.packType = btn.dataset.pack;
      render();
    });
  });

  // In-stock only toggle
  const inStockEl = document.getElementById("inStockOnly");
  if (inStockEl) {
    inStockEl.addEventListener("change", (e) => {
      state.inStockOnly = e.target.checked;
      render();
    });
  }

  // Sort select
  const sortEl = document.getElementById("sortMode");
  if (sortEl) {
    sortEl.addEventListener("change", (e) => {
      state.sortMode = e.target.value;
      render();
    });
  }

  render();
}

document.addEventListener("DOMContentLoaded", init);