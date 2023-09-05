<?php
//This line will make the page auto-refresh each 15 seconds
$page = $_SERVER['PHP_SELF'];
$sec = "15";
?>


<html>
<head>
<!--//I've used bootstrap for the tables, so I inport the CSS files for taht as well...-->
<meta http-equiv="refresh" content="<?php echo $sec?>;URL='<?php echo $page?>'">		
<!-- Latest compiled and minified CSS -->
<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/css/bootstrap.min.css">
<!-- jQuery library -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.4.1/jquery.min.js"></script>
<!-- Latest compiled JavaScript -->
<script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.4.0/js/bootstrap.min.js"></script>
</head>
	
	
	
	
	
<body>    
<?php
include("database_connect.php"); //We include the database_connect.php which has the data for the connection to the database


// Check the connection
if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
//Again, we grab the table out of the database, name is ESPtable2 in this case
$result = mysqli_query($con,"SELECT * FROM ESPtable2");//table select


		  
//Now we create the table with all the values from the database	  
echo "<table class='table' style='font-size: 30px;'>
	<thead>
		<tr>
		<th>Boolean Indicators</th>	
		</tr>
	</thead>
	
    <tbody>
      <tr class='active'>
        <td>Noobix ID</td>
        <td>Boolean control 1</td>
        <td>Boolean control 2 </td>
		<td>Boolean control 3 </td>
		<td>Boolean control 4</td>
        <td>Boolean control 5 </td>		
      </tr>  
		";
		  
//loop through the table and print the data into the table
while($row = mysqli_fetch_array($result)) {
	
   echo "<tr class='success'>"; 	
    $unit_id = $row['id'];
    echo "<td>" . $row['id'] . "</td>";
	
    $column1 = "RECEIVED_BOOL1";
    $column2 = "RECEIVED_BOOL2";
    $column3 = "RECEIVED_BOOL3";
    $column4 = "RECEIVED_BOOL4";
    $column5 = "RECEIVED_BOOL5";
	
    $current_bool_1 = $row['RECEIVED_BOOL1'];
	$current_bool_2 = $row['RECEIVED_BOOL2'];
	$current_bool_3 = $row['RECEIVED_BOOL3'];
	$current_bool_4 = $row['RECEIVED_BOOL4'];
	$current_bool_5 = $row['RECEIVED_BOOL5'];

	if($current_bool_1 == 1){
    $inv_current_bool_1 = 0;
	$text_current_bool_1 = "ON";
	$color_current_bool_1 = "#6ed829";
	}
	else{
    $inv_current_bool_1 = 1;
	$text_current_bool_1 = "OFF";
	$color_current_bool_1 = "#e04141";
	}
	
	
	if($current_bool_2 == 1){
    $inv_current_bool_2 = 0;
	$text_current_bool_2 = "ON";
	$color_current_bool_2 = "#6ed829";
	}
	else{
    $inv_current_bool_2 = 1;
	$text_current_bool_2 = "OFF";
	$color_current_bool_2 = "#e04141";
	}
	
	
	if($current_bool_3 == 1){
    $inv_current_bool_3 = 0;
	$text_current_bool_3 = "ON";
	$color_current_bool_3 = "#6ed829";
	}
	else{
    $inv_current_bool_3 = 1;
	$text_current_bool_3 = "OFF";
	$color_current_bool_3 = "#e04141";
	}
	
	
	if($current_bool_4 == 1){
    $inv_current_bool_4 = 0;
	$text_current_bool_4 = "ON";
	$color_current_bool_4 = "#6ed829";
	}
	else{
    $inv_current_bool_4 = 1;
	$text_current_bool_4 = "OFF";
	$color_current_bool_4 = "#e04141";
	}
	
	
	if($current_bool_5 == 1){
    $inv_current_bool_5 = 0;
	$text_current_bool_5 = "ON";
	$color_current_bool_5 = "#6ed829";
	}
	else{
    $inv_current_bool_5 = 1;
	$text_current_bool_5 = "OFF";
	$color_current_bool_5 = "#e04141";
	}
	
	
	echo "<td><form action= update_values.php method= 'post'>
  	<input type='hidden' name='value2' value=$current_bool_1   size='15' >	
	<input type='hidden' name='value' value=$inv_current_bool_1  size='15' >	
  	<input type='hidden' name='unit' value=$unit_id >
  	<input type='hidden' name='column' value=$column1 >
  	<input type= 'submit' name= 'change_but' style=' margin-left: 25%; margin-top: 10%; font-size: 30px; text-align:center; background-color: $color_current_bool_1' value=$text_current_bool_1></form></td>";
	
     
	
	echo "<td><form action= update_values.php method= 'post'>
  	<input type='hidden' name='value2' value=$current_bool_2   size='15' >	
	<input type='hidden' name='value' value=$inv_current_bool_2  size='15' >	
  	<input type='hidden' name='unit' value=$unit_id >
  	<input type='hidden' name='column' value=$column2 >
  	<input type= 'submit' name= 'change_but' style=' margin-left: 25%; margin-top: 10%; font-size: 30px; text-align:center; background-color: $color_current_bool_2' value=$text_current_bool_2></form></td>";
	
	
	echo "<td><form action= update_values.php method= 'post'>
  	<input type='hidden' name='value2' value=$current_bool_3   size='15' >	
	<input type='hidden' name='value' value=$inv_current_bool_3  size='15' >	
  	<input type='hidden' name='unit' value=$unit_id >
  	<input type='hidden' name='column' value=$column3 >
  	<input type= 'submit' name= 'change_but' style=' margin-left: 25%; margin-top: 10%; font-size: 30px; text-align:center; background-color: $color_current_bool_3' value=$text_current_bool_3></form></td>";
	
	
	echo "<td><form action= update_values.php method= 'post'>
  	<input type='hidden' name='value2' value=$current_bool_4   size='15' >	
	<input type='hidden' name='value' value=$inv_current_bool_4  size='15' >	
  	<input type='hidden' name='unit' value=$unit_id >
  	<input type='hidden' name='column' value=$column4 >
  	<input type= 'submit' name= 'change_but' style=' margin-left: 25%; margin-top: 10%; font-size: 30px; text-align:center; background-color: $color_current_bool_4' value=$text_current_bool_4></form></td>";
	
	
	echo "<td><form action= update_values.php method= 'post'>
  	<input type='hidden' name='value2' value=$current_bool_5   size='15' >	
	<input type='hidden' name='value' value=$inv_current_bool_5  size='15' >	
  	<input type='hidden' name='unit' value=$unit_id >
  	<input type='hidden' name='column' value=$column5 >
  	<input type= 'submit' name= 'change_but' style=' margin-left: 25%; margin-top: 10%; font-size: 30px; text-align:center; background-color: $color_current_bool_5' value=$text_current_bool_5></form></td>";
	
	echo "</tr>
	  </tbody>"; 
	
}
echo "</table>
<br>
";	
?>
		
		
		
		
		
//Again for the second table for numeric controls. We create the table with all the values from the database			
<?php
include("database_connect.php");

if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
$result = mysqli_query($con,"SELECT * FROM ESPtable2");//table select

echo "<table class='table' style='font-size: 30px;'>
	<thead>
		<tr>
		<th>Numeric controls</th>	
		</tr>
	</thead>
	
    <tbody>
      <tr class='active'>
        <td>CONTROL NUMBER 1</td>
        <td>CONTROL NUMBER 2</td>
        <td>CONTROL NUMBER 3</td>
		<td>CONTROL NUMBER 4 </td>
		<td>CONTROL NUMBER 5 </td>
      </tr>  
		";
		  
while($row = mysqli_fetch_array($result)) {

 	echo "<tr class='success'>";
   	
    $column6 = "RECEIVED_NUM1";
    $column7 = "RECEIVED_NUM2";
    $column8 = "RECEIVED_NUM3";
    $column9 = "RECEIVED_NUM4";
    $column10 = "RECEIVED_NUM5";
	
    $current_num_1 = $row['RECEIVED_NUM1'];
	$current_num_2 = $row['RECEIVED_NUM2'];
	$current_num_3 = $row['RECEIVED_NUM3'];
	$current_num_4 = $row['RECEIVED_NUM4'];
	$current_num_5 = $row['RECEIVED_NUM5'];	
	
		
	echo "<td><form action= update_values.php method= 'post'>
  	<input type='text' name='value' style='width: 120px;' value=$current_num_1  size='15' >
  	<input type='hidden' name='unit' style='width: 120px;' value=$unit_id >
  	<input type='hidden' name='column' style='width: 120px;' value=$column6 >
  	<input type= 'submit' name= 'change_but' style='width: 120px; text-align:center;' value='change'></form></td>";
	
        
	
  	echo "<td><form action= update_values.php method= 'post'>
  	<input type='text' name='value' style='width: 120px;' value=$current_num_2  size='15' >
  	<input type='hidden' name='unit' style='width: 120px;' value=$unit_id >
  	<input type='hidden' name='column' style='width: 120px;' value=$column7 >
  	<input type= 'submit' name= 'change_but' style='text-align:center' value='change'></form></td>";
	
	echo "<td><form action= update_values.php method= 'post'>
  	<input type='text' name='value' style='width: 120px;' value=$current_num_3  size='15' >
  	<input type='hidden' name='unit' style='width: 120px;' value=$unit_id >
  	<input type='hidden' name='column' style='width: 120px;' value=$column8 >
  	<input type= 'submit' name= 'change_but' style='text-align:center' value='change'></form></td>";
	
	echo "<td><form action= update_values.php method= 'post'>
  	<input type='text' name='value' style='width: 120px;' value=$current_num_4  size='15' >
  	<input type='hidden' name='unit' style='width: 120px;' value=$unit_id >
  	<input type='hidden' name='column' style='width: 120px;' value=$column9 >
  	<input type= 'submit' name= 'change_but' style='text-align:center' value='change'></form></td>";
	
	echo "<td><form action= update_values.php method= 'post'>
  	<input type='text' name='value' style='width: 120px;' value=$current_num_5  size='15' >
  	<input type='hidden' name='unit' style='width: 120px;' value=$unit_id >
  	<input type='hidden' name='column' style='width: 120px;' value=$column10 >
  	<input type= 'submit' name= 'change_but' style='text-align:center' value='change'></form></td>";
	
	echo "</tr>
	  </tbody>"; 
	
}
echo "</table>
<br>
";		
?>
		

	
	
	
		
//Again for the third table for text send. We create the table with all the values from the database	
<?php

include("database_connect.php");

if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}
$result = mysqli_query($con,"SELECT * FROM ESPtable2");//table select


		
   echo "<table class='table' style='font-size: 30px;'>
	<thead>
		<tr>
		<th>Send Text to Noobix</th>	
		</tr>
	</thead>
	
    <tbody>
      <tr class='active'>
        <td>Text</td>        
      </tr>  
		";

while($row = mysqli_fetch_array($result)) {

 	 echo "<tr class='success'>";	
	
    $column11 = "TEXT_1"; 
    $current_text_1 = $row['TEXT_1'];
	
		
	echo "<td><form action= update_values.php method= 'post'>
  	<input style='width: 100%;' type='text' name='value' value=$current_text_1  size='100'>
  	<input type='hidden' name='unit' value=$unit_id >
  	<input type='hidden' name='column' value=$column11 >
  	<input type= 'submit' name= 'change_but' style='text-align:center' value='Send'></form></td>";
	
    echo "</tr>
	  </tbody>";      
	
}
echo "</table>
<br>
<br>
<hr>";
		
?>
				
		
		
		
		
		
		
		
		
		
		
		

		
		
		
		
//Again for the forth table.	
<?php
include("database_connect.php");

if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

$result = mysqli_query($con,"SELECT * FROM ESPtable2");//table select

echo "<table class='table' style='font-size: 30px;'>
	<thead>
		<tr>
		<th>Boolean Indicators</th>	
		</tr>
	</thead>
	
    <tbody>
      <tr class='active'>
        <td>Noobix ID</td>
        <td>Indicator 1</td>
        <td>Indicator 2 </td>
		<td>Indicator 3 </td>
      </tr>  
		";
	  
	
	
while($row = mysqli_fetch_array($result)) {

 	$cur_sent_bool_1 = $row['SENT_BOOL_1'];
	$cur_sent_bool_2 = $row['SENT_BOOL_2'];
	$cur_sent_bool_3 = $row['SENT_BOOL_3'];
	

	if($cur_sent_bool_1 == 1){
    $label_sent_bool_1 = "label-success";
	$text_sent_bool_1 = "Active";
	}
	else{
    $label_sent_bool_1 = "label-danger";
	$text_sent_bool_1 = "Inactive";
	}
	
	
	if($cur_sent_bool_2 == 1){
    $label_sent_bool_2 = "label-success";
	$text_sent_bool_2 = "Active";
	}
	else{
    $label_sent_bool_2 = "label-danger";
	$text_sent_bool_2 = "Inactive";
	}
	
	
	if($cur_sent_bool_3 == 1){
    $label_sent_bool_3 = "label-success";
	$text_sent_bool_3 = "Active";
	}
	else{
    $label_sent_bool_3 = "label-danger";
	$text_sent_bool_3 = "Inactive";
	}
	 
		
	  echo "<tr class='info'>";
	  $unit_id = $row['id'];
        echo "<td>" . $row['id'] . "</td>";	
		echo "<td>
		<span class='label $label_sent_bool_1'>"
			. $text_sent_bool_1 . "</td>
	    </span>";
		
		echo "<td>
		<span class='label $label_sent_bool_2'>"
			. $text_sent_bool_2 . "</td>
	    </span>";
		
		echo "<td>
		<span class='label $label_sent_bool_3'>"
			. $text_sent_bool_3 . "</td>
	    </span>";
	  echo "</tr>
	  </tbody>"; 
      

	
}
echo "</table>";
?>
		
	
	
	
	
	
	
	

//Again for the fifth table.
<?php

include("database_connect.php");

if (mysqli_connect_errno()) {
  echo "Failed to connect to MySQL: " . mysqli_connect_error();
}

$result = mysqli_query($con,"SELECT * FROM ESPtable2");//table select

	
echo "<table class='table' style='font-size: 30px;'>
	<thead>
		<tr>
		<th>Integer Indicators</th>	
		</tr>
	</thead>
	
    <tbody>
      <tr class='active'>
        <td>Received number 1</td>
        <td>Received number 2</td>
        <td>Received number 3 </td>
		<td>Received number 4 </td>
      </tr>  
		";
		  

while($row = mysqli_fetch_array($result)) {

 	echo "<tr class='info'>";
    
	echo "<td>" . $row['SENT_NUMBER_1'] . "</td>";
	echo "<td>" . $row['SENT_NUMBER_2'] . "</td>";
	echo "<td>" . $row['SENT_NUMBER_3'] . "</td>";
	echo "<td>" . $row['SENT_NUMBER_4'] . "</td>";

	echo "</tr>
	</tbody>"; 

	
}
echo "</table>
<br>
";
?>
		
		
		
		

		
		
		
		

		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
		
    