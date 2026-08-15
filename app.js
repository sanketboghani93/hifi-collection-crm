/* =========================================================
   HIFI COLLECTION
   CUSTOMER WALK-IN CRM
   APP.JS
   ========================================================= */


/* ---------------------------------------------------------
   CONFIG
   --------------------------------------------------------- */

const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz5plc1jea3LUySrbtfAR7sYuG6EPmvbejdChIsd7lNuPyjhkKbOrXPiP4COrZ_S7tp/exec";

const GOOGLE_CLIENT_ID =
  "857394054504-9qmrpnhkuicavag1mu96i9b8ko22p6qc.apps.googleusercontent.com";

const STORE_NAME =
  "Hifi Collection";

const COUNTRY_CODE =
  "+91";


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
   DOM
   --------------------------------------------------------- */

const loginSection =
  document.getElementById("loginSection");

const crmSection =
  document.getElementById("crmSection");

const googleSignInButton =
  document.getElementById("googleSignInButton");

const loginStatus =
  document.getElementById("loginStatus");

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

const eventDateInput =
  document.getElementById("eventDate");

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

const customerCard =
  document.getElementById("customerCard");

const newWalkInButton =
  document.getElementById("newWalkIn");

const whatsappButton =
  document.getElementById("whatsappButton");

const shareCardButton =
  document.getElementById("shareCardButton");

const shareStatus =
  document.getElementById("shareStatus");


/* ---------------------------------------------------------
   STATE
   --------------------------------------------------------- */

let currentCustomer = null;

let googleCredential = null;

let loggedInGoogleEmail = null;


/* =========================================================
   GOOGLE LOGIN
   ========================================================= */

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


  if (!googleSignInButton) {
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


  googleSignInButton.innerHTML = "";


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

}


function handleGoogleCredential(
  response
) {

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


function authorizeWithBackend(
  credential
) {

  const callbackName =
    "hifiAuthCallback_" +
    Date.now();


  window[callbackName] =
    function(result) {

      try {

        if (!result) {

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

          googleCredential = null;

          return;

        }


        loggedInGoogleEmail =
          result.email || "";


        setLoginSuccess(
          "Access granted."
        );


        showCRM();


        loadStaffFromGoogleSheet();


      } catch(error) {

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
    document.createElement("script");


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
    function() {

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


function cleanupAuthScript(
  callbackName
) {

  const script =
    document.getElementById(
      "hifi-auth-loader"
    );


  if (script) {
    script.remove();
  }


  try {

    delete window[
      callbackName
    ];

  } catch(error) {

    window[
      callbackName
    ] = undefined;

  }

}


function setLoginLoading(
  message
) {

  if (!loginStatus) {
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

  if (!loginStatus) {
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

  if (!loginStatus) {
    return;
  }


  loginStatus.textContent =
    message;

  loginStatus.className =
    "login-status success";

}


function showCRM() {

  if (loginSection) {

    loginSection.style.display =
      "none";

  }


  if (crmSection) {

    crmSection.style.display =
      "block";

  }


  window.scrollTo({

    top: 0,

    behavior: "smooth"

  });

}


/* =========================================================
   PHONE VALIDATION
   ========================================================= */

contactNumberInput.addEventListener(
  "input",
  function() {

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


contactNumberInput.addEventListener(
  "keydown",
  function(event) {

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


/* =========================================================
   PRODUCTS
   ========================================================= */

addProductButton.addEventListener(
  "click",
  function() {

    createProductRow();

  }
);


function createProductRow(
  value = ""
) {

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
    function() {

      row.remove();

      updateRemoveButtons();

    }
  );


  row.appendChild(input);

  row.appendChild(
    removeButton
  );

  productsContainer.appendChild(
    row
  );


  updateRemoveButtons();


  input.focus();

}


function updateRemoveButtons() {

  const rows =
    productsContainer.querySelectorAll(
      ".product-row"
    );


  rows.forEach(
    function(row) {

      const button =
        row.querySelector(
          ".remove-product"
        );


      button.style.display =
        rows.length === 1
          ? "none"
          : "block";

    }
  );

}


function getProducts() {

  const inputs =
    productsContainer.querySelectorAll(
      ".product-code"
    );


  const products = [];


  inputs.forEach(
    function(input) {

      const value =
        input.value.trim();


      if (value !== "") {

        products.push(
          value
        );

      }

    }
  );


  return products;

}


/* =========================================================
   ERRORS
   ========================================================= */

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

  document
    .querySelectorAll(
      ".field-error"
    )
    .forEach(
      function(error) {

        error.textContent =
          "";

      }
    );

}


/* =========================================================
   STAFF
   ========================================================= */

function loadStaffFromGoogleSheet() {

  const callbackName =
    "hifiStaffCallback_" +
    Date.now();


  window[callbackName] =
    function(response) {

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


      } catch(error) {

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
    function() {

      showStaffLoadingError();

      cleanupStaffScript(
        callbackName
      );

    };


  document.body.appendChild(
    script
  );

}


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
    function(staffName) {

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


function cleanupStaffScript(
  callbackName
) {

  const script =
    document.getElementById(
      "hifi-staff-loader"
    );


  if (script) {
    script.remove();
  }


  try {

    delete window[
      callbackName
    ];

  } catch(error) {

    window[
      callbackName
    ] = undefined;

  }

}


/* =========================================================
   VALIDATION
   ========================================================= */

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


  if (!customerName) {

    showFieldError(
      "customerNameError",
      "Please enter the customer's name."
    );

    isValid = false;

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

    isValid = false;

  }


  if (email) {

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

      isValid = false;

    }

  }


  if (!category) {

    showFieldError(
      "categoryError",
      "Please select a category."
    );

    isValid = false;

  } else if (
    !CATEGORIES.includes(
      category
    )
  ) {

    showFieldError(
      "categoryError",
      "Invalid category."
    );

    isValid = false;

  }


  if (!selectedStaff) {

    showFieldError(
      "staffError",
      "Please select the staff member."
    );

    isValid = false;

  }


  if (!purchaseStatus) {

    showFieldError(
      "purchaseStatusError",
      "Please select the purchase status."
    );

    isValid = false;

  }


  /*
   * Event Date remains optional.
   */

  return isValid;

}


/* =========================================================
   SUBMIT
   ========================================================= */

submitButton.addEventListener(
  "click",
  async function() {

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


    await submitWalkIn();

  }
);


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


  const eventDate =
    eventDateInput.value;


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

    eventDate:
      eventDate,

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

            eventDate:
              eventDate,

            notes:
              notes

          })

      }

    );


    showSuccessCard();


  } catch(error) {

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


/* =========================================================
   CUSTOMER CARD
   ========================================================= */

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
    formatVisitDate(
      new Date()
    );


  document.getElementById(
    "cardCategory"
  ).textContent =
    currentCustomer.category;


  document.getElementById(
    "cardPurchaseStatus"
  ).textContent =
    currentCustomer.purchaseStatus;


  document.getElementById(
    "cardEventDate"
  ).textContent =
    currentCustomer.eventDate
      ? formatEventDate(
          currentCustomer.eventDate
        )
      : "Not specified";


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
      function(product) {

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


/* =========================================================
   DATE / PHONE FORMATTING
   ========================================================= */

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


function formatVisitDate(
  date
) {

  return date.toLocaleDateString(

    "en-IN",

    {

      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric"

    }

  ).toUpperCase();

}


function formatEventDate(
  dateValue
) {

  if (!dateValue) {
    return "";
  }


  const parts =
    dateValue.split("-");


  if (
    parts.length !== 3
  ) {

    return dateValue;

  }


  const date =
    new Date(

      Number(parts[0]),

      Number(parts[1]) - 1,

      Number(parts[2])

    );


  return date.toLocaleDateString(

    "en-IN",

    {

      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric"

    }

  ).toUpperCase();

}


/* =========================================================
   WHATSAPP MESSAGE
   ========================================================= */

whatsappButton.addEventListener(
  "click",
  function() {

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

      STORE_NAME +

      " today. " +

      "It was a pleasure assisting you.";


    message +=

      "\n\nInterested in: " +

      currentCustomer.category;


    if (
      currentCustomer.products.length > 0
    ) {

      message +=
        "\n\nShortlisted products:";


      currentCustomer.products.forEach(
        function(product) {

          message +=
            "\n• " +
            product;

        }
      );

    }


    if (
      currentCustomer.eventDate
    ) {

      message +=

        "\n\nEvent Date: " +

        formatEventDate(
          currentCustomer.eventDate
        );

    }


    message +=

      "\n\nWear. Flaunt. Return." +

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


/* =========================================================
   SHARE VISIT CARD
   ========================================================= */

shareCardButton.addEventListener(
  "click",
  shareVisitCard
);


async function shareVisitCard() {

  if (!currentCustomer) {
    return;
  }


  shareCardButton.disabled =
    true;


  shareStatus.textContent =
    "Preparing your Hifi Collection card...";


  try {

    /*
     * Wait briefly so the browser has finished
     * rendering the card and logo.
     */

    await wait(150);


    if (
      typeof html2canvas ===
      "undefined"
    ) {

      throw new Error(
        "Card image engine is not available."
      );

    }


    const canvas =
      await html2canvas(

        customerCard,

        {

          scale:
            2.5,

          useCORS:
            true,

          backgroundColor:
            "#faf5e9",

          logging:
            false

        }

      );


    const blob =
      await canvasToBlob(
        canvas
      );


    const file =
      new File(

        [blob],

        createCardFileName(),

        {

          type:
            "image/png"

        }

      );


    /*
     * Modern phones:
     * use the native share sheet.
     */

    if (
      navigator.share &&
      navigator.canShare &&
      navigator.canShare({
        files: [file]
      })
    ) {

      await navigator.share({

        title:
          "Hifi Collection — Customer Visit",

        text:
          createShareText(),

        files:
          [file]

      });


      shareStatus.textContent =
        "Card ready to share.";

      return;

    }


    /*
     * If native file sharing is not supported,
     * download the card.
     */

    downloadCard(
      blob
    );


    shareStatus.textContent =
      "Your card was downloaded. You can now share it on WhatsApp.";

  } catch(error) {

    /*
     * AbortError means the user simply closed
     * the native share sheet.
     */

    if (
      error &&
      error.name ===
        "AbortError"
    ) {

      shareStatus.textContent =
        "";

      return;

    }


    console.error(
      "Card sharing error:",
      error
    );


    shareStatus.textContent =
      "Unable to share automatically. Please try again.";

  } finally {

    shareCardButton.disabled =
      false;

  }

}


/* ---------------------------------------------------------
   SHARE HELPERS
   --------------------------------------------------------- */

function wait(
  milliseconds
) {

  return new Promise(
    function(resolve) {

      setTimeout(
        resolve,
        milliseconds
      );

    }
  );

}


function canvasToBlob(
  canvas
) {

  return new Promise(
    function(resolve, reject) {

      canvas.toBlob(

        function(blob) {

          if (blob) {

            resolve(blob);

          } else {

            reject(
              new Error(
                "Could not create card image."
              )
            );

          }

        },

        "image/png",

        1

      );

    }
  );

}


function createCardFileName() {

  const safeName =
    currentCustomer.customerName

      .replace(
        /[^a-z0-9]+/gi,
        "-"
      )

      .replace(
        /^-|-$/g,
        ""
      )

      .toLowerCase();


  return (

    "hifi-collection-" +

    (safeName ||
      "customer") +

    "-visit-card.png"

  );

}


function createShareText() {

  let text =

    "Hifi Collection — Customer Visit" +

    "\n\n" +

    currentCustomer.customerName +

    "\n" +

    currentCustomer.category;


  if (
    currentCustomer.eventDate
  ) {

    text +=

      "\nEvent Date: " +

      formatEventDate(
        currentCustomer.eventDate
      );

  }


  text +=

    "\n\nWear. Flaunt. Return.";


  return text;

}


function downloadCard(
  blob
) {

  const url =
    URL.createObjectURL(
      blob
    );


  const link =
    document.createElement(
      "a"
    );


  link.href =
    url;


  link.download =
    createCardFileName();


  document.body.appendChild(
    link
  );


  link.click();


  link.remove();


  setTimeout(
    function() {

      URL.revokeObjectURL(
        url
      );

    },
    1000
  );

}


/* =========================================================
   NEW WALK-IN
   ========================================================= */

newWalkInButton.addEventListener(
  "click",
  resetForm
);


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

  eventDateInput.value =
    "";

  notesInput.value =
    "";


  clearAllErrors();


  statusMessage.textContent =
    "";

  shareStatus.textContent =
    "";


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


/* =========================================================
   INITIALIZE
   ========================================================= */

updateRemoveButtons();

initializeGoogleSignIn();
