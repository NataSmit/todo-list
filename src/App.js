import './App.css';
import React, {useState, useEffect} from 'react';
const emptyTodo = {
  name: '',
  description: '',
  dueDate: '',
  file: '',
  id: ''
}

function App() {
 
  const [todo, setTodo] = useState({
    name: '',
    description: '',
    dueDate: '',
    file: '',
    isCompleted: false,
    id: ''
  });

  const {name, description, dueDate, file} = todo
  
  const [todos, setTodos] = useState([]);
  

  function handleChange(e) {
    const {name, value} = e.target;
    setTodo((prevState) => ({ ...prevState, [name]: value,  id: Date.now()}))
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTodos([...todos, todo])
    setTodo(emptyTodo)
  }

  function handleDeleteTask(id) {
    setTodos((state) => state.filter((todo) => todo.id !== id))
  }


  function handleCkeckbox(id) {
    const copy = [...todos]
    const current = copy.find((item) => item.id === id)
    current.isCompleted = !current.isCompleted
    setTodos(copy)
  }


  return (
    <div className="wrapper">
      <div className='page'>
        <form className='form' onSubmit={handleSubmit}>
          <input className='from-input' placeholder='Название' name='name' value={name || ''} onChange={handleChange}/>
          <input className='from-input' placeholder='Описание' name='description' value={description || ''} onChange={handleChange}/>
          <input type='date' className='from-input' placeholder='Дата завершения' name='dueDate' value={dueDate || ''} onChange={handleChange}/>
          <input type='file' className='from-input' placeholder='Название' name='file' value={file} onChange={handleChange}/>
          <button className='submit-btn'>Сохранить</button>
        </form>

        <div className='body'>

          {
            todos.map((todoItem, index) => (
            <div className='task' key={index}>
              <button className={`${todoItem.isCompleted ? 'checkbox-checked' : 'checkbox'}`} onClick={() => handleCkeckbox(todoItem.id)}></button>
              <div className='task__container'>
              <div className='task__header'>
                <div className='task__title'>{todoItem.name}</div>
                <div className='task__due-date'>{todoItem.dueDate}</div>
              </div>
              <div className='task__body'>
                <div className='task__description'>{todoItem.description}</div>
                <div className='task__doc'>{todoItem.file}</div>
              </div>
              </div>
              
              <button className='delete-btn' onClick={()=> handleDeleteTask(todoItem.id)} >удалить</button>
            </div>
          ))
          }

          
        </div>
      </div>
      
    </div>
  );
}

export default App;
