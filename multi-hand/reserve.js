exports.handler = async function (context, event, callback) {
  const syncServiceSid = context.TWILIO_SYNC_SERVICE_SID;
  const syncMapName = context.SYNC_MAP_NAME;

  const syncClient = Runtime.getSync({ serviceName: syncServiceSid });
  const syncMap = await syncClient.maps(syncMapName);
  const hands = await syncMap.syncMapItems.list();

  try {
    for (const hand of hands) {
      const data = hand.data;
      if (!data.isReserved) {
        // reserve hand
        await syncMap.syncMapItems(hand.key).update({
          data: { ...data, isReserved: true },
        });

        // notify client
        return callback(null, { handName: hand.key, urlId: data.urlId });
      }
    }
  } catch (e) {
    return callback("Error reserving hand");
  }

  const response = new Twilio.Response();
  response.setStatusCode(404);
  response.setBody("No hands available");

  return callback(null, response);
};
