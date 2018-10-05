
const { suite, test, before } = intern.getPlugin('interface.tdd');
const { assert } = intern.getPlugin('chai');

suite('Simple Dedicated Worker', () => {

    before(async ({ remote }) => {

        await remote.get('test/functional/index.html');
        await remote.setFindTimeout(5000);
        await remote.findById('ready-status');
    });

    /**
     * Test our workerManager is exported into global scope as window.wwm
     * @test
     */
    test('WorkerManager is available in global scope', async ({ remote }) => {

        const wwm = await remote.execute(function () {
            return window.wwm !== 'undefined';
        });

        assert.isTrue(wwm);
    });

    /**
     * Check the WorkerManager creates images
     * @test
     */
    test('WorkerManager creates worker images correctly', async ({ remote }) => {

        await remote.findById('btn-image').click();
        const output = await remote.findById('console').getVisibleText();

        assert.include(output, 'WWM: image created');
    });

    /**
     * Test the WorkerManager starts workers from named images
     * @test
     */
    test('WorkerManager starts a named worker correctly', async ({ remote }) => {

        await remote.findById('btn-start').click().sleep(1000);
        
        const state = await remote.execute(function () {
            return window.wwm.getWorkerState('helloWorker');
        });

        assert.equal(state, 0);

        await remote.sleep(5000).end();
    });

});