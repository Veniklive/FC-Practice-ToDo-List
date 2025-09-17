document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("task-form");
  const input = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");

  if (!form || !input || !taskList) return;

  const BASE = "http://localhost:3000";

  async function api(path, options = {}) {
    try {
      const res = await fetch(BASE + path, options);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.error("API error:", err);
      throw err;
    }
  }

  (async function init() {
    try {
      const tasks = await api("/tasks");
      if (!tasks) return;
      tasks.forEach((task, index) => addTaskToDOM(task, index));
    } catch (err) {
      console.error("Init error:", err);
    }
  })();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      const text = input.value.trim();
      if (!text) return;

      const tempTask = addTaskToDOM({ text, completed: false });

      const saved = await api("/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (saved) {
        const newIndex = Array.isArray(saved)
          ? saved.length - 1
          : saved.id ?? null;
        if (newIndex !== null) tempTask.dataset.index = newIndex;
      }

      input.value = "";
    } catch (err) {
      console.error("Submit handler error:", err);
    }
  }

  form.addEventListener("submit", handleSubmit);

  input.addEventListener("keydown", (ev) => {
    if (ev.key === "Enter") {
      ev.preventDefault();
      handleSubmit(new Event("submit-from-enter"));
    }
  });

  function addTaskToDOM(task, index = null) {
    const li = document.createElement("li");
    if (task.completed) li.classList.add("completed");
    if (index !== null) li.dataset.index = index;

    const checkbox = document.createElement("button");
    checkbox.type = "button";
    checkbox.classList.add("checkbox");
    if (task.completed) {
      checkbox.classList.add("checked");
      checkbox.textContent = "✓";
    }
    checkbox.addEventListener("click", async () => {
      li.classList.toggle("completed");
      checkbox.classList.toggle("checked");
      checkbox.textContent = checkbox.classList.contains("checked") ? "✓" : "";

      const idx = li.dataset.index;
      if (idx !== undefined) {
        try {
          await api(`/tasks/${idx}`, { method: "PUT" });
        } catch (err) {
          console.error("Error updating task:", err);
        }
      }
    });

    const span = document.createElement("span");
    span.textContent = task.text;

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.textContent = "✕";
    deleteBtn.classList.add("delete-btn");
    deleteBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      const idx = li.dataset.index;
      li.remove();
      if (idx !== undefined) {
        try {
          await api(`/tasks/${idx}`, { method: "DELETE" });
        } catch (err) {
          console.error("Error deleting task:", err);
        }
      }
    });

    li.appendChild(checkbox);
    li.appendChild(span);
    li.appendChild(deleteBtn);
    taskList.appendChild(li);

    return li;
  }
});
