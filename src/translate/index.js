'use strict';

// eslint-disable-next-line no-var, no-unused-vars
var request = require('request');

const translatorApi = module.exports;

translatorApi.translate = async function (postData) {
	// Edit the translator URL below
	const TRANSLATOR_API = 'https://translator-gotg.azurewebsites.net/';
	const response = await fetch(`${TRANSLATOR_API}/?content=${postData.content}`);
	const data = await response.json();
	return [data.is_english, data.translated_content];
};
