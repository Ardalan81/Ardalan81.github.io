(function () {
  "use strict";

  var currencySelect = document.getElementById("currencySelect");
  var rangeSelect = document.getElementById("rangeSelect");
  var listEl = document.getElementById("historyList");
  var statusEl = document.getElementById("status");
  var chartCanvas = document.getElementById("historyChart");
  var chartInstance = null;

  var rates = [];

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.className = message ? (isError ? "notice error" : "notice") : "";
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

  function renderList(entries, code) {
    if (!entries.length) {
      listEl.innerHTML = "<li class=\"history-item\">No history yet.</li>";
      return;
    }

    listEl.innerHTML = "";
    entries.forEach(function (entry) {
      var value = entry.rates[code];
      var item = document.createElement("li");
      item.className = "history-item";
      item.innerHTML = "<span>" + entry.date + "</span><strong>" + (value ? value.toFixed(4) : "--") + "</strong>";
      listEl.appendChild(item);
    });
  }

  function renderChart(labels, dataPoints) {
    if (!window.Chart) {
      return;
    }

    if (chartInstance) {
      chartInstance.destroy();
    }

    chartInstance = new window.Chart(chartCanvas, {
      type: "line",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Mid rate",
            data: dataPoints,
            borderColor: "#2b7a78",
            backgroundColor: "rgba(43, 122, 120, 0.12)",
            tension: 0.3,
            fill: true,
            pointRadius: 3
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false }
        },
        scales: {
          y: {
            ticks: {
              callback: function (value) {
                return value.toFixed(3);
              }
            }
          }
        }
      }
    });
  }

  function updateView() {
    var code = currencySelect.value;
    var range = Number(rangeSelect.value);
    var history = window.StorageAPI.getHistory();
    if (!history.length) {
      setStatus("No history saved yet. Visit the Rates page to store today's data.", false);
      renderList([], code);
      return;
    }

    setStatus("", false);
    var sliced = history.slice(Math.max(history.length - range, 0));
    var labels = sliced.map(function (entry) {
      return entry.date.slice(5);
    });
    var dataPoints = sliced.map(function (entry) {
      return entry.rates[code] || null;
    });

    renderList(sliced, code);
    renderChart(labels, dataPoints);
  }

  function init() {
    setStatus("Loading rates…", false);
    window.DataAPI
      .getRates()
      .then(function (data) {
        rates = data;
        fillSelect(currencySelect, data);
        currencySelect.value = "USD";
        setStatus("", false);
        updateView();
      })
      .catch(function () {
        setStatus("Couldn't load history right now.", true);
      });
  }

  currencySelect.addEventListener("change", updateView);
  rangeSelect.addEventListener("change", updateView);

  init();
})();
