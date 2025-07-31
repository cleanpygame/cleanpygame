# Extracting Helper Functions - Level Designs

## Level 1: Repeated Code Extraction

```python
##file repeated_code.py
"""start
Welcome back, Junior! Today's code review is from our intern who seems to have a copy-paste addiction. 

This function processes student exam scores, but there's some obvious repetition that's making my eye twitch. Remember what we say about repeated code? "Write once, use everywhere" - not "write everywhere"! Find the repeated logic and extract it into a helper function.
"""
##start-reply "I'll clean up this repetition!"

def process_exam_scores(raw_scores):
    math_scores = []
    for score in raw_scores['math']:
        if score < 0:
            score = 0
        elif score > 100:
            score = 100
        math_scores.append(score)
    
    science_scores = []
    for score in raw_scores['science']:
        if score < 0:
            score = 0
        elif score > 100:
            score = 100
        science_scores.append(score)
    
    history_scores = []
    for score in raw_scores['history']:
        if score < 0:
            score = 0
        elif score > 100:
            score = 100
        history_scores.append(score)
    
    return {
        'math': math_scores,
        'science': science_scores,
        'history': history_scores
    }

##replace extract_helper
    math_scores = []
    for score in raw_scores['math']:
        if score < 0:
            score = 0
        elif score > 100:
            score = 100
        math_scores.append(score)
    
    science_scores = []
    for score in raw_scores['science']:
        if score < 0:
            score = 0
        elif score > 100:
            score = 100
        science_scores.append(score)
    
    history_scores = []
    for score in raw_scores['history']:
        if score < 0:
            score = 0
        elif score > 100:
            score = 100
        history_scores.append(score)
##with
    def normalize_scores(scores):
        normalized = []
        for score in scores:
            if score < 0:
                score = 0
            elif score > 100:
                score = 100
            normalized.append(score)
        return normalized
    
    math_scores = normalize_scores(raw_scores['math'])
    science_scores = normalize_scores(raw_scores['science'])
    history_scores = normalize_scores(raw_scores['history'])
##end
##explain "DRY (Don't Repeat Yourself) isn't just about saving keystrokes - it's about having a single source of truth. Now if the normalization logic changes, you only need to update it in one place!"
##hint "I'm seeing the same validation logic three times. Could we extract that?"
"""final
Excellent work! By extracting the repeated code into a helper function, you've made the code more maintainable and reduced the chance of bugs.

If we ever need to change how scores are normalized (like adding a curve or changing the valid range), we only need to update one function instead of three places. This is the essence of the DRY principle - Don't Repeat Yourself!
"""
##final-reply "DRY code is happy code!"
```

## Level 2: Logical Segment Extraction

```python
##file weather_analysis.py
"""start
Our weather analysis function is getting unwieldy! It's doing too many things at once - reading data, calculating statistics, and generating a report.

This function is like a kitchen sink - everything's thrown in! It's hard to understand, test, or reuse parts of it. Let's break it down by extracting logical segments into helper functions.
"""
##start-reply "Time to decompose this monster!"

def analyze_weather_data(filename):
    # Read data from file
    temperatures = []
    with open(filename, 'r') as file:
        for line in file:
            if line.strip() and not line.startswith('#'):
                try:
                    temp = float(line.strip())
                    temperatures.append(temp)
                except ValueError:
                    print(f"Warning: Invalid data point: {line.strip()}")
    
    # Calculate statistics
    if not temperatures:
        return "No valid temperature data found."
    
    avg_temp = sum(temperatures) / len(temperatures)
    sorted_temps = sorted(temperatures)
    if len(sorted_temps) % 2 == 0:
        median_temp = (sorted_temps[len(sorted_temps)//2 - 1] + sorted_temps[len(sorted_temps)//2]) / 2
    else:
        median_temp = sorted_temps[len(sorted_temps)//2]
    min_temp = min(temperatures)
    max_temp = max(temperatures)
    
    # Generate report
    report = "Weather Analysis Report\n"
    report += "======================\n"
    report += f"Number of readings: {len(temperatures)}\n"
    report += f"Average temperature: {avg_temp:.2f}°C\n"
    report += f"Median temperature: {median_temp:.2f}°C\n"
    report += f"Minimum temperature: {min_temp:.2f}°C\n"
    report += f"Maximum temperature: {max_temp:.2f}°C\n"
    
    if avg_temp > 25:
        report += "Status: HOT\n"
    elif avg_temp < 10:
        report += "Status: COLD\n"
    else:
        report += "Status: MODERATE\n"
    
    return report

##replace extract_logical_segments
    # Read data from file
    temperatures = []
    with open(filename, 'r') as file:
        for line in file:
            if line.strip() and not line.startswith('#'):
                try:
                    temp = float(line.strip())
                    temperatures.append(temp)
                except ValueError:
                    print(f"Warning: Invalid data point: {line.strip()}")
    
    # Calculate statistics
    if not temperatures:
        return "No valid temperature data found."
    
    avg_temp = sum(temperatures) / len(temperatures)
    sorted_temps = sorted(temperatures)
    if len(sorted_temps) % 2 == 0:
        median_temp = (sorted_temps[len(sorted_temps)//2 - 1] + sorted_temps[len(sorted_temps)//2]) / 2
    else:
        median_temp = sorted_temps[len(sorted_temps)//2]
    min_temp = min(temperatures)
    max_temp = max(temperatures)
    
    # Generate report
    report = "Weather Analysis Report\n"
    report += "======================\n"
    report += f"Number of readings: {len(temperatures)}\n"
    report += f"Average temperature: {avg_temp:.2f}°C\n"
    report += f"Median temperature: {median_temp:.2f}°C\n"
    report += f"Minimum temperature: {min_temp:.2f}°C\n"
    report += f"Maximum temperature: {max_temp:.2f}°C\n"
    
    if avg_temp > 25:
        report += "Status: HOT\n"
    elif avg_temp < 10:
        report += "Status: COLD\n"
    else:
        report += "Status: MODERATE\n"
##with
    def read_temperature_data(filename):
        temperatures = []
        with open(filename, 'r') as file:
            for line in file:
                if line.strip() and not line.startswith('#'):
                    try:
                        temp = float(line.strip())
                        temperatures.append(temp)
                    except ValueError:
                        print(f"Warning: Invalid data point: {line.strip()}")
        return temperatures
    
    def calculate_statistics(temperatures):
        if not temperatures:
            return None
        
        stats = {}
        stats['avg'] = sum(temperatures) / len(temperatures)
        sorted_temps = sorted(temperatures)
        if len(sorted_temps) % 2 == 0:
            stats['median'] = (sorted_temps[len(sorted_temps)//2 - 1] + sorted_temps[len(sorted_temps)//2]) / 2
        else:
            stats['median'] = sorted_temps[len(sorted_temps)//2]
        stats['min'] = min(temperatures)
        stats['max'] = max(temperatures)
        stats['count'] = len(temperatures)
        return stats
    
    def generate_report(stats):
        if stats is None:
            return "No valid temperature data found."
        
        report = "Weather Analysis Report\n"
        report += "======================\n"
        report += f"Number of readings: {stats['count']}\n"
        report += f"Average temperature: {stats['avg']:.2f}°C\n"
        report += f"Median temperature: {stats['median']:.2f}°C\n"
        report += f"Minimum temperature: {stats['min']:.2f}°C\n"
        report += f"Maximum temperature: {stats['max']:.2f}°C\n"
        
        if stats['avg'] > 25:
            report += "Status: HOT\n"
        elif stats['avg'] < 10:
            report += "Status: COLD\n"
        else:
            report += "Status: MODERATE\n"
        
        return report
    
    # Main function flow
    temperatures = read_temperature_data(filename)
    stats = calculate_statistics(temperatures)
    return generate_report(stats)
##end
##explain "Breaking down a monolithic function into logical components makes each part easier to understand, test, and potentially reuse. It's like organizing your toolbox instead of throwing everything in one drawer."
##hint "This function is doing three distinct operations. Could we separate them?"
"""final
Fantastic job! You've transformed a monolithic function into a well-structured set of helper functions, each with a clear purpose.

This decomposition has several benefits:
1. Each function is focused on a single task (reading data, calculating statistics, generating a report)
2. The main function is now a simple workflow that's easy to follow
3. We can test each helper function independently
4. We can reuse these functions in other parts of the codebase

Remember: Good functions are like good tools - they do one job and do it well!
"""
##final-reply "From monolith to modules!"
```

## Level 3: Complex Algorithm Decomposition

```python
##file text_analyzer.py
"""start
Our text analysis algorithm is a tangled mess! It's trying to count word frequencies, identify common phrases, and calculate readability metrics all in one giant function.

Even the original developer left a comment saying "This is too complex" - which is programmer-speak for "Future me, I'm sorry." Let's break this down into helper functions that each handle a specific part of the algorithm.
"""
##start-reply "Let's untangle this algorithm!"

def analyze_text(text):
    # This function is too complex - it does word frequency, phrase analysis, and readability
    
    # Normalize text
    text = text.lower()
    for char in '.,!?;:()[]{}""\'':
        text = text.replace(char, ' ')
    
    # Count word frequencies
    words = text.split()
    word_freq = {}
    for word in words:
        if len(word) > 1:  # Skip single-character words
            if word in word_freq:
                word_freq[word] += 1
            else:
                word_freq[word] = 1
    
    # Find common phrases (bigrams)
    common_phrases = {}
    for i in range(len(words) - 1):
        if len(words[i]) > 1 and len(words[i+1]) > 1:  # Skip single-character words
            phrase = words[i] + " " + words[i+1]
            if phrase in common_phrases:
                common_phrases[phrase] += 1
            else:
                common_phrases[phrase] = 1
    
    # Calculate readability metrics
    total_words = len(words)
    total_sentences = text.count('.') + text.count('!') + text.count('?')
    if total_sentences == 0:
        total_sentences = 1  # Avoid division by zero
    
    total_syllables = 0
    for word in words:
        vowels = 'aeiouy'
        count = 0
        prev_char_is_vowel = False
        for char in word:
            if char in vowels and not prev_char_is_vowel:
                count += 1
            prev_char_is_vowel = char in vowels
        if count == 0:
            count = 1  # Every word has at least one syllable
        total_syllables += count
    
    # Calculate Flesch Reading Ease score
    words_per_sentence = total_words / total_sentences
    syllables_per_word = total_syllables / total_words
    flesch_score = 206.835 - (1.015 * words_per_sentence) - (84.6 * syllables_per_word)
    
    # Prepare results
    top_words = sorted(word_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    top_phrases = sorted(common_phrases.items(), key=lambda x: x[1], reverse=True)[:5]
    
    return {
        'word_count': total_words,
        'sentence_count': total_sentences,
        'top_words': top_words,
        'top_phrases': top_phrases,
        'readability_score': flesch_score
    }

##replace complex_algorithm
    # This function is too complex - it does word frequency, phrase analysis, and readability
    
    # Normalize text
    text = text.lower()
    for char in '.,!?;:()[]{}""\'':
        text = text.replace(char, ' ')
    
    # Count word frequencies
    words = text.split()
    word_freq = {}
    for word in words:
        if len(word) > 1:  # Skip single-character words
            if word in word_freq:
                word_freq[word] += 1
            else:
                word_freq[word] = 1
    
    # Find common phrases (bigrams)
    common_phrases = {}
    for i in range(len(words) - 1):
        if len(words[i]) > 1 and len(words[i+1]) > 1:  # Skip single-character words
            phrase = words[i] + " " + words[i+1]
            if phrase in common_phrases:
                common_phrases[phrase] += 1
            else:
                common_phrases[phrase] = 1
    
    # Calculate readability metrics
    total_words = len(words)
    total_sentences = text.count('.') + text.count('!') + text.count('?')
    if total_sentences == 0:
        total_sentences = 1  # Avoid division by zero
    
    total_syllables = 0
    for word in words:
        vowels = 'aeiouy'
        count = 0
        prev_char_is_vowel = False
        for char in word:
            if char in vowels and not prev_char_is_vowel:
                count += 1
            prev_char_is_vowel = char in vowels
        if count == 0:
            count = 1  # Every word has at least one syllable
        total_syllables += count
    
    # Calculate Flesch Reading Ease score
    words_per_sentence = total_words / total_sentences
    syllables_per_word = total_syllables / total_words
    flesch_score = 206.835 - (1.015 * words_per_sentence) - (84.6 * syllables_per_word)
##with
    def normalize_text(text):
        text = text.lower()
        for char in '.,!?;:()[]{}""\'':
            text = text.replace(char, ' ')
        return text
    
    def count_word_frequencies(words):
        word_freq = {}
        for word in words:
            if len(word) > 1:  # Skip single-character words
                if word in word_freq:
                    word_freq[word] += 1
                else:
                    word_freq[word] = 1
        return word_freq
    
    def find_common_phrases(words):
        common_phrases = {}
        for i in range(len(words) - 1):
            if len(words[i]) > 1 and len(words[i+1]) > 1:  # Skip single-character words
                phrase = words[i] + " " + words[i+1]
                if phrase in common_phrases:
                    common_phrases[phrase] += 1
                else:
                    common_phrases[phrase] = 1
        return common_phrases
    
    def count_syllables(word):
        vowels = 'aeiouy'
        count = 0
        prev_char_is_vowel = False
        for char in word:
            if char in vowels and not prev_char_is_vowel:
                count += 1
            prev_char_is_vowel = char in vowels
        if count == 0:
            count = 1  # Every word has at least one syllable
        return count
    
    def calculate_readability(text, words):
        total_words = len(words)
        total_sentences = text.count('.') + text.count('!') + text.count('?')
        if total_sentences == 0:
            total_sentences = 1  # Avoid division by zero
        
        total_syllables = sum(count_syllables(word) for word in words)
        
        # Calculate Flesch Reading Ease score
        words_per_sentence = total_words / total_sentences
        syllables_per_word = total_syllables / total_words
        flesch_score = 206.835 - (1.015 * words_per_sentence) - (84.6 * syllables_per_word)
        
        return {
            'word_count': total_words,
            'sentence_count': total_sentences,
            'readability_score': flesch_score
        }
##end
##explain "Complex algorithms are like puzzles - breaking them into logical pieces makes them easier to solve. Each helper function now has a clear purpose and can be understood independently."
##hint "This algorithm is doing several distinct operations. Could we separate them by purpose?"
"""final
Excellent decomposition! You've transformed a complex, monolithic algorithm into a set of focused helper functions.

Each function now has a clear responsibility:
- normalize_text: Prepares the text for analysis
- count_word_frequencies: Tallies word occurrences
- find_common_phrases: Identifies frequent word pairs
- count_syllables: Estimates syllables in a word
- calculate_readability: Computes readability metrics

This approach makes the code more:
- Readable: Each function is focused and well-named
- Maintainable: Changes to one aspect don't affect others
- Testable: Each function can be tested independently
- Reusable: These helpers could be used in other text analysis tasks

Remember: Complex problems are best solved by breaking them down into smaller, manageable pieces!
"""
##final-reply "Algorithm untangled!"
```