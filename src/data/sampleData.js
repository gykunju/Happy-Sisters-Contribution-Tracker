// Sample data for testing the Happy Sisters Contribution Tracker
const sampleTransactions = [
  {
    id: 1,
    member: "Alice Wanjiku",
    amount: "500",
    type: "contribution",
    description: "Monthly contribution for December",
    date: "2024-12-01",
  },
  {
    id: 2,
    member: "Betty Muthoni",
    amount: "300",
    type: "contribution",
    description: "Weekly savings contribution",
    date: "2024-12-05",
  },
  {
    id: 3,
    member: "Catherine Njeri",
    amount: "750",
    type: "contribution",
    description: "Monthly contribution + bonus",
    date: "2024-12-08",
  },
  {
    id: 4,
    member: "Dorothy Wairimu",
    amount: "200",
    type: "withdrawal",
    description: "Emergency medical expenses",
    date: "2024-12-10",
  },
  {
    id: 5,
    member: "Elizabeth Wanjiru",
    amount: "400",
    type: "contribution",
    description: "Monthly contribution for December",
    date: "2024-12-12",
  },
  {
    id: 6,
    member: "Faith Nyambura",
    amount: "600",
    type: "contribution",
    description: "Christmas savings contribution",
    date: "2024-12-15",
  },
  {
    id: 7,
    member: "Grace Wachira",
    amount: "150",
    type: "withdrawal",
    description: "School fees emergency",
    date: "2024-12-18",
  },
];

// Function to add sample data to localStorage
function addSampleData() {
  localStorage.setItem("transactions", JSON.stringify(sampleTransactions));
  localStorage.setItem("user", "Test User");
  console.log("Sample data added successfully!");
}

// Add this to browser console to populate data:
// addSampleData();

export default sampleTransactions;
