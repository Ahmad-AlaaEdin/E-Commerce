// Remove the <script> tags - they're not needed in .js files
// Check if elements exist before adding event listeners
const menuToggle = document.getElementById("menuToggle");
const navActions = document.getElementById("navActions");

if (menuToggle && navActions) {
  menuToggle.addEventListener("click", () =>
    navActions.classList.toggle("show")
  );
}

// Utility to check if user is logged in (customize as needed)
function isLoggedIn() {
  // Example: check for a global JS variable set by server, or a cookie, or make a lightweight API call
  return window.isAuthenticated === true; // Set this in your layout if user is logged in
}

// Retrieve cart (from API or localStorage)
async function getCart() {
  if (isLoggedIn()) {
    const res = await fetch("/api/v1/cart");
    const data = await res.json();
    return data.data.cart;
  } else {
    return JSON.parse(localStorage.getItem("cart") || "[]");
  }
}

// Add to cart (API or localStorage)
async function addToCart(productId, quantity = 1) {
  if (isLoggedIn()) {
    const res = await fetch("/api/v1/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    const data = await res.json();
    if (res.ok) {
      updateCartCount();
      alert("Product added to cart!");
    } else {
      alert(`Error: ${data.message || "Could not add to cart"}`);
    }
  } else {
    // LocalStorage cart logic
    let cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const idx = cart.findIndex((item) => item.productId === productId);
    if (idx > -1) {
      cart[idx].quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartCount();
    alert("Product added to cart!");
  }
}

// Update cart count in header
function updateCartCount() {
  if (isLoggedIn()) {
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
  } else {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCount = document.querySelector(".cart-count");
    if (cartCount) cartCount.textContent = itemCount;
  }
}

// Sync localStorage cart to backend after login
async function syncCartAfterLogin() {
  const localCart = JSON.parse(localStorage.getItem("cart") || "[]");
  if (localCart.length > 0 && isLoggedIn()) {
    for (const item of localCart) {
      await fetch("/api/v1/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(item),
      });
    }
    localStorage.removeItem("cart");
    updateCartCount();
  }
}

// Call syncCartAfterLogin() after successful login (e.g., on login page redirect)
if (window.justLoggedIn) {
  syncCartAfterLogin();
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

// Initialize cart count on page load
document.addEventListener("DOMContentLoaded", updateCartCount);
