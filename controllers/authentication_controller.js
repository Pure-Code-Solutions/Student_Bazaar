import {body, validationResult} from "express-validator";

export const renderSignin = async (req, res) => {
    res.render("user-login-page");
}

export const renderRegister = async (req, res) => {

    res.render("user-registration-page", {firstNameError:""});
}

//Defines validation rules
const validateUser = [
    body("first-name").trim()
    .isLength({min: 2, max: 20}).withMessage("First Name must be between 2 and 50 characters long")
    .matches(/^[A-Za-z\s]+$/).withMessage("First Name must be alphabets (A-Z, a-z)"),
    body("last-name").trim()
    .isLength({min: 2, max: 20}).withMessage("Last Name must be between 2 and 50 characters long")
    .matches(/^[A-Za-z\s]+$/).withMessage("Last Name must be alphabets (A-Z, a-z)"),
    body("email").trim()
    .isEmail().withMessage("Email please enter a valid email address"),
    body("password").trim()
    .isLength({min: 6}).withMessage("Password must be at least 8 characters long"),
    body("confirm-password").trim()
    .custom((value, {req}) => value === req.body.password).withMessage("Password does not match"),
        
]


export const postRegister = [
    validateUser, //is the req to to passed in ValidationResult
    async (req, res) => {
        const errors = validationResult(req);

        // Convert errors to an array
        const errorsArray = errors.array();

        // Group errors by path
        const groupedErrors = errorsArray.reduce((acc, err) => {
            if (!acc[err.path]) {
                acc[err.path] = [];
            }
            acc[err.path].push(err.msg);
            return acc;
        }, {});
        //console.log(groupedErrors["first-name"][0]);
        if (!errors.isEmpty()) {
            return res.status(400).render("user-registration-page", {
                    errors: errorsArray
            });
        }
                
        
        const firstName = req.body["first-name"];
        const lastName = req.body["last-name"];
        const email = req.body["email"];
        const password = req.body["password"];
        //res.redirect("/signin");
    }
];