import Server from './src/server';

const server = new Server();

process.on('SIGTERM', () => {
    server.listen.close();
});