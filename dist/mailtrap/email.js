"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendResetSuccessEmail = exports.sendPasswordResetEmail = exports.sendWelcomeEmail = exports.sendVerificationEmail = void 0;
const emailTemplate_1 = require("./emailTemplate");
const mailtrap_config_1 = require("./mailtrap.config");
const sendVerificationEmail = (email, verificationToken) => __awaiter(void 0, void 0, void 0, function* () {
    //grab the new user's email because he/she will be the one thats gonna receive the verification
    const recepient = [{ email }];
    try {
        //The response is what will the function do
        const response = yield mailtrap_config_1.mailtrap_client.send({
            from: mailtrap_config_1.sender,
            to: recepient,
            subject: "Verify you email",
            html: emailTemplate_1.VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
            category: "Email Verification",
        });
        console.log("email sent successfully");
    }
    catch (error) {
        console.error(`Error sending verification`, error);
        throw new Error(`Error sending verification email: ${error}`);
    }
});
exports.sendVerificationEmail = sendVerificationEmail;
const sendWelcomeEmail = (email, name) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = [{ email }];
    try {
        yield mailtrap_config_1.mailtrap_client.send({
            from: mailtrap_config_1.sender,
            to: recipient,
            template_uuid: "7c06042b-9d03-40ad-92a5-c3c0932e2b55",
            template_variables: {
                company_info_name: "TechCommerce",
                name: name,
            },
        });
        console.log("Welcome email sent successfully");
    }
    catch (error) {
        console.log("error sending welcome email:", error);
        throw new Error(`Error sending welcome email: ${error}`);
    }
});
exports.sendWelcomeEmail = sendWelcomeEmail;
const sendPasswordResetEmail = (email, resetUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = [{ email }];
    try {
        const response = yield mailtrap_config_1.mailtrap_client.send({
            from: mailtrap_config_1.sender,
            to: recipient,
            subject: "Reset your password",
            html: emailTemplate_1.PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
            category: "Password Reset",
        });
    }
    catch (error) {
        console.log("Error sending password reset email: ", error);
        throw new Error(`Error sending pasword reser email: ${error}`);
    }
});
exports.sendPasswordResetEmail = sendPasswordResetEmail;
const sendResetSuccessEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const recipient = [{ email }];
    try {
        const response = yield mailtrap_config_1.mailtrap_client.send({
            from: mailtrap_config_1.sender,
            to: recipient,
            subject: "Password reset successful",
            html: emailTemplate_1.PASSWORD_RESET_SUCCESS_TEMPLATE,
        });
    }
    catch (error) {
        console.log("An error occured trying to email the success email: ", error);
        throw new Error(`An error occured trying to send the success email: ${error}`);
    }
});
exports.sendResetSuccessEmail = sendResetSuccessEmail;
