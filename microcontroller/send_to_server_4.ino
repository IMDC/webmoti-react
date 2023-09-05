void send_to_server_4(){
//we have changing variable here, so we need to first build up our URL packet
/*URL_withPacket = URL_webhost;//pull in the base URL
URL_withPacket += String(unit_id);//unit id value
URL_withPacket += "&sensor=";//unit id 1
URL_withPacket += String(sensor_value);//sensor value
URL_withPacket += payload_closer;*/

url = location_url;
url += NOOBIX_id;
url += "&pw=";
url +=  NOOBIX_password;//sensor value
url += "&un=4";
url += "&n4=";
url +=  String(sent_nr_4);//sensor value


URL_withPacket = ""; 

URL_withPacket = (String("GET ") + url + " HTTP/1.1\r\n" +
               "Host: " + host + "\r\n" + 
               "Connection: close\r\n\r\n");




/*
URL_withPacket += "Host: www.electronoobs.com\r\n";  
URL_withPacket += "Connection: close\r\n\r\n";  
  */
  /// This builds out the payload URL - not really needed here, but is very handy when adding different arrays to the payload
  counter=0;//keeps track of the payload size
  payload_size=0;
  for(int i=0; i<(URL_withPacket.length()); i++){//using a string this time, so use .length()
    payload[payload_size+i] = URL_withPacket[i];//build up the payload
    counter++;//increment the counter
  }//for int
  payload_size = counter+payload_size;//payload size is just the counter value - more on this when we need to build out the payload with more data
    //for(int i=0; i<payload_size; i++)//print the payload to the ESP
    //Serial.print(payload[i]);   


   
  if(connect_ESP()){//this calls 'connect_ESP()' and expects a '1' back if successful
  //nice, we're in and ready to look for data
  //first up, we need to parse the returned data  _t1123##_d15##_d210##



  
  //Serial.println("connected ESP"); 
  if(read_until_ESP(keyword_t1,sizeof(keyword_t1),5000,0)){//go find t1 then stop
  if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//our data is next, so change mode to '1' and stop at ##
  //got our data, so quickly store it away in d1
  for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)//go see 'setup' and how this was done with the ip address for more info
  t1_from_ESP[i] = scratch_data_from_ESP[i];
  t1_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);
  
  //we still have more data to get out of this stream, now we want d1
   if(read_until_ESP(keyword_b1,sizeof(keyword_b1),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d1_from_ESP[i] = scratch_data_from_ESP[i];
   d1_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);

   if(read_until_ESP(keyword_b2,sizeof(keyword_b2),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d2_from_ESP[i] = scratch_data_from_ESP[i];
   d2_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);

   if(read_until_ESP(keyword_b3,sizeof(keyword_b3),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d3_from_ESP[i] = scratch_data_from_ESP[i];
   d3_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);

   if(read_until_ESP(keyword_b4,sizeof(keyword_b4),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d4_from_ESP[i] = scratch_data_from_ESP[i];
   d4_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);

   if(read_until_ESP(keyword_b5,sizeof(keyword_b5),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d5_from_ESP[i] = scratch_data_from_ESP[i];
   d5_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);

   

   if(read_until_ESP(keyword_n1,sizeof(keyword_n1),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d9_from_ESP[i] = scratch_data_from_ESP[i];
   d9_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);

   if(read_until_ESP(keyword_n2,sizeof(keyword_n2),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d10_from_ESP[i] = scratch_data_from_ESP[i];
   d10_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);

   if(read_until_ESP(keyword_n3,sizeof(keyword_n3),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d11_from_ESP[i] = scratch_data_from_ESP[i];
   d11_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);

   if(read_until_ESP(keyword_n4,sizeof(keyword_n4),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d12_from_ESP[i] = scratch_data_from_ESP[i];
   d12_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);

   if(read_until_ESP(keyword_n5,sizeof(keyword_n5),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d13_from_ESP[i] = scratch_data_from_ESP[i];
   d13_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);

   if(read_until_ESP(keyword_n6,sizeof(keyword_n6),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d14_from_ESP[i] = scratch_data_from_ESP[i];
   d14_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);


   
   //now that we have our data, go wait for the connection to disconnect 
   //- the ESP will eventually return 'Unlink'
   //delay(10);
   Serial.println("FOUND DATA & DISCONNECTED");
   serial_dump_ESP();//now we can clear out the buffer and read whatever is still there
   //let's see how the data looks

   Serial.println("");
   Serial.print("Time ");
   if(t1_from_ESP[0] > 3){
   Serial.print(t1_from_ESP[1]);
   Serial.print(t1_from_ESP[2]);
   Serial.print(":");
   Serial.print(t1_from_ESP[3]);
   Serial.println(t1_from_ESP[4]);  
   }
   else{
   Serial.print(t1_from_ESP[1]);
   Serial.print(":");
   Serial.print(t1_from_ESP[2]);
   Serial.println(t1_from_ESP[3]);  
   }
                          
   Serial.print("RECEIVED_BOOL_1 = ");//print out LED data and convert to integer
   received_nr_5 = 0;
   for(int i=1; i<=d1_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_bool_1 = received_bool_1 + ((d1_from_ESP[i] - 48) * multiplier[d1_from_ESP[0] - i]);
   }
   Serial.println(received_bool_1);  
                          
   Serial.print("RECEIVED_BOOL_2 = ");//print out LED data and convert to integer
   received_bool_2 = 0;
   for(int i=1; i<=d2_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_bool_2 = received_bool_2 + ((d2_from_ESP[i] - 48) * multiplier[d2_from_ESP[0] - i]);
   }
   Serial.println(received_bool_2);    
   
   Serial.print("RECEIVED_BOOL_3 = ");//print out LED data and convert to integer
   received_bool_3 = 0;
   for(int i=1; i<=d3_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_bool_3 = received_bool_3 + ((d3_from_ESP[i] - 48) * multiplier[d3_from_ESP[0] - i]);
   }
   Serial.println(received_bool_3);     

   Serial.print("RECEIVED_BOOL_4 = ");//print out LED data and convert to integer
   received_bool_4 = 0;
   for(int i=1; i<=d4_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_bool_4 = received_bool_4 + ((d4_from_ESP[i] - 48) * multiplier[d4_from_ESP[0] - i]);
   }
   Serial.println(received_bool_4); 

   Serial.print("RECEIVED_BOOL_5 = ");//print out LED data and convert to integer
   received_bool_5 = 0;
   for(int i=1; i<=d5_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_bool_5 = received_bool_5 + ((d5_from_ESP[i] - 48) * multiplier[d5_from_ESP[0] - i]);
   }
   Serial.println(received_bool_5); 

   

   Serial.print("RECEIVED_NUMBER_1 = ");//print out LED data and convert to integer
   received_nr_1 = 0;
   for(int i=1; i<=d9_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_nr_1 = received_nr_1 + ((d9_from_ESP[i] - 48) * multiplier[d9_from_ESP[0] - i]);
   }
   Serial.println(received_nr_1); 

   Serial.print("RECEIVED_NUMBER_2 = ");//print out LED data and convert to integer
   received_nr_2 = 0;
   for(int i=1; i<=d10_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_nr_2 = received_nr_2 + ((d10_from_ESP[i] - 48) * multiplier[d10_from_ESP[0] - i]);
   }
   Serial.println(received_nr_2); 

   Serial.print("RECEIVED_NUMBER_3 = ");//print out LED data and convert to integer
   received_nr_3 = 0;
   for(int i=1; i<=d11_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_nr_3 = received_nr_3 + ((d11_from_ESP[i] - 48) * multiplier[d11_from_ESP[0] - i]);
   }
   Serial.println(received_nr_3); 

   Serial.print("RECEIVED_NUMBER_4 = ");//print out LED data and convert to integer
   received_nr_4 = 0;
   for(int i=1; i<=d12_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_nr_4 = received_nr_4 + ((d12_from_ESP[i] - 48) * multiplier[d12_from_ESP[0] - i]);
   }
   Serial.println(received_nr_4); 

   Serial.print("RECEIVED_NUMBER_5 = ");//print out LED data and convert to integer
   received_nr_5 = 0;
   for(int i=1; i<=d13_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_nr_5 = received_nr_5 + ((d13_from_ESP[i] - 48) * multiplier[d13_from_ESP[0] - i]);
   }
   Serial.println(received_nr_5); 

   Serial.print("RECEIVED_TEXT_1 = ");//print out LED data and convert to integer
   received_text = "";
   for(int i=1; i<=d14_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   received_text = received_text + d14_from_ESP[i];
   }
   Serial.println(received_text); 

   
   
   Serial.println("");
   //that's it!!
   }//##
   }//n6 text 1   
   }//##
   }//n5
   }//##
   }//n4
   }//##
   }//n3
   }//##
   }//n2
   }//##
   }//n1
   }//##
   }//b5
   }//##
   }//b4                    
   }//##
   }//b3
   }//##
   }//b2
   }//##
   }//b1
   }//##
   }//t1
  
/*
  //Serial.println("connected ESP"); 
  //we still have more data to get out of this stream, now we want d1
   if(read_until_ESP(keyword_n4,sizeof(keyword_n4),5000,0)){//same as before - first d1
   if(read_until_ESP(keyword_doublehash,sizeof(keyword_doublehash),5000,1)){//now ## and mode=1
   for(int i=1; i<=(scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1); i++)
   d12_from_ESP[i] = scratch_data_from_ESP[i];
   d12_from_ESP[0] = (scratch_data_from_ESP[0]-sizeof(keyword_doublehash)+1);
   //now that we have our data, go wait for the connection to disconnect 
   //- the ESP will eventually return 'Unlink'
   //delay(10);
   Serial.println("FOUND DATA & DISCONNECTED");
   serial_dump_ESP();//now we can clear out the buffer and read whatever is still there
   //let's see how the data looks
                       
   Serial.print("SENT_NUMBER_4 = ");//print out LED data and convert to integer
   sent_nr_4_feedback = 0;
   for(int i=1; i<=d12_from_ESP[0]; i++){
   //Serial.print(d12_from_ESP[i]);
   sent_nr_4_feedback = sent_nr_4_feedback + ((d12_from_ESP[i] - 48) * multiplier[d12_from_ESP[0] - i]);
   }
   Serial.println(sent_nr_4_feedback);                         
   Serial.println("");
   //that's it!!                        
   }//##
   }//d2
      */        
   
  }//connect ESP
}//connect web host
