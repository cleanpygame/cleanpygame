##level onboarding.py
"""buddy
This is a test level
"""
##wisdoms 1 2
def foo():
    print(42)

##replace - bar
def bar():
    print("Hello bar!")
##with
def greet_user():
    print("Hello")
##end
##explain "No Foos!"

##replace BAD_CODE
def BAD_CODE():
    print("BAD")
##with
##end
##explain "Do not write bad code!"

##replace-on BAD_CODE
##with
def GOOD_CODE():
    print("ABSOLUTELY GOOD CODE!")
##end
##replace-span - foo "nonfoo"
##explain "no foos"
##hint "Look at foo!"

##replace-span e42 "42" "the_answer"
##explain "no magic constants!"
##hint "42 = 6 * 8"
##end
# here after ##end instruction the test code starts. It should be ignored by toolchain!
foo()
bar()
greet_user()
BAD_CODE()
GOOD_CODE()
