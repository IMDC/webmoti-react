const actions = {
  FREE: {
    field: "isReserved",
    value: () => false,
    successMsg: "Hand successfully freed",
    errorMsg: "Error freeing hand",
  },
  KEEP: {
    field: "heartbeat",
    value: () => Date.now(),
    successMsg: "Heartbeat successfully sent",
    errorMsg: "Error sending heartbeat",
  },
};

const validateRequest = (handKey, action) => {
  if (!handKey || !action) {
    return { isValid: false, msg: "Hand key or action parameter is missing" };
  }

  if (!Object.keys(actions).includes(action)) {
    return { isValid: false, msg: "Invalid action" };
  }

  return { isValid: true };
};

exports.handler = async function (context, event, callback) {
  const syncServiceSid = context.TWILIO_SYNC_SERVICE_SID;
  const syncMapName = context.SYNC_MAP_NAME;

  const handKey = event.handKey;
  const action = event.action.toUpperCase();

  const check = validateRequest(handKey, action);
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
    await hand.update({
      data: { ...hand.data, [actionData.field]: actionData.value() },
    });
  } catch (e) {
    if (e.status === 404) {
      return callback("Invalid hand key");
    }

    return callback(actionData.errorMsg);
  }

  return callback(null, actionData.successMsg);
};
