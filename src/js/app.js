App = {
  web3Provider: null,
  contracts: {},
  account: null,

  init: async function () {
    return App.initWeb3();
  },

  initWeb3: async function () {
    if (window.ethereum) {
      App.web3Provider = window.ethereum;
      window.web3 = new Web3(window.ethereum);
      try {
        // Request account access
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        App.account = accounts[0];

        document.getElementById("userAccount").textContent = App.account;
      } catch (error) {
        console.error("User denied account access", error);
      }
    } else {
      alert("Please install MetaMask!");
    }

    return App.initContract();
  },

  initContract: async function () {
    const res = await fetch("Marketplace.json");
    const marketplaceData = await res.json();

    const networkId = await web3.eth.net.getId();
    const deployedNetwork = marketplaceData.networks[networkId];

    if (!deployedNetwork) {
      alert("Smart contract not deployed to the detected network.");
      return;
    }

    App.contracts.Marketplace = new web3.eth.Contract(
      marketplaceData.abi,
      deployedNetwork.address
    );

    App.loadArticles();
    App.bindEvents();
  },

  bindEvents: function () {
    document.getElementById("sellForm").addEventListener("submit", App.sellArticle);
  },

  loadArticles: async function () {
    const articleCount = await App.contracts.Marketplace.methods.getNumberOfArticles().call();
    const container = document.getElementById("articlesRow");
    container.innerHTML = "";

    for (let i = 1; i <= articleCount; i++) {
      const article = await App.contracts.Marketplace.methods.articles(i).call();

      if (article.name) {
        const div = document.createElement("div");
        div.className = "col-md-4";
        div.innerHTML = `
          <div class="card shadow-sm">
            <div class="card-body">
              <h5 class="card-title">${article.name}</h5>
              <p class="card-text">${article.description}</p>
              <p><strong>Price:</strong> ${web3.utils.fromWei(article.price, "ether")} ETH</p>
              <p><strong>Seller:</strong> ${article.seller}</p>
              ${article.buyer === '0x0000000000000000000000000000000000000000'
                ? `<button class="btn btn-success" onclick="App.buyArticle(${article.id}, '${article.price}')">Buy</button>`
                : `<span class="text-muted">Sold</span>`}
            </div>
          </div>`;
        container.appendChild(div);
      }
    }
  },

  sellArticle: async function (event) {
    event.preventDefault();
  
    const name = document.getElementById("articleName").value;
    const description = document.getElementById("articleDescription").value;
    const priceEth = document.getElementById("articlePrice").value;
  
    const priceInWei = web3.utils.toWei(priceEth, "ether");
  
    console.log("Selling item:", name, description, priceInWei);
  
    try {
      await App.contracts.Marketplace.methods
        .sellArticle(name, description, priceInWei)
        .send({ from: App.account });
  
      alert("✅ Article listed successfully!");
      App.loadArticles();
      event.target.reset();
    } catch (err) {
      console.error(err);
      alert("❌ Error listing article.");
    }
  },

  buyArticle: async function (id, price) {
    try {
      await App.contracts.Marketplace.methods.buyArticle(id).send({
        from: App.account,
        value: price
      });

      alert("✅ Article purchased successfully!");
      App.loadArticles();
    } catch (err) {
      console.error(err);
      alert("❌ Error purchasing article.");
    }
  }
};

window.addEventListener("load", function () {
  App.init();
});
