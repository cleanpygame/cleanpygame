##file convey.py
"""start
Look at this 'Game of Life' implementation.
It's one giant function that does everything.
It's like reading a recipe where all the steps are mixed into a single sentence.
"""
##start-reply "I'll untangle this."
from collections import Counter

##add-on point
Point = tuple[int,int]

##end
##add-on will_be_alive
def will_live(alive_neighbors_count: int, is_alive: bool) -> bool:
    return alive_neighbors_count == 3 or (alive_neighbors_count == 2 and is_alive)

##end
##add-on iter
def neighbors(x: int, y: int) -> Iterator[Point]:
    for dx in (-1, 0, 1):
        for dy in (-1, 0, 1):
            if dx or dy:
                yield (x + dx, y + dy)

##end
def game_of_life_step(alive: set[tuple[int, int]]) -> set[tuple[int, int]]:
    nbrs = Counter()
    for x, y in alive:
##replace iter
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1):
                if dx or dy:
                    pos = (x + dx, y + dy)
##with
        for pos in neighbors(x, y):
##end
##hint "Can a specific, repeating calculation be put into its own helper?"
##explain "Extracting a specific task into its own function makes the main code clearer. Now, your loop is not a mystery anymore!"
##option bad bad-0 "Use list comprehensions"
##option good good "Extract function 'neighbors(...)'"
##option bad bad-2 "Use 'filter()'"
##replace-on iter
                    nbrs[pos] += 1
##with
          nbrs[pos] += 1
##end

##replace - "for cell, count in"
    new_alive: set[tuple[int, int]] = set()
    for cell, count in nbrs.items():
        if count == 3 or (count == 2 and cell in alive):
            new_alive.add(cell)
    return new_alive
##with
    return {cell for cell, count in nbrs.items()
        if count == 3 or (count == 2 and cell in alive)}
##end
##hint "Is there a more direct way to build a collection based on a condition?"
##explain "Why take extra steps? Set comprehensions let you build new sets in one clear line!"
##option good good "Use set comprehension"
##option bad bad-1 "Extract to function"
##option bad bad-2 "Rename to 'new_cells'"
##replace-span point "tuple[int, int]" Point
##hint "Some complex types could have a more descriptive name"
##explain "Nice. This type alias really made code cleaner!"
##option bad bad-0 "Remove type hints"
##option good good "Create type alias"
##replace-span - nbrs neighbor_counts
##hint "Could this name be more rdbl?"
##explain "Abbreviations in code? Bad idea! Readable names make your code a joy to read, not a puzzle."
##option good good "Rename to 'neighbor_counts'"
##option bad bad-2 "Rename to 'count_neighbors'"
##replace-span will_be_alive "count == 3 or (count == 2 and cell in alive)" "will_live(count, cell in alive)"
##hint "Complex bool expressions usually have some simple meaning"
##explain "It's like giving a label to a mystery box!"
##option good good "Extract function 'will_live'"
##option bad bad-2 "Split expression to several lines"
"""final
By breaking the logic into smaller functions like `will_live` and `neighbors`, you made the code tell a story.
"""
##final-reply "Ready to the next one!"
