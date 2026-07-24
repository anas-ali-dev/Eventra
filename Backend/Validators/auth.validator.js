import { body, validationResult } from "express-validator";


// Collect and return validation errors
export const validate = (req, res, next) =>
{
    const errors = validationResult(req);

    if (!errors.isEmpty())
    {
        return res.status(400).json(
        {
            success: false,
            message: "Validation failed.",
            errors: errors.array().map((err) => ({
                field: err.path,
                message: err.msg
            }))
        });
    }

    next();
};


// Validation rules
export const registerRules = [
    body("name")
        .trim()
        .notEmpty().withMessage("Name is required."),

    body("email")
        .trim()
        .isEmail().withMessage("A valid email is required.")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters."),

    body("phone")
        .optional()
        .isMobilePhone("any").withMessage("A valid phone number is required."),

    body("role")
        .optional()
        .isIn(["customer", "organizer"]).withMessage("Role must be customer or organizer.")
];

export const loginRules = [
    body("email")
        .trim()
        .isEmail().withMessage("A valid email is required.")
        .normalizeEmail(),

    body("password")
        .notEmpty().withMessage("Password is required.")
];

export const forgotPasswordRules = [
    body("email")
        .trim()
        .isEmail().withMessage("A valid email is required.")
        .normalizeEmail()
];

export const resetPasswordRules = [
    body("newPassword")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters.")
];

export const changePasswordRules = [
    body("currentPassword")
        .notEmpty().withMessage("Current password is required."),

    body("newPassword")
        .isLength({ min: 8 }).withMessage("New password must be at least 8 characters.")
        .custom((value, { req }) =>
        {
            if (value === req.body.currentPassword)
            {
                throw new Error("New password must be different from current password.");
            }
            return true;
        })
];