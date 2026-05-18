import exp from "express"
import { connect } from "mongoose"
import { config } from "dotenv"
import { userRoute } from './APIs/UserAPI.js'
import { authorApp } from './APIs/AuthorAPI.js'
import { adminApp } from './APIs/AdminAPI.js'
import cookieParser from "cookie-parser"
import { commonRout } from "./APIs/CommonAPI.js"
import cors from 'cors'


config()



const app = exp();

// credentials is to allow the cookies to the browser from cross origin -> server sends the cookie to frontend
app.use(cors({ origin: ["http://localhost:5173", "https://the-tribune.vercel.app"], credentials: true }))

app.use(exp.json());

app.use(cookieParser())



// add body parser middleware


app.use('/user-api', userRoute)
app.use('/admin-api', adminApp)
app.use('/author-api', authorApp)
app.use('/common-api', commonRout)


const connectDb = async () => {
    try {
        await connect(process.env.DB_URL)
        console.log("DB is connected.. ")
        app.listen(process.env.PORT, () => console.log("Server is running"))
    } catch (error) {
        console.log("error connecting to DB", error)
    }
}

connectDb()


// logout
app.post("/logout", (req, res) => {
    res.clearCookie('token',
        {
            httpOnly: true,
            secure: false,
            sameSite: "lax"
        }
    )
    res.status(200).json({ messsage: "User logged out" })
})


// dealing with invalid path
app.use((req, res, next) => {
    // console.log(req.url)
    res.status(200).json({ message: `${req.url} is invallid path` })
})


// error handeling middleware
app.use((err, req, res, next) => {
    console.log("error")
    res.json({ message: "error", reason: err.message })
})
