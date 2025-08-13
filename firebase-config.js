import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-app.js";
import { getAuth, signOut, signInWithCustomToken, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import { getFirestore, doc, getDoc, collection, getDocs, deleteDoc, setDoc, query, where, orderBy, addDoc, serverTimestamp, updateDoc } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";

// --- Your Web App's Firebase Configuration ---
const firebaseConfig = {
    apiKey: "AIzaSyCw4nE6cvBJ9QmPp8wxyL-Jdm6hWQ0dVjs",
    authDomain: "icea-lion-qa.firebaseapp.com",
    projectId: "icea-lion-qa",
    storageBucket: "icea-lion-qa.firebasestorage.app",
    messagingSenderId: "820082472004",
    appId: "1:820082472004:web:8caddf941e1b5b667faf811",
    measurementId: "G-1RJJTT3QET"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

window.firebase = {
    auth: auth,
    db: db,
    firebaseConfig: firebaseConfig,
    appId: "1:820082472004:web:8caddf941e1b5b667faf811",
    fs: {
        collection,
        doc,
        getDoc,
        getDocs,
        deleteDoc,
        setDoc,
        query,
        where,
        orderBy,
        addDoc,
        serverTimestamp,
        updateDoc,
    }
};

// Global variables for user state
window.currentUserId = null;
window.currentUserRole = null;
window.currentUserName = null;
window.isAuthReady = false;
window.userEmail = null;
window.userPhoto = null;

onAuthStateChanged(auth, async (user) => {
    if (user) {
        window.currentUserId = user.uid;
        window.userEmail = user.email;

        // Fetch user profile from Firestore to get name and role
        const userDocRef = doc(db, `artifacts/${window.firebase.appId}/users`, user.uid);
        try {
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                window.currentUserRole = userData.role;
                window.currentUserName = userData.name;
            } else {
                console.warn("User profile not found in Firestore. Assuming default role.");
                window.currentUserRole = 'agent';
                window.currentUserName = user.email;
            }
        } catch (error) {
            console.error("Error fetching user role from Firestore:", error);
            window.currentUserRole = 'agent';
            window.currentUserName = user.email;
        }

        console.log(`User logged in: ${window.currentUserName} (${window.currentUserRole})`);
    } else {
        window.currentUserId = null;
        window.currentUserRole = null;
        window.currentUserName = null;
        window.userEmail = null;
        console.log("No user is logged in.");
    }
    window.isAuthReady = true;
    document.dispatchEvent(new CustomEvent('firebaseAuthReady'));
});


// Message Box functions
window.showMessageBox = function(title, message, isError = false, showSpinner = false, showCloseButton = true, onClose = null) {
    const messageBoxOverlay = document.getElementById('messageBoxOverlay');
    const messageBoxSpinner = document.getElementById('messageBoxSpinner');
    const messageBoxTitle = document.getElementById('messageBoxTitle');
    const messageBoxContent = document.getElementById('messageBoxContent');
    const messageBoxCloseBtn = document.getElementById('messageBoxCloseBtn');

    messageBoxTitle.textContent = title;
    messageBoxContent.textContent = message;
    
    if (messageBoxOverlay) {
        messageBoxOverlay.classList.remove('hidden');
        if (messageBoxSpinner) messageBoxSpinner.classList.toggle('hidden', !showSpinner);
        if (messageBoxCloseBtn) messageBoxCloseBtn.classList.toggle('hidden', !showCloseButton);

        if (isError) {
            if (messageBoxTitle) messageBoxTitle.style.color = '#dc2626';
        } else {
            if (messageBoxTitle) messageBoxTitle.style.color = '#1a73e8';
        }

        if (messageBoxCloseBtn) {
            messageBoxCloseBtn.onclick = () => {
                if (messageBoxOverlay) messageBoxOverlay.classList.add('hidden');
                if (onClose) onClose();
            };
        }
    }
};

window.hideMessageBox = function() {
    const messageBoxOverlay = document.getElementById('messageBoxOverlay');
    if (messageBoxOverlay) messageBoxOverlay.classList.add('hidden');
};
