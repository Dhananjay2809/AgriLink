import express from "express";
import { userAuth } from "../middlewares/auth.js";
import { sendFollowRequest } from "../controllers/RequestController/sendRequest.js";
import {acceptFollowRequest} from "../controllers/RequestController/acceptRequests.js";
import{rejectFollowRequest} from "../controllers/RequestController/rejectRequest.js";
import {cancelFollowRequest} from "../controllers/RequestController/cancelRequest.js";
import { pendingRequestsReceived } from "../controllers/RequestController/pendingRequestReceived.js";
import { pendingRequestsSent } from "../controllers/RequestController/pendingRequestSend.js";
import { getMyFollowers } from "../controllers/RequestController/allFollowers.js";
import { getMyFollowing } from "../controllers/RequestController/allFollowing.js";


const requestRouter = express.Router();


requestRouter.post("/follow/send/:id", userAuth, sendFollowRequest);
requestRouter.post("/accept/request/:id",userAuth, acceptFollowRequest);
requestRouter.post("/reject/request/:id",userAuth, rejectFollowRequest);
requestRouter.post("/cancel/request/:id",userAuth, cancelFollowRequest);


// to get all the followers/ following/ pendingrequests of an user
requestRouter.get("/requests/pending",userAuth,pendingRequestsReceived);
requestRouter.get("/requests/pending",userAuth,pendingRequestsSent);

requestRouter.get("/followers/me", userAuth, getMyFollowers);
requestRouter.get("/following/me", userAuth, getMyFollowing);

export default requestRouter;