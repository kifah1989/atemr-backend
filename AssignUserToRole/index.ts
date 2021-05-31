import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { ObjectID } from 'mongodb'; // or ObjectID


const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    const userId = req.body.userId || {};
    const roleId = req.body.roleId || {};

    if (!userId || !roleId) {
        context.res = {
            status: 400,
            body: "FieldsAreRequired",
        };

        return;
    }

    const { db, connection } = await createConnection();
    const Users = db.collection("users");
    const Roles = db.collection("roles");

    try {
        const role = await Roles.findOne({ _id: ObjectID(roleId) });
        const user = await Users.findOne({ _id: ObjectID(userId) });

        if (!roleId) {
            context.res = {
                status: 200,
                body: "missingRole"
            };
            return;
        }
        if (!userId) {
            context.res = {
                status: 200,
                body: "missingUser"
            };
            return;
        }
        const filter = user.roles?.filter(roleId => roleId.equals(role._id))

        if (filter.length > 0) {
            context.res = {
                status: 200,
                body: "roleExist"
            };
            return;
        }

        await Users.findOneAndUpdate(
            { _id: new ObjectID(userId) },
            { $push: { roles: ObjectID(roleId) } }
        );
        await Roles.findOneAndUpdate(
            { _id: new ObjectID(roleId) },
            { $push: { users: ObjectID(userId) } });
        context.res = {
            status: 200,
            body: "roleAdded"
        };
    } catch (error) {
        context.res = {
            status: 500,
            body: error,
        };
    } finally {
        connection.close();
    }

};

export default httpTrigger;