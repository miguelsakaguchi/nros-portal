import { Router, type IRouter } from "express";
import authRouter from "./auth";
import healthRouter from "./health";
import nrosRouter from "./nros";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(nrosRouter);

export default router;
