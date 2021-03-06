describe("blackberry.io", function () {

    it("Sandboxed FileSystem write file", function () {
        var errorHandler = jasmine.createSpy().andCallFake(function (e) {
                console.log(e);
            }),
            fileWritten = false,
            fileName = "textData.txt",
            blob = new Blob(['this is text data'], {type: 'text/plain'});

        runs(function () {

            function gotWriter(fileWriter) {
                fileWriter.onwriteend = function (e) {
                    fileWritten = true;
                };
                fileWriter.write(blob);
            }

            function gotFile(fileEntry) {
                fileEntry.createWriter(gotWriter, errorHandler);
            }

            function onInitFs(fs) {
                fs.root.getFile(fileName, {create: true}, gotFile, errorHandler);
            }

            blackberry.io.sandbox = true;
            window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024, onInitFs, errorHandler);
        });

        waitsFor(function () {
            return fileWritten;
        }, "File write never completed", 3000);

        runs(function () {
            expect(errorHandler).wasNotCalled();
            expect(fileWritten).toBe(true);
        });

    });

    it("Sandboxed FileSystem read file", function () {
        var errorHandler = jasmine.createSpy().andCallFake(function (e) {
                console.log(e);
            }),
            fileRead = false,
            fileName = "textData.txt",
            fileContent;

        runs(function () {

            function gotFile(fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();

                    reader.onloadend = function (e) {
                        fileContent = this.result;
                        fileRead = true;
                    };

                    reader.readAsText(file);
                }, errorHandler);
            }

            function onInitFs(fs) {
                fs.root.getFile(fileName, {create: true}, gotFile, errorHandler);
            }

            blackberry.io.sandbox = true;
            window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024, onInitFs, errorHandler);
        });

        waitsFor(function () {
            return fileRead;
        }, "File read never completed", 3000);

        runs(function () {
            expect(errorHandler).wasNotCalled();
            expect(fileRead).toBe(true);
            expect(fileContent).toBeDefined();
            expect(fileContent).toBe("this is text data");
        });
    });

    it("Unsandboxed FileSystem write file", function () {
        var errorHandler = jasmine.createSpy().andCallFake(function (e) {
                console.log(e);
            }),
            fileWritten = false,
            dir = blackberry.io.sharedFolder + "/documents/",
            fileName = "textData.txt",
            blob = new Blob(['this is text data'], {type: 'text/plain'});

        runs(function () {
            blackberry.io.sandbox = false;

            function gotWriter(fileWriter) {
                fileWriter.onwriteend = function (e) {
                    fileWritten = true;
                };
                fileWriter.write(blob);
            }

            function gotFile(fileEntry) {
                fileEntry.createWriter(gotWriter, errorHandler);
            }

            function onInitFs(fs) {
                fs.root.getFile(dir + fileName, {create: true}, gotFile, errorHandler);
            }


            window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024, onInitFs, errorHandler);
        });

        waitsFor(function () {
            return fileWritten;
        }, "File write never completed", 1000);

        runs(function () {
            expect(errorHandler).wasNotCalled();
            expect(fileWritten).toBe(true);
        });

    });

    it("Unsandboxed FileSystem read file", function () {
        var errorHandler = jasmine.createSpy().andCallFake(function (e) {
                console.log(e);
            }),
            fileRead = false,
            dir = blackberry.io.sharedFolder + "/documents/",
            fileName = "textData.txt",
            fileContent;

        runs(function () {
            blackberry.io.sandbox = false;

            function gotFile(fileEntry) {
                fileEntry.file(function (file) {
                    var reader = new FileReader();

                    reader.onloadend = function (e) {
                        fileContent = this.result;
                        fileRead = true;
                    };

                    reader.readAsText(file);
                }, errorHandler);
            }

            function onInitFs(fs) {
                fs.root.getFile(dir + fileName, {create: true}, gotFile, errorHandler);
            }

            window.webkitRequestFileSystem(window.PERSISTENT, 1024 * 1024, onInitFs, errorHandler);
        });

        waitsFor(function () {
            return fileRead;
        }, "File read never completed", 1000);

        runs(function () {
            expect(errorHandler).wasNotCalled();
            expect(fileRead).toBe(true);
            expect(fileContent).toBeDefined();
            expect(fileContent).toBe("this is text data");
        });
    });
});
