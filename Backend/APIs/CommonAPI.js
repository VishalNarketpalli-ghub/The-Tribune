import exp from 'express'
import bcrypt from 'bcrypt'
import { UserTypeModel } from '../Models/UserModel.js'
import { authenticate } from '../services/authService.js'
import { verifyToken } from '../middlewear/verifyToken.js'
import { ArticleModel } from '../Models/ArticleModel.js'

export const commonRout = exp.Router()

// login
commonRout.post('/login', async (req, res) => {
    // store body in UserCred
    let userCred = req.body

    // console.log(userCred)
    // call authenticate finction and destructre token, user
    let { token, user } = await authenticate(userCred)

    // add cookie res
    // secure: true  → required for HTTPS (Render)
    // sameSite: "none" → required for cross-origin (Vercel → Render)
    res.cookie("token", token, {
        httpOnly: true,
        sameSite: "none",
        secure: true
    })

    // send user response
    res.status(200).json({ message: "user logged in successfully", payload: user, token: token })
})

// logout
commonRout.get("/logout", (req, res) => {
    res.clearCookie('token',
        {
            httpOnly: true,
            secure: true,
            sameSite: "none"
        }
    )
    res.status(200).json({ messsage: "User logged out" })
})


// changing password
commonRout.put('/change-password', async (req, res) => {
    let { email, currentPassword, newPassword } = req.body
    // console.log(email, currentPassword, newPassword)

    // check user
    let { user } = await authenticate({ email: email, password: currentPassword })

    console.log(user)

    //check if previous password === current password
    if (currentPassword === newPassword) {
        return res.status(401).json({ message: "Old password is should not be same as new password" })
    }

    // update the password
    let hashedPassword = await bcrypt.hash(newPassword, 10)
    let updatedUser = await UserTypeModel.findByIdAndUpdate(user._id, { password: hashedPassword }, { new: true })

    // send response
    res.status(200).json({ message: "Password updated successfully", payload: updatedUser })
})

//  handeling refresh
commonRout.get('/check-auth', verifyToken("USER", "AUTHOR", "ADMIN"), (req,res) => {
    res.status(200).json({
        message: "authenticated",
        payload: req.user
    })
})

// read article by ID
commonRout.get('/article/:articleId', verifyToken("USER", "AUTHOR", "ADMIN"), async (req, res) => {
    let articleId = req.params.articleId
    try {
        let article = await ArticleModel.findOne({ _id: articleId, isArticleActive: true }).populate("author", "firstName email").populate("comments.user", "firstName")
        if(!article){
            return res.status(404).json({message: "Article not found"})
        }
        res.status(200).json({message: "Article fetched", payload: article})
    } catch (err) {
        res.status(500).json({message: "Error fetching article", error: err.message})
    }
})