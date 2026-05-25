import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import "dotenv/config";

import budgetRoutes from "./Routes/budget.routes.js";
import expenseRoutes from "./Routes/expense.routes.js";

const dburl = process.env.Railway_Mongo_Uri || "mongodb://mongo:LcIvxrERnKWOzZvYGhZLcOgWlMUToeZt@kodama.proxy.rlwy.net:55528";

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(dburl)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

app.use("/budget", budgetRoutes);
app.use("/expenses", expenseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
