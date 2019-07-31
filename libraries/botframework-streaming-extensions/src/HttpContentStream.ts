/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Duplex } from 'stream';
import { generateGuid } from './Utilities/protocol-base';
import { BasicStream } from '.';

export class HttpContentStream {
    public readonly id: string;
    public readonly content: HttpContent;

    constructor(content: HttpContent) {
        this.id = generateGuid();
        this.content = content;
    }
}

export class HttpContent {
    public headers: IHttpContentHeaders;

    private readonly stream: BasicStream;

    constructor(headers: IHttpContentHeaders, stream: Duplex) {
        this.headers = headers;
        this.stream = stream as BasicStream;
    }

    public getStream(): BasicStream {
        return this.stream;
    }
}

export interface IHttpContentHeaders {
    contentType?: string;
    contentLength?: number;
}

export class HttpContentHeaders implements IHttpContentHeaders {
    public contentType?: string;
    public contentLength?: number;
}
