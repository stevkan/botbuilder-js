/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BeginDialog } from "./beginDialog";
import { CancelDialog } from "./cancelDialog";

export class StepFactory {
    /**
     * Creates a step that will call a dialog with a given id.
     * @param dialogId ID of the dialog to call.
     * @param property (Optional) in-memory property to bind the called dialogs input & output to. If not specified, the output from the dialog will be available in `dialog.lastResult`.
     * @param options (Optional) static options to pass the called dialog.
     */
    static beginDialog(dialogId: string, options?: object): BeginDialog;
    static beginDialog(dialogId: string, property: string, options?: object): BeginDialog;
    static beginDialog(dialogId: string, optionsOrProperty?: object|string, options?: object): BeginDialog {
        // Process args
        if (typeof optionsOrProperty === 'object') {
            options = optionsOrProperty;
            optionsOrProperty = undefined;
        }

        // Return step
        const step = new BeginDialog();
        step.dialogId = dialogId;
        if (typeof optionsOrProperty == 'string') { step.property = optionsOrProperty }
        if (options) { step.options = options }

        return step;
    }

    /**
     * Creates a step that will cancel the 
     * @param eventName 
     * @param eventValueOrProperty 
     */
    static cancelDialog(eventName?: string, eventValueOrProperty?: string|object): CancelDialog {
        // Return step
        const step = new CancelDialog();
        step.dialogId = dialogId;
        if (typeof optionsOrProperty == 'string') { step.property = optionsOrProperty }
        if (options) { step.options = options }

        return step;
        
    }
}