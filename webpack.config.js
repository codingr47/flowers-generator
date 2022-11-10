const path = require("path");
const webpack = require("webpack");
// eslint-disable-next-line @typescript-eslint/naming-convention, import/no-extraneous-dependencies
const TerserPlugin = require("terser-webpack-plugin");

const compilationOpts = {
	/* eslint-disable @typescript-eslint/naming-convention */
	WEB: !!process.env.MCEWEB,
	WEBREPORT: !!process.env.MCEWEBREPORT,
	ONDEVICE: !!process.env.MCEMOBILE,
	ANDROID: !!process.env.MCEMOBILEANDROID,
	IOS: !!process.env.MCEMOBILEIOS,
	"ifdef-verbose": true,
	/* eslint-enable @typescript-eslint/naming-convention */
};

const mainEntryPoint = "./lib/App.tsx";

module.exports = (env, argv) => {

	return {
		entry: mainEntryPoint,
		output: {
			filename: "bundle.js",
			chunkFilename: "[name].bundle.js",
			path: path.resolve(__dirname, "dist"),
			library: "mce",
			libraryTarget: "umd",
		},
		devtool: process.env.MCEDEBUG ? "source-map" : false,
		externals: ["socket.io", "windows-pac-resolver", "proxy-agent", "fs", "net", "tls", { child_process: "child_process" }],
		resolve: {
			extensions: [".mjs", ".js", ".jsx", ".ts", ".tsx", ".json"],
			alias: {
				stream: require.resolve("stream-browserify/"),
			},
			fallback: {
				path: require.resolve("path-browserify"),
				crypto: require.resolve("crypto-browserify"),
				http: require.resolve("stream-http"),
				https: require.resolve("https-browserify"),
				os: require.resolve("os-browserify/browser"),
				util: require.resolve("util/"),
				stream: require.resolve("stream-browserify"),
				zlib: require.resolve("browserify-zlib"),
				assert: require.resolve("assert/"),
				constants: require.resolve("constants-browserify"),
				timers: require.resolve("timers-browserify"),
				buffer: require.resolve("buffer"),
				process: require.resolve("process"),
				// eslint-disable-next-line @typescript-eslint/naming-convention
				_stream_transform: false,
			},
		},
		plugins: [
			// fix "process is not defined" error:
			// (do "npm install process" before running the build)
			new webpack.ProvidePlugin({
				process: "process/browser",
				// eslint-disable-next-line @typescript-eslint/naming-convention
				Buffer: ["buffer", "Buffer"],
			}),
		],
		stats: "errors-only",
		module: {
			rules: [
                {
                    test: /\.(ts)x?$/,
                    use: [
                        {
                            loader: "ts-loader",
                            options: {
                                logLevel: "info",
                                logInfoToStdOut: true,
                            },
                        },
                    ],
                },
                {
                    test: /\.m?js$/,
                    include: /node_modules/,
                    type: "javascript/auto",
                    resolve: {
                        fullySpecified: false,
                    },
                },
                {
				test: /\.css$/,
				use: [{
					loader: "style-loader",
					options: {
						insertInto: "body",
					},
				},
				{
					loader: "css-loader",
					options: {
						modules: {
							localIdentName: "[path][name]__[local]--[hash:base64:5]",
						},
					},
				},
				],
			},
			{
				test: /\.(otf|eot|svg|ttf|woff|woff2)$/,
				use: {
					loader: "file-loader",
					options: {
						name: "fonts/[name].[ext]",
					},
				},
			},
			{
				test: /opencv.js$/,
				use: [
					{
						loader: "file-loader",
						options: {
							name: "dtlScripts/[name].[ext]",
						},
					},
				],
			},
			{
				test: /\.(png|jpg|gif|gltf)$/,
				use: {
					loader: "file-loader",
					options: {
						name: "[folder]/[name].[ext]",
					},
				},
			},
            ]},
	};
};
