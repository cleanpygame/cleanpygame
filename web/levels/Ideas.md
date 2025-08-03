## Code Smells to Use in Levels

### Libraries

* writing json as strings instead of json.dumps
*

### Exception handling

* use exception raise - catch in the heavy loop
* catch exception and print error, instead of letting error go up the stack
* with с функцией, которая открывает файл csv и вычитывает из него первую "ненужную" строчку с заголовками
* robustness стратегия без логгирования. Игнорируем пролемы

### 📦 Sorting Algorithms

Classic problems often written in messy, redundant, or hard-to-read ways — great for showing clean refactoring.

1. **Bubble Sort** — unnecessary swaps, lack of early exit, nested loops chaos.
2. **Insertion Sort** — typically monolithic; excellent candidate for step-wise breakdown.
3. **Selection Sort** — often includes repeated logic, poor naming.
4. **Merge Sort** — recursion, clear decomposition, rich with naming opportunities.
5. **Quick Sort** — boundary conditions, readability of pivot logic.
6. **Counting Sort** — special-case assumptions; shows how to isolate logic.
7. **Heap Sort** — helpful to demonstrate abstraction of heapify logic.

---

### 🔍 Searching Algorithms

Concise but easy to mess up with confusing conditions or cryptic code.

8. **Linear Search** — overly verbose or too clever; highlights clarity vs terseness.
9. **Binary Search** — boundary bugs galore; ideal to teach robustness and clarity.
10. **Ternary Search** — more niche, but good to compare styles.

---

### 💎 Elegant and Tricky Algorithms ("Pearls")

Often deceptively simple or clever, but dangerous when written unclearly.

11. **Floyd’s Cycle Detection (Tortoise and Hare)** — mysterious without good naming.
12. **Reservoir Sampling** — concise but opaque without explanation.
13. **Kadane’s Algorithm** — can be elegant or extremely cryptic.
14. **Levenshtein Distance (Edit Distance)** — great for showcasing recursive DP vs iterative DP, table structure,
    readability.
15. **Longest Common Subsequence** — classic DP with shared subproblems and memoization.
16. **Knapsack Problem** — great for demonstrating bottom-up DP table with readable indexing.
17. **Rod Cutting** — DP + recursive solution, good for showing exponential vs optimized code.
18. **Subset Sum / Partition Problem** — powerful example of backtracking vs DP refactor.

---

### 🧠 Real-World Logic Puzzles

Good for showing how complex logic becomes readable with decomposition and naming.

19. **Sudoku Solver** — perfect backtracking use case with input parsing, state, constraints.
20. **Balanced Brackets** — stack-based, but often bloated.
21. **Palindrome Checker** — often overcomplicated; great for showcasing clean minimal code.
22. **Roman Numeral Converter** — edge case handling, switch logic, and string processing.
23. **Slugify / String Converters (camelCase ↔ snake\_case)** — good for chaining transformations.
24. **Arithmetic Expression Evaluator (Shunting Yard)** — complex but decomposable.
25. **ISBN-10/13 Verifier** — checksum logic, often needs clarity.

---

### 🔁 Recursion, Enumeration, Backtracking

Often suffers from messy state handling, implicit assumptions, and over-repetition.

26. **N-Queens Problem** — perfect for explaining single responsibility and state isolation.
27. **Generating All Permutations** — state and backtracking.
28. **Subset Generation (Power Set)** — clean recursion vs nested loops.
29. **Tower of Hanoi** — iconic, excellent for base/recursive case separation.
30. **All Combinations of Well-Formed Parentheses** — recursive generation with constraints.

---

### 🧱 Data Structures

Highlighting clean design, interface clarity, and hiding implementation details.

31. **Singly Linked List** — insertion, deletion, traversal.
32. **Reversing a Linked List** — common trap for convoluted loops.
33. **Stack and Queue (from arrays/lists)** — naming and interface clarity.
34. **LRU Cache (Deque + Dict)** — great for showing cohesion and separation of concerns.
35. **Min Stack / Max Stack** — layered abstraction.
36. **Trie (Prefix Tree)** — recursive insert/search, often clunky without clarity.

---

### 🌐 Graph Algorithms

Excellent for teaching clean separation between logic (traversal) and data (graph representation).

37. **Depth-First Search (DFS)** — stack, visited tracking, good for showing pure vs side-effectful code.
38. **Breadth-First Search (BFS)** — queue usage and clarity of state tracking.
39. **Dijkstra’s Algorithm** — separation of queue logic, edge relaxation.
40. **Topological Sort** — dependency management, clarity of state.
41. **Prim’s / Kruskal’s MST** — showing separation of data structures.
42. **Union-Find (Disjoint Set)** — ideal for teaching encapsulation and abstraction.

---

### ➕ Bonus: Clean Code Focus Examples

These are not "algorithms" per se, but great exercises for clean code transformation:

43. **FizzBuzz** — minimal logic, but shows how people write bloated vs elegant solutions.
44. **Parsing CLI Arguments** — perfect for naming and function extraction.
45. **CSV Parsing** — stream reading, edge case awareness, modularity.
46. **Simple Web Scraper (requests + BeautifulSoup)** — imperative vs declarative decomposition.
47. **Config Loader (from JSON/YAML with validation)** — types, error handling, function composition.
48. **State Machine (e.g., for traffic light)** — flat if-else vs table-driven logic.

---

Let me know if you'd like a downloadable version (Markdown, JSON, or CSV), or a mapping to *Clean Code* principles per
problem (like naming, decomposition, duplication, etc). I can also sketch out one or two as **real Clean-Code Game
levels** to help you get started.
