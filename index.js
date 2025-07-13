const express = require('express');
const bodyParser = require('body-parser'); // To parse form data
const path = require('path'); // To handle file paths

const app = express();
const port = process.env.PORT || 3000; // Use environment port for Render deployment

// --- Middleware Setup ---
// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
// Set EJS as the view engine
app.set('view engine', 'ejs');
// Set the views directory
app.set('views', path.join(__dirname, 'views'));
// Parse URL-encoded bodies (from HTML forms)
app.use(bodyParser.urlencoded({ extended: true }));

// --- In-memory Data Storage (the "database" as an array) ---
let todos = []; // Array to store todo objects
let nextId = 1; // Simple ID generator

// --- Helper function to filter todos by priority ---
const filterTodosByPriority = (priority) => {
    if (priority === 'all') {
        return todos;
    }
    return todos.filter(todo => todo.priority === priority);
};

// --- Routes ---

// GET route for the home page (displaying todos)
app.get('/', (req, res) => {
    res.render('index', { todos: todos, filter: 'all' }); // Pass all todos by default
});

// POST route to add a new todo
app.post('/add', (req, res) => {
    const task = req.body.task.trim(); // Trim whitespace from input
    const priority = req.body.priority || 'medium'; // Default priority if not set

    if (task === '') {
        // Handle empty task input - you can render the page again with an error message
        // For simplicity, we'll redirect back and rely on client-side JS/alert
        return res.redirect('/');
    }

    const newTodo = {
        id: nextId++,
        task: task,
        priority: priority,
        completed: false // Optional: track completion status
    };
    todos.push(newTodo);
    res.redirect('/'); // Redirect back to the home page to see the updated list
});

// POST route to update a todo (edit)
app.post('/edit/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const updatedTask = req.body.task.trim();
    const updatedPriority = req.body.priority || 'medium';

    if (updatedTask === '') {
        // Handle empty task input during edit
        return res.redirect('/');
    }

    const todoIndex = todos.findIndex(todo => todo.id === id);

    if (todoIndex !== -1) {
        todos[todoIndex].task = updatedTask;
        todos[todoIndex].priority = updatedPriority;
    }
    res.redirect('/');
});

// POST route to delete a todo
app.post('/delete/:id', (req, res) => {
    const id = parseInt(req.params.id);
    todos = todos.filter(todo => todo.id !== id);
    res.redirect('/');
});

// GET route to filter todos by priority
app.get('/filter', (req, res) => {
    const filterPriority = req.query.priority || 'all'; // Get priority from query parameter
    const filteredTodos = filterTodosByPriority(filterPriority);
    res.render('index', { todos: filteredTodos, filter: filterPriority });
});


// --- Server Start ---
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});