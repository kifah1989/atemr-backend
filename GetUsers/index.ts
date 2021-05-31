import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ObjectId } from "mongodb";
import { createConnection } from "../shared/mongo";

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    try {
        const { db, connection } = await createConnection();
        const usersCollection = db.collection("users");
        const users = await usersCollection.aggregate([

            {
                $lookup: {
                    from: 'roles',
                    localField: 'roles',
                    foreignField: '_id',
                    as: 'roles'
                }
            },
            {
                $project: {
                    _id: false,
                    id: "$_id",
                    username: true,
                    firstName: true,
                    lastName: true,
                    dateCreated: true,
                    roles: {
                        $map: {
                            input: "$roles",
                            as: "role",
                            in: {
                                "id": "$$role._id",
                                roleName: "$$role.name"
                            }
                        }
                    }
                }
            }

        ]).toArray();
        connection.close();

        // context.res.status(200).json({ users });
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: users,
        };
    } catch (error) {
        context.res.status(400).json({ error: error });
    }
};

export default httpTrigger;

