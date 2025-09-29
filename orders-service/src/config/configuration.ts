export default () => ({
  port: parseInt(process.env.PORT, 10) || 8000,
  kafka: {
    brokers: process.env.KAFKA_BOOTSTRAP_SERVERS.split(','),
  },
});
