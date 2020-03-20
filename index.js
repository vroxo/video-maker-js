const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text'),
    state: require('./robots/state'),
    image: require('./robots/image'),
    video: require('./robots/video')
};

async function start(){
    // await robots.input();
    // await robots.text();
    // await robots.image();
    await robots.video();

    const content = robots.state.load();
    console.dir(content, {depth: null});
}

start();
