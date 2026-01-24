import React from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheckCircle, FaRegCircle, FaClipboardList } from 'react-icons/fa';

/**
 * SENTINEL TASK ORCHESTRATOR
 * Real-time operational task tracking and execution management.
 */
const TodoSection = ({ todos, openModal, toggleTodo, deleteTodo }) => {
    return (
        <div className="animate-fade-in">
            <header className="admin-page-header">
                <div className="admin-page-title">
                    <h1>TASK <span>ORCHESTRATOR</span></h1>
                    <p>Total operational objectives: {todos.length} entries tracked</p>
                </div>
                <div className="admin-action-bar" style={{ margin: 0 }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => openModal('todo')}>
                        <FaPlus /> INITIALIZE OBJECTIVE
                    </button>
                </div>
            </header>

            <div className="admin-card">
                <div className="admin-list-container">
                    {todos.map(todo => (
                        <div key={todo.id} className={`admin-todo-item ${todo.completed ? 'completed' : 'active'}`}>
                            <div onClick={() => toggleTodo(todo.id)} style={{ cursor: 'pointer', marginRight: '1.25rem', display: 'flex', alignItems: 'center' }}>
                                {todo.completed ? (
                                    <div className="summary-icon-box" style={{ background: '#ecfdf5', color: 'var(--admin-success)', width: '36px', height: '36px' }}>
                                        <FaCheckCircle size={18} />
                                    </div>
                                ) : (
                                    <div className="summary-icon-box" style={{ background: '#f8fafc', border: '2px solid var(--admin-border)', width: '36px', height: '36px' }}>
                                        <FaRegCircle size={18} color="var(--admin-border)" />
                                    </div>
                                )}
                            </div>

                            <div className="admin-todo-text">
                                <span className={todo.completed ? 'completed' : ''}>
                                    {todo.text}
                                </span>
                                {todo.completed && (
                                    <div className="admin-status-indicator success">OBJECTIVE SECURED</div>
                                )}
                            </div>

                            <div className="todo-actions" style={{ display: 'flex', gap: '0.6rem' }}>
                                <button onClick={() => openModal('todo', todo)} className="f-exam-card" style={{ padding: '0.5rem', background: 'white' }} title="Recalibrate Scope"><FaEdit /></button>
                                <button onClick={() => deleteTodo(todo.id)} className="f-cancel-btn" style={{ padding: '0.5rem' }} title="Purge Record"><FaTrash /></button>
                            </div>
                        </div>
                    ))}

                    {todos.length === 0 && (
                        <div className="admin-empty-state">
                            <FaClipboardList className="admin-empty-icon" />
                            <h2 className="admin-empty-title">NO PENDING OBJECTIVES</h2>
                            <p className="admin-empty-text">System operational state is clear. Excellent orchestration.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TodoSection;
