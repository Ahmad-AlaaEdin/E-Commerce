// Remove the <script> tags - they're not needed in .js files
// Check if elements exist before adding event listeners
const menuToggle = document.getElementById("menuToggle");
const navActions = document.getElementById("navActions");

if (menuToggle && navActions) {
  menuToggle.addEventListener("click", () =>
    navActions.classList.toggle("show")
  );
}

async function addToCart(productId) {
  try {
    const response = await fetch("/api/v1/cart", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productId,
        quantity: 1,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Show success message
      showAlert("success", "Product added to cart!");

      // Update cart count if you have a cart counter in your header
      updateCartCount();
    } else {
      showAlert("error", data.message || "Could not add to cart");
    }
  } catch (err) {
    console.error("Error adding to cart:", err);
    showAlert("error", "Failed to add product to cart. Please try again.");
  }
}

function showAlert(type, message) {
  const alertElement = document.createElement("div");
  alertElement.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
  alertElement.style.zIndex = "1000";
  alertElement.innerHTML = message;
  document.body.appendChild(alertElement);

  // Remove alert after 3 seconds
  setTimeout(() => {
    alertElement.remove();
  }, 3000);
}

function updateCartCount() {
  // Fetch the current cart to update the count
  fetch("/api/v1/cart")
    .then((res) => res.json())
    .then((data) => {
      const cartCount = document.querySelector(".cart-count");
      if (cartCount && data.data.cart) {
        const itemCount = data.data.cart.items
          ? data.data.cart.items.reduce((sum, item) => sum + item.quantity, 0)
          : 0;
        cartCount.textContent = itemCount;
      }
    })
    .catch((err) => console.error("Error updating cart count:", err));
}

// Initialize cart count on page load
document.addEventListener("DOMContentLoaded", updateCartCount);
