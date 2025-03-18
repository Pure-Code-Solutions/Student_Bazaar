import {body, validationResult} from "express-validator";

export const renderSignin = async (req, res) => {
    res.render("user-login-page");
}

export const renderRegister = async (req, res) => {
    res.render("user-registration-page");
}

const validateUser = [

]

export const postRegister = [
    validateUser,
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty) {
            return res.status(400).render("user-registration-page", {
                title: "Create user",
                errors: errors.array(),
              });
        }
        const firstName = req.body["first-name"];
        const lastName = req.body["last-name"];
        const email = req.body["email"];
    }
]