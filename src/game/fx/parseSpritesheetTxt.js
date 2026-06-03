export function parseSpritesheetTxt(txtContent, imgWidth, imgHeight) {
  const frames = {};
  let i = 0;

  txtContent.split('\n').forEach(line => {
    const match = line.match(/= (\d+) (\d+) (\d+) (\d+)/);
    if (match) {
      frames[`frame${String(i++).padStart(4, '0')}`] = {
        frame: {
          x: parseInt(match[1], 10),
          y: parseInt(match[2], 10),
          width: parseInt(match[3], 10),
          height: parseInt(match[4], 10)
        },
        rotated: false,
        trimmed: false,
        spriteSourceSize: {
          x: 0, y: 0,
          width: parseInt(match[3], 10),
          height: parseInt(match[4], 10)
        },
        sourceSize: {
          width: parseInt(match[3], 10),
          height: parseInt(match[4], 10)
        }
      };
    }
  });

  return {
    frames,
    meta: {
      image: '',
      size: { w: imgWidth, h: imgHeight },
      scale: 1
    }
  };
}

export function loadFXAtlas(scene, key, pngPath, txtPath) {
  return new Promise((resolve) => {
    fetch(txtPath)
      .then(res => res.text())
      .then(txtContent => {
        const texture = scene.textures.get(`${key}_source`);
        let imgWidth = 512, imgHeight = 512;
        if (texture && texture.source[0]) {
          imgWidth = texture.source[0].width;
          imgHeight = texture.source[0].height;
        }
        const atlasData = parseSpritesheetTxt(txtContent, imgWidth, imgHeight);
        atlasData.meta.image = pngPath;

        scene.load.image(`${key}_atlas`, pngPath);
        scene.load.on('filecomplete', (loadedKey) => {
          if (loadedKey === `${key}_atlas`) {
            scene.textures.addAtlas(
              key,
              scene.textures.get(`${key}_atlas`).getSourceImage(),
              atlasData
            );
            resolve(atlasData);
          }
        });
        scene.load.start();
      })
      .catch(() => resolve(null));
  });
}
