import "./App.css";
import React, { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  doc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import "firebase/firestore";
import { db, storage } from "./firebase";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Todo from "./components/Todo/Todo";

const emptyTodo = {
  name: "",
  description: "",
  dueDate: "",
  isCompleted: false,
};

function App() {
  const [file, setFile] = useState("");
  const [todosDb, setTodosDb] = useState([]);
  const [todo, setTodo] = useState({
    name: "",
    description: "",
    dueDate: "",
    isCompleted: false,
  });

  const { name, description, dueDate } = todo;
  const [uploadProgress, setUploadProgress] = useState(null);

  const [todos, setTodos] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, "todos"),
      (snapShot) => {
        let list = [];
        snapShot.docs.forEach((doc) => {
          list.push({ ...doc.data(), id: doc.id });
        });
        setTodosDb(list);
      },
      (error) => {
        console.log(error);
      }
    );

    return () => {
      unsub();
    };
  }, []);

  useEffect(() => {
    const uploadFile = () => {
      const storageRef = ref(
        storage,
        `files/${new Date().getTime() + file.name}`
      );

      const uploadTask = uploadBytesResumable(storageRef, file);

      // Register three observers:
      // 1. 'state_changed' observer, called any time the state changes
      // 2. Error observer, called on failure
      // 3. Completion observer, called on successful completion
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Observe state change events such as progress, pause, and resume
          // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
          setUploadProgress(progress);
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
            default:
              break;
          }
        },
        (error) => {
          console.log(error);
        },
        () => {
          // Handle successful uploads on complete
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setTodo((prev) => ({ ...prev, file: downloadURL }));
          });
        }
      );
    };
    file && uploadFile();
  }, [file]);

  function handleChange(e) {
    const { name, value } = e.target;
    setTodo((prevState) => ({ ...prevState, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTodos([...todos, todo]);
    try {
      const docRef = await addDoc(collection(db, "todos"), {
        name: todo.name,
        description: todo.description,
        dueDate: todo.dueDate,
        isCompleted: false,
        file: todo.file,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    setTodo(emptyTodo);
  }

  async function handleDeleteTask(id) {
    const userDoc = doc(db, "todos", id);
    await deleteDoc(userDoc);
  }

  async function toggleCheckbox(id, isCompleted) {
    const userDoc = doc(db, "todos", id);
    const updatedField = { isCompleted: !isCompleted };
    console.log("isCompleted", isCompleted);
    await updateDoc(userDoc, updatedField);
  }

  return (
    <div className="wrapper">
      <div className="page">
        <h1 className="title">Todo List</h1>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="from-input"
            placeholder="Название"
            name="name"
            value={name || ""}
            onChange={handleChange}
          />
          <input
            className="from-input"
            placeholder="Описание"
            name="description"
            value={description || ""}
            onChange={handleChange}
          />
          <input
            type="date"
            className="from-input"
            placeholder="Дата завершения"
            name="dueDate"
            value={dueDate || ""}
            onChange={handleChange}
          />
          <input
            type="file"
            className="from-input"
            name="file"
            onChange={(e) => setFile(e.target.files[0])}
          />
          <button
            disabled={uploadProgress !== null && uploadProgress < 100}
            className="submit-btn"
          >
            Сохранить
          </button>
        </form>

        <div className="body">
          <ul className="body__container">
            {todosDb.map((todoItem) => (
              <Todo
                todoItem={todoItem}
                key={todoItem.id}
                toggleCheckbox={toggleCheckbox}
                handleDeleteTask={handleDeleteTask}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
