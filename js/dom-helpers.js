const DOMElements = {
  body: document.querySelector('body'),
  counterpartyListContainer: document.querySelector('.users-list__table-body'),
  counterpartyTemplate: document.querySelector('#user-table-row__template').content,
  tabsControls: document.querySelector('.tabs__controls'),
  modal: document.querySelectorAll('.modal'),
  seller: document.querySelector('.modal.modal--buy'),
  buyer: document.querySelector('.modal.modal--sell'),
  formModalSell: document.querySelector('.modal-buy'),
  formModalBuy: document.querySelector('.modal-sell'),
  templateBalloon: document.querySelector('#map-baloon__template'),


  mapContainer: document.querySelector('.map'),

  checkedUsers: document.querySelector('#checked-users'),
  counterpartyList: document.querySelector('.users-list'),
  tabsToggleBuySell: document.querySelector('.tabs--toggle-buy-sell'),
  tabsMap: document.querySelector('.tabs--toggle-list-map'),

};
// СЕЛЕКТОРЫ
const COUNTERPARTIES = {
  containers: '.users-list__table-row',
  name: '.users-list__table-name span',
  isVerify: '.users-list__table-name svg',
  currency: '.users-list__table-currency',
  exchangeRate: '.users-list__table-exchangerate',
  limit: '.users-list__table-cashlimit',
  badgeList: '.users-list__badges-list',
  badgeItem: ['users-list__badges-item', 'badge'],
  buttonOpenModal: '.btn--greenborder',
};
const BALLOON = {
  containers: '.user-card',
  name: '.user-card__user-name span',
  isVerify: '.user-card__user-name svg',
  currency: '[data-cash="currency"]',
  exchangeRate: '[data-cash="exchange-rate"]',
  limit: '[data-cash="limit"]',
  badgesList: '.user-card__badges-list',
  badgeItem: ['users-list__badges-item', 'badge'],
  buttonOpenModal: '.btn--green',
};
const MODAL = {
  form: 'form',
  modal: '.modal',
  inputId: '[name="contractorId"]',
  name: '.transaction-info__item--name .transaction-info__data span',
  isVerify: '.transaction-info__item--name .transaction-info__data svg',
  exchangeRate: '.transaction-info__item--exchangerate .transaction-info__data',
  limit: '.transaction-info__item--cashlimit .transaction-info__data',
  cardNumber: '[data-type="card-number"]',
  cryptoNumber: '[data-type="crypto-number"]',
  messageError: '.modal__validation-message--error',
  messageSuccess: '.modal__validation-message--success',
  inputFiat: '[data-payment="fiat"]',
  inputExchangeRate: '[name="exchangeRate"]',
  sendingCurrency: '[name="sendingCurrency"]',
  receivingCurrency: '[name="receivingCurrency"]',
  sendingAmount: '[name="sendingAmount"]',
  receivingAmount: '[name="receivingAmount"]',
  inputCrypto: '[data-payment="crypto"]',
  exchangeFiatButton: '.custom-input__btn.fiat',
  exchangeCryptoButton: '.custom-input__btn.crypto',
  badgeList: '.select select',
  badgeItem: 'option',
  password: '[type="password"]',
};

// ДАННЫЕ ДЛЯ КАРТЫ
const COORDINATES_DEFAULT = {
  lat: 59.92749,
  lng: 30.31127,
  view: 9
};
const TILE_LAYER = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>';
//
const CURRENCY = {
  RUB: '₽',
  FIAT: 'RUB',
  CRYPTO: 'KEKS'
};
// Сохраняем placeholder по умолчанию для полей карты
const cardNumberSellDefault = DOMElements.formModalSell.querySelector(MODAL.cardNumber).placeholder;
const cardNumberBuyDefault = DOMElements.formModalBuy.querySelector(MODAL.cardNumber).placeholder;
const PROVIDER = 'Cash in person';
const passwords = '180712';


export { DOMElements, COUNTERPARTIES,
  BALLOON, COORDINATES_DEFAULT, TILE_LAYER,
  ATTRIBUTION, PROVIDER, MODAL, passwords,
  CURRENCY, cardNumberSellDefault, cardNumberBuyDefault };
