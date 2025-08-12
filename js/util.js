const createBadgeElement = (element, provider, selector = []) => {
  const el = document.createElement(element);
  if (selector.length >= 1) {
    el.classList.add(...selector);
  }
  el.textContent = provider.provider;
  return el;
};
const clearBandgeContainer = (containers, selector, n = 0) => {
  const container = containers.querySelector(selector);
  while (container.children.length > n) {
    container.removeChild(container.lastChild);
  }
};
const renderCounterpartiesPaymentSeller = (containers, item, selector, classList, tagName = 'li') => {
  if (item.status === 'seller') {
    item.paymentMethods.forEach((provider) => {
      containers.querySelector(selector).append(createBadgeElement(tagName, provider, classList));
    });
  }
};
const counterpartiesBalanceCurrency = (item) => (item.balance.currency === 'KEKS')
  ? `${(item.minAmount).toFixed(2)} KEKS - ${(item.balance.amount).toFixed(2)} KEKS`
  : `${item.minAmount} ₽ - ${item.balance.amount} ₽`;

const counterpartiesIsVerified = (containers, item, classStyle) => {
  if (!item.isVerified) {
    containers.querySelector(classStyle).style.display = 'none';
  }
};
export { clearBandgeContainer, renderCounterpartiesPaymentSeller, counterpartiesBalanceCurrency, counterpartiesIsVerified };
