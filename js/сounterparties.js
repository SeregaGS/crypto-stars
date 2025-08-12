import { counterpartiesIsVerified, clearBandgeContainer, renderCounterpartiesPaymentSeller, counterpartiesBalanceCurrency } from './util.js';
import { openModalBuy, renderModalCounterparties } from './modal.js';

const DOMElements = {
  usersListContainer: document.querySelector('.users-list__table-body'),
  userTableRowTemplate: document.querySelector('#user-table-row__template').content
};


const createCounterpartiesListData = (item) => {
  const { userName, balance, exchangeRate } = item;
  const list = DOMElements.userTableRowTemplate.cloneNode(true);
  list.querySelector('.users-list__table-name span').textContent = userName;
  list.querySelector('.users-list__table-currency').textContent = balance.currency;
  list.querySelector('.users-list__table-exchangerate').textContent = `${exchangeRate} ₽`;
  list.querySelector('.users-list__table-cashlimit').textContent = counterpartiesBalanceCurrency(item);
  counterpartiesIsVerified(list, item, '.users-list__table-name svg');
  clearBandgeContainer(list, '.users-list__badges-list');
  renderCounterpartiesPaymentSeller(list, item, '.users-list__badges-list', ['users-list__badges-item', 'badge']);
  const btn = list.querySelector('.btn--greenborder');
  btn.addEventListener('click', () => {
    openModalBuy();
    renderModalCounterparties(item);
  });
  return list;
};
const renderCounterparties = (data) => {
  DOMElements.usersListContainer.replaceChildren();
  const fragment = document.createDocumentFragment();
  data.forEach((item) => {
    const createCounterparties = createCounterpartiesListData(item);
    fragment.append(createCounterparties);
  });
  DOMElements.usersListContainer.append(fragment);
};
export { renderCounterparties };
