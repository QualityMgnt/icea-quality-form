import { initializeApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// Your Firebase Config here
const firebaseConfig = { /* ... */ };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const DROPDOWN_DATA_DOC_REF = doc(db, 'artifacts/your-app-id/public/data/dropdown_options', 'general_options');
const USERS_PROFILE_COLLECTION_PATH = 'artifacts/your-app-id/users';

document.addEventListener('DOMContentLoaded', async () => {
    const signupForm = document.getElementById('signupForm');
    const cerNameDropdown = document.getElementById('cerNameDropdown');
    const signupEmailInput = document.getElementById('signupEmail');
    const signupPasswordInput = document.getElementById('signupPassword');
    const signupMessage = document.getElementById('signupMessage');

    // Populate the dropdown with CER Names from Firestore
    try {
        const docSnap = await getDoc(DROPDOWN_DATA_DOC_REF);
        if (docSnap.exists() && docSnap.data().cerNames) {
            docSnap.data().cerNames.forEach(cer => {
                const option = document.createElement('option');
                option.value = cer.name;
                option.textContent = cer.name;
                cerNameDropdown.appendChild(option);
            });
        }
    } catch (error) {
        console.error("Error populating names dropdown:", error);
    }

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const selectedName = cerNameDropdown.value;
        const email = signupEmailInput.value;
        const password = signupPasswordInput.value;
        const role = 'Agent'; // Default role for new sign-ups

        if (!selectedName || !email || !password) {
            signupMessage.textContent = 'Please fill all fields.';
            signupMessage.classList.remove('hidden');
            return;
        }

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Create a user profile in Firestore
            await setDoc(doc(db, USERS_PROFILE_COLLECTION_PATH, user.uid), {
                name: selectedName,
                email: email,
                role: role,
                createdAt: new Date()
            });

            signupMessage.textContent = 'Registration successful! Redirecting to login...';
            signupMessage.classList.remove('hidden');
            signupMessage.classList.add('success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 2000);
        } catch (error) {
            console.error("Sign up error:", error);
            signupMessage.textContent = `Error: ${error.message}`;
            signupMessage.classList.remove('hidden');
            signupMessage.classList.add('error');
        }
    });
});
