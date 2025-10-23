import { sendData } from './api.js';
import { timeoutManager } from './util.js';
import { targetCurrency, closeModal } from './modal.js';
import { MODAL, passwords } from './dom-helpers.js';

const messageError = (container, error, isValid = true) => {
  const message = container.querySelector(MODAL.messageError);
  const text = message.querySelector('span');

  message.classList.remove('visually-hidden');
  text.textContent = error;
  if (!isValid) {
    timeoutManager(() => message.classList.add('visually-hidden'), 2500)();
  }
};
const messageSuccess = (container, isValid = true) => {
  const message = container.querySelector(MODAL.messageSuccess);
  message.classList.remove('visually-hidden');

  if (isValid) {
    timeoutManager(() => message.classList.add('visually-hidden'), 2000)();
  }
};
const disabledSubmit = (button) => {
  button.disabled = true;
  button.textContent = 'Обмениваю...';
};
const unabledSubmit = (button) => {
  button.disabled = false;
  button.textContent = 'Обменять';
};
const validateAmount = (value, el) => {
  const isFiat = el.dataset.payment === 'fiat';
  const currency = targetCurrency(isFiat);

  const min = Number(el.dataset.min);
  const max = Number(el.dataset.max);

  const regEx = /^\d+(?:[.,]\d{1,2})?$/.test(value);
  if (!regEx) {
    validateAmount.error = 'Введите число, максимум двумя знаками после точки или запятой';
    return false;
  }
  if (min > max) {
    validateAmount.error = 'Сделка не может состояться';
    return false;
  }
  if (Number(value) < min || !value) {
    validateAmount.error = `Минимальная сумма -  ${min === 0 ? 1 : min} ${currency}`;
    return false;
  }
  if (Number(value) > max) {
    validateAmount.error = `Максимальная сумма -  ${max} ${currency}`;
    return false;
  }
  return true;
};
const validateMethods = (el) => {
  if (el.selectedIndex === 0) {
    validateMethods.error = 'Пожалуйста, выберите значение из списка';
    return false;
  }
  return true;
};
const validatePassword = (el) => {
  if (!(el.value === passwords)) {
    validatePassword.error = 'Неправильный пароль';
    return false;
  }
  return true;
};
const prestineValidateForm = (form, pristine, mode) => {
  const fiat = form.querySelector(MODAL.inputFiat);
  const crypto = form.querySelector(MODAL.inputCrypto);
  const select = form.querySelector(MODAL.badgeList);
  const password = form.querySelector(MODAL.password);

  const validate = mode ? fiat : crypto;

  pristine.addValidator(validate, (value) => validateAmount(value, validate), () => validateAmount.error);
  pristine.addValidator(select, () => validateMethods(select), () => validateMethods.error);
  pristine.addValidator(password, () => validatePassword(password), () => validatePassword.error);
};
const initPristine = (form, mode) => {
  const pristine = new Pristine(form, {
    classTo: 'custom-input',
    errorTextParent: 'custom-input',
    errorTextTag: 'div',
    errorTextClass: 'custom-input__error',
    realTime: true
  });
  prestineValidateForm(form, pristine, mode);
  return pristine;
};
const validateModal = (e) => {
  e.preventDefault();
  const modalElement = e.currentTarget;
  const form = modalElement.querySelector(MODAL.form);
  const button = modalElement.querySelector('.modal__submit');
  form.validate.reset();
  const isValid = form.validate.validate();

  if (!isValid) {
    messageError(form, 'Ошибка заполнения формы', isValid);
    return;
  }
  disabledSubmit(button);
  const formData = new FormData(e.target);
  sendData(formData, () => {
    messageSuccess(form, isValid);
    timeoutManager(() => closeModal(modalElement), 2000)();
    timeoutManager(() => unabledSubmit(button), 2000)();
  }, () => {
    unabledSubmit(button);
    messageError(form, 'Ошибка отправки данных на сервер, повторите позже', false);
  });
};

export { initPristine, validateModal, unabledSubmit };
