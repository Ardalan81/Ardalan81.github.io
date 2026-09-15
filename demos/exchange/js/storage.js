(function () {
  "use strict";

  var FAVORITES_KEY = "aj_portfolio_demo_hr_favorites";
  var CUSTOM_RATES_KEY = "aj_portfolio_demo_hr_custom_rates";
  var LAST_UPDATED_KEY = "aj_portfolio_demo_hr_last_updated";
  var HISTORY_KEY = "aj_portfolio_demo_hr_history";

  function readJSON(key, fallback) {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) {
        return fallback;
      }
      return JSON.parse(raw);
    } catch (error) {
      return fallback;
    }
  }

  function writeJSON(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function getFavorites() {
    var data = readJSON(FAVORITES_KEY, []);
    return new Set(data);
  }

  function saveFavorites(favoritesSet) {
    writeJSON(FAVORITES_KEY, Array.from(favoritesSet));
  }

  function toggleFavorite(code) {
    var favorites = getFavorites();
    if (favorites.has(code)) {
      favorites.delete(code);
    } else {
      favorites.add(code);
    }
    saveFavorites(favorites);
    return favorites.has(code);
  }

  function isFavorite(code) {
    return getFavorites().has(code);
  }

  function getCustomRates() {
    return readJSON(CUSTOM_RATES_KEY, {});
  }

  function saveCustomRate(code, buy, sell) {
    var customRates = getCustomRates();
    customRates[code] = { buy: buy, sell: sell };
    writeJSON(CUSTOM_RATES_KEY, customRates);
    setLastUpdated(new Date().toISOString());
  }

  function clearCustomRates() {
    writeJSON(CUSTOM_RATES_KEY, {});
    setLastUpdated(new Date().toISOString());
  }

  function setLastUpdated(isoString) {
    localStorage.setItem(LAST_UPDATED_KEY, isoString);
  }

  function getLastUpdated() {
    return localStorage.getItem(LAST_UPDATED_KEY);
  }

  function mergeRates(baseRates) {
    var customRates = getCustomRates();
    return baseRates.map(function (rate) {
      var override = customRates[rate.code];
      if (override) {
        return {
          name: rate.name,
          code: rate.code,
          buy: override.buy,
          sell: override.sell
        };
      }
      return Object.assign({}, rate);
    });
  }

  function recordHistory(rates) {
    var today = formatDate(new Date());
    var history = readJSON(HISTORY_KEY, []);

    if (history.length < 2) {
      history = buildSeededHistory(rates, 30);
    }

    var map = {};
    rates.forEach(function (rate) {
      map[rate.code] = rate.mid;
    });

    var todayEntry = history.find(function (entry) {
      return entry.date === today;
    });

    if (todayEntry) {
      todayEntry.rates = map;
    } else {
      history.push({ date: today, rates: map });
    }

    if (history.length > 30) {
      history = history.slice(history.length - 30);
    }

    writeJSON(HISTORY_KEY, history);
    return history;
  }

  function getHistory() {
    return readJSON(HISTORY_KEY, []);
  }

  function formatDate(date) {
    return date.toISOString().slice(0, 10);
  }

  function buildSeededHistory(rates, days) {
    var seeded = [];
    var today = new Date();

    for (var offset = days - 1; offset >= 0; offset -= 1) {
      var date = new Date(today);
      date.setDate(today.getDate() - offset);
      var map = {};

      rates.forEach(function (rate, index) {
        var base = rate.mid;
        var direction = rate.code.charCodeAt(0) % 2 === 0 ? 1 : -1;
        var step = (base * 0.015) / days;
        var drift = direction * step * (days - 1 - offset);
        var wiggle = Math.sin((days - offset + index) * 0.7) * base * 0.003;
        var value = base + drift + wiggle;
        if (value <= 0) {
          value = base;
        }
        map[rate.code] = Number(value.toFixed(4));
      });

      seeded.push({ date: formatDate(date), rates: map });
    }

    return seeded;
  }

  window.StorageAPI = {
    getFavorites: getFavorites,
    toggleFavorite: toggleFavorite,
    isFavorite: isFavorite,
    getCustomRates: getCustomRates,
    saveCustomRate: saveCustomRate,
    clearCustomRates: clearCustomRates,
    setLastUpdated: setLastUpdated,
    getLastUpdated: getLastUpdated,
    mergeRates: mergeRates,
    recordHistory: recordHistory,
    getHistory: getHistory
  };
})();
