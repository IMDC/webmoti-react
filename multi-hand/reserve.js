const crypto = require("crypto");

exports.handler = async function (context, event, callback) {
  const password = event.password;
  if (password !== context.PASSWORD) {
    const response = new Twilio.Response();
    response.setStatusCode(400);
    if (password === undefined) {
      response.setBody("Password is missing");
    } else {
      response.setBody("Invalid password");
    }
    return callback(null, response);
  }

  const syncServiceSid = context.TWILIO_SYNC_SERVICE_SID;
  const syncMapName = context.SYNC_MAP_NAME;

  const syncClient = Runtime.getSync({ serviceName: syncServiceSid });
  const syncMap = await syncClient.maps(syncMapName);
  const hands = await syncMap.syncMapItems.list();

  try {
    for (const hand of hands) {
      const data = hand.data;
      // if not reserved, get this hand
      // or if it is set to reserved but the last hearbeat was > 1 min ago
      // it means the client disconnected and didn't unset isReserved
      if (!data.isReserved || Date.now() > data.heartbeat + 60000) {
        // reserve hand
        const token = crypto.randomBytes(16).toString("hex");
        await syncMap.syncMapItems(hand.key).update({
          data: {
            ...data,
            isReserved: true,
            heartbeat: Date.now(),
            token: token,
          },
        });

        // notify client
        return callback(null, {
          handName: hand.key,
          urlId: data.urlId,
          token: token,
        });
      }
    }
  } catch (e) {
    console.log(e);
    return callback("Error reserving hand");
  }

  const response = new Twilio.Response();
  response.setStatusCode(404);
  response.setBody("No hands available");

  return callback(null, response);
};
