import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import pool from "./db";
import { ExpenseItem } from "../types";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// GET all expenses
app.get("/api/expenses", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM expenses ORDER BY date DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching expenses:", error);
    res.status(500).json({ error: "Failed to fetch expenses" });
  }
});

// POST new expense(s)
app.post("/api/expenses", async (req, res) => {
  try {
    const expenses: ExpenseItem[] = Array.isArray(req.body)
      ? req.body
      : [req.body];
    const values = expenses.map((exp) => [
      exp.id,
      exp.item,
      exp.price,
      exp.category,
      exp.source,
      new Date(exp.date).toISOString().slice(0, 19).replace("T", " "),
    ]);

    await pool.query(
      "INSERT INTO expenses (id, item, price, category, source, date) VALUES ?",
      [values]
    );

    res.status(201).json({ success: true, count: expenses.length });
  } catch (error) {
    console.error("Error saving expenses:", error);
    res.status(500).json({ error: "Failed to save expenses" });
  }
});

// DELETE expense by id
app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM expenses WHERE id = ?", [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting expense:", error);
    res.status(500).json({ error: "Failed to delete expense" });
  }
});

// DELETE all expenses
app.delete("/api/expenses", async (req, res) => {
  try {
    await pool.query("DELETE FROM expenses");
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting all expenses:", error);
    res.status(500).json({ error: "Failed to delete expenses" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
