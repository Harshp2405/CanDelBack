import express from "express";
import Expense from "../Models/expense.js";

const router = express.Router();

// Get expenses by month
router.get("/", async (req, res) => {
  const { month } = req.query;
  const expenses = await Expense.find({ month }).sort({ createdAt: -1 });
  res.json(expenses);
});

// Add expense
router.post("/", async (req, res) => {
  const { title, amount, month,method } = req.body;

  const expense = await Expense.create({
    title,
    amount,
    month,
    method
  });

  res.json(expense);
});

// Monthly history (AGGREGATION)
router.get("/history", async (req, res) => {
  const history = await Expense.aggregate([
    {
      $group: {
        _id: "$month",
        total: { $sum: "$amount" },
      },
    },
    {
      $project: {
        _id: 0,
        month: "$_id",
        total: 1,
      },
    },
    { $sort: { month: 1 } },
  ]);

  res.json(history);
});


// DELETE expense
router.delete("/:id", async (req, res) => {
    try {
        await Expense.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to delete expense" });
    }
});

// ==========================================
// 📱 MOBILE SYNC ENDPOINTS
// ==========================================

// POST /expenses/sync — Push pending mobile expenses to MongoDB
router.post("/sync", async (req, res) => {
  const { expenses } = req.body;
  console.log(`[Sync] Received POST /expenses/sync with ${expenses?.length || 0} items`);
  const syncedIds = [];

  for (const item of expenses) {
    try {
      const query = item.remoteId
        ? { _id: item.remoteId }
        : { title: item.title, month: item.month, amount: item.amount };

      const savedDoc = await Expense.findOneAndUpdate(
        query,
        {
          title: item.title,
          amount: item.amount,
          month: item.month,
          method: item.method,
        },
        { upsert: true, new: true }
      );

      syncedIds.push({ localId: item.id, remoteId: savedDoc._id });
    } catch (e) {
      console.error("Error syncing expense item:", e);
    }
  }

  res.json({ success: true, syncedIds });
});

// GET /expenses/delta — Pull expenses updated since a given timestamp
router.get("/delta", async (req, res) => {
  const since = new Date(parseInt(req.query.since || "0"));
  console.log(`[Sync] Received GET /expenses/delta since ${since.toISOString()}`);
  const currentTimestamp = Date.now();

  const items = await Expense.find({
    updatedAt: { $gt: since },
  }).select("_id title amount month method");

  // Fetch all active MongoDB _ids in the collection to support deletion reconciliation
  const allActiveDocs = await Expense.find({}).select("_id");
  const activeIds = allActiveDocs.map(doc => String(doc._id));

  res.json({ items, timestamp: currentTimestamp, activeIds });
});

export default router;
