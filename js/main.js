// URL DATA
const dataUrl = {
  user: 'https://cryptostar.grading.htmlacademy.pro/user',
  contract: 'https://cryptostar.grading.htmlacademy.pro/contractors'
};

// FETCH FUNCTION
const getData = (url, onSuccess) => {
  fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Ошибка ${response.status}`);
      }
      return response.json();
    }).then((data) => onSuccess(data))
    .catch((error) => {
      console.error('Ошибка загрузки:', error);
    });
};

// RENDER USERS
const userProfileName = document.querySelector('.user-profile__name span');
const userBalance = document.querySelector('#user-fiat-balance');
const userCryptoBalance = document.querySelector('#user-crypto-balance');


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


const userProfileBuy = (data) => {
  const fragment = document.createDocumentFragment();
  data.forEach((item) => {
    const containers = userTableRowTemplate.cloneNode(true);
    containers.querySelector('.users-list__table-name span').textContent = item.userName;
    containers.querySelector('.users-list__table-currency').textContent = item.balance.currency;
    containers.querySelector('.users-list__table-exchangerate').textContent = `${item.exchangeRate} ₽`;
    containers.querySelector('.users-list__table-cashlimit').textContent =
      (item.balance.currency === 'KEKS')
        ? `${item.minAmount} ₽ - ${Math.round(item.balance.amount * item.exchangeRate)} ₽`
        : `${item.minAmount} ₽ - ${item.balance.amount} ₽`;
    if (!item.isVerified) {
      containers.querySelector('.users-list__table-name svg').remove();
    }
    fragment.append(containers);
  });
  usersListContainer.append(fragment);
};

// ACCESSING THE SERVER AND OUTPUTTING DATA
getData(dataUrl.user, (data) => {
  userProfiles(data);
});
getData(dataUrl.contract, (data) => {
  userProfileBuy(data);
  console.log(data);
});

