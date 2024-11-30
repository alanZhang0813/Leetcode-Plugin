async function fetchDailyChallenge() {
    const response = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        query: `
          query {
            activeDailyCodingChallengeQuestion {
              date
              question {
                title
                titleSlug
                difficulty
              }
            }
          }
        `
      })
    });
  
    const data = await response.json();
    return data.data.activeDailyCodingChallengeQuestion;
  }  

chrome.alarms.create("leetcodeReminder", { when: Date.now(), periodInMinutes: 1440 });

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === "leetcodeReminder") {
    const challenge = await fetchDailyChallenge();
    chrome.notifications.create({
      type: "basic",
      iconUrl: "icons/icon128.png",
      title: "LeetCode Daily Challenge",
      message: `Today's challenge: ${challenge.question.title} (${challenge.question.difficulty})`,
      buttons: [{ title: "Solve Now" }]
    });
  }
});

chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    chrome.tabs.create({ url: `https://leetcode.com/problems/${notificationId}` });
  }
});
