import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
} from "./emailTemplate";
import { mailtrap_client, sender } from "./mailtrap.config";

export const sendVerificationEmail = async (
  email: string,
  verificationToken: string
) => {
  //grab the new user's email because he/she will be the one thats gonna receive the verification
  const recepient = [{ email }];

  try {
    //The response is what will the function do
    const response = await mailtrap_client.send({
      from: sender,
      to: recepient,
      subject: "Verify you email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email Verification",
    });
    console.log("email sent successfully");
  } catch (error) {
    console.error(`Error sending verification`, error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email: string, name: string) => {
  const recipient = [{ email }];
  try {
    await mailtrap_client.send({
      from: sender,
      to: recipient,
      template_uuid: "7c06042b-9d03-40ad-92a5-c3c0932e2b55",
      template_variables: {
        company_info_name: "TechCommerce",
        name: name,
      },
    });
    console.log("Welcome email sent successfully");
  } catch (error) {
    console.log("error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};

export const sendPasswordResetEmail = async (
  email: string,
  resetUrl: string
) => {
  const recipient = [{ email }];

  try {
    const response = await mailtrap_client.send({
      from: sender,
      to: recipient,
      subject: "Reset your password",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
      category: "Password Reset",
    });
  } catch (error) {
    console.log("Error sending password reset email: ", error);
    throw new Error(`Error sending pasword reser email: ${error}`);
  }
};

export const sendResetSuccessEmail = async (email: string) => {
  const recipient = [{ email }];
  try {
    const response = await mailtrap_client.send({
      from: sender,
      to: recipient,
      subject: "Password reset successful",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
  } catch (error) {
    console.log("An error occured trying to email the success email: ", error);
    throw new Error(
      `An error occured trying to send the success email: ${error}`
    );
  }
};
