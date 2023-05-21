module.exports = {
    "env": {
        "browser": true,
        "es2021": true,
        "webextensions": true,
        "worker": true,
        "commonjs": true,
        "jest/globals": true,
    },
    "plugins": ["jest"],
    "extends": "eslint:recommended",
    "overrides": [
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "rules": {
        "indent": [
            "error",
            2
        ],
        "linebreak-style": [
            "error",
            "unix"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]
    }
};
