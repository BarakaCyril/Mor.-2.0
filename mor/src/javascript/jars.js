document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');
  const amountInput = document.getElementById('amount');
  const flavourSelect = document.getElementById('cake-flavour');
  const totalEl = document.querySelector('.form-total .price');
  const submitBtn = document.querySelector('.submit-btn');

  // Optional flavour-specific unit price overrides.
  // Example: set a custom unit price per flavour. Leave undefined to use tiered pricing.
  const flavourPriceOverrides = {
    // 'chocolate': 450,
    // 'red-velvet': 420,
    // 'vanilla': 400,
  };

  function clampAmount(value) {
    const n = Number(value);
    if (Number.isNaN(n) || n < 1) return 1;
    if (n > 1000) return 1000; // reasonable upper bound to avoid mistakes
    return Math.floor(n);
  }

  function getUnitPrice(amount, flavour) {
    if (flavourPriceOverrides[flavour] != null) {
      return flavourPriceOverrides[flavour];
    }
    // Default tiered pricing
    return amount >= 2 ? 350 : 400;
  }

  function formatKsh(value) {
    return `Ksh. ${value.toLocaleString('en-KE')}`;
  }

  function updateTotal() {
    const flavour = flavourSelect.value;
    const amount = clampAmount(amountInput.value);

    // reflect clamped value in UI without disrupting typing too much
    if (String(amount) !== String(amountInput.value)) {
      amountInput.value = String(amount);
    }

    const unit = getUnitPrice(amount, flavour);
    const total = unit * amount;
    if (totalEl) totalEl.textContent = formatKsh(total);

    // enable/disable submit based on minimal validity
    const valid = amount >= 1 && flavour !== '';
    if (submitBtn) submitBtn.disabled = !valid;
  }

  // Initialize sensible defaults
  if (amountInput && !amountInput.value) amountInput.value = '1';
  updateTotal();

  // Listeners
  if (amountInput) amountInput.addEventListener('input', updateTotal);
  if (flavourSelect) flavourSelect.addEventListener('change', updateTotal);

  // Guard submit if somehow invalid
  if (form) {
    form.addEventListener('submit', (e) => {
      const amount = clampAmount(amountInput.value);
      if (amountInput.value !== String(amount)) amountInput.value = String(amount);
      const flavour = flavourSelect.value;
      if (amount < 1 || flavour === '') {
        e.preventDefault();
        updateTotal();
      }
    });
  }
});

