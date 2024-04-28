'use strict';

let showInfo = false;
let nearestPainting = null;

const handleClick = (pos, angle, fovX, placements, getAreaIndex) => {
  nearestPainting = findNearestPainting(pos, angle, fovX, placements, getAreaIndex);
  showInfo = !showInfo;
};

const drawInfoButton = (regl, pos, angle, fovX, placements, getAreaIndex) => {
  const button = regl({
    frag: `
      precision mediump float;
      uniform vec4 color;
      void main() {
        gl_FragColor = color;
      }
    `,
    vert: `
      precision highp float;
      attribute vec2 position;
      varying vec2 uv;
      void main() {
        uv = 0.5 * (position + 1.0);
        gl_Position = vec4(position, 0.0, 1.0);
      }
    `,
    attributes: {
      position: [
        -0.1, -0.1,
        0.1, -0.1,
        0.1, 0.1,
        -0.1, 0.1,
      ],
    },
    count: 4,
    uniforms: {
      color: [1, 1, 1, 1],
    },
  });

  button();

  if (showInfo && nearestPainting) {
    // Affichez les informations du tableau le plus proche
    console.log(`Titre: ${nearestPainting.title}`);
    console.log(`Description: ${nearestPainting.description}`);
    // Vous pouvez également afficher ces informations à l'écran
  }
};

function findNearestPainting(pos, angle, fovX, placements, getAreaIndex) {
  let nearestPainting = null;
  let nearestDistance = Infinity;

  // Parcourir tous les tableaux
  placements.forEach((painting, index) => {
    const [start, end] = painting;
    const midX = (start[0] + end[0]) / 2;
    const midY = (start[1] + end[1]) / 2;

    // Calculer la distance du tableau au joueur
    const dx = midX - pos[0];
    const dy = midY - pos[2];
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Vérifier si le tableau est dans le champ de vision du joueur
    const playerToObject = Math.atan2(dy, dx) - angle;
    const angleDifference = Math.abs(playerToObject);
    const inFOV = angleDifference <= fovX / 2;

    // Mettre à jour le tableau le plus proche s'il est plus proche et dans le champ de vision
    if (distance < nearestDistance && inFOV) {
      nearestDistance = distance;
      const areaIndex = getAreaIndex(midX, midY);
      if (areaIndex !== -1) {
        nearestPainting = {
          title: 'Titre du tableau', // Remplacez par le titre réel du tableau
          description: 'Description du tableau', // Remplacez par la description réelle du tableau
          index: areaIndex,
        };
      }
    }
  });

  return nearestPainting;
}

module.exports = { drawInfoButton, handleClick };
