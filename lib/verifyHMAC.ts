import crypto from 'crypto';

export default function verifyHMAC(data: object, reqHMAC: {signature: String, timestamp: String}){
    const secret = process.env.HMAC_SECRET;
    if(!secret){
      console.error("Missing HMAC secret!");
      return false;
    }

    if(!reqHMAC.signature || !reqHMAC.timestamp){
        console.error("Missing required request HMAC signature or timestamp");
        return false;
    }

    const currentTime = (Date.now()/1000);
    //make sure request is not older than 5 min
    if(Math.abs(currentTime - Number(reqHMAC.timestamp)) > 300){
      console.error("Incoming HMAC timestamp too old or invalid!");
      return false;
    }

    const bodyString = JSON.stringify(data);
    const signature = crypto.createHmac('sha256', secret).update(reqHMAC.timestamp + bodyString).digest('hex');
    //TODO use something more secure than string comparison
    const verified = reqHMAC.signature === signature;
    if(!verified){
      console.error("HMAC signatures do not match");
    }

    return verified;
}
