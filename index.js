let diagramas = [];
let currentPanzoom;

// Función para cargar los diagramas desde la URL
async function cargarDiagramas() {
	try {
		const response = await fetch("/diagramas/index.json");
		if (!response.ok) {
			throw new Error("No se pudo cargar la lista de diagramas");
		}
		diagramas = await response.json();
		cargarMenuLateral();
	} catch (error) {
		console.error("Error al cargar los diagramas:", error);
		alert("Error al cargar los diagramas. Por favor, intenta de nuevo más tarde.");
	}
}

function cargarMenuLateral() {
	const sidebar = document.getElementById("sidebar-content");
	sidebar.innerHTML = ""; // Limpiar el contenido existente
	diagramas.forEach((diagrama, index) => {
		const item = document.createElement("div");
		item.className = "diagram-item";
		item.textContent = diagrama.nombre;
		item.onclick = () => mostrarDiagrama(index);
		sidebar.appendChild(item);
	});
}

async function mostrarDiagrama(index) {
	const diagrama = diagramas[index];
	const container = document.getElementById("diagram-container");
	container.innerHTML = "";

	console.log(diagrama.archivo);
	try {
		const response = await fetch(`/diagramas/${diagrama.archivo}`);
		if (!response.ok) {
			throw new Error("No se pudo cargar el contenido del diagrama");
		}
		const contenido = await response.text();

		alert("Contenido");
		console.log(contenido);
		let viewer = null;
		let encoded = null;
		let url = null;

		switch (diagrama.tipo) {
			case "bpmn":
				viewer = new BpmnJS({ container });
				try {
					const result = await viewer.importXML(contenido);
					const { warnings } = result;
					if (warnings.length) {
						console.warn("Warnings during import:", warnings);
					}
				} catch (err) {
					console.error("Failed to import XML:", err);
				}
				break;
			case "mermaid":
				container.innerHTML = '<div class="mermaid">' + contenido + "</div>";
				mermaid.init(undefined, container.querySelector(".mermaid"));
				break;
			case "plantuml":
				encoded = plantumlEncoder.encode(contenido);
				url = "https://www.plantuml.com/plantuml/svg/" + encoded;
				container.innerHTML = '<img src="' + url + '" alt="PlantUML diagram">';
				break;
			case "excalidraw":
				container.innerHTML = `<iframe style='width:100%; height:100%' src='exacalidraw2.html?diagram=${diagrama.archivo}'></iframe>`;
				break;
			case "drawio":
				//En revision
				break;
		}

		// Aplicar zoom
		if (currentPanzoom) {
			currentPanzoom.dispose();
		}
		currentPanzoom = panzoom(container.firstChild, {
			maxZoom: 5,
			minZoom: 0.5,
			initialZoom: 1,
		});
	} catch (error) {
		console.error("Error al cargar el diagrama:", error);
		alert("Error al cargar el diagrama. Por favor, intenta de nuevo más tarde.");
	}
}

function zoomIn() {
	if (currentPanzoom) {
		const { scale } = currentPanzoom.getTransform();
		currentPanzoom.zoomAbs(0, 0, scale * 1.1);
	}
}

function zoomOut() {
	if (currentPanzoom) {
		const { scale } = currentPanzoom.getTransform();
		currentPanzoom.zoomAbs(0, 0, scale * 0.9);
	}
}

function resetZoom() {
	if (currentPanzoom) {
		currentPanzoom.zoomAbs(0, 0, 1);
	}
}

// Iniciar la carga de diagramas cuando la página esté lista
document.addEventListener("DOMContentLoaded", cargarDiagramas);
