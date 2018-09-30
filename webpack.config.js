const path = require('path');

module.exports = {
    "mode": "development",
    "entry": "./src/index.js",
    "output": {
        "path": __dirname+'/static',
        "filename": "bundle.js"
    },
    "module": {
        "rules": [
            {
                "test": /\.scss$/,
                "use": [
                    "style-loader",
                    "css-loader",
                    "sass-loader"
                ]
            }
        ]
    }
}