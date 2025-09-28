const STR = {
  en: {
    "meta.title": "Mortgage Calculator — Tomas Paulenas",
    "nav.calc": "Calculator",
    "nav.notes": "Notes",
    "hero.title": "Mortgage Calculator",
    "hero.lead": "Estimate your monthly payment with principal and interest. Results are indicative only.",
    "form.price": "Property price",
    "form.down": "Down payment",
    "form.rate": "Interest rate (APR %)",
    "form.years": "Term (years)",
    "form.calculate": "Calculate",
    "form.reset": "Reset",
    "hint.currency": "EUR",
    "hint.optional": "Optional",
    "results.monthly": "Monthly payment",
    "results.total": "Total paid",
    "results.interest": "Total interest",
    "results.schedule": "Amortization schedule",
    "tbl.payment": "Payment",
    "tbl.principal": "Principal",
    "tbl.interest": "Interest",
    "tbl.balance": "Balance",
    "notes.title": "Notes",
    "notes.n1": "APR is divided by 12 to compute monthly interest.",
    "notes.n2": "If APR is 0%, monthly payment is principal / months.",
    "notes.n3": "Final installment is adjusted to bring balance to zero.",
    "err.required": "This field is required.",
    "err.nonneg": "Enter a value ≥ 0.",
    "err.downlte": "Down payment must be ≤ price.",
    "err.rate": "Enter a rate between 0 and 30.",
    "err.years": "Enter years between 1 and 40."
  },
  es: {
    "meta.title": "Calculadora Hipotecaria — Tomas Paulenas",
    "nav.calc": "Calculadora",
    "nav.notes": "Notas",
    "hero.title": "Calculadora Hipotecaria",
    "hero.lead": "Estimá tu cuota mensual (capital e intereses). Los resultados son orientativos.",
    "form.price": "Valor del inmueble",
    "form.down": "Cuota inicial",
    "form.rate": "Tasa de interés (TEA %)",
    "form.years": "Plazo (años)",
    "form.calculate": "Calcular",
    "form.reset": "Limpiar",
    "hint.currency": "EUR",
    "hint.optional": "Opcional",
    "results.monthly": "Cuota mensual",
    "results.total": "Total pagado",
    "results.interest": "Intereses totales",
    "results.schedule": "Tabla de amortización",
    "tbl.payment": "Cuota",
    "tbl.principal": "Capital",
    "tbl.interest": "Interés",
    "tbl.balance": "Saldo",
    "notes.title": "Notas",
    "notes.n1": "La TEA se divide por 12 para obtener el interés mensual.",
    "notes.n2": "Si la tasa es 0%, la cuota = capital / meses.",
    "notes.n3": "La última cuota se ajusta para llevar el saldo a cero.",
    "err.required": "Este campo es obligatorio.",
    "err.nonneg": "Ingresá un valor ≥ 0.",
    "err.downlte": "La cuota inicial debe ser ≤ al valor.",
    "err.rate": "Ingresá una tasa entre 0 y 30.",
    "err.years": "Ingresá un plazo entre 1 y 40."
  }
};

function applyI18n(lang) {
  var dict = STR[lang] || STR.en;
  document.documentElement.lang = lang;
  document.title = dict["meta.title"];
  var nodes = document.querySelectorAll("[data-i18n]");
  for (var i=0; i<nodes.length; i++){
    var key = nodes[i].getAttribute("data-i18n");
    if (dict[key]) nodes[i].textContent = dict[key];
  }
  var btn = document.getElementById("lang-toggle");
  if (btn){
    btn.textContent = lang === "en" ? "ES" : "EN";
    btn.setAttribute("aria-pressed", lang === "es");
  }
  localStorage.setItem("lang", lang);
}
applyI18n(localStorage.getItem("lang") || "en");
document.getElementById("lang-toggle").addEventListener("click", function(){
  var next = (document.documentElement.lang || "en") === "en" ? "es" : "en";
  applyI18n(next);
});

function fmtCurrency(value, currency){
  var locale = (document.documentElement.lang === "es") ? "es-ES" : "en-GB";
  return new Intl.NumberFormat(locale, { style:"currency", currency: currency || "EUR", maximumFractionDigits: 2 }).format(value);
}

function validate(form){
  var price = Number(form.price.value);
  var down  = Number(form.down.value || 0);
  var rate  = Number(form.rate.value);
  var years = Number(form.years.value);

  var errs = document.querySelectorAll(".error");
  for (var i=0; i<errs.length; i++) errs[i].textContent = "";

  var ok = true;
  if (!form.price.value){ setErr("price","err.required"); ok=false; }
  if (!form.rate.value){  setErr("rate","err.required");  ok=false; }
  if (!form.years.value){ setErr("years","err.required"); ok=false; }

  if (price < 0){ setErr("price","err.nonneg"); ok=false; }
  if (down  < 0){ setErr("down","err.nonneg");  ok=false; }
  if (down > price){ setErr("down","err.downlte"); ok=false; }
  if (rate < 0 || rate > 30){ setErr("rate","err.rate"); ok=false; }
  if (years < 1 || years > 40){ setErr("years","err.years"); ok=false; }

  function setErr(id, key){
    var el = document.querySelector('[data-error-for="'+id+'"]');
    if (el) el.textContent = STR[document.documentElement.lang][key];
  }
  return ok;
}

function computeSchedule(principal, aprPct, years){
  var months = Math.round(years * 12);
  var r = aprPct / 100 / 12;
  var payment = (r === 0) ? (principal / months) : (principal * (r / (1 - Math.pow(1 + r, -months))));
  var rows = [];
  var balance = principal;
  for (var i=1; i<=months; i++){
    var interest = (r === 0) ? 0 : (balance * r);
    var capital = payment - interest;
    if (capital > balance) capital = balance;
    balance = balance - capital;
    if (i === months && Math.abs(balance) < 0.01) balance = 0;
    rows.push({ n:i, pay:payment, capital:capital, interest:interest, balance: Math.max(0, balance) });
  }
  var totalPaid = 0, totalInterest = 0;
  for (var j=0; j<rows.length; j++){ totalPaid += rows[j].pay; totalInterest += rows[j].interest; }
  return { payment:payment, totalPaid:totalPaid, totalInterest:totalInterest, rows:rows };
}

function renderResults(result){
  document.getElementById("res-monthly").textContent  = fmtCurrency(result.payment);
  document.getElementById("res-total").textContent    = fmtCurrency(result.totalPaid);
  document.getElementById("res-interest").textContent = fmtCurrency(result.totalInterest);
  var tbody = document.querySelector("#schedule-table tbody");
  var html = "";
  for (var i=0; i<result.rows.length; i++){
    var r = result.rows[i];
    html += "<tr>"
      + "<td>"+ r.n +"</td>"
      + "<td>"+ fmtCurrency(r.pay) +"</td>"
      + "<td>"+ fmtCurrency(r.capital) +"</td>"
      + "<td>"+ fmtCurrency(r.interest) +"</td>"
      + "<td>"+ fmtCurrency(r.balance) +"</td>"
      + "</tr>";
  }
  tbody.innerHTML = html;
}

var form = document.getElementById("calc-form");
form.addEventListener("submit", function(e){
  e.preventDefault();
  if (!validate(form)) return;
  var price = Number(form.price.value);
  var down  = Number(form.down.value || 0);
  var rate  = Number(form.rate.value);
  var years = Number(form.years.value);
  var principal = Math.max(0, price - down);
  var result = computeSchedule(principal, rate, years);
  renderResults(result);
});

document.getElementById("reset").addEventListener("click", function(){
  form.reset();
  document.getElementById("res-monthly").textContent  = "—";
  document.getElementById("res-total").textContent    = "—";
  document.getElementById("res-interest").textContent = "—";
  document.querySelector("#schedule-table tbody").innerHTML = "";
});
