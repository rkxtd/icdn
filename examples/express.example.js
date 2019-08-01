const express = require('express');
const { ImageResizeBuilder } = require('..');
const { getEmoji } = require('random-text-meme');

const app = express();
const port = 3000;
const PUB_FOLDER = 'public'; // no end slash
const SRC_FOLDER = 'src'; // no end slash

// Middleware
app.use(express.static(PUB_FOLDER));

// Routes
app.get('/', (req, res) => res.send(`Hello World! ${getEmoji('happy-gary')}`));

//The 404 Route (ALWAYS Keep this as the last route)
app.get('*.(png|jpg)', new ImageResizeBuilder(SRC_FOLDER, PUB_FOLDER)
    .setReqUrlPath('originalUrl')
    .build());

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
