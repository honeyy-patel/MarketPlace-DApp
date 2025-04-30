// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Marketplace {
    struct Article {
        uint id;
        address payable seller;
        address buyer;
        string name;
        string description;
        uint price;
    }

    mapping(uint => Article) public articles;
    uint public articleCount = 0;

    event ArticleListed(uint id, address seller, string name, uint price);
    event ArticleBought(uint id, address seller, address buyer, string name, uint price);

    function sellArticle(string memory _name, string memory _description, uint _price) public {
        require(bytes(_name).length > 0, "Name cannot be empty");
        require(bytes(_description).length > 0, "Description cannot be empty");
        require(_price > 0, "Price must be greater than zero");

        articleCount++;
        articles[articleCount] = Article(articleCount, payable(msg.sender), address(0), _name, _description, _price);

        emit ArticleListed(articleCount, msg.sender, _name, _price);
    }

    function buyArticle(uint _id) public payable {
        Article storage article = articles[_id];

        require(article.id > 0 && article.id <= articleCount, "Article does not exist");
        require(article.buyer == address(0), "Article already sold");
        require(msg.value == article.price, "Incorrect price paid");
        require(msg.sender != article.seller, "Seller cannot buy their own article");

        article.buyer = msg.sender;

        article.seller.transfer(msg.value);

        emit ArticleBought(_id, article.seller, msg.sender, article.name, article.price);
    }

    function getNumberOfArticles() public view returns (uint) {
        return articleCount;
    }
}
