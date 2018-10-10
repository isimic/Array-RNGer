const MiniCssExtractPlugin = require("mini-css-extract-plugin");

module.exports = {
    "mode": "development",
    "entry": "./src/index.js",
    "output": {
        "path": __dirname + '/static',
        "filename": "bundle.js"
    },
    "plugins": [
        new MiniCssExtractPlugin({
            filename: "[name].css",
            chunkFilename: "[id].css"
        })
    ],
    "module": {
        "rules": [
            {
                "test": /\.css$/,
                "use": [
                    MiniCssExtractPlugin.loader,
                    "css-loader"
                ]
            }
        ]
    }
}