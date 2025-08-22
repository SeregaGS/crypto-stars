const DOMElements = {
  userProfileName: document.querySelector('.user-profile__name span'),
  userFiatBalance: document.querySelector('#user-fiat-balance'),
  userCryptoBalance: document.querySelector('#user-crypto-balance'),
  userProfile: document.querySelector('.user-profile')
};

const userProfiles = (user) => {
  const { userName = 'Гость', balances } = user;
  const fiatCurrency = balances.find((currency) => currency.currency === 'RUB');
  const cryptoCurrency = balances.find((currency) => currency.currency === 'KEKS');
  DOMElements.userProfileName.textContent = userName;
  DOMElements.userFiatBalance.textContent = fiatCurrency ? fiatCurrency.amount : '0';
  DOMElements.userCryptoBalance.textContent = cryptoCurrency ? cryptoCurrency.amount : '0';
};

const failUserData = () => {
  DOMElements.userProfile.style.display = 'none';
};
export { userProfiles, failUserData };
