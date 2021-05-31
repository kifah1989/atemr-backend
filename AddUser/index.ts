import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    const userNameParameter = req.body.username;
    const firstNameParameter = req.body.firstName;
    const lastNameParameter = req.body.lastName;


    const { db, connection } = await createConnection();
    const Users = db.collection("users");

    try {
        const getUserName = await Users.findOne({ username: userNameParameter })



        if (getUserName) {
            context.res = {
                status: 200,
                body: "duplicateUserName"
            };
            return;
        }

        await Users.insertOne(
            {
                username: userNameParameter,
                firstName: firstNameParameter,
                lastName: lastNameParameter,
                roles: [],
                dateCreated: new Date()
            }

        );
        const getUserId = await Users.findOne({ username: userNameParameter }, { projection: { _id: 1 } })
        context.res = {
            status: 200,
            body: getUserId._id
        }

        connection.close();

    } catch (error) {
        context.res = {
            status: 500,
            body: "Error updating role",
        };
    }
};

export default httpTrigger;