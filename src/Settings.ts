var probability: number;
if(localStorage.getItem("probabilitySetting")) {
	probability = JSON.parse(localStorage.getItem("probabilitySetting"));
	console.log("loaded settings");
} else {
	probability = 0.2;
}

function updateProbabilityDisplay(): void {
	var probabilitySlider = document.getElementById("probability") as HTMLInputElement;
	var probabilityDisplay = document.getElementById("probabilityDisplay");
	probabilityDisplay.innerHTML = probability.toString();
	probabilitySlider.value = probability.toString();
}

updateProbabilityDisplay();

document.getElementById("probability").oninput = function() {
	probability = Number( (this as HTMLInputElement).value );
	updateProbabilityDisplay();
}

export default probability;