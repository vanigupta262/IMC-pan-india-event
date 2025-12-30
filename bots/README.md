
# Bot Submission Guide 

This document explains **how to write and submit your bot** for the IGTS World War III event.

You only need to submit **one Python file**.

---

## 1. What you submit

You must submit a file named:

```
bot.py
```

This file must contain **one function**:

```python
def PM(state):
    ...
```

That’s it.

---

## 2. The PM(state) function

### Signature

```python
def PM(state: dict) -> list:
    """
    Returns a list of actions for this round.
    """
```

* The function is called **once per round**
* It must return a **list of actions**
* If your function crashes or returns invalid output, **no actions will be taken**

---

## 3. State format (what your bot sees)

Your bot receives a Python dictionary:

```json
{
  "self_id": 0,
  "round": 3,
  "countries": {
    "0": {"economy": 110.25},
    "1": {"economy": 110.25},
    "2": {"economy": 100.0}
  },
  "roads": [[0,1]]
}
```

### Field explanation

| Field       | Meaning                        |
| ----------- | ------------------------------ |
| `self_id`   | Your country ID                |
| `round`     | Current round number           |
| `countries` | Economy info for all countries |
| `roads`     | Existing road connections      |

Notes:

* You **can see all countries**
* You **cannot see other bots’ actions**
* State is **read-only**

---

## 4. Action format

You return a **list of action dictionaries**.

### Trade

```python
{"type": "TRADE", "target": 1}
```

* Trade only happens if **both countries choose TRADE on each other**
* If no road exists, **AIR trade** is used

---

### Build Road

```python
{"type": "BUILD", "target": 2}
```

* Builds a road between you and the target
* Roads reduce trade cost

---

### Attack

```python
{"type": "ATTACK", "target": 3}
```

* Attacks another country
* Outcome depends on relative economies

---

### Destroy Road

```python
{"type": "DESTROY", "target": 4}
```

* Removes an existing road

---

### No action

```python
return []
```

This is always allowed.

---

## 5. Example bot (valid)

```python
def PM(state):
    me = state["self_id"]
    for cid in state["countries"]:
        if cid != me:
            return [{"type": "TRADE", "target": cid}]
    return []
```

---

## 6. Invalid behavior (important)

If your bot does any of the following:

* Crashes
* Times out
* Uses too much memory
* Returns invalid output

👉 **Your bot performs NO ACTIONS for that round**

The match continues.

---

## 7. Sandbox rules (read carefully)

Your bot runs in a secure sandbox:

* ❌ No internet access
* ❌ No file access outside the sandbox -- not checked thoroughly
* ❌ No long-running loops -- yet to be implemented i think
* ❌ No multiprocessing -- not checked
* ❌ No external libraries -- not checked

Allowed:

* Python standard library
* Pure computation

---

## 8. Determinism & fairness

* Bots are evaluated in **isolated environments**
* Order of execution does **not** affect outcomes
* Same inputs → same outputs -- is this needed?

---

## 9. Submission rules

* Submit **only `bot.py`**
* Do not zip folders
* Do not include extra files
* One submission per team (unless stated otherwise)

---

## 10. Final notes

* Read the problem statement carefully
* Think strategically — cooperation and betrayal both matter
* Logs are recorded; disputes will be resolved using logs

Good luck, and may your economy survive 🌍⚔️
