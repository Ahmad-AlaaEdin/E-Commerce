// Cart service to handle both guest and logged-in user carts
class CartService {
  constructor() {
    this.STORAGE_KEY = "guestCart";
    this.cart = this.loadGuestCart();
  }

  // Get cart items
  async getCart() {
    if (window.isAuthenticated) {
      try {
        const response = await fetch("/api/v1/cart");
        if (!response.ok) throw new Error("Failed to fetch cart");
        const cartData = await response.json();
        const cart = cartData.data.cart || { items: [] };
        this.updateCartUI(cart);
        return cart;
      } catch (error) {
        console.error("Error fetching cart:", error);
        this.updateCartUI({ items: [] });
        throw error;
      }
    } else {
      return this.cart;
    }
  }

  // Get guest cart from localStorage
  loadGuestCart() {
    const storedCart = localStorage.getItem(this.STORAGE_KEY);
    return storedCart ? JSON.parse(storedCart) : { items: [] };
  }

  // Save guest cart to localStorage
  saveGuestCart() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.cart));
  }

  // Add item to cart
  async addItem(productId, quantity = 1) {
    if (window.isAuthenticated) {
      try {
        const response = await fetch("/api/v1/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId, quantity }),
        });
        if (!response.ok) throw new Error("Failed to add item to cart");
        const cart = await response.json();
        this.updateCartUI(cart);
        return cart;
      } catch (error) {
        console.error("Error adding item to cart:", error);
        throw error;
      }
    } else {
      const existingItem = this.cart.items.find(
        (item) => item.productId === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
      } else {
        // Fetch product details
        const response = await fetch(`/api/v1/products/${productId}`);
        const {
          data: { product },
        } = await response.json();

        this.cart.items.push({
          productId,
          quantity,
          price: product.price,
          product, // Include product details for display
        });
      }
      this.saveGuestCart();
      this.updateCartUI(this.cart);
      return this.cart;
    }
  }

  // Remove item from cart
  async removeItem(productId) {
    if (window.isAuthenticated) {
      try {
        const response = await fetch(`/api/v1/cart/${productId}`, {
          method: "DELETE",
        });
        if (!response.ok) throw new Error("Failed to remove item from cart");
        const cart = await response.json();
        this.updateCartUI(cart);
        return cart;
      } catch (error) {
        console.error("Error removing item from cart:", error);
        throw error;
      }
    } else {
      this.cart.items = this.cart.items.filter(
        (item) => item.productId !== productId
      );
      this.saveGuestCart();
      this.updateCartUI(this.cart);
      return this.cart;
    }
  }

  // Clear cart
  async clearCart() {
    if (window.isAuthenticated) {
      try {
        await fetch("/api/v1/cart", {
          method: "DELETE",
        });
        return true;
      } catch (error) {
        console.error("Error clearing cart:", error);
        return false;
      }
    } else {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    }
  }

  // Merge guest cart with user cart after login
  async mergeGuestCart() {
    if (!this.cart.items.length) return;

    try {
      const response = await fetch("/api/v1/cart/merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.cart),
      });
      if (!response.ok) throw new Error("Failed to merge cart");

      // Clear guest cart after successful merge
      this.cart = { items: [] };
      this.saveGuestCart();

      const mergedCart = await response.json();
      this.updateCartUI(mergedCart);
      return mergedCart;
    } catch (error) {
      console.error("Error merging cart:", error);
      throw error;
    }
  }

  // Calculate cart total
  calculateTotal(cart) {
    return cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }

  updateCartUI(cart) {
    const miniCart = document.getElementById("miniCart");
    if (!miniCart) return;

    const itemCount = cart.items.reduce(
      (total, item) => total + item.quantity,
      0
    );
    const cartCountBadge = document.getElementById("cartCount");
    if (cartCountBadge) {
      cartCountBadge.textContent = itemCount;
      cartCountBadge.style.display = itemCount > 0 ? "block" : "none";
    }

    // Update mini cart items if it's open
    const miniCartItems = document.getElementById("miniCartItems");
    if (miniCartItems && cart.items.length > 0) {
      miniCartItems.innerHTML = cart.items
        .map(
          (item) => `
        <div class="mini-cart-item d-flex align-items-center mb-2">
          <img src="${item.product.image}" alt="${
            item.product.name
          }" class="mini-cart-img me-2">
          <div class="flex-grow-1">
            <h6 class="mb-0">${item.product.name}</h6>
            <small>${item.quantity} × $${item.product.price.toFixed(2)}</small>
          </div>
          <button onclick="cartService.removeItem('${
            item.id
          }')" class="btn btn-sm btn-link text-danger">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `
        )
        .join("");
    }
  }
}

// Initialize cart service
const cartService = new CartService();

// Handle login completion
document.addEventListener("loginComplete", () => {
  cartService.mergeGuestCart();
});
