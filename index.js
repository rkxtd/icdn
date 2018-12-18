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

    /**
     * Runs resizing sequence, together with some pre-checks.
     * If width and heights of target image are not being set - simply copy the image,
     * from source to destination.
     * @returns {Promise<void>}
     */
    async run() {
        this.verify();
        if (this.w !== Jimp.AUTO || this.h !== Jimp.AUTO)
            await this.resize();
        else
            await this.copy();
    }

    /**
     * Verify that target image has allowed resolution and allowed resolution.
     * Otherwise - throw the exception.
     */
    verify() {
        if (!this.allowedExtensions.includes(this.sourcePath.slice(-3))) {
            throw new Error('UNSUPPORTED_EXTENSION')
        }
        if (!this.allowedResolutions.includes(this.w) || !this.allowedResolutions.includes(this.h)) {
            throw new Error('UNSUPPORTED_RESOLUTION')
        }
    }

    /**
     * That's where all the magic happens.
     * Resize an image to desired width/height and save it to destPath.
     * @returns {Promise<Jimp>}
     */
    async resize() {
        const image = await Jimp.read(this.sourcePath);

        return image
            .resize(this.w, this.h, this.imageResizeStrategy)
            .write(this.destPath);
    }

    /**
     * Copy image from source to target destination.
     * @returns {Promise<void>}
     */
    async copy() {
        await fs.copy(this.sourcePath, this.destPath);
    }
}

/**
 * ImageResizeBuilder adds some simplification for ImageResizer usage.
 * It helps to avoid all possible configuration hell, keeping powerful mechanism reachable by engineer.
 */
class ImageResizeBuilder {
    /**
     * @param srcFolder
     * @param pubFolder
     */
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
