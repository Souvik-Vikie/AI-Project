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

function isValidMove(x, y) {
    return x >= 0 && x < grid.length && y >= 0 && y < grid[0].length && grid[x][y] !== 'W';
}

function manhattanDistance(x1, y1, x2, y2) {
    return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}

function renderGrid() {
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

function runGame() {
    let bunnyPos = null;
    let monsterPositions = [];

    grid.forEach((row, i) => row.forEach((cell, j) => {
        if (cell === 'B') bunnyPos = [i, j];
        else if (cell === 'M') monsterPositions.push([i, j]);
    }));

    // Astar Algorithm
    const astarpathfind = (move) => {
        console.log(`Move ${move}:`);
        
        const safeMoves = directions.map(([dx, dy]) => {
            const [nx, ny] = [bunnyPos[0] + dx, bunnyPos[1] + dy];
            if (isValidMove(nx, ny)) {
                const danger = monsterPositions.reduce((sum, [mx, my]) => sum + manhattanDistance(nx, ny, mx, my), 0);
                return { position: [nx, ny], danger };
            }
            return null;
        }).filter(Boolean);

        if (safeMoves.length > 0) {
            bunnyPos = safeMoves.sort((a, b) => b.danger - a.danger)[0].position;
        }

        grid[bunnyPos[0]][bunnyPos[1]] = 'B';

        monsterPositions = monsterPositions.map(([mx, my]) => {
            let bestMove = [mx, my];
            let minDist = manhattanDistance(mx, my, ...bunnyPos);

            for (let [dx, dy] of directions) {
                const [nx, ny] = [mx + dx, my + dy];
                if (isValidMove(nx, ny)) {
                    const dist = manhattanDistance(nx, ny, ...bunnyPos);
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

        renderGrid(); 

        return false; 
    };

    const gameLoop = (move) => {
        if (move > 10) {
            console.log("Game Over! Max moves reached.");
            return;
        }

        const gameOver = astarpathfind(move);
        if (gameOver) return; 

        setTimeout(() => gameLoop(move + 1), 1000); 
    };

    gameLoop(1);
}


renderGrid();
