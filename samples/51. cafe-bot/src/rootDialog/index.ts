// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, SendActivity, IntentRule, PlanChangeType, EventRule, UnknownIntentRule } from "botbuilder-dialogs-adaptive";
import { BotConfiguration, LuisService} from 'botframework-config';
import { LuisRecognizer, LuisApplication } from 'botbuilder-ai';
import { TemplateEngine } from 'botbuilder-lg';
import { WhoAreYou } from '../WhoAreYou';
// this is the LUIS service type entry in the .bot file.
const LUIS_CONFIGURATION = 'rootDialog';
export class CafeBot extends AdaptiveDialog {
    private luisRecognizer: LuisRecognizer;
    private templateEngine: TemplateEngine;

    constructor(botConfig: BotConfiguration) {
        super('main');

        // TODO: Load LG

        let luisConfig: LuisService;
        luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION) as LuisService;
        if (!luisConfig || !luisConfig.appId) { throw Error('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n'); }
        this.luisRecognizer = new LuisRecognizer({
            applicationId: luisConfig.appId,
            endpoint: luisConfig.getEndpoint(),
            // CAUTION: Authoring key is used in this example as it is appropriate for prototyping.
            // When implimenting for deployment/production, assign and use a subscription key instead of an authoring key.
            endpointKey: luisConfig.authoringKey,
        });

        // Add recognizer
        this.recognizer = this.luisRecognizer;

        // Define rule for default response
        this.addRule(new UnknownIntentRule([
            new SendActivity(`Sorry, I do not understand that.`)
        ]));

        this.addRule(new IntentRule('#WhatCanYouDo', [
            new SendActivity(`I can help you book a table, find cafe locations and more`)
        ]));

        this.addRule(new IntentRule('#WhoAreYou', [
            new WhoAreYou(botConfig)
        ]))
    }
}
