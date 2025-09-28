const dbUser = process.env.MONGO_DB_USER;
const dbPassword = process.env.MONGO_DB_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;

db = db.getSiblingDB(dbName);

db.createUser({
  user: dbUser,
  pwd: dbPassword,
  roles: [
    {
      role: 'readWrite',
      db: dbName,
    },
  ],
});
