var app = angular.module('valMyndApp', []);

// Initialize routing config
app.config(function($routeProvider) {
	$routeProvider
	.when('/',
	{
		templateUrl: 'start.html',
		controller: 'startCtrl'
	})
	.when('/start',
	{
		templateUrl: 'start.html',
		controller: 'startCtrl'
	})
	.when('/game',
	{
		templateUrl: 'game.html',
		controller: 'gameCtrl'
	})
	.when('/finish',
	{
		templateUrl: 'finish.html',
		controller: 'finishCtrl'
	})
	.when('/about',
	{
		templateUrl: 'about.html',
		controller: 'aboutCtrl'
	})
	.otherwise({redirectTo: '/'})
});

// Root scope, all controllers inherit this data
app.run(function($rootScope) {
	$rootScope.gameVersion = '0.1';

	$rootScope.createNewGame = function() {
		$rootScope.turnCounter = 1;
		$rootScope.wrongAnswers = 0;
		$rootScope.rightAnswers = 0;
		$rootScope.startTime = new Date().getTime();
	}

	// Setup
	$rootScope.allowedTurns = 10;
	$rootScope.waitUntilNewImage = 5;
	$rootScope.soundEnabled = true;

	// Initialize a new game
	$rootScope.images = new Array;
	$rootScope.createNewGame();

	var i = 0;
	$rootScope.images[i++] = new imageObj('Api', 'api');
	$rootScope.images[i++] = new imageObj('Býfluga', 'byfluga');
	$rootScope.images[i++] = new imageObj('Dúfa', 'dufa');
	$rootScope.images[i++] = new imageObj('Elgur', 'elgur');
	$rootScope.images[i++] = new imageObj('Fiskur', 'fiskur');
	$rootScope.images[i++] = new imageObj('Gíraffi', 'giraffi');
	$rootScope.images[i++] = new imageObj('Hundur', 'hundur');
	$rootScope.images[i++] = new imageObj('Íkorni', 'ikorni');
	$rootScope.images[i++] = new imageObj('Köttur', 'kottur');
	$rootScope.images[i++] = new imageObj('Ljón', 'ljon');
	$rootScope.images[i++] = new imageObj('Mús', 'mus');
	$rootScope.images[i++] = new imageObj('Naut', 'naut');
	$rootScope.images[i++] = new imageObj('Ormur', 'ormur');
	$rootScope.images[i++] = new imageObj('Önd', 'ond');
	$rootScope.images[i++] = new imageObj('Páfagaukur', 'pafagaukur');
	$rootScope.images[i++] = new imageObj('Refur', 'refur');
	$rootScope.images[i++] = new imageObj('Svín', 'svin');
	$rootScope.images[i++] = new imageObj('Tígrisdýr', 'tigrisdyr');
	$rootScope.images[i++] = new imageObj('Ugla', 'ugla');
	$rootScope.images[i++] = new imageObj('Úlfur', 'ulfur');

	$rootScope.calcScore = function(){
		$rootScope.score = ($rootScope.rightAnswers / ($rootScope.wrongAnswers + $rootScope.rightAnswers));

		// Only one wrong answer
		if ($rootScope.score >= 0.9)
		{
			$rootScope.finalImage = new imageObj('gull', 'gull');
		}
		// Max 4 wrong answers
		else if ($rootScope.score >= 0.7)
		{
			$rootScope.finalImage = new imageObj('silfur', 'silfur');
		}	
		else
			$rootScope.finalImage = new imageObj('brons', 'brons');
	}
});

function startCtrl($scope, $routeParams, $rootScope) {
	$scope.startGame = function() {
		$rootScope.createNewGame();
		window.location.href = '#/game';
	}
}

function aboutCtrl($scope, $routeParams, $rootScope) {
	$scope.startGame = function() {
		$rootScope.createNewGame();
		window.location.href = '#/game';
	}
}

function gameCtrl($scope, $routeParams, $rootScope, $timeout) {

	// Generate a new letter and four images
	generateNewStuff();

	// Scope functions

	/*
		Called when clicking on a image
	*/
	$scope.checkImage = function(i, $event) {
		if($scope.imageArray[i].tempSelected)
			return;

		console.log($scope.imageArray[i]);
		console.log($scope.turnCounter);

		$scope.imageArray[i].tempSelected = true;
		
		if($scope.imageArray[i].correct) {

			if($scope.soundEnabled) {
				playSound([$scope.imageArray[i].getSound(), 'correct.mp3']);
				//playSound($scope.imageArray[i].getSound());
			}

			$($event.target).removeClass('defaultBorder').addClass('correctImage');
			$scope.chosenLetter = $scope.imageArray[i].word;
			$scope.imageArray[i].chosen = true;
			$rootScope.turnCounter++;
			$rootScope.rightAnswers++;
			$scope.imageArray[i].correct = false;

			for(var i = 0; i < $scope.imageArray.length; i++)
				$scope.imageArray[i].tempSelected = true;

			$timeout(function() {
				if($rootScope.turnCounter > $rootScope.allowedTurns) {
					window.location.href = '#/finish';
				}
				else {
					generateNewStuff();
				}
			}, $rootScope.waitUntilNewImage*1000, true);
		}
		else {
			if($scope.soundEnabled)
				playSound([$scope.imageArray[i].getSound(), 'wrong.mp3']);
			$rootScope.wrongAnswers++;
			$($event.target).removeClass('defaultBorder').addClass('wrongImage');
		}
	}

	// Other functions and data

	/*
		Generates a new round in the game:
		1 correct image and 4 random wrong ones
	*/
	function generateNewStuff() {
		$scope.imageArray = new Array;

		// The correct image
		while(true) {
			var correctImage = $rootScope.images[Math.floor(Math.random() * $scope.images.length)];
			if(correctImage.chosen == false) {
				correctImage.correct = true;
				correctImage.chosen = true;
				correctImage.tempSelected = false;
				$scope.imageArray.push(correctImage);
				break;
			}
		}

		// Get the first letter
		$scope.chosenLetter = correctImage.getFirstLetter();
		
		var randImage;
		while(true) {
			// Athuga hvort arrayið innihaldi 3 element
			if($scope.imageArray.length >= 4)
				break;

			// Randomize a picture
			randImage = $rootScope.images[Math.floor(Math.random() * $rootScope.images.length)];

			var foundDuplicate = false;
			// Loop through the imageArray to search for duplicates
			for(var i = 0; i < $scope.imageArray.length; i++) {
				// The image is not in the array (no duplicate)
				if(randImage == $scope.imageArray[i]) {
					foundDuplicate = true;
					break;
				}
			}

			// If we didn't find a duplicate
            if(foundDuplicate == false) {
				randImage.tempSelected = false;
				$scope.imageArray.push(randImage);
			}
		}

		// Shuffle the image array
		shuffle($scope.imageArray);

		// Apply default styles in new round
		$('img').removeClass('correctImage').removeClass('wrongImage').addClass('defaultBorder');

		// Play the sound for the letter
		if($scope.soundEnabled)
			playSound(correctImage.getFirstLetterSound());
	}
}

function finishCtrl($scope, $routeParams, $rootScope) {
	$scope.startGame = function() {
		$rootScope.createNewGame();
		window.location.href = '#/game';
	}

	$rootScope.calcScore();
	$rootScope.endTime = new Date().getTime();
	var totalTime = ($rootScope.endTime - $rootScope.startTime) * 0.001;
	$rootScope.totalTime = Math.floor(totalTime * 100) / 100;
}

/*
	Extra functions
*/

// Represents one Image/Animal object
function imageObj(word, image) {
	this.word = word;
	this.image = image;
	this.correct = false;
	this.chosen = false;
	this.tempSelected = false;

	this.getFirstLetter = function() {
		return this.word.substring(0,1);
	}

	this.getFirstLetterSound = function() {
		var letter = this.getFirstLetter();

		if(letter == 'Ú')
			letter = 'U2';
		else if(letter == 'Í')
			letter = 'I2';
		else if(letter == 'Ö')
			letter = 'O2';


		return 'sound/' + letter + '.mp3';
	}

	this.getImage = function() {
		return this.image + '.jpg';
	}

	this.getSound = function() {
		return 'sound/' + this.image + '.mp3';
	}
}

// Play a single sound or an array of sounds
function playSound(sound) {
	var audio = document.getElementById('sound');
	if (sound instanceof Array) {
	    audio.src = sound.shift();
	    audio.play();
	    if (sound.length) {
	        audio.addEventListener('ended', function () {
	            playSound(sound);
	        });

	        audio.addEventListener('error', function () {
	            playSound(sound);
	        });
	    }
	}
	else {
		audio.src = sound;
		audio.play();
	}
}

// Shuffle an array
function shuffle(o) {
    for(var j, x, i = o.length; i; j = parseInt(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}