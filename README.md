# conjure
Repo for the Conjure Project for the Binance BSC Hackathon

# Deployed Addresses
Conjure Factory Contract [0xC5f1B0F3B7A765F8ba2bdc9bf1F1002fd7B12234 link](https://testnet.bscscan.com/address/0xC5f1B0F3B7A765F8ba2bdc9bf1F1002fd7B12234#code)

Collateral Factory Contract [0x0BCC2bbF5893A72188CE7c3DeaB206470Dd69978 link](https://testnet.bscscan.com/address/0x0BCC2bbF5893A72188CE7c3DeaB206470Dd69978#code)

# Description
By letting users simply set a reference source through oracle contracts to any contracts they wish, users can create completely arbitrary assets for any targeted assets they want. They can create synths which use med price from 5 oracles to produce say Synthetic BTC or av price from 4 sources to create a basket currency from USD, GBP, Euro, CNY to hedge monetary policy risk.

# All the Synths
By allowing users to simply provide 3 to 7 oracle sources, the contract will take the market value from the oracle set, using a safety param that allows for .33 to .45 failure and fault tolerance and use that along with a collateralization rate set at 1.2x, the system can mint any asset aslong as that asset has a price source. Using projects such as Link, uniswap or K33per or any signed values by exchanges the user can deposit ETH as collateral and mint the synthetic asset on demand. This contract can then be used by others to mint the same synth or choose another Synthesizer with different oracle sources allowing for market competition between Synthesizers competing for the most reliable synth for the asset. You can use this model to make synthetic currencies, commodities or synthesize weather, aslong as it has a value which can be tracked you can Conjure it.

# How It's Made
Oracles - generalized oracle struct to allow for calling oracle contracts to get reference rates and the target price for the asset.

Snx based collateralization and liquidation - allows you to collateralize the assets and keep collateralization beyond the needed amount to keep the target synth value

# Repo Structure

This repo will be built upon using the Next.js Framework for building the Dapp
It will also cover a dedicated /contracts folder where all the Solidity sources and libraries will be held.
