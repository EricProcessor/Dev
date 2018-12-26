"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const environment_1 = require("./core/environment");
const appInsights = require('applicationinsights');
// Error with setting up AppInsights where application insights is unable to work.
function setupInsights() {
    if (!process.env.APPINSIGHTS_INSTRUMENTATIONKEY && environment_1.Environment.isLocalDev()) {
        const logger = console;
        process.stderr.write('Skipping app insights setup - in development mode with no ikey set\n');
        return {
            defaultClient: {
                trackEvent: logger.log.bind(console, 'trackEvent'),
                trackException: logger.error.bind(console, 'trackException'),
                trackMetric: logger.log.bind(console, 'trackMetric'),
                trackDependency: logger.log.bind(console, 'trackDependency'),
            },
        };
    }
    else if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
        if (!appInsights.defaultClient) {
            const client = appInsights.setup();
            client.setOfflineMode(true);
            process.stdout.write('No app insights setup - performing manual setup\n');
            if (!appInsights.defaultClient) {
                throw new Error('No app insights defaultClient after setup.');
            }
        }
        else {
            process.stdout.write('App insights setup - client already detected\n');
        }
        process.stdout.write('App insights setup - configuring client\n');
        appInsights.setAutoCollectConsole(true, true).start();
        return appInsights;
    }
    else {
        throw new Error('No app insights setup. A key must be specified in non-development environments.');
    }
}
module.exports = setupInsights();
//# sourceMappingURL=AppInsights.js.map