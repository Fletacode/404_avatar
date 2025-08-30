import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  webpack(config) {
    config.resolve.alias['@'] = path.resolve(__dirname, 'app');
    config.resolve.alias['@components'] = path.resolve(__dirname, 'components');
    config.resolve.alias['@hooks'] = path.resolve(__dirname, 'hooks');
    config.resolve.alias['@/types'] = path.resolve(__dirname, 'types');
    config.resolve.alias['@/lib'] = path.resolve(__dirname, 'lib');
    config.resolve.alias['@/contexts'] = path.resolve(__dirname, 'contexts');
    return config;
  }
};

export default nextConfig;
