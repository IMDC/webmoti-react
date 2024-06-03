const actions = {
  FREE: {
    updates: {
      isReserved: () => false,
      token: () => null,
      heartbeat: () => null,
    },
    successMsg: "Hand successfully freed",
    errorMsg: "Error freeing hand",
  },
  KEEP: {
    updates: {
      heartbeat: () => Date.now(),
    },
    successMsg: "Heartbeat successfully sent",
    errorMsg: "Error sending heartbeat",
  },
};

exports.handler = async function (context, event, callback) {
  const validateRequest = (handKey, action, password, token) => {
    const missingParams = [];
    if (!handKey) missingParams.push("handKey");
    if (!action) missingParams.push("action");
    if (!password) missingParams.push("password");
    if (!token) missingParams.push("token");
    if (missingParams.length > 0) {
      return {
        isValid: false,
        msg: "Missing parameter(s): " + missingParams.join(", "),
      };
    }

    if (!Object.keys(actions).includes(action)) {
      return { isValid: false, msg: `Invalid action: ${action}` };
    }

    // TODO use current app password instead
    if (password !== context.PASSWORD) {
      return { isValid: false, msg: "Invalid password" };
    }

    return { isValid: true };
  };

  const syncServiceSid = context.TWILIO_SYNC_SERVICE_SID;
  const syncMapName = context.SYNC_MAP_NAME;

  const handKey = event.handKey;
  const action = event.action ? event.action.toUpperCase() : undefined;
  const password = event.password;
  const token = event.token;

  const check = validateRequest(handKey, action, password, token);
  if (!check.isValid) {
    const response = new Twilio.Response();
    response.setStatusCode(400);
    response.setBody(check.msg);
    return callback(null, response);
  }

  const actionData = actions[action];

  const syncClient = Runtime.getSync({ serviceName: syncServiceSid });
  const syncMap = await syncClient.maps(syncMapName);

  try {
    const hand = await syncMap.syncMapItems(handKey).fetch();

    if (hand.data.token === null) {
      return callback("Hand is not reserved");
    } else if (hand.data.token !== token) {
      // this prevents other users from updating other hands
      return callback("Invalid token");
    }

    const newData = {};
    for (const key in actionData.updates) {
      newData[key] = actionData.updates[key]();
    }

    await hand.update({ data: { ...hand.data, ...newData } });
  } catch (e) {
    if (e.status === 404) {
      return callback("Invalid hand key");
    }

    console.log(e);
    return callback(actionData.errorMsg);
  }

  return callback(null, actionData.successMsg);
};
