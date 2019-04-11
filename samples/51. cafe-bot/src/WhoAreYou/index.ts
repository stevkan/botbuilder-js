// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { AdaptiveDialog, SendActivity, SaveEntity, IntentRule, PlanChangeType, EventRule, UnknownIntentRule, IfCondition, TextInput, EndDialog, SetProperty, EmitEvent, EndTurn, IfPropertyRule } from "botbuilder-dialogs-adaptive";
import { BotConfiguration, LuisService} from 'botframework-config';
import { LuisRecognizer, LuisApplication } from 'botbuilder-ai';
import { TemplateEngine } from 'botbuilder-lg';

// this is the LUIS service type entry in the .bot file.
const LUIS_CONFIGURATION = 'WhoAreYou';
export class WhoAreYou extends AdaptiveDialog {
    private luisRecognizer: LuisRecognizer;

    constructor(botConfig: BotConfiguration) {
        super('WhoAreYou', [
            // set user name if we already have it
            new IfCondition('@userName != null', [
                new SaveEntity('user.name', '@userName'),
            ])
            .else([
                new IfCondition('@userName_patternAny != null', [
                    new SaveEntity('user.name', '@userName_patternAny'),
                ])
            ]),
            new IfCondition('user.name == null', [
                new SendActivity(`Hello, I'm the cafe bot! What is your name?`),
            ])
            .else([
                new SendActivity(`Hello {user.name}, nice to meet you! How can I be of help today?`)
            ])
        ]);


        let luisConfig: LuisService;
        luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION) as LuisService;
        if (!luisConfig || !luisConfig.appId) { throw Error('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n'); }
        this.luisRecognizer = new LuisRecognizer({
            applicationId: luisConfig.appId,
            endpoint: luisConfig.getEndpoint(),
            // CAUTION: Authoring key is used in this example as it is appropriate for prototyping.
            // When implementing for deployment/production, assign and use a subscription key instead of an authoring key.
            endpointKey: luisConfig.authoringKey,
        });

        this.recognizer = this.luisRecognizer;

        this.addRule(new IntentRule('#No_Name', [
            new SetProperty((state) => {state.user.name = 'Human'}),
            new EndDialog()
        ]));

        this.addRule(new IntentRule('#Why_do_you_ask', [
            new SendActivity(`I need your name to be able to address you correctly! `)
        ]))

        this.addRule(new IntentRule(['#Get_user_name', '@userName'], [
            new SaveEntity('user.name', '@userName'),
            new SendActivity(`Hello {user.name}, nice to meet you! How can I be of help today?`),
            new EndDialog()
        ]))

        this.addRule(new IntentRule(['#Get_user_name', '@userName_patternAny'], [
            new SaveEntity('user.name', '@userName_patternAny'),
            new SendActivity(`Hello {user.name}, nice to meet you! How can I be of help today?`),
            new EndDialog()
        ]))

        this.addRule(new UnknownIntentRule([
            new SendActivity(`No match in Who are you dialog`)
        ]))
    }
}
