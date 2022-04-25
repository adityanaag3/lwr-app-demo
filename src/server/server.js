import { createServer } from 'lwr';
import { getTodoItems } from './api.js';

const lwrServer = createServer({ serverType: 'express' });
const expressApp = lwrServer.getInternalServer();

expressApp.get('/api/getTodoItems', getTodoItems);

lwrServer
    .listen(({ port, serverMode }) => {
        console.log(`App listening on port ${port} in ${serverMode} mode\n`);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });