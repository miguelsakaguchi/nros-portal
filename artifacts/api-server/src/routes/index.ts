import { Router, type IRouter } from "express";
import healthRouter from "./health";
import nrosRouter from "./nros";

const router: IRouter = Router();

router.use(healthRouter);
router.use(nrosRouter);

export default router;
