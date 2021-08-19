# tool-atlas-lottie

Transform lottie JSON file to atlas format in oasis engine. This tool will generate a folder which contains three files: a processed lottie JSON file, an atlas file and an image.

# Usage in terminal

1. Install

```bash
npm i @oasis-engine/tool-atlas-lottie -g
```

2. Use command in terminal

oasis-atlas-lottie -s lottieFile.json

# Usage in node project

1. Install

```bash
npm i @oasis-engine/tool-atlas-lottie --save
```

2. Call api

```javascript
const lottieTransform = require("@oasis-engine/tool-atlas-lottie");

lottieTransform('lottieFile.json'); 
```