import { counterpartiesBalanceCurrency, clearBandgeContainer, renderCounterpartiesPaymentSeller } from './util.js';

const DOMElements = {
  modalBuy: document.querySelector('.modal-buy')
};

const customInput = DOMElements.modalBuy.querySelector('.modal__input-wrapper--decorated input');
const modalCloseBtn = document.querySelector('.modal__close-btn');
const originalPlaceholder = customInput.placeholder;

const renderModalCounterparties = (item) => {
  DOMElements.modalBuy.querySelector('.transaction-info__data').lastChild.textContent = item.userName;
  DOMElements.modalBuy.querySelector('.transaction-info__item--exchangerate .transaction-info__data').textContent = `${item.exchangeRate} ₽`;
  DOMElements.modalBuy.querySelector('.transaction-info__item--cashlimit .transaction-info__data').textContent = counterpartiesBalanceCurrency(item);
  clearBandgeContainer(DOMElements.modalBuy, '.select select', 1);
  renderCounterpartiesPaymentSeller(DOMElements.modalBuy, item, '.select select', '', 'option');
  const select = DOMElements.modalBuy.querySelector('.select select');
  select.addEventListener('change', (e) => {
    const { paymentMethods } = item;
    const paymentMethod = paymentMethods.find((prov) => e.target.value === prov.provider);
    customInput.placeholder = (paymentMethod.provider === 'Cash in person') ? '' : paymentMethod.accountNumber;
  });
  const input = DOMElements.modalBuy.querySelector('[data-payment="pay"]');
  const result = DOMElements.modalBuy.querySelector('[data-payment="crypto"]');
  input.addEventListener('input', () => {
    result.value = `${(Number(input.value) / item.exchangeRate).toFixed(2)}`;
  });
  result.addEventListener('input', () => {
    input.value = `${(Number(result.value) * item.exchangeRate).toFixed(2)}`;
  });
};
const openModalBuy = () => {
  const modal = document.querySelector('.modal.modal--buy');
  modal.style.display = 'block';

};

const closeModalBuy = () => {
  const modal = document.querySelector('.modal.modal--buy');
  modal.style.display = 'none';
  customInput.placeholder = originalPlaceholder;
  DOMElements.modalBuy.reset();
};
modalCloseBtn.addEventListener('click', () => {
  closeModalBuy();
});

export { renderModalCounterparties, openModalBuy };
