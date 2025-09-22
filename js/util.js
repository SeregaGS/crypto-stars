// Создает HTML-элемент с заданным тегом, текстом и классами.
const createBadgeElement = (tag, item, selector = []) => {
  const element = document.createElement(tag);
  element.setAttribute('value', item.provider);
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
    ? `${(item.minAmount)} KEKS - ${(item.balance.amount)} KEKS`
    : `${item.minAmount} ₽ - ${item.balance.amount} ₽`;
  return result;
};
// Скрывает элемент, если контрагент не верифицирован.
const counterpartiesIsVerified = (container, selector, counterparty) => {
  const element = container.querySelector(selector);
  element.style.display = counterparty.isVerified ? 'inline' : 'none';
};
// Информация об контрагентах
const renderCounterpartyInfo = (container, selectors, counterparty) => {
  const { userName, balance, exchangeRate, id } = counterparty;
  container.id = id;
  container.querySelector(selectors.name).textContent = userName;
  if(!container.querySelector(selectors.currency) === null) {
    container.querySelector(selectors.currency).textContent = balance.currency;
  }
  container.querySelector(selectors.exchangeRate).textContent = exchangeRate.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
  container.querySelector(selectors.limit).textContent = counterpartiesBalanceCurrency(counterparty);
  counterpartiesIsVerified(container, selectors.isVerify, counterparty);
};
//
const timeoutManager = (callback, interval = 1000) => {
  let timeout;
  return (...rest) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => callback.apply(this, rest), interval);
  };
};

export {
  clearBandgeContainer,
  renderSellerPaymentBadges,
  counterpartiesBalanceCurrency,
  renderBandgePayMethods,
  counterpartiesIsVerified,
  timeoutManager,
  renderCounterpartyInfo
};
