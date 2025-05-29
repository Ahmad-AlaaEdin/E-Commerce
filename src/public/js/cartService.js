// Cart service to handle both guest and logged-in user carts
class CartService {
  constructor() {
    this.STORAGE_KEY = "guestCart";
    this.isLoggedIn = document.cookie.includes("jwt=");
  }

  // Get cart items
  async getCart() {
    if (this.isLoggedIn) {
      try {
        const response = await fetch("/api/v1/cart");
        const data = await response.json();
        return data.data.cart;
      } catch (error) {
        console.error("Error fetching cart:", error);
        return null;
      }
    } else {
      return this.getGuestCart();
    }
  }

  // Get guest cart from localStorage
  getGuestCart() {
    const cart = localStorage.getItem(this.STORAGE_KEY);
    return cart ? JSON.parse(cart) : { items: [] };
  }

  // Save guest cart to localStorage
  saveGuestCart(cart) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cart));
  }

  // Add item to cart
  async addToCart(productId, quantity = 1) {
    if (this.isLoggedIn) {
      try {
        const response = await fetch("/api/v1/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ productId, quantity }),
        });
        const data = await response.json();
        return data.status === "success";
      } catch (error) {
        console.error("Error adding to cart:", error);
        return false;
      }
    } else {
      const cart = this.getGuestCart();
      const existingItem = cart.items.find(
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

        cart.items.push({
          productId,
          quantity,
          price: product.price,
          product, // Include product details for display
        });
      }

      this.saveGuestCart(cart);
      return true;
    }
  }

  // Remove item from cart
  async removeFromCart(itemId) {
    if (this.isLoggedIn) {
      try {
        await fetch(`/api/v1/cart/${itemId}`, {
          method: "DELETE",
        });
        return true;
      } catch (error) {
        console.error("Error removing from cart:", error);
        return false;
      }
    } else {
      const cart = this.getGuestCart();
      cart.items = cart.items.filter((item) => item.productId !== itemId);
      this.saveGuestCart(cart);
      return true;
    }
  }

  // Clear cart
  async clearCart() {
    if (this.isLoggedIn) {
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
    const guestCart = this.getGuestCart();
    if (guestCart.items.length > 0) {
      try {
        for (const item of guestCart.items) {
          await this.addToCart(item.productId, item.quantity);
        }
        // Clear guest cart after merging
        localStorage.removeItem(this.STORAGE_KEY);
        return true;
      } catch (error) {
        console.error("Error merging cart:", error);
        return false;
      }
    }
    return true;
  }

  // Calculate cart total
  calculateTotal(cart) {
    return cart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
  }
}

// Create global cart service instance
window.cartService = new CartService();
