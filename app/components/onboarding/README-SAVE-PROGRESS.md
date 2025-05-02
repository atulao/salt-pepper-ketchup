# Save & Continue Later Feature

This feature allows users to save their progress during the onboarding flow and resume later using a generated code.

## Components

- `SaveProgress.tsx` - Button component in the onboarding footer
- `SaveProgressModal.tsx` - Modal with code generation and copy functionality
- `ResumeProgress.tsx` - Input field to resume a saved session on the first page

## How It Works

1. **Saving Progress:**
   - User clicks "Save My Order" in the footer
   - A 6-digit code is generated using Math.random()
   - Current state is stored in localStorage with the code as key
   - User can optionally provide an email (not actually sent in this demo)
   - Code is displayed for the user to copy or write down

2. **Resuming Progress:**
   - User enters their 6-digit code in the "Resume a Saved Order" field on step 1
   - System retrieves state from localStorage
   - If found, state is restored and user continues where they left off
   - If not found or expired, user receives an error message

## Implementation Details

- Uses localStorage API for state persistence
- Generates 6-digit numeric codes for simplicity
- Includes a 30-day expiration on saved progress
- Validates input format for resume codes
- Works with zustand store for state management
- No external dependencies required

## Edge Cases Handled

- Invalid code format when resuming (non-numeric, wrong length)
- Code not found in localStorage
- Expired codes (older than 30 days)
- Already completed onboarding flow
- Copy to clipboard functionality with visual feedback

## Styling

- Follows the project's diner/food theme ("Your order number is...")
- Responsive design for all screen sizes
- Dark mode compatible
- Accessible with proper aria attributes
- Focus trapping in modal 