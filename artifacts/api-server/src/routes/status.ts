import { Router, type IRouter } from "express";

const router: IRouter = Router();

const integrationConfiguration = [
  "STELLAR_NETWORK",
  "SOROBAN_RPC_URL",
  "MSME_CONTRACT_ID",
  "CONTRIBUTION_CONTRACT_ID",
  "ISSUER_PUBLIC_KEY",
] as const;

router.get("/status", (_req, res) => {
  const missing = integrationConfiguration.filter(
    (key) => !process.env[key]?.trim(),
  );
  const configured = missing.length === 0;

  res.status(configured ? 200 : 503).json({
    status: configured ? "ok" : "degraded",
    service: "api-server",
    checks: {
      configuration: configured ? "configured" : "missing",
      missing,
      externalServices: "not checked",
    },
  });
});

export default router;