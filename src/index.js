'use strict';

var useReflexion = true;
var showStats = false;
//console.log(`Systeme d'exploitation : ${navigator.userAgent}`)

const infoWindow = document.createElement('div');
infoWindow.style.position = 'fixed';
infoWindow.style.top = '50%';
infoWindow.style.left = '50%';
infoWindow.style.transform = 'translate(-50%, -50%)';
infoWindow.style.width = '300px';
infoWindow.style.height = '200px';
infoWindow.style.backgroundColor = 'white';
infoWindow.style.border = '1px solid black';
infoWindow.style.borderRadius = '10px';
infoWindow.style.padding = '20px';
infoWindow.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';
infoWindow.style.display = 'none'; // La fenêtre est initialement cachée
infoWindow.style.zIndex = '10000'; // S'assurer qu'elle est au-dessus des autres éléments
document.body.appendChild(infoWindow);


const updateInfoWindowContent = (title, image) => {
	if (!(navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i))) {
		
    const closeButton = document.createElement('button');
    closeButton.textContent = '×';
    closeButton.style.position = 'absolute';
    closeButton.style.top = '10px';
    closeButton.style.right = '10px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.background = 'none';
    closeButton.style.border = 'none';
    closeButton.style.fontSize = '20px'; // Ajustez la taille selon vos préférences
    closeButton.style.fontWeight = 'bold'; // Rendre le "X" plus visible
    closeButton.style.color = 'black';

    const titleElement = document.createElement('h2');
	titleElement.textContent = title;
	titleElement.style.fontSize = '14px';
	titleElement.style.fontFamily = 'Verdana, sans-serif';
	//console.log(`${titleElement.textContent}`)

    const imageElement = document.createElement('img');
    imageElement.src = image;
    imageElement.style.width = 'auto'; // Ajustez la taille selon vos préférences
    imageElement.style.height = '150px'; // Ajustez la taille selon vos préférences

    infoWindow.innerHTML = ''; // Effacer le contenu précédent
    infoWindow.appendChild(closeButton);
    
    infoWindow.appendChild(imageElement);
	infoWindow.appendChild(titleElement);
	//console.log('Contenu de infoWindow :', infoWindow.innerHTML);
    closeButton.addEventListener('click', () => {
        infoWindow.style.display = 'none';
    });
	}};

// Handle different screen ratios
const mapVal = (value, min1, max1, min2, max2) => min2 + (value - min1) * (max2 - min2) / (max1 - min1);
var fovX = () => mapVal(window.innerWidth / window.innerHeight, 16/9, 9/16, 1.7, Math.PI / 3);

if (navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)|(android)|(webOS)/i)) {
	useReflexion = false;
	// Account for the searchbar
	fovX = () => mapVal(window.innerWidth / window.innerHeight, 16/9, 9/16, 1.5, Math.PI / 3);
}
else{
		const infoButton = document.createElement('button');
		infoButton.textContent = 'Info';
		infoButton.style.position = 'fixed';
		infoButton.style.top = '20px';
		infoButton.style.right = '20px';
		infoButton.style.zIndex = '9999';
		infoButton.style.padding = '10px';
		infoButton.style.backgroundColor = 'blue';
		infoButton.style.color = 'white';
		infoButton.style.border = 'none';
		infoButton.style.borderRadius = '5px';
		infoButton.style.cursor = 'pointer';



		// Ajout du bouton au document
		document.body.appendChild(infoButton);
		// Création de la fenêtre d'information

		// Création du bouton de fermeture
		const closeButton = document.createElement('button');
		closeButton.textContent = '×';
		closeButton.style.position = 'absolute';
		closeButton.style.top = '10px';
		closeButton.style.right = '10px';
		closeButton.style.cursor = 'pointer';
		closeButton.style.background = 'none';
		closeButton.style.border = 'none';
		closeButton.style.fontSize = '20px'; // Ajustez la taille selon vos préférences
		closeButton.style.fontWeight = 'bold'; // Rendre le "X" plus visible
		closeButton.style.color = 'black';




		// Ajout de l'événement de clic pour fermer la fenêtre d'information
		closeButton.addEventListener('click', () => {
			infoWindow.style.display = 'none';
		});


		// Ajout de la fenêtre d'information au document

		// Modification de l'événement de clic du bouton d'information pour afficher la fenêtre
		infoButton.addEventListener('click', () => {
			infoWindow.style.display = 'block'; // Afficher la fenêtre d'information
		});
		document.addEventListener('keydown', (event) => {
			if (event.key === 'Escape') {
				// Exécuter le code pour masquer la fenêtre d'information
				infoWindow.style.display = 'none';
			}
			if (event.key === 'i') {
				// Exécuter le code pour masquer la fenêtre d'information
				infoWindow.style.display = 'block';
			}
		});
}
var fovY = () => 2 * Math.atan(Math.tan(fovX() * 0.5) * window.innerHeight / window.innerWidth);

const Stats = require('stats.js');
var stats = new Stats();
stats.showPanel(0);
if(showStats) {
	document.body.appendChild( stats.dom );
}

let regl, map, drawMap, placement, drawPainting, fps;

regl = require('regl')({
	extensions: [
		//'angle_instanced_arrays',
		'OES_element_index_uint',
		'OES_standard_derivatives'
	],
	optionalExtensions: [
		//'oes_texture_float',
		'EXT_texture_filter_anisotropic'
	],
	attributes: { alpha : false }
});

map = require('./map')();
const mesh = require('./mesh');
drawMap = mesh(regl, map, useReflexion);
placement = require('./placement')(regl, map, updateInfoWindowContent)
drawPainting = require('./painting')(regl);
fps = require('./fps')(map, fovY);

const context = regl({
	cull: {
		enable: true,
		face: 'back'
	},
	uniforms: {
		view: fps.view,
		proj: fps.proj,
		yScale: 1.0
	}
});

const reflexion = regl({
	cull: {
		enable: true,
		face: 'front'
	},
	uniforms: {
		yScale: -1.0
	}
});

regl.frame(({
	time
}) => {
	stats.begin();
	fps.tick({
		time
	});
	placement.update(fps.pos, fps.fmouse[1], fovX());
	regl.clear({
		color: [0, 0, 0, 1],
		depth: 1
	});
	context(() => {
		if(useReflexion) {
			reflexion(() => {
				drawMap();
				drawPainting(placement.batch());
			});
		}
		drawMap();
		drawPainting(placement.batch());
	});
	stats.end();
	
});


