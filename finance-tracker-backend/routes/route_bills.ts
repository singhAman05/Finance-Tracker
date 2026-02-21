import { Router } from "express";
import { verifyToken } from "../middleware/jwt";
import {
    handleBillCreation,
    handleBillsFetch,
    handleBillInstancesFetch,
    handleBillInstancePayment,
} from "../controllers/controller_bills";

const router = Router();

router.post("/create-bill", verifyToken, handleBillCreation);
router.get("/fetch-bills", verifyToken, handleBillsFetch);
router.get("/fetch-bill-instances", verifyToken, handleBillInstancesFetch);
router.post("/pay-bill/:bill_instance_id", verifyToken, handleBillInstancePayment);

export default router;
