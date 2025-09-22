import { failUserData, userProfiles } from './user.js';
import { initToggleEventListener } from './toggle.js';


const serverOnFail = () => {
  const main = document.querySelector('main');
  const error = main.querySelector('.container--server_error');
  const success = main.querySelector('.container--counterparties');
  error.style.display = 'block';
  success.style.display = 'none';
};
const DATAURL = {
  user: 'https://cryptostar.grading.htmlacademy.pro/user',
  contract: 'https://cryptostar.grading.htmlacademy.pro/contractors'
};
const getData = async (url, onFail) => {
  try {
    const response = await fetch(url);
    if (response.ok) {
      return await response.json();
    } else {
      onFail();
    }
  } catch (error) {
    onFail();
  }
};
const sendData = async (data, onSuccess, onFail) => {
  try {
    const response = await fetch('https://cryptostar.grading.htmlacademy.pro/', {method: 'POST', body: data});
    if(response.ok) {
      onSuccess();
    } else {
      onFail();
    }
  } catch (error) {
    onFail();
  }
};
const dataUserAndContractor = async () => {
  try {
    const [user, contractor] = await Promise.allSettled([
      getData(DATAURL.user, () => {
        failUserData();
        serverOnFail(); }),
      getData(DATAURL.contract, serverOnFail)
    ]);

    if (contractor.status === 'fulfilled' && user.status === 'fulfilled') {
      userProfiles(user.value);
      initToggleEventListener(contractor.value, user.value);
    } else {
      failUserData();
      serverOnFail();
    }
  } catch (error) {
    failUserData();
    serverOnFail();
  }
};
export { sendData, getData, dataUserAndContractor };
