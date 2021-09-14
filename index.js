const atlasTool = require('@oasis-engine/tool-atlas');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

function createImage(asset, dir) {
  const { id, p } = asset;

  const base64Data = p.replace(/^data:image\/png;base64,/, "");
  const name = `${dir}/${id}.png`;

  fs.writeFile(name, base64Data, 'base64', function (err) {
    err && console.log(err);
  });

  return name;
}

function createLayer(asset, originalLayers) {
  const { layers, id } = asset;

  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];

    layer.parent = `layer_${id}`;
  }

  return originalLayers.concat(layers);
}

module.exports = async function transform(lottiePath, options = {}) {
  let rawData, data;

  if (lottiePath.startsWith('http://') || lottiePath.startsWith('https://')) {
    data = await fetch(lottiePath)
      .then(res => res.json())
  }
  else {
    rawData = fs.readFileSync(lottiePath);
  }

  try {
    if (rawData) {
      data = JSON.parse(rawData);
    }

    const { nm, assets } = data;
    const { output } = options;

    const spritesDir = output ? `${output}/.sprites` : path.resolve(`.sprites`);
    const dir = output || path.resolve(nm);
    const images = []

    if (!fs.existsSync(spritesDir)) {
      fs.mkdirSync(spritesDir);
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i];

      // sprite assets
      if (asset.p) {
        const image = createImage(asset, spritesDir);
        if (image) {
          images.push(image);
        }
      }

      // layer assets
      if (asset.layers) {
        data.layers = createLayer(asset, data.layers);
      }
    }

    const res = await atlasTool.pack(images, { output: `${dir}/${nm}`, ...options });

    if (res.code !== 0) {
      console.log('Atlas Error:', res.msg);
      return res;
    }

    if (fs.existsSync(spritesDir)) {
      fs.rmdirSync(spritesDir, { recursive: true });
    }

    // Rewrite lottie json file
    delete data.assets;

    const jsonFilePath = `${dir}/${nm}.json`;
    fs.writeFileSync(jsonFilePath, JSON.stringify(data));

    res.info.jsonFile = jsonFilePath;

    console.log('Pack atlas success!', res);

    return res;

  } catch (error) {
    return {
      code: 11,
      msg: 'Parse lottie file error'
    };
  }
}
