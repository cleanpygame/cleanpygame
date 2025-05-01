# How to write levels

Plot:

Player is a new junior in the company.

Buddy is a mentor of the player. He gives smart and sarcastic comments on every level.
He never provides strong hints, rather subtle clues.
Message should be a little funny but not too long.

`"""start` — initial comment on the level's code. No strong hints! 200–400 characters.

`##explain` sarcastic comment with educational conclusion after fix is applied. 50-100 characters.

- Bad Example: "The mysterious 'get' function! Get what? The name 'get_empty_positions' actually tells us what it
  returns."
- Good Example: "Too long, you say? Bug hunting a 3 AM, I would prefer to meet longer names!"
- Good example: "Magic numbers are inside jokes — funny if you know, confusing for everyone else."

`##hint` should provide very subtle clue, helping to pay attention and locate the problematic piece of code. DON'T USE "
this", "that", "it" etc.
Smartness and sarcasm are appreciated. 20-80 characters.

- Bad example: "This variable collects positions. Name it to reflect its purpose, not its sequence." — not clear what "
  this"
- Good example: "What is stored in the list?"

`"""final` — final summary of the finished code. Should have educational value and be funny. Short levels should have
short summary. 100-300 characters.

`##start-reply` and `##final-reply` is the text of button and player reply. It should be short. ~10-25 characters.



