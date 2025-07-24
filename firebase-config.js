if (typeof firebase === 'undefined') {
  console.error(
    'Firebase SDK not loaded. Please include Firebase scripts in your HTML.'
  );
} else if (typeof window.firebaseConfig === 'undefined') {
  console.error(
    'Firebase config not found. Please create firebase-secrets.js and load it before this file.'
  );
} else {
  firebase.initializeApp(window.firebaseConfig);
}
