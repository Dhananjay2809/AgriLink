import {FollowRequestModel} from "../models/connectionRequest.js";

export const pendingRequestsReceived= async(req,res)=>{
    try{
        const loggedInUserId=req.user.id;
        const pendingRequests = await FollowRequestModel.find({
      toUserId: loggedInUserId,
      status: "pending"
    })
    .populate("fromUserId", "name email role") // just return basic sender info show
      .sort({ createdAt: -1 }); // latest request show first
     return res.status(200).json({
      count: pendingRequests.length,
      requests: pendingRequests
    });
    }catch(err){
        return res.send(500).json({err :err.message});
    }
}