exports.handler = async function (context, event, callback) {
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
        await syncMap.syncMapItems(hand.key).update({
          data: { ...data, isReserved: true, heartbeat: Date.now() },
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
