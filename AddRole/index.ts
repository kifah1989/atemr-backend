import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    const roleNameParameter = req.body.name;
    const roleDescriptionParameter = req.body.description;


    const { db, connection } = await createConnection();
    const Roles = db.collection("roles");

    try {
        const getrole = await Roles.findOne({ name: roleNameParameter })

        if (getrole) {
            context.res = {
                status: 200,
                body: "duplicate Role Name"
            };
            return;
        }

        await Roles.insertOne(
            {
                name: roleNameParameter,
                description: roleDescriptionParameter,
                users: [],
                dateCreated: new Date()
            }

        );
        const getroleId = await Roles.findOne({ name: roleNameParameter }, { projection: { _id: 1 } })
        context.res = {
            status: 200,
            body: getroleId._id
        }

        connection.close();

    } catch (error) {
        context.res = {
            status: 500,
            body: "Error adding role",
        };
    }
};

export default httpTrigger;