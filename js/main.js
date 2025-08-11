// ===== API.JS ===== //
const getData = (url, onSuccess, onError = console.error) => {
  fetch(url)
    .then((response) => response.json())
    .then((data) => onSuccess(data))
    .catch(onError);
};

// ===== USER.JS ===== //
const userProfileName = document.querySelector('.user-profile__name span');
const userFiatBalance = document.querySelector('#user-fiat-balance');
const userCryptoBalance = document.querySelector('#user-crypto-balance');
const userProfile = document.querySelector('.user-profile');

const failUserData = () => {
  userProfile.style.display = 'none';
};
const userProfiles = (data) => {
  const { userName = 'Гость', balances } = data;
  userProfileName.textContent = userName;
  const fiatCurrency = balances.find((currency) => currency.currency === 'RUB');
  const cryptoCurrency = balances.find((currency) => currency.currency === 'KEKS');
  userFiatBalance.textContent = fiatCurrency ? fiatCurrency.amount : '0';
  userCryptoBalance.textContent = cryptoCurrency ? cryptoCurrency.amount : '0';
};
// ===== COUNTERPARTIES.JS ===== //
const usersListContainer = document.querySelector('.users-list__table-body');
const userTableRowTemplate = document.querySelector('#user-table-row__template').content;

const createBadgeElement = (element, provider, selector = []) => {
  const el = document.createElement(element);
  if (selector.length >= 1) {
    el.classList.add(...selector);
  }
  el.textContent = provider.provider;
  return el;
};
const clearBandgeContainer = (containers, selector, n = 0) => {
  const container = containers.querySelector(selector);
  while (container.children.length > n) {
    container.removeChild(container.lastChild);
  }
};
const renderCounterpartiesPaymentSeller = (containers, item, selector, classList, tagName = 'li') => {
  if (item.status === 'seller') {
    item.paymentMethods.forEach((provider) => {
      containers.querySelector(selector).append(createBadgeElement(tagName, provider, classList));
    });
  }
};
const counterpartiesBalanceCurrency = (item) => (item.balance.currency === 'KEKS')
  ? `${(item.minAmount).toFixed(2)} KEKS - ${(item.balance.amount).toFixed(2)} KEKS`
  : `${item.minAmount} ₽ - ${item.balance.amount} ₽`;

const counterpartiesIsVerified = (containers, item, classStyle) => {
  if (!item.isVerified) {
    containers.querySelector(classStyle).style.display = 'none';
  }
};

// ===== MODAL.JS ===== //
const modalBuy = document.querySelector('.modal-buy');
const customInput = modalBuy.querySelector('.modal__input-wrapper--decorated input');
const originalPlaceholder = customInput.placeholder;

const renderModalCounterparties = (item) => {
  modalBuy.querySelector('.transaction-info__data').lastChild.textContent = item.userName;
  modalBuy.querySelector('.transaction-info__item--exchangerate .transaction-info__data').textContent = `${item.exchangeRate} ₽`;
  modalBuy.querySelector('.transaction-info__item--cashlimit .transaction-info__data').textContent = counterpartiesBalanceCurrency(item);
  clearBandgeContainer(modalBuy, '.select select', 1);
  renderCounterpartiesPaymentSeller(modalBuy, item, '.select select', '', 'option');
  const select = modalBuy.querySelector('.select select');
  select.addEventListener('change', (e) => {
    const { paymentMethods } = item;
    const a = paymentMethods.find((prov) => e.target.value === prov.provider);
    customInput.placeholder = (a.provider === 'Cash in person') ? '' : a.accountNumber;
  });
  const input = modalBuy.querySelector('[data-payment="pay"]');
  const result = modalBuy.querySelector('[data-payment="crypto"]');
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
  modalBuy.reset();
};

const modalCloseBtn = document.querySelector('.modal__close-btn');
modalCloseBtn.addEventListener('click', () => {
  closeModalBuy();
});
const createCounterpartiesListData = (item) => {
  const { userName, balance, exchangeRate } = item;
  const list = userTableRowTemplate.cloneNode(true);
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
  usersListContainer.replaceChildren();
  const fragment = document.createDocumentFragment();
  data.forEach((item) => {
    const createCounterparties = createCounterpartiesListData(item);
    fragment.append(createCounterparties);
  });
  usersListContainer.append(fragment);
};

// ===== TOGGLE.JS ===== //

// DOM ЭЛЕМЕНТЫ
const tabsToggleBuySell = document.querySelector('.tabs--toggle-buy-sell');
const tabsControls = tabsToggleBuySell.querySelector('.tabs__controls');
const allButtons = tabsControls.querySelectorAll('.tabs__control');
const checkedUsers = document.querySelector('#checked-users');

const usersNavContainer = document.querySelector('.users-list');
const mapContainer = document.querySelector('.map');
const tabsMap = document.querySelector('.tabs--toggle-list-map');
const allButtonsMap = tabsMap.querySelectorAll('.tabs__control');


const getFilteredTab = () => {
  const currentActiveButton = tabsControls.querySelector('.tabs__control.is-active');
  return currentActiveButton.textContent.trim() === 'Купить' ? 'seller' : 'buyer';
};
const getFilteredVerifiedStatus = (data, status, onlyVerified) => {
  let filetred = data.filter((item) => item.status === status);
  if (onlyVerified) {
    filetred = filetred.filter((item) => item.isVerified);
  }
  return filetred;
};
const getFilteredData = (data) => {
  const status = getFilteredTab();
  const onlyVerified = checkedUsers.checked;
  return getFilteredVerifiedStatus(data, status, onlyVerified);
};
const resetChecked = () => {
  checkedUsers.checked = false;
};
// ===== MAP.JS ===== //

// КООРТИНАДЫ ПО ДЕФОЛТУ
const MAP_COORDINATES_DEFAULT = {
  lat: 59.92749,
  lng: 30.31127,
  view: 9
};
// ОТОБРАЖЕНИЕ МОДАЛЬКИ ПО КЛИКУ НА КАРТУ ПО ПОЛЬЗОВАТЕЛЮ
const mapPinBaloon = (item) => {
  const baloonTemplate = document.querySelector('#map-baloon__template').content.querySelector('.user-card');
  const baloonElement = baloonTemplate.cloneNode(true);
  baloonElement.querySelector('.user-card__user-name span').textContent = item.userName;
  baloonElement.querySelector('[data-cash="currency"]').textContent = item.balance.currency;
  baloonElement.querySelector('[data-cash="exchange-rate"]').textContent = `${item.exchangeRate} ₽`;
  baloonElement.querySelector('[data-cash="limit"]').textContent = counterpartiesBalanceCurrency(item);
  clearBandgeContainer(baloonElement, '.user-card__badges-list');
  renderCounterpartiesPaymentSeller(baloonElement, item, '.user-card__badges-list', ['users-list__badges-item', 'badge']);
  counterpartiesIsVerified(baloonElement, item, '.user-card__user-name svg');
  return baloonElement;
};
// ИКОНКА ДЛЯ ПИНА
const mapPinIcon = (isVerified) => {
  const markerIcon = L.icon({
    iconUrl: `./img/${isVerified ? 'pin-verified' : 'pin'}.svg`,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
  });
  return markerIcon;
};
// ПИН
const createPin = (item, group) => {
  const { coords, isVerified } = item;
  if (!coords) { return; }
  const pimarker = L.marker(
    {
      lat: coords.lat,
      lng: coords.lng,
    },
    {
      icon: mapPinIcon(isVerified)

    }
  );

  pimarker
    .addTo(group)
    .bindPopup(mapPinBaloon(item));
  return pimarker;
};
const mapPinAdd = (data, group) => {
  data.forEach((item) => {
    if (!item.paymentMethods) { return; }
    const res = item.paymentMethods.some((i) => i.provider === 'Cash in person');
    if (res) {
      return createPin(item, group);
    }
  });
};
// СОЗДАЕМ КАРТУ
const mapCreate = (container) => {
  const map = L.map(container)
    .setView({
      lat: MAP_COORDINATES_DEFAULT.lat,
      lng: MAP_COORDINATES_DEFAULT.lng,
    }, MAP_COORDINATES_DEFAULT.view);
  L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>',
    },
  ).addTo(map);
  return map;
};

// ВСЕ ИНИЦИАЛАЗИЦИИ
const initToggleEventListener = (data) => {
  resetChecked();
  renderCounterparties(getFilteredData(data));
  const maps = mapCreate(mapContainer);

  const groups = L.layerGroup().addTo(maps);
  mapPinAdd(getFilteredData(data), groups);

  tabsControls.addEventListener('click', (e) => {
    const clickButton = e.target.classList.contains('tabs__control');
    if (!clickButton) { return; }
    allButtons.forEach((btn) => btn.classList.toggle('is-active', btn === e.target));
    renderCounterparties(getFilteredData(data));
    groups.clearLayers();
    mapPinAdd(getFilteredData(data), groups);
  });
  checkedUsers.addEventListener('change', () => {
    renderCounterparties(getFilteredData(data));
    groups.clearLayers();
    mapPinAdd(getFilteredData(data), groups);
  });
  tabsMap.addEventListener('click', (e) => {
    const clickButton = e.target.classList.contains('tabs__control');
    if (!clickButton) { return; }
    allButtonsMap.forEach((btn) => btn.classList.toggle('is-active', btn === e.target));
    const currentActiveButton = tabsMap.querySelector('.tabs__control.is-active');
    const isMapView = currentActiveButton.textContent.trim() === 'Карта';
    mapContainer.parentElement.style.display = isMapView ? 'block' : 'none';
    usersNavContainer.style.display = isMapView ? 'none' : 'block';
    maps.invalidateSize();
  });
};
// ===== MAIN.JS ===== //

// ССЫЛКИ НА БД
const DATAURL = {
  user: 'https://cryptostar.grading.htmlacademy.pro/user',
  contract: 'https://cryptostar.grading.htmlacademy.pro/contractors'
};
// ACCESSING THE SERVER AND OUTPUTTING DATA
getData(DATAURL.user, (data) => {
  // console.log(data);
  userProfiles(data);
}, () => {
  failUserData();
});
getData(DATAURL.contract, (data) => {
  initToggleEventListener(data);
  // console.log(data);
});


