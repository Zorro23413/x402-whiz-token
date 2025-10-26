// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Direct imports from GitHub
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/token/ERC20/ERC20.sol";
import "https://github.com/OpenZeppelin/openzeppelin-contracts/blob/v5.0.0/contracts/access/Ownable.sol";

/**
 * @title CustomNameToken
 * @dev Secure ERC20 token with supply cap
 *
 * CUSTOMIZE YOUR TOKEN:
 * 1. Change "Whiz402" to your desired name (e.g., "Whiz Token")
 * 2. Change "Whiz402" to your desired symbol (e.g., "WHIZ")
 * 3. Optionally adjust MAX_SUPPLY and MINT_AMOUNT
 */
contract CustomNameToken is ERC20, Ownable {
    uint256 public constant MINT_AMOUNT = 100 * 10**18;
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18;

    event TokensMinted(address indexed to, uint256 amount, uint256 newTotalSupply);
    event MaxSupplyReached(uint256 totalSupply);

    // 👇 CHANGE THESE TWO VALUES 👇
    constructor() ERC20("Whiz402", "Whiz402") Ownable(msg.sender) {}
    // Example: ERC20("Whiz Token", "WHIZ")
    // Example: ERC20("Gold Coin", "GOLD")
    // Example: ERC20("Super Points", "SPTS")

    function mint(address to) public onlyOwner {
        require(to != address(0), "Cannot mint to zero address");
        require(
            totalSupply() + MINT_AMOUNT <= MAX_SUPPLY,
            "Max supply exceeded"
        );

        _mint(to, MINT_AMOUNT);
        emit TokensMinted(to, MINT_AMOUNT, totalSupply());

        if (totalSupply() == MAX_SUPPLY) {
            emit MaxSupplyReached(totalSupply());
        }
    }

    function remainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    function remainingMints() public view returns (uint256) {
        return remainingSupply() / MINT_AMOUNT;
    }
}
