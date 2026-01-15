import React from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaRegCircle } from 'react-icons/fa';

const TodoSection = ({ todos, openModal, toggleTodo, deleteTodo }) => {
    return (
        <div className="section-container">
            <div className="actions-bar center">
                <button className="btn-primary" onClick={() => openModal('todo')}>
                    <FaPlus /> New Task
                </button>
            </div>
            <div className="todo-list">
                {todos.map(todo => (
                    <div key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                        <div onClick={() => toggleTodo(todo.id)} style={{ cursor: 'pointer', marginRight: '1rem', display: 'flex', alignItems: 'center' }}>
                            {todo.completed ? <FaCheckCircle color="#10b981" /> : <FaRegCircle color="#cbd5e1" />}
                        </div>
                        <span className="todo-text">{todo.text}</span>
                        <div className="todo-actions">
                            <button onClick={() => openModal('todo', todo)}><FaEdit /></button>
                            <button onClick={() => deleteTodo(todo.id)} className="danger"><FaTrash /></button>
                        </div>
                    </div>
                ))}
                {todos.length === 0 && <p className="empty-state">No tasks pending. Great job!</p>}
            </div>
        </div>
    );
};

export default TodoSection;
