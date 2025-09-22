import {
  clearBandgeContainer,
  renderSellerPaymentBadges,
  renderCounterpartyInfo
} from './util.js';
import { openModal } from './modal.js';
import { getFilteredTab } from './filter.js';
import {DOMElements, COUNTERPARTIES} from './dom-helpers.js';

// Функция для отображения методов оплаты продавца в модальном окне
const renderModalPaymentMethodsSeller = (container, counterparty) => {
  clearBandgeContainer(container, COUNTERPARTIES.badgeList);
  renderSellerPaymentBadges(container, counterparty, COUNTERPARTIES.badgeList, COUNTERPARTIES.badgeItem);
};
// Функция для создания элемента контрагента на основе данных
const createCounterpartiesItem = (counterparty, user) => {
  const list = DOMElements.counterpartyTemplate.cloneNode(true);
  const container = list.querySelector(COUNTERPARTIES.containers);

  renderCounterpartyInfo(container, COUNTERPARTIES, counterparty);
  renderModalPaymentMethodsSeller(list, counterparty);
  list.querySelector(COUNTERPARTIES.buttonOpenModal).onclick = () => {
    openModal(getFilteredTab(DOMElements.tabsControls), counterparty, user);
  };
  return list;
};
// Функция для отображения списка контрагентов на странице
const renderCounterparties = (data, user) => {
  DOMElements.counterpartyListContainer.replaceChildren();
  const fragment = document.createDocumentFragment();
  data.forEach((counterparty) => {
    const createCounterparties = createCounterpartiesItem(counterparty, user);
    fragment.append(createCounterparties);
  });
  DOMElements.counterpartyListContainer.append(fragment);
};

export { renderCounterparties };
