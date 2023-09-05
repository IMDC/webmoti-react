<?php
/*This file should receive a link somethong like this: http://noobix.000webhostapp.com/TX.php?unit=1&b1=1
If you paste that link to your browser, it should update b1 value with this TX.php file. Read more details below.
The ESP will send a link like the one above but with more than just b1. It will have b1, b2, etc...
*/

//We loop through and grab variables from the received the URL
foreach($_REQUEST as $key => $value)  //Save the received value to the hey variable. Save each cahracter after the "&"
{
	//Now we detect if we recheive the id, the password, unit, or a value to update
if($key =="id"){
$unit = $value;
}	
if($key =="pw"){
$pass = $value;
}	
if($key =="un"){
$update_number = $value;
}
	
if($update_number == 1)
{
	if($key =="n1"){
		$sent_nr_1 = $value;
	}			
}
else if($update_number == 2)
{
	if($key =="n2"){
	$sent_nr_2 = $value;
	}			
}
else if($update_number == 3)
{
	if($key =="n3"){
	$sent_nr_3 = $value;
	}			
}
else if($update_number == 4)
{
	if($key =="n4"){
	$sent_nr_4 = $value;
	}			
}	
	
else if($update_number == 5)
	{
	if($key =="b6"){
	$sent_bool_1 = $value;
	}	
	if($key =="b7"){
	$sent_bool_2 = $value;
	}	
	if($key =="b8"){
	$sent_bool_3 = $value;
	}	
}
}//End of foreach


include("database_connect.php"); 	//We include the database_connect.php which has the data for the connection to the database


// Check  the connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

//Now we update the values in database
if($update_number == 1)	//If the received data is for SENT_NUMBER_1, we update that value
	{
		mysqli_query($con,"UPDATE ESPtable2 SET SENT_NUMBER_1 = $sent_nr_1 WHERE id=$unit AND PASSWORD=$pass");	
	}
else if($update_number == 2)	//The same and so on...
	{
		mysqli_query($con,"UPDATE ESPtable2 SET SENT_NUMBER_2 = $sent_nr_2 WHERE id=$unit AND PASSWORD=$pass");	;	
	}
else if($update_number == 3)
	{
		mysqli_query($con,"UPDATE ESPtable2 SET SENT_NUMBER_3 = $sent_nr_3 WHERE id=$unit AND PASSWORD=$pass");	;	
	}
else if($update_number == 4)
	{
		mysqli_query($con,"UPDATE ESPtable2 SET SENT_NUMBER_4 = $sent_nr_4 WHERE id=$unit AND PASSWORD=$pass");	;	
	}

else if($update_number == 5)
	{
		mysqli_query($con,"UPDATE ESPtable2 SET SENT_BOOL_1 = $sent_bool_1, SENT_BOOL_2 = $sent_bool_2, SENT_BOOL_3 = $sent_bool_3 
		WHERE id=$unit AND PASSWORD=$pass");	;	
	}



//In case that you need the time from the internet, use this line
date_default_timezone_set('UTC');
$t1 = date("gi"); 	//This will return 1:23 as 123

//Get all the values form the table on the database
$result = mysqli_query($con,"SELECT * FROM ESPtable2");	//table select is ESPtable2, must be the same on yor database

//Loop through the table and filter out data for this unit id equal to the one taht we've received. 
while($row = mysqli_fetch_array($result)) {
if($row['id'] == $unit){
	
		//We update the values for the boolean and numebers we receive from the Arduino, then we echo the boolean
		//and numbers and the text from the database back to the Arduino
		$b1 = $row['RECEIVED_BOOL1'];	
		$b2 = $row['RECEIVED_BOOL2'];	
		$b3 = $row['RECEIVED_BOOL3'];
		$b4 = $row['RECEIVED_BOOL4'];	
		$b5 = $row['RECEIVED_BOOL5'];
		
		$n1 = $row['RECEIVED_NUM1'];	
		$n2 = $row['RECEIVED_NUM2'];	
		$n3 = $row['RECEIVED_NUM3'];
		$n4 = $row['RECEIVED_NUM4'];	
		$n5 = $row['RECEIVED_NUM5'];
		
		$n6 = $row['TEXT_1'];
		
		//Next line will echo the data back to the Arduino
		echo " _t1$t1##_b1$b1##_b2$b2##_b3$b3##_b4$b4##_b5$b5##_n1$n1##_n2$n2##_n3$n3##_n4$n4##_n5$n5##_n6$n6##";
	
}


	
}// End of the while loop
?>








