let diagramas = [];
let currentPanzoom;

document.getElementById("diagram-container").style.display = "block";
document.getElementById("zoom-controls").style.display = "block";
document.getElementById("markdown-container").style.display = "none";

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
async function showContainer(component) {
	const diagramContainer = document.getElementById("diagram-container");
	const zoomControls = document.getElementById("zoom-controls");
	const mdContainer = document.getElementById("markdown-container");
	
	if(component == "diagram-container"){
		diagramContainer.style.display = "block";
		zoomControls.style.display = "block";
		mdContainer.style.display = "none";

	} else if(component == "markdown-container") {
		diagramContainer.style.display = "none";
		zoomControls.style.display = "none";
		mdContainer.style.display = "block";
	}
}

async function mostrarDiagrama(index) {
	const diagrama = diagramas[index];
	const container = document.getElementById("diagram-container");
	const mdContainer = document.getElementById("markdown-container");
	container.innerHTML = "";

	//console.log(diagrama.archivo);
	container.innerHTML = `
	<div align='center'>
		<img src='./assets/images/loading.gif'></img>
	</div>`;
	try {
		const response = await fetch(`/diagramas/${diagrama.archivo}`);
		if (!response.ok) {
			throw new Error("No se pudo cargar el contenido del diagrama");
		}
		const contenido = await response.text();

		//alert("Contenido");
		//console.log(contenido);
		let viewer = null;
		let encoded = null;
		let url = null;

		switch (diagrama.tipo) {
			case "bpmn":
				showContainer("diagram-container")
				
				try {
					container.innerHTML = "";
					viewer = new BpmnJS({ container });
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
				showContainer("diagram-container");
				container.innerHTML = '<div class="mermaid">' + contenido + "</div>";
				mermaid.init(undefined, container.querySelector(".mermaid"));
				break;
			case "plantuml":
				showContainer("diagram-container");
				encoded = plantumlEncoder.encode(contenido);
				url = "https://www.plantuml.com/plantuml/svg/" + encoded;
				container.innerHTML = `<img src="${url}" alt="PlantUML diagram">`;
				break;
			case "excalidraw":
				showContainer("diagram-container");
				container.innerHTML = `<iframe style='width:100%; height:100%' src='exacalidraw2.html?diagram=${diagrama.archivo}'></iframe>`;
				break;
			case "md":
				showContainer("markdown-container")
				mdContainer.innerHTML = marked.parse(`<div class="markdown-body">${contenido}</div>`);
				break;
		}

		// Aplicar zoom
		try {
			if (currentPanzoom) {
				currentPanzoom.dispose();
			}
			currentPanzoom = panzoom(container.firstChild, {
				maxZoom: 5,
				minZoom: 0.5,
				initialZoom: 1,
			});
	    } catch(e) {
			console.log("Error al cargar los controldes de zoom:", e);
		}
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
