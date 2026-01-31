// Enhanced Student Knowledge Base with Friendly Conversation Patterns
module.exports = {
    greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo'],
        response: (context) => `Hey ${context?.name || 'friend'}! 👋 It's so good to see you!

I'm doing great, thanks for asking! 😊 You know, it's funny - I was just thinking about how nice it is when friends check in on each other. It's those little moments that make the day better, right?

So what's on your mind today? Are we tackling some challenging stuff together, or just hanging out and chatting? Either way, I'm here for it! I can help you with:

📚 Study materials and notes
🧠 Concept explanations and doubt clearing
💻 Programming and coding help
📝 Exam preparation and practice papers
💼 Career guidance and placement tips

Or we can just talk! Whatever feels right for you! 🌟`
    },

    // ENHANCED CONVERSATION PATTERNS
    casual_check_in: {
        keywords: ['how are you', 'how\'s it going', 'what\'s new', 'how have you been', 'what\'s up with you'],
        response: () => `You know what? I'm actually doing pretty well! 😊 Thanks for asking - that's really thoughtful of you.

It's interesting how we humans always ask "how are you" but sometimes we don't really stop to listen to the answer. But you seem like the type who actually cares, and that's pretty cool.

I've been helping lots of students with their studies, learning new things, and honestly just enjoying the journey. Some days are challenging, some are exciting - you know how it goes!

But enough about me - how are YOU really doing? What's been happening in your world lately? 🤗`
    },

    empathy_support: {
        keywords: ['i\'m tired', 'i\'m stressed', 'i\'m overwhelmed', 'i\'m sad', 'bad day', 'feeling down', 'struggling', 'exhausted'],
        response: () => `Oh man, I hear you. 😔 Some days just hit different, don't they?

It's completely okay to feel that way - we all have those moments where everything feels like too much. The fact that you're even acknowledging it shows real strength, you know?

Take a deep breath. Seriously, do it with me. *inhales*... *exhales*... See? We're already doing something about it together.

What's been the toughest part? Sometimes just talking about it helps lighten the load a bit. And hey, if you need to vent or just want someone to listen, I'm all ears. No judgment, just friendship. 💙

Remember: you've handled 100% of your bad days so far. You've got this! Want to take a break from studying and just talk for a bit?`
    },

    celebration_joy: {
        keywords: ['i did it', 'success', 'achieved', 'accomplished', 'proud', 'excited', 'great news', 'happy', 'finally'],
        response: () => `YES! That's AWESOME! 🎉🎊🎉

I'm literally smiling right now! Seriously, that's fantastic news! You should be so proud of yourself - I know I am!

It's these moments that make all the hard work worth it, right? Remember when you were struggling with this and now look at you - absolutely crushing it! 🌟

Tell me everything! What was the best part? How did it feel when you realized you'd done it? Let's celebrate this properly because you, my friend, deserve all the good things! 🏆

This calls for a happy dance! 💃🕺

Now, want to tackle the next challenge together, or should we just bask in this awesome moment for a bit?`
    },

    study_buddy_mode: {
        keywords: ['let\'s study', 'help me learn', 'teach me', 'explain this', 'study together', 'work together'],
        response: () => `Oh, I LOVE study buddy mode! 📚✨

You know what's cool about learning together? It's way more fun than doing it alone, and we can help each other understand things better. Plus, we can take breaks and talk about random stuff too!

Here's how I roll as a study buddy:
- I'll explain things like we're just figuring it out together
- We can use analogies and real-life examples (because boring explanations are the worst!)
- If you don't get something, we'll try a different way - no judgment, ever
- We'll celebrate the small wins because learning is hard work!

So what are we tackling today? Math? Programming? Some crazy concept that makes your brain hurt? Whatever it is, we've got this! Teamwork makes the dream work, right? 🚀

Ready to be study buddies? Let's do this! 💪`
    },

    syllabus: {
        keywords: ['syllabus', 'curriculum', 'course content', 'topics', 'what will i learn'],
        response: () => "I can help you understand your syllabus! 📋\n\nYour complete course curriculum is available in the Semester Notes section. You'll find all modules, topics, and learning objectives there.\n\n{{NAVIGATE: semester-notes}}\n\nIs there a specific subject or topic you'd like me to explain from your syllabus?"
    },

    notes: {
        keywords: ['notes', 'study material', 'pdf', 'download', 'materials', 'subject doubts', 'doubt'],
        response: () => "I'll help you find the right study materials! 📚\n\nAll your notes, PDFs, and learning resources are organized in the Semester Notes section. You can browse by subject and topic.\n\n{{NAVIGATE: semester-notes}}\n\nWhat subject are you studying right now? I can explain specific concepts or help you find relevant materials."
    },

    doubts: {
        keywords: ['explain', 'what is', 'how to', 'understand', 'concept', 'lecture', 'doubt', 'clarify', 'teach me', 'help me understand'],
        response: () => "I'd be happy to help clear your doubts! 🧠\n\nI can explain concepts step-by-step, provide examples, and break down complex topics into simple terms.\n\nJust tell me:\n• What subject you're studying\n• The specific concept or problem\n• Where you're getting stuck\n\nLet's tackle this together!"
    },

    math_doubts: {
        keywords: ['math', 'calculus', 'algebra', 'matrix', 'integration', 'derivative', 'probability', 'statistics'],
        response: () => "Mathematics is my specialty! ➕➖✖️➗\n\nI can help you with:\n• **Calculus**: Derivatives, integrals, limits\n• **Algebra**: Equations, matrices, polynomials\n• **Probability & Statistics**: Distributions, hypothesis testing\n• **Linear Algebra**: Vector spaces, eigenvalues\n\nShare your specific problem, and I'll walk you through the solution step-by-step."
    },

    programming_doubts: {
        keywords: ['programming', 'coding', 'java', 'python', 'c++', 'javascript', 'code', 'syntax', 'error', 'debug', 'web dev'],
        response: () => "Let's solve your programming challenges! 💻\n\nI can assist with:\n• **Code Debugging**: Find and fix errors\n• **Algorithm Design**: Optimize your solutions\n• **Language Syntax**: Python, Java, C++, JavaScript\n• **Web Development**: HTML, CSS, React, Node.js\n\nPaste your code or describe the problem, and I'll help you build a working solution."
    },

    physics_doubts: {
        keywords: ['physics', 'mechanics', 'quantum', 'optics', 'thermodynamics', 'circuit', 'electricity'],
        response: () => "Physics concepts made simple! ⚛️\n\nI can explain:\n• **Classical Mechanics**: Newton's laws, motion, energy\n• **Electromagnetism**: Circuits, fields, waves\n• **Thermodynamics**: Heat, work, entropy\n• **Quantum Physics**: Wave functions, uncertainty principle\n\nWhat physics concept is troubling you? I'll break it down with real-world examples."
    },

    papers: {
        keywords: ['question paper', 'previous year', 'pyq', 'model paper', 'exam paper'],
        response: () => "Let's help you ace those exams! 📝\n\nPrevious year papers and model questions are great for practice. You can find them organized by subject in your study resources.\n\n{{NAVIGATE: semester-notes}}\n\nPro tip: Start with recent papers and work backward. Focus on understanding the pattern of questions rather than memorizing answers. Need help with any specific topic?"
    },

    placement: {
        keywords: ['placement', 'job', 'internship', 'career', 'company', 'interview', 'tips', 'trick'],
        response: () => "Let's build your career success! 🚀\n\nHere's my placement preparation strategy:\n\n1. **Technical Skills**: Master core concepts in your field\n2. **Problem Solving**: Practice coding challenges and aptitude tests\n3. **Communication**: Develop clear explanation skills\n4. **Projects**: Build a portfolio of real projects\n\n{{NAVIGATE: advanced-learning}}\n\nWhat companies or roles are you targeting? I can help you prepare specifically."
    },

    exams: {
        keywords: ['exam', 'test', 'mid-term', 'final', 'assessment', 'marks', 'grades', 'result'],
        response: () => "Exam preparation mode activated! 🎯\n\nLet's create your study plan:\n\n1. **Understand the exam pattern** - marks distribution and question types\n2. **Prioritize topics** - focus on high-weightage areas\n3. **Practice regularly** - solve previous papers\n4. **Review and revise** - use active recall techniques\n\n{{NAVIGATE: exams}}\n\nWhat's your next exam? I'll help you prepare effectively."
    },

    schedule: {
        keywords: ['schedule', 'timetable', 'class timing', 'when is class', 'time'],
        response: () => "Let's check your academic schedule! 📅\n\nYour complete timetable with class timings, subjects, and locations is available in your dashboard.\n\n{{NAVIGATE: schedule}}\n\nI can also help you create a personalized study schedule that fits around your classes. Would you like me to help you plan your study time?"
    },

    who_are_you: {
        keywords: ['who are you', 'what are you', 'your name', 'identity', 'who created you'],
        response: () => "I'm your AI Learning Assistant at Vignan University! 🤖\n\nI'm designed to be your personal study companion - here to help you understand complex concepts, solve problems, and guide your learning journey.\n\nThink of me as a knowledgeable friend who's available 24/7 to help you succeed academically. I can explain topics, help with homework, prepare you for exams, and much more.\n\nWhat would you like to learn today?"
    },

    help: {
        keywords: ['help', 'support', 'how to', 'guide'],
        response: () => "I'm here to help you succeed! 🤝\n\nHere's everything I can do for you:\n\n📚 **Academic Support**\n• Explain complex concepts simply\n• Help with homework and assignments\n• Provide study strategies and tips\n\n💻 **Technical Help**\n• Programming and coding assistance\n• Debugging and optimization\n• Project guidance\n\n📝 **Exam Preparation**\n• Practice questions and papers\n• Study planning and time management\n• Concept revision\n\n🚀 **Career Guidance**\n• Placement preparation\n• Interview tips\n• Skill development\n\nJust ask me anything - I'm ready to help!"
    },

    learning_strategies: {
        keywords: ['how to study', 'study tips', 'learn better', 'improve grades', 'study method'],
        response: () => "Let's optimize your learning! 🧠\n\nHere are proven study strategies:\n\n1. **Active Recall** - Test yourself instead of re-reading\n2. **Spaced Repetition** - Review at increasing intervals\n3. **Pomodoro Technique** - 25min focused, 5min break\n4. **Feynman Technique** - Explain concepts in simple terms\n5. **Practice Testing** - Regular self-assessment\n\nWant me to create a personalized study plan based on your learning style and schedule?"
    },

    motivation: {
        keywords: ['demotivated', 'stressed', 'overwhelmed', 'can\'t focus', 'tired'],
        response: () => "I understand you're feeling overwhelmed. You're not alone! 💪\n\nLet's break this down:\n\n1. **Small Steps** - Focus on one task at a time\n2. **Progress, Not Perfection** - Every small win counts\n3. **Take Breaks** - Your brain needs rest to learn effectively\n4. **Remember Your Why** - What's your goal?\n\nYou're capable of amazing things. Let's tackle one small challenge together right now. What's the first thing you want to accomplish?"
    },

    default: {
        response: (userMessage) => `That's an interesting question! 🤔\n\nI'm here to help you learn and succeed. While I may not have a specific answer for "${userMessage}", I can definitely help you:\n\n• Find relevant study materials\n• Understand related concepts\n• Connect you with the right resources\n• Guide you to the right section\n\n{{NAVIGATE: overview}}\n\nCould you tell me more about what you're trying to learn or accomplish? I'll do my best to help!`
    }
};
