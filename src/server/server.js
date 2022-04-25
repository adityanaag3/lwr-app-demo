import { createServer } from 'lwr';
import { platformWebServerAuthMiddleware } from '@lwrjs/auth-middleware';
import 'dotenv/config';

const lwrServer = createServer({ serverType: 'express' });
platformWebServerAuthMiddleware(lwrServer.getServer());

lwrServer
    .listen(({ port, serverMode }) => {
        console.log(`App listening on port ${port} in ${serverMode} mode\n`);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });