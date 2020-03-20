const gm = require('gm').subClass({ imageMagick: true });
const google = require('googleapis').google;
const customSearch = google.customsearch('v1');
const imageDownloader = require('image-downloader');
const state = require('./state');

const googleSearchCredentials = require('../credentials/google-search');

async function robot(){
    const content = state.load();
    // await fetchImagesOfAllSentences(content);
    // await donwloadAllImages(content);
    // await convertAllImages(content);
    // await createAllSentenceImages(content);
    await createYouTubeThumbnail();
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

    async function donwloadAllImages(content){
        content.downloadedImages = [];
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            const images = content.sentences[sentenceIndex].images;

            for (let imagesIndex = 0; imagesIndex < images.length; imagesIndex++){
                const imageUrl = images[imagesIndex];

                try{
                    if (content.downloadedImages.includes(imageUrl)){
                        throw new Error(`Imagem já foi baixada: ${imageUrl}`);
                    }

                    await downloadImageAndSave(imageUrl, `${sentenceIndex}-original.png`);
                    content.downloadedImages.push(imageUrl);
                    console.log(`> Baixou a imagem com sucesso: ${imageUrl}`);
                    break;
                }catch (e) {
                    console.log(`> Erro ao tentar baixar a imagem ${imageUrl}: ${e}`);
                }


            }
        }
    }

    async function downloadImageAndSave(url, filename){
        return imageDownloader({
           url: url,
           dest: `./content/${filename}`
        });
    }
}
module.exports = robot;