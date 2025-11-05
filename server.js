const express = require("express");
const cors = require("cors");
const fs = require("fs").promises; // Use the promise-based version of fs
const path = require("path");

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, "db.json");

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // To parse JSON request bodies

// --- Helper Functions to Read/Write to the JSON file ---
const readData = async () => {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    throw new Error("Could not read from database file.");
  }
};

const writeData = async (data) => {
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error("Could not write to database file.");
  }
};

// --- CRUD Routes ---

// GET all creators (READ)
app.get("/creators", async (req, res) => {
  const data = await readData();
  res.json(data.creators);
});

// GET a single creator by ID (READ)
app.get("/creators/:id", async (req, res) => {
  const data = await readData();
  const creator = data.creators.find((c) => c.id === req.params.id);
  if (creator) {
    res.json(creator);
  } else {
    res.status(404).json({message: "Creator not found"});
  }
});

// POST a new creator (CREATE)
app.post("/creators", async (req, res) => {
  const data = await readData();
  const newCreator = {
    id: String(Date.now()), // Simple way to generate a unique ID
    ...req.body,
  };
  data.creators.push(newCreator);
  await writeData(data);
  res.status(201).json(newCreator);
});

// PUT (update) a creator (UPDATE)
app.put("/creators/:id", async (req, res) => {
  const data = await readData();
  const index = data.creators.findIndex((c) => c.id === req.params.id);
  if (index !== -1) {
    const updatedCreator = {...data.creators[index], ...req.body};
    data.creators[index] = updatedCreator;
    await writeData(data);
    res.json(updatedCreator);
  } else {
    res.status(404).json({message: "Creator not found"});
  }
});

// DELETE a creator (DELETE)
app.delete("/creators/:id", async (req, res) => {
  const data = await readData();
  const filteredCreators = data.creators.filter((c) => c.id !== req.params.id);
  if (filteredCreators.length < data.creators.length) {
    data.creators = filteredCreators;
    await writeData(data);
    res.status(204).send(); // 204 No Content is a standard response for successful delete
  } else {
    res.status(404).json({message: "Creator not found"});
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
