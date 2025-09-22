import {
  clearBandgeContainer,
  renderBandgePayMethods,
  renderCounterpartyInfo
} from './util.js';
import { getFilteredTab } from './filter.js';
import { openModal } from './modal.js';
import { DOMElements, BALLOON, COORDINATES_DEFAULT, TILE_LAYER, ATTRIBUTION, PROVIDER } from './dom-helpers.js';

// Создаём DOM-элемент балуна (всплывающего окна) для маркера на карте
const mapPinBalloon = (counterparty, user) => {
  const balloonTemplate = DOMElements.templateBalloon.content.querySelector(BALLOON.containers);
  const balloonElement = balloonTemplate.cloneNode(true);

  renderCounterpartyInfo(balloonElement, BALLOON, counterparty);

  clearBandgeContainer(balloonElement, BALLOON.badgesList);
  renderBandgePayMethods(balloonElement, counterparty, BALLOON.badgesList, BALLOON.badgeItem);
  balloonElement.querySelector(BALLOON.buttonOpenModal).addEventListener('click', () => {
    openModal(getFilteredTab(DOMElements.tabsControls), counterparty, user);
  });
  return balloonElement;
};
// Возвращаем иконку маркера в зависимости от статуса верификации.
const mapPinIcon = (isVerified) => {
  const markerIcon = L.icon({
    iconUrl: `./img/${isVerified ? 'pin-verified' : 'pin'}.svg`,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
  });
  return markerIcon;
};
// Создаём и добавляем маркер на карту.
const createPin = (counterparty, user, group) => {
  const { coords, isVerified } = counterparty;
  if (!coords) { return; }
  const pimarker = L.marker(
    { lat: coords.lat, lng: coords.lng },
    { icon: mapPinIcon(isVerified) }
  );
  pimarker
    .addTo(group)
    .bindPopup(mapPinBalloon(counterparty, user));
  return pimarker;
};
// Добавляем маркеры на карту для контрагентов с методом оплаты "Cash in person".
const mapPinAdd = (counterparties, user, group) => {
  counterparties.forEach((counterparty) => {
    if (!counterparty.paymentMethods) { return; }
    const res = counterparty.paymentMethods.some((i) => i.provider === PROVIDER);
    if (res) {
      return createPin(counterparty, user, group);
    }
  });
};
// Создаём и инициализируем карту.
const mapCreate = (container) => {
  const map = L.map(container)
    .setView({
      lat: COORDINATES_DEFAULT.lat,
      lng: COORDINATES_DEFAULT.lng,
    }, COORDINATES_DEFAULT.view);
  L.tileLayer(
    TILE_LAYER,
    {
      attribution: ATTRIBUTION,
    },
  ).addTo(map);
  return map;
};

export { mapCreate, mapPinAdd };
