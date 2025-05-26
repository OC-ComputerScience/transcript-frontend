{
    "parser": "@babel/eslint-parser",
    "parserOptions": {
      "requireConfigFile": false,  // Add this line or modify its value to false
      "babelOptions": {  // Optional: Include any Babel configurations here
        "presets": ["@babel/preset-env"],
        "plugins": []
      }
    }
  }