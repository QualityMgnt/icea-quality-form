import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";
import { getFirestore, doc, onSnapshot, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Your Firebase Config here
const firebaseConfig = { /* ... */ };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const storage = getStorage(app);
const db = getFirestore(app);

const IMAGES_DOC_REF = doc(db, 'artifacts/your-app-id/public/data/images', 'logos');
const LOGO_STORAGE_PATH = 'logos/company-logo';

document.addEventListener('DOMContentLoaded', () => {
    const logoUploadInput = document.getElementById('logoUploadInput');
    const uploadLogoBtn = document.getElementById('uploadLogoBtn');
    const uploadMessage = document.getElementById('uploadMessage');
    const currentLogoPreview = document.getElementById('currentLogoPreview');
    const logoutBtn = document.getElementById('logoutBtn');

    onAuthStateChanged(auth, user => {
        if (!user || sessionStorage.getItem('loggedIn') !== 'true') {
            window.location.href = 'index.html'; // Redirect if not logged in
        }
    });

    logoutBtn.addEventListener('click', async () => {
        sessionStorage.removeItem('loggedIn');
        await signOut(auth);
    });

    const unsubscribe = onSnapshot(IMAGES_DOC_REF, (docSnap) => {
        if (docSnap.exists() && docSnap.data().logoUrl) {
            const logoUrl = docSnap.data().logoUrl;
            currentLogoPreview.innerHTML = `<img src="${logoUrl}" alt="Current Company Logo">`;
        } else {
            currentLogoPreview.innerHTML = `<p class="text-gray-500">No logo uploaded yet.</p>`;
        }
    });

    uploadLogoBtn.addEventListener('click', async () => {
        const file = logoUploadInput.files[0];
        if (!file) {
            uploadMessage.textContent = "Please select a file to upload.";
            uploadMessage.classList.remove('hidden');
            uploadMessage.classList.add('error');
            return;
        }

        const storageRef = ref(storage, LOGO_STORAGE_PATH);
        try {
            await uploadBytes(storageRef, file);
            const downloadURL = await getDownloadURL(storageRef);

            await setDoc(IMAGES_DOC_REF, { logoUrl: downloadURL });
            uploadMessage.textContent = "Logo uploaded successfully!";
            uploadMessage.classList.remove('hidden');
            uploadMessage.classList.add('success');
        } catch (error) {
            console.error("Error uploading logo:", error);
            uploadMessage.textContent = `Upload failed: ${error.message}`;
            uploadMessage.classList.remove('hidden');
            uploadMessage.classList.add('error');
        }
    });
});
