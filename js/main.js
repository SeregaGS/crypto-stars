// import { getData } from './api.js';
import { userProfiles, failUserData } from './user.js';
import { mapCreate, mapPinAdd } from './map.js';
import { renderCounterparties } from './сounterparties.js';


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
  let filtered = data.filter((item) => item.status === status);
  if (onlyVerified) {
    filtered = filtered.filter((item) => item.isVerified);
  }
  return filtered;
};
const getFilteredData = (data) => {
  const status = getFilteredTab();
  const onlyVerified = checkedUsers.checked;
  return getFilteredVerifiedStatus(data, status, onlyVerified);
};
const resetChecked = () => {
  checkedUsers.checked = false;
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
const ddd = (users, contract) => {
  console.log(users, contract);
}
// ===== MAIN.JS ===== //

// ССЫЛКИ НА БД
const DATAURL = {
  user: 'https://cryptostar.grading.htmlacademy.pro/user',
  contract: 'https://cryptostar.grading.htmlacademy.pro/contractors'
};
// ACCESSING THE SERVER AND OUTPUTTING DATA
const getData = async (url, onError) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }
    const data = await response.json();
    return data;
  }
  catch (error) {
    if (error) {
      onError();
    }
    throw error;
  }
};

const allInitData = async () => {
  try {
    const [user, contractor] = await Promise.allSettled([
      getData(DATAURL.user, () => failUserData()),
      getData(DATAURL.contract, () => console.error('Ошибка загрузки данных контрагентов'))
    ]);
    if (user.status === 'fulfilled') {
      userProfiles(user.value);
    }
    if (contractor.status === 'fulfilled') {
      initToggleEventListener(contractor.value);
    }
    ddd(user.value, contractor.value);
  }
  catch (error) {
    console.error(error);
  }
};
allInitData();
// getData(DATAURL.user, (data) => {
//   console.log(data);
//   userProfiles(data);
// }, () => {
//   failUserData();
// });

// getData(DATAURL.contract, (data) => {
//   initToggleEventListener(data);
//   console.log(data);
// });


