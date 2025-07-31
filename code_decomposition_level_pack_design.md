# Code Decomposition Level Pack Design

## Introduction

This document outlines the design for a new level pack focused on code decomposition principles for the Clean-Code Game.
The level pack aims to teach first-year CS students how to break down code into functions or classes effectively,
following clean code principles.

## Principles Selection Process

### Candidate Principles

Ten candidate clean code or decomposition principles were considered for this level pack:

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

### Ranking Criteria

Each principle was ranked based on two criteria:

1. How easy it is to design game levels that test this principle
2. How important the principle is for first-year CS students

Each principle was scored on a scale of 1-10 for each criterion, with 10 being the highest.

### Ranking Results

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

### Selected Principles

Based on the ranking, the top 2 principles were selected for the level pack:

1. **Extracting Helper Functions** (Score: 19)
    - Very easy to design levels for, as it involves identifying repeated code or logical segments
    - Highly important for first-year students to learn code reuse and abstraction

2. **Single Responsibility Principle** (Score: 18)
    - Relatively easy to design levels for, showing functions that do too many things
    - Extremely important foundational principle for writing maintainable code

## Level Designs

### Extracting Helper Functions

#### Level 1: Repeated Code Extraction

This level focuses on identifying and extracting repeated code into a helper function, following the DRY (Don't Repeat
Yourself) principle.

**Narrative Context**: A code review of an intern's work that has obvious repetition in processing student exam scores.

**Learning Objective**: Identify repeated code patterns and extract them into a reusable helper function.

**Code Issue**: The function processes exam scores for multiple subjects using the same validation logic repeated three
times.

**Solution**: Extract the repeated validation logic into a `normalize_scores` helper function.

**Educational Value**: Teaches the DRY principle and how to identify and extract repeated code patterns.

#### Level 2: Logical Segment Extraction

This level focuses on breaking down a monolithic function into logical components, each with a clear purpose.

**Narrative Context**: A weather analysis function that's doing too many things at once - reading data, calculating
statistics, and generating a report.

**Learning Objective**: Identify logical segments within a function and extract them into helper functions.

**Code Issue**: The function has distinct logical segments (reading data, calculating statistics, generating a report)
all mixed together.

**Solution**: Extract each logical segment into its own helper function: `read_temperature_data`,
`calculate_statistics`, and `generate_report`.

**Educational Value**: Teaches how to identify logical segments within a function and how to extract them for better
organization and maintainability.

#### Level 3: Complex Algorithm Decomposition

This level focuses on breaking down a complex algorithm into smaller, focused helper functions.

**Narrative Context**: A text analysis algorithm that's trying to count word frequencies, identify common phrases, and
calculate readability metrics all in one giant function.

**Learning Objective**: Break down a complex algorithm into smaller, focused helper functions.

**Code Issue**: The function is handling multiple complex operations (text normalization, word frequency counting,
phrase analysis, syllable counting, readability calculation) all in one place.

**Solution**: Extract each operation into its own helper function: `normalize_text`, `count_word_frequencies`,
`find_common_phrases`, `count_syllables`, and `calculate_readability`.

**Educational Value**: Teaches how to break down complex algorithms into smaller, more manageable pieces that are easier
to understand, test, and maintain.

### Single Responsibility Principle

#### Level 1: Function Responsibility Separation

This level focuses on breaking down a function that handles multiple responsibilities into separate, focused functions.

**Narrative Context**: A user registration function that's trying to be a Swiss Army knife - validating, saving, and
notifying all at once.

**Learning Objective**: Identify different responsibilities within a function and separate them.

**Code Issue**: The function is handling input validation, database operations, and email sending all in one place.

**Solution**: Extract each responsibility into its own function: `validate_user_input`, `save_user_to_database`, and
`send_welcome_email`.

**Educational Value**: Teaches the Single Responsibility Principle at the function level and how to identify and
separate different responsibilities.

#### Level 2: Class Responsibility Separation

This level focuses on breaking down a class that handles multiple responsibilities into separate, specialized classes.

**Narrative Context**: A ReportGenerator class that's trying to be a data fetcher, analyzer, formatter, and file writer
all at once.

**Learning Objective**: Identify different responsibilities within a class and separate them into specialized classes.

**Code Issue**: The class is handling database operations, data analysis, report formatting, and file I/O all in one
place.

**Solution**: Extract each responsibility into its own class: `DatabaseConnector`, `SalesAnalyzer`, `ReportFormatter`,
and `ReportWriter`.

**Educational Value**: Teaches the Single Responsibility Principle at the class level and how to design a system of
specialized classes that work together.

#### Level 3: Mixed Concerns Separation

This level focuses on separating a function that handles multiple mixed concerns into focused functions.

**Narrative Context**: A data processing function that's trying to do it all - reading files, processing data,
validating results, and generating reports.

**Learning Objective**: Identify and separate mixed concerns within a function.

**Code Issue**: The function is handling file I/O, data validation, statistical analysis, and report generation all in
one place.

**Solution**: Extract each concern into its own function: `read_csv_file`, `validate_student_data`,
`analyze_student_data`, and `generate_student_report`.

**Educational Value**: Teaches how to identify and separate mixed concerns within a function, creating a clear
processing pipeline.

## Conclusion

The proposed level pack focuses on two fundamental code decomposition principles: Extracting Helper Functions and the
Single Responsibility Principle. These principles were selected based on their importance for first-year CS students and
the ease of designing engaging game levels that test them.

The level pack includes six levels (three for each principle) that progressively introduce more complex scenarios, from
simple repeated code extraction to complex class responsibility separation. Each level follows the established style of
existing levels in the Clean-Code Game, with a narrative context, code with issues to fix, specific replacements to
make, explanations, hints, and a final summary that reinforces the learning.

By completing this level pack, students will learn how to:

- Identify and extract repeated code into helper functions
- Break down complex functions into logical components
- Decompose complex algorithms into smaller, focused pieces
- Apply the Single Responsibility Principle at both the function and class level
- Create clear processing pipelines by separating mixed concerns

These skills are fundamental to writing clean, maintainable code and will serve as a strong foundation for more advanced
software engineering concepts.