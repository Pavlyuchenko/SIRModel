var canvas = document.getElementById("canv"); // Canvas element
var viewportOffset = canvas.getBoundingClientRect(); // The CSS properties
var c = canvas.getContext("2d"); // The drawing plane

window.addEventListener("resize", handleResize);
function handleResize() {
	if (innerWidth < 1345) {
		var w = window.innerWidth / 1.4;
		var h = (window.innerHeight / 2.2) * 1.5;
	} else {
		var w = window.innerWidth / 2.15 - 2;
		var h = window.innerHeight / 1.21 - 2;
	}
	canvas.width = w;
	canvas.height = h;
}

handleResize(); // First draw

function Human(
	x, // Spawning on x axis
	y, // Spawning on y axis
	radius, // Human radius
	speed, // Human speed
	spreadRadius, // Radius, over which the disease can be spread
	drawSpread, // Do you want to draw the spreadRadius?
	randomness, // Chance of infecting other people, in %
	recoverTime // How long it takes to be cured
) {
	this.x = x;
	this.y = y;
	this.dx = speed / 500;
	this.dy = speed / 500;
	this.radius = radius;
	this.angle = Math.random() * 2 * Math.PI;
	this.direction = { x: Math.cos(this.angle), y: Math.sin(this.angle) };
	this.color = "#29B6F6";
	this.strokeAplha = 0;
	this.spreadRad = spreadRadius;
	this.spreadChance = 0;
	this.visited = healthyPeople;
	this.randomness = randomness;
	this.drawSpread = drawSpread;
	this.recoverTime = recoverTime;
	this.status = 0; // 0 === Healthy ; 1 === Sick ; 2 === Cured / Dead

	let tthis = this;

	this.cureInt = function () {
		window.setTimeout(function () {
			people[people.indexOf(tthis)].color = "#616161";
			tthis.status = 2;
		}, tthis.recoverTime);
	};

	this.getDisease = function () {
		this.status = 1;
		this.color = "#ff4f4f";
		this.cureInt();
		this.visited = healthyPeople.slice(0, healthyPeople.length);

		healthyPeople.splice(healthyPeople.indexOf(this), 1);
	};

	this.draw = function () {
		c.beginPath();
		c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
		c.fillStyle = this.color;
		c.fill();

		if (this.drawSpread && this.status.toString() === "1") {
			c.beginPath();
			c.arc(this.x, this.y, this.spreadRad, 0, Math.PI * 2, true);
			c.strokeStyle = "rgba(198, 40, 40, 1)";
			c.lineWidth = 3.5;
			c.stroke();
		}
	};

	this.checkCollisions = function () {
		if (this.x + this.radius > canvas.width || this.x - this.radius < 0) {
			this.dx = -this.dx;
		}

		if (this.x + this.radius > canvas.width) {
			this.x -= 1;
		}
		if (this.x - this.radius < 0) {
			this.x += 1;
		}

		if (this.y + this.radius > canvas.height || this.y - this.radius < 0) {
			this.dy = -this.dy;
		}

		if (this.y + this.radius > canvas.height) {
			this.y -= 1;
		}
		if (this.y - this.radius < 0) {
			this.y += 1;
		}
	};

	this.move = function (dt) {
		this.x += this.dx * this.direction.x * dt;
		this.y += this.dy * this.direction.y * dt;
	};

	this.spreadDisease = function () {
		for (let i = 0; i < healthyPeople.length; i++) {
			human = healthyPeople[i];
			if (
				this.x + this.spreadRad >= human.x &&
				this.x - this.spreadRad <= human.x &&
				this.y + this.spreadRad >= human.y &&
				this.y - this.spreadRad <= human.y
			) {
				if (!this.visited.includes(human)) {
					this.spreadChance = Math.floor(
						Math.random() * (10 - this.randomness / 10)
					).toString();

					if (this.spreadChance === "0") {
						human.getDisease();
					}
				}

				this.visited.push(human);
			} else {
				if (this.visited.includes(human)) {
					this.visited.splice(this.visited.indexOf(human), 1);
				}
			}
		}
	};

	this.update = function (dt) {
		this.checkCollisions();

		this.move(dt);

		if (this.status.toString() === "1") {
			this.spreadDisease();
		}

		this.draw();
	};
}

var healthyPeople = [];
//						  #of rad spe srad ran sprRad recoverTime
var people = createPeople(1000, 4, 18, 15, 40, false, 10000);
people[0].getDisease();

var lastUpdate = Date.now();
var now = 0;
var dt = 0;
var myInterval = setInterval(tick, 0);

function tick() {
	now = Date.now();
	dt = now - lastUpdate;
	lastUpdate = now;

	updateGame(dt);
	updateLiveInfo();
}

function createPeople(
	count,
	radius,
	speed,
	sprRad,
	randomness,
	drawSpread,
	recoverSpeed
) {
	let people = [];
	for (let i = 0; i < count; i++) {
		x = Math.random() * (canvas.width - 4 - radius * 2) + radius;
		y = Math.random() * (canvas.height - 4 - radius * 2) + radius;
		people.push(
			new Human(
				x,
				y,
				radius,
				speed,
				sprRad,
				drawSpread,
				randomness,
				recoverSpeed
			)
		);
	}
	healthyPeople = people.slice(0, people.length);
	return people;
}

function updateGame(dt) {
	c.clearRect(0, 0, canvas.width, canvas.height);
	for (let i = 0; i < people.length; i++) {
		people[i].update(dt);
	}
}

function updateLiveInfo() {
	document.getElementById("totalPeople").innerHTML = people.length.toString();

	document.getElementById("sick").innerHTML =
		Math.round(
			((people.length -
				(healthyPeople.length +
					people.filter((human) => human.status === 2).length)) /
				people.length) *
				100
		).toString() + " %";

	document.getElementById("sickCount").innerHTML =
		"(" +
		people.filter((human) => human.status === 1).length.toString() +
		")";

	document.getElementById("healthy").innerHTML =
		Math.round((healthyPeople.length / people.length) * 100).toString() +
		" %";

	document.getElementById("healthyCount").innerHTML =
		"(" + healthyPeople.length.toString() + ")";

	document.getElementById("dead").innerHTML =
		Math.round(
			(people.filter((human) => human.status === 2).length /
				people.length) *
				100
		).toString() + " %";

	document.getElementById("deadCount").innerHTML =
		"(" +
		people.filter((human) => human.status === 2).length.toString() +
		")";
}

function chartUpdate() {
	window.setInterval(function () {
		if (document.getElementById("sickCount").innerHTML !== "(0)") {
			document.getElementById("days").innerHTML =
				parseInt(document.getElementById("days").innerHTML) +
				1 +
				" days";
			chart.data.labels[
				chart.data.labels.length - 1
			] = document.getElementById("days").innerHTML;

			chart.update();
		}
	}, 1000);

	window.setInterval(function () {
		chart.data.datasets.forEach((dataset) => {
			if (dataset.label === "Healthy") {
				dataset.data.push(
					healthyPeople.length +
						people.length -
						healthyPeople.length -
						people.filter((human) => human.status === 2).length
				);
			} else if (dataset.label === "Sick") {
				dataset.data.push(
					people.length -
						healthyPeople.length -
						people.filter((human) => human.status === 2).length
				);
			} else if (dataset.label === "Recovered") {
				dataset.data.push(
					people.filter((human) => human.status === 2).length +
						healthyPeople.length +
						people.length -
						healthyPeople.length -
						people.filter((human) => human.status === 2).length
				);
			}
		});
		chart.data.labels.push("");
		if (document.getElementById("sickCount").innerHTML !== "(0)") {
			chart.update();
		}
	}, 333.333);

	window.setInterval(function () {
		chartTwo.data.datasets.forEach((dataset) => {
			if (dataset.label === "Healthy") {
				dataset.data.push(healthyPeople.length);
			} else if (dataset.label === "Sick") {
				dataset.data.push(
					people.filter((human) => human.status === 1).length
				);
			} else if (dataset.label === "Recovered") {
				dataset.data.push(
					people.filter((human) => human.status === 2).length
				);
			}
		});
		chartTwo.data.labels.push("");
		if (document.getElementById("sickCount").innerHTML !== "(0)") {
			chartTwo.update();
		}
	}, 50);
}

chartUpdate();

var chart = new Chart(document.getElementById("line-chart"), {
	type: "line",
	data: {
		labels: [0],
		datasets: [
			{
				data: [],
				label: "Sick",
				backgroundColor: "#ff4f4f",
				fill: true,
			},

			{
				data: [],
				label: "Healthy",
				backgroundColor: "#29B6F6",
				fill: true,
			},
			{
				data: [],
				label: "Recovered",
				backgroundColor: "#616161",
				fill: true,
			},
		],
	},
	options: {
		responsive: true,
		maintainAspectRatio: false,
		title: {
			display: false,
		},
		elements: {
			point: {
				radius: 0,
			},
		},
		legend: {
			display: false,
		},
	},
});

var chartTwo = new Chart(document.getElementById("line-chart-two"), {
	type: "line",
	data: {
		labels: [0],
		datasets: [
			{
				data: [],
				label: "Recovered",
				borderColor: "#616161",
				fill: false,
			},
			{
				data: [],
				label: "Sick",
				borderColor: "#ff4f4f",
				fill: false,
			},

			{
				data: [],
				label: "Healthy",
				borderColor: "#29B6F6",
				fill: false,
			},
		],
	},
	options: {
		responsive: true,
		maintainAspectRatio: false,
		title: {
			display: false,
		},
		elements: {
			point: {
				radius: 0,
			},
		},
		legend: {
			display: false,
		},
	},
});
/*
var chartThree = new Chart(document.getElementById("line-chart-three"), {
	type: "line",
	data: {
		labels: [0],
		datasets: [
			{
				data: [],
				label: "Sick",
				borderColor: "#ff4f4f",
				fill: false,
			},

			{
				data: [],
				label: "Healthy",
				borderColor: "#29B6F6",
				fill: false,
			},
		],
	},
	options: {
		title: {
			display: false,
		},
		elements: {
			point: {
				radius: 0,
			},
		},
		legend: {
			display: false,
		},
	},
});*/
/*
window.setInterval(function () {
	chartThree.data.labels[
		chartThree.data.labels.length - 1
	] = document.getElementById("days").innerHTML;
	if (document.getElementById("sick").innerHTML !== "0 %") {
		chartThree.update();
	}
}, 1000);

window.setInterval(function () {
	chartThree.data.datasets.forEach((dataset) => {
		if (dataset.label === "Healthy") {
			dataset.data.push(healthyPeople.length);
		} else if (dataset.label === "Sick") {
			dataset.data.push(people.length - healthyPeople.length);
		}
	});
	chartThree.data.labels.push("");
	if (document.getElementById("sick").innerHTML !== "0 %") {
		chartThree.update();
	}
}, 333.333);
*/
