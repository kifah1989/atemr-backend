import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createConnection } from "../shared/mongo";
import { ObjectID } from 'mongodb'; // or ObjectID 


const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {
    
    


    try {
        const roleId = req.body.roleId || {};

        if (!roleId) {
            context.res = {
                status: 400,
                body: "Fields are required",
            };

            return;
        }

        const { db, connection } = await createConnection();
        const Roles = db.collection("roles");
        const getrole = await Roles.findOne({ _id: ObjectID(roleId) })

        if(getrole == null){
            context.res = {
                status: 200,
                body: "role does not exist"
            };
            return;

        }

        if (getrole.users.length > 0){
            context.res = {
                status: 200,
                body: "cannot delete role that contain users"
            };
            return;
        }

        if (roleId === getrole._id.toHexString()) {

            await Roles.deleteOne(
                { _id: ObjectID(roleId) }
            )


            context.res = {
                status: 200,
                body: "role deleted"
            };
            return;
        }
         
        connection.close();

    } catch (error) {
        context.res = {
            status: 500,
            body: "Error deleting a user role",
        };
    }
}

export default httpTrigger;