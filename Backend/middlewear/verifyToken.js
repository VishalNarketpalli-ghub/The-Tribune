import jwt from "jsonwebtoken"
import { config } from "dotenv"
config()

export const verifyToken = (...allowedRoles) => {
    return async (req, res, next) => {
        try {

            // Read token from cookies
            let token = req.cookies?.token
            // console.log(token)

            // check token exist
            if (!token) {

                // send error response
                return res.status(401).json({ message: "Token expired, please login to continue" })
            }

            // verify token
            let decodedToken = jwt.verify(token, process.env.JWT_SECRET)

            // check if user role is valid
            if (allowedRoles.length && !allowedRoles.includes(decodedToken.role)) {

                // if Role dosent match send response
                return res.status(403).json({ message: "Forbidden, you dont have permission" })
            }

            // add token to req.user
            req.user = decodedToken

            // send the controal to next middlewear
            next()
        } catch (error) {
            if (error.name === "TokenExpiredError") {
                return res.status(401).json({
                    message: "Session expired. Please login again"
                })
            }

            if (error.name === "JsonWebTokenError") {
                return res.status(401).json({
                    message: "Invalid token"
                })
            }

            return res.status(500).json({
                message: "Server error"
            })
        }
    }
}