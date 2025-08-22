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
  bandgeItem: 'option'
};
const currency = {
  RUB: '₽',
  crypto: 'KEKS'
};
const PROVIDER = 'Cash in person';

const cardNumberSellDefault = DOMElements.formModalSell.querySelector(SELECTORS.cardNumber).placeholder;
const cardNumberBuyDefault = DOMElements.formModalBuy.querySelector(SELECTORS.cardNumber).placeholder;

// Выбор платежных систем
const updatePaymentPlaceholder = (container, item, e) => {
  const { paymentMethods } = item;
  const paymentMethod = paymentMethods.find((prov) => e.target.value === prov.provider);
  container.placeholder = (paymentMethod.provider === PROVIDER) ? '' : paymentMethod.accountNumber;
};
// Крипто-кошелек PLACEHOLDER
const updateCryptoWallet = (modal, isBuy, user, item) => {
  modal.querySelector(SELECTORS.cryptoNumber).placeholder = isBuy ? user.wallet.address : item.wallet.address;
};
// Рендер платежных систем
const renderModalPaymentMethods = (modal, provider) => {
  clearBandgeContainer(modal, SELECTORS.bandgeList, 1);
  renderBandgePayMethods(modal, provider, SELECTORS.bandgeList, '', SELECTORS.bandgeItem);
};
// Информация об конрагентов
const renderCounterpartyInfo = (modal, item) => {
  modal.querySelector(SELECTORS.userName).lastChild.textContent = item.userName;
  modal.querySelector(SELECTORS.exchangeRate).textContent = `${item.exchangeRate} ${currency.RUB}`;
  modal.querySelector(SELECTORS.balanceCurrency).textContent = counterpartiesBalanceCurrency(item);
};
// Основной рендер модальнего окна
const renderCounterpartiesModal = (modal, item, user, type) => {
  const isBuyModal = type === 'sell';
  modal.provider = isBuyModal ? item : user;
  renderCounterpartyInfo(modal, item);
  updateCryptoWallet(modal, isBuyModal, user, item);
  counterpartiesIsVerified(modal, item, SELECTORS.isVerify);
  renderModalPaymentMethods(modal, modal.provider);
};
// Рендер продавцов и покупателей в зависимости от бывора
const renderCounterpartiesAll = (item, user) => {
  if (getFilteredTab(DOMElements.tabsControls) === 'seller') {
    renderCounterpartiesModal(DOMElements.formModalSell, item, user, 'sell');
  } else {
    renderCounterpartiesModal(DOMElements.formModalBuy, item, user, 'buy');
  }
};
// Открытие модального окна
const openModal = (type) => {
  DOMElements[type].style.display = 'block';
  DOMElements.body.classList.add('scroll-lock');
};
// Закрытие модального окна
const closeModal = (modal) => {
  modal.style.display = 'none';
  DOMElements.body.classList.remove('scroll-lock');
  const isModalSell = modal.querySelector(SELECTORS.form);
  isModalSell.reset();
  const isSell = isModalSell.classList.contains('modal-buy');
  isModalSell.querySelector(SELECTORS.cardNumber).placeholder = isSell ? cardNumberSellDefault : cardNumberBuyDefault;
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

export { openModal, renderCounterpartiesAll };
