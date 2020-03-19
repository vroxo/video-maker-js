const readline = require('readline-sync');
const Parser = require('rss-parser');
const robots = {
    // userInput: require('./robots/user-input.js'),
    text: require('./robots/text')
};

const TREND_URL = 'https://trends.google.com/trends/trendingsearches/daily/rss?geo=BR';

async function start(){
    const content = {};

    content.searchTerm = await askAndReturnSearchTerm();
    content.prefixe = askAndReturnPrefix();
    // robots.userInput(content)
    await robots.text(content);
    async function askAndReturnSearchTerm(){
        const response = readline.question('Talk a Wikipedia search term or G to fetch google trends: ');
        return (response.toUpperCase() === 'G') ? await askAndReturnTrend() : response
    }

    async function askAndReturnTrend(){
        console.log('Please Wait...');
        const trends = await getGoogleTrends();
        const choice = readline.keyInSelect(trends, 'Choose your trend: ');

        return trends[choice]
    }

    async function getGoogleTrends(){
        console.log('trends');
        const parser = new Parser();
        const trends = await parser.parseURL(TREND_URL);

        return trends.items.map(({title}) => title)
    }

    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of'];
        const selectedPrefixIndex = readline.keyInSelect(prefixes);
        return prefixes[selectedPrefixIndex]
    }

    console.log(content)
}

start();
