const expect = require('chai').expect;
const { ImageResizer, ImageResizeBuilder } = require('./index');
const fs = require('fs');

describe('we <3 testing =^._.^= ∫', () =>  {
    describe('ᕕ( ᐛ )ᕗ Tests ImageResizeBuilder', () => {
        const Builder = new ImageResizeBuilder('./test/src', './test/thumbnails');
        describe('三ᕕ( ᐛ )ᕗ Testing setAllowedExtensions', () => {
            it('三三ᕕ( ᐛ )ᕗ should check if allowedExtensions set properly', () => {
                Builder.setAllowedExtensions(['tiff', 'gif', 'og3']);
                expect(JSON.stringify(Builder.allowedExtensions)).to.be.eq('["tiff","gif","og3"]');
            });
            it('三三ᕕ( ᐛ )ᕗ should check if setAllowedExtensions throws an error when array is empty', (done) => {
                try {
                    Builder.setAllowedExtensions();
                } catch (e) {
                    expect(e.message).to.be.eq('EXTENSIONS_ARRAY_REQUIRED');
                    done();
                }
            });
        });
        describe('三ᕕ( ᐛ )ᕗ Testing setAllowedResolutions', () => {
            it('三三ᕕ( ᐛ )ᕗ should check if allowedResolutions set properly', () => {
                Builder.setAllowedResolutions([1024, 1280, 5032]);
                expect(JSON.stringify(Builder.allowedResolutions)).to.be.eq('[1024,1280,5032]');
            });
            it('三三ᕕ( ᐛ )ᕗ should check if setAllowedExtensions throws an error when array is empty', (done) => {
                try {
                    Builder.setAllowedResolutions();
                } catch (e) {
                    expect(e.message).to.be.eq('RESOLUTIONS_ARRAY_REQUIRED');
                    done();
                }
            });
        });

        describe('三ᕕ( ᐛ )ᕗ Testing setMiddleware', () => {
            it('三三ᕕ( ᐛ )ᕗ should check if middleware set properly', () => {
                Builder.setMiddleware(() => 'Test');
                expect(Builder.next()).to.be.eq('Test');
            });
            it('三三ᕕ( ᐛ )ᕗ should check if middleware throws exception when non function passed', (done) => {
                try {
                    Builder.setMiddleware('Test');
                } catch (e) {
                    expect(e.message).to.be.eq('MIDDLEWARE_FUNCTION_REQUIRED');
                    done();
                }
            });
        });

        describe('三ᕕ( ᐛ )ᕗ Testing setReqUrlPath', () => {
            it('三三ᕕ( ᐛ )ᕗ should check if builder throws exception when no reqUrlPath Specified', (done) => {
                try {
                    Builder.build({}, {});
                } catch (e) {
                    expect(e.message).to.be.eq('REQ_URL_PATH_REQUIRED');
                    done();
                }
            });
            it('三三ᕕ( ᐛ )ᕗ should check if reqUrlPath set properly', () => {
                Builder.setReqUrlPath('test');
                expect(Builder.reqUrlPath).to.be.eq('test');
            });
            it('三三ᕕ( ᐛ )ᕗ should check if middleware throws exception when non string passed', (done) => {
                try {
                    Builder.setReqUrlPath(5);
                } catch (e) {
                    expect(e.message).to.be.eq('REQ_URL_PATH_STRING_REQUIRED');
                    done();
                }
            });
        });

        describe('三ᕕ( ᐛ )ᕗ Testing build function', () => {
            it('三三ᕕ( ᐛ )ᕗ should check if builder returns correct async', async () => {
                const resizer = Builder
                    .setReqUrlPath('url')
                    .setAllowedExtensions(['jpg'])
                    .setAllowedResolutions([-1, 128])
                    .build();
                await resizer({
                        url: 'trains/128x0/test.jpg'
                    }, { writeHead: () => {}, write: () => {}, end: () => {} });
                expect( fs.existsSync('./test/thumbnails/trains/128x0/test.jpg') ).to.be.eq(true);
            });
        });
    });
});
