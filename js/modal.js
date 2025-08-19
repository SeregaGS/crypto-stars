import {
  counterpartiesBalanceCurrency,
  clearBandgeContainer,
  renderCounterpartiesPaymentSeller,
  counterpartiesIsVerified,
  renderBandgePayMethods
} from './util.js';
import { getFilteredTab } from './filter.js';

const DOMElements = {
  formModalSell: document.querySelector('.modal-buy'),
  formModalBuy: document.querySelector('.modal-sell'),
  modalCloseBtn: document.querySelectorAll('.modal__close-btn'),
  seller: document.querySelector('.modal.modal--buy'),
  buyer: document.querySelector('.modal.modal--sell'),
  tabsControls: document.querySelector('.tabs__controls'),
};
const SELECTORS = {
  isVerify: '.transaction-info__data svg',
  userName: '.transaction-info__item--name  .transaction-info__data',
  exchangeRate: '.transaction-info__item--exchangerate .transaction-info__data',
  balanceCurrency: '.transaction-info__item--cashlimit .transaction-info__data',
  cardNumber: '[data-type="card-number"]',
  cryptoNumber: '[data-type="crypto-number"]',
  bandgeList: '.select select',
  bandgeItem: 'option'
};
const PROVIDER = 'Cash in person';

const cardNumberSellDefault = DOMElements.formModalSell.querySelector(SELECTORS.cardNumber).placeholder;
const cardNumberBuyDefault = DOMElements.formModalBuy.querySelector(SELECTORS.cardNumber).placeholder;


const paymentChange = (container, item, e) => {
  const { paymentMethods } = item;
  const paymentMethod = paymentMethods.find((prov) => e.target.value === prov.provider);
  container.placeholder = (paymentMethod.provider === PROVIDER) ? '' : paymentMethod.accountNumber;
};
// const isBuyModal = (type) => type === 'sell';

const renderCryptoWallet = (modal, isBuy, user, item) => {
  modal.querySelector(SELECTORS.cryptoNumber).placeholder = isBuy ? user.wallet.address : item.wallet.address;
};
const renderPaymentMethodsModal = (modal, provider) => {
  clearBandgeContainer(modal, SELECTORS.bandgeList, 1);
  renderBandgePayMethods(modal, provider, SELECTORS.bandgeList, '', SELECTORS.bandgeItem);
};
const fillModalData = (modal, item) => {
  modal.querySelector(SELECTORS.userName).lastChild.textContent = item.userName;
  modal.querySelector(SELECTORS.exchangeRate).textContent = `${item.exchangeRate} ₽`;
  modal.querySelector(SELECTORS.balanceCurrency).textContent = counterpartiesBalanceCurrency(item);
};
const renderCounterpartiesModal = (modal, item, user, type) => {
  const isBuyModal = type === 'sell';
  modal.provider = isBuyModal ? item : user;
  fillModalData(modal, item)
  renderCryptoWallet(modal, isBuyModal, user, item);
  counterpartiesIsVerified(modal, item, SELECTORS.isVerify);
  renderPaymentMethodsModal(modal, modal.provider);
};
const renderCounterpartiesAll = (item, user) => {
  if (getFilteredTab(DOMElements.tabsControls) === 'seller') {
    renderCounterpartiesModal(DOMElements.formModalSell, item, user, 'sell');
  } else {
    renderCounterpartiesModal(DOMElements.formModalBuy, item, user, 'buy');
  }
};
const openModal = (type) => {
  const modal = DOMElements[type];
  modal.style.display = 'block';
};

const closeModal = (button) => {
  button.style.display = 'none';
  DOMElements.formModalBuy.reset();
  DOMElements.formModalSell.reset();
  DOMElements.formModalSell.querySelector(SELECTORS.cardNumber).placeholder = cardNumberSellDefault;
  DOMElements.formModalBuy.querySelector(SELECTORS.cardNumber).placeholder = cardNumberBuyDefault;
};

DOMElements.modalCloseBtn.forEach((btn) => {
  btn.addEventListener('click', () => {
    const modal = btn.closest('.modal');
    closeModal(modal);
  });
});

DOMElements.formModalSell.addEventListener('change', (e) => {
  const select = DOMElements.formModalSell.querySelector('.select select');
  if (e.target === select) {
    const item = DOMElements.formModalSell.provider;
    paymentChange(DOMElements.formModalSell.querySelector(SELECTORS.cardNumber), item, e);
  }
});
DOMElements.formModalBuy.addEventListener('change', (e) => {
  const select = DOMElements.formModalBuy.querySelector('.select select');
  if (e.target === select) {
    const item = DOMElements.formModalBuy.provider;
    paymentChange(DOMElements.formModalBuy.querySelector(SELECTORS.cardNumber), item, e);
  }
});
export { openModal, renderCounterpartiesAll };
