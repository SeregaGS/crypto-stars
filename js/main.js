// URL DATA
const dataUrl = {
  user: 'https://cryptostar.grading.htmlacademy.pro/user',
  contract: 'https://cryptostar.grading.htmlacademy.pro/contractors'
};

// FETCH FUNCTION
const getData = (url, onSuccess, onError = console.error) => {
  fetch(url)
    .then((response) => response.json())
    .then((data) => onSuccess(data))
    .catch(onError);
};

// RENDER USERS
const userProfileName = document.querySelector('.user-profile__name span');
const userBalance = document.querySelector('#user-fiat-balance');
const userCryptoBalance = document.querySelector('#user-crypto-balance');
const userPorofil = document.querySelector('.user-profile');

const failUserData = () => {
  userPorofil.style.display = 'none';
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

// RENDER TABLE COUNTERPARTIES
const usersListContainer = document.querySelector('.users-list__table-body');
const userTableRowTemplate = document.querySelector('#user-table-row__template').content;

const createBadgeElement = (provider) => {
  const li = document.createElement('li');
  li.classList.add('users-list__badges-item', 'badge');
  li.textContent = provider.provider;
  return li;
};
const removeProvideBadge = (containers) => {
  const container = containers.querySelector('.users-list__badges-list');
  container.replaceChildren();
};
const userBalanceCurrency = (item) => (item.balance.currency === 'KEKS')
  ? `${item.minAmount} ₽ - ${Math.round(item.balance.amount * item.exchangeRate)} ₽`
  : `${item.minAmount} ₽ - ${item.balance.amount} ₽`;

const userIsVerified = (containers, item) => {
  if (!item.isVerified) {
    containers.querySelector('.users-list__table-name svg').remove();
  }
};
const userStatusSeller = (containers, item) => {
  removeProvideBadge(containers);
  if (item.status === 'seller') {
    item.paymentMethods.forEach((provider) => {
      containers.querySelector('.users-list__badges-list').append(createBadgeElement(provider));
    });
  }
};
const createUserListData = (item) => {
  const { userName, balance, exchangeRate } = item;
  const containers = userTableRowTemplate.cloneNode(true);
  containers.querySelector('.users-list__table-name span').textContent = userName;
  containers.querySelector('.users-list__table-currency').textContent = balance.currency;
  containers.querySelector('.users-list__table-exchangerate').textContent = `${exchangeRate} ₽`;
  containers.querySelector('.users-list__table-cashlimit').textContent = userBalanceCurrency(item);
  userIsVerified(containers, item);
  userStatusSeller(containers, item);
  return containers;
};
const renderCounterparties = (data) => {
  const fragment = document.createDocumentFragment();
  data.forEach((item) => {
    const createCounterparties = createUserListData(item);
    fragment.append(createCounterparties);


  });
  usersListContainer.append(fragment);
};

// ACCESSING THE SERVER AND OUTPUTTING DATA
getData(dataUrl.user, (data) => {
  userProfiles(data);
}, () => {
  failUserData();
});
getData(dataUrl.contract, (data) => {
  renderCounterparties(data);
  // console.log(data);
});

