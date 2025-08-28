import {
  counterpartiesBalanceCurrency,
  clearBandgeContainer,
  counterpartiesIsVerified,
  renderBandgePayMethods
} from './util.js';
import { getFilteredTab } from './filter.js';

const DOMElements = {
  body: document.querySelector('body'),
  modal: document.querySelectorAll('.modal'),
  formModalSell: document.querySelector('.modal-buy'),
  formModalBuy: document.querySelector('.modal-sell'),
  modalCloseBtn: document.querySelectorAll('.modal__close-btn'),
  seller: document.querySelector('.modal.modal--buy'),
  buyer: document.querySelector('.modal.modal--sell'),
  tabsControls: document.querySelector('.tabs__controls'),
};
const SELECTORS = {
  form: 'form',
  modal: '.modal',
  isVerify: '.transaction-info__data svg',
  userName: '.transaction-info__item--name  .transaction-info__data',
  exchangeRate: '.transaction-info__item--exchangerate .transaction-info__data',
  balanceCurrency: '.transaction-info__item--cashlimit .transaction-info__data',
  cardNumber: '[data-type="card-number"]',
  cryptoNumber: '[data-type="crypto-number"]',
  bandgeList: '.select select',
  bandgeItem: 'option',
  dataPaymentFiat: '[data-payment="fiat"]',
  dataPaymentCrypto: '[data-payment="crypto"]',
  exchangeFiatButton: '.custom-input__btn.fiat',
  exchangeCryptoButton: '.custom-input__btn.crypto',
};
const CURRENCY = {
  RUB: '₽',
  FIAT: 'RUB',
  CRYPTO: 'KEKS'
};
const PROVIDER = 'Cash in person';

// Сохраняем placeholder по умолчанию для полей карты
const cardNumberSellDefault = DOMElements.formModalSell.querySelector(SELECTORS.cardNumber).placeholder;
const cardNumberBuyDefault = DOMElements.formModalBuy.querySelector(SELECTORS.cardNumber).placeholder;

// Выбор платежной системы и обновление placeholder
const updatePaymentPlaceholder = (container, counterparty, event) => {
  const { paymentMethods } = counterparty;
  const selectedMethod = paymentMethods.find((prov) => event.target.value === prov.provider);
  container.placeholder = (selectedMethod.provider === PROVIDER) ? '' : selectedMethod.accountNumber;
};
// Обновление placeholder для крипто-кошелька
const updateCryptoWallet = (modalElement, isBuyMode, user, counterparty) => {
  modalElement.querySelector(SELECTORS.cryptoNumber).placeholder = isBuyMode
    ? user.wallet.address
    : counterparty.wallet.address;
};
// Очищаем и рендерим платежные системы
const renderModalPaymentMethods = (modalElement, provider) => {
  clearBandgeContainer(modalElement, SELECTORS.bandgeList, 1);
  renderBandgePayMethods(modalElement, provider, SELECTORS.bandgeList, '', SELECTORS.bandgeItem);
};
// Отображаем информацию о контрагенте
const renderCounterpartyInfo = (modalElement, counterparty) => {
  modalElement.querySelector(SELECTORS.userName).lastChild.textContent = counterparty.userName;
  modalElement.querySelector(SELECTORS.exchangeRate).textContent = `${counterparty.exchangeRate} ${CURRENCY.RUB}`;
  modalElement.querySelector(SELECTORS.balanceCurrency).textContent = counterpartiesBalanceCurrency(counterparty);
};

// Определяем валюту для сделки
const targetCurrency = (mode) => mode === 'sell' ? CURRENCY.FIAT : CURRENCY.CRYPTO;
// Преобразуем сумму в 2 знака после запятой
const roundingAmount = (number) => Number(number.toFixed(2));
// Получаем баланс пользователя в нужной валюте
const getUserBalance = (user, mode) => {
  const userCurrencyBalance = user.balances.find((balances) => balances.currency === targetCurrency(mode));
  return userCurrencyBalance ? roundingAmount(userCurrencyBalance.amount) : 0;
};
// Устанавливаем максимум для input
const assignContainerMax = (container, first, second) => {
  container.max = Math.min(first, second);
};
// Минимальные суммы для фиата и крипты в input min
const updateMinAmounts = (fiatMin, cryptoMin, counterparty, user, mode) => {
  const fiatMinAmount = mode === 'sell'
    ? counterparty.minAmount * counterparty.exchangeRate
    : counterparty.minAmount;
  fiatMin.min = roundingAmount(fiatMinAmount);
  const cryptoMinAmount = mode === 'sell'
    ? counterparty.minAmount
    : counterparty.minAmount / counterparty.exchangeRate;
  cryptoMin.min = Math.min(roundingAmount(cryptoMinAmount), getUserBalance(user, 'buy'));
};
// Максимальная сумма сделки для фиата в input max
const updateMaxFiatAmount = (container, counterparty, user, mode) => {
  const maxAmount = mode === 'sell'
    ? counterparty.balance.amount * counterparty.exchangeRate
    : getUserBalance(user, mode) * counterparty.exchangeRate;
  const convertedUserBalance = getUserBalance(user, 'sell');
  assignContainerMax(container, roundingAmount(maxAmount), convertedUserBalance);
};
// Максимальная сумма сделки для крипты в input max
const updateMaxCryptoAmount = (container, counterparty, user, mode) => {
  const maxAmount = mode === 'sell'
    ? counterparty.balance.amount
    : counterparty.balance.amount / counterparty.exchangeRate;
  const convertedUserBalance = mode === 'sell'
    ? roundingAmount(getUserBalance(user, mode) / counterparty.exchangeRate)
    : getUserBalance(user, mode);
  assignContainerMax(container, roundingAmount(maxAmount), convertedUserBalance);
};
// Обновляем минимальные и максимальные значения одновременно
const updateMinMaxAmounts = (modalElement, counterparty, user, mode) => {
  const dataPaymentFiat = modalElement.querySelector(SELECTORS.dataPaymentFiat);
  const dataPaymentCrypto = modalElement.querySelector(SELECTORS.dataPaymentCrypto);

  updateMinAmounts(dataPaymentFiat, dataPaymentCrypto, counterparty, user, mode);
  updateMaxCryptoAmount(dataPaymentCrypto, counterparty, user, mode);
  updateMaxFiatAmount(dataPaymentFiat, counterparty, user, mode);
};
// Делегирование input в максимум при нажатии кнопки
const handleMaxButtonClicks = (modalElement, counterparty) => {
  const dataPaymentFiat = modalElement.querySelector(SELECTORS.dataPaymentFiat);
  const dataPaymentCrypto = modalElement.querySelector(SELECTORS.dataPaymentCrypto);

  modalElement.addEventListener('click', (e) => {
    if (e.target.matches(SELECTORS.exchangeFiatButton)) {
      dataPaymentFiat.value = dataPaymentFiat.max;
      dataPaymentCrypto.value = roundingAmount(dataPaymentFiat.value / counterparty.exchangeRate);
    }
    if (e.target.matches(SELECTORS.exchangeCryptoButton)) {
      dataPaymentCrypto.value = dataPaymentCrypto.max;
      dataPaymentFiat.value = roundingAmount(dataPaymentCrypto.value * counterparty.exchangeRate);
    }
  });
};
// Делегирование ввода фиата и крипты
const syncInputValues = (modalElement, counterparty) => {
  const dataPaymentFiat = modalElement.querySelector(SELECTORS.dataPaymentFiat);
  const dataPaymentCrypto = modalElement.querySelector(SELECTORS.dataPaymentCrypto);

  modalElement.addEventListener('input', (e) => {
    if (e.target.matches(SELECTORS.dataPaymentFiat)) {
      dataPaymentCrypto.value = roundingAmount(dataPaymentFiat.value / counterparty.exchangeRate);
    }
    if (e.target.matches(SELECTORS.dataPaymentCrypto)) {
      dataPaymentFiat.value = roundingAmount(dataPaymentCrypto.value * counterparty.exchangeRate);
    }
  });
};
// Очистка input при закрытии модалки
const cleanInputValue = (modalElement) => {
  const inputs = `${SELECTORS.dataPaymentFiat}, ${SELECTORS.dataPaymentCrypto}`;
  const valueInputs = modalElement.querySelectorAll(inputs);
  valueInputs.forEach((input) => {
    input.value = '';
  });
};
// Основной рендер модальнего окна
const renderCounterpartiesModal = (modalElement, counterparty, user, mode) => {
  const isBuyModal = mode === 'sell';
  modalElement.provider = isBuyModal ? counterparty : user;

  renderCounterpartyInfo(modalElement, counterparty);
  updateCryptoWallet(modalElement, isBuyModal, user, counterparty);
  counterpartiesIsVerified(modalElement, counterparty, SELECTORS.isVerify);
  renderModalPaymentMethods(modalElement, modalElement.provider);

  updateMinMaxAmounts(modalElement, counterparty, user, mode);

  syncInputValues(modalElement, counterparty);
  handleMaxButtonClicks(modalElement, counterparty);
};

// Рендерим всех контрагентов в зависимости от выбранной вкладки
const renderCounterpartiesAll = (counterparty, user) => {
  if (getFilteredTab(DOMElements.tabsControls) === 'seller') {
    renderCounterpartiesModal(DOMElements.formModalSell, counterparty, user, 'sell');
  } else {
    renderCounterpartiesModal(DOMElements.formModalBuy, counterparty, user, 'buy');
  }
};
const openModal = (mode) => {
  DOMElements[mode].style.display = 'block';
  DOMElements.body.classList.add('scroll-lock');

  const escEvent = (event) => {
    if (event.key === 'Escape') {
      closeModal(DOMElements[mode]);
      document.removeEventListener('keydown', escEvent);
    }
  };
  document.addEventListener('keydown', escEvent);
};
const closeModal = (modalElement) => {
  modalElement.style.display = 'none';
  DOMElements.body.classList.remove('scroll-lock');
  const isModalSell = modalElement.querySelector(SELECTORS.form);
  isModalSell.reset();

  const isSell = isModalSell.classList.contains('modal-buy');

  isModalSell.querySelector(SELECTORS.cardNumber).placeholder = isSell
    ? cardNumberSellDefault
    : cardNumberBuyDefault;

  cleanInputValue(modalElement);
};

const modalCloseBtn = (modalElements) => {
  modalElements.forEach((modal) => {
    modal.addEventListener('click', (e) => {
      const overlayModal = e.target.closest('.modal__overlay');
      const closeButton = e.target.closest('.modal__close-btn');
      if (!overlayModal && !closeButton) { return; }
      closeModal(modal);
    });
  });
};
const attachPaymentChange = (formModal) => {
  formModal.addEventListener('change', (e) => {
    const select = formModal.querySelector(SELECTORS.bandgeList);
    if (e.target === select) {
      const item = formModal.provider;
      updatePaymentPlaceholder(formModal.querySelector(SELECTORS.cardNumber), item, e);
    }
  });
};

modalCloseBtn(DOMElements.modal);
attachPaymentChange(DOMElements.formModalSell);
attachPaymentChange(DOMElements.formModalBuy);


export { openModal, renderCounterpartiesAll, renderCounterpartiesModal };
