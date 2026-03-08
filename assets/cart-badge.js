(() => {
  const updateCartCount = async () => {
    const badges = document.querySelectorAll('.js-cart-count');
    if (!badges.length) return;

    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();

      badges.forEach(badge => {
        if (cart.item_count > 0) {
          badge.textContent = cart.item_count;
          badge.style.display = 'flex';
        } else {
          badge.style.display = 'none';
        }
      });
    } catch (e) {
      console.error('Cart badge update failed', e);
    }
  };

  /* -----------------------------
     1. Initial page load
  ----------------------------- */
  document.addEventListener('DOMContentLoaded', updateCartCount);

  /* -----------------------------
     2. Intercept fetch() calls
     (THIS is the key)
  ----------------------------- */
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    const response = await originalFetch(...args);

    const url = args[0];
    if (
      typeof url === 'string' &&
      (url.includes('/cart/add') ||
       url.includes('/cart/change') ||
       url.includes('/cart/update'))
    ) {
      updateCartCount();
    }

    return response;
  };

  /* -----------------------------
     3. Fallback: form submits
  ----------------------------- */
  document.addEventListener('submit', e => {
    if (e.target.matches('form[action="/cart/add"]')) {
      setTimeout(updateCartCount, 300);
    }
  });
})();
