"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gigaset_1 = require("./gigaset");
const mqtt_1 = require("./mqtt");
const utils_1 = require("./utils");
const fs = require("fs");
const express = require("express");
const markdownIt = require("markdown-it");
// returns the 1st element of the array if the test is true, otherwise returns the array
const flatIf = (test, a) => test ? a[0] : a;
// a web-server
const app = express();
// set the route: raw api
app.get('/api/*', (req, res) => {
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.BASE + req.url).pipe(res);
});
// set the route: live camera (redirect to a cloud-based RTSP stream)
app.get('/live', (_, res) => {
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.CAMERA.replace('{id}', utils_1.conf('camera_id')), (_, __, body) => {
        try {
            res.redirect(JSON.parse(body).uri.rtsp);
        }
        catch (e) {
            gigaset_1.handleGigasetError('live camera', e, body);
            res.status(410).end();
        }
    });
});
// set the route: live camera (local MJPEG stream)
app.get('/live-local', (_, res) => {
    gigaset_1.gigasetRequest.get('http://admin:' + utils_1.conf('camera_password') + '@' + utils_1.conf('camera_ip') + '/stream.jpg').pipe(res);
});
// set the route: sensors and sensors/id
app.get(['/sensors', '/sensors/:id'], (req, res) => {
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.SENSORS, (_, __, body) => {
        try {
            res.send(flatIf(req.params.id, JSON.parse(body)[0].sensors
                .filter(s => req.params.id ? (s.friendly_name == req.params.id) : true)
                .map(s => {
                return {
                    name: s.friendly_name,
                    type: s.type,
                    status: s.status,
                    battery: s.battery != undefined ? s.battery.state : undefined,
                    position_status: s.position_status
                };
            })));
        }
        catch (e) {
            gigaset_1.handleGigasetError('sensors', e, body);
            res.status(503).end();
        }
    });
});
// set the route: send events on mqtt corresponding to actual sensor states
app.get('/force-refresh', (_, res) => {
    mqtt_1.sendActualStates();
    res.send('done');
});
// set the route: intrusion setting active mode (home, away...)
app.get('/intrusion_settings', (_, res) => {
    gigaset_1.gigasetRequest.get(gigaset_1.GIGASET_URL.SENSORS, (_, __, body) => {
        try {
            let base = JSON.parse(body)[0];
            res.send(base.intrusion_settings.active_mode);
        }
        catch (e) {
            gigaset_1.handleGigasetError('intrusion settings', e, body);
            res.status(503).end();
        }
    });
});
// set the route: returns the readme.md as default page
app.get('*', (_, res) => {
    fs.readFile('README.md', 'utf8', (_, data) => {
        res.send(markdownIt().render(data.toString()));
    });
});
// launch the server
function startWebserver() {
    app.listen(utils_1.conf('port'), () => {
        console.info('server listening on http://localhost:' + utils_1.conf('port'));
    });
}
exports.startWebserver = startWebserver;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid2ViLXNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy93ZWItc2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsdUNBQTJFO0FBQzNFLGlDQUF5QztBQUN6QyxtQ0FBOEI7QUFDOUIseUJBQXlCO0FBQ3pCLG1DQUFtQztBQUNuQywwQ0FBMEM7QUFFMUMsd0ZBQXdGO0FBQ3hGLE1BQU0sTUFBTSxHQUFHLENBQUksSUFBYSxFQUFFLENBQU0sRUFBRyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUU3RCxlQUFlO0FBQ2YsTUFBTSxHQUFHLEdBQUcsT0FBTyxFQUFFLENBQUE7QUFFckIseUJBQXlCO0FBQ3pCLEdBQUcsQ0FBQyxHQUFHLENBQUMsUUFBUSxFQUFFLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFO0lBQzNCLHdCQUFjLENBQUMsR0FBRyxDQUFDLHFCQUFXLENBQUMsSUFBSSxHQUFHLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDNUQsQ0FBQyxDQUFDLENBQUE7QUFFRixxRUFBcUU7QUFDckUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUU7SUFDeEIsd0JBQWMsQ0FBQyxHQUFHLENBQUMscUJBQVcsQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE1BQU0sRUFBRSxZQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsSUFBSSxFQUFFLEVBQUU7UUFDdEYsSUFBSTtZQUNBLEdBQUcsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUE7U0FDMUM7UUFBQyxPQUFPLENBQUMs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