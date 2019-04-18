/**
 * @module botbuilder-dialog-debug
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogManager, DialogContext, DialogTurnResult, DialogDebugEvents } from 'botbuilder-dialogs';
import { ActivityTypes } from 'botbuilder-core';

export class DialogDebugger extends DialogManager {
    constructor(protected command = 'debug') {
        super();
    }

    public breakOn: string[] = [DialogDebugEvents.runStep, DialogDebugEvents.recognizerCalled];

    protected async onContinueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        const { type, text } = dc.context.activity;
        if (type == ActivityTypes.Message && text) {
            // Recognize command
            const lText = text.trim().toLowerCase();
            if (lText == this.command || lText.indexOf(this.command + ' ') == 0) {
                // Extract command args
                const args = text.length > this.command.length ? text.substr(this.command.length).trim() : '';

                // Process command
                return await this.onProcessCommand(dc, args);
            }
        }

        return await super.onContinueDialog(dc);
    }

    protected async onProcessCommand(dc: DialogContext, args: string): Promise<DialogTurnResult> {
        dc.context.activity.text = args;
        dc.breakOn(this.breakOn);
        return await super.onContinueDialog(dc);
    }
}