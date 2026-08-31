import { Router, type IRouter } from "express";
import healthRouter from "./health";
import statusRouter from "./status";

const router: IRouter = Router();

router.get("/", (_req, res) => {
  res.json({
    status: "ok",
    service: "api-server",
  });
});
router.use(healthRouter);
router.use(statusRouter);

export default router;
