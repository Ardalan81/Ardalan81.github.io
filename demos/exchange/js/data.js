(function () {
  "use strict";

  var MOCK_RATES = [
    { name: "UAE Dirham", code: "AED", buy: 1.0, sell: 1.0 },
    { name: "US Dollar", code: "USD", buy: 3.65, sell: 3.67 },
    { name: "Euro", code: "EUR", buy: 3.95, sell: 4.01 },
    { name: "British Pound", code: "GBP", buy: 4.62, sell: 4.7 },
    { name: "Saudi Riyal", code: "SAR", buy: 0.97, sell: 0.98 },
    { name: "Indian Rupee", code: "INR", buy: 0.043, sell: 0.045 },
    { name: "Pakistani Rupee", code: "PKR", buy: 0.013, sell: 0.014 },
    { name: "Bangladeshi Taka", code: "BDT", buy: 0.033, sell: 0.034 },
    { name: "Philippine Peso", code: "PHP", buy: 0.064, sell: 0.066 },
    { name: "Chinese Yuan", code: "CNY", buy: 0.49, sell: 0.5 },
    { name: "Japanese Yen", code: "JPY", buy: 0.025, sell: 0.026 },
    { name: "Egyptian Pound", code: "EGP", buy: 0.074, sell: 0.078 },
    { name: "Nigerian Naira", code: "NGN", buy: 0.0027, sell: 0.0029 }
  ];

  function toFixedNumber(value) {
    return Number(value.toFixed(4));
  }

  function buildRates() {
    var merged = window.StorageAPI ? window.StorageAPI.mergeRates(MOCK_RATES) : MOCK_RATES;
    return merged.map(function (rate) {
      var mid = toFixedNumber((rate.buy + rate.sell) / 2);
      return {
        name: rate.name,
        code: rate.code,
        buy: rate.buy,
        sell: rate.sell,
        mid: mid
      };
    });
  }

  function getRates() {
    return new Promise(function (resolve, reject) {
      setTimeout(function () {
        try {
          var rates = buildRates();
          resolve(rates);
        } catch (error) {
          reject(error);
        }
      }, 400);
    });
  }

  window.DataAPI = {
    getRates: getRates
  };
})();
