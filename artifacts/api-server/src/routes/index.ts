import { Router, type IRouter } from "express";
import healthRouter from "./health";
import caisseRouter from "./caisse";
import inventoryRouter from "./inventory";
import sumupRouter from "./sumup";
import consommablesRouter from "./consommables";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/caisse", caisseRouter);
router.use(inventoryRouter);
router.use("/payments", sumupRouter);
router.use(consommablesRouter);

export default router;
