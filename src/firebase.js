import { initializeApp } from "firebase/app";
import { getFirestore} from "firebase/firestore";
import { getStorage } from "firebase/storage";



// TODO: Add SDKs for Firebase products that you want to use

// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration

const firebaseConfig = {

  apiKey: "AIzaSyD2S9iiEd6yfp92WYQ0Z9i8J-wQgc68gQA",

  authDomain: "todo-app-72980.firebaseapp.com",

  projectId: "todo-app-72980",

  storageBucket: "todo-app-72980.appspot.com",

  messagingSenderId: "425582183696",

  appId: "1:425582183696:web:392f3418778cc34ea99195"

};



const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const storage = getStorage(app)