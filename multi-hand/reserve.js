const crypto = require("crypto");

exports.handler = async function (context, event, callback) {
  const validateRequest = (password, identity) => {
    const missingParams = [];
    if (!password) missingParams.push("password");
    if (!identity) missingParams.push("identity");
    if (missingParams.length > 0) {
      return {
        isValid: false,
        msg: "Missing parameter(s): " + missingParams.join(", "),
      };
    }

    // TODO use current app password instead
    if (password !== context.PASSWORD) {
      return { isValid: false, msg: "Invalid password" };
    }

    return { isValid: true };
  };

  const password = event.password;
  const identity = event.identity;

  const check = validateRequest(password, identity);
  if (!check.isValid) {
    const response = new Twilio.Response();
    response.setStatusCode(400);
    response.setBody(check.msg);
    return callback(null, response);
  }

  const syncServiceSid = context.TWILIO_SYNC_SERVICE_SID;
  const syncMapName = context.SYNC_MAP_NAME;

  const syncClient = Runtime.getSync({ serviceName: syncServiceSid });
  const syncMap = await syncClient.maps(syncMapName);
  const hands = await syncMap.syncMapItems.list();

  try {
    let freeHand = null;

    for (const hand of hands) {
      const data = hand.data;

      // if not reserved, get this hand
      // or if it is set to reserved but the last hearbeat was > 1 min 30 ago
      // it means the client disconnected and didn't unset isReserved
      const isHandFree =
        !data.isReserved || Date.now() > data.heartbeat + 90000;

      if (!isHandFree && data.identity === identity) {
        return callback("Only one hand can be reserved at a time");
      }

      if (isHandFree) {
        freeHand = hand;
      }
    }

    if (freeHand !== null) {
      // reserve hand
      const token = crypto.randomBytes(16).toString("hex");
      await syncMap.syncMapItems(freeHand.key).update({
        data: {
          ...data,
          isReserved: true,
          heartbeat: Date.now(),
          token: token,
        },
      });

      // notify client
      return callback(null, {
        handName: freeHand.key,
        urlId: data.urlId,
        token: token,
      });
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
