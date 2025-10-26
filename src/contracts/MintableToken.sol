// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MintableToken
 * @dev Secure ERC20 token with supply cap that mints 100 tokens per call
 *
 * Security Features:
 * - Maximum supply cap of 1,000,000 tokens
 * - Only owner can mint (prevents unauthorized minting)
 * - Emits events for transparency
 * - Uses OpenZeppelin's audited contracts
 */
contract MintableToken is ERC20, Ownable {
    // Constants
    uint256 public constant MINT_AMOUNT = 100 * 10**18; // 100 tokens with 18 decimals
    uint256 public constant MAX_SUPPLY = 1_000_000 * 10**18; // 1 million tokens max

    // Events for transparency
    event TokensMinted(address indexed to, uint256 amount, uint256 newTotalSupply);
    event MaxSupplyReached(uint256 totalSupply);

    constructor() ERC20("X402 Token", "X402") Ownable(msg.sender) {}

    /**
     * @dev Mints 100 tokens to the specified address
     * @param to Address to receive the minted tokens
     *
     * Requirements:
     * - Can only be called by the contract owner
     * - Total supply after minting must not exceed MAX_SUPPLY
     * - Recipient address cannot be zero address
     *
     * Emits a {TokensMinted} event
     */
    function mint(address to) public onlyOwner {
        require(to != address(0), "MintableToken: mint to zero address");
        require(
            totalSupply() + MINT_AMOUNT <= MAX_SUPPLY,
            "MintableToken: max supply exceeded"
        );

        _mint(to, MINT_AMOUNT);

        emit TokensMinted(to, MINT_AMOUNT, totalSupply());

        // Emit event if max supply is reached
        if (totalSupply() == MAX_SUPPLY) {
            emit MaxSupplyReached(totalSupply());
        }
    }

    /**
     * @dev Returns the remaining mintable supply
     */
    function remainingSupply() public view returns (uint256) {
        return MAX_SUPPLY - totalSupply();
    }

    /**
     * @dev Returns the number of mints remaining before max supply
     */
    function remainingMints() public view returns (uint256) {
        return remainingSupply() / MINT_AMOUNT;
    }
}
