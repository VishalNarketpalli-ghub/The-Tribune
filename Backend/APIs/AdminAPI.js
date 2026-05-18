import exp from 'express'
import { ArticleModel } from '../Models/ArticleModel.js'
import { UserTypeModel } from '../Models/UserModel.js'
import { verifyToken } from '../middlewear/verifyToken.js'

export const adminApp = exp.Router()

/**
 * Best Practice for Admin Account Creation:
 * - Admin accounts are NEVER created through the public registration flow.
 * - Only a developer/DevOps engineer creates admin accounts by running the
 *   seed script at: Backend/scripts/createAdmin.js
 * - This prevents privilege escalation through the public API.
 * - All routes below require a valid ADMIN role JWT token.
 */

// Read all articles including archived and admin-deleted ones (admin view)
adminApp.get('/articles', verifyToken("ADMIN"), async (req, res) => {
    try {
        // Admin sees every article regardless of active/deleted status
        // Populate author name so the dashboard can display who wrote each article
        const articles = await ArticleModel.find({})
            .populate("author", "firstName lastName email")
            .sort({ createdAt: -1 })

        res.status(200).json({ message: "All articles fetched", payload: articles })
    } catch (err) {
        res.status(500).json({ message: "Error fetching articles", error: err.message })
    }
})

// Read all registered users so the admin can block/unblock them
adminApp.get('/users', verifyToken("ADMIN"), async (req, res) => {
    try {
        // Return all users but omit their password hashes for security
        const users = await UserTypeModel.find({}, { password: 0 })
            .sort({ createdAt: -1 })

        res.status(200).json({ message: "All users fetched", payload: users })
    } catch (err) {
        res.status(500).json({ message: "Error fetching users", error: err.message })
    }
})

/**
 * Admin delete — sets isAdminDeleted to true and isArticleActive to false.
 * This is a permanent soft-delete from the admin's perspective.
 * The key distinction: when isAdminDeleted = true, the author's restore endpoint
 * will refuse to reactivate the article. Only another admin action could undo this.
 */
adminApp.put('/articles-delete/:articleId', verifyToken("ADMIN"), async (req, res) => {
    try {
        const { articleId } = req.params

        const article = await ArticleModel.findById(articleId)
        if (!article) {
            return res.status(404).json({ message: "Article not found" })
        }

        // Mark as admin-deleted so author restore endpoint knows to block restoration
        const updatedArticle = await ArticleModel.findByIdAndUpdate(
            articleId,
            { $set: { isArticleActive: false, isAdminDeleted: true } },
            { new: true }
        ).populate("author", "firstName lastName email")

        res.status(200).json({ message: "Article removed by admin", payload: updatedArticle })
    } catch (err) {
        res.status(500).json({ message: "Error deleting article", error: err.message })
    }
})

// Admin restore — sets isAdminDeleted to false and isArticleActive to true.
adminApp.put('/articles-restore/:articleId', verifyToken("ADMIN"), async (req, res) => {
    try {
        const { articleId } = req.params

        const article = await ArticleModel.findById(articleId)
        if (!article) {
            return res.status(404).json({ message: "Article not found" })
        }

        // Restore the article by clearing the admin-deleted flag
        const updatedArticle = await ArticleModel.findByIdAndUpdate(
            articleId,
            { $set: { isArticleActive: true, isAdminDeleted: false } },
            { new: true }
        ).populate("author", "firstName lastName email")

        res.status(200).json({ message: "Article restored by admin", payload: updatedArticle })
    } catch (err) {
        res.status(500).json({ message: "Error restoring article", error: err.message })
    }
})

// Block a user: sets isActive = false, preventing them from logging in
adminApp.put('/block/:uid', verifyToken("ADMIN"), async (req, res) => {
    try {
        const uid = req.params.uid

        const user = await UserTypeModel.findById(uid)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const updatedUser = await UserTypeModel.findByIdAndUpdate(
            uid,
            { isActive: false },
            { new: true, projection: { password: 0 } }
        )

        res.status(200).json({
            message: `${updatedUser.firstName} has been blocked`,
            payload: updatedUser
        })
    } catch (err) {
        res.status(500).json({ message: "Error blocking user", error: err.message })
    }
})

// Unblock a user: restores isActive = true, allowing them to log in again
adminApp.put('/un-block/:uid', verifyToken("ADMIN"), async (req, res) => {
    try {
        const uid = req.params.uid

        const user = await UserTypeModel.findById(uid)
        if (!user) {
            return res.status(404).json({ message: "User not found" })
        }

        const updatedUser = await UserTypeModel.findByIdAndUpdate(
            uid,
            { isActive: true },
            { new: true, projection: { password: 0 } }
        )

        res.status(200).json({
            message: `${updatedUser.firstName} has been unblocked`,
            payload: updatedUser
        })
    } catch (err) {
        res.status(500).json({ message: "Error unblocking user", error: err.message })
    }
})