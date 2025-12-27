---
title: Async/Await in JavaScript
date: 2024-12-28
---

# Async/Await in JavaScript

Async/await is modern JavaScript syntax for handling asynchronous operations. It makes asynchronous code look and behave like synchronous code.

## Understanding Promises First

Before diving into async/await, let's understand Promises:

```javascript
// A Promise represents a future value
const fetchData = () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve('Data loaded!');
        }, 1000);
    });
};

// Using .then()
fetchData()
    .then(data => console.log(data))
    .catch(error => console.error(error));
```

## The Async Keyword

The `async` keyword declares an asynchronous function:

```javascript
async function getData() {
    return 'Hello, World!';
}

// This is equivalent to:
function getData() {
    return Promise.resolve('Hello, World!');
}
```

## The Await Keyword

`await` pauses execution until a Promise resolves:

```javascript
async function fetchUser() {
    const response = await fetch('/api/user');
    const user = await response.json();
    return user;
}
```

### Important Rules

1. `await` can only be used inside `async` functions
2. `await` works with any thenable object
3. Error handling requires try/catch

## Error Handling

Use try/catch blocks with async/await:

```javascript
async function fetchData() {
    try {
        const response = await fetch('/api/data');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Fetch failed:', error);
        throw error;
    }
}
```

## Parallel Execution

### Sequential (Slower)

```javascript
// Each await waits for the previous one
async function sequential() {
    const user = await fetchUser();      // 1 second
    const posts = await fetchPosts();    // 1 second
    const comments = await fetchComments(); // 1 second
    // Total: 3 seconds
}
```

### Parallel (Faster)

```javascript
// All requests start at the same time
async function parallel() {
    const [user, posts, comments] = await Promise.all([
        fetchUser(),     // 1 second
        fetchPosts(),    // 1 second
        fetchComments()  // 1 second
    ]);
    // Total: 1 second
}
```

## Common Patterns

### Retry Logic

```javascript
async function fetchWithRetry(url, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            const response = await fetch(url);
            return await response.json();
        } catch (error) {
            if (i === maxRetries - 1) throw error;
            console.log(`Retry ${i + 1}/${maxRetries}`);
            await delay(1000 * (i + 1)); // Exponential backoff
        }
    }
}

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
```

### Loading States

```javascript
async function loadData() {
    setLoading(true);
    try {
        const data = await fetchData();
        setData(data);
    } catch (error) {
        setError(error.message);
    } finally {
        setLoading(false);
    }
}
```

## Best Practices

| Practice | Description |
|----------|-------------|
| Always handle errors | Use try/catch or .catch() |
| Avoid mixing patterns | Don't mix .then() with await |
| Use Promise.all() | For independent async operations |
| Consider Promise.allSettled() | When you need all results |

## Conclusion

Async/await makes asynchronous JavaScript more readable and maintainable. Combined with proper error handling and parallel execution patterns, it's the preferred way to handle async operations in modern JavaScript.
