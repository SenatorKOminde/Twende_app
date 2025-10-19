const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add support for shared folder
config.watchFolders = [
  path.resolve(__dirname, '../shared'),
];

config.resolver.alias = {
  '@': path.resolve(__dirname, 'src'),
  '@/components': path.resolve(__dirname, 'src/components'),
  '@/screens': path.resolve(__dirname, 'src/screens'),
  '@/navigation': path.resolve(__dirname, 'src/navigation'),
  '@/services': path.resolve(__dirname, 'src/services'),
  '@/utils': path.resolve(__dirname, 'src/utils'),
  '@/types': path.resolve(__dirname, 'src/types'),
  '@/hooks': path.resolve(__dirname, 'src/hooks'),
  '@/store': path.resolve(__dirname, 'src/store'),
  '@/shared': path.resolve(__dirname, '../shared'),
};

module.exports = config;
