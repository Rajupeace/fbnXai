// Helper function to add language context to responses
function addLanguageContext(response, detectedLanguage, context) {
    const languageMap = {
        'hindi': {
            greeting: 'नमस्ते!',
            rolePrefix: {
                'student': 'विद्यार्थी',
                'faculty': 'शिक्षक',
                'admin': 'प्रशासक'
            }
        },
        'telugu': {
            greeting: 'నమస్కారం!',
            rolePrefix: {
                'student': 'విద్యార్థి',
                'faculty': 'విద్యార్థి',
                'admin': 'నిర్వాహకుడు'
            }
        },
        'tamil': {
            greeting: 'வணக்கம்!',
            rolePrefix: {
                'student': 'மாணவர்',
                'faculty': 'ஆசிரியர்',
                'admin': 'நிர்வாகி'
            }
        },
        'spanish': {
            greeting: '¡Hola!',
            rolePrefix: {
                'student': 'estudiante',
                'faculty': 'profesor',
                'admin': 'administrador'
            }
        },
        'french': {
            greeting: 'Bonjour!',
            rolePrefix: {
                'student': 'étudiant',
                'faculty': 'professeur',
                'admin': 'administrateur'
            }
        },
        'german': {
            greeting: 'Hallo!',
            rolePrefix: {
                'student': 'Student',
                'faculty': 'Dozent',
                'admin': 'Administrator'
            }
        },
        'chinese': {
            greeting: '你好!',
            rolePrefix: {
                'student': '学生',
                'faculty': '教师',
                'admin': '管理员'
            }
        },
        'arabic': {
            greeting: 'مرحبا!',
            rolePrefix: {
                'student': 'طالب',
                'faculty': 'أستاذ',
                'admin': 'مدير'
            }
        },
        'japanese': {
            greeting: 'こんにちは!',
            rolePrefix: {
                'student': '学生',
                'faculty': '教師',
                'admin': '管理者'
            }
        },
        'russian': {
            greeting: 'Здравствуйте!',
            rolePrefix: {
                'student': 'студент',
                'faculty': 'преподаватель',
                'admin': 'администратор'
            }
        },
        'portuguese': {
            greeting: 'Olá!',
            rolePrefix: {
                'student': 'estudante',
                'faculty': 'professor',
                'admin': 'administrador'
            }
        }
    };

    const langConfig = languageMap[detectedLanguage];
    if (!langConfig) {
        return response; // Return original response if language not supported
    }

    const role = context?.role || 'student';
    const rolePrefix = langConfig.rolePrefix[role] || '';

    // Add language context to response
    const languageContext = `\n\n---\n**${langConfig.greeting}** 🌍\n*Language: ${detectedLanguage.charAt(0).toUpperCase() + detectedLanguage.slice(1)}*\n*Role: ${rolePrefix}*\n*Multi-language support enabled*`;

    return response + languageContext;
}

module.exports = { addLanguageContext };
