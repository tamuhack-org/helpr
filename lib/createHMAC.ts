import crypto from 'crypto';

export default function createHMAC(data: object){
    const secret = process.env.HMAC_SECRET;
    if(!secret){
      console.error("Missing HMAC secret!");
      return;
    }
    const timestamp = Date.now().toString();
    const bodyString = JSON.stringify(data);
    const signature = crypto.createHmac('sha256', secret).update(timestamp + bodyString).digest('hex');
    return {timestamp, signature};
}
