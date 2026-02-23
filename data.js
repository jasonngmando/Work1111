const rawData = {
  answers: {
    mr: {
      "001": "Monday trainees must submit homework by 4:30\npm Thursday same week",
      "002": "within 21",
      "003": "within 1 business day after, within 2 business days\nafter",
      "004": "Corrective Action Plan",
      "005": "Verbal notice the improve\nWritten notice to improve\nFinal notice to improve\nWritten termination notice",
      "006": "before",
      "007": "before",
      "008": "Specific\nmeasurable\nattainable\nresult oriented\ntime constrained",
      "009": "Know your team goal and be committed to it\nParticipate actively in team activities\nMotivate yourself\nimprove self-confidence\ncooperate with other team members",
      "010": "Help each other be right - not wrong\nlook for ways to make ideas work- not for reason they won't\nIf in doubt - check it out!\nhelp each other win and take pride in each other's\nvictories\nspeak positively about each other and your\norganization at every opportunity\nMaintain a positive mental attitude no matter what\nthe circumstances are\nAct with initiative and courage as if it all depends\non you\nDo everything with enthusiasm - it's contagious\ndon't lose faith - never give up\nhave fun",
      "011": "An outward expression of grief, pain or discontent.",
      "012": "spoken",
      "013": "criticism\nsarcasm",
      "014": "unconscious incompetence\nconscious incompetence\nconscious competence\nunconscious competence",
      "015": "Get attention\nRemove responsbility\ninspire envy\npower\nexcuse poor performance",
      "016": "Attitude is everything",
      "017": "Life is 10% what happens to me and 90% how I\nreact to it",
      "018": "You are in charge of your attitude",
      "019": "Willing to serve\nPositive and Optimistic\nWilling to shoulder responsbilities\nConstantly striving for improvement",
      "020": "Hold on to the principles of honesty and integrity\nliving in the team\nbeing a proactive person\nchallenging yourself and developing you potential",
      "021": "business expansion",
      "022": "duplicate the franchise model",
      "023": "follow rules\nfollow and implement the system\nBe willing to learn\nwork hard\nbe passionate\nco-operate",
      "024": "identify and appreciate\nseek for suggestions\nask for help",
      "025": "correct\ncourteous\nclear\nconcise\ncomplete",
      "026": "face to face",
      "027": "7% words\n38% tone of voice\n55% body language",
      "028": "apathy\nbrush off\ncoldness\ncondescending\nrobotism\nrule book\nrunaround",
      "029": "listen\nempathize\nthank\ncommit\nHandbook 0 分，共 21 分",
      "030": "Every customer must feel welcomed as soon as\nthey arrive\nEvery customer must be happy and smiling when\nthey leave",
      "031": "The place where everyone wants to eat\nThe place where everyone wants to work\nThe place where everyone wants to invest",
      "032": "James Chiu\nDiana Chiu\nGeorge Chiu\nK.C. Chang",
      "033": "1979 Mandarin is founded/bought\n1986 Buffet concept is introduced\n1988 First mandarin branch in mississauga\n1993 grill section is introduced\n2002 head office moves to new corporate\nheadquarters\n2013 all-you-can-eat sashimi and cotton candy\n2025 mandarin has locations across Ontario\noffering buffet and take-out and delivery",
      "034": "Customers\nquality\nteamwork\naccountability\npassion\nrespect\ncommunity",
      "035": "CUSTOMERS: we are focused on understanding and\nmeeting our customers' needs and expectation\nQUALITY: we deliver a superior mandarin\nexperience\nTEAMWORK: we build honest relationships with\nopen communication\nACCOUNTABILITY: we accept our commitments ,\nactions and results.\nPASSION: we are committed to ouru brand and\nshow pride in everything we do\nRESPECT: we treat each other equally, accepting\nand embracing diversity\nCOMMUNITY: we are dedicated to shaping a better\nfuture and making efforts in supporting the\ncommunities which we serve",
      "036": "co-operation is the force",
      "037": "the whole is greater than the sum of its parts",
      "038": "Share the same goal\nfulfill our individual role\napply the same standards and use the same\nprocedures\ncommunicate",
      "039": "high quality food\nfriendly service\npleasant atmosphere",
      "040": "safe and hygienic\nminimal oil\nfresh\nnot burnt",
      "041": "look\nsmile\ntalk\nthank",
      "042": "safe and hygienic\nclean and tidy\nlively and comfortable\naccentuated decorations",
      "043": "Toronto Sun Reader's choice (best Chinese\nrestaurant)\nFoodservice and Hospitality (company of the year)",
      "044": "The Mandarin Restaurant Franchise Corporation",
      "045": "8 clipper court",
      "046": "colour\nrace\nancestry\nplace of origin\nethnic origin\nsex\nsexual orientation\ndisability\nreceipt of public assistance\nrecord of offences\ncreed\nage\nfamily status\nmarital status\ncitizenship",
      "047": "colour\nrace\nancestry\nplace of origin\nethnic origin\ncreed\ncitizenship",
      "048": "new year's day\nfamily day\ngood friday\nvictoria day\ncanada day\nlabour day\nthanksgiving\nchristmas\nboxing day",
      "049": "A full-time mandarin employee is an individual who\nis available to work all shifts as scheduled including\nlunch, dinner, weekends and holidays, and who\nworks on average a minimum of 36 hours per week\ncontinuously",
      "050": "Physical assault on customers, co-workers and the\nmanagement\nuse and/ortrafficking of illegal substances\nbeing under the influence of drugs or alcohol\ninsubordination\ntheft of customers', coworkers' or Mandarin's\nproperty, assets, foods, beverages or cash\nwillful damage to or misappropriate use of\nMandarin Property\nSlandering the Mandarin name and or;\ndisclosing Mandarin's confidential information\n私權政策"
    }
  }
};

const CARDS = [
  {
    id: "mr-001",
    section: "Monday Review",
    question: "When is the deadline for Monday trainees to submit homework",
    answer: [
      "Monday trainees must submit homework by 4:30",
      "pm Thursday same week"
    ]
  },
  {
    id: "mr-002",
    section: "Monday Review",
    question: "If you miss exercise you must make up __ days after your absence date",
    answer: "within 21"
  },
  {
    id: "mr-003",
    section: "Monday Review",
    question: "If you cannot do exercise on scheduled date, you must submit a note by email ___ your absence date. In case of emergency please submit your note by email _____ your absence date",
    answer: [
      "within 1 business day after, within 2 business days",
      "after"
    ]
  },
  {
    id: "mr-004",
    section: "Monday Review",
    question: "What does CAP stand for",
    answer: "Corrective Action Plan"
  },
  {
    id: "mr-005",
    section: "Monday Review",
    question: "Please specify the stages of the CAP",
    answer: [
      "Verbal notice the improve",
      "Written notice to improve",
      "Final notice to improve",
      "Written termination notice"
    ]
  },
  {
    id: "mr-006",
    section: "Monday Review",
    question: "If you take a vacation, please submit by email your vacation request form with manager's approval signature ___ your vacation",
    answer: "before"
  },
  {
    id: "mr-007",
    section: "Monday Review",
    question: "If you take a vacation, please submit by email your vacation request form with manager's approval signature ___ your vacation",
    answer: "before"
  },
  {
    id: "mr-008",
    section: "Monday Review",
    question: "SMART stands for",
    answer: [
      "Specific",
      "measurable",
      "attainable",
      "result oriented",
      "time constrained"
    ]
  },
  {
    id: "mr-009",
    section: "Monday Review",
    question: "What does it take to be a good team member?",
    answer: [
      "Know your team goal and be committed to it",
      "Participate actively in team activities",
      "Motivate yourself",
      "improve self-confidence",
      "cooperate with other team members"
    ]
  },
  {
    id: "mr-010",
    section: "Monday Review",
    question: "What are the commandments for an enthusiastic team?",
    answer: [
      "Help each other be right - not wrong",
      "look for ways to make ideas work- not for reason",
      "they won't",
      "If in doubt - check it out!",
      "help each other win and take pride in each other's",
      "victories",
      "speak positively about each other and your",
      "organization at every opportunity",
      "Maintain a positive mental attitude no matter what",
      "the circumstances are",
      "Act with initiative and courage as if it all depends",
      "on you",
      "Do everything with enthusiasm - it's contagious",
      "don't lose faith - never give up",
      "have fun"
    ]
  },
  {
    id: "mr-011",
    section: "Monday Review",
    question: "What is a complaint",
    answer: "An outward expression of grief, pain or discontent."
  },
  {
    id: "mr-012",
    section: "Monday Review",
    question: "By definition a complaint is ___",
    answer: "spoken"
  },
  {
    id: "mr-013",
    section: "Monday Review",
    question: "What are 2 forms of complaining",
    answer: [
      "criticism",
      "sarcasm"
    ]
  },
  {
    id: "mr-014",
    section: "Monday Review",
    question: "4 stages of a complaint free person",
    answer: [
      "unconscious incompetence",
      "conscious incompetence",
      "conscious competence",
      "unconscious competence"
    ]
  },
  {
    id: "mr-015",
    section: "Monday Review",
    question: "What are the reasons people gripe",
    answer: [
      "Get attention",
      "Remove responsbility",
      "inspire envy",
      "power",
      "excuse poor performance"
    ]
  },
  {
    id: "mr-016",
    section: "Monday Review",
    question: "What is the main lesson of Jerry's story",
    answer: "Attitude is everything"
  },
  {
    id: "mr-017",
    section: "Monday Review",
    question: "Life is __ what happens to me and ___ how I react to it",
    answer: [
      "Life is 10% what happens to me and 90% how I",
      "react to it"
    ]
  },
  {
    id: "mr-018",
    section: "Monday Review",
    question: "What is in charge of our attitudes",
    answer: "You are in charge of your attitude"
  },
  {
    id: "mr-019",
    section: "Monday Review",
    question: "Good Attitudes at Mandarin",
    answer: [
      "Willing to serve",
      "Positive and Optimistic",
      "Willing to shoulder responsbilities",
      "Constantly striving for improvement"
    ]
  },
  {
    id: "mr-020",
    section: "Monday Review",
    question: "What are the 4 points of Kaifu's letter",
    answer: [
      "Hold on to the principles of honesty and integrity",
      "living in the team",
      "being a proactive person",
      "challenging yourself and developing you potential"
    ]
  },
  {
    id: "mr-021",
    section: "Monday Review",
    question: "Franchising is a model for",
    answer: "business expansion"
  },
  {
    id: "mr-022",
    section: "Monday Review",
    question: "The role of the franchisee is",
    answer: "duplicate the franchise model"
  },
  {
    id: "mr-023",
    section: "Monday Review",
    question: "Attributes of a successful franchisee",
    answer: [
      "follow rules",
      "follow and implement the system",
      "Be willing to learn",
      "work hard",
      "be passionate",
      "co-operate"
    ]
  },
  {
    id: "mr-024",
    section: "Monday Review",
    question: "Key points of communication",
    answer: [
      "identify and appreciate",
      "seek for suggestions",
      "ask for help"
    ]
  },
  {
    id: "mr-025",
    section: "Monday Review",
    question: "5 C's of communication",
    answer: [
      "correct",
      "courteous",
      "clear",
      "concise",
      "complete"
    ]
  },
  {
    id: "mr-026",
    section: "Monday Review",
    question: "Most effective form of communication",
    answer: "face to face"
  },
  {
    id: "mr-027",
    section: "Monday Review",
    question: "What constitutes communication",
    answer: [
      "7% words",
      "38% tone of voice",
      "55% body language"
    ]
  },
  {
    id: "mr-028",
    section: "Monday Review",
    question: "7 sins of service",
    answer: [
      "apathy",
      "brush off",
      "coldness",
      "condescending",
      "robotism",
      "rule book",
      "runaround"
    ]
  },
  {
    id: "mr-029",
    section: "Handbook",
    question: "Customer complaint procedure",
    answer: [
      "listen",
      "empathize",
      "thank",
      "commit",
      "Handbook 0 分，共 21 分"
    ]
  },
  {
    id: "mr-030",
    section: "Handbook",
    question: "Mission statement",
    answer: [
      "Every customer must feel welcomed as soon as",
      "they arrive",
      "Every customer must be happy and smiling when",
      "they leave"
    ]
  },
  {
    id: "mr-031",
    section: "Handbook",
    question: "Company Vision",
    answer: [
      "The place where everyone wants to eat",
      "The place where everyone wants to work",
      "The place where everyone wants to invest"
    ]
  },
  {
    id: "mr-032",
    section: "Handbook",
    question: "Names of Founders",
    answer: [
      "James Chiu",
      "Diana Chiu",
      "George Chiu",
      "K.C. Chang"
    ]
  },
  {
    id: "mr-033",
    section: "Handbook",
    question: "History of Mandarin",
    answer: [
      "1979 Mandarin is founded/bought",
      "1986 Buffet concept is introduced",
      "1988 First mandarin branch in mississauga",
      "1993 grill section is introduced",
      "2002 head office moves to new corporate",
      "headquarters",
      "2013 all-you-can-eat sashimi and cotton candy",
      "2025 mandarin has locations across Ontario",
      "offering buffet and take-out and delivery"
    ]
  },
  {
    id: "mr-034",
    section: "Handbook",
    question: "Company values",
    answer: [
      "Customers",
      "quality",
      "teamwork",
      "accountability",
      "passion",
      "respect",
      "community"
    ]
  },
  {
    id: "mr-035",
    section: "Handbook",
    question: "describe the company values",
    answer: [
      "CUSTOMERS: we are focused on understanding and",
      "meeting our customers' needs and expectation",
      "QUALITY: we deliver a superior mandarin",
      "experience",
      "TEAMWORK: we build honest relationships with",
      "open communication",
      "ACCOUNTABILITY: we accept our commitments ,",
      "actions and results.",
      "PASSION: we are committed to ouru brand and",
      "show pride in everything we do",
      "RESPECT: we treat each other equally, accepting",
      "and embracing diversity",
      "COMMUNITY: we are dedicated to shaping a better",
      "future and making efforts in supporting the",
      "communities which we serve"
    ]
  },
  {
    id: "mr-036",
    section: "Handbook",
    question: "Company philosophy",
    answer: "co-operation is the force"
  },
  {
    id: "mr-037",
    section: "Handbook",
    question: "What is the force",
    answer: "the whole is greater than the sum of its parts"
  },
  {
    id: "mr-038",
    section: "Handbook",
    question: "How to implement co-operation",
    answer: [
      "Share the same goal",
      "fulfill our individual role",
      "apply the same standards and use the same",
      "procedures",
      "communicate"
    ]
  },
  {
    id: "mr-039",
    section: "Handbook",
    question: "what are the customer service commitment",
    answer: [
      "high quality food",
      "friendly service",
      "pleasant atmosphere"
    ]
  },
  {
    id: "mr-040",
    section: "Handbook",
    question: "customer service commitment: high quality food",
    answer: [
      "safe and hygienic",
      "minimal oil",
      "fresh",
      "not burnt"
    ]
  },
  {
    id: "mr-041",
    section: "Handbook",
    question: "customer service commitment: friendly service",
    answer: [
      "look",
      "smile",
      "talk",
      "thank"
    ]
  },
  {
    id: "mr-042",
    section: "Handbook",
    question: "customer service commitment: pleasant atmosphere",
    answer: [
      "safe and hygienic",
      "clean and tidy",
      "lively and comfortable",
      "accentuated decorations"
    ]
  },
  {
    id: "mr-043",
    section: "Handbook",
    question: "awards and recognitions",
    answer: [
      "Toronto Sun Reader's choice (best Chinese",
      "restaurant)",
      "Foodservice and Hospitality (company of the year)"
    ]
  },
  {
    id: "mr-044",
    section: "Handbook",
    question: "What is the official title of head office",
    answer: "The Mandarin Restaurant Franchise Corporation"
  },
  {
    id: "mr-045",
    section: "Handbook",
    question: "Head Office location",
    answer: "8 clipper court"
  },
  {
    id: "mr-046",
    section: "Handbook",
    question: "Prohibited grounds of discrimination",
    answer: [
      "colour",
      "race",
      "ancestry",
      "place of origin",
      "ethnic origin",
      "sex",
      "sexual orientation",
      "disability",
      "receipt of public assistance",
      "record of offences",
      "creed",
      "age",
      "family status",
      "marital status",
      "citizenship"
    ]
  },
  {
    id: "mr-047",
    section: "Handbook",
    question: "Strictly prohibited grounds of discrimination",
    answer: [
      "colour",
      "race",
      "ancestry",
      "place of origin",
      "ethnic origin",
      "creed",
      "citizenship"
    ]
  },
  {
    id: "mr-048",
    section: "Handbook",
    question: "Public holidays",
    answer: [
      "new year's day",
      "family day",
      "good friday",
      "victoria day",
      "canada day",
      "labour day",
      "thanksgiving",
      "christmas",
      "boxing day"
    ]
  },
  {
    id: "mr-049",
    section: "Handbook",
    question: "Full-time employee definition",
    answer: [
      "A full-time mandarin employee is an individual who",
      "is available to work all shifts as scheduled including",
      "lunch, dinner, weekends and holidays, and who",
      "works on average a minimum of 36 hours per week",
      "continuously"
    ]
  },
  {
    id: "mr-050",
    section: "Handbook",
    question: "Grounds for terminations",
    answer: [
      "Physical assault on customers, co-workers and the",
      "management",
      "use and/ortrafficking of illegal substances",
      "being under the influence of drugs or alcohol",
      "insubordination",
      "theft of customers', coworkers' or Mandarin's",
      "property, assets, foods, beverages or cash",
      "willful damage to or misappropriate use of",
      "Mandarin Property",
      "Slandering the Mandarin name and or;",
      "disclosing Mandarin's confidential information",
      "私權政策"
    ]
  }
];

// Expose both globals for compatibility with browser script tags.
window.data = rawData;
window.CARDS = CARDS;
