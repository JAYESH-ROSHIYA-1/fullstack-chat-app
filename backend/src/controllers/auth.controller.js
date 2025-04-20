import { generateToken } from "../lib/utils.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs"
import cloudinary from "../lib/cloudinary.js"
import crypto from 'crypto';

export const signup = async (req, res) => {
    const{fullName,email,password} = req.body;
    try {

        if (!fullName || !email || !password) {
            return res.status(400).json({ message: " All Feilds are required "});
        }
        //Hash password
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 charactors"});
        }

        const user = await User.findOne({email});
        console.log("Existing User:", user)

        if (user) {
            return res.status(400).json({ message: "Email Already exists"});  
        }

        const salt = await bcrypt.genSalt(10)
        const hashPassword = await bcrypt.hash(password,salt)

        const newUser = new User({
            fullName,
            email,
            password: hashPassword,
            profilePic: req.body.profilePic || "",
        });

        await newUser.save();

        if (newUser) {
            // Generate jwt token for the user here
            generateToken(newUser._id, res)
            // await newUser.save();

            res.status(201).json({
                _id: newUser._id,
                fullName: newUser.fullName,
                email: newUser.email,
                profilePic: newUser.profilePic,
            });

        } else{
            res.status(400).json({ message: "Invalid user data"});
        }
    } catch (error) {
        console.log("Error in signup controller", error.message);
        res.status(500).json({ message: "Internal Server Error"});
    }
};

export const login = async (req, res) => {
    // 
    console.log("Login request received:", req.body); // Add this

    const {email,password} = req.body;
    try {
        const user = await User.findOne({email})
        
        console.log("User found:", user);



      


        
        if (!user) {
            return res.status(400).json({message: "Invalid Credentials"});
        }

        const ispasswordCorrect = await bcrypt.compare(password, user.password)
// 

        console.log("Entered password:", password);
        console.log("Stored hashed password:", user.password);
        console.log("Password match:", ispasswordCorrect);
// 

        if (!ispasswordCorrect) {
            return res.status(400).json({message:"Invalid Credentials"});
        }

        generateToken(user._id,res);
        // 
        console.log("JWT Token set in cookies");
        // 

        res.status(200).json({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profilePic: user.profilePic,
        })
    } catch (error) {
        console.log("Error in login controller", error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
};

export const logout = (req, res) => {
    try {
        res.cookie("jwt","",{maxAge:0})
        res.status(200).json({message:"Logged out successfully"});
    } catch (error) {
        console.log("Error in logout controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
    }
    
};

export const updateProfile = async (req,res) => {
    try {
        const {profilePic} = req.body;
        const userId = req.user._id

        if (!profilePic) {
            return res.status(400).json({message:"Profile Pic is Required"});
        }


// 
        console.log("User ID:", userId); // Log user ID
        console.log("Received Image Data:", profilePic.substring(0, 100)); // Log part of image string to check data format


       


        // 
        const uploadResponse = await cloudinary.uploader.upload(profilePic)
        .catch(err => {
            console.error("Cloudinary Upload Error:", err);
            throw err;
        });

        // 


        const updatedUser = await User.findByIdAndUpdate(userId,{profilePic:uploadResponse.secure_url},{new:true});

        
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found" });
        }
        

        res.status(200).json(updatedUser);
    } catch (error) {
        console.log("Error in update profile:",error)
        res.status(500).json({message:"Internal Server Error"});
    }
}

export const checkAuth = (req,res) => {
    try {

// 

        if (!req.user) {
            return res.status(400).json({ message: "User not authenticated" });
        }

        // 
        res.status(200).json(req.user);
    } catch (error) {
        

        // 
        console.log("Error in checkAuth:", error);
        console.log("Error Message:", error.message);
        console.log("Error Response Data:", error.response?.data || "No response data");
        console.log("Error Status:", error.response?.status || "No status code");
// 


        console.log("Error in checkAuth controller",error.message);
        res.status(500).json({message:"Internal Server Error"});
        
    }
}