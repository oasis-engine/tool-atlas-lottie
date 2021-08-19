const atlasTool = require('@oasis-engine/tool-atlas');
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

  return path.join(__dirname, name);
}

module.exports = function transform(lottiePath) {
  let rawData = fs.readFileSync(lottiePath);

  try {
    let data = JSON.parse(rawData);
    const { nm, assets } = data;

    const spritesDir = path.join(__dirname, `.sprites`);
    const dir = path.join(__dirname, nm);
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

    console.log('Pack images:', images)

    return atlasTool.pack(images, { output: `${dir}/${nm}` }).then(() => {
      console.log('Pack atlas success!')
      if (fs.existsSync(spritesDir)) {
        fs.rmdirSync(spritesDir, { recursive: true });
      }

      // Rewrite lottie json file
      delete data.assets;

      fs.writeFileSync(`${dir}/${nm}.json`, JSON.stringify(data));
    });

  } catch (error) {
    console.log('Parse lottie file error:', error);
  }
}
