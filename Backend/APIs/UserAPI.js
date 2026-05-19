import exp from 'express'
import { register, authenticate } from '../services/authService.js'
import { UserTypeModel } from '../Models/UserModel.js'
import { ArticleModel } from '../Models/ArticleModel.js'
import { checkUser } from '../middlewear/checkUser.js'
import { verifyToken } from '../middlewear/verifyToken.js'
import { uploadToCloudinary } from '../config/cloudinaryUpload.js'
import { upload } from '../config/multer.js'

export const userRoute = exp.Router()


// register user
userRoute.post(
    "/users",
    upload.single("profileImageUrl"),
    async (req, res, next) => {
        let cloudinaryResult;

        try {
            // get user obj
            let userObj = req.body;

            //  Step 1: upload image to cloudinary from memoryStorage (if exists)
            if (req.file) {
                cloudinaryResult = await uploadToCloudinary(req.file.buffer);
            }

            // Step 2: call existing register()
            const newUserObj = await register({
                ...userObj,
                role: "USER",
                profileImageUrl: cloudinaryResult?.secure_url,
            });

            res.status(201).json({
                message: "user created",
                payload: newUserObj,
            });

        } catch (err) {

            // Step 3: rollback 
            if (cloudinaryResult?.public_id) {
                await cloudinary.uploader.destroy(cloudinaryResult.public_id);
            }

            next(err); // send to your error middleware
        }

    }
);


// read all articles — accessible to all authenticated roles
userRoute.get('/user', verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res) => {

    // check for valid user is done by middlewear   

    // retreive all articles 
    let articles = await ArticleModel.find({ isArticleActive: true }).populate("author").populate("comments.user", "firstName email")
    // console.log(articles)

    // send response to user
    res.status(200).json({ message: "All articles fetched", payload: articles })
})


// add comment to an article
userRoute.post('/users-comment', verifyToken("USER"), async (req, res) => {
    // retreive uid, articleId, Comment from body
    let { uid, articleId, comment } = req.body

    // find article exists
    let article = await ArticleModel.findById(articleId)
    if (!article) {
        return res.status(404).json({ message: "Article not found" })
    }

    // add comment to array of article with userObjId and comment string
    let updatedComments = await ArticleModel.findByIdAndUpdate(articleId,
        {
            $push: {
                comments: {
                    user: uid,
                    comments: comment
                }
            }
        }, { new: true }
    ).populate("comments.user", "firstName email")

    res.status(200).json({ message: "Comment added successfully", payload: updatedComments })

})