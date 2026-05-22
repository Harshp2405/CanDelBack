import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    amount: { type: Number, required: true },
    month: { type: String, required: true },
    method: { type: String, required: true },
  },
  { timestamps: true }
);

const Expense = mongoose.model("Expense", ExpenseSchema);

export default Expense;
