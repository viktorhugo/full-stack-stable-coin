export const CONTRACT_CONFIG = {
  // Replace with your actual deployed contract address
  DSC_ENGINE_ADDRESS: "0x1234567890123456789012345678901234567890",

  // Common EVM networks
  NETWORKS: {
    ETHEREUM_MAINNET: {
      chainId: 1,
      name: "Ethereum Mainnet",
      rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    },
    SEPOLIA: {
      chainId: 11155111,
      name: "Sepolia Testnet",
      rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    },
    POLYGON: {
      chainId: 137,
      name: "Polygon Mainnet",
      rpcUrl: "https://polygon-rpc.com",
    },
  },

  // Target network for the DApp
  TARGET_NETWORK: 11155111, // Sepolia testnet by default

  // Contract ABI - This would be the actual ABI from your DSCEngine contract
  DSC_ENGINE_ABI: [
    // Core functions
    "function depositCollateralAndMintDsc(address tokenCollateralAddress, uint256 amountCollateral, uint256 amountDscToMint) external",
    "function depositCollateral(address tokenCollateralAddress, uint256 amountCollateral) external",
    "function redeemCollateralForDsc(address tokenCollateral, uint256 amountCollateral, uint256 amountDscToBurn) external",
    "function redeemCollateral(address tokenCollateral, uint256 amountCollateral) external",
    "function mintDsc(uint256 amountDscToMint) external",
    "function burnDsc(uint256 amount) external",
    "function liquidate(address collateral, address user, uint256 debtToCover) external",

    // View functions
    "function getAccountCollateralValue(address user) external view returns (uint256)",
    "function getAccountInformation(address user) external view returns (uint256 totalDscMinted, uint256 collateralValueInUsd)",
    "function getHealthFactor(address user) external view returns (uint256)",
    "function getCollateralTokens() external view returns (address[])",
    "function getCollateralTokenPriceFeed(address token) external view returns (address)",
    "function getTokenAmountFromUsd(address token, uint256 usdAmountInWei) external view returns (uint256)",
    "function getUsdValue(address token, uint256 amount) external view returns (uint256)",
    "function getCollateralBalanceOfUser(address user, address token) external view returns (uint256)",

    // Events
    "event CollateralDeposited(address indexed user, address indexed token, uint256 indexed amount)",
    "event CollateralRedeemed(address indexed redeemFrom, address indexed redeemTo, address token, uint256 amount)",
    "event TransferTokenCollateral(address indexed from, address indexed to, address indexed token, uint256 amount)",
  ],
}
