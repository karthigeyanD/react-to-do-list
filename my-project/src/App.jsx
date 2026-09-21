import { useState, useRef, useEffect } from 'react'
import './App.css'

const FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  COMPLETED: 'completed',
}

function App() {
  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem('taskflow-tasks')
      return saved ? JSON.parse(saved) : []
    } catch {
      return []
    }
  })
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState(FILTERS.ALL)
  const [removingId, setRemovingId] = useState(null)
  const inputRef = useRef(null)

  // Persist tasks to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow-tasks', JSON.stringify(tasks))
  }, [tasks])

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const addTask = () => {
    const text = inputValue.trim()
    if (!text) return

    const newTask = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setTasks((prev) => [newTask, ...prev])
    setInputValue('')
    inputRef.current?.focus()
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addTask()
  }

  const toggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    )
  }

  const deleteTask = (id) => {
    setRemovingId(id)
    setTimeout(() => {
      setTasks((prev) => prev.filter((task) => task.id !== id))
      setRemovingId(null)
    }, 250)
  }

  const clearCompleted = () => {
    setTasks((prev) => prev.filter((task) => !task.completed))
  }

  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.completed).length
  const activeTasks = totalTasks - completedTasks

  const filteredTasks = tasks.filter((task) => {
    if (filter === FILTERS.ACTIVE) return !task.completed
    if (filter === FILTERS.COMPLETED) return task.completed
    return true
  })

  const emptyMessages = {
    [FILTERS.ALL]: {
      icon: '✨',
      title: 'No tasks yet',
      text: 'Add your first task above to get started!',
    },
    [FILTERS.ACTIVE]: {
      icon: '🎉',
      title: 'All done!',
      text: 'You have no active tasks. Great work!',
    },
    [FILTERS.COMPLETED]: {
      icon: '📋',
      title: 'Nothing completed yet',
      text: 'Complete some tasks and they\'ll show up here.',
    },
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header__logo">
          <div className="header__icon">✓</div>
          <h1 className="header__title">TaskFlow</h1>
        </div>
        <p className="header__subtitle">Organize your day, one task at a time</p>
      </header>

      {/* Stats */}
      <div className="stats">
        <div className="stats__card" id="stats-total">
          <div className="stats__number stats__number--primary">{totalTasks}</div>
          <div className="stats__label">Total</div>
        </div>
        <div className="stats__card" id="stats-active">
          <div className="stats__number stats__number--accent">{activeTasks}</div>
          <div className="stats__label">Active</div>
        </div>
        <div className="stats__card" id="stats-completed">
          <div className="stats__number stats__number--success">{completedTasks}</div>
          <div className="stats__label">Done</div>
        </div>
      </div>

      {/* Input */}
      <div className="input-area">
        <input
          ref={inputRef}
          id="task-input"
          className="input-area__field"
          type="text"
          placeholder="What needs to be done?"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          maxLength={200}
          aria-label="New task"
        />
        <button
          id="add-task-btn"
          className="input-area__btn"
          onClick={addTask}
          disabled={!inputValue.trim()}
          aria-label="Add task"
        >
          <span>+</span> Add
        </button>
      </div>

      {/* Filters */}
      <div className="filters" role="tablist" aria-label="Task filters">
        {Object.values(FILTERS).map((f) => (
          <button
            key={f}
            id={`filter-${f}`}
            className={`filters__btn ${filter === f ? 'filters__btn--active' : ''}`}
            onClick={() => setFilter(f)}
            role="tab"
            aria-selected={filter === f}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Task List */}
      {filteredTasks.length > 0 ? (
        <ul className="task-list" role="list" aria-label="Tasks">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className={`task-item ${task.completed ? 'task-item--completed' : ''} ${
                removingId === task.id ? 'task-item--removing' : ''
              }`}
            >
              <label className="task-item__checkbox">
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => toggleTask(task.id)}
                  aria-label={`Mark "${task.text}" as ${task.completed ? 'active' : 'completed'}`}
                />
                <span className="task-item__checkmark">✓</span>
              </label>
              <span className="task-item__text">{task.text}</span>
              <button
                className="task-item__delete"
                onClick={() => deleteTask(task.id)}
                aria-label={`Delete "${task.text}"`}
                title="Delete task"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="empty-state" id="empty-state">
          <div className="empty-state__icon">{emptyMessages[filter].icon}</div>
          <div className="empty-state__title">{emptyMessages[filter].title}</div>
          <div className="empty-state__text">{emptyMessages[filter].text}</div>
        </div>
      )}

      {/* Clear Completed */}
      {completedTasks > 0 && (
        <button
          id="clear-completed-btn"
          className="clear-btn"
          onClick={clearCompleted}
        >
          Clear {completedTasks} completed {completedTasks === 1 ? 'task' : 'tasks'}
        </button>
      )}

      {/* Footer */}
      <footer className="footer">
        TaskFlow — Built with React + Vite
      </footer>
    </div>
  )
}

export default App
