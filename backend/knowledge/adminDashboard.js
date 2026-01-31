// Admin Dashboard Knowledge Base - Administrative Control and System Management
module.exports = {
    // ADMIN DASHBOARD OVERVIEW
    dashboard_overview: {
        keywords: ['dashboard', 'home', 'overview', 'main page', 'admin dashboard', 'control center'],
        response: () => `Welcome to your Admin Dashboard! 🔑✨

This is your comprehensive system control and management center. Here's what you can access:

📊 **System Overview:**
- Real-time system health monitoring
- User activity and engagement metrics
- Performance analytics and insights
- Resource utilization statistics

🚀 **Quick Actions:**
- System configuration and settings
- User management and access control
- Security monitoring and alerts
- Data backup and recovery

Your dashboard provides complete visibility and control over the entire educational ecosystem. What administrative task would you like to handle today? 🌟`
    },

    // USER MANAGEMENT
    user_management: {
        roles: ['user management', 'users', 'students', 'faculty', 'admin', 'user accounts', 'access control'],
        response: () => `User Management Center! 👥

Comprehensive user administration and access control:

👥 **User Administration:**
- Student account management
- Faculty account administration
- Admin user access control
- Bulk user operations

🔐 **Access Control:**
- Role-based permissions management
- User authentication settings
- Access level configurations
- Security policy enforcement

📊 **User Analytics:**
- User activity monitoring
- Login and usage statistics
- Engagement metrics tracking
- User behavior analysis

🎯 **User Features:**
- User profile management
- Account status management
- Password reset administration
- User data privacy controls

Manage your user ecosystem efficiently! {{NAVIGATE: user-management}}`
    },

    students: {
        keywords: ['students', 'student management', 'student accounts', 'student data', 'student analytics'],
        response: () => `Student Administration Hub! 🎓

Comprehensive student lifecycle management:

📊 **Student Data Management:**
- Student enrollment and registration
- Academic record management
- Personal information database
- Student profile administration

📈 **Student Analytics:**
- Academic performance tracking
- Engagement and participation metrics
- Retention and dropout analysis
- Success rate statistics

🎯 **Student Services:**
- Student support ticket management
- Counseling and guidance tracking
- Extracurricular activity management
- Career services coordination

🔔 **Compliance & Reporting:**
- Regulatory compliance monitoring
- Student data privacy protection
- Accreditation reporting
- Government reporting requirements

Support student success effectively! {{NAVIGATE: students}}`
    },

    faculty: {
        keywords: ['faculty', 'teachers', 'professors', 'faculty management', 'staff', 'instructors'],
        response: () => `Faculty Management System! 👨‍🏫

Comprehensive faculty administration:

👥 **Faculty Administration:**
- Faculty recruitment and onboarding
- Contract and employment management
- Performance evaluation systems
- Professional development tracking

📊 **Faculty Analytics:**
- Teaching performance metrics
- Research productivity tracking
- Student feedback analysis
- Faculty workload distribution

🎯 **Faculty Services:**
- Professional development programs
- Research grant administration
- Teaching excellence recognition
- Career advancement support

📈 **Faculty Resources:**
- Resource allocation management
- Teaching assignment optimization
- Departmental coordination
- Interdisciplinary collaboration

Empower your faculty effectively! {{NAVIGATE: faculty}}`
    },

    // SYSTEM MANAGEMENT
    system_health: {
        keywords: ['system health', 'monitoring', 'performance', 'uptime', 'system status', 'server health'],
        response: () => `System Health Monitoring! 🖥️

Real-time system performance and health monitoring:

📊 **System Metrics:**
- Server performance monitoring
- Database performance tracking
- Application response times
- Network connectivity status

🔍 **Health Checks:**
- Automated system health scans
- Performance bottleneck identification
- Resource utilization monitoring
- Error rate tracking and alerts

🚨 **Alert Management:**
- Real-time system alerts
- Critical issue notifications
- Automated escalation procedures
- Incident response coordination

📈 **Performance Analytics:**
- Historical performance trends
- Capacity planning insights
- Optimization recommendations
- Predictive maintenance alerts

Ensure optimal system performance! {{NAVIGATE: system-health}}`
    },

    configuration: {
        keywords: ['configuration', 'settings', 'system settings', 'admin settings', 'system config'],
        response: () => `System Configuration Center! ⚙️

Comprehensive system administration:

🔧 **System Configuration:**
- Application settings management
- Database configuration
- Integration platform setup
- Security parameter configuration

🔐 **Security Management:**
- Security policy enforcement
- Access control configuration
- Encryption and data protection
- Threat detection and prevention

🌐 **Network Configuration:**
- Network settings management
- Firewall configuration
- Load balancer setup
- Domain and SSL management

📊 **System Optimization:**
- Performance tuning parameters
- Resource allocation settings
- Caching and optimization
- Backup and recovery configuration

Fine-tune your system for optimal performance! {{NAVIGATE: configuration}}`
    },

    // DATA & ANALYTICS
    analytics: {
        keywords: ['analytics', 'data', 'insights', 'statistics', 'reports', 'metrics', 'data analysis'],
        response: () => `Analytics & Insights Hub! 📊

Comprehensive data analysis and business intelligence:

📈 **Platform Analytics:**
- User engagement metrics
- Content consumption patterns
- Feature utilization statistics
- User journey analysis

📊 **Academic Analytics:**
- Student performance trends
- Faculty effectiveness metrics
- Course completion rates
- Learning outcome analysis

🎯 **Business Intelligence:**
- Institutional performance metrics
- Resource utilization analysis
- Financial and operational insights
- Strategic planning data

📑 **Custom Reports:**
- Custom report builder
- Automated report generation
- Data visualization tools
- Executive dashboards

Make data-driven decisions! {{NAVIGATE: analytics}}`
    },

    // SECURITY & COMPLIANCE
    security: {
        keywords: ['security', 'compliance', 'audit', 'privacy', 'data protection', 'security monitoring'],
        response: () => `Security & Compliance Center! 🔒

Comprehensive security management and compliance:

🛡️ **Security Management:**
- Threat detection and prevention
- Security incident response
- Vulnerability management
- Security policy enforcement

📊 **Compliance Monitoring:**
- Regulatory compliance tracking
- Data privacy protection
- Audit trail management
- Risk assessment and mitigation

🔍 **Security Analytics:**
- Security event monitoring
- User behavior analysis
- Anomaly detection
- Security incident reporting

🎯 **Privacy Protection:**
- Data encryption management
- Access control enforcement
- Privacy policy compliance
- Data breach prevention

Maintain system security and compliance! {{NAVIGATE: security}}`
    },

    // CONTENT MANAGEMENT
    content_management: {
        keywords: ['content', 'materials', 'resources', 'content management', 'curriculum', 'courses'],
        response: () => `Content Management System! 📚

Comprehensive educational content administration:

📚 **Content Administration:**
- Course content management
- Learning material organization
- Curriculum planning tools
- Content version control

🎯 **Quality Assurance:**
- Content review and approval workflows
- Quality standards enforcement
- Compliance checking
- Accessibility validation

📊 **Content Analytics:**
- Content usage statistics
- Student engagement metrics
- Content effectiveness analysis
- Popular content identification

🔄 **Content Lifecycle:**
- Content creation workflows
- Publication and distribution
- Archive and retirement
- Content update scheduling

Manage educational content effectively! {{NAVIGATE: content-management}}`
    },

    // INTEGRATION & APIS
    integrations: {
        keywords: ['integration', 'api', 'third-party', 'external systems', 'platform integration'],
        response: () => `Integration & API Management! 🔗

System integration and external platform connectivity:

🔗 **API Management:**
- API key and token management
- API documentation and testing
- Rate limiting and throttling
- API version control

🌐 **Third-Party Integrations:**
- LMS platform connections
- Payment gateway integration
- Communication platform setup
- External database synchronization

📊 **Integration Analytics:**
- Integration performance monitoring
- API usage statistics
- Data flow tracking
- Error rate analysis

🔧 **Integration Tools:**
- Integration workflow builders
- Data mapping tools
- Synchronization configuration
- Error handling and recovery

Connect your systems seamlessly! {{NAVIGATE: integrations}}`
    },

    // BACKUP & RECOVERY
    backup_recovery: {
        keywords: ['backup', 'recovery', 'data backup', 'disaster recovery', 'data protection'],
        response: () => `Backup & Recovery Center! 💾

Comprehensive data protection and disaster recovery:

🔄 **Backup Management:**
- Automated backup scheduling
- Incremental backup systems
- Full backup operations
- Backup verification and testing

🔒 **Data Protection:**
- Encryption and secure storage
- Data integrity validation
- Access control enforcement
- Privacy compliance maintenance

📊 **Recovery Planning:**
- Disaster recovery procedures
- Business continuity planning
- Recovery time objectives
- Recovery point objectives

🎯 **Backup Features:**
- Multi-location backup storage
- Cross-platform compatibility
- Backup retention policies
- Recovery testing automation

Protect your critical data! {{NAVIGATE: backup-recovery}}`
    },

    // NOTIFICATIONS & ALERTS
    notifications: {
        keywords: ['notifications', 'alerts', 'messages', 'system alerts', 'admin notifications'],
        response: () => `Notification & Alert Center! 🔔

Comprehensive notification and alert management:

📢 **Alert Management:**
- System critical alerts
- Performance threshold warnings
- Security incident notifications
- User activity alerts

📧 **Communication Channels:**
- Email notifications
- SMS alerts setup
- In-app messaging
- Push notification management

🎯 **Alert Configuration:**
- Alert rule customization
- Notification preferences
- Escalation procedures
- Alert scheduling

📊 **Notification Analytics:**
- Alert response tracking
- Notification effectiveness analysis
- User engagement metrics
- System performance alerts

Stay informed about critical events! {{NAVIGATE: notifications}}`
    },

    // HELP & SUPPORT
    help: {
        keywords: ['help', 'support', 'how to', 'guide', 'tutorial', 'admin support', 'assistance'],
        response: () => `Admin Support Center! 🤖

Here's how I can assist you:

🔧 **System Administration:**
- System configuration guidance
- Troubleshooting assistance
- Performance optimization
- Security best practices

📊 **Data Management:**
- Analytics and reporting help
- Data interpretation
- Dashboard customization
- Report generation assistance

🔐 **Security Support:**
- Security policy implementation
- Compliance guidance
- Threat response procedures
- Privacy protection measures

🚀 **Platform Management:**
- User administration guidance
- Integration setup assistance
- Feature configuration help
- Technical support coordination

I'm here to support your administrative excellence! 🌟`
    },

    default: {
        response: (userMessage) => `Hello! I'm your Administrative Assistant, here to support your system management excellence! 🔑

I can help you with:
- 👥 User management and access control
- 📊 System monitoring and analytics
- 🔧 Configuration and settings management
- 🔒 Security and compliance oversight
- 📚 Content and resource management
- 🔄 Integration and API management
- 💾 Data backup and recovery
- 📢 Notifications and alert management

What administrative task would you like to handle today? I'm here to ensure smooth system operations! 🌟`
    }
};
