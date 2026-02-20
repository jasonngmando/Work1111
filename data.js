const CARDS = [
  {
    "id": "mr-001",
    "category": "Deadlines & Attendance",
    "question": "When is the deadline for Monday trainees to submit homework?",
    "answer": "By 4:30 pm on Thursday of the same week."
  },
  {
    "id": "mr-002",
    "category": "Deadlines & Attendance",
    "question": "If you miss an exercise, you must make it up within how many days after your absence date?",
    "answer": "Within 21 days."
  },
  {
    "id": "mr-003",
    "category": "Deadlines & Attendance",
    "question": "If you cannot do an exercise on the scheduled date, you must submit a note by email when?",
    "answer": "Within 1 business day after your absence date."
  },
  {
    "id": "mr-004",
    "category": "Deadlines & Attendance",
    "question": "In case of emergency, you must submit your note by email when?",
    "answer": "Within 2 business days after your absence date."
  },
  {
    "id": "mr-005",
    "category": "CAP",
    "question": "What does CAP stand for?",
    "answer": "Corrective Action Plan."
  },
  {
    "id": "mr-006",
    "category": "CAP",
    "question": "Please specify the stages of the CAP.",
    "answer": [
      "Verbal notice to improve",
      "Written notice to improve",
      "Final notice to improve",
      "Written termination notice"
    ]
  },
  {
    "id": "mr-007",
    "category": "Policies",
    "question": "If you take a vacation, please submit by email your vacation request form with manager's approval signature when?",
    "answer": "Before your vacation."
  },
  {
    "id": "mr-008",
    "category": "SMART Goals",
    "question": "SMART stands for what?",
    "answer": [
      "Specific",
      "Measurable",
      "Attainable",
      "Result oriented",
      "Time constrained"
    ]
  },
  {
    "id": "mr-009",
    "category": "Teamwork",
    "question": "What does it take to be a good team member?",
    "answer": [
      "Know your team goal and be committed to it",
      "Participate actively in team activities",
      "Motivate yourself",
      "Improve self-confidence",
      "Cooperate with other team members"
    ]
  },
  {
    "id": "mr-010",
    "category": "Teamwork",
    "question": "What are the commandments for an enthusiastic team?",
    "answer": [
      "Help each other be right — not wrong",
      "Look for ways to make ideas work — not for reasons they won't",
      "If in doubt — check it out!",
      "Help each other win and take pride in each other's victories",
      "Speak positively about each other and your organization at every opportunity",
      "Maintain a positive mental attitude no matter what the circumstances are",
      "Act with initiative and courage as if it all depends on you",
      "Do everything with enthusiasm — it's contagious",
      "Don't lose faith — never give up",
      "Have fun"
    ]
  },
  {
    "id": "mr-011",
    "category": "Complaints & Attitude",
    "question": "What is a complaint?",
    "answer": "An outward expression of grief, pain, or discontent."
  },
  {
    "id": "mr-012",
    "category": "Complaints & Attitude",
    "question": "By definition, a complaint is what?",
    "answer": "Spoken."
  },
  {
    "id": "mr-013",
    "category": "Complaints & Attitude",
    "question": "What are 2 forms of complaining?",
    "answer": [
      "Criticism",
      "Sarcasm"
    ]
  },
  {
    "id": "mr-014",
    "category": "Complaints & Attitude",
    "question": "What are the 4 stages of a complaint-free person?",
    "answer": [
      "Unconscious incompetence",
      "Conscious incompetence",
      "Conscious competence",
      "Unconscious competence"
    ]
  },
  {
    "id": "mr-015",
    "category": "Complaints & Attitude",
    "question": "What are the reasons people gripe?",
    "answer": [
      "Get attention",
      "Remove responsibility",
      "Inspire envy",
      "Power",
      "Excuse poor performance"
    ]
  },
  {
    "id": "mr-016",
    "category": "Complaints & Attitude",
    "question": "What is the main lesson of Jerry's story?",
    "answer": "Attitude is everything."
  },
  {
    "id": "mr-017",
    "category": "Complaints & Attitude",
    "question": "Life is ___ what happens to me and ___ how I react to it.",
    "answer": "Life is 10% what happens to me and 90% how I react to it."
  },
  {
    "id": "mr-018",
    "category": "Complaints & Attitude",
    "question": "What is in charge of our attitudes?",
    "answer": "You are in charge of your attitude."
  },
  {
    "id": "mr-019",
    "category": "Good Attitudes",
    "question": "Good attitudes at Mandarin (list 4).",
    "answer": [
      "Willing to serve",
      "Positive and optimistic",
      "Willing to shoulder responsibilities",
      "Constantly striving for improvement"
    ]
  },
  {
    "id": "mr-020",
    "category": "Good Attitudes",
    "question": "What are the 4 points of Kaifu's letter?",
    "answer": [
      "Hold on to the principles of honesty and integrity",
      "Living in the team",
      "Being a proactive person",
      "Challenging yourself and developing your potential"
    ]
  },
  {
    "id": "mr-021",
    "category": "Franchising",
    "question": "Franchising is a model for what?",
    "answer": "Business expansion."
  },
  {
    "id": "mr-022",
    "category": "Franchising",
    "question": "The role of the franchisee is what?",
    "answer": "Duplicate the franchise model."
  },
  {
    "id": "mr-023",
    "category": "Franchising",
    "question": "Attributes of a successful franchisee (list).",
    "answer": [
      "Follow rules",
      "Follow and implement the system",
      "Be willing to learn",
      "Work hard",
      "Be passionate",
      "Co-operate"
    ]
  },
  {
    "id": "mr-024",
    "category": "Communication",
    "question": "Key points of communication (3).",
    "answer": [
      "Identify and appreciate",
      "Seek for suggestions",
      "Ask for help"
    ]
  },
  {
    "id": "mr-025",
    "category": "Communication",
    "question": "What are the 5 C's of communication?",
    "answer": [
      "Correct",
      "Courteous",
      "Clear",
      "Concise",
      "Complete"
    ]
  },
  {
    "id": "mr-026",
    "category": "Communication",
    "question": "Most effective form of communication?",
    "answer": "Face to face."
  },
  {
    "id": "mr-027",
    "category": "Communication",
    "question": "What constitutes communication (percentages)?",
    "answer": [
      "7% words",
      "38% tone of voice",
      "55% body language"
    ]
  },
  {
    "id": "mr-028",
    "category": "Service",
    "question": "What are the 7 sins of service?",
    "answer": [
      "Apathy",
      "Brush off",
      "Coldness",
      "Condescending",
      "Robotism",
      "Rule book",
      "Runaround"
    ]
  },
  {
    "id": "mr-029",
    "category": "Service",
    "question": "Customer complaint procedure (steps).",
    "answer": [
      "Listen",
      "Empathize",
      "Thank",
      "Commit"
    ]
  },
  {
    "id": "mr-030",
    "category": "Company",
    "question": "Mission statement (2 points).",
    "answer": [
      "Every customer must feel welcomed as soon as they arrive",
      "Every customer must be happy and smiling when they leave"
    ]
  },
  {
    "id": "mr-031",
    "category": "Company",
    "question": "Company Vision (3 points).",
    "answer": [
      "The place where everyone wants to eat",
      "The place where everyone wants to work",
      "The place where everyone wants to invest"
    ]
  },
  {
    "id": "mr-032",
    "category": "Company",
    "question": "Names of founders.",
    "answer": [
      "James Chiu",
      "Diana Chiu",
      "George Chiu",
      "K.C. Chang"
    ]
  },
  {
    "id": "mr-033",
    "category": "Company",
    "question": "History of Mandarin (timeline).",
    "answer": [
      "1979 — Mandarin is founded/bought",
      "1986 — Buffet concept is introduced",
      "1988 — First Mandarin branch in Mississauga",
      "1993 — Grill section is introduced",
      "2002 — Head office moves to new corporate headquarters",
      "2013 — All-you-can-eat sashimi and cotton candy",
      "2025 — Mandarin has locations across Ontario offering buffet and take-out and delivery"
    ]
  },
  {
    "id": "mr-034",
    "category": "Company",
    "question": "Company values (list).",
    "answer": [
      "Customers",
      "Quality",
      "Teamwork",
      "Accountability",
      "Passion",
      "Respect",
      "Community"
    ]
  },
  {
    "id": "mr-035",
    "category": "Company",
    "question": "Company philosophy.",
    "answer": "Co-operation is the force."
  },
  {
    "id": "mr-036",
    "category": "Company",
    "question": "What is the force?",
    "answer": "The whole is greater than the sum of its parts."
  },
  {
    "id": "mr-037",
    "category": "Company",
    "question": "How to implement co-operation (list).",
    "answer": [
      "Share the same goal",
      "Fulfill our individual role",
      "Apply the same standards and use the same procedures",
      "Communicate"
    ]
  },
  {
    "id": "mr-038",
    "category": "Customer Service Commitment",
    "question": "What are the customer service commitments (3)?",
    "answer": [
      "High quality food",
      "Friendly service",
      "Pleasant atmosphere"
    ]
  },
  {
    "id": "mr-039",
    "category": "Customer Service Commitment",
    "question": "High quality food means (list).",
    "answer": [
      "Safe and hygienic",
      "Minimal oil",
      "Fresh",
      "Not burnt"
    ]
  },
  {
    "id": "mr-040",
    "category": "Customer Service Commitment",
    "question": "Friendly service steps.",
    "answer": [
      "Look",
      "Smile",
      "Talk",
      "Thank"
    ]
  },
  {
    "id": "mr-041",
    "category": "Customer Service Commitment",
    "question": "Pleasant atmosphere means (list).",
    "answer": [
      "Safe and hygienic",
      "Clean and tidy",
      "Lively and comfortable",
      "Accentuated decorations"
    ]
  },
  {
    "id": "mr-042",
    "category": "Company",
    "question": "Awards and recognitions (list).",
    "answer": [
      "Toronto Sun Reader's Choice (best Chinese restaurant)",
      "Foodservice and Hospitality (company of the year)"
    ]
  },
  {
    "id": "mr-043",
    "category": "Company",
    "question": "What is the official title of head office?",
    "answer": "The Mandarin Restaurant Franchise Corporation."
  },
  {
    "id": "mr-044",
    "category": "Company",
    "question": "Head Office location.",
    "answer": "8 Clipper Court."
  },
  {
    "id": "mr-045",
    "category": "HR & Compliance",
    "question": "Prohibited grounds of discrimination (list).",
    "answer": [
      "Colour",
      "Race",
      "Ancestry",
      "Place of origin",
      "Ethnic origin",
      "Sex",
      "Sexual orientation",
      "Disability",
      "Receipt of public assistance",
      "Record of offences",
      "Creed",
      "Age",
      "Family status",
      "Marital status",
      "Citizenship"
    ]
  },
  {
    "id": "mr-046",
    "category": "HR & Compliance",
    "question": "Strictly prohibited grounds of discrimination (list).",
    "answer": [
      "Colour",
      "Race",
      "Ancestry",
      "Place of origin",
      "Ethnic origin",
      "Creed",
      "Citizenship"
    ]
  },
  {
    "id": "mr-047",
    "category": "HR & Compliance",
    "question": "Public holidays (list).",
    "answer": [
      "New Year's Day",
      "Family Day",
      "Good Friday",
      "Victoria Day",
      "Canada Day",
      "Labour Day",
      "Thanksgiving",
      "Christmas",
      "Boxing Day"
    ]
  },
  {
    "id": "mr-048",
    "category": "HR & Compliance",
    "question": "Full-time Mandarin employee definition.",
    "answer": "Available to work all shifts as scheduled including lunch, dinner, weekends and holidays, and works on average a minimum of 36 hours per week continuously."
  },
  {
    "id": "mr-049",
    "category": "HR & Compliance",
    "question": "Grounds for terminations (examples).",
    "answer": [
      "Physical assault on customers, co-workers and management",
      "Use and/or trafficking of illegal substances",
      "Being under the influence of drugs or alcohol",
      "Insubordination",
      "Theft of customers', coworkers' or Mandarin's property/assets/foods/beverages/cash",
      "Willful damage to or misappropriate use of Mandarin property",
      "Slandering the Mandarin name and/or disclosing Mandarin's confidential information"
    ]
  }
];
