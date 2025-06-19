module.exports = {
  presets: [
    [
      'module:@react-native/babel-preset',
      {
        enableBabelRuntime: false,
      },
    ],
  ],
  plugins: [
    'react-native-reanimated/plugin',
  ],
};
