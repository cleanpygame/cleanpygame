##level board.py
"""
It is simple: 
'initialization' consists of 'creating a board' and filling it with the 'board_reader'!
"""

def initialization(board_json):
    n = board_json['size']
    board = creating_board(n, n)
    board_reader(board_json, board)

# Hint for the future: functions = verbs, variables = nouns.

##replace-span - n board_size
##explain "Variable names should be descriptive"
##hint "What does this variable represent?"
##replace-span - initialization initialize_board
##explain "Function names should be verbs"
##hint "What action does this function perform?"
##replace-span - creating_board create_board
##explain "Function names should be verbs, not gerunds"
##hint "Use the imperative form for function names"
##replace-span - board_reader read_board
##explain "Function names should be verbs"
##hint "What action does this function perform?"
