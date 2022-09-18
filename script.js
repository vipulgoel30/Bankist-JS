"use strict";

// USER DATA
const account1 = {
  currency: "EUR",
  interestRate: 1.2,
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  movementsDates: [
    "2019-01-28T09:15:04.904Z",
    "2019-04-01T10:17:24.185Z",
    "2019-05-27T17:01:17.194Z",
    "2019-07-11T23:36:17.929Z",
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-03-08T14:11:59.604Z",
    "2020-03-12T10:51:36.790Z",
  ],
  owner: "Jonas Schmedtmann",
  pin: 1111,
  locale: "pt-PT",
};

const account2 = {
  owner: "Jessica Davis",
  currency: "USD",
  interestRate: 1.5,

  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
  movementsDates: [
    "2019-01-25T14:18:46.235Z",
    "2019-02-05T16:33:06.386Z",
    "2019-03-10T14:43:26.374Z",
    "2019-04-25T18:49:59.371Z",
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-02-26T12:01:20.894Z",
  ],
  locale: "en-US",
};

const account = [account1, account2];

// for the login check
const forms = document.querySelectorAll("form");
const userInput = document.querySelector(".user");
const pinInput = document.querySelector(".pin");
const loginButton = document.querySelector(".user-login-submit");
let currentUser;

// for the display of content
const message = document.querySelector(".message");
const app = document.querySelector(".app");
const balanceDate = document.querySelector(".balance-date");
const balanceAmount = document.querySelector(".balance-amount");

// for the display of movements
const movements = document.querySelector(".movements");

// for the transfer operation
const tranferUserInput = document.querySelector(".transfer-user-input");
const tranferAmountInput = document.querySelector(".transfer-amount-input");
const transferButton = document.querySelector(".transfer-button");

// for the loan operation
const loanButton = document.querySelector(".loan-button");
const loanAmountInput = document.querySelector(".loan-amount-input");

// for the close account operation
const closeButton = document.querySelector(".close-button");
const closeUserInput = document.querySelector(".close-user-input");
const closePinInput = document.querySelector(".close-pin-input");

// for the summary in out expense
const summaryInAmount = document.querySelector(".summary-in-amount");
const summaryOutAmount = document.querySelector(".summary-out-amount");
const summaryInterestAmount = document.querySelector(
  ".summary-interest-amount"
);

// for the sort movements
const sort = document.querySelector(".sort");
const sortAscending = document.querySelector(".sort-ascending");
const sortDescending = document.querySelector(".sort-descending");

// for the time
const time = document.querySelector(".time");

// RESET FORMS DEFAULT
forms.forEach((element) => {
  element.addEventListener("submit", function (event) {
    event.preventDefault();
  });
});

// /////////////////////////////////////////////
// FUNCTIONS

// for the checking of the user exist or not
function checkUserExist(userCheck) {
  let currentUser;
  for (const element of account) {
    const { owner: tempUser, pin: tempPin } = element;
    currentUser = "";
    tempUser.split(" ").forEach((data) => {
      currentUser += data[0];
    });
    if (userCheck === currentUser.toLowerCase()) {
      return [tempPin, element];
    }
  }
  return [false, false]; //false for not such user exist
}

// To show whole content
function showUserConsole(userData) {
  // console.log("Loged In");
  app.classList.remove("hidden");
  app.style.opacity = "1";
  app.style.animation = "slideUp 2s ease-out forwards";

  const date = new Date();
  balanceDate.textContent = ` 
  As of ${date.toLocaleDateString(
    currentUser.locale
  )}, ${date.toLocaleTimeString(currentUser.locale)}`;

  // Show whole data
  balanceAmountDisplay();
  movementsDisplay();

  setTimer();
  showInOutInterest();
}

// TOTAL amount calculator
function totalCalculator(data) {
  let temp = 0;
  data.forEach((element) => {
    temp += element;
  });
  return temp;
}

// For the display of MOVEMENTS
function movementsDisplay() {
  movements.innerHTML = "";
  for (const [index, element] of currentUser.movements.entries()) {
    const movementItem = document.createElement("div");
    movementItem.classList.add("movements-item");
    movements.appendChild(movementItem);

    const movementsData = document.createElement("div");
    movementsData.classList.add("movements-data");
    movementItem.appendChild(movementsData);

    const movementRemarks = document.createElement("div");
    movementRemarks.classList.add(
      `${
        element >= 0
          ? "movements-remarks-deposit"
          : "movements-remarks-withdrawl"
      }`
    );
    movementRemarks.textContent = `${currentUser.movements.length - index} ${
      element >= 0 ? "DEPOSIT" : "WITHDRAWL"
    }`;
    movementsData.appendChild(movementRemarks);

    const movementsDate = document.createElement("div");
    movementsDate.classList.add("movements-date");
    movementsDate.textContent = `${currentUser.movementsDates[index].slice(
      8,
      10
    )}/${currentUser.movementsDates[index].slice(
      5,
      7
    )}/${currentUser.movementsDates[index].slice(0, 4)}`;
    movementsData.appendChild(movementsDate);

    const movementsAmount = document.createElement("div");
    movementsAmount.classList.add("movement-amount");
    movementsAmount.textContent = localAmount(element);
    movementItem.appendChild(movementsAmount);
  }
}

// For the TRANSFER AMOUNT
function transferAmount() {
  const transferUser = tranferUserInput.value;
  const transferAmount = tranferAmountInput.valueAsNumber;
  // console.log(transferAmount);
  if (
    transferUser &&
    transferAmount &&
    checkUserExist(transferUser)[0] !== currentUser.pin
  ) {
    const [, data] = checkUserExist(transferUser);
    const dateFormat = dateFormatGenerator();
    if (data) {
      // console.log(dateFormat);
      data.movements.unshift(transferAmount);
      data.movementsDates.unshift(dateFormat);
      currentUser.movements.unshift(-transferAmount);
      currentUser.movementsDates.unshift(dateFormat);
      updateBalanceInOutMovements();
      tranferUserInput.value = "";
      tranferAmountInput.valueAsNumber = "";
    }
  }
}

// For showing BALANCE AMOUNT
function balanceAmountDisplay() {
  balanceAmount.textContent = localAmount(
    totalCalculator(currentUser.movements)
  );
}

// For UPDATE BALANCE & MOVEMENTS & IN,OUT,EXPENSE
function updateBalanceInOutMovements() {
  balanceAmountDisplay();
  movementsDisplay();
  showInOutInterest();
}

// For the LOAN operation
function loanOperation() {
  const loanAmount = loanAmountInput.valueAsNumber;
  currentUser.movements.unshift(loanAmount);
  currentUser.movementsDates.unshift(dateFormatGenerator());
  updateBalanceInOutMovements();
  loanAmountInput.value = "";
}

// For the date format in the movements date field
function dateFormatGenerator() {
  const date = new Date();

  return `${date.getFullYear()}-${
    date.getMonth() + 1 <= 10 ? "0" + (date.getMonth() + 1) : date.getMonth()
  }-${date.getUTCDate()}T${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}.${date.getUTCMilliseconds()}Z`;
}

// For the CLOSE account operation
function closeAccount() {
  const inputUser = closeUserInput.value;
  const inputPin = closePinInput.valueAsNumber;
  const [, enteredUserData] = checkUserExist(inputUser);

  if (
    enteredUserData.owner === currentUser.owner &&
    inputPin === currentUser.pin
  ) {
    account.splice(account.indexOf(currentUser), 1);
    hideConsole();
    closeUserInput.value = "";
    closePinInput.valueAsNumber = "";
  }
}

// For the Show IN,OUT,EXPENSE
function showInOutInterest() {
  let inAmount = 0;
  let outAmount = 0;

  currentUser.movements.forEach((element) => {
    if (element > 0) {
      inAmount += element;
    } else {
      outAmount += element;
    }
  });

  summaryInAmount.textContent = localAmount(inAmount);
  summaryOutAmount.textContent = localAmount(outAmount);
  summaryInterestAmount.textContent = localAmount(
    Math.round((inAmount * currentUser.interestRate) / 100)
  );
}

// For the generation of LOCAL AMOUNT
function localAmount(amount) {
  const localAmountTemp = amount.toLocaleString(currentUser.locale);
  if (currentUser.currency === "EUR") {
    return localAmountTemp + " €";
  } else {
    return amount > 0
      ? "$ " + localAmountTemp
      : "-$ " + Math.abs(amount).toLocaleString(currentUser.locale);
  }
}

// For tne SORT of the movements
function sortFunction() {
  if (sortStatus === "descending") {
    sortStatus = "ascending";
    currentUser.movements.sort().reverse();
    // console.log(currentUser.movements);
    sortAscending.classList.add("hidden");
    sortDescending.classList.remove("hidden");

    movementsDisplay();
  } else {
    sortStatus = "descending";
    currentUser.movements.reverse();
    sortAscending.classList.remove("hidden");
    sortDescending.classList.add("hidden");

    movementsDisplay();
  }
}

// For the TIMER
function setTimer() {
  let timer = 600;
  const interval = setInterval(() => {
    timer--;
    if (timer > 0) {
      time.textContent = `0${Math.floor(timer / 60)}:${
        timer % 60 <= 9 ? "0" + (timer % 60) : timer % 60
      }`;
    } else {
      clearInterval(interval);
      hideConsole();
    }
  }, 1000);
}

// For hidding the console
function hideConsole() {
  setTimeout(() => {
    app.classList.add("hidden");
  }, 1000);
  app.style.opacity = "0";
}

// for the login button click
loginButton.addEventListener("click", function () {
  const user = userInput.value.toLowerCase();
  const pin = Number(pinInput.value);
  const [userPin, userData] = checkUserExist(user);
  if (userPin === pin) {
    currentUser = userData;
    message.textContent = `${
      new Date().getHours() <= 18 ? "Good Day," : "Good Afternoon,"
    } ${currentUser.owner.split(" ")[0]}!`;
    showUserConsole(currentUser);
  }
});

// for transfer money operations
transferButton.addEventListener("click", transferAmount);

// for the loan operation
loanButton.addEventListener("click", loanOperation);

// for the close account operation
closeButton.addEventListener("click", closeAccount);

// for the sort button
let sortStatus = "descending";
sort.addEventListener("click", sortFunction);
