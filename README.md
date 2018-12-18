# icdn - dynamic image resizer with cdn options
Provides easy to use middleware, which will embed into your ecosystem and provide flexible image resizing options.
All the requested images with allowed sizes and resolutions, will be created on fly, and than saved for future usage directly from static folder.

Basically algorithm is following:
1. Hit the server with image url with desired image resolution (ex: `https://yourdomain.com/trains/1024x0/megaTrain.png`)
1. Static server verifies if such image exists in path:  `public_folder/trains/1024x0/megaTrain.png`
    - if yes - hit it directly from static folder
    - if no - ask image resizer to perform image resizing
1. Resize Image
    - Read file from base `src` folder by a path `src/trains/megaTrain.png`
    - Resize file
    - Write file to `public_folder/trains/1024x0/megaTrain.png`
1. Redirect to `originalUrl` with `301` status code: (ex: `https://yourdomain.com/trains/1024x0/megaTrain.png`)

## Integrations
So far we do have few integrations:
* `express.js`
* `fastify.js`
* `vanilla.js`

But much more are coming! In particular:
* `AWS CloudFront` + `AWS Lambda` integration
* `GCP Cloud CDN` + `GCP Functions` integration
