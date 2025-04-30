##file unescape.py
"""start
1. If a variable stores string, it is 's'.
2. If it stores a boolean, it is 'flag'.
3. However, sometimes one also need 's1', 's2', etc.
4. But I personally prefer 'ss', 'sss', etc. Brilliant, isn't it?
"""

def unescape(s):
    ss = ""
    flag = False
    for c in s:
        if flag and c == 'n':
            ss += '\n'
        elif flag and c == 't':
            ss += '\t'
        elif flag and c == '\\':
            ss += '\\'
        elif c == '\\':
            flag = True
        else:
            ss += c
    return ss

##replace-span - flag after_slash
##explain "Variable names should describe their purpose, not just their type"
##hint "What does this boolean flag actually indicate?"
##replace-span - ss unescaped
##explain "Single-letter variable names (or duplicates like 'ss') are rarely descriptive"
##hint "What does this string contain?"
##replace-span - s escaped
##explain "Single-letter variable names are rarely descriptive"
##hint "What does this parameter represent?"

