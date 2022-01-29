import React, { Component } from 'react';
import Web3 from 'web3';
import Color from '../abis/Color.json'
import './App.css'
class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            account: ""
        }
    }

    async componentWillMount() {
        const web3Loaded = await this.loadWeb3()
        if (web3Loaded)
            await this.loadBlockchainData();
    }

    async loadBlockchainData() {

        const web3 = this.state.web3;

        try {

            const networkId = await web3.eth.net.getId()
            const networkData = Color.networks[networkId];
            if (networkData) {
                const abi = Color.abi;
                const address = networkData.address;
                const colorContract = new web3.eth.Contract(abi, address);

                const totalSupply = parseInt(await colorContract.methods
                    .totalSupply()
                    .call());
                const colors = [];

                for (const i of [...Array(totalSupply).keys()]) {
                    const color = await colorContract.methods
                        .colors(i)
                        .call();
                    colors.push(color);
                }

                this.setState({ colors, colorContract })
            }
            else
                alert("Contract not deployed in this network")
        }
        catch (err) {
            console.log(err)
            this.setState({ errMessage: err.message })
            return;
        }
    }

    async loadWeb3() {
        let web3;

        //check if MetaMask exists
        if (typeof window.ethereum === 'undefined') {
            this.setState({ errMessage: 'Please install MetaMask' })
            return false;
        }

        web3 = new Web3(window.ethereum);
        window.web3 = web3;

        const accounts = await web3.eth.getAccounts();
        const account = accounts[0];

        if (!account) {
            await window.ethereum.enable(); // This line opens up metamask popup
            await this.loadWeb3();
            return false;
        }

        this.setState({ web3, account })
        return true;
    }

    async mint(newColor) {

        if (!this.isColor(newColor))
            return this.setState({ errMessage: "Please enter a valir color (example: #ffffff" });
        if (this.state.colors.includes(newColor))
            return this.setState({ errMessage: "Color already minted" });

        const web3 = this.state.web3;
        const colorContract = this.state.colorContract;
        const account = this.state.account;
        await colorContract.methods
            .mint(newColor)
            .send({ from: account },
                async (error, receipt) => {
                    if (receipt) {
                        this.setState({ colors: [] });
                        this.setState({ okMessage: "The block is being mined. Please wait couple of seconds and refresh the screen." });
                        return await this.loadBlockchainData();
                    }
                    if (error)
                        console.log(error)
                });

    }


    isColor = (strColor) => {
        const s = new Option().style;
        s.color = strColor;
        return s.color !== '';
    }

    render() {
        return (
            <div>
                <nav className="navbar navbar-dark fixed-top bg-dark flex-md-nowrap p-0 shadow">
                    <a
                        className="navbar-brand col-sm-3 col-md-2 mr-0"
                        href="http://www.dappuniversity.com/bootcamp"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Super Colors NFT
                    </a>
                    <ul className="navbar-nav px-3">
                        <li>
                            <span className="text-white">{this.state.account}</span>
                        </li>
                    </ul>
                </nav>
                <div className="container-fluid mt-5">
                    <div className="row">
                        <main role="main" className="col-lg-12 d-flex text-center">
                            <div className="content mr-auto ml-auto">

                                <h1>Mint a Color</h1>
                                <form onSubmit={(event) => {
                                    event.preventDefault();
                                    const newColor = this.newColor.value;
                                    this.mint(newColor);

                                }}>
                                    <input
                                        type="text"
                                        className="form-control mb-1"
                                        placeholder="example #FFFFFF"
                                        required
                                        onChange={() => { this.setState({ errMessage: "" }); }}
                                        ref={(input) => { this.newColor = input }}
                                    />

                                    <input
                                        type="submit"
                                        className="btn btn-block btn-primary"
                                        value='MINT'

                                    />
                                    <br></br>
                                    <h4 className="text-danger">{this.state.errMessage}</h4>
                                    <h4 className="text-success">{this.state.okMessage}</h4>

                                </form>
                            </div>
                        </main>
                    </div>
                    <hr />
                    <div className="row text-center">
                        {!this.state.colors ? <br></br> :
                            this.state.colors.map((color, key) => {
                                return <div key={key} className="col-md-2 mb-3">
                                    <div className="token" style={{ backgroundColor: color }}></div>
                                    <div>{color} </div>
                                </div>
                            })}
                    </div>
                </div>
            </div>
        );
    }
}

export default App;
