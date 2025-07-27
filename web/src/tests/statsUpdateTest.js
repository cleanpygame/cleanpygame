// Manual test script to verify that hints and misclicks are only counted once
// Run this in the browser console to test the behavior

// 1. First, make a wrong click and check the session and global stats
console.log("Making a wrong click...");
const wrongClickAction = {
    type: 'WRONG_CLICK',
    payload: {lineIndex: 0, colIndex: 0, token: 'test'}
};
window.dispatch(wrongClickAction);

console.log("After wrong click:");
console.log("Session mistakes:", window.state.currentLevel.sessionMistakesMade);
const levelKey = `${window.state.currentLevelId.topic}__${window.state.currentLevelId.levelId.replace('.py', '')}`;
console.log("Global mistakes:",
    window.state.playerStats.levels[levelKey] ?
        window.state.playerStats.levels[levelKey].totalMistakesMade :
        "Not yet in global stats");
console.log("Summary mistakes:", window.state.playerStats.summary.totalMistakesMade);

// 2. Then, use a hint and check the session and global stats
console.log("\nUsing a hint...");
const hintAction = {type: 'GET_HINT'};
window.dispatch(hintAction);

console.log("After hint:");
console.log("Session hints:", window.state.currentLevel.sessionHintsUsed);
console.log("Global hints:",
    window.state.playerStats.levels[levelKey] ?
        window.state.playerStats.levels[levelKey].totalHintsUsed :
        "Not yet in global stats");
console.log("Summary hints:", window.state.playerStats.summary.totalHintsUsed);

// 3. Instructions for completing the level
console.log("\nTo complete the test:");
console.log("1. Complete the current level by clicking on all issues");
console.log("2. After level completion, check the stats again:");
console.log("   - window.state.playerStats.levels['" + levelKey + "'].totalMistakesMade");
console.log("   - window.state.playerStats.levels['" + levelKey + "'].totalHintsUsed");
console.log("   - window.state.playerStats.summary.totalMistakesMade");
console.log("   - window.state.playerStats.summary.totalHintsUsed");
console.log("3. Verify that the stats match the session counts (not doubled)");