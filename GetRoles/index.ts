import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { ObjectId } from "mongodb";
import { createConnection } from "../shared/mongo";

const httpTrigger: AzureFunction = async function (
    context: Context,
    req: HttpRequest
): Promise<void> {

    try {
        const { db, connection } = await createConnection();
        const rolesCollection = db.collection("roles");
        //todo agrigiate roles
        const roles = await rolesCollection.aggregate([

            {

                $lookup: {
                    from: 'users',
                    localField: 'users',
                    foreignField: '_id',
                    as: 'users'
                }
            },
            {
                $project: {
                    _id: false,
                    id: "$_id",
                    name: true,
                    description: true,
                    dateCreated: true,
                    users: {
                        $map: {
                            input: "$users",
                            as: "user",
                            in: {
                                "id": "$$user._id",
                                userName: "$$user.username"
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
            body: roles,
        };
    } catch (error) {
        context.res.status(400).json({ error: error });
    }
};

export default httpTrigger;

