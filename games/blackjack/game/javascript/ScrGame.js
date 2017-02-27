
function ScrGame() {
	PIXI.Container.call( this );
	this.init();
}

ScrGame.prototype = Object.create(PIXI.Container.prototype);
ScrGame.prototype.constructor = ScrGame;

var TIME_GET_STATE = 10000;
var TIME_GET_CARDS = 3000;
var TIME_WITE = 500;
var urlResult = "http://api.dao.casino/daohack/api.php?a=getreuslt&id";
var urlEtherscan = "https://api.etherscan.io/";
var urlInfura = "https://mainnet.infura.io/JCnK5ifEPH9qcQkX0Ahl";
var urlBalance = "";
var addressContract = "0xa65d59708838581520511d98fb8b5d1f76a96cad";
var betEth = 50000000000000000; //ставка эфира
var betGame = betEth/1000000000000000000; //ставка 0.2 эфира
var obj_game = {};
var _mouseX;
var _mouseY;
var blockNumber;
var idOraclizeGame = undefined;
var resultTxid = undefined;
var gasAmount = 4000000;

var accounts;
var account;
var gameIsGoingOn;
var dealedCards = new Array();
var suit = {0: 'Hearts', 1: 'Diamonds', 2: 'Spades', 3: 'Clubs'};
var cardType = {0: 'King', 1: 'Ace', 2: '2', 3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
                11: 'Jacket', 12: 'Queen'};

var gameState = {
  0: "Your turn",
  1: "You won!",
  2: "House won!",
  3: "Tie!"
}
var lastPlayerCard = 0;
var lastHouseCard = 0;
var stateNow = -1;
var stateOld = -1;

ScrGame.prototype.init = function() {
	this.face_mc = new PIXI.Container();
	this.back_mc = new PIXI.Container();
	this.game_mc = new PIXI.Container();
	this.cards_mc = new PIXI.Container();
	this.gfx_mc = new PIXI.Container();
	
	this.startTime = getTimer();
	this.gameTime = getTimer();
	this._arButtons = [];
	this.timeGetState = 0;
	this.timeGetCards = 0;
	this.timeTotal = 0;
	this.timeWait = 0;
	this.countPlayerCard = 0;
	this.countHouseCard = 0;
	this.countWait = 0;
	this.gameTxHash = undefined;
	this.cardSuit = undefined;
	this.startGame = false;
	this._gameOver = false;
	this.bSendRequest = false;
	this.bWindow = false;
	this.bStand = false;
	this.bGameLoad = false;
	this.bWait = true;
	this.version = 8;
	this.strTest = "";
	
	this.bg = addObj("bgGame", _W/2, _H/2);
	this.addChild(this.bg);
	
	if(options_debug){
		var tfDebug = addText("Debug", 20, "#FF0000", "#000000", "right", 400)
		tfDebug.x = _W-20;
		tfDebug.y = 10;
		this.face_mc.addChild(tfDebug);
	}
	
	if(options_testnet){
		this.strTest = " (testnet)";
		urlEtherscan = "https://testnet.etherscan.io/";
		urlInfura = "https://ropsten.infura.io/JCnK5ifEPH9qcQkX0Ahl";
		addressContract = "0x1fc25284f6c9adf8ce01263c688eb28b0bf37423";
	} else {
		betEth = 50000000000000000; //ставка эфира
		betGame = betEth/1000000000000000000; //ставка 1 эфир
	}
	
	obj_game["game"] = this;
	obj_game["balance"] = 0;
	
	this.game_mc.addChild(this.cards_mc);
	this.addChild(this.back_mc);
	this.addChild(this.game_mc);
	this.addChild(this.gfx_mc);
	this.addChild(this.face_mc);
	
	this.createGUI();
	this.sendRequest("getBalance");
	this.checkGameState();
	
	this.interactive = true;
	this.on('mousedown', this.touchHandler);
	this.on('mousemove', this.touchHandler);
	this.on('touchstart', this.touchHandler);
	this.on('touchmove', this.touchHandler);
	this.on('touchend', this.touchHandler);
}

ScrGame.prototype.clearGame = function(){
	lastPlayerCard = 0;
	lastHouseCard = 0;
	stateNow = -1;
	this.timeTotal = 0;
	
	for (var i = 0; i < dealedCards.length; i++) {
		var card = dealedCards[i];
		this.cards_mc.removeChild(card);
	}
	
	dealedCards = [];
}

ScrGame.prototype.loadGame = function(){
	if(!this.bGameLoad){
		this.bGameLoad = true;
		this.showButtons(true);
		var i = 0;
		
		for (i = lastPlayerCard; i < this.countPlayerCard; i++) {
			this.getPlayerCard(i);
		}
		for (i = lastHouseCard; i < this.countHouseCard; i++) {
			this.getHouseCard(i);
		}
		this.showSuitCard();
	}
}

ScrGame.prototype.createGUI = function() {	
	var icoKey = addObj("icoKey", 40, 40);
	this.face_mc.addChild(icoKey);
	var icoEthereum = addObj("icoEthereum", 40, 80);
	this.face_mc.addChild(icoEthereum);
	var icoTime = addObj("icoTime", 40, 120);
	this.face_mc.addChild(icoTime);
	
	var offsetY = 25;
	var strUser = 'id'
	this.tfIdUser = addText(strUser, 20, "#ffffff", "#000000", "left", 1000, 4, fontMain)
	this.tfIdUser.x = icoKey.x + 24;
	this.tfIdUser.y = icoKey.y - 12;
	this.face_mc.addChild(this.tfIdUser);
	this.tfBalance = addText("0", 20, "#ffffff", "#000000", "left", 400, 4, fontMain)
	this.tfBalance.x = icoEthereum.x + 24;
	this.tfBalance.y = icoEthereum.y - 12;
	this.face_mc.addChild(this.tfBalance);
	this.tfTotalTime = addText("0", 20, "#ffffff", "#000000", "left", 400, 4, fontMain)
	this.tfTotalTime.x = icoTime.x + 24;
	this.tfTotalTime.y = icoTime.y - 12;
	this.face_mc.addChild(this.tfTotalTime);
	this.tfVers= addText("v. " + this.version + this.strTest, 20, "#ffffff", "#000000", "left")
	this.tfVers.x = icoTime.x;
	this.tfVers.y = this.tfTotalTime.y + 40;
	this.face_mc.addChild(this.tfVers);
	this.tfResult = addText("", 20, "#ffffff", "#000000", "center", 400, 4)
	this.tfResult.x = _W/2;
	this.tfResult.y = _H/2;
	this.face_mc.addChild(this.tfResult);
	
	if(openkey){
		this.tfIdUser.setText(openkey);
		this.bWait = false;;
	} else {
		this.tfResult.setText("key undefined");
	}
	
	var btnStart = addButton2("btnDefault", _W/2, _H/2+250);
	btnStart.name = "btnStart";
	btnStart.interactive = true;
	btnStart.buttonMode=true;
	this.addChild(btnStart);
	this._arButtons.push(btnStart);
	var tf = addText("Play", 24, "#FFFFFF", undefined, "center", 350, 2)
	tf.x = 0;
	tf.y = - 17;
	btnStart.addChild(tf);
	btnStart.visible = false;
	this.btnStart = btnStart;
	var btnHit = addButton2("btnGreen", _W/2-150, _H/2+200, 0.7);
	btnHit.name = "btnHit";
	btnHit.interactive = true;
	btnHit.buttonMode=true;
	btnHit.visible = false;
	this.addChild(btnHit);
	this._arButtons.push(btnHit);
	var tf = addText("Hit", 40, "#FFFFFF", undefined, "center", 350, 2)
	tf.x = 0;
	tf.y = - 26;
	btnHit.addChild(tf);
	this.btnHit = btnHit;
	var btnStand = addButton2("btnOrange", _W/2+150, _H/2+200, 0.7);
	btnStand.name = "btnStand";
	btnStand.interactive = true;
	btnStand.buttonMode=true;
	btnStand.visible = false;
	this.addChild(btnStand);
	this._arButtons.push(btnStand);
	var tf = addText("Stand", 40, "#FFFFFF", undefined, "center", 350, 2)
	tf.x = 0;
	tf.y = - 26;
	btnStand.addChild(tf);
	this.btnStand = btnStand;
	var btnSmart = this.createButton("btnSmart", 100, 660, "Check contract", 17, 12)
	
	if(options_debug){
		btnStart.visible = true;
	}
}

ScrGame.prototype.createButton = function(name, x, y, label, size, offset) {	
	if(size){}else{size=22}
	if(offset){}else{offset=17}
	
	var btn = addButton2("btnDefault", x, y);
	btn.name = name;
	btn.interactive = true;
	btn.buttonMode=true;
	this.face_mc.addChild(btn);
	this._arButtons.push(btn);
	var tf = addText(label, size, "#FFFFFF", "#000000", "center", 350)
	tf.x = 0;
	tf.y = - offset;
	btn.addChild(tf);
	
	return btn;
}

ScrGame.prototype.showButtons = function(value) {
    this.btnHit.visible = value;
    this.btnStand.visible = value;
}

ScrGame.prototype.showPlayerCard = function(card){
  card.x = _W/2 - 80 + lastPlayerCard*50;
  card.y = _H/2 + 100;
  this.cards_mc.addChild(card);
  lastPlayerCard++;
  dealedCards.push(card);
}

ScrGame.prototype.showHouseCard = function(card){
  card.x = _W/2 - 80 + lastHouseCard*50;
  card.y = _H/2 - 100;
  this.cards_mc.addChild(card);
  lastHouseCard++;
  dealedCards.push(card);
  this.showSuitCard();
}

ScrGame.prototype.showSuitCard = function(){
	if(this.cardSuit){} else {
		this.cardSuit = addObj("suit", 0, 0, 0.52);
		this.gfx_mc.addChild(this.cardSuit);
	}
  this.cardSuit.x = _W/2 - 80 + lastHouseCard*50;
  this.cardSuit.y = _H/2 - 100;
}

ScrGame.prototype.getCard = function(cardIndex){
  var cardType = Math.floor(cardIndex / 4);
  var cardSymbol = String(cardType);
  switch (cardType) {
    case 0:
      cardSymbol = "K";
      break;
    case 1:
      cardSymbol = "A";
      break;
    case 11:
      cardSymbol = "J";
      break;
    case 12:
      cardSymbol = "Q";
      break;
  }
  var suit = String(cardIndex % 4 + 1);
  var spriteName = suit + "_" + cardSymbol;
  var newCard = addObj(spriteName, 0, 0, 0.5);
  newCard.zIndex = 10;
  return newCard;
}

ScrGame.prototype.getPlayerCardsNumber = function() {
	var data = "0xd572fd99";
	var params = {"from":openkey,
				"to":addressContract,
				"data":data};
	this.sendInfuraRequest("getPlayerCardsNumber", params);
}

ScrGame.prototype.getHouseCardsNumber = function() {
	var data = "0x7f601a50";
	var params = {"from":openkey,
				"to":addressContract,
				"data":data};
	this.sendInfuraRequest("getHouseCardsNumber", params);
}

ScrGame.prototype.checkGameState = function() {
	if(openkey == undefined){
		return false;
	}
	// 0 Run
	// 1 Player
	// 2 House
	// 3 Tie
	var data = "0xb7d0628b";
	var params = {"from":openkey,
				"to":addressContract,
				"data":data};
	this.sendInfuraRequest("getGameState", params);
}

ScrGame.prototype.addPlayerCard = function(){
	for (var i = lastPlayerCard; i < this.countPlayerCard; i++) {
		if(options_debug){
			var card = Math.ceil(Math.random()*52);
			this.showPlayerCard(this.getCard(card));
			this.showButtons(true);
			this.bWait = false;
			this.tfResult.setText("");
		} else {
			this.getPlayerCard(i);
		}
	}
}

ScrGame.prototype.addHouseCard = function(){
	for (var i = lastHouseCard; i < this.countHouseCard; i++) {
		if(options_debug){
			var card = Math.ceil(Math.random()*52);
			this.showHouseCard(this.getCard(card));
			this.showSuitCard();
		} else {
			this.getHouseCard(i);
		}
	}
}

ScrGame.prototype.getPlayerCard = function(value){
    var callData = "0xd02d13820000000000000000000000000000000000000000000000000000000000000000";
    callData = callData.substr(0, 10);
	var data = callData + pad(numToHex(value), 64);
	var params = {"from":openkey,
				"to":addressContract,
				"data":data};
	this.sendInfuraRequest("getPlayerCard", params, value);
}

ScrGame.prototype.getHouseCard = function(value){
    var callData = "0x7b61b2010000000000000000000000000000000000000000000000000000000000000000";
    callData = callData.substr(0, 10);
	var data = callData + pad(numToHex(value), 64);
	var params = {"from":openkey,
				"to":addressContract,
				"data":data};
	this.sendInfuraRequest("getHouseCard", params, value);
}

ScrGame.prototype.clickHit = function(){
	this.showButtons(false);
	this.bWait = true;
	if(options_debug){
		this.countPlayerCard ++;
		this.addPlayerCard();
	} else {
		var data = "0x2ae3594a";
		this.sendInfuraAction("hit", data);
	}
}

ScrGame.prototype.clickStand = function(){
	this.showButtons(false);
	this.bWait = true;
	if(options_debug){
		this.countHouseCard ++;
		this.addHouseCard();
	} else {
		var data = "0xc2897b10";
		this.sendInfuraAction("stand", data);
	}
}

ScrGame.prototype.showSmartContract = function() {
	var url = urlEtherscan + "address/" + addressContract
	if(options_mainet){
		url = "https://etherscan.io/" + "address/" + addressContract
	}
	window.open(url, "_blank"); 
}

// START
ScrGame.prototype.startGameEth = function(){
	if(openkey == undefined){
		console.log("ERROR_KEY");
		return false;
	}
	
	$.ajax({
		type: "POST",
		url: urlInfura,
		dataType: 'json',
		async: false,
		data: JSON.stringify({"jsonrpc":"2.0",
							"method":"eth_getTransactionCount",
							"params":[openkey,"latest"],
							"id":1}),
		success: function (d) {
			console.log("get nonce "+d.result);
			var options = {};
			options.nonce = d.result;
			options.to = addressContract;
			// call function game() in contract
			options.data = "0x553df021"; // deal();
			options.gasPrice="0x737be7600";//web3.toHex('31000000000');
			options.gasLimit=0x927c0; //web3.toHex('600000');
			options.value = betEth;
			
			if(privkey){
				if(buf == undefined){
					console.log("ERROR_TRANSACTION");
				} else {
					//приватный ключ игрока, подписываем транзакцию
					var tx = new EthereumTx(options);
					tx.sign(new buf(privkey, 'hex'));

					var serializedTx = tx.serialize().toString('hex');
					obj_game["game"].bSendRequest = false;
					obj_game["game"].startGame = true;
					console.log("The transaction was signed: "+serializedTx);
					
					$.ajax({
						type: "POST",
						url: urlInfura,
						dataType: 'json',
						async: false,
						data: JSON.stringify({"id":0,
											"jsonrpc":'2.0',
											"method":'eth_sendRawTransaction',
											"params":["0x"+String(serializedTx)]}),
						success: function (d) {
							obj_game["game"].response("gameTxHash", d.result) 
							console.log("Транзакция отправлена в сеть:", d.result);
						}
					})
				}
			}
		}
	})
}

ScrGame.prototype.sendInfuraAction = function(name, data) {
	if(options_ethereum && openkey){
		$.ajax({
			type: "POST",
			url: urlInfura,
			dataType: 'json',
			async: false,
			data: JSON.stringify({"jsonrpc":"2.0",
								"method":"eth_getTransactionCount",
								"params":[openkey,"latest"],
								"id":1}),
			success: function (d) {
				console.log("urlInfura:", urlInfura);
				console.log("get nonce action "+d.result);
				var options = {};
				options.nonce = d.result;
				options.to = addressContract;
				// call function game() in contract
				options.data = data; // method from contact
				options.gasPrice="0x737be7600";//web3.toHex('31000000000');
				options.gasLimit=0x927c0; //web3.toHex('600000');
				options.value = 0;
				
				if(privkey){
					if(buf == undefined){
						console.log("ERROR_TRANSACTION");
					} else {
						//приватный ключ игрока, подписываем транзакцию
						var tx = new EthereumTx(options);
						tx.sign(new buf(privkey, 'hex'));

						var serializedTx = tx.serialize().toString('hex');
						console.log("The transaction was signed: "+serializedTx);
						
						$.ajax({
							type: "POST",
							url: urlInfura,
							dataType: 'json',
							async: false,
							data: JSON.stringify({"id":0,
												"jsonrpc":'2.0',
												"method":'eth_sendRawTransaction',
												"params":["0x"+String(serializedTx)]}),
							success: function (d) {
								obj_game["game"].response(name, d.result) 
								console.log("Транзакция отправлена в сеть:", d.result);
							}
						})
					}
				}
			}
		})
	}
}

ScrGame.prototype.sendInfuraRequest = function(name, params, ind) {
	if(options_ethereum && openkey){
		var method = name;
		switch(name){
			case "getBalance":
				method = "eth_getBalance";
				break;
			case "getPlayerCard":
			case "getHouseCard":
			case "getGameState":
			case "getPlayerCardsNumber":
			case "getHouseCardsNumber":
				method = "eth_call";
				break;
		}
		
		$.ajax({
			type: "POST",
			url: urlInfura,
			dataType: 'json',
			async: false,
			data: JSON.stringify({"id":0,
								"jsonrpc":'2.0',
								"method":method,
								"params":[params, "latest"]}),
			success: function (d) {
				obj_game["game"].response(name, d.result, ind);
			}
		})
	}
}

ScrGame.prototype.sendRequest = function(value) {
	if(options_ethereum && openkey){
		if(value == "game"){
			
		} else if(value == "getBalance"){
			this.sendInfuraRequest("getBalance", openkey);
		}
	}
}

ScrGame.prototype.response = function(command, value, index) {
	if(value == undefined){
		return false;
	}
	
	// console.log("response:", command, value)
	if(command == "gameTxHash"){
		obj_game["gameTxHash"] = value;
		login_obj["gameTxHash"] = value;
		this.gameTxHash = obj_game["gameTxHash"];
	} else if(command == "getBalance"){
		obj_game["balance"] = toFixed((Number(hexToNum(value))/1000000000000000000), 4);
		login_obj["balance"] = obj_game["balance"];
		this.tfBalance.setText(obj_game["balance"]);
	} else if(command == "getPlayerCard"){
		if(value != "0x"){
			var card = hexToNum(value);
			this.showPlayerCard(this.getCard(card));
			this.bWait = false;
			this.tfResult.setText("");
			this.showButtons(true);
		}
	} else if(command == "getHouseCard"){
		if(value != "0x"){
			var card = hexToNum(value);
			this.showHouseCard(this.getCard(card));
			this.bWait = false;
			this.tfResult.setText("");
		}
	} else if(command == "getPlayerCardsNumber"){
		this.countPlayerCard = hexToNum(value);
		this.addPlayerCard();
	} else if(command == "getHouseCardsNumber"){
		this.countHouseCard = hexToNum(value);
		this.addHouseCard();
	} else if(command == "getGameState"){
		if(value != "0x"){
			stateNow = hexToNum(value);
			// console.log("stateNow:", stateNow);
			if(stateNow > 0){
				if(stateOld == -1){
					this.tfResult.setText("Bet 0.05 eth");
				}
				switch (stateNow){
					case 1:
						if(stateOld == 0){
							this.tfResult.setText("You won!");
						}
						break;
					case 2:
						if(stateOld == 0){
							this.tfResult.setText("House won!");
						}
						break;
					case 3:
						if(stateOld == 0){
							this.tfResult.setText("Tie!");
						}
						break;
				}
				if(stateOld == -1 || stateOld == 0){
					this.bWait = false;
					this.startGame = false;
					this.getPlayerCardsNumber();
					this.getHouseCardsNumber();
					this.btnStart.visible = true;
					this.sendRequest("getBalance");
					stateOld = stateNow;
				}
			} else if(stateNow == 0){
				this.btnStart.visible = false;
				stateOld = stateNow;
				this.getPlayerCardsNumber();
				this.getHouseCardsNumber();
				this.tfResult.setText("");
			}
		} else {
			this.bWait = false;
			this.startGame = false;
			this.btnStart.visible = true;
		}
	} else if(command == "hit"){
		
	} else if(command == "stand"){
		this.bStand = true;
	}
}

ScrGame.prototype.resetTimer  = function(){
	
}

ScrGame.prototype.update = function(){
	var diffTime = getTimer() - this.startTime;
	
	if(this.startGame){
		this.timeTotal += diffTime;
		this.tfTotalTime.setText(Math.round(this.timeTotal/1000));
		// this.timeGetCards += diffTime;
		// if(this.timeGetCards >= TIME_GET_CARDS){
			// this.timeGetCards = 0;
			// this.getPlayerCardsNumber();
			// this.getHouseCardsNumber();
		// }
	}
	
	this.timeGetState += diffTime;
	if(this.timeGetState >= TIME_GET_STATE){
		this.timeGetState = 0;
		this.checkGameState();
	}
	
	if(this.bWait){
		this.timeWait += diffTime;
		if(this.timeWait >= TIME_WITE){
			this.timeWait = 0;
			var str = "";
			for (var i = 0; i < this.countWait; i++) {
				str += ".";
			}
			this.tfResult.setText("Wait"+str);
			this.countWait ++;
			if(this.countWait > 3){
				this.countWait = 0;
			}
		}
	}
	
	this.startTime = getTimer();
}

ScrGame.prototype.clickCell = function(item_mc) {
	if(item_mc.name.search("btn") != -1){
		item_mc._selected = false;
		if(item_mc.over){
			item_mc.over.visible = false;
		}
	}
	
	if(item_mc.name == "btnStart"){
		item_mc.visible = false;
		this.bWait = true;
		this.clearGame();
		if(options_debug){
			this.countPlayerCard = 2;
			this.countHouseCard = 1;
			this.addPlayerCard();
			this.addHouseCard();
			this.showButtons(true);
		} else {
			this.startGameEth();
		}
	} else if(item_mc.name == "btnSmart"){
		this.showSmartContract();
	} else if(item_mc.name == "btnHit"){
		this.clickHit();
	} else if(item_mc.name == "btnStand"){
		this.clickStand();
	}
}

ScrGame.prototype.checkButtons = function(evt){
	_mouseX = evt.data.global.x;
	_mouseY = evt.data.global.y;
	
	for (var i = 0; i < this._arButtons.length; i++) {
		var item_mc = this._arButtons[i];
		if(hit_test_rec(item_mc, item_mc.w, item_mc.h, _mouseX, _mouseY) &&
		item_mc.visible && item_mc.dead != true){
			if(item_mc._selected == false){
				item_mc._selected = true;
				if(item_mc.over){
					item_mc.over.visible = true;
				}
			}
		} else {
			if(item_mc._selected){
				item_mc._selected = false;
				if(item_mc.over){
					item_mc.over.visible = false;
				}
			}
		}
	}
}

ScrGame.prototype.touchHandler = function(evt){
	if(this.bWindow){
		return false;
	}
	var phase = evt.type;
	
	if(phase=='mousemove' || phase == 'touchmove' || phase == 'touchstart'){
		this.checkButtons(evt);
	} else if (phase == 'mousedown' || phase == 'touchend') {
		for (var i = 0; i < this._arButtons.length; i++) {
			var item_mc = this._arButtons[i];
			if(item_mc._selected){
				this.clickCell(item_mc);
				return;
			}
		}
	}
}

ScrGame.prototype.removeAllListener = function(){
	if(this.wndInfo){
		this.wndInfo.removeAllListener();
	}
	if(this.wndResult){
		this.wndResult.removeAllListener();
	}
	
	this.interactive = false;
	this.off('mousedown', this.touchHandler);
	this.off('mousemove', this.touchHandler);
	this.off('touchstart', this.touchHandler);
	this.off('touchmove', this.touchHandler);
	this.off('touchend', this.touchHandler);
}