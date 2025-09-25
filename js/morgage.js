function calculatemortgage(e) {
    
    e.preventDefault();

    let cuota = document.forms["fmortgage"]["fcuota"].value;
    let costoTotal = document.forms["fmortgage"]["fvalortotal"].value;
    let interes = document.forms["fmortgage"]["finteres"].value;
    let plazoAnios = document.forms["fmortgage"]["fplazo"].value;
    const MONTH_ON_YEAR = 12;

    const mortgage = {
        totalPrestamo: 0,
        totalInteses: 0,
        cuotaMensual: 0

    };
    mortgage.totalPrestamo = costoTotal - cuota;
    mortgage.totalInteses = mortgage.totalPrestamo * interes / 100;
    mortgage.cuotaMensual = (mortgage.totalPrestamo + mortgage.totalInteses) / (plazoAnios * MONTH_ON_YEAR);

    
    ouputmortgage(mortgage);
} 
function ouputmortgage(finalmortgage){
    document.getElementById("omotoprestamo").innerHTML = valueToDollar(finalmortgage.totalPrestamo);
    document.getElementById("ocuota").innerHTML = valueToDollar(finalmortgage.cuotaMensual || 0);

}
function resetForm(){
    document.getElementById("fmortgage").reset();
    document.getElementById("fcuota").value = 0;
    document.getElementById("fvalortotal").value = 0;
    document.getElementById("finteres").value = 0;
    document.getElementById("fplazo").value = 0;
    ouputmortgage({ totalPrestamo: 0, cuotaMensual: 0 });
    
}
function valueToDollar(value){
    const dollarFormatter = new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2});
    return dollarFormatter.format(value);
}