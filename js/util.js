// Создает HTML-элемент с заданным тегом, текстом и классами.
const createBadgeElement = (tag, item, selector = []) => {
  const element = document.createElement(tag);
  if (selector.length >= 1) {
    element.classList.add(...selector);
  }
  element.textContent = item.provider;
  return element;
};
// Очищает дочерние элементы контейнера до заданного количества.
const clearBandgeContainer = (container, selector, n = 0) => {
  const bandge = container.querySelector(selector);
  while (bandge.children.length > n) {
    bandge.removeChild(bandge.lastChild);
  }
};
// Рендер методы оплаты в виде элементов внутри контейнера.
const renderBandgePayMethods = (containers, item, selector, classList, tagName = 'li') => {
  item.paymentMethods.forEach((provider) => {
    containers.querySelector(selector).append(createBadgeElement(tagName, provider, classList));
  });
};
const renderSellerPaymentBadges = (containers, item, selector, classList, tagName = 'li') => {
  if (item.status === 'seller') {
    item.paymentMethods.forEach((provider) => {
      containers.querySelector(selector).append(createBadgeElement(tagName, provider, classList));
    });
  }
};
// Форматирует диапазон баланса контрагента в зависимости от валюты.
const counterpartiesBalanceCurrency = (item) => {
  const result = (item.balance.currency === 'KEKS')
    ? `${(item.minAmount).toFixed(2)} KEKS - ${(item.balance.amount).toFixed(2)} KEKS`
    : `${item.minAmount} ₽ - ${item.balance.amount} ₽`;
  return result;
};
// Скрывает элемент, если контрагент не верифицирован.
const counterpartiesIsVerified = (containers, item, selector) => {
  if (!item.isVerified) {
    containers.querySelector(selector).style.display = 'none';
  } else {
    containers.querySelector(selector).style.display = 'inline';
  }
};

export {
  clearBandgeContainer,
  renderSellerPaymentBadges,
  counterpartiesBalanceCurrency,
  renderBandgePayMethods,
  counterpartiesIsVerified
};
