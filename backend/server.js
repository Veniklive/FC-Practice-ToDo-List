const express = require("express");
const fs = require("fs");
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, "tasks.json");

const cors = require("cors");
app.use(cors());

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  if (req.method !== "GET" && req.body) {
    console.log("  body:", req.body);
  }
  next();
});

function loadTasks() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, "utf8") || "[]";
    return JSON.parse(raw);
  } catch (err) {
    console.error("Failed to read tasks:", err);
    return [];
  }
}

function saveTasks(tasks) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write tasks:", err);
  }
}

app.get("/tasks", (req, res) => {
  res.json(loadTasks());
});

app.post("/tasks", (req, res) => {
  const tasks = loadTasks();
  const text = req.body && req.body.text ? String(req.body.text).trim() : "";
  if (text) {
    tasks.push({ text, completed: false });
    saveTasks(tasks);
  }
  res.json(tasks);
});

app.put("/tasks/:id", (req, res) => {
  const tasks = loadTasks();
  const id = Number(req.params.id);
  if (Number.isFinite(id) && tasks[id]) {
    tasks[id].completed = !tasks[id].completed;
    saveTasks(tasks);
  }
  res.json(tasks);
});

app.delete("/tasks/:id", (req, res) => {
  const tasks = loadTasks();
  const id = Number(req.params.id);
  if (Number.isFinite(id) && tasks[id]) {
    tasks.splice(id, 1);
    saveTasks(tasks);
  }
  res.json(tasks);
});

app.use(express.static(__dirname));

app.listen(PORT, () => {
  console.log(`Server running: http://localhost:${PORT}`);
});
