import jwt from 'jsonwebtoken';
import Customer from '../models/customer.model.js'

export const isAuthenticated = async (req,res,next)=>{
    try {
        const authorizationHeader = req.headers.authorization;
        const bearerToken = authorizationHeader?.startsWith("Bearer ")
            ? authorizationHeader.slice(7)
            : null;
        const token = req.cookies.token || bearerToken;

        if(!token){
            return res.status(401).json({
                message:"Not Authorized, Please Login"
            })
        }

        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await Customer.findById(decoded.customerId)

        if(!user){
            return res.status(401).json({
                message:"Not Authorized, Please Login"
            })
        }

        req.user=user
        next()
    } catch {
        return res.status(401).json({
            message:"Not Authorized, Please Login"
        })
    }
}

export const isAdmin = (req, res, next) => {
    if (!req.user?.isAdmin) {
        return res.status(403).json({
            success: false,
            message: "Admin access required"
        });
    }

    next();
};
