import { Router, type IRouter } from "express";
import healthRouter from "./health";
import casesRouter from "./cases";
import chatRouter from "./chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(casesRouter);
router.use(chatRouter);

export default router;
