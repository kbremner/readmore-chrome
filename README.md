# [ReadMore Web Extension](https://chrome.google.com/webstore/detail/readmore/lakgjfgaijgbmeidicpibkggdkneeicd) [![CircleCI](https://circleci.com/gh/defining-technology/readmore-chrome.svg?style=svg)](https://circleci.com/gh/defining-technology/readmore-chrome)

This extension shows a random article from the articles a person has saved to Pocket, to help them get through their backlog.

The API used by this extension is also open source and can be found [here](https://github.com/defining-technology/read-more-api).

## Building
```
yarn install
yarn build
```

Setting an environment variable called `BASE_URI` prior to running this command will update the base URI used by the extension for API calls.

For example, if the API is running locally at `http://localhost:32768`, then setting `BASE_URI=http://localhost:32768` and running `yarn build` will create a version of the extension that will use this locally running API.

## Testing

### Unit Testing
```
yarn test
```

### Manual Testing
After running the build command, there will be a `dist` directory in the root of the project. Instructions on how to load this in to Chrome for manual testing can be found [here](https://developer.chrome.com/extensions/getstarted#unpacked).

## Supported Browsers

Currently only tested in Chrome 61.0.3163.100.

Work is ongoing to identify the changes required to make the extension work in other browsers, however there is no estimate for the completion of this work (help welcome!).