import User from "../Models/user.model.js";

// Get my profile
export const getProfile = async (req, res) =>
{
    try
    {
        const user = await User.findById(req.user.id);

        if (!user)
        {
            return res.status(404).json(
            {
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json(
        {
            success: true,
            user
        });
    }
    catch (error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};


// Admins can get all users
export const getUsers = async (req, res) =>
{
    try
    {
        const users = await User.find();

        res.status(200).json(
        {
            success: true,
            count: users.length,
            users
        });
    }
    catch (error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};


// Admin can get single user by id
export const getUserById = async (req, res) =>
{
    try
    {
        const user = await User.findById(req.params.id);

        if (!user)
        {
            return res.status(404).json(
            {
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json(
        {
            success: true,
            user
        });
    }
    catch (error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};


// Update my profile
export const updateUser = async (req, res) =>
{
    try
    {
        const { name, phone } = req.body;

        const updates = {};

        if (name) updates.name = name;
        if (phone) updates.phone = phone;

        const user = await User.findByIdAndUpdate(
            req.user.id,
            updates,
            { new: true, runValidators: true }
        );

        if (!user)
        {
            return res.status(404).json(
            {
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json(
        {
            success: true,
            message: "Profile updated successfully.",
            user
        });
    }
    catch (error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};


// Delete my Account
export const deleteUser = async (req, res) =>
{
    try
    {
        const user = await User.findByIdAndDelete(req.user.id);

        if (!user)
        {
            return res.status(404).json(
            {
                success: false,
                message: "User not found."
            });
        }

        res.status(200).json(
        {
            success: true,
            message: "Account deleted successfully."
        });
    }
    catch (error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};


// Change password while logged in
export const changePassword = async (req, res) =>
{
    try
    {
        const { currentPassword, newPassword } = req.body;

        const user = await User.findById(req.user.id).select("+password");

        if (!user)
        {
            return res.status(404).json(
            {
                success: false,
                message: "User not found."
            });
        }

        const isMatch = await user.comparePassword(currentPassword);

        if (!isMatch)
        {
            return res.status(401).json(
            {
                success: false,
                message: "Current password is incorrect."
            });
        }

        user.password = newPassword; 
        user.refreshToken = undefined; 

        await user.save();

        res.status(200).json(
        {
            success: true,
            message: "Password changed successfully. Please log in again."
        });
    }
    catch (error)
    {
        res.status(500).json(
        {
            success: false,
            message: error.message
        });
    }
};