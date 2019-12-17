import { Sequelize, DataTypes } from "sequelize";
import { config } from "dotenv";
config();

export const connection = new Sequelize(
	process.env.DATABASE_NAME,
	process.env.DATABASE_USER,
	process.env.DATABASE_PASSWORD,
	{
		dialect: "postgres"
		// logging: (msg, time) => console.log(msg, time)
	}
);
const accounts = connection.define("accounts", {
	twitter_id: DataTypes.STRING,
	address: DataTypes.STRING,
	return_address: DataTypes.STRING
});

connection
	.authenticate()
	.then(() => {
		console.log("database connection established");
		accounts.sync({ alter: true }).then(() => console.log("tables created"));
	})
	.catch(error => {
		console.error("unable to connect to database", error);
	});

export const Account = connection.models.accounts;
