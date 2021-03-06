const { ConversationState, MemoryStorage, TestAdapter, NullTelemetryClient } = require('botbuilder-core');
const { Dialog, DialogSet, WaterfallDialog, DialogTurnStatus, ComponentDialog } = require('../');
const assert = require('assert');

const beginMessage = { text: `begin`, type: 'message' };
const continueMessage = { text: `continue`, type: 'message' };

describe('DialogSet', function () {
    this.timeout(5000);

    const storage = new MemoryStorage();
    const conversationState = new ConversationState(storage);
    const dialogState = conversationState.createProperty('dialogState');

    it('should throw on createContext(undefined)', async function () {
        const dialogSet = new DialogSet(dialogState);
        try {
            await dialogSet.createContext(undefined);
            assert.fail('should have thrown error on undefined');
        } catch (err) {}
    });

    it('should add a waterfall to the dialog set.', function (done) {
        const dialogs = new DialogSet(dialogState);
        dialogs.add(
            new WaterfallDialog('a', [
                function (step) {
                    assert(step);
                },
            ])
        );
        done();
    });

    it('should throw an error if DialogSet.dialogState is falsey.', async function () {
        const dialogs = new DialogSet();
        try {
            await dialogs.createContext({ type: 'message', text: 'hi' });
        } catch (err) {
            assert(
                err.message ===
                    'DialogSet.createContext(): the dialog set was not bound to a stateProperty when constructed.',
                `unexpected error thrown: ${err.message}`
            );
        }
    });

    it('should add fluent dialogs to the dialog set.', function (done) {
        // Create new ConversationState with MemoryStorage and instantiate DialogSet with PropertyAccessor.
        const dialogs = new DialogSet(dialogState);
        dialogs
            .add(
                new WaterfallDialog('A', [
                    function (dc) {
                        assert(dc);
                    },
                ])
            )
            .add(
                new WaterfallDialog('B', [
                    function (dc) {
                        assert(dc);
                    },
                ])
            );
        assert(dialogs.find('A'), `dialog A not found.`);
        assert(dialogs.find('B'), `dialog B not found.`);

        done();
    });

    it('should increment the dialog ID when adding the same dialog twice.', function (done) {
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [function () {}]));

        dialogs.add(new WaterfallDialog('a', [function () {}]));

        assert(dialogs.find('a'));
        assert(dialogs.find('a2'), `second dialog didn't have ID incremented`);
        done();
    });

    it('should find() a dialog that was added.', function (done) {
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('a', [function () {}]));

        assert(dialogs.find('a'), `dialog not found.`);
        assert(!dialogs.find('b'), `dialog found that shouldn't exist.`);
        done();
    });

    it('should save dialog stack state between turns.', function (done) {
        const convoState = new ConversationState(new MemoryStorage());

        const dialogState = convoState.createProperty('dialogState');
        const dialogs = new DialogSet(dialogState);
        dialogs.add(
            new WaterfallDialog('a', [
                async function (step) {
                    assert(step);
                    await step.context.sendActivity(`Greetings`);
                    return Dialog.EndOfTurn;
                },
                async function (step) {
                    await step.context.sendActivity('Good bye!');
                    return await step.endDialog();
                },
            ])
        );

        const adapter = new TestAdapter(async (turnContext) => {
            const dc = await dialogs.createContext(turnContext);

            const results = await dc.continueDialog();
            if (results.status === DialogTurnStatus.empty) {
                await dc.beginDialog('a');
            }
            await convoState.saveChanges(turnContext);
        });

        adapter
            .send(beginMessage)
            .assertReply('Greetings')
            .send(continueMessage)
            .assertReply('Good bye!')
            .then(() => done());
    });

    it('should generate a version hash of added dialogs.', function (done) {
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('A')).add(new WaterfallDialog('B'));
        const hash = dialogs.getVersion();
        assert(hash && hash.length > 0, `no hash generated.`);

        done();
    });

    it('Generated version hash should change when dialog set changes.', function (done) {
        const dialogs = new DialogSet(dialogState);
        dialogs.add(new WaterfallDialog('A')).add(new WaterfallDialog('B'));
        const hash = dialogs.getVersion();
        assert(hash && hash.length > 0, `no hash generated.`);

        dialogs.add(new WaterfallDialog('C'));
        assert(hash != dialogs.getVersion(), `hash not updated.`);

        done();
    });

    it('Cyclical dialog structures', () => {
        const component1 = new ComponentDialog('component1');
        const component2 = new ComponentDialog('component2');

        component1.addDialog(component2);
        component2.addDialog(component1);

        // This would trigger stack overflow if cycles were not properly handled
        component1.telemetryClient = new NullTelemetryClient();
    });
});
