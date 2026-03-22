import { Router, type IRouter } from "express";
import healthRouter from "./health";
import caisseRouter from "./caisse";
import inventoryRouter from "./inventory";
import sumupRouter from "./sumup";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/caisse", caisseRouter);
router.use("/caisse/sumup", sumupRouter);
router.use(inventoryRouter);

export default router;
