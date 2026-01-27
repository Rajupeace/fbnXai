// Student Knowledge Base
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo'],
        response: (context) => `✨ **Hi there, ${context?.name || 'Friend'}!** 🚀\n\nIt's great to see you! I'm your Neural AI companion. I see you're rocking Year ${context?.year || 'N/A'} in ${context?.branch || 'Engineering'}. \n\nI can help you with:\n📚 **Notes & Papers**\n🤔 **Solving Doubts**\n💼 **Placement Tips**\n\n*What's on your mind today?*`
    },

    syllabus: {
        keywords: ['syllabus', 'curriculum', 'course content', 'topics', 'what will i learn'],
        response: () => "I've got your **Syllabus** right here! 📜\n\nYou can check out the full breakdown in your Semester Notes section. It covers all the modules you need to ace.\n\n{{NAVIGATE: journal}}\n\n*Need help with a specific topic? Just ask!*"
    },

    notes: {
        keywords: ['notes', 'study material', 'pdf', 'download', 'materials', 'subject doubts', 'doubt'],
        response: () => "Looking for **Notes**? 📚\n\nI've organized all your PDFs, lecture slides, and study materials in the **Journal**. You can find everything subject-wise there.\n\n{{NAVIGATE: journal}}\n\n*If you have a specific doubt in a subject, tell me the topic and I'll explain it!*"
    },

    doubts: {
        keywords: ['explain', 'what is', 'how to', 'understand', 'concept', 'lecture'],
        response: () => "I love explaining things! 🧠\n\nGo ahead, **type your question or topic** here. I can give you a quick summary, key points, or a detailed explanation.\n\n*For deep study, check the videos in your Journal:* {{NAVIGATE: journal}}"
    },

    papers: {
        keywords: ['question paper', 'previous year', 'pyq', 'model paper', 'exam paper'],
        response: () => "Ace your exams with **Previous Question Papers**! 📝\n\nYou can find Model Papers and PYQs in the **Active Semester** section under 'Resources'.\n\n{{NAVIGATE: semester}}\n\n*Practicing these is the best cheat code for high grades!* 🏆"
    },

    placement: {
        keywords: ['placement', 'job', 'internship', 'career', 'company', 'interview', 'tips', 'trick'],
        response: () => "Let's get you career-ready! 💼\n\nHere are some **Placement Tips & Tricks**:\n1. **Master the Basics**: Strong core knowledge is key.\n2. **Aptitude**: Practice daily.\n3. **Projects**: Build real-world apps (like this one!).\n\nCheck the **Advanced Learning** section for skill-up courses.\n\n{{NAVIGATE: advanced}}"
    },

    exams: {
        keywords: ['exam', 'test', 'mid-term', 'final', 'assessment', 'marks', 'grades', 'result'],
        response: () => "Exam mode on? 😤\n\nCheck your **Exam Schedule** and **Marks** to stay on track.\n\n1. **Performance**: {{NAVIGATE: marks}}\n2. **Schedule**: {{NAVIGATE: exams}}\n\n*You got this! Good luck!* 🍀"
    },

    schedule: {
        keywords: ['schedule', 'timetable', 'class timing', 'when is class', 'time'],
        response: () => "Let's check your **Time Table**. 📅\n\nHead over to the **Schedule** tab to see your classes for the day.\n\n{{NAVIGATE: schedule}}"
    },

    who_are_you: {
        keywords: ['who are you', 'what are you', 'your name', 'identity', 'who created you'],
        response: () => "I am **VuAiAgent**, your friendly AI study buddy! 🤖\n\nI was created to help you learn faster and smarter. I'm powered by **Advanced Agentic AI**.\n\n*Let's learn something new together!*"
    },

    help: {
        keywords: ['help', 'support', 'how to', 'guide'],
        response: () => "I'm here for you! 🤝\n\nHere's what I can do:\n- 📂 **Get Notes**: Ask for materials ({{NAVIGATE: journal}})\n- ❓ **Solve Doubts**: Ask me anything!\n- 📝 **Papers**: Find PYQs ({{NAVIGATE: semester}})\n- 💼 **Career**: Placement tips ({{NAVIGATE: advanced}})\n\n*Just type away!*"
    },

    default: {
        response: (userMessage) => `That's an interesting point! 🤔\n\nI'm not 100% sure about *"${userMessage}"* specifically in this context, but I can help you find resources or guide you to the right section.\n\nTry checking your **Overview** for general info: {{NAVIGATE: overview}}`
    }
};
