from dataclasses import dataclass


@dataclass(frozen=True)
class User:
    name: str
    active: bool = True


users = [User("Ada"), User("Grace", active=False)]
print([user.name for user in users if user.active])
