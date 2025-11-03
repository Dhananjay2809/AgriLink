import { FollowRequestModel } from "../models/connectionRequest.js";

export const rejectFollowRequest = async(req,res)=>{
   try{
    const requestId = req.params.id;   // request document ID from the request
    const loggedInUserId = req.user.id; // user who is rejecting the request
    const request = await FollowRequestModel.findById(requestId);

    if (!request) {
      return res.status(404).json({ message: "Follow request not found" });
    }
    // only the receiver can reject the request
    if (request.toUserId.toString() !== loggedInUserId) {
      return res.status(403).json({ message: "You are not authorized to reject this request" });
    }
    //if request is already accepted
    if (request.status !== "pending") {
      return res.status(400).json({ message: `Request is already ${request.status}` });
    }
    request.status="rejected";
    await request.save();
    return res.status(200).json({
      message: "Follow request rejected successfully",
      request
    });
   }catch (err) {
    return res.status(500).json({ error: err.message });
}
};