import { DOMElements } from './dom-helpers.js';
import {getFilteredData} from './filter.js';
import {renderCounterparties} from './counterparties.js';
import {mapPinAdd, mapCreate} from './map.js';


const resetChecked = (checkbox) => {
  checkbox.checked = false;
};

const tabsFiltered = (data, groups, tabs, checked, user) => {
  const filtered = getFilteredData(data, tabs, checked);
  renderCounterparties(filtered, user);
  groups.clearLayers();
  mapPinAdd(filtered, user, groups);
};

const onTabsControlsClick = (data, groups, user) => (e)=> {
  const clickButton = e.target.closest('.tabs__control');
  if(!clickButton) { return; }

  const btnActive = DOMElements.tabsControls.querySelectorAll('.tabs__control');
  btnActive.forEach((btn) => btn.classList.toggle('is-active', btn === clickButton));

  tabsFiltered(data, groups, DOMElements.tabsControls, DOMElements.checkedUsers, user);
};

const onVerifiedFilterChange = (data, groups, user) => () => {
  tabsFiltered(data, groups, DOMElements.tabsControls, DOMElements.checkedUsers, user);
};

const mapIsView = (isMapView) => {
  DOMElements.mapContainer.parentElement.style.display = isMapView ? 'block' : 'none';
  DOMElements.mapContainer.style.zIndex = '1';
  DOMElements.counterpartyList.style.display = isMapView ? 'none' : 'block';
};
const mapContainerIsView = (activeBtn) => {
  const currentActiveButton = activeBtn.querySelector('.tabs__control.is-active');
  const isMapView = currentActiveButton.textContent.trim() === 'Карта';
  mapIsView(isMapView);
};
const onTabsMapClick = (buttons, activeBtn, maps) => (e) => {
  const button = buttons.querySelectorAll('.tabs__control');
  const clickButton = e.target.classList.contains('tabs__control');
  if (!clickButton) { return; }
  button.forEach((btn) => btn.classList.toggle('is-active', btn === e.target));
  mapContainerIsView(activeBtn);
  maps.invalidateSize();
};
const initDefaultData = (data, tabs, checked, groups, user) => {
  resetChecked(DOMElements.checkedUsers);
  const filtered = getFilteredData(data, tabs, checked);
  renderCounterparties(filtered, user);
  mapPinAdd(filtered, user, groups);
};
const initToggleEventListener = (data, user) => {
  const maps = mapCreate(DOMElements.mapContainer);
  const groups = L.layerGroup().addTo(maps);
  initDefaultData(data, DOMElements.tabsControls, DOMElements.checkedUsers, groups, user);
  DOMElements.tabsControls.addEventListener('click', onTabsControlsClick (data, groups, user));
  DOMElements.checkedUsers.addEventListener('change', onVerifiedFilterChange(data, groups, user));
  DOMElements.tabsMap.addEventListener('click', onTabsMapClick(DOMElements.tabsMap, DOMElements.tabsMap, maps));
};
export { initToggleEventListener };
