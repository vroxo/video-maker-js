const algorithmia = require('algorithmia');
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey;
const sentenceBoundaryDetection = require('sbd');

const credeltials_watson = require('../credentials/watson-nlu');
const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
const { IamAuthenticator } = require('ibm-watson/auth');

const nlu = new NaturalLanguageUnderstandingV1({
    authenticator: new IamAuthenticator({ apikey: credeltials_watson.apikey}),
    version: '2020-03-19',
    url: credeltials_watson.url
});

const state = require('./state');

async function robot(content) {
    content = state.load();

    await fetchContentFromWikipedia(content);
    sanitizeContent(content);
    breakContentIntoSentences(content);
    limitMaximumSentences(content);
    await fetchKeywordsOfAllSentences(content);

    state.save(content);

    async function fetchContentFromWikipedia(content){
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey);
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
        const wikipediaContent = wikipediaResponse.get();
        content.sourceContentOriginal = wikipediaContent.content
    }

    function sanitizeContent(content){
        const withoutBlankLinesAndMarkdown = removeBlankLinesAndMarkdown(content.sourceContentOriginal);
        content.sourceContentSanitized = removeDatesInParentheses(withoutBlankLinesAndMarkdown);
    }

    function removeBlankLinesAndMarkdown(text) {
        const allLines = text.split('\n');
        const withoutBlankLinesAndMarkdown = allLines.filter((line) => {
            return line.trim().length !== 0 && !line.trim().startsWith('=');
        });

        return withoutBlankLinesAndMarkdown.join(" ");
    }

    function removeDatesInParentheses(text) {
        return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
    }

    function breakContentIntoSentences(content){
        content.sentences = [];
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images:[]
            })
        })
    }

    function limitMaximumSentences(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordsOfAllSentences(content) {
        console.log('> [text-robot] Starting to fetch keywords from Watson');

        for (const sentence of content.sentences) {
            console.log(`> [text-robot] Sentence: "${sentence.text}"`);

            try {
                sentence.keywords = await fetchWatsonAndReturnKeywords(sentence.text);
            }catch (err) {
                console.log(err.toString())
            }

            console.log(`> [text-robot] Keywords: ${sentence.keywords.join(', ')}\n`)
        }
    }

    async function fetchWatsonAndReturnKeywords(sentence){
        const body = await nlu.analyze({
            text: sentence,
            features: {
                keywords: {}
            }
        });
        return body.result.keywords.map((keyword) => {
            return keyword.text
        })
    }
}

module.exports = robot;
