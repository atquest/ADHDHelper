import { 
  BrainCircuit, 
  ListTodo, 
  Zap, 
  RefreshCw, 
  HeartPulse, 
  Users
} from "lucide-react";

// Category definitions
export const categories = [
  {
    id: "focus",
    title: "Focus & Concentration",
    description: "Difficulty focusing and maintaining attention",
    icon: BrainCircuit,
    color: "#3B82F6" // primary color
  },
  {
    id: "organization",
    title: "Organization & Planning",
    description: "Challenges with planning and organizing",
    icon: ListTodo,
    color: "#6D28D9" // secondary color
  },
  {
    id: "impulse",
    title: "Impulsivity",
    description: "Managing impulsive behavior and decisions",
    icon: Zap,
    color: "#FBBF24" // accent color
  },
  {
    id: "hyperactivity",
    title: "Hyperactivity",
    description: "Techniques for restlessness and overactivity",
    icon: RefreshCw,
    color: "#3B82F6" // primary color
  },
  {
    id: "emotional",
    title: "Emotional Regulation",
    description: "Help with emotional ups and downs",
    icon: HeartPulse,
    color: "#6D28D9" // secondary color
  },
  {
    id: "social",
    title: "Social Skills",
    description: "Tips for social interactions and relationships",
    icon: Users,
    color: "#FBBF24" // accent color
  }
];

// Symptoms data
export const symptoms = [
  {
    id: 1,
    title: "Difficulty Maintaining Attention",
    category: "Focus & Concentration",
    categoryId: "focus",
    description: "Maintaining attention on a task is difficult. Thoughts wander, especially during boring or routine tasks.",
    recognitionPoints: [
      "Easily distracted by external stimuli (sounds, movements)",
      "Trouble following detailed instructions",
      "Often not completing tasks",
      "Missing details or making careless mistakes",
      "Avoiding tasks requiring sustained mental effort",
      "People often need to repeat information"
    ],
    brainExplanation: "With ADHD, there is a difference in how the prefrontal cortex (the part of the brain involved in attention and focus) functions. There is often an imbalance in neurotransmitters like dopamine and norepinephrine, which play an important role in regulating attention, motivation, and cognitive functions.",
    difficulty: "Significant"
  },
  {
    id: 2,
    title: "Chaotic Organization",
    category: "Organization & Planning",
    categoryId: "organization",
    description: "Difficulty organizing tasks, belongings, and activities. Things are often lost or forgotten.",
    recognitionPoints: [
      "Messy workspace or living environment",
      "Trouble with time management and deadlines",
      "Frequently losing important items",
      "Difficulty prioritizing tasks",
      "Starting projects but rarely finishing them",
      "Forgetting appointments or commitments"
    ],
    difficulty: "Moderate"
  },
  {
    id: 3,
    title: "Impulsive Decisions",
    category: "Impulsivity",
    categoryId: "impulse",
    description: "Acting quickly without thinking about consequences, leading to hasty decisions or reactions.",
    recognitionPoints: [
      "Interrupting conversations or answering before questions are finished",
      "Difficulty waiting for your turn",
      "Making impulsive purchases",
      "Engaging in risky behavior without considering consequences",
      "Blurting out thoughts without filtering",
      "Difficulty thinking before acting"
    ],
    difficulty: "Significant"
  },
  {
    id: 4,
    title: "Hyperactive Behavior",
    category: "Hyperactivity",
    categoryId: "hyperactivity",
    description: "Excessive movement and restlessness, often feeling like there's a motor inside driving constant activity.",
    recognitionPoints: [
      "Fidgeting, tapping hands or feet when seated",
      "Difficulty remaining seated in appropriate situations",
      "Running or climbing in inappropriate situations (in adults, may be restlessness)",
      "Talking excessively",
      "Difficulty engaging in leisure activities quietly",
      "Always feeling 'on the go'"
    ],
    difficulty: "Moderate"
  },
  {
    id: 5,
    title: "Emotional Dysregulation",
    category: "Emotional Regulation",
    categoryId: "emotional",
    description: "Difficulty managing emotions, with more intense reactions and rapid mood shifts than peers.",
    recognitionPoints: [
      "Quick and intense emotional reactions",
      "Difficulty calming down once upset",
      "Low frustration tolerance",
      "Feeling emotions more intensely than others",
      "Overreacting to minor setbacks",
      "Mood swings throughout the day"
    ],
    difficulty: "Significant"
  },
  {
    id: 6,
    title: "Social Challenges",
    category: "Social Skills",
    categoryId: "social",
    description: "Difficulty with social interactions, reading social cues, and maintaining relationships.",
    recognitionPoints: [
      "Misinterpreting social cues",
      "Interrupting others in conversations",
      "Difficulty maintaining friendships",
      "Speaking without considering how others might feel",
      "Trouble understanding personal space",
      "Difficulty with turn-taking in conversations"
    ],
    difficulty: "Moderate"
  },
  {
    id: 7,
    title: "Time Blindness",
    category: "Organization & Planning",
    categoryId: "organization",
    description: "A distorted perception of time passing, making it difficult to estimate, allocate, and stick to time schedules.",
    recognitionPoints: [
      "Chronically late to appointments or meetings",
      "Underestimating how long tasks will take",
      "Difficulty planning ahead for future events",
      "Forgetting deadlines until they're imminent",
      "Racing to complete tasks at the last minute",
      "Feeling like time either moves too quickly or too slowly"
    ],
    difficulty: "Significant"
  },
  {
    id: 8,
    title: "Forgetfulness",
    category: "Focus & Concentration",
    categoryId: "focus",
    description: "Frequently forgetting daily activities, responsibilities, and important details.",
    recognitionPoints: [
      "Missing appointments or deadlines",
      "Forgetting to complete daily routines (like taking medication)",
      "Losing track of conversations",
      "Starting tasks and then forgetting what you were doing",
      "Repeatedly checking if you've done something",
      "Relying heavily on reminders and notes"
    ],
    difficulty: "Moderate"
  },
  {
    id: 9,
    title: "Hyperfocus",
    category: "Focus & Concentration",
    categoryId: "focus",
    description: "An intense state of concentration on interesting activities, to the point of losing track of time and surroundings.",
    recognitionPoints: [
      "Becoming completely absorbed in engaging activities",
      "Losing track of time when focused",
      "Forgetting to eat or attend to basic needs",
      "Difficulty transitioning from engaging activities",
      "Becoming irritable when interrupted",
      "Uneven attention abilities (either very focused or very distracted)"
    ],
    difficulty: "Moderate"
  }
];

// Related symptoms helper function
export function relatedSymptomsByCategory(categoryId: string) {
  return symptoms.filter(symptom => symptom.categoryId === categoryId);
}

// Techniques data
export const techniques = [
  {
    id: 1,
    title: "Pomodoro Technique",
    difficulty: "easy",
    mainCategory: "Focus & Concentration",
    categories: ["focus"],
    categoryColor: "#3B82F6", // primary
    description: "Work in blocks of 25 minutes with short breaks in between to maintain focus and prevent mental fatigue.",
    benefits: ["focus", "productivity"],
    howTo: [
      "Choose a task you want to work on",
      "Set a timer for 25 minutes",
      "Work on the task until the timer rings",
      "Take a short break of 5 minutes",
      "Repeat this process",
      "After four pomodoros, take a longer break of 15-30 minutes"
    ],
    whyItWorks: "This technique works well for people with ADHD because it breaks longer tasks into manageable blocks that feel less overwhelming. The timer creates a sense of urgency and helps you stay focused, while the regular breaks ensure your brain gets enough rest.",
    proTip: "Use a real timer or a dedicated Pomodoro app instead of your phone to minimize distraction. Also, experiment with the length of focus periods - some people with ADHD do better with shorter periods of 15-20 minutes or longer periods of 30-35 minutes.",
    relatedSymptoms: [1, 8, 9]
  },
  {
    id: 2,
    title: "Body-doubling",
    difficulty: "easy",
    mainCategory: "Focus & Concentration",
    categories: ["focus", "organization"],
    categoryColor: "#3B82F6", // primary
    description: "Work with someone else in the same space to increase motivation and accountability.",
    benefits: ["focus", "motivation"],
    howTo: [
      "Ask a friend, family member, or colleague to sit quietly with you while you work",
      "Schedule virtual work sessions via video chat with friends or colleagues",
      "Use online body-doubling services or communities",
      "Work in a shared workspace or library where others are also working"
    ],
    whyItWorks: "The presence of another person creates a subtle form of accountability and structure. It helps regulate your behavior and reduce the tendency to procrastinate. For people with ADHD, the social pressure (even if only felt) can help increase dopamine levels, which improves motivation and focus.",
    proTip: "If you don't have access to a physical body-double, there are online services and communities where people work together virtually. Websites like Focusmate pair you with accountability partners for work sessions via video.",
    relatedSymptoms: [1, 2, 8]
  },
  {
    id: 3,
    title: "STOP Method",
    difficulty: "medium",
    mainCategory: "Impulsivity",
    categories: ["impulse", "emotional"],
    categoryColor: "#FBBF24", // accent
    description: "A step-by-step approach to control impulsive reactions by consciously pausing and thinking.",
    benefits: ["impulse control", "decision-making"],
    howTo: [
      "S - Stop what you're doing or about to do",
      "T - Take a deep breath and create a moment of pause",
      "O - Observe your thoughts, feelings, and the situation",
      "P - Proceed with a more thoughtful response"
    ],
    whyItWorks: "This method inserts a crucial pause between stimulus and response, giving your prefrontal cortex (the rational part of your brain) time to catch up with your limbic system (the emotional part). This helps prevent the impulsive actions that can occur when emotions take over.",
    proTip: "Practice this method regularly in low-stress situations so it becomes automatic when you really need it. You can also create visual reminders like a STOP sign on your phone or desk to help you remember this technique when you're feeling impulsive.",
    relatedSymptoms: [3, 5]
  },
  {
    id: 4,
    title: "Color-coding System",
    difficulty: "easy",
    mainCategory: "Organization & Planning",
    categories: ["organization"],
    categoryColor: "#6D28D9", // secondary
    description: "Use colors to organize tasks, projects, and belongings for better visual processing and organization.",
    benefits: ["organization", "memory"],
    howTo: [
      "Assign specific colors to different areas of your life (work, personal, health, etc.)",
      "Use colored folders, labels, or tags for physical items",
      "Apply color-coding to digital calendars and task lists",
      "Keep a legend or key to remember what each color represents",
      "Be consistent with your color system across different areas"
    ],
    whyItWorks: "The ADHD brain often processes visual information more effectively than text. Color-coding creates visual patterns that are easier to recognize and remember, reducing cognitive load. It also provides immediate context cues without requiring extensive reading or processing.",
    proTip: "Keep your color system simple at first - start with just 3-4 main categories. You can expand it later as the habit solidifies. Also, consider using color-coding in combination with location-based organization (e.g., all green items go in a specific place).",
    relatedSymptoms: [2, 7, 8]
  },
  {
    id: 5,
    title: "5-Second Rule",
    difficulty: "easy",
    mainCategory: "Impulsivity",
    categories: ["impulse", "focus"],
    categoryColor: "#FBBF24", // accent
    description: "Count backward from 5 before taking action on impulses to create a moment of pause and reflection.",
    benefits: ["impulse control", "focus"],
    howTo: [
      "When you feel an impulse or urge, pause",
      "Count backward: 5-4-3-2-1",
      "After counting, take the productive action (not the impulsive one)",
      "Use this for positive actions too, like getting out of bed or starting a task"
    ],
    whyItWorks: "The countdown acts as a pattern interrupt, shifting activity from the emotional brain regions to the prefrontal cortex. The counting provides just enough time to engage your executive functions before acting on impulse, giving you a moment of self-awareness and choice.",
    proTip: "This technique is especially effective when combined with physical movement. As you count down, physically move your body in the direction of the productive action - even small movements help bridge the gap between intention and action.",
    relatedSymptoms: [3, 1]
  },
  {
    id: 6,
    title: "Environment Modification",
    difficulty: "medium",
    mainCategory: "Focus & Concentration",
    categories: ["focus", "organization"],
    categoryColor: "#3B82F6", // primary
    description: "Strategically adjust your environment to minimize distractions and maximize focus-supporting elements.",
    benefits: ["focus", "productivity"],
    howTo: [
      "Create a clutter-free workspace with only essential items",
      "Use noise-cancelling headphones or background noise to block distracting sounds",
      "Put your phone on do not disturb or in another room",
      "Use browser extensions that block distracting websites",
      "Experiment with different workplaces to discover where you're most productive",
      "Consider lighting, temperature, and comfort in your environment"
    ],
    whyItWorks: "By consciously managing your environment, you reduce the amount of stimuli that need to be processed, leaving more cognitive capacity for your primary task. Environmental cues can either trigger distraction or support focus - this technique helps you control those cues.",
    proTip: "Try different environments and track where you're most productive. Some people with ADHD work better in a coffee shop with background noise than in complete silence. Know your own preference and plan your work day around it.",
    relatedSymptoms: [1, 9, 4]
  },
  {
    id: 7,
    title: "Time Timer Visualization",
    difficulty: "easy",
    mainCategory: "Organization & Planning",
    categories: ["organization", "focus"],
    categoryColor: "#6D28D9", // secondary
    description: "Use visual timers that show time elapsing to improve time awareness and management.",
    benefits: ["time management", "focus"],
    howTo: [
      "Use a physical Time Timer or a similar app that shows time visually",
      "Set the timer for the duration of your task or commitment",
      "Position the timer where you can easily see it",
      "Check periodically to maintain awareness of time passing",
      "Use for both work periods and breaks to maintain structure"
    ],
    whyItWorks: "People with ADHD often struggle with 'time blindness' - difficulty sensing the passage of time. Visual timers create an external representation of time that doesn't require constant mental tracking. Seeing time disappear visually makes it concrete rather than abstract.",
    proTip: "For maximum effectiveness, combine visual timers with estimating how long tasks will take before you start them. After completing the task, note the actual time taken. This practice gradually improves your time estimation abilities.",
    relatedSymptoms: [7, 1, 2]
  },
  {
    id: 8,
    title: "Emotional Temperature Check",
    difficulty: "medium",
    mainCategory: "Emotional Regulation",
    categories: ["emotional", "impulse"],
    categoryColor: "#6D28D9", // secondary
    description: "Regularly monitor your emotional state using a 1-10 scale to increase awareness and prevent emotional escalation.",
    benefits: ["emotional regulation", "self-awareness"],
    howTo: [
      "Establish a personal 1-10 scale where 1 is completely calm and 10 is overwhelmed",
      "Set regular times to check in with yourself (e.g., hourly)",
      "Ask yourself: 'What number am I at right now?'",
      "If you're above a 6 or 7, implement calming strategies immediately",
      "Identify specific interventions that work for different levels",
      "Track patterns to identify emotional triggers"
    ],
    whyItWorks: "This technique builds interoception (awareness of internal bodily states) which is often underdeveloped in people with ADHD. By catching emotional escalation early, you can implement coping strategies before reaching overwhelm. Regular monitoring also creates a habit of emotional self-awareness.",
    proTip: "Create a personalized list of interventions for different emotional temperature levels. For example, at level 5-7, you might need a short walk or deep breathing, while levels 8-10 might require removing yourself from the situation entirely or using more intensive grounding techniques.",
    relatedSymptoms: [5, 3]
  },
  {
    id: 9,
    title: "Task Chunking",
    difficulty: "medium",
    mainCategory: "Organization & Planning",
    categories: ["organization", "focus"],
    categoryColor: "#6D28D9", // secondary
    description: "Break down large tasks into smaller, manageable chunks to reduce overwhelm and increase completion.",
    benefits: ["organization", "productivity"],
    howTo: [
      "Identify a large task or project that feels overwhelming",
      "Break it down into smaller steps (aim for steps that take 15-30 minutes)",
      "Write down each step clearly",
      "Focus on completing just one chunk at a time",
      "Check off each completed chunk for dopamine reinforcement",
      "If a chunk still feels too big, break it down further"
    ],
    whyItWorks: "Large tasks can trigger avoidance in the ADHD brain due to executive function challenges with planning and sequencing. Small chunks bypass this by making the starting point clear and achievable. Completing chunks provides regular dopamine hits, which the ADHD brain craves for motivation.",
    proTip: "Use the 'next action' approach - always identify the very next physical action needed for each task chunk. For example, instead of 'work on report,' write 'open Word document and type title page.' This eliminates any ambiguity about how to start.",
    relatedSymptoms: [2, 1, 7]
  }
];

// Recent tips data
export const recentTips = [
  {
    id: 1,
    title: "Pomodoro Technique for Focus",
    category: "Focus & Concentration",
    categoryColor: "#3B82F6", // primary
    description: "Work in blocks of 25 minutes with short breaks",
    daysAgo: 3
  },
  {
    id: 2,
    title: "Color-coding System for Organization",
    category: "Organization & Planning",
    categoryColor: "#6D28D9", // secondary
    description: "Use colors to organize tasks and projects",
    daysAgo: 5
  },
  {
    id: 3,
    title: "5-Second Rule for Impulse Control",
    category: "Impulsivity",
    categoryColor: "#FBBF24", // accent
    description: "Count to 5 before responding to impulses",
    daysAgo: 7
  }
];
