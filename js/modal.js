import {
  clearBandgeContainer,
  renderBandgePayMethods,
  renderCounterpartyInfo, timeoutManager
} from './util.js';
import { initPristine, validateModal, unabledSubmit } from './validate.js';
import { MODAL, DOMElements, CURRENCY, cardNumberBuyDefault, cardNumberSellDefault, PROVIDER } from './dom-helpers.js';

const cacheDOMElements = (modalElement) => ({
  form: modalElement.querySelector(MODAL.form),
  inputFiat: modalElement.querySelector(MODAL.inputFiat),
  inputCrypto: modalElement.querySelector(MODAL.inputCrypto),
  cryptoNumber: modalElement.querySelector(MODAL.cryptoNumber),
  name: modalElement.querySelector(MODAL.name),
  exchangeRate: modalElement.querySelector(MODAL.exchangeRate),
  limit: modalElement.querySelector(MODAL.limit),
  badgeList: modalElement.querySelector(MODAL.badgeList),
  cardNumber: modalElement.querySelector(MODAL.cardNumber),
  inputId: modalElement.querySelector(MODAL.inputId),
  inputExchangeRate: modalElement.querySelector(MODAL.inputExchangeRate),
  sendingCurrency: modalElement.querySelector(MODAL.sendingCurrency),
  receivingCurrency: modalElement.querySelector(MODAL.receivingCurrency),
  sendingAmount: modalElement.querySelector(MODAL.sendingAmount),
  receivingAmount: modalElement.querySelector(MODAL.receivingAmount),
});

const defaultCryptoWalletPlaceholder = (container, mode) => {
  container.querySelector(MODAL.cardNumber).placeholder = mode
    ? cardNumberSellDefault
    : cardNumberBuyDefault;
};
// Выбор платежной системы и обновление placeholder
const updatePaymentPlaceholder = (container, counterparty, e) => {
  const { paymentMethods } = counterparty;
  const selectedMethod = paymentMethods.find((prov) => e.target.value === prov.provider);
  container.placeholder = (selectedMethod.provider === PROVIDER) ? '' : selectedMethod.accountNumber;
};
// Обновление placeholder для крипт-кошелька
const updateCryptoWallet = (modalElement, user, counterparty) => {
  const { cryptoNumber } = modalElement.DOMElements;
  cryptoNumber.placeholder = modalElement.mode
    ? user.wallet.address
    : counterparty.wallet.address;
};
// Очищает и рендер платежные системы
const renderModalPaymentMethods = (modalElement, provider) => {
  clearBandgeContainer(modalElement, MODAL.badgeList, 1);
  renderBandgePayMethods(modalElement, provider, MODAL.badgeList, '', MODAL.badgeItem);
};
// Определяем валюту для сделки
const targetCurrency = (mode) => mode ? CURRENCY.FIAT : CURRENCY.CRYPTO;
// Преобразуем сумму в 2 знака после запятой
const roundingAmount = (number) => Number(number.toFixed(2));
// Получаем баланс пользователя в нужной валюте
const getUserBalance = (user, mode) => {
  const userCurrencyBalance = user.balances.find((balances) => balances.currency === targetCurrency(mode));
  return userCurrencyBalance ? roundingAmount(userCurrencyBalance.amount) : 0;
};
// Устанавливаем максимум для input
const assignContainerMax = (container, first, second) => {
  container.setAttribute('data-max', Math.min(first, second));
};
// Минимальные суммы для фиата и крипты в input min
const updateMinAmounts = (fiatMin, cryptoMin, counterparty, user, mode) => {
  const fiatMinAmount = mode
    ? counterparty.minAmount * counterparty.exchangeRate
    : counterparty.minAmount;
  fiatMin.setAttribute('data-min', roundingAmount(fiatMinAmount));
  const cryptoMinAmount = mode
    ? counterparty.minAmount
    : counterparty.minAmount / counterparty.exchangeRate;
  cryptoMin.setAttribute('data-min', Math.min(roundingAmount(cryptoMinAmount), getUserBalance(user, 'buy')));
};
// Максимальная сумма сделки для фиата в input max
const updateMaxFiatAmount = (container, counterparty, user, mode) => {
  const maxAmount = mode
    ? counterparty.balance.amount * counterparty.exchangeRate
    : getUserBalance(user, mode) * counterparty.exchangeRate;
  const convertedUserBalance = getUserBalance(user, 'sell');
  assignContainerMax(container, roundingAmount(maxAmount), convertedUserBalance);
};
// Максимальная сумма сделки для крипты в input max
const updateMaxCryptoAmount = (container, counterparty, user, mode) => {
  const maxAmount = mode
    ? counterparty.balance.amount
    : counterparty.balance.amount / counterparty.exchangeRate;
  const convertedUserBalance = mode
    ? roundingAmount(getUserBalance(user, mode) / counterparty.exchangeRate)
    : getUserBalance(user, mode);
  assignContainerMax(container, roundingAmount(maxAmount), convertedUserBalance);
};
// Обновляем минимальные и максимальные значения одновременно
const updateMinMaxAmounts = (modalElement, counterparty, user) => {
  const { inputFiat, inputCrypto } = modalElement.DOMElements;

  updateMinAmounts(inputFiat, inputCrypto, counterparty, user, modalElement.mode);
  updateMaxCryptoAmount(inputCrypto, counterparty, user, modalElement.mode);
  updateMaxFiatAmount(inputFiat, counterparty, user, modalElement.mode);
};

const mathFiatToCrypto = (fiat, course) => fiat / course;
const mathCryptoToFiat = (crypto, course) => crypto * course;
const sendingAndReceivingMax = (modalElement) => {
  const { inputCrypto, sendingAmount, receivingAmount } = modalElement.DOMElements;
  const { exchangeRate, balance } = modalElement.counterparty;

  sendingAmount.value = modalElement.mode
    ? mathCryptoToFiat(balance.amount, exchangeRate)
    : inputCrypto.value;
  receivingAmount.value = modalElement.mode
    ? inputCrypto.value
    : mathCryptoToFiat(inputCrypto.value, exchangeRate);
};
const sendingAndReceivingInput = (modalElement, fiat, crypto) => {
  const { inputCrypto, inputFiat, sendingAmount, receivingAmount } = modalElement.DOMElements;
  const { exchangeRate } = modalElement.counterparty;

  if (fiat) {
    inputCrypto.value = roundingAmount(mathFiatToCrypto(inputFiat.value, exchangeRate));
    sendingAmount.value = modalElement.mode ? inputFiat.value : mathFiatToCrypto(inputFiat.value, exchangeRate);
    receivingAmount.value = modalElement.mode ? mathFiatToCrypto(inputFiat.value, exchangeRate) : inputFiat.value;
  }
  if (crypto) {
    inputFiat.value = roundingAmount(mathCryptoToFiat(inputCrypto.value, exchangeRate));
    sendingAmount.value = modalElement.mode ? mathCryptoToFiat(inputCrypto.value, exchangeRate) : inputCrypto.value;
    receivingAmount.value = modalElement.mode ? inputCrypto.value : mathCryptoToFiat(inputCrypto.value, exchangeRate);
  }
};
const isFiatClicks = (modalElement) => {
  const { inputCrypto, inputFiat } = modalElement.DOMElements;
  const { exchangeRate } = modalElement.counterparty;
  const { validate } = modalElement.DOMElements.form;

  inputFiat.value = inputFiat.dataset.max;
  inputCrypto.value = roundingAmount(mathFiatToCrypto(inputFiat.value, exchangeRate));

  validate.validate(inputFiat);
};
const isCryptoClicks = (modalElement) => {
  const { inputCrypto, inputFiat } = modalElement.DOMElements;
  const { exchangeRate } = modalElement.counterparty;
  const { validate } = modalElement.DOMElements.form;

  inputCrypto.value = inputCrypto.dataset.max;
  inputFiat.value = roundingAmount(mathCryptoToFiat(inputCrypto.value, exchangeRate));

  validate.validate(inputCrypto);
};
const handleMaxButtonClicks = (e) => {
  const modalElement = e.currentTarget;

  const isFiatClick = e.target.matches(MODAL.exchangeFiatButton);
  const isCryptoClick = e.target.matches(MODAL.exchangeCryptoButton);

  if (isFiatClick || isCryptoClick) {
    if (isFiatClick) {
      isFiatClicks(modalElement);
    }
    if (isCryptoClick) {
      isCryptoClicks(modalElement);
    }
    sendingAndReceivingMax(modalElement);
  }
};
const syncInputValues = (e) => {
  const modalElement = e.currentTarget;
  const fiat = e.target.matches(MODAL.inputFiat);
  const crypto = e.target.matches(MODAL.inputCrypto);
  timeoutManager(() => sendingAndReceivingInput(modalElement, fiat, crypto), 500)();
};
const attachPaymentChange = (e) => {
  const modalElement = e.currentTarget;
  const { badgeList, cardNumber } = modalElement.DOMElements;

  if (e.target === badgeList) {
    updatePaymentPlaceholder(cardNumber, modalElement.provider, e);
  }
};

const counterpartyInfoForm = (modalElement) => {
  const { inputId, inputExchangeRate, sendingCurrency, receivingCurrency } = modalElement.DOMElements;
  const { id, exchangeRate } = modalElement.counterparty;

  inputId.value = id;
  inputExchangeRate.value = exchangeRate;
  sendingCurrency.value = targetCurrency(modalElement.mode);
  receivingCurrency.value = targetCurrency(!modalElement.mode);
};
// Добавление слушателей
const addEventListenerModal = (modalElement) => {
  modalElement.addEventListener('click', handleMaxButtonClicks);
  modalElement.addEventListener('input', syncInputValues);
  modalElement.addEventListener('change', attachPaymentChange);
};
// Удаление слушателей
const removeEventListenerModal = (modalElement) => {
  modalElement.removeEventListener('click', handleMaxButtonClicks);
  modalElement.removeEventListener('input', syncInputValues);
  modalElement.removeEventListener('change', attachPaymentChange);
  modalElement.removeEventListener('submit', validateModal);
};
// Основной рендер модального окна
const renderCounterpartiesModal = (modalElement, counterparty, user, mode) => {
  modalElement.mode = mode;
  modalElement.provider = mode ? counterparty : user;
  modalElement.counterparty = counterparty;
  modalElement.DOMElements = cacheDOMElements(modalElement);

  counterpartyInfoForm(modalElement);
  renderCounterpartyInfo(modalElement, MODAL, counterparty);
  updateCryptoWallet(modalElement, user, counterparty);
  renderModalPaymentMethods(modalElement, modalElement.provider);
  updateMinMaxAmounts(modalElement, counterparty, user, mode);
  addEventListenerModal(modalElement);
};

// Показать модальное окно
const visibleModal = (modalElement) => {
  modalElement.style.display = 'block';
  DOMElements.body.classList.add('scroll-lock');
};
// Скрытие модального окна и скролл у body
const hideModal = (modalElement) => {
  modalElement.style.display = 'none';
  DOMElements.body.classList.remove('scroll-lock');
};
// Сброс формы в дефолтное положение
const resetFormModal = (modalElement) => {
  const { form } = modalElement.DOMElements;
  const button = form.querySelector('.modal__submit');
  unabledSubmit(button);
  form.reset();
  form.validate.reset();

  defaultCryptoWalletPlaceholder(form, modalElement.mode);
};
// Закрывает модальное окно
function closeModal(modalElement) {
  removeEventListenerModal(modalElement);
  resetFormModal(modalElement);
  hideModal(modalElement);
  if (modalElement.escHandler) {
    document.removeEventListener('keydown', modalElement.escHandler);
    modalElement.escHandler = null;
  }
  if (modalElement.handlerButton) {
    modalElement.escButton.removeEventListener('click', modalElement.handlerButton);
    modalElement.escButton = null;
    modalElement.handlerButton = null;
  }
  if (modalElement.handlerOverlay) {
    modalElement.removeEventListener('click', modalElement.handlerOverlay);
    modalElement.handlerOverlay = null;
  }
}

function handleEscClose(modalElement) {
  const escEvent = (e) => {
    if (e.key === 'Escape') {
      closeModal(modalElement);
    }
  };
  modalElement.escHandler = escEvent;
  document.addEventListener('keydown', escEvent);
}
function handleButtonClose(modalElement, button) {
  const clickClose = () => {
    closeModal(modalElement);
  };
  modalElement.handlerButton = clickClose;
  modalElement.escButton = button;
  button.addEventListener('click', clickClose);
}
function handleOverlayClose(modalElement) {
  const overlayClose = (e) => {
    if (e.target.matches('.modal__overlay')) {
      closeModal(modalElement);
    }
  };
  modalElement.handlerOverlay = overlayClose;
  modalElement.addEventListener('click', overlayClose);
}
// Открывает модальное окно
const openModal = (mode, counterparty, user) => {
  const modalElement = DOMElements[mode];
  const seller = mode === 'seller';
  const closeButton = modalElement.querySelector('.modal__close-btn');

  visibleModal(modalElement);
  renderCounterpartiesModal(modalElement, counterparty, user, seller);

  const form = modalElement.querySelector(MODAL.form);
  const pristine = initPristine(form, seller);
  form.validate = pristine;

  modalElement.removeEventListener('submit', validateModal);
  modalElement.addEventListener('submit', validateModal);

  handleOverlayClose(modalElement);
  handleEscClose(modalElement);
  handleButtonClose(modalElement, closeButton);
};

export { openModal, closeModal, renderCounterpartiesModal, targetCurrency };
