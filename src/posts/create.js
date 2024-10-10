'use strict';

const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const meta = require('../meta');
const db = require('../database');
const plugins = require('../plugins');
const user = require('../user');
const topics = require('../topics');
const categories = require('../categories');
const groups = require('../groups');
const privileges = require('../privileges');

module.exports = function (Posts) {
	Posts.create = async function (data) {
		// This is an internal method, consider using Topics.reply instead
		const { uid } = data;
		const { tid } = data;
		const content = data.content.toString();
		const timestamp = data.timestamp || Date.now();
		const isMain = data.isMain || false;
		// added a variable to track whether post is anon
		const isAnonymous = data.isAnonymous || false;
		const isPrivate = data.isPrivate || false;
		// added a variable to track the type of post

		if (!uid && parseInt(uid, 10) !== 0) {
			throw new Error('[[error:invalid-uid]]');
		}

		if (data.toPid) {
			await checkToPid(data.toPid, uid);
		}

		// Copilot assisted code
		// Load bad words list
		const badWords = loadBadWords();
		// Check content against bad words
		console.log('Checking content:', content); // Log the content being checked
		const detectedBadWords = badWords.filter(regex => regex.test(content)).map(regex => content.match(regex)[0]);
		if (detectedBadWords.length > 0) {
			console.log('Detected bad words:', detectedBadWords); // Log the bad words detected
			throw new Error(`[[error:bad-word-detected, ${detectedBadWords.join(', ')}]]`);
		}

		const pid = await db.incrObjectField('global', 'nextPid');
		let postData = {
			pid: pid,
			uid: isAnonymous ? 0 : data.uid,
			tid: tid,
			content: content,
			timestamp: timestamp,
			isPrivate: isPrivate,
			isAnonymous: isAnonymous,
		};

		if (data.toPid) {
			postData.toPid = data.toPid;
		}
		if (data.ip && meta.config.trackIpPerPost) {
			postData.ip = data.ip;
		}
		if (data.handle && !parseInt(uid, 10)) {
			postData.handle = data.handle;
		}

		let result = await plugins.hooks.fire('filter:post.create', { post: postData, data: data });
		postData = result.post;
		await db.setObject(`post:${postData.pid}`, postData);

		const topicData = await topics.getTopicFields(tid, ['cid', 'pinned']);
		postData.cid = topicData.cid;

		await Promise.all([
			db.sortedSetAdd('posts:pid', timestamp, postData.pid),
			db.incrObjectField('global', 'postCount'),
			user.onNewPostMade(postData),
			topics.onNewPostMade(postData),
			categories.onNewPostMade(topicData.cid, topicData.pinned, postData),
			groups.onNewPostMade(postData),
			addReplyTo(postData, timestamp),
			Posts.uploads.sync(postData.pid),
		]);

		result = await plugins.hooks.fire('filter:post.get', { post: postData, uid: data.uid });
		result.post.isMain = isMain;
		plugins.hooks.fire('action:post.save', { post: _.clone(result.post) });
		return result.post;
	};

	// Copilot assisted code
	// Function to load bad words from the public folder
	function loadBadWords() {
		console.log('Loading bad words'); // Debugging statement
		const badWordsFilePath = path.join(__dirname, '../../public/bad-words.txt');
		console.log('Bad words file path:', badWordsFilePath); // Debug statement
		const badWords = fs.readFileSync(badWordsFilePath, 'utf8')
			.split('\n')
			.map(word => word.trim())
			.filter(word => word.length > 0)
			.map(word => new RegExp(`\\b${word}\\b`, 'i')); // Create regex for whole word match
		console.log('Bad words:', badWords); // Debugging statement
		return badWords;
	}

	async function addReplyTo(postData, timestamp) {
		if (!postData.toPid) {
			return;
		}
		await Promise.all([
			db.sortedSetAdd(`pid:${postData.toPid}:replies`, timestamp, postData.pid),
			db.incrObjectField(`post:${postData.toPid}`, 'replies'),
		]);
	}

	async function checkToPid(toPid, uid) {
		const [toPost, canViewToPid] = await Promise.all([
			Posts.getPostFields(toPid, ['pid', 'deleted']),
			privileges.posts.can('posts:view_deleted', toPid, uid),
		]);
		const toPidExists = !!toPost.pid;
		if (!toPidExists || (toPost.deleted && !canViewToPid)) {
			throw new Error('[[error:invalid-pid]]');
		}
	}
};
