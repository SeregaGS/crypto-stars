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
const removeProvideBadge = (containers) => {
  const container = containers.querySelector('.users-list__badges-list');
  container.replaceChildren();
};
const userBalanceCurrency = (item) => (item.balance.currency === 'KEKS')
  ? `${(item.minAmount * item.exchangeRate).toFixed(2)} ₽ - ${(item.balance.amount * item.exchangeRate).toFixed(2)} ₽`
  : `${item.minAmount} ₽ - ${item.balance.amount} ₽`;
const userIsVerified = (containers, item) => {
  if (!item.isVerified) {
    containers.querySelector('.users-list__table-name svg').style.display = 'none';
  }
};
const counterpartiesStatusSeller = (containers, item) => {
  removeProvideBadge(containers);
  if (item.status === 'seller') {
    item.paymentMethods.forEach((provider) => {
      containers.querySelector('.users-list__badges-list').append(createBadgeElement(provider));
    });
  }
};
const createCounterpartiesListData = (item) => {
  const { userName, balance, exchangeRate } = item;
  const list = userTableRowTemplate.cloneNode(true);
  list.querySelector('.users-list__table-name span').textContent = userName;
  list.querySelector('.users-list__table-currency').textContent = balance.currency;
  list.querySelector('.users-list__table-exchangerate').textContent = `${exchangeRate} ₽`;
  list.querySelector('.users-list__table-cashlimit').textContent = userBalanceCurrency(item);
  userIsVerified(list, item);
  counterpartiesStatusSeller(list, item);
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
const tabsToggleBuySell = document.querySelector('.tabs--toggle-buy-sell');
const tabsControls = tabsToggleBuySell.querySelector('.tabs__controls');
const allButtons = tabsControls.querySelectorAll('.tabs__control');
const checkedUsers = document.querySelector('#checked-users');

const getFilteredTab = () => {
  const currentActiveButton = document.querySelector('.tabs__control.is-active');
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

const initToggleEventListener = (data) => {
  resetChecked();
  renderCounterparties(getFilteredData(data));
  tabsControls.addEventListener('click', (e) => {
    const clickButton = e.target.classList.contains('tabs__control');
    if (!clickButton) { return; }
    allButtons.forEach((btn) => btn.classList.toggle('is-active', btn === e.target));
    renderCounterparties(getFilteredData(data));
  });
  checkedUsers.addEventListener('change', () => {
    renderCounterparties(getFilteredData(data));
  });
};


// ===== MAIN.JS ===== //
const DATAURL = {
  user: 'https://cryptostar.grading.htmlacademy.pro/user',
  contract: 'https://cryptostar.grading.htmlacademy.pro/contractors'
};
// ACCESSING THE SERVER AND OUTPUTTING DATA
getData(DATAURL.user, (data) => {
  userProfiles(data);
}, () => {
  failUserData();
});
getData(DATAURL.contract, (data) => {
  // renderCounterparties(data);
  initToggleEventListener(data);
  console.log(data);
});
