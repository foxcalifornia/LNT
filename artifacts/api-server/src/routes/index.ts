import { Router, type IRouter } from "express";
import healthRouter from "./health";
import caisseRouter from "./caisse";
import inventoryRouter from "./inventory";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/caisse", caisseRouter);
router.use(inventoryRouter);
router.use("/payments", paymentsRouter);

export default router;
