import { MailtrapClient } from "mailtrap";
import dotenv from "dotenv";

dotenv.config();

const TOKEN = process.env.MAILTRAP_TOKEN as string;

export const mailtrap_client = new MailtrapClient({
  token: TOKEN,
});

export const sender = {
  email: "hello@demomailtrap.co",
  name: "David Dela Cruz",
};
