import { Schema, model } from "mongoose"

/**
 * userCommentSchema — embedded sub-document that stores a single comment.
 * Each comment tracks which user wrote it and the comment text.
 * "user" references the UserTypeModel so we can populate firstName/email.
 */
const userCommentSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    comments: {
        type: String
    }
})

/**
 * articleSchema — main schema for blog articles.
 *
 * Key fields:
 *   author          — ObjectId reference to the user who wrote the article
 *   title/category/content — core article content
 *   comments        — array of embedded userCommentSchema sub-documents
 *   isArticleActive — soft-delete flag controlled by the author;
 *                     false = author has archived it, but can restore
 *   isAdminDeleted  — hard-delete flag controlled only by admins;
 *                     when true, the article is hidden from everyone and
 *                     the author is NOT allowed to restore it
 *
 * Design decision: two separate flags are used so the restore logic can
 * distinguish between an author-initiated archive and an admin-initiated
 * removal without adding a role check inside the author route.
 */
const articleSchema = new Schema({
    author: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: [true, "Author is required"]
    },
    title: {
        type: String,
        required: [true, "Title is required"]
    },
    category: {
        type: String,
        required: [true, "category is required"]
    },
    content: {
        type: String,
        required: [true, "content is required"]
    },
    comments: [userCommentSchema],
    // Author-controlled visibility: true = published, false = archived by author
    isArticleActive: {
        type: Boolean,
        default: true
    },
    // Admin-controlled removal: once set to true the author cannot restore the article
    isAdminDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    // strict: 'throw' ensures no unknown fields are saved accidentally
    strict: 'throw',
    versionKey: false
})

export const ArticleModel = model('article', articleSchema)