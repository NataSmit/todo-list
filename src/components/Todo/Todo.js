import React from "react";
import docPicture from "../../images/doc.svg";

export default function Todo({
  todoItem,
  toggleCheckbox,
  handleDeleteTask,
  isDateExpired,
}) {
  return (
    <li className={`task ${isDateExpired ? "task_type_expired" : ""}`}>
      <button
        className={`${todoItem.isCompleted ? "checkbox-checked" : "checkbox"}`}
        onClick={() => toggleCheckbox(todoItem.id, todoItem.isCompleted)}
      ></button>
      <div className="task__container">
        <div className="task__header">
          <div
            className={`'task__title' ${
              todoItem.isCompleted ? "task__item_done" : ""
            }`}
          >
            {todoItem.name}
          </div>
          <div className="task__due-date">{todoItem.dueDate}</div>
        </div>
        <div className="task__body">
          <div
            className={`'task__description' ${
              todoItem.isCompleted ? "task__item_done" : ""
            }`}
          >
            {todoItem.description}
          </div>
          {todoItem.file && (
            <div className="task__doc">
              <a href={todoItem.file} target="_blank" rel="noreferrer">
                <img
                  className="task__doc-pic"
                  src={docPicture}
                  alt="Значок документа для скачивания"
                />
              </a>
            </div>
          )}
        </div>
      </div>
      <button
        className="delete-btn"
        onClick={() => handleDeleteTask(todoItem.id)}
      ></button>
    </li>
  );
}
