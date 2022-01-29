const { assert } = require('chai');

const Color = artifacts.require('./Color.sol')
require('chai')
    .use(require('chai-as-promised'))
    .should()

contract('Color', (account) => {
    let contract;

    beforeEach(async () => {
        contract = await Color.deployed();
    })

    describe('deployment', async () => {

        it('deploys successfully', async () => {
            const address = contract.address;
            assert.notEqual(address, '');
            assert.notEqual(address, 0x0);
            assert.notEqual(address, null);
            assert.notEqual(address, undefined);
        })
        it('has a name', async () => {
            const name = await contract.name();

            assert.notEqual(name, '');
            assert.equal(name, '0xFriends');
        })
        it('has a symbol', async () => {
            const symbol = await contract.symbol();

            assert.notEqual(symbol, '');
            assert.equal(symbol, '0XF');
        })
    })

    describe('minting', async () => {
        it('creates a new token', async () => {
            const result = await contract.mint('#FA6325');
            const totalSupply = await contract.totalSupply();
            // SUCCESS
            assert.equal(totalSupply, 1);

            const event = result.logs[0].args;
            assert.equal(event.tokenId.toNumber(), totalSupply, 'id is correct');

            // FAILURE
            assert.notEqual(totalSupply, 0);

            await contract.mint("#FA6325").should.be.rejected;
            await contract.mint("#FA6320").should.not.be.rejected;
        })
    })

    describe('indexing', async () => {
        it('lists colors', async () => {
            await contract.mint('#FFFFFF');
            await contract.mint('#000000');

            const totalSupply = await contract.totalSupply();

            let color;
            let result = [];

            for (let i = 0; i < totalSupply; i++) {
                color = await contract.colors(i);
                result.push(color)
            }
            const expected = ['#FA6325', '#FA6320', '#FFFFFF', '#000000']
            assert.equal(result.join(','), expected.join(','))
        })

    })
})