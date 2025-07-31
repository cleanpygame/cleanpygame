# Code Decomposition Principles Brainstorm

Here are 10 candidate clean code or decomposition principles that could be tested in a new level pack focused on code
decomposition:

1. **Single Responsibility Principle (SRP)**: Each function or class should have only one reason to change. Functions
   should do one thing and do it well.

2. **Function Length**: Functions should be short, ideally less than 20 lines. Long functions are harder to understand,
   test, and maintain.

3. **Parameter Count**: Functions should have a small number of parameters (ideally 3 or fewer). Too many parameters
   make functions harder to use and understand.

4. **Extracting Helper Functions**: Identify repeated code or logical segments and extract them into helper functions.

5. **Pure Functions**: Functions should not have side effects and should return the same output for the same input.

6. **Avoiding Deeply Nested Code**: Deep nesting (if/for/while) makes code harder to read and understand. Extract nested
   code into separate functions.

7. **Command-Query Separation**: Functions should either perform an action (command) or return data (query), but not
   both.

8. **Early Returns**: Use early returns to handle edge cases and reduce nesting.

9. **Decomposing Complex Conditionals**: Break complex conditional expressions into well-named functions or variables.

10. **Avoiding Global State**: Minimize the use of global variables and state, passing necessary data as parameters
    instead.

## Ranking Criteria

I'll rank these principles based on two criteria:

1. How easy it is to design game levels that test this principle
2. How important the principle is for first-year CS students

Each principle will be scored on a scale of 1-10 for each criterion, with 10 being the highest.

## Ranking

| Principle                        | Ease of Level Design | Importance for First-Year Students | Total Score |
|----------------------------------|----------------------|------------------------------------|-------------|
| Single Responsibility Principle  | 8                    | 10                                 | 18          |
| Function Length                  | 9                    | 9                                  | 18          |
| Parameter Count                  | 7                    | 7                                  | 14          |
| Extracting Helper Functions      | 10                   | 9                                  | 19          |
| Pure Functions                   | 6                    | 7                                  | 13          |
| Avoiding Deeply Nested Code      | 9                    | 8                                  | 17          |
| Command-Query Separation         | 5                    | 6                                  | 11          |
| Early Returns                    | 7                    | 7                                  | 14          |
| Decomposing Complex Conditionals | 8                    | 8                                  | 16          |
| Avoiding Global State            | 7                    | 8                                  | 15          |

## Top Principles

Based on the ranking, the top 2 principles are:

1. **Extracting Helper Functions** (Score: 19)
    - Very easy to design levels for, as it involves identifying repeated code or logical segments
    - Highly important for first-year students to learn code reuse and abstraction

2. **Single Responsibility Principle** (Score: 18)
    - Relatively easy to design levels for, showing functions that do too many things
    - Extremely important foundational principle for writing maintainable code

These principles will be the focus of the new level pack design.