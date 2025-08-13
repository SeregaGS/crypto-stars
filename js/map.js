import { clearBandgeContainer, renderCounterpartiesPaymentSeller, counterpartiesIsVerified, counterpartiesBalanceCurrency } from './util.js';


const TILE_LAYER = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Icons made by <a href="https://www.freepik.com" title="Freepik">Freepik</a> from <a href="https://www.flaticon.com/" title="Flaticon">www.flaticon.com</a>';
const PROVIDER = 'Cash in person';

const MAP_COORDINATES_DEFAULT = {
  lat: 59.92749,
  lng: 30.31127,
  view: 9
};

const SELECTORS = {
  counterpartyCard: '.user-card',
  counterpartyCardSvg: '.user-card__user-name svg',
  counterpartyName: '.user-card__user-name span',
  currency: '[data-cash="currency"]',
  exchangeRate: '[data-cash="exchange-rate"]',
  limit: '[data-cash="limit"]',
  badgesList: '.user-card__badges-list',
  badgesItem: ['users-list__badges-item', 'badge']
};

// Создаём DOM-элемент балуна (всплывающего окна) для маркера на карте
const mapPinBalloon = (counterparty) => {
  const { userName, balance, exchangeRate } = counterparty;
  const balloonTemplate = document.querySelector('#map-baloon__template').content.querySelector(SELECTORS.counterpartyCard);
  const balloonElement = balloonTemplate.cloneNode(true);
  balloonElement.querySelector(SELECTORS.counterpartyName).textContent = userName;
  balloonElement.querySelector(SELECTORS.currency).textContent = balance.currency;
  balloonElement.querySelector(SELECTORS.exchangeRate).textContent = exchangeRate.toLocaleString('ru-RU', { style: 'currency', currency: 'RUB' });
  balloonElement.querySelector(SELECTORS.limit).textContent = counterpartiesBalanceCurrency(counterparty);
  clearBandgeContainer(balloonElement, SELECTORS.badgesList);
  renderCounterpartiesPaymentSeller(balloonElement, counterparty, SELECTORS.badgesList, SELECTORS.badgesItem);
  counterpartiesIsVerified(balloonElement, counterparty, SELECTORS.counterpartyCardSvg);
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
const createPin = (item, group) => {
  const { coords, isVerified } = item;
  if (!coords) { return; }
  const pimarker = L.marker(
    { lat: coords.lat, lng: coords.lng },
    { icon: mapPinIcon(isVerified) }
  );
  pimarker
    .addTo(group)
    .bindPopup(mapPinBalloon(item));
  return pimarker;
};
// Добавляем маркеры на карту для контагентов с методом оплаты "Cash in person".
const mapPinAdd = (data, group) => {
  data.forEach((item) => {
    if (!item.paymentMethods) { return; }
    const res = item.paymentMethods.some((i) => i.provider === PROVIDER);
    if (res) {
      return createPin(item, group);
    }
  });
};
// Создаём и инициализируем карту.
const mapCreate = (container) => {
  const map = L.map(container)
    .setView({
      lat: MAP_COORDINATES_DEFAULT.lat,
      lng: MAP_COORDINATES_DEFAULT.lng,
    }, MAP_COORDINATES_DEFAULT.view);
  L.tileLayer(
    TILE_LAYER,
    {
      attribution: ATTRIBUTION,
    },
  ).addTo(map);
  return map;
};

export { mapCreate, mapPinAdd };
