import chokidar from 'chokidar';

const watcher = chokidar.watch('./scripts');

const scriptFunctions = new Map();

const loadModule = async (path) => {
    try {
        const fileName = path.replace('.js', '');
        const module = await import('../' + path + `?update=${Date.now()}`);

        scriptFunctions.set(fileName, Object.values(module)[0]);
    } catch (error) {
        console.error(`Error loading module ${path}:`, error);
    }
}

watcher.on('add', path => {
    loadModule(path);
    console.log(`Script added: ${path}`);
});

watcher.on('change', path => {
    loadModule(path);
    console.log(`Script changed: ${path}`);
});

watcher.on('unlink', path => {
    const fileName = path.replace('.js', '');
    scriptFunctions.delete(fileName);

    console.log(`Script removed: ${path}`);
});

export { scriptFunctions };