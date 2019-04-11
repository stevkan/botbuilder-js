"use strict";
// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
Object.defineProperty(exports, "__esModule", { value: true });
const botbuilder_dialogs_adaptive_1 = require("botbuilder-dialogs-adaptive");
const botbuilder_ai_1 = require("botbuilder-ai");
// this is the LUIS service type entry in the .bot file.
const LUIS_CONFIGURATION = 'WhoAreYou';
class WhoAreYou extends botbuilder_dialogs_adaptive_1.AdaptiveDialog {
    constructor(botConfig) {
        super('WhoAreYou', [
            // set user name if we already have it
            new botbuilder_dialogs_adaptive_1.IfCondition('@userName != null', [
                new botbuilder_dialogs_adaptive_1.SaveEntity('user.name', '@userName'),
            ])
                .else([
                new botbuilder_dialogs_adaptive_1.IfCondition('@userName_patternAny != null', [
                    new botbuilder_dialogs_adaptive_1.SaveEntity('user.name', '@userName_patternAny'),
                ])
            ]),
            new botbuilder_dialogs_adaptive_1.IfCondition('user.name == null', [
                new botbuilder_dialogs_adaptive_1.SendActivity(`Hello, I'm the cafe bot! What is your name?`),
            ])
                .else([
                new botbuilder_dialogs_adaptive_1.SendActivity(`Hello {user.name}, nice to meet you! How can I be of help today?`)
            ])
        ]);
        let luisConfig;
        luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION);
        if (!luisConfig || !luisConfig.appId) {
            throw Error('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n');
        }
        this.luisRecognizer = new botbuilder_ai_1.LuisRecognizer({
            applicationId: luisConfig.appId,
            endpoint: luisConfig.getEndpoint(),
            // CAUTION: Authoring key is used in this example as it is appropriate for prototyping.
            // When implementing for deployment/production, assign and use a subscription key instead of an authoring key.
            endpointKey: luisConfig.authoringKey,
        });
        this.recognizer = this.luisRecognizer;
        this.addRule(new botbuilder_dialogs_adaptive_1.IntentRule('#No_Name', [
            new botbuilder_dialogs_adaptive_1.SetProperty((state) => { state.user.name = 'Human'; }),
            new botbuilder_dialogs_adaptive_1.EndDialog()
        ]));
        this.addRule(new botbuilder_dialogs_adaptive_1.IntentRule('#Why_do_you_ask', [
            new botbuilder_dialogs_adaptive_1.SendActivity(`I need your name to be able to address you correctly! `)
        ]));
        this.addRule(new botbuilder_dialogs_adaptive_1.IntentRule(['#Get_user_name', '@userName'], [
            new botbuilder_dialogs_adaptive_1.SaveEntity('user.name', '@userName'),
            new botbuilder_dialogs_adaptive_1.SendActivity(`Hello {user.name}, nice to meet you! How can I be of help today?`),
            new botbuilder_dialogs_adaptive_1.EndDialog()
        ]));
        this.addRule(new botbuilder_dialogs_adaptive_1.IntentRule(['#Get_user_name', '@userName_patternAny'], [
            new botbuilder_dialogs_adaptive_1.SaveEntity('user.name', '@userName_patternAny'),
            new botbuilder_dialogs_adaptive_1.SendActivity(`Hello {user.name}, nice to meet you! How can I be of help today?`),
            new botbuilder_dialogs_adaptive_1.EndDialog()
        ]));
        this.addRule(new botbuilder_dialogs_adaptive_1.UnknownIntentRule([
            new botbuilder_dialogs_adaptive_1.SendActivity(`No match in Who are you dialog`)
        ]));
    }
}
exports.WhoAreYou = WhoAreYou;
//# sourceMappingURL=index.js.map