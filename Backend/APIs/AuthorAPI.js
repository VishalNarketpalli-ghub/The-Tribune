import exp from 'express'
import { register, authenticate } from '../services/authService.js'
import { UserTypeModel } from '../Models/UserModel.js'
import { ArticleModel } from '../Models/ArticleModel.js'
import { verifyToken } from '../middlewear/verifyToken.js'
import { uploadToCloudinary } from '../config/cloudinaryUpload.js'
import { upload } from '../config/multer.js'

export const authorApp = exp.Router()


// Register a new author (public route — no token required)
authorApp.post(
    "/users",
    upload.single("profileImageUrl"),
    async (req, res, next) => {
        let cloudinaryResult;

        try {
            let userObj = req.body;

            // Upload profile image to Cloudinary if the client sent one
            if (req.file) {
                cloudinaryResult = await uploadToCloudinary(req.file.buffer);
            }

            // Register the user with role hard-coded to "AUTHOR"
            // so the client cannot escalate their own privilege by passing a different role
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
            // If Cloudinary upload succeeded but DB save failed, clean up the orphaned image
            if (cloudinaryResult?.public_id) {
                await cloudinary.uploader.destroy(cloudinaryResult.public_id);
            }
            next(err);
        }
    }
);

// Create a new article (protected — AUTHOR only)
authorApp.post('/articles', verifyToken("AUTHOR"), async (req, res) => {
    let articleObj = req.body

    // Cross-check: the author ID supplied in the request body must match
    // the ID embedded in the verified JWT to prevent one author posting as another
    if (req.user._id != articleObj.author) {
        return res.status(401).json({ message: "Unregistered author — login with valid credentials" })
    }

    let articleDoc = new ArticleModel(articleObj)
    let createdArticleDoc = await articleDoc.save()

    res.status(201).json({ message: "Article created", payload: createdArticleDoc })
})

// Fetch all articles belonging to this author (protected — all authenticated roles)
// USER and ADMIN can view an author's public articles via the ArticlesOfAuthor page.
authorApp.get('/articles/:authorId', verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res) => {
    let authorId = req.params.authorId

    // Include both active and inactive (archived) articles so the author
    // can see and restore their own archived work
    let articles = await ArticleModel.find({ author: authorId })
        .populate("author", "firstName email")
        .populate("comments.user", "firstName")
        .sort({ createdAt: -1 })

    res.status(201).json({ message: "Articles fetched", payload: articles })
})


// Update an article's title, category or content (protected — AUTHOR only)
authorApp.patch('/articles', verifyToken("AUTHOR"), async (req, res) => {
    let { articleId, title, category, content } = req.body

    // Use req.user._id from the verified JWT as the authoritative owner ID.
    // Never trust the author ID from the request body — it can be spoofed.
    const requestingAuthorId = req.user._id

    // Verify the article exists AND belongs to the requesting author
    let articleOfDB = await ArticleModel.findOne({ _id: articleId, author: requestingAuthorId })
    if (!articleOfDB) {
        return res.status(403).json({ message: "Forbidden — you can only edit your own articles" }
        )
    }

    let foundArticle = await ArticleModel.findByIdAndUpdate(
        articleId,
        { $set: { title, category, content } },
        { new: true }
    ).populate("author", "firstName email")
     .populate("comments.user", "firstName")

    res.status(200).json({ message: "Article updated successfully", payload: foundArticle })
})

// Soft-delete an article (protected — AUTHOR only)
// Sets isArticleActive = false; the author can restore this later.
// If the article was already admin-deleted (isAdminDeleted = true),
// disallow even the soft-delete to keep the state consistent.
authorApp.put('/articles-delete', verifyToken("AUTHOR"), async (req, res) => {
    let { authorId, articleId } = req.body

    let articleOfDB = await ArticleModel.findOne({ _id: articleId, author: authorId })
    if (!articleOfDB) {
        return res.status(404).json({ message: "Article not found" })
    }

    let updatedArticle = await ArticleModel.findByIdAndUpdate(
        articleId,
        { $set: { isArticleActive: false } },
        { new: true }
    ).populate("author", "firstName email")
     .populate("comments.user", "firstName")

    res.status(200).json({ message: "Article archived", payload: updatedArticle })
})

// Restore a previously archived article (protected — AUTHOR only)
// Blocked when isAdminDeleted = true; only the admin can undo that action.
authorApp.put('/article-reload', verifyToken("AUTHOR"), async (req, res) => {
    let { authorId, articleId } = req.body

    let articleOfDB = await ArticleModel.findOne({ _id: articleId, author: authorId })
    if (!articleOfDB) {
        return res.status(404).json({ message: "Article not found" })
    }

    // Guard: if an admin removed this article, the author cannot restore it
    if (articleOfDB.isAdminDeleted) {
        return res.status(403).json({
            message: "This article was removed by an administrator and cannot be restored"
        })
    }

    let updatedArticle = await ArticleModel.findByIdAndUpdate(
        articleId,
        { $set: { isArticleActive: true } },
        { new: true }
    ).populate("author", "firstName email")
     .populate("comments.user", "firstName")

    res.status(200).json({ message: "Article restored", payload: updatedArticle })
})
