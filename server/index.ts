import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
import { randomUUID } from "crypto";
import pool from "./db";
import { ExpenseItem, Budget, CategoryType } from "../types";

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

// GET budget
app.get("/api/budget", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM budget ORDER BY created_at DESC LIMIT 1"
    );
    if (rows && (rows as any[]).length > 0) {
      const budget = (rows as any[])[0];
      res.json({
        id: budget.id,
        total_budget: budget.total_budget,
        allocations: {
          [CategoryType.POKOK]: budget.pokok_budget,
          [CategoryType.TRANSPORT]: budget.transport_budget,
          [CategoryType.GAYA_HIDUP]: budget.gaya_hidup_budget,
          [CategoryType.KESEHATAN]: budget.kesehatan_budget,
          [CategoryType.TABUNGAN]: budget.tabungan_budget,
          [CategoryType.LAINNYA]: budget.lainnya_budget,
        },
      });
    } else {
      res.json(null);
    }
  } catch (error) {
    console.error("Error fetching budget:", error);
    res.status(500).json({ error: "Failed to fetch budget" });
  }
});

// POST/PUT budget
app.post("/api/budget", async (req, res) => {
  try {
    const { total_budget, allocations } = req.body as Budget;

    console.log("Budget request received:", {
      total_budget,
      allocations,
      body: req.body,
    });

    if (!total_budget || total_budget <= 0) {
      return res.status(400).json({ error: "Invalid total budget" });
    }

    if (!allocations) {
      return res.status(400).json({ error: "Missing allocations" });
    }

    // Cek apakah sudah ada budget
    const [existing] = await pool.query("SELECT id FROM budget LIMIT 1");

    const id =
      existing && (existing as any[]).length > 0
        ? (existing as any[])[0].id
        : randomUUID();

    if (existing && (existing as any[]).length > 0) {
      // Update
      await pool.query(
        `UPDATE budget SET 
          total_budget = ?, 
          pokok_budget = ?, 
          transport_budget = ?, 
          gaya_hidup_budget = ?, 
          kesehatan_budget = ?, 
          tabungan_budget = ?, 
          lainnya_budget = ?,
          updated_at = CURRENT_TIMESTAMP 
        WHERE id = ?`,
        [
          total_budget,
          allocations[CategoryType.POKOK] || 0,
          allocations[CategoryType.TRANSPORT] || 0,
          allocations[CategoryType.GAYA_HIDUP] || 0,
          allocations[CategoryType.KESEHATAN] || 0,
          allocations[CategoryType.TABUNGAN] || 0,
          allocations[CategoryType.LAINNYA] || 0,
          id,
        ]
      );
    } else {
      // Insert
      await pool.query(
        `INSERT INTO budget 
          (id, total_budget, pokok_budget, transport_budget, gaya_hidup_budget, kesehatan_budget, tabungan_budget, lainnya_budget) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          total_budget,
          allocations[CategoryType.POKOK] || 0,
          allocations[CategoryType.TRANSPORT] || 0,
          allocations[CategoryType.GAYA_HIDUP] || 0,
          allocations[CategoryType.KESEHATAN] || 0,
          allocations[CategoryType.TABUNGAN] || 0,
          allocations[CategoryType.LAINNYA] || 0,
        ]
      );
    }

    res.status(201).json({
      success: true,
      budget: {
        id,
        total_budget,
        allocations,
      },
    });
  } catch (error) {
    console.error("Error saving budget:", error);
    res.status(500).json({ error: "Failed to save budget" });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
