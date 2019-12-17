import { config } from "dotenv";
import { twitter } from "./twitter/webhook";

config();
twitter().catch(e => console.error("error establishing twitter webhook: ", e));
