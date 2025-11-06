const express = require("express");
const cors = require("cors");
const fs = require("fs").promises;
const path = require("path");
const {v4: uuidv4} = require("uuid"); // <-- 1. IMPORT THE UUID LIBRARY

const app = express();
// <-- 2. USE RENDER'S PORT OR FALLBACK TO 3001 FOR LOCAL
const PORT = process.env.PORT || 3001;
const DB_PATH = path.join(__dirname, "db.json");

// Middleware
app.use(cors());
app.use(express.json());

// --- Helper Functions (No changes needed here) ---
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
  // Using String() makes the comparison safer
  const creator = data.creators.find((c) => String(c.id) === req.params.id);
  if (creator) {
    res.json(creator);
  } else {
    res.status(404).json({message: "Creator not found"});
  }
});

app.post("/creators", async (req, res) => {
  const data = await readData();
  const newCreator = {
    ...req.body, // Incoming data first
    id: uuidv4(), // Server-generated ID last (cannot be overwritten)
  };
  data.creators.push(newCreator);
  await writeData(data);
  res.status(201).json(newCreator);
});

// PUT (update) a creator (UPDATE)
app.put("/creators/:id", async (req, res) => {
  const data = await readData();
  const index = data.creators.findIndex((c) => String(c.id) === req.params.id);
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
  const initialLength = data.creators.length;
  // Using String() makes the comparison safer
  data.creators = data.creators.filter((c) => String(c.id) !== req.params.id);

  if (data.creators.length < initialLength) {
    await writeData(data);
    res.status(204).send();
  } else {
    res.status(404).json({message: "Creator not found"});
  }
});

// Start the server
// <-- 4. USE THE PORT VARIABLE FOR A PRODUCTION-READY SERVER
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
