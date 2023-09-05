boolean connect_ESP(){//returns 1 if successful or 0 if not


  Serial.println("CONNECTING");
  //or 443 para HTTPS
  //enshare.000webhostapp.co
  ESP8266.print("AT+CIPSTART=0,\"TCP\",\"www.noobix.000webhostapp.com\",80\r\n");//connect to your web server

  
  //read_until_ESP(keyword,size of the keyword,timeout in ms, data save 0-no 1-yes 'more on this later') 
  if(read_until_ESP(keyword_OK,sizeof(keyword_OK),5000,0)){//go look for 'OK' and come back
  serial_dump_ESP();//get rid of whatever else is coming
  Serial.println("CONNECTED");//yay, connected
  ESP8266.print("AT+CIPSEND=0,");//send AT+CIPSEND=0, size of payload
  ESP8266.print(payload_size);//the payload size
  serial_dump_ESP();//everything is echoed back, so get rid of it
  ESP8266.print("\r\n\r\n");//cap off that command with a carriage return and new line feed
  
  if(read_until_ESP(keyword_carrot,sizeof(keyword_carrot),5000,0)){//go wait for the '>' character, ESP ready for the payload
    Serial.println("READY TO SEND");
    
    Serial.println(payload_size);
    
    for(int i=0; i<payload_size; i++)
    {//print the payload to the ESP
    ESP8266.print(payload[i]);


    
    Serial.print(payload[i]);    

    }

    /*
    Serial.println(""); 
    Serial.println(payload_size); 
    Serial.println("");
    */
    
    if(read_until_ESP(keyword_sendok,sizeof(keyword_sendok),5000,0)){//go wait for 'SEND OK'
    Serial.println("SENT");//yay, it was sent
    return 1;//get out of here, data is about to fly out of the ESP
  }// got the SEND OK
    else// SEND OK
  Serial.println("FAILED TO SEND");
  
  }//got the back carrot >
  else
  Serial.println("FAILED TO GET >");
  
  }//First OK
  else{
  Serial.println("FAILED TO CONNECT");//something went wrong
  setup_ESP();//optional, this will go setup the module and attempt to repair itself - connect to SSID, set the CIPMUX, etc...
  }
  
}// VOID CONNECT FUNCTION
