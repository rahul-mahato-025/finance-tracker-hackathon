const incomeContainer = document.querySelector(".income-container");
const expenseContainer = document.querySelector(".expense-container");
const transactionsContainer = document.querySelector(".transactions");
const editOverlayContaier = document.querySelector(".overlay-wrapper");
const editCloseBtn = document.querySelector(".edit-close-btn");
const editDescInp = document.querySelector(".edit-desc-input");
const editAmtInp = document.querySelector(".edit-amt-input");
const editTransactionType = document.querySelector(".edit-transaction-type");
const editSaveBtn = document.querySelector(".edit-save-btn");
const form = document.querySelector(".form");
const editForm = document.querySelector(".form-2");
const toastContainer = document.querySelector(".toast-container");
const toastMsg = document.querySelector(".toast-msg");
const noTransactionsContainer = document.querySelector(".no-transactions");

// TextElements
const balanceSpan = document.querySelector(".balance");
const incomeAmtSpan = document.querySelector(".income-amt");
const expenseAmtSpan = document.querySelector(".expense-amt");

var incomeAmt = Number(localStorage.getItem("income-amt")) || 0;
var expenseAmt = Number(localStorage.getItem("expense-amt")) || 0;
var balanceAmt = Number(localStorage.getItem("balance-amt")) || 0;
var transactionType = "add";
var transactionList = localStorage.getItem("transactions");
var editTransactionId = "";

if (transactionList) {
  transactionList = JSON.parse(transactionList);
} else {
  transactionList = [];
}

const showNoTransactions = (list) => {
  if (list.length === 0) {
    noTransactionsContainer.style.display = "flex";
  } else {
    noTransactionsContainer.style.display = "none";
  }
};

/* SHOW TOAST MESSAGE */
const showToast = (msg) => {
  toastContainer.style.display = "flex";
  toastMsg.innerText = msg;
  setTimeout(() => {
    toastContainer.style.display = "none";
  }, 2000);
};

const updateBalance = (income, expense, balance) => {
  incomeAmtSpan.innerText = `\u20B9  ${Number(income)}`;
  expenseAmtSpan.innerText = `\u20B9 ${Number(expense)}`;
  balanceSpan.innerText = `\u20B9 ${Number(balance)}`;

  localStorage.setItem("income-amt", Number(income));
  localStorage.setItem("expense-amt", Number(expense));
  localStorage.setItem("balance-amt", Number(balance));
};

const refreshTransactions = () => {
  transactionsContainer.innerHTML = "";
  transactionList.forEach((transaction) => {
    updateTransactionsDiv(transaction);
  });
  showNoTransactions(transactionList);
};

const handleTransactionRemove = (e) => {
  const id = e.target.id;
  var amtChange = 0;
  var type;
  transactionList = JSON.parse(localStorage.getItem("transactions"));
  transactionList = transactionList.filter((transaction) => {
    if (transaction.id == id) {
      amtChange = transaction.amt;
      type = transaction.type;
    }
    return transaction.id != id;
  });

  localStorage.setItem("transactions", JSON.stringify(transactionList));

  if (transactionList.length === 0) {
    transactionsContainer.innerText = "No Transaction";
  }

  if (type === "add") {
    incomeAmt -= Number(amtChange);
    balanceAmt -= Number(amtChange);
  } else {
    expenseAmt -= Number(amtChange);
    balanceAmt += Number(amtChange);
  }

  showToast("Transaction removed.");
  refreshTransactions();
  updateListenerForEditAndRemove();
  updateBalance(incomeAmt, expenseAmt, balanceAmt);
  showNoTransactions(transactionList);
};

const handleTransactionEdit = (e) => {
  const id = e.target.id;
  const transaction = transactionList.filter(
    (transaction) => transaction.id === id
  );
  editTransactionId = id;
  editOverlayContaier.style.display = "flex";
  editTransactionType.value =
    transaction[0].type === "add" ? "Income" : "Expense";

  editDescInp.value = transaction[0].desc;
  editAmtInp.value = transaction[0].amt;
};

const updateListenerForEditAndRemove = () => {
  const transactionRemoveBtns = document.querySelectorAll(
    ".remove-transaction-btn"
  );
  const transactionEditBtns = document.querySelectorAll(
    ".edit-transaction-btn"
  );

  transactionRemoveBtns.forEach((transactionRemoveBtn) => {
    transactionRemoveBtn.addEventListener("click", handleTransactionRemove);
  });

  transactionEditBtns.forEach((transactionEditBtn) => {
    transactionEditBtn.addEventListener("click", handleTransactionEdit);
  });
};

const updateTransactionsDiv = (transaction) => {
  transactionsContainer.innerHTML += `
    <div class="transaction-detail">
        <div class="transaction ${
          transaction.type === "add" ? "income " : "expend "
        }">
          <div class="transaction-left_container"><span>Desc: </span> <span>${
            transaction.desc
          }</span></div>
          <div class="transaction-left_container"><span>Amt: </span> <span>${
            transaction.type === "add" ? "+ " : "- "
          } \u20B9${transaction.amt}</span></div>
          <div class="transaction-left_container"><span>Date: </span> <span>${
            transaction.date
          }</span></div>
        </div>
        
        <div class="icons">
          <img
            id=${transaction.id}
            class="edit-transaction-btn"
            width="28px"
            height="28ox"
            src="./assets/images/edit.png"
            alt="edit transaction"
          />
          <img id=${
            transaction.id
          } class="remove-transaction-btn" src="./assets/images/bin.png" 
          alt="delete transaction"
          />
        </div>
      </div>
  `;
  updateListenerForEditAndRemove();
};

/* HANDLE FORM SUBMIT */
const handleSubmit = (e) => {
  e.preventDefault();
  const desc = e.target[0].value;
  const amt = Math.abs(+e.target[1].value);
  const transaction = {
    type: transactionType,
    desc,
    amt,
    id: desc.split(" ")[0] + new Date().getTime(),
    date: new Date().toLocaleDateString("en-GB"),
  };
  if (transactionType === "add") {
    incomeAmt += amt;
  } else {
    expenseAmt += amt;
  }
  transactionList.push(transaction);
  balanceAmt = incomeAmt - expenseAmt;

  localStorage.setItem("transactions", JSON.stringify(transactionList));
  showToast("Transaction added.");
  updateTransactionsDiv(transaction);
  updateBalance(incomeAmt, expenseAmt, balanceAmt);
  showNoTransactions(transactionList);
};

const handleEditFormSubmit = (e) => {
  e.preventDefault();
  const type = e.target[0].value;
  const desc = e.target[1].value;
  const newAmt = Math.abs(e.target[2].value);
  var prevAmt = 0;
  var prevType = "";

  transactionType = type === "Income" ? "add" : "spend";
  transactionList.forEach((transaction, index) => {
    if (transaction.id === editTransactionId) {
      prevAmt = transaction.amt;
      prevType = transaction.type;
      transactionList[index] = {
        id: editTransactionId,
        type: transactionType,
        desc,
        amt: newAmt,
        date: transaction.date,
      };
    }
  });
  localStorage.setItem("transactions", JSON.stringify(transactionList));

  if (prevType != transactionType) {
    if (prevType === "add") {
      incomeAmt -= Number(prevAmt);
      expenseAmt += Number(prevAmt);
      balanceAmt -= 2 * Number(prevAmt);
    } else {
      incomeAmt += Number(prevAmt);
      expenseAmt -= Number(prevAmt);
      balanceAmt += 2 * Number(prevAmt);
    }
  }

  if (transactionType == "add") {
    incomeAmt -= Number(prevAmt);
    balanceAmt -= Number(prevAmt);
    incomeAmt += Number(newAmt);
    balanceAmt += Number(newAmt);
  } else {
    expenseAmt -= Number(prevAmt);
    balanceAmt += Number(prevAmt);
    expenseAmt += Number(newAmt);
    balanceAmt -= Number(newAmt);
  }
  showToast("Transaction modified.");
  refreshTransactions();
  updateListenerForEditAndRemove();
  updateBalance(incomeAmt, expenseAmt, balanceAmt);
  editOverlayContaier.style.display = "none";
};

/* EVENT LISTENERS */
incomeContainer.addEventListener("click", () => {
  expenseContainer.classList.remove("selected");
  incomeContainer.classList.add("selected");
  transactionType = "add";
});

expenseContainer.addEventListener("click", () => {
  incomeContainer.classList.remove("selected");
  expenseContainer.classList.add("selected");
  transactionType = "spend";
});

editCloseBtn.addEventListener("click", () => {
  editOverlayContaier.style.display = "none";
});

form.addEventListener("submit", handleSubmit);
editForm.addEventListener("submit", handleEditFormSubmit);

updateBalance(incomeAmt, expenseAmt, balanceAmt);
updateListenerForEditAndRemove();
refreshTransactions();
showNoTransactions(transactionList);
