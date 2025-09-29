export default () => ({
  port: parseInt(process.env.PORT, 10),
  database: {
    uri: process.env.MONGODB_URI,
  },
  kafka: {
    brokers: process.env.KAFKA_BOOTSTRAP_SERVERS.split(','),
    groupId: process.env.KAFKA_GROUP_ID,
  },
});
