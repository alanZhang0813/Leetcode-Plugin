document.addEventListener("DOMContentLoaded", async () => {
    const usernameInput = document.getElementById("username-input");
    const saveButton = document.getElementById("save-button");
    const usernameDisplay = document.getElementById("username-display");
    const totalSolvedElem = document.getElementById("total-solved");
    const easySolvedElem = document.getElementById("easy-solved");
    const mediumSolvedElem = document.getElementById("medium-solved");
    const hardSolvedElem = document.getElementById("hard-solved");
  
    const userProfileQuery = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          username
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
        }
      }
    `;
  
    // Load the stored username from Chrome storage
    chrome.storage.sync.get(["leetcodeUsername"], async (data) => {
      const storedUsername = data.leetcodeUsername || "";
      usernameInput.value = storedUsername;
  
      if (storedUsername) {
        fetchUserStats(storedUsername);
      } else {
        usernameDisplay.textContent = "Enter your LeetCode username to see stats.";
      }
    });
  
    // Save the username when the Save button is clicked
    saveButton.addEventListener("click", () => {
      const newUsername = usernameInput.value.trim();
      if (newUsername) {
        chrome.storage.sync.set({ leetcodeUsername: newUsername }, () => {
          usernameDisplay.textContent = `Stats for: ${newUsername}`;
          fetchUserStats(newUsername);
        });
      } else {
        usernameDisplay.textContent = "Please enter a valid username.";
      }
    });
  
    // Function to fetch user stats from LeetCode
    async function fetchUserStats(username) {
      usernameDisplay.textContent = `Fetching stats for: ${username}...`;
  
      try {
        const response = await fetch("https://leetcode.com/graphql", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            query: userProfileQuery,
            variables: { username },
          }),
        });
  
        const data = await response.json();
        const userProfile = data.data.matchedUser;
  
        if (!userProfile) {
          usernameDisplay.textContent = "User not found.";
          clearStats();
          return;
        }
  
        // Populate UI with profile data
        usernameDisplay.textContent = `Stats for: ${userProfile.username}`;
        const stats = userProfile.submitStats.acSubmissionNum;
        totalSolvedElem.textContent = `Total Solved: ${stats[0].count}`;
        easySolvedElem.textContent = `Easy: ${stats[1].count}`;
        mediumSolvedElem.textContent = `Medium: ${stats[2].count}`;
        hardSolvedElem.textContent = `Hard: ${stats[3].count}`;
      } catch (error) {
        usernameDisplay.textContent = "Error fetching user stats.";
        clearStats();
        console.error("Error:", error);
      }
    }
  
    // Clear stats display
    function clearStats() {
      totalSolvedElem.textContent = "";
      easySolvedElem.textContent = "";
      mediumSolvedElem.textContent = "";
      hardSolvedElem.textContent = "";
    }
  });
  