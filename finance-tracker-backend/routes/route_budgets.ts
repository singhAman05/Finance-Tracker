import { Router } from "express";
import { verifyToken } from "../middleware/jwt";
import {
    handleBudgetCreation,
    handleBudgetFetch,
    handleBudgetDeletion,
    handleBudgetUpdate,
    handleBudgetSummary,
} from "../controllers/controller_budgets";

const router = Router();

router.post("/create-budget", verifyToken, handleBudgetCreation);
router.get("/fetch-budgets", verifyToken, handleBudgetFetch);
router.get("/fetch-budget-summary", verifyToken, handleBudgetSummary);
router.put("/update-budget/:budget_id", verifyToken, handleBudgetUpdate);
router.delete("/delete-budget/:budget_id", verifyToken, handleBudgetDeletion);

export default router;
