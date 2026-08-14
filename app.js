/* =========================================================
   HIFI COLLECTION — CUSTOMER WALK-IN
   Main application logic
   ========================================================= */


/* ---------------------------------------------------------
   1. GOOGLE APPS SCRIPT URL
   ---------------------------------------------------------

   IMPORTANT:
   Replace the URL below with the Web App URL you received
   from Google Apps Script.

   It should look something like:

   https://script.google.com/macros/s/XXXXXXXXXXXX/exec

   --------------------------------------------------------- */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz5plc1jea3LUySrbtfAR7sYuG6EPmvbejdChIsd7lNuPyjhkKbOrXPiP4COrZ_S7tp/exec";


/* ---------------------------------------------------------
   2. FIXED STORE INFORMATION
   --------------------------------------------------------- */

const STORE_NAME = "Hifi Collection";
const COUNTRY_CODE = "+91";


/* ---------------------------------------------------------
   3. ALLOWED CATEGORIES
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
   4. ALLOWED STAFF
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
   5. GET DOM ELEMENTS
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
   6. CURRENT CUSTOMER DATA
   --------------------------------------------------------- */

let currentCustomer = null;


/* ---------------------------------------------------------
   7. PHONE NUMBER VALIDATION
   ---------------------------------------------------------

   Only numbers are allowed.
   Maximum 10 digits.
   --------------------------------------------------------- */

contactNumberInput.addEventListener(
  "input",
  function () {

    // Remove anything that isn't a number.
    let value = this.value.replace(/\D/g, "");

    // Keep maximum 10 digits.
    value = value.substring(0, 10);

    this.value = value;

    clearFieldError("contactNumberError");
  }
);


/* ---------------------------------------------------------
   8. PREVENT INVALID PHONE KEYS
   --------------------------------------------------------- */

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
   9. ADD PRODUCT
   --------------------------------------------------------- */

addProductButton.addEventListener(
  "click",
  function () {

    createProductRow();

  }
);


/* ---------------------------------------------------------
   10. CREATE PRODUCT ROW
   --------------------------------------------------------- */

function createProductRow(value = "") {

  const row =
    document.createElement("div");

  row.className = "product-row";

  const input =
    document.createElement("input");

  input.type = "text";

  input.className = "product-code";

  input.placeholder = "Product code";

  input.value = value;

  input.autocomplete = "off";

  const removeButton =
    document.createElement("button");

  removeButton.type = "button";

  removeButton.className =
    "remove-product";

  removeButton.setAttribute(
    "aria-label",
    "Remove product"
  );

  removeButton.textContent = "×";

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
   11. SHOW / HIDE REMOVE BUTTONS
   --------------------------------------------------------- */

function updateRemoveButtons() {

  const rows =
    productsContainer.querySelectorAll(
      ".product-row"
    );

  rows.forEach(
    function (row, index) {

      const button =
        row.querySelector(".remove-product");

      if (rows.length === 1) {
        button.style.display = "none";
      } else {
        button.style.display = "block";
      }

    }
  );
}


/* ---------------------------------------------------------
   12. GET PRODUCT CODES
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
   13. VALIDATION HELPERS
   --------------------------------------------------------- */

function showFieldError(
  errorId,
  message
) {

  const element =
    document.getElementById(errorId);

  if (element) {
    element.textContent = message;
  }
}


function clearFieldError(errorId) {

  const element =
    document.getElementById(errorId);

  if (element) {
    element.textContent = "";
  }
}


function clearAllErrors() {

  const errors =
    document.querySelectorAll(
      ".field-error"
    );

  errors.forEach(
    function (error) {
      error.textContent = "";
    }
  );
}


/* ---------------------------------------------------------
   14. VALIDATE FORM
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

  const staff =
    staffInput.value;


  /* Customer name */

  if (customerName === "") {

    showFieldError(
      "customerNameError",
      "Please enter the customer's name."
    );

    isValid = false;
  }


  /* Contact number */

  if (!/^\d{10}$/.test(contactNumber)) {

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

    if (!emailPattern.test(email)) {

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
    !CATEGORIES.includes(category)
  ) {

    showFieldError(
      "categoryError",
      "Please select a category."
    );

    isValid = false;
  }


  /* Staff */

  if (
    staff === "" ||
    !STAFF.includes(staff)
  ) {

    showFieldError(
      "staffError",
      "Please select the staff member."
    );

    isValid = false;
  }


  return isValid;
}


/* ---------------------------------------------------------
   15. SUBMIT BUTTON
   --------------------------------------------------------- */

submitButton.addEventListener(
  "click",
  async function () {

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
        "Google Sheets connection has not been configured yet.";

      statusMessage.className =
        "status-message error";

      return;
    }


    await submitWalkIn();

  }
);


/* ---------------------------------------------------------
   16. SUBMIT WALK-IN TO GOOGLE SHEETS
   --------------------------------------------------------- */

async function submitWalkIn() {

  const customerName =
    customerNameInput.value.trim();

  const contactNumber =
    contactNumberInput.value.trim();

  const email =
    emailInput.value.trim();

  const instagram =
    instagramInput.value.trim()
      .replace(/^@+/, "");

  const category =
    categoryInput.value;

  const staff =
    staffInput.value;

  const products =
    getProducts();

  const notes =
    notesInput.value.trim();


  /* Build customer object */

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
      staff,

    products:
      products,

    notes:
      notes
  };


  /* Loading state */

  submitButton.disabled = true;

  submitText.style.display =
    "none";

  submitLoader.style.display =
    "inline";


  statusMessage.textContent =
    "Saving walk-in...";

  statusMessage.className =
    "status-message";


  try {

    /*
      We send the data as text/plain.

      This avoids a browser CORS preflight request and
      works cleanly with Google Apps Script web apps.
    */

    await fetch(
      GOOGLE_SCRIPT_URL,
      {
        method: "POST",

        mode: "no-cors",

        headers: {
          "Content-Type":
            "text/plain;charset=utf-8"
        },

        body: JSON.stringify(
          currentCustomer
        )
      }
    );


    /*
      With no-cors the browser does not allow JavaScript
      to read Google's response.

      However, the POST request is sent to Apps Script,
      which writes the data into Google Sheets.

      We therefore move to the success screen after
      the request completes.
    */

    showSuccessCard();


  } catch (error) {

    console.error(error);

    statusMessage.textContent =
      "Something went wrong. Please try again.";

    statusMessage.className =
      "status-message error";

  } finally {

    submitButton.disabled = false;

    submitText.style.display =
      "inline";

    submitLoader.style.display =
      "none";
  }
}


/* ---------------------------------------------------------
   17. SHOW SUCCESS CARD
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
   18. POPULATE CUSTOMER CARD
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


  const productsContainerCard =
    document.getElementById(
      "cardProducts"
    );

  productsContainerCard.innerHTML = "";


  if (
    currentCustomer.products.length === 0
  ) {

    const empty =
      document.createElement("div");

    empty.className =
      "card-product-item";

    empty.textContent =
      "No products recorded";

    productsContainerCard.appendChild(
      empty
    );

  } else {

    currentCustomer.products.forEach(
      function (product) {

        const item =
          document.createElement("div");

        item.className =
          "card-product-item";

        item.textContent =
          product;

        productsContainerCard.appendChild(
          item
        );

      }
    );
  }
}


/* ---------------------------------------------------------
   19. FORMAT PHONE NUMBER
   --------------------------------------------------------- */

function formatPhoneNumber(number) {

  if (number.length !== 10) {
    return number;
  }

  return (
    number.substring(0, 5) +
    " " +
    number.substring(5)
  );
}


/* ---------------------------------------------------------
   20. CURRENT DATE
   --------------------------------------------------------- */

function formatCurrentDate() {

  const now =
    new Date();

  return now.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric"
    }
  ).toUpperCase();
}


/* ---------------------------------------------------------
   21. WHATSAPP BUTTON
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
      `Hi ${currentCustomer.customerName}, ` +
      `thank you for visiting ` +
      `Hifi Collection today. ` +
      `It was a pleasure assisting you.`;


    if (
      currentCustomer.products.length > 0
    ) {

      message +=
        `\n\nHere are the pieces you shortlisted:`;

      currentCustomer.products.forEach(
        function (product) {

          message +=
            `\n• ${product}`;

        }
      );

    }


    message +=
      `\n\nPlease feel free to reach out to us ` +
      `if you need any further details.` +
      `\n\n— Hifi Collection`;


    const whatsappUrl =
      "https://wa.me/" +
      phone +
      "?text=" +
      encodeURIComponent(message);


    window.open(
      whatsappUrl,
      "_blank"
    );
  }
);


/* ---------------------------------------------------------
   22. NEW WALK-IN
   --------------------------------------------------------- */

newWalkInButton.addEventListener(
  "click",
  function () {

    resetForm();

  }
);


/* ---------------------------------------------------------
   23. RESET FORM
   --------------------------------------------------------- */

function resetForm() {

  customerNameInput.value = "";

  contactNumberInput.value = "";

  emailInput.value = "";

  instagramInput.value = "";

  categoryInput.value = "";

  staffInput.value = "";

  notesInput.value = "";

  clearAllErrors();

  statusMessage.textContent = "";

  statusMessage.className =
    "status-message";


  /*
    Reset products to one empty row.
  */

  productsContainer.innerHTML = "";

  createProductRow();


  currentCustomer = null;


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
   24. INITIALIZE
   --------------------------------------------------------- */

updateRemoveButtons();
