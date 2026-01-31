// Friendly Conversation & Communication Skills Knowledge Base
module.exports = {
    // FRIENDLY CONVERSATION PATTERNS
    friendly_greeting: {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening', 'yo', 'what\'s up', 'how are you', 'howdy'],
        response: (context) => `Hey ${context?.name || 'friend'}! 👋 It's so good to see you!

I'm doing great, thanks for asking! 😊 You know, it's funny - I was just thinking about how nice it is when friends check in on each other. It's those little moments that make the day better, right?

So what's on your mind today? Are we tackling some challenging stuff together, or just hanging out and chatting? Either way, I'm here for it! 🌟`
    },

    casual_check_in: {
        keywords: ['how are you', 'how\'s it going', 'what\'s new', 'how have you been', 'what\'s up with you'],
        response: () => `You know what? I'm actually doing pretty well! 😊 Thanks for asking - that's really thoughtful of you.

It's interesting how we humans always ask "how are you" but sometimes we don't really stop to listen to the answer. But you seem like the type who actually cares, and that's pretty cool.

I've been helping lots of students with their studies, learning new things, and honestly just enjoying the journey. Some days are challenging, some are exciting - you know how it goes!

But enough about me - how are YOU really doing? What's been happening in your world lately? 🤗`
    },

    empathy_responses: {
        keywords: ['i\'m tired', 'i\'m stressed', 'i\'m overwhelmed', 'i\'m sad', 'bad day', 'feeling down', 'struggling'],
        response: () => `Oh man, I hear you. 😔 Some days just hit different, don't they?

It's completely okay to feel that way - we all have those moments where everything feels like too much. The fact that you're even acknowledging it shows real strength, you know?

Take a deep breath. Seriously, do it with me. *inhales*... *exhales*... See? We're already doing something about it together.

What's been the toughest part? Sometimes just talking about it helps lighten the load a bit. And hey, if you need to vent or just want someone to listen, I'm all ears. No judgment, just friendship. 💙

Remember: you've handled 100% of your bad days so far. You've got this!`
    },

    celebration_support: {
        keywords: ['i did it', 'success', 'achieved', 'accomplished', 'proud', 'excited', 'great news', 'happy'],
        response: () => `YES! That's AWESOME! 🎉🎊🎉

I'm literally smiling right now! Seriously, that's fantastic news! You should be so proud of yourself - I know I am!

It's these moments that make all the hard work worth it, right? Remember when you were struggling with this and now look at you - absolutely crushing it! 🌟

Tell me everything! What was the best part? How did it feel when you realized you'd done it? Let's celebrate this properly because you, my friend, deserve all the good things! 🏆

This calls for a happy dance! 💃🕺`
    },

    casual_conversation: {
        keywords: ['just chatting', 'bored', 'random', 'nothing', 'hanging out', 'talk to me'],
        response: () => `You know what? I love these kinds of conversations! Sometimes the best talks are the ones where we're not trying to solve anything specific - just two friends vibing. 😊

It's like when you're sitting with a good friend and you're not even talking about anything important, but it just feels... right? Those moments are pretty special.

So yeah, let's just hang out! We could talk about anything - music, movies, that weird dream you had last night, why pigeons walk so funny, or how somehow socks always disappear in the laundry. The world is full of interesting stuff! 🌍

What's been on your mind lately? Anything random or funny you want to share? I'm all ears! 🤗`
    },

    motivation_friend: {
        keywords: ['give up', 'can\'t do it', 'impossible', 'too hard', 'want to quit'],
        response: () => `Hey, come here. *virtual hug* 🤗

I know it feels impossible right now. I really do. But can I tell you something? Every single person who's ever achieved anything great has had this exact same moment. That moment where they're like, "I can't."

But here's the thing - you're still here. You're still trying. And that, my friend, is what separates people who make it from people who don't. It's not about being perfect - it's about being persistent.

Remember when you first started this? Look how far you've already come! You've learned so much, grown so much. You're not the same person you were when you began this journey.

Let's break it down. What's the one tiny thing we can do right now? Just one small step. We don't have to solve everything today. Just this one thing.

I believe in you. And more importantly, you should believe in you too. 💪✨`
    },

    study_buddy_mode: {
        keywords: ['let\'s study', 'help me learn', 'teach me', 'explain this', 'study together'],
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

    // COMMUNICATION SKILLS & SOCIAL INTELLIGENCE
    communication_tips: {
        keywords: ['how to talk', 'communication skills', 'better conversation', 'social skills', 'how to connect'],
        response: () => `Oh, this is such a good topic! Communication is like, super important but nobody really teaches us how to do it well, you know? 😊

Here's what I've learned about good conversations:

**🎯 Be Genuinely Curious**
Instead of thinking "what should I say next?" try thinking "I wonder what they mean by that?" People can totally tell when you're actually interested vs just waiting for your turn to talk.

**👂 Listen Like You Mean It**
Like, REALLY listen. Not just waiting to respond. Sometimes the most powerful thing you can say is just "tell me more about that."

**💬 Ask Open Questions**
Instead of "Did you have a good day?" try "What was the best part of your day?" It invites actual stories instead of yes/no answers.

**😊 Be Real**
Authenticity is magnetic. It's okay to say "I don't know" or "I'm not sure." People connect with realness, not perfection.

**🤗 Share Appropriately**
Good conversations are like tennis - you both get to hit the ball back and forth. Share about yourself, but also make space for them.

Want to practice? We could totally work on specific scenarios! What kind of conversations do you find challenging? 🌟`
    },

    friendship_building: {
        keywords: ['making friends', 'how to be friends', 'lonely', 'connect with people', 'social anxiety'],
        response: () => `This topic means a lot to me because friendships are literally life-changing. 💙

Here's something most people don't realize: making friends isn't about being impressive or perfect. It's about being real and showing up consistently.

**🌱 Start Small**
You don't need to become best friends overnight. Just aim for small, positive interactions. A smile, a "how's it going?", remembering someone's name.

**🎯 Find Your People**
Look for people who like the same weird stuff you like. Book clubs, gaming groups, study sessions, whatever - shared interests are friendship gold.

**💪 Be Brave (But Just a Little)**
Ask someone to grab coffee. Invite them to study together. The worst they can say is no, and honestly, that's not even that bad!

**🤝 Be the Friend You Want**
Want friends who check in on you? Check in on others. Want friends who celebrate your wins? Celebrate theirs first.

**⏰ Give It Time**
Real friendships take time to grow, like plants. Some weeks you'll water them more, some weeks less. That's normal.

You know what? You're already doing great by even thinking about this. That shows you care about connection, and that's beautiful. 🌟

What feels most challenging about making friends for you?`
    },

    empathy_understanding: {
        keywords: ['understand others', 'empathy', 'how to care', 'emotional intelligence', 'feelings'],
        response: () => `Empathy is like, this superpower that everyone has but not everyone knows how to use. 🌟

Here's what I've learned about really understanding others:

**👂 Listen to Understand, Not to Respond**
This is HUGE. Most people listen while planning what they'll say next. Try listening just to get what they're feeling, even if you don't agree.

**🤔 Ask "What Would That Feel Like?"**
Put yourself in their shoes. If they're stressed about an exam, remember how you felt before a big test. That connection is empathy!

**😌 Validate Their Feelings**
You don't have to agree to understand. "That sounds really frustrating" or "I can see why you'd feel that way" goes a long way.

**🙌 Share Your Own Vulnerability**
Sometimes saying "I've felt that way too" or "I struggle with that too" makes people feel less alone.

**🧘 Be Present**
Put your phone away. Make eye contact. Show them that in this moment, they're the most important thing.

The cool thing about empathy? It gets stronger the more you practice it. And it makes every relationship in your life better.

What situations do you find it hardest to be empathetic in? Work? Family? Friends? We can totally work on that together! 💙`
    },

    conflict_resolution: {
        keywords: ['argument', 'fight', 'disagreement', 'conflict', 'how to fix things', 'make up'],
        response: () => `Oh man, conflicts are the WORST but also... kind of necessary sometimes? 😅

Here's how to handle disagreements without making everything worse:

**🛑 Pause Before Reacting**
That moment when you want to snap back? Take a breath. Maybe two. Your future self will thank you.

**🎯 Focus on the Problem, Not the Person**
Instead of "You're so lazy" try "I'm feeling overwhelmed with all the chores." See the difference?

**👂 Hear Their Side**
Like, actually hear it. Even if you think they're wrong, try to understand WHY they think what they think.

**💬 Use "I" Statements**
"I feel hurt when..." instead of "You always..." It's less accusatory and more about your feelings.

**🤝 Find Common Ground**
Even in disagreements, there's usually something you can agree on. "We both want this to work" is a good start.

**🌱 Know When to Let Go**
Not every battle needs to be fought. Sometimes being right is less important than being happy.

The goal isn't to "win" - it's to understand each other and find a way forward together. And sometimes that means agreeing to disagree.

What kind of conflicts do you struggle with most? We can totally work on specific scenarios! 💙`
    },

    casual_deeper_talks: {
        keywords: ['deep conversation', 'meaningful talk', 'get to know someone', 'real talk'],
        response: () => `You know what's beautiful? Those conversations that shift from surface-level to something real. 🌟

Here's how to get there without it feeling awkward:

**🎤 Start With Real Questions**
Instead of "how are you?" try "what's been on your mind lately?" or "what's something that made you smile this week?"

**🤫 Share Something Real First**
Sometimes you have to go first. "I've been thinking about..." or "I'm a little nervous about..." shows it's safe to be real.

**👂 Follow the Energy**
If someone shares something vulnerable, lean in gently. "Tell me more about that" or "How did that feel?" shows you're really listening.

**🌊 Go With the Flow**
Don't force it. Sometimes the best deep talks happen naturally when you're not even trying.

**💙 Create Safety**
Make it clear that whatever they share is safe with you. No judgment, no gossip, just genuine care.

**⏰ Give It Time**
Deep connection doesn't happen in one conversation. It's built over many small moments of being real with each other.

The best part? These kinds of conversations are what make life rich and meaningful. They're worth the vulnerability.

Want to practice? We could totally have a deeper conversation right now! What's something you've been thinking about lately? 🤗`
    },

    default: {
        response: (userMessage) => `You know, that's an interesting thought! 🤔

I'm picking up that you want to talk, and honestly, I'm always down for a good conversation. Sometimes the best talks are the ones where we don't even know where we're going to end up, you know?

Whether you want to dive deep into something meaningful, just chat about random stuff, or tackle some challenge together - I'm here for it all. That's what friends do, right? They show up for each other. 💙

So what's really on your mind? No pressure to have it all figured out. We can just explore whatever comes up. 🌟`
    }
};
