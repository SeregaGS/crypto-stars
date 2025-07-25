// ===== API.JS ===== //
const getData = (url, onSuccess, onError = console.error) => {
  fetch(url)
    .then((response) => response.json())
    .then((data) => onSuccess(data))
    .catch(onError);
};

// ===== USER.JS ===== //
const userProfileName = document.querySelector('.user-profile__name span');
const userBalance = document.querySelector('#user-fiat-balance');
const userCryptoBalance = document.querySelector('#user-crypto-balance');
const userProfile = document.querySelector('.user-profile');

const failUserData = () => {
  userProfile.style.display = 'none';
};
const userProfiles = ({ userName, balances }) => {
  userProfileName.textContent = userName;
  balances.forEach((element) => {
    if (element.currency === 'RUB') {
      userBalance.textContent = element.amount;
    } else {
      userCryptoBalance.textContent = element.amount;
    }
  });
};

// ===== COUNTERPARTIES.JS ===== //
const usersListContainer = document.querySelector('.users-list__table-body');
const userTableRowTemplate = document.querySelector('#user-table-row__template').content;

const createBadgeElement = (provider) => {
  const li = document.createElement('li');
  li.classList.add('users-list__badges-item', 'badge');
  li.textContent = provider.provider;
  return li;
};
const removeProvideBadge = (containers, classList) => {
  const container = containers.querySelector(classList);
  container.replaceChildren();
};
const userBalanceCurrency = (item) => (item.balance.currency === 'KEKS')
  ? `${(item.minAmount * item.exchangeRate).toFixed(2)} ₽ - ${(item.balance.amount * item.exchangeRate).toFixed(2)} ₽`
  : `${item.minAmount} ₽ - ${item.balance.amount} ₽`;
const userIsVerified = (containers, item, classStyle) => {
  if (!item.isVerified) {
    containers.querySelector(classStyle).style.display = 'none';
  }
};
const counterpartiesStatusSeller = (containers, item, classList) => {
  removeProvideBadge(containers, classList);
  if (item.status === 'seller') {
    item.paymentMethods.forEach((provider) => {
      containers.querySelector(classList).append(createBadgeElement(provider));
    });
  }
};

const modalBuy = document.querySelector('.modal-buy');
const renderModalCounterparties = (item) => {
  modalBuy.querySelector('.transaction-info__data').lastChild.textContent = item.userName;
  modalBuy.querySelector('.transaction-info__item--exchangerate .transaction-info__data').textContent = item.exchangeRate;
  modalBuy.querySelector('.transaction-info__item--cashlimit .transaction-info__data').textContent = userBalanceCurrency(item);
  const input = modalBuy.querySelector('[data-payment="pay"]');
  const result = modalBuy.querySelector('[data-payment="crypto"]');
  input.addEventListener('input', () => {
    result.value = `${input.value / item.exchangeRate}`;
  });
  result.addEventListener('input', () => {
    input.value = `${result.value * item.exchangeRate}`;
  });
};
const openModalBuy = () => {
  const modal = document.querySelector('.modal.modal--buy');
  modal.style.display = 'block';

};
const closeModalBuy = () => {
  const modal = document.querySelector('.modal.modal--buy');
  modal.style.display = 'none';
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
  list.querySelector('.users-list__table-cashlimit').textContent = userBalanceCurrency(item);
  userIsVerified(list, item, '.users-list__table-name svg');
  counterpartiesStatusSeller(list, item, '.users-list__badges-list');
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

// ===== MAP.JS ===== //


// ===== TOGGLE.JS ===== //

// ДОМ ЭЛЕМЕНТЫ
const tabsToggleBuySell = document.querySelector('.tabs--toggle-buy-sell');
const tabsControls = tabsToggleBuySell.querySelector('.tabs__controls');
const allButtons = tabsControls.querySelectorAll('.tabs__control');
const checkedUsers = document.querySelector('#checked-users');

const usersNavContainer = document.querySelector('.users-list');
const mapContainer = document.querySelector('.map');
const tabsMap = document.querySelector('.tabs--toggle-list-map');
const allButtonsMap = tabsMap.querySelectorAll('.tabs__control');

// ПРОВЕРКА ПО КАНТРААГЕНТАМ SELLER ИЛИ BUYER
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
  baloonElement.querySelector('[data-cash="limit"]').textContent = userBalanceCurrency(item);
  counterpartiesStatusSeller(baloonElement, item, '.user-card__badges-list');
  userIsVerified(baloonElement, item, '.user-card__user-name svg');
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
  console.log(data)
  userProfiles(data);
}, () => {
  failUserData();
});
getData(DATAURL.contract, (data) => {
  initToggleEventListener(data);
  console.log(data);
});


