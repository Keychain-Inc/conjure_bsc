async function main() {
    // We get the contract to deploy
    const EtherCollateralFactory = await ethers.getContractFactory("EtherCollateralFactory");
    const factory = await EtherCollateralFactory.deploy();
    await factory.deployed();
    console.log("EtherCollateralFactory deployed to:", factory.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
