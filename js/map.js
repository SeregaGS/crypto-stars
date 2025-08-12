import { clearBandgeContainer, renderCounterpartiesPaymentSeller, counterpartiesIsVerified, counterpartiesBalanceCurrency } from './util.js';

// КООРДИНАТЫ ПО ДЕФОЛТУ
const MAP_COORDINATES_DEFAULT = {
  lat: 59.92749,
  lng: 30.31127,
  view: 9
};

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

const mapPinIcon = (isVerified) => {
  const markerIcon = L.icon({
    iconUrl: `./img/${isVerified ? 'pin-verified' : 'pin'}.svg`,
    iconSize: [36, 46],
    iconAnchor: [18, 46],
  });
  return markerIcon;
};

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

export { mapCreate, mapPinAdd };
