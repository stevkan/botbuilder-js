/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, Dialog, DialogContext, DialogConsultation, DialogConsultationDesire, DialogDebugEvents } from 'botbuilder-dialogs';
import { ActivityTypes } from 'botbuilder-core';

export class EndTurn extends Dialog {

    protected onComputeID(): string {
        return `endTurn[]`;
    }

    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        dc.debugBreak(DialogDebugEvents.runStep);
        return Dialog.EndOfTurn;
    }

    public async consultDialog(dc: DialogContext): Promise<DialogConsultation> {
        return {
            desire: DialogConsultationDesire.canProcess,
            processor: async (dc) => {
                dc.debugBreak(DialogDebugEvents.runStep);
                const activity = dc.context.activity;
                if (activity.type === ActivityTypes.Message) {
                    return await dc.endDialog();
                } else {
                    return Dialog.EndOfTurn;
                }
            }
        };
    }
}