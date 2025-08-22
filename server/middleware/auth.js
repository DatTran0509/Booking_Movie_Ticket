import { clerkClient } from '@clerk/express';
export const protectAdmin = async (req, res, next) => {
    try
    {
        const {userId} = req.auth();
        const user = await clerkClient.users.getUser(userId);
        if(user.privateMetadata.role !== 'admin') {
            return res.status(403).json({success: false, error: "Forbidden: Admins only"});
        }
        next();
    }catch(error) {
        console.error(error);
        return res.status(401).json({success: false, error: "Unauthorized access"});
    }
}