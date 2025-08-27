import {
  counterpartiesBalanceCurrency,
  clearBandgeContainer,
  counterpartiesIsVerified,
  renderBandgePayMethods
} from './util.js';
import { getFilteredTab } from './filter.js';

const DOMElements = {
  body: document.querySelector('body'),
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
// Если выбран Cash in person, поле пустое, иначе показываем номер счета
const updatePaymentPlaceholder = (container, counterparty, event) => {
  const { paymentMethods } = counterparty;
  const selectedMethod = paymentMethods.find((prov) => event.target.value === prov.provider);
  container.placeholder = (selectedMethod.provider === PROVIDER) ? '' : selectedMethod.accountNumber;
};
// Обновление placeholder для крипто-кошелька
// Если покупка — показываем кошелек пользователя, если продажа — кошелек контрагента
const updateCryptoWallet = (modalElement, isBuyMode, user, counterparty) => {
  modalElement.querySelector(SELECTORS.cryptoNumber).placeholder = isBuyMode
    ? user.wallet.address
    : counterparty.wallet.address;
};
// Рендер платежных систем
const renderModalPaymentMethods = (modalElement, provider) => {
  clearBandgeContainer(modalElement, SELECTORS.bandgeList, 1);
  renderBandgePayMethods(modalElement, provider, SELECTORS.bandgeList, '', SELECTORS.bandgeItem);
};
// Отображаем информацию о контрагенте
// Показываем имя, курс обмена и доступный баланс
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

// Минимальные суммы для фиата и крипты
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
// Максимальная сумма сделки для фиата
const updateMaxFiatAmount = (container, counterparty, user, mode) => {
  const maxAmount = mode === 'sell' ? counterparty.balance.amount * counterparty.exchangeRate : getUserBalance(user, mode) * counterparty.exchangeRate;
  const counterpartyAvailableAmount = maxAmount ? roundingAmount(maxAmount) : 0;
  const convertedUserBalance = getUserBalance(user, 'sell');
  assignContainerMax(container, counterpartyAvailableAmount, convertedUserBalance);
};
// Максимальная сумма сделки для крипты
const updateMaxCryptoAmount = (container, counterparty, user, mode) => {
  const maxAmount = mode === 'sell' ? counterparty.balance.amount : counterparty.balance.amount / counterparty.exchangeRate;
  const counterpartyAvailableAmount = maxAmount ? roundingAmount(maxAmount) : 0;
  const convertedUserBalance = mode === 'sell' ? roundingAmount(getUserBalance(user, mode) / counterparty.exchangeRate) : getUserBalance(user, mode);
  assignContainerMax(container, counterpartyAvailableAmount, convertedUserBalance);
};
// Обновляем минимальные и максимальные значения одновременно
const updateMinMaxAmounts = (fiatInput, cryptoInput, counterparty, user, mode) => {
  updateMinAmounts(fiatInput, cryptoInput, counterparty, user, mode);
  updateMaxCryptoAmount(cryptoInput, counterparty, user, mode);
  updateMaxFiatAmount(fiatInput, counterparty, user, mode);
};

// Устанавливаем input в максимум при нажатии кнопки
const setMaxOnClick = (button, input) => {
  if (!button || !input) { return; }
  button.addEventListener('click', () => {
    input.value = input.max;
  });
};
// Синхронизация input фиата → крипта
const changeInputCryptoValue = (fiatInput, cryptoInput, counterparty) => {
  fiatInput.addEventListener('input', () => {
    const newValue = roundingAmount(fiatInput.value / counterparty.exchangeRate);
    cryptoInput.value = newValue;
  });
};
// Синхронизация input крипта → фиата
const changeInputFiatValue = (fiatInput, cryptoInput, counterparty) => {
  cryptoInput.addEventListener('input', () => {
    const newValue = roundingAmount(cryptoInput.value * counterparty.exchangeRate);
    fiatInput.value = newValue;
  });
};
// Привязываем двустороннюю синхронизацию полей
const syncFiatAndCryptoInputs = (fiatInput, cryptoInput, counterparty) => {
  changeInputCryptoValue(fiatInput, cryptoInput, counterparty);
  changeInputFiatValue(fiatInput, cryptoInput, counterparty);
};
// Очистка input при закрытии модалки
const cleanInputValue = (fiatInput, cryptoInput) => {
  fiatInput.value = '';
  cryptoInput.value = '';
};

// Основной рендер модальнего окна
const renderCounterpartiesModal = (modalElement, counterparty, user, mode) => {
  const isBuyModal = mode === 'sell';
  modalElement.provider = isBuyModal ? counterparty : user;
  const dataPaymentFiat = modalElement.querySelector(SELECTORS.dataPaymentFiat);
  const dataPaymentCrypto = modalElement.querySelector(SELECTORS.dataPaymentCrypto);
  renderCounterpartyInfo(modalElement, counterparty);
  updateCryptoWallet(modalElement, isBuyModal, user, counterparty);
  counterpartiesIsVerified(modalElement, counterparty, SELECTORS.isVerify);
  renderModalPaymentMethods(modalElement, modalElement.provider);
  updateMinMaxAmounts(dataPaymentFiat, dataPaymentCrypto, counterparty, user, mode);
  // Обменять всё * РУБЛИ * и * КРИПТО *
  setMaxOnClick(modalElement.querySelector(SELECTORS.exchangeFiatButton), dataPaymentFiat);
  setMaxOnClick(modalElement.querySelector(SELECTORS.exchangeCryptoButton), dataPaymentCrypto);
  syncFiatAndCryptoInputs(dataPaymentFiat, dataPaymentCrypto, counterparty);
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
};
const closeModal = (modalElement) => {
  modalElement.style.display = 'none';
  DOMElements.body.classList.remove('scroll-lock');
  const isModalSell = modalElement.querySelector(SELECTORS.form);
  isModalSell.reset();
  const isSell = isModalSell.classList.contains('modal-buy');
  isModalSell.querySelector(SELECTORS.cardNumber).placeholder = isSell ? cardNumberSellDefault : cardNumberBuyDefault;


  cleanInputValue(isModalSell.querySelector(SELECTORS.dataPaymentFiat), isModalSell.querySelector(SELECTORS.dataPaymentCrypto));
};
const modalCloseBtns = (closeButtons) => {
  closeButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const modal = btn.closest(SELECTORS.modal);
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

modalCloseBtns(DOMElements.modalCloseBtn);
attachPaymentChange(DOMElements.formModalSell);
attachPaymentChange(DOMElements.formModalBuy);

export { openModal, renderCounterpartiesAll, renderCounterpartiesModal };
