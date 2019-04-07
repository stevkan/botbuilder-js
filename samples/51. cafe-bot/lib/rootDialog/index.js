"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_ai_1 = require("botbuilder-ai");
// this is the LUIS service type entry in the .bot file.
const LUIS_CONFIGURATION = 'rootDialog';
class CafeBot extends botbuilder_dialogs_adaptive_1.AdaptiveDialog {
    constructor(botConfig) {
        super('main');
        // TODO: Load LG
        let luisConfig;
        luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION);
        if (!luisConfig || !luisConfig.appId) {
            throw Error('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n');
        }
        this.luisRecognizer = new botbuilder_ai_1.LuisRecognizer({
            applicationId: luisConfig.appId,
            endpoint: luisConfig.getEndpoint(),
            // CAUTION: Authoring key is used in this example as it is appropriate for prototyping.
            // When implimenting for deployment/production, assign and use a subscription key instead of an authoring key.
            endpointKey: luisConfig.authoringKey,
        });
        // Add recognizer
        this.recognizer = this.luisRecognizer;
        // Define welcome rule
        this.addRule(new botbuilder_dialogs_adaptive_1.WelcomeRule([
            new botbuilder_dialogs_adaptive_1.SendActivity(`Hi! I'm a Cafe bot. Say "add a todo named first one" to get started.`)
        ]));
        // Define rule for default response
        this.addRule(new botbuilder_dialogs_adaptive_1.NoMatchRule([
            new botbuilder_dialogs_adaptive_1.SendActivity(`Sorry, I do not understand that.`)
        ]));
    }
}
exports.CafeBot = CafeBot;
//# sourceMappingURL=index.js.map