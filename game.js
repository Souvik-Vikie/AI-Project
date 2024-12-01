const gridElement = document.getElementById('grid');
let grid = [
    ['.', '.', 'B', '.', '.', 'W', '.', '.', '.'],
    ['.', 'W', '.', 'W', '.', '.', '.', 'W', '.'],
    ['.', '.', '.', '.', '.', 'W', '.', '.', '.'],
    ['.', 'W', '.', '.', '.', '.', '.', 'W', '.'],
    ['.', '.', 'W', '.', '.', '.', '.', '.', '.'],
    ['.', '.', 'M', '.', 'W', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', 'M', '.', '.', '.']
];

const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]
];

function is_valid_move(x, y) {
    return x >= 0 && x < grid.length && y >= 0 && y < grid[0].length && grid[x][y] !== 'W';
}

function manhatten_distance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function render_grid() {
    gridElement.innerHTML = '';
    for (let row of grid) {
        for (let cell of row) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            if (cell === 'W') cellElement.classList.add('cell-wall');
            else if (cell === 'B') cellElement.classList.add('cell-bunny');
            else if (cell === 'M') cellElement.classList.add('cell-monster');
            else cellElement.classList.add('cell-empty');
            gridElement.appendChild(cellElement);
        }
    }
}

function aStar(start, goal) {
    let openSet = [start];
    let cameFrom = new Map();
    let gScore = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(Infinity));
    gScore[start[0]][start[1]] = 0;
    
    let fScore = Array.from({ length: grid.length }, () => Array(grid[0].length).fill(Infinity));
    fScore[start[0]][start[1]] = manhatten_distance(...start, ...goal);

    while (openSet.length > 0) {
        openSet.sort((a, b) => fScore[a[0]][a[1]] - fScore[b[0]][b[1]]);
        const current = openSet.shift();
        
        if (current[0] === goal[0] && current[1] === goal[1]) {
            let path = [];
            let node = goal;
            while (node) {
                path.push(node);
                node = cameFrom.get(node.toString());
            }
            return path.reverse();
        }

        for (let [dx, dy] of directions) {
            const [nx, ny] = [current[0] + dx, current[1] + dy];
            if (is_valid_move(nx, ny)) {
                const tentative_gScore = gScore[current[0]][current[1]] + 1;
                
                if (tentative_gScore < gScore[nx][ny]) {
                    cameFrom.set([nx, ny].toString(), current);
                    gScore[nx][ny] = tentative_gScore;
                    fScore[nx][ny] = gScore[nx][ny] + manhatten_distance(nx, ny, goal[0], goal[1]);
                    
                    if (!openSet.some(pos => pos[0] === nx && pos[1] === ny)) {
                        openSet.push([nx, ny]);
                    }
                }
            }
        }
    }
    return null;
}

function rgame() {
    let bunnyPos = null;
    let monsterPositions = [];

    grid.forEach((row, i) => row.forEach((cell, j) => {
        if (cell === 'B') bunnyPos = [i, j];
        else if (cell === 'M') monsterPositions.push([i, j]);
    }));

    const performmove = (move) => {
        console.log(`Move ${move}:`);

        let minDangerPos = null;
        let minDanger = Infinity;

        for (let [dx, dy] of directions) {
            const [nx, ny] = [bunnyPos[0] + dx, bunnyPos[1] + dy];
            if (is_valid_move(nx, ny)) {
                const totalDanger = monsterPositions.reduce((sum, [mx, my]) => sum + manhatten_distance(nx, ny, mx, my), 0);
                if (totalDanger < minDanger) {
                    minDanger = totalDanger;
                    minDangerPos = [nx, ny];
                }
            }
        }

        if (minDangerPos) {
            const path = aStar(bunnyPos, minDangerPos);
            if (path && path.length > 1) {
                bunnyPos = path[1];
            }
        }

        grid[bunnyPos[0]][bunnyPos[1]] = 'B';

        monsterPositions = monsterPositions.map(([mx, my]) => {
            let bestMove = [mx, my];
            let minDist = manhatten_distance(mx, my, ...bunnyPos);

            for (let [dx, dy] of directions) {
                const [nx, ny] = [mx + dx, my + dy];
                if (is_valid_move(nx, ny)) {
                    const dist = manhatten_distance(nx, ny, ...bunnyPos);
                    if (dist < minDist) {
                        minDist = dist;
                        bestMove = [nx, ny];
                    }
                }
            }
            return bestMove;
        });

        if (monsterPositions.some(([mx, my]) => mx === bunnyPos[0] && my === bunnyPos[1])) {
            alert("Game Over! The bunny has been eaten by a monster.");
            return true; 
        }

        for (let i = 0; i < grid.length; i++)
            for (let j = 0; j < grid[0].length; j++)
                if (grid[i][j] === 'B' || grid[i][j] === 'M') grid[i][j] = '.';

        grid[bunnyPos[0]][bunnyPos[1]] = 'B';
        monsterPositions.forEach(([mx, my]) => grid[mx][my] = 'M');

        render_grid();

        return false;
    };

    const gameLoop = (move) => {
        if (move > 10) {
            console.log("Game Over! Max moves reached.");
            return;
        }

        const gameOver = performmove(move);
        if (gameOver) return;

        setTimeout(() => gameLoop(move + 1), 1000); 
    };

    gameLoop(1);
}

render_grid();
