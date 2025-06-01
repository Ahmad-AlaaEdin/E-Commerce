import { login, logout } from "./auth.js";

// Enable Bootstrap tooltips
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.querySelector(".form--login");
  const logOutBtn = document.querySelector(".nav__el--logout");

  if (loginForm)
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      console.log("clicked loginForm");
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      login(email, password);
    });

  if (logOutBtn) {
    logOutBtn.addEventListener("click", function (event) {
      event.preventDefault();
      logout();
    });
  }

  var tooltipTriggerList = [].slice.call(
    document.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});
// DOM ELEMENTS

// Add to cart functionality
function addToCart(productId) {
  fetch(`/api/v1/cart`, {
    method: "POST",
    body: JSON.stringify({ productId, quantity: 1 }), // Include productId in the request body
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        showNotification("Product added to cart!", "success");
      } else {
        showNotification("Failed to add product to cart", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showNotification("An error occurred", "error");
    });
}

// Notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `alert alert-${type} notification`;
  notification.textContent = message;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Search functionality
const searchForm = document.querySelector("#searchForm");
if (searchForm) {
  searchForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const searchTerm = this.querySelector('input[name="search"]').value;
    window.location.href = `/products/search?q=${encodeURIComponent(
      searchTerm
    )}`;
  });
}

// Quantity input controls
document.querySelectorAll(".quantity-input").forEach((input) => {
  const decrementBtn = input.parentElement.querySelector(".decrement");
  const incrementBtn = input.parentElement.querySelector(".increment");

  if (decrementBtn) {
    decrementBtn.addEventListener("click", () => {
      const currentValue = parseInt(input.value);
      if (currentValue > 1) {
        input.value = currentValue - 1;
        updateCartItem(input);
      }
    });
  }

  if (incrementBtn) {
    incrementBtn.addEventListener("click", () => {
      const currentValue = parseInt(input.value);
      input.value = currentValue + 1;
      updateCartItem(input);
    });
  }
});

// Update cart item quantity
function updateCartItem(input) {
  const productId = input.dataset.productId;
  const quantity = input.value;

  fetch(`/api/v1/cart/update/${productId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ quantity }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.status === "success") {
        showNotification("Cart updated!", "success");
        // Update total price if necessary
        if (data.total) {
          document.querySelector(
            ".cart-total"
          ).textContent = `$${data.total.toFixed(2)}`;
        }
      } else {
        showNotification("Failed to update cart", "error");
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showNotification("An error occurred", "error");
    });
}
