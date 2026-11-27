# Vocab Intelligence

Terms for the vocab practice part of this app. Use these words in code, tickets and UI copy.

## Language

**Vocab Trainer**:
A saved practice set: a chosen list of vocab words plus its settings, such as mode, reminders and deadline. It runs in Classic or FSRS mode.
_Avoid_: test

**Exam**:
One submitted run of a Vocab Trainer's questions. The submit produces results that the user can read. FSRS trainers also have a separate review flow.

**Vocab Selection**:
The step in the create and edit dialog where the user picks the vocab words for a Vocab Trainer.
# Glossary

Domain terms used in code, tests and issues.

## Subject

A user's own topic label on a word meaning. The backend refuses to delete a Subject while a word still uses it (HTTP 409), and the UI then shows the conflict dialog.
