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
            body: "Fields Are Required",
        };

        return;
    }

    const { db, connection } = await createConnection();
    const Users = db.collection("users");
    const Roles = db.collection("roles");

    try {
        const role = await Roles.findOne({ _id: ObjectID(roleId) });
        const user = await Users.findOne({ _id: ObjectID(userId) });

        if (!role) {
            context.res = {
                status: 200,
                body: "missing Role Data"
            };
            return;
        }
        if (!user) {
            context.res = {
                status: 200,
                body: "missing User Data"
            };
            return;
        }
        const filter = user.roles?.filter(roleId => roleId.equals(role._id))

        if (filter.length == 0) {
            context.res = {
                status: 200,
                body: "role Doesn't Exist"
            };
            return;
        }
        await Users.findOneAndUpdate(
            { _id: new ObjectID(userId) },
            { $pull: { roles: ObjectID(roleId) } }
        );
        await Roles.findOneAndUpdate(
            { _id: new ObjectID(roleId) },
            { $pull: { users: ObjectID(userId) } });
        //using key value pair response
        context.res = {
            body: {response:"User Removed from Role"}
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
