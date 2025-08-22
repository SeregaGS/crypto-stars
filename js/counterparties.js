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
  bandgeList: '.users-list__badges-list',
  bandgeItem: ['users-list__badges-item', 'badge'],
  button: '.btn--greenborder'
};

const renderCounterpartyInfo = (container, counterparty) => {
  const { userName, balance, exchangeRate, id } = counterparty;
  container.querySelector(SELECTORS.containerUser).id = id;
  container.querySelector(SELECTORS.name).textContent = userName;
  container.querySelector(SELECTORS.currency).textContent = balance.currency;
  container.querySelector(SELECTORS.exchangeRate).textContent = `${exchangeRate} ₽`;
  container.querySelector(SELECTORS.limit).textContent = counterpartiesBalanceCurrency(counterparty);
  counterpartiesIsVerified(container, counterparty, SELECTORS.isVerify);
};
const renderModalPaymentMethodsSeller = (modal, counterparty) => {
  clearBandgeContainer(modal, SELECTORS.bandgeList);
  renderSellerPaymentBadges(modal, counterparty, SELECTORS.bandgeList, SELECTORS.bandgeItem);
};
const createCounterpartiesItem = (counterparty, user) => {
  const list = DOMElements.userTableRowTemplate.cloneNode(true);
  renderCounterpartyInfo(list, counterparty);
  renderModalPaymentMethodsSeller(list, counterparty);
  list.querySelector(SELECTORS.button).addEventListener('click', () => {
    openModal(getFilteredTab(DOMElements.tabsControls));
    renderCounterpartiesAll(counterparty, user);
  });
  return list;
};
const renderCounterparties = (data, user) => {
  DOMElements.usersListContainer.replaceChildren();
  const fragment = document.createDocumentFragment();
  data.forEach((counterparty) => {
    const createCounterparties = createCounterpartiesItem(counterparty, user);
    fragment.append(createCounterparties);
  });
  DOMElements.usersListContainer.append(fragment);
};
export { renderCounterparties };
