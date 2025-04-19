/* eslint-disable */
import axios from 'axios';

// Initialize Stripe with your publishable key
const stripe = Stripe('pk_test_BUkd0ZXAj6m0q0jMyRgBxNns00PPtgvjjr');

// Show alert function
const showAlert = (type, message) => {
  const alertElement = document.createElement('div');
  alertElement.className = `alert alert-${type}`;
  alertElement.innerHTML = message;
  document.querySelector('body').appendChild(alertElement);
  
  // Hide alert after 5 seconds
  window.setTimeout(() => {
    alertElement.remove();
  }, 5000);
};

// Process checkout
export const processCheckout = async (cartId) => {
  try {
    // 1) Get checkout session from API
    const session = await axios(`/api/v1/payments/checkout-session/${cartId}`);
    
    // 2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id
    });
  } catch (err) {
    console.log(err);
    showAlert('error', err.response?.data?.message || 'Something went wrong with your payment');
  }
};