<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Assessment Tool</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        /* Add any custom styles here */
        .tab-button.active {
            @apply bg-blue-600 text-white;
        }
        .tab-button {
            @apply text-blue-700 hover:bg-blue-100;
        }
    </style>
</head>
<body class="bg-gray-100 min-h-screen flex flex-col">

    <div id="messageBox" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 id="messageBoxTitle" class="text-xl font-semibold mb-4"></h3>
            <p id="messageBoxContent" class="text-gray-700 mb-4"></p>
            <div class="flex justify-end space-x-2">
                <button id="messageBoxCloseBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md">Close</button>
            </div>
        </div>
    </div>

    <div id="dataMappingModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center hidden z-50">
        <div class="bg-white p-6 rounded-lg shadow-xl w-11/12 max-w-4xl max-h-[90vh] overflow-y-auto">
            <h3 class="text-xl font-semibold mb-4">Map Uploaded Data Fields</h3>
            <p class="mb-4 text-gray-700">Please match the columns from your uploaded file to the corresponding database fields. Only mapped fields will be imported.</p>

            <div id="mappingFieldsContainer" class="space-y-4">
                </div>

            <div class="mt-6 flex justify-end space-x-3">
                <button id="cancelMappingBtn" class="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md shadow-md">Cancel</button>
                <button id="confirmUploadBtn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md">Confirm Upload</button>
            </div>
        </div>
    </div>


    <section id="loginSection" class="flex-grow flex items-center justify-center p-4">
        <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
            <h2 class="text-2xl font-bold mb-6 text-center">Login</h2>
            <form id="loginForm">
                <div class="mb-4">
                    <label for="username" class="block text-gray-700 text-sm font-bold mb-2">Username:</label>
                    <input type="text" id="username" name="username" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                <div class="mb-6">
                    <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Password:</label>
                    <input type="password" id="password" name="password" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" required>
                </div>
                <p id="loginMessage" class="text-red-500 text-xs italic mb-4 hidden"></p>
                <div class="flex items-center justify-between">
                    <button type="submit" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full">
                        Login
                    </button>
                </div>
            </form>
        </div>
    </section>

    <div id="appContent" class="flex-grow flex flex-col hidden">
        <nav id="mainNav" class="bg-blue-700 p-4 text-white flex justify-between items-center shadow-lg">
            <div class="container mx-auto flex justify-between items-center">
                <div class="text-2xl font-bold">QA Form Tool</div>
                <div class="flex space-x-4">
                    <button id="auditFormTab" class="tab-button active py-2 px-4 rounded-md">Audit Form</button>
                    <button id="databaseTab" class="tab-button py-2 px-4 rounded-md">Database</button>
                    <button id="logoutBtn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md">Logout</button>
                </div>
            </div>
        </nav>

        <main class="flex-grow p-6">
            <section id="auditFormContent" class="tab-content">
                <h2 class="text-3xl font-bold mb-6 text-gray-800 text-center">Contact Center Quality Assessment Form</h2>
                <form id="assessment-form" class="bg-white p-8 rounded-lg shadow-lg mb-8">
                    <div class="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8 border-b pb-8">
                        <h3 class="col-span-full text-2xl font-semibold mb-4 text-gray-700">Basic Information</h3>
                        <div>
                            <label for="contact-id" class="block text-gray-700 text-sm font-bold mb-2">Contact ID:</label>
                            <input type="text" id="contact-id" name="Contact ID" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                        </div>
                        <div>
                            <label for="client-name" class="block text-gray-700 text-sm font-bold mb-2">Client Name:</label>
                            <input type="text" id="client-name" name="Client Name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                        </div>
                        <div>
                            <label for="cer-name" class="block text-gray-700 text-sm font-bold mb-2">CER Name:</label>
                            <input type="text" id="cer-name" name="CER Name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                        </div>
                        <div>
                            <label for="review-date" class="block text-gray-700 text-sm font-bold mb-2">Evaluation Date:</label>
                            <input type="date" id="review-date" name="Evaluation Date" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                        </div>
                        <div>
                            <label for="review-time" class="block text-gray-700 text-sm font-bold mb-2">Evaluation Time:</label>
                            <input type="time" id="review-time" name="Evaluation Time" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                        </div>
                        <div>
                            <label for="reviewer-name" class="block text-gray-700 text-sm font-bold mb-2">Reviewer Name:</label>
                            <select id="reviewer-name" name="Reviewer Name" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                                <option value="">Select Reviewer</option>
                                <option value="Supervisor A">Supervisor A</option>
                                <option value="Supervisor B">Supervisor B</option>
                                <option value="Other">Other (Specify)</option>
                            </select>
                            <input type="text" id="other-reviewer-name" name="Other Reviewer Name" placeholder="Specify Reviewer Name" class="mt-2 shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline hidden">
                        </div>
                        <div>
                            <label for="cer-role" class="block text-gray-700 text-sm font-bold mb-2">CER Role:</label>
                            <select id="cer-role" name="CER Role" class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" required>
                                <option value="">Select Role</option>
                                <option value="Inbound">Inbound</option>
                                <option value="Outbound">Outbound</option>
                                <option value="Chat">Chat</option>
                                <option value="Email">Email</option>
                            </select>
                        </div>
                    </div>

                    <div id="questions-container">
                        </div>

                    <div class="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-md">
                        <h3 class="text-2xl font-semibold mb-4 text-blue-800">Overall Scores</h3>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-lg">
                            <div class="flex justify-between items-center py-2 px-4 bg-white rounded-md shadow-sm">
                                <span class="font-medium text-gray-700">Overall Score (Points):</span>
                                <span id="overall-score-display" class="font-bold text-blue-700">0</span>
                            </div>
                            <div class="flex justify-between items-center py-2 px-4 bg-white rounded-md shadow-sm">
                                <span class="font-medium text-gray-700">Total Available Points:</span>
                                <span id="max-possible-points-display" class="font-bold text-gray-700">0</span>
                            </div>
                            <div class="flex justify-between items-center py-2 px-4 bg-white rounded-md shadow-sm">
                                <span class="font-medium text-gray-700">Business & Compliance Accuracy:</span>
                                <span id="business-compliance-accuracy" class="font-bold text-blue-700">0%</span>
                            </div>
                            <div class="flex justify-between items-center py-2 px-4 bg-white rounded-md shadow-sm col-span-full">
                                <span class="font-medium text-gray-700">Overall Final Percentage:</span>
                                <span id="overall-final-percentage-display" class="font-bold text-green-700 text-2xl">0%</span>
                            </div>
                        </div>
                    </div>

                    <div class="mt-8 flex justify-end space-x-4">
                        <button type="button" id="print-email-btn" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md flex items-center">
                            <i class="fas fa-print mr-2"></i> Print / Email PDF
                        </button>
                        <button type="submit" id="submitFormToDBBtn" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md flex items-center">
                            <i class="fas fa-database mr-2"></i> Submit to Database
                        </button>
                    </div>
                </form>
            </section>

            <section id="databaseContent" class="tab-content hidden">
                <h2 class="text-3xl font-bold mb-6 text-gray-800 text-center">Evaluation Records</h2>

                <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h3 class="text-xl font-semibold mb-4 text-gray-700">Upload Data</h3>
                    <div class="mb-4">
                        <label for="fileUploadInput" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-md cursor-pointer inline-block">
                            Upload Data (CSV/JSON/XLSX)
                        </label>
                        <input type="file" id="fileUploadInput" accept=".csv, .json, .xlsx" class="hidden">
                    </div>
                    <p class="text-sm text-gray-600 mt-2">Accepted formats: CSV, JSON (array of objects), Excel (.xlsx - basic support).</p>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-xl font-semibold text-gray-700">All Records</h3>
                        <div class="flex items-center space-x-2">
                            <input type="checkbox" id="selectAllRecordsCheckbox" class="form-checkbox h-5 w-5 text-blue-600 rounded">
                            <label for="selectAllRecordsCheckbox" class="text-gray-700">Select All</label>
                            <button id="deleteSelectedRecordsBtn" class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md shadow-md disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                                Delete Selected
                            </button>
                        </div>
                    </div>
                    <div class="overflow-x-auto">
                        <table class="min-w-full bg-white border border-gray-300 rounded-lg">
                            <thead>
                                <tr class="bg-gray-200 text-gray-700 uppercase text-sm leading-normal">
                                    <th class="py-3 px-6 text-left"></th>
                                    <th class="py-3 px-6 text-left">Submitted At</th>
                                    <th class="py-3 px-6 text-left">Contact ID</th>
                                    <th class="py-3 px-6 text-left">Client Name</th>
                                    <th class="py-3 px-6 text-left">CER Name</th>
                                    <th class="py-3 px-6 text-left">Overall Score</th>
                                    <th class="py-3 px-6 text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody id="recordsTableBody" class="text-gray-600 text-sm font-light">
                                <tr><td colspan="7" class="text-center py-4 text-gray-500">Loading records...</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div class="bg-white p-6 rounded-lg shadow-lg mb-8">
                    <h3 class="text-xl font-semibold mb-4 text-gray-700">Webhook Management</h3>
                    <div class="flex mb-4">
                        <input type="url" id="newWebhookUrlInput" placeholder="Enter webhook URL (e.g., https://example.com/webhook)" class="flex-grow shadow appearance-none border rounded-l w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline">
                        <button id="addWebhookBtn" class="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-4 rounded-r-md shadow-md">Add Webhook</button>
                    </div>
                    <div id="webhookList" class="space-y-2 text-gray-800">
                        <p class="text-sm text-gray-500 text-center">Loading webhooks...</p>
                    </div>
                </div>
            </section>
        </main>
    </div>

    <script type="module" src="firebase-init.js"></script>

    <script type="module" src="main.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.4.1/papaparse.min.js"></script>
    </body>
</html>
