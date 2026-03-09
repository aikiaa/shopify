/**
 * CUSTOM WISHLIST LOGIC
 */
const WISHLIST_KEY = 'rangoli_wishlist';

const Wishlist = {
  get: function() {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  },
  add: function(product) {
    const list = this.get();
    if (!list.find(item => item.id === product.id)) {
      list.push(product);
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    }
    this.updateUI();
  },
  remove: function(productId) {
    let list = this.get();
    list = list.filter(item => item.id !== productId);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));
    this.updateUI();
  },
  toggle: function(product) {
    if (this.contains(product.id)) {
      this.remove(product.id);
    } else {
      this.add(product);
    }
  },
  contains: function(productId) {
    const list = this.get();
    return !!list.find(item => item.id === productId);
  },
  updateUI: function() {
    const list = this.get();
    document.querySelectorAll('[data-wishlist-button]').forEach(btn => {
      const id = btn.dataset.productId;
      if (this.contains(id)) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    // Update wishlist page if exists
    const container = document.getElementById('wishlist-grid');
    if (container) {
      this.renderWishlistPage();
    }
  },
  renderWishlistPage: function() {
    const container = document.getElementById('wishlist-grid');
    if (!container) return;

    const list = this.get();
    if (list.length === 0) {
      container.innerHTML = '<p>Your wishlist is empty.</p>';
      return;
    }

    let html = '';
    list.forEach(product => {
      html += `
        <div class="grid__item">
          <div class="card card--card">
            <div class="card__inner ratio" style="--ratio-percent: 100%;">
              <div class="card__media">
                <img src="${product.image}" alt="${product.title}" loading="lazy" width="300" height="300">
                <button class="wishlist-btn active" data-wishlist-button data-product-id="${product.id}" onclick="Wishlist.remove('${product.id}')">
                   <svg width="24" height="24" viewBox="0 0 24 24" fill="red" stroke="red" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.72-8.72 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                </button>
              </div>
            </div>
            <div class="card__content">
              <h3 class="h4"><a href="${product.url}">${product.title}</a></h3>
              <p>${product.price}</p>
            </div>
          </div>
        </div>
      `;
    });
    container.innerHTML = html;
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Wishlist.updateUI();
  if (document.getElementById('wishlist-grid')) {
     Wishlist.renderWishlistPage();
  }
});
