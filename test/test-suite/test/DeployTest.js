/*
 *  Copyright 2012 Research In Motion Limited.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var childProcess = require("child_process"),
    path = require("path"),
    DeployTest,
    child;

DeployTest = function (projectPath) {
    var listeners = [],
        projectConfig = require(path.join(projectPath, "project.json"));

    function _exec(cmdExpr, done) {
        console.log(cmdExpr);
        childProcess.exec(cmdExpr, function (error, stdout, stderr) {
            console.log(stdout);
            console.log(stderr);
            if (typeof done === 'function') {
                done();
            }
        });

    }

    this.startServer = function () {
        child = childProcess.fork(__dirname + "/server.js");
        child.on('message', function (data) {
            console.log('The child says: ', data);
            if (data.msg === "Response Received") {
                listeners.forEach(function (listener) {
                    listener.apply(null, [data.response]);
                });
            }
        });
        child.send({method: "start"});
    };

    this.listen = function (done, scope) {
        listeners.push(done);
    };

    this.terminate = function (done) {
        child.send({method: "stop"});
        _exec("blackberry-deploy -terminateApp " + "-package " + 
            path.join(projectPath, "build", projectConfig.targets[projectConfig.defaultTarget].type, projectConfig.barName + ".bar") +  
            " -device " + projectConfig.targets[projectConfig.defaultTarget].ip + 
            " -password " + projectConfig.targets[projectConfig.defaultTarget].password,
            done);
    };

    this.uninstall = function (done) {
        _exec("blackberry-deploy -uninstallApp " + "-package " +  
            path.join(projectPath, "build", projectConfig.targets[projectConfig.defaultTarget].type, projectConfig.barName + ".bar") +  
            " -device " + projectConfig.targets[projectConfig.defaultTarget].ip + 
            " -password " + projectConfig.targets[projectConfig.defaultTarget].password,
            done);
    };

    this.stopListening = function (done) {
        var index = listeners.indexOf(done);
        listeners.splice(index, 1);
    };
};

module.exports = DeployTest;

