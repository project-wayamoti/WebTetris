/*
 * Copyright (c) 2023 wayamoti2015@waya0125 All Rights Reserved.
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

function Block(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.status = 0;
}

const block = new Block(4, 0, Math.floor(Math.random() * (7)));
let fps = 1000 / 60;   // 60fps
let fieldWidth = 12;  // フィールドの幅
let fieldHeight = 18; // フィールドの高さ
let playingState = false; // 再生を止めるか否か

// ブロックの種類
let cell = {
    none : 0,
    wall1 : 1,
    wall2 : 2,
    wall3 : 3,
    I : 10,
    O : 11,
    S : 12,
    Z : 13,
    J : 14,
    L : 15,
    T : 16,
};
// カウンタ
let cnt = 0;

/** 描画用メモリ<br>
 * 20*18のフィールド
 */
const viewRAM = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1]
];

// ゲームを管理するためのフィールド
const fieldRAM = [
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
    [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3],
    [1, 2, 3, 1, 2, 3, 1, 2, 3, 1, 2, 1]
];

/** 各ブロックの状態の数<br>
 * ステータス-1で使用すること
 */
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
let copy = function(sa, da, sx, sy, dx, dy, ignore) {
    let width = sa[0].length;
    let height = sa.length;

    for(let i = 0; i < height; i++) {
        for(let j = 0; j < width; j++) {
            if(sa[sy + i][sx + j] === ignore) continue;
            da[dy + i][dx + j] = sa[sy + i][sx + j];
        }
    }
};

/** ブロックを設置できるか判定<br>
 * blockType: ブロックの種類<br>
 * status:    ブロックの状態<br>
 * x:         ブロックのx座標<br>
 * y:         ブロックのy座標<br>
 * return:    設置できるかどうか
 */
let setBlockCheck = function(blockType, status, x, y) {
    // 確認用
    console.log("blockType: " + blockType);
    console.log("status: " + status);

    // ブロックデータ格納用
    const block = blocks[blockType][status];

    // ブロックの大きさを取得
    let w = block[0].length;
    let h = block.length;

    // ブロックがフィールドからはみ出していないか確認
    for(let i = y; i < y + h; i++) {
        for(let j = x; j < x + w; j++) {
            if(block[i-y][j-x] === cell.none) continue;
            if(fieldRAM[i][j] !== cell.none) return false;
        }
    }
    return true;
};

// viewRAMを描画 (viewRAM → html)
let draw = function() {
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
    for(let i = 0; i < fieldHeight; i++) {
        for(let j = 0; j < fieldWidth; j++) {
            s += "<div class='cell ";
            switch(viewRAM[i][j]) {
                case cell.wall1: s += "wall1"; break;
                case cell.wall2: s += "wall2"; break;
                case cell.wall3: s += "wall3"; break;
                case cell.I: s += "I"; break;
                case cell.O: s += "O"; break;
                case cell.S: s += "S"; break;
                case cell.Z: s += "Z"; break;
                case cell.J: s += "J"; break;
                case cell.L: s += "L"; break;
                case cell.T: s += "T"; break;
                case cell.none: break;
            }
            s += "'></div>";
        }
    }

    // 要素に書き込み
    d.innerHTML = s;
};

// フレームの最後 viewRAM に fieldRAM をコピー
let graph = function() {
    copy(fieldRAM, viewRAM, 0, 0, 0, 0, -1, 0); // viewRAM に fieldRAM をコピー
    copy(blocks[block.type][block.status], viewRAM, 0, 0, block.x, block.y, 0); // viewRAM にブロックをコピー
    draw();
};

// 下に動かせるか判定
let blockMove = function() {
    if(playingState) return; // 一時停止中なら動かさない
    // 下に動かせるか？ このとき y 座標を +1 して判定
    if(setBlockCheck(block.type, block.status, block.x, block.y + 1)) {
        block.y++; // 動かせるなら動かす
    }
    else {
        blockGenerate(); // 動かせないなら次のブロックへ
    }
};

// 行列が埋まったら埋まった行を消して消えた分ブロックを下げる
let deleteLine = function(y) {
    if(playingState) return; // 一時停止中なら動かさない

    // 消す音の再生
    soundDelete();

    for(let i = y; i > 0; i--) {
        for(let j = 1; j < fieldWidth - 1; j++) {
            fieldRAM[i][j] = fieldRAM[i-1][j];
        }
    }
};

// 動かせなくなったら次のブロックを登録
let blockGenerate = function() {
    // 設置音の再生
    soundSet();

    // fieldに固定
    copy(blocks[block.type][block.status], fieldRAM, 0, 0, block.x, block.y, 0);

    // 消せる行があるか調べる
    for(let i = 0; i < fieldHeight; i++){
        let cnt = 0;
        for(let j = 0; j < fieldWidth; j++){
            cnt++;
            if(fieldRAM[i][j] === cell.none) break;
        }
        if(cnt === fieldWidth) deleteLine(i);
    }

    // 次のブロックを登録
    block.type = Math.floor(Math.random() * (7));
    block.x = 4;
    block.y = 0;
    block.status = 0;

    document.getElementById("nextBlockViewer").textContent = block.type;

    // 次のブロックを表示
    nextBlockViewer();
};

let nextBlockViewer = function() {
    // 出力場所の要素を取得
    let d = document.getElementById("nextBlockViewer");

    // nextBlockViewerへ書き込むhtmlを格納する変数
    let s = "";

    // 次出るブロックを取得
    let nextBlock = block.type;

    // 次出るブロックを描画
    s = "<img src='";
    switch(nextBlock) {
        case 0: s += "img/png/tetris_BoxI.png"; break;
        case 1: s += "img/png/tetris_BoxO.png"; break;
        case 2: s += "img/png/tetris_BoxS.png"; break;
        case 3: s += "img/png/tetris_BoxZ.png"; break;
        case 4: s += "img/png/tetris_BoxJ.png"; break;
        case 5: s += "img/png/tetris_BoxL.png"; break;
        case 6: s += "img/png/tetris_BoxT.png"; break;
    }
    s += "' id='nextBlockViewerImg' class='tetriminoNext ";
    switch(nextBlock) {
        case 0: s += "BoxI"; break;
        case 1: s += "BoxO"; break;
        case 2: s += "BoxS"; break;
        case 3: s += "BoxZ"; break;
        case 4: s += "BoxJ"; break;
        case 5: s += "BoxL"; break;
        case 6: s += "BoxT"; break;
    }
    s += "'>";

    // 要素に書き込み
    d.innerHTML = s;
}

/**
 * メインループ
 * 1秒経過するごとに実行
 * 1000ms = 1s
 */
let loop = function() {
    console.log(cnt++);
    blockMove();
    setTimeout(loop, 1000);
};

let soundBGM = function() {
    let BGM = new Audio();
    BGM.src = '../../audio/tetris_PlayingBGM.ogg';
    BGM.loop = true;
    BGM.autoplay = true;
    BGM.volume = 0.1;
    BGM.play();
}

let soundGameOver = function() {
    let GameOver = new Audio();
    GameOver.src = '../../audio/tetris_GameOver.ogg';
    GameOver.volume = 0.1;
    GameOver.play();
}

let soundRotate = function() {
    let Rotate = new Audio();
    Rotate.src = '../../audio/tetris_Rotate.ogg';
    Rotate.volume = 0.1;
    Rotate.play();
}

let soundDelete = function() {
    let Delete = new Audio();
    Delete.src = '../../audio/tetris_Delete.ogg';
    Delete.volume = 0.1;
    Delete.play();
}

let soundSet = function() {
    let Set = new Audio();
    Set.src = '../../audio/tetris_Set.ogg';
    Set.volume = 0.1;
    Set.play();
}

// ボタンクリックイベント

/* 一時停止ボタン
 * 一時停止する
 * playingStateがtrueなら一時停止する
 * playingStateがfalseなら再生する
 * playingStateの初期値はfalse
 * Powered by http://javascript123.seesaa.net/article/108875442.html
 */
document.getElementById("playing").addEventListener("click", function() {
    // trueとfalseの切り替え (否定演算子を使用)
    playingState = !playingState;

    // ボタンのテキストを切り替え
    document.getElementById("playingState").textContent = playingState ? "再生" : "一時停止";
});

/* 回転ボタン
 * 1回転ごとにstatusを引いていく
 */
document.getElementById("rotate").addEventListener("click", function() {block.status++;
    soundRotate();
    if(block.status > blockStatus[block.type]) block.status = 0;
    if(!setBlockCheck(block.type, block.status, block.x, block.y)){
        block.status--;
        if(block.status < 0) block.status = blockStatus[block.type];
    }
});

/* 左移動ボタン
 * 左に動かせるなら動かす
 */
document.getElementById("left").addEventListener("click", function() {
    if(setBlockCheck(block.type, block.status, block.x - 1, block.y)) block.x--;
});

/* 上移動ボタン
 * 上に動かせるなら動かす
 */
document.getElementById("up").addEventListener("click", function() {
    while(setBlockCheck(block.type, block.status, block.x, block.y + 1)){
        block.y++;
    }
    blockGenerate();
});

/* 右移動ボタン
 * 右に動かせるなら動かす
 */
document.getElementById("right").addEventListener("click", function() {
    if(setBlockCheck(block.type, block.status, block.x + 1, block.y)) block.x++;
});

/* 下移動ボタン
 * 下に動かせるなら動かす
 */
document.getElementById("down").addEventListener("click", function() {
    blockMove();
});

let rotateKey = true;

/* キーボードイベント
 * キーを押したときに実行
 * 旧式のキーコードでは非推奨になっていたためこれをcodeで置き換えた
 * https://developer.mozilla.org/ja/docs/Web/API/KeyboardEvent/code
 *
 * 今回はキーを押したときに実行するのでkeydownを使用
 * https://developer.mozilla.org/ja/docs/Web/API/Document/keydown_event
 */
window.addEventListener(
    "keydown",
    (event) => {
        if (event.defaultPrevented) {
            return; // Do nothing if event already handled
        }

        console.log("keycode = " + event.code);

        switch (event.code) {
            case "KeyW":
            case "ArrowUp":
                while(setBlockCheck(block.type, block.status, block.x, block.y + 1)){  //  下まで動かす
                    block.y++;
                }
                blockGenerate();
                break;
            case "KeyA":
            case "ArrowLeft":
                if(setBlockCheck(block.type, block.status, block.x - 1, block.y)) block.x--; // 左に動かせるなら動かす
                break;
            case "KeyS":
            case "ArrowDown":
                blockMove();  // 下に動かせるなら動かす
                break;
            case "KeyD":
            case "ArrowRight":
                if(setBlockCheck(block.type, block.status, block.x + 1, block.y)) block.x++; // 右に動かせるなら動かす
                break;
            case "KeyQ":
                // 左に回転させる
                rotateKey = !rotateKey;
                soundRotate();
                // 左に回転できるなら回転する
                block.status--;
                if(block.status < 0) block.status = blockStatus[block.type];
                if(!setBlockCheck(block.type, block.status, block.x, block.y)) {
                    block.status++;
                    if(block.status > blockStatus[block.type]) block.status = 0;
                }
                break;
            case "KeyE":
                // 右に回転させる
                rotateKey = !rotateKey;
                soundRotate();
                // 右に回転できるなら回転する
                block.status++;
                if(block.status > blockStatus[block.type]) block.status = 0;
                if(!setBlockCheck(block.type, block.status, block.x, block.y)){
                    block.status--;
                    if(block.status < 0) block.status = blockStatus[block.type];
                }
        }
        console.log("block_status => " + block.status);
    },
    true,
);

/* Windowの読み込み完了時に実行
 * BGMを再生
 */
window.addEventListener("load",function() {
    soundBGM();
});

setInterval(graph, fps);
loop(); // メインループを実行
