/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Header } from '../Models/Header';
import { Duplex } from 'stream';

export class SendPacket {
    public header: Header;
    public payload: Duplex;
    public sentCallback: () => Promise<void>;

    public constructor(header: Header, payload: Duplex, sentCallback: () => Promise<void>) {
        this.header = header;
        this.payload = payload;
        this.sentCallback = sentCallback;
    }
}
