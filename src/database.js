import pg from "pg";
import dotenv from "dotenv";
dotenv.config();
const database_url = process.env.DATABASE_URL;
export const connection = new pg.Client({
  database: "develop",
  connectionString: database_url,
});
