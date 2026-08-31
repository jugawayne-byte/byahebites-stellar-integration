import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";

const router: IRouter = Router();

  const data = HealthCheckResponse.parse({ status: "ok" });

router.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

export default router;
