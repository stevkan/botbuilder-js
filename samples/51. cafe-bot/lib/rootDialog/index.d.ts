import { AdaptiveDialog } from "botbuilder-dialogs-adaptive";
import { BotConfiguration } from 'botframework-config';
export declare class CafeBot extends AdaptiveDialog {
    private luisRecognizer;
    private templateEngine;
    constructor(botConfig: BotConfiguration);
}
