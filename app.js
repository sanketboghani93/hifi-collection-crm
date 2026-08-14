/* =========================================================
   HIFI COLLECTION — CUSTOMER WALK-IN
   ========================================================= */


/* ---------------------------------------------------------
   GOOGLE APPS SCRIPT
   --------------------------------------------------------- */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz5plc1jea3LUySrbtfAR7sYuG6EPmvbejdChIsd7lNuPyjhkKbOrXPiP4COrZ_S7tp/exec";


/* ---------------------------------------------------------
   STORE SETTINGS
   --------------------------------------------------------- */

const STORE_NAME = "Hifi Collection";
const COUNTRY_CODE = "+91";


/* ---------------------------------------------------------
   ALLOWED CATEGORIES
   --------------------------------------------------------- */

const CATEGORIES = [
  "Indo-western",
  "Suit",
  "Chania Choli",
  "Koti Kurta",
  "Sherwani",
  "Safa",
  "Jodhpuri"
];


/* ---------------------------------------------------------
   ALLOWED STAFF
   --------------------------------------------------------- */

const STAFF = [
  "Rajubhai",
  "Shabbirbhai",
  "Ketanbhai Owner",
  "Dollyben Owner",
  "Sanketbhai Owner",
  "Sonalben"
];


/* ---------------------------------------------------------
   DOM ELEMENTS
   --------------------------------------------------------- */

const customerNameInput =
  document.getElementById("customerName");

const contactNumberInput =
  document.getElementById("contactNumber");

const emailInput =
  document.getElementById("email");

const instagramInput =
  document.getElementById("instagram");

const categoryInput =
  document.getElementById("category");

const staffInput =
  document.getElementById("staff");

const purchaseStatusInput =
  document.getElementById("purchaseStatus");

const followUpDateInput =
  document.getElementById("followUpDate");

const notesInput =
  document.getElementById("notes");

const productsContainer =
  document.getElementById("productsContainer");

const addProductButton =
  document.getElementById("addProduct");

const submitButton =
  document.getElementById("submitWalkIn");

const submitText =
  document.querySelector(".submit-text");

const submitLoader =
  document.querySelector(".submit-loader");

const statusMessage =
  document.getElementById("statusMessage");

const formCard =
  document.querySelector(".form-card");

const successSection =
  document.getElementById("successSection");

const newWalkInButton =
  document.getElementById("newWalkIn");

const whatsappButton =
  document.getElementById("whatsappButton");


/* ---------------------------------------------------------
   CURRENT CUSTOMER
   --------------------------------------------------------- */

let currentCustomer = null;


/* ---------------------------------------------------------
   PHONE INPUT
   --------------------------------------------------------- */

contactNumberInput.addEventListener(
  "input",
  function () {

    let value =
      this.value.replace(/\D/g, "");

    value =
      value.substring(0, 10);

    this.value = value;

    clearFieldError(
      "contactNumberError"
    );
  }
);


contactNumberInput.addEventListener(
  "keydown",
  function (event) {

    const allowedKeys = [
      "Backspace",
      "Delete",
      "ArrowLeft",
      "ArrowRight",
      "Tab",
      "Home",
      "End"
    ];

    if (
      allowedKeys.includes(event.key) ||
      event.ctrlKey ||
      event.metaKey
    ) {
      return;
    }

    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  }
);


/* ---------------------------------------------------------
   ADD PRODUCT BUTTON
   --------------------------------------------------------- */

addProductButton.addEventListener(
  "click",
  function () {

    createProductRow();

  }
);


/* ---------------------------------------------------------
   CREATE PRODUCT ROW
   --------------------------------------------------------- */

function createProductRow(value = "") {

  const row =
    document.createElement("div");

  row.className =
    "product-row";


  const input =
    document.createElement("input");

  input.type =
    "text";

  input.className =
    "product-code";

  input.placeholder =
    "Product code";

  input.value =
    value;

  input.autocomplete =
    "off";


  const removeButton =
    document.createElement("button");

  removeButton.type =
    "button";

  removeButton.className =
    "remove-product";

  removeButton.setAttribute(
    "aria-label",
    "Remove product"
  );

  removeButton.textContent =
    "×";


  removeButton.addEventListener(
    "click",
    function () {

      row.remove();

      updateRemoveButtons();

    }
  );


  row.appendChild(input);

  row.appendChild(removeButton);

  productsContainer.appendChild(row);

  updateRemoveButtons();

  input.focus();
}


/* ---------------------------------------------------------
   UPDATE REMOVE BUTTONS
   --------------------------------------------------------- */

function updateRemoveButtons() {

  const rows =
    productsContainer.querySelectorAll(
      ".product-row"
    );


  rows.forEach(
    function (row) {

      const button =
        row.querySelector(
          ".remove-product"
        );


      if (rows.length === 1) {

        button.style.display =
          "none";

      } else {

        button.style.display =
          "block";

      }

    }
  );
}


/* ---------------------------------------------------------
   GET PRODUCTS
   --------------------------------------------------------- */

function getProducts() {

  const inputs =
    productsContainer.querySelectorAll(
      ".product-code"
    );

  const products = [];


  inputs.forEach(
    function (input) {

      const value =
        input.value.trim();

      if (value !== "") {

        products.push(value);

      }

    }
  );


  return products;
}


/* ---------------------------------------------------------
   ERROR FUNCTIONS
   --------------------------------------------------------- */

function showFieldError(
  errorId,
  message
) {

  const element =
    document.getElementById(
      errorId
    );

  if (element) {

    element.textContent =
      message;

  }
}


function clearFieldError(
  errorId
) {

  const element =
    document.getElementById(
      errorId
    );

  if (element) {

    element.textContent =
      "";

  }
}


function clearAllErrors() {

  const errors =
    document.querySelectorAll(
      ".field-error"
    );


  errors.forEach(
    function (error) {

      error.textContent =
        "";

    }
  );
}


/* ---------------------------------------------------------
   VALIDATE FORM
   --------------------------------------------------------- */

function validateForm() {

  clearAllErrors();

  let isValid = true;


  const customerName =
    customerNameInput.value.trim();


  const contactNumber =
    contactNumberInput.value.trim();


  const email =
    emailInput.value.trim();


  const category =
    categoryInput.value;


  const selectedStaff =
    staffInput.value;


  const purchaseStatus =
    purchaseStatusInput.value;


  /* Customer name */

  if (customerName === "") {

    showFieldError(
      "customerNameError",
      "Please enter the customer's name."
    );

    isValid = false;

  }


  /* Contact */

  if (
    !/^\d{10}$/.test(
      contactNumber
    )
  ) {

    showFieldError(
      "contactNumberError",
      "Please enter exactly 10 digits."
    );

    isValid = false;

  }


  /* Email */

  if (email !== "") {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(email)
    ) {

      showFieldError(
        "emailError",
        "Please enter a valid email address."
      );

      isValid = false;

    }

  }


  /* Category */

  if (
    category === "" ||
    !CATEGORIES.includes(
      category
    )
  ) {

    showFieldError(
      "categoryError",
      "Please select a category."
    );

    isValid = false;

  }


  /* Staff */

  if (
    selectedStaff === "" ||
    !STAFF.includes(
      selectedStaff
    )
  ) {

    showFieldError(
      "staffError",
      "Please select the staff member."
    );

    isValid = false;

  }


  /* Purchase status */

  if (
    purchaseStatus === ""
  ) {

    showFieldError(
      "purchaseStatusError",
      "Please select the purchase status."
    );

    isValid = false;

  }


  return isValid;
}


/* ---------------------------------------------------------
   SUBMIT BUTTON
   --------------------------------------------------------- */

submitButton.addEventListener(
  "click",
  async function () {

    statusMessage.textContent =
      "";

    statusMessage.className =
      "status-message";


    if (!validateForm()) {

      statusMessage.textContent =
        "Please check the highlighted fields.";

      statusMessage.className =
        "status-message error";

      return;

    }


    if (
      GOOGLE_SCRIPT_URL.includes(
        "PASTE_YOUR_GOOGLE"
      )
    ) {

      statusMessage.textContent =
        "Google Sheets connection has not been configured.";

      statusMessage.className =
        "status-message error";

      return;

    }


    await submitWalkIn();

  }
);


/* ---------------------------------------------------------
   SUBMIT WALK-IN
   --------------------------------------------------------- */

async function submitWalkIn() {

  const customerName =
    customerNameInput.value.trim();


  const contactNumber =
    contactNumberInput.value.trim();


  const email =
    emailInput.value.trim();


  const instagram =
    instagramInput.value
      .trim()
      .replace(/^@+/, "");


  const category =
    categoryInput.value;


  const selectedStaff =
    staffInput.value;


  const products =
    getProducts();


  const purchaseStatus =
    purchaseStatusInput.value;


  const followUpDate =
    followUpDateInput.value;


  const notes =
    notesInput.value.trim();


  currentCustomer = {

    customerName:
      customerName,

    contactNumber:
      contactNumber,

    email:
      email,

    instagram:
      instagram,

    category:
      category,

    staff:
      selectedStaff,

    products:
      products,

    purchaseStatus:
      purchaseStatus,

    followUpDate:
      followUpDate,

    notes:
      notes

  };


  /* Loading state */

  submitButton.disabled =
    true;


  submitText.style.display =
    "none";


  submitLoader.style.display =
    "inline";


  statusMessage.textContent =
    "Saving walk-in...";


  statusMessage.className =
    "status-message";


  try {

    await fetch(
      GOOGLE_SCRIPT_URL,
      {
        method: "POST",

        mode: "no-cors",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body:
          JSON.stringify({

            action:
              "createWalkIn",

            customerName:
              customerName,

            contactNumber:
              contactNumber,

            email:
              email,

            instagram:
              instagram,

            category:
              category,

            staff:
              selectedStaff,

            products:
              products,

            purchaseStatus:
              purchaseStatus,

            followUpDate:
              followUpDate,

            notes:
              notes

          })

      }
    );


    showSuccessCard();


  } catch (error) {

    console.error(
      "Submission error:",
      error
    );


    statusMessage.textContent =
      "Something went wrong. Please try again.";


    statusMessage.className =
      "status-message error";


  } finally {

    submitButton.disabled =
      false;


    submitText.style.display =
      "inline";


    submitLoader.style.display =
      "none";

  }
}


/* ---------------------------------------------------------
   SHOW SUCCESS CARD
   --------------------------------------------------------- */

function showSuccessCard() {

  formCard.style.display =
    "none";


  successSection.style.display =
    "block";


  populateCustomerCard();


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* ---------------------------------------------------------
   POPULATE CUSTOMER CARD
   --------------------------------------------------------- */

function populateCustomerCard() {

  if (!currentCustomer) {
    return;
  }


  document.getElementById(
    "cardCustomerName"
  ).textContent =
    currentCustomer.customerName;


  document.getElementById(
    "cardContact"
  ).textContent =
    COUNTRY_CODE +
    " " +
    formatPhoneNumber(
      currentCustomer.contactNumber
    );


  document.getElementById(
    "cardDate"
  ).textContent =
    formatCurrentDate();


  document.getElementById(
    "cardCategory"
  ).textContent =
    currentCustomer.category;


  document.getElementById(
    "cardStaff"
  ).textContent =
    currentCustomer.staff;


  const cardProducts =
    document.getElementById(
      "cardProducts"
    );


  cardProducts.innerHTML =
    "";


  if (
    currentCustomer.products.length === 0
  ) {

    const empty =
      document.createElement(
        "div"
      );

    empty.className =
      "card-product-item";

    empty.textContent =
      "No products recorded";


    cardProducts.appendChild(
      empty
    );


  } else {

    currentCustomer.products.forEach(
      function (product) {

        const item =
          document.createElement(
            "div"
          );

        item.className =
          "card-product-item";

        item.textContent =
          product;


        cardProducts.appendChild(
          item
        );

      }
    );

  }
}


/* ---------------------------------------------------------
   FORMAT PHONE
   --------------------------------------------------------- */

function formatPhoneNumber(
  number
) {

  if (
    number.length !== 10
  ) {

    return number;

  }


  return (
    number.substring(0, 5) +
    " " +
    number.substring(5)
  );
}


/* ---------------------------------------------------------
   FORMAT DATE
   --------------------------------------------------------- */

function formatCurrentDate() {

  const now =
    new Date();


  return now
    .toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    )
    .toUpperCase();
}


/* ---------------------------------------------------------
   WHATSAPP
   --------------------------------------------------------- */

whatsappButton.addEventListener(
  "click",
  function () {

    if (!currentCustomer) {
      return;
    }


    const phone =
      "91" +
      currentCustomer.contactNumber;


    let message =
      "Hi " +
      currentCustomer.customerName +
      ", thank you for visiting " +
      "Hifi Collection today. " +
      "It was a pleasure assisting you.";


    if (
      currentCustomer.products.length > 0
    ) {

      message +=
        "\n\nHere are the pieces you shortlisted:";


      currentCustomer.products.forEach(
        function (product) {

          message +=
            "\n• " +
            product;

        }
      );

    }


    message +=
      "\n\nPlease feel free to reach out to us " +
      "if you need any further details." +
      "\n\n— Hifi Collection";


    const whatsappUrl =
      "https://wa.me/" +
      phone +
      "?text=" +
      encodeURIComponent(
        message
      );


    window.open(
      whatsappUrl,
      "_blank"
    );

  }
);


/* ---------------------------------------------------------
   NEW WALK-IN
   --------------------------------------------------------- */

newWalkInButton.addEventListener(
  "click",
  function () {

    resetForm();

  }
);


/* ---------------------------------------------------------
   RESET FORM
   --------------------------------------------------------- */

function resetForm() {

  customerNameInput.value =
    "";

  contactNumberInput.value =
    "";

  emailInput.value =
    "";

  instagramInput.value =
    "";

  categoryInput.value =
    "";

  staffInput.value =
    "";

  purchaseStatusInput.value =
    "";

  followUpDateInput.value =
    "";

  notesInput.value =
    "";


  clearAllErrors();


  statusMessage.textContent =
    "";


  statusMessage.className =
    "status-message";


  productsContainer.innerHTML =
    "";


  createProductRow();


  currentCustomer =
    null;


  formCard.style.display =
    "block";


  successSection.style.display =
    "none";


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });


  customerNameInput.focus();
}


/* ---------------------------------------------------------
   INITIALIZE
   --------------------------------------------------------- */

updateRemoveButtons();
