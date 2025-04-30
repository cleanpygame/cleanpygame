##file unescape.py
"""start
Unescape? Again?!
"""

def unescape(text):
##replace encode_decode
    result = ""
    escaping = False
    for char in text:
        if escaping:
            if char == 'n':
                result += '\n'
            elif char == 't':
                result += '\t'
            elif char == '\\':
                result += '\\'
            # ... other escape sequences here...
            else:
                result += '\\' + char  # unknown escape — keep as-is
            escaping = False
        elif char == '\\':
            escaping = True
        else:
            result += char
    return result
##with
    # Python rule 101: everything is already implemented in some standard function!
    return text.encode('utf-8').decode('unicode_escape')
##end
##explain "Built-in unicode_escape encoding handles unescaping! But first you need to convert the string to bytes"
##hint "Escaping and unescaping string is a common task..."

