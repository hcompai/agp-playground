import type { NextConfig } from 'next';
import { withWorkflow } from 'workflow/next';
import path from 'path';

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: path.resolve(__dirname)
  }
};

export default withWorkflow(nextConfig);
