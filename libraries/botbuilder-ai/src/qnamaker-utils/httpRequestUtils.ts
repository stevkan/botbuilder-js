/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as os from 'os';

import { QnAMakerEndpoint } from '../qnamaker-interfaces/qnamakerEndpoint';
import { QnAMakerResult } from '../qnamaker-interfaces/qnamakerResult';

import { getFetch } from '../globals';
const fetch = getFetch();

// eslint-disable-next-line @typescript-eslint/no-var-requires
const pjson: Record<'name' | 'version', string> = require('../../package.json');

/**
 * Http request utils class.
 *
 * @summary
 * This class is helper class for all the http request operations.
 */
export class HttpRequestUtils {
    /**
     * Execute Http request.
     *
     * @param {string} requestUrl Http request url.
     * @param {string} payloadBody Http request body.
     * @param {QnAMakerEndpoint} endpoint QnA Maker endpoint details.
     * @param {number} timeout (Optional)Timeout for http call
     * @returns {QnAMakerResult} a promise that resolves to the QnAMakerResult
     */
    public async executeHttpRequest(
        requestUrl: string,
        payloadBody: string,
        endpoint: QnAMakerEndpoint,
        timeout?: number
    ): Promise<QnAMakerResult> {
        if (!requestUrl) {
            throw new TypeError('Request url cannot be null.');
        }

        if (!payloadBody) {
            throw new TypeError('Payload body cannot be null.');
        }

        if (!endpoint) {
            throw new TypeError('Payload body cannot be null.');
        }

        const headers = this.getHeaders(endpoint);

        const qnaResult = await fetch(requestUrl, {
            method: 'POST',
            headers: headers,
            timeout: timeout,
            body: payloadBody,
        });

        return qnaResult.status == 204 ? this.getSuccessful204Result() : await qnaResult.json();
    }

    /**
     * Sets headers for request to QnAMaker service.
     *
     * The [QnAMakerEndpointKey](#QnAMakerEndpoint.QnAMakerEndpointKey) is set as the value of
     * `Authorization` header for v4.0 and later of QnAMaker service.
     *
     * Legacy QnAMaker services use the `Ocp-Apim-Subscription-Key` header for the QnAMakerEndpoint value instead.
     *
     * [QnAMaker.getHeaders()](#QnAMaker.getHeaders) also gets the User-Agent header value.
     *
     * @private
     */
    private getHeaders(endpoint: QnAMakerEndpoint): Record<string, string> {
        const headers = {};

        headers['Ocp-Apim-Subscription-Key'] = endpoint.endpointKey;
        headers['Authorization'] = `EndpointKey ${endpoint.endpointKey}`;
        headers['User-Agent'] = this.getUserAgent();
        headers['Content-Type'] = 'application/json';

        return headers;
    }

    private getUserAgent(): string {
        const packageUserAgent = `${pjson.name}/${pjson.version}`;
        const platformUserAgent = `(${os.arch()}-${os.type()}-${os.release()}; Node.js,Version=${process.version})`;

        return `${packageUserAgent} ${platformUserAgent}`;
    }

    /**
     * Creates a QnAMakerResult for successful responses from QnA Maker service that return status code 204 No-Content.
     * The [Train API](https://docs.microsoft.com/en-us/rest/api/cognitiveservices/qnamakerruntime/runtime/train)
     * is an example of one of QnA Maker's APIs that return a 204 status code.
     *
     * @private
     */
    private getSuccessful204Result(): QnAMakerResult {
        return {
            questions: [],
            answer: '204 No-Content',
            score: 100,
            id: -1,
            source: null,
            metadata: [],
        };
    }
}
