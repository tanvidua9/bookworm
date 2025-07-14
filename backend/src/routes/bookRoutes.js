import express from "express";
import Book from "../models/Book.js";
import cloudinary from "../lib/cloudinary.js"
import protectRoute from "../middleware/auth.middleware.js";

const router=express.Router();

router.post("/",protectRoute,async(req,res)=>{
    try {
        const{title,caption,rating,image}= req.body;
        if(!image || !title || !caption || !rating){
            return res.status(400).json({message:"Please provide all fields"});
        }

        const uploadResponse= await cloudinary.uploader.upload(image);
        const imageUrl= uploadResponse.secure_url;

        const newBook= new Book({
            title,
            caption,
            rating,
            image: imageUrl,
            user: req.user._id
        })

        await newBook.save();
        res.status(201).json(newBook);


    } catch (error) {
        console.log("Error creating book", error);
        res.status(500).json({message: error.message});
    }
})

router.get("/",protectRoute,async(req,res)=>{
    try {
        const page= req.query.page || 1;
        const limit= req.query.limit || 5;
        const skip= (page-1)*limit;

        const books= await Book.find()
        .sort({createdAt:-1}) //desc
        .skip(skip)  //skips the first skip number of results for pagination
        .limit(limit)
        .populate("user", "username profileImage");  //replaces the user reference in each book with the actual user data, selecting only the username and profileImage fields.

        const totalBooks= await Book.countDocuments();  
        res.send({
            books,
            currentPage: page,
            totalBooks,
            totalPages: Math.ceil(totalBooks/limit)
        });
    } catch (error) {
        console.log("Error in get all books route",error);
        res.status(500).json({message:"Internal server error"});
    }
})

//get recommended books by the logged in user
router.get("/user",protectRoute,async(req,res)=>{
    try {
        const books= await Book.find({user:req.user._id}).sort({createdAt:-1});
        res.json(books);
    } catch (error) {
        console.log("Get user books error: ",error.message);
        res.status(500).json({message:"Server error"});
    }
})

router.delete("/:id",protectRoute,async(req,res)=>{
    try {
        const book= await Book.findById(req.params.id);

        if(!book){
            return res.status(404).json({message:"Book not found"})
        }

        if(book.user.toString() !== req.user._id.toString()){
            return res.status(401).json({message:"Unauthorized"});
        }

        if(book.image && book.image.includes("cloudinary")){
            try {

                //https://res.cloudinary.com/demo/image/upload/v1234567890/folder/myimage.jpg
                //To delete an image from Cloudinary, you need its public_id, not the full URL
                /* book.image.split("/") splits the URL into parts by /.
                .pop() takes the last part, which is the filename: "myimage.jpg".
                .split(".")[0] removes the file extension, leaving just "myimage" — this is the public_id used by Cloudinary to identify and delete the image.*/

                const publicId= book.image.split("/").pop().split(".")[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (deleteError) {
                console.log("Error deleting the image from cloudinary",deleteError);
            }
        }

        await book.deleteOne();
        res.json({message:"Book deleted successfully"});
    } catch (error) {
        console.log("Error deleting the book",error);
        res.status(500).json({message:"Internal server error"});
    }
})



export default router;