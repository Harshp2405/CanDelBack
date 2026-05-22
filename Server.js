import express from "express";
import mongoose from "mongoose";
import cors from "cors";

import budgetRoutes from "./Routes/budget.routes.js";
import expenseRoutes from "./Routes/expense.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(
    "mongodb://mongo:LcIvxrERnKWOzZvYGhZLcOgWlMUToeZt@kodama.proxy.rlwy.net:55528",
  )
  .then(() => console.log("MongoDB Connected"));

app.use("/budget", budgetRoutes);
app.use("/expenses", expenseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
