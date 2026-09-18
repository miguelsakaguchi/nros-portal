import { Router, type IRouter } from "express";
import { authHandlers } from "../auth";

const router: IRouter = Router();
const { startGoogleAuth, googleCallback, getCurrentUser, logout } = authHandlers();

router.get("/auth/google", startGoogleAuth);
router.get("/auth/google/callback", googleCallback);
router.get("/auth/me", getCurrentUser);
router.post("/auth/logout", logout);

export default router;