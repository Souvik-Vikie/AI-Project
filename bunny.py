import heapq

DIRECTIONS = [(-1, 0), (1, 0), (0, -1), (0, 1)]

def manhattan_distance(a, b):
    return abs(a[0] - b[0]) + abs(a[1] - b[1])

def is_valid(x, y, grid): 
    return 0 <= x < len(grid) and 0 <= y < len(grid[0]) and grid[x][y] != 'W'

def find_escape_routes(position, grid):
    return sum(1 for dx, dy in DIRECTIONS if is_valid(position[0] + dx, position[1] + dy, grid))

def thief_heuristic(start, goal, grid, monster_positions):
    manhattan_to_goal = manhattan_distance(start, goal)
    monster_penalty = 0
    
    for monster in monster_positions:
        dist = manhattan_distance(start, monster)
        if dist == 0:
            monster_penalty += 1000 
        elif dist < 3:
            monster_penalty += (4 - dist) * 10 

    escape_routes = find_escape_routes(start, grid)
    return manhattan_to_goal + monster_penalty - escape_routes * 2 


def find_path(start, goal, grid, heuristic_func, monster_positions):
    open_list = [(0, start)]
    came_from = {start: None}
    g_score = {start: 0}
    
    while open_list:
        _, current = heapq.heappop(open_list)
        
        if current == goal:
            path = []
            while current:
                path.append(current)
                current = came_from[current]
            return path[::-1]
        
        for dx, dy in DIRECTIONS:
            neighbor = (current[0] + dx, current[1] + dy)
            if is_valid(neighbor[0], neighbor[1], grid):
                tentative_g = g_score[current] + 1
                if neighbor not in g_score or tentative_g < g_score[neighbor]:
                    came_from[neighbor] = current
                    g_score[neighbor] = tentative_g
                    f_score = tentative_g + heuristic_func(neighbor, goal, grid, monster_positions)
                    heapq.heappush(open_list, (f_score, neighbor))
    
    return None


class Grid:
    def __init__(self, layout):
        self.layout = layout

    def print(self):
        for row in self.layout:
            print(' '.join(row))
        print()

    def update_entity(self, old_pos, new_pos, symbol):
        if old_pos:
            self.layout[old_pos[0]][old_pos[1]] = '.'
        self.layout[new_pos[0]][new_pos[1]] = symbol

class Entity:
    def __init__(self, symbol, position):
        self.symbol = symbol
        self.position = position

    def move(self, new_position):
        self.position = new_position

class Game:
    def __init__(self, grid, bunny, monsters, moves=10):
        self.grid = grid
        self.bunny = bunny
        self.monsters = monsters
        self.moves = moves

    def get_safe_points(self):
        return [(x, y) for x in range(len(self.grid.layout)) for y in range(len(self.grid.layout[0]))
                if self.grid.layout[x][y] == '.' and all(
                    manhattan_distance((x, y), m.position) > 1 for m in self.monsters)]

    def find_safe_path(self, start, safe_points):
        best_path = None
        lowest_risk = float('inf')
        
        for sp in safe_points:
            path = find_path(start, sp, self.grid.layout, thief_heuristic, [m.position for m in self.monsters])
            if path:
                risk = sum(thief_heuristic(pos, sp, self.grid.layout, [m.position for m in self.monsters]) for pos in path)
                if risk < lowest_risk:
                    best_path = path
                    lowest_risk = risk
                    
        return best_path

    def move_bunny(self):
        safe_points = self.get_safe_points()
        if not safe_points:
            print("No safe points available. Game Over!")
            return False
        
        best_path = self.find_safe_path(self.bunny.position, safe_points)
        if not best_path:
            print("No path to any safe point. Game Over!")
            return False
        
        next_position = best_path[1]
        self.grid.update_entity(self.bunny.position, next_position, 'B')
        self.bunny.move(next_position)
        return True

    def move_monsters(self):
        for monster in self.monsters:
            best_move = min(
                [(monster.position[0] + dx, monster.position[1] + dy) for dx, dy in DIRECTIONS if is_valid(monster.position[0] + dx, monster.position[1] + dy, self.grid.layout)],
                key=lambda pos: manhattan_distance(pos, self.bunny.position),
                default=monster.position
            )
            self.grid.update_entity(monster.position, best_move, 'M')
            monster.move(best_move)

    def play(self):
        for move in range(1, self.moves + 1):
            print(f"Move {move}:")
            if not self.move_bunny():
                break
            print("After Bunny Moves:")
            self.grid.print()
            if self.bunny.position in [monster.position for monster in self.monsters]:
                print("Game Over! The bunny has been eaten by a monster.")
                break
            self.move_monsters()
            print("After Monsters Move:")
            self.grid.print()
            if self.bunny.position in [monster.position for monster in self.monsters]:
                print("Game Over! The bunny has been eaten by a monster.")
                break
        else:
            print("Final Grid State:")
            self.grid.print()
            print("The bunny survived!")

initial_grid = [
    ['.', '.', '.', '.', '.', 'W', '.', '.', '.'],
    ['.', 'W', '.', 'W', '.', '.', '.', 'W', '.'],
    ['.', '.', '.', '.', '.', 'W', '.', '.', '.'],
    ['.', 'W', 'B', '.', '.', '.', '.', 'W', '.'],
    ['.', '.', 'W', '.', '.', '.', '.', '.', '.'],
    ['.', '.', 'M', '.', 'W', '.', '.', '.', '.'],
    ['.', '.', '.', '.', '.', 'M', '.', '.', '.']
]

grid = Grid(initial_grid)
bunny_pos = (3, 2)
monster_positions = [(5, 2), (6, 5)]
bunny = Entity('B', bunny_pos)
monsters = [Entity('M', pos) for pos in monster_positions]
game = Game(grid, bunny, monsters)
game.play()
