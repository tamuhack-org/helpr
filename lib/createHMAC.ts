import crypto from 'crypto';

export default function createHMAC(data: object){
    const secret = process.env.HMAC_SECRET;
    if(!secret){
      console.error("Missing HMAC secret!");
      return;
    }
    const timestamp = (Math.floor(Date.now()/1000)).toString(); //HMAC timestamp should be in seconds (not ms) since epoch
    const bodyString = JSON.stringify(data);
    const signature = crypto.createHmac('sha256', secret).update(timestamp + bodyString).digest('hex');
    return {timestamp, signature};
}
