import { AdaptiveDialog } from "botbuilder-dialogs-adaptive";
import { BotConfiguration } from 'botframework-config';
export declare class WhoAreYou extends AdaptiveDialog {
    private luisRecognizer;
    constructor(botConfig: BotConfiguration);
}
