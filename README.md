# 概要

イラスト掲載サイト＋管理者画面（Vue3 + Vite）。
本プロジェクトは、企画・設計・実装・テスト・運用まで全て個人によるものです。

## 設計意図

本プロジェクトは、キャラクターやイラストの管理を効率的かつ直感的に行えるWebアプリケーションを目指して設計されています。  
管理者がキャラクター情報やイラストを簡単に登録・編集・削除できること、また外部API（キャラクター保管所）からのデータ取り込みによる作業効率化を重視しています。  
データ構造は拡張性を考慮し、将来的な機能追加や他サービスとの連携にも柔軟に対応できるよう設計しています。  

フロントエンドはVue3とViteを採用し、開発効率とパフォーマンスの両立を図っています。

### バックエンド側の技術の選定理由

APIサーバー側にはLaravelなどのフレームワークを採用せず、シンプルなPHPスクリプトを利用しています。  
これはプロジェクトの規模や要件が比較的シンプルであり、学習コストやセットアップの手間を抑え、環境依存を減らすことを重視したためです。  

### フロントエンド側の技術の選定理由

Vue3はVue2に比べてComposition APIなどの新しい機能により、より柔軟で保守性の高いコードを書くことができます。  
また、長期的なメンテナンス性を考慮し、最新のVue3を選択しています。
さらにTypeScriptの導入により、型の不一致によるエラーを事前に防止しています。

なお、scenarioフォルダの中身は元々ローカルでの利用を目的として配布していたもののため、ビルドせずに使えるVue2を使用しています。

## 開発環境

- Node.js
- npm
- PHP
- Vue3
- Vite
- TypeScript

## 画面一覧

- トップ：入り口画面
- プロフィール：外部リンクやイラスト以外の成果物を掲載
- キャラクター一覧：TRPGキャラクターの一覧表示
- キャラクター詳細：キャラクター詳細・SNS共有機能
- イラスト一覧：イラストの一覧表示
- イラスト詳細：イラスト詳細・SNS共有機能
- 探索者登録（管理者用）：キャラクターのDB保存・外部API取り込み
- 探索者管理（管理者用）：キャラクター情報の編集・削除・並び替え、OGP画像登録
- イラスト管理（管理者用）：イラスト情報の編集・削除、OGP画像登録
- イラストアップロード（管理者用）：イラストのアップロード、タイトル・キャプション・ネタバレ設定

# データ構造

キャラクター（探索者）のデータ構造は非常に複雑になっています。
下記の通り、構造と外部APIとの対応表を残します。

## DBデータ構造（status）

### status

```json
{
  "str": { "default": 0, "ex1": null, "ex2": null },
  "con": { "default": 0, "ex1": null, "ex2": null },
  "pow": { "default": 0, "ex1": null, "ex2": null },
  "dex": { "default": 0, "ex1": null, "ex2": null },
  "app": { "default": 0, "ex1": null, "ex2": null },
  "siz": { "default": 0, "ex1": null, "ex2": null },
  "int": { "default": 0, "ex1": null, "ex2": null },
  "edu": { "default": 0, "ex1": null, "ex2": null },
  "hp": { "default": null, "ex1": null, "ex2": null },
  "mp": { "default": null, "ex1": null, "ex2": null },
  "ini_san": { "default": null, "ex1": null, "ex2": null },
  "san": { "default": null },
  "idea": { "default": null, "ex1": null, "ex2": null },
  "luck": { "default": null, "ex1": null, "ex2": null },
  "know": { "default": null, "ex1": null, "ex2": null }
}
```

## DBデータ構造（skill）

### 内部構造

```json
{
  "name": "ヒプノーシス",
  "default": 45,
  "ex1": 3,
  "ex2": 4,
  "ex3": 5,
  "ex4": 6
}
```

### combat（戦闘技能 / 初期値）

- `sc1` — 回避: DEX * 2
- `sc2` — キック: 25
- `sc3` — 組み付き: 25
- `sc4` — こぶし: 50
- `sc5` — 頭突き: 10
- `sc6` — 投擲: 25
- `sc7` — マーシャルアーツ: 1
- `sc8` — 拳銃: 20
- `sc9` — サブマシンガン: 15
- `sc10` — ショットガン: 30
- `sc11` — マシンガン: 15
- `sc12` — ライフル: 25
- `scet` — その他

### exp（探索技能 / 初期値）

- `se1` — 応急手当: 30
- `se2` — 鍵開け: 1
- `se3` — 隠す: 15
- `se4` — 隠れる: 10
- `se5` — 聞き耳: 25
- `se6` — 忍び歩き: 10
- `se7` — 写真術: 10
- `se8` — 精神分析: 1
- `se9` — 追跡: 10
- `se10` — 登攀: 40
- `se11` — 図書館: 25
- `se12` — 目星: 25
- `seet` — その他

### act（行動技能 / 初期値）

- `sa1` — 運転: 20
- `sa2` — 機械修理: 20
- `sa3` — 重機械操作: 1
- `sa4` — 乗馬: 5
- `sa5` — 水泳: 25
- `sa6` — 製作: 5
- `sa7` — 操縦: 1
- `sa8` — 跳躍: 25
- `sa9` — 電気修理: 10
- `sa10` — ナビゲート: 10
- `sa11` — 変装: 1
- `saet` — その他

### neg（交渉技能 / 初期値）

- `sn1` — 言いくるめ
- `sn2` — 信用
- `sn3` — 説得
- `sn4` — 値切り
- `sn5` — 母国語
- `snet` — その他

### know（知識技能 / 初期値）

- `sk1` — 医学: 5
- `sk2` — オカルト: 5
- `sk3` — 化学: 1
- `sk4` — クトゥルフ神話: 0
- `sk5` — 芸術: 5
- `sk6` — 経理: 10
- `sk7` — 考古学: 1
- `sk8` — コンピューター: 1
- `sk9` — 心理学: 5
- `sk10` — 人類学: 1
- `sk11` — 生物学: 1
- `sk12` — 地質学: 1
- `sk13` — 電子工学: 1
- `sk14` — 天文学: 1
- `sk15` — 博物学: 10
- `sk16` — 物理学: 1
- `sk17` — 法律: 10
- `sk18` — 薬学: 1
- `sk19` — 歴史: 20
- `sket` — その他

## キャラクター保管所 API 取り込み仕様（対応キー一覧）

### 基本情報

- `pc_name` → `name`
- `age` → `age`
- `sex` → `sex`
- `height` → `height`
- `shuzoku` → `job`
- `pc_making_memo` → `detail`

### status

- `NA1..NA14` → `status.*.default`
- `NS1..NS14` → `status.*.ex1`
- `NM1..NM14` → `status.*.ex2`
- `SAN_Left` → `status.san.default`

対応順序:
`str, con, pow, dex, app, siz, int, edu, hp, mp, ini_san, idea, luck, know`

### skill（通常）

- 戦闘: `TBAS/TBAK/TBAA/TBAO` → `combat.sc*.ex1..ex4`
- 探索: `TFAS/TFAK/TFAA/TFAO` → `exp.se*.ex1..ex4`
- 行動: `TAAS/TAAK/TAAA/TAAO` → `act.sa*.ex1..ex4`
- 交渉: `TCAS/TCAK/TCAA/TCAO` → `neg.sn*.ex1..ex4`
- 知識: `TKAS/TKAK/TKAA/TKAO` → `know.sk*.ex1..ex4`

### skill（追加）

- 戦闘: `TBAName/TBName` + `TBAD/TBAS/TBAK/TBAA/TBAO` → `combat.scet`
- 探索: `TFAName/TFName` + `TFAD/TFAS/TFAK/TFAA/TFAO` → `exp.seet`
- 行動: `TAAName/TAName` + `TAAD/TAAS/TAAK/TAAA/TAAO` → `act.saet`
- 交渉: `TCAName/TCName` + `TCAD/TCAS/TCAK/TCAA/TCAO` → `neg.snet`
- 知識: `TKAName/TKName` + `TKAD/TKAS/TKAK/TKAA/TKAO` → `know.sket`

### 分野名の反映

- `unten_bunya` → `運転（...）`
- `seisaku_bunya` → `製作（...）`
- `main_souju_norimono` → `操縦（...）`
- `geijutu_bunya` → `芸術（...）`
- `mylang_name` → `母国語（...）`

# 依存 API/DB（PHP/SQLite）の起動手順

1. `api/` と `db/` が配置されているディレクトリを PHP の公開ディレクトリとして設定
2. PHP の組み込みサーバーを起動

```bash
php -S localhost:8000
```

3. フロント側の API URL 設定を、必要に応じて `util/api` (`util/api.ts`) で更新
