<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="description" content="Database for the ICEA LION GROUP contact centre QA dashboard.">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database - QA Dashboard</title>
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    <style>
        /* --- Base & Body Styles --- */
        body {
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: flex-start;
            min-height: 100vh;
            background-color: #f3f4f6; /* bg-gray-100 */
            margin: 0;
            padding: 0;
        }

        /* --- Branding & Theming --- */
        .icealion-blue {
            background-color: #1a73e8;
            color: white;
        }

        /* --- Layout & Navigation Styles --- */
        .top-header {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 48px;
            background-color: #000080; /* Navy Blue */
            color: white;
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 1.125rem;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            padding: 0 1rem;
        }
        .top-header img {
            height: 1.5cm; 
            width: 2.5cm; 
            object-fit: contain;
        }
        .main-nav {
            width: 125px; /* Fixed width for the sidebar */
            background-color: #000080; /* Navy Blue */
            color: white;
            padding: 1rem 0;
            height: calc(100vh - 48px);
            position: fixed;
            top: 48px;
            left: 0;
            z-index: 100;
            box-shadow: 2px 0 5px rgba(0, 0, 0, 0.1);
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }
        .sidebar ul { list-style: none; margin: 0; padding: 0; flex-grow: 1; }
        .sidebar ul li a {
            color: white;
            text-decoration: none;
            font-weight: 500;
            padding: 0.75rem 0.5rem;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.25rem;
            font-size: 0.75rem;
            text-align: center;
            transition: background-color 0.3s ease;
        }
        .sidebar ul li a:hover,
        .sidebar ul li a.active {
            background-color: #000050; /* Darker Navy */
        }
        .logout-button {
            background-color: #f57c00;
            color: white;
            padding: 0.5rem 0.75rem;
            border-radius: 0.375rem;
            font-weight: 600;
            cursor: pointer;
            border: none;
            transition: background-color 0.3s ease;
            margin: 1rem auto;
            width: calc(100% - 2rem);
            font-size: 0.75rem;
        }
        .logout-button:hover { background-color: #e65100; }

        .content-section {
            margin-left: calc(125px + 1.5rem); 
            margin-top: calc(48px + 1.5rem); 
            width: calc(100% - 125px - 3rem); 
            min-height: calc(100vh - 48px - 3rem); 
            max-width: none; 
            border-radius: 0.5rem; 
            margin-bottom: 1.5rem; 
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); 
        }

        /* --- Database Styles --- */
        #databaseTableContainer table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 1rem;
        }
        #databaseTableContainer th, #databaseTableContainer td {
            border-bottom: 1px solid #e5e7eb; /* gray-200 */
            padding: 1rem;
            text-align: left;
            font-size: 0.875rem;
        }
        #databaseTableContainer th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151; /* gray-700 */
            position: sticky;
            top: 0;
            z-index: 10;
        }
        #databaseTableContainer tbody tr:hover {
            background-color: #f3f4f6;
        }
        .action-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            transition: background-color 0.2s ease;
        }
        .action-btn:hover {
            background-color: #e5e7eb;
        }
        .action-btn i {
            font-size: 1rem;
        }
        .view-record-btn { color: #3b82f6; }
        .email-record-btn { color: #f97316; }
        .download-record-btn { color: #22c55e; }
        .delete-record-btn { color: #ef4444; }
        .download-pdf-btn { color: #800080; }

        /* --- Modal & Spinner Styles --- */
        .message-box-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000; 
        }
        .message-box {
            background-color: white;
            padding: 2rem;
            border-radius: 0.5rem;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
            max-width: 400px;
            width: 90%;
        }
        .message-box h3 {
            font-size: 1.25rem;
            font-weight: 600;
            margin-bottom: 1rem;
        }
        .message-box p {
            margin-bottom: 1.5rem;
            color: #333;
        }
        .message-box button {
            background-color: #1a73e8;
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            font-weight: 500;
            cursor: pointer;
            border: none;
            transition: background-color 0.3s ease;
            margin: 0 0.5rem;
        }
        .message-box button:hover {
            background-color: #0d47a1;
        }
        .message-box .cancel-btn {
            background-color: #6c757d;
        }
        .message-box .cancel-btn:hover {
            background-color: #5a6268;
        }
        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #1a73e8;
            border-radius: 50%;
            width: 24px;
            height: 24px;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem auto;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        .hidden { display: none; }
    </style>
</head>
<body>
    <header class="top-header">
        <span class="text-xl font-semibold">ICEA LION QUALITY DASHBOARD</span>
        <img id="header-logo" src="https://placehold.co/95x57/000080/FFFFFF?text=Logo" alt="Company Logo" aria-label="ICEA LION Group company logo">
    </header>

    <div id="messageBoxOverlay" class="message-box-overlay hidden" role="alertdialog" aria-live="assertive">
        <div class="message-box">
            <div id="messageBoxSpinner" class="spinner hidden" aria-label="Loading..."></div>
            <h3 id="messageBoxTitle"></h3>
            <p id="messageBoxContent"></p>
            <div id="messageBoxButtons">
                 <button>OK</button>
            </div>
        </div>
    </div>

    <nav class="main-nav" id="mainNav">
        <div class="sidebar">
            <ul>
                <li><a href="home.html"><i class="fas fa-home"></i> Home</a></li>
                <li><a href="index.html#reports"><i class="fas fa-chart-bar"></i> Dashboard</a></li>
                <li><a href="index.html#auditForm"><i class="fas fa-file-alt"></i> Evaluation Form</a></li>
                <li><a href="index.html#shareResponse"><i class="fas fa-share-square"></i> Share</a></li>
                <li><a href="index.html#myEvaluations"><i class="fas fa-user-check"></i> My Evaluations</a></li>
                <li><a href="index.html#nps"><i class="fas fa-comments"></i> NPS</a></li>
                <li><a href="index.html#autofails"><i class="fas fa-exclamation-triangle"></i> Autofails</a></li>
                <li><a href="#" class="active"><i class="fas fa-database"></i> Database</a></li>
                <li><a href="index.html#images"><i class="fas fa-image"></i> Images</a></li>
                <li><a href="index.html#users"><i class="fas fa-users"></i> Users</a></li>
                <li><a href="index.html#admin"><i class="fas fa-user-cog"></i> Admin</a></li>
            </ul>
            <button id="logoutBtn" class="logout-button">Logout</button>
        </div>
    </nav>

    <main class="content-section container mx-auto bg-white shadow-lg rounded-lg overflow-hidden" id="databaseContent">
        <div class="icealion-blue p-4 text-xl font-semibold text-center">
            <span>Database Records</span>
        </div>
        <div class="p-6">
            <div class="flex justify-between items-center mb-4">
                <div class="relative flex-1">
                    <input type="text" id="recordSearchInput" placeholder="Search by Client, Contact ID or CER..." class="w-full max-w-md p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                </div>
                <div>
                    <button id="deleteSelectedRecordsBtn" class="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-md shadow-md transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" disabled>
                        <i class="fas fa-trash-alt mr-2"></i>Delete Selected
                    </button>
                </div>
            </div>

            <div id="databaseTableContainer" class="overflow-x-auto max-h-[65vh]">
                <table class="min-w-full">
                    <thead>
                        <tr>
                            <th class="w-12"><input type="checkbox" id="selectAllRecordsCheckbox"></th>
                            <th>Timestamp</th>
                            <th>Contact ID</th>
                            <th>Client Name</th>
                            <th>CER Name</th>
                            <th>Overall Score</th>
                            <th>Attachment</th>
                            <th class="w-48 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="recordsTableBody">
                        <!-- Rows will be dynamically inserted here -->
                    </tbody>
                </table>
            </div>
        </div>
    </main>
    
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
        import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
        import { getFirestore, collection, onSnapshot, deleteDoc, doc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyCw4nE6cvBJ9QmPp8wxyL-Jdm6hWQ0dVjs",
            authDomain: "icea-lion-qa.firebaseapp.com",
            projectId: "icea-lion-qa",
            storageBucket: "icea-lion-qa.appspot.com", 
            messagingSenderId: "820082472004",
            appId: "1:820082472004:web:8caddf941e1b5b667faf811",
        };
        const appId = (typeof __app_id !== 'undefined' && __app_id) ? __app_id : firebaseConfig.appId;

        const app = initializeApp(firebaseConfig);
        const auth = getAuth(app);
        const db = getFirestore(app);

        const EVALUATION_RECORDS_PATH = `artifacts/${appId}/public/data/evaluation_records`;
        let allRecords = [];

        function showMessageBox(title, message, isError = false) {
            const overlay = document.getElementById('messageBoxOverlay');
            document.getElementById('messageBoxTitle').textContent = title;
            document.getElementById('messageBoxContent').textContent = message;
            document.getElementById('messageBoxTitle').style.color = isError ? '#dc2626' : '#1a73e8';
            document.querySelector('#messageBoxButtons button').onclick = () => overlay.classList.add('hidden');
            overlay.classList.remove('hidden');
        }

        function showConfirmation(title, message, onConfirm) {
            const overlay = document.getElementById('messageBoxOverlay');
            document.getElementById('messageBoxTitle').textContent = title;
            document.getElementById('messageBoxContent').textContent = message;
            document.getElementById('messageBoxTitle').style.color = '#f57c00';
            
            const buttonsDiv = document.getElementById('messageBoxButtons');
            buttonsDiv.innerHTML = `
                <button class="cancel-btn">Cancel</button>
                <button>Confirm</button>
            `;
            buttonsDiv.querySelector('.cancel-btn').onclick = () => overlay.classList.add('hidden');
            buttonsDiv.querySelector('button:last-child').onclick = () => {
                overlay.classList.add('hidden');
                onConfirm();
            };
            overlay.classList.remove('hidden');
        }

        function renderRecordsTable(records) {
            const tableBody = document.getElementById('recordsTableBody');
            tableBody.innerHTML = '';
            if (records.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-gray-500">No records found.</td></tr>`;
                return;
            }
            records.forEach(record => {
                const row = tableBody.insertRow();
                const submittedDate = record.submittedAt?.toDate ? record.submittedAt.toDate().toLocaleString() : 'N/A';
                const pdfButton = record.pdfAttachmentUrl ? `<a href="${record.pdfAttachmentUrl}" target="_blank" class="action-btn download-pdf-btn" title="Download PDF"><i class="fas fa-file-pdf"></i></a>` : 'N/A';
                
                row.innerHTML = `
                    <td><input type="checkbox" class="record-checkbox" data-record-id="${record.id}"></td>
                    <td>${submittedDate}</td>
                    <td>${record['Contact ID'] || ''}</td>
                    <td>${record['Client Name'] || ''}</td>
                    <td>${record['CER Name'] || ''}</td>
                    <td>${record['Overall Score'] || ''}</td>
                    <td>${pdfButton}</td>
                    <td class="text-center">
                        <button class="action-btn view-record-btn" data-record-id='${JSON.stringify(record)}' title="View"><i class="fas fa-eye"></i></button>
                        <button class="action-btn email-record-btn" data-record-id='${JSON.stringify(record)}' title="Email"><i class="fas fa-envelope"></i></button>
                        <button class="action-btn download-record-btn" data-record-id='${JSON.stringify(record)}' title="Download JSON"><i class="fas fa-download"></i></button>
                        <button class="action-btn delete-record-btn" data-record-id="${record.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
            });

            // Re-attach event listeners after rendering
            attachActionListeners();
        }

        function attachActionListeners() {
            document.querySelectorAll('.record-checkbox').forEach(c => c.addEventListener('change', updateDeleteButtonState));
            document.querySelectorAll('.delete-record-btn').forEach(b => b.addEventListener('click', e => deleteSelectedRecords([e.currentTarget.dataset.recordId])));
            document.querySelectorAll('.view-record-btn').forEach(b => b.addEventListener('click', e => viewRecordDetails(JSON.parse(e.currentTarget.dataset.recordId))));
            document.querySelectorAll('.email-record-btn').forEach(b => b.addEventListener('click', e => sendRecordEmail(JSON.parse(e.currentTarget.dataset.recordId))));
            document.querySelectorAll('.download-record-btn').forEach(b => b.addEventListener('click', e => downloadRecordData(JSON.parse(e.currentTarget.dataset.recordId))));
        }

        function updateDeleteButtonState() {
            document.getElementById('deleteSelectedRecordsBtn').disabled = document.querySelectorAll('.record-checkbox:checked').length === 0;
        }

        async function deleteSelectedRecords(ids) {
            showConfirmation('Confirm Deletion', `Are you sure you want to delete ${ids.length} record(s)?`, async () => {
                try {
                    await Promise.all(ids.map(id => deleteDoc(doc(db, EVALUATION_RECORDS_PATH, id))));
                    showMessageBox("Success", "Selected records deleted.");
                } catch (e) {
                    showMessageBox("Deletion Failed", `Error: ${e.message}`, true);
                }
            });
        }

        function viewRecordDetails(record) {
            let detailsHtml = '<pre style="text-align: left; white-space: pre-wrap;">';
            for (const key in record) {
                let value = record[key];
                if (key === 'submittedAt' && value?.toDate) value = value.toDate().toLocaleString();
                detailsHtml += `<strong>${key}:</strong> ${JSON.stringify(value, null, 2)}\n`;
            }
            detailsHtml += '</pre>';
            showMessageBox('Record Details', detailsHtml);
        }

        function sendRecordEmail(record) {
            const to = encodeURIComponent(record['CER Email'] || '');
            const subject = encodeURIComponent(`Evaluation Result for ${record['CER Name']}`);
            let body = `Hi ${record['CER Name']},\n\nPlease find your evaluation results.\n\nOverall Score: ${record['Overall Score']}\n\n`;
            if (record.pdfAttachmentUrl) body += `Download Link: ${record.pdfAttachmentUrl}\n\n`;
            body += `Regards,\nQuality Team`;
            window.location.href = `mailto:${to}?subject=${subject}&body=${encodeURIComponent(body)}`;
        }

        function downloadRecordData(record) {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(record, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `record-${record['Contact ID'] || record.id}.json`;
            a.click();
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                onSnapshot(collection(db, EVALUATION_RECORDS_PATH), (snapshot) => {
                    allRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    renderRecordsTable(allRecords);
                });
            } else {
                window.location.href = './index.html'; // Redirect if not logged in
            }
        });

        document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));
        document.getElementById('deleteSelectedRecordsBtn').addEventListener('click', () => {
            const ids = Array.from(document.querySelectorAll('.record-checkbox:checked')).map(cb => cb.dataset.recordId);
            deleteSelectedRecords(ids);
        });
        document.getElementById('selectAllRecordsCheckbox').addEventListener('change', (e) => {
            document.querySelectorAll('.record-checkbox').forEach(checkbox => checkbox.checked = e.target.checked);
            updateDeleteButtonState();
        });
        document.getElementById('recordSearchInput').addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allRecords.filter(r => 
                (r['Client Name'] || '').toLowerCase().includes(searchTerm) ||
                (r['Contact ID'] || '').toLowerCase().includes(searchTerm) ||
                (r['CER Name'] || '').toLowerCase().includes(searchTerm)
            );
            renderRecordsTable(filtered);
        });

    </script>
</body>
</html>
