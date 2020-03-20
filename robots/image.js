const gm = require('gm').subClass({imageMagick: true});
const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const imageDownloader = require('image-downloader');
const state = require('./state');

const googleSearchCredentials = require('../credentials/google-search');

async function robot() {
    console.log('> [image-robot] Starting...');
    const content = state.load();
    await fetchImagesOfAllSentences(content);
    await donwloadAllImages(content);
    state.save(content);
    console.log('> [image-robot] Fetching done!');

    async function fetchImagesOfAllSentences(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            let query;

            if (sentenceIndex === 0) {
                query = `${content.searchTerm}`
            } else {
                query = `${content.searchTerm} ${content.sentences[sentenceIndex].keywords[0]}`;
            }
            console.log(`> [image-robot] Querying Google Images with: "${query}"`);

            content.sentences.images = await fetchGoogleAndReturnImagesLinks(query);
            content.sentences.gooagleSearchQuery = query;
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

    async function donwloadAllImages(content) {
        content.downloadedImages = [];
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images;

            for (let imagesIndex = 0; imagesIndex < images.length; imagesIndex++) {
                const imageUrl = images[imagesIndex];

                try {
                    if (content.downloadedImages.includes(imageUrl)) {
                        throw new Error(`Imagem já foi baixada: ${imageUrl}`);
                    }

                    await downloadImageAndSave(imageUrl, `${sentenceIndex}-original.png`);
                    content.downloadedImages.push(imageUrl);
                    console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Image successfully downloaded: ${imageUrl}`);
                    break;
                } catch (e) {
                    console.log(`> [image-robot] [${sentenceIndex}][${imageIndex}] Error (${imageUrl}): ${error}`)                }
            }
        }
    }

    async function downloadImageAndSave(url, filename) {
        return imageDownloader({
            url: url,
            dest: `./content/${filename}`
        });
    }
}

module.exports = robot;