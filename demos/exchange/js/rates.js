(function () {
  "use strict";

  var rates = [];
  var filtered = [];

  var listEl = document.getElementById("ratesList");
  var statusEl = document.getElementById("status");
  var searchInput = document.getElementById("searchInput");
  var sortSelect = document.getElementById("sortSelect");
  var favoritesOnly = document.getElementById("favoritesOnly");
  var lastUpdatedEl = document.getElementById("lastUpdated");

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.className = isError ? "notice error" : "notice";
  }

  function formatRate(value) {
    return value.toFixed(4);
  }

  function applyFilters() {
    var term = searchInput.value.trim().toLowerCase();
    var favOnly = favoritesOnly.checked;
    var favorites = window.StorageAPI.getFavorites();

    filtered = rates.filter(function (rate) {
      var matchesSearch =
        rate.name.toLowerCase().includes(term) ||
        rate.code.toLowerCase().includes(term);
      var matchesFavorite = !favOnly || favorites.has(rate.code);
      return matchesSearch && matchesFavorite;
    });

    sortRates();
    renderRates();
  }

  function sortRates() {
    var sortValue = sortSelect.value;
    filtered.sort(function (a, b) {
      if (sortValue === "name") {
        return a.name.localeCompare(b.name);
      }
      if (sortValue === "buy-high") {
        return b.buy - a.buy;
      }
      if (sortValue === "buy-low") {
        return a.buy - b.buy;
      }
      if (sortValue === "sell-high") {
        return b.sell - a.sell;
      }
      if (sortValue === "sell-low") {
        return a.sell - b.sell;
      }
      return 0;
    });
  }

  function renderRates() {
    if (!filtered.length) {
      listEl.innerHTML = "<div class=\"notice\">No currencies match your search.</div>";
      return;
    }

    var favorites = window.StorageAPI.getFavorites();
    listEl.innerHTML = "";

    filtered.forEach(function (rate) {
      var row = document.createElement("div");
      row.className = "rate-row";

      var title = document.createElement("div");
      title.innerHTML =
        "<div class=\"rate-title\">" +
        rate.name +
        "</div><div class=\"rate-sub\">" +
        rate.code +
        "</div>";

      var buy = document.createElement("div");
      buy.innerHTML =
        "<div class=\"rate-sub\">Buy</div><div class=\"rate-value\">" +
        formatRate(rate.buy) +
        "</div>";

      var sell = document.createElement("div");
      sell.innerHTML =
        "<div class=\"rate-sub\">Sell</div><div class=\"rate-value\">" +
        formatRate(rate.sell) +
        "</div>";

      var favWrap = document.createElement("div");
      var favButton = document.createElement("button");
      favButton.className = "favorite-btn" + (favorites.has(rate.code) ? " active" : "");
      favButton.type = "button";
      favButton.setAttribute("aria-label", "Toggle favorite");
      favButton.textContent = favorites.has(rate.code) ? "★" : "☆";
      favButton.addEventListener("click", function () {
        var isFav = window.StorageAPI.toggleFavorite(rate.code);
        favButton.className = "favorite-btn" + (isFav ? " active" : "");
        favButton.textContent = isFav ? "★" : "☆";
        if (favoritesOnly.checked) {
          applyFilters();
        }
      });

      favWrap.appendChild(favButton);

      row.appendChild(title);
      row.appendChild(buy);
      row.appendChild(sell);
      row.appendChild(favWrap);

      listEl.appendChild(row);
    });
  }

  function updateLastUpdated() {
    var stamp = window.StorageAPI.getLastUpdated();
    if (stamp) {
      var date = new Date(stamp);
      lastUpdatedEl.textContent = "Last updated: " + date.toLocaleString();
    } else {
      lastUpdatedEl.textContent = "Last updated: Default rates.";
    }
  }

  function init() {
    setStatus("Loading rates…", false);
    window.DataAPI
      .getRates()
      .then(function (data) {
        rates = data;
        filtered = data.slice();
        window.StorageAPI.recordHistory(rates);
        updateLastUpdated();
        statusEl.textContent = "";
        statusEl.className = "";
        applyFilters();
      })
      .catch(function () {
        setStatus("Sorry, we couldn't load rates right now. Please try again.", true);
      });
  }

  searchInput.addEventListener("input", applyFilters);
  sortSelect.addEventListener("change", applyFilters);
  favoritesOnly.addEventListener("change", applyFilters);

  init();
})();
