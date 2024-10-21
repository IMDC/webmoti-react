#Requires AutoHotkey v2.0

; this script is for the prof laptop so it will run autojoin on boot

scriptDir := "C:\Users\IMDC\Desktop\WebMoti"

; open command prompt and run autojoin script
Run('cmd.exe /K "node autojoin.js"', scriptDir)