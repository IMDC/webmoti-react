#Requires AutoHotkey v2.0

; set this to the random string generated for the remote.it url
SUBDOMAIN := ""

; open queue page in chrome with fullscreen
Run('chrome.exe --start-fullscreen "https://' . SUBDOMAIN . '.connect.remote.it/queue"')

; wait until browser opens
WinWaitActive("ahk_exe chrome.exe")

; keep screen on
loop {
    Sleep(60000)
    Send("{F15}")
}
