import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import * as firebase from 'firebase'
import 'firebase/firestore'



const firebaseConfig = {

  apiKey: "AIzaSyD2S9iiEd6yfp92WYQ0Z9i8J-wQgc68gQA",

  authDomain: "todo-app-72980.firebaseapp.com",

  projectId: "todo-app-72980",

  storageBucket: "todo-app-72980.appspot.com",

  messagingSenderId: "425582183696",

  appId: "1:425582183696:web:392f3418778cc34ea99195"

};


firebase.initializeApp(firebaseConfig);
const firestore = firebase.firestore()

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
