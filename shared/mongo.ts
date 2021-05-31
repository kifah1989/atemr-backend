import { MongoClient } from "mongodb";


const config = {
  url: 'mongodb://localhost:27017/atemr-db"',
  dbName: 'atemr-db',
};

export async function createConnection() {
  const connection = await MongoClient.connect(config.url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  const db = connection.db(config.dbName);
  return {
    connection,
    db,
  };
}
