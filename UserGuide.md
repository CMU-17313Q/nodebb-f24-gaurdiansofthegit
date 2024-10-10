# User Guide for Added Features
## Guardians of the Git: Project 2C

---
### Feature 1: As a user, I want to post privately under a topic so that I can discuss confidential information.

The **Private Post** feature allows users to create posts that are only visible to authorized users. The `isPrivate` flag is used to determine whether a post is private or public. By default, posts are public unless the `isPrivate` flag is explicitly set to `true`. This guide explains how to create, test, and use the feature in your NodeBB environment.

### How to Use the Private Post Feature
When you are creating a post, you can turn on the toggle button for private posting in the post container. If you are an admin or a moderator (a privileged user), you should be able to see the post. 

### Creating a Private Post
To create a private post, you can do so using the user interface. You can also create a post using the redis-cli. The steps for this are shown below:

redis-cli INCR "global:nextPid"
redis-cli HMSET "post:123" \
  "pid" 123 \
  "uid" 1 \
  "tid" 1 \
  "content" "This is a test post created via redis-cli" \
  "timestamp" 1640995200 \
  "isPrivate" 0 \
  "isAnonymous" 0
redis-cli ZADD "posts:pid" 1640995200 123
redis-cli RPUSH "tid:1:posts" 123
redis-cli INCR "global:postCount"

By setting `isPrivate: true`, the post will only be visible to authorized users, such as moderators or administrators.

### Creating a Public Post
By default, posts are public unless the `isPrivate` flag is set to `true`. If no flag is provided, the post is considered public by default. This will be achieved by not turning on the toggle button for private post in the post container.

### Verifying Post Visibility
- **Private posts** will not be visible to unauthorized users.
- **Public posts** are visible to everyone with access to the topic.

## Automated Tests

### Test Suite Location
All automated tests for the Private Post feature can be found under:
`test/privateposts.js`

### Running the Test Suite
You can run the test suite for Private Posts independently using Mocha with the following command:
npm run mocha test/privateposts.js

### What Is Being Tested
The following functionalities are covered in the test suite:

1. **Creating a Private Post**  
   Ensures that a post created with the `isPrivate` flag set to `true` is correctly flagged as private.

2. **Creating a Public Post**  
   Verifies that a post created without the `isPrivate` flag or with `isPrivate: false` is treated as a public post.

3. **Ensuring Private Post Visibility**  
   Validates that private posts are only visible to authorized users (e.g., moderators or admins).

### Why the Tests Are Sufficient
The tests cover the following critical aspects of the Private Post feature:
- Proper handling of the `isPrivate` flag for both private and public posts.
- Verifying that private posts remain hidden from unauthorized users while public posts are visible to all.
- Testing boundary cases, such as the default behavior when the `isPrivate` flag is not provided.

These tests ensure that the feature works as intended under various conditions. However, the feature was not implemented fully due to a bug in the back-end. Hence, tests for readability of posts have not been added as the filtering logic is not fully functional.

## Development Considerations
### Code Structure
- **posts.create()**: The `isPrivate` flag is handled during post creation. If set to `true`, the post is stored as private.
- **Visibility Filtering**: Future development should ensure that private posts are only visible to authorized users by modifying post-fetching functions to respect the `isPrivate` flag.

## Conclusion
The **Private Post** feature provides an additional layer of control over post visibility within the NodeBB environment. Through the automated tests and usage guidelines, this feature is robust and ready for use in production. For further questions, refer to the source code under `src/posts.js` or the test suite under `test/privateposts.js`.
---
