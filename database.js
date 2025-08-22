<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Database - Quality Management System</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f0f2f5;
        }
        .top-header {
            background-color: #003366;
            color: white;
            padding: 1rem;
            text-align: center;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            height: 64px;
        }
        .main-nav {
            background-color: #002347;
            color: white;
            position: fixed;
            top: 64px;
            left: 0;
            height: calc(100% - 64px);
            width: 256px;
            z-index: 999;
            box-shadow: 2px 0 5px rgba(0,0,0,0.1);
        }
        .sidebar ul li a {
            transition: background-color 0.2s ease;
        }
        .sidebar ul li a:hover,
        .sidebar ul li a.active {
            background-color: #004a8d;
        }
        .logout-button {
            background-color: #ff6f61;
            color: white;
            transition: background-color 0.2s ease;
        }
        .logout-button:hover {
            background-color: #e65a50;
        }
        main {
            padding-top: 80px;
            padding-left: 272px;
            padding-right: 16px;
            padding-bottom: 16px;
        }
        .dashboard-card {
            background: white;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }
        .chart-container {
            height: 400px;
        }
        .database-table {
            width: 100%;
            border-collapse: collapse;
        }
        .database-table thead th {
            background-color: #f9fafb;
            padding: 0.75rem 1rem;
            text-align: left;
            font-weight: 600;
            color: #4b5563;
            border-bottom: 2px solid #e5e7eb;
        }
        .database-table tbody td {
            padding: 0.75rem 1rem;
            border-bottom: 1px solid #e5e7eb;
        }
        .database-table tbody tr:last-child td {
            border-bottom: none;
        }
        .database-table tbody tr:hover {
            background-color: #f9fafb;
        }
        .hidden { display: none !important; }
        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: #0056b3;
            border-radius: 50%;
            width: 48px;
            height: 48px;
            animation: spin 1s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body class="bg-gray-100">
    <header class="top-header flex items-center justify-center relative">
        <span class="text-xl font-semibold">ICEA LION QUALITY DASHBOARD</span>
        <img id="header-logo" src="https://placehold.co/150x60/FFFFFF/003366?text=Logo" alt="Company Logo" class="absolute right-4 h-12 w-auto">
    </header>

    <nav class="main-nav" id="mainNav">
        <div class="sidebar p-4 h-full flex flex-col">
            <ul class="flex-grow">
                <li class="nav-tab mb-2"><a href="home.html" class="flex items-center p-2 rounded-md"><i class="fas fa-home w-6 mr-2"></i> Home</a></li>
                <li class="nav-tab mb-2"><a href="Dashboard.html" class="flex items-center p-2 rounded-md"><i class="fas fa-chart-bar w-6 mr-2"></i> Dashboard</a></li>
                <li class="nav-tab mb-2"><a href="index.html" class="flex items-center p-2 rounded-md"><i class="fas fa-file-alt w-6 mr-2"></i> Evaluation Form</a></li>
                <li class="nav-tab mb-2"><a href="myEvaluations.html" class="flex items-center p-2 rounded-md"><i class="fas fa-user-check w-6 mr-2"></i> My Evaluations</a></li>
                <li class="nav-tab mb-2"><a href="autofails.html" class="flex items-center p-2 rounded-md"><i class="fas fa-exclamation-triangle w-6 mr-2"></i> Autofails</a></li>
                <li class="nav-tab mb-2"><a href="reports.html" class="flex items-center p-2 rounded-md"><i class="fas fa-file-contract w-6 mr-2"></i> Reports</a></li>
                <li class="nav-tab mb-2"><a href="database.html" class="active flex items-center p-2 rounded-md"><i class="fas fa-database w-6 mr-2"></i> Database</a></li>
                <li class="nav-tab mb-2"><a href="images.html" class="flex items-center p-2 rounded-md"><i class="fas fa-image w-6 mr-2"></i> Images</a></li>
            </ul>
            <button id="logoutBtn" class="logout-button w-full font-bold py-2 px-4 rounded-md shadow-md mt-auto">Logout</button>
        </div>
    </nav>

    <main id="mainContent">
        <div id="loadingMessage" class="flex flex-col items-center justify-center h-[calc(100vh-100px)]">
            <div class="spinner"></div>
            <p class="mt-4 text-lg text-gray-600">Loading Database...</p>
        </div>

        <div id="databaseContent" class="hidden">
            <h1 class="text-3xl font-bold mb-6 text-gray-800">Database Records</h1>
            
            <!-- Filter Section -->
            <div class="bg-blue-900 p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-end gap-4">
                <div>
                    <label for="filterDate" class="text-sm font-medium text-white">Date</label>
                    <input type="date" id="filterDate" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div>
                    <label for="filterMonth" class="text-sm font-medium text-white">Month</label>
                    <input type="month" id="filterMonth" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                </div>
                <div class="flex gap-2">
                    <button id="applyFiltersBtn" class="bg-blue-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-blue-700">Apply</button>
                    <button id="resetFiltersBtn" class="bg-gray-200 text-gray-700 px-4 py-2 rounded-md shadow-sm hover:bg-gray-300">Reset</button>
                </div>
            </div>

            <div class="dashboard-card bg-white">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-xl font-semibold text-gray-800">All Records</h2>
                    <div class="flex items-center gap-4">
                        <div class="relative">
                            <input type="text" id="recordSearchInput" placeholder="Search records..." class="w-full max-w-xs p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                        </div>
                        <button id="downloadExcelBtn" class="bg-green-600 text-white px-4 py-2 rounded-md shadow-sm hover:bg-green-700">
                            <i class="fas fa-file-excel mr-2"></i>Download Selected as Excel
                        </button>
                    </div>
                </div>
                <div class="overflow-x-auto">
                    <table class="database-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" id="selectAllCheckbox"></th>
                                <th>Date</th>
                                <th>Contact ID</th>
                                <th>Client Name</th>
                                <th>CER Name</th>
                                <th>Score</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="recordsTableBody"></tbody>
                    </table>
                </div>
            </div>
        </div>
    </main>

    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
        import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
        import { getFirestore, collection, onSnapshot, deleteDoc, doc, writeBatch } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

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
        const LOGO_STORAGE_KEY = 'companyLogoDataUrl';
        let allRecords = [];
        let currentFilteredData = [];

        function loadLogoFromLocalStorage() {
            const savedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
            if (savedLogo) {
                document.getElementById('header-logo').src = savedLogo;
            }
        }

        function renderRecordsTable(records) {
            const tableBody = document.getElementById('recordsTableBody');
            tableBody.innerHTML = '';
            if (records.length === 0) {
                tableBody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-gray-500">No records found.</td></tr>`;
                return;
            }
            records.forEach(record => {
                const row = tableBody.insertRow();
                const submittedDate = record.submittedAt?.toDate ? record.submittedAt.toDate().toLocaleDateString() : 'N/A';
                const score = parseFloat(record['Overall Score']) || 0;
                const scoreClass = score >= 85 ? 'text-green-600' : score >= 70 ? 'text-yellow-600' : 'text-red-600';

                row.innerHTML = `
                    <td><input type="checkbox" class="record-checkbox" data-record-id="${record.id}"></td>
                    <td>${submittedDate}</td>
                    <td>${record['Contact ID'] || ''}</td>
                    <td>${record['Client Name'] || ''}</td>
                    <td>${record['CER Name'] || ''}</td>
                    <td class="font-bold ${scoreClass}">${record['Overall Score'] || ''}</td>
                    <td>
                        <button class="text-red-500 hover:text-red-700 delete-record-btn" data-record-id="${record.id}" title="Delete"><i class="fas fa-trash-alt"></i></button>
                    </td>
                `;
            });
        }
        
        function applyFilters() {
            const date = document.getElementById('filterDate').value;
            const month = document.getElementById('filterMonth').value;
            const searchTerm = document.getElementById('recordSearchInput').value.toLowerCase();

            let filtered = allRecords;

            if (date) {
                filtered = filtered.filter(r => r.submittedAt?.toDate().toISOString().slice(0,10) === date);
            }
            if (month) {
                filtered = filtered.filter(r => r.submittedAt?.toDate().toISOString().slice(0,7) === month);
            }
            if (searchTerm) {
                filtered = filtered.filter(r => 
                    (r['Client Name'] || '').toLowerCase().includes(searchTerm) ||
                    (r['Contact ID'] || '').toLowerCase().includes(searchTerm) ||
                    (r['CER Name'] || '').toLowerCase().includes(searchTerm)
                );
            }
            
            currentFilteredData = filtered;
            renderRecordsTable(currentFilteredData);
        }

        function downloadSelectedAsExcel() {
            const selectedIds = [...document.querySelectorAll('.record-checkbox:checked')].map(cb => cb.dataset.recordId);
            if (selectedIds.length === 0) {
                alert("Please select records to download.");
                return;
            }
            const dataToExport = allRecords.filter(record => selectedIds.includes(record.id));
            
            const headers = ["Date", "Contact ID", "Client Name", "CER Name", "Score", "Autofail Type", "Autofail Description"];
            const csvRows = [headers.join(',')];

            dataToExport.forEach(record => {
                const submittedAt = record.submittedAt?.toDate ? record.submittedAt.toDate().toLocaleDateString() : 'N/A';
                const values = [
                    `"${submittedAt}"`,
                    `"${record['Contact ID'] || ''}"`,
                    `"${record['Client Name'] || ''}"`,
                    `"${record['CER Name'] || ''}"`,
                    `"${record['Overall Score'] || ''}"`,
                    `"${record['Auto Fail Type'] || ''}"`,
                    `"${(record['Autofail Description'] || '').replace(/"/g, '""')}"`
                ];
                csvRows.push(values.join(','));
            });

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement("a");
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", "database_records.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        async function deleteSelectedRecords(recordIds) {
            if (!recordIds || recordIds.length === 0) {
                const selectedCheckboxes = document.querySelectorAll('.record-checkbox:checked');
                recordIds = Array.from(selectedCheckboxes).map(cb => cb.dataset.recordId);
            }
            if (recordIds.length === 0) {
                alert("Please select records to delete.");
                return;
            }
            if (!confirm(`Are you sure you want to delete ${recordIds.length} record(s)?`)) {
                return;
            }

            const batch = writeBatch(db);
            recordIds.forEach(id => {
                const docRef = doc(db, EVALUATION_RECORDS_PATH, id);
                batch.delete(docRef);
            });
            await batch.commit();
            alert("Records deleted successfully.");
        }

        onAuthStateChanged(auth, (user) => {
            if (user) {
                loadLogoFromLocalStorage();
                onSnapshot(collection(db, EVALUATION_RECORDS_PATH), (snapshot) => {
                    allRecords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    applyFilters();
                    document.getElementById('loadingMessage').classList.add('hidden');
                    document.getElementById('databaseContent').classList.remove('hidden');
                });
            } else {
                window.location.href = 'index.html';
            }
        });

        document.getElementById('recordSearchInput').addEventListener('input', applyFilters);
        document.getElementById('applyFiltersBtn').addEventListener('click', applyFilters);
        document.getElementById('resetFiltersBtn').addEventListener('click', () => {
            document.getElementById('filterDate').value = '';
            document.getElementById('filterMonth').value = '';
            document.getElementById('recordSearchInput').value = '';
            applyFilters();
        });
        
        document.getElementById('downloadExcelBtn').addEventListener('click', downloadSelectedAsExcel);
        
        document.getElementById('recordsTableBody').addEventListener('click', (e) => {
            if (e.target.closest('.delete-record-btn')) {
                const recordId = e.target.closest('.delete-record-btn').dataset.recordId;
                deleteSelectedRecords([recordId]);
            }
        });

        document.getElementById('selectAllCheckbox').addEventListener('change', (e) => {
            document.querySelectorAll('.record-checkbox').forEach(checkbox => {
                checkbox.checked = e.target.checked;
            });
        });
        
        document.getElementById('logoutBtn').addEventListener('click', () => signOut(auth));

    </script>
</body>
</html>
