const app = require('./src/app');
const { PORT } = require('./src/config/env');
const logger = require('./src/utils/logger');

app.listen(PORT, () => {
  logger.info(`TaskFlow API running on port ${PORT}`);
});
