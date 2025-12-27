---
title: Apex Programming Basics
date: 2024-12-28
---

# Apex Programming Basics

Apex is Salesforce's proprietary programming language, similar to Java. It enables developers to add custom business logic to their Salesforce applications.

## What is Apex?

Apex is a strongly-typed, object-oriented programming language that runs on the Salesforce platform. It allows developers to:

- Execute flow and transaction control statements
- Make calls to Salesforce APIs
- Add custom business logic to system events

## Data Types

### Primitive Types

```apex
// Primitive data types in Apex
Integer count = 10;
Long bigNumber = 123456789L;
Double price = 99.99;
Decimal precise = 123.456789;
String name = 'Hello World';
Boolean isActive = true;
Date today = Date.today();
DateTime now = DateTime.now();
Id recordId = '001xx000003DIlo';
```

### Collections

Apex provides three main collection types:

#### Lists

```apex
// List example
List<String> names = new List<String>();
names.add('Alice');
names.add('Bob');
names.add('Charlie');

// Or initialize directly
List<Integer> numbers = new List<Integer>{1, 2, 3, 4, 5};
```

#### Sets

```apex
// Set example - no duplicates allowed
Set<String> uniqueNames = new Set<String>();
uniqueNames.add('Alice');
uniqueNames.add('Alice'); // Won't be added again
System.debug(uniqueNames.size()); // Output: 1
```

#### Maps

```apex
// Map example
Map<Id, Account> accountMap = new Map<Id, Account>();

// Populate from query
accountMap = new Map<Id, Account>([
    SELECT Id, Name FROM Account LIMIT 10
]);
```

## SOQL Queries

Salesforce Object Query Language (SOQL) is used to retrieve data:

```apex
// Basic query
List<Contact> contacts = [
    SELECT Id, FirstName, LastName, Email
    FROM Contact
    WHERE AccountId != null
    ORDER BY LastName
    LIMIT 100
];

// Aggregate query
AggregateResult[] results = [
    SELECT COUNT(Id) total, AccountId
    FROM Contact
    GROUP BY AccountId
];
```

## DML Operations

Data Manipulation Language operations modify records:

```apex
// Insert
Account acc = new Account(Name = 'New Company');
insert acc;

// Update
acc.Name = 'Updated Company';
update acc;

// Upsert (insert or update)
upsert acc;

// Delete
delete acc;
```

## Triggers

Triggers execute before or after DML operations:

```apex
trigger AccountTrigger on Account (before insert, before update) {
    for (Account acc : Trigger.new) {
        // Validation logic
        if (acc.Name == null || acc.Name.length() < 2) {
            acc.addError('Account name must be at least 2 characters');
        }
    }
}
```

### Trigger Best Practices

1. **One trigger per object** - Keep logic organized
2. **Use handler classes** - Separate logic from trigger
3. **Bulkify your code** - Always handle multiple records
4. **Avoid SOQL in loops** - Query before the loop

## Governor Limits

Salesforce enforces limits to ensure shared resources:

| Limit | Maximum |
|-------|---------|
| SOQL Queries | 100 per transaction |
| DML Statements | 150 per transaction |
| Records Retrieved | 50,000 per transaction |
| CPU Time | 10,000 ms |

## Conclusion

Apex is a powerful language for customizing Salesforce. Understanding the basics of data types, collections, SOQL, and DML operations is essential for any Salesforce developer.
