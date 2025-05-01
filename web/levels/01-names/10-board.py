##file board.py
"""start
Your colleague, who apparently skipped the "Parts of Speech" day in English class, has written some board game initialization code.

They proudly explained: "It is simple! The 'initialization' consists of 'creating a board' and filling it with the 'board_reader'!"

Time to teach them the sacred rule of naming: functions — verbs, variables — nouns.
"""
##start-reply "Let me fix these names..."

def initialization(board_json):
    n = board_json['size']
    board = creating_board(n, n)
    board_reader(board_json, board)

##replace-span - n board_size
##explain "Ah, the mysterious 'n'! Is it a secret agent? The 14th letter of the alphabet? Or perhaps... the size of the board? Single-letter variables are like secret codes that only the original developer understands."
##hint "nitrogen? narnia? nirvana?"
##replace-span - initialization initialize_board
##explain "Functions should be verbs because they DO things! 'initialization' is the noun form - like saying 'swimming' instead of 'swim'. Your functions should sound like commands: 'create', 'calculate', 'destroy', not 'creation', 'calculation', 'destruction'."
##hint "Functions DO things!"
##replace-span - creating_board create_board
##explain "'creating_board' sounds like you're narrating what you're doing: 'I am creating board now'. Function names should be direct commands: 'create_board!' It's more efficient and follows standard conventions."
##hint "building, running, processing — are nouns!"
##replace-span - board_reader read_board
##explain "'board_reader' sounds like a job title, not an action. Is it a person who reads boards professionally? Functions should be verbs that describe the action they perform."
##hint "Writer, reader, manager — are nouns!"
"""final
Excellent work! You've transformed these function and variable names to follow proper naming conventions. Functions are now verbs (actions) and variables are nouns (things), making the code much more intuitive to read.

This naming pattern creates a natural language-like flow in your code: "initialize_board takes a board_size and uses it to create_board and read_board." It reads almost like a sentence, which is exactly what good code should do!
"""
##final-reply "Grammar fixed!"
