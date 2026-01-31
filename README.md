# 概要

イラスト掲載サイト＋管理者画面（Vue3 + Vite）。

## 主な機能

- キャラクター情報登録（ステータス／技能入力）
- 外部 API（キャラクター保管所）からの取り込み
- キャラクター一覧・削除
- イラスト管理（一覧・アップロード・削除）

## 開発環境

- Node.js
- npm
- PHP
- Vue3
- Vite

## 管理者機能の画面一覧

- 探索者登録
- 探索者一覧
- イラスト一覧
- イラストアップロード

## データ構造（status）

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

## データ構造（skill）

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

### combat（戦闘技能/初期値）

sc1:回避/DEX\*2
sc2:キック/25
sc3:組み付き/25
sc4:こぶし/50
sc5:頭突き/10
sc6:投擲/25
sc7:マーシャルアーツ/1
sc8:拳銃/20
sc9:サブマシンガン/15
sc10:ショットガン/30
sc11:マシンガン/15
sc12:ライフル/25
scet:その他

### exp（探索技能/初期値）

se1:応急手当/30
se2:鍵開け/1
se3:隠す/15
se4:隠れる/10
se5:聞き耳/25
se6:忍び歩き/10
se7:写真術/10
se8:精神分析/1
se9:追跡/10
se10:登攀/40
se11:図書館/25
se12:目星/25
seet:その他

### act（行動技能/初期値）

sa1:運転/20
sa2:機械修理/20
sa3:重機械操作/1
sa4:乗馬/5
sa5:水泳/25
sa6:製作/5
sa7:操縦/1
sa8:跳躍/25
sa9:電気修理/10
sa10:ナビゲート/10
sa11:変装/1
saet:その他

### neg（交渉技能/初期値）

sn1:言いくるめ
sn2:信用
sn3:説得
sn4:値切り
sn5:母国語
snet:その他

### know（知識技能/初期値）

sk1:医学/5
sk2:オカルト/5
sk3:化学/1
sk4:クトゥルフ神話/0
sk5:芸術/5
sk6:経理/10
sk7:考古学/1
sk8:コンピューター/1
sk9:心理学/5
sk10:人類学/1
sk11:生物学/1
sk12:地質学/1
sk13:電子工学/1
sk14:天文学/1
sk15:博物学/10
sk16:物理学/1
sk17:法律/10
sk18:薬学/1
sk19:歴史/20
sket:その他

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

## 依存 API/DB（PHP/SQLite）の起動手順

1. `api/` と `db/` が配置されているディレクトリを PHP の公開ディレクトリとして設定
2. PHP の組み込みサーバーを起動

```bash
php -S localhost:8000
```

3. フロント側の API URL 設定を、必要に応じて `util/api.js` で更新
