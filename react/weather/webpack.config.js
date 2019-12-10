module.exports = {
  mode:'development',
  entry: './index.js',
  output:{
    filename:'bundle.js'
  },
  module: {
    rules:[
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use:['babel-loader']
      },
      {
        test: /\.css$/,
        loader: 'style-loader'
      }, {
        test: /\.css$/,
        loader: 'css-loader',
        query: {
          modules: true,
        }
      }
    ]
  },
  devServer:{
    port:8000
  }
};
