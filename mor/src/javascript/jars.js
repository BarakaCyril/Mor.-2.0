document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('.form');
  const amountInput = document.getElementById('amount');
  const flavourSelect = document.getElementById('cake-flavour');
  const locationSelect = document.getElementById('location');
  const productTotalEl = document.getElementById('product-total');
  const deliveryTotalEl = document.getElementById('delivery-total');
  const grandTotalEl = document.getElementById('grand-total');
  const submitBtn = document.querySelector('.submit-btn');

  // Fixed prices per flavour (no discounts)
  const pricePerFlavour = {
    'salted-caramel-vanilla': 450,
    'salted-caramel-chocolate': 550,
    'very-berry-vanilla': 500,
    'red-velvet': 450,
    'chocolate': 500,
  };

  function sanitizeAmountFreeTyping(value) {
    // Allow empty while typing; coerce to positive integer when present
    if (value === '') return '';
    const n = Number(value.replace(/[^0-9]/g, ''));
    if (!Number.isFinite(n)) return '';
    return String(Math.min(1000, Math.max(1, Math.floor(n))));
  }

  function clampAmountFinal(value) {
    const n = Number(value);
    if (Number.isNaN(n) || n < 1) return 1;
    return Math.min(1000, Math.floor(n));
  }

  function getUnitPrice(flavour) {
    return pricePerFlavour[flavour] || 0;
  }

  function getDeliveryPrice(locationValue) {
    if (!locationValue) return 0;
    const option = locationSelect.querySelector(`option[value="${locationValue}"]`);
    return option ? Number(option.dataset.price) : 0;
  }

  function formatKsh(value) {
    return `Ksh. ${value.toLocaleString('en-KE')}`;
  }

  function updateTotal() {
    const flavour = flavourSelect.value;
    const location = locationSelect.value;
    const amountValue = amountInput.value === '' ? 0 : clampAmountFinal(amountInput.value);
    
    const unitPrice = getUnitPrice(flavour);
    const productTotal = unitPrice * amountValue;
    const deliveryPrice = getDeliveryPrice(location);
    const grandTotal = productTotal + deliveryPrice;

    // Update display elements
    if (productTotalEl) productTotalEl.textContent = formatKsh(productTotal);
    if (deliveryTotalEl) deliveryTotalEl.textContent = formatKsh(deliveryPrice);
    if (grandTotalEl) grandTotalEl.textContent = formatKsh(grandTotal);

    // Enable/disable submit based on validity
    const valid = amountValue >= 1 && flavour !== '' && location !== '';
    if (submitBtn) submitBtn.disabled = !valid;
  }

  // Initialize
  if (amountInput && !amountInput.value) amountInput.value = '';
  updateTotal();

  // Event listeners
  if (amountInput) {
    amountInput.addEventListener('input', () => {
      const sanitized = sanitizeAmountFreeTyping(amountInput.value);
      amountInput.value = sanitized;
      updateTotal();
    });
    amountInput.addEventListener('blur', () => {
      if (amountInput.value === '') return;
      amountInput.value = String(clampAmountFinal(amountInput.value));
      updateTotal();
    });
  }
  
  if (flavourSelect) flavourSelect.addEventListener('change', updateTotal);
  if (locationSelect) locationSelect.addEventListener('change', updateTotal);

  // Form submission validation
  if (form) {
    form.addEventListener('submit', (e) => {
      const amount = clampAmountFinal(amountInput.value);
      amountInput.value = String(amount);
      const flavour = flavourSelect.value;
      const location = locationSelect.value;
      
      if (amount < 1 || flavour === '' || location === '') {
        e.preventDefault();
        updateTotal();
      }
    });
  }
});

