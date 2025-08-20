// Фильтр по табу, возвращает seller или buyer;
const getFilteredTab = (buttons) => {
  const currentActiveButton = buttons.querySelector('.tabs__control.is-active');
  return currentActiveButton.textContent.trim() === 'Купить' ? 'seller' : 'buyer';
};

// Фильтр по статусу и по checked верефицированных контрагентов;
const getFilteredVerifiedStatus = (data, status, onlyVerified) => {
  let filtered = data.filter((item) => item.status === status);
  if (onlyVerified) {
    filtered = filtered.filter((item) => item.isVerified);
  }
  return filtered;
};

const getFilteredData = (data, buttons, checked) => {
  const status = getFilteredTab(buttons);
  const onlyVerified = checked.checked;
  return getFilteredVerifiedStatus(data, status, onlyVerified);
};

export { getFilteredData, getFilteredTab };
