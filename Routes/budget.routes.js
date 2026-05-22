import express from "express";
import Budget from "../Models/budget.js";

const router = express.Router();

// Get budget by month
router.get("/", async (req, res) => {
  const { month } = req.query;
  const budget = await Budget.findOne({ month });
  res.json(budget || {});
});

// Save / update budget
router.post("/", async (req, res) => {
  const { month, amount } = req.body;

  const budget = await Budget.findOneAndUpdate(
    { month },
    { amount },
    { upsert: true, new: true }
  );

  res.json(budget);
});

// ==========================================
// 📱 MOBILE SYNC ENDPOINTS
// ==========================================

// POST /budget/sync — Push pending mobile budgets to MongoDB
router.post("/sync", async (req, res) => {
  const { budgets } = req.body;
  console.log(`[Sync] Received POST /budget/sync with ${budgets?.length || 0} items`);
  const syncedIds = [];

  for (const item of budgets) {
    try {
      const query = item.remoteId
        ? { _id: item.remoteId }
        : { month: item.month };

      const savedDoc = await Budget.findOneAndUpdate(
        query,
        {
          amount: item.amount,
          month: item.month,
        },
        { upsert: true, new: true }
      );

      syncedIds.push({ localId: item.id, remoteId: savedDoc._id });
    } catch (e) {
      console.error("Error syncing budget item:", e);
    }
  }

  res.json({ success: true, syncedIds });
});

// GET /budget/delta — Pull all budgets (no timestamps on budget model, so full pull)
router.get("/delta", async (req, res) => {
  console.log("[Sync] Received GET /budget/delta");
  const currentTimestamp = Date.now();
  const items = await Budget.find({}).select("_id amount month");
  res.json({ items, timestamp: currentTimestamp });
});

export default router;
