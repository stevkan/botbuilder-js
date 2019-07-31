/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Duplex } from 'stream';

export class StreamWrapper {
    public stream: Duplex;
    public streamLength?: number;

    public constructor(stream: Duplex, streamLength?: number) {
        this.stream = stream;
        this.streamLength = streamLength;
    }
}
