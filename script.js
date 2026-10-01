var RAZORPAY_KEY_ID = "rzp_test_TEp8zhyxriqYwA"; // PASTE YOUR KEY ID HERE
var selectedAmount = 0;
var presets = document.querySelectorAll(".preset");
var customInput = document.getElementById("customAmount");
var displayAmount = document.getElementById("displayAmount");
var amountHint = document.getElementById("amountHint");
var payBtn = document.getElementById("payBtn");
var nameInput = document.getElementById("supporterName");
var noteInput = document.getElementById("note");

presets.forEach(function (btn) {
  btn.addEventListener("click", function () {
    presets.forEach(function (b) { b.classList.remove("active"); });
    btn.classList.add("active");
    customInput.value = "";
    selectedAmount = parseInt(btn.dataset.amount, 10);
    updateAmountDisplay();
  });
});

customInput.addEventListener("input", function () {
  presets.forEach(function (b) { b.classList.remove("active"); });
  var val = parseInt(customInput.value, 10);
  selectedAmount = (!isNaN(val) && val > 0) ? Math.min(val, 100000) : 0;
  updateAmountDisplay();
});

function updateAmountDisplay() {
  displayAmount.textContent = "\u20B9" + selectedAmount;
  if (selectedAmount > 0) {
    amountHint.textContent = customInput.value ? "CUSTOM" : "SELECTED";
    payBtn.disabled = false;
    payBtn.textContent = "\uD83D\uDCB3 Pay \u20B9" + selectedAmount + " with Razorpay \u2022 Get Receipt";
  } else {
    amountHint.textContent = "SELECT AMOUNT";
    payBtn.disabled = true;
    payBtn.textContent = "\uD83D\uDCB3 Choose or Enter Amount to Pay \u2022 Get Receipt";
  }
}

payBtn.addEventListener("click", async function () {
  var name = nameInput.value.trim();
  if (!name) { alert("Please enter your Name / Gamertag"); nameInput.focus(); return; }
  if (selectedAmount < 1) { alert("Please select or enter a valid amount"); return; }
  payBtn.disabled = true;
  payBtn.textContent = "\u23F3 Creating order...";
  try {
    var res = await fetch("/api/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: selectedAmount, name: name, note: noteInput.value.trim() })
    });
    var data = await res.json();
    if (!data.success) throw new Error(data.error || "Order creation failed");
    var options = {
      key: RAZORPAY_KEY_ID,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "LORD ZORO",
      description: "Support Contribution",
      order_id: data.order.id,
      prefill: { name: name },
      notes: { supporter_name: name, message: noteInput.value.trim() },
      theme: { color: "#a855f7" },
      handler: function (response) {
        alert("\u2705 Payment Successful!\n\nPayment ID: " + response.razorpay_payment_id);
      },
      modal: { ondismiss: function () { payBtn.disabled = false; updateAmountDisplay(); } }
    };
    var rzp = new Razorpay(options);
    rzp.open();
  } catch (err) {
    console.error(err);
    alert("\u274C Error: " + err.message);
    payBtn.disabled = false;
    updateAmountDisplay();
  }
});

document.getElementById("themeToggle").addEventListener("click", function () {
  document.body.classList.toggle("light-mode");
});