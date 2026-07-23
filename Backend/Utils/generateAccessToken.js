import jwt from "jsonwebtoken";

const generateAccessToken = (userId, role) =>
{
    return jwt.sign(
        { id: userId, role },
        process.env.JWT_ACCESS_SECRET,
        { expiresIn: process.env.JWT_ACCESS_EXPIRE || "15m" }
    );
};

export default generateAccessToken;