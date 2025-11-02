import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { sendFollowRequest } from "../controllers/sendRequest.js";
import {acceptFollowRequest} from "../controllers/acceptRequests.js";

const requestRouter = express.Router();


requestRouter.post("/follow/send/:id", userAuth, sendFollowRequest);
requestRouter.post("/accept/request/:id",userAuth, acceptFollowRequest);

export default requestRouter;