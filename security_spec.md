# Security Specification for Character Persistence

## Data Invariants
- Characters must have a unique ID (`characterId`).
- Characters must be created by a valid user (Creator) or Admin.
- Only the Creator or Admin can update/delete a character.
- Publicly readable characters should have `isPrivate: false`.

## "Dirty Dozen" Payloads (Examples)
1.  **Injecting Ghost Fields:** Updating `character` with `{"isAdmin": true}`.
2.  **Poisoning ID:** Sending a `characterId` that is 5KB long.
3.  **Spoofing Creator:** Setting `creator` field to another user's ID during creation.
4.  **PII Leak:** Attempting to read a character with `isPrivate: true` as an unauthenticated user.
5.  **Invalid Type Update:** Updating `votes` with a string instead of a number.
6.  **Missing Required Fields:** Attempting to create a character without `name`.
7.  **Terminal State Mutation:** Updating a field that should be immutable (`createdAt`).
8.  **Orphaned Write:** Attempting to create a character referencing a non-existent parent if required.
9.  **Query Scraping:** Listing characters without `isPrivate: true` filtering (if applicable).
10. **Unauthorized Delete:** Deleting a character as a user who is not the `creator`.
11. **Type Poisoning (Array):** Updating `tags` with a large list of 5000 strings.
12. **Timestamp Spoofing:** Sending `createdAt` with a timestamp from the future.
