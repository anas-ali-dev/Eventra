import { body } from "express-validator";

export const updateUserRules = [
    body("name")
        .optional()
        .trim()
        .notEmpty().withMessage("Name cannot be empty."),

    body("phone")
        .optional()
        .isMobilePhone("any").withMessage("A valid phone number is required.")
];