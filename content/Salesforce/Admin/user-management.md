---
title: User Management in Salesforce
date: 2024-12-28
---

# User Management in Salesforce

User management is a fundamental aspect of Salesforce administration. This guide covers everything you need to know about creating, managing, and maintaining users in your Salesforce org.

## Understanding User Records

Every user in Salesforce has a user record that contains important information about their identity and access levels.

### Key User Fields

| Field | Description |
|-------|-------------|
| Username | Unique identifier (email format) |
| Email | User's email address |
| Profile | Determines base permissions |
| Role | Position in role hierarchy |
| License | Type of Salesforce license |

## Creating New Users

To create a new user in Salesforce:

1. Navigate to **Setup**
2. In the Quick Find box, type "Users"
3. Click **Users** under Administration
4. Click the **New User** button

### Required Information

When creating a user, you must provide:

- First Name and Last Name
- Email Address
- Username (must be unique across all Salesforce orgs)
- User License
- Profile

```apex
// Example: Creating a user via Apex
User newUser = new User(
    FirstName = 'John',
    LastName = 'Doe',
    Email = 'john.doe@example.com',
    Username = 'john.doe@example.com.sandbox',
    Alias = 'jdoe',
    ProfileId = [SELECT Id FROM Profile WHERE Name = 'Standard User'].Id,
    TimeZoneSidKey = 'America/Los_Angeles',
    LocaleSidKey = 'en_US',
    EmailEncodingKey = 'UTF-8',
    LanguageLocaleKey = 'en_US'
);
insert newUser;
```

## User Licenses

Salesforce offers different types of licenses:

### Full Licenses
- **Salesforce** - Full CRM functionality
- **Salesforce Platform** - Custom apps only

### Limited Licenses
- **Chatter Free** - Collaboration features only
- **Community** - External user access

## Best Practices

> Always follow the principle of least privilege when assigning permissions to users.

Here are some key best practices:

1. **Use Permission Sets** - Extend permissions without changing profiles
2. **Regular Audits** - Review user access quarterly
3. **Deactivate, Don't Delete** - Preserve data integrity
4. **Strong Password Policies** - Enforce security requirements

## Deactivating Users

When an employee leaves:

```apex
// Deactivate a user
User u = [SELECT Id, IsActive FROM User WHERE Username = 'departing.user@company.com'];
u.IsActive = false;
update u;
```

### Post-Deactivation Checklist

- [ ] Transfer record ownership
- [ ] Reassign open tasks and events
- [ ] Update email routing rules
- [ ] Review sharing rules

## Conclusion

Effective user management is crucial for maintaining security and ensuring users have appropriate access to perform their roles. Regular reviews and adherence to best practices will help keep your org secure and well-organized.
