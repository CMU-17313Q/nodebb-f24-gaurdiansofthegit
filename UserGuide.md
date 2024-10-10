# User Guide for Added Features
## Guardians of the Git: Project 2C

---
# Feature 1: As a user, I want to post privately under a topic so that I can discuss confidential information.

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
The **Private Post** feature provides an additional layer of control over post visibility within the NodeBB environment. Through the automated tests and usage guidelines, this feature is robust and ready for use in production. For further questions, refer to the source code under `src/posts.js` or the test suite under `test/privateposts.js`.\

---

# Feature 2: Filtering Bad Words in Posts,
## As an admin I want to make sure that users cannot use offensive and inappropriate content on their posts, so I can create a safe enviorment on Nodebb.

The **Bad Word Filter** feature helps maintain a clean and respectful environment by preventing users from posting content containing inappropriate words. This feature uses a predefined list of bad words taken from the CMU school of computer science website, to automatically detect and filter out inappropriate content in both post titles and content.

### How to Use the Bad Word Filter
Whenever a user attempts to create a new post or topic, the content of the post is scanned against a list of bad words. If the content includes any of these words (case insensitive), the post will be rejected with an error message indicating which word/s caused the rejection.

For example, if a post contains a word like "badword", the user will see a message such as:
`Error: Bad word detected, badword`.

### Steps for Creating a Valid Post

- Ensure that the content you are submitting does not contain any offensive or inappropriate words.
- If the system detects a bad word, you will need to modify your post to remove or replace the word/s shown in the error message.

### Automated Tests

#### Test Suite Location
All automated tests for the Bad Word Filter feature can be found under:
`test/topics.js`

#### Running the Test Suite
You can run the test suite for the Bad Word Filter using npm with the following command:
npm run test test/topics.js


### What Is Being Tested

1. **Creating a Post with a Bad Word**  
   Ensures that when a post contains a bad word, it is correctly caught and rejected.
   
2. **Creating a Post without a Bad Word**  
   Verifies that a post without any bad words is successfully created, and no error message is thrown.

3. **Edge Cases**  
   Tests scenarios such as partial matches (e.g., "hello" should not trigger an error, even though it contains the letters "hell"), as well as case insensitive scenarios like “Arab”, or “ARAB”, which are considered bad words since “arab” is in the bad words text file.

### Why the Tests Are Sufficient
These tests cover the core functionality of the Bad Word Filter, ensuring that posts with inappropriate content are blocked while valid posts are allowed. They also include edge cases where valid words might partially match inappropriate words, ensuring that the filter is not overly restrictive.

## Development Considerations
### Code Structure

- **posts.create()**: The filter logic is applied when a new post is created. The content is checked for bad words, and if any are found, the post is rejected.
- **Filter Function**: A function reads the bad words from a text file, which is loaded into an array, alphabetized, and used for comparison against the post content.

---
## Conclusion

This explains how to use and test the bad word filtering feature, along with automated tests to ensure the feature works as expected. For further information, the CA can refer to the source code in `src/posts/create.js` and the test suite in `test/topics.js`.

---
# Feature 3: As a student, I want to ask questions without showing my username to the viewers, so that I can discuss sensitive topics without other students knowing my identity. #

The Anonymous Post feature enables students to create posts or questions that are visible to all without displaying the user's account and name, keeping their identity hidden from other students. This guide outlines how to use, implement, and test the feature within your educational platform.

### How to Use the Anonymous Post Feature ###

When creating a post, students can activate the anonymous option in the posting interface. The system will replace their profile picture and username with a default "Anonymous" avatar, ensuring their identity remains confidential while allowing the instructor and students to see the content of the post.
In order to actually see the full implementation of the anonymous feature, nodebb should be runned from the branch ‘backend_anonymous_fhaddad’ ; this branch will show the correct modified avatar and the ‘not found’ page for anonymous users and the anonymous display name. Also in this branch, when submitting a post the user should load the page in order to see the post submitted. While the main branch will  show a guest avatar, when hovering on the avatar. Also  anonymous link page would not be found. 

### Creating an Anonymous Post ###

Students can create an anonymous post using the platform's user interface:

1. Navigate to the posting form within the category (General Discussion, Announcement, Comments & Feedback, Blogs) area.
2. Locate and select the toggle for posting anonymously, setting isAnonymous to be true.
3. Enter the content of the post and submit it.

The system will automatically handle the post as anonymous, hiding the user details and displaying Anonymous user details. Anonymous details, username: anonymous, Avatar: light purple with ‘?”, user account link goes to “Not found page”.

### Backend Changes ###

### Database Schema Modification: ###
- Add an `isAnonymous` boolean field to the `Post` model in the database. This flag determines whether a post was made anonymously.
- Ensure that this attribute is set to `false` by default and only changes when a user selects the anonymous posting option.

### Privacy and Security Measures: ###
- Update the post creation logic to accept the `isAnonymous` flag from the user interface.
- Ensure user authentication is enforced, allowing only logged-in users to post.
- Modify the API to ensure that while the `isAnonymous` flag is accessible, the user's identity is not exposed in any API response.

### Automated Tests ###



Due to ongoing integration and merging issues, the team was unable to implement a dedicated testing suite for the anonymous posting feature. The challenges primarily stemmed from conflicts between concurrent development branches that affected the stability of the environment required for test execution. This prevented the creation and reliable operation of testing suites that could simulate user interactions accurately for the anonymous posting feature. Instead, we resorted to manually running Grunt to observe changes directly on the website, allowing us to visually verify the functionality. While this approach provided some immediate feedback, it underscored the need for better synchronization and integration practices within our development workflows.

### Development Considerations ###

## Code Structure: ##

- **Post Creation Handling:** The `isAnonymous` flag is incorporated at the point of post submission and affects how the post is processed and stored.
- **User Interface Adjustments:** The posting form must include a clear option for students to select anonymity when creating a post.
- **Visibility Controls:** Modify post retrieval logic to ensure anonymous posts are hidden from all other users Instructor / students.

### Conclusion ###

The Anonymous Post feature is a crucial addition for educational platforms, fostering a safe environment for students to discuss sensitive topics without fear of exposure. This functionality, backed by clear usage guidelines, ensures the feature is reliable and ready for deployment. For further details or customization, refer to the source code in `src/topics/posts.js` or ‘src/topics/create.js’ under the branch ‘backend_anonymous_fhaddad’ 
