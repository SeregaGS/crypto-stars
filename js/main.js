// import { getData } from './api.js';
import { userProfiles, failUserData } from './user.js';
import { mapCreate, mapPinAdd } from './map.js';
import { renderCounterparties } from './counterparties.js';
import { getFilteredData } from './filter.js';


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

const resetChecked = () => {
  checkedUsers.checked = false;
};
const renderFiltered = (data, groups, tabs, checked, user) => {
  const filtered = getFilteredData(data, tabs, checked);
  renderCounterparties(filtered, user);
  groups.clearLayers();
  mapPinAdd(filtered, user, groups);
};
const tabsRenderCounterparties = (data, groups, user) => (e) => {
  const clickButton = e.target.classList.contains('tabs__control');

  if (!clickButton) { return; }

  allButtons.forEach((btn) => btn.classList.toggle('is-active', btn === e.target));

  renderFiltered(data, groups, tabsControls, checkedUsers, user);
};
const checkedRenderCounterparties = (data, groups, user) => () => {
  renderFiltered(data, groups, tabsControls, checkedUsers, user);
};
const mapIsView = (isMapView) => {
  mapContainer.parentElement.style.display = isMapView ? 'block' : 'none';
  usersNavContainer.style.display = isMapView ? 'none' : 'block';
  mapContainer.style.zIndex = 1;
};
const mapContainerIsView = (activeBtn) => {
  const currentActiveButton = activeBtn.querySelector('.tabs__control.is-active');
  const isMapView = currentActiveButton.textContent.trim() === 'Карта';
  mapIsView(isMapView);
};
const tabsMapsRenderCounterparties = (buttons, activeBtn, maps) => (e) => {
  const clickButton = e.target.classList.contains('tabs__control');
  if (!clickButton) { return; }
  buttons.forEach((btn) => btn.classList.toggle('is-active', btn === e.target));
  mapContainerIsView(activeBtn);
  maps.invalidateSize();
};
const initDefaultData = (data, tabs, checked, groups, user) => {
  const filtered = getFilteredData(data, tabs, checked);
  renderCounterparties(filtered, user);
  mapPinAdd(filtered, user, groups);
};
// ВСЕ ИНИЦИАЛАЗИЦИИ
const initToggleEventListener = (data, user) => {
  resetChecked();
  const maps = mapCreate(mapContainer);
  const groups = L.layerGroup().addTo(maps);
  initDefaultData(data, tabsControls, checkedUsers, groups, user);
  tabsControls.addEventListener('click', tabsRenderCounterparties(data, groups, user));
  checkedUsers.addEventListener('change', checkedRenderCounterparties(data, groups, user));
  tabsMap.addEventListener('click', tabsMapsRenderCounterparties(allButtonsMap, tabsMap, maps));
};

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
const allIgetData = async () => {
  try {
    const [user, contractor] = await Promise.allSettled([
      getData(DATAURL.user, () => failUserData()),
      getData(DATAURL.contract, () => console.error('Ошибка загрузки данных контрагентов'))
    ]);
    if (user.status === 'fulfilled') {
      userProfiles(user.value);
    }
    if (contractor.status === 'fulfilled' && user.status === 'fulfilled') {
      console.log(contractor.value);
      initToggleEventListener(contractor.value, user.value);
    }
  }
  catch (error) {
    console.error(error);
  }
};
allIgetData();


