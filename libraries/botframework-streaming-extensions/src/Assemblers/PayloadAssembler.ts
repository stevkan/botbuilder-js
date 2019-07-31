/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Header } from '../Models/Header';
import { Duplex } from 'stream';
import { BasicStream } from '../BasicStream';

export abstract class PayloadAssembler {
    public id: string;
    public end: boolean;
    private stream: BasicStream;

    public constructor(id: string) {
        this.id = id;
    }

    public getPayloadStream(): BasicStream {
        if (!this.stream) {
            this.stream = this.createPayloadStream();
        }

        return this.stream;
    }

    public abstract createPayloadStream(): BasicStream;

    public onReceive(header: Header, stream?: Duplex, contentLength?: number): void {
        this.end = header.End;
    }

    public abstract close(): void;
}
