exports.handler = async function (context, event, callback) {
  const syncServiceSid = context.TWILIO_SYNC_SERVICE_SID;
  const syncMapName = context.SYNC_MAP_NAME;

  const handKey = event.handKey;

  if (!handKey) {
    const response = new Twilio.Response();
    response.setStatusCode(400);
    response.setBody("Hand key is missing");
    return callback(null, response);
  }

  const syncClient = Runtime.getSync({ serviceName: syncServiceSid });
  const syncMap = await syncClient.maps(syncMapName);

  try {
    const hand = await syncMap.syncMapItems(handKey).fetch();
    await hand.update({
      data: { ...hand.data, isReserved: false },
    });
  } catch (e) {
    if (e.status === 404) {
      return callback("Invalid hand key");
    }

    return callback("Error freeing hand");
  }

  return callback(null, "Hand successfully freed");
};
