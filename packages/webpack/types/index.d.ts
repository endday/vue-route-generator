import type { Compiler } from 'webpack';
import { GenerateConfig } from '@vue-auto-router/core';
export interface PluginConfig extends GenerateConfig {
    pages: string;
    outFile?: string;
    useWatcher?: boolean;
}
export declare class Plugin {
    options: PluginConfig;
    modules: string[];
    folderSegments: string[];
    private watcher;
    constructor(options: PluginConfig);
    private initWatcher;
    apply(compiler: Compiler): void;
}
