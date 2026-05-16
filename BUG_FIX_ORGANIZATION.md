# Systematic Debugging: Organization Creation Error

## Phase 1: Reproduce
- **Steps to reproduce:**
  1. Login to the application.
  2. Navigate to Dashboard -> Configure Organization.
  3. Fill out steps 1, 2, and 3 of the form.
  4. Click on "Criar organização".
- **Expected result:** The organization is created in Firestore and the user is redirected to the dashboard.
- **Actual result:** UI shows "Erro ao criar organização. Tente novamente." (Error creating organization. Try again.)
- **Reproduction Rate:** Always (100%)

## Phase 2: Isolate
- The error message "Erro ao criar organização. Tente novamente." is hardcoded in the `catch` block of `handleSubmit` in `web/src/app/dashboard/onboarding/page.tsx`.
- This means an exception is being thrown inside the `try` block before the `router.push("/dashboard")` executes.

## Phase 3: Understand
### Root Cause Analysis (The 5 Whys)
1. **Why is the catch block triggered?**
   Because an exception is thrown in the `try` block of `handleSubmit`.
2. **Why is an exception thrown?**
   The exception occurs at the line: `const orgRef = doc(db, "organizations");`
3. **Why does `doc()` throw an exception?**
   In Firestore SDK v9+, the `doc(firestore, path)` function expects an absolute path to a document.
4. **Why is the path invalid?**
   The path `"organizations"` has an odd number of segments (1), which refers to a collection, not a document. Firestore expects an even number of segments for a document reference.
5. **What is the root cause?**
   To auto-generate an ID for a new document, the correct approach is to pass a collection reference to `doc()`, i.e., `doc(collection(db, "organizations"))`, rather than passing a string with just the collection name.

## Phase 4: Fix & Verify
### Fix Plan
1. In `web/src/app/dashboard/onboarding/page.tsx`, import `collection` from `"firebase/firestore"`.
2. Change the document reference generation from:
   ```typescript
   const orgRef = doc(db, "organizations");
   ```
   To:
   ```typescript
   const orgRef = doc(collection(db, "organizations"));
   ```
3. Save the file.
4. The subsequent `setDoc(orgRef, orgData)` will now correctly create the document with an auto-generated ID.

## Fix Verification
- [ ] Bug no longer reproduces when submitting the organization form.
- [ ] The organization is successfully created in Firestore.
- [ ] The user role and organizationId are successfully updated in the users collection.
