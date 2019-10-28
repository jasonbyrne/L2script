const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: path.resolve('app', 'src', 'main.ts'),
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin([
            `app${path.sep}index.js`,
            {
                from: `app${path.sep}public${path.sep}**${path.sep}*`,
                to: 'public',
                // NOTE(jpr): this is hacky but we need to move to get rid of
                // index.js before we get rid of this
                transformPath(targetPath, _) {
                    return targetPath.replace(/^public[\/\\]app[\/\\]/i, '');
                },
            },
        ]),
    ],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    output: {
        filename: `public${path.sep}bundle.js`,
        path: path.resolve(__dirname, 'dist'),
    }
};