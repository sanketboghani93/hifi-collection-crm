/* =========================================================
   HIFI COLLECTION
   CUSTOMER WALK-IN WEB APP
   ========================================================= */


/* ---------------------------------------------------------
   1. GOOGLE APPS SCRIPT URL
   --------------------------------------------------------- */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz5plc1jea3LUySrbtfAR7sYuG6EPmvbejdChIsd7lNuPyjhkKbOrXPiP4COrZ_S7tp/exec";


/* ---------------------------------------------------------
   2. STORE SETTINGS
   --------------------------------------------------------- */

const STORE_NAME =
  "Hifi Collection";

const COUNTRY_CODE =
  "+91";


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
   4. DOM ELEMENTS
   --------------------------------------------------------- */

const customerNameInput =
  document.getElementById(
    "customerName"
  );


const contactNumberInput =
  document.getElementById(
    "contactNumber"
  );


const emailInput =
  document.getElementById(
    "email"
  );


const instagramInput =
  document.getElementById(
    "instagram"
  );


const categoryInput =
  document.getElementById(
    "category"
  );


const staffInput =
  document.getElementById(
    "staff"
  );


const purchaseStatusInput =
  document.getElementById(
    "purchaseStatus"
  );


const followUpDateInput =
  document.getElementById(
    "followUpDate"
  );


const notesInput =
  document.getElementById(
    "notes"
  );


const productsContainer =
  document.getElementById(
    "productsContainer"
  );


const addProductButton =
  document.getElementById(
    "addProduct"
  );


const submitButton =
  document.getElementById(
    "submitWalkIn"
  );


const submitText =
  document.querySelector(
    ".submit-text"
  );


const submitLoader =
  document.querySelector(
    ".submit-loader"
  );


const statusMessage =
  document.getElementById(
    "statusMessage"
  );


const formCard =
  document.querySelector(
    ".form-card"
  );


const successSection =
  document.getElementById(
    "successSection"
  );


const newWalkInButton =
  document.getElementById(
    "newWalkIn"
  );


const whatsappButton =
  document.getElementById(
    "whatsappButton"
  );


/* ---------------------------------------------------------
   5. CURRENT CUSTOMER
   --------------------------------------------------------- */

let currentCustomer =
  null;


/* ---------------------------------------------------------
   6. PHONE NUMBER INPUT
   --------------------------------------------------------- */

contactNumberInput.addEventListener(
  "input",
  function () {

    let value =
      this.value.replace(
        /\D/g,
        ""
      );


    value =
      value.substring(
        0,
        10
      );


    this.value =
      value;


    clearFieldError(
      "contactNumberError"
    );

  }
);


/* ---------------------------------------------------------
   7. PREVENT INVALID PHONE KEYS
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
      allowedKeys.includes(
        event.key
      ) ||
      event.ctrlKey ||
      event.metaKey
    ) {

      return;

    }


    if (
      !/^\d$/.test(
        event.key
      )
    ) {

      event.preventDefault();

    }

  }
);


/* ---------------------------------------------------------
   8. ADD PRODUCT
   --------------------------------------------------------- */

addProductButton.addEventListener(
  "click",
  function () {

    createProductRow();

  }
);


/* ---------------------------------------------------------
   9. CREATE PRODUCT ROW
   --------------------------------------------------------- */

function createProductRow(
  value = ""
) {

  const row =
    document.createElement(
      "div"
    );


  row.className =
    "product-row";


  const input =
    document.createElement(
      "input"
    );


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
    document.createElement(
      "button"
    );


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


  row.appendChild(
    input
  );


  row.appendChild(
    removeButton
  );


  productsContainer.appendChild(
    row
  );


  updateRemoveButtons();


  input.focus();

}


/* ---------------------------------------------------------
   10. UPDATE PRODUCT REMOVE BUTTONS
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


      if (
        rows.length === 1
      ) {

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
   11. GET PRODUCT CODES
   --------------------------------------------------------- */

function getProducts() {

  const inputs =
    productsContainer.querySelectorAll(
      ".product-code"
    );


  const products =
    [];


  inputs.forEach(
    function (input) {

      const value =
        input.value.trim();


      if (
        value !== ""
      ) {

        products.push(
          value
        );

      }

    }
  );


  return products;

}


/* ---------------------------------------------------------
   12. ERROR HELPERS
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
   13. LOAD STAFF FROM GOOGLE SHEET
   ---------------------------------------------------------

   IMPORTANT:

   We use JSONP here because a normal browser GET
   to Google Apps Script can run into CORS restrictions.

   Only active staff names are returned.

   Google email addresses are NOT returned.
   --------------------------------------------------------- */

function loadStaffFromGoogleSheet() {

  const callbackName =
    "hifiStaffCallback";


  window[
    callbackName
  ] =
    function (response) {

      try {

        if (
          !response ||
          !response.success ||
          !Array.isArray(
            response.staff
          )
        ) {

          throw new Error(
            "Unable to load staff list."
          );

        }


        populateStaffDropdown(
          response.staff
        );


      } catch (error) {

        console.error(
          "Staff loading error:",
          error
        );


        showStaffLoadingError();

      }


      cleanupStaffScript();

    };


  const script =
    document.createElement(
      "script"
    );


  script.id =
    "hifi-staff-loader";


  script.src =
    GOOGLE_SCRIPT_URL +
    "?action=getStaff" +
    "&callback=" +
    callbackName +
    "&t=" +
    Date.now();


  script.onerror =
    function () {

      console.error(
        "Could not load staff list."
      );


      showStaffLoadingError();


      cleanupStaffScript();

    };


  document.body.appendChild(
    script
  );

}


/* ---------------------------------------------------------
   14. POPULATE STAFF DROPDOWN
   --------------------------------------------------------- */

function populateStaffDropdown(
  staffList
) {

  staffInput.innerHTML =
    "";


  const defaultOption =
    document.createElement(
      "option"
    );


  defaultOption.value =
    "";


  defaultOption.textContent =
    "Select staff member";


  staffInput.appendChild(
    defaultOption
  );


  staffList.forEach(
    function (staffName) {

      const option =
        document.createElement(
          "option"
        );


      option.value =
        staffName;


      option.textContent =
        staffName;


      staffInput.appendChild(
        option
      );

    }
  );

}


/* ---------------------------------------------------------
   15. STAFF LOADING ERROR
   --------------------------------------------------------- */

function showStaffLoadingError() {

  staffInput.innerHTML =
    "";


  const option =
    document.createElement(
      "option"
    );


  option.value =
    "";


  option.textContent =
    "Unable to load staff list";


  staffInput.appendChild(
    option
  );

}


/* ---------------------------------------------------------
   16. CLEANUP STAFF SCRIPT
   --------------------------------------------------------- */

function cleanupStaffScript() {

  const script =
    document.getElementById(
      "hifi-staff-loader"
    );


  if (script) {

    script.remove();

  }


  try {

    delete window.hifiStaffCallback;

  } catch (error) {

    window.hifiStaffCallback =
      undefined;

  }

}


/* ---------------------------------------------------------
   17. VALIDATE FORM
   --------------------------------------------------------- */

function validateForm() {

  clearAllErrors();


  let isValid =
    true;


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

  if (
    customerName === ""
  ) {

    showFieldError(
      "customerNameError",
      "Please enter the customer's name."
    );


    isValid =
      false;

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


    isValid =
      false;

  }


  /* Email */

  if (
    email !== ""
  ) {

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


    if (
      !emailPattern.test(
        email
      )
    ) {

      showFieldError(
        "emailError",
        "Please enter a valid email address."
      );


      isValid =
        false;

    }

  }


  /* Category */

  if (
    category === ""
  ) {

    showFieldError(
      "categoryError",
      "Please select a category."
    );


    isValid =
      false;

  } else if (
    !CATEGORIES.includes(
      category
    )
  ) {

    showFieldError(
      "categoryError",
      "Invalid category."
    );


    isValid =
      false;

  }


  /* Staff */

  if (
    selectedStaff === ""
  ) {

    showFieldError(
      "staffError",
      "Please select the staff member."
    );


    isValid =
      false;

  }


  /* Purchase status */

  if (
    purchaseStatus === ""
  ) {

    showFieldError(
      "purchaseStatusError",
      "Please select the purchase status."
    );


    isValid =
      false;

  }


  /* Follow-up date */

  const followUpDate =
    followUpDateInput.value;


  if (
    purchaseStatus ===
      "Follow-up Required" &&
    followUpDate === ""
  ) {

    statusMessage.textContent =
      "Please select a follow-up date.";

    statusMessage.className =
      "status-message error";


    isValid =
      false;

  }


  return isValid;

}


/* ---------------------------------------------------------
   18. SUBMIT BUTTON
   --------------------------------------------------------- */

submitButton.addEventListener(
  "click",
  async function () {

    statusMessage.textContent =
      "";


    statusMessage.className =
      "status-message";


    if (
      !validateForm()
    ) {

      if (
        statusMessage.textContent ===
        ""
      ) {

        statusMessage.textContent =
          "Please check the highlighted fields.";

      }


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
   19. SUBMIT WALK-IN
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
      .replace(
        /^@+/,
        ""
      );


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

        method:
          "POST",

        mode:
          "no-cors",

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
   20. SUCCESS CARD
   --------------------------------------------------------- */

function showSuccessCard() {

  formCard.style.display =
    "none";


  successSection.style.display =
    "block";


  populateCustomerCard();


  window.scrollTo({

    top:
      0,

    behavior:
      "smooth"

  });

}


/* ---------------------------------------------------------
   21. POPULATE CUSTOMER CARD
   --------------------------------------------------------- */

function populateCustomerCard() {

  if (
    !currentCustomer
  ) {

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
   22. FORMAT PHONE
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
    number.substring(
      0,
      5
    ) +
    " " +
    number.substring(
      5
    )
  );

}


/* ---------------------------------------------------------
   23. FORMAT DATE
   --------------------------------------------------------- */

function formatCurrentDate() {

  const now =
    new Date();


  return now
    .toLocaleDateString(
      "en-IN",
      {

        day:
          "2-digit",

        month:
          "long",

        year:
          "numeric"

      }
    )
    .toUpperCase();

}


/* ---------------------------------------------------------
   24. WHATSAPP
   --------------------------------------------------------- */

whatsappButton.addEventListener(
  "click",
  function () {

    if (
      !currentCustomer
    ) {

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
   25. NEW WALK-IN
   --------------------------------------------------------- */

newWalkInButton.addEventListener(
  "click",
  function () {

    resetForm();

  }
);


/* ---------------------------------------------------------
   26. RESET FORM
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

    top:
      0,

    behavior:
      "smooth"

  });


  customerNameInput.focus();

}


/* ---------------------------------------------------------
   27. INITIALIZE
   --------------------------------------------------------- */

updateRemoveButtons();

loadStaffFromGoogleSheet();
