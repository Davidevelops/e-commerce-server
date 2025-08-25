import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN as string;

export const mailtrap_client = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@developeronline.xyz",
  name: "Anyo E-Commerce Team",
};
