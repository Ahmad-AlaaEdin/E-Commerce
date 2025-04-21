// Initialize Stripe with your publishable key
const stripe = Stripe(
  "pk_test_51Q3jh4052H3vHucoEZEINE61uhbigQwOzz3jtBSK0PYROeJ1cRz7SZoOLX9eCDNiYxdBKwQ5iv4VeQeaPbIaogOK00NYOsphUy"
);

// Show alert function
const showAlert = (type, message) => {
  const alertElement = document.createElement("div");
  alertElement.className = `alert alert-${type}`;
  alertElement.innerHTML = message;
  document.querySelector("body").appendChild(alertElement);

  // Hide alert after 5 seconds
  window.setTimeout(() => {
    alertElement.remove();
  }, 5000);
};

// Process checkout
// Remove 'export' so this is a global function
function processCheckout(cartId) {
  try {
    // 1) Get checkout session from API
    axios(`/api/v1/payments/checkout-session/${cartId}`)
      .then((session) => {
        // 2) Create checkout form + charge credit card
        return stripe.redirectToCheckout({
          sessionId: session.data.session.id,
        });
      })
      .catch((err) => {
        console.log(err);
        showAlert(
          "error",
          err.response?.data?.message ||
            "Something went wrong with your payment"
        );
      });
  } catch (err) {
    console.log(err);
    showAlert(
      "error",
      err.response?.data?.message || "Something went wrong with your payment"
    );
  }
}
