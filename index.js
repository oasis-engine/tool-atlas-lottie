const atlasTool = require('@oasis-engine/tool-atlas');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

function createImage(asset, dir) {
  const { id, p } = asset;

  if (!p || !id) {
    return;
  }

  const base64Data = p.replace(/^data:image\/png;base64,/, "");
  const name = `${dir}/${id}.png`;

  fs.writeFile(name, base64Data, 'base64', function (err) {
    err && console.log(err);
  });

  return name;
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
    const dir = output ||  path.resolve(nm);
    const images = []

    if (!fs.existsSync(spritesDir)) {
      fs.mkdirSync(spritesDir);
    }

    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }

    for (let i = 0; i < assets.length; i++) {
      const image = createImage(assets[i], spritesDir);
      if (image) {
        images.push(image);
      }
    }

    const res = await atlasTool.pack(images, { output: `${dir}/${nm}` });

    console.log('Pack atlas success!')

    if (fs.existsSync(spritesDir)) {
      fs.rmdirSync(spritesDir, { recursive: true });
    }

    // Rewrite lottie json file
    delete data.assets;

    fs.writeFileSync(`${dir}/${nm}.json`, JSON.stringify(data));

    return res;

  } catch (error) {
    console.log('Parse lottie file error:', error);
  }
}
