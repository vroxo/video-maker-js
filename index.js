const readline = require('readline-sync')

function start(){
    const content = {}

    content.searchTerm = askAndReturnSearchTerm()
    content.prefixe = askAndReturnPrefix()

    function askAndReturnSearchTerm(){
        return readline.question('Talk a Wikipedia search term: ')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes)
        const selectedPrefixText = prefixes[selectedPrefixIndex]

        return selectedPrefixText
    }

    console.log(content)
}

start()