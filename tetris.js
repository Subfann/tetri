const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
context.scale(20, 20);


var audio = new Audio('tetrissong.mp3');      // audio abspielen(funktioniert bei Microsoft Edge am besten)
audio.play();



function arenaClear() {                                 // volle punkte reihe leeren 
    let rowCount = 1;
    outer: for (let y = arena.length -1; y > 0; --y) {
        for (let x = 0; x < arena[y].length; ++x) {
            if (arena[y][x] === 0) {
                continue outer;
            }
        }
        const row = arena.splice(y, 1)[0].fill(0); //nimmt die volle reihe raus u füllt mit nichts
        arena.unshift(row);
        ++y;

        player.score += rowCount * 10;                      //Punktevergabe
        rowCount *= 2;
    }
}

function kollision(arena, player) {                           //Kollisionserkennung
    const m = player.matrix;            //matrix
    const o = player.pos;               //offset
    for (let y = 0; y < m.length; ++y) {
        for (let x = 0; x < m[y].length; ++x) {
            if (m[y][x] !== 0 &&
               (arena[y + o.y] &&
                arena[y + o.y][x + o.x]) !== 0) {
                return true;
            }
        }
    }
    return false;
}
function createMatrix(w, h) {                               //Matrix
    const matrix = [];
    while (h--) {
        matrix.push(new Array(w).fill(0));
    }
    return matrix;
}
function createSpielstein(type)                                  //Spielsteine
{
    if (type === 'I') {
        return [
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
            [0, 1, 0, 0],
        ];
    } else if (type === 'L') {
        return [
            [0, 2, 0],
            [0, 2, 0],
            [0, 2, 2],
        ];
    } else if (type === 'J') {
        return [
            [0, 3, 0],
            [0, 3, 0],
            [3, 3, 0],
        ];
    } else if (type === 'O') {
        return [
            [4, 4],
            [4, 4],
        ];
    } else if (type === 'Z') {
        return [
            [5, 5, 0],
            [0, 5, 5],
            [0, 0, 0],
        ];
    } else if (type === 'S') {
        return [
            [0, 6, 6],
            [6, 6, 0],
            [0, 0, 0],
        ];
    } else if (type === 'T') {
        return [
            [0, 7, 0],
            [7, 7, 7],
            [0, 0, 0],
        ];
    }
}
function zeichneMatrix(matrix, offset) {                   // darstellen spielsteine
    matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                context.fillStyle = colors[value];
                context.fillRect(x + offset.x,
                                 y + offset.y,
                                 1, 1);
            }
        });
    });
}
function zeichne() {                                           //Spielfeld darstellen
    context.fillStyle = '#000';
    context.fillRect(0, 0, canvas.width, canvas.height);
    zeichneMatrix(arena, {x: 0, y: 0});
    zeichneMatrix(player.matrix, player.pos);
}
function mischen(arena, player) {                             // SpielerWerte in Spielfeld Arena übertragen
    player.matrix.forEach((row, y) => {
        row.forEach((value, x) => {
            if (value !== 0) {
                arena[y + player.pos.y][x + player.pos.x] = value;
            }
        });
    });
}
function drehen(matrix, dir) {                                      // Rotation
    for (let y = 0; y < matrix.length; ++y) {
        for (let x = 0; x < y; ++x) {
            [
                matrix[x][y],
                matrix[y][x],
            ] = [
                matrix[y][x],
                matrix[x][y],
            ];
        }
    }
    if (dir > 0) {
        matrix.forEach(row => row.reverse());
    } else {
        matrix.reverse();
    }
}
function spielerDrop() {                 // Spielstein fallen
    player.pos.y++;
    if (kollision(arena, player)) {
        player.pos.y--;
        mischen(arena, player);
        spielerReset();                  //aufruf 
        arenaClear();
        updateScore();
    }
    dropCounter = 0;                    // wieder von vor beginnen mit Fall
}
function spielerBewege(offset) {           //Spielstein lin u recht nicht aus spielfeld
    player.pos.x += offset;
    if (kollision(arena, player)) {
        player.pos.x -= offset;
    }
}
function spielerReset() {                // Alle Spielsteine auflisten
    const spielsteine = 'TJLOSZI';
    player.matrix = createSpielstein(spielsteine[spielsteine.length * Math.random() | 0]);     //Zufallsgenerien
    player.pos.y = 0;
    player.pos.x = (arena[0].length / 2 | 0) -
                   (player.matrix[0].length / 2 | 0);
    if (kollision(arena, player)) {
        arena.forEach(row => row.fill(0));      //Wenn verloren alles neu aufsetzen
        player.score = 0;                       // und score resetten
        updateScore();
    }
}

function spielerRotiere(dir) {                                               //Spielstein drehen
    const pos = player.pos.x;
    let offset = 1;
    drehen(player.matrix, dir);
    while (kollision(arena, player)) {
        player.pos.x += offset;
        offset = -(offset + (offset > 0 ? 1 : -1));
        if (offset > player.matrix[0].length) {
            drehen(player.matrix, -dir);
            player.pos.x = pos;
            return;
        }
    }
}
let dropCounter = 0;
let dropInterval = 1000;            //jede sekunde eins nachen unten
let lastTime = 0;
function update(time = 0) {         //  zeichnet die ganze zeit mit draw
    const deltaTime = time - lastTime;
    dropCounter += deltaTime;
    if (dropCounter > dropInterval) {
        spielerDrop();
    }
    lastTime = time;
    zeichne();
    requestAnimationFrame(update);
}

function updateScore() {                                                //Score updaten
    document.getElementById('score').innerText = player.score;
}

document.addEventListener('keydown', event => {                         // Tastenreaktion
    if (event.keyCode === 37) {         //links
        spielerBewege(-1);
    } else if (event.keyCode === 39) {  //rechts
        spielerBewege(1);
    } else if (event.keyCode === 40) {  // unten
        spielerDrop();
    } else if (event.keyCode === 89) {   //y
        spielerRotiere(-1);
    } else if (event.keyCode === 88) {  // x   drehen
        spielerRotiere(1);
    }
});
const colors = [                                        //Farben Spielsteine
    null,
    '#FF0D72',
    '#0DC2FF',
    '#0DFF72',
    '#F538FF',
    '#FF8E0D',
    '#FFE138',
    '#3877FF',
];
const arena = createMatrix(12, 20);        
const player = {                        // Spielstein
    pos: {x: 0, y: 0},
    matrix: null,
    score: 0,
};

spielerReset();                          // Spielablauf
updateScore();
update();