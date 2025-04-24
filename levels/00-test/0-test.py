##filename onboarding.py
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
def BAD_CODE():
    print("GOOD")
##end
##replace-span - foo "bar bar"
##explain "no foos"
##hint "Look at foo!"

##replace-span e42 "42" "the_answer"
##explain "No Foos!"
##hint "42 = 6 * 8"