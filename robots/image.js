const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const state = require('./state');

const googleSearchCredentials = require('../credentials/google-search');

async function robot(){
    const content = state.load();
    await fetchImagesOfAllSentences(content);
    state.save(content);

    async function fetchImagesOfAllSentences(content){
        for (const sentence of content.sentences){
            const query = `${content.searchTerm} ${sentence.keywords[0]}`;
            sentence.images = await fetchGoogleAndReturnImagesLinks(query);

            sentence.gooagleSearchQuery = query;
        }
    }

    async function fetchGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,
            q: query,
            searchType: "image",
            num: 2
        });

        return response.data.items.map((item) => {
            return item.link
        })
    }
}

module.exports = robot;