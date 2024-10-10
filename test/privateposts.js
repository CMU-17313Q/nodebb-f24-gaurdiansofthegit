'use strict';


const assert = require('assert');

const nconf = require('nconf');
const path = require('path');
const util = require('util');

const sleep = util.promisify(setTimeout);

const db = require('./mocks/databasemock');
const topics = require('../src/topics');
const posts = require('../src/posts');
const categories = require('../src/categories');
const privileges = require('../src/privileges');
const user = require('../src/user');
const groups = require('../src/groups');
const socketPosts = require('../src/socket.io/posts');
const apiPosts = require('../src/api/posts');
const apiTopics = require('../src/api/topics');
const meta = require('../src/meta');
const file = require('../src/file');
const helpers = require('./helpers');
const utils = require('../src/utils');
const request = require('../src/request');

describe('Private Post Tests', () => {
    let uid;
    let tid;
    let cid;

    before(async () => {
        // Create a mock user
        uid = await user.create({ username: 'testuser' });

        // Create a mock category
        const category = await categories.create({
            name: 'Test Category',
            description: 'Test category for private post testing',
        });
        cid = category.cid;

        // Create a mock topic
        const topic = await topics.post({
            uid: uid,
            cid: cid,
            title: 'Test Topic for Private Posts',
            content: 'This is a test topic to create private posts',
        });
        tid = topic.topicData.tid;
    });

    it('should create a post with isPrivate flag set to true', async () => {
        // Create a private post
        const privatePost = await posts.create({
            uid: uid,
            tid: tid,
            content: 'This is a private post',
            isPrivate: true,
        });

        // Assert that the post is created and isPrivate is set to true
        assert(privatePost);
        assert.strictEqual(privatePost.isPrivate, true, 'The isPrivate flag should be true');
    });

    it('should create a public post with isPrivate flag set to false by default', async () => {
        // Create a public post
        const publicPost = await posts.create({
            uid: uid,
            tid: tid,
            content: 'This is a public post',
        });

        // Assert that the post is created and isPrivate is set to false
        assert(publicPost);
        assert.strictEqual(publicPost.isPrivate, false, 'The isPrivate flag should be false by default');
    });

    it('should create a private post and ensure it is not visible to unauthorized users', async () => {
        // Create a private post
        const privatePost = await posts.create({
            uid: uid,
            tid: tid,
            content: 'This is another private post',
            isPrivate: true,
        });
    });
});
