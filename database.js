// database.js

// Import specific Firestore functions needed for database operations.
// These are not exposed via 'window' in index.html's module, so import directly here.
// Note: If you were to use these functions like window.fsCollection, you would not need these imports.
// But to keep database.js self-contained for database operations, it's better to import them here.
import { collection, addDoc, deleteDoc, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";


// --- GLOBAL DATA STORES (specific to database.js) ---
export let allRecords = []; // Records fetched from Firestore for display
export let allWebhooks = []; // Webhooks fetched from Firestore for display

// --- DATABASE SERVICE FUNCTIONS (Exported for use in index.html) ---

/**
 * Fetches records and webhooks from Firestore in real-time.
 * It uses global window.db, window.currentUserId, and collection paths.
 * It also calls globally available UI functions like showMessageBox, hideMessageBox,
 * and rendering functions that are expected to be available in the main script.
 */
export async function fetchRecordsAndWebhooks() {
    // Get elements inside the function to ensure DOM is loaded and current
    const recordsTableBody = document.getElementById('recordsTableBody'); 
    const deleteSelectedRecordsBtn = document.getElementById('deleteSelectedRecordsBtn');
    const selectAllRecordsCheckbox = document.getElementById('selectAllRecordsCheckbox');
    const newWebhookUrlInput = document.getElementById('newWebhookUrlInput');
    const addWebhookBtn = document.getElementById('addWebhookBtn');
    const webhookList = document.getElementById('webhookList');

    if (!window.db || !window.currentUserId) {
        window.showMessageBox("Error", "Database not ready. Please log in first.", true, false, true);
        return;
    }

    if (!window.EVALUATION_RECORDS_COLLECTION_PATH || !window.WEBHOOKS_COLLECTION_PATH) {
        console.error("Firestore collection paths are not defined. Firebase initialization might be incomplete.");
        window.showMessageBox("Initialization Error", "Firestore paths not set up. Check Firebase configuration.", true, false, true);
        return;
    }
    
    // Unsubscribe previous listeners to prevent duplicates if function called multiple times
    if (window.unsubscribeRecords) window.unsubscribeRecords(); // Access global unsubscribe
    if (window.unsubscribeWebhooks) window.unsubscribeWebhooks(); // Access global unsubscribe
    
    window.showMessageBox("Loading Data", "Fetching records and webhooks...", false, true, false);

    try {
        const recordsColRef = collection(window.db, window.EVALUATION_RECORDS_COLLECTION_PATH); 
        window.unsubscribeRecords = onSnapshot(recordsColRef, (snapshot) => { 
            allRecords = [];
            snapshot.forEach(doc => { 
                allRecords.push({ id: doc.id, ...doc.data() });
            });
            console.log("Records updated:", allRecords.length, "records.");
            renderRecordsTable(allRecords); // Call internal rendering function
            window.hideMessageBox(); // Access global hide message box
        }, (error) => {
            console.error("Error listening to records:", error);
            window.showMessageBox("Error Loading Records", `Could not load records: ${error.message}`, true, false, true);
        });

        const webhooksColRef = collection(window.db, window.WEBHOOKS_COLLECTION_PATH); 
        window.unsubscribeWebhooks = onSnapshot(webhooksColRef, (snapshot) => { 
            allWebhooks = [];
            snapshot.forEach(doc => { 
                allWebhooks.push({ id: doc.id, ...doc.data() });
            });
            console.log("Webhooks updated:", allWebhooks.length, "webhooks.");
            renderWebhookList(allWebhooks); // Call internal rendering function
            window.hideMessageBox(); // Access global hide message box
        }, (error) => {
            console.error("Error listening to webhooks:", error);
            window.showMessageBox("Error Loading Webhooks", `Could not load webhooks: ${error.message}`, true, false, true);
        });

    } catch (error) {
        console.error("Error setting up Firestore listeners:", error);
        window.showMessageBox("Initialization Error", `Failed to setup database listeners: ${error.message}`, true, false, true);
    }
}

/**
 * Adds a new evaluation record to Firestore.
 */
export async function addRecordToFirestore(recordData) {
    if (!window.db || !window.currentUserId) {
        window.showMessageBox("Error", "Database not ready. Please log in first.", true, false, true);
        return false;
    }
    if (!window.EVALUATION_RECORDS_COLLECTION_PATH) {
        console.error("Firestore collection path for records is not defined.");
        window.showMessageBox("Error", "Records path not set up. Check Firebase configuration.", true, false, true);
        return false;
    }

    window.showMessageBox("Submitting", "Saving record to database...", false, true, false);
    try {
        const docRef = await addDoc(collection(window.db, window.EVALUATION_RECORDS_COLLECTION_PATH), { 
            ...recordData,
            submittedAt: new Date().toISOString() // Add a server timestamp
        });
        console.log("Record written with ID:", docRef.id);
        window.showMessageBox("Success", "Form data submitted successfully to database!", false, false, true, () => {
            window.resetForm(); // Call global reset form
            sendDataToWebhooks(recordData); // Call internal webhook sender
        });
        return true;
    } catch (e) {
        console.error("Error adding document: ", e);
        window.showMessageBox("Submission Failed", `Error saving data: ${e.message}`, true, false, true);
        return false;
    }
}

/**
 * Deletes selected records from Firestore.
 */
export async function deleteSelectedRecords() {
    // Get elements inside the function to ensure DOM is loaded and current
    const messageBoxContent = document.getElementById('messageBoxContent');
    const deleteSelectedRecordsBtn = document.getElementById('deleteSelectedRecordsBtn'); // Access here
    const selectAllRecordsCheckbox = document.getElementById('selectAllRecordsCheckbox'); // Access here

    if (!window.db || !window.currentUserId) {
        window.showMessageBox("Error", "Database not ready. Please log in first.", true, false, true);
        return;
    }
    if (!window.EVALUATION_RECORDS_COLLECTION_PATH) {
        console.error("Firestore collection path for records is not defined for deletion.");
        window.showMessageBox("Error", "Records path not set up. Check Firebase configuration.", true, false, true);
        return;
    }

    const selectedCheckboxes = document.querySelectorAll('.record-checkbox:checked');
    const recordIdsToDelete = Array.from(selectedCheckboxes).map(cb => cb.dataset.recordId);

    if (recordIdsToDelete.length === 0) {
        window.showMessageBox("No Records Selected", "Please select at least one record to delete.", false, false, true);
        return;
    }

    const originalMessageBoxContentHTML = messageBoxContent.innerHTML;

    window.showMessageBox("Confirm Deletion", `Are you sure you want to delete ${recordIdsToDelete.length} selected record(s)?`, false, false, false);
    
    const confirmDeleteBtn = document.createElement('button');
    confirmDeleteBtn.textContent = 'Delete';
    confirmDeleteBtn.className = 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md mr-2';
    confirmDeleteBtn.onclick = async () => {
        window.hideMessageBox();
        window.showMessageBox("Deleting", "Deleting selected records...", false, true, false);
        try {
            const deletePromises = recordIdsToDelete.map(id => deleteDoc(doc(window.db, window.EVALUATION_RECORDS_COLLECTION_PATH, id)));
            await Promise.all(deletePromises);
            console.log("Selected records deleted successfully.");
            window.showMessageBox("Success", "Selected records deleted.", false, false, true);
            selectAllRecordsCheckbox.checked = false; // Uncheck select all
            updateDeleteButtonState(); // Call internal state update
        } catch (e) {
            console.error("Error deleting documents: ", e);
            window.showMessageBox("Deletion Failed", `Error deleting records: ${e.message}`, true, false, true);
        } finally {
            messageBoxContent.innerHTML = originalMessageBoxContentHTML;
        }
    };

    const cancelDeleteBtn = document.createElement('button');
    cancelDeleteBtn.textContent = 'Cancel';
    cancelDeleteBtn.className = 'bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md';
    cancelDeleteBtn.onclick = () => {
        window.hideMessageBox();
        messageBoxContent.innerHTML = originalMessageBoxContentHTML;
    };

    messageBoxContent.innerHTML = '';
    messageBoxContent.appendChild(confirmDeleteBtn);
    messageBoxContent.appendChild(cancelDeleteBtn);
    
    // Re-assign messageBoxCloseBtn onclick to ensure cleanup
    const messageBoxCloseBtn = document.getElementById('messageBoxCloseBtn');
    messageBoxCloseBtn.onclick = () => {
        window.hideMessageBox();
        messageBoxContent.innerHTML = originalMessageBoxContentHTML;
    };
}

/**
 * Adds a new webhook URL to Firestore.
 */
export async function addWebhook() {
    // Get elements inside the function to ensure DOM is loaded and current
    const newWebhookUrlInput = document.getElementById('newWebhookUrlInput'); // Access here

    if (!window.db || !window.currentUserId) {
        window.showMessageBox("Error", "Database not ready. Please log in first.", true, false, true);
        return;
    }
    if (!window.WEBHOOKS_COLLECTION_PATH) {
        console.error("Firestore collection path for webhooks is not defined.");
        window.showMessageBox("Error", "Webhooks path not set up. Check Firebase configuration.", true, false, true);
        return;
    }
    
    const webhookUrl = newWebhookUrlInput.value.trim();
    if (!webhookUrl) {
        window.showMessageBox("Invalid URL", "Please enter a valid webhook URL.", true, false, true);
        return;
    }
    if (!webhookUrl.startsWith('http://') && !webhookUrl.startsWith('https://')) {
        window.showMessageBox("Invalid URL", "Webhook URL must start with http:// or https://", true, false, true);
        return;
    }
    if (allWebhooks.some(hook => hook.url === webhookUrl)) { // Uses global allWebhooks
        window.showMessageBox("Duplicate URL", "This webhook URL is already added.", false, false, true);
        newWebhookUrlInput.value = '';
        return;
    }

    window.showMessageBox("Adding Webhook", "Adding new webhook...", false, true, false);
    try {
        await addDoc(collection(window.db, window.WEBHOOKS_COLLECTION_PATH), { url: webhookUrl });
        newWebhookUrlInput.value = '';
        window.showMessageBox("Success", "Webhook added successfully!", false, false, true);
    } catch (e) {
        console.error("Error adding webhook: ", e);
        window.showMessageBox("Failed to Add Webhook", `Error: ${e.message}`, true, false, true);
    }
}

/**
 * Deletes a specific webhook from Firestore.
 */
export async function deleteWebhook(webhookId) {
    if (!window.db || !window.currentUserId) {
        window.showMessageBox("Error", "Database not ready. Please log in first.", true, false, true);
        return;
    }
    if (!window.WEBHOOKS_COLLECTION_PATH) {
        console.error("Firestore collection path for webhooks is not defined for deletion.");
        window.showMessageBox("Error", "Webhooks path not set up. Check Firebase configuration.", true, false, true);
        return;
    }
    window.showMessageBox("Deleting Webhook", "Removing webhook...", false, true, false);
    try {
        await deleteDoc(doc(window.db, window.WEBHOOKS_COLLECTION_PATH, webhookId));
        window.showMessageBox("Success", "Webhook deleted successfully!", false, false, true);
    } catch (e) {
        console.error("Error deleting webhook: ", e);
        window.showMessageBox("Failed to Delete Webhook", `Error: ${e.message}`, true, false, true);
    }
}

/**
 * Sends record data to all configured webhooks.
 */
export async function sendDataToWebhooks(recordData) {
    if (allWebhooks.length === 0) {
        console.log("No webhooks configured. Skipping webhook dispatch.");
        return;
    }
    console.log(`Sending data to ${allWebhooks.length} webhook(s)...`);
    const webhookPromises = allWebhooks.map(async (webhook) => {
        try {
            const response = await fetch(webhook.url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(recordData)
            });
            const result = await response.text();
            console.log(`Webhook to ${webhook.url} response:`, response.status, result);
            if (!response.ok) {
                console.error(`Webhook to ${webhook.url} failed: ${response.status} - ${result}`);
            }
        } catch (error) {
            console.error(`Error sending to webhook ${webhook.url}:`, error);
        }
    });
    await Promise.allSettled(webhookPromises);
    console.log("All webhook dispatches attempted.");
}

// --- INTERNAL RENDERING & UI STATE FUNCTIONS (Used by database.js) ---

/**
 * Renders the evaluation records table.
 */
function renderRecordsTable(records) {
    const recordsTableBody = document.getElementById('recordsTableBody');
    const deleteSelectedRecordsBtn = document.getElementById('deleteSelectedRecordsBtn');
    const selectAllRecordsCheckbox = document.getElementById('selectAllRecordsCheckbox');

    recordsTableBody.innerHTML = '';
    if (records.length === 0) {
        recordsTableBody.innerHTML = `
            <tr>
                <td colspan="7" class="text-center py-4 text-gray-500">No records found. Submit a form to see data here.</td>
            </tr>
        `;
        deleteSelectedRecordsBtn.disabled = true;
        selectAllRecordsCheckbox.checked = false;
        selectAllRecordsCheckbox.disabled = true;
        return;
    }

    selectAllRecordsCheckbox.disabled = false;

    records.forEach(record => {
        const row = recordsTableBody.insertRow();
        row.className = 'border-b border-gray-200';
        row.insertCell().innerHTML = `<input type="checkbox" class="record-checkbox" data-record-id="${record.id}">`;
        row.insertCell().textContent = record.submittedAt ? new Date(record.submittedAt).toLocaleString() : 'N/A';
        row.insertCell().textContent = record['Contact ID'] || '';
        row.insertCell().textContent = record['Client Name'] || '';
        row.insertCell().textContent = record['CER Name'] || '';
        row.insertCell().textContent = record['Overall Score'] || '';
        row.insertCell().innerHTML = `
            <button class="delete-record-btn" data-record-id="${record.id}">Delete</button>
        `;
    });

    document.querySelectorAll('.record-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', updateDeleteButtonState);
    });
    document.querySelectorAll('.delete-record-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const recordId = e.target.dataset.recordId;
            const messageBoxContent = document.getElementById('messageBoxContent');
            const originalMessageBoxContentHTML = messageBoxContent.innerHTML; // Store original content

            window.showMessageBox("Confirm Delete", "Are you sure you want to delete this record?", false, false, false);
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Delete';
            confirmBtn.className = 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md mr-2';
            confirmBtn.onclick = async () => {
                window.hideMessageBox();
                window.showMessageBox("Deleting", "Deleting record...", false, true, false);
                try {
                    await deleteDoc(doc(window.db, window.EVALUATION_RECORDS_COLLECTION_PATH, recordId));
                    window.showMessageBox("Success", "Record deleted successfully.", false, false, true);
                } catch (error) {
                    window.showMessageBox("Deletion Failed", `Error: ${error.message}`, true, false, true);
                } finally {
                    messageBoxContent.innerHTML = originalMessageBoxContentHTML;
                }
            };
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.className = 'bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md';
            cancelBtn.onclick = () => {
                window.hideMessageBox();
                messageBoxContent.innerHTML = originalMessageBoxContentHTML;
            };

            messageBoxContent.innerHTML = '';
            messageBoxContent.appendChild(confirmBtn);
            messageBoxContent.appendChild(cancelBtn);

            const messageBoxCloseBtn = document.getElementById('messageBoxCloseBtn');
            messageBoxCloseBtn.onclick = () => {
                window.hideMessageBox();
                messageBoxContent.innerHTML = originalMessageBoxContentHTML;
            };
        });
    });

    updateDeleteButtonState();
}

/**
 * Updates the state of the "Delete Selected" button.
 */
function updateDeleteButtonState() {
    const deleteSelectedRecordsBtn = document.getElementById('deleteSelectedRecordsBtn');
    const checkedCount = document.querySelectorAll('.record-checkbox:checked').length;
    deleteSelectedRecordsBtn.disabled = checkedCount === 0;
}

/**
 * Renders the list of configured webhooks.
 */
function renderWebhookList(webhooks) {
    const webhookList = document.getElementById('webhookList');
    webhookList.innerHTML = '';
    if (webhooks.length === 0) {
        webhookList.innerHTML = '<p class="text-sm text-gray-500 text-center">No webhooks added yet.</p>';
        return;
    }

    webhooks.forEach(hook => {
        const webhookDiv = document.createElement('div');
        webhookDiv.innerHTML = `
            <span>${hook.url}</span>
            <button class="delete-webhook-btn bg-red-400 hover:bg-red-500 text-white p-1 rounded-md text-xs" data-webhook-id="${hook.id}">
                <i class="fas fa-times"></i> Delete
            </button>
        `;
        webhookList.appendChild(webhookDiv);
    });

    document.querySelectorAll('.delete-webhook-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const webhookId = e.target.closest('button').dataset.webhookId;
            const messageBoxContent = document.getElementById('messageBoxContent');
            const originalMessageBoxContentHTML = messageBoxContent.innerHTML;

            window.showMessageBox("Confirm Delete", "Are you sure you want to delete this webhook?", false, false, false);
            const confirmBtn = document.createElement('button');
            confirmBtn.textContent = 'Delete';
            confirmBtn.className = 'bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md mr-2';
            confirmBtn.onclick = async () => {
                window.hideMessageBox();
                window.showMessageBox("Deleting", "Deleting webhook...", false, true, false);
                await deleteWebhook(webhookId); // Call external deleteWebhook
                window.hideMessageBox();
            };
            const cancelBtn = document.createElement('button');
            cancelBtn.textContent = 'Cancel';
            cancelBtn.className = 'bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md';
            cancelBtn.onclick = () => {
                window.hideMessageBox();
                messageBoxContent.innerHTML = originalMessageBoxContentHTML;
            };

            messageBoxContent.innerHTML = '';
            messageBoxContent.appendChild(confirmBtn);
            messageBoxContent.appendChild(cancelBtn);

            const messageBoxCloseBtn = document.getElementById('messageBoxCloseBtn');
            messageBoxCloseBtn.onclick = () => {
                window.hideMessageBox();
                messageBoxContent.innerHTML = originalMessageBoxContentHTML;
            };
        });
    });
}


        // --- DOMContentLoaded Listener (attaches event handlers, makes initial calls) ---
        document.addEventListener('DOMContentLoaded', function() {
            console.log("DOM fully loaded and parsed. Main script starting.");

            // --- Get Firebase objects and functions from window ---
            // These variables will now correctly receive the Firebase instances and functions
            // once they are initialized and exposed by the module script.
            let db = window.db; 
            let auth = window.auth;
            let currentUserId = window.currentUserId;
            let isAuthReady = window.isAuthReady; 


            // Collection paths (These need to be obtained from window)
            const EVALUATION_RECORDS_COLLECTION_PATH = window.EVALUATION_RECORDS_COLLECTION_PATH;
            const WEBHOOKS_COLLECTION_PATH = window.WEBHOOKS_COLLECTION_PATH;


            // --- UI Elements (Get references to DOM elements here) ---
            const loginForm = document.getElementById('loginForm');
            const loginMessage = document.getElementById('loginMessage');
            const usernameInput = document.getElementById('username');
            const passwordInput = document.getElementById('password');

            const auditFormTab = document.getElementById('auditFormTab');
            const databaseTab = document.getElementById('databaseTab');
            const logoutBtn = document.getElementById('logoutBtn');

            const submitFormToDBBtn = document.getElementById('submitFormToDBBtn');
            const printEmailBtn = document.getElementById('print-email-btn');
            const assessmentForm = document.getElementById('assessment-form');

            const reviewerNameSelect = document.getElementById('reviewer-name');
            const otherReviewerNameInput = document.getElementById('other-reviewer-name');
            const cerRoleSelect = document.getElementById('cer-role');

            const selectAllRecordsCheckbox = document.getElementById('selectAllRecordsCheckbox');
            const deleteSelectedRecordsBtn = document.getElementById('deleteSelectedRecordsBtn');

            const newWebhookUrlInput = document.getElementById('newWebhookUrlInput');
            const addWebhookBtn = document.getElementById('addWebhookBtn');

            // --- EVENT LISTENERS (Attach to DOM elements) ---
            loginForm.addEventListener('submit', function(event) {
                event.preventDefault();
                loginMessage.classList.add('hidden');

                const CORRECT_USERNAME = 'Supervisor';
                const CORRECT_PASSWORD = 'Supervisor';

                if (usernameInput.value === CORRECT_USERNAME && passwordInput.value === CORRECT_PASSWORD) {
                    sessionStorage.setItem('loggedIn', 'true');
                    initializeApp(); // Calls the top-level initializeApp
                } else {
                    loginMessage.textContent = 'Invalid Username or Password. Please try again.';
                    loginMessage.classList.remove('hidden');
                }
            });

            logoutBtn.addEventListener('click', function() {
                sessionStorage.removeItem('loggedIn');
                // Unsubscribe Firestore listeners on logout to prevent memory leaks
                if (unsubscribeRecords) unsubscribeRecords();
                if (unsubscribeWebhooks) unsubscribeWebhooks();
                window.location.reload(); // Reload to show login page
            });

            // Diagnostic log for tab elements
            console.log("Audit Form Tab Element:", auditFormTab);
            console.log("Database Tab Element:", databaseTab);

            // Attaching tab click listeners
            if (auditFormTab) {
                auditFormTab.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log("Audit Form Tab CLICKED!"); // Diagnostic log
                    showTab('auditForm');
                });
            } else {
                console.error("Audit Form Tab element not found!");
            }
            
            if (databaseTab) {
                databaseTab.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log("Database Tab CLICKED!"); // Diagnostic log
                    showTab('database');
                });
            } else {
                console.error("Database Tab element not found!");
            }


            reviewerNameSelect.addEventListener('change', () => {
                if (reviewerNameSelect.value === 'Other') {
                    otherReviewerNameInput.classList.remove('hidden');
                    otherReviewerNameInput.setAttribute('required', 'required');
                } else {
                    otherReviewerNameInput.classList.add('hidden');
                    otherReviewerNameInput.value = '';
                    otherReviewerNameInput.removeAttribute('required');
                    otherReviewerNameInput.style.borderColor = '';
                }
            });

            cerRoleSelect.addEventListener('change', (event) => {
                const selectedRole = event.target.value;
                renderQuestionsForRole(selectedRole); // Calls the top-level renderQuestionsForRole
                resetFormFieldsButKeepRole(); // Calls the top-level resetFormFieldsButKeepRole
            });

            submitFormToDBBtn.addEventListener('click', async (event) => { // Now submits to DB
                event.preventDefault();
                console.log("Submit to Database button clicked.");

                const requiredInputs = assessmentForm.querySelectorAll('[required]:not(.hidden)');
                let allRequiredFilled = true;
                for (const input of requiredInputs) {
                    if (input.value.trim() === '' || (input.tagName === 'SELECT' && input.value === '')) {
                        allRequiredFilled = false;
                        input.style.borderColor = 'red';
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        input.focus();
                        showMessageBox("Validation Error", "Please fill out all required fields.", true, false, true);
                        return;
                    } else {
                        input.style.borderColor = '';
                    }
                }

                // Dynamically collect all relevant form data based on current DOM
                const formDataForSubmission = {};
                const basicInfoInputs = document.querySelectorAll('.p-6.grid.grid-cols-1 input, .p-6.grid.grid-cols-1 select');
                basicInfoInputs.forEach(input => {
                    if (input.name) {
                        if (input.type === 'datetime-local' || input.type === 'date') {
                            formDataForSubmission[input.name] = input.value;
                        } else if (input.id === 'other-reviewer-name' && input.classList.contains('hidden')) {
                            return;
                        } else {
                            formDataForSubmission[input.name] = input.value.trim();
                        }
                    }
                });

                const overallScoreDisplay = document.getElementById('overall-score-display');
                const businessComplianceAccuracyDisplay = document.getElementById('business-compliance-accuracy');
                const overallFinalPercentageDisplay = document.getElementById('overall-final-percentage-display');


                formDataForSubmission['Overall Score'] = overallScoreDisplay.textContent;
                formDataForSubmission['Business & Compliance Accuracy'] = businessComplianceAccuracyDisplay.textContent;
                formDataForSubmission['Total Pts.'] = globalTotalPoints;
                formDataForSubmission['Available Pts.'] = globalMaxPossiblePoints;
                formDataForSubmission['Final Score'] = overallFinalPercentageDisplay.textContent;

                const dynamicSelects = document.querySelectorAll('.rating-select');
                dynamicSelects.forEach(selectElement => {
                    const rowDiv = selectElement.closest('.grid.grid-cols-12.gap-2.py-2');
                    if (rowDiv) {
                        const pointsElement = rowDiv.querySelector('.points-input');
                        const remarksElement = rowDiv.querySelector('.remarks-textarea');
                        formDataForSubmission[selectElement.name] = selectElement.value;
                        if (pointsElement) {
                            formDataForSubmission[pointsElement.name] = pointsElement.value;
                        }
                        if (remarksElement) {
                            formDataForSubmission[remarksElement.name] = remarksElement.value.trim();
                        }
                    }
                });
                console.log("Collected Data for Submission:", formDataForSubmission);

                await addRecordToFirestore(formDataForSubmission); // Calls top-level addRecordToFirestore
            });


            printEmailBtn.addEventListener('click', async () => {
                console.log('PDF & Email button clicked - Attempting PDF generation and Email...');

                const auditFormContent = document.getElementById('auditFormContent');
                if (!auditFormContent) {
                    console.error('Error: Form container not found for PDF generation.');
                    showMessageBox("Error", "Could not find the form to generate PDF. Please try again.", true, false, true);
                    return;
                }

                const mainNav = document.getElementById('mainNav');
                const printEmailBtn = document.getElementById('print-email-btn');
                const submitFormToDBBtn = document.getElementById('submitFormToDBBtn');
                const contactIdInput = document.getElementById('contact-id');
                const cerNameSelect = document.getElementById('cer-name');
                const evaluationDateInput = document.getElementById('review-date');
                const reviewerNameSelect = document.getElementById('reviewer-name');
                const otherReviewerNameInput = document.getElementById('other-reviewer-name');


                const elementsToHide = [mainNav, printEmailBtn, submitFormToDBBtn];
                const originalDisplays = [];
                elementsToHide.forEach(el => {
                    if (el) {
                        originalDisplays.push({ el: el, display: el.style.display });
                        el.style.display = 'none';
                    }
                });
                console.log("Elements hidden for PDF capture.");

                try {
                    const canvas = await html2canvas(auditFormContent, {
                        scale: 2,
                        useCORS: true,
                        logging: false
                    });
                    console.log("html2canvas capture complete.");

                    const imgData = canvas.toDataURL('image/jpeg', 0.8);
                    const imgWidth = 210;
                    const pageHeight = 297;
                    const imgHeight = canvas.height * imgWidth / canvas.width;
                    let heightLeft = imgHeight;

                    const { jsPDF } = window.jspdf;
                    const pdf = new jsPDF('p', 'mm', 'a4');
                    console.log("jsPDF initialized.");

                    let position = 0;
                    pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                    heightLeft -= pageHeight;

                    while (heightLeft > -1) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight, undefined, 'FAST');
                        heightLeft -= pageHeight;
                    }
                    console.log("PDF images added.");

                    const contactIdForPdf = contactIdInput.value || 'UnknownContact';
                    const cerNameForPdf = cerNameSelect.value || 'UnknownCER';
                    const reviewDateForPdf = evaluationDateInput.value || 'UnknownDate';
                    pdf.save(`QA_Form_${contactIdForPdf}_${cerNameForPdf}_${reviewDateForPdf}.pdf`);
                    console.log("PDF saved.");

                    const cerNameVal = cerNameSelect.value;
                    const evaluationDateVal = evaluationDateInput.value;
                    const overallScoreVal = overallFinalPercentageDisplay.textContent; // Use corrected ID
                    const contactIdVal = contactIdInput.value;
                    const reviewerNameVal = reviewerNameSelect.value === 'Other' ? otherReviewerNameInput.value : reviewerNameSelect.value;

                    const subject = `Quality Assessment Form for Contact ID: ${contactIdVal || 'N/A'} - CER: ${cerNameVal || 'N/A'} - Date: ${evaluationDateVal || 'N/A'}.\n\nOverall Score: ${overallScoreVal || 'N/A'}`;
                    const body = `Dear Team,\n\nPlease find the attached Quality Assessment Form for Contact ID: ${contactIdVal || 'N/A'},\nCER: ${cerNameVal || 'N/A'},\nEvaluated on: ${evaluationDateVal || 'N/A'}.\n\nThe overall score is: ${overallScoreVal || 'N/A'}.\n\nRegards,\n${reviewerNameVal || 'Reviewer'}`;

                    const mailtoLink = `mailto:?subject=${encodeURIComponent(subject)}`;
                    window.location.href = mailtoLink;
                    showMessageBox("PDF Generated", "PDF generated and downloaded. Please attach the PDF manually to your email client.", false, false, true);

                } catch (error) {
                    console.error("Critical Error during PDF generation or mailto attempt:", error);
                    showMessageBox("PDF Error", `Failed to generate PDF or open email client: ${error.message}`, true, false, true);
                } finally {
                    originalDisplays.forEach(({ el, display }) => {
                        if (el) el.style.display = display;
                    });
                    console.log("Elements restored.");
                }
            });


            // Initial trigger for app setup after DOM is ready
            // Listen for the custom event fired when Firebase auth is ready
            document.addEventListener('firebaseAuthReady', () => {
                // Ensure the global db and auth objects are correctly referenced after Firebase is ready
                let db = window.db; 
                let auth = window.auth;
                let currentUserId = window.currentUserId;
                let isAuthReady = window.isAuthReady; 

                // Update collection path variables, which depend on window.appId being set by module script
                const EVALUATION_RECORDS_COLLECTION_PATH = window.EVALUATION_RECORDS_COLLECTION_PATH;
                const WEBHOOKS_COLLECTION_PATH = window.WEBHOOKS_COLLECTION_PATH;
                
                console.log("Firebase Auth is ready. Current User ID:", currentUserId);
                initializeApp(); // Calls the top-level initializeApp

                // If already logged in, fetch initial records
                if (sessionStorage.getItem('loggedIn') === 'true') {
                   fetchRecordsAndWebhooks(); // Call initially once logged in
                }
            });

            // Fallback initialization if DOMContentLoaded fires after firebaseAuthReady (e.g., fast load)
            if (document.readyState === 'complete' && window.isAuthReady !== null) { 
                let db = window.db; // Get global references
                let auth = window.auth;
                let currentUserId = window.currentUserId;
                let isAuthReady = window.isAuthReady;

                const EVALUATION_RECORDS_COLLECTION_PATH = window.EVALUATION_RECORDS_COLLECTION_PATH;
                const WEBHOOKS_COLLECTION_PATH = window.WEBHOOKS_COLLECTION_PATH;

                console.log("Firebase Auth was already ready on DOMContentLoaded. Initializing app directly.");
                initializeApp(); // Calls the top-level initializeApp
                if (sessionStorage.getItem('loggedIn') === 'true') {
                   fetchRecordsAndWebhooks(); // Call initially once logged in
                }
            } else {
                console.log("Waiting for firebaseAuthReady event (or DOMContentLoaded if it's already ready)...");
            }
        });
    </script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
</body>
</html>