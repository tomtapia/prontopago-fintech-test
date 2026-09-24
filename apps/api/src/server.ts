import { createApp } from './app.js';
import { getConfig } from './config.js';

const { port } = getConfig();
createApp().listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
