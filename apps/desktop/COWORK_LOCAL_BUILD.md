# Multica Cowork 本地繁中版

此版本保留 Multica 名稱、原始碼的 `LICENSE` 與 `NOTICE`，只供內部協作部署。它不是官方 Multica 發行版，不應發佈到官方更新來源。

## 與官方 App 並存

`pnpm --filter @multica/desktop package:cowork` 固定產出 macOS arm64、本地不發佈的 `Multica Cowork.app`。建置流程使用獨立 `com.kevinlin.multica.cowork` app ID、`Multica Cowork` 的 Electron userData 目錄，以及唯一的 `multica-cowork://` deep link。官方 `Multica.app` 的 `multica://`、原有 userData 和更新行為不改。

建置機必須安裝 Go；若缺少與原始碼同版的 bundled CLI，本地版打包會停止，執行時也不會回退下載官方最新 CLI。

本地版不查詢、下載或安裝官方自動更新；設定頁的手動更新檢查也會明確拒絕。升級時須由協作倉庫的新 commit 重新建置並人工驗證。不要對這個本地版使用官方 electron-builder 設定或 `--publish`。

本地版只讀 `~/.multica/desktop-cowork.json`，不會讀 `desktop.json`。缺檔時會拒絕啟動服務連線，不會回退 `api.multica.ai`。在預期使用該 App 的 Mac 上建立明確設定，例如先在本機建立指向 Mac mini 的釘選 SSH loopback tunnels，再使用：

```json
{
  "schemaVersion": 1,
  "apiUrl": "http://127.0.0.1:8080",
  "wsUrl": "ws://127.0.0.1:8080/ws",
  "appUrl": "http://127.0.0.1:3000"
}
```

這是範例，不會由安裝程式自動建立。設定檔不可包含 token 或密碼；登入由 App 的正常流程完成。需要驗證 tunnel 實際連向預期 Mac mini，勿把上述 port 改成 LAN／Internet wildcard。

本地版 daemon 使用 `~/.multica/profiles/desktop-cowork-<API host>/` 和獨立的 `desktop_cowork_prefs.json`，預設**不**自動啟動 daemon，以免打開 App 時在同一台 Mac 上新增第二個實例。Mini 若已有 headless CLI daemon，優先只部署 Web／API／headless CLI；MacBook 可安裝本地 App，連往 Mini 的服務。若決定在 App 裡手動啟動 daemon，須先確認所選 profile、port、服務端與既有 daemon 不衝突。

## 最低驗收

1. 用 electron-builder 的有效設定檢查 `appId`、`productName`、`protocols`、`publish`，並確認 `LICENSE`、`NOTICE` 仍打包。
2. 在 Mini arm64 實際建置後，檢查 `.app/Contents/Info.plist` 的 bundle ID 與 URL scheme；原 `Multica.app` 必須保持原狀。
3. 檢查 `~/.multica/desktop.json`、`desktop_prefs.json` 和舊版 userData 的修改時間與內容未受影響；登入、重啟、OAuth callback、繁中 Web／Desktop 顯示均須實測。
4. 用 `lsof` 確認沒有第二個非預期 daemon，也沒有 LAN 監聽；在 App 內點選手動檢查更新應顯示本地版拒絕訊息。

本地測試／編譯通過不等於已在 Mini 完成簽章、安裝、登入、鎖屏或人工驗收。
