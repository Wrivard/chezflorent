import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import eventsRouter from "./events";
import menuRouter from "./menu";
import hoursRouter from "./hours";
import photosRouter from "./photos";
import groupContentRouter from "./groupContent";
import aboutContentRouter from "./aboutContent";
import menuMarqueeRouter from "./menuMarquee";
import messagesRouter from "./messages";
import uploadRouter from "./upload";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(eventsRouter);
router.use(menuRouter);
router.use(hoursRouter);
router.use(photosRouter);
router.use(groupContentRouter);
router.use(aboutContentRouter);
router.use(menuMarqueeRouter);
router.use(messagesRouter);
router.use(uploadRouter);

export default router;
