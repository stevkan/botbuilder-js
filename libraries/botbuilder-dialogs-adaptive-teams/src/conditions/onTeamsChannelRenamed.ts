/**
 * @module botbuilder-dialogs-adaptive-teams
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression, ExpressionParserInterface } from 'adaptive-expressions';
import { Channels } from 'botbuilder';
import { TurnPath } from 'botbuilder-dialogs';
import { OnConversationUpdateActivity } from 'botbuilder-dialogs-adaptive';

/**
 * Actions triggered when a Teams ConversationUpdateActivity with channelData.eventType == 'channelRenamed'.
 * Note: turn.activity.channelData.Teams has team data.
 */
export class OnTeamsChannelRenamed extends OnConversationUpdateActivity {
    public static $kind = 'Teams.OnChannelRenamed';

    public getExpression(parser: ExpressionParserInterface): Expression {
        return Expression.andExpression(
            Expression.parse(
                `${TurnPath.activity}.channelId == '${Channels.Msteams}' && ${TurnPath.activity}.channelData.eventType == 'channelRenamed'`
            ),
            super.getExpression(parser)
        );
    }
}
