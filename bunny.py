
grid = [
    ['.', '.', '.', '.', '.', 'W', '.', '.', '.'],
    ['.', 'W', '.', 'W', '.', '.', '.', 'W', '.'],
    ['.', '.', '.', '.', '.', 'W', '.', '.', '.'],
    ['.', 'W', 'B', '.', '.', '.', '.', 'W', '.'],
    ['.', '.', 'W', '.', '.', '.', '.', '.', '.'],
    ['.', '.', 'M', '.', 'W', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', 'M', '.', '.', '.']
]



directions = [(-1, 0), (1, 0), (0, -1), (0, 1)]


def is_valid_move(x, y, grid):
    return 0 <= x < len(grid) and 0 <= y < len(grid[0]) and grid[x][y] != 'W'

def manhattan_distance(x1, y1, x2, y2):
    return abs(x1 - x2) + abs(y1 - y2)

def print_grid(grid):
    for row in grid:
        print(' '.join(row))
    print()


bunny_position = None
monster_positions = []

for i in range(len(grid)):
    for j in range(len(grid[0])):
        if grid[i][j] == 'B':
            bunny_position = (i, j)
        elif grid[i][j] == 'M':
            monster_positions.append((i, j))


moves = 10  
for move in range(1, moves + 1):
    print(f"Move {move}:")

    
    safe_moves = []
    for d in directions:
        new_x = bunny_position[0] + d[0]
        new_y = bunny_position[1] + d[1]
        if is_valid_move(new_x, new_y, grid):
            
            danger_level = sum(manhattan_distance(new_x, new_y, mx, my) for mx, my in monster_positions)
            safe_moves.append(((new_x, new_y), danger_level))

   
    if safe_moves:
        bunny_position = max(safe_moves, key=lambda x: x[1])[0]

    
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == 'B':
                grid[i][j] = '.'
    grid[bunny_position[0]][bunny_position[1]] = 'B'

    
    print("After Bunny Moves:")
    print_grid(grid)

    
    if bunny_position in monster_positions:
        print("Game Over. The bunny has been eaten by a monster.")
        break

    
    new_monster_positions = []
    for monster in monster_positions:
        
        min_distance = float('inf')
        best_move = monster
        for d in directions:
            new_x = monster[0] + d[0]
            new_y = monster[1] + d[1]
            if is_valid_move(new_x, new_y, grid):
                distance = manhattan_distance(new_x, new_y, *bunny_position)
                if distance < min_distance:
                    min_distance = distance
                    best_move = (new_x, new_y)

        new_monster_positions.append(best_move)

    
    for i in range(len(grid)):
        for j in range(len(grid[0])):
            if grid[i][j] == 'M':
                grid[i][j] = '.'
    for pos in new_monster_positions:
        grid[pos[0]][pos[1]] = 'M'

    
    print("After Monsters Move:")
    print_grid(grid)

    
    if bunny_position in new_monster_positions:
        print("Game Over. The bunny has been eaten by a monster.")
        break

    monster_positions = new_monster_positions 


if bunny_position not in monster_positions:
    print("Final Grid State:")
    print_grid(grid)
