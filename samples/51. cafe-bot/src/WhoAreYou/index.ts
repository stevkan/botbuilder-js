// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { RuleDialogEventNames, AdaptiveDialog, SendActivity, SaveEntity, IntentRule, EventRule, UnknownIntentRule, IfCondition, TextInput, EndDialog, SetProperty, EmitEvent, CodeStep, LogStep } from "botbuilder-dialogs-adaptive";
import { BotConfiguration, LuisService} from 'botframework-config';
import { LuisRecognizer } from 'botbuilder-ai';

// this is the LUIS service type entry in the .bot file.
const LUIS_CONFIGURATION = 'WhoAreYou';
export class WhoAreYou extends AdaptiveDialog {
    private luisRecognizer: LuisRecognizer;

    constructor(botConfig: BotConfiguration) {
        super('WhoAreYou');

        this.autoEndDialog = false;

        let luisConfig: LuisService;
        luisConfig = botConfig.findServiceByNameOrId(LUIS_CONFIGURATION) as LuisService;
        if (!luisConfig || !luisConfig.appId) { throw Error('Missing LUIS configuration. Please follow README.MD to create required LUIS applications.\n\n'); }
        this.luisRecognizer = new LuisRecognizer({
            applicationId: luisConfig.appId,
            endpoint: luisConfig.getEndpoint(),
            endpointKey: luisConfig.authoringKey,
        });

        this.recognizer = this.luisRecognizer;

        this.addRule(new EventRule(RuleDialogEventNames.beginDialog, [
            new SaveEntity('user.name', '@userName'),
            new SaveEntity('user.name', '@userName_patternAny'),
            new IfCondition('user.name == null', [
                new SendActivity(`Hello, I'm the cafe bot! What is your name?`)
            ])
            .else([
                new EmitEvent('DONE')
            ])
        ]))

        this.addRule(new IntentRule('#No_Name', [
            new SetProperty('user.name', `Human`),
            new EmitEvent('NO_NAME')
        ]));

        this.addRule(new IntentRule('#Why_do_you_ask', [
            new SendActivity(`I need your name to be able to address you correctly!`),
            new SendActivity(`Try saying something like 'My name is <your name>'`)
        ]))

        this.addRule(new IntentRule(['#Get_user_name', '@userName'], [
            new SaveEntity('user.name', '@userName'),
            new EmitEvent('DONE')
        ]))

        this.addRule(new IntentRule(['#Get_user_name', '@userName_patternAny'], [
            new SaveEntity('user.name', '@userName_patternAny'),
            new EmitEvent('DONE')
        ]))

        this.addRule(new UnknownIntentRule([
            new SendActivity(`I didn't understand that. What is your name?`)
        ]))

        this.addRule(new EventRule('DONE', [
            new SendActivity(`Hello {user.name}, nice to meet you! How can I be of help today?`),
            new EndDialog()
        ]))

        this.addRule(new EventRule('NO_NAME', [
            new SendActivity(`Hello {user.name}, nice to meet you! How can I be of help today?`),
            new SendActivity(`You can always say 'my name is <your name> to reintroduce yourself to me.`),
            new EndDialog()
        ]))
    }
}
