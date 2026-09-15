(function () {
  "use strict";

  var amountInput = document.getElementById("amountInput");
  var fromSelect = document.getElementById("fromSelect");
  var toSelect = document.getElementById("toSelect");
  var resultEl = document.getElementById("resultValue");
  var statusEl = document.getElementById("status");

  var rates = [];

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.className = message ? (isError ? "notice error" : "notice") : "";
  }

  function formatNumber(value) {
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  }

  function getRate(code) {
    return rates.find(function (rate) {
      return rate.code === code;
    });
  }

  function convert() {
    var amount = Number(amountInput.value);
    if (!amountInput.value.trim()) {
      setStatus("Enter an amount to convert.", true);
      resultEl.textContent = "--";
      return;
    }
    if (Number.isNaN(amount) || amount <= 0) {
      setStatus("Please enter a positive number.", true);
      resultEl.textContent = "--";
      return;
    }

    var fromRate = getRate(fromSelect.value);
    var toRate = getRate(toSelect.value);

    if (!fromRate || !toRate) {
      setStatus("Please choose two currencies.", true);
      resultEl.textContent = "--";
      return;
    }

    var aedAmount = amount * fromRate.mid;
    var converted = aedAmount / toRate.mid;

    resultEl.textContent = formatNumber(converted) + " " + toRate.code;
    setStatus("", false);
  }

  function fillSelect(select, data) {
    select.innerHTML = "";
    data.forEach(function (rate) {
      var option = document.createElement("option");
      option.value = rate.code;
      option.textContent = rate.code + " - " + rate.name;
      select.appendChild(option);
    });
  }

  function init() {
    setStatus("Loading rates…", false);
    window.DataAPI
      .getRates()
      .then(function (data) {
        rates = data;
        fillSelect(fromSelect, rates);
        fillSelect(toSelect, rates);
        fromSelect.value = "USD";
        toSelect.value = "AED";
        statusEl.textContent = "";
        statusEl.className = "";
        convert();
      })
      .catch(function () {
        setStatus("Sorry, we couldn't load rates right now.", true);
      });
  }

  amountInput.addEventListener("input", convert);
  fromSelect.addEventListener("change", convert);
  toSelect.addEventListener("change", convert);

  init();
})();
