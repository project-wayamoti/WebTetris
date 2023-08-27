/*
 * Copyright (c) 2023 wayamoti2015@waya0125 All Rights Reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/* 色々と参考にした資料のメモ
 * テトリスのスコア加算に関する資料 - https://ch-random.net/post/96/
 * windows.onloadを使ってはならない - https://took.jp/window-onload/
 *                                  - https://www.tam-tam.co.jp/tipsnote/javascript/post601.html
 * javascriptを取り扱う際のPath事情 - https://web-designer.cman.jp/other/path/
 * javascript側からHTMLを書き換える - https://web-camp.io/magazine/archives/78967
 * CSS Displayに関して              - https://developer.mozilla.org/ja/docs/Web/CSS/display
 * CSS SVGの取り扱い方法            - https://www.freecodecamp.org/japanese/news/use-svg-images-in-css-html/
 * innerHTMLの取り扱い              - https://developer.mozilla.org/ja/docs/Web/API/Element/innerHTML
 *
 * サイトにないメモ
 * Tetrisの描画をする際、Flexを使ったほうが楽だ！と言われたためこれを実践。
 * Flexを用いることで座標をLocal指定できるようになったため若干の位置修正だけで済むようになった。
 * ただし、Scoreにてパーセンテージを使って相対座標を取ろうとしたところ、1ブロック分=100%となった。
 * 原因はinline-blockを使っていたためで、これを削除したところ正常に動作した。
 * また、Flexを使うときはposition: absolute;を使うこと。
 *
 * また、テトリスの描画をする際、canvasを使うことも考えたが、
 * 今回はcanvasを使わずに実装した。
 *
 * 音声ファイルにはMpeg3とOgg Vorbisdeで検討した結果、圧縮をした音源でもキレイな音が出るOgg Vorbisdeを採用した。
 * また、音声ファイルには実際に収録したデータとインターネットにあるデータを使用している。
 * もし問題があれば即座に削除しますので、ご連絡ください。 - wayamoti2015@waya0125.com
 */

// ブロックの初期化（C言語の構造体のようなもの）
function Block(x, y, type) {
    this.x = x;       // ブロックのx座標
    this.y = y;       // ブロックのy座標
    this.type = type; // ブロックの種類
    this.status = 0;  // ブロックの状態
}

const block = new Block(4, 0, Math.floor(Math.random() * (7))); // ブロックの初期化
let fps = 1000 / 60;      // 60fps
let fieldWidth = 12;      // フィールドの幅
let fieldHeight = 18;     // フィールドの高さ
let currentBlock = 1;     // 現在のブロック
let nextBlock = Math.floor(Math.random() * (7)); // 次のブロック
let rotateKey = true;     // 回転キーの連打防止
let level = 1;            // レベル
let score = 0;            // スコア
let lines = 0;            // 消したライン数
let combo = 0;            // コンボ数 (未実装)
let deleteLinesCount = 0; // 消去回数
let playingState = true;  // 再生を止めるか否か (true: 一時停止, false: 再生)
let gameOver = false;     // ゲームオーバーか否か

/** ブロックの種類リスト */
let cell = {
    none : 0,     // 空白
    wall1 : 1,    // 壁1
    wall2 : 2,    // 壁2
    wall3 : 3,    // 壁3
    GameOver : 4, // 非破壊ブロック
    I : 10,       // テトリミノI
    O : 11,       // テトリミノO
    S : 12,       // テトリミノS
    Z : 13,       // テトリミノZ
    J : 14,       // テトリミノJ
    L : 15,       // テトリミノL
    T : 16,       // テトリミノT
};

/** 描画用メモリ<br>20*18のフィールド */
const viewRAM = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 0行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 1行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 2行目
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 4行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 5行目
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 7行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 8行目
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 10行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 11行目
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 12行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 13行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 14行目
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 15行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 16行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 17行目
    [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1]  // 18行目
];

/** ゲームを管理するためのフィールド */
const fieldRAM = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 0行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 1行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 2行目
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 3行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 4行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 5行目
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 6行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 7行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 8行目
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 9行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 10行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 11行目
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 12行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 13行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 14行目
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // 15行目
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2], // 16行目
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3], // 17行目
    [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1]  // 18行目
];

/** 各ブロックの状態の数<br>ステータス-1で使用すること */
let blockStatus = [1, 0, 1, 1, 3, 3, 3]

/** 各ブロックのデータ<br>
 * I, O, S, Z, J, L, T<br>
 * それぞれのブロックの状態の数はblock_statusに格納<br>
 * 回転可能な描画データを格納する<br>
 * 最大4つの状態を格納
 */
let blocks = [
    // Tetrimino I
    [
        [
            [cell.I, cell.I, cell.I, cell.I] // ■ ■ ■ ■
        ],
        [
            [cell.I], // ■
            [cell.I], // ■
            [cell.I], // ■
            [cell.I]  // ■
        ]
    ],
    // Tetrimino O
    [
        [
            [cell.O, cell.O], // ■ ■
            [cell.O, cell.O]  // ■ ■
        ]
    ],
    // Tetrimino S
    [
        [
            [cell.S, cell.none], // ■
            [cell.S, cell.S],    // ■ ■
            [cell.none, cell.S]     //   ■
        ],
        [
            [cell.none, cell.S, cell.S],   //   ■ ■
            [cell.S, cell.S, cell.none] // ■ ■
        ]
    ],
    // Tetrimino Z
    [
        [
            [cell.none, cell.Z],    //   ■
            [cell.Z, cell.Z],    // ■ ■
            [cell.Z, cell.none]  // ■
        ],
        [
            [cell.Z, cell.Z, cell.none], // ■ ■
            [cell.none, cell.Z, cell.Z]     //   ■ ■
        ]
    ],
    // Tetrimino J
    [
        [
            [cell.none, cell.J], //   ■
            [cell.none, cell.J], //   ■
            [cell.J, cell.J]  // ■ ■
        ],
        [
            [cell.J, cell.none, cell.none], // ■
            [cell.J, cell.J, cell.J]     // ■ ■ ■
        ],
        [
            [cell.J, cell.J],    // ■ ■
            [cell.J, cell.none], // ■
            [cell.J, cell.none]  // ■
        ],
        [
            [cell.J, cell.J, cell.J], //     ■
            [cell.none, cell.none, cell.J]  // ■ ■ ■
        ]
    ],
    // Tetrimino L
    [
        [
            [cell.L, cell.none], // ■
            [cell.L, cell.none], // ■
            [cell.L, cell.L]     // ■ ■
        ],
        [
            [cell.L, cell.L, cell.L],      // ■ ■ ■
            [cell.L, cell.none, cell.none] // ■
        ],
        [
            [cell.L, cell.L],    // ■ ■
            [cell.none, cell.L], //   ■
            [cell.none, cell.L]  //   ■
        ],
        [
            [cell.none, cell.none, cell.L],  //     ■
            [cell.L, cell.L, cell.L]         // ■ ■ ■
        ]
    ],
    // Tetrimino T
    [
        [
            [cell.T, cell.none], // ■
            [cell.T, cell.T],    // ■ ■
            [cell.T, cell.none]  // ■
        ],
        [
            [cell.T, cell.T, cell.T],      // ■ ■ ■
            [cell.none, cell.T, cell.none] //   ■
        ],
        [
            [cell.none, cell.T], //   ■
            [cell.T, cell.T],    // ■ ■
            [cell.none, cell.T]  //   ■
        ],
        [
            [cell.none, cell.T, cell.none], //   ■
            [cell.T, cell.T, cell.T]        // ■ ■ ■
        ]
    ]
];

/**
 * 配列コピー<br>
 * sa:     コピー元配列<br>
 * da:     コピー先配列<br>
 * sx:     コピー元のx座標<br>
 * sy:     コピー元のy座標<br>
 * dx:     コピー先のx座標<br>
 * dy:     コピー先のy座標<br>
 * width:  コピーする幅<br>
 * height: コピーする高さ<br>
 * ignore: コピーしない値
 */
function copy(sa, da, sx, sy, dx, dy, ignore) {
    let width = sa[0].length; // 幅の最大値をいれる
    let height = sa.length;   // 高さの最大値をいれる

    // 幅・高さ分チェックする
    for(let i = 0; i < height; i++) { // 縦方向の走査
        for(let j = 0; j < width; j++) { // 横方向の走査
            if(sa[sy + i][sx + j] === ignore) continue; // コピーしない値ならコピーしない
            da[dy + i][dx + j] = sa[sy + i][sx + j];    // コピーする値ならコピーする
        }
    }
}

/** ブロックを設置できるか判定<br>
 * blockType: ブロックの種類<br>
 * status:    ブロックの状態<br>
 * x:         ブロックのx座標<br>
 * y:         ブロックのy座標<br>
 * return:    設置できるかどうか
 */
function setBlockCheck(blockType, status, x, y) {
    // 一時停止中なら動かさない
    if(playingState) return false;

    // ブロックデータ格納用
    const block = blocks[blockType][status];

    // ブロックの大きさを取得
    let w = block[0].length; // 幅の最大値をいれる
    let h = block.length;    // 高さの最大値をいれる

    // 幅・高さ分チェックする
    for(let i = y; i < y + h; i++) { // 縦方向の走査
        for(let j = x; j < x + w; j++) { // 横方向の走査
            if(block[i-y][j-x] === cell.none) continue;    // 空白なら確認しない
            if(fieldRAM[i][j] !== cell.none) return false; // フィールドにブロックがあるなら設置できない
        }
    }

    // 設置できるならtrueを返す
    return true;
}

// viewRAMを描画 (viewRAM → html)
function draw() {
    // 出力場所の要素を取得
    let d = document.getElementById("tetriminoDraw");

    // tetriminoDrawへ書き込むhtmlを格納する変数
    let s = "";

    /* viewRAMをhtmlに変換
     * 1. viewRAMを走査
     * 2. cellの値によってclassを変更
     * 3. htmlに書き込む
     *
     * 出力時のhtmlの構造
     * <div class="caseの結果"></div>
     */
    // 幅・高さ分チェックする
    for(let i = 0; i < fieldHeight; i++) { // 縦方向の走査
        for(let j = 0; j < fieldWidth; j++) { // 横方向の走査
            s += "<div class='cell ";                 // 出力するhtmlの構造の先頭を書き込む
            switch(viewRAM[i][j]) {                   // cellの値によって書き込むclassを変更
                case cell.wall1: s += "wall1"; break; // 壁1
                case cell.wall2: s += "wall2"; break; // 壁2
                case cell.wall3: s += "wall3"; break; // 壁3
                case cell.I: s += "I"; break;         // テトリミノI
                case cell.O: s += "O"; break;         // テトリミノO
                case cell.S: s += "S"; break;         // テトリミノS
                case cell.Z: s += "Z"; break;         // テトリミノZ
                case cell.J: s += "J"; break;         // テトリミノJ
                case cell.L: s += "L"; break;         // テトリミノL
                case cell.T: s += "T"; break;         // テトリミノT
                case cell.none: break;                // 空白
            }
            s += "'></div>"; // 出力するhtmlの構造の末尾を書き込む
        }
    }

    // 要素に書き込み
    d.innerHTML = s;
}

/** フレームの最後にデータを移す<br>fieldRAM→viewRAM<br>新規生成したブロックデータ→fieldRAM */
function graph() {
    copy(fieldRAM, viewRAM, 0, 0, 0, 0, -1, 0); // viewRAM に fieldRAM をコピー
    copy(blocks[block.type][block.status], viewRAM, 0, 0, block.x, block.y, 0); // viewRAM にブロックをコピー
    draw(); // viewRAM を html に書き込む
}

/** 下に動かせるか判定 */
function blockMove() {
    // 下に動かせるか？ このとき y 座標を +1 して判定 +1の理由は下にブロックがあるかどうかを判定するため
    if(setBlockCheck(block.type, block.status, block.x, block.y + 1)) {
        block.y++; // 動かせるなら動かす
    }
    // 動かせないなら次のブロックへ
    else {
        blockGenerate(); // ブロックを生成
    }
}

/** 埋まった列を受け取りそれより上のブロックをひとつ下に下げる */
function deleteLine(y) {
    // 消去回数をカウント
    deleteLinesCount++;

    // 消去した行を空白にする
    for(let i = y; i > 0; i--) { // 消去した行から上の行を下にずらす
        for(let j = 1; j < fieldWidth - 1; j++) { // 左右の壁を除く
            fieldRAM[i][j] = fieldRAM[i-1][j]; // 上の行を下にずらす
        }
    }
}

/** ブロックを生成する */
function blockGenerate() {
    // ブロックを格納する変数
    currentBlock = nextBlock;                       // 前回生成した "次のブロック" を現在のブロックに格納
    nextBlock = Math.floor(Math.random() * (7)); // 次のブロックをランダムに生成

    // 設置音の再生
    soundSet.currentTime = 0; // 再生位置を0に戻す
    soundSet.play().then(r => r).catch(e => e); // エラーを無視して再生

    // fieldに固定
    copy(
        blocks[block.type][block.status], // ブロックデータを読み込む
        fieldRAM,                         // フィールドデータを読み込む
        0, 0,                     // ブロックデータの読み込み開始位置
        block.x, block.y,                 // フィールドデータの書き込み開始位置
        0                         // 空白を無視
    ); // ブロックデータを書き込む

    // 消せる行があるか調べる
    for(let i = 0; i < fieldHeight; i++){ // 縦方向の走査
        let cnt = 0; // 横方向の走査で何個埋まっているかをカウントする変数
        for(let j = 0; j < fieldWidth; j++){ // 横方向の走査
            cnt++; // 埋まっていたらカウントを増やす
            if(fieldRAM[i][j] === cell.none) break; // 空白があったらカウントをリセット
        }
        // 1行埋まっていたら
        if(cnt === fieldWidth) {
            deleteLine(i);       // その行を消す
            lines++;             // 消したライン数を加算
            score += 40 * level; // スコアを加算
        }
    }

    // ゲームオーバー判定
    for(let i = 1; i < fieldWidth - 1; i++) {
        if(fieldRAM[0][i] !== cell.none) {
            // 一度実行したら実行しない
            if(gameOver) return;

            // ゲームオーバー画面を表示
            gameOverViewer();
        }
    }

    // 削除カウントによって音を変える
    // 1~3行消したら
    if(deleteLinesCount > 0 && deleteLinesCount < 4) {
        // 通常の消す音を再生
        soundDelete.currentTime = 0;                         // 再生位置を0に戻す
        soundDelete.play().then(r => r).catch(e => e); // エラーを無視して再生
        deleteLinesCount = 0;                                // 再生したらカウントをリセット
    }
    // 4行消したら
    else if(deleteLinesCount === 4) {
        // 4ライン消しの音を再生
        soundDelete4Line.currentTime = 0;                         // 再生位置を0に戻す
        soundDelete4Line.play().then(r => r).catch(e => e); // エラーを無視
        deleteLinesCount = 0;                                     // 再生したらカウントをリセット

        // スコアを加算
        score += 200 * level;
    }

    // 次のブロックを登録
    block.type = currentBlock; // 現在のブロックを格納
    block.x = 4;               // ブロックのx座標を初期化
    block.y = 0;               // ブロックのy座標を初期化
    block.status = 0;          // ブロックの状態を初期化

    // 次のブロックを表示
    nextBlockViewer();
}

/** 次のブロックを表示する<br>表示にはブロックの生成時にランダム生成した値を用いる */
function nextBlockViewer() {
    // 出力場所の要素を取得
    let d = document.getElementById("nextBlockViewer");

    // nextBlockViewerへ書き込むhtmlを格納する変数
    let s = "";

    // 次出るブロックを描画
    s = "<img src='";                                       // 出力するhtmlの構造の先頭を書き込む
    switch(nextBlock) {                                     // ブロックの種類によって画像を変更
        case 0: s += "img/png/tetris_BoxI.png"; break;      // テトリミノI
        case 1: s += "img/png/tetris_BoxO.png"; break;      // テトリミノO
        case 2: s += "img/png/tetris_BoxS.png"; break;      // テトリミノS
        case 3: s += "img/png/tetris_BoxZ.png"; break;      // テトリミノZ
        case 4: s += "img/png/tetris_BoxJ.png"; break;      // テトリミノJ
        case 5: s += "img/png/tetris_BoxL.png"; break;      // テトリミノL
        case 6: s += "img/png/tetris_BoxT.png"; break;      // テトリミノT
    }
    s += "' id='nextBlockViewerImg' class='tetriminoNext "; // idと基礎クラスを書き込む
    switch(nextBlock) {                                     // ブロックの種類によってclassを変更
        case 0: s += "previewI"; break;                     // テトリミノI
        case 1: s += "previewO"; break;                     // テトリミノO
        case 2: s += "previewS"; break;                     // テトリミノS
        case 3: s += "previewZ"; break;                     // テトリミノZ
        case 4: s += "previewJ"; break;                     // テトリミノJ
        case 5: s += "previewL"; break;                     // テトリミノL
        case 6: s += "previewT"; break;                     // テトリミノT
    }
    s += "'>";                                              // タグの末尾を書き込む

    // 要素に書き込み
    d.innerHTML = s;
}

/** メインループ<br>
 * 1秒経過するごとに実行 (1000ms = 1s)
 */
function loop() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(gameOver) return; // ゲームオーバーなら動かさない
    if(!playingState) {  // 開始前・一時停止中でないなら動かす
        // ブロックを動かす
        blockMove();

        document.getElementById("score").textContent = score; // スコアを表示
        document.getElementById("level").textContent = level; // レベルを表示
        document.getElementById("lines").textContent = lines; // 消したライン数を表示
        //document.getElementById("combo").textContent = combo; // 未実装

        // レベルアップ判定
        if(level < 10) if(score / 2000 > level) {
            level++; // レベルアップ

            // レベルアップ音の再生（通常削除音が鳴ったらそれが終わり次第再生）
            soundDelete.addEventListener('ended', () => {
                soundLevelUp.currentTime = 0;                         // 再生位置を0に戻す
                soundLevelUp.play().then(r => r).catch(e => e); // エラーを無視
            });
            // レベルアップ音の再生（4ライン削除音が鳴ったらそれが終わり次第再生）
            soundDelete4Line.addEventListener('ended', () => {
                soundLevelUp.currentTime = 0;                         // 再生位置を0に戻す
                soundLevelUp.play().then(r => r).catch(e => e); // エラーを無視
            });
        }
    }

    // 1秒経過するごとに実行
    setTimeout(loop, 1000 - ((level - 1) * 30)); // 1000ms - ((レベル - 1) * 30ms)
}

// ゲームオーバー時の処理
function gameOverViewer() {
    // BGMを止める
    soundGameOver.currentTime = 0; // 再生位置を0に戻す
    soundBGM.pause();              // BGMを一時停止

    // ゲームオーバー音の再生
    soundGameOver.currentTime = 0;                         // 再生位置を0に戻す
    soundGameOver.play().then(r => r).catch(e => e); // エラーを無視

    // ゲームオーバー音が終わったら
    soundGameOver.addEventListener('ended', () => {
        // ハイスコア音の最初の音を再生
        soundHighScoreStart.currentTime = 0;                         // 再生位置を0に戻す
        soundHighScoreStart.play().then(r => r).catch(e => e); // エラーを無視

        // ハイスコア音が終わったら
        soundHighScoreStart.addEventListener('ended', () => {
            // ハイスコア音のループ音の再生
            soundHighScoreLoop.currentTime = 0;                         // 再生位置を0に戻す
            soundHighScoreLoop.play().then(r => r).catch(e => e); // エラーを無視
        });
    });

    // ゲームオーバーになったのでtrueにする
    gameOver = true;

    // ゲームオーバー画面を表示
    document.getElementById("playingState").textContent = "ゲームオーバー";       // ゲームオーバーをゲームの状態に表示
    alert("ゲームオーバー\nスコア: " + score + "\nレベル: " + level + "\nライン: " + lines); // アラートを表示 実質リザルト画面

    // ゲームオーバーになったらシェアボタンを表示 - https://style.potepan.com/articles/21691.html#onclick-2
    // Twitter
    document.getElementById("shareTwitter").innerHTML = "<a class='twitter-share-button' href='' " +
        "onclick='shareToTwitter()' target='_blank' rel='nofollow noopener noreferrer'>" +
        "<img src='img/webp/twitter_tweet.webp' width='80' height='20' alt='Tweet Button'></a>";
    // Misskey
    document.getElementById("shareMisskey").innerHTML = "<a href='' onclick='shareToFediverse()' " +
        "target='_blank' rel='nofollow noopener noreferrer'><img src='img/webp/misskey_note.webp' width='80' height='20' alt='Note Button'></a>";
}

const uri1 = "テトリスもどきで%20";
const uri2 = "%20ライン消して%20";
const uri3 = "%20点獲得しました！";

/** Twitter Share ボタンを押したときの処理 */
// 資料1: https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/overview
// 資料2: https://developer.twitter.com/en/docs/twitter-for-websites/tweet-button/guides/web-intent
// 資料3: https://hirashimatakumi.com/blog/1384.html
function shareToTwitter() {
    // テキストの生成
    const text = uri1 + lines + uri2 + score + uri3 + "%0A&hashtags=テトリスもどき,WebTetris&related=waya0125";

    // 外部ウィンドウを開く
    // 書き出し形式 https://twitter.com/intent/tweet?text=メッセージ&hashtags=ハッシュタグ&related=関連アカウント
    window.open(
        "https://twitter.com/intent/tweet?text=" + text, // URL + テキスト
        '',                                           // ウィンドウ名
        'width=800, height=600'                     // ウィンドウサイズ
    );
}
/** MisskeyShare - https://misskeyshare.link/introduce.html */
function shareToFediverse() {
    // テキストの生成
    const text = uri1 + lines + uri2 + score + uri3;

    // 外部ウィンドウを開く
    // 書き出し形式 https://misskeyshare.link/share.html?text=メッセージ&url=URL
    window.open(
        "https://misskeyshare.link/share.html?text=" + text + // URL + テキスト
        "&url=" + 'https://waya0125.github.io/WebTetris/',        // このサイトのURL
        '',                                               // ウィンドウ名
        'width=500, height=600'                         // ウィンドウサイズ
    );
}

/* 音声ファイルの読み込み
 * 音声操作に関する資料 - https://www.webdesignleaves.com/pr/jquery/javascript-audio.html
 *                      - https://blog.katsubemakito.net/html5/audio1
 *
 * 自動再生時ブラウザがブロックするため、ボタンを押したときに実行する
 * https://developer.mozilla.org/ja/docs/Web/Media/Autoplay_guide
 *
 * 開発環境ではなく実環境で用いる場合、"../../~"とすると404エラーが発生するため必要ない。
 *
 * サウンドを連続再生したときに音が重ならず単独で再生されてしまうので
 * これを回避するため再生前にcurrentTimeを0にする
 * https://blog.myntinc.com/2019/05/javascriptaudioplay.html
 *
 * BGM by https://www.youtube.com/playlist?list=PLKkxnBwFOJGIu3XSOHYW4r9dFyaoC9zNW
 * SE by https://www.youtube.com/watch?v=NhNQ4KQvUCw
 */
// MainBGM
let soundBGM = new Audio(); // オーディオオブジェクトを生成
soundBGM.src = 'audio/tetris_TypeA.ogg';         // サウンドファイルのパスを指定
soundBGM.loop = true;                            // ループ再生を有効にする
soundBGM.volume = 0.1;                           // 音量を設定
// 回転音
let soundRotate = new Audio(); // オーディオオブジェクトを生成
soundRotate.src = 'audio/tetris_Rotate.ogg';        // サウンドファイルのパスを指定
soundRotate.volume = 0.3;                           // 音量を設定
// ゲームオーバー
let soundGameOver = new Audio(); // オーディオオブジェクトを生成
soundGameOver.src = 'audio/tetris_GameOver.ogg';      // サウンドファイルのパスを指定
soundGameOver.volume = 0.3;                           // 音量を設定
// 通常削除音
let soundDelete = new Audio(); // オーディオオブジェクトを生成
soundDelete.src = 'audio/tetris_Delete.ogg';        // サウンドファイルのパスを指定
soundDelete.volume = 0.3;                           // 音量を設定
// 4本削除音
let soundDelete4Line = new Audio(); // オーディオオブジェクトを生成
soundDelete4Line.src = 'audio/tetris_Delete4Line.ogg';   // サウンドファイルのパスを指定
soundDelete4Line.volume = 0.3;                           // 音量を設定
// 設置音
let soundSet = new Audio(); // オーディオオブジェクトを生成
soundSet.src = 'audio/tetris_Set.ogg';           // サウンドファイルのパスを指定
soundSet.volume = 0.3;                           // 音量を設定
// 一時停止音
let soundPause = new Audio(); // オーディオオブジェクトを生成
soundPause.src = 'audio/tetris_Pause.ogg';         // サウンドファイルのパスを指定
soundPause.volume = 0.1;                           // 音量を設定
// 一時停止音
let soundLevelUp = new Audio(); // オーディオオブジェクトを生成
soundLevelUp.src = 'audio/tetris_LevelUp.ogg';       // サウンドファイルのパスを指定
soundLevelUp.volume = 1.0;                           // 音量を設定
// ハイスコア（未実装だけどゲームオーバー後に流しておく）
let soundHighScoreStart = new Audio();   // オーディオオブジェクトを生成
soundHighScoreStart.src = 'audio/tetris_HighScore_Start.ogg'; // サウンドファイルのパスを指定
soundHighScoreStart.volume = 0.3;                             // 音量を設定
let soundHighScoreLoop = new Audio();    // オーディオオブジェクトを生成
soundHighScoreLoop.src = 'audio/tetris_HighScore_Loop.ogg';   // サウンドファイルのパスを指定
soundHighScoreLoop.loop = true;                               // ループ再生を有効にする
soundHighScoreLoop.volume = 0.3;                              // 音量を設定

// ボタンクリックイベント
/* 一時停止ボタン
 * playingStateがtrueなら一時停止する
 * playingStateがfalseなら再生する
 * playingStateの初期値はfalse
 * Powered by http://javascript123.seesaa.net/article/108875442.html
 */
document.getElementById("playing").addEventListener("click", function() {
    // trueとfalseの切り替え (否定演算子を使用)
    playingState = !playingState;

    // 一時停止中・開始前かつゲームオーバーではないなら
    if(playingState && !gameOver) {
        soundPause.currentTime = 0;                         // 再生位置を0に戻す
        soundPause.play().then(r => r).catch(e => e); // エラーを無視して再生
        soundBGM.pause();                                   // BGMを一時停止
    }
    // 非一時停止・開始後かつゲームオーバーではないなら
    else if (!playingState && !gameOver) {
        soundBGM.play().then(r => r).catch(e => e); // エラーを無視して再生
    }
    // ゲームオーバーなら
    else if (gameOver) {
        location.reload(); // ページをリロード
    }

    // playingStateにゲームの状態を表示（書き換え）
    document.getElementById("playingState").textContent = playingState ? "一時停止" : "再生";
});
// 右回転ボタン 1回転ごとにstatusを引いていく
document.getElementById("rotate").addEventListener("click", function() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(playingState || gameOver) return;

    block.status++;                                      // status（回転）を1増やす
    soundRotate.currentTime = 0;                         // 再生位置を0に戻す
    soundRotate.play().then(r => r).catch(e => e); // エラーを無視して再生

    if(block.status > blockStatus[block.type]) block.status = 0; // statusが最大値を超えたら0に戻す

    // ブロック設置判定を行い、設置できないなら
    if(!setBlockCheck(block.type, block.status, block.x, block.y)){
        block.status--; // status（回転）を1減らして総裁する
        if(block.status < 0) block.status = blockStatus[block.type]; // statusが0を下回ったら最大値に戻す
    }
});
// 左移動ボタン 左に動かせるなら動かす
document.getElementById("left").addEventListener("click", function() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(playingState || gameOver) return;

    // ブロック設置判定を行い、設置できるなら
    if(setBlockCheck(block.type, block.status, block.x - 1, block.y)) block.x--; // 左に動かす
});
// 上移動ボタン 一気に下に設置
document.getElementById("up").addEventListener("click", function() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(playingState || gameOver) return;

    // ブロック設置判定を行い、下に動かせるなら設置可能な最下層まで動かす
    while(setBlockCheck(block.type, block.status, block.x, block.y + 1)) block.y++; // 下に動かす

    // 動かした後にブロックを生成
    blockGenerate();

    // スコアを加算
    score += 5 * level;
});
// 右移動ボタン 右に動かせるなら動かす
document.getElementById("right").addEventListener("click", function() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(playingState || gameOver) return;

    // ブロック設置判定を行い、設置できるなら
    if(setBlockCheck(block.type, block.status, block.x + 1, block.y)) block.x++; // 右に動かす
});
// 下移動ボタン 下に動かせるなら動かす
document.getElementById("down").addEventListener("click", function() {
    // 一時停止中・開始前・ゲームオーバーなら動かさない
    if(playingState || gameOver) return;

    // 下に動かす
    blockMove();
});

/* キーボードイベント
 * 旧式のキーコードでは非推奨になっていたためこれをcodeで置き換えた
 * https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/code
 * https://developer.mozilla.org/ja/docs/Web/API/Document/keyup_event
 * https://developer.mozilla.org/ja/docs/Web/API/Document/keydown_event
 */
// キーを押したときに実行
window.addEventListener(
    "keydown",
    (event) => {
        if (event.defaultPrevented) return; // イベントがすでに処理されている場合は何もしない

        // キーに応じて処理を分ける
        switch (event.code) {
            // 一時停止
            case "Escape":
                // trueとfalseの切り替え (否定演算子を使用)
                playingState = !playingState;

                // 一時停止中・開始前かつゲームオーバーではないなら
                if(playingState && !gameOver) {
                    soundPause.currentTime = 0;                         // 再生位置を0に戻す
                    soundPause.play().then(r => r).catch(e => e); // エラーを無視して再生
                    soundBGM.pause();                                   // BGMを一時停止
                }
                // 非一時停止・開始後かつゲームオーバーではないなら
                else if (!playingState && !gameOver) {
                    soundBGM.play().then(r => r).catch(e => e); // エラーを無視して再生
                }
                // ゲームオーバーなら
                else if (gameOver) {
                    location.reload(); // ページをリロード
                }

                // playingStateにゲームの状態を表示（書き換え）
                document.getElementById("playingState").textContent = playingState ? "一時停止" : "再生";
                break;
            // ハードドロップ
            case "Space":
            case "KeyW":
                // 一時停止中・開始前・ゲームオーバーなら動かさない
                if(playingState || gameOver) return;

                // ブロック設置判定を行い、設置できるなら設置可能な最下層まで動かす
                while(setBlockCheck(block.type, block.status, block.x, block.y + 1)) block.y++; // 下に動かす

                // 動かした後にブロックを生成
                blockGenerate();

                // スコアを加算
                score += 5 * level;
                break;
            // ソフトドロップ
            case "KeyS":
            case "ArrowDown":
                // 一時停止中・開始前・ゲームオーバーなら動かさない
                if(playingState || gameOver) return;

                // 下に1マス動かす
                blockMove();
                break;
            // 左移動
            case "KeyA":
            case "ArrowLeft":
                // ブロック設置判定を行い、設置できるなら
                if(setBlockCheck(block.type, block.status, block.x - 1, block.y)) block.x--; // 左に動かす
                break;
            // 右移動
            case "KeyD":
            case "ArrowRight":
                // ブロック設置判定を行い、設置できるなら
                if(setBlockCheck(block.type, block.status, block.x + 1, block.y)) block.x++; // 右に動かす
                break;
            // 左回転
            case "KeyQ":
            case "KeyZ":
                // 一時停止中・開始前・ゲームオーバーもしくは回転ボタンを押した状態なら動かさない
                if(playingState || gameOver || !rotateKey) return;

                // 回転音の再生
                soundRotate.currentTime = 0;                         // 再生位置を0に戻す
                soundRotate.play().then(r => r).catch(e => e); // エラーを無視

                // 左に回転できるなら回転する
                block.status--; // status（回転）を1減らす

                // statusが-1になったらstatusを戻す
                if(block.status < 0) block.status = blockStatus[block.type];

                // 回転できないなら
                if(!setBlockCheck(block.type, block.status, block.x, block.y)) {
                    // status（回転）を1増やして総裁する
                    block.status++;

                    // statusが最大値を超えたらstatusを0に戻す
                    if(block.status > blockStatus[block.type]) block.status = 0;
                }
                break;
            // 右回転
            case "KeyE":
            case "ArrowUp":
                // 一時停止中・開始前・ゲームオーバーもしくは回転ボタンを押した状態なら動かさない
                if(playingState || gameOver || !rotateKey) return;

                // 右に回転させる
                rotateKey = !rotateKey;

                // 回転音の再生
                soundRotate.currentTime = 0;                         // 再生位置を0に戻す
                soundRotate.play().then(r => r).catch(e => e); // エラーを無視

                // 右に回転できるなら回転する
                block.status++; // status（回転）を1増やす

                // statusが最大値を超えたらstatusを0に戻す
                if(block.status > blockStatus[block.type]) block.status = 0;

                // 回転できないなら
                if(!setBlockCheck(block.type, block.status, block.x, block.y)){
                    // status（回転）を1減らして総裁する
                    block.status--;

                    // statusが-1になったらstatusを戻す
                    if(block.status < 0) block.status = blockStatus[block.type];
                }
        }
    },
    true, // キャプチャー
);

// キーを離したときに実行
document.addEventListener(
    "keyup",
    (event) => {
        if (event.defaultPrevented) return; // イベントがすでに処理されている場合は何もしない

        // キーに応じて処理を分ける
        switch (event.code) {
            // いずれかの回転ボタンが押されていない場合は
            case "KeyE":
            case "ArrowUp":
            case "KeyQ":
            case "KeyZ":
                // 回転ボタンを押せるようにする
                rotateKey = true;
                break;
        }
});

setInterval(graph, fps); // フレームの最後に実行
loop();                  // メインループを実行
