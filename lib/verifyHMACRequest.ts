import crypto from 'crypto';
import { IncomingHttpHeaders } from 'http';

// TODO: Maybe data should be raw buffer?
export default function verifyHMACRequest(data: object, headers: IncomingHttpHeaders) {
    const secret = process.env.HMAC_SECRET;
    const reqSignature = headers['x-authorization-content-hmac'];
    const reqTimestamp = headers['x-authorization-timestamp'];
    if (!secret) {
        console.error("Missing HMAC secret!");
        return false;
    }

    if (!reqSignature || !reqTimestamp || typeof reqSignature !== "string" || typeof reqTimestamp !== "string") {
        console.error("Missing required request HMAC signature or timestamp");
        return false;
    }

    const currentTime = (Date.now() / 1000);
    //make sure request is not older than 5 min
    if (Math.abs(currentTime - Number(reqTimestamp)) > 300) {
        console.error("Incoming HMAC timestamp too old or invalid!");
        return false;
    }

    const bodyString = JSON.stringify(data);
    const signature = crypto.createHmac('sha256', secret).update(reqTimestamp + bodyString).digest('hex');

    const a = Buffer.from(reqSignature, 'hex');
    const b = Buffer.from(signature, 'hex');
    //timingSafeEqual throws error if buffers are different length so check first
    if (a.length !== b.length) {
        console.error("HMAC signatures do not match");
        return false;
    }
    const verified = crypto.timingSafeEqual(a, b);

    if (!verified) {
        console.error("HMAC signatures do not match");
    }

    return verified;
}
