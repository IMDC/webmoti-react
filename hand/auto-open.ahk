#Requires AutoHotkey v2.0

Run("https://jmn2f42hjgfv.connect.remote.it/")

Sleep(2000)

; fullscreen
Send("{F11}")

; keep screen on
Loop {
    Sleep(60000)
    Send("{F15}")
}
