import './App.css';
import React, {useState, useEffect} from 'react';
import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, onSnapshot  } from "firebase/firestore"; 
import {useCollectionData} from 'react-firebase-hooks/firestore';
import 'firebase/firestore'
import {db, storage} from './firebase';
import {ref, uploadBytes, uploadBytesResumable, getDownloadURL} from 'firebase/storage';
import docPicture from './images/doc.svg'



const emptyTodo = {
  name: '',
  description: '',
  dueDate: '',
  isCompleted: false,
}

function App() {

   
  const [fileUpload, setFileUpload] = useState('')
  const [file, setFile] = useState('')
  const [todosDb, setTodosDb] = useState([])
  const [todo, setTodo] = useState({
    name: '',
    description: '',
    dueDate: '',
    isCompleted: false,
  });

  const {name, description, dueDate} = todo
  const [uploadProgress, setUploadProgress] = useState(null)
  
  const [todos, setTodos] = useState([]);
  console.log('todosDb', todosDb)
 

  
  useEffect(() => {
    //const getTodos = async() => {
    //  const data = await getDocs(collection(db, 'todos'));
    //  setTodosDb(data.docs.map((doc) => ({...doc.data(), id: doc.id})))
    //}
//
    //getTodos()

    const unsub = onSnapshot(collection(db, "todos"), (snapShot) => {
      let list = [];
      snapShot.docs.forEach((doc) => {
        list.push({...doc.data(), id: doc.id})
      })
      setTodosDb(list);
    },
    (error) => {
      console.log(error)
    }
    );

    return() => {
      unsub()
    }
  }, [])


  function handleChange(e) {
    const {name, value} = e.target;
    setTodo((prevState) => ({ ...prevState, [name]: value}))
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setTodos([...todos, todo])
    try {
      const docRef = await addDoc(collection(db, "todos"), {
        name: todo.name,
        description: todo.description,
        dueDate: todo.dueDate,
        isCompleted: false,
        file: todo.file
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (e) {
      console.error("Error adding document: ", e);
    }
    setTodo(emptyTodo)
  }

  async function handleDeleteTask(id) {
    //setTodos((state) => state.filter((todo) => todo.id !== id))
    const userDoc = doc(db, 'todos', id);
    await deleteDoc(userDoc)

  }


  //function handleCkeckbox(id) {
  //  const copy = [...todos]
  //  const current = copy.find((item) => item.id === id)
  //  current.isCompleted = !current.isCompleted
  //  setTodos(copy)
  //}

  async function toggleCheckbox(id, isCompleted) {
    const userDoc = doc(db, 'todos', id);
    const updatedField = {'isCompleted': !isCompleted}
    console.log('isCompleted', isCompleted)
    await updateDoc(userDoc, updatedField)
  }
 
 //function uploadFile() {
 //  if (fileUpload == null) return;
 //  const fileRef = ref(storage, `files/${fileUpload.name + new Date().getTime()}`)
 //  const uploadFile = uploadBytes(fileRef, fileUpload)
 //  console.log('uploadFile', uploadFile)
 //}


 useEffect(() => {
  const uploadFile = () => {
    const storageRef = ref(storage, `files/${new Date().getTime() + file.name}`)

    const uploadTask = uploadBytesResumable(storageRef, file);
  
    // Register three observers:
    // 1. 'state_changed' observer, called any time the state changes
    // 2. Error observer, called on failure
    // 3. Completion observer, called on successful completion
    uploadTask.on('state_changed', 
      (snapshot) => {
        // Observe state change events such as progress, pause, and resume
        // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
        setUploadProgress(progress)
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused');
            break;
          case 'running':
            console.log('Upload is running');
            break;
          default:
            break;
        }
      }, 
      (error) => {
        console.log(error)
      }, 
      () => {
        // Handle successful uploads on complete
        // For instance, get the download URL: https://firebasestorage.googleapis.com/...
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setTodo((prev) => ({...prev, file: downloadURL}))
        });
      }
    );
  }
  
 file && uploadFile()
 }, [file])


console.log('todo', todo)
console.log('file', file)

  return (
    <div className="wrapper">
      <div className='page'>
        <h1 className='title'>Todo List</h1>
        <form className='form' onSubmit={handleSubmit}>
          <input className='from-input' placeholder='Название' name='name' value={name || ''} onChange={handleChange}/>
          <input className='from-input' placeholder='Описание' name='description' value={description || ''} onChange={handleChange}/>
          <input type='date' className='from-input' placeholder='Дата завершения' name='dueDate' value={dueDate || ''} onChange={handleChange}/>
          <input type='file' className='from-input' name='file' onChange={(e) =>setFile(e.target.files[0])}/>
          <button disabled={uploadProgress !== null && uploadProgress < 100} className='submit-btn'>Сохранить</button>
        </form>

        <div className='body'>

          {
            todosDb.map((todoItem) => (
            <div className='task' key={todoItem.id}>
              <button className={`${todoItem.isCompleted ? 'checkbox-checked' : 'checkbox'}`} onClick={() => toggleCheckbox(todoItem.id, todoItem.isCompleted)}></button>
              <div className='task__container'>
              <div className='task__header'>
                <div className={`'task__title' ${todoItem.isCompleted ? 'task__item_done' : ''}`}>{todoItem.name}</div>
                <div className='task__due-date'>{todoItem.dueDate}</div>
              </div>
              <div className='task__body'>
                <div className={`'task__description' ${todoItem.isCompleted ? 'task__item_done' : ''}`}>{todoItem.description}</div>
                { todoItem.file &&
                  <div className='task__doc'>
                    <a href={todoItem.file} target='_blank' rel="noreferrer"><img className='task__doc-pic' src={docPicture} alt='Значок документа для скачивания'/></a>
                  </div>
                }
              </div>
              </div>
              
              <button className='delete-btn' onClick={()=> handleDeleteTask(todoItem.id)} ></button>
            </div>
          ))
          }

          
        </div>
      </div>
      
    </div>
  );
}

export default App;
