#Requires AutoHotkey v2.0

Run("https://jmn2f42hjgfv.connect.remote.it/queue")

Sleep(2000)

; fullscreen
Send("{F11}")

; keep screen on
loop {
    Sleep(60000)
    Send("{F15}")
}
