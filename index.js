let wca_id;
let wca_event;

document.getElementById("submit").onclick = function(){
    wca_id = document.getElementById("wca_id").value.toUpperCase();
    wca_event = document.getElementById("event").value;
    localStorage.setItem("wca_id", wca_id);
    localStorage.setItem("wca_event", wca_event);
    location.href = "results.html";
}

