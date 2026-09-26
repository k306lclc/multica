# 繁體中文語系移植紀錄（上游 v0.5.3）

此語系以尚未合併的 [繁中 PR #7598](https://github.com/multica-ai/multica/pull/7598) 為基礎，移植到上游 `v0.5.3`。Web 與 Desktop 的已登入產品介面共用 `packages/views/locales`，伺服器則另外接受儲存 `zh-Hant` 語言偏好。

- 保留原 PR 中仍對應新版英文鍵值的 5,065 個既有譯文。
- 新版新增或改名而原 PR 缺少的 812 個鍵，先從 `zh-Hans` 對應文字經 OpenCC `s2twp` 轉換（`opencc-python-reimplemented==0.1.7`），不是逐字人工審稿。
- 移除 126 個已無英文對應的舊鍵；另外依 `Intl.PluralRules("zh-Hant")` 的 `other` 規則，移除 125 個永遠不會使用的 `_one` 鍵。有效鍵值由原有 `parity.test.ts` 與新增 `zh-hant-parity.test.ts` 檢查，後者也比對插值變數。
- 人工抽查並修正登入與授權錯誤、權限／Token 警語、任務與代理執行、工作區設定、Git 整合及 Web 全頁錯誤文案的用詞與插值。繁中資料中的「訪問／許可權／賬單／賬號／郵箱／域名／例項」也統一為臺灣常用表述。

此紀錄只證明鍵值覆蓋與所列抽查，**不代表 812 個機械轉換字串已通過完整文字校稿、實際瀏覽器或 macOS 安裝驗收**。行銷首頁另有獨立字典，本次沒有替它新增繁中版本；自編 Desktop 的自動更新來源也須另行隔離後，才能安全安裝為長期使用的 fork 版本。
