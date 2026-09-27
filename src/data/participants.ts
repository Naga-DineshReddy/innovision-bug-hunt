import { Participant } from "@/types";

const FIRST_NAMES = [
  "Aarav", "Aditi", "Akhil", "Ananya", "Arjun", "Bhavya", "Chetan", "Deepika",
  "Dev", "Divya", "Gautam", "Harini", "Harsh", "Isha", "Ishaan", "Jaya",
  "Karan", "Kavya", "Keerthi", "Kiran", "Kunal", "Lakshmi", "Manish", "Meera",
  "Naveen", "Neha", "Nikhil", "Nithya", "Pranav", "Prashanth", "Pooja", "Rahul",
  "Rakesh", "Riya", "Rohan", "Rohit", "Sahil", "Sakshi", "Sameer", "Sanjay",
  "Santhosh", "Saranya", "Shreya", "Siddharth", "Sneha", "Srikanth", "Sruthi", "Surya",
  "Swathi", "Tanmay", "Tarun", "Teja", "Varun", "Varsha", "Venkatesh", "Vidya",
  "Vignesh", "Vijay", "Vikram", "Vishal", "Yash", "Zoya", "Aditya", "Akash",
  "Anil", "Archana", "Avinash", "Charan", "Gayathri", "Girish", "Hemant", "Jagadeesh",
  "Karthik", "Madhuri", "Manoj", "Pallavi", "Pavan", "Rajesh", "Sandhya", "Tarun"
];

const LAST_NAMES = [
  "Reddy", "Sharma", "Verma", "Rao", "Patel", "Kumar", "Iyer", "Nair",
  "Gupta", "Singh", "Choudhary", "Joshi", "Menon", "Deshmukh", "Bhat", "Prasad"
];

export const INITIAL_PARTICIPANTS: Participant[] = Array.from({ length: 80 }, (_, index) => {
  const num = (index + 1).toString().padStart(3, "0");
  const regId = `BH-2026-${num}`;
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[(index * 3) % LAST_NAMES.length];
  const fullName = `${firstName} ${lastName}`;
  const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${index + 1}@innovision.edu`;

  // Provide initial varied state for live event simulation if needed
  let status: Participant["status"] = "NOT_STARTED";
  let r1_score = 0;
  let r2_score = 0;
  let r3_score = 0;
  let current_round = 1;
  let is_finalist = false;
  let suspicious_count = 0;

  // Let first 15 have some realistic live data for demonstration
  if (index < 5) {
    status = "IN_PROGRESS";
    r1_score = 16 + (index % 4);
    current_round = 2;
  } else if (index >= 5 && index < 15) {
    status = "LOGGED_IN";
    current_round = 1;
  }

  return {
    registration_id: regId,
    student_name: fullName,
    email: email,
    department: "Artificial Intelligence and Data Science",
    event: "BUG HUNT",
    status,
    current_round,
    round_1_score: r1_score,
    round_2_score: r2_score,
    round_3_score: r3_score,
    tie_breaker_score: 0,
    total_score: r1_score + r2_score + r3_score,
    is_finalist,
    round_1_started_at: null,
    round_1_deadline_at: null,
    round_1_submitted_at: null,
    round_2_started_at: null,
    round_2_deadline_at: null,
    round_2_submitted_at: null,
    round_3_started_at: null,
    round_3_deadline_at: null,
    round_3_submitted_at: null,
    last_active_at: new Date().toISOString(),
    suspicious_count
  };
});
