import User  from "../models/user.model.js";
import Message  from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUserForSidebars = async(req,res) => {
    try {
        const loggedInUserId = req.user._id;
        const filteredUsers = await User.find({_id: {$ne: loggedInUserId}}).select("-password");
        res.status(200).json(filteredUsers);
    } catch (error) {
        console.log("Error in getuserforsidebar:",error.message);
        res.status(500).json({error:"InternalServer Error"});
    }
};

export const getmessages = async(req,res) => {
    try {
        const {id:userToChatId} = req.params;
        const myId = req.user._id;

        const messages = await Message.find({
            $or:[{senderId:myId, receiverId:userToChatId},
                {senderId:userToChatId, receiverId:myId}
            ],
        });

        res.status(200).json(messages);
    } catch (error) {
        console.log("Earror in getMessages controller:",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
};

export const sendMessages = async (req,res) => {
    try {
        const { text, image} = req.body;
        const { id: receiverId} = req.params;
        const senderId = req.user._id;

        let imageUrl;
        if (image) {
            //upload base64 image to cloudinary
            const uploadResponce = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponce.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });


        await newMessage.save();

        //todo: realtime functionality goes here => socket.io
        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("newMessage", newMessage);
        }
    

        res.status(201).json(newMessage);

    } catch (error) {
        console.log("Earror in sendMessages controller:",error.message);
        res.status(500).json({error:"Internal Server Error"});
    }
};