import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-js';
import { HttpRequest } from '@aws-sdk/protocol-http';
import { Amplify } from 'aws-amplify';

export async function requestWithAuth() {
    const credentials = await Amplify.Auth.currentCredentials();
    const signer = new SignatureV4({
        region: 'ap-northeast-1',
        service: 'lambda',
        sha256: Sha256,
        credentials,
    });

    const req = await signer.sign(
        new HttpRequest({
            method: 'GET',
            protocol: 'https:',
            path: '/name/Kanahiro',
            hostname: 'your-lambda.lambda-url.ap-northeast-1.on.aws',
            headers: {
                host: 'your-lambda.lambda-url.ap-northeast-1.on.aws',
            },
        }),
    );

    const res = await fetch(
        `https://your-lambda.lambda-url.ap-northeast-1.on.aws/name/Kanahiro`,
        {
            method: req.method,
            body: req.body,
            headers: req.headers,
        },
    );
    return res;
}
