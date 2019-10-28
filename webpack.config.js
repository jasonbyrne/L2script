const path = require('path');

const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    entry: './app/src/main.ts',
    devtool: 'source-map',
    plugins: [
        new CopyWebpackPlugin([
            'app/index.js',
            {
                from: 'app/public/**/*',
                to: 'public',
                // NOTE(jpr): this is hacky but we need to move to get rid of
                // index.js before we get rid of this
                transformPath(targetPath, _) {
                    return targetPath.replace(/^public\/app\//i, '');
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
        filename: 'public/bundle.js',
        path: path.resolve(__dirname, 'dist'),
    }
};