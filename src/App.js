import "./App.css";
import React, { useState, useEffect, useRef } from "react";
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
  const [expiredTodos, setExpiredTodos] = useState([]);
  const fileInputRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(
      // get realtime updates
      collection(db, "todos"),
      (snapShot) => {
        let list = [];
        const expiredTasks = [];
        snapShot.docs.forEach((doc) => {
          const docDate = new Date(doc.data().dueDate);
          //get actual date and due date of the task without hours and minutes
          const docDateWithoutHours = new Date(docDate.toDateString());
          const currentDateWithoutHours = new Date(new Date().toDateString());
          if (
            docDateWithoutHours.getTime() <= currentDateWithoutHours.getTime()
          ) {
            expiredTasks.push(doc.id);
          }

          list.push({ ...doc.data(), id: doc.id });
        });
        setTodosDb(list);
        setExpiredTodos(expiredTasks);
      },
      (error) => {
        console.log(error);
        setError(true);
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

      //Monitor Upload Progress
      const uploadTask = uploadBytesResumable(storageRef, file);
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
    try {
      const docRef = await addDoc(collection(db, "todos"), {
        name: todo.name,
        description: todo.description,
        dueDate: todo.dueDate,
        isCompleted: false,
        file: todo.file || "",
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    setTodo(emptyTodo);
    fileInputRef.current.value = null;
  }

  async function handleDeleteTask(id) {
    const userDoc = doc(db, "todos", id);
    await deleteDoc(userDoc);
  }

  async function toggleCheckbox(id, isCompleted) {
    const userDoc = doc(db, "todos", id);
    const updatedField = { isCompleted: !isCompleted };
    await updateDoc(userDoc, updatedField);
  }

  const isTaskExpired = (id) => {
    const isExpired = expiredTodos.find((todoId) => {
      return todoId === id;
    });

    return Boolean(isExpired);
  };

  return (
    <div className="wrapper">
      <div className="page">
        <h1 className="title">Todo List</h1>
        <form className="form" onSubmit={handleSubmit}>
          <input
            className="from-input"
            placeholder="????????????????"
            name="name"
            value={name || ""}
            onChange={handleChange}
          />
          <input
            className="from-input"
            placeholder="????????????????"
            name="description"
            value={description || ""}
            onChange={handleChange}
          />
          <input
            type="date"
            className="from-input"
            placeholder="???????? ????????????????????"
            name="dueDate"
            value={dueDate || ""}
            onChange={handleChange}
          />
          <input
            type="file"
            className="from-input"
            name="file"
            onChange={(e) => setFile(e.target.files[0])}
            ref={fileInputRef}
          />
          <button
            disabled={uploadProgress !== null && uploadProgress < 100}
            className="submit-btn"
          >
            ??????????????????
          </button>
        </form>

        <div className="body">
          {error && <p>Server unavailable</p>}
          <ul className="body__container">
            {todosDb.map((todoItem) => (
              <Todo
                todoItem={todoItem}
                key={todoItem.id}
                toggleCheckbox={toggleCheckbox}
                handleDeleteTask={handleDeleteTask}
                isDateExpired={isTaskExpired(todoItem.id)}
              />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
