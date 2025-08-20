import {
  counterpartiesIsVerified,
  clearBandgeContainer,
  renderSellerPaymentBadges,
  counterpartiesBalanceCurrency
} from './util.js';
import { openModal, renderCounterpartiesAll } from './modal.js';
import { getFilteredTab } from './filter.js';

const DOMElements = {
  usersListContainer: document.querySelector('.users-list__table-body'),
  userTableRowTemplate: document.querySelector('#user-table-row__template').content,
  tabsControls: document.querySelector('.tabs__controls')
};
const SELECTORS = {
  containerUser: '.users-list__table-row',
  name: '.users-list__table-name span',
  currency: '.users-list__table-currency',
  exchangeRate: '.users-list__table-exchangerate',
  limit: '.users-list__table-cashlimit',
  isVerify: '.users-list__table-name svg',
  badgesList: '.users-list__badges-list',
  badgesItem: ['users-list__badges-item', 'badge'],
  button: '.btn--greenborder'
};

const createCounterpartiesItem = (counterparty, user) => {
  const { userName, balance, exchangeRate, id } = counterparty;
  const list = DOMElements.userTableRowTemplate.cloneNode(true);
  list.querySelector(SELECTORS.containerUser).id = id;
  list.querySelector(SELECTORS.name).textContent = userName;
  list.querySelector(SELECTORS.currency).textContent = balance.currency;
  list.querySelector(SELECTORS.exchangeRate).textContent = `${exchangeRate} ₽`;
  list.querySelector(SELECTORS.limit).textContent = counterpartiesBalanceCurrency(counterparty);
  counterpartiesIsVerified(list, counterparty, SELECTORS.isVerify);
  clearBandgeContainer(list, SELECTORS.badgesList);
  renderSellerPaymentBadges(list, counterparty, SELECTORS.badgesList, SELECTORS.badgesItem);
  list.querySelector(SELECTORS.button).addEventListener('click', () => {
    openModal(getFilteredTab(DOMElements.tabsControls));
    renderCounterpartiesAll(counterparty, user);
  });
  return list;
};
const renderCounterparties = (data, user) => {
  DOMElements.usersListContainer.replaceChildren();
  const fragment = document.createDocumentFragment();
  data.forEach((item) => {
    const createCounterparties = createCounterpartiesItem(item, user);
    fragment.append(createCounterparties);
  });
  DOMElements.usersListContainer.append(fragment);
};
export { renderCounterparties };
