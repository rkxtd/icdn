// Require the framework and instantiate it
const fastify = require('fastify')();
const path = require('path');
const PUB_FOLDER = 'public'; // no end slash
const SRC_FOLDER = 'src'; // no end slash
const { ImageResizeBuilder } = require('..');
const { getEmoji } = require('random-text-meme');

fastify.register(require('fastify-static'), {
    root: path.join(__dirname, PUB_FOLDER),
    prefix: `/`,
});

fastify.setNotFoundHandler(new ImageResizeBuilder(SRC_FOLDER, PUB_FOLDER)
    .setReqPath({
        originalUrl: 'raw.url'
    })
    .build());

fastify.get('/', async () => {
    return `Hello World! ${getEmoji('happy-gary')}`;
});


// Run the server!
const start = async () => {
    try {
        await fastify.listen(3000);
        console.info(`server listening on ${fastify.server.address().port}`)
    } catch (err) {
        console.error(err);
        process.exit(1)
    }
};

start();
