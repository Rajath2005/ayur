// creditsManager.js - Utility functions for managing credits

/**
 * Deducts credits based on the type of action
 * @param {string} type - Type of action: "NEW_CHAT", "BOT_RESPONSE", or "IMAGE_GENERATION"
 * @returns {Promise<number>} - Remaining credits after deduction
 */
export async function deductCredits(type) {
  const amount = type === "NEW_CHAT" ? 2 : type === "BOT_RESPONSE" ? 1 : type === "IMAGE_GENERATION" ? 5 : 0;

  if (amount === 0) {
    throw new Error("Invalid credit deduction type");
  }

  try {
    // Call the API endpoint to deduct credits
    const response = await fetch('/api/credits/deduct', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error('Failed to deduct credits');
    }

    const data = await response.json();
    return data.remainingCredits;
  } catch (error) {
    console.error('Error deducting credits:', error);
    throw error;
  }
}

/**
 * Gets the remaining credits for the current user
 * @returns {Promise<{remainingCredits: number, totalCredits: number, usedCredits: number}>}
 */
export async function getRemainingCredits() {
  try {
    const response = await fetch('/api/users/me/credits');
    if (!response.ok) {
      throw new Error('Failed to fetch credits');
    }
    const data = await response.json();
    return {
      remainingCredits: data.remainingCredits,
      totalCredits: data.maxCredits,
      usedCredits: data.maxCredits - data.remainingCredits,
    };
  } catch (error) {
    console.error('Error fetching credits:', error);
    throw error;
  }
}

/**
 * Resets credits based on validity cycle (15 or 30 days)
 * @returns {Promise<void>}
 */
export async function resetCreditsBasedOnValidityCycle() {
  try {
    const response = await fetch('/api/credits/reset', {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to reset credits');
    }
  } catch (error) {
    console.error('Error resetting credits:', error);
    throw error;
  }
}
