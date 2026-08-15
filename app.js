/* =========================================================
   HIFI COLLECTION
   CUSTOMER WALK-IN CRM
   FRONTEND JAVASCRIPT
   ========================================================= */


/* ---------------------------------------------------------
   1. CONFIGURATION
   --------------------------------------------------------- */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz5plc1jea3LUySrbtfAR7sYuG6EPmvbejdChIsd7lNuPyjhkKbOrXPiP4COrZ_S7tp/exec";


const GOOGLE_CLIENT_ID =
  "857394054504-9qmrpnhkuicavag1mu96i9b8ko22p6qc.apps.googleusercontent.com";


const STORE_NAME =
  "Hifi Collection";


const COUNTRY_CODE =
  "+91";


/* ---------------------------------------------------------
   2. ALLOWED CATEGORIES
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
   3. DOM ELEMENTS
   --------------------------------------------------------- */

const loginSection =
  document.getElementById(
    "loginSection"
  );


const crmSection =
  document.getElementById(
    "crmSection"
  );


const googleSignInButton =
  document.getElementById(
    "googleSignInButton"
  );


const loginStatus =
  document.getElementById(
    "loginStatus"
  );


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
   4. STATE
   --------------------------------------------------------- */

let currentCustomer =
  null;


let googleCredential =
  null;


let loggedInGoogleEmail =
  null;


/* ---------------------------------------------------------
   5. GOOGLE SIGN-IN INITIALIZATION
   --------------------------------------------------------- */

function initializeGoogleSignIn() {

  if (
    typeof google === "undefined" ||
    !google.accounts ||
    !google.accounts.id
  ) {

    setTimeout(
      initializeGoogleSignIn,
      500
    );

    return;

  }


  if (
    !googleSignInButton
  ) {

    console.error(
      "Google Sign-In button container not found."
    );

    return;

  }


  google.accounts.id.initialize({

    client_id:
      GOOGLE_CLIENT_ID,

    callback:
      handleGoogleCredential,

    auto_select:
      false

  });


  googleSignInButton.innerHTML =
    "";


  google.accounts.id.renderButton(

    googleSignInButton,

    {

      theme:
        "outline",

      size:
        "large",

      text:
        "signin_with",

      shape:
        "rectangular",

      width:
        280

    }

  );


  console.log(
    "Google Sign-In initialized."
  );

}


/* ---------------------------------------------------------
   6. GOOGLE LOGIN CALLBACK
   --------------------------------------------------------- */

function handleGoogleCredential(
  response
) {

  console.log(
    "Google login successful. Verifying access..."
  );


  if (
    !response ||
    !response.credential
  ) {

    setLoginError(
      "Google sign-in did not return a valid credential."
    );

    return;

  }


  googleCredential =
    response.credential;


  setLoginLoading(
    "Verifying your access..."
  );


  authorizeWithBackend(
    googleCredential
  );

}


/* ---------------------------------------------------------
   7. AUTHORIZE GOOGLE USER WITH APPS SCRIPT
   --------------------------------------------------------- */

function authorizeWithBackend(
  credential
) {

  /*
   * We use JSONP here because the website is hosted
   * on GitHub Pages and the backend is Google Apps Script.
   *
   * The credential is sent to Apps Script.
   *
   * Apps Script:
   *
   * 1. Validates the Google ID token.
   * 2. Gets the verified Google email.
   * 3. Checks the Staff sheet.
   * 4. Checks Active = Yes.
   * 5. Returns authorized true/false.
   */


  const callbackName =
    "hifiAuthCallback_" +
    Date.now();


  window[
    callbackName
  ] =
    function (result) {

      try {

        console.log(
          "Authorization response:",
          result
        );


        if (
          !result
        ) {

          throw new Error(
            "No authorization response was received."
          );

        }


        if (
          result.success !== true
        ) {

          throw new Error(
            result.message ||
            "Unable to verify your Google account."
          );

        }


        if (
          result.authorized !== true
        ) {

          setLoginError(
            result.message ||
            "This Google account is not authorized to use the Hifi Collection CRM."
          );


          googleCredential =
            null;


          return;

        }


        /*
         * ACCESS GRANTED
         */

        loggedInGoogleEmail =
          result.email ||
          "";


        setLoginSuccess(
          "Access granted."
        );


        showCRM();


        /*
         * Load the latest staff list from the
         * Google Sheet after authentication.
         */

        loadStaffFromGoogleSheet();


      } catch (error) {

        console.error(
          "Authorization error:",
          error
        );


        setLoginError(
          error.message ||
          "Unable to verify your account."
        );

      } finally {

        cleanupAuthScript(
          callbackName
        );

      }

    };


  const script =
    document.createElement(
      "script"
    );


  script.id =
    "hifi-auth-loader";


  script.src =
    GOOGLE_SCRIPT_URL +
    "?action=authorize" +
    "&credential=" +
    encodeURIComponent(
      credential
    ) +
    "&callback=" +
    encodeURIComponent(
      callbackName
    ) +
    "&t=" +
    Date.now();


  script.onerror =
    function () {

      console.error(
        "Could not contact the authorization server."
      );


      setLoginError(
        "Could not verify your account. Please try again."
      );


      cleanupAuthScript(
        callbackName
      );

    };


  document.body.appendChild(
    script
  );

}


/* ---------------------------------------------------------
   8. CLEANUP AUTH SCRIPT
   --------------------------------------------------------- */

function cleanupAuthScript(
  callbackName
) {

  const script =
    document.getElementById(
      "hifi-auth-loader"
    );


  if (
    script
  ) {

    script.remove();

  }


  try {

    delete window[
      callbackName
    ];

  } catch (error) {

    window[
      callbackName
    ] =
      undefined;

  }

}


/* ---------------------------------------------------------
   9. LOGIN STATUS
   --------------------------------------------------------- */

function setLoginLoading(
  message
) {

  if (
    !loginStatus
  ) {

    return;

  }


  loginStatus.textContent =
    message;


  loginStatus.className =
    "login-status";

}


function setLoginError(
  message
) {

  if (
    !loginStatus
  ) {

    return;

  }


  loginStatus.textContent =
    message;


  loginStatus.className =
    "login-status error";

}


function setLoginSuccess(
  message
) {

  if (
    !loginStatus
  ) {

    return;

  }


  loginStatus.textContent =
    message;


  loginStatus.className =
    "login-status success";

}


/* ---------------------------------------------------------
   10. SHOW CRM
   --------------------------------------------------------- */

function showCRM() {

  if (
    loginSection
  ) {

    loginSection.style.display =
      "none";

  }


  if (
    crmSection
  ) {

    crmSection.style.display =
      "block";

  }


  window.scrollTo({

    top:
      0,

    behavior:
      "smooth"

  });


  setTimeout(
    function () {

      if (
        customerNameInput
      ) {

        customerNameInput.focus();

      }

    },
    300
  );

}


/* ---------------------------------------------------------
   11. PHONE NUMBER INPUT
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
   12. PREVENT INVALID PHONE KEYS
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
   13. ADD PRODUCT
   --------------------------------------------------------- */

addProductButton.addEventListener(
  "click",
  function () {

    createProductRow();

  }
);


/* ---------------------------------------------------------
   14. CREATE PRODUCT ROW
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
   15. UPDATE PRODUCT REMOVE BUTTONS
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
   16. GET PRODUCT CODES
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
   17. ERROR HELPERS
   --------------------------------------------------------- */

function showFieldError(
  errorId,
  message
) {

  const element =
    document.getElementById(
      errorId
    );


  if (
    element
  ) {

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


  if (
    element
  ) {

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
   18. LOAD STAFF FROM GOOGLE SHEET
   --------------------------------------------------------- */

function loadStaffFromGoogleSheet() {

  const callbackName =
    "hifiStaffCallback_" +
    Date.now();


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


      cleanupStaffScript(
        callbackName
      );

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
    encodeURIComponent(
      callbackName
    ) +
    "&t=" +
    Date.now();


  script.onerror =
    function () {

      console.error(
        "Could not load staff list."
      );


      showStaffLoadingError();


      cleanupStaffScript(
        callbackName
      );

    };


  document.body.appendChild(
    script
  );

}


/* ---------------------------------------------------------
   19. POPULATE STAFF DROPDOWN
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
   20. STAFF LOADING ERROR
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
   21. CLEANUP STAFF SCRIPT
   --------------------------------------------------------- */

function cleanupStaffScript(
  callbackName
) {

  const script =
    document.getElementById(
      "hifi-staff-loader"
    );


  if (
    script
  ) {

    script.remove();

  }


  try {

    delete window[
      callbackName
    ];

  } catch (error) {

    window[
      callbackName
    ] =
      undefined;

  }

}


/* ---------------------------------------------------------
   22. VALIDATE FORM
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
   23. SUBMIT BUTTON
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


    await submitWalkIn();

  }
);


/* ---------------------------------------------------------
   24. SUBMIT WALK-IN
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


  /*
   * IMPORTANT:
   *
   * Staff Attended remains a MANUAL selection.
   *
   * It is NOT based on the Google account that
   * is currently logged in.
   */

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
   25. SUCCESS CARD
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
   26. POPULATE CUSTOMER CARD
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
   27. FORMAT PHONE
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
   28. FORMAT DATE
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
   29. WHATSAPP
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
      STORE_NAME +
      " today. " +
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
      "\n\n— " +
      STORE_NAME;


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
   30. NEW WALK-IN
   --------------------------------------------------------- */

newWalkInButton.addEventListener(
  "click",
  function () {

    resetForm();

  }
);


/* ---------------------------------------------------------
   31. RESET FORM
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


  /*
   * Staff remains manually selected.
   */

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
   32. INITIALIZE
   --------------------------------------------------------- */

updateRemoveButtons();

initializeGoogleSignIn();
