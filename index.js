const Jimp = require('jimp');
const fs = require('fs-extra');
const { get } = require('lodash');
const ALLOWED_EXTENSIONS = ['jpg', 'png'];
const ALLOWED_RESOLUTIONS = [-1, 0, 32, 64, 128, 256, 320, 480, 640, 768, 960, 1024, 1080, 1280, 1440, 1920, 2048 ];
const DIMENSION_REGEX = /\/[0-9]{1,5}x[0-9]{1,5}\//;

/**
 * Resize image used predefined strategy.
 * Receive image path as input, read it, determine do it need resize based on dimension input.
 * In case image need resizing - resize it,
 * otherwise just copy it over to public folder.
 */
class ImageResizer {
    /**
     * Initial setup for object.
     * @param {Number} w - width in px.
     * @param {Number} h - height in px.
     * @param {String} source - path to source file.
     * @param {String} dest - path to destination file.
     * @param {String[]} allowedExtensions - list of allowed extensions.
     * @param {Number[]} allowedResolutions - list of allowed resolutions.
     */
    constructor(w, h, source, dest, allowedExtensions, allowedResolutions) {
        this.w = w || Jimp.AUTO;
        this.h = h || Jimp.AUTO;
        this.imageResizeStrategy = Jimp.RESIZE_BICUBIC;
        this.sourcePath = source;
        this.destPath = dest;
        this.allowedExtensions = allowedExtensions || ALLOWED_EXTENSIONS;
        this.allowedResolutions = allowedResolutions || ALLOWED_RESOLUTIONS;
    }

    async run() {
        await this.verify();

        if (this.w !== Jimp.AUTO || this.h !== Jimp.AUTO)
            await this.resize();
        else
            await this.copy();
    }

    verify() {
        if (!this.allowedExtensions.includes(this.sourcePath.slice(-3))) {
            throw new Error('UNSUPPORTED_EXTENSION')
        }
        if (!this.allowedResolutions.includes(this.w) || !this.allowedResolutions.includes(this.h)) {
            throw new Error('UNSUPPORTED_RESOLUTION')
        }
    }

    async resize() {
        const image = await Jimp.read(this.sourcePath);

        return image
            .resize(this.w, this.h, this.imageResizeStrategy)
            .write(this.destPath);
    }

    async copy() {
        await fs.copy(this.sourcePath, this.destPath);
    }
}

class ImageResizeBuilder {
    constructor(srcFolder, pubFolder) {
        this.srcFolder = srcFolder;
        this.pubFolder = pubFolder;
        this.regex = DIMENSION_REGEX;
        this.allowedExtensions = null;
        this.allowedResolutions = null;
        this.reqPath = null;
        this.next = () => {};
    }

    setAllowedExtensions(allowedExtensions) {
        if (!Array.isArray(allowedExtensions)) throw new Error('EXTENSIONS_ARRAY_EXPECTED');

        this.allowedExtensions = allowedExtensions;
        return this;
    }

    setAllowedResolutions(allowedResolutions) {
        if (!Array.isArray(allowedResolutions)) throw new Error('RESOLUTIONS_ARRAY_EXPECTED');

        this.allowedResolutions = allowedResolutions;
        return this;
    }

    setMiddleware(next) {
        if (typeof next !== 'function') throw new Error('MIDDLEWARE_FUNCTION_EXPECTED');

        this.next = next;
        return this;
    }

    setReqPath(reqPath) {
        if (typeof reqPath !== 'object' || reqPath === null)
            throw new Error('REQPATH_OBJECT_EXPECTED');

        this.reqPath = reqPath;
        return this;
    }

    build(gReq, gRes) {
        if (!this.reqPath) throw new Error('NO_REQ_PATH');
        return async (lReq, lRes) => {
            const req = lReq || gReq;
            const res = lRes || gRes;
            const query = get(req, this.reqPath.originalUrl).replace(/^\/+/g, '');
            const dest = `${this.pubFolder}/${query}`;
            const [w, h] = this.getDimensions(query, this.regex);
            const source = `${this.srcFolder}/${query.replace(`${w}x${h}/`, '')}`;

            try {
                await new ImageResizer(w, h, source, dest, this.allowedExtensions, this.allowedResolutions).run();
                res.writeHead(302,
                    {Location: get(req, this.reqPath.originalUrl)}
                );
                res.end();
            } catch (e) {
                res.writeHead(500, { 'Content-Type': 'application/json'});
                res.write(JSON.stringify(e));
                res.end();
            }
            this.next(req, res);
        }
    }

    getDimensions(query, regex) {
        return (query.match(regex) || ['0x0'])[0]
            .replace(/\//g, '')
            .split('x')
            .map(n => parseInt(n, 10))
    }
}

module.exports.ImageResizer = ImageResizer;
module.exports.ImageResizeBuilder = ImageResizeBuilder;
