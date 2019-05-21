/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext, DialogState, DialogSet } from 'botbuilder-dialogs';

export interface AdaptiveDialogState<O extends Object> {
    options: O;
    result?: any;
    steps?: StepState[];
}

export interface StepState extends DialogState {
    dialogId: string;
    options?: object;
}

export interface StepChangeList {
    changeType: StepChangeType;
    steps?: StepState[];
    tags?: string[];
}

export enum StepChangeType {
    InsertSteps = 'InsertSteps',
    InsertStepsBeforeTags = 'InsertStepsBeforeTags',
    AppendSteps = 'AppendSteps',
    EndSequence = 'EndSequence',
    ReplaceSequence = 'ReplaceSequence'
}

export enum AdaptiveEventNames {
    BeginDialog = 'BeginDialog',
    ActivityReceived = 'ActivityReceived',
    RecognizedIntent = 'RecognizedIntent',
    UnknownIntent = 'UnknownIntent',
    ConversationMembersAdded = 'ConversationMembersAdded',
    SequenceStarted = 'SequenceStarted',
    SequenceEnded = 'SequenceEnded',
    CancelDialog = 'CancelDialog'
}

export class SequenceContext<O extends object = {}> extends DialogContext {
    private readonly changeKey: symbol;

    /**
     * Creates a new `SequenceContext` instance.
     */
    constructor(dialogs: DialogSet, dc: DialogContext, state: DialogState, steps: StepState[], changeKey: symbol) {
        super(dialogs, dc.context, state, dc.state.user, dc.state.conversation);
        this.steps = steps;
        this.changeKey = changeKey;
    }

    /**
     * Array of changes that are queued to be applied 
     */
    public get changes(): StepChangeList[] {
        return this.context.turnState.get(this.changeKey) || [];
    }

    /**
     * Array of steps being executed.
     */
    public readonly steps: StepState[];

    /**
     * Queues up a set of changes that will be applied when [applyChanges()](#applychanges)
     * is called.
     * @param changes Step changes to queue up. 
     */
    public queueChanges(changes: StepChangeList): void {
        const queue = this.context.turnState.get(this.changeKey) || [];
        queue.push(changes);
        this.context.turnState.set(this.changeKey, queue); 
    }

    /**
     * Applies any queued up changes.
     * 
     * @remarks
     * Applying a set of changes can result in additional plan changes being queued. The method
     * will loop and apply any additional plan changes until there are no more changes left to 
     * apply.
     * @returns true if there were any changes to apply. 
     */
    public async applyChanges(): Promise<boolean> {
        const queue: StepChangeList[] = this.context.turnState.get(this.changeKey) || [];;
        if (Array.isArray(queue) && queue.length > 0) {
            this.context.turnState.delete(this.changeKey);

            // Apply each queued set of changes
            for (let i = 0; i < queue.length; i++) {

                // Apply plan changes
                const change = queue[i];
                switch (change.changeType) {
                    case StepChangeType.InsertSteps:
                    case StepChangeType.InsertStepsBeforeTags:
                    case StepChangeType.AppendSteps:
                        await this.updateSequence(change);
                        break;
                    case StepChangeType.EndSequence:
                        if (this.steps.length > 0) {
                            this.steps.splice(0, this.steps.length);
                            await this.emitEvent(AdaptiveEventNames.SequenceEnded, undefined, false);
                        }
                        break;
                    case StepChangeType.ReplaceSequence:
                        if (this.steps.length > 0) {
                            this.steps.splice(0, this.steps.length);
                        }
                        await this.updateSequence(change);
                        break; 
                }
            }

            // Apply any new queued up changes
            await this.applyChanges();
            return true;
        }

        return false;
    }

    public insertSteps(steps: StepState[]): this {
        this.queueChanges({ changeType: StepChangeType.InsertSteps, steps: steps });
        return this;
    }

    public insertStepsBeforeTags(tags: string[], steps: StepState[]): this {
        this.queueChanges({ changeType: StepChangeType.InsertStepsBeforeTags, steps: steps, tags: tags });
        return this;
    }

    public appendSteps(steps: StepState[]): this {
        this.queueChanges({ changeType: StepChangeType.AppendSteps, steps: steps });
        return this;
    }

    public endSequence(): this {
        this.queueChanges({ changeType: StepChangeType.EndSequence });
        return this;
    }

    public replaceSequence(steps: StepState[]): this {
        this.queueChanges({ changeType: StepChangeType.ReplaceSequence, steps: steps });
        return this;
    }

    private async updateSequence(change: StepChangeList): Promise<void> {
        // Initialize sequence if needed
        const newSequence = this.steps.length == 0;

        // Update sequence
        switch (change.changeType) {
            case StepChangeType.InsertSteps:
                Array.prototype.unshift.apply(this.steps, change.steps);
                break;
            case StepChangeType.InsertStepsBeforeTags:
                let inserted = false;
                if (Array.isArray(change.tags)) {
                    for (let i = 0; i < this.steps.length; i++) {
                        if (this.stepHasTags(this.steps[i], change.tags)) {
                            const args = ([i, 0] as any[]).concat(change.steps);
                            Array.prototype.splice.apply(this.steps, args);
                            inserted = true;
                            break;
                        }
                    }
                }
                
                if (!inserted) {
                    Array.prototype.push.apply(this.steps, change.steps);
                }
                break;
            case StepChangeType.AppendSteps:
                Array.prototype.push.apply(this.steps, change.steps);
                break;
        }

        // Emit sequenceStarted event
        if (newSequence) {
            await this.emitEvent(AdaptiveEventNames.SequenceStarted, undefined, false);
        }
    }

    private stepHasTags(step: StepState, tags: string[]): boolean {
        const dialog = this.findDialog(step.dialogId);
        if (dialog && dialog.tags.length > 0) {
            for (let i = 0; i < dialog.tags.length; i++) {
                if (tags.indexOf(dialog.tags[i]) >= 0) {
                    return true;
                }
            }
        }

        return false;
    }
}