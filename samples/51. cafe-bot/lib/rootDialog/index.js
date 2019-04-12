"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_ai_1 = require("botbuilder-ai");
const WhoAreYou_1 = require("../WhoAreYou");
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
            endpointKey: luisConfig.authoringKey,
        });
        // Add recognizer
        this.recognizer = this.luisRecognizer;
        this.addRule(new botbuilder_dialogs_adaptive_1.IntentRule('#WhatCanYouDo', [
            new botbuilder_dialogs_adaptive_1.SendActivity(`I can help you book a table, find cafe locations and more`)
        ]));
        this.addRule(new botbuilder_dialogs_adaptive_1.IntentRule('#WhoAreYou', [
            new WhoAreYou_1.WhoAreYou(botConfig)
        ]));
        // Define rule for default response
        this.addRule(new botbuilder_dialogs_adaptive_1.UnknownIntentRule([
            new botbuilder_dialogs_adaptive_1.SendActivity(`Sorry, I do not understand that.`)
        ]));
    }
}
exports.CafeBot = CafeBot;
//# sourceMappingURL=index.js.map