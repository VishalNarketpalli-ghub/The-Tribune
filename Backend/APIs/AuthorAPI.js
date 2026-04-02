import exp from 'express'
import { register, authenticate } from '../services/authService.js'
import { UserTypeModel } from '../Models/UserModel.js'
import { ArticleModel } from '../Models/ArticleModel.js'
import { checkAuthor } from '../middlewear/checkAuthor.js'
import { verifyToken } from '../middlewear/verifyToken.js'
import { uploadToCloudinary } from '../config/cloudinaryUpload.js'
import { upload } from '../config/multer.js'

export const authorApp = exp.Router()



// register author (public)
// register user
authorApp.post(
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
                role: "AUTHOR",
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

// authenticate author (public)

// create article (protected)
authorApp.post('/articles', verifyToken("AUTHOR"), async (req, res) => {

    // get the article
    let articleObj = req.body

    // check if the authorId in req obj is same as req.user(Verified Author In cookie from jwt)
    // console.log(req.user)
    if (req.user._id != articleObj.author) {
        return res.status(401).json({ message: "unregistered author, login with valid user details" })
    }

    // create article doc
    let articleDoc = new ArticleModel(articleObj)

    // save
    let createdArticleDoc = await articleDoc.save()

    // send res
    res.status(201).json({ message: "Article created", payload: createdArticleDoc })
})

// read articles from author (protected)
authorApp.get('/articles/:authorId', verifyToken("AUTHOR"), async (req, res) => {
    // get the auther id
    let authorId = req.params.authorId

    // read article by author
    let articles = await ArticleModel.find({ author: authorId }).populate("author", "firstName email").populate("comments.user", "firstName")

    // send res
    res.status(201).json({ message: "Articles fetched", payload: articles })
})


// edit article (protected)
authorApp.patch('/articles', verifyToken("AUTHOR"), async (req, res) => {
    // get the update details from body
    let { articleId, author, title, category, content } = req.body
    // console.log(updateArticleObj)

    let articleOfDB = await ArticleModel.findOne({ _id: articleId, author: author })
    if (!articleOfDB) {
        return res.status(404).json({ message: "Article not found" })
    }

    let foundArticle = await ArticleModel.findByIdAndUpdate(articleId, { $set: { title, category, content } }, { new: true }).populate("author", "firstName email").populate("comments.user", "firstName")
    res.status(200).json({ message: "Article updated successfullt", payload: foundArticle })
})

// delete article (soft) (protected)
authorApp.put('/articles-delete', verifyToken("AUTHOR"), async (req, res) => {
    // destructre
    let { authorId, articleId } = req.body

    // check if article exist
    let articleOfDB = await ArticleModel.findOne({ _id: articleId, author: authorId })
    if (!articleOfDB) {
        return res.status(404).json({ message: "Article not found" })
    }

    let updatedArticle = await ArticleModel.findByIdAndUpdate(articleId, { $set: { isArticleActive: false } }, { new: true }).populate("author", "firstName email").populate("comments.user", "firstName")

    // send response
    res.status(200).json({ message: "Article deleted", payload: updatedArticle })
})

// restore article (Procted)
authorApp.put('/article-reload', verifyToken("AUTHOR"), async (req, res) => {

    // destructre the data
    let { authorId, articleId } = req.body

    // check if article exist
    let articleOfDB = await ArticleModel.findOne({ _id: articleId, author: authorId })
    if (!articleOfDB) {
        return res.status(404).json({ message: "Article not found" })
    }

    // update the article
    let updatedArticle = await ArticleModel.findByIdAndUpdate(articleId, { $set: { isArticleActive: true } }, { new: true }).populate("author", "firstName email").populate("comments.user", "firstName")

    // send response
    res.status(200).json({ message: "Article restored", payload: updatedArticle })

})
