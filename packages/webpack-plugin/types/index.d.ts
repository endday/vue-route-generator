import type { Compiler } from 'webpack';
import { GenerateConfig } from '@auto-route/core';
export interface PluginConfig extends GenerateConfig {
    pages: string;
    outFile?: string;
}
export declare class Plugin {
    options: PluginConfig;
    hasRun: boolean;
    modules: string[];
    folderSegments: string[];
    private watcher;
    constructor(options: PluginConfig);
    private initWatcher;
    apply(compiler: Compiler): void;
}
