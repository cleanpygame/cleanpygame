import {initializeApp} from 'firebase/app';
import {getAuth} from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyA3slyeaQPyZoslSEa8tVYaa2dxZREOjeI",
    authDomain: "cleanpygame.firebaseapp.com",
    projectId: "cleanpygame",
    storageBucket: "cleanpygame.firebasestorage.app",
    messagingSenderId: "112429030567",
    appId: "1:112429030567:web:18798b8af61858ab7d8f82",
    measurementId: "G-JCN6ZHYVPR"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);

export default app;