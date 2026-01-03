import { Router } from "express";
import * as customersController from "../controllers/customersController.js";
const router = Router();

router.post("/", customersController.createOrderer);
router.get("/", customersController.getAllOrderers);
router.get("/customer/:customerId", customersController.getOrderersByCustomer);
router.get("/search/:searchTerm", customersController.searchOrderers);
router.get("/:id", customersController.getOrdererById);
router.put("/:id", customersController.updateOrderer);
router.delete("/:id", customersController.deleteOrderer);

export default router;
