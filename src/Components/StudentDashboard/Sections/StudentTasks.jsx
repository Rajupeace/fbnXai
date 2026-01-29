import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaTrash, FaCheckCircle, FaRegCircle, FaClipboardList, FaBullhorn, FaCalendarDay } from 'react-icons/fa';
import { apiPost, apiPut, apiDelete } from '../../../utils/apiClient';

const StudentTasks = ({ tasks, userData, onRefresh }) => {
    const [newTask, setNewTask] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [filter, setFilter] = useState('active'); // active, completed, all

    const handleAddTask = async (e) => {
        e.preventDefault();
        if (!newTask.trim()) return;

        try {
            await apiPost('/api/todos', {
                text: newTask,
                target: 'student',
                userId: userData.sid,
                dueDate: new Date(Date.now() + 86400000) // Tomorrow default
            });
            setNewTask('');
            setIsAdding(false);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Failed to add task:', error);
        }
    };

    const toggleTask = async (task) => {
        try {
            await apiPut(`/api/todos/${task._id}`, { completed: !task.completed });
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Failed to toggle task:', error);
        }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await apiDelete(`/api/todos/${taskId}`);
            if (onRefresh) onRefresh();
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'active') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    });

    return (
        <div className="tasks-page">
            <header className="page-section-header">
                <div>
                    <h2 className="title-with-icon">
                        <FaClipboardList className="header-icon" />
                        MY <span>PRIORITY</span> TASKS
                    </h2>
                    <p className="subtitle">Manage your daily goals and academic action items.</p>
                </div>
                <div className="task-filters">
                    {['active', 'completed', 'all'].map(f => (
                        <button
                            key={f}
                            className={`filter-btn ${filter === f ? 'active' : ''}`}
                            onClick={() => setFilter(f)}
                        >
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>
            </header>

            <div className="tasks-grid">
                <div className="add-task-card glass-panel animate-slide-in">
                    <h3><FaPlus /> QUICK ADD</h3>
                    <form onSubmit={handleAddTask}>
                        <input
                            type="text"
                            placeholder="What needs to be done?"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            onFocus={() => setIsAdding(true)}
                        />
                        <AnimatePresence>
                            {isAdding && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="add-task-expanded"
                                >
                                    <div className="date-hint">
                                        <FaCalendarDay /> Due tomorrow by default
                                    </div>
                                    <div className="form-actions">
                                        <button type="button" className="cancel-btn" onClick={() => { setIsAdding(false); setNewTask(''); }}>Cancel</button>
                                        <button type="submit" className="save-btn">CREATE TASK</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>
                </div>

                <div className="task-list-wrapper">
                    {filteredTasks.length > 0 ? (
                        <div className="task-items-container">
                            {filteredTasks.map((task, idx) => (
                                <motion.div
                                    key={task._id}
                                    className={`nexus-task-item glass-panel ${task.completed ? 'completed' : ''}`}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <div className="task-main" onClick={() => toggleTask(task)}>
                                        <div className="check-box">
                                            {task.completed ? <FaCheckCircle className="checked" /> : <FaRegCircle />}
                                        </div>
                                        <div className="task-content">
                                            <span className="task-text">{task.text}</span>
                                            <div className="task-meta">
                                                {task.userId === null ? (
                                                    <span className="global-badge"><FaBullhorn /> Global Reminder</span>
                                                ) : (
                                                    <span className="personal-badge">Personal Task</span>
                                                )}
                                                {task.dueDate && (
                                                    <span className="due-date">Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {task.userId === userData.sid && (
                                        <button className="task-delete-btn" onClick={() => deleteTask(task._id)} title="Delete Task">
                                            <FaTrash />
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-tasks glass-panel">
                            <FaClipboardList className="empty-icon" />
                            <h4>No {filter} tasks found.</h4>
                            <p>You're all caught up! Add a new task to stay organized.</p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                .tasks-page { padding: 1rem; }
                .task-filters { display: flex; gap: 0.5rem; }
                .filter-btn {
                    padding: 0.5rem 1rem;
                    border-radius: 20px;
                    border: 1px solid var(--nexus-border);
                    background: white;
                    color: #64748b;
                    font-size: 0.7rem;
                    font-weight: 800;
                    cursor: pointer;
                    transition: 0.2s;
                }
                .filter-btn.active {
                    background: var(--nexus-primary);
                    color: white;
                    border-color: var(--nexus-primary);
                }
                
                .tasks-grid {
                    display: grid;
                    grid-template-columns: 350px 1fr;
                    gap: 2rem;
                    margin-top: 2rem;
                }
                
                @media (max-width: 900px) {
                    .tasks-grid { grid-template-columns: 1fr; }
                }

                .add-task-card {
                    padding: 1.5rem;
                    height: fit-content;
                    position: sticky;
                    top: 1rem;
                }
                .add-task-card h3 {
                    font-size: 0.9rem;
                    font-weight: 950;
                    color: var(--nexus-secondary);
                    margin-bottom: 1.5rem;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .add-task-card input {
                    width: 100%;
                    padding: 1rem;
                    border-radius: 12px;
                    border: 1px solid var(--nexus-border);
                    background: #f8fafc;
                    font-size: 0.9rem;
                    font-weight: 600;
                    outline: none;
                }
                .add-task-expanded { overflow: hidden; }
                .date-hint {
                    margin-top: 1rem;
                    font-size: 0.75rem;
                    color: #94a3b8;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    font-weight: 600;
                }
                .form-actions {
                    margin-top: 1.5rem;
                    display: flex;
                    gap: 1rem;
                }
                .save-btn {
                    flex: 1;
                    padding: 0.8rem;
                    background: var(--nexus-primary);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.8rem;
                    cursor: pointer;
                }
                .cancel-btn {
                    padding: 0.8rem 1.2rem;
                    background: #f1f5f9;
                    color: #64748b;
                    border: none;
                    border-radius: 12px;
                    font-weight: 800;
                    font-size: 0.8rem;
                    cursor: pointer;
                }

                .nexus-task-item {
                    display: flex;
                    align-items: center;
                    padding: 1.2rem;
                    margin-bottom: 1rem;
                    transition: 0.3s;
                    border: 1px solid transparent;
                }
                .nexus-task-item:hover {
                    border-color: var(--nexus-primary);
                    transform: translateX(5px);
                }
                .nexus-task-item.completed {
                    opacity: 0.6;
                }
                .task-main {
                    flex: 1;
                    display: flex;
                    gap: 1rem;
                    align-items: flex-start;
                    cursor: pointer;
                }
                .check-box {
                    font-size: 1.25rem;
                    color: #cbd5e1;
                    margin-top: 0.2rem;
                }
                .check-box .checked { color: var(--nexus-primary); }
                .task-text {
                    font-weight: 700;
                    color: var(--nexus-secondary);
                    font-size: 1rem;
                    display: block;
                }
                .completed .task-text { text-decoration: line-through; }
                .task-meta {
                    margin-top: 0.5rem;
                    display: flex;
                    gap: 1rem;
                    font-size: 0.65rem;
                    font-weight: 800;
                }
                .global-badge { color: #f59e0b; background: #fffbeb; padding: 2px 8px; border-radius: 4px; }
                .personal-badge { color: var(--nexus-primary); background: #eff6ff; padding: 2px 8px; border-radius: 4px; }
                .due-date { color: #94a3b8; }
                
                .task-delete-btn {
                    background: none;
                    border: none;
                    color: #cbd5e1;
                    cursor: pointer;
                    padding: 0.5rem;
                    border-radius: 8px;
                    transition: 0.2s;
                }
                .task-delete-btn:hover {
                    color: #ef4444;
                    background: #fef2f2;
                }

                .empty-tasks {
                    padding: 4rem;
                    text-align: center;
                }
                .empty-icon { font-size: 3rem; color: #e2e8f0; margin-bottom: 1rem; }
                .empty-tasks h4 { font-weight: 950; color: var(--nexus-secondary); margin-bottom: 0.5rem; }
                .empty-tasks p { font-size: 0.85rem; color: #94a3b8; font-weight: 600; }
            `}</style>
        </div>
    );
};

export default StudentTasks;
